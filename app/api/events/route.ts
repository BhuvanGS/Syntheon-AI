import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { addClient, removeClient } from '@/lib/event-bus';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clientId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const stream = new ReadableStream({
    start(controller) {
      addClient({ id: clientId, controller, userId, orgId: orgId ?? undefined });

      // Send initial connected event
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`event: connected\ndata: {"clientId":"${clientId}"}\n\n`));
    },
    cancel() {
      removeClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
    },
  });
}
