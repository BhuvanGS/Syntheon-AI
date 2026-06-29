import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrganizationInvitesEntity } from '@/db/entities';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (session.orgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const res = await OrganizationInvitesEntity.query.primary({ orgId }).go();
  const invites = (res.data ?? []).sort((a: any, b: any) =>
    (b.invitedAt || '').localeCompare(a.invitedAt || '')
  );

  return NextResponse.json({ invites });
}
