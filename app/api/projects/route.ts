// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProjects, getProjectByMeetingId } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId        = searchParams.get('meetingId');

    if (meetingId) {
      const project = getProjectByMeetingId(meetingId);
      return NextResponse.json(project ?? null);
    }

    return NextResponse.json(getProjects());

  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}