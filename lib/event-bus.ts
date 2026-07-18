// lib/event-bus.ts — SSE event bus with DynamoDB cross-instance fan-out.
// Local clients get immediate delivery; other instances poll Dynamo for new events.

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

interface Client {
  id: string;
  controller: ReadableStreamDefaultController;
  userId?: string;
  orgId?: string;
  lastEventKey?: string;
}

const clients = new Map<string, Client>();
const locallyPublished = new Set<string>();
const GLOBAL_CHANNEL = '__global__';
const EVENT_TTL_SECONDS = 120;
const POLL_INTERVAL_MS = 1500;

function formatSse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sendToClient(client: Client, eventName: string, data: unknown) {
  try {
    client.controller.enqueue(new TextEncoder().encode(formatSse(eventName, data)));
  } catch {
    clients.delete(client.id);
  }
}

function deliverLocal(event: SseEvent, orgId?: string) {
  const eventName = event.type;
  const data = 'payload' in event ? event.payload : {};
  for (const client of clients.values()) {
    if (orgId && client.orgId !== orgId) continue;
    sendToClient(client, eventName, data);
  }
}

function advanceClientCursors(channelId: string, eventKey: string) {
  for (const client of clients.values()) {
    const clientChannel = client.orgId || GLOBAL_CHANNEL;
    if (channelId === GLOBAL_CHANNEL || clientChannel === channelId) {
      if ((client.lastEventKey ?? '') < eventKey) {
        client.lastEventKey = eventKey;
      }
    }
  }
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
    locallyPublished.add(eventKey);
    advanceClientCursors(channelId, eventKey);
    setTimeout(() => locallyPublished.delete(eventKey), EVENT_TTL_SECONDS * 1000);
  } catch (err) {
    console.error('[event-bus] Failed to persist SSE event:', err);
  }
}

export function addClient(client: Client) {
  clients.set(client.id, { ...client, lastEventKey: new Date().toISOString() });
}

export function removeClient(id: string) {
  clients.delete(id);
}

export function broadcast(event: SseEvent) {
  deliverLocal(event);
  void persistEvent(GLOBAL_CHANNEL, event);
}

export function broadcastToOrg(orgId: string, event: SseEvent) {
  deliverLocal(event, orgId);
  void persistEvent(orgId, event);
}

async function pollChannel(
  channelId: string,
  afterKey: string
): Promise<{ eventKey: string; type: string; payload: unknown }[]> {
  try {
    const res = await SseEventsEntity.query
      .primary({ channelId })
      .gt({ eventKey: afterKey })
      .go({ order: 'asc', limit: 50 });
    return (res.data ?? []).map((row: any) => {
      let payload: unknown = {};
      try {
        payload = JSON.parse(row.payload ?? '{}');
      } catch {
        payload = {};
      }
      return { eventKey: row.eventKey as string, type: row.type as string, payload };
    });
  } catch (err) {
    console.error('[event-bus] Poll failed:', err);
    return [];
  }
}

async function pollRemoteEvents() {
  if (clients.size === 0) return;

  const channels = new Set<string>([GLOBAL_CHANNEL]);
  for (const client of clients.values()) {
    if (client.orgId) channels.add(client.orgId);
  }

  for (const channelId of channels) {
    const channelClients = [...clients.values()].filter((c) =>
      channelId === GLOBAL_CHANNEL ? true : c.orgId === channelId
    );
    if (channelClients.length === 0) continue;

    const minKey = channelClients.reduce(
      (min, c) => ((c.lastEventKey ?? '') < min ? (c.lastEventKey ?? '') : min),
      channelClients[0]?.lastEventKey ?? new Date(0).toISOString()
    );

    const events = await pollChannel(channelId, minKey);
    for (const event of events) {
      if (locallyPublished.has(event.eventKey)) {
        advanceClientCursors(channelId, event.eventKey);
        continue;
      }
      for (const client of channelClients) {
        if ((client.lastEventKey ?? '') >= event.eventKey) continue;
        sendToClient(client, event.type, event.payload);
        client.lastEventKey = event.eventKey;
      }
    }
  }
}

setInterval(() => {
  void pollRemoteEvents();
}, POLL_INTERVAL_MS);
