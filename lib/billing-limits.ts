import { auth } from '@clerk/nextjs/server';
import {
  getMeetings,
  getMeetingsPaginated,
  getTicketsPaginated,
  getProjectsByOrg,
  getProjectsForMember,
} from '@/lib/db';

export const PLAN_LIMITS = {
  free: { meetings: 2, tickets: 25, projects: 1 },
  pro: { meetings: Infinity, tickets: 500, projects: 10 },
  max: { meetings: Infinity, tickets: Infinity, projects: Infinity },
} as const;

type PlanTier = keyof typeof PLAN_LIMITS;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPlanTier(has: any): PlanTier {
  if (has?.({ plan: 'user_max' }) || has?.({ plan: 'org:org_max' })) return 'max';
  if (has?.({ plan: 'user_pro' }) || has?.({ plan: 'org:org_pro' })) return 'pro';
  return 'free';
}

export interface LimitCheck {
  allowed: boolean;
  used: number;
  limit: number;
  resource: string;
  plan: PlanTier;
}

export async function checkMeetingLimit(orgId: string | null, userId: string): Promise<LimitCheck> {
  const { has } = await auth();
  const tier = getPlanTier(has);
  const limit = PLAN_LIMITS[tier].meetings;

  if (limit === Infinity)
    return { allowed: true, used: 0, limit: Infinity as any, resource: 'meetings', plan: tier };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let meetings: any[] = [];
  if (orgId) {
    const res = await getMeetingsPaginated(orgId, { limit: 500 });
    meetings = res.meetings;
  } else {
    meetings = await getMeetings(userId);
  }

  const thisMonth = meetings.filter((m: any) => m.date >= monthStart);
  return {
    allowed: thisMonth.length < limit,
    used: thisMonth.length,
    limit,
    resource: 'meetings',
    plan: tier,
  };
}

export async function checkTicketLimit(orgId: string | null, userId: string): Promise<LimitCheck> {
  const { has } = await auth();
  const tier = getPlanTier(has);
  const limit = PLAN_LIMITS[tier].tickets;

  if (limit === Infinity)
    return { allowed: true, used: 0, limit: Infinity as any, resource: 'tickets', plan: tier };

  let total = 0;
  if (orgId) {
    const res = await getTicketsPaginated(orgId, { limit: 1, offset: 0 });
    total = res.total;
  } else {
    const { TicketsEntity } = await import('@/db/entities');
    const userRes = await TicketsEntity.query.byUser({ userId }).go();
    total = (userRes.data ?? []).length;
  }

  return {
    allowed: total < limit,
    used: total,
    limit,
    resource: 'tickets',
    plan: tier,
  };
}

export async function checkProjectLimit(orgId: string | null, userId: string): Promise<LimitCheck> {
  const { has } = await auth();
  const tier = getPlanTier(has);
  const limit = PLAN_LIMITS[tier].projects;

  if (limit === Infinity)
    return { allowed: true, used: 0, limit: Infinity as any, resource: 'projects', plan: tier };

  let projects: any[] = [];
  if (orgId) {
    projects = await getProjectsByOrg(orgId);
  } else {
    projects = await getProjectsForMember('', userId);
  }

  return {
    allowed: projects.length < limit,
    used: projects.length,
    limit,
    resource: 'projects',
    plan: tier,
  };
}

export function limitErrorResponse(check: LimitCheck): Response {
  const resourceLabel =
    check.resource === 'meetings'
      ? `${check.limit} meetings/mo`
      : `${check.limit} ${check.resource}`;
  return Response.json(
    {
      error: 'Free plan limit reached',
      message: `You've used all ${resourceLabel} on the ${check.plan === 'free' ? 'Free' : check.plan} plan. Upgrade to Pro for higher limits.`,
      used: check.used,
      limit: check.limit,
      resource: check.resource,
      plan: check.plan,
      upgradeUrl: '/pricing',
    },
    { status: 403 }
  );
}
