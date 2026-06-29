import { IntegrationsEntity } from '@/db/entities';
import { decrypt } from '@/lib/crypto';

export type IntegrationRow = Record<string, any> | null;

export async function getIntegrationByUserId(
  userId: string,
  orgId?: string | null
): Promise<IntegrationRow> {
  if (orgId) {
    const res = await IntegrationsEntity.query.byOrg({ orgId }).go();
    const orgScoped = res.data?.[0];
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

  const res = await IntegrationsEntity.get({ userId }).go();
  if (!res.data) return null;
  return {
    github_token: res.data.githubToken,
    github_owner: res.data.githubOwner,
    github_repo: res.data.githubRepo,
    github_access_token: res.data.githubAccessToken,
    google_token: res.data.googleToken,
    google_refresh_token: res.data.googleRefreshToken,
    webhook_secret: res.data.webhookSecret,
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
  const res = await IntegrationsEntity.get({ userId }).go();
  if (!res.data?.googleToken) return null;
  try {
    return decrypt(res.data.googleToken);
  } catch {
    console.error('[SECURITY] Failed to decrypt Google token');
    return null;
  }
}

export async function getIntegrationStatus(userId: string, orgId?: string | null) {
  const integration = await getIntegrationByUserId(userId, orgId);
  return {
    googleConnected: Boolean(getGoogleToken(integration)),
  };
}
