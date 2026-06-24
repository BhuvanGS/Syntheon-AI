// lib/event-bus.ts — In-memory SSE event bus for dev mode.
// In production, swap this for Redis Pub/Sub or similar.

export type SseEvent =
  | { type: 'meeting_ready'; payload: { meetingId: string; projectId?: string | null; title: string; ticketCount: number } }
  | { type: 'meeting_failed'; payload: { meetingId: string; projectId?: string | null; title: string } }
  | { type: 'meeting_status_changed'; payload: { meetingId: string; status: string } }
  | { type: 'ticket_updated'; payload: { ticketId: string; projectId?: string | null; meetingId?: string | null; changes: Record<string, unknown> } }
  | { type: 'notification_new'; payload: { userId: string; type: string; title: string; message?: string; ticketId?: string | null } }
  | { type: 'ping' };

interface Client {
  id: string;
  controller: ReadableStreamDefaultController;
  userId?: string;
  orgId?: string;
}

const clients = new Map<string, Client>();

function formatSse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sendToClient(client: Client, eventName: string, data: unknown) {
  try {
    client.controller.enqueue(new TextEncoder().encode(formatSse(eventName, data)));
  } catch {
    // Client disconnected, clean up silently
    clients.delete(client.id);
  }
}

export function addClient(client: Client) {
  clients.set(client.id, client);
}

export function removeClient(id: string) {
  clients.delete(id);
}

export function broadcast(event: SseEvent) {
  const eventName = event.type;
  const data = 'payload' in event ? event.payload : {};
  for (const client of clients.values()) {
    sendToClient(client, eventName, data);
  }
}

export function broadcastToOrg(orgId: string, event: SseEvent) {
  const eventName = event.type;
  const data = 'payload' in event ? event.payload : {};
  for (const client of clients.values()) {
    if (client.orgId === orgId) {
      sendToClient(client, eventName, data);
    }
  }
}

// Keep-alive ping every 30s to prevent proxy timeouts
setInterval(() => {
  for (const client of clients.values()) {
    sendToClient(client, 'ping', {});
  }
}, 30000);
