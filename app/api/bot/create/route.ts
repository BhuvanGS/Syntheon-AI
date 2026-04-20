// app/api/bot/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

import { createBot } from '@/lib/skribby';
import { saveMeeting, getActiveMeetingByUrl } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase';

// 🔐 API key → user resolver
async function getUserFromApiKey(apiKey: string) {
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('user_id')
    .eq('key_hash', hash)
    .single();

  return data?.user_id || null;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    let userId: string | null = null;

    // 🔥 API key auth (extension)
    if (authHeader?.startsWith('Bearer syn_')) {
      const apiKey = authHeader.replace('Bearer ', '');
      userId = await getUserFromApiKey(apiKey);
    }

    // 🔥 Clerk auth (dashboard)
    let orgId: string | null = null;
    if (!userId) {
      const session = await auth();
      userId = session.userId;
      orgId = session.orgId ?? null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meetingUrl, tabTitle } = await req.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'meetingUrl is required' }, { status: 400 });
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/bot/webhook`;

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
    await supabaseAdmin.from('meetings').update({ bot_id: bot.id }).eq('id', meetingId);

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
