import { NextRequest, NextResponse } from 'next/server';
import { deleteAttachment, getTicketById, createActivity } from '@/lib/db';
import { requireAuth } from '@/lib/rbac';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId, attachmentId } = await params;
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await deleteAttachment(attachmentId);

    // Log activity
    await createActivity({
      ticket_id: ticketId,
      user_id: ctx.userId,
      action_type: 'attachment_deleted',
      metadata: { attachment_id: attachmentId },
    });

    // If this is a subticket, also log to parent
    if (ticket.parent_id) {
      await createActivity({
        ticket_id: ticket.parent_id,
        user_id: ctx.userId,
        action_type: 'attachment_deleted',
        metadata: { attachment_id: attachmentId, subtask_id: ticketId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /attachments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
