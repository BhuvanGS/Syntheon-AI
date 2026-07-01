import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSprintsByProject, createSprint, getProjectById } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const owned = orgId ? project.org_id === orgId : project.user_id === userId;
    if (!owned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const sprints = await getSprintsByProject(projectId);
    return NextResponse.json(sprints);
  } catch (error) {
    console.error('Failed to fetch sprints:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const owned = orgId ? project.org_id === orgId : project.user_id === userId;
    if (!owned) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { name, startDate, endDate, goal } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'name, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const id = `sprint_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const sprint = await createSprint(id, orgId, projectId, name, startDate, endDate, goal);
    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Failed to create sprint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
