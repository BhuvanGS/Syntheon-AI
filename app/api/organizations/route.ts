import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq, ilike } from 'drizzle-orm';
import { db } from '@/db';
import { organizationMetadata, users } from '@/db/schema';
import { extractDomain } from '@/lib/public-domains';

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

    await db.insert(organizationMetadata).values({
      orgId: created.id,
      companyName: companyName?.trim() || null,
      managerName: managerName?.trim() || null,
      domain: domain?.trim() || null,
      joinCode,
      allowAccessRequests: allowAccessRequests ?? false,
    });

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

  const existing = await db
    .select({
      orgId: organizationMetadata.orgId,
      companyName: organizationMetadata.companyName,
    })
    .from(organizationMetadata)
    .where(eq(organizationMetadata.domain, domain))
    .limit(1);

  if (existing.length > 0) {
    const client = await clerkClient();
    try {
      const org = await client.organizations.getOrganization({
        organizationId: existing[0].orgId,
      });
      return NextResponse.json({
        exists: true,
        orgId: existing[0].orgId,
        orgName: org.name,
      });
    } catch {
      // Org was deleted from Clerk but stale row remains in DB — clean it up
      await db
        .delete(organizationMetadata)
        .where(eq(organizationMetadata.orgId, existing[0].orgId));
    }
  }

  // Fallback: check if any other user in DB has the same email domain
  // and has org memberships in Clerk (handles orgs created before domain column)
  const domainPattern = `%@${domain}`;
  const sameDomainUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(ilike(users.email, domainPattern))
    .limit(10);

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
          // Update the metadata row to store the domain for future lookups
          await db
            .update(organizationMetadata)
            .set({ domain })
            .where(eq(organizationMetadata.orgId, orgId));
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
