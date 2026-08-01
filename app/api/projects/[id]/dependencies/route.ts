import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, getDependenciesForProject, getTicketsByProjectId } from '@/lib/db';
import { requireAuth, requireProjectAccess } from '@/lib/rbac';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project || project.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (!(await requireProjectAccess(ctx, project.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [allTickets, dependencies] = await Promise.all([
      getTicketsByProjectId(projectId),
      getDependenciesForProject(projectId),
    ]);

    const tickets = allTickets.filter(
      (t: { dependency_ticket_id?: string | null }) => !t.dependency_ticket_id
    );

    return NextResponse.json({ tickets, dependencies });
  } catch (err) {
    console.error('GET /projects/[id]/dependencies error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
