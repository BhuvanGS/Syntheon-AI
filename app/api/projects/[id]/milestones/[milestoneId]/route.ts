import { NextRequest, NextResponse } from 'next/server';
import { updateMilestone, deleteMilestone, getProjectById } from '@/lib/db';
import { requireAuth, requireProjectAccess } from '@/lib/rbac';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId, milestoneId } = await params;
    const project = await getProjectById(projectId);
    if (!project || project.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (!(await requireProjectAccess(ctx, project.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, dueDate, status } = body as {
      name?: string;
      description?: string;
      dueDate?: string | null;
      status?: string;
    };

    const updates: {
      name?: string;
      description?: string;
      dueDate?: string | null;
      status?: string;
    } = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof description !== 'undefined') updates.description = description;
    if (typeof dueDate !== 'undefined') updates.dueDate = dueDate;
    if (typeof status !== 'undefined') updates.status = status;

    await updateMilestone(milestoneId, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update milestone:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId, milestoneId } = await params;
    const project = await getProjectById(projectId);
    if (!project || project.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    if (!(await requireProjectAccess(ctx, project.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteMilestone(milestoneId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete milestone:', error);
    return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 });
  }
}
