// app/api/meetings/[id]/specs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSpecsByMeetingId, updateSpecNote } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const specs   = await getSpecsByMeetingId(id);
    return NextResponse.json(specs);
  } catch (error) {
    console.error('Failed to fetch specs:', error);
    return NextResponse.json({ error: 'Failed to fetch specs' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id }           = await params;
    const { specId, note } = await req.json();

    await updateSpecNote(specId, note);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update spec:', error);
    return NextResponse.json({ error: 'Failed to update spec' }, { status: 500 });
  }
}