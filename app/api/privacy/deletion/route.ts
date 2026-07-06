import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createDeletionRequest,
  getDeletionRequestsByUser,
  hasActiveDeletionRequest,
} from '@/lib/privacy-deletion';

export async function GET() {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requests = await getDeletionRequestsByUser(session.userId);
  return NextResponse.json({
    requests: requests.map((r: any) => ({
      id: r.id,
      scope: r.scope,
      status: r.status,
      requestedAt: r.requestedAt,
      warningDueAt: r.warningDueAt,
      scheduledFor: r.scheduledFor,
      warningSentAt: r.warningSentAt ?? null,
      processedAt: r.processedAt ?? null,
      orgId: r.orgId ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const scope = body?.scope === 'org' ? 'org' : 'user';
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : undefined;
    const confirmText = typeof body?.confirmText === 'string' ? body.confirmText : '';

    if (confirmText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation text mismatch. Type DELETE to continue.' },
        { status: 400 }
      );
    }

    if (scope === 'org') {
      if (!session.orgId) {
        return NextResponse.json({ error: 'No active organization selected' }, { status: 400 });
      }
      if (session.orgRole !== 'org:admin') {
        return NextResponse.json(
          { error: 'Only organization admins can request full org deletion' },
          { status: 403 }
        );
      }

      const alreadyQueued = await hasActiveDeletionRequest(session.userId, 'org', session.orgId);
      if (alreadyQueued) {
        return NextResponse.json(
          { error: 'An active org deletion request already exists' },
          { status: 409 }
        );
      }

      const requestRow = await createDeletionRequest({
        userId: session.userId,
        orgId: session.orgId,
        scope: 'org',
        reason,
      });

      return NextResponse.json({
        success: true,
        request: requestRow,
        message:
          'Organization deletion requested. We will issue a final warning 48 hours before deletion.',
      });
    }

    const alreadyQueued = await hasActiveDeletionRequest(session.userId, 'user');
    if (alreadyQueued) {
      return NextResponse.json(
        { error: 'An active account deletion request already exists' },
        { status: 409 }
      );
    }

    const requestRow = await createDeletionRequest({
      userId: session.userId,
      scope: 'user',
      reason,
    });

    return NextResponse.json({
      success: true,
      request: requestRow,
      message: 'Account deletion requested. Final warning will be sent 48 hours before deletion.',
    });
  } catch (error) {
    console.error('[privacy/deletion] Failed to queue deletion request:', error);
    return NextResponse.json({ error: 'Failed to submit deletion request' }, { status: 500 });
  }
}
