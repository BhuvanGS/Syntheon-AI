'use client';

import { useState } from 'react';

type StatKey = 'backlog' | 'in_progress' | 'completion' | 'blocked';

const STATS: Record<
  StatKey,
  { label: string; value: number; total: number; color: string; bg: string; icon: string }
> = {
  backlog: {
    label: 'Backlog',
    value: 12,
    total: 30,
    color: 'rgba(255,255,255,0.4)',
    bg: 'rgba(255,255,255,0.04)',
    icon: '▤',
  },
  in_progress: {
    label: 'In Progress',
    value: 8,
    total: 30,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    icon: '◐',
  },
  completion: {
    label: 'Completion Rate',
    value: 65,
    total: 100,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    icon: '✓',
  },
  blocked: {
    label: 'Blocked',
    value: 3,
    total: 30,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    icon: '⛔',
  },
};

export default function MiniAnalytics() {
  const [active, setActive] = useState<StatKey>('completion');
  const s = STATS[active];
  const pct = Math.round((s.value / s.total) * 100);

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
      {/* Stat cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        {(Object.keys(STATS) as StatKey[]).map((key) => {
          const stat = STATS[key];
          const isActive = active === key;
          const statPct = Math.round((stat.value / stat.total) * 100);
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              style={{
                background: isActive ? stat.bg : 'rgba(255,255,255,0.015)',
                border: `1px solid ${isActive ? stat.color + '40' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '8px',
                padding: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  marginBottom: '0.375rem',
                }}
              >
                <span style={{ fontSize: '13px', color: stat.color }}>{stat.icon}</span>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '22px',
                    color: isActive ? stat.color : 'rgba(255,255,255,0.7)',
                    fontWeight: 700,
                  }}
                >
                  {stat.value}
                </span>
                {key !== 'completion' && (
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>
                    / {stat.total}
                  </span>
                )}
                {key === 'completion' && (
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>%</span>
                )}
              </div>
              {/* Mini progress bar */}
              <div
                style={{
                  marginTop: '0.375rem',
                  height: '3px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${statPct}%`,
                    height: '100%',
                    background: stat.color,
                    borderRadius: '2px',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active stat detail */}
      <div
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
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontSize: '14px', color: s.color }}>{s.icon}</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              {s.label}
            </span>
          </div>
          <span style={{ fontSize: '18px', color: s.color, fontWeight: 700 }}>
            {s.value}
            {active === 'completion' ? '%' : ` / ${s.total}`}
          </span>
        </div>

        {/* Big progress bar */}
        <div
          style={{
            height: '6px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: s.color,
              borderRadius: '3px',
              transition: 'width 0.3s',
            }}
          />
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0.5rem 0 0' }}>
          {pct}% of {active === 'completion' ? 'total tickets completed' : 'total tickets'}
        </p>
      </div>

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        Click a stat card to see details
      </p>
    </div>
  );
}
