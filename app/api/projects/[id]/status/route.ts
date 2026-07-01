import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateProjectStatus, getProjectById } from '@/lib/db';

const VALID_STATUSES = ['on_track', 'at_risk', 'off_track', 'paused'];

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
