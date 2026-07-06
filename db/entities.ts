import { Entity } from 'electrodb';
import { docClient } from './client';

const SERVICE = 'syntheon';
const VERSION = '1';

function makeEntity(
  tableName: string,
  envVar: string,
  entityName: string,
  attributes: Record<string, any>,
  indexes: Record<string, any>
): any {
  const useLocal = !!process.env.DYNAMODB_ENDPOINT;
  const actualTable = useLocal ? tableName : process.env[envVar] || tableName;
  return new Entity(
    {
      model: { entity: entityName, service: SERVICE, version: VERSION },
      attributes,
      indexes,
    },
    { table: actualTable, client: docClient }
  );
}

// ─── Users ───────────────────────────────────────────────────────
export const UsersEntity = makeEntity(
  'syntheon-users',
  'DYNAMO_TABLE_USERS',
  'user',
  {
    id: { type: 'string', required: true },
    email: { type: 'string', required: true },
    name: { type: 'string' },
    plan: { type: 'string', default: 'starter' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: { pk: { field: 'pk', composite: ['id'] }, sk: { field: 'sk', template: 'user' } },
  }
);

// ─── API Keys ────────────────────────────────────────────────────
export const ApiKeysEntity = makeEntity(
  'syntheon-api-keys',
  'DYNAMO_TABLE_API_KEYS',
  'apiKey',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    keyHash: { type: 'string', required: true },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['userId'] },
      sk: { field: 'sk', template: 'apiKey' },
    },
    byId: { index: 'gsi1', pk: { field: 'gsi1pk', composite: ['id'] } },
  }
);

// ─── Meetings ────────────────────────────────────────────────────
export const MeetingsEntity = makeEntity(
  'syntheon-meetings',
  'DYNAMO_TABLE_MEETINGS',
  'meeting',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string' },
    orgId: { type: 'string' },
    projectId: { type: 'string' },
    projectName: { type: 'string', required: true },
    meetingId: { type: 'string', required: true },
    meetingUrl: { type: 'string' },
    platform: { type: 'string', required: true },
    transcript: { type: 'string', default: '' },
    specsDetected: { type: 'number', default: 0 },
    status: { type: 'string', default: 'processing' },
    botId: { type: 'string' },
    branchName: { type: 'string' },
    deployUrl: { type: 'string' },
    filePath: { type: 'string', default: '' },
    summary: { type: 'string', default: '' },
    date: { type: 'string', required: true },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: { pk: { field: 'pk', composite: ['id'] }, sk: { field: 'sk', template: 'meeting' } },
    byUser: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['userId'] },
      sk: { field: 'gsi1sk', composite: ['date'] },
    },
    byOrg: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['orgId'] },
      sk: { field: 'gsi2sk', composite: ['date'] },
    },
    byBot: {
      index: 'gsi3',
      pk: { field: 'gsi3pk', composite: ['botId'] },
      sk: { field: 'gsi3sk', composite: ['id'] },
    },
  }
);

// ─── Specs ───────────────────────────────────────────────────────
export const SpecsEntity = makeEntity(
  'syntheon-specs',
  'DYNAMO_TABLE_SPECS',
  'spec',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string' },
    title: { type: 'string', required: true },
    type: { type: 'string', required: true },
    confidence: { type: 'number', required: true },
    meetingId: { type: 'string', required: true },
    timestamp: { type: 'string', required: true },
    note: { type: 'string' },
    projectId: { type: 'string' },
    parentSpecId: { type: 'string' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: { pk: { field: 'pk', composite: ['id'] }, sk: { field: 'sk', template: 'spec' } },
    byMeeting: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['meetingId'] },
      sk: { field: 'gsi1sk', composite: ['timestamp'] },
    },
    byProject: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['projectId'] },
      sk: { field: 'gsi2sk', composite: ['timestamp'] },
    },
    byUser: {
      index: 'gsi3',
      pk: { field: 'gsi3pk', composite: ['userId'] },
      sk: { field: 'gsi3sk', composite: ['timestamp'] },
    },
  }
);

