// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { transcribeMeeting } from "@/lib/deepgram";
import { extractSpecBlocks } from "@/lib/groq";
import { saveMeeting, saveSpecs } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse multipart form data ──────────────────────────
    const formData  = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const platform  = formData.get("platform")  as string ?? "unknown";
    const tabTitle  = formData.get("tabTitle")   as string ?? "Untitled Meeting";
    const timestamp = formData.get("timestamp")  as string ?? new Date().toISOString();

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // ── 2. Save audio file to disk ────────────────────────────
    const meetingId  = `meet-${Date.now()}`;
    const recordingsDir = path.resolve(process.cwd(), "recordings");
    await mkdir(recordingsDir, { recursive: true });

    const filePath = path.join(recordingsDir, `${meetingId}.webm`);
    const buffer   = Buffer.from(await audioFile.arrayBuffer());
    await writeFile(filePath, buffer);

    console.log("Meeting recording saved:", filePath);

    // ── 3. Transcribe ─────────────────────────────────────────
    const transcript = await transcribeMeeting(filePath);
    console.log("Transcript:", transcript);

    // ── 4. Extract spec blocks via Groq ───────────────────────
    const specs = await extractSpecBlocks(transcript, meetingId);
    console.log(`Extracted ${specs.length} spec blocks`);

    // ── 5. Save to db.json ────────────────────────────────────
    saveMeeting({
      id:            meetingId,
      projectName:   tabTitle,
      meetingId:     meetingId,
      platform,
      transcript,
      specsDetected: specs.length,
      status:        "completed",
      date:          timestamp,
      filePath,
    });

    saveSpecs(specs);

    return NextResponse.json({
      success:       true,
      meetingId,
      specsDetected: specs.length,
      specs,
    });

  } catch (error) {
    console.error("PIPELINE ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}

