import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { requireAuth } from '@/lib/rbac';
import { getOrgTrialStatus } from '@/lib/org-trial';
import { getBetaStatus } from '@/lib/beta';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (ctx.orgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { has } = await auth();
  const isPaid = Boolean(
    has?.({ plan: 'user_pro' }) ||
    has?.({ plan: 'user_max' }) ||
    has?.({ plan: 'org:org_pro' }) ||
    has?.({ plan: 'org:org_max' })
  );

  const trial = await getOrgTrialStatus(orgId, { ensure: true });
  const beta = getBetaStatus();
  const trialClockExpired = trial.expired;
  const writePaused = !isPaid && !beta.isActive && trialClockExpired;

  return NextResponse.json({
    isPaid,
    isTrial: !isPaid && !trialClockExpired,
    daysLeft: isPaid ? null : trial.daysLeft,
    expired: writePaused,
    writePaused,
    trialDays: trial.trialDays,
    betaActive: beta.isActive,
  });
}
