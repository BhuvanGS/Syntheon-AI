import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SseProvider } from '@/components/sse-provider';
import { ConsentGate } from '@/components/consent-gate';
import { getBetaStatus } from '@/lib/beta';
import { hasBetaAccess } from '@/lib/waitlist';
import { isBetaAdmin } from '@/lib/beta-admin';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, orgId, orgRole } = await auth();

  // Must be signed in to access the dashboard.
  if (!userId) {
    redirect('/sign-in');
  }

  const beta = getBetaStatus();
  if (beta.isActive) {
    const adminAllowed = await isBetaAdmin(userId, orgRole ?? null);
    if (!adminAllowed) {
      const approved = await hasBetaAccess(userId);
      if (!approved) {
        redirect('/waitlist');
      }
    }
  }

  // Must have an active organization. Public domain users get one auto-created by
  // the user.created webhook; private domain users create/join one in onboarding.
  // Onboarding handles both cases (polls for the webhook org or shows create/join).
  if (!orgId) {
    redirect('/onboarding');
  }

  return (
    <SseProvider>
      <ConsentGate>{children}</ConsentGate>
    </SseProvider>
  );
}
