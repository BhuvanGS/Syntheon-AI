import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { WaitlistClient } from '@/components/waitlist-client';

export default async function WaitlistPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  return <WaitlistClient />;
}
