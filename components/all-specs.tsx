'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface SpecBlock {
  id:         string;
  title:      string;
  type:       'feature' | 'idea' | 'constraint' | 'improvement';
  confidence: number;
  meeting_id: string;
  timestamp:  string;
  note?:      string;
}

interface Meeting {
  id:          string;
  projectName: string;
}

interface AllSpecsProps {
  onSelectMeeting: (meetingId: string) => void;
}

export function AllSpecs({ onSelectMeeting }: AllSpecsProps) {
  const [specs, setSpecs]       = useState<SpecBlock[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<string>('all');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [meetingsRes, allSpecs] = await Promise.all([
        fetch('/api/meetings'),
        fetch('/api/specs')
      ]);

      const meetingsData = await meetingsRes.json();
      const specsData    = await allSpecs.json();

      setMeetings(meetingsData);
      setSpecs(specsData);
    } catch {
      console.error('Failed to fetch specs');
    } finally {
      setLoading(false);
    }
  }

  function getMeetingName(meetingId: string) {
    return meetings.find(m => m.id === meetingId)?.projectName || meetingId;
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

  const filtered = filter === 'all'
    ? specs
    : specs.filter(s => s.type === filter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
      <span className="text-muted-foreground">Loading spec blocks...</span>
    </div>
  );

  if (specs.length === 0) return (
    <div className="bg-card rounded-2xl p-12 border border-border text-center">
      <p className="text-2xl font-playfair font-bold text-foreground mb-2">No spec blocks yet</p>
      <p className="text-muted-foreground">Record a meeting to extract spec blocks.</p>
    </div>
  );

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'feature', 'idea', 'constraint', 'improvement'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && ` (${specs.length})`}
            {f !== 'all' && ` (${specs.filter(s => s.type === f).length})`}
          </button>
        ))}
      </div>

      {/* Specs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((spec) => (
          <div
            key={spec.id}
            className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
            onClick={() => onSelectMeeting(spec.meeting_id)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-playfair font-bold text-foreground group-hover:text-primary transition-colors flex-1 mr-3">
                {spec.title}
              </h3>
              <Badge className={`${getTypeColor(spec.type)} flex-shrink-0`}>
                {spec.type.charAt(0).toUpperCase() + spec.type.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span
                className="text-primary hover:underline font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMeeting(spec.meeting_id);
                }}
              >
                {getMeetingName(spec.meeting_id)}
              </span>
              <span>Confidence: {Math.round(spec.confidence * 100)}%</span>
            </div>

            {spec.note && (
              <p className="mt-3 text-xs text-muted-foreground bg-background rounded-lg px-3 py-2 border border-border">
                Note: {spec.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        {['feature', 'idea', 'constraint', 'improvement'].map(type => (
          <div key={type} className="bg-card rounded-2xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-primary">
              {specs.filter(s => s.type === type).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{type}s</p>
          </div>
        ))}
      </div>
    </div>
  );
}