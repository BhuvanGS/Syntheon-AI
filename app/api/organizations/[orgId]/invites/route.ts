import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { OrganizationInvitesEntity } from '@/db/entities';
import { randomUUID } from 'crypto';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';
import { FREE_ORG_SEAT_LIMIT, isOrganizationPaid } from '@/lib/org-plan';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const ctx = await requireAuth();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (ctx.orgId !== orgId || !isOrgAdmin(ctx)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Seat limit based on target org plan
  const isPaidOrg = await isOrganizationPaid(orgId);
  if (!isPaidOrg) {
    const client = await clerkClient();
    const members = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
    const pendingInvites = await OrganizationInvitesEntity.query.primary({ orgId }).go();
    const pendingCount = (pendingInvites.data ?? []).filter(
      (i: { status?: string }) => i.status === 'pending'
    ).length;
    const totalSeats = (members.data?.length ?? 0) + pendingCount;
    if (totalSeats >= FREE_ORG_SEAT_LIMIT) {
      return NextResponse.json(
        {
          error: 'Seat limit reached',
          message: `Organizations are limited to ${FREE_ORG_SEAT_LIMIT} members on the free plan.`,
        },
        { status: 403 }
      );
    }
  }

  // Check for existing invite
  const existing = await OrganizationInvitesEntity.get({
    orgId,
    email: email.trim().toLowerCase(),
  }).go();
  if (existing.data) {
    return NextResponse.json({ error: 'Invite already sent' }, { status: 409 });
  }

  const token = randomUUID();
  await OrganizationInvitesEntity.create({
    id: randomUUID(),
    orgId,
    email: email.trim().toLowerCase(),
    status: 'pending',
    token,
    invitedBy: ctx.userId,
  }).go();

  // Send invitation via Clerk
  let inviteUrl = '';
  try {
    const client = await clerkClient();
    const origin = new URL(req.url).origin;
    const invitation = await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email.trim().toLowerCase(),
      role: 'org:member',
      inviterUserId: ctx.userId,
      redirectUrl: `${origin}/accept-invite`,
    });
    inviteUrl = invitation.url ?? '';
  } catch (error) {
    console.error('Clerk invite error:', error);
  }

  return NextResponse.json({
    success: true,
    token,
    inviteLink: inviteUrl,
    email: email.trim().toLowerCase(),
  });
}
