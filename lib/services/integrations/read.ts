import { db } from '@/db/index';
import { integrations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

export type IntegrationRow = Record<string, any> | null;

export async function getIntegrationByUserId(userId: string): Promise<IntegrationRow> {
  const [row] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, userId))
    .limit(1);
  if (!row) return null;
  // Map camelCase to snake_case for backward compat with existing consumers
  return {
    github_token: row.githubToken,
    github_owner: row.githubOwner,
    github_access_token: row.githubAccessToken,
    linear_access_token: row.linearAccessToken,
    linear_token: row.linearToken,
    linear_api_key: row.linearApiKey,
    linear_team_name: row.linearTeamName,
    linear_team_id: row.linearTeamId,
  };
}

export function getLinearAccessToken(integration: IntegrationRow): string | null {
  if (!integration) return null;
  return integration.linear_access_token || integration.linear_token || null;
}

export function getLinearTeamName(integration: IntegrationRow): string | null {
  if (!integration) return null;
  return integration.linear_team_name || null;
}

export function getLinearTeamId(integration: IntegrationRow): string | null {
  if (!integration) return null;
  return integration.linear_team_id || null;
}

export function getGithubToken(integration: IntegrationRow): string | null {
  if (!integration) return null;
  const token = integration.github_token || null;
  if (!token) return null;
  try {
    return decrypt(token);
  } catch {
    // Fallback for tokens stored before encryption was added
    return token;
  }
}

export function getGithubOwner(integration: IntegrationRow): string | null {
  if (!integration) return null;
  return integration.github_owner || null;
}

export async function getIntegrationStatus(userId: string) {
  const integration = await getIntegrationByUserId(userId);

  return {
    githubConnected: Boolean(getGithubToken(integration)),
    githubUser: getGithubOwner(integration),
    linearConnected: Boolean(getLinearAccessToken(integration)),
    linearTeam: getLinearTeamName(integration),
  };
}
