import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { countMeetingsSince, countTicketsForOrg } from '@/lib/db';
import { PLAN_LIMITS } from '@/lib/billing-limits';

export async function GET() {
  try {
    const { userId, orgId, has } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const isMax = has?.({ plan: 'user_max' }) || has?.({ plan: 'org:org_max' });
    const isPro = has?.({ plan: 'user_pro' }) || has?.({ plan: 'org:org_pro' });
    const tier = isMax ? 'max' : isPro ? 'pro' : 'free';
    const limits = PLAN_LIMITS[tier];

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const meetingCap = Number.isFinite(limits.meetings) ? limits.meetings + 1 : 100;
    const ticketCap = Number.isFinite(limits.tickets) ? limits.tickets + 1 : 100;

    const [meetingsUsed, ticketsUsed] = await Promise.all([
      countMeetingsSince(orgId, monthStart, meetingCap),
      countTicketsForOrg(orgId, ticketCap),
    ]);

    return NextResponse.json(
      {
        meetingsUsed,
        meetingsLimit: limits.meetings === Infinity ? null : limits.meetings,
        ticketsUsed,
        ticketsLimit: limits.tickets === Infinity ? null : limits.tickets,
        plan: tier,
      },
      { headers: { 'Cache-Control': 'private, max-age=30' } }
    );
  } catch (error) {
    console.error('Failed to fetch usage:', error);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
