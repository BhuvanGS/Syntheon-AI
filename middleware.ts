import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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
]);

const isApiRoute = createRouteMatcher(['/api/(.*)']);

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)', '/project(.*)', '/settings(.*)']);

const isClerkSessionTask = createRouteMatcher(['/sign-up/tasks(.*)', '/sign-in/tasks(.*)']);

// Routes that are public (no auth) on the app subdomain
const isPublicAppRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/accept-invite(.*)',
  '/onboarding(.*)',
  '/pricing',
  '/api/bot/create',
  '/api/bot/webhook(.*)',
  '/api/deploy/webhook(.*)',
  '/api/auth/webhook(.*)',
  '/api/oauth/github/callback',
  '/api/oauth/google/callback',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const hostname = getHostname(request);
  const pathname = request.nextUrl.pathname;

  // ─── Subdomain routing logic ──────────────────────────────────
  if (isMarketingDomain(hostname)) {
    // Marketing domain: redirect app routes to app subdomain
    if (isAppOnlyRoute(request)) {
      return NextResponse.redirect(`${PROTOCOL}://${APP_DOMAIN}${pathname}`);
    }
    // Serve marketing pages normally
    return NextResponse.next();
  }

  if (isAppDomain(hostname)) {
    // App domain: redirect marketing routes to marketing subdomain
    if (isMarketingRoute(request) && !isApiRoute(request)) {
      return NextResponse.redirect(`${PROTOCOL}://${MARKETING_DOMAIN}${pathname}`);
    }

    // Root on app domain → redirect to dashboard or sign-in
    if (pathname === '/') {
      const session = await auth();
      if (session.userId) {
        return NextResponse.redirect(`${PROTOCOL}://${APP_DOMAIN}/dashboard`);
      }
      return NextResponse.redirect(`${PROTOCOL}://${APP_DOMAIN}/sign-in`);
    }

    // Intercept Clerk session task URLs
    if (isClerkSessionTask(request)) {
      const session = await auth();
      if (session.userId) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      return NextResponse.redirect(new URL('/sign-up', request.url));
    }

    // Public app routes — no auth required
    if (isPublicAppRoute(request)) return NextResponse.next();

    // Auth check for protected app routes
    const session = await auth();
    if (!session.userId) {
      if (isApiRoute(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      await auth.protect();
    }

    // Authenticated but no org → redirect to onboarding for dashboard routes
    if (session.userId && !session.orgId && isDashboardRoute(request)) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    return NextResponse.next();
  }

  // ─── Fallback for unknown domains (localhost, preview URLs, etc.) ───
  // Keep existing behavior for dev/preview environments

  // Intercept Clerk session task URLs
  if (isClerkSessionTask(request)) {
    const session = await auth();
    if (session.userId) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return NextResponse.redirect(new URL('/sign-up', request.url));
  }

  // Public routes on dev/preview
  if (isPublicAppRoute(request) || isMarketingRoute(request)) return NextResponse.next();

  const session = await auth();

  if (!session.userId) {
    if (isApiRoute(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await auth.protect();
  }

  if (session.userId && !session.orgId && isDashboardRoute(request)) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
