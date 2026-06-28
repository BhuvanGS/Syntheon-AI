import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationInvites } from '@/db/schema';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  const body = await req.json();
  const { email } = body;

  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    let inviteUrl: string | null = null;
    let clerkInvitationId: string | null = null;

    try {
      const invitation = await client.organizations.createOrganizationInvitation({
        organizationId: orgId,
        emailAddress: email.trim(),
        role: 'org:member',
      });
      inviteUrl = invitation.url ?? null;
      clerkInvitationId = invitation.id;
    } catch (clerkError: any) {
      console.error('Clerk invitation failed:', clerkError);
      // If Clerk fails, we still create a local invite record so admin can track it
      if (clerkError.errors?.[0]?.code === 'already_a_member_in_organization') {
        return NextResponse.json(
          { error: 'This user is already a member of the organization' },
          { status: 400 }
        );
      }
    }

    const [invite] = await db
      .insert(organizationInvites)
      .values({
        orgId,
        email: email.trim(),
        invitedBy: session.userId,
        token: clerkInvitationId,
      })
      .onConflictDoNothing()
      .returning();

    return NextResponse.json({
      email: email.trim(),
      inviteLink:
        inviteUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/invite?orgId=${orgId}&email=${encodeURIComponent(email.trim())}`,
      success: true,
    });
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create invitation' },
      { status: 500 }
    );
  }
}
