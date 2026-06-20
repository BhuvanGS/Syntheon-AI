import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAuth, isOrgAdmin } from '@/lib/rbac';

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isOrgAdmin(ctx)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const emailAddress = String(body?.emailAddress ?? '')
      .trim()
      .toLowerCase();
    if (!emailAddress || !emailAddress.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const client = await clerkClient();
    const invitation = await client.organizations.createOrganizationInvitation({
      organizationId: ctx.orgId,
      emailAddress,
      role: 'org:member',
      inviterUserId: ctx.userId,
      redirectUrl: `${origin}/accept-invite`,
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        emailAddress: invitation.emailAddress,
        url: invitation.url,
        createdAt: invitation.createdAt,
      },
    });
  } catch (error: any) {
    const message = error?.errors?.[0]?.longMessage || error?.message || 'Failed to create invite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
