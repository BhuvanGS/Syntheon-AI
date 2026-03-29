// app/api/specs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAllSpecs } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const specs = await getAllSpecs(userId);
    return NextResponse.json(specs);
  } catch (error) {
    console.error('Failed to fetch specs:', error);
    return NextResponse.json({ error: 'Failed to fetch specs' }, { status: 500 });
  }
}
