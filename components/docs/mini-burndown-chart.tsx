'use client';

import { useState, useMemo } from 'react';

const SPRINT_DAYS = 10;
const TOTAL_TICKETS = 20;

export default function MiniBurndownChart() {
  const [day, setDay] = useState(5);

  const { idealLine, actualLine, points } = useMemo(() => {
    const ideal: { x: number; y: number }[] = [];
    const actual: { x: number; y: number }[] = [];

    for (let d = 0; d <= SPRINT_DAYS; d++) {
      const idealY = TOTAL_TICKETS - (TOTAL_TICKETS / SPRINT_DAYS) * d;
      ideal.push({ x: d, y: idealY });
    }

    // Simulated actual progress with some variance
    const actualData = [20, 19, 18, 17, 15, 13, 11, 8, 5, 3, 0];
    for (let d = 0; d <= day; d++) {
      actual.push({ x: d, y: actualData[d] });
    }

    const allPoints = [
      ...ideal.map((p) => ({ ...p, type: 'ideal' as const })),
      ...actual.map((p) => ({ ...p, type: 'actual' as const })),
    ];

    return { idealLine: ideal, actualLine: actual, points: allPoints };
  }, [day]);

  const W = 320;
  const H = 140;
  const PAD = 30;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;

  const toX = (d: number) => PAD + (d / SPRINT_DAYS) * chartW;
  const toY = (tickets: number) => PAD + (1 - tickets / TOTAL_TICKETS) * chartH;

  const idealPath = idealLine
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.x)} ${toY(p.y)}`)
    .join(' ');
  const actualPath = actualLine
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.x)} ${toY(p.y)}`)
    .join(' ');

  const remaining = actualLine[actualLine.length - 1]?.y ?? TOTAL_TICKETS;
  const idealRemaining = idealLine[day]?.y ?? 0;
  const isBehind = remaining > idealRemaining;

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
      {/* Status summary */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <p
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Remaining
          </p>
          <p
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 600 }}
          >
            {remaining}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Ideal
          </p>
          <p
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 600 }}
          >
            {Math.round(idealRemaining)}
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Status
          </p>
          <p
            style={{
              fontSize: '13px',
              margin: 0,
              fontWeight: 600,
              color: isBehind ? '#ef4444' : '#22c55e',
            }}
          >
            {isBehind ? 'Behind' : 'On track'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* Grid lines */}
        {[0, 5, 10, 15, 20].map((t) => (
          <g key={t}>
            <line
              x1={PAD}
              y1={toY(t)}
              x2={W - PAD}
              y2={toY(t)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
            <text
              x={PAD - 6}
              y={toY(t) + 3}
              fill="rgba(255,255,255,0.2)"
              fontSize="8"
              textAnchor="end"
            >
              {t}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {[0, 2, 4, 6, 8, 10].map((d) => (
          <text
            key={d}
            x={toX(d)}
            y={H - 8}
            fill="rgba(255,255,255,0.2)"
            fontSize="8"
            textAnchor="middle"
          >
            D{d}
          </text>
        ))}

        {/* Ideal line */}
        <path
          d={idealPath}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Actual line */}
        <path
          d={actualPath}
          fill="none"
          stroke={isBehind ? '#ef4444' : '#22c55e'}
          strokeWidth="2"
        />

        {/* Actual points */}
        {actualLine.map((p, i) => (
          <circle
            key={i}
            cx={toX(p.x)}
            cy={toY(p.y)}
            r="3"
            fill={isBehind ? '#ef4444' : '#22c55e'}
          />
        ))}

        {/* Current day indicator */}
        <line
          x1={toX(day)}
          y1={PAD}
          x2={toX(day)}
          y2={H - PAD}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>

      {/* Day slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Day 0</span>
        <input
          type="range"
          min="0"
          max={SPRINT_DAYS}
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#3b82f6' }}
        />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Day {SPRINT_DAYS}</span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <svg width="16" height="4">
            <line
              x1="0"
              y1="2"
              x2="16"
              y2="2"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Ideal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <svg width="16" height="4">
            <line
              x1="0"
              y1="2"
              x2="16"
              y2="2"
              stroke={isBehind ? '#ef4444' : '#22c55e'}
              strokeWidth="2"
            />
          </svg>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Actual</span>
        </div>
      </div>

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.5rem',
          textAlign: 'center',
        }}
      >
        Drag the slider to simulate sprint progress
      </p>
    </div>
  );
}
