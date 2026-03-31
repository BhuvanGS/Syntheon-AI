import { supabaseAdmin } from '@/lib/supabase';

export async function saveGithubIntegration(params: {
  userId: string;
  githubToken: string;
  githubOwner: string;
}) {
  const { error } = await supabaseAdmin.from('integrations').upsert(
    {
      user_id: params.userId,
      github_token: params.githubToken,
      github_owner: params.githubOwner,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );

  if (error) {
    throw error;
  }
}

export async function deleteGithubIntegration(userId: string) {
  const { error } = await supabaseAdmin
    .from('integrations')
    .update({
      github_token: null,
      github_owner: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}
