import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SseProvider } from '@/components/sse-provider';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, orgId } = await auth();

  // Must be signed in to access the dashboard.
  if (!userId) {
    redirect('/sign-in');
  }

  // Must have an active organization. Public domain users get one auto-created by
  // the user.created webhook; private domain users create/join one in onboarding.
  // Onboarding handles both cases (polls for the webhook org or shows create/join).
  if (!orgId) {
    redirect('/onboarding');
  }

  return <SseProvider>{children}</SseProvider>;
}
