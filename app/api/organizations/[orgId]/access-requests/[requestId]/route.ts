import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { OrganizationAccessRequestsEntity } from '@/db/entities';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';
import { FREE_ORG_SEAT_LIMIT, isOrganizationPaid } from '@/lib/org-plan';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; requestId: string }> }
) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId, requestId } = await params;
  if (ctx.orgId !== orgId || !isOrgAdmin(ctx)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  const res = await OrganizationAccessRequestsEntity.query.primary({ orgId }).go();
  const request = (res.data ?? []).find((r: any) => r.id === requestId);
  if (!request) {
    return NextResponse.json({ error: 'Access request not found' }, { status: 404 });
  }

  if (action === 'approve') {
    if (request.status === 'approved') {
      return NextResponse.json({ success: true, alreadyApproved: true });
    }

    const client = await clerkClient();
    const isPaidOrg = await isOrganizationPaid(orgId);
    if (!isPaidOrg) {
      const members = await client.organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });
      if ((members.data?.length ?? 0) >= FREE_ORG_SEAT_LIMIT) {
        return NextResponse.json(
          {
            error: 'Seat limit reached',
            message: `This organization has reached the ${FREE_ORG_SEAT_LIMIT}-member limit.`,
          },
          { status: 403 }
        );
      }
    }

    try {
      await client.organizations.createOrganizationMembership({
        organizationId: orgId,
        userId: request.userId,
        role: 'org:member',
      });
    } catch (error: any) {
      const alreadyMember =
        error?.errors?.[0]?.code === 'duplicate_record' ||
        error?.errors?.[0]?.code === 'already_a_member_in_organization';
      if (!alreadyMember) {
        console.error('Clerk add member error:', error);
        return NextResponse.json(
          { error: error?.errors?.[0]?.message ?? 'Failed to add member' },
          { status: 500 }
        );
      }
    }

    await OrganizationAccessRequestsEntity.update({ orgId, userId: request.userId })
      .set({
        status: 'approved',
        respondedAt: new Date().toISOString(),
        respondedBy: ctx.userId,
      })
      .go();

    return NextResponse.json({ success: true });
  }

  if (action === 'reject') {
    await OrganizationAccessRequestsEntity.update({ orgId, userId: request.userId })
      .set({
        status: 'rejected',
        respondedAt: new Date().toISOString(),
        respondedBy: ctx.userId,
      })
      .go();

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
