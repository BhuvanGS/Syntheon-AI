import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createDeletionRequest,
  getDeletionRequestsByUser,
  hasActiveDeletionRequest,
} from '@/lib/privacy-deletion';
import { apiRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In-memory per-instance limiter (see lib/rate-limit.ts). Not shared across Lambda instances.
  const limited = await apiRateLimit(req, session.userId);
  if (limited) return limited;

  const requests = await getDeletionRequestsByUser(session.userId);
  // Only surface user-scope account deletion requests
  const userRequests = requests.filter((r: any) => r.scope === 'user');
  return NextResponse.json({
    requests: userRequests.map((r: any) => ({
      id: r.id,
      scope: r.scope,
      status: r.status,
      requestedAt: r.requestedAt,
      warningDueAt: r.warningDueAt,
      scheduledFor: r.scheduledFor,
      warningSentAt: r.warningSentAt ?? null,
      processedAt: r.processedAt ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // In-memory per-instance limiter (see lib/rate-limit.ts). Not shared across Lambda instances.
  const limited = await apiRateLimit(req, session.userId);
  if (limited) return limited;

  try {
    const body = await req.json();
    if (body?.scope === 'org') {
      return NextResponse.json(
        { error: 'Organization deletion is not supported' },
        { status: 400 }
      );
    }

    const reason = typeof body?.reason === 'string' ? body.reason.trim() : undefined;
    const confirmText = typeof body?.confirmText === 'string' ? body.confirmText : '';

    if (confirmText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation text mismatch. Type DELETE to continue.' },
        { status: 400 }
      );
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
