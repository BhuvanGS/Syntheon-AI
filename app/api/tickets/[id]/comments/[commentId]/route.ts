import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteComment, getTicketById } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId, commentId } = await params;
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.user_id !== userId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await deleteComment(commentId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /comments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
