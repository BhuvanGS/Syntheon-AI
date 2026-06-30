import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationAccessRequestsEntity } from '@/db/entities';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; requestId: string }> }
) {
  const session = await auth();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId, requestId } = await params;
  if (session.orgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (session.orgRole !== 'org:admin') {
    return NextResponse.json({ error: 'Only admins can manage access requests' }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  // Find the request by scanning
  const res = await OrganizationAccessRequestsEntity.query.primary({ orgId }).go();
  const request = (res.data ?? []).find((r: any) => r.id === requestId);
  if (!request) {
    return NextResponse.json({ error: 'Access request not found' }, { status: 404 });
  }

  if (action === 'approve') {
    await OrganizationAccessRequestsEntity.update({ orgId, userId: request.userId })
      .set({
        status: 'approved',
        respondedAt: new Date().toISOString(),
        respondedBy: session.userId,
      })
      .go();

    try {
      const client = await clerkClient();
      await client.organizations.createOrganizationMembership({
        organizationId: orgId,
        userId: request.userId,
        role: 'org:member',
      });
    } catch (error) {
      console.error('Clerk add member error:', error);
    }

    return NextResponse.json({ success: true });
  }

  if (action === 'reject') {
    await OrganizationAccessRequestsEntity.update({ orgId, userId: request.userId })
      .set({
        status: 'rejected',
        respondedAt: new Date().toISOString(),
        respondedBy: session.userId,
      })
      .go();

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
