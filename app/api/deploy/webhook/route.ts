// app/api/deploy/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateMeetingDeployUrl } from '@/lib/db';
import { db } from '@/db/index';
import { meetings as meetingsTable } from '@/db/schema';
import { isNull, isNotNull, desc, and } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/webhook';

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

function getGithubPagesUrl(owner: string, repo: string): string {
  // GitHub Pages URL is deterministic — no API call needed
  return `https://${owner}.github.io/${repo}/`;
}

export async function POST(req: NextRequest) {
  // ── HMAC Signature Verification ─────────────────────────────────
  if (!GITHUB_WEBHOOK_SECRET) {
    console.error('[deploy/webhook] GITHUB_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256') ?? '';

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const isValid = verifyWebhookSignature({
    secret: GITHUB_WEBHOOK_SECRET,
    payload: rawBody,
    signature,
  });

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── Process payload ──────────────────────────────────────────────
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    if (payload.ref !== 'refs/heads/main' || !payload.repository) {
      return NextResponse.json({ ok: true });
    }

    const owner = payload.repository?.owner?.login;
    const repo = payload.repository?.name;

    if (!owner || !repo || typeof owner !== 'string' || typeof repo !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const deployUrl = getGithubPagesUrl(owner, repo);

    // Find most recent meeting with branchName but no deployUrl
    const [meeting] = await db
      .select()
      .from(meetingsTable)
      .where(and(isNotNull(meetingsTable.branchName), isNull(meetingsTable.deployUrl)))
      .orderBy(desc(meetingsTable.date))
      .limit(1);

    if (!meeting) {
      return NextResponse.json({ ok: true });
    }

    await updateMeetingDeployUrl(meeting.id, deployUrl);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
