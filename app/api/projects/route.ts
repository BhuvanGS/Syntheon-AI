// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProjects, getProjectByMeetingId } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get('meetingId');

    if (meetingId) {
      const project = await getProjectByMeetingId(meetingId);
      return NextResponse.json(project ?? null);
    }

    const projects = await getProjects(userId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
