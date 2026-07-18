// app/api/deploy/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateMeetingDeployUrl } from '@/lib/db';
import { MeetingsEntity, ProjectsEntity } from '@/db/entities';
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
    const repoSlug = `${owner}/${repo}`;

    // Prefer project→meetings lookup over full table scan
    const projectsRes = await ProjectsEntity.query.byRepo({ repo: repoSlug }).go({ limit: 5 });
    let meeting: any = null;

    for (const project of projectsRes.data ?? []) {
      const meetingsRes = await MeetingsEntity.query
        .byProject({ projectId: project.id })
        .go({ limit: 50, order: 'desc', attributes: ['id', 'branchName', 'deployUrl', 'date'] });
      meeting =
        (meetingsRes.data ?? [])
          .filter((m: any) => m.branchName && !m.deployUrl)
          .sort((a: any, b: any) => (b.date || '').localeCompare(a.date || ''))[0] ?? null;
      if (meeting) break;
    }

    if (!meeting) {
      return NextResponse.json({ ok: true });
    }

    await updateMeetingDeployUrl(meeting.id, deployUrl);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
