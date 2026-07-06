import { auth, clerkClient } from '@clerk/nextjs/server';

function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getUserPrimaryEmail(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.emailAddresses?.[0]?.emailAddress?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export async function isBetaAdmin(userId: string, _orgRole: string | null): Promise<boolean> {
  const allowedEmails = parseAdminEmails(process.env.BETA_ADMIN_EMAILS);
  if (allowedEmails.length === 0) {
    return false;
  }

  const email = await getUserPrimaryEmail(userId);
  if (!email) return false;
  return allowedEmails.includes(email);
}

export async function requireBetaAdminUser(): Promise<{ userId: string; email: string | null } | null> {
  const { userId, orgRole } = await auth();
  if (!userId) return null;
  const allowed = await isBetaAdmin(userId, orgRole ?? null);
  if (!allowed) return null;
  const email = await getUserPrimaryEmail(userId);
  return { userId, email };
}
