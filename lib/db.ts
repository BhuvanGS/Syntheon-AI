// lib/db.ts
import { supabaseAdmin } from './supabase';

// ─── Types ─────────────────────────────────────────────────────
export interface Meeting {
  id: string;
  user_id?: string;
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

export interface Ticket {
  id: string;
  user_id?: string;
  meeting_id: string | null;
  projectId?: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'done' | 'blocked';
  assignee?: string | null;
  assignee_user_id?: string | null;
  dependency_ticket_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  user_id?: string;
  name: string;
  repo: string;
  deployUrl?: string;
  branchBase: string;
  meetings: string[];
  ticketIds: string[];
  files: string[];
  context: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helper — map Supabase row to Meeting ──────────────────────
function rowToMeeting(row: any): Meeting {
  return {
    id: row.id,
    user_id: row.user_id,
    projectName: row.project_name,
    meetingId: row.meeting_id,
    platform: row.platform,
    transcript: row.transcript ?? '',
    specsDetected: row.specs_detected,
    status: row.status,
    date: row.date,
    filePath: row.file_path ?? '',
    botId: row.bot_id,
    branchName: row.branch_name,
    deployUrl: row.deploy_url,
    projectId: row.project_id,
  };
}

function rowToTicket(row: any): Ticket {
  return {
    id: row.id,
    user_id: row.user_id,
    meeting_id: row.meeting_id ?? null,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    assignee: row.assignee ?? null,
    assignee_user_id: row.assignee_user_id ?? null,
    dependency_ticket_id: row.dependency_ticket_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToSpec(row: any): SpecBlock {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    type: row.type,
    confidence: row.confidence,
    meeting_id: row.meeting_id,
    timestamp: row.timestamp,
    note: row.note,
    projectId: row.project_id,
  };
}

function rowToProject(row: any): Project {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    repo: row.repo,
    deployUrl: row.deploy_url,
    branchBase: row.branch_base,
    meetings: row.meetings ?? [],
    ticketIds: row.spec_ids ?? [],
    files: row.files ?? [],
    context: row.context ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Meetings ───────────────────────────────────────────────────
export async function saveMeeting(meeting: Meeting): Promise<void> {
  const { error } = await supabaseAdmin.from('meetings').insert({
    id: meeting.id,
    user_id: meeting.user_id,
    project_id: meeting.projectId ?? null,
    project_name: meeting.projectName,
    meeting_id: meeting.meetingId,
    meeting_url: meeting.meeting_url ?? null,
    platform: meeting.platform,
    transcript: meeting.transcript ?? '',
    specs_detected: meeting.specsDetected,
    status: meeting.status,
    bot_id: meeting.botId ?? null,
    branch_name: meeting.branchName ?? null,
    deploy_url: meeting.deployUrl ?? null,
    file_path: meeting.filePath ?? '',
    date: meeting.date,
  });
  if (error) throw error;
}

export async function getMeetings(userId: string): Promise<Meeting[]> {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToMeeting);
}

export async function getMeetingById(id: string): Promise<Meeting | undefined> {
  const { data, error } = await supabaseAdmin.from('meetings').select('*').eq('id', id).single();
  if (error) return undefined;
  return rowToMeeting(data);
}

export async function getMeetingByBotId(botId: string): Promise<Meeting | undefined> {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .eq('bot_id', botId)
    .single();
  if (error) return undefined;
  return rowToMeeting(data);
}

export async function updateMeetingStatus(id: string, status: Meeting['status']): Promise<void> {
  const { error } = await supabaseAdmin.from('meetings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function updateMeetingSpecs(
  id: string,
  transcript: string,
  specsDetected: number
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('meetings')
    .update({ transcript, specs_detected: specsDetected, status: 'completed' })
    .eq('id', id);
  if (error) throw error;
}

export async function updateMeetingBranch(id: string, branchName: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('meetings')
    .update({ branch_name: branchName })
    .eq('id', id);
  if (error) throw error;
}

export async function updateMeetingDeployUrl(id: string, deployUrl: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('meetings')
    .update({ deploy_url: deployUrl })
    .eq('id', id);
  if (error) throw error;
}

export async function updateMeetingName(id: string, projectName: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('meetings')
    .update({ project_name: projectName })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteMeeting(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('meetings').delete().eq('id', id);
  if (error) throw error;
}

export async function getActiveMeetingByUrl(meetingUrl: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .eq('meeting_url', meetingUrl)
    .eq('status', 'processing')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching active meeting:', error);
    return null;
  }

  return data;
}

export async function getRecentMeetingByUrl(meetingUrl: string, userId: string) {
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .eq('user_id', userId)
    .eq('meeting_url', meetingUrl)
    .gte('date', fiveSecondsAgo)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking recent meeting:', error);
    return null;
  }

  return data;
}

// ─── Specs ──────────────────────────────────────────────────────
export async function saveSpecs(specs: SpecBlock[]): Promise<void> {
  if (specs.length === 0) return;
  const { error } = await supabaseAdmin.from('specs').insert(
    specs.map((s) => ({
      id: s.id,
      user_id: s.user_id,
      meeting_id: s.meeting_id,
      project_id: s.projectId ?? null,
      title: s.title,
      type: s.type,
      confidence: s.confidence,
      note: s.note ?? null,
      timestamp: s.timestamp,
    }))
  );
  if (error) throw error;
}

export async function getSpecsByMeetingId(meetingId: string): Promise<SpecBlock[]> {
  const { data, error } = await supabaseAdmin
    .from('specs')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToSpec);
}

export async function getSpecsByProjectId(projectId: string): Promise<SpecBlock[]> {
  const { data, error } = await supabaseAdmin
    .from('specs')
    .select('*')
    .eq('project_id', projectId)
    .order('timestamp', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToSpec);
}

export async function getAllSpecs(userId: string): Promise<SpecBlock[]> {
  const { data, error } = await supabaseAdmin
    .from('specs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToSpec);
}

export async function updateSpecNote(specId: string, note: string): Promise<void> {
  const { error } = await supabaseAdmin.from('specs').update({ note }).eq('id', specId);
  if (error) throw error;
}

export async function deleteSpecsByMeetingId(meetingId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('specs').delete().eq('meeting_id', meetingId);
  if (error) throw error;
}

// ─── Projects ───────────────────────────────────────────────────
export async function saveProject(project: Project): Promise<void> {
  const { error } = await supabaseAdmin.from('projects').insert({
    id: project.id,
    user_id: project.user_id,
    name: project.name,
    repo: project.repo,
    deploy_url: project.deployUrl ?? null,
    branch_base: project.branchBase,
    meetings: project.meetings,
    spec_ids: project.ticketIds,
    files: project.files,
    context: project.context,
  });
  if (error) throw error;
}

export async function getProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToProject);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const { data, error } = await supabaseAdmin.from('projects').select('*').eq('id', id).single();
  if (error) return undefined;
  return rowToProject(data);
}

export async function getProjectByMeetingId(meetingId: string): Promise<Project | undefined> {
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('project_id')
    .eq('id', meetingId)
    .single();
  if (error || !data?.project_id) return undefined;
  return getProjectById(data.project_id);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const row: any = { updated_at: new Date().toISOString() };
  if (updates.name) row.name = updates.name;
  if (updates.deployUrl) row.deploy_url = updates.deployUrl;
  if (updates.context) row.context = updates.context;
  if (updates.files) row.files = updates.files;
  if (updates.ticketIds) row.spec_ids = updates.ticketIds;
  if (updates.meetings) row.meetings = updates.meetings;

  const { error } = await supabaseAdmin.from('projects').update(row).eq('id', id);
  if (error) throw error;
}

export async function addMeetingToProject(projectId: string, meetingId: string): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) return;
  const meetings = [...new Set([...project.meetings, meetingId])];
  await updateProject(projectId, { meetings });
}

