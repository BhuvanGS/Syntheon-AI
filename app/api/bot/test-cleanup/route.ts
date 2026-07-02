import { NextRequest, NextResponse } from 'next/server';
import { getTicketsByProjectId, deleteTicketById } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();
  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 });
  }

  const tickets = await getTicketsByProjectId(projectId);

  let deleted = 0;
  for (const t of tickets) {
    await deleteTicketById(t.id);
    deleted++;
  }

  return NextResponse.json({ success: true, deleted });
}
