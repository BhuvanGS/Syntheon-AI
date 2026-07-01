import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateProjectLead, getProjectById } from '@/lib/db';

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
    const { leadUserId } = body as { leadUserId: string | null };

    await updateProjectLead(projectId, leadUserId ?? null);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update project lead:', error);
    return NextResponse.json({ error: 'Failed to update project lead' }, { status: 500 });
  }
}
