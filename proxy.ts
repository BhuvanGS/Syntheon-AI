import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

// Next.js 16+: `proxy.ts` replaces the deprecated `middleware.ts` convention.
// Clerk still uses `clerkMiddleware` as the default export (see Clerk Next.js quickstart).

// ─── Domain config ────────────────────────────────────────────────
const MARKETING_DOMAIN = 'syntheonhub.com';
const APP_DOMAIN = 'app.syntheonhub.com';
const PROTOCOL = 'https';

function getHostname(request: Request): string {
  const host = request.headers.get('host') ?? '';
  return host.split(':')[0].toLowerCase();
}

function isMarketingDomain(hostname: string): boolean {
  return hostname === MARKETING_DOMAIN || hostname === `www.${MARKETING_DOMAIN}`;
}

function isAppDomain(hostname: string): boolean {
  return hostname === APP_DOMAIN;
}

// ─── Route matchers ───────────────────────────────────────────────
const isMarketingRoute = createRouteMatcher([
  '/',
  '/how-it-works',
  '/legal',
  '/promo',
  '/docs(.*)',
  '/faq',
  '/contact',
  '/cookie-policy',
]);

const isAppOnlyRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/project(.*)',
  '/settings(.*)',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/accept-invite(.*)',
  '/onboarding(.*)',
  '/join(.*)',
  '/waitlist(.*)',
  '/admin(.*)',
]);

const isApiRoute = createRouteMatcher(['/api/(.*)']);

const isClerkSessionTask = createRouteMatcher(['/sign-up/tasks(.*)', '/sign-in/tasks(.*)']);

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)', '/join(.*)']);

// Truly public — no auth required
const isPublicAppRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/accept-invite(.*)',
  '/pricing',
  '/api/bot/create',
  '/api/bot/webhook(.*)',
  '/api/deploy/webhook(.*)',
  '/api/auth/webhook(.*)',
  '/api/oauth/github/callback',
  '/api/oauth/google/callback',
  '/api/webhooks(.*)',
]);

// Auth required, but active org is optional (onboarding / org bootstrap)
const isOrgOptionalApi = createRouteMatcher([
  '/api/organizations',
  '/api/organizations/join',
  '/api/consent',
  '/api/waitlist',
  '/api/privacy/deletion',
  '/api/oauth/github/initiate',
  '/api/oauth/google/initiate',
]);

function redirectToOnboarding(request: NextRequest) {
  return NextResponse.redirect(new URL('/onboarding', request.url));
}

function requireOrgOrRedirect(
  request: NextRequest,
  session: { userId: string | null | undefined; orgId: string | null | undefined }
) {
  if (!session.userId || session.orgId) return null;

  if (isOnboardingRoute(request) || isOrgOptionalApi(request)) return null;

  if (isApiRoute(request)) {
    return NextResponse.json({ error: 'No organization' }, { status: 403 });
  }

  // App pages that need an org
  if (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/project') ||
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname === '/pricing'
  ) {
    return redirectToOnboarding(request);
  }

  return null;
}

export default clerkMiddleware(async (auth, request) => {
  const hostname = getHostname(request);
  const pathname = request.nextUrl.pathname;

  // Prefer apex host so Google doesn't split indexing across www + non-www
  if (hostname === `www.${MARKETING_DOMAIN}`) {
    const url = request.nextUrl.clone();
    url.host = MARKETING_DOMAIN;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  // ─── Subdomain routing logic ──────────────────────────────────
  if (isMarketingDomain(hostname)) {
    if (isAppOnlyRoute(request)) {
      return NextResponse.redirect(`${PROTOCOL}://${APP_DOMAIN}${pathname}`);
    }
    return NextResponse.next();
  }

  if (isAppDomain(hostname)) {
    if (isMarketingRoute(request) && !isApiRoute(request)) {
      return NextResponse.redirect(`${PROTOCOL}://${MARKETING_DOMAIN}${pathname}`);
    }

    if (pathname === '/') {
      const session = await auth();
      if (session.userId) {
        if (!session.orgId) {
          return NextResponse.redirect(`${PROTOCOL}://${APP_DOMAIN}/onboarding`);
        }
        return NextResponse.redirect(`${PROTOCOL}://${APP_DOMAIN}/dashboard`);
      }
      return NextResponse.redirect(`${PROTOCOL}://${APP_DOMAIN}/sign-in`);
    }

    if (isClerkSessionTask(request)) {
      const session = await auth();
      if (session.userId) {
        if (!session.orgId) {
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/sign-up', request.url));
    }

    if (isPublicAppRoute(request)) return NextResponse.next();

    // Onboarding requires auth but not an active org
    if (isOnboardingRoute(request)) {
      await auth.protect();
      return NextResponse.next();
    }

    const session = await auth();
    if (!session.userId) {
      if (isApiRoute(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      await auth.protect();
    }

    const orgGate = requireOrgOrRedirect(request, session);
    if (orgGate) return orgGate;

    return NextResponse.next();
  }

  // ─── Fallback for unknown domains (localhost, preview URLs, etc.) ───
  if (isClerkSessionTask(request)) {
    const session = await auth();
    if (session.userId) {
      if (!session.orgId) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/sign-up', request.url));
  }

  if (isPublicAppRoute(request) || isMarketingRoute(request)) return NextResponse.next();

  if (isOnboardingRoute(request)) {
    await auth.protect();
    return NextResponse.next();
  }

  const session = await auth();

  if (!session.userId) {
    if (isApiRoute(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await auth.protect();
  }

  const orgGate = requireOrgOrRedirect(request, session);
  if (orgGate) return orgGate;

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
