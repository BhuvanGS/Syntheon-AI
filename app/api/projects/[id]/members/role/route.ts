import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateProjectMemberRole, getProjectById } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const owned = orgId ? project.org_id === orgId : project.user_id === userId;
    if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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
