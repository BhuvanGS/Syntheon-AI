'use client';

import { useState } from 'react';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'backlog' | 'in_progress' | 'blocked' | 'done';
}

interface GraphEdge {
  from: string;
  to: string;
  type: 'hard' | 'soft';
}

const STATUS_COLORS: Record<string, string> = {
  backlog: 'rgba(255,255,255,0.3)',
  in_progress: '#3b82f6',
  blocked: '#ef4444',
  done: '#22c55e',
};

const NODES: GraphNode[] = [
  { id: 'A', label: 'Setup DB schema', x: 40, y: 80, status: 'done' },
  { id: 'B', label: 'Build API endpoints', x: 180, y: 40, status: 'in_progress' },
  { id: 'C', label: 'Write auth middleware', x: 180, y: 120, status: 'blocked' },
  { id: 'D', label: 'Frontend integration', x: 320, y: 80, status: 'backlog' },
];

const EDGES: GraphEdge[] = [
  { from: 'A', to: 'B', type: 'hard' },
  { from: 'A', to: 'C', type: 'hard' },
  { from: 'B', to: 'D', type: 'soft' },
  { from: 'C', to: 'D', type: 'hard' },
];

export default function MiniDependencyGraph() {
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const selectedNode = selected ? NODES.find((n) => n.id === selected) : null;
  const selectedDeps = selected
    ? EDGES.filter((e) => e.from === selected || e.to === selected)
    : [];

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
      {/* Graph Canvas */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          {/* Edges */}
          {EDGES.map((edge, i) => {
            const from = NODES.find((n) => n.id === edge.from)!;
            const to = NODES.find((n) => n.id === edge.to)!;
            const isHard = edge.type === 'hard';
            const isHighlighted = selected && (edge.from === selected || edge.to === selected);
            return (
              <line
                key={i}
                x1={from.x + 50}
                y1={from.y + 15}
                x2={to.x}
                y2={to.y + 15}
                stroke={isHard ? '#ef4444' : 'rgba(255,255,255,0.3)'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHard ? 'none' : '4 3'}
                opacity={selected && !isHighlighted ? 0.2 : 0.7}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => (
            <g
              key={node.id}
              onClick={() => setSelected(selected === node.id ? null : node.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={node.x}
                y={node.y}
                width={120}
                height={30}
                rx={6}
                fill={selected === node.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                stroke={STATUS_COLORS[node.status]}
                strokeWidth={selected === node.id ? 2 : 1}
                opacity={selected && selected !== node.id ? 0.4 : 1}
              />
              <circle cx={node.x + 10} cy={node.y + 15} r={4} fill={STATUS_COLORS[node.status]} />
              <text
                x={node.x + 22}
                y={node.y + 19}
                fill="rgba(255,255,255,0.7)"
                fontSize="10"
                fontFamily="Inter, sans-serif"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Zoom controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.6)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            −
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.6)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <svg width="20" height="4">
            <line x1="0" y1="2" x2="20" y2="2" stroke="#ef4444" strokeWidth="1.5" />
          </svg>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Hard dependency</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <svg width="20" height="4">
            <line
              x1="0"
              y1="2"
              x2="20"
              y2="2"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Soft dependency</span>
        </div>
      </div>

      {/* Selected node details */}
      {selectedNode && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.625rem 0.875rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.06)',
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
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: STATUS_COLORS[selectedNode.status],
              }}
            />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              {selectedNode.label}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.3)',
                marginLeft: 'auto',
                textTransform: 'uppercase',
              }}
            >
              {selectedNode.status}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            {selectedDeps.length} dependency link{selectedDeps.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {!selectedNode && (
        <p
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.25)',
            marginTop: '0.75rem',
            textAlign: 'center',
          }}
        >
          Click a node to see details · Use +/− to zoom
        </p>
      )}
    </div>
  );
}
