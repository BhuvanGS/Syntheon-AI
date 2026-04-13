import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { ensureUser } from '@/lib/ensureUser';
import { getLinearViewerContext } from '@/lib/shipai/linear';
import { getSettingsRedirectUrl } from '@/lib/oauth/redirect';
import { saveLinearIntegration } from '@/lib/services/integrations';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = await currentUser();

    if (!session.userId || !user) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    const userId = session.userId;
    const email = user.emailAddresses[0].emailAddress;
    await ensureUser(userId, email);

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('linear_error', error);
      if (errorDescription) {
        redirectUrl.searchParams.set('linear_error_detail', errorDescription);
      }
      return NextResponse.redirect(redirectUrl);
    }

    if (!code) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('linear_error', 'no_code');
      return NextResponse.redirect(redirectUrl);
    }

    const clientId = process.env.LINEAR_OAUTH_CLIENT_ID;
    const clientSecret = process.env.LINEAR_OAUTH_CLIENT_SECRET;
    const redirectUri = process.env.LINEAR_OAUTH_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('linear_error', 'oauth_not_configured');
      return NextResponse.redirect(redirectUrl);
    }

    const tokenPayload = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch('https://api.linear.app/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenPayload.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      const redirectUrl = getSettingsRedirectUrl(req);
      redirectUrl.searchParams.set('linear_error', tokenData.error || 'token_exchange_failed');
      if (tokenData.error_description) {
        redirectUrl.searchParams.set('linear_error_detail', tokenData.error_description);
      }
      return NextResponse.redirect(redirectUrl);
    }

    const accessToken = tokenData.access_token as string;

    const context = await getLinearViewerContext(accessToken);

    await saveLinearIntegration(userId, {
      token: accessToken,
      teamId: context.defaultTeamId,
      teamName: context.defaultTeamName,
      linearUserId: context.viewer?.id ?? null,
      linearUserName: context.viewer?.name ?? null,
    });

    const redirectUrl = getSettingsRedirectUrl(req);
    redirectUrl.searchParams.set('linear_connected', 'true');
    if (context.defaultTeamName) {
      redirectUrl.searchParams.set('linear_team', context.defaultTeamName);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Linear OAuth callback error:', error);

    const redirectUrl = getSettingsRedirectUrl(req);
    redirectUrl.searchParams.set('linear_error', 'callback_error');
    const message = error instanceof Error ? error.message : 'Unknown callback error';
    redirectUrl.searchParams.set('linear_error_detail', message);

    return NextResponse.redirect(redirectUrl);
  }
}
