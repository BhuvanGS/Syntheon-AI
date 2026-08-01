'use client';

import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, unwrapList, unwrapPaginated } from '@/lib/query/fetcher';
import { queryKeys } from '@/lib/query/keys';

export type ProjectMemberRow = {
  id: string;
  project_id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'member';
};

export type ProjectMilestone = {
  id: string;
  name: string;
  description: string;
  due_date?: string | null;
  status: string;
  created_at: string;
};

export type ProjectSprint = {
  id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: string;
  review?: string | null;
  created_at: string;
};

export type DeletedTicketActivity = {
  id: string;
  ticket_id: string;
  user_id: string;
  action_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function useProjectsQuery(enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey: orgId ? queryKeys.projects.list(orgId) : ['projects', 'disabled'],
    queryFn: async () => {
      const data = await apiGet<unknown>('/api/projects');
      return unwrapList(data, 'projects');
    },
    enabled: Boolean(orgId) && enabled,
  });
}

export function useProjectMembersQuery(projectId: string | null | undefined, enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && projectId
        ? queryKeys.projects.members(orgId, projectId)
        : ['projects', 'members', 'disabled'],
    queryFn: () => apiGet<ProjectMemberRow[]>(`/api/projects/${projectId}/members`),
    enabled: Boolean(orgId && projectId) && enabled,
  });
}

export function useProjectMilestonesQuery(projectId: string | null | undefined, enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && projectId
        ? queryKeys.projects.milestones(orgId, projectId)
        : ['projects', 'milestones', 'disabled'],
    queryFn: () => apiGet<ProjectMilestone[]>(`/api/projects/${projectId}/milestones`),
    enabled: Boolean(orgId && projectId) && enabled,
  });
}

export function useProjectSprintsQuery(projectId: string | null | undefined, enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && projectId
        ? queryKeys.projects.sprints(orgId, projectId)
        : ['projects', 'sprints', 'disabled'],
    queryFn: () => apiGet<ProjectSprint[]>(`/api/projects/${projectId}/sprints`),
    enabled: Boolean(orgId && projectId) && enabled,
  });
}

export function useProjectDeletedActivitiesQuery(
  projectId: string | null | undefined,
  enabled = true
) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey:
      orgId && projectId
        ? queryKeys.projects.deletedActivities(orgId, projectId)
        : ['projects', 'deletedActivities', 'disabled'],
    queryFn: () => apiGet<DeletedTicketActivity[]>(`/api/projects/${projectId}/deleted-activities`),
    enabled: Boolean(orgId && projectId) && enabled,
  });
}

/** Invalidate project-scoped secondary resources (members/sprints/milestones/deleted). */
export function useInvalidateProjectResources(projectId: string | null | undefined) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(
    (which: 'members' | 'milestones' | 'sprints' | 'deletedActivities' | 'all' = 'all') => {
      if (!orgId || !projectId) return Promise.resolve();
      const jobs: Promise<unknown>[] = [];
      if (which === 'all' || which === 'members') {
        jobs.push(
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.members(orgId, projectId),
          })
        );
      }
      if (which === 'all' || which === 'milestones') {
        jobs.push(
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.milestones(orgId, projectId),
          })
        );
      }
      if (which === 'all' || which === 'sprints') {
        jobs.push(
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.sprints(orgId, projectId),
          })
        );
      }
      if (which === 'all' || which === 'deletedActivities') {
        jobs.push(
          queryClient.invalidateQueries({
            queryKey: queryKeys.projects.deletedActivities(orgId, projectId),
          })
        );
      }
      return Promise.all(jobs);
    },
    [orgId, projectId, queryClient]
  );
}

export function useMeetingsQuery(
  params?: { projectId?: string | null; limit?: number; offset?: number },
  enabled = true
) {
  const { orgId } = useAuth();
  const projectId = params?.projectId ?? null;
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;

  return useQuery({
    queryKey: orgId
      ? queryKeys.meetings.list(orgId, { projectId, limit, offset })
      : ['meetings', 'disabled'],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (projectId) search.set('projectId', projectId);
      search.set('limit', String(limit));
      if (offset > 0) search.set('offset', String(offset));
      const data = await apiGet<unknown>(`/api/meetings?${search.toString()}`);
      return unwrapPaginated(data, 'meetings');
    },
    enabled: Boolean(orgId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useTicketsQuery(
  params?: { projectId?: string | null; limit?: number; offset?: number },
  enabled = true
) {
  const { orgId } = useAuth();
  const projectId = params?.projectId ?? null;
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;

  return useQuery({
    queryKey: orgId
      ? queryKeys.tickets.list(orgId, { projectId, limit, offset })
      : ['tickets', 'disabled'],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (projectId) search.set('projectId', projectId);
      search.set('limit', String(limit));
      if (offset > 0) search.set('offset', String(offset));
      const data = await apiGet<unknown>(`/api/tickets?${search.toString()}`);
      return unwrapPaginated(data, 'tickets');
    },
    enabled: Boolean(orgId) && enabled,
    placeholderData: keepPreviousData,
  });
}

/** Invalidate org-scoped workspace lists after local mutations. */
export function useInvalidateWorkspace() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (!orgId) return Promise.resolve();
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(orgId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all(orgId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all(orgId) }),
    ]);
  }, [orgId, queryClient]);
}

export type UsageSummary = {
  meetingsUsed: number;
  meetingsLimit: number;
};

export type TrialStatus = {
  isTrial: boolean;
  daysLeft: number | null;
  expired: boolean;
  trialDays?: number;
};

export type IntegrationsStatus = {
  googleConnected: boolean;
};

export function useUsageQuery(enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey: orgId ? queryKeys.usage.all(orgId) : ['usage', 'disabled'],
    queryFn: () => apiGet<UsageSummary>('/api/usage'),
    enabled: Boolean(orgId) && enabled,
    staleTime: 60_000,
  });
}

export function useTrialQuery(enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey: orgId ? queryKeys.trial.status(orgId) : ['trial', 'disabled'],
    queryFn: () => apiGet<TrialStatus>(`/api/organizations/${orgId}/trial`),
    enabled: Boolean(orgId) && enabled,
    staleTime: 60_000,
  });
}

export function useIntegrationsStatusQuery(enabled = true) {
  const { orgId } = useAuth();

  return useQuery({
    queryKey: orgId ? queryKeys.integrations.status(orgId) : ['integrations', 'disabled'],
    queryFn: () => apiGet<IntegrationsStatus>('/api/integrations/status'),
    enabled: Boolean(orgId) && enabled,
    staleTime: 60_000,
  });
}
