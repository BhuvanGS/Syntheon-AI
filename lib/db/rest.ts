import { randomUUID } from 'crypto';
import { broadcastToOrg, broadcastToUser } from '@/lib/event-bus';
import { CURRENT_CONSENT_VERSION } from '@/lib/consent-constants';
import {
  UsersEntity,
  IntegrationsEntity,
  OrganizationMetadataEntity,
  OrganizationInvitesEntity,
  OrganizationAccessRequestsEntity,
  NotificationsEntity,
  LabelsEntity,
  MilestonesEntity,
  SprintsEntity,
  ConsentRecordsEntity,
  TicketsEntity,
  ProjectsEntity,
} from '@/db/entities';
import type {
  Notification,
  Ticket,
  Project,
  Label,
  Milestone,
  Sprint,
  ConsentRecord,
} from './types';
import { entityToNotification } from './mappers';

export { CURRENT_CONSENT_VERSION };

// ─── Legacy compatibility ──────────────────────────────────────
export function loadDB() {
  throw new Error('loadDB is deprecated — use async DynamoDB functions');
}

export function saveDB() {
  throw new Error('saveDB is deprecated — use async DynamoDB functions');
}

// ─── Notifications ──────────────────────────────────────────────

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
  if (values.org_id) {
    broadcastToOrg(values.org_id, {
      type: 'notification_new',
      payload: {
        userId: values.user_id,
        type: values.type,
        title: values.title,
        message: values.message,
        ticketId: values.ticket_id ?? null,
      },
    });
  } else {
    broadcastToUser(values.user_id, {
      type: 'notification_new',
      payload: {
        userId: values.user_id,
        type: values.type,
        title: values.title,
        message: values.message,
        ticketId: values.ticket_id ?? null,
      },
    });
  }
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
