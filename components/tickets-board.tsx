'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle, AlertCircle, Circle } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'done' | 'blocked';
  assignee?: string | null;
  projectId?: string | null;
  meeting_id: string;
}

interface Meeting {
  id: string;
  projectName: string;
}

interface TicketsBoardProps {
  onSelectMeeting: (meetingId: string) => void;
}

export function TicketsBoard({ onSelectMeeting }: TicketsBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [ticketsRes, meetingsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/meetings'),
      ]);
      const [ticketsData, meetingsData] = await Promise.all([
        ticketsRes.json(),
        meetingsRes.json(),
      ]);
      setTickets(ticketsData);
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  function getMeetingName(meetingId: string) {
    return meetings.find((m) => m.id === meetingId)?.projectName || meetingId;
  }

  const columns = [
    {
      key: 'backlog',
      title: 'Backlog',
      icon: <Circle className="w-4 h-4" />,
      color: 'border-border bg-card',
      badge: 'bg-muted text-muted-foreground',
    },
    {
      key: 'in_progress',
      title: 'In Progress',
      icon: <Clock className="w-4 h-4" />,
      color: 'border-primary/20 bg-primary/5',
      badge: 'bg-primary/20 text-primary',
    },
    {
      key: 'blocked',
      title: 'Blocked',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'border-destructive/20 bg-destructive/5',
      badge: 'bg-destructive/20 text-destructive',
    },
    {
      key: 'done',
      title: 'Done',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'border-green-200 bg-green-50',
      badge: 'bg-green-100 text-green-800',
    },
  ] as const;

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
      <div className="bg-card rounded-2xl p-12 border border-border text-center">
        <p className="text-2xl font-playfair font-bold text-foreground mb-2">No tickets yet</p>
        <p className="text-muted-foreground">Record a meeting to extract Jira-like tickets.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTickets = tickets.filter((ticket) => ticket.status === column.key);

        return (
          <div key={column.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-foreground">
                {column.icon}
                {column.title}
              </div>
              <Badge className={`text-xs px-2 py-0.5 rounded-full font-medium ${column.badge}`}>
                {columnTickets.length}
              </Badge>
            </div>

            <div
              className={`flex flex-col gap-3 min-h-[220px] rounded-2xl p-3 border ${column.color}`}
            >
              {columnTickets.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No tickets here</p>
              )}

              {columnTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => onSelectMeeting(ticket.meeting_id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-playfair font-bold text-foreground group-hover:text-primary transition-colors text-sm leading-snug">
                      {ticket.title}
                    </h3>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                      {column.title}
                    </span>
                  </div>

                  {ticket.description && (
                    <p className="text-xs text-muted-foreground leading-5 line-clamp-3">
                      {ticket.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span className="text-primary hover:underline font-medium">
                      {getMeetingName(ticket.meeting_id)}
                    </span>
                    <span className="text-muted-foreground">
                      {ticket.assignee ? `@${ticket.assignee}` : 'Unassigned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
