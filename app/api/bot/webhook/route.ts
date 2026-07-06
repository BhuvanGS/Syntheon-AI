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
  createNotification,
} from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/webhook';
import { broadcast } from '@/lib/event-bus';
import { buildSpeakerMap, extractSpeakerNames } from '@/lib/speaker-match';
import { checkTicketLimit, limitErrorResponse } from '@/lib/billing-limits';
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
  let meeting: any = null;
  try {
    if (payload.type !== 'status_update') {
      console.log('[bot/webhook] Ignored non-status_update event:', payload.type);
      return NextResponse.json({ ok: true });
    }

    // Handle not_admitted status
    if (payload.data?.new_status === 'not_admitted') {
      const botId = payload.bot_id;
      if (!isValidBotId(botId)) {
        return NextResponse.json({ ok: true });
      }
      const notAdmittedMeeting = await getMeetingByBotId(botId);
      if (notAdmittedMeeting) {
        await updateMeetingStatus(notAdmittedMeeting.id, 'not_admitted');
      }
      return NextResponse.json({ ok: true });
    }

    if (payload.data?.new_status !== 'finished') {
      console.log('[bot/webhook] Ignored non-finished status:', payload.data?.new_status);
      return NextResponse.json({ ok: true });
    }

    console.log('[bot/webhook] Received finished event for bot:', payload.bot_id);

    // Validate bot_id strictly — prevent SSRF/command injection
    const botId = payload.bot_id;
    if (!isValidBotId(botId)) {
      return NextResponse.json({ error: 'Invalid bot_id format' }, { status: 400 });
    }

    meeting = await getMeetingByBotId(botId);
    if (!meeting) {
      console.log('[bot/webhook] No meeting found for botId:', botId);
      return NextResponse.json({ ok: true });
    }

    console.log('[bot/webhook] Found meeting:', meeting.id, 'for project:', meeting.projectId);

    const botData = await getBotTranscript(botId);
    console.log('[bot/webhook] Bot data keys:', Object.keys(botData || {}));
    console.log(
      '[bot/webhook] Bot transcript type:',
      typeof botData?.transcript,
      'isArray:',
      Array.isArray(botData?.transcript)
    );

    const rawTranscript = botData.transcript;
    const transcript = Array.isArray(rawTranscript)
      ? rawTranscript
          .map((t: any) => {
            const speaker = t.speaker_name || t.speaker || 'Unknown';
            const text = t.transcript || '';
            return `${speaker}: ${text}`;
          })
          .join('\n')
      : typeof rawTranscript === 'string'
        ? rawTranscript
        : '';

    console.log(
      '[bot/webhook] Transcript length:',
      transcript.length,
      'preview:',
      transcript.slice(0, 200)
    );

    if (!transcript.trim()) {
      await updateMeetingStatus(meeting.id, 'failed');
      await createNotification({
        user_id: meeting.user_id,
        org_id: meeting.org_id ?? '',
        type: 'meeting_failed',
        title: 'Meeting recording failed',
        message: `No transcript was captured for "${meeting.projectName}".`,
      });
      broadcast({
        type: 'meeting_failed',
        payload: {
          meetingId: meeting.id,
          projectId: meeting.projectId,
          title: meeting.projectName,
        },
      });
      return NextResponse.json({ ok: true });
    }

    console.log('[bot/webhook] Calling Groq extractTickets...');
    const { tickets, title } = await extractTickets(transcript, meeting.id);
    console.log('[bot/webhook] Groq returned', tickets.length, 'tickets, title:', title);
    if (tickets.length > 0) {
      console.log('[bot/webhook] First ticket:', JSON.stringify(tickets[0], null, 2).slice(0, 300));
    }

    let speakerMap = new Map<
      string,
      { matchedName: string | null; matchedUserId: string | null }
    >();
    if (meeting.projectId && Array.isArray(rawTranscript)) {
      const spokenNames = extractSpeakerNames(rawTranscript);
      if (spokenNames.length > 0) {
        speakerMap = await buildSpeakerMap(meeting.projectId, spokenNames);
        console.log(
          '[bot/webhook] Speaker map:',
          Object.fromEntries(
            [...speakerMap.entries()].map(([k, v]) => [
              k,
              { name: v.matchedName, userId: v.matchedUserId },
            ])
          )
        );
      }
    }

    const ticketsWithUser = tickets.map((ticket: any) => {
      let assignee = ticket.assignee ?? null;
      let assignee_user_id = ticket.assignee_user_id ?? null;

      if (assignee && !assignee_user_id) {
        const match = speakerMap.get(assignee);
        if (match?.matchedUserId) {
          assignee = match.matchedName;
          assignee_user_id = match.matchedUserId;
          console.log(
            '[bot/webhook] Matched assignee:',
            ticket.assignee,
            '→',
            match.matchedName,
            '(' + match.matchedUserId + ')'
          );
        } else {
          for (const [spokenName, matchInfo] of speakerMap.entries()) {
            if (matchInfo.matchedUserId) {
              const spokenNorm = spokenName.toLowerCase();
              const assigneeNorm = assignee.toLowerCase();
              if (spokenNorm.includes(assigneeNorm) || assigneeNorm.includes(spokenNorm)) {
                assignee = matchInfo.matchedName;
                assignee_user_id = matchInfo.matchedUserId;
                console.log(
                  '[bot/webhook] Fuzzy matched assignee:',
                  ticket.assignee,
                  '→',
                  matchInfo.matchedName,
                  '(' + matchInfo.matchedUserId + ')'
                );
                break;
              }
            }
          }
        }
      }

      return {
        ...ticket,
        user_id: meeting.user_id,
        org_id: meeting.org_id ?? null,
        projectId: meeting.projectId ?? null,
        project_id: meeting.projectId ?? null,
        assignee,
        assignee_user_id,
      };
    });

    const ticketCheck = await checkTicketLimit(
      meeting.org_id ?? null,
      meeting.user_id,
      ticketsWithUser.length
    );
    if (!ticketCheck.allowed) {
      await updateMeetingStatus(meeting.id, 'failed');
      return limitErrorResponse(ticketCheck) as NextResponse;
    }

    const insertedTickets = await saveExtractedTickets(ticketsWithUser);
    console.log('[bot/webhook] Saved', insertedTickets.length, 'tickets to DB');
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

    await createNotification({
      user_id: meeting.user_id,
      org_id: meeting.org_id ?? '',
      type: 'meeting_ready',
      title: 'Meeting tickets ready',
      message: `Extracted ${insertedTickets.length} ticket${insertedTickets.length === 1 ? '' : 's'} from "${title || meeting.projectName}".`,
    });
    broadcast({
      type: 'meeting_ready',
      payload: {
        meetingId: meeting.id,
        projectId: meeting.projectId,
        title: title || meeting.projectName,
        ticketCount: insertedTickets.length,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[bot/webhook] FAILED to process meeting:', err?.message || err);
    console.error('[bot/webhook] Error stack:', err?.stack);
    if (meeting) {
      await updateMeetingStatus(meeting.id, 'failed');
      await createNotification({
        user_id: meeting.user_id,
        org_id: meeting.org_id ?? '',
        type: 'meeting_failed',
        title: 'Meeting extraction failed',
        message: `Could not process tickets from "${meeting.projectName}".`,
      });
      broadcast({
        type: 'meeting_failed',
        payload: {
          meetingId: meeting.id,
          projectId: meeting.projectId,
          title: meeting.projectName,
        },
      });
    }
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
