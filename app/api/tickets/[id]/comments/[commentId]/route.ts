import { NextRequest, NextResponse } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';
import { deleteComment, updateComment, getTicketById, createActivity } from '@/lib/db';
import { requireAuth } from '@/lib/rbac';

const ALLOWED_TAGS = [
  'p',
  'strong',
  'em',
  'u',
  's',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'blockquote',
  'code',
  'pre',
  'br',
];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId, commentId } = await params;
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await deleteComment(commentId);

    // Log activity
    await createActivity({
      ticket_id: ticketId,
      user_id: ctx.userId,
      action_type: 'comment_deleted',
      metadata: { comment_id: commentId },
    });

    // If this is a subticket, also log to parent
    if (ticket.parent_id) {
      await createActivity({
        ticket_id: ticket.parent_id,
        user_id: ctx.userId,
        action_type: 'comment_deleted',
        metadata: { comment_id: commentId, subtask_id: ticketId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /comments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId, commentId } = await params;
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const { content } = await req.json();
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const sanitized = DOMPurify.sanitize(content.trim(), { ALLOWED_TAGS, ALLOWED_ATTR });
    const updated = await updateComment(commentId, sanitized);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /comments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
