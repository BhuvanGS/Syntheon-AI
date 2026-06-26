import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    // Get org members from Clerk
    const client = await clerkClient();
    const { data: orgMembers } = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    // Filter and format users
    const users = orgMembers
      .map((member: any) => {
        const firstName = member.publicUserData?.firstName || '';
        const lastName = member.publicUserData?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const email = member.publicUserData?.identifier || '';

        return {
          id: member.publicUserData?.userId || '',
          name: fullName || email.split('@')[0],
          email,
          imageUrl: member.publicUserData?.imageUrl,
        };
      })
      .filter((user: any) => {
        if (!query) return true;
        return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
      });

    return NextResponse.json(
      { users },
      {
        headers: {
          'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