// ─── Tickets ─────────────────────────────────────────────────────
export const TicketsEntity = makeEntity(
  'syntheon-tickets',
  'DYNAMO_TABLE_TICKETS',
  'ticket',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string' },
    orgId: { type: 'string' },
    meetingId: { type: 'string' },
    projectId: { type: 'string' },
    parentId: { type: 'string' },
    title: { type: 'string', required: true },
    description: { type: 'string', default: '' },
    status: { type: 'string', default: 'backlog' },
    priority: { type: 'string', default: 'none' },
    type: { type: 'string', default: 'task' },
    estimate: { type: 'string', default: 'none' },
    labels: { type: 'list', items: { type: 'string' }, default: () => [] },
    assignee: { type: 'string' },
    assigneeUserId: { type: 'string' },
    dependencyTicketId: { type: 'string' },
    startDate: { type: 'string' },
    dueDate: { type: 'string' },
    deadlineTime: { type: 'string' },
    rank: { type: 'number' },
    milestoneId: { type: 'string' },
    isGroup: { type: 'boolean', default: false },
    sprintId: { type: 'string' },
    timeEstimate: { type: 'number' },
    timeSpent: { type: 'number' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: { pk: { field: 'pk', composite: ['id'] }, sk: { field: 'sk', template: 'ticket' } },
    byMeeting: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['meetingId'] },
      sk: { field: 'gsi1sk', composite: ['createdAt'] },
    },
    byProject: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['projectId'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
    byOrg: {
      index: 'gsi3',
      pk: { field: 'gsi3pk', composite: ['orgId'] },
      sk: { field: 'gsi3sk', composite: ['createdAt'] },
    },
    byUser: {
      index: 'gsi4',
      pk: { field: 'gsi4pk', composite: ['userId'] },
      sk: { field: 'gsi4sk', composite: ['createdAt'] },
    },
    byAssignee: {
      index: 'gsi5',
      pk: { field: 'gsi5pk', composite: ['assigneeUserId'] },
      sk: { field: 'gsi5sk', composite: ['dueDate'] },
    },
  }
);

// ─── Projects ────────────────────────────────────────────────────
export const ProjectsEntity = makeEntity(
  'syntheon-projects',
  'DYNAMO_TABLE_PROJECTS',
  'project',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string' },
    orgId: { type: 'string' },
    name: { type: 'string', required: true },
    repo: { type: 'string', required: true },
    deployUrl: { type: 'string' },
    branchBase: { type: 'string', default: 'main' },
    agentTier: { type: 'string', default: 'standard' },
    meetings: { type: 'list', items: { type: 'string' }, default: () => [] },
    ticketIds: { type: 'list', items: { type: 'string' }, default: () => [] },
    files: { type: 'list', items: { type: 'string' }, default: () => [] },
    context: { type: 'string', default: '' },
    leadUserId: { type: 'string' },
    status: { type: 'string', default: 'on_track' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: { pk: { field: 'pk', composite: ['id'] }, sk: { field: 'sk', template: 'project' } },
    byUser: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['userId'] },
      sk: { field: 'gsi1sk', composite: ['createdAt'] },
    },
    byOrg: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['orgId'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
  }
);

// ─── Ticket Dependencies ─────────────────────────────────────────
export const TicketDependenciesEntity = makeEntity(
  'syntheon-ticket-dependencies',
  'DYNAMO_TABLE_TICKET_DEPENDENCIES',
  'ticketDependency',
  {
    id: { type: 'string', required: true },
    projectId: { type: 'string', required: true },
    ticketId: { type: 'string', required: true },
    dependsOnTicketId: { type: 'string', required: true },
    userId: { type: 'string' },
    dependencyType: { type: 'string', default: 'hard' },
    strength: { type: 'string', default: 'strong' },
    note: { type: 'string' },
    ignoreCount: { type: 'number', default: 0 },
    escalated: { type: 'boolean', default: false },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['id'] },
      sk: { field: 'sk', template: 'ticketDependency' },
    },
    byTicket: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['ticketId'] },
      sk: { field: 'gsi1sk', composite: ['createdAt'] },
    },
    byDependsOn: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['dependsOnTicketId'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
    byProject: {
      index: 'gsi3',
      pk: { field: 'gsi3pk', composite: ['projectId'] },
      sk: { field: 'gsi3sk', composite: ['createdAt'] },
    },
    byUser: {
      index: 'gsi4',
      pk: { field: 'gsi4pk', composite: ['userId'] },
      sk: { field: 'gsi4sk', composite: ['createdAt'] },
    },
  }
);

