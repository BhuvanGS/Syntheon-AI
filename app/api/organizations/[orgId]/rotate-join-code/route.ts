import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizationMetadata } from '@/db/schema';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  // Verify user is admin of this org
  const client = await clerkClient();
  try {
    const memberships = await client.users.getOrganizationMembershipList({
      userId: session.userId,
    });
    const membership = memberships.data.find((m) => m.organization.id === orgId);
    if (!membership || membership.role !== 'org:admin') {
      return NextResponse.json({ error: 'Only admins can rotate the join code' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to verify permissions' }, { status: 500 });
  }

  // Generate new unique 8-digit code, ensure no collision
  let attempts = 0;
  while (attempts < 10) {
    const newCode = Math.random().toString().slice(2, 10).padEnd(8, '0');

    const [collision] = await db
      .select()
      .from(organizationMetadata)
      .where(eq(organizationMetadata.joinCode, newCode))
      .limit(1);

    if (!collision || collision.orgId === orgId) {
      await db
        .update(organizationMetadata)
        .set({ joinCode: newCode, updatedAt: new Date() })
        .where(eq(organizationMetadata.orgId, orgId));

      return NextResponse.json({ joinCode: newCode });
    }
    attempts++;
  }

  return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
}
