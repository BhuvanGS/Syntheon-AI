import { randomUUID } from 'crypto';
import {
  TicketsEntity,
  ProjectsEntity,
  TicketDependenciesEntity,
  TicketAttachmentsEntity,
  TicketCommentsEntity,
  TicketActivitiesEntity,
} from '@/db/entities';
import type {
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketActivity,
  TicketDependency,
  DependencyType,
  DependencyStrength,
} from './types';
import { entityToTicket, entityToTicketDependency } from './mappers';
import { getProjectById, updateProject } from './projects';
import { updateMeetingSpecs } from './meetings';

// ─── Tickets ────────────────────────────────────────────────────
export async function saveTickets(ticketsList: Ticket[]): Promise<void> {
  if (ticketsList.length === 0) return;
  for (const ticket of ticketsList) {
    await TicketsEntity.create({
      id: ticket.id,
      userId: ticket.user_id,
      orgId: ticket.org_id,
      meetingId: ticket.meeting_id ?? undefined,
      projectId: ticket.projectId,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      assignee: ticket.assignee ?? undefined,
      assigneeUserId: ticket.assignee_user_id ?? undefined,
      dependencyTicketId: ticket.dependency_ticket_id ?? undefined,
      startDate: ticket.start_date ?? undefined,
      dueDate: ticket.due_date ?? undefined,
      deadlineTime: ticket.deadline_time ?? undefined,
      priority: ticket.priority ?? 'none',
      type: ticket.type ?? 'task',
      estimate: ticket.estimate ?? 'none',
      labels: ticket.labels ?? [],
      rank: ticket.rank ?? undefined,
      milestoneId: ticket.milestoneId ?? undefined,
      isGroup: ticket.isGroup ?? false,
      sprintId: ticket.sprintId ?? undefined,
    }).go();
  }
}

function ticketFingerprint(
  ticket: Pick<Ticket, 'meeting_id' | 'title' | 'description' | 'status' | 'assignee' | 'due_date'>
) {
  return [
    ticket.meeting_id ?? '',
    ticket.title.trim().toLowerCase(),
    ticket.description.trim().toLowerCase(),
    ticket.status,
    ticket.assignee?.trim().toLowerCase() ?? '',
    ticket.due_date ?? '',
  ].join('::');
}

export async function saveExtractedTickets(ticketsList: Ticket[]): Promise<Ticket[]> {
  if (ticketsList.length === 0) return [];
  const meetingId = ticketsList[0]?.meeting_id;
  if (!meetingId) return [];

  const existingTickets = await getTicketsByMeetingId(meetingId);
  const existingFingerprints = new Set(existingTickets.map(ticketFingerprint));
  const seenFingerprints = new Set<string>();

  const uniqueTickets = ticketsList.filter((ticket) => {
    const fingerprint = ticketFingerprint(ticket);
    if (existingFingerprints.has(fingerprint) || seenFingerprints.has(fingerprint)) return false;
    seenFingerprints.add(fingerprint);
    return true;
  });

  if (uniqueTickets.length === 0) return [];
  await saveTickets(uniqueTickets);
  return uniqueTickets;
}

