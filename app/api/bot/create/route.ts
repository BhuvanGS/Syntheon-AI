// app/api/bot/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createBot } from '@/lib/skribby';
import { saveMeeting } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { meetingUrl, tabTitle } = await req.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'meetingUrl is required' }, { status: 400 });
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/bot/webhook`;
    const bot        = await createBot(meetingUrl, webhookUrl);

    console.log('Bot created:', bot.id, 'status:', bot.status);

    const meetingId = `meet-${Date.now()}`;

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
  if (url.includes('meet.google.com'))     return 'google-meet';
  if (url.includes('teams.microsoft.com')) return 'teams';
  if (url.includes('zoom.us'))             return 'zoom';
  return 'unknown';
}