export async function deleteProject(id: string): Promise<void> {
  const { error: meetingsError } = await supabaseAdmin
    .from('meetings')
    .update({ project_id: null })
    .eq('project_id', id);
  if (meetingsError) throw meetingsError;

  const { error: orphanTicketsDeleteError } = await supabaseAdmin
    .from('tickets')
    .delete()
    .eq('project_id', id)
    .is('meeting_id', null);
  if (orphanTicketsDeleteError) throw orphanTicketsDeleteError;

  const { error: ticketsError } = await supabaseAdmin
    .from('tickets')
    .update({ project_id: null })
    .eq('project_id', id);
  if (ticketsError) throw ticketsError;

  const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
  if (error) throw error;
}

export async function saveTickets(tickets: Ticket[]): Promise<void> {
  if (tickets.length === 0) return;
  const { error } = await supabaseAdmin.from('tickets').insert(
    tickets.map((ticket) => ({
      id: ticket.id,
      user_id: ticket.user_id,
      meeting_id: ticket.meeting_id ?? null,
      project_id: ticket.projectId ?? null,
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      assignee: ticket.assignee ?? null,
      assignee_user_id: ticket.assignee_user_id ?? null,
      dependency_ticket_id: ticket.dependency_ticket_id ?? null,
    }))
  );
  if (error) throw error;
}

