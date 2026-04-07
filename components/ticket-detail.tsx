'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  ExternalLink,
  Loader2,
  Rocket,
  Video,
} from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'done' | 'blocked';
  assignee?: string | null;
  assignee_user_id?: string | null;
  projectId?: string | null;
  meeting_id: string;
}

interface Meeting {
  id: string;
  projectName: string;
  projectId?: string;
  deployUrl?: string;
  date?: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  name: string;
  meetings: string[];
  files: string[];
  context: string;
}

interface TicketDetailProps {
  meetingId: string;
  onSelectMeeting: (meetingId: string) => void;
}

export function TicketDetail({ meetingId, onSelectMeeting }: TicketDetailProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('Meeting');
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [shipResult, setShipResult] = useState<{ status: 'idle' | 'planning' | 'planned' | 'executing' | 'done' | 'error'; plan?: any; linearTicketBundle?: any; featureRequest?: string; issue?: any; pullRequest?: any; committedFiles?: string[]; error?: string; }>({ status: 'idle' });
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [savingTicketId, setSavingTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
    fetchMeetingData();
  }, [meetingId]);

  useEffect(() => {
    if (shipResult.status !== 'done') return;
    if (meetingData?.deployUrl) return;
    const interval = setInterval(fetchMeetingData, 10000);
    return () => clearInterval(interval);
  }, [shipResult.status, meetingData?.deployUrl]);

  useEffect(() => {
    if (meetingData?.projectId) fetchProject(meetingData.projectId);
  }, [meetingData?.projectId]);

  async function fetchTickets() {
    try {
      setLoading(true);
      const res = await fetch(`/api/meetings/${meetingId}/tickets`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error('Could not load tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMeetingData() {
    try {
      const res = await fetch('/api/meetings');
      if (!res.ok) return;
      const data = await res.json();
      const meeting = data.find((m: any) => m.id === meetingId);
      if (meeting) {
        setMeetingTitle(meeting.projectName);
        setMeetingData(meeting);
      }
    } catch {}
  }

  async function fetchProject(projectId: string) {
    try {
      const res = await fetch(`/api/projects?meetingId=${meetingId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data) setProject(data);
    } catch {}
  }

  async function updateTicket(ticketId: string, payload: Partial<Pick<Ticket, 'status' | 'assignee' | 'assignee_user_id'>>) {
    setSavingTicketId(ticketId);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/tickets`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, ...payload }),
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...payload } : ticket)));
    } finally {
      setSavingTicketId(null);
    }
  }

  const readyTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'in_progress' || ticket.status === 'done'),
    [tickets]
  );

  async function handleApproveAndShip() {
    if (readyTickets.length === 0) return;
    setShipResult({ status: 'planning' });

    try {
      const planRes = await fetch('/api/ship/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickets: readyTickets,
          meetingTitle,
          projectId: project?.id ?? meetingData?.projectId,
          notes: {},
        }),
      });

      const planData = await planRes.json();
      if (!planData.success) throw new Error(planData.error);

      setShipResult({
        status: 'planned',
        plan: planData.plan,
        linearTicketBundle: planData.linearTicketBundle,
        featureRequest: planData.featureRequest,
      });
    } catch (error) {
      setShipResult({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to generate plan',
      });
    }
  }

  async function handleExecute() {
    if (!shipResult.plan) return;
    setShipResult((prev) => ({ ...prev, status: 'executing' }));

    try {
      const execRes = await fetch('/api/ship/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureRequest: shipResult.featureRequest,
          plan: shipResult.plan,
          linearTicketBundle: shipResult.linearTicketBundle,
          meetingId,
          projectId: project?.id ?? meetingData?.projectId,
          tickets: readyTickets,
          meetingTitle,
          isFollowUp: !!(project?.id ?? meetingData?.projectId),
        }),
      });

      const execData = await execRes.json();
      if (!execData.success) throw new Error(execData.error);

      setShipResult((prev) => ({
        ...prev,
        status: 'done',
        issue: execData.issue,
        pullRequest: execData.pullRequest,
        committedFiles: execData.committedFiles,
        linearTicketBundle: execData.linearTicketBundle,
      }));

      fetchMeetingData();
    } catch (error) {
      setShipResult((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to execute',
      }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
        <span className="text-muted-foreground">Loading tickets...</span>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">{meetingTitle}</h1>
        <div className="bg-card rounded-2xl p-12 border border-border text-center mt-8">
          <p className="text-2xl font-playfair font-bold mb-2">No tickets yet</p>
          <p className="text-muted-foreground">This meeting has not produced any tickets yet.</p>
        </div>
      </div>
    );
  }

  const shippedCount = shipResult.status === 'done' ? readyTickets.length : 0;
  const blockedCount = tickets.filter((ticket) => ticket.status === 'blocked').length;
  const isFollowUp = !!(project?.id ?? meetingData?.projectId);

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-4xl font-playfair font-bold text-foreground">{meetingTitle}</h1>
        {isFollowUp && (
          <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium mt-2">
            Follow-up meeting
          </span>
        )}
      </div>

      {project && (
        <p className="text-sm text-muted-foreground mb-1">
          Project: <span className="text-foreground font-medium">{project.name}</span>
          <span className="mx-2">-</span>
          {project.meetings.length} meeting{project.meetings.length > 1 ? 's' : ''}
          <span className="mx-2">-</span>
          {project.files.length} files in repo
        </p>
      )}

      <p className="text-muted-foreground mb-8">
        {tickets.length} tickets extracted - {readyTickets.length} ready to ship
      </p>

      {meetingData?.deployUrl && (
        <div className="mb-8 bg-card rounded-2xl border border-primary/30 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <p className="font-medium text-foreground">Live Preview</p>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Deployed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={meetingData.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setRefreshKey(Date.now())}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
          <iframe
            key={refreshKey}
            src={`${meetingData.deployUrl}?v=${refreshKey}`}
            className="w-full h-[500px]"
            title="Live App Preview"
          />
        </div>
      )}

      <div className="space-y-4 mb-8">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-card rounded-2xl p-6 border border-border transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-lg font-playfair font-bold text-foreground">{ticket.title}</h3>
                  <Badge
                    className={
                      ticket.status === 'backlog'
                        ? 'bg-muted text-muted-foreground'
                        : ticket.status === 'in_progress'
                          ? 'bg-primary/20 text-primary'
                          : ticket.status === 'blocked'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-green-100 text-green-800'
                    }
                  >
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-6">{ticket.description || 'No description provided.'}</p>
              </div>
              {savingTicketId === ticket.id && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-border">
              <label className="text-xs text-muted-foreground">
                Status
                <select
                  value={ticket.status}
                  onChange={(e) => updateTicket(ticket.id, { status: e.target.value as Ticket['status'] })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>

              <label className="text-xs text-muted-foreground">
                Assignee
                <input
                  value={ticket.assignee ?? ''}
                  onChange={(e) => updateTicket(ticket.id, { assignee: e.target.value || null })}
                  placeholder="Optional assignee"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </label>

              <div className="flex items-end justify-between gap-2 text-xs text-muted-foreground">
                <div>
                  <p className="uppercase tracking-wide">Meeting</p>
                  <button
                    onClick={() => onSelectMeeting(ticket.meeting_id)}
                    className="mt-1 text-primary hover:underline font-medium"
                  >
                    Open meeting
                  </button>
                </div>
                <span>{ticket.assignee ? `@${ticket.assignee}` : 'Unassigned'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border sticky bottom-6 shadow-lg">
        {shipResult.status === 'planned' && shipResult.plan && (
          <div className="mb-4 bg-background rounded-xl p-4 border border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {isFollowUp ? 'Follow-up Plan Preview' : 'Plan Preview'}
            </p>
            <p className="text-sm font-medium mb-2">
              Branch: <code className="text-primary">{shipResult.plan.branch_name}</code>
            </p>
          </div>
        )}

        {shipResult.status === 'done' && (
          <div className="mb-4 bg-primary/5 rounded-xl p-4 border border-primary/20">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Shipped</p>
            <div className="flex gap-4 flex-wrap">
              {shipResult.issue && (
                <a
                  href={shipResult.issue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Issue #{shipResult.issue.number} <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {shipResult.pullRequest && (
                <a
                  href={shipResult.pullRequest.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  PR #{shipResult.pullRequest.number} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {shipResult.status === 'error' && (
          <div className="mb-4 bg-destructive/5 rounded-xl p-3 border border-destructive/20">
            <p className="text-sm text-destructive">{shipResult.error}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {readyTickets.length > 0
              ? `${readyTickets.length} ticket${readyTickets.length > 1 ? 's' : ''} ready to ship`
              : 'Move tickets to in progress or done to ship'}
          </p>

          <div className="flex gap-3 flex-wrap">
            {shipResult.status === 'idle' && (
              <button
                onClick={handleApproveAndShip}
                disabled={readyTickets.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Rocket className="w-4 h-4" />
                {isFollowUp ? 'Ship Changes' : 'Approve and Ship'}
              </button>
            )}

            {shipResult.status === 'planning' && (
              <button disabled className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground opacity-70">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Plan...
              </button>
            )}

            {shipResult.status === 'planned' && (
              <button
                onClick={handleExecute}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                <Rocket className="w-4 h-4" />
                Execute Plan
              </button>
            )}

            {shipResult.status === 'executing' && (
              <button disabled className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground opacity-70">
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing...
              </button>
            )}

            {shipResult.status === 'done' && (
              <button disabled className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground opacity-70">
                <CheckCircle className="w-4 h-4" />
                Shipped
              </button>
            )}

            {shipResult.status === 'error' && (
              <button
                onClick={handleApproveAndShip}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                <Rocket className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{tickets.length} total tickets</span>
          <span>{blockedCount} blocked</span>
        </div>
      </div>
    </div>
  );
}
