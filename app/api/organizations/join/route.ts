import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizationMetadata, organizationAccessRequests } from '@/db/schema';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { code } = body;

  if (!code?.trim() || code.trim().length !== 8) {
    return NextResponse.json({ error: 'Enter a valid 8-digit code' }, { status: 400 });
  }

  try {
    const [org] = await db
      .select()
      .from(organizationMetadata)
      .where(eq(organizationMetadata.joinCode, code.trim()))
      .limit(1);

    if (!org) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });
    }

    // Check if user is already a member
    const client = await clerkClient();
    try {
      const memberships = await client.users.getOrganizationMembershipList({
        userId: session.userId,
      });
      const alreadyMember = memberships.data.some((m) => m.organization.id === org.orgId);
      if (alreadyMember) {
        return NextResponse.json({
          success: true,
          alreadyMember: true,
          orgId: org.orgId,
        });
      }
    } catch {
      // ignore
    }

    // If allowAccessRequests is ON → create access request (waitlist)
    if (org.allowAccessRequests) {
      // Check if request already exists
      const [existing] = await db
        .select()
        .from(organizationAccessRequests)
        .where(eq(organizationAccessRequests.orgId, org.orgId))
        .limit(1);

      if (existing && existing.status === 'pending') {
        return NextResponse.json({
          success: true,
          waitlisted: true,
          message: 'Your access request is pending admin approval.',
        });
      }

      if (existing && existing.status === 'rejected') {
        return NextResponse.json(
          {
            error: 'Your previous request to join this organization was rejected.',
          },
          { status: 403 }
        );
      }

      // Get user info
      const user = await client.users.getUser(session.userId);
      const email = user.emailAddresses[0]?.emailAddress ?? '';
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || (user.username ?? '');

      await db.insert(organizationAccessRequests).values({
        orgId: org.orgId,
        userId: session.userId,
        userEmail: email,
        userName: name || null,
        status: 'pending',
      });

      return NextResponse.json({
        success: true,
        waitlisted: true,
        message: 'Your access request has been submitted. An admin will review it shortly.',
      });
    }

    // allowAccessRequests is OFF → join immediately
    await client.organizations.createOrganizationMembership({
      organizationId: org.orgId,
      userId: session.userId,
      role: 'org:member',
    });

    return NextResponse.json({
      success: true,
      joined: true,
      orgId: org.orgId,
    });
  } catch (error) {
    console.error('Error joining organization:', error);
    return NextResponse.json({ error: 'Failed to join organization' }, { status: 500 });
  }
}
