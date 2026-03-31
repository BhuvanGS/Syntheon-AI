import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { buildOAuthAuthorizationUrl } from '@/lib/oauth/initiate';

export async function POST() {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.LINEAR_OAUTH_CLIENT_ID;
    if (!clientId) {
      console.error('LINEAR_OAUTH_CLIENT_ID not set');
      return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
    }

    const redirectUri = process.env.LINEAR_OAUTH_REDIRECT_URI;
    if (!redirectUri) {
      console.error('LINEAR_OAUTH_REDIRECT_URI not set');
      return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
    }

    const authorizationUrl = buildOAuthAuthorizationUrl({
      authorizeEndpoint: 'https://linear.app/oauth/authorize',
      clientId,
      redirectUri,
      extraParams: {
        state: 'temp',
      },
    });

    return NextResponse.json({ authorizationUrl });
  } catch (error) {
    console.error('Linear OAuth initiate error:', error);
    return NextResponse.json({ error: 'Failed to initiate OAuth' }, { status: 500 });
  }
}
