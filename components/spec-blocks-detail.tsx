'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  X,
  Edit2,
  Loader2,
  Rocket,
  ExternalLink,
  Plus,
  Monitor,
  Video,
} from 'lucide-react';

interface SpecBlock {
  id: string;
  title: string;
  type: 'feature' | 'idea' | 'constraint' | 'improvement';
  confidence: number;
  meeting_id: string;
  timestamp: string;
  note?: string;
}

interface Meeting {
  id: string;
  projectName: string;
  branchName?: string;
  deployUrl?: string;
  projectId?: string;
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

interface ShipResult {
  status: 'idle' | 'planning' | 'planned' | 'executing' | 'done' | 'error';
  plan?: any;
  linearTicketBundle?: any;
  featureRequest?: string;
  issue?: any;
  pullRequest?: any;
  committedFiles?: string[];
  error?: string;
}

interface ContinueMeetingState {
  status: 'idle' | 'input' | 'sending' | 'sent' | 'error';
  error?: string;
  botId?: string;
}

interface SpecBlocksDetailProps {
  meetingId: string;
}

export function SpecBlocksDetail({ meetingId }: SpecBlocksDetailProps) {
  const [specs, setSpecs] = useState<SpecBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('Meeting');
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [specActions, setSpecActions] = useState<Record<string, 'idle' | 'added' | 'rejected'>>({});
  const [shipResult, setShipResult] = useState<ShipResult>({ status: 'idle' });
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [continueMeeting, setContinueMeeting] = useState<ContinueMeetingState>({ status: 'idle' });
  const [followUpUrl, setFollowUpUrl] = useState('');

  const [refreshKey, setRefreshKey] = useState(Date.now());

  useEffect(() => {
    fetchSpecs();
    fetchMeetingData();
  }, [meetingId]);

  useEffect(() => {
    if (shipResult.status !== 'done') return;
    if (meetingData?.deployUrl) return;
    const interval = setInterval(fetchMeetingData, 10000);
    return () => clearInterval(interval);
  }, [shipResult.status, meetingData?.deployUrl]);

  // Fetch project after meeting data loads
  useEffect(() => {
    if (meetingData?.projectId) {
      fetchProject(meetingData.projectId);
    }
  }, [meetingData?.projectId]);

  async function fetchSpecs() {
    try {
      setLoading(true);
      const res = await fetch(`/api/meetings/${meetingId}/specs`);
      if (!res.ok) throw new Error('Failed to fetch specs');
      const data = await res.json();
      setSpecs(data);

      const existingNotes: Record<string, string> = {};
      data.forEach((s: any) => {
        if (s.note) existingNotes[s.id] = s.note;
      });
      setNotes(existingNotes);
      setError(null);
    } catch {
      setError('Could not load spec blocks');
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

  async function saveNote(specId: string, note: string) {
    try {
      await fetch(`/api/meetings/${meetingId}/specs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specId, note }),
      });
      setNotes((prev) => ({ ...prev, [specId]: note }));
      setEditingNote(null);
    } catch {
      console.error('Failed to save note');
    }
  }

  async function handleContinueMeeting() {
    if (!followUpUrl.trim()) return;

    setContinueMeeting({ status: 'sending' });

    try {
      const res = await fetch('/api/bot/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingUrl: followUpUrl.trim(),
          projectId: project?.id ?? meetingData?.projectId,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setContinueMeeting({ status: 'sent', botId: data.botId });
      setFollowUpUrl('');
    } catch (err) {
      setContinueMeeting({
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to send bot',
      });
    }
  }

  function setSpecAction(specId: string, action: 'idle' | 'added' | 'rejected') {
    setSpecActions((prev) => ({ ...prev, [specId]: action }));
  }

  const addedSpecs = specs.filter((s) => specActions[s.id] === 'added');
  const canShip = addedSpecs.length > 0 && shipResult.status === 'idle';

  async function handleApproveAndShip() {
    if (addedSpecs.length === 0) return;
    setShipResult({ status: 'planning' });

    try {
      const planRes = await fetch('/api/ship/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specs: addedSpecs,
          meetingTitle,
          notes,
          projectId: project?.id ?? meetingData?.projectId,
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
    } catch (err) {
      setShipResult({
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to generate plan',
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
          specs: addedSpecs,
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
    } catch (err) {
      setShipResult((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to execute',
      }));
    }
  }

  function toggleReject(specId: string) {
    const current = specActions[specId] || 'idle';
    setSpecAction(specId, current === 'rejected' ? 'idle' : 'rejected');
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'feature':
        return 'bg-primary/20 text-primary';
      case 'idea':
        return 'bg-secondary text-secondary-foreground';
      case 'constraint':
        return 'bg-accent/20 text-accent';
      case 'improvement':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
        <span className="text-muted-foreground">Loading spec blocks...</span>
      </div>
    );

  if (error)
    return (
      <div className="bg-card rounded-2xl p-8 border border-border text-center">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchSpecs} className="mt-4">
          Retry
        </Button>
      </div>
    );

  if (specs.length === 0)
    return (
      <div className="max-w-5xl">
        <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">{meetingTitle}</h1>
        <div className="bg-card rounded-2xl p-12 border border-border text-center mt-8">
          <p className="text-2xl font-playfair font-bold mb-2">No spec blocks yet</p>
          <p className="text-muted-foreground">This meeting has not been processed yet.</p>
        </div>
      </div>
    );

  const shippedCount = shipResult.status === 'done' ? addedSpecs.length : 0;
  const rejectedCount = specs.filter((s) => specActions[s.id] === 'rejected').length;
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
        {specs.length} specifications extracted - {addedSpecs.length} added to app
      </p>

      {/* Live Preview */}
      {meetingData?.deployUrl && (
        <div className="mb-8 bg-card rounded-2xl border border-primary/30 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              <p className="font-medium text-foreground">Live Preview</p>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Deployed
              </span>
            </div>
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
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors ml-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <iframe
            key={refreshKey}
            src={`${meetingData.deployUrl}?v=${refreshKey}`}
            className="w-full h-[500px]"
            title="Live App Preview"
          />
        </div>
      )}

      {/* Waiting for deploy */}
      {shipResult.status === 'done' && !meetingData?.deployUrl && (
        <div className="mb-8 bg-card rounded-2xl border border-border p-6 flex items-center gap-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">Waiting for deployment...</p>
            <p className="text-sm text-muted-foreground">
              Merge the PR on GitHub to trigger deploy. Preview appears here automatically.
            </p>
            {shipResult.pullRequest && (
              <a
                href={shipResult.pullRequest.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
              >
                Review and merge PR #{shipResult.pullRequest.number}{' '}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Spec blocks */}
      <div className="space-y-4 mb-8">
        {specs.map((spec) => {
          const action = specActions[spec.id] || 'idle';

          return (
            <div
              key={spec.id}
              className={`bg-card rounded-2xl p-6 border transition-all duration-200 ${
                action === 'added'
                  ? 'border-primary/50 bg-primary/5'
                  : action === 'rejected'
                    ? 'border-destructive/30 bg-destructive/5 opacity-60'
                    : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-playfair font-bold text-foreground">
                      {spec.title}
                    </h3>
                    <Badge className={getTypeColor(spec.type)}>
                      {spec.type.charAt(0).toUpperCase() + spec.type.slice(1)}
                    </Badge>
                    {action === 'added' && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                        Added to App
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {new Date(spec.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>Confidence: {Math.round(spec.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border flex-wrap">
                <button
                  onClick={() => setSpecAction(spec.id, action === 'added' ? 'idle' : 'added')}
                  disabled={shipResult.status !== 'idle'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-40 ${
                    action === 'added'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {action === 'added' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {action === 'added' ? 'Added' : 'Add to App'}
                </button>

                <button
                  onClick={() => setEditingNote(editingNote === spec.id ? null : spec.id)}
                  disabled={shipResult.status !== 'idle'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-40 ${
                    editingNote === spec.id
                      ? 'bg-muted text-foreground'
                      : notes[spec.id]
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  {editingNote === spec.id ? 'Cancel' : notes[spec.id] ? 'Edit Note' : 'Modify'}
                </button>

                <button
                  onClick={() => toggleReject(spec.id)}
                  disabled={shipResult.status !== 'idle'}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-40 ${
                    action === 'rejected'
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  }`}
                >
                  <X className="w-4 h-4" />
                  {action === 'rejected' ? 'Undo' : 'Reject'}
                </button>
              </div>

              {editingNote === spec.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Add a note for the AI
                  </p>
                  <textarea
                    defaultValue={notes[spec.id] || ''}
                    placeholder="e.g. Use React instead of vanilla JS, add dark mode support..."
                    className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    rows={3}
                    id={`note-${spec.id}`}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById(
                          `note-${spec.id}`
                        ) as HTMLTextAreaElement;
                        saveNote(spec.id, el.value);
                      }}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {notes[spec.id] && editingNote !== spec.id && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Note
                  </p>
                  <p className="text-sm text-foreground bg-background rounded-lg px-3 py-2 border border-border">
                    {notes[spec.id]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global ship panel */}
      <div className="bg-card rounded-2xl p-6 border border-border sticky bottom-6 shadow-lg">
        {(shipResult.status === 'planned' || shipResult.status === 'executing') &&
          shipResult.plan && (
            <div className="mb-4 bg-background rounded-xl p-4 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                {isFollowUp ? 'Follow-up Plan Preview' : 'Plan Preview'}
              </p>
              <p className="text-sm font-medium mb-2">
                Branch: <code className="text-primary">{shipResult.plan.branch_name}</code>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Files: {shipResult.plan.files.map((f: any) => f.path).join(', ')}
              </p>
              {shipResult.linearTicketBundle && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Linear Tickets
                  </p>
                  <a
                    href={shipResult.linearTicketBundle.parentIssue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {shipResult.linearTicketBundle.parentIssue.identifier} -{' '}
                    {shipResult.linearTicketBundle.parentIssue.title}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {shipResult.linearTicketBundle.subtaskIssues.map((s: any) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                    >
                      {s.identifier} - {s.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
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
            {shipResult.committedFiles && (
              <p className="text-xs text-muted-foreground mt-2">
                Files: {shipResult.committedFiles.filter((f) => !f.includes('.github')).join(', ')}
              </p>
            )}
          </div>
        )}

        {shipResult.status === 'error' && (
          <div className="mb-4 bg-destructive/5 rounded-xl p-3 border border-destructive/20">
            <p className="text-sm text-destructive">{shipResult.error}</p>
          </div>
        )}

        {/* Continue Meeting section */}
        {(continueMeeting.status === 'input' || continueMeeting.status === 'sending') && (
          <div className="mb-4 bg-background rounded-xl p-4 border border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Continue this project in a new meeting
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              The bot will join with full context of this project and all previous specs.
            </p>
            <input
              type="text"
              value={followUpUrl}
              onChange={(e) => setFollowUpUrl(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full p-3 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleContinueMeeting}
                disabled={!followUpUrl.trim() || continueMeeting.status === 'sending'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40"
              >
                {continueMeeting.status === 'sending' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                {continueMeeting.status === 'sending' ? 'Sending bot...' : 'Send Bot'}
              </button>
              <button
                onClick={() => setContinueMeeting({ status: 'idle' })}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {continueMeeting.status === 'sent' && (
          <div className="mb-4 bg-primary/5 rounded-xl p-3 border border-primary/20">
            <p className="text-sm text-primary font-medium">
              Bot is in the follow-up meeting with full project context.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              New specs will appear on the dashboard when the meeting ends.
            </p>
          </div>
        )}

        {continueMeeting.status === 'error' && (
          <div className="mb-4 bg-destructive/5 rounded-xl p-3 border border-destructive/20">
            <p className="text-sm text-destructive">{continueMeeting.error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {addedSpecs.length > 0
              ? `${addedSpecs.length} spec${addedSpecs.length > 1 ? 's' : ''} ready to ship`
              : 'Add specs to the app to ship'}
          </p>

          <div className="flex gap-3">
            {/* Continue Meeting button */}
            {shipResult.status === 'idle' && continueMeeting.status === 'idle' && (
              <button
                onClick={() => setContinueMeeting({ status: 'input' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-muted text-foreground hover:bg-muted/80 transition-all border border-border"
              >
                <Video className="w-4 h-4" />
                Continue Meeting
              </button>
            )}

            {shipResult.status === 'idle' && (
              <button
                onClick={handleApproveAndShip}
                disabled={!canShip}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Rocket className="w-4 h-4" />
                {isFollowUp ? 'Ship Changes' : 'Approve and Ship'}
              </button>
            )}

            {shipResult.status === 'planning' && (
              <button
                disabled
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground opacity-70"
              >
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
              <button
                disabled
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground opacity-70"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing...
              </button>
            )}

            {shipResult.status === 'done' && (
              <button
                disabled
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground opacity-70"
              >
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
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Total Specs</p>
          <p className="text-3xl font-bold text-foreground">{specs.length}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-primary/30 bg-primary/5">
          <p className="text-muted-foreground text-sm mb-2">Shipped</p>
          <p className="text-3xl font-bold text-primary">{shippedCount}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Rejected</p>
          <p className="text-3xl font-bold text-destructive">{rejectedCount}</p>
        </div>
      </div>
    </div>
  );
}
