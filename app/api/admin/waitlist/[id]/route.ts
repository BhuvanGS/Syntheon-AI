import { NextRequest, NextResponse } from 'next/server';
import { requireBetaAdminUser } from '@/lib/beta-admin';
import { reviewWaitlistEntry } from '@/lib/waitlist';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireBetaAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body?.status;

  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const decisionReason =
    typeof body?.decisionReason === 'string' ? body.decisionReason.trim() || undefined : undefined;

  const entry = await reviewWaitlistEntry({
    id,
    status,
    reviewedBy: admin.userId,
    decisionReason,
  });

  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, entry });
}
