'use client';

import { useState } from 'react';

type MeetingState = 'recording' | 'processing' | 'completed' | 'failed' | 'not_admitted';

const STATE_CONFIG: Record<
  MeetingState,
  { label: string; color: string; bg: string; icon: string }
> = {
  recording: { label: 'Recording', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '●' },
  processing: { label: 'Processing', color: '#eab308', bg: 'rgba(234,179,8,0.1)', icon: '◐' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: '✓' },
  failed: { label: 'Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '✕' },
  not_admitted: { label: 'Not Admitted', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: '!' },
};

const MEETINGS: {
  id: string;
  title: string;
  platform: string;
  state: MeetingState;
  duration: string;
  tickets: number;
}[] = [
  {
    id: '1',
    title: 'Sprint Planning Q3',
    platform: 'Google Meet',
    state: 'completed',
    duration: '42 min',
    tickets: 8,
  },
  {
    id: '2',
    title: 'Design Review',
    platform: 'Zoom',
    state: 'recording',
    duration: '18 min',
    tickets: 0,
  },
  {
    id: '3',
    title: '1:1 with Sarah',
    platform: 'Teams',
    state: 'processing',
    duration: '25 min',
    tickets: 0,
  },
  {
    id: '4',
    title: 'Client Demo Prep',
    platform: 'Google Meet',
    state: 'failed',
    duration: '—',
    tickets: 0,
  },
];

export default function MiniMeetingCard() {
  const [hovered, setHovered] = useState<string | null>(null);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {MEETINGS.map((m) => {
          const cfg = STATE_CONFIG[m.state];
          return (
            <div
              key={m.id}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === m.id ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                transition: 'background 0.15s',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.375rem',
                }}
              >
                {/* Status badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: cfg.color,
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}30`,
                  }}
                >
                  <span style={{ fontSize: '9px' }}>{cfg.icon}</span>
                  {cfg.label}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                  {m.platform}
                </span>
                <span
                  style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}
                >
                  {m.duration}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                {m.title}
              </p>
              {m.state === 'completed' && m.tickets > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    marginTop: '0.375rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'rgba(34,197,94,0.1)',
                      color: '#22c55e',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}
                  >
                    {m.tickets} tickets extracted
                  </span>
                </div>
              )}
              {m.state === 'recording' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    marginTop: '0.375rem',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  <span style={{ fontSize: '10px', color: 'rgba(239,68,68,0.7)' }}>
                    Bot is in the call
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        Hover over a meeting card to see details
      </p>
    </div>
  );
}
