import { NextRequest, NextResponse } from 'next/server';
import { OrganizationInvitesEntity } from '@/db/entities';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (ctx.orgId !== orgId || !isOrgAdmin(ctx)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const res = await OrganizationInvitesEntity.query.primary({ orgId }).go();
  const invites = (res.data ?? []).sort((a: any, b: any) =>
    (b.invitedAt || '').localeCompare(a.invitedAt || '')
  );

  return NextResponse.json({ invites });
}
