import { NextRequest, NextResponse } from 'next/server';
import { updateProjectStatus, getProjectById } from '@/lib/db';
import { requireAuth, canAdminProject, requireProjectAccess } from '@/lib/rbac';

const VALID_STATUSES = ['on_track', 'at_risk', 'off_track', 'paused'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    if (!(await canAdminProject(ctx, projectId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body as { status: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    await updateProjectStatus(projectId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update project status:', error);
    return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 });
  }
}
