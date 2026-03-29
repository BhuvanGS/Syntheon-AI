import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase'; // 🔥 ADD THIS
import { ensureUser } from '@/lib/ensureUser';


export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const user = await currentUser();

    if (!session.userId || !user) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    const userId = session.userId; // 🔥 FIX 1
    const email = user.emailAddresses[0].emailAddress;
    await ensureUser(userId, email);
    const { data: checkUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId);
console.log(currentUser + "Current")
    console.log("USER AFTER ENSURE:", checkUser);

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.log('User denied GitHub access:', error);
      const redirectUrl = new URL('/dashboard', req.url);
      redirectUrl.searchParams.set('github_error', error);
      return NextResponse.redirect(redirectUrl);
    }

    if (!code) {
      console.error('No code from GitHub');
      const redirectUrl = new URL('/dashboard', req.url);
      redirectUrl.searchParams.set('github_error', 'no_code');
      return NextResponse.redirect(redirectUrl);
    }

    console.log('Exchanging GitHub code for token...');

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange failed:', tokenData.error);
      const redirectUrl = new URL('/dashboard', req.url);
      redirectUrl.searchParams.set('github_error', tokenData.error);
      return NextResponse.redirect(redirectUrl);
    }

    const accessToken = tokenData.access_token;

    console.log('Verifying token...');

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github+json',
      },
    });

    const githubUser = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Failed to verify token:', githubUser);
      const redirectUrl = new URL('/dashboard', req.url);
      redirectUrl.searchParams.set('github_error', 'token_invalid');
      return NextResponse.redirect(redirectUrl);
    }

    console.log('GitHub user verified:', githubUser.login);

    // 🔥 SAVE TOKEN (THIS WAS MISSING PROPERLY)


    console.log('GitHub token stored successfully');

    const { data, error: supabaseError } = await supabaseAdmin
      .from('integrations')
      .upsert({
        user_id: userId,
        github_token: accessToken,
        github_owner: githubUser.login,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select();

    console.log('UPSERT RESULT:', data, supabaseError);



    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.set('github_connected', 'true');
    redirectUrl.searchParams.set('github_user', githubUser.login);

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth callback error:', error);

    const redirectUrl = new URL('/dashboard', req.url);
    redirectUrl.searchParams.set('github_error', 'callback_error');

    return NextResponse.redirect(redirectUrl);
  }
}