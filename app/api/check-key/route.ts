import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has an existing API key
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Failed to check API key:', error);
      return NextResponse.json({ error: 'Failed to check key' }, { status: 500 });
    }

    return NextResponse.json({ hasKey: !!data });

  } catch (error) {
    console.error('Check key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
