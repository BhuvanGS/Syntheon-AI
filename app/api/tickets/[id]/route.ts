import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteTicketsByMeetingId } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await deleteTicketsByMeetingId(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete tickets:', error);
    return NextResponse.json({ error: 'Failed to delete tickets' }, { status: 500 });
  }
}
