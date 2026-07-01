import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateTicketRanks } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { rankUpdates } = body as { rankUpdates: { id: string; rank: number }[] };

    if (!Array.isArray(rankUpdates) || rankUpdates.length === 0) {
      return NextResponse.json({ error: 'rankUpdates must be a non-empty array' }, { status: 400 });
    }

    for (const update of rankUpdates) {
      if (!update.id || typeof update.rank !== 'number') {
        return NextResponse.json({ error: 'Each update must have id and rank' }, { status: 400 });
      }
    }

    await updateTicketRanks(rankUpdates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update ranks:', error);
    return NextResponse.json({ error: 'Failed to update ranks' }, { status: 500 });
  }
}
