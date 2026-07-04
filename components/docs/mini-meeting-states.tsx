'use client';

import { useState } from 'react';

type State = 'recording' | 'processing' | 'completed' | 'failed' | 'not_admitted';

const STATES: {
  id: State;
  label: string;
  color: string;
  bg: string;
  icon: string;
  desc: string;
}[] = [
  {
    id: 'recording',
    label: 'Recording',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    icon: '●',
    desc: 'Bot is actively in the call, transcribing audio in real-time',
  },
  {
    id: 'processing',
    label: 'Processing',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.1)',
    icon: '◐',
    desc: 'Transcript is being analyzed by AI to extract structured tickets',
  },
  {
    id: 'completed',
    label: 'Completed',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    icon: '✓',
    desc: 'Tickets have been extracted and are ready for review',
  },
  {
    id: 'failed',
    label: 'Failed',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    icon: '✕',
    desc: 'Something went wrong — usually a bot admission or transcription issue',
  },
  {
    id: 'not_admitted',
    label: 'Not Admitted',
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.1)',
    icon: '!',
    desc: 'Bot was not admitted to the meeting by the host',
  },
];

const FLOW: State[] = ['recording', 'processing', 'completed'];

export default function MiniMeetingStates() {
  const [active, setActive] = useState<State>('recording');

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
      {/* Happy path flow */}
      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '0.625rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}
      >
        Happy Path
      </p>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}
      >
        {FLOW.map((stateId, i) => {
          const s = STATES.find((st) => st.id === stateId)!;
          const isActive = active === stateId;
          return (
            <div key={stateId} style={{ display: 'flex', alignItems: 'center', flex: '1 1 0' }}>
              <button
                onClick={() => setActive(stateId)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.625rem',
                  borderRadius: '8px',
                  border: `1px solid ${isActive ? s.color + '60' : 'rgba(255,255,255,0.06)'}`,
                  background: isActive ? s.bg : 'rgba(255,255,255,0.015)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '12px', color: s.color }}>{s.icon}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: isActive ? s.color : 'rgba(255,255,255,0.4)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {s.label}
                </span>
              </button>
              {i < FLOW.length - 1 && (
                <span
                  style={{ fontSize: '14px', color: 'rgba(255,255,255,0.15)', margin: '0 0.25rem' }}
                >
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error states */}
      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '0.625rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}
      >
        Error States
      </p>
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem' }}>
        {STATES.filter((s) => s.id === 'failed' || s.id === 'not_admitted').map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.625rem',
                borderRadius: '8px',
                border: `1px solid ${isActive ? s.color + '60' : 'rgba(255,255,255,0.06)'}`,
                background: isActive ? s.bg : 'rgba(255,255,255,0.015)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '12px', color: s.color }}>{s.icon}</span>
              <span
                style={{
                  fontSize: '11px',
                  color: isActive ? s.color : 'rgba(255,255,255,0.4)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active state detail */}
      {STATES.filter((s) => s.id === active).map((s) => (
        <div
          key={s.id}
          style={{
            padding: '0.75rem 1rem',
            background: s.bg,
            border: `1px solid ${s.color}30`,
            borderRadius: '8px',
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
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                color: s.color,
                background: s.bg,
                border: `1px solid ${s.color}30`,
              }}
            >
              <span>{s.icon}</span>
              {s.label}
            </span>
          </div>
          <p
            style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}
          >
            {s.desc}
          </p>
        </div>
      ))}

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        Click any state to see its description
      </p>
    </div>
  );
}
