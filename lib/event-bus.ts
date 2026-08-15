// Cross-instance realtime via Dynamo (TTL). Clients short-poll `/api/events`
// instead of holding an SSE stream on Lambda.

import { randomUUID } from 'crypto';
import { SseEventsEntity } from '@/db/entities';

export type SseEvent =
  | {
      type: 'meeting_ready';
      payload: { meetingId: string; projectId?: string | null; title: string; ticketCount: number };
    }
  | {
      type: 'meeting_failed';
      payload: { meetingId: string; projectId?: string | null; title: string };
    }
  | { type: 'meeting_status_changed'; payload: { meetingId: string; status: string } }
  | {
      type: 'ticket_updated';
      payload: {
        ticketId: string;
        projectId?: string | null;
        meetingId?: string | null;
        changes: Record<string, unknown>;
      };
    }
  | {
      type: 'ticket_created';
      payload: {
        ticketId: string;
        projectId?: string | null;
        meetingId?: string | null;
        title: string;
      };
    }
  | {
      type: 'ticket_deleted';
      payload: {
        ticketId: string;
        projectId?: string | null;
      };
    }
  | {
      type: 'project_created';
      payload: {
        projectId: string;
        name: string;
      };
    }
  | {
      type: 'project_updated';
      payload: {
        projectId: string;
        name?: string;
        context?: string;
      };
    }
  | {
      type: 'project_deleted';
      payload: {
        projectId: string;
      };
    }
  | {
      type: 'notification_new';
      payload: {
        userId: string;
        type: string;
        title: string;
        message?: string;
        ticketId?: string | null;
      };
    }
  | { type: 'ping' };

export type BusEventRow = {
  eventKey: string;
  type: string;
  payload: unknown;
};

const EVENT_TTL_SECONDS = 120;

function userChannel(userId: string) {
  return `user:${userId}`;
}

async function persistEvent(channelId: string, event: SseEvent): Promise<void> {
  if (event.type === 'ping') return;
  const createdAt = new Date().toISOString();
  const eventKey = `${createdAt}#${randomUUID()}`;
  const payload = 'payload' in event ? event.payload : {};
  try {
    await SseEventsEntity.create({
      channelId,
      eventKey,
      type: event.type,
      payload: JSON.stringify(payload),
      createdAt,
      expireAt: Math.floor(Date.now() / 1000) + EVENT_TTL_SECONDS,
    }).go();
  } catch (err) {
    console.error('[event-bus] Failed to persist event:', err);
  }
}

export function broadcastToOrg(orgId: string, event: SseEvent) {
  if (!orgId) return;
  void persistEvent(orgId, event);
}

export function broadcastToUser(userId: string, event: SseEvent) {
  if (!userId) return;
  void persistEvent(userChannel(userId), event);
}

/** @deprecated Prefer broadcastToOrg / broadcastToUser — global fan-out leaks cross-tenant. */
export function broadcast(event: SseEvent) {
  if (event.type === 'notification_new') {
    broadcastToUser(event.payload.userId, event);
  }
}

export async function listChannelEvents(
  channelId: string,
  afterKey: string,
  limit = 50
): Promise<BusEventRow[]> {
  try {
    const res = await SseEventsEntity.query
      .primary({ channelId })
      .gt({ eventKey: afterKey })
      .go({ order: 'asc', limit });
    return (res.data ?? []).map((row: { eventKey: string; type: string; payload?: string }) => {
      let payload: unknown = {};
      try {
        payload = JSON.parse(row.payload ?? '{}');
      } catch {
        payload = {};
      }
      return { eventKey: row.eventKey, type: row.type, payload };
    });
  } catch (err) {
    console.error('[event-bus] Poll failed:', err);
    return [];
  }
}

export async function listRealtimeEvents(input: {
  orgId: string;
  userId: string;
  orgAfter: string;
  userAfter: string;
}): Promise<{
  events: Array<BusEventRow & { channel: 'org' | 'user' }>;
  orgCursor: string;
  userCursor: string;
}> {
  const [orgRows, userRows] = await Promise.all([
    listChannelEvents(input.orgId, input.orgAfter),
    listChannelEvents(userChannel(input.userId), input.userAfter),
  ]);

  const events = [
    ...orgRows.map((row) => ({ ...row, channel: 'org' as const })),
    ...userRows.map((row) => ({ ...row, channel: 'user' as const })),
  ].sort((a, b) => a.eventKey.localeCompare(b.eventKey));

  const lastOrg = orgRows[orgRows.length - 1]?.eventKey ?? input.orgAfter;
  const lastUser = userRows[userRows.length - 1]?.eventKey ?? input.userAfter;

  return { events, orgCursor: lastOrg, userCursor: lastUser };
}
