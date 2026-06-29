import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';

const TRIAL_DAYS = 30;

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  const res = await OrganizationMetadataEntity.get({ orgId }).go();

  if (!res.data) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const trialStartedAt = res.data.trialStartedAt;
  if (!trialStartedAt) {
    return NextResponse.json({ isTrial: false, daysLeft: null, expired: false });
  }

  const startDate = new Date(trialStartedAt);
  const now = new Date();
  const elapsedDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, TRIAL_DAYS - elapsedDays);
  const expired = daysLeft <= 0;

  return NextResponse.json({
    isTrial: true,
    daysLeft: expired ? 0 : daysLeft,
    expired,
    trialDays: TRIAL_DAYS,
  });
}