// ─── Ticket Attachments ──────────────────────────────────────────
export const TicketAttachmentsEntity = makeEntity(
  'syntheon-ticket-attachments',
  'DYNAMO_TABLE_TICKET_ATTACHMENTS',
  'ticketAttachment',
  {
    id: { type: 'string', required: true },
    ticketId: { type: 'string', required: true },
    projectId: { type: 'string' },
    userId: { type: 'string', required: true },
    filename: { type: 'string', required: true },
    fileUrl: { type: 'string', required: true },
    fileSize: { type: 'number', required: true },
    fileType: { type: 'string' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['id'] },
      sk: { field: 'sk', template: 'ticketAttachment' },
    },
    byTicket: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['ticketId'] },
      sk: { field: 'gsi1sk', composite: ['createdAt'] },
    },
    byUser: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['userId'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
  }
);

// ─── Ticket Comments ─────────────────────────────────────────────
export const TicketCommentsEntity = makeEntity(
  'syntheon-ticket-comments',
  'DYNAMO_TABLE_TICKET_COMMENTS',
  'ticketComment',
  {
    id: { type: 'string', required: true },
    ticketId: { type: 'string', required: true },
    projectId: { type: 'string' },
    userId: { type: 'string', required: true },
    content: { type: 'string', required: true },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['id'] },
      sk: { field: 'sk', template: 'ticketComment' },
    },
    byTicket: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['ticketId'] },
      sk: { field: 'gsi1sk', composite: ['createdAt'] },
    },
    byUser: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['userId'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
  }
);

// ─── Ticket Activities ───────────────────────────────────────────
export const TicketActivitiesEntity = makeEntity(
  'syntheon-ticket-activities',
  'DYNAMO_TABLE_TICKET_ACTIVITIES',
  'ticketActivity',
  {
    id: { type: 'string', required: true },
    ticketId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    actionType: { type: 'string', required: true },
    metadata: { type: 'any', default: {} },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['id'] },
      sk: { field: 'sk', template: 'ticketActivity' },
    },
    byTicket: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['ticketId'] },
      sk: { field: 'gsi1sk', composite: ['createdAt'] },
    },
    byActionType: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['actionType'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
    byUser: {
      index: 'gsi3',
      pk: { field: 'gsi3pk', composite: ['userId'] },
      sk: { field: 'gsi3sk', composite: ['createdAt'] },
    },
  }
);

// ─── Integrations ────────────────────────────────────────────────
export const IntegrationsEntity = makeEntity(
  'syntheon-integrations',
  'DYNAMO_TABLE_INTEGRATIONS',
  'integration',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    orgId: { type: 'string' },
    githubToken: { type: 'string' },
    githubOwner: { type: 'string' },
    githubRepo: { type: 'string' },
    githubAccessToken: { type: 'string' },
    googleToken: { type: 'string' },
    googleRefreshToken: { type: 'string' },
    webhookSecret: { type: 'string' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['userId'] },
      sk: { field: 'sk', template: 'integration' },
    },
    byOrg: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['orgId'] },
      sk: { field: 'gsi1sk', composite: ['updatedAt'] },
    },
  }
);

// ─── Project Members ─────────────────────────────────────────────
export const ProjectMembersEntity = makeEntity(
  'syntheon-project-members',
  'DYNAMO_TABLE_PROJECT_MEMBERS',
  'projectMember',
  {
    id: { type: 'string', required: true },
    projectId: { type: 'string', required: true },
    orgId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    role: { type: 'string', default: 'member' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['projectId'] },
      sk: { field: 'sk', composite: ['userId'] },
    },
    byOrgUser: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['orgId'] },
      sk: { field: 'gsi1sk', composite: ['userId'] },
    },
    byUser: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['userId'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
  }
);

