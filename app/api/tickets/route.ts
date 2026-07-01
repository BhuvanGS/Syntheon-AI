import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  cascadeDepRegressionForParent,
  checkHardBlockers,
  getTicketsByIds,
  getTicketsPaginated,
  getDependenciesForTicket,
  getTicketById,
  incrementDependencyIgnoreCount,
  updateTicketStatus,
} from '@/lib/db';
import { TicketsEntity } from '@/db/entities';
import { broadcastToOrg } from '@/lib/event-bus';

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const meetingId = searchParams.get('meetingId');
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 50), 100);
    const offset = parsePositiveInt(searchParams.get('offset'), 0);

    const { tickets: allTickets, total } = await getTicketsPaginated(orgId || '', {
      projectId: projectId || null,
      meetingId: meetingId || null,
      limit,
      offset,
    });

    // If no orgId, fall back to user-scoped query
    let tickets = allTickets;
    if (!orgId) {
      const userRes = await TicketsEntity.query.byUser({ userId }).go();
      tickets = (userRes.data ?? []).map((t: any) => ({
        id: t.id,
        user_id: t.userId ?? undefined,
        org_id: t.orgId ?? undefined,
        meeting_id: t.meetingId ?? null,
        projectId: t.projectId ?? undefined,
        parent_id: t.parentId ?? null,
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        assignee: t.assignee ?? null,
        assignee_user_id: t.assigneeUserId ?? null,
        dependency_ticket_id: t.dependencyTicketId ?? null,
        start_date: t.startDate ?? null,
        due_date: t.dueDate ?? null,
        deadline_time: t.deadlineTime ?? null,
        priority: t.priority ?? 'none',
        type: t.type ?? 'task',
        estimate: t.estimate ?? 'none',
        labels: t.labels ?? [],
        rank: t.rank ?? null,
        milestoneId: t.milestoneId ?? null,
        sprintId: t.sprintId ?? null,
        isGroup: t.isGroup ?? false,
        createdAt: t.createdAt ?? null,
        updatedAt: t.updatedAt ?? null,
      }));
      if (projectId) tickets = tickets.filter((t) => t.projectId === projectId);
      if (meetingId) tickets = tickets.filter((t) => t.meeting_id === meetingId);
      tickets.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      const sliced = tickets.slice(offset, offset + limit);
      return NextResponse.json(
        {
          tickets: sliced,
          total: tickets.length,
          limit,
          offset,
          hasMore: offset + sliced.length < tickets.length,
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      {
        tickets: tickets.map((t) => ({
          id: t.id,
          user_id: t.user_id,
          org_id: t.org_id,
          meeting_id: t.meeting_id,
          projectId: t.projectId,
          parent_id: t.parent_id,
          title: t.title,
          description: t.description,
          status: t.status,
          assignee: t.assignee,
          assignee_user_id: t.assignee_user_id,
          dependency_ticket_id: t.dependency_ticket_id,
          start_date: t.start_date,
          due_date: t.due_date,
          deadline_time: t.deadline_time,
          priority: t.priority ?? 'none',
          type: t.type ?? 'task',
          estimate: t.estimate ?? 'none',
          labels: t.labels ?? [],
          rank: t.rank ?? null,
          milestoneId: t.milestoneId ?? null,
          sprintId: t.sprintId ?? null,
          isGroup: t.isGroup ?? false,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        })),
        total,
        limit,
        offset,
        hasMore: offset + tickets.length < total,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const changes = Array.isArray(body?.changes) ? body.changes : [];

    if (changes.length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    const bypassGate = body?.bypassGate === true;

    // Validate payload shape before touching the DB
    const changeIds: string[] = [];
    for (const change of changes) {
      const ticketId = typeof change?.ticketId === 'string' ? change.ticketId : '';
      const status = typeof change?.status === 'string' ? change.status : '';
      if (!ticketId || !status) {
        return NextResponse.json({ error: 'Invalid ticket update payload' }, { status: 400 });
      }
      changeIds.push(ticketId);
    }

    // Fetch only the tickets being changed (scoped to org/user) — no full-table scan
    const userTickets = await getTicketsByIds(changeIds, { orgId, userId });
    const userTicketIds = new Set(userTickets.map((ticket) => ticket.id));
    const ticketById = new Map(userTickets.map((ticket) => [ticket.id, ticket]));

    for (const ticketId of changeIds) {
      if (!userTicketIds.has(ticketId)) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
    }

    for (const change of changes) {
      const ticketId = change.ticketId as string;
      const status = change.status as 'backlog' | 'in_progress' | 'done' | 'blocked';

      if (status === 'in_progress') {
        const { blocked, blockers } = await checkHardBlockers(ticketId);
        if (blocked) {
          return NextResponse.json(
            {
              error: 'hard_blocked',
              ticketId,
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

        const { parents } = await getDependenciesForTicket(ticketId);
        const softParents = parents.filter((d) => d.strength === 'soft' && !d.escalated);
        if (softParents.length > 0) {
          const softParentTickets: { id: string; status: string }[] = [];
          for (const dep of softParents) {
            const t = await getTicketById(dep.depends_on_ticket_id);
            if (t) softParentTickets.push({ id: t.id, status: t.status });
          }

          const unresolvedSoft = softParents.filter((dep) => {
            const parent = softParentTickets.find((t) => t.id === dep.depends_on_ticket_id);
            return parent?.status !== 'done';
          });

          if (unresolvedSoft.length > 0 && !bypassGate) {
            return NextResponse.json(
              {
                error: 'soft_blocked',
                ticketId,
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

      const previousStatus = ticketById.get(ticketId)?.status;
      await updateTicketStatus(ticketId, status);
      broadcastToOrg(orgId ?? '', {
        type: 'ticket_updated',
        payload: {
          ticketId,
          projectId: ticketById.get(ticketId)?.projectId ?? null,
          meetingId: ticketById.get(ticketId)?.meeting_id ?? null,
          changes: { status },
        },
      });

      if (previousStatus === 'done' && status !== 'done') {
        await cascadeDepRegressionForParent(ticketId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update tickets:', error);
    return NextResponse.json({ error: 'Failed to update tickets' }, { status: 500 });
  }
}
