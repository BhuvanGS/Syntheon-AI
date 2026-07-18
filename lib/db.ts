import { randomUUID } from 'crypto';
import { broadcast } from '@/lib/event-bus';
import { CURRENT_CONSENT_VERSION } from '@/lib/consent-constants';
import {
  UsersEntity,
  ApiKeysEntity,
  MeetingsEntity,
  SpecsEntity,
  TicketsEntity,
  ProjectsEntity,
  TicketDependenciesEntity,
  TicketAttachmentsEntity,
  TicketCommentsEntity,
  TicketActivitiesEntity,
  IntegrationsEntity,
  ProjectMembersEntity,
  OrganizationMetadataEntity,
  OrganizationInvitesEntity,
  OrganizationAccessRequestsEntity,
  NotificationsEntity,
  LabelsEntity,
  MilestonesEntity,
  SprintsEntity,
  ConsentRecordsEntity,
} from '@/db/entities';

export { CURRENT_CONSENT_VERSION };

// ─── Types ─────────────────────────────────────────────────────
export interface Meeting {
  id: string;
  user_id?: string;
  org_id?: string;
  projectName: string;
  meetingId: string;
  platform: string;
  transcript: string;
  specsDetected: number;
  status: 'completed' | 'processing' | 'failed' | 'not_admitted';
  date: string;
  filePath: string;
  botId?: string;
  branchName?: string;
  deployUrl?: string;
  projectId?: string;
  meeting_url?: string;
  summary?: string;
}

export interface SpecBlock {
  id: string;
  user_id?: string;
  title: string;
  type: 'feature' | 'idea' | 'constraint' | 'improvement';
  confidence: number;
  meeting_id: string;
  timestamp: string;
  note?: string;
  projectId?: string;
  parentSpecId?: string;
}

export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type TicketType = 'bug' | 'task' | 'feature' | 'spike';
export type TicketEstimate = 'quick' | 'standard' | 'deep' | 'epic' | 'none';

