import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { generateSprints } from '@/lib/groq';
import {
  getTicketsByProjectId,
  createSprint,
  updateTicket,
  getSprintsByProject,
  getProjectById,
  Sprint,
} from '@/lib/db';
import { aiRateLimit } from '@/lib/rate-limit';
import { requireAuth, canAdminProject } from '@/lib/rbac';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limited = await aiRateLimit(req, ctx.userId);
  if (limited) return limited;

  const { id: projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project || project.org_id !== ctx.orgId) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  if (!(await canAdminProject(ctx, projectId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const tickets = await getTicketsByProjectId(projectId);
  if (tickets.length < 5) {
    return NextResponse.json(
      {
        error: 'Need at least 5 tickets to generate sprints',
        ticketCount: tickets.length,
      },
      { status: 400 }
    );
  }

  const existingSprints = await getSprintsByProject(projectId);
  const hasActive = existingSprints.some(
    (s: Sprint) => s.status === 'active' || s.status === 'planning'
  );
  if (hasActive) {
    return NextResponse.json(
      {
        error: 'Project already has active or planning sprints. Complete or delete them first.',
      },
      { status: 400 }
    );
  }

  try {
    const suggestions = await generateSprints(
      tickets.map((t) => ({
        title: t.title,
        status: t.status,
        assignee: t.assignee ?? null,
        due_date: t.due_date ?? null,
      }))
    );

    const createdSprints = [];
    for (const suggestion of suggestions) {
      const sprintId = randomUUID();
      const sprint = await createSprint(
        sprintId,
        ctx.orgId,
        projectId,
        suggestion.name,
        suggestion.start_date,
        suggestion.end_date,
        suggestion.goal
      );

      for (const idx of suggestion.ticket_indices) {
        const ticket = tickets[idx];
        if (ticket) {
          await updateTicket(ticket.id, { sprintId });
        }
      }

      createdSprints.push({
        id: sprint.id,
        name: sprint.name,
        goal: sprint.goal,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        ticket_count: suggestion.ticket_indices.length,
      });
    }

    return NextResponse.json({ success: true, sprints: createdSprints });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: 'Sprint generation failed',
        detail: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}
