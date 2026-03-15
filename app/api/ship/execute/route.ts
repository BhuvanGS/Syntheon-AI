// app/api/ship/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createGithubIssue, createBranch, commitFile, createPullRequest } from '@/lib/shipai/github';
import { moveLinearTicketBundleToPrStage } from '@/lib/shipai/linear';
import { loadDB, saveDB, updateMeetingBranch } from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { featureRequest, plan, linearTicketBundle, meetingId } = await req.json();

    if (!plan) return NextResponse.json({ error: 'plan is required' }, { status: 400 });

    console.log('Executing plan:', plan.branch_name);

    // Step 1: Create GitHub issue
    const issue = await createGithubIssue(plan.issue_title, plan.issue_body);
    console.log('Issue created:', issue.number);

    // Step 2: Create branch
    await createBranch(plan.branch_name);
    console.log('Branch created:', plan.branch_name);

    // Step 3: Commit all files
    const committedFiles = [];
    for (const file of plan.files) {
      await commitFile(file.path, file.content, plan.branch_name);
      committedFiles.push(file.path);
      console.log('Committed:', file.path);
    }

    // Step 4: Open PR
    const pullRequest = await createPullRequest(plan.pr_title, plan.branch_name);
    console.log('PR opened:', pullRequest.number);

    // Step 5: Move Linear tickets to PR stage
    let updatedBundle = linearTicketBundle;
    if (linearTicketBundle) {
      updatedBundle = await moveLinearTicketBundleToPrStage(linearTicketBundle);
      console.log('Linear tickets moved to PR stage');
    }

    // Step 6: Save branch name to meeting in db
    if (meetingId) {
      updateMeetingBranch(meetingId, plan.branch_name);
      console.log('Branch name saved to meeting:', meetingId, plan.branch_name);
    }

    return NextResponse.json({
      success:            true,
      issue,
      pullRequest,
      committedFiles,
      linearTicketBundle: updatedBundle
    });

  } catch (error) {
    console.error('Ship execute error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute' },
      { status: 500 }
    );
  }
}