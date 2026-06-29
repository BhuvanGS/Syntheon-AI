import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getTicketById,
  deleteDependency,
  getDependenciesForTicket,
  incrementDependencyIgnoreCount,
  createActivity,
  type DependencyType,
  type DependencyStrength,
} from '@/lib/db';
import { TicketDependenciesEntity } from '@/db/entities';

const DEP_TYPES = new Set<DependencyType>(['data', 'structural', 'logical', 'resource']);
const DEP_STRENGTHS = new Set<DependencyStrength>(['soft', 'hard']);

async function getDepByIdForUser(
  ticketId: string,
  depId: string,
  userId: string,
  orgId?: string | null
): Promise<{ found: boolean }> {
  const ticket = await getTicketById(ticketId);
  if (!ticket) return { found: false };
  if (orgId ? ticket.org_id !== orgId : ticket.user_id !== userId) return { found: false };

  const { parents, children } = await getDependenciesForTicket(ticketId);
  const dep = [...parents, ...children].find((d) => d.id === depId);
  return { found: !!dep };
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; depId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId, depId } = await params;
    const { found } = await getDepByIdForUser(ticketId, depId, userId, orgId);
    if (!found) return NextResponse.json({ error: 'Dependency not found' }, { status: 404 });

    await deleteDependency(depId);

    // Log activity
    await createActivity({
      ticket_id: ticketId,
      user_id: userId,
      action_type: 'dependency_removed',
      metadata: { dependency_id: depId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /dependencies/[depId] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; depId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: ticketId, depId } = await params;
    const { found } = await getDepByIdForUser(ticketId, depId, userId, orgId);
    if (!found) return NextResponse.json({ error: 'Dependency not found' }, { status: 404 });

    const body = await req.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof body?.dependency_type !== 'undefined') {
      if (!DEP_TYPES.has(body.dependency_type)) {
        return NextResponse.json({ error: 'Invalid dependency_type' }, { status: 400 });
      }
      updates.dependency_type = body.dependency_type;
    }
    if (typeof body?.strength !== 'undefined') {
      if (!DEP_STRENGTHS.has(body.strength)) {
        return NextResponse.json({ error: 'Invalid strength' }, { status: 400 });
      }
      updates.strength = body.strength;
    }
    if (typeof body?.note !== 'undefined') {
      updates.note = body.note ? String(body.note).trim() : null;
    }
    if (body?.ignore === true) {
      await incrementDependencyIgnoreCount(depId);
      return NextResponse.json({ success: true });
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Map snake_case keys to ElectroDB camelCase attributes
    const entitySet: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (updates.dependency_type) entitySet.dependencyType = updates.dependency_type;
    if (updates.strength) entitySet.strength = updates.strength;
    if (typeof updates.note !== 'undefined') entitySet.note = updates.note;
    await TicketDependenciesEntity.update({ id: depId }).set(entitySet).go();

    // Log activity
    await createActivity({
      ticket_id: ticketId,
      user_id: userId,
      action_type: 'dependency_updated',
      metadata: updates,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /dependencies/[depId] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
