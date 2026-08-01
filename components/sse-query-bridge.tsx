'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useSse } from '@/components/sse-provider';
import { queryKeys } from '@/lib/query/keys';

const DEBOUNCE_MS = 300;

/**
 * Bridges SSE realtime events into TanStack Query cache invalidation.
 * Debounces bursts so a flurry of ticket updates collapses into one refetch wave.
 */
export function SseQueryBridge() {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const { on, off } = useSse();
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!orgId) return;

    const schedule = (bucket: string, run: () => void) => {
      const existing = timersRef.current.get(bucket);
      if (existing) clearTimeout(existing);
      timersRef.current.set(
        bucket,
        setTimeout(() => {
          timersRef.current.delete(bucket);
          run();
        }, DEBOUNCE_MS)
      );
    };

    const invalidateProjectSecondary = (
      payload: Record<string, unknown> | undefined,
      includeDeleted: boolean
    ) => {
      const projectId = typeof payload?.projectId === 'string' ? payload.projectId : null;
      if (!projectId) return;
      schedule(`project-secondary-${projectId}`, () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.sprints(orgId, projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.milestones(orgId, projectId),
        });
        if (includeDeleted) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.projects.deletedActivities(orgId, projectId),
          });
        }
      });
    };

    const invalidateTickets = (payload?: Record<string, unknown>) => {
      schedule('tickets', () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all(orgId) });
        const meetingId = typeof payload?.meetingId === 'string' ? payload.meetingId : null;
        if (meetingId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.byMeeting(orgId, meetingId),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.meetings.detail(orgId, meetingId),
          });
        }
      });
    };

    const invalidateMeetings = (payload?: Record<string, unknown>) => {
      schedule('meetings', () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all(orgId) });
        const meetingId = typeof payload?.meetingId === 'string' ? payload.meetingId : null;
        if (meetingId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.meetings.detail(orgId, meetingId),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.tickets.byMeeting(orgId, meetingId),
          });
        }
        // Meeting ready often creates tickets — refresh ticket lists too.
        void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all(orgId) });
      });
    };

    const invalidateProjects = () => {
      schedule('projects', () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(orgId) });
      });
    };

    const invalidateNotifications = () => {
      schedule('notifications', () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all(orgId) });
      });
    };

    const onTicketUpdated = (payload: Record<string, unknown>) => {
      const ticketId = typeof payload.ticketId === 'string' ? payload.ticketId : null;
      const changes =
        payload.changes && typeof payload.changes === 'object'
          ? (payload.changes as Record<string, unknown>)
          : null;

      // Prefer a surgical patch when we have a detail cache entry + changes.
      if (ticketId && changes) {
        const detailKey = queryKeys.tickets.detail(orgId, ticketId);
        const existing = queryClient.getQueryData<Record<string, unknown>>(detailKey);
        if (existing) {
          queryClient.setQueryData(detailKey, { ...existing, ...changes });
        }
      }

      invalidateTickets(payload);
      invalidateProjectSecondary(payload, false);
    };

    const onTicketCreated = (payload: Record<string, unknown>) => {
      invalidateTickets(payload);
      invalidateProjectSecondary(payload, false);
    };
    const onTicketDeleted = (payload: Record<string, unknown>) => {
      invalidateTickets(payload);
      invalidateProjectSecondary(payload, true);
    };

    const onMeetingReady = (payload: Record<string, unknown>) => invalidateMeetings(payload);
    const onMeetingFailed = (payload: Record<string, unknown>) => invalidateMeetings(payload);
    const onMeetingStatus = (payload: Record<string, unknown>) => invalidateMeetings(payload);

    const onProjectCreated = () => invalidateProjects();
    const onProjectUpdated = () => invalidateProjects();
    const onProjectDeleted = () => invalidateProjects();

    const onNotificationNew = () => invalidateNotifications();

    on('ticket_updated', onTicketUpdated);
    on('ticket_created', onTicketCreated);
    on('ticket_deleted', onTicketDeleted);
    on('meeting_ready', onMeetingReady);
    on('meeting_failed', onMeetingFailed);
    on('meeting_status_changed', onMeetingStatus);
    on('project_created', onProjectCreated);
    on('project_updated', onProjectUpdated);
    on('project_deleted', onProjectDeleted);
    on('notification_new', onNotificationNew);

    return () => {
      off('ticket_updated', onTicketUpdated);
      off('ticket_created', onTicketCreated);
      off('ticket_deleted', onTicketDeleted);
      off('meeting_ready', onMeetingReady);
      off('meeting_failed', onMeetingFailed);
      off('meeting_status_changed', onMeetingStatus);
      off('project_created', onProjectCreated);
      off('project_updated', onProjectUpdated);
      off('project_deleted', onProjectDeleted);
      off('notification_new', onNotificationNew);
      for (const timer of timersRef.current.values()) clearTimeout(timer);
      timersRef.current.clear();
    };
  }, [orgId, on, off, queryClient]);

  return null;
}
