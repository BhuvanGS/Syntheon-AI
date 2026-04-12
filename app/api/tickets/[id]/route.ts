import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  deleteTicketById,
  getAllTickets,
  updateTicket,
  checkHardBlockers,
  cascadeDepRegressionForParent,
  getDependenciesForTicket,
  incrementDependencyIgnoreCount,
} from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase';

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

    const newStatus = updates.status as string | undefined;
    const bypassGate = body?.bypassGate === true;

    if (newStatus === 'in_progress') {
      const { blocked, blockers } = await checkHardBlockers(id);
      if (blocked) {
        return NextResponse.json(
          {
            error: 'hard_blocked',
            message: `This ticket has ${blockers.length} unresolved hard dependenc${blockers.length === 1 ? 'y' : 'ies'} that must be resolved first.`,
            blockers: blockers.map((b) => ({
              id: b.id,
              depends_on: b.depends_on_ticket_id,
              type: b.dependency_type,
            })),
          },
          { status: 422 }
        );
      }

      const { parents } = await getDependenciesForTicket(id);
      const softParentIds = parents
        .filter((d) => d.strength === 'soft' && !d.escalated)
        .map((d) => d.depends_on_ticket_id);

      if (softParentIds.length > 0) {
        const { data: softParentTickets } = await supabaseAdmin
          .from('tickets')
          .select('id, status')
          .in('id', softParentIds);
        const unresolvedSoft = parents.filter((dep) => {
          if (dep.strength !== 'soft' || dep.escalated) return false;
          const parent = (softParentTickets ?? []).find(
            (t: any) => t.id === dep.depends_on_ticket_id
          );
          return parent?.status !== 'done';
        });

        if (unresolvedSoft.length > 0 && !bypassGate) {
          return NextResponse.json(
            {
              error: 'soft_blocked',
              message: `This ticket has ${unresolvedSoft.length} unresolved soft dependenc${unresolvedSoft.length === 1 ? 'y' : 'ies'}. You can proceed anyway.`,
              blockers: unresolvedSoft.map((b) => ({
                id: b.id,
                depends_on: b.depends_on_ticket_id,
                type: b.dependency_type,
                ignore_count: b.ignore_count,
              })),
            },
            { status: 422 }
          );
        }

        if (bypassGate && unresolvedSoft.length > 0) {
          await Promise.all(unresolvedSoft.map((d) => incrementDependencyIgnoreCount(d.id)));
        }
      }
    }

    const previousStatus = ticket.status;
    await updateTicket(id, updates);

    if (previousStatus === 'done' && newStatus && newStatus !== 'done') {
      await cascadeDepRegressionForParent(id);
    }

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
