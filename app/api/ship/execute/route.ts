// app/api/ship/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  createGithubIssue,
  createBranch,
  commitFile,
  createPullRequest,
  getRepoInfo,
} from '@/lib/shipai/github';
import { MeetingsEntity } from '@/db/entities';
import {
  getIntegrationByUserId,
  getGithubToken,
  getGithubOwner,
  getGithubRepo,
} from '@/lib/services/integrations';
import {
  updateMeetingBranch,
  saveProject,
  updateProject,
  addMeetingToProject,
  addTicketsToProject,
  addFilesToProject,
  getProjectById,
  getProjectByMeetingId,
} from '@/lib/db';
import { aiRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const limited = await aiRateLimit(req, userId);
    if (limited) return limited;

    const {
      plan,
      meetingId,
      projectId,
      tickets,
      meetingTitle,
      isFollowUp,
      githubOwner,
      githubRepo,
    } = await req.json();

    if (!plan) return NextResponse.json({ error: 'plan is required' }, { status: 400 });

    // Get user's GitHub integration
    const integration = await getIntegrationByUserId(userId, orgId);
    const githubToken = getGithubToken(integration);

    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 });
    }

    // Resolve owner/repo — follow-ups use project's repo, first ships use user's selection
    let owner: string | null = null;
    let repo: string | null = null;

    if (isFollowUp && projectId) {
      const project = await getProjectById(projectId);
      if (project?.repo) {
        const parts = project.repo.split('/');
        if (parts[0] && parts[1]) {
          owner = parts[0];
          repo = parts[1];
        }
      }
    } else {
      // First ship — use user's selected repo from the UI
      owner = githubOwner || getGithubOwner(integration);
      repo = githubRepo || getGithubRepo(integration);
    }

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'GitHub repository not configured. Select a repo in the Ship panel.' },
        { status: 400 }
      );
    }

    console.log('Executing plan on', `${owner}/${repo}`, 'branch:', plan.branch_name);

    const repoOverrides = { owner, repo };

    // Step 1: Create GitHub issue
    const issue = await createGithubIssue(
      plan.issue_title,
      plan.issue_body,
      githubToken,
      repoOverrides
    );
    console.log('Issue created:', issue.number);

    // Step 2: Create branch
    await createBranch(plan.branch_name, githubToken, repoOverrides);
    console.log('Branch created:', plan.branch_name);

    // Step 3: Commit all files
    const committedFiles = [];
    for (const file of plan.files) {
      await commitFile(file.path, file.content, plan.branch_name, githubToken, repoOverrides);
      committedFiles.push(file.path);
      console.log('Committed:', file.path);
    }

    // Step 4: Open PR
    const pullRequest = await createPullRequest(
      plan.pr_title,
      plan.branch_name,
      githubToken,
      repoOverrides
    );
    console.log('PR opened:', pullRequest.number);

    // Step 5: Save branch name to meeting
    if (meetingId) {
      await updateMeetingBranch(meetingId, plan.branch_name);
      console.log('Branch saved to meeting:', meetingId);
    }

    // Step 7: Create or update project
    const ticketItems = tickets ?? [];
    const ticketTitles = ticketItems?.map((t: any) => t.title) ?? [];
    const ticketIds = ticketItems?.map((t: any) => t.id) ?? [];
    const nonWorkflowFiles = committedFiles.filter((f) => !f.includes('.github'));
    const baseUrl = `https://${owner}.github.io/${repo}/`;
    const fullRepo = `${owner}/${repo}`;

    if (isFollowUp && projectId) {
      // Update existing project
      console.log('Updating existing project:', projectId);
      if (meetingId) await addMeetingToProject(projectId, meetingId);
      await addTicketsToProject(projectId, ticketIds);
      await addFilesToProject(projectId, nonWorkflowFiles);

      const project = await getProjectById(projectId);
      if (project) {
        await updateProject(projectId, {
          context: `${project.context}. Follow-up: ${ticketTitles.join(', ')}`,
        });
      }
    } else if (meetingId) {
      // Check if project already exists for this meeting
      const existingProject = await getProjectByMeetingId(meetingId);

      if (!existingProject) {
        const newProjectId = `project-${Date.now()}`;
        const projectDeployUrl = baseUrl;

        await saveProject({
          id: newProjectId,
          user_id: userId,
          name: meetingTitle || plan.issue_title,
          repo: fullRepo,
          deployUrl: projectDeployUrl,
          branchBase: 'main',
          meetings: meetingId ? [meetingId] : [],
          ticketIds,
          files: nonWorkflowFiles,
          context: ticketTitles.join(', '),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Link meeting to project
        if (meetingId) {
          await MeetingsEntity.update({ id: meetingId }).set({ projectId: newProjectId }).go();
        }

        console.log('New project created');
      }
    }

    return NextResponse.json({
      success: true,
      issue,
      pullRequest,
      committedFiles,
    });
  } catch (error) {
    console.error('Ship execute error:', error);
    return NextResponse.json({ error: 'Failed to execute plan' }, { status: 500 });
  }
}
