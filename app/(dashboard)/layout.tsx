import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SseProvider } from '@/components/sse-provider';
import { TermsAcceptanceStamp } from '@/components/auth/terms-acceptance-stamp';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  if (!orgId) {
    redirect('/onboarding');
  }

  return (
    <SseProvider>
      <TermsAcceptanceStamp>{children}</TermsAcceptanceStamp>
    </SseProvider>
  );
}
