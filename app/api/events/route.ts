import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addClient, removeClient } from '@/lib/event-bus';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clientId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  let pingInterval: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      addClient({ id: clientId, controller, userId, orgId: orgId ?? undefined });

      const encoder = new TextEncoder();

      // Send initial connected event
      controller.enqueue(encoder.encode(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`));

      // Heartbeat ping every 15s to keep connection alive (prevents gateway 504)
      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch {
          if (pingInterval) clearInterval(pingInterval);
          removeClient(clientId);
        }
      }, 15000);
    },
    cancel() {
      if (pingInterval) clearInterval(pingInterval);
      removeClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
