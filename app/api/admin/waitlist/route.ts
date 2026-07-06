import { NextRequest, NextResponse } from 'next/server';
import { listWaitlistEntries, type WaitlistStatus } from '@/lib/waitlist';
import { requireBetaAdminUser } from '@/lib/beta-admin';

export async function GET(req: NextRequest) {
  const admin = await requireBetaAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const statusParam = req.nextUrl.searchParams.get('status');
  const status =
    statusParam === 'pending' || statusParam === 'approved' || statusParam === 'rejected'
      ? (statusParam as WaitlistStatus)
      : undefined;

  const entries = await listWaitlistEntries(status);
  return NextResponse.json({ entries });
}
