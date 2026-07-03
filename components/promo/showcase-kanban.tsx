'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';

const stages = [
  {
    id: 'backlog',
    label: 'Backlog',
    color: '#737373',
    tickets: [
      { id: '1', title: 'Add OAuth callback handler', priority: 'high' },
      { id: '2', title: 'Refactor meeting bot adapter', priority: 'medium' },
      { id: '3', title: 'Add webhook retry logic', priority: 'low' },
      { id: '10', title: 'Calendar sync for Teams', priority: 'medium' },
      { id: '11', title: 'Add bulk ticket export', priority: 'low' },
    ],
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    color: '#3b82f6',
    tickets: [
      { id: '4', title: 'Implement Kanban drag-and-drop', priority: 'high' },
      { id: '5', title: 'Design dashboard analytics view', priority: 'medium' },
      { id: '12', title: 'Auto-organize board flow', priority: 'high' },
    ],
  },
  {
    id: 'blocked',
    label: 'Blocked',
    color: '#ef4444',
    tickets: [
      { id: '6', title: 'Deploy to production', priority: 'urgent' },
      { id: '13', title: 'Migrate to Drizzle ORM', priority: 'high' },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    color: '#22c55e',
    tickets: [
      { id: '7', title: 'Set up Drizzle schema', priority: 'medium' },
      { id: '8', title: 'Configure Clerk webhooks', priority: 'high' },
      { id: '9', title: 'Build ticket dependency graph', priority: 'low' },
      { id: '14', title: 'Meeting bot Zoom support', priority: 'medium' },
      { id: '15', title: 'Ticket priority badges', priority: 'low' },
    ],
  },
];

const PRIORITY_DOT: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

function KanbanInner() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60 overflow-hidden">
      {/* Header bar */}
      <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">S</span>
          </div>
          <span className="text-xs text-white/60">Auth Dashboard / Kanban</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] text-white/40">
            <span>Search</span>
            <span className="text-white/20">⌘K</span>
          </div>
          <div className="w-5 h-5 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 p-4 overflow-hidden" style={{ minHeight: '480px' }}>
        {stages.map((stage, si) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.3 }}
            className="min-w-[150px] w-[150px] rounded-xl border border-white/10 bg-white/[0.02] flex flex-col flex-1"
          >
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }} />
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: stage.color }}
                >
                  {stage.label}
                </span>
              </div>
              <span className="text-xs text-white/30 tabular-nums">{stage.tickets.length}</span>
            </div>
            <div className="px-3 pb-3 flex flex-col gap-2">
              {stage.tickets.map((ticket, ti) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: si * 0.1 + ti * 0.05, duration: 0.3 }}
                  viewport={{ once: true }}
                  className="p-3.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: PRIORITY_DOT[ticket.priority] ?? '#737373' }}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-white/90 font-medium leading-snug">
                      {ticket.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-white/30 font-mono">SYN-{ticket.id}</span>
                    <MoreHorizontal className="w-3.5 h-3.5 text-white/20" aria-hidden="true" />
                  </div>
                </motion.div>
              ))}
              <button
                className="flex items-center gap-1 px-2.5 py-2 rounded-md text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                aria-label="Add new ticket"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                New ticket
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ShowcaseKanban({ hero }: { hero?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -4]);
  const y = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3]);

  const style = hero ? {} : { rotate, y, opacity, transformPerspective: 1200 };
  const className = hero ? 'relative w-full' : 'relative w-full max-w-5xl mx-auto';

  return (
    <motion.div ref={ref} style={style} className={className}>
      <KanbanInner />
    </motion.div>
  );
}
