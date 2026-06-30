import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  let res = await OrganizationMetadataEntity.get({ orgId }).go();

  // Auto-create metadata if missing (e.g. org was created in Clerk but metadata failed)
  if (!res.data) {
    try {
      const client = await clerkClient();
      const org = await client.organizations.getOrganization({ organizationId: orgId });
      const joinCode = Math.random().toString().slice(2, 10).padEnd(8, '0');
      await OrganizationMetadataEntity.create({
        id: randomUUID(),
        orgId,
        joinCode,
        allowAccessRequests: false,
      }).go();
      res = await OrganizationMetadataEntity.get({ orgId }).go();
    } catch {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
  }

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
  if (typeof body.allowAccessRequests !== 'undefined')
    set.allowAccessRequests = body.allowAccessRequests;

  await OrganizationMetadataEntity.update({ orgId }).set(set).go();

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  const body = await req.json();

  // Check if metadata exists
  const existing = await OrganizationMetadataEntity.get({ orgId }).go();

  if (!existing.data) {
    // Create new metadata
    await OrganizationMetadataEntity.create({
      id: randomUUID(),
      orgId,
      companyName: body.companyName?.trim() || undefined,
      managerName: body.managerName?.trim() || undefined,
      domain: body.domain?.trim() || undefined,
      joinCode: Math.random().toString().slice(2, 10).padEnd(8, '0'),
      allowAccessRequests: body.allowAccessRequests ?? false,
    }).go();
  } else {
    // Update existing
    const set: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (typeof body.companyName !== 'undefined') set.companyName = body.companyName;
    if (typeof body.managerName !== 'undefined') set.managerName = body.managerName;
    if (typeof body.domain !== 'undefined') set.domain = body.domain;
    if (typeof body.allowAccessRequests !== 'undefined')
      set.allowAccessRequests = body.allowAccessRequests;

    await OrganizationMetadataEntity.update({ orgId }).set(set).go();
  }

  return NextResponse.json({ success: true });
}
