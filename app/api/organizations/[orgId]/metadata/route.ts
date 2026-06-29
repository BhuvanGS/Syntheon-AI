import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';

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

  return NextResponse.json({
    orgId: res.data.orgId,
    companyName: res.data.companyName,
    managerName: res.data.managerName,
    domain: res.data.domain,
    joinCode: res.data.joinCode,
    allowAccessRequests: res.data.allowAccessRequests,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  const body = await req.json();

  const set: Record<string, any> = { updatedAt: new Date().toISOString() };
  if (typeof body.companyName !== 'undefined') set.companyName = body.companyName;
  if (typeof body.managerName !== 'undefined') set.managerName = body.managerName;
  if (typeof body.domain !== 'undefined') set.domain = body.domain;
  if (typeof body.allowAccessRequests !== 'undefined') set.allowAccessRequests = body.allowAccessRequests;

  await OrganizationMetadataEntity.update({ orgId }).set(set).go();

  return NextResponse.json({ success: true });
}
