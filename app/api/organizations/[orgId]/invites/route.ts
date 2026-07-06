import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationInvitesEntity } from '@/db/entities';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (session.orgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Check org seat limit for free tier
  const { has } = session;
  const isPaidOrg = has?.({ plan: 'org:org_pro' }) || has?.({ plan: 'org:org_max' });
  if (!isPaidOrg) {
    const client = await clerkClient();
    const members = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
    const pendingInvites = await OrganizationInvitesEntity.query.primary({ orgId }).go();
    const pendingCount = (pendingInvites.data ?? []).filter(
      (i: any) => i.status === 'pending'
    ).length;
    const totalSeats = (members.data?.length ?? 0) + pendingCount;
    if (totalSeats >= 3) {
      return NextResponse.json(
        {
          error: 'Free plan limit reached',
          message: 'Free organizations are limited to 3 members. Upgrade to add more seats.',
          upgradeUrl: '/pricing',
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
    invitedBy: session.userId,
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
      inviterUserId: session.userId,
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
