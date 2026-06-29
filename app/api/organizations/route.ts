import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity, UsersEntity } from '@/db/entities';
import { extractDomain } from '@/lib/public-domains';
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

    const created = await client.organizations.createOrganization({
      name: name.trim(),
      createdBy: session.userId,
    });

    const joinCode = Math.random().toString().slice(2, 10).padEnd(8, '0');

    await OrganizationMetadataEntity.create({
      id: randomUUID(),
      orgId: created.id,
      companyName: companyName?.trim() || null,
      managerName: managerName?.trim() || null,
      domain: domain?.trim() || null,
      joinCode,
      allowAccessRequests: allowAccessRequests ?? false,
    }).go();

    return NextResponse.json({
      id: created.id,
      name: created.name,
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
  const sameDomainUsers = (userScanRes.data ?? []).filter((u: any) =>
    u.email?.toLowerCase().endsWith(`@${domain}`)
  ).slice(0, 10);

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

  return NextResponse.json({ exists: false });
}
