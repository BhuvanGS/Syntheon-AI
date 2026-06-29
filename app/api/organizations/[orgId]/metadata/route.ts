import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationMetadata } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const [metadata] = await db
      .select()
      .from(organizationMetadata)
      .where(eq(organizationMetadata.orgId, orgId))
      .limit(1);

    if (!metadata) {
      return NextResponse.json({
        companyName: null,
        managerName: null,
        allowAccessRequests: false,
        joinCode: null,
      });
    }

    return NextResponse.json({
      companyName: metadata.companyName,
      managerName: metadata.managerName,
      allowAccessRequests: metadata.allowAccessRequests,
      joinCode: metadata.joinCode,
    });
  } catch (error) {
    console.error('Error fetching org metadata:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  const body = await req.json();
  const { companyName, managerName, allowAccessRequests } = body;

  try {
    const [existing] = await db
      .select()
      .from(organizationMetadata)
      .where(eq(organizationMetadata.orgId, orgId))
      .limit(1);

    if (existing) {
      await db
        .update(organizationMetadata)
        .set({
          companyName,
          managerName,
          allowAccessRequests,
          updatedAt: new Date(),
        })
        .where(eq(organizationMetadata.orgId, orgId));
    } else {
      await db.insert(organizationMetadata).values({
        orgId,
        companyName,
        managerName,
        allowAccessRequests,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving org metadata:', error);
    return NextResponse.json({ error: 'Failed to save metadata' }, { status: 500 });
  }
}
