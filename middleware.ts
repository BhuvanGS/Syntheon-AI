import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/how-it-works',
  '/legal',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/bot/webhook(.*)', // Skribby webhook must be public
  '/api/deploy/webhook(.*)', // GitHub webhook must be public
  '/api/auth/webhook(.*)',
  '/api/bot/create',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
