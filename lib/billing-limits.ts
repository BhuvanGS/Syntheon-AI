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
import { isOrganizationPaid } from '@/lib/org-plan';
import { getOrgTrialStatus } from '@/lib/org-trial';

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
  plan: PlanTier | 'beta' | 'expired';
  code?: 'limit' | 'trial_expired';
}

function expiredCheck(resource: string): LimitCheck {
  return {
    allowed: false,
    used: 0,
    limit: 0,
    resource,
    plan: 'expired',
    code: 'trial_expired',
  };
}

/**
 * Paid Clerk plan, active calendar beta, or unexpired org trial may write.
 * Webhooks have no session `has()` — fall back to org billing + trial metadata.
 */
export async function assertWritableSubscription(
  orgId: string | null,
  resource: string
): Promise<LimitCheck | null> {
  const { has } = await auth();
  if (getPlanTier(has) !== 'free') return null;

  if (orgId && (await isOrganizationPaid(orgId))) return null;

  const beta = getBetaStatus();
  if (beta.isActive) return null;

  if (orgId) {
    const trial = await getOrgTrialStatus(orgId);
    if (!trial.expired) return null;
  }

  return expiredCheck(resource);
}

export async function checkMeetingLimit(
  orgId: string | null,
  userId: string,
  units = 1
): Promise<LimitCheck> {
  const blocked = await assertWritableSubscription(orgId, 'meetings');
  if (blocked) return blocked;

  const beta = getBetaStatus();
  if (beta.isActive && beta.startAt) {
    const meetings = await getMeetings(userId);
    const used = meetings.filter((m: { date?: string }) => {
      const date = new Date(m.date ?? '');
      return !Number.isNaN(date.getTime()) && date >= beta.startAt!;
    }).length;

    return {
      allowed: used + units <= BETA_LIMITS.meetings,
      used,
      limit: BETA_LIMITS.meetings,
      resource: 'meetings',
      plan: 'beta',
      code: used + units <= BETA_LIMITS.meetings ? undefined : 'limit',
    };
  }

  const { has } = await auth();
  const tier = getPlanTier(has);
  const limit = PLAN_LIMITS[tier].meetings;

  if (limit === Infinity)
    return { allowed: true, used: 0, limit: Infinity as never, resource: 'meetings', plan: tier };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let used = 0;
  if (orgId) {
    used = await countMeetingsSince(orgId, monthStart, limit + units);
  } else {
    const meetings = await getMeetings(userId);
    used = meetings.filter((m: { date?: string }) => (m.date ?? '') >= monthStart).length;
  }

  const allowed = used + units <= limit;
  return {
    allowed,
    used,
    limit,
    resource: 'meetings',
    plan: tier,
    code: allowed ? undefined : 'limit',
  };
}

export async function checkTicketLimit(
  orgId: string | null,
  userId: string,
  units = 1
): Promise<LimitCheck> {
  const blocked = await assertWritableSubscription(orgId, 'tickets');
  if (blocked) return blocked;

  const beta = getBetaStatus();
  if (beta.isActive && beta.startAt) {
    const userRes = await TicketsEntity.query.byUser({ userId }).go();
    const used = (userRes.data ?? []).filter((t: { createdAt?: string }) => {
      const createdAt = new Date(t.createdAt ?? '');
      return !Number.isNaN(createdAt.getTime()) && createdAt >= beta.startAt!;
    }).length;

    const allowed = used + units <= BETA_LIMITS.tickets;
    return {
      allowed,
      used,
      limit: BETA_LIMITS.tickets,
      resource: 'tickets',
      plan: 'beta',
      code: allowed ? undefined : 'limit',
    };
  }

  const { has } = await auth();
  const tier = getPlanTier(has);
  const limit = PLAN_LIMITS[tier].tickets;

  if (limit === Infinity)
    return { allowed: true, used: 0, limit: Infinity as never, resource: 'tickets', plan: tier };

  let total = 0;
  if (orgId) {
    total = await countTicketsForOrg(orgId, limit + units);
  } else {
    const userRes = await TicketsEntity.query.byUser({ userId }).go({ attributes: ['id'] });
    total = (userRes.data ?? []).length;
  }

  const allowed = total + units <= limit;
  return {
    allowed,
    used: total,
    limit,
    resource: 'tickets',
    plan: tier,
    code: allowed ? undefined : 'limit',
  };
}

export async function checkProjectLimit(orgId: string | null, userId: string): Promise<LimitCheck> {
  const blocked = await assertWritableSubscription(orgId, 'projects');
  if (blocked) return blocked;

  const beta = getBetaStatus();
  if (beta.isActive) {
    let projects: unknown[] = [];
    if (orgId) {
      projects = await getProjectsByOrg(orgId);
    } else {
      projects = await getProjectsForMember('', userId);
    }

    const allowed = projects.length < BETA_LIMITS.projects;
    return {
      allowed,
      used: projects.length,
      limit: BETA_LIMITS.projects,
      resource: 'projects',
      plan: 'beta',
      code: allowed ? undefined : 'limit',
    };
  }

  const { has } = await auth();
  const tier = getPlanTier(has);
  const limit = PLAN_LIMITS[tier].projects;

  if (limit === Infinity)
    return { allowed: true, used: 0, limit: Infinity as never, resource: 'projects', plan: tier };

  let projects: unknown[] = [];
  if (orgId) {
    projects = await getProjectsByOrg(orgId);
  } else {
    projects = await getProjectsForMember('', userId);
  }

  const allowed = projects.length < limit;
  return {
    allowed,
    used: projects.length,
    limit,
    resource: 'projects',
    plan: tier,
    code: allowed ? undefined : 'limit',
  };
}

export function limitErrorResponse(check: LimitCheck): Response {
  if (check.code === 'trial_expired' || check.plan === 'expired') {
    return Response.json(
      {
        error: 'Trial expired',
        message:
          'Your trial has ended. Upgrade to keep starting meetings, creating tickets, and adding projects. Existing work stays available.',
        used: check.used,
        limit: check.limit,
        resource: check.resource,
        plan: check.plan,
        code: 'trial_expired',
      },
      { status: 403 }
    );
  }

  const planLabel = check.plan === 'beta' ? 'beta' : check.plan;
  return Response.json(
    {
      error: 'Plan limit reached',
      message: `You've used ${check.used} of ${check.limit} ${check.resource} on the ${planLabel} plan. Upgrade to continue.`,
      used: check.used,
      limit: check.limit,
      resource: check.resource,
      plan: check.plan,
      code: 'limit',
    },
    { status: 403 }
  );
}
