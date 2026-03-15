import { NextRequest, NextResponse } from 'next/server';
import { loadDB, saveDB } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db      = loadDB();
    db.meetings = db.meetings.filter((m: any) => m.id !== id);
    db.specs    = db.specs.filter((s: any) => s.meeting_id !== id);
    saveDB(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete meeting:', error);
    return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
  }
}
