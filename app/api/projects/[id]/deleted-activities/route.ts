import { NextRequest, NextResponse } from 'next/server';
import { getDeletedActivitiesByProject, getProjectById } from '@/lib/db';
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

    const activities = await getDeletedActivitiesByProject(projectId);
    return NextResponse.json(activities);
  } catch (err) {
    console.error('GET /deleted-activities error:', err);
    return NextResponse.json({ error: 'Failed to fetch deleted activities' }, { status: 500 });
  }
}
