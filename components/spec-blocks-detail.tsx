'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Edit2, Loader2, Rocket, ExternalLink } from 'lucide-react';

interface SpecBlock {
  id:         string;
  title:      string;
  type:       'feature' | 'idea' | 'constraint' | 'improvement';
  confidence: number;
  meeting_id: string;
  timestamp:  string;
}

interface ShipState {
  status:            'idle' | 'planning' | 'planned' | 'executing' | 'done' | 'error';
  plan?:             any;
  linearTicketBundle?: any;
  featureRequest?:   string;
  issue?:            any;
  pullRequest?:      any;
  committedFiles?:   string[];
  error?:            string;
}

interface SpecBlocksDetailProps {
  meetingId: string;
}

export function SpecBlocksDetail({ meetingId }: SpecBlocksDetailProps) {
  const [specs, setSpecs]             = useState<SpecBlock[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [rejected, setRejected]       = useState<Set<string>>(new Set());
  const [meetingTitle, setMeetingTitle] = useState('Meeting');
  const [shipStates, setShipStates]   = useState<Record<string, ShipState>>({});

  useEffect(() => {
    fetchSpecs();
    fetchMeetingTitle();
  }, [meetingId]);

  async function fetchSpecs() {
    try {
      setLoading(true);
      const res  = await fetch(`/api/meetings/${meetingId}/specs`);
      if (!res.ok) throw new Error('Failed to fetch specs');
      const data = await res.json();
      setSpecs(data);
      setError(null);
    } catch (err) {
      setError('Could not load spec blocks');
    } finally {
      setLoading(false);
    }
  }

  async function fetchMeetingTitle() {
    try {
      const res  = await fetch('/api/meetings');
      if (!res.ok) return;
      const data = await res.json();
      const meeting = data.find((m: any) => m.id === meetingId);
      if (meeting) setMeetingTitle(meeting.projectName);
    } catch {}
  }

  function setShipState(specId: string, state: Partial<ShipState>) {
    setShipStates(prev => ({
      ...prev,
      [specId]: { ...prev[specId], ...state }
    }));
  }

  async function handleShip(spec: SpecBlock) {
    setShipState(spec.id, { status: 'planning', error: undefined });

    try {
      // Step 1: Generate plan + Linear tickets
      const planRes = await fetch('/api/ship/plan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          specTitle: spec.title,
          specType:  spec.type,
          meetingId: spec.meeting_id
        })
      });

      const planData = await planRes.json();
      if (!planData.success) throw new Error(planData.error);

      setShipState(spec.id, {
        status:              'planned',
        plan:                planData.plan,
        linearTicketBundle:  planData.linearTicketBundle,
        featureRequest:      planData.featureRequest
      });

    } catch (err) {
      setShipState(spec.id, {
        status: 'error',
        error:  err instanceof Error ? err.message : 'Failed to generate plan'
      });
    }
  }

  async function handleExecute(spec: SpecBlock) {
    const shipState = shipStates[spec.id];
    if (!shipState?.plan) return;

    setShipState(spec.id, { status: 'executing' });

    try {
      const execRes = await fetch('/api/ship/execute', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          featureRequest:     shipState.featureRequest,
          plan:               shipState.plan,
          linearTicketBundle: shipState.linearTicketBundle
        })
      });

      const execData = await execRes.json();
      if (!execData.success) throw new Error(execData.error);

      setShipState(spec.id, {
        status:         'done',
        issue:          execData.issue,
        pullRequest:    execData.pullRequest,
        committedFiles: execData.committedFiles,
        linearTicketBundle: execData.linearTicketBundle
      });

    } catch (err) {
      setShipState(spec.id, {
        status: 'error',
        error:  err instanceof Error ? err.message : 'Failed to execute plan'
      });
    }
  }

  function toggleReject(specId: string) {
    setRejected(prev => {
      const next = new Set(prev);
      next.has(specId) ? next.delete(specId) : next.add(specId);
      return next;
    });
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'feature':     return 'bg-primary/20 text-primary';
      case 'idea':        return 'bg-secondary text-secondary-foreground';
      case 'constraint':  return 'bg-accent/20 text-accent';
      case 'improvement': return 'bg-yellow-100 text-yellow-800';
      default:            return 'bg-muted text-muted-foreground';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
        <span className="text-muted-foreground">Loading spec blocks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-border text-center">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchSpecs} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (specs.length === 0) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">{meetingTitle}</h1>
        <div className="bg-card rounded-2xl p-12 border border-border text-center mt-8">
          <p className="text-2xl font-playfair font-bold text-foreground mb-2">No spec blocks yet</p>
          <p className="text-muted-foreground">This meeting hasn't been processed yet.</p>
        </div>
      </div>
    );
  }

  const shippedCount  = Object.values(shipStates).filter(s => s.status === 'done').length;
  const rejectedCount = rejected.size;

  return (
    <div className="max-w-5xl">
      <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">{meetingTitle}</h1>
      <p className="text-muted-foreground mb-8">
        {specs.length} specifications extracted from this meeting
      </p>

      <div className="space-y-4">
        {specs.map((spec) => {
          const ship     = shipStates[spec.id] || { status: 'idle' };
          const isShipped = ship.status === 'done';
          const isRejected = rejected.has(spec.id);

          return (
            <div
              key={spec.id}
              className={`bg-card rounded-2xl p-6 border transition-all duration-200 ${
                isShipped
                  ? 'border-primary/50 bg-primary/5'
                  : isRejected
                  ? 'border-destructive/30 bg-destructive/5 opacity-60'
                  : 'border-border'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-playfair font-bold text-foreground">{spec.title}</h3>
                    <Badge className={getTypeColor(spec.type)}>
                      {spec.type.charAt(0).toUpperCase() + spec.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{new Date(spec.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Confidence: {Math.round(spec.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Plan preview — shown after planning */}
              {(ship.status === 'planned' || ship.status === 'executing') && ship.plan && (
                <div className="mb-4 bg-background rounded-xl p-4 border border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">AI Plan Preview</p>
                  <p className="text-sm font-medium text-foreground mb-2">Branch: <code className="text-primary">{ship.plan.branch_name}</code></p>
                  <p className="text-sm text-muted-foreground mb-2">Files: {ship.plan.files.map((f: any) => f.path).join(', ')}</p>
                  {ship.linearTicketBundle && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Linear Tickets</p>
                      <a href={ship.linearTicketBundle.parentIssue.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1">
                        {ship.linearTicketBundle.parentIssue.identifier} — {ship.linearTicketBundle.parentIssue.title}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {ship.linearTicketBundle.subtaskIssues.map((s: any) => (
                        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1">
                          ↳ {s.identifier} — {s.title}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Done state */}
              {ship.status === 'done' && (
                <div className="mb-4 bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Shipped ✓</p>
                  <div className="flex gap-4 flex-wrap">
                    {ship.issue && (
                      <a href={ship.issue.html_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1">
                        Issue #{ship.issue.number} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {ship.pullRequest && (
                      <a href={ship.pullRequest.html_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1">
                        PR #{ship.pullRequest.number} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {ship.committedFiles && ship.committedFiles.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Files: {ship.committedFiles.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Error state */}
              {ship.status === 'error' && (
                <div className="mb-4 bg-destructive/5 rounded-xl p-3 border border-destructive/20">
                  <p className="text-sm text-destructive">{ship.error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-border flex-wrap">
                {/* Ship button */}
                {ship.status === 'idle' && (
                  <button
                    onClick={() => handleShip(spec)}
                    disabled={isRejected}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 disabled:opacity-40"
                  >
                    <Rocket className="w-4 h-4" />
                    Approve & Ship
                  </button>
                )}

                {ship.status === 'planning' && (
                  <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary/10 text-primary opacity-70">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Plan...
                  </button>
                )}

                {ship.status === 'planned' && (
                  <button
                    onClick={() => handleExecute(spec)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200"
                  >
                    <Rocket className="w-4 h-4" />
                    Execute Plan
                  </button>
                )}

                {ship.status === 'executing' && (
                  <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground opacity-70">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing...
                  </button>
                )}

                {ship.status === 'done' && (
                  <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground opacity-70">
                    <CheckCircle className="w-4 h-4" />
                    Shipped
                  </button>
                )}

                {ship.status === 'error' && (
                  <button
                    onClick={() => handleShip(spec)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                  >
                    <Rocket className="w-4 h-4" />
                    Retry
                  </button>
                )}

                {/* Modify button */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-muted text-foreground hover:bg-muted/80 transition-all duration-200">
                  <Edit2 className="w-4 h-4" />
                  Modify
                </button>

                {/* Reject button */}
                <button
                  onClick={() => toggleReject(spec.id)}
                  disabled={isShipped}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-40 ${
                    isRejected
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  }`}
                >
                  <X className="w-4 h-4" />
                  {isRejected ? 'Undo Reject' : 'Reject'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-12 grid grid-cols-3 gap-4">
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