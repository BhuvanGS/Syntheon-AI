// app/api/tickets/stale/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStaleTickets } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const staleDays = parseInt(searchParams.get('staleDays') || '7', 10);

    const staleTickets = await getStaleTickets(orgId, projectId, staleDays);

    return NextResponse.json(
      { tickets: staleTickets, staleDays },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch stale tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch stale tickets' }, { status: 500 });
  }
}
