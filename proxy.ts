import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes — no auth required
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/how-it-works',
  '/legal',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/accept-invite(.*)',
  '/onboarding(.*)',
  '/api/bot/create',
  '/api/bot/webhook(.*)',
  '/api/deploy/webhook(.*)',
  '/api/auth/webhook(.*)',
  '/api/oauth/github/callback',
  '/api/webhooks(.*)',
]);

// API routes — return 401 JSON instead of 307 redirect to prevent endpoint enumeration
const isApiRoute = createRouteMatcher(['/api/(.*)']);

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)', '/project(.*)', '/settings(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Always let public routes through
  if (isPublicRoute(request)) return NextResponse.next();

  const session = await auth();

  // Not authenticated
  if (!session.userId) {
    // API routes → return 401 JSON (no redirect that would leak route existence)
    if (isApiRoute(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Browser routes → redirect to sign-in
    await auth.protect();
  }

  // Authenticated but no org → redirect to onboarding for dashboard routes
  if (session.userId && !session.orgId && isDashboardRoute(request)) {
    const onboardingUrl = new URL('/onboarding', request.url);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
