import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiKeysEntity } from '@/db/entities';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await ApiKeysEntity.get({ userId }).go();

    return NextResponse.json({ hasKey: !!res.data });
  } catch (error) {
    console.error('Check key error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
