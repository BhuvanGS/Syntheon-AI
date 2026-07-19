import { NextRequest, NextResponse } from 'next/server';
import { updateProjectLead, getProjectById } from '@/lib/db';
import { requireAuth, canAdminProject } from '@/lib/rbac';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project || project.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (!(await canAdminProject(ctx, projectId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { leadUserId } = body as { leadUserId: string | null };

    await updateProjectLead(projectId, leadUserId ?? null);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update project lead:', error);
    return NextResponse.json({ error: 'Failed to update project lead' }, { status: 500 });
  }
}
