import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { processDeletionQueue } from '@/lib/privacy-deletion';

export async function POST(req: NextRequest) {
  const secret = process.env.PRIVACY_DELETION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'PRIVACY_DELETION_SECRET is not configured' },
      { status: 503 }
    );
  }

  const header = req.headers.get('x-deletion-secret') ?? '';
  if (header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const result = await processDeletionQueue(client as any);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[privacy/deletion/process] Queue processing failed:', error);
    return NextResponse.json({ error: 'Failed to process deletion queue' }, { status: 500 });
  }
}
