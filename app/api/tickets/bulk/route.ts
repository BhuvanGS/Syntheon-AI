import { NextRequest, NextResponse } from 'next/server';
import { getTicketsByIds, updateTicket } from '@/lib/db';
import { broadcastToOrg } from '@/lib/event-bus';
import { requireAuth } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const ticketIds: string[] = Array.isArray(body?.ticketIds) ? body.ticketIds : [];
    const updates: Record<string, unknown> = {};

    if (typeof body?.priority === 'string') updates.priority = body.priority;
    if (typeof body?.type === 'string') updates.type = body.type;
    if (typeof body?.estimate === 'string') updates.estimate = body.estimate;
    if (typeof body?.status === 'string') updates.status = body.status;
    if (Array.isArray(body?.labels)) updates.labels = body.labels;
    if (typeof body?.assignee === 'string') updates.assignee = body.assignee || null;
    if (typeof body?.assigneeUserId === 'string')
      updates.assignee_user_id = body.assigneeUserId || null;

    if (ticketIds.length === 0 || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No ticket IDs or updates provided' }, { status: 400 });
    }

    const tickets = await getTicketsByIds(ticketIds, { orgId: ctx.orgId, userId: ctx.userId });
    const validIds = new Set(tickets.map((t) => t.id));

    if (validIds.size !== ticketIds.length) {
      return NextResponse.json({ error: 'Some tickets not found' }, { status: 404 });
    }

    for (const ticketId of ticketIds) {
      await updateTicket(ticketId, updates as any);
      broadcastToOrg(ctx.orgId, {
        type: 'ticket_updated',
        payload: {
          ticketId,
          projectId: tickets.find((t) => t.id === ticketId)?.projectId ?? null,
          meetingId: tickets.find((t) => t.id === ticketId)?.meeting_id ?? null,
          changes: updates,
        },
      });
    }

    return NextResponse.json({ success: true, updated: ticketIds.length });
  } catch (error) {
    console.error('Failed to bulk update tickets:', error);
    return NextResponse.json({ error: 'Failed to bulk update tickets' }, { status: 500 });
  }
}
