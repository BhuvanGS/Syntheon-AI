import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizationMetadata } from '@/db/schema';

const TRIAL_DAYS = 30;

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const [metadata] = await db
      .select()
      .from(organizationMetadata)
      .where(eq(organizationMetadata.orgId, orgId))
      .limit(1);

    if (!metadata?.trialStartedAt) {
      return NextResponse.json({
        isTrial: false,
        daysLeft: null,
        expired: false,
      });
    }

    const startedAt = new Date(metadata.trialStartedAt);
    const expiresAt = new Date(startedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const msLeft = expiresAt.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
    const expired = msLeft <= 0;

    return NextResponse.json({
      isTrial: true,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      daysLeft,
      expired,
      trialDays: TRIAL_DAYS,
    });
  } catch (error) {
    console.error('Error fetching trial status:', error);
    return NextResponse.json({ error: 'Failed to fetch trial status' }, { status: 500 });
  }
}
