'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Edit2, Loader2 } from 'lucide-react';

interface SpecBlock {
  id:         string;
  title:      string;
  type:       'feature' | 'idea' | 'constraint' | 'improvement';
  confidence: number;
  meeting_id: string;
  timestamp:  string;
  status?:    'pending' | 'implemented' | 'rejected' | 'modified';
}

interface SpecBlocksDetailProps {
  meetingId: string;
}

export function SpecBlocksDetail({ meetingId }: SpecBlocksDetailProps) {
  const [specs, setSpecs]         = useState<SpecBlock[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [implemented, setImplemented] = useState<Set<string>>(new Set());
  const [rejected, setRejected]       = useState<Set<string>>(new Set());
  const [meetingTitle, setMeetingTitle] = useState('Meeting');

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
      console.error(err);
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
    } catch {
      // silently fail — title is non-critical
    }
  }

  function toggleImplement(specId: string) {
    setImplemented(prev => {
      const next = new Set(prev);
      next.has(specId) ? next.delete(specId) : next.add(specId);
      return next;
    });
    setRejected(prev => {
      const next = new Set(prev);
      next.delete(specId);
      return next;
    });
  }

  function toggleReject(specId: string) {
    setRejected(prev => {
      const next = new Set(prev);
      next.has(specId) ? next.delete(specId) : next.add(specId);
      return next;
    });
    setImplemented(prev => {
      const next = new Set(prev);
      next.delete(specId);
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
        <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
          {meetingTitle}
        </h1>
        <div className="bg-card rounded-2xl p-12 border border-border text-center mt-8">
          <p className="text-2xl font-playfair font-bold text-foreground mb-2">
            No spec blocks yet
          </p>
          <p className="text-muted-foreground">
            This meeting hasn't been processed yet or had no extractable specs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
        {meetingTitle}
      </h1>
      <p className="text-muted-foreground mb-8">
        {specs.length} specifications extracted from this meeting
      </p>

      <div className="space-y-4">
        {specs.map((spec) => (
          <div
            key={spec.id}
            className={`bg-card rounded-2xl p-6 border transition-all duration-200 ${
              implemented.has(spec.id)
                ? 'border-primary/50 bg-primary/5'
                : rejected.has(spec.id)
                ? 'border-destructive/30 bg-destructive/5 opacity-60'
                : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-playfair font-bold text-foreground">
                    {spec.title}
                  </h3>
                  <Badge className={getTypeColor(spec.type)}>
                    {spec.type.charAt(0).toUpperCase() + spec.type.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {new Date(spec.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day:   'numeric',
                      hour:  '2-digit',
                      minute:'2-digit'
                    })}
                  </span>
                  <span>Confidence: {Math.round(spec.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => toggleImplement(spec.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  implemented.has(spec.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Implement
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-muted text-foreground hover:bg-muted/80 transition-all duration-200"
              >
                <Edit2 className="w-4 h-4" />
                Modify
              </button>
              <button
                onClick={() => toggleReject(spec.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  rejected.has(spec.id)
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                }`}
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary footer */}
      <div className="mt-12 grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Total Specs</p>
          <p className="text-3xl font-bold text-foreground">{specs.length}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-primary/30 bg-primary/5">
          <p className="text-muted-foreground text-sm mb-2">Implemented</p>
          <p className="text-3xl font-bold text-primary">{implemented.size}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <p className="text-muted-foreground text-sm mb-2">Rejected</p>
          <p className="text-3xl font-bold text-destructive">{rejected.size}</p>
        </div>
      </div>
    </div>
  );
}