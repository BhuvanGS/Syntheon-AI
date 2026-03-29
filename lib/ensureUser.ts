import { supabaseAdmin } from '@/lib/supabase';

export async function ensureUser(userId: string, email: string) {
  const { data: existingUsers, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId);

  if (error) {
    console.error('ensureUser fetch failed:', error);
    throw error;
  }

  if (existingUsers && existingUsers.length > 0) {
    console.log('User exists (by ID)');
    return;
  }

  // 🔥 ONLY insert if ID doesn't exist
  const { error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      email: email,
    });

  if (insertError) {
    console.error('ensureUser insert failed:', insertError);
    throw insertError;
  }

  console.log('User created');
}