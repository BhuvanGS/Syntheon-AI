import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';
import { buildJoinLink, rotateJoinToken } from '@/lib/org-join';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (ctx.orgId !== orgId || !isOrgAdmin(ctx)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const client = await clerkClient();
    await client.organizations.getOrganization({ organizationId: orgId });
  } catch {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const joinToken = await rotateJoinToken(orgId);
  const joinLink = buildJoinLink(joinToken, req.nextUrl.origin);

  return NextResponse.json({ joinToken, joinLink });
}
