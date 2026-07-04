'use client';

import { useState } from 'react';

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  none: '#6b7280',
};

const TYPE_ICONS: Record<string, string> = {
  bug: '🐛',
  task: '✓',
  feature: '★',
  spike: '?',
};

const ESTIMATE_DOTS: Record<string, number> = {
  quick: 1,
  standard: 2,
  deep: 3,
  epic: 4,
  none: 0,
};

const LABEL_COLORS: Record<string, string> = {
  frontend: '#3b82f6',
  backend: '#8b5cf6',
  bug: '#ef4444',
  urgent: '#f97316',
};

export default function MiniTicketCard() {
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low' | 'none'>('high');
  const [type, setType] = useState<'bug' | 'task' | 'feature' | 'spike'>('task');
  const [estimate, setEstimate] = useState<'quick' | 'standard' | 'deep' | 'epic' | 'none'>(
    'standard'
  );
  const [labels, setLabels] = useState<string[]>(['frontend', 'urgent']);

  const toggleLabel = (label: string) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
        margin: '1.5rem 0',
      }}
    >
      {/* Ticket Card Preview */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
          padding: '0.875rem 1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}
        >
          {/* Priority dot */}
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: PRIORITY_COLORS[priority],
              flexShrink: 0,
            }}
          />
          {/* Type icon */}
          <span style={{ fontSize: '12px' }}>{TYPE_ICONS[type]}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
            Implement OAuth callback handler
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Estimate chips */}
          <span style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {Array.from({ length: ESTIMATE_DOTS[estimate] }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
            {ESTIMATE_DOTS[estimate] === 0 && (
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>No estimate</span>
            )}
          </span>
          {/* Label chips */}
          {labels.map((label) => (
            <span
              key={label}
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '4px',
                background: `${LABEL_COLORS[label]}20`,
                color: LABEL_COLORS[label],
                border: `1px solid ${LABEL_COLORS[label]}40`,
              }}
            >
              {label}
            </span>
          ))}
          {/* Assignee avatar */}
          <span
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.6)',
              marginLeft: 'auto',
            }}
          >
            JD
          </span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '0.375rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Priority
          </p>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {(Object.keys(PRIORITY_COLORS) as string[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p as typeof priority)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : 'rgba(255,255,255,0.08)'}`,
                  background: priority === p ? `${PRIORITY_COLORS[p]}15` : 'transparent',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: priority === p ? PRIORITY_COLORS[p] : 'rgba(255,255,255,0.4)',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: PRIORITY_COLORS[p],
                  }}
                />
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '0.375rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Type
          </p>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {(Object.keys(TYPE_ICONS) as string[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t as typeof type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${type === t ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  background: type === t ? 'rgba(255,255,255,0.06)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: type === t ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                }}
              >
                <span>{TYPE_ICONS[t]}</span>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '0.375rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Estimate
          </p>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {(Object.keys(ESTIMATE_DOTS) as string[]).map((e) => (
              <button
                key={e}
                onClick={() => setEstimate(e as typeof estimate)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${estimate === e ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  background: estimate === e ? 'rgba(255,255,255,0.06)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: estimate === e ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                }}
              >
                {ESTIMATE_DOTS[e] > 0 ? (
                  Array.from({ length: ESTIMATE_DOTS[e] }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.5)',
                      }}
                    />
                  ))
                ) : (
                  <span>none</span>
                )}
                {ESTIMATE_DOTS[e] > 0 && <span style={{ marginLeft: '2px' }}>{e}</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '0.375rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Labels
          </p>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {Object.keys(LABEL_COLORS).map((label) => (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${labels.includes(label) ? `${LABEL_COLORS[label]}60` : 'rgba(255,255,255,0.08)'}`,
                  background: labels.includes(label) ? `${LABEL_COLORS[label]}15` : 'transparent',
                  color: labels.includes(label) ? LABEL_COLORS[label] : 'rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
