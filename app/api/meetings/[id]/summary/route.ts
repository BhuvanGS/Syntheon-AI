// app/api/meetings/[id]/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMeetingById, updateMeetingSummary } from '@/lib/db';
import { generateMeetingSummary } from '@/lib/groq';
import { aiRateLimit } from '@/lib/rate-limit';
import { requireAuth } from '@/lib/rbac';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limited = await aiRateLimit(req, ctx.userId);
    if (limited) return limited;

    const { id } = await params;
    const meeting = await getMeetingById(id);
    if (!meeting || meeting.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ summary: meeting.summary ?? null });
  } catch (error) {
    console.error('Failed to fetch meeting summary:', error);
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const meeting = await getMeetingById(id);
    if (!meeting || meeting.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // If already summarized, return cached version
    if (meeting.summary && meeting.summary.trim().length > 0) {
      return NextResponse.json({ summary: meeting.summary, cached: true });
    }

    // Generate summary from transcript
    const transcript = meeting.transcript ?? '';
    if (!transcript.trim()) {
      return NextResponse.json({ summary: null, error: 'No transcript available' });
    }

    const summary = await generateMeetingSummary(transcript);
    await updateMeetingSummary(id, summary);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Failed to generate meeting summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
