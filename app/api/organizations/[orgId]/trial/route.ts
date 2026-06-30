import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { OrganizationMetadataEntity } from '@/db/entities';

const TRIAL_DAYS = 30;

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  const res = await OrganizationMetadataEntity.get({ orgId }).go();

  let trialStartedAt: string | undefined;

  if (!res.data) {
    trialStartedAt = new Date().toISOString();
    try {
      await OrganizationMetadataEntity.create({
        id: randomUUID(),
        orgId,
        trialStartedAt,
      }).go();
    } catch {
      // Another request may have created it concurrently — fall through to read
    }
  } else {
    trialStartedAt = res.data.trialStartedAt;
    if (!trialStartedAt) {
      trialStartedAt = new Date().toISOString();
      await OrganizationMetadataEntity.update({ orgId })
        .set({ trialStartedAt, updatedAt: trialStartedAt })
        .go();
    }
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
