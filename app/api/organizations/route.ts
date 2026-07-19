import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';
import { extractDomain } from '@/lib/public-domains';
import { ensureUser } from '@/lib/ensureUser';
import { isPublicDomainEmail } from '@/lib/org-utils';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, companyName, managerName, allowAccessRequests, domain } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
  }

  try {
    const client = await clerkClient();

    const clerkUser = await client.users.getUser(session.userId);
    const creatorEmail =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      '';
    const creatorName =
      `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || undefined;
    if (creatorEmail) {
      await ensureUser(session.userId, creatorEmail, creatorName);
    }

    const memberships = await client.users.getOrganizationMembershipList({
      userId: session.userId,
    });

    // Public-email users: personal org is created by webhook — reuse, don't duplicate
    if (creatorEmail && isPublicDomainEmail(creatorEmail) && memberships.data.length > 0) {
      const orgId = memberships.data[0].organization.id;
      const existingOrg = await client.organizations.getOrganization({ organizationId: orgId });
      const existingMeta = await OrganizationMetadataEntity.get({ orgId }).go();
      return NextResponse.json({
        id: orgId,
        name: existingOrg.name,
        joinCode: existingMeta.data?.joinCode,
        success: true,
        reused: true,
      });
    }

    // Create a new org (B2B multi-org allowed; public path only reaches here with zero memberships)
    const created = await client.organizations.createOrganization({
      name: name.trim(),
      createdBy: session.userId,
    });
    const orgId = created.id;
    const orgName = created.name;

    const joinCode = Math.random().toString().slice(2, 10).padEnd(8, '0');

    await OrganizationMetadataEntity.create({
      id: randomUUID(),
      orgId,
      companyName: companyName?.trim() || undefined,
      managerName: managerName?.trim() || undefined,
      domain: domain?.trim() || undefined,
      joinCode,
      allowAccessRequests: allowAccessRequests ?? false,
      trialStartedAt: new Date().toISOString(),
    }).go();

    return NextResponse.json({
      id: orgId,
      name: orgName,
      joinCode,
      success: true,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Always use the signed-in user's email — never trust a client-supplied email
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(session.userId);
  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  if (isPublicDomainEmail(email)) {
    return NextResponse.json({ exists: false });
  }

  const domain = extractDomain(email);
  if (!domain) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Domain match via org metadata only (no user-table / cross-org member enumeration)
  const scanRes = await OrganizationMetadataEntity.scan.go();
  const existing = (scanRes.data ?? []).find(
    (m: { domain?: string }) => m.domain?.toLowerCase() === domain.toLowerCase()
  );

  if (!existing) {
    return NextResponse.json({ exists: false });
  }

  try {
    const org = await client.organizations.getOrganization({
      organizationId: existing.orgId,
    });
    return NextResponse.json({
      exists: true,
      orgId: existing.orgId,
      orgName: org.name,
    });
  } catch {
    await OrganizationMetadataEntity.delete({ orgId: existing.orgId }).go();
    return NextResponse.json({ exists: false });
  }
}
