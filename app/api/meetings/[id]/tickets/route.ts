import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import {
  getTicketsByMeetingId,
  updateTicketAssignee,
  updateTicketStatus,
  updateTicketDependency,
  saveTickets,
  getMeetingById,
  addTicketsToProject,
} from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const tickets = await getTicketsByMeetingId(id, { originalOnly: true });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const title = String(body?.title ?? '').trim();
    const description = String(body?.description ?? '').trim();
    const status =
      body?.status === 'done' || body?.status === 'in_progress' || body?.status === 'blocked'
        ? body.status
        : 'backlog';
    const assignee = body?.assignee ? String(body.assignee).trim() : null;
    const meeting = await getMeetingById(id);
    const resolvedProjectId = body?.projectId ?? meeting?.projectId ?? null;
    const ticketId = randomUUID();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    await saveTickets([
      {
        id: ticketId,
        user_id: userId,
        meeting_id: id,
        projectId: resolvedProjectId,
        title,
        description,
        status,
        assignee,
        assignee_user_id: null,
        dependency_ticket_id: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    if (resolvedProjectId) {
      await addTicketsToProject(resolvedProjectId, [ticketId]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { ticketId, status, assignee, assigneeUserId, dependencyTicketId } = await req.json();

    if (status) {
      await updateTicketStatus(ticketId, status);
    }

    if (typeof assignee !== 'undefined' || typeof assigneeUserId !== 'undefined') {
      await updateTicketAssignee(ticketId, assignee ?? null, assigneeUserId ?? null);
    }

    if (typeof dependencyTicketId !== 'undefined') {
      await updateTicketDependency(ticketId, dependencyTicketId ?? null);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}
