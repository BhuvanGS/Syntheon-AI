import { NextRequest, NextResponse } from 'next/server';
import { getBotTranscript } from '@/lib/skribby';
import { extractTickets } from '@/lib/groq';
import {
  getMeetingByBotId,
  updateMeetingStatus,
  updateMeetingSpecs,
  updateMeetingName,
  saveExtractedTickets,
  addTicketsToProject,
  getProjectById,
  updateProject,
} from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/webhook';
import crypto from 'crypto';

// Strict alphanumeric+hyphen/underscore only — prevents SSRF and command injection via bot_id
const BOT_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

function isValidBotId(id: unknown): id is string {
  return typeof id === 'string' && BOT_ID_REGEX.test(id);
}

export async function POST(req: NextRequest) {
  const webhookSigningSecret = process.env.SKRIBBY_WEBHOOK_SECRET;
  const webhookAccessToken = process.env.WEBHOOK_ACCESS_TOKEN;

  // ── Require at least one auth mechanism configured ───────────────
  if (!webhookAccessToken && !webhookSigningSecret) {
    console.error('[bot/webhook] No authentication secrets configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  // ── Read raw body for HMAC (must read before any parsing) ────────
  let rawPayload: string;
  try {
    rawPayload = await req.text();
  } catch {
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 });
  }

  const token = req.nextUrl.searchParams.get('token');
  const signature =
    req.headers.get('x-webhook-signature') ??
    req.headers.get('x-skribby-signature') ??
    req.headers.get('webhook-signature') ??
    req.headers.get('x-signature');

  let authenticated = false;

  // Token-based auth path (used when Skribby embeds token in the URL)
  if (token && webhookAccessToken) {
    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(webhookAccessToken);
    if (tokenBuf.length === expectedBuf.length && crypto.timingSafeEqual(tokenBuf, expectedBuf)) {
      authenticated = true;
    } else {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  // HMAC signature path (preferred — no secret in URL)
  if (!authenticated && signature) {
    if (!webhookSigningSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }
    const isValid = verifyWebhookSignature({
      secret: webhookSigningSecret,
      payload: rawPayload,
      signature,
    });
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    authenticated = true;
  }

  // Neither token nor signature present — always reject (dev bypass removed)
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse JSON body ──────────────────────────────────────────────
  let payload: any;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── Process event ────────────────────────────────────────────────
  try {
    if (payload.type !== 'status_update') {
      return NextResponse.json({ ok: true });
    }

    // Handle not_admitted status
    if (payload.data?.new_status === 'not_admitted') {
      const botId = payload.bot_id;
      if (!isValidBotId(botId)) {
        return NextResponse.json({ ok: true });
      }
      const meeting = await getMeetingByBotId(botId);
      if (meeting) {
        await updateMeetingStatus(meeting.id, 'not_admitted');
      }
      return NextResponse.json({ ok: true });
    }

    if (payload.data?.new_status !== 'finished') {
      return NextResponse.json({ ok: true });
    }

    // Validate bot_id strictly — prevent SSRF/command injection
    const botId = payload.bot_id;
    if (!isValidBotId(botId)) {
      return NextResponse.json({ error: 'Invalid bot_id format' }, { status: 400 });
    }

    const meeting = await getMeetingByBotId(botId);
    if (!meeting) {
      return NextResponse.json({ ok: true });
    }

    const botData = await getBotTranscript(botId);
    const rawTranscript = botData.transcript;
    const transcript = Array.isArray(rawTranscript)
      ? rawTranscript.map((t: any) => t.transcript).join(' ')
      : typeof rawTranscript === 'string'
        ? rawTranscript
        : '';

    if (!transcript.trim()) {
      await updateMeetingStatus(meeting.id, 'failed');
      return NextResponse.json({ ok: true });
    }

    const { tickets, title } = await extractTickets(transcript, meeting.id);

    const ticketsWithUser = tickets.map((ticket: any) => ({
      ...ticket,
      user_id: meeting.user_id,
      org_id: meeting.org_id ?? null,
      projectId: meeting.projectId ?? null,
      project_id: meeting.projectId ?? null,
    }));

    const insertedTickets = await saveExtractedTickets(ticketsWithUser);
    await updateMeetingSpecs(meeting.id, transcript, insertedTickets.length);
    await updateMeetingName(meeting.id, title);

    if (meeting.projectId) {
      await addTicketsToProject(
        meeting.projectId,
        insertedTickets.map((ticket: any) => ticket.id)
      );
      const project = await getProjectById(meeting.projectId);
      if (project && project.meetings[0] === meeting.id) {
        await updateProject(meeting.projectId, { name: title });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
