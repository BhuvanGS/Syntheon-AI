import { NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { handleClerkWebhook } from '@/lib/clerk-webhook';

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Verification failed', { status: 400 });
  }

  try {
    await handleClerkWebhook(evt);
  } catch (err) {
    console.error('Webhook handler error:', err);
  }

  return new Response('OK', { status: 200 });
}
