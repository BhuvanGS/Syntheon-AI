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
