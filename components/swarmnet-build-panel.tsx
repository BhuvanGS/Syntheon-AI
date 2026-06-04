'use client';

import { useState, useEffect } from 'react';
import {
  Rocket,
  Wrench,
  Bot,
  FileCode,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'in_progress' | 'done' | 'blocked';
  assignee?: string | null;
  assignee_user_id?: string | null;
}

interface Project {
  id: string;
  name: string;
  repo?: string | null;
  deployUrl?: string | null;
  context?: string;
}

interface AgentStep {
  agent: string;
  agentId: string;
  icon: string;
  status: 'pending' | 'running' | 'done' | 'error';
  files?: string[];
  branch?: string;
  message: string;
  cost?: string;
}

interface SimulationResult {
  plan: string;
  steps: AgentStep[];
  totalCost: string;
  branchBase: string;
}

export function SwarmNetBuildPanel({ project, tickets }: { project: Project; tickets: Ticket[] }) {
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runningAgent, setRunningAgent] = useState(false);
  const [agentRunStatus, setAgentRunStatus] = useState<string | null>(null);
  const [runDetails, setRunDetails] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Repo picker state
  const [repos, setRepos] = useState<{ fullName: string; name: string; owner: string }[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);

  const readyTickets = tickets.filter((t) => t.status === 'in_progress' || t.status === 'done');

  // Fetch user's GitHub repos on mount
  useEffect(() => {
    async function fetchRepos() {
      setLoadingRepos(true);
      setRepoError(null);
      try {
        const res = await fetch('/api/swarmnet/repos');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load repos');
        setRepos(data.repos || []);
        // Auto-select project.repo if it exists
        if (project.repo) {
          const match = data.repos.find((r: any) => r.fullName === project.repo);
          if (match) setSelectedRepo(match.fullName);
        }
      } catch (err) {
        setRepoError(err instanceof Error ? err.message : 'Failed to load repos');
      } finally {
        setLoadingRepos(false);
      }
    }
    fetchRepos();
  }, [project.repo]);

  async function runSimulation() {
    if (readyTickets.length === 0) return;
    setSimulating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/swarmnet/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          context: project.context,
          tickets: readyTickets.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            status: t.status,
          })),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Simulation failed');
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  }

  async function runRealAgent() {
    if (readyTickets.length === 0) return;
    const ticket = readyTickets[0];
    setRunningAgent(true);
    setAgentRunStatus('Starting FrontendAgent...');
    setError(null);

    try {
      const [owner, repo] = selectedRepo.includes('/') ? selectedRepo.split('/') : ['', ''];
      if (!owner || !repo) {
        throw new Error('Please select a GitHub repository first');
      }

      const res = await fetch(`/api/swarmnet/agents/agent:frontend/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          projectId: project.id,
          projectName: project.name,
          githubOwner: owner,
          githubRepo: repo,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Agent run failed');

      setAgentRunStatus(`FrontendAgent running on branch ${data.branchName}`);

      // Poll for status every 10 seconds
      const interval = setInterval(async () => {
        const statusRes = await fetch(`/api/swarmnet/runs/${data.runId}`);
        const statusData = await statusRes.json();
        setRunDetails(statusData);
        if (statusData.status === 'done' || statusData.status === 'error') {
          clearInterval(interval);
          setAgentRunStatus(
            statusData.status === 'done'
              ? `Done! PR #${statusData.prNumber}`
              : `Error: ${statusData.error || 'Unknown error'}`
          );
          setRunningAgent(false);
        } else {
          setAgentRunStatus(`Running: ${statusData.status}`);
        }
      }, 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Agent run failed');
      setAgentRunStatus(null);
      setRunningAgent(false);
    }
  }

  function getAgentIcon(agentId: string) {
    if (agentId.includes('planner')) return <Bot className="h-4 w-4" />;
    if (agentId.includes('frontend')) return <FileCode className="h-4 w-4" />;
    if (agentId.includes('backend')) return <Wrench className="h-4 w-4" />;
    if (agentId.includes('database')) return <GitBranch className="h-4 w-4" />;
    if (agentId.includes('security')) return <AlertTriangle className="h-4 w-4" />;
    if (agentId.includes('test')) return <CheckCircle className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'done':
        return 'text-emerald-500';
      case 'running':
        return 'text-amber-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  }

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">SwarmNet Build</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Simulate how SwarmNet agents would build your project. No API calls, no cost — just a
              preview of what each agent would do.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="text-sm">
            <span className="font-medium">{readyTickets.length}</span>{' '}
            <span className="text-muted-foreground">
              ticket{readyTickets.length !== 1 ? 's' : ''} ready to build
            </span>
          </div>
          <div className="flex-1" />
          <button
            onClick={runSimulation}
            disabled={simulating || readyTickets.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {simulating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Simulate Build
              </>
            )}
          </button>
        </div>

        {readyTickets.length === 0 && (
          <p className="mt-3 text-sm text-amber-600">
            Move tickets to <strong>In Progress</strong> or <strong>Done</strong> to make them
            available for building.
          </p>
        )}
      </div>

      {/* Repo Picker */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Target Repository
        </h4>
        {repoError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-3">
            {repoError}
          </div>
        )}
        {loadingRepos ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading repositories...
          </div>
        ) : repos.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No repositories found. Connect GitHub in Settings → Integrations.
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select a repository...</option>
              {repos.map((r) => (
                <option key={r.fullName} value={r.fullName}>
                  {r.fullName}
                </option>
              ))}
            </select>
            {selectedRepo && (
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" />
                Will commit to <code className="font-mono text-emerald-700">{selectedRepo}</code>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Simulation Result */}
      {result && (
        <div className="space-y-4">
          {/* Plan Summary */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Build Plan
            </h4>
            <p className="text-sm text-foreground">{result.plan}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>Branch base: {result.branchBase}</span>
              <span>Est. cost: {result.totalCost}</span>
            </div>
          </div>

          {/* Agent Steps */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Agent Execution Plan
            </h4>
            <div className="space-y-3">
              {result.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-background"
                >
                  <div className={`mt-0.5 ${getStatusColor(step.status)}`}>
                    {getAgentIcon(step.agentId)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{step.agent}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full bg-muted ${getStatusColor(step.status)}`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.message}</p>
                    {step.files && step.files.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {step.files.map((f) => (
                          <code
                            key={f}
                            className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                          >
                            {f}
                          </code>
                        ))}
                      </div>
                    )}
                    {step.branch && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Branch: <code className="text-primary">{step.branch}</code>
                      </p>
                    )}
                    {step.cost && (
                      <p className="mt-1 text-xs text-muted-foreground">Est. cost: {step.cost}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready Tickets */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Tickets in this Build
            </h4>
            <div className="space-y-2">
              {readyTickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{t.status}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                    {t.id.slice(0, 8)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-end gap-3">
              <p className="text-xs text-muted-foreground">
                This was a simulation. No code was generated. No API credits used.
              </p>
              <button
                onClick={runSimulation}
                disabled={simulating}
                className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Re-simulate
              </button>
              <button
                onClick={runRealAgent}
                disabled={runningAgent || !selectedRepo}
                title={!selectedRepo ? 'Select a repository first' : ''}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40"
              >
                {runningAgent ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Rocket className="h-3 w-3" />
                    Run FrontendAgent
                  </>
                )}
              </button>
            </div>
            {agentRunStatus && (
              <div className="text-xs text-muted-foreground text-right">
                Agent status: {agentRunStatus}
                {runDetails && (
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="ml-2 text-primary hover:underline"
                  >
                    {showDetails ? 'Hide details' : 'View details'}
                  </button>
                )}
              </div>
            )}
            {showDetails && runDetails && (
              <div className="mt-2 rounded-xl border border-border bg-muted/40 p-4 text-left">
                {runDetails.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-3">
                    <strong>Error:</strong> {runDetails.error}
                  </div>
                )}
                {runDetails.branchName && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Branch: <code className="text-foreground">{runDetails.branchName}</code>
                  </p>
                )}
                {runDetails.steps && runDetails.steps.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Steps
                    </p>
                    {runDetails.steps.map((step: any, i: number) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded-lg border ${
                          step.phase === 'error'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-border/50 bg-background text-muted-foreground'
                        }`}
                      >
                        <span className="font-medium capitalize">{step.phase}</span> {step.message}
                      </div>
                    ))}
                  </div>
                )}
                {runDetails.filesCreated && runDetails.filesCreated.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Files
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {runDetails.filesCreated.map((f: string) => (
                        <code
                          key={f}
                          className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {f}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
