import { NextRequest, NextResponse } from "next/server";
import { getSpecsByMeetingId } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ← await params
    const specs = getSpecsByMeetingId(id);
    return NextResponse.json(specs);
  } catch (error) {
    console.error("Failed to fetch specs:", error);
    return NextResponse.json(
      { error: "Failed to fetch specs" },
      { status: 500 }
    );
  }
}