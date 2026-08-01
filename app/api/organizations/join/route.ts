import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationAccessRequestsEntity } from '@/db/entities';
import { extractJoinToken, findOrgMetaByJoinToken, requestOrgAccess } from '@/lib/org-join';

async function resolveUserProfile(userId: string) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    '';
  const name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || undefined;
  return { email, name, client };
}

/** GET — current user's latest join request / lobby status */
export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await OrganizationAccessRequestsEntity.query.byUser({ userId: session.userId }).go();
  const latest = (res.data ?? []).sort((a: any, b: any) =>
    (b.requestedAt || '').localeCompare(a.requestedAt || '')
  )[0];

  if (!latest) {
    return NextResponse.json({ pending: false, status: null });
  }

  let orgName: string | null = null;
  try {
    const client = await clerkClient();
    const org = await client.organizations.getOrganization({ organizationId: latest.orgId });
    orgName = org.name;
  } catch {
    orgName = null;
  }

  return NextResponse.json({
    pending: latest.status === 'pending',
    orgId: latest.orgId,
    orgName,
    requestId: latest.id,
    status: latest.status,
    requestedAt: latest.requestedAt,
    source: latest.source ?? null,
  });
}

/**
 * POST — request to join an org (waiting lobby).
 * Body: { token } from join link, OR { orgId } for manual / domain join.
 * Never creates Clerk membership — admin must approve.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tokenInput = typeof body.token === 'string' ? body.token : '';
  const orgIdInput = typeof body.orgId === 'string' ? body.orgId.trim() : '';

  let orgId: string | null = null;
  let source: 'join_link' | 'manual' = 'manual';

  if (tokenInput) {
    const token = extractJoinToken(tokenInput);
    if (!token) {
      return NextResponse.json({ error: 'Invalid join link' }, { status: 400 });
    }
    const meta = await findOrgMetaByJoinToken(token);
    if (!meta) {
      return NextResponse.json({ error: 'Invalid or expired join link' }, { status: 404 });
    }
    orgId = meta.orgId;
    source = 'join_link';
  } else if (orgIdInput) {
    orgId = orgIdInput;
    source = 'manual';
  } else {
    return NextResponse.json(
      { error: 'A join link token or organization id is required' },
      { status: 400 }
    );
  }

  const { email, name, client } = await resolveUserProfile(session.userId);
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  let orgName: string | null = null;
  try {
    const org = await client.organizations.getOrganization({ organizationId: orgId! });
    orgName = org.name;
  } catch {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  const result = await requestOrgAccess({
    orgId: orgId!,
    userId: session.userId,
    userEmail: email,
    userName: name,
    source,
  });

  if (result.status === 'already_member') {
    return NextResponse.json({
      success: true,
      alreadyMember: true,
      pending: false,
      orgId: result.orgId,
      orgName,
    });
  }

  if (result.status === 'seat_limit') {
    return NextResponse.json(
      {
        error: 'Seat limit reached',
        message: 'This organization has reached its member limit.',
        orgId: result.orgId,
        orgName,
      },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    pending: true,
    alreadyPending: result.alreadyPending,
    orgId: result.orgId,
    orgName,
    requestId: result.requestId,
  });
}