// ─── Organization Metadata ───────────────────────────────────────
export const OrganizationMetadataEntity = makeEntity(
  'syntheon-org-metadata',
  'DYNAMO_TABLE_ORG_METADATA',
  'orgMetadata',
  {
    id: { type: 'string', required: true },
    orgId: { type: 'string', required: true },
    companyName: { type: 'string' },
    managerName: { type: 'string' },
    domain: { type: 'string' },
    joinCode: { type: 'string' },
    allowAccessRequests: { type: 'boolean', default: false },
    trialStartedAt: { type: 'string' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['orgId'] },
      sk: { field: 'sk', template: 'orgMetadata' },
    },
  }
);

// ─── Organization Invites ────────────────────────────────────────
export const OrganizationInvitesEntity = makeEntity(
  'syntheon-org-invites',
  'DYNAMO_TABLE_ORG_INVITES',
  'orgInvite',
  {
    id: { type: 'string', required: true },
    orgId: { type: 'string', required: true },
    email: { type: 'string', required: true },
    status: { type: 'string', default: 'pending' },
    token: { type: 'string' },
    invitedBy: { type: 'string', required: true },
    invitedAt: { type: 'string', default: () => new Date().toISOString() },
    respondedAt: { type: 'string' },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['orgId'] },
      sk: { field: 'sk', composite: ['email'] },
    },
    byEmail: { index: 'gsi1', pk: { field: 'gsi1pk', composite: ['email'] } },
    byToken: { index: 'gsi2', pk: { field: 'gsi2pk', composite: ['token'] } },
  }
);

// ─── Organization Access Requests ────────────────────────────────
export const OrganizationAccessRequestsEntity = makeEntity(
  'syntheon-org-access-requests',
  'DYNAMO_TABLE_ORG_ACCESS_REQUESTS',
  'orgAccessRequest',
  {
    id: { type: 'string', required: true },
    orgId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    userEmail: { type: 'string', required: true },
    userName: { type: 'string' },
    status: { type: 'string', default: 'pending' },
    requestedAt: { type: 'string', default: () => new Date().toISOString() },
    respondedAt: { type: 'string' },
    respondedBy: { type: 'string' },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['orgId'] },
      sk: { field: 'sk', composite: ['userId'] },
    },
    byUser: { index: 'gsi1', pk: { field: 'gsi1pk', composite: ['userId'] } },
  }
);

// ─── Notifications ───────────────────────────────────────────────
export const NotificationsEntity = makeEntity(
  'syntheon-notifications',
  'DYNAMO_TABLE_NOTIFICATIONS',
  'notification',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    orgId: { type: 'string', required: true },
    type: { type: 'string', required: true },
    title: { type: 'string', required: true },
    message: { type: 'string' },
    ticketId: { type: 'string' },
    read: { type: 'boolean', default: false },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['userId'] },
      sk: { field: 'sk', composite: ['orgId', 'createdAt'] },
    },
  }
);

// ─── Labels ──────────────────────────────────────────────────────
export const LabelsEntity = makeEntity(
  'syntheon-labels',
  'DYNAMO_TABLE_LABELS',
  'label',
  {
    id: { type: 'string', required: true },
    orgId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    color: { type: 'string', default: '#6b7280' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: { pk: { field: 'pk', composite: ['id'] }, sk: { field: 'sk', template: 'label' } },
    byOrg: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['orgId'] },
      sk: { field: 'gsi1sk', composite: ['name'] },
    },
  }
);

