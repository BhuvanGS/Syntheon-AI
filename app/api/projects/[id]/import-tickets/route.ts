import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import {
  addTicketsToProject,
  getMeetingById,
  getProjectById,
  getTicketsByMeetingId,
  saveTickets,
} from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const project = await getProjectById(id);
    if (!project || project.user_id !== userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const sourceMeetingId = String(body?.sourceMeetingId ?? '').trim();
    if (!sourceMeetingId) {
      return NextResponse.json({ error: 'Source meeting is required' }, { status: 400 });
    }

    const meeting = await getMeetingById(sourceMeetingId);
    if (!meeting || meeting.user_id !== userId) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const sourceTickets = await getTicketsByMeetingId(sourceMeetingId);
    if (sourceTickets.length === 0) {
      return NextResponse.json({ error: 'No tickets found for this meeting' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const importedTickets = sourceTickets.map((ticket) => ({
      ...ticket,
      id: randomUUID(),
      projectId: project.id,
      createdAt: now,
      updatedAt: now,
    }));

    await saveTickets(importedTickets);
    await addTicketsToProject(
      project.id,
      importedTickets.map((ticket) => ticket.id)
    );

    return NextResponse.json({
      success: true,
      importedCount: importedTickets.length,
      meeting: {
        id: meeting.id,
        projectName: meeting.projectName,
      },
    });
  } catch (error) {
    console.error('Failed to import tickets:', error);
    return NextResponse.json({ error: 'Failed to import tickets' }, { status: 500 });
  }
}
