import { NextRequest, NextResponse } from "next/server";
import { getSpecsByMeetingId, loadDB, saveDB } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const specs  = getSpecsByMeetingId(id);
    return NextResponse.json(specs);
  } catch (error) {
    console.error("Failed to fetch specs:", error);
    return NextResponse.json(
      { error: "Failed to fetch specs" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id }           = await params;
    const { specId, note } = await req.json();

    const db   = loadDB();
    const spec = db.specs.find((s: any) => s.id === specId && s.meeting_id === id);

    if (!spec) {
      return NextResponse.json({ error: 'Spec not found' }, { status: 404 });
    }

    (spec as any).note = note;
    saveDB(db);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to update spec:', error);
    return NextResponse.json(
      { error: 'Failed to update spec' },
      { status: 500 }
    );
  }
}