import { randomUUID } from 'crypto';
import {
  ProjectsEntity,
  ProjectMembersEntity,
  TicketDependenciesEntity,
  TicketsEntity,
  MeetingsEntity,
} from '@/db/entities';
import type { Project, ProjectMember } from './types';
import { entityToProject, entityToProjectMember } from './mappers';
import { getMeetingById } from './meetings';

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

export async function getProjectsByOrg(orgId: string): Promise<Project[]> {
  const res = await ProjectsEntity.query.byOrg({ orgId }).go();
  return (res.data ?? [])
    .map(entityToProject)
    .sort((a: Project, b: Project) => b.createdAt.localeCompare(a.createdAt));
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
