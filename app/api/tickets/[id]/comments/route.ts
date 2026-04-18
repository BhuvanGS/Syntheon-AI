import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getCommentsForTicket,
  createComment,
  deleteComment,
  getTicketById,
  createActivity,
} from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const ticket = await getTicketById(id);
    if (!ticket || ticket.user_id !== userId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const comments = await getCommentsForTicket(id);
    return NextResponse.json(comments);
  } catch (err) {
    console.error('GET /comments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId } = await params;
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.user_id !== userId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const comment = await createComment({
      ticket_id: ticketId,
      project_id: ticket.projectId ?? null,
      user_id: userId,
      content: content.trim(),
    });

    // Log activity
    await createActivity({
      ticket_id: ticketId,
      user_id: userId,
      action_type: 'comment_added',
      metadata: { content: content.trim() },
    });

    // If this is a subticket, also log to parent
    if (ticket.parent_id) {
      await createActivity({
        ticket_id: ticket.parent_id,
        user_id: userId,
        action_type: 'comment_added',
        metadata: { content: content.trim(), subtask_id: ticketId },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('POST /comments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
