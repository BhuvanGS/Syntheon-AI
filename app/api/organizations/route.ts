import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationMetadata } from '@/db/schema';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, companyName, managerName, allowAccessRequests } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
  }

  try {
    const client = await clerkClient();

    const created = await client.organizations.createOrganization({
      name: name.trim(),
      createdBy: session.userId,
    });

    await db.insert(organizationMetadata).values({
      orgId: created.id,
      companyName: companyName?.trim() || null,
      managerName: managerName?.trim() || null,
      allowAccessRequests: allowAccessRequests ?? false,
    });

    return NextResponse.json({
      id: created.id,
      name: created.name,
      success: true,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
