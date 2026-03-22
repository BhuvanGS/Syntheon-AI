// app/api/bot/continue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBot } from '@/lib/skribby';
import { saveMeeting, getProjectById } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { meetingUrl, projectId } = await req.json();

    if (!meetingUrl) {
      return NextResponse.json({ error: 'meetingUrl is required' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/bot/webhook`;
    const bot        = await createBot(meetingUrl, webhookUrl);

    console.log('Follow-up bot created:', bot.id, 'for project:', projectId);

    // Save new meeting linked to project
    const meetingId = `meet-${Date.now()}`;
    saveMeeting({
      id:            meetingId,
      projectName: `${project.name} — Follow-up ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      meetingId:     meetingId,
      platform:      detectPlatform(meetingUrl),
      transcript:    '',
      specsDetected: 0,
      status:        'processing',
      date:          new Date().toISOString(),
      filePath:      '',
      botId:         bot.id,
      projectId:     projectId
    });

    return NextResponse.json({
      success:   true,
      botId:     bot.id,
      meetingId,
      projectId
    });

  } catch (error) {
    console.error('Failed to create follow-up bot:', error);
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