'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

interface NotificationItem {
  id: string;
  read: boolean;
  [key: string]: unknown;
}

/** High-traffic write path: mark one notification read with optimistic cache update. */
export function useMarkNotificationRead() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to mark notification as read');
    },
    onMutate: async (id) => {
      if (!orgId) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all(orgId) });
      const prevList = queryClient.getQueryData<NotificationItem[]>(
        queryKeys.notifications.list(orgId)
      );
      const prevUnread = queryClient.getQueryData<number>(
        queryKeys.notifications.unreadCount(orgId)
      );
      queryClient.setQueryData<NotificationItem[]>(
        queryKeys.notifications.list(orgId),
        (prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? []
      );
      queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(orgId), (c) =>
        Math.max((c ?? 1) - 1, 0)
      );
      return { prevList, prevUnread };
    },
    onError: (_err, _id, ctx) => {
      if (!orgId || !ctx) return;
      if (ctx.prevList) {
        queryClient.setQueryData(queryKeys.notifications.list(orgId), ctx.prevList);
      }
      if (typeof ctx.prevUnread === 'number') {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(orgId), ctx.prevUnread);
      }
    },
    onSettled: () => {
      if (!orgId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all(orgId) });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark all notifications as read');
    },
    onMutate: async () => {
      if (!orgId) return;
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all(orgId) });
      const prevList = queryClient.getQueryData<NotificationItem[]>(
        queryKeys.notifications.list(orgId)
      );
      const prevUnread = queryClient.getQueryData<number>(
        queryKeys.notifications.unreadCount(orgId)
      );
      queryClient.setQueryData<NotificationItem[]>(
        queryKeys.notifications.list(orgId),
        (prev) => prev?.map((n) => ({ ...n, read: true })) ?? []
      );
      queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(orgId), 0);
      return { prevList, prevUnread };
    },
    onError: (_err, _vars, ctx) => {
      if (!orgId || !ctx) return;
      if (ctx.prevList) {
        queryClient.setQueryData(queryKeys.notifications.list(orgId), ctx.prevList);
      }
      if (typeof ctx.prevUnread === 'number') {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(orgId), ctx.prevUnread);
      }
    },
    onSettled: () => {
      if (!orgId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all(orgId) });
    },
  });
}
