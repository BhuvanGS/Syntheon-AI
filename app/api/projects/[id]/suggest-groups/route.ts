import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getProjectById, getTicketsByProjectId } from '@/lib/db';
import { suggestTicketGroupings } from '@/lib/groq-ai';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId } = await params;
    const project = await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const owned = orgId ? project.org_id === orgId : project.user_id === userId;
    if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const tickets = await getTicketsByProjectId(projectId);
    const ungrouped = tickets.filter((t) => !t.isGroup && !t.dependency_ticket_id);

    if (ungrouped.length < 3) {
      return NextResponse.json({
        groups: [],
        message: 'Not enough ungrouped tickets to suggest groupings (need at least 3).',
      });
    }

    const groups = await suggestTicketGroupings(
      ungrouped.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description ?? '',
      }))
    );

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Failed to suggest ticket groupings:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
