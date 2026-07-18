import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { recordConsent, hasValidConsent, CURRENT_CONSENT_VERSION } from '@/lib/db';
import { TERMS_ACCEPTANCE_PURPOSES } from '@/lib/consent-constants';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      purposes?: string[];
      source?: string;
    };

    const purposes =
      body.purposes && Array.isArray(body.purposes) && body.purposes.length > 0
        ? body.purposes
        : [...TERMS_ACCEPTANCE_PURPOSES];

    const forwarded = req.headers.get('x-forwarded-for');
    const ipAddress = forwarded?.split(',')[0]?.trim() ?? 'unknown';
    const userAgent = req.headers.get('user-agent') ?? 'unknown';
    const deviceId = req.headers.get('x-device-id') ?? body.source ?? 'auth';

    // Idempotent: skip if already accepted
    if (await hasValidConsent(userId)) {
      return NextResponse.json({ success: true, alreadyRecorded: true });
    }

    const record = await recordConsent({
      userId,
      consentVersion: CURRENT_CONSENT_VERSION,
      purposes,
      ipAddress,
      deviceId,
      userAgent,
    });

    return NextResponse.json({ success: true, record });
  } catch (err) {
    console.error('[consent] Failed to record terms acceptance:', err);
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const valid = await hasValidConsent(userId);
  return NextResponse.json({ hasConsent: valid, version: CURRENT_CONSENT_VERSION });
}
