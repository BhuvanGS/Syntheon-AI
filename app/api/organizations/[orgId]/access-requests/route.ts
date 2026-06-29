import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrganizationAccessRequestsEntity } from '@/db/entities';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (session.orgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const res = await OrganizationAccessRequestsEntity.query.primary({ orgId }).go();
  const requests = (res.data ?? []).sort((a: any, b: any) =>
    (b.requestedAt || '').localeCompare(a.requestedAt || '')
  );

  return NextResponse.json({ requests });
}
