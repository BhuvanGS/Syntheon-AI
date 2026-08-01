/**
 * Org-scoped TanStack Query key factories.
 * Always put `orgId` first so cache clears and invalidations stay tenant-safe.
 */

export const queryKeys = {
  all: (orgId: string) => [orgId] as const,

  projects: {
    all: (orgId: string) => [orgId, 'projects'] as const,
    list: (orgId: string) => [orgId, 'projects', 'list'] as const,
    detail: (orgId: string, projectId: string) => [orgId, 'projects', 'detail', projectId] as const,
    byMeeting: (orgId: string, meetingId: string) =>
      [orgId, 'projects', 'byMeeting', meetingId] as const,
    members: (orgId: string, projectId: string) =>
      [orgId, 'projects', projectId, 'members'] as const,
    milestones: (orgId: string, projectId: string) =>
      [orgId, 'projects', projectId, 'milestones'] as const,
    sprints: (orgId: string, projectId: string) =>
      [orgId, 'projects', projectId, 'sprints'] as const,
    deletedActivities: (orgId: string, projectId: string) =>
      [orgId, 'projects', projectId, 'deletedActivities'] as const,
  },

  meetings: {
    all: (orgId: string) => [orgId, 'meetings'] as const,
    list: (
      orgId: string,
      params?: { projectId?: string | null; limit?: number; offset?: number }
    ) => [orgId, 'meetings', 'list', params ?? {}] as const,
    detail: (orgId: string, meetingId: string) => [orgId, 'meetings', 'detail', meetingId] as const,
  },

  tickets: {
    all: (orgId: string) => [orgId, 'tickets'] as const,
    list: (
      orgId: string,
      params?: { projectId?: string | null; limit?: number; offset?: number }
    ) => [orgId, 'tickets', 'list', params ?? {}] as const,
    byMeeting: (orgId: string, meetingId: string) =>
      [orgId, 'tickets', 'byMeeting', meetingId] as const,
    detail: (orgId: string, ticketId: string) => [orgId, 'tickets', 'detail', ticketId] as const,
  },

  labels: {
    all: (orgId: string) => [orgId, 'labels'] as const,
    list: (orgId: string) => [orgId, 'labels', 'list'] as const,
  },

  notifications: {
    all: (orgId: string) => [orgId, 'notifications'] as const,
    list: (orgId: string) => [orgId, 'notifications', 'list'] as const,
    unreadCount: (orgId: string) => [orgId, 'notifications', 'unreadCount'] as const,
  },

  search: {
    all: (orgId: string) => [orgId, 'search'] as const,
    query: (orgId: string, q: string) => [orgId, 'search', q] as const,
  },

  usage: {
    all: (orgId: string) => [orgId, 'usage'] as const,
  },

  integrations: {
    all: (orgId: string) => [orgId, 'integrations'] as const,
  },
} as const;
