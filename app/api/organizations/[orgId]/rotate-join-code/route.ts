import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';
import { randomUUID } from 'crypto';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (ctx.orgId !== orgId || !isOrgAdmin(ctx)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const newJoinCode = Math.random().toString().slice(2, 10).padEnd(8, '0');

  // Check if metadata exists, create if missing
  const existing = await OrganizationMetadataEntity.get({ orgId }).go();
  if (!existing.data) {
    const client = await clerkClient();
    await client.organizations.getOrganization({ organizationId: orgId });
    await OrganizationMetadataEntity.create({
      id: randomUUID(),
      orgId,
      joinCode: newJoinCode,
      allowAccessRequests: false,
    }).go();
  } else {
    await OrganizationMetadataEntity.update({ orgId })
      .set({ joinCode: newJoinCode, updatedAt: new Date().toISOString() })
      .go();
  }

  return NextResponse.json({ joinCode: newJoinCode });
}
