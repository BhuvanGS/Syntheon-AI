// app/api/bot/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBotTranscript } from '@/lib/skribby';
import { extractSpecBlocks } from '@/lib/groq';
import {
  getMeetingByBotId,
  updateMeetingStatus,
  updateMeetingSpecs,
  updateMeetingName,
  saveSpecs,
  addSpecsToProject,
  getProjectById,
  updateProject
} from '@/lib/db';

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

    const meeting = await getMeetingByBotId(botId);

    if (!meeting) {
      console.error('No meeting found for botId:', botId);
      return NextResponse.json({ ok: true });
    }

    console.log('Fetching transcript for bot:', botId);
    const botData = await getBotTranscript(botId);

    const rawTranscript = botData.transcript;
    const transcript = Array.isArray(rawTranscript)
      ? rawTranscript.map((t: any) => t.transcript).join(' ')
      : typeof rawTranscript === 'string'
      ? rawTranscript
      : '';

    console.log('Transcript length:', transcript.length);

    if (!transcript.trim()) {
      console.error('Empty transcript');
      await updateMeetingStatus(meeting.id, 'failed');
      return NextResponse.json({ ok: true });
    }

    // Extract specs AND title in one Groq call
    const { specs, title } = await extractSpecBlocks(transcript, meeting.id);
    console.log(`Extracted ${specs.length} spec blocks`);
    console.log('AI title:', title);

    // Attach user_id to specs
    const specsWithUser = specs.map((s: any) => ({
      ...s,
      user_id:    meeting.user_id,
      project_id: meeting.projectId ?? null,
    }));

    // Update meeting
    await updateMeetingSpecs(meeting.id, transcript, specs.length);
    await updateMeetingName(meeting.id, title);

    // Save specs
    await saveSpecs(specsWithUser);

    // Link specs to project
    if (meeting.projectId) {
      await addSpecsToProject(meeting.projectId, specs.map((s: any) => s.id));
      console.log('Specs linked to project:', meeting.projectId);

      // Update project name if first meeting
      const project = await getProjectById(meeting.projectId);
      if (project && project.meetings[0] === meeting.id) {
        await updateProject(meeting.projectId, { name: title });
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}