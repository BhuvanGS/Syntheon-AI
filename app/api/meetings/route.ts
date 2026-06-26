// app/api/meetings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getMeetingsByOrg, getMeetingsPaginated } from '@/lib/db';

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 50), 100);
    const offset = parsePositiveInt(searchParams.get('offset'), 0);

    const result = await getMeetingsPaginated(orgId, { projectId, limit, offset });
    return NextResponse.json(
      {
        ...result,
        limit,
        offset,
        hasMore: offset + result.meetings.length < result.total,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch meetings:', error);
    return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
  }
}
