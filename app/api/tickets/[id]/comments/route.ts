import { NextRequest, NextResponse } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';
import {
  getCommentsForTicket,
  createComment,
  getTicketById,
  createActivity,
  createNotification,
} from '@/lib/db';
import { requireAuth, canAccessProjectResource } from '@/lib/rbac';

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const ticket = await getTicketById(id);
    if (!ticket || ticket.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    if (!(await canAccessProjectResource(ctx, ticket.projectId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId } = await params;
    const ticket = await getTicketById(ticketId);
    if (!ticket || ticket.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    if (!(await canAccessProjectResource(ctx, ticket.projectId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const comment = await createComment({
      ticket_id: ticketId,
      project_id: ticket.projectId ?? null,
      user_id: ctx.userId,
      content: DOMPurify.sanitize(content.trim(), { ALLOWED_TAGS, ALLOWED_ATTR }),
    });

    const plainContent = content
      .trim()
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Log activity
    await createActivity({
      ticket_id: ticketId,
      user_id: ctx.userId,
      action_type: 'comment_added',
      metadata: { content: plainContent },
    });

    // If this is a subticket, also log to parent
    if (ticket.parent_id) {
      await createActivity({
        ticket_id: ticket.parent_id,
        user_id: ctx.userId,
        action_type: 'comment_added',
        metadata: { content: plainContent, subtask_id: ticketId },
      });
    }

    // Notify @mentioned users
    const mentionRegex = /@\[(.+?)\]\((.+?)\)/g;
    const mentions = new Set<string>();
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedUserId = match[2];
      if (mentionedUserId && mentionedUserId !== ctx.userId) {
        mentions.add(mentionedUserId);
      }
    }
    for (const mentionedUserId of mentions) {
      await createNotification({
        user_id: mentionedUserId,
        org_id: ctx.orgId,
        type: 'mentioned',
        title: 'You were mentioned in a comment',
        message: `On "${ticket.title}"`,
        ticket_id: ticketId,
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error('POST /comments error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
