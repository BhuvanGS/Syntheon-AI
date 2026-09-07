import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const sessionStatus = (session as { sessionStatus?: string }).sessionStatus;
  const pending = sessionStatus === 'pending';

  // Pending sessions (choose-organization task) are treated as signed-out by Clerk.
  // Still allow this page so the task UI can complete and activate the session.
  if (!pending && !session.userId) {
    redirect('/sign-in');
  }

  if (!pending && session.orgId) {
    redirect('/dashboard');
  }

  return children;
}
