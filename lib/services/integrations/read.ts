import { db } from '@/db/index';
import { integrations } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

export type IntegrationRow = Record<string, any> | null;

export async function getIntegrationByUserId(
  userId: string,
  orgId?: string | null
): Promise<IntegrationRow> {
  // If orgId is provided, treat the integration as org-shared so all members
  // in the active organization see the same connection state.
  if (orgId) {
    const [orgScoped] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.orgId, orgId))
      .orderBy(desc(integrations.updatedAt))
      .limit(1);
    if (!orgScoped) return null;
    return {
      github_token: orgScoped.githubToken,
      github_owner: orgScoped.githubOwner,
      github_repo: orgScoped.githubRepo,
      github_access_token: orgScoped.githubAccessToken,
      google_token: orgScoped.googleToken,
      google_refresh_token: orgScoped.googleRefreshToken,
      webhook_secret: orgScoped.webhookSecret,
    };
  }

  // Fall back to user-scoped (legacy or no org)
  const [row] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, userId))
    .limit(1);
  if (!row) return null;
  return {
    github_token: row.githubToken,
    github_owner: row.githubOwner,
    github_repo: row.githubRepo,
    github_access_token: row.githubAccessToken,
    google_token: row.googleToken,
    google_refresh_token: row.googleRefreshToken,
    webhook_secret: row.webhookSecret,
  };
}

export function getGithubToken(integration: IntegrationRow): string | null {
  if (!integration) return null;
  const token = integration.github_token || null;
  if (!token) return null;
  try {
    return decrypt(token);
  } catch {
    console.error(
      '[SECURITY] Failed to decrypt GitHub token — possible key rotation or data corruption'
    );
    return null;
  }
}

export function getGithubOwner(integration: IntegrationRow): string | null {
  if (!integration) return null;
  return integration.github_owner || null;
}

export function getGithubRepo(integration: IntegrationRow): string | null {
  if (!integration) return null;
  return integration.github_repo || null;
}

export function getGithubWebhookSecret(integration: IntegrationRow): string | null {
  if (!integration) return null;
  const secret = integration.webhook_secret || null;
  if (!secret) return null;
  try {
    return decrypt(secret);
  } catch {
    console.error('[SECURITY] Failed to decrypt webhook secret');
    return null;
  }
}

export function getGoogleToken(integration: IntegrationRow): string | null {
  if (!integration) return null;
  const token = integration.google_token || null;
  if (!token) return null;
  try {
    return decrypt(token);
  } catch {
    console.error('[SECURITY] Failed to decrypt Google token');
    return null;
  }
}

export async function getGoogleTokenForUser(userId: string): Promise<string | null> {
  // Always user-scoped — Google Calendar is personal, never org-shared
  const [row] = await db
    .select({ googleToken: integrations.googleToken })
    .from(integrations)
    .where(eq(integrations.userId, userId))
    .limit(1);
  if (!row?.googleToken) return null;
  try {
    return decrypt(row.googleToken);
  } catch {
    console.error('[SECURITY] Failed to decrypt Google token');
    return null;
  }
}

export async function getIntegrationStatus(userId: string, orgId?: string | null) {
  const integration = await getIntegrationByUserId(userId, orgId);
  return {
    githubConnected: Boolean(getGithubToken(integration)),
    githubUser: getGithubOwner(integration),
    githubRepo: getGithubRepo(integration),
    googleConnected: Boolean(getGoogleToken(integration)),
  };
}
