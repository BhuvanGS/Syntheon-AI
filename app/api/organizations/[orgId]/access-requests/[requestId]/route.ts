import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationAccessRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; requestId: string }> }
) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId, requestId } = await params;
  const body = await req.json();
  const { action } = body;

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  try {
    const [request] = await db
      .select()
      .from(organizationAccessRequests)
      .where(eq(organizationAccessRequests.id, requestId))
      .limit(1);

    if (!request || request.orgId !== orgId) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    if (action === 'approve') {
      const client = await clerkClient();
      await client.organizations.createOrganizationMembership({
        organizationId: orgId,
        userId: request.userId,
        role: 'org:member',
      });
    }

    await db
      .update(organizationAccessRequests)
      .set({
        status: action === 'approve' ? 'approved' : 'rejected',
        respondedAt: new Date(),
        respondedBy: session.userId,
      })
      .where(eq(organizationAccessRequests.id, requestId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing access request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
