// app/api/meetings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  deleteMeeting,
  deleteTicketsByMeetingId,
  deleteSpecsByMeetingId,
  getMeetingById,
} from '@/lib/db';
import { requireAuth } from '@/lib/rbac';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const meeting = await getMeetingById(id);
    if (!meeting || meeting.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(meeting, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Failed to fetch meeting:', error);
    return NextResponse.json({ error: 'Failed to fetch meeting' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const meeting = await getMeetingById(id);
    if (!meeting || meeting.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Delete tickets first then meeting (keep specs cleanup for migration compatibility)
    await deleteTicketsByMeetingId(id);
    await deleteSpecsByMeetingId(id);
    await deleteMeeting(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
