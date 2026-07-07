import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSettingsRedirectUrl } from '@/lib/oauth/redirect';
import { saveGoogleIntegration } from '@/lib/services/integrations/google';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('google_oauth_user_id')?.value;
  const orgId = cookieStore.get('google_oauth_org_id')?.value || null;
  const storedState = cookieStore.get('google_oauth_state')?.value;

  cookieStore.delete('google_oauth_state');
  cookieStore.delete('google_oauth_user_id');
  cookieStore.delete('google_oauth_org_id');

  try {
    if (!userId) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('google_error', 'session_lost');
      redirectUrl.searchParams.set(
        'google_error_detail',
        'OAuth session expired. Please try connecting again.'
      );
      return NextResponse.redirect(redirectUrl);
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const stateParam = searchParams.get('state');

    if (!stateParam || stateParam !== storedState) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('google_error', 'invalid_state');
      return NextResponse.redirect(redirectUrl);
    }

    if (error) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('google_error', error);
      if (errorDescription) {
        redirectUrl.searchParams.set('google_error_detail', errorDescription);
      }
      return NextResponse.redirect(redirectUrl);
    }

    if (!code) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('google_error', 'no_code');
      return NextResponse.redirect(redirectUrl);
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const redirectUri =
      process.env.GOOGLE_OAUTH_REDIRECT_URI ||
      `${baseUrl.replace(/\/$/, '')}/api/oauth/google/callback`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('google_error', tokenData.error || 'token_exchange_failed');
      if (tokenData.error_description) {
        redirectUrl.searchParams.set('google_error_detail', tokenData.error_description);
      }
      return NextResponse.redirect(redirectUrl);
    }

    await saveGoogleIntegration({
      userId,
      orgId,
      googleToken: tokenData.access_token,
      googleRefreshToken: tokenData.refresh_token || null,
    });

    const redirectUrl = getSettingsRedirectUrl(req);
    redirectUrl.searchParams.set('google_connected', 'true');
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    const redirectUrl = getSettingsRedirectUrl(req);
    redirectUrl.searchParams.set('google_error', 'callback_error');
    const message = err instanceof Error ? err.message : 'Unknown callback error';
    redirectUrl.searchParams.set('google_error_detail', message);
    return NextResponse.redirect(redirectUrl);
  }
}
