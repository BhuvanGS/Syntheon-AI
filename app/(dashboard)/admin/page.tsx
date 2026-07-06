import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isBetaAdmin } from '@/lib/beta-admin';
import { AdminWaitlistPanel } from '@/components/admin-waitlist-panel';

export default async function AdminPage() {
  const { userId, orgRole } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const allowed = await isBetaAdmin(userId, orgRole ?? null);
  if (!allowed) {
    notFound();
  }

  return <AdminWaitlistPanel />;
}
