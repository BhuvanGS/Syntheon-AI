'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

type StatusChange = { ticketId: string; status: string };

/** Bulk status patch used by kanban save / drag commits. */
export function usePatchTicketStatusesMutation() {
  return useMutation({
    mutationFn: async (body: { changes: StatusChange[]; bypassGate?: boolean }) => {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    },
    // Callers apply narrow setQueryData; SSE / explicit invalidate covers the rest.
  });
}

export function useDeleteTicketMutation() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to delete ticket');
      return { ticketId, data };
    },
    onSuccess: () => {
      if (!orgId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all(orgId) });
    },
  });
}

export function useBulkTicketsMutation() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch('/api/tickets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Bulk update failed');
      return data;
    },
    onSuccess: () => {
      if (!orgId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all(orgId) });
    },
  });
}

export function useBulkDeleteTicketsMutation() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => fetch(`/api/tickets/${id}`, { method: 'DELETE' })));
      return ids;
    },
    onSuccess: () => {
      if (!orgId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all(orgId) });
    },
  });
}

export function useUpdateTicketRanksMutation() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rankUpdates: Array<{ id: string; rank: number }>) => {
      const res = await fetch('/api/tickets/ranks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rankUpdates }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update ranks');
      }
    },
    onSuccess: () => {
      if (!orgId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all(orgId) });
    },
  });
}

export function usePatchTicketMutation() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, body }: { ticketId: string; body: Record<string, unknown> }) => {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data, ticketId };
    },
    onSuccess: (result) => {
      if (!orgId || !result.ok) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all(orgId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(orgId, result.ticketId),
      });
    },
  });
}
