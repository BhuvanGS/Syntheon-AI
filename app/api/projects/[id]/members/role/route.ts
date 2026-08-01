import { NextRequest, NextResponse } from 'next/server';
import { updateProjectMemberRole, getProjectById } from '@/lib/db';
import { requireAuth, canAdminProject, requireProjectAccess } from '@/lib/rbac';

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
    const { memberUserId, role } = body as {
      memberUserId: string;
      role: 'admin' | 'manager' | 'member';
    };

    if (!memberUserId || !['admin', 'manager', 'member'].includes(role)) {
      return NextResponse.json({ error: 'memberUserId and valid role required' }, { status: 400 });
    }

    await updateProjectMemberRole(projectId, memberUserId, role);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update member role:', error);
    return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
  }
}
