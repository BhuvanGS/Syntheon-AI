'use client';

import { useMemo } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/lib/query/fetcher';
import { queryKeys } from '@/lib/query/keys';

/** Panel data stays fresh longer so reopen within a minute skips the network. */
export const TICKET_PANEL_STALE_TIME = 60_000;

export type TicketComment = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
};

export type TicketAttachment = {
  id: string;
  filename: string;
  file_url: string;
  file_size: number;
  file_type?: string | null;
  created_at: string;
};

export type TicketActivity = {
  id: string;
  ticket_id: string;
  user_id: string;
  action_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type TicketDependency = {
  id: string;
  ticket_id: string;
  depends_on_ticket_id: string;
  dependency_type: 'data' | 'structural' | 'logical' | 'resource';
  strength: 'soft' | 'hard';
  note?: string | null;
  ignore_count: number;
  escalated: boolean;
};

export type TicketDependenciesPayload = {
  parents: TicketDependency[];
  children: TicketDependency[];
};

export type GraphTicket = {
  id: string;
  title: string;
  status: string;
  assignee?: string | null;
};

export type GraphDependency = {
  id: string;
  ticket_id: string;
  depends_on_ticket_id: string;
  dependency_type: string;
  strength: 'soft' | 'hard';
  escalated: boolean;
};

export type ProjectDependenciesGraph = {
  tickets: GraphTicket[];
  dependencies: GraphDependency[];
};

export type OrgUser = {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  imageUrl?: string;
};

export type ActivityUserInfo = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  imageUrl?: string;
};

export function useTicketCommentsQuery(ticketId: string | null | undefined, enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && ticketId
        ? queryKeys.tickets.comments(orgId, ticketId)
        : ['tickets', 'comments', 'disabled'],
    queryFn: () => apiGet<TicketComment[]>(`/api/tickets/${ticketId}/comments`),
    enabled: Boolean(orgId && ticketId) && enabled,
    staleTime: TICKET_PANEL_STALE_TIME,
  });
}

export function useTicketAttachmentsQuery(ticketId: string | null | undefined, enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && ticketId
        ? queryKeys.tickets.attachments(orgId, ticketId)
        : ['tickets', 'attachments', 'disabled'],
    queryFn: () => apiGet<TicketAttachment[]>(`/api/tickets/${ticketId}/attachments`),
    enabled: Boolean(orgId && ticketId) && enabled,
    staleTime: TICKET_PANEL_STALE_TIME,
  });
}

export function useTicketActivitiesQuery(ticketId: string | null | undefined, enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && ticketId
        ? queryKeys.tickets.activities(orgId, ticketId)
        : ['tickets', 'activities', 'disabled'],
    queryFn: () => apiGet<TicketActivity[]>(`/api/tickets/${ticketId}/activities`),
    enabled: Boolean(orgId && ticketId) && enabled,
    staleTime: TICKET_PANEL_STALE_TIME,
  });
}

export function useOrgUsersQuery(enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey: orgId ? queryKeys.users.list(orgId) : ['users', 'disabled'],
    queryFn: async () => {
      const data = await apiGet<{ users?: OrgUser[] }>('/api/users');
      return data.users ?? [];
    },
    enabled: Boolean(orgId) && enabled,
    staleTime: 5 * 60_000,
  });
}

/** Activities + org users merged into a display map (current user preferred). */
export function useTicketActivityPanelQuery(ticketId: string | null | undefined, enabled = true) {
  const { user } = useUser();
  const activitiesQuery = useTicketActivitiesQuery(ticketId, enabled);
  const usersQuery = useOrgUsersQuery(enabled && Boolean(ticketId));

  const userMap = useMemo(() => {
    const map = new Map<string, ActivityUserInfo>();
    const activities = activitiesQuery.data ?? [];
    const userIds = new Set(activities.map((a) => a.user_id));

    if (user && userIds.has(user.id)) {
      map.set(user.id, {
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        username: user.username || undefined,
        email: user.primaryEmailAddress?.emailAddress || undefined,
        imageUrl: user.imageUrl || undefined,
      });
    }

    for (const u of usersQuery.data ?? []) {
      if (!userIds.has(u.id) || map.has(u.id)) continue;
      const parts = (u.name ?? '').trim().split(/\s+/);
      map.set(u.id, {
        firstName: parts[0] || undefined,
        lastName: parts.slice(1).join(' ') || undefined,
        username: u.username || undefined,
        email: u.email || undefined,
        imageUrl: u.imageUrl || undefined,
      });
    }

    return map;
  }, [activitiesQuery.data, usersQuery.data, user]);

  return {
    activities: activitiesQuery.data ?? [],
    userMap,
    isLoading: activitiesQuery.isLoading || (usersQuery.isLoading && !usersQuery.data),
    isFetching: activitiesQuery.isFetching || usersQuery.isFetching,
    error: activitiesQuery.error ?? usersQuery.error,
    refetch: () => Promise.all([activitiesQuery.refetch(), usersQuery.refetch()]),
  };
}

export function useTicketDependenciesQuery(ticketId: string | null | undefined, enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && ticketId
        ? queryKeys.tickets.dependencies(orgId, ticketId)
        : ['tickets', 'dependencies', 'disabled'],
    queryFn: () => apiGet<TicketDependenciesPayload>(`/api/tickets/${ticketId}/dependencies`),
    enabled: Boolean(orgId && ticketId) && enabled,
    staleTime: TICKET_PANEL_STALE_TIME,
  });
}

export function useProjectDependenciesGraphQuery(
  projectId: string | null | undefined,
  enabled = true
) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && projectId
        ? queryKeys.projects.dependencies(orgId, projectId)
        : ['projects', 'dependencies', 'disabled'],
    queryFn: () => apiGet<ProjectDependenciesGraph>(`/api/projects/${projectId}/dependencies`),
    enabled: Boolean(orgId && projectId) && enabled,
    staleTime: TICKET_PANEL_STALE_TIME,
  });
}

/** Prefetch comments + activities when opening / hovering a ticket. */
export function usePrefetchTicketPanels() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return (ticketId: string) => {
    if (!orgId || !ticketId) return;
    void queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.comments(orgId, ticketId),
      queryFn: () => apiGet<TicketComment[]>(`/api/tickets/${ticketId}/comments`),
      staleTime: TICKET_PANEL_STALE_TIME,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.activities(orgId, ticketId),
      queryFn: () => apiGet<TicketActivity[]>(`/api/tickets/${ticketId}/activities`),
      staleTime: TICKET_PANEL_STALE_TIME,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.tickets.attachments(orgId, ticketId),
      queryFn: () => apiGet<TicketAttachment[]>(`/api/tickets/${ticketId}/attachments`),
      staleTime: TICKET_PANEL_STALE_TIME,
    });
  };
}
