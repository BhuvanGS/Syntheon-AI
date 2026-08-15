import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { listRealtimeEvents } from '@/lib/event-bus';

export const dynamic = 'force-dynamic';

function cursorOrNow(value: string | null): string {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : new Date().toISOString();
}

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const orgAfter = cursorOrNow(searchParams.get('orgAfter'));
  const userAfter = cursorOrNow(searchParams.get('userAfter'));

  const result = await listRealtimeEvents({ orgId, userId, orgAfter, userAfter });

  return NextResponse.json({
    events: result.events.map((row) => ({
      type: row.type,
      payload: row.payload,
      eventKey: row.eventKey,
      channel: row.channel,
    })),
    orgCursor: result.orgCursor,
    userCursor: result.userCursor,
  });
}
