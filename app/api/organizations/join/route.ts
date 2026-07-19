import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';
import { FREE_ORG_SEAT_LIMIT, isOrganizationPaid } from '@/lib/org-plan';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { joinCode } = await req.json();
  if (!joinCode?.trim()) {
    return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
  }

  // Lookup org by join code GSI (scan fallback for pre-GSI records)
  const code = joinCode.trim();
  let meta: any = null;
  const byCode = await OrganizationMetadataEntity.query.byJoinCode({ joinCode: code }).go({
    limit: 1,
  });
  meta = byCode.data?.[0] ?? null;

  if (!meta) {
    const scanRes = await OrganizationMetadataEntity.scan.go();
    meta = (scanRes.data ?? []).find((m: any) => m.joinCode === code) ?? null;
    if (meta?.joinCode) {
      try {
        await OrganizationMetadataEntity.update({ orgId: meta.orgId })
          .set({ joinCode: meta.joinCode, updatedAt: new Date().toISOString() })
          .go();
      } catch {
        // ignore backfill errors
      }
    }
  }

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
    // Seat limit is based on the *target* org's plan, not the joiner's
    const isPaidOrg = await isOrganizationPaid(meta.orgId);
    if (!isPaidOrg) {
      const members = await client.organizations.getOrganizationMembershipList({
        organizationId: meta.orgId,
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
