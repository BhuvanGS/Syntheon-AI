import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';

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

  // Direct join (no waitlist during beta)
  try {
    // Check org seat limit for free tier
    const { has } = session;
    const isPaidOrg = has?.({ plan: 'org:org_pro' }) || has?.({ plan: 'org:org_max' });
    if (!isPaidOrg) {
      const members = await client.organizations.getOrganizationMembershipList({
        organizationId: meta.orgId,
      });
      if ((members.data?.length ?? 0) >= 3) {
        return NextResponse.json(
          {
            error: 'Beta testing limit reached',
            message: 'This organization has reached the 3-member beta testing limit.',
          },
          { status: 403 }
        );
      }
    }

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