// ─── Milestones ──────────────────────────────────────────────────
export const MilestonesEntity = makeEntity(
  'syntheon-milestones',
  'DYNAMO_TABLE_MILESTONES',
  'milestone',
  {
    id: { type: 'string', required: true },
    orgId: { type: 'string', required: true },
    projectId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string', default: '' },
    dueDate: { type: 'string' },
    status: { type: 'string', default: 'planned' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: { pk: { field: 'pk', composite: ['id'] }, sk: { field: 'sk', template: 'milestone' } },
    byProject: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['projectId'] },
      sk: { field: 'gsi1sk', composite: ['createdAt'] },
    },
    byOrg: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['orgId'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
  }
);

// ─── Sprints ──────────────────────────────────────────────────────
export const SprintsEntity = makeEntity(
  'syntheon-sprints',
  'DYNAMO_TABLE_SPRINTS',
  'sprint',
  {
    id: { type: 'string', required: true },
    orgId: { type: 'string', required: true },
    projectId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    goal: { type: 'string', default: '' },
    startDate: { type: 'string', required: true },
    endDate: { type: 'string', required: true },
    status: { type: 'string', default: 'planning' },
    review: { type: 'string' },
    createdAt: { type: 'string', default: () => new Date().toISOString() },
    updatedAt: { type: 'string', default: () => new Date().toISOString() },
  },
  {
    primary: { pk: { field: 'pk', composite: ['id'] }, sk: { field: 'sk', template: 'sprint' } },
    byProject: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['projectId'] },
      sk: { field: 'gsi1sk', composite: ['createdAt'] },
    },
    byOrg: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['orgId'] },
      sk: { field: 'gsi2sk', composite: ['createdAt'] },
    },
  }
);

// ─── Deletion Requests (DPDP/GDPR workflow) ──────────────────────
export const DeletionRequestsEntity = makeEntity(
  'syntheon-deletion-requests',
  'DYNAMO_TABLE_DELETION_REQUESTS',
  'deletionRequest',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    orgId: { type: 'string' },
    scope: { type: 'string', required: true },
    status: { type: 'string', default: 'pending' },
    requestedAt: { type: 'string', default: () => new Date().toISOString() },
    scheduledFor: { type: 'string', required: true },
    warningDueAt: { type: 'string', required: true },
    warningSentAt: { type: 'string' },
    processedAt: { type: 'string' },
    cancelledAt: { type: 'string' },
    reason: { type: 'string' },
    retentionNotes: { type: 'string' },
    processorReceipts: { type: 'any', default: {} },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['id'] },
      sk: { field: 'sk', template: 'deletionRequest' },
    },
    byUser: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['userId'] },
      sk: { field: 'gsi1sk', composite: ['requestedAt'] },
    },
    byStatus: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['status'] },
      sk: { field: 'gsi2sk', composite: ['scheduledFor'] },
    },
    byOrg: {
      index: 'gsi3',
      pk: { field: 'gsi3pk', composite: ['orgId'] },
      sk: { field: 'gsi3sk', composite: ['requestedAt'] },
    },
  }
);

// ─── Consent Records (DPDP Act 2023) ─────────────────────────────
export const ConsentRecordsEntity = makeEntity(
  'syntheon-consent-records',
  'DYNAMO_TABLE_CONSENT_RECORDS',
  'consentRecord',
  {
    id: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    consentVersion: { type: 'string', required: true },
    purposes: { type: 'any', required: true },
    ipAddress: { type: 'string' },
    deviceId: { type: 'string' },
    userAgent: { type: 'string' },
    givenAt: { type: 'string', default: () => new Date().toISOString() },
    withdrawnAt: { type: 'string' },
    status: { type: 'string', default: 'active' },
  },
  {
    primary: {
      pk: { field: 'pk', composite: ['id'] },
      sk: { field: 'sk', template: 'consentRecord' },
    },
    byUser: {
      index: 'gsi1',
      pk: { field: 'gsi1pk', composite: ['userId'] },
      sk: { field: 'gsi1sk', composite: ['givenAt'] },
    },
    byStatus: {
      index: 'gsi2',
      pk: { field: 'gsi2pk', composite: ['status'] },
      sk: { field: 'gsi2sk', composite: ['givenAt'] },
    },
  }
);
