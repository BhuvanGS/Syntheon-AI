// app/api/bot/create/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import crypto from 'crypto';

import { createBot } from '@/lib/skribby';
import { saveMeeting, getActiveMeetingByUrl, updateMeetingStatus } from '@/lib/db';
import { ApiKeysEntity, MeetingsEntity } from '@/db/entities';

// 🔐 API key → user resolver
async function getUserFromApiKey(apiKey: string) {
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Scan for key hash — API keys table uses userId as PK, so we scan
  const allKeys = await ApiKeysEntity.scan.go();
  const row = (allKeys.data ?? []).find((k: any) => k.keyHash === hash);

  return row?.userId || null;
}

// 🔐 Resolve a user's primary org from Clerk (first membership)
async function getUserPrimaryOrgId(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const memberships = await client.users.getOrganizationMembershipList({ userId });
    const list = memberships.data ?? [];
    if (list.length === 0) return null;
    // Prefer admin membership, else first
    const admin = list.find((m) => m.role === 'org:admin');
    return (admin ?? list[0]).organization.id;
  } catch (err) {
    console.error('Failed to resolve user primary org:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');

    let userId: string | null = null;
    let orgId: string | null = null;

    // 🔥 API key auth (extension)
    if (authHeader?.startsWith('Bearer syn_')) {
      const apiKey = authHeader.replace('Bearer ', '');
      userId = await getUserFromApiKey(apiKey);
      // Extension has no org context — resolve user's primary org from Clerk
      if (userId) {
        orgId = await getUserPrimaryOrgId(userId);
      }
    }

    // 🔥 Clerk auth (dashboard)
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
