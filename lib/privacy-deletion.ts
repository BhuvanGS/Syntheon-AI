import {
  ApiKeysEntity,
  ConsentRecordsEntity,
  DeletionRequestsEntity,
  IntegrationsEntity,
  LabelsEntity,
  MeetingsEntity,
  MilestonesEntity,
  NotificationsEntity,
  OrganizationAccessRequestsEntity,
  OrganizationInvitesEntity,
  OrganizationMetadataEntity,
  ProjectMembersEntity,
  ProjectsEntity,
  SpecsEntity,
  SprintsEntity,
  TicketActivitiesEntity,
  TicketAttachmentsEntity,
  TicketCommentsEntity,
  TicketDependenciesEntity,
  TicketsEntity,
  UsersEntity,
} from '@/db/entities';
import { randomUUID, createHash } from 'crypto';

type ClerkClientLike = any;

export type DeletionScope = 'user' | 'org';
export type DeletionStatus = 'pending' | 'warning_sent' | 'completed' | 'failed' | 'cancelled';

const GRACE_DAYS = 30;
const WARNING_HOURS = 48;

export function computeDeletionSchedule(now = new Date()) {
  const requestedAt = now.toISOString();
  const scheduledFor = new Date(now.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const warningDueAt = new Date(
    now.getTime() + (GRACE_DAYS * 24 - WARNING_HOURS) * 60 * 60 * 1000
  ).toISOString();
  return { requestedAt, scheduledFor, warningDueAt };
}

export async function createDeletionRequest(input: {
  userId: string;
  orgId?: string;
  scope: DeletionScope;
  reason?: string;
}) {
  const now = new Date();
  const { requestedAt, scheduledFor, warningDueAt } = computeDeletionSchedule(now);

  const id = randomUUID();
  await DeletionRequestsEntity.create({
    id,
    userId: input.userId,
    orgId: input.orgId,
    scope: input.scope,
    status: 'pending',
    requestedAt,
    scheduledFor,
    warningDueAt,
    reason: input.reason,
  }).go();

  return {
    id,
    userId: input.userId,
    orgId: input.orgId,
    scope: input.scope,
    status: 'pending' as DeletionStatus,
    requestedAt,
    scheduledFor,
    warningDueAt,
  };
}

export async function getDeletionRequestsByUser(userId: string) {
  const res = await DeletionRequestsEntity.query.byUser({ userId }).go({ order: 'desc' });
  return res.data ?? [];
}

export async function hasActiveDeletionRequest(
  userId: string,
  scope: DeletionScope,
  orgId?: string
) {
  const rows = await getDeletionRequestsByUser(userId);
  return rows.some(
    (r: any) =>
      r.scope === scope &&
      (scope !== 'org' || r.orgId === orgId) &&
      (r.status === 'pending' || r.status === 'warning_sent')
  );
}

function toTombstone(userId: string) {
  return `deleted:${createHash('sha256').update(userId).digest('hex').slice(0, 16)}`;
}

async function anonymizeUserOwnedRecords(userId: string) {
  const tombstone = toTombstone(userId);
  const now = new Date().toISOString();

  const meetings = await MeetingsEntity.query.byUser({ userId }).go();
  for (const meeting of meetings.data ?? []) {
    await MeetingsEntity.update({ id: meeting.id }).set({ userId: tombstone, updatedAt: now }).go();
  }

  const tickets = await TicketsEntity.query.byUser({ userId }).go();
  for (const ticket of tickets.data ?? []) {
    await TicketsEntity.update({ id: ticket.id }).set({ userId: tombstone, updatedAt: now }).go();
  }

  const assignedTickets = await TicketsEntity.query.byAssignee({ assigneeUserId: userId }).go();
  for (const ticket of assignedTickets.data ?? []) {
    await TicketsEntity.update({ id: ticket.id })
      .set({ assigneeUserId: tombstone, assignee: 'Deleted User', updatedAt: now })
      .go();
  }

  const projects = await ProjectsEntity.query.byUser({ userId }).go();
  for (const project of projects.data ?? []) {
    await ProjectsEntity.update({ id: project.id }).set({ userId: tombstone, updatedAt: now }).go();
  }

  const specs = await SpecsEntity.query.byUser({ userId }).go();
  for (const spec of specs.data ?? []) {
    await SpecsEntity.update({ id: spec.id }).set({ userId: tombstone, updatedAt: now }).go();
  }
}

export async function deleteUserPersonalData(userId: string) {
  const now = new Date().toISOString();

  await anonymizeUserOwnedRecords(userId);

  const deps = await TicketDependenciesEntity.query.byUser({ userId }).go();
  for (const dep of deps.data ?? []) {
    await TicketDependenciesEntity.delete({ id: dep.id }).go();
  }

  const attachments = await TicketAttachmentsEntity.query.byUser({ userId }).go();
  for (const row of attachments.data ?? []) {
    await TicketAttachmentsEntity.delete({ id: row.id }).go();
  }

  const comments = await TicketCommentsEntity.query.byUser({ userId }).go();
  for (const row of comments.data ?? []) {
    await TicketCommentsEntity.delete({ id: row.id }).go();
  }

  const activities = await TicketActivitiesEntity.query.byUser({ userId }).go();
  for (const row of activities.data ?? []) {
    await TicketActivitiesEntity.delete({ id: row.id }).go();
  }

  const members = await ProjectMembersEntity.query.byUser({ userId }).go();
  for (const row of members.data ?? []) {
    await ProjectMembersEntity.delete({ projectId: row.projectId, userId: row.userId }).go();
  }

  const accessRequests = await OrganizationAccessRequestsEntity.query.byUser({ userId }).go();
  for (const row of accessRequests.data ?? []) {
    await OrganizationAccessRequestsEntity.delete({ orgId: row.orgId, userId: row.userId }).go();
  }

  const notifications = await NotificationsEntity.query.primary({ userId }).go();
  for (const row of notifications.data ?? []) {
    await NotificationsEntity.delete({
      userId: row.userId,
      orgId: row.orgId,
      createdAt: row.createdAt,
    }).go();
  }

  const consent = await ConsentRecordsEntity.query.byUser({ userId }).go();
  for (const row of consent.data ?? []) {
    if (row.status !== 'withdrawn') {
      await ConsentRecordsEntity.update({ id: row.id })
        .set({ status: 'withdrawn', withdrawnAt: now })
        .go();
    }
  }

  try {
    await ApiKeysEntity.delete({ userId }).go();
  } catch {
    // no-op: key may not exist
  }

  try {
    await IntegrationsEntity.delete({ userId }).go();
  } catch {
    // no-op: integration may not exist
  }

  try {
    await UsersEntity.delete({ id: userId }).go();
  } catch {
    // no-op: user row may already be removed
  }
}

async function deleteTicketRelations(ticketId: string) {
  const [depsA, depsB, attachments, comments, activities] = await Promise.all([
    TicketDependenciesEntity.query.byTicket({ ticketId }).go(),
    TicketDependenciesEntity.query.byDependsOn({ dependsOnTicketId: ticketId }).go(),
    TicketAttachmentsEntity.query.byTicket({ ticketId }).go(),
    TicketCommentsEntity.query.byTicket({ ticketId }).go(),
    TicketActivitiesEntity.query.byTicket({ ticketId }).go(),
  ]);

  for (const row of depsA.data ?? []) await TicketDependenciesEntity.delete({ id: row.id }).go();
  for (const row of depsB.data ?? []) await TicketDependenciesEntity.delete({ id: row.id }).go();
  for (const row of attachments.data ?? [])
    await TicketAttachmentsEntity.delete({ id: row.id }).go();
  for (const row of comments.data ?? []) await TicketCommentsEntity.delete({ id: row.id }).go();
  for (const row of activities.data ?? []) await TicketActivitiesEntity.delete({ id: row.id }).go();
}

async function deleteOrgData(orgId: string) {
  const [projects, meetings, tickets, labels, sprints, milestones] = await Promise.all([
    ProjectsEntity.query.byOrg({ orgId }).go(),
    MeetingsEntity.query.byOrg({ orgId }).go(),
    TicketsEntity.query.byOrg({ orgId }).go(),
    LabelsEntity.query.byOrg({ orgId }).go(),
    SprintsEntity.query.byOrg({ orgId }).go(),
    MilestonesEntity.query.byOrg({ orgId }).go(),
  ]);

  for (const ticket of tickets.data ?? []) {
    await deleteTicketRelations(ticket.id);
    await TicketsEntity.delete({ id: ticket.id }).go();
  }

  for (const meeting of meetings.data ?? []) {
    const specs = await SpecsEntity.query.byMeeting({ meetingId: meeting.meetingId }).go();
    for (const spec of specs.data ?? []) {
      await SpecsEntity.delete({ id: spec.id }).go();
    }
    await MeetingsEntity.delete({ id: meeting.id }).go();
  }

  for (const project of projects.data ?? []) {
    await ProjectsEntity.delete({ id: project.id }).go();
  }

  for (const label of labels.data ?? []) await LabelsEntity.delete({ id: label.id }).go();
  for (const sprint of sprints.data ?? []) await SprintsEntity.delete({ id: sprint.id }).go();
  for (const milestone of milestones.data ?? [])
    await MilestonesEntity.delete({ id: milestone.id }).go();

  const members = await ProjectMembersEntity.query.byOrgUser({ orgId }).go();
  for (const member of members.data ?? []) {
    await ProjectMembersEntity.delete({ projectId: member.projectId, userId: member.userId }).go();
  }

  const invites = await OrganizationInvitesEntity.query.primary({ orgId }).go();
  for (const row of invites.data ?? []) {
    await OrganizationInvitesEntity.delete({ orgId: row.orgId, email: row.email }).go();
  }

  const access = await OrganizationAccessRequestsEntity.query.primary({ orgId }).go();
  for (const row of access.data ?? []) {
    await OrganizationAccessRequestsEntity.delete({ orgId: row.orgId, userId: row.userId }).go();
  }

  try {
    await OrganizationMetadataEntity.delete({ orgId }).go();
  } catch {
    // no-op
  }
}

export async function executeDeletionRequest(request: any, client: ClerkClientLike) {
  const receipts: Record<string, any> = {
    startedAt: new Date().toISOString(),
    scope: request.scope,
  };

  if (request.scope === 'org') {
    if (!request.orgId) {
      throw new Error('Missing orgId for org deletion request');
    }

    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: request.orgId,
    });
    const memberIds = (memberships.data ?? [])
      .map((m: any) => m.publicUserData?.userId)
      .filter(Boolean);

    await deleteOrgData(request.orgId);

    for (const memberUserId of memberIds) {
      await deleteUserPersonalData(memberUserId);
      try {
        const m = await client.users.getOrganizationMembershipList({ userId: memberUserId });
        if ((m.data ?? []).length <= 1) {
          await client.users.deleteUser(memberUserId);
        }
      } catch {
        // no-op
      }
    }

    await client.organizations.deleteOrganization(request.orgId);
    receipts.orgDeleted = true;
    receipts.membersProcessed = memberIds.length;
  } else {
    await deleteUserPersonalData(request.userId);

    try {
      await client.users.deleteUser(request.userId);
      receipts.userDeletedFromClerk = true;
    } catch {
      receipts.userDeletedFromClerk = false;
    }
  }

  receipts.finishedAt = new Date().toISOString();
  return receipts;
}

