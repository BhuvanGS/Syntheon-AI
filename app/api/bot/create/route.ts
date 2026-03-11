// app/api/bot/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBot } from '@/lib/skribby';
import { saveMeeting } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { meetingUrl, tabTitle } = await req.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'meetingUrl is required' }, { status: 400 });
    }

    // Webhook URL — Skribby will POST here when meeting ends
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/bot/webhook`;

    const bot = await createBot(meetingUrl, webhookUrl);
    console.log('Bot created:', bot.id, 'status:', bot.status);

    // Save meeting immediately as processing
    const meetingId = `meet-${Date.now()}`;
    saveMeeting({
      id:            meetingId,
      projectName:   tabTitle || 'Untitled Meeting',
      meetingId:     meetingId,
      platform:      detectPlatform(meetingUrl),
      transcript:    '',
      specsDetected: 0,
      status:        'processing',
      date:          new Date().toISOString(),
      filePath:      '',
      botId:         bot.id  // store bot ID to match webhook later
    });

    return NextResponse.json({ success: true, botId: bot.id, meetingId });

  } catch (error) {
    console.error('Failed to create bot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create bot' },
      { status: 500 }
    );
  }
}

function detectPlatform(url: string) {
  if (url.includes('meet.google.com')) return 'google-meet';
  if (url.includes('teams.microsoft.com')) return 'teams';
  if (url.includes('zoom.us')) return 'zoom';
  return 'unknown';
}