import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔥 Generate raw key
    const rawKey = `syn_${crypto.randomBytes(32).toString('hex')}`;

    // 🔐 Hash before storing
    const keyHash = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('hex');

    // 💾 Store in DB
    await supabaseAdmin.from('api_keys').insert({
      user_id: userId,
      key_hash: keyHash
    });

    // ⚠️ Return raw key ONCE
    return NextResponse.json({ apiKey: rawKey });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 });
  }
}