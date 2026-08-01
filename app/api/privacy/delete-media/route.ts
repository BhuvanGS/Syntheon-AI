import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MeetingsEntity } from '@/db/entities';

function hasMediaContent(meeting: {
  transcript?: string | null;
  summary?: string | null;
  filePath?: string | null;
}) {
  return Boolean(
    (meeting.transcript && meeting.transcript.trim()) ||
    (meeting.summary && meeting.summary.trim()) ||
    (meeting.filePath && meeting.filePath.trim())
  );
}

export async function POST() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;

  try {
    const meetingsRes = await MeetingsEntity.query.byUser({ userId }).go();
    const meetings = meetingsRes.data ?? [];
    const now = new Date().toISOString();
    let clearedMeetings = 0;

    for (const meeting of meetings) {
      if (!meeting?.id || !hasMediaContent(meeting)) continue;

      await MeetingsEntity.update({ id: meeting.id })
        .set({
          transcript: '',
          summary: '',
          filePath: '',
          updatedAt: now,
        })
        .go();
      clearedMeetings += 1;
    }

    return NextResponse.json({
      success: true,
      clearedMeetings,
      totalMeetings: meetings.length,
    });
  } catch (error) {
    console.error('[privacy/delete-media] Failed to clear meeting media:', error);
    return NextResponse.json({ error: 'Failed to delete meeting media' }, { status: 500 });
  }
}
