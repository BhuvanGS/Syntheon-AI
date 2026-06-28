import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationInvites } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const invites = await db
      .select()
      .from(organizationInvites)
      .where(eq(organizationInvites.orgId, orgId))
      .orderBy(desc(organizationInvites.invitedAt));

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Error fetching sent invites:', error);
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
  }
}
