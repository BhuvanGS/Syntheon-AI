import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSettingsRedirectUrl } from '@/lib/oauth/redirect';
import { saveGithubIntegration } from '@/lib/services/integrations';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('oauth_user_id')?.value;
  const orgId = cookieStore.get('oauth_org_id')?.value || null;
  const storedState = cookieStore.get('oauth_state')?.value;

  // Scrub OAuth cookies immediately (one-time use)
  cookieStore.delete('oauth_state');
  cookieStore.delete('oauth_user_id');
  cookieStore.delete('oauth_org_id');

  try {
    if (!userId) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('github_error', 'session_lost');
      redirectUrl.searchParams.set(
        'github_error_detail',
        'OAuth session expired. Please try connecting again.'
      );
      return NextResponse.redirect(redirectUrl);
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const stateParam = searchParams.get('state');

    // Validate OAuth state to prevent CSRF
    if (!stateParam || stateParam !== storedState) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('github_error', 'invalid_state');
      return NextResponse.redirect(redirectUrl);
    }

    if (error) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('github_error', error);
      if (errorDescription) {
        redirectUrl.searchParams.set('github_error_detail', errorDescription);
      }
      return NextResponse.redirect(redirectUrl);
    }

    if (!code) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('github_error', 'no_code');
      return NextResponse.redirect(redirectUrl);
    }

    console.log('Exchanging GitHub code for token...');

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('github_error', tokenData.error || 'token_exchange_failed');
      if (tokenData.error_description) {
        redirectUrl.searchParams.set('github_error_detail', tokenData.error_description);
      }
      return NextResponse.redirect(redirectUrl);
    }

    const accessToken = tokenData.access_token;

    console.log('Verifying token...');

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const githubUser = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Failed to verify token:', githubUser);
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('github_error', 'token_invalid');
      return NextResponse.redirect(redirectUrl);
    }

    console.log('GitHub user verified:', githubUser.login);

    await saveGithubIntegration({
      userId,
      orgId,
      githubToken: accessToken,
      githubOwner: githubUser.login,
    });

    const redirectUrl = getSettingsRedirectUrl(req);
    redirectUrl.searchParams.set('github_connected', 'true');
    redirectUrl.searchParams.set('github_user', githubUser.login);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);

    const redirectUrl = getSettingsRedirectUrl(req);
    redirectUrl.searchParams.set('github_error', 'callback_error');
    const message = error instanceof Error ? error.message : 'Unknown callback error';
    redirectUrl.searchParams.set('github_error_detail', message);

    return NextResponse.redirect(redirectUrl);
  }
}
