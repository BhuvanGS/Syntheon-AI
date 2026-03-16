// app/api/ship/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createGithubIssue, createBranch, commitFile, createPullRequest, getRepoInfo } from '@/lib/shipai/github';
import { moveLinearTicketBundleToPrStage } from '@/lib/shipai/linear';
import {
  loadDB,
  saveDB,
  updateMeetingBranch,
  saveProject,
  updateProject,
  addMeetingToProject,
  addSpecsToProject,
  addFilesToProject,
  getProjectById,
  getProjectByMeetingId
} from '@/lib/db';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const {
      featureRequest,
      plan,
      linearTicketBundle,
      meetingId,
      projectId,
      specs,
      meetingTitle,
      isFollowUp
    } = await req.json();

    if (!plan) return NextResponse.json({ error: 'plan is required' }, { status: 400 });

    console.log('Executing plan:', plan.branch_name);

    // ── Step 1: Create GitHub issue ────────────────────────────
    const issue = await createGithubIssue(plan.issue_title, plan.issue_body);
    console.log('Issue created:', issue.number);

    // ── Step 2: Create branch ──────────────────────────────────
    await createBranch(plan.branch_name);
    console.log('Branch created:', plan.branch_name);

    // ── Step 3: Commit all files ───────────────────────────────
    const committedFiles = [];
    for (const file of plan.files) {
      await commitFile(file.path, file.content, plan.branch_name);
      committedFiles.push(file.path);
      console.log('Committed:', file.path);
    }

    // ── Step 4: Open PR ────────────────────────────────────────
    const pullRequest = await createPullRequest(plan.pr_title, plan.branch_name);
    console.log('PR opened:', pullRequest.number);

    // ── Step 5: Move Linear tickets to PR stage ────────────────
    let updatedBundle = linearTicketBundle;
    if (linearTicketBundle) {
      updatedBundle = await moveLinearTicketBundleToPrStage(linearTicketBundle);
      console.log('Linear tickets moved to PR stage');
    }

    // ── Step 6: Save branch name to meeting ────────────────────
    if (meetingId) {
      updateMeetingBranch(meetingId, plan.branch_name);
      console.log('Branch saved to meeting:', meetingId);
    }

    // ── Step 7: Create or update project ──────────────────────
    const repoInfo   = getRepoInfo();
    const specTitles = specs?.map((s: any) => s.title) ?? [];
    const specIds    = specs?.map((s: any) => s.id) ?? [];
    const nonWorkflowFiles = committedFiles.filter(f => !f.includes('.github'));

    if (isFollowUp && projectId) {
      // Update existing project with new meeting + specs + files
      console.log('Updating existing project:', projectId);

      if (meetingId) addMeetingToProject(projectId, meetingId);
      addSpecsToProject(projectId, specIds);
      addFilesToProject(projectId, nonWorkflowFiles);

      // Update context with new specs
      const project = getProjectById(projectId);
      if (project) {
        const updatedContext = `${project.context}. Follow-up: ${specTitles.join(', ')}`;
        updateProject(projectId, { context: updatedContext });
      }

      console.log('Project updated:', projectId);

    } else if (meetingId) {
      // Check if project already exists for this meeting
      const existingProject = getProjectByMeetingId(meetingId);

      if (!existingProject) {
        // Create new project
        const newProjectId = `project-${Date.now()}`;
        const repo         = `${repoInfo.owner}/${repoInfo.repo}`;

        saveProject({
          id:          newProjectId,
          name:        meetingTitle || plan.issue_title,
          repo,
          branchBase:  'main',
          meetings:    [meetingId],
          specIds,
          files:       nonWorkflowFiles,
          context:     specTitles.join(', '),
          createdAt:   new Date().toISOString(),
          updatedAt:   new Date().toISOString(),
        });

        // Link meeting to project
        const db      = loadDB();
        const meeting = db.meetings.find(m => m.id === meetingId);
        if (meeting) {
          meeting.projectId = newProjectId;
          saveDB(db);
        }

        console.log('New project created:', newProjectId);
      }
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