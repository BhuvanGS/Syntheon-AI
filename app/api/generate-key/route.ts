import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔥 Generate raw API key (shown only once)
    const rawKey = `syn_${crypto.randomBytes(32).toString('hex')}`;

    // 🔐 Hash before storing
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // 💾 Upsert → ensures ONE key per user (no duplicates)
    const { error } = await supabaseAdmin.from('api_keys').upsert(
      {
        user_id: userId,
        key_hash: keyHash,
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      console.error('API key save failed:', error);
      return NextResponse.json({ error: 'Failed to save key' }, { status: 500 });
    }

    // ⚠️ Return raw key ONLY ONCE
    return NextResponse.json({ apiKey: rawKey });
  } catch (err) {
    console.error('Generate key error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
