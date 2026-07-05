import { NextRequest } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET,
    });
  } catch {
    return new Response('Verification failed', { status: 400 });
  }

  try {
    switch (evt.type) {
      case 'subscription.created':
      case 'subscription.active': {
        const { id, payer, items, status } = evt.data;
        const entityId = payer?.organization_id ?? payer?.user_id;
        const plan = items?.[0]?.plan?.slug;
        console.log(
          `[Billing] Subscription ${evt.type}: ${id} — ${entityId} on ${plan} (${status})`
        );
        break;
      }

      case 'subscription.updated': {
        const { id, payer, items, status } = evt.data;
        const entityId = payer?.organization_id ?? payer?.user_id;
        const plan = items?.[0]?.plan?.slug;
        console.log(
          `[Billing] Subscription updated: ${id} — ${entityId} now on ${plan} (${status})`
        );
        break;
      }

      case 'subscription.pastDue': {
        const { id, status } = evt.data;
        console.log(`[Billing] Subscription past due: ${id} (${status})`);
        break;
      }

      case 'subscriptionItem.canceled':
      case 'subscriptionItem.ended': {
        const { payer, plan } = evt.data;
        const entityId = payer?.organization_id ?? payer?.user_id;
        console.log(`[Billing] Subscription item ${evt.type}: ${entityId} — ${plan?.slug}`);
        break;
      }

      case 'subscriptionItem.pastDue': {
        const { payer, plan } = evt.data;
        const entityId = payer?.organization_id ?? payer?.user_id;
        console.log(`[Billing] Subscription item past due: ${entityId} — ${plan?.slug}`);
        break;
      }

      case 'subscriptionItem.freeTrialEnding': {
        const { payer, plan } = evt.data;
        const entityId = payer?.organization_id ?? payer?.user_id;
        console.log(`[Billing] Free trial ending soon: ${entityId} — ${plan?.slug}`);
        break;
      }

      default:
        console.log(`[Billing] Unhandled event: ${evt.type}`);
    }
  } catch (err) {
    console.error('[Billing] Webhook handler error:', err);
  }

  return new Response('OK', { status: 200 });
}
