// app/api/bot/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBotTranscript } from '@/lib/skribby';
import { extractSpecBlocks } from '@/lib/groq';
import { getMeetings, updateMeetingStatus, updateMeetingSpecs, saveSpecs, loadDB, saveDB, addSpecsToProject } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Webhook received:', payload.type, JSON.stringify(payload.data));

    if (payload.type !== 'status_update') return NextResponse.json({ ok: true });
    if (payload.data?.new_status !== 'finished') return NextResponse.json({ ok: true });

    const botId = payload.bot_id;
    console.log('Meeting finished, botId:', botId);

    if (!botId) {
      console.error('No botId in payload:', JSON.stringify(payload));
      return NextResponse.json({ ok: true });
    }

    const meetings = getMeetings();
    const meeting  = meetings.find((m: any) => m.botId === botId);

    if (!meeting) {
      console.error('No meeting found for botId:', botId);
      return NextResponse.json({ ok: true });
    }

    console.log('Fetching transcript for bot:', botId);
    const botData = await getBotTranscript(botId);
    console.log('Raw transcript type:', typeof botData.transcript);
    console.log('Raw transcript sample:', JSON.stringify(botData.transcript)?.slice(0, 500));

    const rawTranscript = botData.transcript;
    const transcript = Array.isArray(rawTranscript)
      ? rawTranscript.map((t: any) => t.transcript).join(' ')
      : typeof rawTranscript === 'string'
      ? rawTranscript
      : '';

    console.log('Transcript length:', transcript.length);
    console.log('Transcript preview:', transcript.slice(0, 200));

    if (!transcript.trim()) {
      console.error('Empty transcript — check Skribby dashboard');
      updateMeetingStatus(meeting.id, 'failed');
      return NextResponse.json({ ok: true });
    }

    // Extract specs AND generate title in one Groq call
    const { specs, title } = await extractSpecBlocks(transcript, meeting.id);
    console.log(`Extracted ${specs.length} spec blocks`);
    console.log('AI generated title:', title);

    // Update meeting with AI title + transcript + spec count
    updateMeetingSpecs(meeting.id, transcript, specs.length);

    // Save AI-generated title to meeting
    const db      = loadDB();
    const mtg     = db.meetings.find((m: any) => m.id === meeting.id);
    if (mtg) {
      mtg.projectName = title;
      saveDB(db);
    }

    // Save specs
    saveSpecs(specs);

    // Link specs to project if meeting belongs to one
    if (meeting.projectId) {
      addSpecsToProject(meeting.projectId, specs.map((s: any) => s.id));
      console.log('Specs linked to project:', meeting.projectId);

      // Also update project name with AI title if it's the first meeting
      const db2      = loadDB();
      const project  = db2.projects.find((p: any) => p.id === meeting.projectId);
      if (project && project.meetings[0] === meeting.id) {
        project.name = title;
        saveDB(db2);
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}