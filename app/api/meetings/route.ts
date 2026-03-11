// app/api/meetings/route.ts
import { NextResponse } from "next/server";
import { getMeetings } from "@/lib/db";

export async function GET() {
  try {
    const meetings = getMeetings();
    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}