import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity, UsersEntity } from '@/db/entities';
import { extractDomain } from '@/lib/public-domains';
import { ensureUser } from '@/lib/ensureUser';
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

    // Ensure creator exists in DB for same-domain fallback detection
    const clerkUser = await client.users.getUser(session.userId);
    const creatorEmail = clerkUser.emailAddresses[0]?.emailAddress ?? '';
    const creatorName =
      `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || undefined;
    if (creatorEmail) {
      await ensureUser(session.userId, creatorEmail, creatorName);
    }

    // Check if user already has an org (e.g. Clerk org was created but metadata failed)
    let orgId: string;
    let orgName: string;

    try {
      const memberships = await client.users.getOrganizationMembershipList({
        userId: session.userId,
      });
      if (memberships.data.length > 0) {
        orgId = memberships.data[0].organization.id;
        const existingOrg = await client.organizations.getOrganization({ organizationId: orgId });
        orgName = existingOrg.name;

        // Check if metadata already exists for this org
        const existingMeta = await OrganizationMetadataEntity.get({ orgId }).go();
        if (existingMeta.data) {
          // Metadata already exists — update it with domain if missing
          if (domain && !existingMeta.data.domain) {
            await OrganizationMetadataEntity.update({ orgId }).set({ domain: domain.trim() }).go();
          }
          return NextResponse.json({
            id: orgId,
            name: orgName,
            joinCode: existingMeta.data.joinCode,
            success: true,
          });
        }
        // Fall through to create metadata for existing org
      } else {
        // No existing org — create a new one
        const created = await client.organizations.createOrganization({
          name: name.trim(),
          createdBy: session.userId,
        });
        orgId = created.id;
        orgName = created.name;
      }
    } catch {
      // Fallback: create new org
      const created = await client.organizations.createOrganization({
        name: name.trim(),
        createdBy: session.userId,
      });
      orgId = created.id;
      orgName = created.name;
    }

    const joinCode = Math.random().toString().slice(2, 10).padEnd(8, '0');

    await OrganizationMetadataEntity.create({
      id: randomUUID(),
      orgId,
      companyName: companyName?.trim() || undefined,
      managerName: managerName?.trim() || undefined,
      domain: domain?.trim() || undefined,
      joinCode,
      allowAccessRequests: allowAccessRequests ?? false,
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

  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const domain = extractDomain(email);
  if (!domain) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Scan for org metadata with matching domain
  const scanRes = await OrganizationMetadataEntity.scan.go();
  const existing = (scanRes.data ?? []).find((m: any) => m.domain === domain);

  if (existing) {
    const client = await clerkClient();
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
    }
  }

  // Fallback: check if any other user in DB has the same email domain
  const userScanRes = await UsersEntity.scan.go();
  const sameDomainUsers = (userScanRes.data ?? [])
    .filter((u: any) => u.email?.toLowerCase().endsWith(`@${domain}`))
    .slice(0, 10);

  if (sameDomainUsers.length > 0) {
    const client = await clerkClient();
    for (const u of sameDomainUsers) {
      if (u.id === session.userId) continue;
      try {
        const memberships = await client.users.getOrganizationMembershipList({
          userId: u.id,
        });
        if (memberships.data.length > 0) {
          const orgId = memberships.data[0].organization.id;
          const org = await client.organizations.getOrganization({ organizationId: orgId });
          await OrganizationMetadataEntity.update({ orgId }).set({ domain }).go();
          return NextResponse.json({
            exists: true,
            orgId,
            orgName: org.name,
          });
        }
      } catch {
        // User may not have org memberships, skip
      }
    }
  }

  // Fallback 2: scan all org metadata without a domain, check org members for same-domain match
  // This handles the case where org was created in Clerk but metadata domain wasn't stored
  const client = await clerkClient();
  const allMeta = (scanRes.data ?? []).filter((m: any) => !m.domain);
  for (const meta of allMeta) {
    try {
      const members = await client.organizations.getOrganizationMembershipList({
        organizationId: meta.orgId,
      });
      const hasSameDomain = (members.data ?? []).some((m: any) =>
        m.publicUserData?.identifier?.toLowerCase().endsWith(`@${domain}`)
      );
      if (hasSameDomain) {
        const org = await client.organizations.getOrganization({ organizationId: meta.orgId });
        await OrganizationMetadataEntity.update({ orgId: meta.orgId }).set({ domain }).go();
        return NextResponse.json({
          exists: true,
          orgId: meta.orgId,
          orgName: org.name,
        });
      }
    } catch {
      // Org may not exist, skip
    }
  }

  return NextResponse.json({ exists: false });
}
