// app/api/bot/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBotTranscript } from '@/lib/skribby';
import { extractSpecBlocks } from '@/lib/groq';
import { getMeetings, updateMeetingStatus, updateMeetingSpecs, saveSpecs } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Webhook received:', payload.type, JSON.stringify(payload.data));

    // Only process when bot finishes
    if (payload.type !== 'status_update') return NextResponse.json({ ok: true });
    if (payload.data?.new_status !== 'done') return NextResponse.json({ ok: true });

    const botId = payload.data?.bot_id;
    if (!botId) return NextResponse.json({ ok: true });

    // Find the meeting with this botId
    const meetings = getMeetings();
    const meeting  = meetings.find((m: any) => m.botId === botId);

    if (!meeting) {
      console.error('No meeting found for botId:', botId);
      return NextResponse.json({ ok: true });
    }

    console.log('Meeting ended, fetching transcript for bot:', botId);

    // Fetch full transcript from Skribby
    const botData   = await getBotTranscript(botId);
    const transcript = botData.transcription
      ?.map((t: any) => t.text)
      .join(' ') ?? '';

    console.log('Transcript length:', transcript.length);

    if (!transcript.trim()) {
      updateMeetingStatus(meeting.id, 'failed');
      return NextResponse.json({ ok: true });
    }

    // Extract spec blocks via Groq
    const specs = await extractSpecBlocks(transcript, meeting.id);
    console.log(`Extracted ${specs.length} spec blocks`);

    // Update meeting in db
    updateMeetingSpecs(meeting.id, transcript, specs.length);
    saveSpecs(specs);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}