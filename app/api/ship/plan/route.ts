// app/api/ship/plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePlan, planFollowUpChanges, generateFollowUpPlan } from '@/lib/shipai/ai';
import { createLinearTicketBundle } from '@/lib/shipai/linear';
import { getProjectById, getSpecsByProjectId } from '@/lib/db';
import { getRepoFileTree, getFileContents, getRepoInfo } from '@/lib/shipai/github';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { specs, meetingTitle, notes = {}, projectId } = await req.json();

    if (!specs || specs.length === 0) {
      return NextResponse.json({ error: 'specs array is required' }, { status: 400 });
    }

    const newSpecList = specs.map((s: any) => {
      const note = notes[s.id] ? ` - Note: ${notes[s.id]}` : '';
      return `[${s.type.toUpperCase()}] ${s.title}${note}`;
    });

    let plan;

    // ── Follow-up ship (MCT) ─────────────────────────────────────
    if (projectId) {
      console.log('Follow-up ship detected for project:', projectId);

      const project = getProjectById(projectId);
      if (!project) throw new Error(`Project ${projectId} not found`);

      // Get all previous specs for context
      const previousSpecs = getSpecsByProjectId(projectId)
        .map(s => s.title);

      console.log('Previous specs:', previousSpecs.length);
      console.log('Fetching file tree from GitHub...');

      // Step 1 — Fetch file tree (just names)
      const repoInfo  = getRepoInfo();
      const fileTree  = await getRepoFileTree(repoInfo);

      console.log('File tree fetched:', fileTree.length, 'files');

      // Step 2 — Ask planner which files need to change
      const plannerResult = await planFollowUpChanges(
        {
          name:    project.name,
          context: project.context,
          files:   fileTree,
          specs:   previousSpecs
        },
        newSpecList,
        notes
      );

      console.log('Planner result:', plannerResult.reasoning);
      console.log('Files to modify:', plannerResult.filesToModify);
      console.log('Files to create:', plannerResult.filesToCreate);

      // Step 3 — Fetch only relevant file contents
      const relevantFiles = plannerResult.filesToModify.filter(f => fileTree.includes(f));
      const existingFiles = await getFileContents(relevantFiles, repoInfo);

      console.log('Fetched', Object.keys(existingFiles).length, 'file contents');

      // Step 4 — Generate follow-up plan with context
      plan = await generateFollowUpPlan(
        {
          name:    project.name,
          context: project.context,
          specs:   previousSpecs
        },
        newSpecList,
        existingFiles,
        plannerResult.filesToCreate,
        notes
      );

      console.log('Follow-up plan generated:', plan.branch_name);

    } else {
      // ── First ship ─────────────────────────────────────────────
      console.log('First ship for:', meetingTitle);

      const featureRequest = `Build a complete application for: "${meetingTitle}"

The following specifications were approved from the meeting:

${newSpecList.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}

Build the entire application implementing ALL of the above specifications in one cohesive codebase.`;

      plan = await generatePlan(featureRequest);
      console.log('First ship plan generated:', plan.branch_name);
    }

    // Create Linear tickets for both first ship and follow-up
    const linearTicketBundle = await createLinearTicketBundle(plan);
    console.log('Linear tickets created:', linearTicketBundle.parentIssue.identifier);

    return NextResponse.json({
      success: true,
      featureRequest: newSpecList.join('\n'),
      plan,
      linearTicketBundle,
      isFollowUp: !!projectId
    });

  } catch (error) {
    console.error('Ship plan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate plan' },
      { status: 500 }
    );
  }
}