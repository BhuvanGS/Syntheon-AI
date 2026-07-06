import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrganizationInvitesEntity } from '@/db/entities';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; inviteId: string }> }
) {
  const session = await auth();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId, inviteId } = await params;
  if (session.orgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // Find the invite by scanning — inviteId is the row id
  const res = await OrganizationInvitesEntity.query.primary({ orgId }).go();
  const invite = (res.data ?? []).find((i: any) => i.id === inviteId);
  if (!invite) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  if (action === 'revoke') {
    await OrganizationInvitesEntity.update({ orgId, email: invite.email })
      .set({ status: 'revoked', respondedAt: new Date().toISOString() })
      .go();

    // DB record updated — Clerk invitation revocation handled separately if needed

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
