import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    // Check if user is logged in
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build GitHub authorization URL
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    if (!clientId) {
      console.error('GITHUB_OAUTH_CLIENT_ID not set');
      return NextResponse.json(
        { error: 'OAuth not configured' },
        { status: 500 }
      );
    }

    const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI;
    if (!redirectUri) {
      console.error('GITHUB_OAUTH_REDIRECT_URI not set');
      return NextResponse.json(
        { error: 'OAuth not configured' },
        { status: 500 }
      );
    }

    // Create authorization URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo',
      state: 'temp', // TODO: Use proper CSRF state
    });

    const authorizationUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

    console.log('Redirecting to GitHub authorization...');

    return NextResponse.json({ authorizationUrl });

  } catch (error) {
    console.error('OAuth initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}