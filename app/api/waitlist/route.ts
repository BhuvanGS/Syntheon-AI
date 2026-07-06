import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getLatestWaitlistEntryForUser, submitWaitlistRequest } from '@/lib/waitlist';
import { getBetaStatus } from '@/lib/beta';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entry = await getLatestWaitlistEntryForUser(userId);
  return NextResponse.json({
    betaActive: getBetaStatus().isActive,
    entry,
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const beta = getBetaStatus();
  if (!beta.isActive) {
    return NextResponse.json({ error: 'Beta is not active' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const note = typeof body?.note === 'string' ? body.note.trim() : undefined;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Primary email not found' }, { status: 400 });
  }

  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || undefined;

  const entry = await submitWaitlistRequest({
    userId,
    email,
    name,
    note,
  });

  return NextResponse.json({ success: true, entry });
}
