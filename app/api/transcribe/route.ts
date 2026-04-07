// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { transcribeMeeting } from '@/lib/deepgram';
import { extractTickets } from '@/lib/groq';
import {
  saveMeeting,
  updateMeetingStatus,
  updateMeetingSpecs,
  updateMeetingName,
  saveExtractedTickets,
} from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let meetingId: string | null = null;

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const platform = (formData.get('platform') as string) ?? 'unknown';
    const tabTitle = (formData.get('tabTitle') as string) ?? 'Untitled Meeting';
    const timestamp = (formData.get('timestamp') as string) ?? new Date().toISOString();

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    meetingId = `meet-${Date.now()}`;
    const recordingsDir = path.resolve(process.cwd(), 'recordings');
    await mkdir(recordingsDir, { recursive: true });

    const filePath = path.join(recordingsDir, `${meetingId}.webm`);
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(filePath, buffer);

    console.log('Meeting recording saved:', filePath);

    // Save immediately as processing
    await saveMeeting({
      id: meetingId,
      user_id: userId,
      projectName: tabTitle,
      meetingId: meetingId,
      platform,
      transcript: '',
      specsDetected: 0,
      status: 'processing',
      date: timestamp,
      filePath,
    });

    // Transcribe
    const transcript = await transcribeMeeting(filePath);
    console.log('Transcript done');

    // Extract tickets + title
    const { tickets, title } = await extractTickets(transcript, meetingId);
    console.log(`Extracted ${tickets.length} tickets, title: ${title}`);

    const insertedTickets = await saveExtractedTickets(
      tickets.map((ticket: any) => ({ ...ticket, user_id: userId }))
    );

    // Update meeting
    await updateMeetingSpecs(meetingId, transcript, insertedTickets.length);
    await updateMeetingName(meetingId, title);

    return NextResponse.json({
      success: true,
      meetingId,
      specsDetected: insertedTickets.length,
      specs: tickets,
    });
  } catch (error) {
    console.error('PIPELINE ERROR:', error);
    if (meetingId) await updateMeetingStatus(meetingId, 'failed').catch(() => {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Pipeline failed' },
      { status: 500 }
    );
  }
}
