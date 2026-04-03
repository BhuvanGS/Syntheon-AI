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
  updateProject,
} from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/webhook'; // NEW

export async function POST(req: NextRequest) {
  try {
    const rawPayload = await req.text();
    const signature = req.headers.get('x-webhook-signature');

    console.log('📋 Raw Payload:', rawPayload);
    console.log('🔑 Signature Header:', signature);
    console.log('🔐 Secret:', process.env.SKRIBBY_WEBHOOK_SECRET);

    // ✅ NEW: Verify signature (optional in dev if header not present)
    if (!process.env.SKRIBBY_WEBHOOK_SECRET) {
      console.error('SKRIBBY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Skip verification if no signature header (e.g., dev/testing)
    if (!signature) {
      console.warn('⚠️ No webhook signature header, skipping verification');
    } else {
      const isValid = verifyWebhookSignature({
        secret: process.env.SKRIBBY_WEBHOOK_SECRET,
        payload: rawPayload,
        signature: signature,
      });

      if (!isValid) {
        console.warn('❌ Webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }

      console.log('✅ Webhook signature verified');
    }

    // Parse JSON after verification
    const payload = JSON.parse(rawPayload);

    // Rest of your existing code stays the same...
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

    const { specs, title } = await extractSpecBlocks(transcript, meeting.id);
    console.log(`Extracted ${specs.length} spec blocks`);

    const specsWithUser = specs.map((s: any) => ({
      ...s,
      user_id: meeting.user_id,
      project_id: meeting.projectId ?? null,
    }));

    await updateMeetingSpecs(meeting.id, transcript, specs.length);
    await updateMeetingName(meeting.id, title);
    await saveSpecs(specsWithUser);

    if (meeting.projectId) {
      await addSpecsToProject(
        meeting.projectId,
        specs.map((s: any) => s.id)
      );
      console.log('Specs linked to project:', meeting.projectId);

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
