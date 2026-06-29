import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity, OrganizationAccessRequestsEntity } from '@/db/entities';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { joinCode } = await req.json();
  if (!joinCode?.trim()) {
    return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
  }

  // Scan for org metadata with matching join code
  const scanRes = await OrganizationMetadataEntity.scan.go();
  const meta = (scanRes.data ?? []).find((m: any) => m.joinCode === joinCode.trim());

  if (!meta) {
    return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });
  }

  const client = await clerkClient();

  // Check if already a member
  try {
    const memberships = await client.users.getOrganizationMembershipList({
      userId: session.userId,
    });
    const alreadyMember = memberships.data.some((m) => m.organization.id === meta.orgId);
    if (alreadyMember) {
      return NextResponse.json({
        success: true,
        orgId: meta.orgId,
        message: 'Already a member',
      });
    }
  } catch {
    // Continue
  }

  // If access requests are allowed, create a request
  if (meta.allowAccessRequests) {
    // Check for existing pending/rejected request
    const existingRes = await OrganizationAccessRequestsEntity.get({
      orgId: meta.orgId,
      userId: session.userId,
    }).go();

    if (existingRes.data) {
      if (existingRes.data.status === 'pending') {
        return NextResponse.json({
          success: false,
          waitlisted: true,
          message: 'Your access request is pending approval.',
        });
      }
      if (existingRes.data.status === 'rejected') {
        return NextResponse.json({
          error: 'Your previous request was rejected. Contact an administrator.',
        }, { status: 403 });
      }
      // If approved, they should already be a member
      return NextResponse.json({
        success: true,
        orgId: meta.orgId,
        message: 'Already approved',
      });
    }

    // Get user info from Clerk
    const user = await client.users.getUser(session.userId);
    const email = user.emailAddresses[0]?.emailAddress ?? '';
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'User';

    await OrganizationAccessRequestsEntity.create({
      id: randomUUID(),
      orgId: meta.orgId,
      userId: session.userId,
      userEmail: email,
      userName: name,
      status: 'pending',
    }).go();

    return NextResponse.json({
      success: false,
      waitlisted: true,
      message: 'Access request submitted. An admin will review your request.',
    });
  }

  // Direct join
  try {
    await client.organizations.createOrganizationMembership({
      organizationId: meta.orgId,
      userId: session.userId,
      role: 'org:member',
    });

    return NextResponse.json({
      success: true,
      orgId: meta.orgId,
    });
  } catch (error: any) {
    console.error('Join org error:', error);
    return NextResponse.json(
      { error: error?.errors?.[0]?.message ?? 'Failed to join organization' },
      { status: 500 }
    );
  }
}