export async function getTicketsByMeetingId(
  meetingId: string,
  options?: { originalOnly?: boolean }
): Promise<Ticket[]> {
  const res = await TicketsEntity.query.byMeeting({ meetingId }).go();
  let tickets = (res.data ?? []).map(entityToTicket);
  if (options?.originalOnly) {
    tickets = tickets.filter((t: Ticket) => !t.projectId);
  }
  return tickets.sort((a: Ticket, b: Ticket) =>
    (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
  );
}

export async function getTicketsByProjectId(projectId: string): Promise<Ticket[]> {
  const res = await TicketsEntity.query.byProject({ projectId }).go();
  return (res.data ?? [])
    .map(entityToTicket)
    .sort((a: Ticket, b: Ticket) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
}

export async function getAllTickets(userId: string): Promise<Ticket[]> {
  const res = await TicketsEntity.query.byUser({ userId }).go();
  const tickets = (res.data ?? [])
    .map(entityToTicket)
    .sort((a: Ticket, b: Ticket) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

  const seen = new Set<string>();
  const deduplicated: Ticket[] = [];
  for (const ticket of tickets) {
    const key = `${ticket.meeting_id || 'null'}::${ticket.title.trim().toLowerCase()}::${(ticket.description || '').trim().toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(ticket);
    }
  }
  return deduplicated;
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const res = await TicketsEntity.get({ id }).go();
  return res.data ? entityToTicket(res.data) : null;
}

export async function getTicketsByIds(
  ids: string[],
  scope: { orgId?: string | null; userId?: string }
): Promise<Ticket[]> {
  if (ids.length === 0) return [];
  const results: Ticket[] = [];
  for (const id of ids) {
    const res = await TicketsEntity.get({ id }).go();
    if (res.data) {
      const ticket = entityToTicket(res.data);
      if (scope.orgId && ticket.org_id !== scope.orgId) continue;
      if (!scope.orgId && scope.userId && ticket.user_id !== scope.userId) continue;
      results.push(ticket);
    }
  }
  return results;
}

export async function updateTicketStatus(id: string, status: Ticket['status']): Promise<void> {
  await TicketsEntity.update({ id }).set({ status, updatedAt: new Date().toISOString() }).go();
}

export async function updateTicketAssignee(
  id: string,
  assignee: string | null,
  assigneeUserId: string | null = null
): Promise<void> {
  await TicketsEntity.update({ id })
    .set({ assignee, assigneeUserId, updatedAt: new Date().toISOString() })
    .go();
}

export async function updateTicketDependency(
  id: string,
  dependencyTicketId: string | null
): Promise<void> {
  await TicketsEntity.update({ id })
    .set({ dependencyTicketId, updatedAt: new Date().toISOString() })
    .go();
}

export async function updateTicket(
  id: string,
  updates: Partial<
    Pick<
      Ticket,
      | 'title'
      | 'description'
      | 'status'
      | 'priority'
      | 'type'
      | 'estimate'
      | 'labels'
      | 'assignee'
      | 'assignee_user_id'
      | 'dependency_ticket_id'
      | 'start_date'
      | 'due_date'
      | 'deadline_time'
      | 'rank'
      | 'milestoneId'
      | 'isGroup'
      | 'sprintId'
    >
  >
): Promise<void> {
  const set: Record<string, any> = { updatedAt: new Date().toISOString() };
  const remove: string[] = [];
  if (typeof updates.title !== 'undefined') set.title = updates.title;
  if (typeof updates.description !== 'undefined') set.description = updates.description;
  if (typeof updates.status !== 'undefined') set.status = updates.status;
  if (typeof updates.priority !== 'undefined') set.priority = updates.priority;
  if (typeof updates.type !== 'undefined') set.type = updates.type;
  if (typeof updates.estimate !== 'undefined') set.estimate = updates.estimate;
  if (typeof updates.labels !== 'undefined') set.labels = updates.labels;
  if (typeof updates.assignee !== 'undefined') {
    if (updates.assignee === null) remove.push('assignee');
    else set.assignee = updates.assignee;
  }
  if (typeof updates.assignee_user_id !== 'undefined') {
    if (updates.assignee_user_id === null) remove.push('assigneeUserId');
    else set.assigneeUserId = updates.assignee_user_id;
  }
  if (typeof updates.dependency_ticket_id !== 'undefined') {
    if (updates.dependency_ticket_id === null) remove.push('dependencyTicketId');
    else set.dependencyTicketId = updates.dependency_ticket_id;
  }
  if (typeof updates.start_date !== 'undefined') {
    if (updates.start_date === null) remove.push('startDate');
    else set.startDate = updates.start_date;
  }
  if (typeof updates.due_date !== 'undefined') {
    if (updates.due_date === null) remove.push('dueDate');
    else set.dueDate = updates.due_date;
  }
  if (typeof updates.deadline_time !== 'undefined') {
    if (updates.deadline_time === null) remove.push('deadlineTime');
    else set.deadlineTime = updates.deadline_time;
  }
  if (typeof updates.rank !== 'undefined') set.rank = updates.rank;
  if (typeof updates.milestoneId !== 'undefined') {
    if (updates.milestoneId === null) remove.push('milestoneId');
    else set.milestoneId = updates.milestoneId;
  }
  if (typeof updates.isGroup !== 'undefined') set.isGroup = updates.isGroup;
  if (typeof updates.sprintId !== 'undefined') {
    if (updates.sprintId === null) remove.push('sprintId');
    else set.sprintId = updates.sprintId;
  }
  const op = TicketsEntity.update({ id }).set(set);
  if (remove.length > 0) op.remove(remove);
  await op.go();
}

export async function deleteTicketById(id: string): Promise<void> {
  await TicketsEntity.delete({ id }).go();
}

export async function updateTicketRanks(
  rankUpdates: { id: string; rank: number }[]
): Promise<void> {
  for (const { id, rank } of rankUpdates) {
    await TicketsEntity.update({ id }).set({ rank, updatedAt: new Date().toISOString() }).go();
  }
}

export async function deleteTicketsByMeetingId(meetingId: string): Promise<void> {
  const res = await TicketsEntity.query.byMeeting({ meetingId }).go();
  for (const ticket of res.data ?? []) {
    await TicketsEntity.delete({ id: ticket.id }).go();
  }
}

export async function addTicketsToProject(projectId: string, ticketIds: string[]): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) return;
  const merged = [...new Set([...project.ticketIds, ...ticketIds])];
  await updateProject(projectId, { ticketIds: merged });

  for (const id of ticketIds) {
    await TicketsEntity.update({ id }).set({ projectId }).go();
  }
}

export async function addFilesToProject(projectId: string, files: string[]): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) return;
  const merged = [...new Set([...project.files, ...files])];
  await updateProject(projectId, { files: merged });
}

export async function updateMeetingSpecs2(
  id: string,
  transcript: string,
  specsDetected: number
): Promise<void> {
  await updateMeetingSpecs(id, transcript, specsDetected);
}

// ─── Ticket Dependencies ────────────────────────────────────────

export async function getDependenciesForTicket(ticketId: string): Promise<{
  parents: TicketDependency[];
  children: TicketDependency[];
}> {
  const [parentsRes, childrenRes] = await Promise.all([
    TicketDependenciesEntity.query.byTicket({ ticketId }).go(),
    TicketDependenciesEntity.query.byDependsOn({ dependsOnTicketId: ticketId }).go(),
  ]);
  return {
    parents: (parentsRes.data ?? []).map(entityToTicketDependency),
    children: (childrenRes.data ?? []).map(entityToTicketDependency),
  };
}

export async function getDependenciesForProject(projectId: string): Promise<TicketDependency[]> {
  const res = await TicketDependenciesEntity.query.byProject({ projectId }).go();
  return (res.data ?? []).map(entityToTicketDependency);
}

async function _hasPath(fromId: string, toId: string): Promise<boolean> {
  const visited = new Set<string>();
  const queue: string[] = [fromId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const res = await TicketDependenciesEntity.query.byTicket({ ticketId: current }).go();
    for (const row of res.data ?? []) {
      if (!visited.has(row.dependsOnTicketId)) {
        queue.push(row.dependsOnTicketId);
      }
    }
  }
  return false;
}

export async function createDependency(dep: {
  id: string;
  project_id: string;
  ticket_id: string;
  depends_on_ticket_id: string;
  dependency_type: DependencyType;
  strength: DependencyStrength;
  note?: string | null;
}): Promise<{ error?: string }> {
  if (dep.ticket_id === dep.depends_on_ticket_id) {
    return { error: 'A ticket cannot depend on itself.' };
  }

  const parentTicketRes = await TicketsEntity.get({ id: dep.depends_on_ticket_id }).go();
  if (!parentTicketRes.data) {
    return { error: 'Parent ticket not found.' };
  }
  if (parentTicketRes.data.projectId !== dep.project_id) {
    return { error: 'Cross-project dependencies are not allowed.' };
  }

  const cycleExists = await _hasPath(dep.depends_on_ticket_id, dep.ticket_id);
  if (cycleExists) {
    return {
      error:
        'Cannot add dependency: this would create a circular dependency. The selected ticket already depends on this ticket (directly or indirectly).',
    };
  }

  const existingDeps = await TicketDependenciesEntity.query
    .byTicket({ ticketId: dep.ticket_id })
    .go();
  const existing = (existingDeps.data ?? []).find(
    (d: any) => d.dependsOnTicketId === dep.depends_on_ticket_id
  );
  if (existing) {
    return { error: 'This dependency already exists.' };
  }

  try {
    await TicketDependenciesEntity.create({
      id: dep.id,
      projectId: dep.project_id,
      ticketId: dep.ticket_id,
      dependsOnTicketId: dep.depends_on_ticket_id,
      dependencyType: dep.dependency_type,
      strength: dep.strength,
      note: dep.note ?? null,
      ignoreCount: 0,
      escalated: false,
    }).go();
    return {};
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteDependency(id: string): Promise<void> {
  await TicketDependenciesEntity.delete({ id }).go();
}

export async function incrementDependencyIgnoreCount(id: string): Promise<void> {
  const res = await TicketDependenciesEntity.get({ id }).go();
  if (!res.data) return;

  const newCount = (res.data.ignoreCount ?? 0) + 1;
  const shouldEscalate = res.data.strength === 'soft' && newCount >= 3;
  await TicketDependenciesEntity.update({ id })
    .set({
      ignoreCount: newCount,
      escalated: shouldEscalate || undefined,
      strength: shouldEscalate ? 'hard' : res.data.strength,
      updatedAt: new Date().toISOString(),
    })
    .go();
}

export async function checkHardBlockers(ticketId: string): Promise<{
  blocked: boolean;
  blockers: TicketDependency[];
}> {
  const { parents } = await getDependenciesForTicket(ticketId);
  const hardParents = parents.filter((d) => d.strength === 'hard' || d.escalated);
  if (hardParents.length === 0) return { blocked: false, blockers: [] };

  const parentTickets: { id: string; status: string }[] = [];
  for (const dep of hardParents) {
    const res = await TicketsEntity.get({ id: dep.depends_on_ticket_id }).go();
    if (res.data) parentTickets.push({ id: res.data.id, status: res.data.status });
  }

  const unresolved = hardParents.filter((dep) => {
    const parent = parentTickets.find((t) => t.id === dep.depends_on_ticket_id);
    return parent?.status !== 'done';
  });

  return { blocked: unresolved.length > 0, blockers: unresolved };
}

export async function cascadeDepRegressionForParent(parentId: string): Promise<void> {
  const { children } = await getDependenciesForTicket(parentId);
  if (children.length === 0) return;

  const childTickets: { id: string; status: string }[] = [];
  for (const child of children) {
    const res = await TicketsEntity.get({ id: child.ticket_id }).go();
    if (res.data) childTickets.push({ id: res.data.id, status: res.data.status });
  }

  const toBlock = childTickets
    .filter((t) => t.status === 'done' || t.status === 'in_progress')
    .map((t) => t.id);

  if (toBlock.length === 0) return;

  for (const id of toBlock) {
    await TicketsEntity.update({ id })
      .set({ status: 'blocked', updatedAt: new Date().toISOString() })
      .go();
  }
}

// ─── Attachments ───────────────────────────────────────────────
export async function getAttachmentsForTicket(ticketId: string): Promise<TicketAttachment[]> {
  const res = await TicketAttachmentsEntity.query.byTicket({ ticketId }).go();
  return (res.data ?? [])
    .map((row: any) => ({
      id: row.id,
      ticket_id: row.ticketId,
      project_id: row.projectId,
      user_id: row.userId,
      filename: row.filename,
      file_url: row.fileUrl,
      file_size: row.fileSize,
      file_type: row.fileType,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    }))
    .sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
}

export async function createAttachment(
  attachment: Omit<TicketAttachment, 'id' | 'created_at' | 'updated_at'>
): Promise<TicketAttachment> {
  const id = randomUUID();
  const now = new Date().toISOString();
  await TicketAttachmentsEntity.create({
    id,
    ticketId: attachment.ticket_id,
    projectId: attachment.project_id ?? undefined,
    userId: attachment.user_id,
    filename: attachment.filename,
    fileUrl: attachment.file_url,
    fileSize: attachment.file_size,
    fileType: attachment.file_type ?? undefined,
  }).go();
  return {
    id,
    ticket_id: attachment.ticket_id,
    project_id: attachment.project_id,
    user_id: attachment.user_id,
    filename: attachment.filename,
    file_url: attachment.file_url,
    file_size: attachment.file_size,
    file_type: attachment.file_type,
    created_at: now,
    updated_at: now,
  };
}

export async function deleteAttachment(id: string): Promise<void> {
  await TicketAttachmentsEntity.delete({ id }).go();
}

// ─── Comments ────────────────────────────────────────────────────
export async function getCommentsForTicket(ticketId: string): Promise<TicketComment[]> {
  const res = await TicketCommentsEntity.query.byTicket({ ticketId }).go();
  return (res.data ?? [])
    .map((row: any) => ({
      id: row.id,
      ticket_id: row.ticketId,
      project_id: row.projectId,
      user_id: row.userId,
      content: row.content,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
    }))
    .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));
}

export async function createComment(
  comment: Omit<TicketComment, 'id' | 'created_at' | 'updated_at'>
): Promise<TicketComment> {
  const id = randomUUID();
  const now = new Date().toISOString();
  await TicketCommentsEntity.create({
    id,
    ticketId: comment.ticket_id,
    projectId: comment.project_id ?? undefined,
    userId: comment.user_id,
    content: comment.content,
  }).go();
  return {
    id,
    ticket_id: comment.ticket_id,
    project_id: comment.project_id,
    user_id: comment.user_id,
    content: comment.content,
    created_at: now,
    updated_at: now,
  };
}

export async function deleteComment(id: string): Promise<void> {
  await TicketCommentsEntity.delete({ id }).go();
}

export async function updateComment(id: string, content: string): Promise<TicketComment> {
  const now = new Date().toISOString();
  await TicketCommentsEntity.update({ id }).set({ content, updatedAt: now }).go();
  const res = await TicketCommentsEntity.get({ id }).go();
  if (!res.data) {
    return {
      id,
      ticket_id: '',
      project_id: null,
      user_id: '',
      content,
      created_at: now,
      updated_at: now,
    };
  }
  const data = res.data;
  return {
    id: data.id,
    ticket_id: data.ticketId,
    project_id: data.projectId,
    user_id: data.userId,
    content: data.content,
    created_at: data.createdAt,
    updated_at: now,
  };
}

// ─── Activities ────────────────────────────────────────────────────

export async function getActivitiesForTicket(ticketId: string): Promise<TicketActivity[]> {
  const res = await TicketActivitiesEntity.query.byTicket({ ticketId }).go();
  return (res.data ?? [])
    .map((row: any) => ({
      id: row.id,
      ticket_id: row.ticketId,
      user_id: row.userId,
      action_type: row.actionType,
      metadata: row.metadata ?? {},
      created_at: row.createdAt,
    }))
    .sort((a: any, b: any) => b.created_at.localeCompare(a.created_at));
}

export async function getDeletedActivitiesByProject(projectId: string): Promise<TicketActivity[]> {
  const res = await TicketActivitiesEntity.query
    .byActionType({ actionType: 'deleted' })
    .go({ limit: 100, order: 'desc' });
  return (res.data ?? [])
    .filter((row: any) => row.metadata?.projectId === projectId)
    .map((row: any) => ({
      id: row.id,
      ticket_id: row.ticketId,
      user_id: row.userId,
      action_type: row.actionType,
      metadata: row.metadata ?? {},
      created_at: row.createdAt,
    }));
}

export async function createActivity(
  activity: Omit<TicketActivity, 'id' | 'created_at'>
): Promise<TicketActivity> {
  const id = randomUUID();
  const now = new Date().toISOString();
  await TicketActivitiesEntity.create({
    id,
    ticketId: activity.ticket_id,
    userId: activity.user_id,
    actionType: activity.action_type,
    metadata: activity.metadata || {},
  }).go();
  return {
    id,
    ticket_id: activity.ticket_id,
    user_id: activity.user_id,
    action_type: activity.action_type,
    metadata: activity.metadata || {},
    created_at: now,
  };
}

export async function getTicketsPaginated(
  orgId: string,
  options: {
    projectId?: string | null;
    meetingId?: string | null;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ tickets: Ticket[]; total: number }> {
  const { projectId, meetingId, limit = 50, offset = 0 } = options;
  const fetchLimit = Math.min(offset + limit, 500);

  // Prefer specialized GSIs so we don't load the entire org partition.
  let res: { data?: any[]; cursor?: string | null };
  if (meetingId) {
    res = await TicketsEntity.query.byMeeting({ meetingId }).go({
      limit: fetchLimit,
      order: 'desc',
    });
  } else if (projectId) {
    res = await TicketsEntity.query.byProject({ projectId }).go({
      limit: fetchLimit,
      order: 'desc',
    });
  } else {
    res = await TicketsEntity.query.byOrg({ orgId }).go({
      limit: fetchLimit,
      order: 'desc',
    });
  }

  let tickets = (res.data ?? []).map(entityToTicket);
  if (orgId) tickets = tickets.filter((t: Ticket) => t.org_id === orgId);
  if (projectId && meetingId) {
    tickets = tickets.filter((t: Ticket) => t.projectId === projectId);
  }

  tickets.sort((a: Ticket, b: Ticket) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  const page = tickets.slice(offset, offset + limit);
  // Exact totals require a full partition read; approximate when truncated.
  const total = res.cursor ? offset + page.length + 1 : tickets.length;
  return { tickets: page, total };
}

export async function countTicketsForOrg(orgId: string, cap = 100): Promise<number> {
  let count = 0;
  let cursor: string | null | undefined = undefined;
  do {
    const res: { data?: any[]; cursor?: string | null } = await TicketsEntity.query
      .byOrg({ orgId })
      .go({
        limit: Math.min(50, cap - count + 1),
        cursor: cursor ?? undefined,
        attributes: ['id'],
        order: 'desc',
      });
    count += (res.data ?? []).length;
    cursor = res.cursor;
  } while (cursor && count <= cap);
  return count;
}

// ─── Stale Ticket Detection ────────────────────────────────────
export function isTicketStale(ticket: Ticket, staleDays: number = 7): boolean {
  if (ticket.status === 'done') return false;
  const now = new Date();
  const updatedAt = ticket.updatedAt
    ? new Date(ticket.updatedAt)
    : new Date(ticket.createdAt || now);
  const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate >= staleDays;
}

export async function getStaleTickets(
  orgId: string,
  projectId?: string | null,
  staleDays: number = 7
): Promise<Ticket[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - staleDays);
  const cutoffStr = cutoff.toISOString();

  const res = projectId
    ? await TicketsEntity.query.byProject({ projectId }).go({ limit: 500, order: 'desc' })
    : await TicketsEntity.query.byOrg({ orgId }).go({ limit: 500, order: 'desc' });
  let tickets = (res.data ?? []).map(entityToTicket);
  tickets = tickets.filter((t: Ticket) => t.status !== 'done' && (t.updatedAt ?? '') < cutoffStr);
  if (orgId) tickets = tickets.filter((t: Ticket) => t.org_id === orgId);
  tickets.sort((a: Ticket, b: Ticket) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''));
  return tickets;
}

const MEETING_LIST_ATTRIBUTES = [
  'id',
  'userId',
  'orgId',
  'projectId',
  'projectName',
  'meetingId',
  'meetingUrl',
  'platform',
  'specsDetected',
  'status',
  'botId',
  'branchName',
  'deployUrl',
  'date',
  'createdAt',
  'updatedAt',
] as const;
