import { NextRequest, NextResponse } from 'next/server';
import {
  deleteTicketById,
  updateTicket,
  cascadeDepRegressionForParent,
  getDependenciesForTicket,
  incrementDependencyIgnoreCount,
  createActivity,
  getTicketById,
  createNotification,
  notifyTicketStatusChanged,
} from '@/lib/db';
import { broadcastToOrg } from '@/lib/event-bus';
import { requireAuth } from '@/lib/rbac';
import { TicketsEntity } from '@/db/entities';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { userId, orgId } = ctx;

    const { id } = await params;
    // Single-row lookup instead of scanning the entire org's tickets
    const ticket = (await getTicketById(id)) ?? undefined;
    if (!ticket || ticket.org_id !== orgId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (typeof body?.title !== 'undefined') updates.title = String(body.title).trim();
    if (typeof body?.description !== 'undefined')
      updates.description = String(body.description).trim();
    if (typeof body?.status !== 'undefined') {
      updates.status = String(body.status);
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
    if (typeof body?.start_date !== 'undefined') {
      updates.start_date = body.start_date ? String(body.start_date) : null;
    }
    if (typeof body?.due_date !== 'undefined') {
      updates.due_date = body.due_date ? String(body.due_date) : null;
    }
    if (typeof body?.deadline_time !== 'undefined') {
      updates.deadline_time = body.deadline_time ? String(body.deadline_time) : null;
    }
    if (typeof body?.priority !== 'undefined') {
      updates.priority = String(body.priority);
    }
    if (typeof body?.type !== 'undefined') {
      updates.type = String(body.type);
    }
    if (typeof body?.estimate !== 'undefined') {
      updates.estimate = String(body.estimate);
    }
    if (typeof body?.labels !== 'undefined') {
      updates.labels = Array.isArray(body.labels) ? body.labels : [];
    }
    if (typeof body?.isGroup !== 'undefined') {
      updates.isGroup = Boolean(body.isGroup);
    }
    if (typeof body?.milestoneId !== 'undefined') {
      updates.milestoneId = body.milestoneId ? String(body.milestoneId) : null;
    }
    if (typeof body?.sprintId !== 'undefined') {
      updates.sprintId = body.sprintId ? String(body.sprintId) : null;
    }
    if (typeof body?.timeEstimate !== 'undefined') {
      updates.timeEstimate = body.timeEstimate ? Number(body.timeEstimate) : null;
    }
    if (typeof body?.timeSpent !== 'undefined') {
      updates.timeSpent = body.timeSpent ? Number(body.timeSpent) : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const newStatus = updates.status as string | undefined;
    const bypassGate = body?.bypassGate === true;

    // Block status changes when there are unresolved hard or soft dependencies
    if (newStatus === 'in_progress' || newStatus === 'done') {
      const { parents } = await getDependenciesForTicket(id);
      const hardParents = parents.filter((d) => d.strength === 'hard' || d.escalated);
      const softParents = parents.filter((d) => d.strength === 'soft' && !d.escalated);
      const parentIds = [
        ...new Set([...hardParents, ...softParents].map((d) => d.depends_on_ticket_id)),
      ];

      const parentTickets: { id: string; status: string }[] = [];
      for (const pid of parentIds) {
        const t = await getTicketById(pid);
        if (t) parentTickets.push({ id: t.id, status: t.status });
      }

      const unresolvedHard = hardParents.filter((dep) => {
        const parent = parentTickets.find((t) => t.id === dep.depends_on_ticket_id);
        return parent?.status !== 'done';
      });

      if (unresolvedHard.length > 0) {
        return NextResponse.json(
          {
            error: 'hard_blocked',
            message: `This ticket has ${unresolvedHard.length} unresolved hard dependenc${unresolvedHard.length === 1 ? 'y' : 'ies'} that must be resolved first.`,
            blockers: unresolvedHard.map((b) => ({
              id: b.id,
              depends_on: b.depends_on_ticket_id,
              type: b.dependency_type,
            })),
          },
          { status: 422 }
        );
      }

      const unresolvedSoft = softParents.filter((dep) => {
        const parent = parentTickets.find((t) => t.id === dep.depends_on_ticket_id);
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

    const previousStatus = ticket.status;
    const previousAssignee = ticket.assignee;
    await updateTicket(id, updates);
    broadcastToOrg(orgId, {
      type: 'ticket_updated',
      payload: {
        ticketId: id,
        projectId: ticket.projectId,
        meetingId: ticket.meeting_id,
        changes: updates,
      },
    });

    // Log activity for status change
    if (newStatus && newStatus !== previousStatus) {
      await createActivity({
        ticket_id: id,
        user_id: userId,
        action_type: 'status_changed',
        metadata: { from: previousStatus, to: newStatus },
      });

      // Notify ticket owner of status change (if not the one making the change)
      if (ticket.user_id && ticket.user_id !== userId && orgId) {
        try {
          await notifyTicketStatusChanged(id, ticket.title, ticket.user_id, orgId, newStatus);
        } catch (err) {
          console.error('[NOTIFY] Failed to create status change notification:', err);
        }
      }
    }

    // Log activity for assignee change
    const newAssignee = updates.assignee as string | null;
    const newAssigneeUserId = updates.assignee_user_id as string | null;
    if (newAssignee !== undefined && newAssignee !== previousAssignee) {
      await createActivity({
        ticket_id: id,
        user_id: userId,
        action_type: 'assigned',
        metadata: { to: newAssignee || 'Unassigned' },
      });
      // Notify the new assignee
      if (newAssigneeUserId && newAssigneeUserId !== userId) {
        try {
          await createNotification({
            user_id: newAssigneeUserId,
            org_id: orgId,
            type: 'assigned',
            title: 'New ticket assigned to you',
            message: `"${ticket.title}" was assigned to you`,
            ticket_id: id,
          });
        } catch (err) {
          console.error('[NOTIFY] Failed to create assignment notification:', err);
        }
        // Also notify the assigner
        try {
          await createNotification({
            user_id: userId,
            org_id: orgId,
            type: 'assigned',
            title: 'Ticket assignment updated',
            message: `You assigned "${ticket.title}" to ${newAssignee}`,
            ticket_id: id,
          });
        } catch (err) {
          console.error('[NOTIFY] Failed to create assigner notification:', err);
        }
      }
    }

    // Notify when ticket is moved to blocked
    if (newStatus === 'blocked' && previousStatus !== 'blocked') {
      const targetUserId = (updates.assignee_user_id as string | null) ?? ticket.assignee_user_id;
      if (targetUserId) {
        try {
          await createNotification({
            user_id: targetUserId,
            org_id: orgId,
            type: 'blocked',
            title: 'Ticket moved to blocked',
            message: `"${ticket.title}" is now blocked`,
            ticket_id: id,
          });
        } catch (err) {
          console.error('[NOTIFY] Failed to create blocked notification:', err);
        }
      }
    }

    // Log one activity per changed field with from/to values
    const ignoredKeys = ['status', 'assignee', 'assignee_user_id'];
    const fieldLabels: Record<string, string> = {
      title: 'title',
      description: 'description',
      start_date: 'start date',
      due_date: 'due date',
      deadline_time: 'deadline time',
      dependency_ticket_id: 'dependency',
      priority: 'priority',
      type: 'type',
      estimate: 'estimate',
      labels: 'labels',
    };
    const changedKeys = Object.keys(updates).filter((k) => !ignoredKeys.includes(k));
    for (const key of changedKeys) {
      const oldVal = ticket[key as keyof typeof ticket];
      const newVal = updates[key];
      await createActivity({
        ticket_id: id,
        user_id: userId,
        action_type: 'updated',
        metadata: {
          field: fieldLabels[key] ?? key,
          from: (oldVal ?? 'not set') as string,
          to: (newVal ?? 'not set') as string,
        },
      });
    }

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
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const ticket = (await getTicketById(id)) ?? undefined;
    if (!ticket || ticket.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Log deletion activity before deleting (for traceability)
    await createActivity({
      ticket_id: id,
      user_id: ctx.userId,
      action_type: 'deleted',
      metadata: {
        title: ticket.title,
        status: ticket.status,
        projectId: ticket.projectId,
        assignee: ticket.assignee,
      },
    });

    await deleteTicketById(id);
    broadcastToOrg(ctx.orgId, {
      type: 'ticket_deleted',
      payload: { ticketId: id, projectId: ticket.projectId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
