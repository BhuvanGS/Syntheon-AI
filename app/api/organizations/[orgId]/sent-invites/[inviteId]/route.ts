import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationInvites } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; inviteId: string }> }
) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId, inviteId } = await params;

  try {
    const [invite] = await db
      .select()
      .from(organizationInvites)
      .where(eq(organizationInvites.id, inviteId))
      .limit(1);

    if (!invite || invite.orgId !== orgId) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Invite already processed' }, { status: 400 });
    }

    // Try to revoke via Clerk if there's a token
    if (invite.token) {
      try {
        const client = await clerkClient();
        await client.organizations.revokeOrganizationInvitation({
          organizationId: orgId,
          invitationId: invite.token,
        });
      } catch (clerkError) {
        console.error('Clerk revoke failed:', clerkError);
      }
    }

    await db
      .update(organizationInvites)
      .set({
        status: 'revoked',
        respondedAt: new Date(),
      })
      .where(eq(organizationInvites.id, inviteId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking invite:', error);
    return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 });
  }
}
