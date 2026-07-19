import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';
import { randomUUID } from 'crypto';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (ctx.orgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let res = await OrganizationMetadataEntity.get({ orgId }).go();

  // Auto-create metadata if missing (e.g. org was created in Clerk but metadata failed)
  if (!res.data) {
    try {
      const client = await clerkClient();
      await client.organizations.getOrganization({ organizationId: orgId });
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

  const payload: Record<string, unknown> = {
    orgId: res.data.orgId,
    companyName: res.data.companyName,
    managerName: res.data.managerName,
    domain: res.data.domain,
    allowAccessRequests: res.data.allowAccessRequests,
  };
  if (isOrgAdmin(ctx)) {
    payload.joinCode = res.data.joinCode;
  }

  return NextResponse.json(payload);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (ctx.orgId !== orgId || !isOrgAdmin(ctx)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (ctx.orgId !== orgId || !isOrgAdmin(ctx)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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
