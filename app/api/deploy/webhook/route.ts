// app/api/deploy/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loadDB, saveDB } from '@/lib/db';

async function getGithubPagesUrl(owner: string, repo: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
      headers: {
        'Authorization':        `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept':               'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      }
    });

    if (!res.ok) return null;

    const data = await res.json();
    console.log('GitHub Pages URL:', data.html_url);
    return data.html_url ?? null;

  } catch (err) {
    console.error('Failed to fetch Pages URL:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('GitHub webhook ref:', payload.ref);

    // Only handle pushes to main
    if (payload.ref !== 'refs/heads/main' || !payload.repository) {
      return NextResponse.json({ ok: true });
    }

    const owner = payload.repository.owner.login;
    const repo  = payload.repository.name;

    console.log('Push to main detected for:', owner, repo);

    // Fetch the actual Pages URL from GitHub API
    const deployUrl = await getGithubPagesUrl(owner, repo);

    if (!deployUrl) {
      console.error('Could not fetch GitHub Pages URL');
      return NextResponse.json({ ok: true });
    }

    console.log('Deploy URL fetched:', deployUrl);

    // Find most recent meeting with a branchName but no deployUrl
    const db      = loadDB();
    const meeting = db.meetings.find((m: any) => m.branchName && !m.deployUrl);

    if (!meeting) {
      console.log('No meeting found needing deploy URL');
      return NextResponse.json({ ok: true });
    }

    meeting.deployUrl = deployUrl;
    saveDB(db);

    console.log('Deploy URL saved for meeting:', meeting.id, deployUrl);
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Deploy webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}