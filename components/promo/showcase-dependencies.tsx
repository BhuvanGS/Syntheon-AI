'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { GitBranch } from 'lucide-react';

const graphTickets = [
  { id: '1', title: 'Set up Drizzle schema', status: 'done', x: 0, y: 0 },
  { id: '2', title: 'Configure Clerk webhooks', status: 'done', x: 0, y: 70 },
  { id: '3', title: 'Implement OAuth flow', status: 'done', x: 200, y: 0 },
  { id: '4', title: 'Build Kanban board', status: 'in_progress', x: 200, y: 70 },
  { id: '5', title: 'Deploy to production', status: 'blocked', x: 400, y: 35 },
];

const deps = [
  { from: '1', to: '3', hard: false },
  { from: '2', to: '3', hard: false },
  { from: '3', to: '4', hard: false },
  { from: '4', to: '5', hard: true },
];

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  done: { bg: '#052e16', border: '#166534', text: '#86efac', dot: '#22c55e' },
  in_progress: { bg: '#0c1a3d', border: '#1e40af', text: '#93c5fd', dot: '#3b82f6' },
  blocked: { bg: '#2a0a0a', border: '#991b1b', text: '#fca5a5', dot: '#ef4444' },
  backlog: { bg: '#1c1917', border: '#44403c', text: '#a8a29e', dot: '#78716c' },
};

function DependenciesInner() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60 overflow-hidden">
      {/* Header */}
      <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-white/40" aria-hidden="true" />
          <span className="text-xs text-white/60">Dependency Graph</span>
        </div>
        <span className="text-[10px] text-white/30 tabular-nums">5 tickets · 4 links</span>
      </div>

      {/* Graph */}
      <div className="relative h-[440px] bg-white/[0.01]">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <marker
              id="arrow-soft-show"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#737373" />
            </marker>
            <marker
              id="arrow-hard-show"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>
          <g transform="translate(30, 60)">
            {deps.map((dep, i) => {
              const from = graphTickets.find((t) => t.id === dep.from);
              const to = graphTickets.find((t) => t.id === dep.to);
              if (!from || !to) return null;
              const x1 = from.x + 160;
              const y1 = from.y + 24;
              const x2 = to.x;
              const y2 = to.y + 24;
              const mx = (x1 + x2) / 2;
              return (
                <motion.path
                  key={i}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  viewport={{ once: true }}
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={dep.hard ? '#ef4444' : '#737373'}
                  strokeWidth={dep.hard ? 2 : 1.5}
                  strokeDasharray={dep.hard ? undefined : '5,4'}
                  markerEnd={`url(#arrow-${dep.hard ? 'hard' : 'soft'}-show)`}
                />
              );
            })}
            {graphTickets.map((ticket, i) => {
              const colors = STATUS_COLORS[ticket.status] ?? STATUS_COLORS.backlog;
              return (
                <g key={ticket.id} transform={`translate(${ticket.x}, ${ticket.y})`}>
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    viewport={{ once: true }}
                    style={{ transformOrigin: '80px 24px' }}
                  >
                    <rect
                      width="160"
                      height="48"
                      rx="8"
                      fill={colors.bg}
                      stroke={colors.border}
                      strokeWidth="1.5"
                    />
                    <circle cx="14" cy="24" r="4" fill={colors.dot} />
                    <text x="24" y="20" fontSize="10" fontWeight="600" fill={colors.text}>
                      {ticket.title}
                    </text>
                    <text x="24" y="34" fontSize="8.5" fill={colors.text} opacity="0.7">
                      {ticket.status.replace('_', ' ')}
                    </text>
                  </motion.g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

export function ShowcaseDependencies({ hero }: { hero?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -6]);
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3]);

  const style = hero ? {} : { rotate, y, opacity, transformPerspective: 1200 };
  const className = hero ? 'relative w-full' : 'relative w-full max-w-4xl mx-auto';

  return (
    <motion.div ref={ref} style={style} className={className}>
      <DependenciesInner />
    </motion.div>
  );
}
