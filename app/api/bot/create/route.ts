// app/api/bot/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';

import { createBot } from '@/lib/skribby';
import { saveMeeting } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase';

// 🔐 Resolve user from API key
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

    // 🔥 1. API KEY FLOW (extension)
    if (authHeader?.startsWith('Bearer syn_')) {
      const apiKey = authHeader.replace('Bearer ', '');
      userId = await getUserFromApiKey(apiKey);
    }

    // 🔥 2. CLERK FLOW (web app)
    if (!userId) {
      const session = await auth();
      userId = session.userId;
    }

    // ❌ No auth at all
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meetingUrl, tabTitle } = await req.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'meetingUrl is required' }, { status: 400 });
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/bot/webhook`;

    const bot = await createBot(meetingUrl, webhookUrl);

    console.log('Bot created:', bot.id, 'status:', bot.status);

    const meetingId = `meet-${Date.now()}`;

    // 🔗 CRITICAL: bot → user mapping
    await saveMeeting({
      id:            meetingId,
      user_id:       userId,
      projectName:   tabTitle || 'Untitled Meeting',
      meetingId:     meetingId,
      platform:      detectPlatform(meetingUrl),
      transcript:    '',
      specsDetected: 0,
      status:        'processing',
      date:          new Date().toISOString(),
      filePath:      '',
      botId:         bot.id,
    });

    return NextResponse.json({
      success: true,
      botId: bot.id,
      meetingId
    });

  } catch (error) {
    console.error('Failed to create bot:', error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create bot' },
      { status: 500 }
    );
  }
}

// 🔍 Detect meeting platform
function detectPlatform(url: string) {
  if (url.includes('meet.google.com')) return 'google-meet';
  if (url.includes('teams.microsoft.com')) return 'teams';
  if (url.includes('zoom.us')) return 'zoom';
  return 'unknown';
}