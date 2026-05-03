import { supabaseAdmin } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

export type IntegrationRow = Record<string, any> | null;

export async function getIntegrationByUserId(userId: string): Promise<IntegrationRow> {
  const { data } = await supabaseAdmin
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return data ?? null;
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
