import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardProviders } from '@/components/dashboard-providers';
import { TermsAcceptanceStamp } from '@/components/auth/terms-acceptance-stamp';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const sessionStatus = (session as { sessionStatus?: string }).sessionStatus;

  if (sessionStatus === 'pending') {
    redirect('/onboarding');
  }

  if (!session.userId) {
    redirect('/sign-in');
  }

  if (!session.orgId) {
    redirect('/onboarding');
  }

  return (
    <DashboardProviders>
      <TermsAcceptanceStamp>{children}</TermsAcceptanceStamp>
    </DashboardProviders>
  );
}
