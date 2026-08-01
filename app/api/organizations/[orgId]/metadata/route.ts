import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';
import { randomUUID } from 'crypto';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';
import { buildJoinLink, ensureJoinToken, generateJoinToken } from '@/lib/org-join';

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
      await OrganizationMetadataEntity.create({
        id: randomUUID(),
        orgId,
        joinToken: generateJoinToken(),
        allowAccessRequests: true,
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
    allowAccessRequests: true,
  };

  if (isOrgAdmin(ctx)) {
    const joinToken = await ensureJoinToken(orgId);
    payload.joinToken = joinToken;
    payload.joinLink = buildJoinLink(joinToken, req.nextUrl.origin);
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

  const existing = await OrganizationMetadataEntity.get({ orgId }).go();

  if (!existing.data) {
    await OrganizationMetadataEntity.create({
      id: randomUUID(),
      orgId,
      companyName: body.companyName?.trim() || undefined,
      managerName: body.managerName?.trim() || undefined,
      domain: body.domain?.trim() || undefined,
      joinToken: generateJoinToken(),
      allowAccessRequests: true,
    }).go();
  } else {
    const set: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (typeof body.companyName !== 'undefined') set.companyName = body.companyName;
    if (typeof body.managerName !== 'undefined') set.managerName = body.managerName;
    if (typeof body.domain !== 'undefined') set.domain = body.domain;

    await OrganizationMetadataEntity.update({ orgId }).set(set).go();
  }

  return NextResponse.json({ success: true });
}
