// app/api/ship/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generatePlan } from "@/lib/shipai/ai";
import { createLinearTicketBundle } from "@/lib/shipai/linear";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { specs, meetingTitle, notes = {} } = await req.json();

    const specList = specs
      .map((s: any, i: number) => {
        const note = notes[s.id] ? ` - Note: ${notes[s.id]}` : "";
        return `${i + 1}. [${s.type.toUpperCase()}] ${s.title}${note}`;
      })
      .join("\n");

    if (!specs || specs.length === 0) {
      return NextResponse.json(
        { error: "specs array is required" },
        { status: 400 },
      );
    }

    // Build ONE feature request from ALL approved specs
    

    const featureRequest = `Build a complete application for: "${meetingTitle}"

The following specifications were approved from the meeting:

${specList}

Build the entire application implementing ALL of the above specifications in one cohesive codebase.`;

    console.log("Generating plan for", specs.length, "specs...");

    const plan = await generatePlan(featureRequest);
    console.log(
      "Plan generated:",
      plan.branch_name,
      "— files:",
      plan.files.length,
    );

    const linearTicketBundle = await createLinearTicketBundle(plan);
    console.log(
      "Linear tickets created:",
      linearTicketBundle.parentIssue.identifier,
    );

    return NextResponse.json({
      success: true,
      featureRequest,
      plan,
      linearTicketBundle,
    });
  } catch (error) {
    console.error("Ship plan error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate plan",
      },
      { status: 500 },
    );
  }
}
