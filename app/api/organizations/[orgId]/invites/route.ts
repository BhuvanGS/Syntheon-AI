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
  try {
    const client = await clerkClient();
    await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: email.trim().toLowerCase(),
      role: 'org:member',
    });
  } catch (error) {
    console.error('Clerk invite error:', error);
  }

  return NextResponse.json({ success: true, token });
}
