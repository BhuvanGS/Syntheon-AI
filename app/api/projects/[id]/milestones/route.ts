import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getMilestonesByProject, createMilestone, getProjectById } from '@/lib/db';
import { requireAuth } from '@/lib/rbac';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project || project.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const milestones = await getMilestonesByProject(projectId);
    return NextResponse.json(milestones);
  } catch (error) {
    console.error('Failed to get milestones:', error);
    return NextResponse.json({ error: 'Failed to get milestones' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireAuth();
    if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project || project.org_id !== ctx.orgId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, dueDate } = body as {
      name: string;
      description?: string;
      dueDate?: string;
    };

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const milestone = await createMilestone(
      randomUUID(),
      ctx.orgId,
      projectId,
      name.trim(),
      description,
      dueDate
    );
    return NextResponse.json(milestone);
  } catch (error) {
    console.error('Failed to create milestone:', error);
    return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
  }
}
