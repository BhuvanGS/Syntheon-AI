import { NextRequest, NextResponse } from 'next/server';
import { updateSprint, deleteSprint } from '@/lib/db';
import { requireAuth, requireProjectAccess } from '@/lib/rbac';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sprintId: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: projectId, sprintId } = await params;
    if (!(await requireProjectAccess(ctx, projectId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (typeof body?.name !== 'undefined') updates.name = String(body.name).trim();
    if (typeof body?.goal !== 'undefined') updates.goal = String(body.goal);
    if (typeof body?.startDate !== 'undefined') updates.startDate = String(body.startDate);
    if (typeof body?.endDate !== 'undefined') updates.endDate = String(body.endDate);
    if (typeof body?.status !== 'undefined') updates.status = String(body.status);
    if (typeof body?.review !== 'undefined') updates.review = String(body.review);

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    await updateSprint(sprintId, updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to update sprint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sprintId: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: projectId, sprintId } = await params;
    if (!(await requireProjectAccess(ctx, projectId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await deleteSprint(sprintId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete sprint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
