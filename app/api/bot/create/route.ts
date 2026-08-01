// app/api/bot/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { createBot } from '@/lib/skribby';
import { saveMeeting, getActiveMeetingByUrl } from '@/lib/db';
import { MeetingsEntity } from '@/db/entities';
import { checkMeetingLimit, limitErrorResponse } from '@/lib/billing-limits';
import { apiRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session.userId;
    const orgId = session.orgId ?? null;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In-memory per-instance limiter (see lib/rate-limit.ts). Not shared across Lambda instances.
    const limited = await apiRateLimit(req, userId);
    if (limited) return limited;

    // 🚦 Rate limit check for free tier
    const meetingCheck = await checkMeetingLimit(orgId, userId);
    if (!meetingCheck.allowed) {
      return limitErrorResponse(meetingCheck) as NextResponse;
    }

    const { meetingUrl, tabTitle } = await req.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'meetingUrl is required' }, { status: 400 });
    }

    const webhookBaseUrl = process.env.NGROK_URL || process.env.NEXT_PUBLIC_APP_URL;
    const webhookUrl = `${webhookBaseUrl}/api/bot/webhook`;

    const meetingId = `meet-${Date.now()}`;

    // 🔥 STEP 1: INSERT FIRST (DB LOCK)
    try {
      await saveMeeting({
        id: meetingId,
        user_id: userId,
        org_id: orgId ?? undefined,
        projectName: tabTitle || 'Untitled Meeting',
        meetingId: meetingId,
        meeting_url: meetingUrl,
        platform: detectPlatform(meetingUrl),
        transcript: '',
        specsDetected: 0,
        status: 'processing',
        date: new Date().toISOString(),
        filePath: '',
        botId: undefined, // 🔥 no bot yet
      });
    } catch (err: any) {
      console.log('Duplicate meeting detected (DB constraint)');

      const existing = await getActiveMeetingByUrl(meetingUrl, userId);

      if (existing) {
        return NextResponse.json({
          success: true,
          botId: existing.botId,
          meetingId: existing.id,
          reused: true,
        });
      }

      throw err;
    }

    // 🔥 STEP 2: ONLY ONE REQUEST REACHES HERE
    const bot = await createBot(meetingUrl, webhookUrl);

    console.log('Bot created:', bot.id, 'status:', bot.status);

    // 🔥 STEP 3: UPDATE BOT ID
    await MeetingsEntity.update({ id: meetingId })
      .set({ botId: bot.id, updatedAt: new Date().toISOString() })
      .go();

    return NextResponse.json({
      success: true,
      botId: bot.id,
      meetingId,
    });
  } catch (error) {
    console.error('Failed to create bot:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create bot' },
      { status: 500 }
    );
  }
}

// 🔍 Detect platform
function detectPlatform(url: string) {
  if (url.includes('meet.google.com')) return 'google-meet';
  if (url.includes('teams.microsoft.com')) return 'teams';
  if (url.includes('zoom.us')) return 'zoom';
  return 'unknown';
}
