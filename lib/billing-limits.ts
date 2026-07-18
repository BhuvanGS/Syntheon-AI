import { auth } from '@clerk/nextjs/server';
import {
  getMeetings,
  countMeetingsSince,
  countTicketsForOrg,
  getProjectsByOrg,
  getProjectsForMember,
} from '@/lib/db';
import { getBetaStatus } from '@/lib/beta';
import { TicketsEntity } from '@/db/entities';

export const PLAN_LIMITS = {
  free: { meetings: 10, tickets: 50, projects: 3 },
  pro: { meetings: Infinity, tickets: 500, projects: 10 },
  max: { meetings: Infinity, tickets: Infinity, projects: Infinity },
} as const;

type PlanTier = keyof typeof PLAN_LIMITS;

const BETA_LIMITS = {
  meetings: 10,
  tickets: 50,
  projects: 3,
} as const;

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
  plan: PlanTier | 'beta';
}

export async function checkMeetingLimit(
  orgId: string | null,
  userId: string,
  units = 1
): Promise<LimitCheck> {
  const beta = getBetaStatus();
  if (beta.isActive && beta.startAt) {
    const meetings = await getMeetings(userId);
    const used = meetings.filter((m: any) => {
      const date = new Date(m.date);
      return !Number.isNaN(date.getTime()) && date >= beta.startAt!;
    }).length;

    return {
      allowed: used + units <= BETA_LIMITS.meetings,
      used,
      limit: BETA_LIMITS.meetings,
      resource: 'meetings',
      plan: 'beta',
    };
  }

  const { has } = await auth();
  const tier = getPlanTier(has);
  const limit = PLAN_LIMITS[tier].meetings;

  if (limit === Infinity)
    return { allowed: true, used: 0, limit: Infinity as any, resource: 'meetings', plan: tier };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let used = 0;
  if (orgId) {
    used = await countMeetingsSince(orgId, monthStart, limit + units);
  } else {
    const meetings = await getMeetings(userId);
    used = meetings.filter((m: any) => m.date >= monthStart).length;
  }

  return {
    allowed: used + units <= limit,
    used,
    limit,
    resource: 'meetings',
    plan: tier,
  };
}

export async function checkTicketLimit(
  orgId: string | null,
  userId: string,
  units = 1
): Promise<LimitCheck> {
  const beta = getBetaStatus();
  if (beta.isActive && beta.startAt) {
    const userRes = await TicketsEntity.query.byUser({ userId }).go();
    const used = (userRes.data ?? []).filter((t: any) => {
      const createdAt = new Date(t.createdAt ?? '');
      return !Number.isNaN(createdAt.getTime()) && createdAt >= beta.startAt!;
    }).length;

    return {
      allowed: used + units <= BETA_LIMITS.tickets,
      used,
      limit: BETA_LIMITS.tickets,
      resource: 'tickets',
      plan: 'beta',
    };
  }

  const { has } = await auth();
  const tier = getPlanTier(has);
  const limit = PLAN_LIMITS[tier].tickets;

  if (limit === Infinity)
    return { allowed: true, used: 0, limit: Infinity as any, resource: 'tickets', plan: tier };

  let total = 0;
  if (orgId) {
    total = await countTicketsForOrg(orgId, limit + units);
  } else {
    const userRes = await TicketsEntity.query.byUser({ userId }).go({ attributes: ['id'] });
    total = (userRes.data ?? []).length;
  }

  return {
    allowed: total + units <= limit,
    used: total,
    limit,
    resource: 'tickets',
    plan: tier,
  };
}

export async function checkProjectLimit(orgId: string | null, userId: string): Promise<LimitCheck> {
  const beta = getBetaStatus();
  if (beta.isActive) {
    let projects: any[] = [];
    if (orgId) {
      projects = await getProjectsByOrg(orgId);
    } else {
      projects = await getProjectsForMember('', userId);
    }

    return {
      allowed: projects.length < BETA_LIMITS.projects,
      used: projects.length,
      limit: BETA_LIMITS.projects,
      resource: 'projects',
      plan: 'beta',
    };
  }

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
  return Response.json(
    {
      error: 'Beta testing limit reached',
      message: `Beta testing limit reached: ${check.limit} ${check.resource} during the beta period. Limits will be lifted after beta.`,
      used: check.used,
      limit: check.limit,
      resource: check.resource,
      plan: check.plan,
    },
    { status: 403 }
  );
}
