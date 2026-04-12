import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteTicketById, getAllTickets, updateTicket } from '@/lib/db';

const allowedStatuses = new Set(['backlog', 'in_progress', 'done', 'blocked']);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const userTickets = await getAllTickets(userId);
    const ticket = userTickets.find((item) => item.id === id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (typeof body?.title !== 'undefined') updates.title = String(body.title).trim();
    if (typeof body?.description !== 'undefined')
      updates.description = String(body.description).trim();
    if (typeof body?.status !== 'undefined') {
      const status = String(body.status);
      if (!allowedStatuses.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = status;
    }
    if (typeof body?.assignee !== 'undefined') {
      updates.assignee = body.assignee ? String(body.assignee).trim() : null;
    }
    if (typeof body?.assigneeUserId !== 'undefined') {
      updates.assignee_user_id = body.assigneeUserId ? String(body.assigneeUserId).trim() : null;
    }
    if (typeof body?.dependencyTicketId !== 'undefined') {
      updates.dependency_ticket_id = body.dependencyTicketId
        ? String(body.dependencyTicketId).trim()
        : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    await updateTicket(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const userTickets = await getAllTickets(userId);
    const ticket = userTickets.find((item) => item.id === id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await deleteTicketById(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
