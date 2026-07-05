import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDeletedActivitiesByProject } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const activities = await getDeletedActivitiesByProject(projectId);
    return NextResponse.json(activities);
  } catch (err) {
    console.error('GET /deleted-activities error:', err);
    return NextResponse.json({ error: 'Failed to fetch deleted activities' }, { status: 500 });
  }
}
