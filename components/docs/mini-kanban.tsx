'use client';

import { useState } from 'react';

type Status = 'backlog' | 'in_progress' | 'blocked' | 'done';

interface MiniTicket {
  id: string;
  title: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: Status;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'rgba(255,255,255,0.3)' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'blocked', label: 'Blocked', color: '#ef4444' },
  { id: 'done', label: 'Done', color: '#22c55e' },
];

const INITIAL_TICKETS: MiniTicket[] = [
  { id: '1', title: 'Fix login redirect', priority: 'urgent', status: 'backlog' },
  { id: '2', title: 'Add dark mode toggle', priority: 'medium', status: 'in_progress' },
  { id: '3', title: 'Update API docs', priority: 'low', status: 'done' },
  { id: '4', title: 'Refactor auth flow', priority: 'high', status: 'blocked' },
  { id: '5', title: 'Setup CI pipeline', priority: 'medium', status: 'backlog' },
  { id: '6', title: 'Design settings page', priority: 'low', status: 'in_progress' },
];

export default function MiniKanban() {
  const [tickets, setTickets] = useState<MiniTicket[]>(INITIAL_TICKETS);
  const [dragId, setDragId] = useState<string | null>(null);

  const onDragStart = (id: string) => setDragId(id);
  const onDrop = (status: Status) => {
    if (dragId) {
      setTickets((prev) => prev.map((t) => (t.id === dragId ? { ...t, status } : t)));
      setDragId(null);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1rem',
        margin: '1.5rem 0',
      }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {COLUMNS.map((col) => {
          const colTickets = tickets.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
              style={{
                flex: '1 1 0',
                minWidth: '120px',
                background: 'rgba(255,255,255,0.015)',
                borderRadius: '8px',
                padding: '0.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  marginBottom: '0.5rem',
                  padding: '0 0.25rem',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: col.color,
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {col.label}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.25)',
                    marginLeft: 'auto',
                  }}
                >
                  {colTickets.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {colTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    draggable
                    onDragStart={() => onDragStart(ticket.id)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.625rem',
                      cursor: 'grab',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.375rem',
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: PRIORITY_COLORS[ticket.priority],
                          flexShrink: 0,
                          marginTop: '3px',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.7)',
                          lineHeight: 1.4,
                        }}
                      >
                        {ticket.title}
                      </span>
                    </div>
                  </div>
                ))}
                {colTickets.length === 0 && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255,255,255,0.15)',
                      textAlign: 'center',
                      padding: '0.75rem 0',
                    }}
                  >
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        Drag tickets between columns to change status
      </p>
    </div>
  );
}
