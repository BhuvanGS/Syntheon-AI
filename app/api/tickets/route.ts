import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAllTickets, updateTicketStatus } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tickets = await getAllTickets(userId);
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const changes = Array.isArray(body?.changes) ? body.changes : [];

    if (changes.length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    const allowedStatuses = new Set(['backlog', 'in_progress', 'done', 'blocked']);
    const userTickets = await getAllTickets(userId);
    const userTicketIds = new Set(userTickets.map((ticket) => ticket.id));

    for (const change of changes) {
      const ticketId = typeof change?.ticketId === 'string' ? change.ticketId : '';
      const status = typeof change?.status === 'string' ? change.status : '';

      if (!ticketId || !allowedStatuses.has(status)) {
        return NextResponse.json({ error: 'Invalid ticket update payload' }, { status: 400 });
      }

      if (!userTicketIds.has(ticketId)) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
    }

    await Promise.all(
      changes.map(
        (change: { ticketId: string; status: 'backlog' | 'in_progress' | 'done' | 'blocked' }) =>
          updateTicketStatus(change.ticketId, change.status)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update tickets:', error);
    return NextResponse.json({ error: 'Failed to update tickets' }, { status: 500 });
  }
}
