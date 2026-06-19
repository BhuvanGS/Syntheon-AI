import { db } from '@/db/index';
import { integrations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

export type IntegrationRow = Record<string, any> | null;

export async function getIntegrationByUserId(
  userId: string,
  orgId?: string | null
): Promise<IntegrationRow> {
  // If orgId provided, prefer org-scoped integration
  if (orgId) {
    const [orgScoped] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.userId, userId), eq(integrations.orgId, orgId)))
      .limit(1);
    if (orgScoped) {
      return {
        github_token: orgScoped.githubToken,
        github_owner: orgScoped.githubOwner,
        github_repo: orgScoped.githubRepo,
        github_access_token: orgScoped.githubAccessToken,
        webhook_secret: orgScoped.webhookSecret,
      };
    }
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

export async function getIntegrationStatus(userId: string, orgId?: string | null) {
  const integration = await getIntegrationByUserId(userId, orgId);
  return {
    githubConnected: Boolean(getGithubToken(integration)),
    githubUser: getGithubOwner(integration),
    githubRepo: getGithubRepo(integration),
  };
}
