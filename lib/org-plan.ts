import { clerkClient } from '@clerk/nextjs/server';
import { isBetaActive } from '@/lib/beta';

/** Free / beta orgs are capped at this many members (including pending invites where applicable). */
export const FREE_ORG_SEAT_LIMIT = 3;

/**
 * Whether the *target organization* is on a paid org plan.
 * Uses Clerk Billing when available; during beta always treats orgs as free-capped.
 */
export async function isOrganizationPaid(orgId: string): Promise<boolean> {
  if (isBetaActive()) return false;

  try {
    const client = await clerkClient();
    const billing = (
      client as {
        billing?: {
          getOrganizationBillingSubscription?: (id: string) => Promise<unknown>;
        };
      }
    ).billing;

    if (!billing?.getOrganizationBillingSubscription) return false;

    const sub = (await billing.getOrganizationBillingSubscription(orgId)) as {
      plan?: { slug?: string };
      subscriptionItems?: Array<{ plan?: { slug?: string } }>;
      items?: Array<{ plan?: { slug?: string } }>;
    };

    const slugs: string[] = [];
    if (sub?.plan?.slug) slugs.push(sub.plan.slug);
    for (const item of sub?.subscriptionItems ?? sub?.items ?? []) {
      if (item?.plan?.slug) slugs.push(item.plan.slug);
    }

    return slugs.some((slug) => {
      const s = slug.toLowerCase();
      return (
        s.includes('org_pro') ||
        s.includes('org_max') ||
        s.includes('org:org_pro') ||
        s.includes('org:org_max') ||
        s === 'pro' ||
        s === 'max'
      );
    });
  } catch {
    // No subscription or Billing unavailable → treat as free
    return false;
  }
}
