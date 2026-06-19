import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { runFrontendAgent } from '@/lib/swarmnet/agents/frontend';
import {
  getTicketById,
  getProjectById,
  updateTicket,
  createSwarmnetRun,
  updateSwarmnetRun,
} from '@/lib/db';
import {
  getIntegrationByUserId,
  getGithubToken,
  getGithubOwner,
  getGithubRepo,
} from '@/lib/services/integrations';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: agentId } = await params;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const {
      ticketId,
      projectId,
      projectName,
      githubOwner: clientOwner,
      githubRepo: clientRepo,
    } = body;

    if (!ticketId || typeof ticketId !== 'string') {
      return NextResponse.json({ error: 'ticketId required' }, { status: 400 });
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // ── Ownership verification: ticket must belong to the user's org ─
    if (orgId && ticket.org_id && ticket.org_id !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch project for agent tier
    const project = projectId ? await getProjectById(projectId) : null;

    // ── Ownership verification: project must belong to the user's org ─
    if (project && orgId && project.org_id && project.org_id !== orgId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const agentTier = project?.agentTier || 'standard';

    // Check GitHub integration
    const integration = await getIntegrationByUserId(userId, orgId);
    const githubToken = getGithubToken(integration);
    const integrationOwner = getGithubOwner(integration);
    const integrationRepo = getGithubRepo(integration);
    const githubOwner = clientOwner || integrationOwner || '';
    const githubRepo = clientRepo || integrationRepo || '';
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub not connected. Connect in Settings → Integrations.' },
        { status: 400 }
      );
    }
    if (!githubOwner || !githubRepo) {
      return NextResponse.json(
        { error: 'GitHub repository not configured. Select a repository above.' },
        { status: 400 }
      );
    }

    // Assign ticket to agent
    await updateTicket(ticketId, {
      assignee_user_id: agentId,
      status: 'in_progress',
    });

    // Generate branch name — strict safe characters only (a-z, 0-9, hyphens)
    const slug =
      ticket.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // collapse any non-alnum run to single hyphen
        .replace(/^-+|-+$/g, '') // strip leading/trailing hyphens
        .slice(0, 30) || 'task'; // fallback if title is entirely special chars
    const branchName = `swarm/${ticketId.slice(0, 8)}/frontend/${slug}`;
    const runId = `run-${Date.now()}`;

    // Create run record in DB
    await createSwarmnetRun({
      id: runId,
      orgId: orgId || '',
      projectId: projectId || undefined,
      ticketId,
      agentId,
      status: 'claimed',
      branchName,
    });

    // Run agent asynchronously (don't block response)
    runFrontendAgent({
      runId,
      ticketId,
      ticketTitle: ticket.title,
      ticketDescription: ticket.description || '',
      projectId: projectId || '',
      projectName: projectName || '',
      orgId: orgId || '',
      branchName,
      githubToken,
      githubOwner,
      githubRepo,
      agentTier,
    })
      .then(async (result) => {
        // Update run with final result
        await updateSwarmnetRun(runId, {
          status: result.success ? 'done' : 'error',
          prNumber: result.prNumber,
          prUrl: result.prNumber ? `https://github.com/pull/${result.prNumber}` : undefined,
          errorMessage: result.error,
          steps: result.steps,
          filesCreated: result.filesCreated,
          filesModified: result.filesModified,
          completedAt: new Date(),
        });

        // Update ticket status
        if (result.success) {
          await updateTicket(ticketId, { status: 'done' });
        }
      })
      .catch(async (err) => {
        await updateSwarmnetRun(runId, {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : String(err),
          completedAt: new Date(),
        });
      });

    // Return immediately with run ID
    return NextResponse.json({
      success: true,
      runId,
      agentId,
      ticketId,
      branchName,
      status: 'started',
      message: `FrontendAgent started on "${ticket.title}". Branch: ${branchName}`,
    });
  } catch (error) {
    console.error(
      '[swarmnet/run] Agent run error:',
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ error: 'Agent run failed' }, { status: 500 });
  }
}
