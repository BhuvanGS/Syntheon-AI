import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteAttachment, getTicketById } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId, attachmentId } = await params;
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.user_id !== userId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await deleteAttachment(attachmentId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /attachments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
