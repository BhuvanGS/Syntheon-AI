import { supabaseAdmin } from '@/lib/supabase';

type LinearIntegrationPayload = {
  token: string;
  teamId: string | null;
  teamName: string | null;
  linearUserId: string | null;
  linearUserName: string | null;
};

export async function saveLinearIntegration(userId: string, payload: LinearIntegrationPayload) {
  const now = new Date().toISOString();

  const candidatePayloads = [
    {
      user_id: userId,
      linear_access_token: payload.token,
    },
    {
      user_id: userId,
      linear_token: payload.token,
    },
    {
      user_id: userId,
      linear_access_token: payload.token,
      updated_at: now,
    },
    {
      user_id: userId,
      linear_token: payload.token,
      updated_at: now,
    },
    {
      user_id: userId,
      linear_access_token: payload.token,
      linear_team_id: payload.teamId,
      linear_team_name: payload.teamName,
      linear_user_id: payload.linearUserId,
      linear_user_name: payload.linearUserName,
      updated_at: now,
    },
    {
      user_id: userId,
      linear_token: payload.token,
      linear_team_id: payload.teamId,
      linear_team_name: payload.teamName,
      linear_user_id: payload.linearUserId,
      linear_user_name: payload.linearUserName,
      updated_at: now,
    },
  ];

  let lastError: any = null;

  for (const data of candidatePayloads) {
    const result = await supabaseAdmin.from('integrations').upsert(data, { onConflict: 'user_id' });

    if (!result.error) {
      return;
    }

    lastError = result.error;
  }

  throw lastError;
}

export async function deleteLinearIntegration(userId: string) {
  const { error } = await supabaseAdmin
    .from('integrations')
    .update({
      linear_token: null,
      linear_team_id: null,
      linear_initial_state_id: null,
      linear_pr_state_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}
