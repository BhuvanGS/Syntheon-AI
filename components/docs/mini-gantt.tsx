'use client';

import { useState } from 'react';

interface GanttItem {
  id: string;
  label: string;
  start: number;
  duration: number;
  color: string;
  type: 'ticket' | 'milestone';
}

const ITEMS: GanttItem[] = [
  { id: '1', label: 'Setup DB schema', start: 0, duration: 2, color: '#22c55e', type: 'ticket' },
  {
    id: '2',
    label: 'Build API endpoints',
    start: 2,
    duration: 4,
    color: '#3b82f6',
    type: 'ticket',
  },
  { id: '3', label: 'Auth middleware', start: 2, duration: 3, color: '#f97316', type: 'ticket' },
  {
    id: '4',
    label: 'Frontend integration',
    start: 5,
    duration: 4,
    color: '#8b5cf6',
    type: 'ticket',
  },
  { id: '5', label: 'MVP Launch', start: 9, duration: 0, color: '#eab308', type: 'milestone' },
  { id: '6', label: 'QA & Testing', start: 7, duration: 3, color: '#ef4444', type: 'ticket' },
];

const TOTAL_DAYS = 12;
const ROW_H = 28;
const LABEL_W = 120;
const CHART_PAD = 8;

export default function MiniGantt() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const chartW = 280 * zoom;
  const dayW = chartW / TOTAL_DAYS;

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
      {/* Gantt chart */}
      <div
        style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: CHART_PAD,
          overflowX: 'auto',
        }}
      >
        {/* Day headers */}
        <div style={{ display: 'flex', marginBottom: '4px' }}>
          <div style={{ width: LABEL_W, flexShrink: 0 }} />
          <div style={{ display: 'flex', width: chartW, flexShrink: 0 }}>
            {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: dayW,
                  textAlign: 'center',
                  fontSize: '8px',
                  color: 'rgba(255,255,255,0.2)',
                }}
              >
                D{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {ITEMS.map((item, idx) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              height: ROW_H,
              alignItems: 'center',
              marginBottom: '2px',
            }}
          >
            {/* Label */}
            <div
              style={{
                width: LABEL_W,
                flexShrink: 0,
                fontSize: '10px',
                color: hovered === item.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                paddingRight: '0.5rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'color 0.15s',
              }}
            >
              {item.label}
            </div>

            {/* Chart area */}
            <div
              style={{
                width: chartW,
                flexShrink: 0,
                position: 'relative',
                height: ROW_H,
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                borderRadius: '4px',
              }}
            >
              {/* Grid lines */}
              {Array.from({ length: TOTAL_DAYS + 1 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: i * dayW,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                />
              ))}

              {item.type === 'ticket' ? (
                <div
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'absolute',
                    left: item.start * dayW,
                    width: item.duration * dayW,
                    top: '4px',
                    bottom: '4px',
                    background: `${item.color}30`,
                    border: `1px solid ${item.color}60`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '6px',
                    transition: 'all 0.15s',
                    opacity: hovered && hovered !== item.id ? 0.4 : 1,
                  }}
                >
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: item.color,
                      flexShrink: 0,
                      marginRight: '4px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '8px',
                      color: item.color,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                  >
                    {item.duration}d
                  </span>
                </div>
              ) : (
                /* Milestone diamond */
                <div
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    position: 'absolute',
                    left: item.start * dayW - 6,
                    top: '50%',
                    transform: 'translateY(-50%) rotate(45deg)',
                    width: '12px',
                    height: '12px',
                    background: item.color,
                    border: `1px solid ${item.color}`,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    opacity: hovered && hovered !== item.id ? 0.4 : 1,
                    transition: 'opacity 0.15s',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.75rem',
          justifyContent: 'space-between',
        }}
      >
        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div
              style={{
                width: '12px',
                height: '8px',
                borderRadius: '2px',
                background: 'rgba(59,130,246,0.3)',
                border: '1px solid rgba(59,130,246,0.6)',
              }}
            />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Ticket</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#eab308',
                transform: 'rotate(45deg)',
              }}
            />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Milestone</span>
          </div>
        </div>

        {/* Zoom */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.4)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            −
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.4)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Hover detail */}
      {hovered && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              background: ITEMS.find((i) => i.id === hovered)?.color,
            }}
          />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            {ITEMS.find((i) => i.id === hovered)?.label}
          </span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
            {ITEMS.find((i) => i.id === hovered)?.type === 'milestone'
              ? 'Milestone'
              : `Day ${ITEMS.find((i) => i.id === hovered)!.start + 1} → Day ${ITEMS.find((i) => i.id === hovered)!.start + ITEMS.find((i) => i.id === hovered)!.duration + 1}`}
          </span>
        </div>
      )}

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.5rem',
          textAlign: 'center',
        }}
      >
        Hover bars/milestones for details · Use +/− to zoom
      </p>
    </div>
  );
}