function ticketFingerprint(
  ticket: Pick<Ticket, 'meeting_id' | 'title' | 'description' | 'status' | 'assignee'>
) {
  return [
    ticket.meeting_id ?? '',
    ticket.title.trim().toLowerCase(),
    ticket.description.trim().toLowerCase(),
    ticket.status,
    ticket.assignee?.trim().toLowerCase() ?? '',
  ].join('::');
}

export async function saveExtractedTickets(tickets: Ticket[]): Promise<Ticket[]> {
  if (tickets.length === 0) return [];

  const meetingId = tickets[0]?.meeting_id;
  if (!meetingId) return [];

  const existingTickets = await getTicketsByMeetingId(meetingId);
  const existingFingerprints = new Set(existingTickets.map(ticketFingerprint));
  const seenFingerprints = new Set<string>();

  const uniqueTickets = tickets.filter((ticket) => {
    const fingerprint = ticketFingerprint(ticket);
    if (existingFingerprints.has(fingerprint) || seenFingerprints.has(fingerprint)) {
      return false;
    }
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
  let query = supabaseAdmin.from('tickets').select('*').eq('meeting_id', meetingId);
  if (options?.originalOnly) {
    query = query.is('project_id', null);
  }
  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToTicket);
}

export async function getTicketsByProjectId(projectId: string): Promise<Ticket[]> {
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToTicket);
}

export async function getAllTickets(userId: string): Promise<Ticket[]> {
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToTicket);
}

