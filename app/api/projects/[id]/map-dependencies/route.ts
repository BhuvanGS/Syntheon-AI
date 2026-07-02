import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import {
  createDependency,
  getProjectById,
  getTicketsByProjectId,
  getDependenciesForProject,
  deleteDependency,
} from '@/lib/db';
import { inferProjectTicketDependencies } from '@/lib/groq';
import { aiRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limited = await aiRateLimit(req, userId);
    if (limited) return limited;

    const { id } = await params;
    const project = await getProjectById(id);
    const owned = orgId ? project?.org_id === orgId : project?.user_id === userId;
    if (!project || !owned) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectTickets = await getTicketsByProjectId(project.id);
    if (projectTickets.length < 2) {
      return NextResponse.json({
        success: true,
        mapped: 0,
        message: 'Not enough tickets to map dependencies.',
      });
    }

    const inferredDependencies = await inferProjectTicketDependencies(
      projectTickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
      }))
    );

    const existingDeps = await getDependenciesForProject(project.id);
    const existingKeys = new Set(
      existingDeps.map((d) => `${d.ticket_id}->${d.depends_on_ticket_id}`)
    );

    let mapped = 0;
    for (const dep of inferredDependencies) {
      const key = `${dep.ticket_id}->${dep.depends_on_ticket_id}`;
      if (existingKeys.has(key)) continue;

      const result = await createDependency({
        id: randomUUID(),
        project_id: project.id,
        ticket_id: dep.ticket_id,
        depends_on_ticket_id: dep.depends_on_ticket_id,
        dependency_type: dep.dependency_type,
        strength: dep.strength,
        note: dep.note ?? null,
      });
      if (!result.error) mapped += 1;
    }

    return NextResponse.json({
      success: true,
      mapped,
      totalInferred: inferredDependencies.length,
    });
  } catch (error) {
    console.error('Failed to map dependencies:', error);
    return NextResponse.json({ error: 'Failed to map dependencies' }, { status: 500 });
  }
}
