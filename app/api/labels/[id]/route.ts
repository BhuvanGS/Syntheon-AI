import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteLabel, updateLabel } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await auth();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const updates: { name?: string; color?: string } = {};

    if (typeof body?.name === 'string') updates.name = body.name.trim();
    if (typeof body?.color === 'string') updates.color = body.color;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    await updateLabel(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update label:', error);
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { orgId } = await auth();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 403 });

    const { id } = await params;
    await deleteLabel(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete label:', error);
    return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
  }
}
