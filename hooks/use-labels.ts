'use client';

import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, unwrapList } from '@/lib/query/fetcher';
import { queryKeys } from '@/lib/query/keys';

export interface Label {
  id: string;
  name: string;
  color: string;
  org_id?: string;
}

export function useLabels() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: orgId ? queryKeys.labels.list(orgId) : ['labels', 'disabled'],
    queryFn: async () => {
      const data = await apiGet<{ labels?: Label[] } | Label[]>('/api/labels');
      return unwrapList<Label>(data, 'labels');
    },
    enabled: Boolean(orgId),
  });

  const labelMap = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    for (const label of query.data ?? []) {
      map[label.id] = { name: label.name, color: label.color };
    }
    return map;
  }, [query.data]);

  const invalidate = () => {
    if (!orgId) return;
    return queryClient.invalidateQueries({ queryKey: queryKeys.labels.all(orgId) });
  };

  return {
    labels: query.data ?? [],
    labelMap,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
