'use client';

import { useEffect, useState } from 'react';
import { Loader2, Clock, CheckCircle, Globe, ExternalLink } from 'lucide-react';

interface Meeting {
  id:            string;
  projectName:   string;
  meetingId:     string;
  specsDetected: number;
  status:        'completed' | 'processing' | 'failed';
  date:          string;
  platform:      string;
  deployUrl?:    string;
  branchName?:   string;
}

interface KanbanProps {
  onSelectMeeting: (meetingId: string) => void;
}

export function Kanban({ onSelectMeeting }: KanbanProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchMeetings() {
    try {
      const res  = await fetch('/api/meetings');
      if (!res.ok) return;
      const data = await res.json();
      setMeetings(data);
    } catch {
      console.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }

  const processing = meetings.filter(m => m.status === 'processing');
  const completed  = meetings.filter(m => m.status === 'completed' && !m.deployUrl);
  const deployed   = meetings.filter(m => m.status === 'completed' && m.deployUrl);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
      <span className="text-muted-foreground">Loading board...</span>
    </div>
  );

  const columns = [
    {
      title:    'Processing',
      icon:     <Clock className="w-4 h-4" />,
      meetings: processing,
      color:    'border-yellow-200 bg-yellow-50',
      badge:    'bg-yellow-100 text-yellow-800',
    },
    {
      title:    'Completed',
      icon:     <CheckCircle className="w-4 h-4" />,
      meetings: completed,
      color:    'border-primary/20 bg-primary/5',
      badge:    'bg-primary/20 text-primary',
    },
    {
      title:    'Deployed',
      icon:     <Globe className="w-4 h-4" />,
      meetings: deployed,
      color:    'border-green-200 bg-green-50',
      badge:    'bg-green-100 text-green-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {columns.map((col) => (
        <div key={col.title} className="flex flex-col gap-3">

          {/* Column header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-foreground">
              {col.icon}
              {col.title}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.badge}`}>
              {col.meetings.length}
            </span>
          </div>

          {/* Cards */}
          <div className={`flex flex-col gap-3 min-h-[200px] rounded-2xl p-3 border ${col.color}`}>
            {col.meetings.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No meetings here</p>
            )}

            {col.meetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting.id)}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {meeting.platform !== 'unknown' ? meeting.platform.replace('-', ' ') : meeting.meetingId}
                </p>
                <h3 className="font-playfair font-bold text-foreground group-hover:text-primary transition-colors mb-3 text-sm">
                  {meeting.projectName}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xl font-bold text-primary">{meeting.specsDetected}</p>
                    <p className="text-xs text-muted-foreground">specs</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(meeting.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day:   'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {meeting.deployUrl && (
                  <a
                    href={meeting.deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    View live app <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}