import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { OrganizationMetadataEntity } from '@/db/entities';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session.userId || !session.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = await params;
  if (session.orgId !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (session.orgRole !== 'org:admin') {
    return NextResponse.json({ error: 'Only admins can rotate join codes' }, { status: 403 });
  }

  const newJoinCode = Math.random().toString().slice(2, 10).padEnd(8, '0');

  await OrganizationMetadataEntity.update({ orgId })
    .set({ joinCode: newJoinCode, updatedAt: new Date().toISOString() })
    .go();

  return NextResponse.json({ joinCode: newJoinCode });
}
