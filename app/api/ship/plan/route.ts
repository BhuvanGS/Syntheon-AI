// app/api/ship/plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/shipai/ai';
import { createLinearTicketBundle } from '@/lib/shipai/linear';

export async function POST(req: NextRequest) {
  try {
    const { specTitle, specType, meetingId } = await req.json();

    if (!specTitle) {
      return NextResponse.json({ error: 'specTitle is required' }, { status: 400 });
    }

    // Build feature request from spec block
    const featureRequest = `${specType?.toUpperCase() || 'FEATURE'}: ${specTitle}\n\nThis was extracted from a Syntheon meeting (ID: ${meetingId}). Generate implementation plan.`;

    console.log('Generating plan for:', featureRequest);

    // Step 1: Generate AI plan
    const plan = await generatePlan(featureRequest);
    console.log('Plan generated:', plan.branch_name);

    // Step 2: Create Linear tickets
    const linearTicketBundle = await createLinearTicketBundle(plan);
    console.log('Linear tickets created:', linearTicketBundle.parentIssue.identifier);

    return NextResponse.json({
      success: true,
      featureRequest,
      plan,
      linearTicketBundle
    });

  } catch (error) {
    console.error('Ship plan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate plan' },
      { status: 500 }
    );
  }
}