import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, getTicketsByProjectId, getDependenciesForProject } from '@/lib/db';
import { suggestProjectHealth } from '@/lib/groq-ai';
import { aiRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/rbac';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limited = await aiRateLimit(req, ctx.userId);
    if (limited) return limited;

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project || project.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const tickets = await getTicketsByProjectId(projectId);
    const deps = await getDependenciesForProject(projectId);

    const totalTickets = tickets.length;
    const completedTickets = tickets.filter((t) => t.status === 'done').length;
    const inProgressTickets = tickets.filter((t) => t.status === 'in_progress').length;
    const blockedTickets = tickets.filter((t) => t.status === 'blocked').length;
    const now = new Date();
    const overdueTickets = tickets.filter(
      (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'done'
    ).length;
    const hasDependencies = deps.length > 0;
    const lastUpdated = project.updatedAt ? new Date(project.updatedAt) : new Date();
    const daysSinceUpdate = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    );

    const result = await suggestProjectHealth({
      totalTickets,
      completedTickets,
      inProgressTickets,
      blockedTickets,
      overdueTickets,
      hasDependencies,
      daysSinceUpdate,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to suggest project health:', error);
    return NextResponse.json({ error: 'Failed to get AI suggestion' }, { status: 500 });
  }
}
