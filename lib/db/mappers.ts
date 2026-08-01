import type {
  Meeting,
  SpecBlock,
  Ticket,
  TicketPriority,
  TicketType,
  TicketEstimate,
  Project,
  TicketDependency,
  DependencyType,
  DependencyStrength,
  Notification,
  ProjectMember,
} from './types';

export function entityToMeeting(e: any): Meeting {
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
export function entityToMeetingSummary(e: any): Meeting {
  return {
    ...entityToMeeting(e),
    transcript: '',
    filePath: '',
    summary: undefined,
  };
}

export function entityToTicket(e: any): Ticket {
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

export function entityToSpec(e: any): SpecBlock {
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

export function entityToProject(e: any): Project {
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

export function entityToTicketDependency(e: any): TicketDependency {
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

export function entityToNotification(e: any): Notification {
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

export function entityToProjectMember(e: any): ProjectMember {
  return {
    id: e.id,
    project_id: e.projectId,
    org_id: e.orgId,
    user_id: e.userId,
    role: e.role as 'admin' | 'manager' | 'member',
    created_at: e.createdAt,
  };
}