export interface Ticket {
  id: string;
  user_id?: string;
  org_id?: string;
  meeting_id: string | null;
  projectId?: string;
  parent_id?: string | null;
  title: string;
  description: string;
  status: string;
  priority?: TicketPriority;
  type?: TicketType;
  estimate?: TicketEstimate;
  labels?: string[];
  assignee?: string | null;
  assignee_user_id?: string | null;
  dependency_ticket_id?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  deadline_time?: string | null;
  rank?: number | null;
  milestoneId?: string | null;
  isGroup?: boolean;
  sprintId?: string | null;
  timeEstimate?: number | null;
  timeSpent?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  user_id?: string;
  org_id?: string;
  name: string;
  repo: string;
  deployUrl?: string;
  branchBase: string;
  agentTier?: string;
  meetings: string[];
  ticketIds: string[];
  files: string[];
  context: string;
  leadUserId?: string | null;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  project_id?: string | null;
  user_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  file_type?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  project_id?: string | null;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ─── Mappers ───────────────────────────────────────────────────
function entityToMeeting(e: any): Meeting {
  return {
    id: e.id,
    user_id: e.userId ?? undefined,
    org_id: e.orgId ?? undefined,
    projectName: e.projectName,
    meetingId: e.meetingId,
    platform: e.platform,
    transcript: e.transcript ?? '',
    specsDetected: e.specsDetected ?? 0,
    status: e.status as Meeting['status'],
    date: e.date,
    filePath: e.filePath ?? '',
    botId: e.botId ?? undefined,
    branchName: e.branchName ?? undefined,
    deployUrl: e.deployUrl ?? undefined,
    projectId: e.projectId ?? undefined,
    meeting_url: e.meetingUrl ?? undefined,
    summary: e.summary ?? undefined,
  };
}

/** List DTO — excludes heavy transcript/file/summary payloads. */
function entityToMeetingSummary(e: any): Meeting {
  return {
    ...entityToMeeting(e),
    transcript: '',
    filePath: '',
    summary: undefined,
  };
}

function entityToTicket(e: any): Ticket {
  return {
    id: e.id,
    user_id: e.userId ?? undefined,
    org_id: e.orgId ?? undefined,
    meeting_id: e.meetingId ?? null,
    projectId: e.projectId ?? undefined,
    parent_id: e.parentId ?? null,
    title: e.title,
    description: e.description ?? '',
    status: e.status as Ticket['status'],
    priority: (e.priority ?? 'none') as TicketPriority,
    type: (e.type ?? 'task') as TicketType,
    estimate: (e.estimate ?? 'none') as TicketEstimate,
    labels: e.labels ?? [],
    assignee: e.assignee ?? null,
    assignee_user_id: e.assigneeUserId ?? null,
    dependency_ticket_id: e.dependencyTicketId ?? null,
    start_date: e.startDate ?? null,
    due_date: e.dueDate ?? null,
    deadline_time: e.deadlineTime ?? null,
    rank: e.rank ?? null,
    milestoneId: e.milestoneId ?? null,
    isGroup: e.isGroup ?? false,
    sprintId: e.sprintId ?? null,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

function entityToSpec(e: any): SpecBlock {
  return {
    id: e.id,
    user_id: e.userId ?? undefined,
    title: e.title,
    type: e.type as SpecBlock['type'],
    confidence: e.confidence,
    meeting_id: e.meetingId,
    timestamp: e.timestamp,
    note: e.note ?? undefined,
    projectId: e.projectId ?? undefined,
    parentSpecId: e.parentSpecId ?? undefined,
  };
}

function entityToProject(e: any): Project {
  return {
    id: e.id,
    user_id: e.userId ?? undefined,
    org_id: e.orgId ?? undefined,
    name: e.name,
    repo: e.repo,
    deployUrl: e.deployUrl ?? undefined,
    branchBase: e.branchBase ?? 'main',
    agentTier: e.agentTier ?? undefined,
    meetings: e.meetings ?? [],
    ticketIds: e.ticketIds ?? [],
    files: e.files ?? [],
    context: e.context ?? '',
    leadUserId: e.leadUserId ?? null,
    status: e.status ?? 'on_track',
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

function entityToTicketDependency(e: any): TicketDependency {
  return {
    id: e.id,
    project_id: e.projectId,
    ticket_id: e.ticketId,
    depends_on_ticket_id: e.dependsOnTicketId,
    dependency_type: e.dependencyType as DependencyType,
    strength: e.strength as DependencyStrength,
    note: e.note ?? null,
    ignore_count: e.ignoreCount ?? 0,
    escalated: e.escalated ?? false,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

function entityToNotification(e: any): Notification {
  return {
    id: e.id,
    user_id: e.userId,
    org_id: e.orgId,
    type: e.type as Notification['type'],
    title: e.title,
    message: e.message ?? undefined,
    ticket_id: e.ticketId ?? undefined,
    read: e.read ?? false,
    created_at: e.createdAt,
  };
}

function entityToProjectMember(e: any): ProjectMember {
  return {
    id: e.id,
    project_id: e.projectId,
    org_id: e.orgId,
    user_id: e.userId,
    role: e.role as 'admin' | 'manager' | 'member',
    created_at: e.createdAt,
  };
}

// ─── Meetings ───────────────────────────────────────────────────
export async function saveMeeting(meeting: Meeting): Promise<void> {
  await MeetingsEntity.create({
    id: meeting.id,
    userId: meeting.user_id ?? undefined,
    orgId: meeting.org_id ?? undefined,
    projectId: meeting.projectId ?? undefined,
    projectName: meeting.projectName,
    meetingId: meeting.meetingId,
    meetingUrl: meeting.meeting_url ?? undefined,
    platform: meeting.platform,
    transcript: meeting.transcript ?? '',
    specsDetected: meeting.specsDetected,
    status: meeting.status,
    botId: meeting.botId ?? undefined,
    branchName: meeting.branchName ?? undefined,
    deployUrl: meeting.deployUrl ?? undefined,
    filePath: meeting.filePath ?? '',
    date: meeting.date,
  }).go();
}

export async function getMeetings(userId: string): Promise<Meeting[]> {
  const res = await MeetingsEntity.query.byUser({ userId }).go({
    attributes: [
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
    ],
  });
  return (res.data ?? [])
    .map(entityToMeetingSummary)
    .sort((a: Meeting, b: Meeting) => b.date.localeCompare(a.date));
}

export async function getMeetingById(id: string): Promise<Meeting | undefined> {
  const res = await MeetingsEntity.get({ id }).go();
  return res.data ? entityToMeeting(res.data) : undefined;
}

export async function getMeetingByBotId(botId: string): Promise<Meeting | undefined> {
  const res = await MeetingsEntity.query.byBot({ botId }).go();
  return res.data?.[0] ? entityToMeeting(res.data[0]) : undefined;
}

export async function updateMeetingStatus(id: string, status: Meeting['status']): Promise<void> {
  await MeetingsEntity.update({ id }).set({ status, updatedAt: new Date().toISOString() }).go();
  broadcast({ type: 'meeting_status_changed', payload: { meetingId: id, status } });
}

export async function updateMeetingSpecs(
  id: string,
  transcript: string,
  specsDetected: number
): Promise<void> {
  await MeetingsEntity.update({ id })
    .set({ transcript, specsDetected, status: 'completed', updatedAt: new Date().toISOString() })
    .go();
}

export async function updateMeetingBranch(id: string, branchName: string): Promise<void> {
  await MeetingsEntity.update({ id }).set({ branchName, updatedAt: new Date().toISOString() }).go();
}

export async function updateMeetingDeployUrl(id: string, deployUrl: string): Promise<void> {
  await MeetingsEntity.update({ id }).set({ deployUrl, updatedAt: new Date().toISOString() }).go();
}

export async function updateMeetingName(id: string, projectName: string): Promise<void> {
  await MeetingsEntity.update({ id })
    .set({ projectName, updatedAt: new Date().toISOString() })
    .go();
}

export async function updateMeetingSummary(id: string, summary: string): Promise<void> {
  await MeetingsEntity.update({ id }).set({ summary, updatedAt: new Date().toISOString() }).go();
}

export async function deleteMeeting(id: string): Promise<void> {
  await MeetingsEntity.delete({ id }).go();
}

export async function getActiveMeetingByUrl(meetingUrl: string, userId: string) {
  try {
    const res = await MeetingsEntity.query.byUser({ userId }).go();
    const found = (res.data ?? []).find(
      (m: any) => m.meetingUrl === meetingUrl && m.status === 'processing'
    );
    return found ?? null;
  } catch (error) {
    console.error('Error fetching active meeting:', error);
    return null;
  }
}

export async function getRecentMeetingByUrl(meetingUrl: string, userId: string) {
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
  try {
    const res = await MeetingsEntity.query.byUser({ userId }).go();
    const found = (res.data ?? []).find(
      (m: any) => m.meetingUrl === meetingUrl && m.date >= fiveSecondsAgo
    );
    return found ?? null;
  } catch (error) {
    console.error('Error checking recent meeting:', error);
    return null;
  }
}

// ─── Specs ──────────────────────────────────────────────────────
export async function saveSpecs(specsList: SpecBlock[]): Promise<void> {
  if (specsList.length === 0) return;
  for (const s of specsList) {
    await SpecsEntity.create({
      id: s.id,
      userId: s.user_id ?? undefined,
      meetingId: s.meeting_id,
      projectId: s.projectId ?? undefined,
      title: s.title,
      type: s.type,
      confidence: s.confidence,
      note: s.note ?? undefined,
      timestamp: s.timestamp,
    }).go();
  }
}

export async function getSpecsByMeetingId(meetingId: string): Promise<SpecBlock[]> {
  const res = await SpecsEntity.query.byMeeting({ meetingId }).go();
  return (res.data ?? []).map(entityToSpec);
}

export async function getSpecsByProjectId(projectId: string): Promise<SpecBlock[]> {
  const res = await SpecsEntity.query.byProject({ projectId }).go();
  return (res.data ?? []).map(entityToSpec);
}

export async function getAllSpecs(userId: string): Promise<SpecBlock[]> {
  const res = await SpecsEntity.query.byUser({ userId }).go();
  return (res.data ?? [])
    .map(entityToSpec)
    .sort((a: SpecBlock, b: SpecBlock) => b.timestamp.localeCompare(a.timestamp));
}

export async function updateSpecNote(specId: string, note: string): Promise<void> {
  await SpecsEntity.update({ id: specId }).set({ note, updatedAt: new Date().toISOString() }).go();
}

export async function deleteSpecsByMeetingId(meetingId: string): Promise<void> {
  const res = await SpecsEntity.query.byMeeting({ meetingId }).go();
  for (const spec of res.data ?? []) {
    await SpecsEntity.delete({ id: spec.id }).go();
  }
}

// ─── Projects ───────────────────────────────────────────────────
export async function saveProject(project: Project): Promise<void> {
  await ProjectsEntity.create({
    id: project.id,
    userId: project.user_id ?? undefined,
    orgId: project.org_id ?? undefined,
    name: project.name,
    repo: project.repo,
    deployUrl: project.deployUrl ?? undefined,
    branchBase: project.branchBase,
    agentTier: project.agentTier ?? 'standard',
    meetings: project.meetings,
    ticketIds: project.ticketIds,
    files: project.files,
    context: project.context,
  }).go();
}

export async function getProjects(userId: string): Promise<Project[]> {
  const res = await ProjectsEntity.query.byUser({ userId }).go();
  return (res.data ?? [])
    .map(entityToProject)
    .sort((a: Project, b: Project) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const res = await ProjectsEntity.get({ id }).go();
  return res.data ? entityToProject(res.data) : undefined;
}

export async function getProjectByMeetingId(meetingId: string): Promise<Project | undefined> {
  const meeting = await getMeetingById(meetingId);
  if (!meeting?.projectId) return undefined;
  return getProjectById(meeting.projectId);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const set: Record<string, any> = { updatedAt: new Date().toISOString() };
  if (updates.name) set.name = updates.name;
  if (updates.deployUrl) set.deployUrl = updates.deployUrl;
  if (updates.agentTier) set.agentTier = updates.agentTier;
  if (updates.context) set.context = updates.context;
  if (updates.files) set.files = updates.files;
  if (updates.ticketIds) set.ticketIds = updates.ticketIds;
  if (updates.meetings) set.meetings = updates.meetings;
  if (updates.leadUserId !== undefined) set.leadUserId = updates.leadUserId ?? undefined;
  if (updates.status) set.status = updates.status;
  await ProjectsEntity.update({ id }).set(set).go();
}

export async function updateProjectLead(id: string, leadUserId: string | null): Promise<void> {
  await ProjectsEntity.update({ id })
    .set({ leadUserId: leadUserId ?? undefined, updatedAt: new Date().toISOString() })
    .go();
}

export async function updateProjectStatus(id: string, status: string): Promise<void> {
  await ProjectsEntity.update({ id }).set({ status, updatedAt: new Date().toISOString() }).go();
}

export async function addMeetingToProject(projectId: string, meetingId: string): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) return;
  const meetingsList = [...new Set([...project.meetings, meetingId])];
  await updateProject(projectId, { meetings: meetingsList });
}

export async function deleteProject(id: string): Promise<void> {
  // Delete ticket dependencies for this project
  const deps = await TicketDependenciesEntity.query.byProject({ projectId: id }).go();
  for (const dep of deps.data ?? []) {
    await TicketDependenciesEntity.delete({ id: dep.id }).go();
  }

  // Delete tickets belonging to this project
  const tickets = await TicketsEntity.query.byProject({ projectId: id }).go();
  for (const ticket of tickets.data ?? []) {
    await TicketsEntity.delete({ id: ticket.id }).go();
  }

  // Unlink meetings belonging to this project (GSI + org fallback for pre-GSI rows)
  let projectMeetings =
    (await MeetingsEntity.query.byProject({ projectId: id }).go({ limit: 500 })).data ?? [];
  if (projectMeetings.length === 0) {
    const project = await getProjectById(id);
    if (project?.org_id) {
      const orgMeetings = await MeetingsEntity.query.byOrg({ orgId: project.org_id }).go({
        limit: 500,
        attributes: ['id', 'projectId'],
      });
      projectMeetings = (orgMeetings.data ?? []).filter((m: any) => m.projectId === id);
    }
  }
  for (const meeting of projectMeetings) {
    await MeetingsEntity.update({ id: meeting.id }).remove(['projectId']).go();
  }

  // Delete project
  await ProjectsEntity.delete({ id }).go();
}

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
export type DependencyType = 'data' | 'structural' | 'logical' | 'resource';
export type DependencyStrength = 'soft' | 'hard';

export interface TicketDependency {
  id: string;
  project_id: string;
  ticket_id: string;
  depends_on_ticket_id: string;
  dependency_type: DependencyType;
  strength: DependencyStrength;
  note?: string | null;
  ignore_count: number;
  escalated: boolean;
  created_at: string;
  updated_at: string;
}

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
export interface TicketActivity {
  id: string;
  ticket_id: string;
  user_id: string;
  action_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

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

// ─── Legacy compatibility ──────────────────────────────────────
export function loadDB() {
  throw new Error('loadDB is deprecated — use async DynamoDB functions');
}

export function saveDB() {
  throw new Error('saveDB is deprecated — use async DynamoDB functions');
}

// ─── Org-scoped functions ───────────────────────────────────────
export async function getProjectsByOrg(orgId: string): Promise<Project[]> {
  const res = await ProjectsEntity.query.byOrg({ orgId }).go();
  return (res.data ?? [])
    .map(entityToProject)
    .sort((a: Project, b: Project) => b.createdAt.localeCompare(a.createdAt));
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

export async function getMeetingsPaginated(
  orgId: string,
  options: { projectId?: string | null; limit?: number; offset?: number } = {}
): Promise<{ meetings: Meeting[]; total: number }> {
  const { projectId, limit = 50, offset = 0 } = options;
  const fetchLimit = Math.min(offset + limit, 500);

  const res = projectId
    ? await MeetingsEntity.query.byProject({ projectId }).go({
        limit: fetchLimit,
        order: 'desc',
        attributes: [...MEETING_LIST_ATTRIBUTES],
      })
    : await MeetingsEntity.query.byOrg({ orgId }).go({
        limit: fetchLimit,
        order: 'desc',
        attributes: [...MEETING_LIST_ATTRIBUTES],
      });

  let meetings = (res.data ?? []).map(entityToMeetingSummary);
  if (orgId) meetings = meetings.filter((m: Meeting) => m.org_id === orgId);
  meetings.sort((a: Meeting, b: Meeting) => b.date.localeCompare(a.date));
  const page = meetings.slice(offset, offset + limit);
  const total = res.cursor ? offset + page.length + 1 : meetings.length;
  return { meetings: page, total };
}

/** Count org meetings on/after `sinceIso` without loading transcripts. Stops early at `cap`. */
export async function countMeetingsSince(
  orgId: string,
  sinceIso: string,
  cap = 100
): Promise<number> {
  let count = 0;
  let cursor: string | null | undefined = undefined;
  do {
    const res: { data?: any[]; cursor?: string | null } = await MeetingsEntity.query
      .byOrg({ orgId })
      .gte({ date: sinceIso })
      .go({
        limit: Math.min(50, cap - count + 1),
        cursor: cursor ?? undefined,
        attributes: ['id', 'date'],
        order: 'asc',
      });
    count += (res.data ?? []).length;
    cursor = res.cursor;
  } while (cursor && count <= cap);
  return count;
}

/** Count org tickets up to `cap` without loading full partition when possible. */
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

export async function saveProjectForOrg(project: Project & { org_id: string }): Promise<void> {
  await ProjectsEntity.create({
    id: project.id,
    userId: project.user_id ?? undefined,
    orgId: project.org_id,
    name: project.name,
    repo: project.repo ?? '',
    deployUrl: project.deployUrl ?? undefined,
    branchBase: project.branchBase ?? '',
    agentTier: project.agentTier ?? 'standard',
    meetings: project.meetings ?? [],
    ticketIds: project.ticketIds ?? [],
    files: project.files ?? [],
    context: project.context ?? '',
  }).go();
}

export async function saveMeetingForOrg(meeting: Meeting & { org_id: string }): Promise<void> {
  await MeetingsEntity.create({
    id: meeting.id,
    userId: meeting.user_id ?? undefined,
    orgId: meeting.org_id,
    projectId: meeting.projectId ?? undefined,
    projectName: meeting.projectName,
    meetingId: meeting.meetingId,
    meetingUrl: meeting.meeting_url ?? undefined,
    platform: meeting.platform,
    transcript: meeting.transcript ?? '',
    specsDetected: meeting.specsDetected,
    status: meeting.status,
    botId: meeting.botId ?? undefined,
    branchName: meeting.branchName ?? undefined,
    deployUrl: meeting.deployUrl ?? undefined,
    filePath: meeting.filePath ?? '',
    date: meeting.date,
  }).go();
}

// ─── Project Members ────────────────────────────────────────────
export interface ProjectMember {
  id: string;
  project_id: string;
  org_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'member';
  created_at: string;
}

export async function addProjectMember(
  projectId: string,
  orgId: string,
  userId: string,
  role: 'admin' | 'manager' | 'member' = 'member'
): Promise<void> {
  const existing = await ProjectMembersEntity.get({ projectId, userId }).go();
  if (existing.data) {
    await ProjectMembersEntity.update({ projectId, userId }).set({ role }).go();
  } else {
    await ProjectMembersEntity.create({
      id: randomUUID(),
      projectId,
      orgId,
      userId,
      role,
    }).go();
  }
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  await ProjectMembersEntity.delete({ projectId, userId }).go();
}

export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: 'admin' | 'manager' | 'member'
): Promise<void> {
  await ProjectMembersEntity.update({ projectId, userId }).set({ role }).go();
}

export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const res = await ProjectMembersEntity.query.primary({ projectId }).go();
  return (res.data ?? [])
    .map(entityToProjectMember)
    .sort((a: ProjectMember, b: ProjectMember) => a.created_at.localeCompare(b.created_at));
}

export async function getProjectsForMember(orgId: string, userId: string): Promise<Project[]> {
  const memberRes = await ProjectMembersEntity.query.byOrgUser({ orgId }).go();
  const memberRows = (memberRes.data ?? []).filter((m: any) => m.userId === userId);
  const memberProjectIds = memberRows.map((m: any) => m.projectId);

  const projectsRes = await ProjectsEntity.query.byOrg({ orgId }).go();
  const rows = (projectsRes.data ?? []).filter(
    (p: any) => p.userId === userId || memberProjectIds.includes(p.id)
  );
  return rows
    .map(entityToProject)
    .sort((a: Project, b: Project) => b.createdAt.localeCompare(a.createdAt));
}

export async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const res = await ProjectMembersEntity.get({ projectId, userId }).go();
  return !!res.data;
}

// ─── Notifications ──────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  org_id: string;
  type: 'assigned' | 'mentioned' | 'blocked' | 'due_soon' | 'meeting_ready' | 'meeting_failed';
  title: string;
  message?: string;
  ticket_id?: string;
  read: boolean;
  created_at: string;
}

export async function createNotification(
  values: Omit<Notification, 'id' | 'created_at' | 'read'>
): Promise<Notification> {
  const id = randomUUID();
  const now = new Date().toISOString();
  await NotificationsEntity.create({
    id,
    userId: values.user_id,
    orgId: values.org_id,
    type: values.type,
    title: values.title,
    message: values.message,
    ticketId: values.ticket_id,
    read: false,
    createdAt: now,
  }).go();
  const notification: Notification = {
    id,
    user_id: values.user_id,
    org_id: values.org_id,
    type: values.type as Notification['type'],
    title: values.title,
    message: values.message ?? undefined,
    ticket_id: values.ticket_id ?? undefined,
    read: false,
    created_at: now,
  };
  broadcast({
    type: 'notification_new',
    payload: {
      userId: values.user_id,
      type: values.type,
      title: values.title,
      message: values.message,
      ticketId: values.ticket_id ?? null,
    },
  });
  return notification;
}

export async function getNotificationsForUser(
  userId: string,
  orgId: string,
  limit = 20
): Promise<Notification[]> {
  const res = await NotificationsEntity.query.primary({ userId }).go();
  const all = (res.data ?? []).map(entityToNotification);
  const filtered = all.filter((n: Notification) => n.org_id === orgId);
  filtered.sort((a: Notification, b: Notification) => b.created_at.localeCompare(a.created_at));
  return filtered.slice(0, limit);
}

export async function getUnreadNotificationCount(userId: string, orgId: string): Promise<number> {
  const res = await NotificationsEntity.query.primary({ userId }).go();
  const all = (res.data ?? []).map(entityToNotification);
  return all.filter((n: Notification) => n.org_id === orgId && !n.read).length;
}

export async function markNotificationAsRead(id: string, userId?: string): Promise<void> {
  // Prefer byId GSI; fall back to user partition when userId is known.
  const byId = await NotificationsEntity.query.byId({ id }).go({ limit: 1 });
  let notif = byId.data?.[0];

  if (!notif && userId) {
    const res = await NotificationsEntity.query.primary({ userId }).go();
    notif = (res.data ?? []).find((n: any) => n.id === id);
  }

  if (!notif) return;
  await NotificationsEntity.update({
    userId: notif.userId,
    orgId: notif.orgId,
    createdAt: notif.createdAt,
  })
    .set({ read: true })
    .go();
}

export async function markAllNotificationsAsRead(userId: string, orgId: string): Promise<void> {
  const res = await NotificationsEntity.query.primary({ userId }).go();
  const unread = (res.data ?? []).filter((n: any) => n.orgId === orgId && !n.read);
  for (const n of unread) {
    await NotificationsEntity.update({ userId: n.userId, orgId: n.orgId, createdAt: n.createdAt })
      .set({ read: true })
      .go();
  }
}

// Notification Helpers
export async function notifyTicketAssigned(
  ticketId: string,
  ticketTitle: string,
  assigneeUserId: string,
  orgId: string
): Promise<void> {
  await createNotification({
    user_id: assigneeUserId,
    org_id: orgId,
    type: 'assigned',
    title: 'New ticket assigned',
    message: ticketTitle,
    ticket_id: ticketId,
  });
}

export async function notifyTicketStatusChanged(
  ticketId: string,
  ticketTitle: string,
  ownerId: string,
  orgId: string,
  newStatus: string
): Promise<void> {
  if (!ownerId || ownerId === 'system') return;
  await createNotification({
    user_id: ownerId,
    org_id: orgId,
    type: 'assigned',
    title: 'Ticket status updated',
    message: `"${ticketTitle}" moved to ${newStatus.replace('_', ' ')}`,
    ticket_id: ticketId,
  });
}

export async function notifyMentioned(
  ticketId: string,
  ticketTitle: string,
  mentionedUserId: string,
  orgId: string
): Promise<void> {
  await createNotification({
    user_id: mentionedUserId,
    org_id: orgId,
    type: 'mentioned',
    title: 'You were mentioned',
    message: `in "${ticketTitle}"`,
    ticket_id: ticketId,
  });
}

export async function notifyTicketDueSoon(
  ticketId: string,
  ticketTitle: string,
  assigneeUserId: string,
  orgId: string,
  dueDate: string
): Promise<void> {
  await createNotification({
    user_id: assigneeUserId,
    org_id: orgId,
    type: 'due_soon',
    title: 'Ticket due soon',
    message: `"${ticketTitle}" due ${dueDate}`,
    ticket_id: ticketId,
  });
}

export async function notifyMeetingReady(
  meetingId: string,
  projectName: string,
  userId: string,
  orgId: string
): Promise<void> {
  await createNotification({
    user_id: userId,
    org_id: orgId,
    type: 'meeting_ready',
    title: 'Meeting ready',
    message: `"${projectName}" meeting transcript is ready`,
    ticket_id: undefined,
  });
}

// Extract @mentions from comment content
export function extractMentions(content: string): string[] {
  const mentions: string[] = [];
  const richMentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = richMentionRegex.exec(content)) !== null) {
    mentions.push(match[2]);
  }
  const plainMentionRegex = /@([a-zA-Z0-9_-]+)/g;
  while ((match = plainMentionRegex.exec(content)) !== null) {
    const userId = match[1];
    if (!mentions.includes(userId) && userId.length > 10) {
      mentions.push(userId);
    }
  }
  return [...new Set(mentions)];
}

// ─── Labels ──────────────────────────────────────────────────────
export interface Label {
  id: string;
  org_id: string;
  name: string;
  color: string;
  created_at: string;
}

function entityToLabel(e: any): Label {
  return {
    id: e.id,
    org_id: e.orgId,
    name: e.name,
    color: e.color ?? '#6b7280',
    created_at: e.createdAt,
  };
}

export async function getLabelsByOrg(orgId: string): Promise<Label[]> {
  const res = await LabelsEntity.query.byOrg({ orgId }).go();
  return (res.data ?? []).map(entityToLabel);
}

export async function createLabel(
  id: string,
  orgId: string,
  name: string,
  color: string
): Promise<Label> {
  await LabelsEntity.create({ id, orgId, name, color }).go();
  return { id, org_id: orgId, name, color, created_at: new Date().toISOString() };
}

export async function deleteLabel(id: string): Promise<void> {
  await LabelsEntity.delete({ id }).go();
}

export async function updateLabel(
  id: string,
  updates: { name?: string; color?: string }
): Promise<void> {
  const set: Record<string, any> = {};
  if (typeof updates.name !== 'undefined') set.name = updates.name;
  if (typeof updates.color !== 'undefined') set.color = updates.color;
  await LabelsEntity.update({ id }).set(set).go();
}

// ─── Milestones ──────────────────────────────────────────────────
export interface Milestone {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  description: string;
  due_date?: string | null;
  status: 'planned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

function entityToMilestone(e: any): Milestone {
  return {
    id: e.id,
    org_id: e.orgId,
    project_id: e.projectId,
    name: e.name,
    description: e.description ?? '',
    due_date: e.dueDate ?? null,
    status: (e.status ?? 'planned') as 'planned' | 'in_progress' | 'completed',
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

export async function getMilestonesByProject(projectId: string): Promise<Milestone[]> {
  const res = await MilestonesEntity.query.byProject({ projectId }).go();
  return (res.data ?? []).map(entityToMilestone);
}

export async function createMilestone(
  id: string,
  orgId: string,
  projectId: string,
  name: string,
  description?: string,
  dueDate?: string
): Promise<Milestone> {
  await MilestonesEntity.create({
    id,
    orgId,
    projectId,
    name,
    description: description ?? '',
    dueDate: dueDate ?? undefined,
    status: 'planned',
  }).go();
  return {
    id,
    org_id: orgId,
    project_id: projectId,
    name,
    description: description ?? '',
    due_date: dueDate ?? null,
    status: 'planned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateMilestone(
  id: string,
  updates: { name?: string; description?: string; dueDate?: string | null; status?: string }
): Promise<void> {
  const set: Record<string, any> = { updatedAt: new Date().toISOString() };
  if (typeof updates.name !== 'undefined') set.name = updates.name;
  if (typeof updates.description !== 'undefined') set.description = updates.description;
  if (typeof updates.dueDate !== 'undefined') set.dueDate = updates.dueDate ?? undefined;
  if (typeof updates.status !== 'undefined') set.status = updates.status;
  await MilestonesEntity.update({ id }).set(set).go();
}

export async function deleteMilestone(id: string): Promise<void> {
  await MilestonesEntity.delete({ id }).go();
}

// ─── Sprints ──────────────────────────────────────────────────────

export interface Sprint {
  id: string;
  org_id: string;
  project_id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
  review?: string | null;
  created_at: string;
  updated_at: string;
}

function entityToSprint(e: any): Sprint {
  return {
    id: e.id,
    org_id: e.orgId,
    project_id: e.projectId,
    name: e.name,
    goal: e.goal ?? '',
    start_date: e.startDate,
    end_date: e.endDate,
    status: e.status ?? 'planning',
    review: e.review ?? null,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

export async function getSprintsByProject(projectId: string): Promise<Sprint[]> {
  const result = await SprintsEntity.query.byProject({ projectId }).go();
  if (!result.data) return [];
  return result.data.map(entityToSprint);
}

export async function createSprint(
  id: string,
  orgId: string,
  projectId: string,
  name: string,
  startDate: string,
  endDate: string,
  goal?: string
): Promise<Sprint> {
  await SprintsEntity.create({
    id,
    orgId,
    projectId,
    name,
    goal: goal ?? '',
    startDate,
    endDate,
    status: 'planning',
  }).go();
  return {
    id,
    org_id: orgId,
    project_id: projectId,
    name,
    goal: goal ?? '',
    start_date: startDate,
    end_date: endDate,
    status: 'planning',
    review: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateSprint(
  id: string,
  updates: {
    name?: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    review?: string;
  }
): Promise<void> {
  const set: Record<string, any> = { updatedAt: new Date().toISOString() };
  if (typeof updates.name !== 'undefined') set.name = updates.name;
  if (typeof updates.goal !== 'undefined') set.goal = updates.goal;
  if (typeof updates.startDate !== 'undefined') set.startDate = updates.startDate;
  if (typeof updates.endDate !== 'undefined') set.endDate = updates.endDate;
  if (typeof updates.status !== 'undefined') set.status = updates.status;
  if (typeof updates.review !== 'undefined') set.review = updates.review;
  await SprintsEntity.update({ id }).set(set).go();
}

export async function deleteSprint(id: string): Promise<void> {
  await SprintsEntity.delete({ id }).go();
}

// ─── Consent / terms acceptance records ────────────────────────────
export interface ConsentRecord {
  id: string;
  userId: string;
  consentVersion: string;
  purposes: string[];
  ipAddress?: string;
  deviceId?: string;
  userAgent?: string;
  givenAt: string;
  withdrawnAt?: string;
  status: 'active' | 'withdrawn';
}

export async function recordConsent(input: {
  userId: string;
  consentVersion?: string;
  purposes: string[];
  ipAddress?: string;
  deviceId?: string;
  userAgent?: string;
}): Promise<ConsentRecord> {
  const id = randomUUID();
  const now = new Date().toISOString();
  await ConsentRecordsEntity.create({
    id,
    userId: input.userId,
    consentVersion: input.consentVersion ?? CURRENT_CONSENT_VERSION,
    purposes: input.purposes,
    ipAddress: input.ipAddress ?? 'unknown',
    deviceId: input.deviceId ?? 'unknown',
    userAgent: input.userAgent ?? 'unknown',
    givenAt: now,
    status: 'active',
  }).go();
  return {
    id,
    userId: input.userId,
    consentVersion: input.consentVersion ?? CURRENT_CONSENT_VERSION,
    purposes: input.purposes,
    ipAddress: input.ipAddress,
    deviceId: input.deviceId,
    userAgent: input.userAgent,
    givenAt: now,
    status: 'active',
  };
}

export async function getActiveConsentByUser(userId: string): Promise<ConsentRecord | null> {
  const res = await ConsentRecordsEntity.query.byUser({ userId }).go({ limit: 1, order: 'desc' });
  const row = res.data?.[0];
  if (!row || row.status === 'withdrawn') return null;
  return {
    id: row.id,
    userId: row.userId,
    consentVersion: row.consentVersion,
    purposes: row.purposes ?? [],
    ipAddress: row.ipAddress,
    deviceId: row.deviceId,
    userAgent: row.userAgent,
    givenAt: row.givenAt,
    withdrawnAt: row.withdrawnAt,
    status: row.status,
  };
}

export async function hasValidConsent(userId: string): Promise<boolean> {
  const record = await getActiveConsentByUser(userId);
  // Any active acceptance counts — terms-on-login stamps `terms-v1`;
  // older DPDP rows remain valid so users aren't gated after removing the form.
  return !!record && record.status === 'active';
}

export async function withdrawConsent(userId: string): Promise<void> {
  const res = await ConsentRecordsEntity.query.byUser({ userId }).go({ limit: 1, order: 'desc' });
  const row = res.data?.[0];
  if (row && row.status === 'active') {
    await ConsentRecordsEntity.update({ id: row.id })
      .set({ status: 'withdrawn', withdrawnAt: new Date().toISOString() })
      .go();
  }
}