export async function processDeletionQueue(client: ClerkClientLike) {
  const now = new Date().toISOString();
  let warningsSent = 0;
  let completed = 0;
  let failed = 0;

  const pending = await DeletionRequestsEntity.query.byStatus({ status: 'pending' }).go();
  for (const req of pending.data ?? []) {
    if (!req.warningSentAt && req.warningDueAt <= now) {
      await DeletionRequestsEntity.update({ id: req.id })
        .set({ status: 'warning_sent', warningSentAt: now })
        .go();
      warningsSent += 1;
    }
  }

  const duePending =
    (await DeletionRequestsEntity.query.byStatus({ status: 'pending' }).go()).data ?? [];
  const dueWarned =
    (await DeletionRequestsEntity.query.byStatus({ status: 'warning_sent' }).go()).data ?? [];

  for (const req of [...duePending, ...dueWarned]) {
    if (req.scheduledFor > now) continue;

    try {
      const receipts = await executeDeletionRequest(req, client);
      await DeletionRequestsEntity.update({ id: req.id })
        .set({
          status: 'completed',
          processedAt: new Date().toISOString(),
          processorReceipts: receipts,
        })
        .go();
      completed += 1;
    } catch (error: any) {
      await DeletionRequestsEntity.update({ id: req.id })
        .set({
          status: 'failed',
          processedAt: new Date().toISOString(),
          retentionNotes: error?.message ?? 'Deletion failed',
        })
        .go();
      failed += 1;
    }
  }

  return { warningsSent, completed, failed };
}
