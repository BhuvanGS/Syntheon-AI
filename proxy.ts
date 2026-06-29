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
  '/api/oauth/google/callback',
  '/api/webhooks(.*)',
]);

// API routes — return 401 JSON instead of 307 redirect to prevent endpoint enumeration
const isApiRoute = createRouteMatcher(['/api/(.*)']);

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)', '/project(.*)', '/settings(.*)']);

// Clerk session task URLs — intercept and redirect to our custom onboarding
const isClerkSessionTask = createRouteMatcher(['/sign-up/tasks(.*)', '/sign-in/tasks(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Intercept Clerk's built-in org creation session task
  if (isClerkSessionTask(request)) {
    const session = await auth();
    if (session.userId) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return NextResponse.redirect(new URL('/sign-up', request.url));
  }

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
