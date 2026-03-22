// lib/db.ts
import { supabaseAdmin } from './supabase';

// ─── Types ─────────────────────────────────────────────────────
export interface Meeting {
  id:            string;
  user_id?:      string;
  projectName:   string;
  meetingId:     string;
  platform:      string;
  transcript:    string;
  specsDetected: number;
  status:        'completed' | 'processing' | 'failed';
  date:          string;
  filePath:      string;
  botId?:        string;
  branchName?:   string;
  deployUrl?:    string;
  projectId?:    string;
}

export interface SpecBlock {
  id:          string;
  user_id?:    string;
  title:       string;
  type:        'feature' | 'idea' | 'constraint' | 'improvement';
  confidence:  number;
  meeting_id:  string;
  timestamp:   string;
  note?:       string;
  projectId?:  string;
  parentSpecId?: string;
}

export interface Project {
  id:          string;
  user_id?:    string;
  name:        string;
  repo:        string;
  deployUrl?:  string;
  branchBase:  string;
  meetings:    string[];
  specIds:     string[];
  files:       string[];
  context:     string;
  createdAt:   string;
  updatedAt:   string;
}

// ─── Helper — map Supabase row to Meeting ──────────────────────
function rowToMeeting(row: any): Meeting {
  return {
    id:            row.id,
    user_id:       row.user_id,
    projectName:   row.project_name,
    meetingId:     row.meeting_id,
    platform:      row.platform,
    transcript:    row.transcript ?? '',
    specsDetected: row.specs_detected,
    status:        row.status,
    date:          row.date,
    filePath:      row.file_path ?? '',
    botId:         row.bot_id,
    branchName:    row.branch_name,
    deployUrl:     row.deploy_url,
    projectId:     row.project_id,
  };
}

function rowToSpec(row: any): SpecBlock {
  return {
    id:          row.id,
    user_id:     row.user_id,
    title:       row.title,
    type:        row.type,
    confidence:  row.confidence,
    meeting_id:  row.meeting_id,
    timestamp:   row.timestamp,
    note:        row.note,
    projectId:   row.project_id,
  };
}

function rowToProject(row: any): Project {
  return {
    id:          row.id,
    user_id:     row.user_id,
    name:        row.name,
    repo:        row.repo,
    deployUrl:   row.deploy_url,
    branchBase:  row.branch_base,
    meetings:    row.meetings ?? [],
    specIds:     row.spec_ids ?? [],
    files:       row.files ?? [],
    context:     row.context ?? '',
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// ─── Meetings ───────────────────────────────────────────────────
export async function saveMeeting(meeting: Meeting): Promise<void> {
  const { error } = await supabaseAdmin.from('meetings').insert({
    id:             meeting.id,
    user_id:        meeting.user_id,
    project_id:     meeting.projectId ?? null,
    project_name:   meeting.projectName,
    meeting_id:     meeting.meetingId,
    platform:       meeting.platform,
    transcript:     meeting.transcript ?? '',
    specs_detected: meeting.specsDetected,
    status:         meeting.status,
    bot_id:         meeting.botId ?? null,
    branch_name:    meeting.branchName ?? null,
    deploy_url:     meeting.deployUrl ?? null,
    file_path:      meeting.filePath ?? '',
    date:           meeting.date,
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
  const { data, error } = await supabaseAdmin
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();
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
  const { error } = await supabaseAdmin
    .from('meetings')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function updateMeetingSpecs(id: string, transcript: string, specsDetected: number): Promise<void> {
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
  const { error } = await supabaseAdmin
    .from('meetings')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─── Specs ──────────────────────────────────────────────────────
export async function saveSpecs(specs: SpecBlock[]): Promise<void> {
  if (specs.length === 0) return;
  const { error } = await supabaseAdmin.from('specs').insert(
    specs.map(s => ({
      id:         s.id,
      user_id:    s.user_id,
      meeting_id: s.meeting_id,
      project_id: s.projectId ?? null,
      title:      s.title,
      type:       s.type,
      confidence: s.confidence,
      note:       s.note ?? null,
      timestamp:  s.timestamp,
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
  const { error } = await supabaseAdmin
    .from('specs')
    .update({ note })
    .eq('id', specId);
  if (error) throw error;
}

export async function deleteSpecsByMeetingId(meetingId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('specs')
    .delete()
    .eq('meeting_id', meetingId);
  if (error) throw error;
}

// ─── Projects ───────────────────────────────────────────────────
export async function saveProject(project: Project): Promise<void> {
  const { error } = await supabaseAdmin.from('projects').insert({
    id:          project.id,
    user_id:     project.user_id,
    name:        project.name,
    repo:        project.repo,
    deploy_url:  project.deployUrl ?? null,
    branch_base: project.branchBase,
    meetings:    project.meetings,
    spec_ids:    project.specIds,
    files:       project.files,
    context:     project.context,
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
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
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
  if (updates.name)      row.name       = updates.name;
  if (updates.deployUrl) row.deploy_url = updates.deployUrl;
  if (updates.context)   row.context    = updates.context;
  if (updates.files)     row.files      = updates.files;
  if (updates.specIds)   row.spec_ids   = updates.specIds;
  if (updates.meetings)  row.meetings   = updates.meetings;

  const { error } = await supabaseAdmin
    .from('projects')
    .update(row)
    .eq('id', id);
  if (error) throw error;
}

export async function addMeetingToProject(projectId: string, meetingId: string): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) return;
  const meetings = [...new Set([...project.meetings, meetingId])];
  await updateProject(projectId, { meetings });
}

export async function addSpecsToProject(projectId: string, specIds: string[]): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) return;
  const merged = [...new Set([...project.specIds, ...specIds])];
  await updateProject(projectId, { specIds: merged });

  // Also update project_id on each spec
  await supabaseAdmin
    .from('specs')
    .update({ project_id: projectId })
    .in('id', specIds);
}

export async function addFilesToProject(projectId: string, files: string[]): Promise<void> {
  const project = await getProjectById(projectId);
  if (!project) return;
  const merged = [...new Set([...project.files, ...files])];
  await updateProject(projectId, { files: merged });
}

export async function updateMeetingSpecs2(id: string, transcript: string, specsDetected: number): Promise<void> {
  await updateMeetingSpecs(id, transcript, specsDetected);
}

// ─── Legacy compatibility (db.json style) ──────────────────────
// These are kept so old code doesn't break during migration
export function loadDB() {
  throw new Error('loadDB is deprecated — use Supabase async functions');
}

export function saveDB() {
  throw new Error('saveDB is deprecated — use Supabase async functions');
}