export async function updateTicketStatus(id: string, status: Ticket['status']): Promise<void> {
  const { error } = await supabaseAdmin
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function updateTicketAssignee(
  id: string,
  assignee: string | null,
  assigneeUserId: string | null = null
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('tickets')
    .update({
      assignee,
      assignee_user_id: assigneeUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function updateTicketDependency(
  id: string,
  dependencyTicketId: string | null
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('tickets')
    .update({ dependency_ticket_id: dependencyTicketId, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function updateTicket(
  id: string,
  updates: Partial<
    Pick<
      Ticket,
      'title' | 'description' | 'status' | 'assignee' | 'assignee_user_id' | 'dependency_ticket_id'
    >
  >
): Promise<void> {
  const row: any = { updated_at: new Date().toISOString() };

  if (typeof updates.title !== 'undefined') row.title = updates.title;
  if (typeof updates.description !== 'undefined') row.description = updates.description;
  if (typeof updates.status !== 'undefined') row.status = updates.status;
  if (typeof updates.assignee !== 'undefined') row.assignee = updates.assignee;
  if (typeof updates.assignee_user_id !== 'undefined') {
    row.assignee_user_id = updates.assignee_user_id;
  }
  if (typeof updates.dependency_ticket_id !== 'undefined') {
    row.dependency_ticket_id = updates.dependency_ticket_id;
  }

  const { error } = await supabaseAdmin.from('tickets').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteTicketById(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('tickets').delete().eq('id', id);
  if (error) throw error;
}

export async function deleteTicketsByMeetingId(meetingId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('tickets').delete().eq('meeting_id', meetingId);
  if (error) throw error;
}

export async function addTicketsToProject(projectId: string, ticketIds: string[]): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) return;
  const merged = [...new Set([...project.ticketIds, ...ticketIds])];
  await updateProject(projectId, { ticketIds: merged });

  await supabaseAdmin.from('tickets').update({ project_id: projectId }).in('id', ticketIds);
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

function rowToTicketDependency(row: any): TicketDependency {
  return {
    id: row.id,
    project_id: row.project_id,
    ticket_id: row.ticket_id,
    depends_on_ticket_id: row.depends_on_ticket_id,
    dependency_type: row.dependency_type,
    strength: row.strength,
    note: row.note ?? null,
    ignore_count: row.ignore_count ?? 0,
    escalated: row.escalated ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getDependenciesForTicket(ticketId: string): Promise<{
  parents: TicketDependency[];
  children: TicketDependency[];
}> {
  const [parentsRes, childrenRes] = await Promise.all([
    supabaseAdmin
      .from('ticket_dependencies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('ticket_dependencies')
      .select('*')
      .eq('depends_on_ticket_id', ticketId)
      .order('created_at', { ascending: true }),
  ]);
  if (parentsRes.error) throw parentsRes.error;
  if (childrenRes.error) throw childrenRes.error;
  return {
    parents: (parentsRes.data ?? []).map(rowToTicketDependency),
    children: (childrenRes.data ?? []).map(rowToTicketDependency),
  };
}

export async function getDependenciesForProject(projectId: string): Promise<TicketDependency[]> {
  const { data, error } = await supabaseAdmin
    .from('ticket_dependencies')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToTicketDependency);
}

async function _hasPath(fromId: string, toId: string): Promise<boolean> {
  const visited = new Set<string>();
  const queue: string[] = [fromId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const { data } = await supabaseAdmin
      .from('ticket_dependencies')
      .select('depends_on_ticket_id')
      .eq('ticket_id', current);
    for (const row of data ?? []) {
      if (!visited.has(row.depends_on_ticket_id)) {
        queue.push(row.depends_on_ticket_id);
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

  const parentTicket = await supabaseAdmin
    .from('tickets')
    .select('project_id')
    .eq('id', dep.depends_on_ticket_id)
    .single();
  if (parentTicket.error || !parentTicket.data) {
    return { error: 'Parent ticket not found.' };
  }
  if (parentTicket.data.project_id !== dep.project_id) {
    return { error: 'Cross-project dependencies are not allowed.' };
  }

  const cycleExists = await _hasPath(dep.depends_on_ticket_id, dep.ticket_id);
  if (cycleExists) {
    return {
      error: `Cannot add dependency: this would create a cycle (${dep.depends_on_ticket_id} → ... → ${dep.ticket_id}).`,
    };
  }

  const { data: existing } = await supabaseAdmin
    .from('ticket_dependencies')
    .select('id')
    .eq('ticket_id', dep.ticket_id)
    .eq('depends_on_ticket_id', dep.depends_on_ticket_id)
    .maybeSingle();
  if (existing) {
    return { error: 'This dependency already exists.' };
  }

  const { error } = await supabaseAdmin.from('ticket_dependencies').insert({
    id: dep.id,
    project_id: dep.project_id,
    ticket_id: dep.ticket_id,
    depends_on_ticket_id: dep.depends_on_ticket_id,
    dependency_type: dep.dependency_type,
    strength: dep.strength,
    note: dep.note ?? null,
    ignore_count: 0,
    escalated: false,
  });
  if (error) return { error: error.message };
  return {};
}

export async function deleteDependency(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('ticket_dependencies').delete().eq('id', id);
  if (error) throw error;
}

export async function incrementDependencyIgnoreCount(id: string): Promise<void> {
  const { data: row } = await supabaseAdmin
    .from('ticket_dependencies')
    .select('ignore_count, strength')
    .eq('id', id)
    .single();
  if (!row) return;

  const newCount = (row.ignore_count ?? 0) + 1;
  const shouldEscalate = row.strength === 'soft' && newCount >= 3;
  await supabaseAdmin
    .from('ticket_dependencies')
    .update({
      ignore_count: newCount,
      escalated: shouldEscalate || undefined,
      strength: shouldEscalate ? 'hard' : row.strength,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
}

export async function checkHardBlockers(ticketId: string): Promise<{
  blocked: boolean;
  blockers: TicketDependency[];
}> {
  const { parents } = await getDependenciesForTicket(ticketId);
  const hardParents = parents.filter((d) => d.strength === 'hard' || d.escalated);
  if (hardParents.length === 0) return { blocked: false, blockers: [] };

  const parentIds = hardParents.map((d) => d.depends_on_ticket_id);
  const { data: parentTickets } = await supabaseAdmin
    .from('tickets')
    .select('id, status')
    .in('id', parentIds);

  const unresolved = hardParents.filter((dep) => {
    const parent = (parentTickets ?? []).find((t: any) => t.id === dep.depends_on_ticket_id);
    return parent?.status !== 'done';
  });

  return { blocked: unresolved.length > 0, blockers: unresolved };
}

export async function cascadeDepRegressionForParent(parentId: string): Promise<void> {
  const { children } = await getDependenciesForTicket(parentId);
  if (children.length === 0) return;

  const childIds = children.map((d) => d.ticket_id);
  const { data: childTickets } = await supabaseAdmin
    .from('tickets')
    .select('id, status')
    .in('id', childIds);

  const toBlock = (childTickets ?? [])
    .filter((t: any) => t.status === 'done' || t.status === 'in_progress')
    .map((t: any) => t.id);

  if (toBlock.length === 0) return;

  await supabaseAdmin
    .from('tickets')
    .update({
      status: 'blocked',
      updated_at: new Date().toISOString(),
    })
    .in('id', toBlock);
}

// ─── Legacy compatibility (db.json style) ──────────────────────
// These are kept so old code doesn't break during migration
export function loadDB() {
  throw new Error('loadDB is deprecated — use Supabase async functions');
}

export function saveDB() {
  throw new Error('saveDB is deprecated — use Supabase async functions');
}
