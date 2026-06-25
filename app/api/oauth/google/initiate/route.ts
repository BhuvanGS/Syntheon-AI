import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { buildOAuthAuthorizationUrl } from '@/lib/oauth/initiate';

export async function POST() {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      console.error('GOOGLE_OAUTH_CLIENT_ID not set');
      return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_APP_URL not set');
      return NextResponse.json({ error: 'App URL not configured' }, { status: 500 });
    }
    const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/oauth/google/callback`;

    const state = randomUUID();
    const cookieStore = await cookies();
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 300,
      path: '/',
    };
    cookieStore.set('google_oauth_state', state, cookieOpts);
    cookieStore.set('google_oauth_user_id', session.userId, cookieOpts);
    cookieStore.set('google_oauth_org_id', session.orgId || '', cookieOpts);

    const authorizationUrl = buildOAuthAuthorizationUrl({
      authorizeEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId,
      redirectUri,
      extraParams: {
        scope: 'https://www.googleapis.com/auth/calendar.events',
        state,
        access_type: 'offline',
        prompt: 'consent',
        response_type: 'code',
      },
    });

    return NextResponse.json({ authorizationUrl });
  } catch (error) {
    console.error('Google OAuth initiate error:', error);
    return NextResponse.json({ error: 'Failed to initiate OAuth' }, { status: 500 });
  }
}
