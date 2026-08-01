'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, Clock, Loader2, AlertTriangle, Video, Calendar, Zap } from 'lucide-react';
import { InteractiveKanbanDemo } from '@/components/promo/interactive-kanban';

const EASE = [0.16, 1, 0.3, 1] as const;
const CYCLE_MS = 3400;

export type DoneMode = 'tickets' | 'kanban' | 'sprints' | 'meetings';

const MODES: DoneMode[] = ['tickets', 'kanban', 'sprints', 'meetings'];

const MODE_COPY: Record<DoneMode, { noun: string; hint: string }> = {
  tickets: {
    noun: 'tickets',
    hint: 'Action items extracted and ready to assign.',
  },
  kanban: {
    noun: 'kanban',
    hint: 'You were still reading. The board was already current.',
  },
  sprints: {
    noun: 'sprints',
    hint: 'Work sliced into focused windows with clear goals.',
  },
  meetings: {
    noun: 'meetings',
    hint: 'Calls captured, processed, and linked to the board.',
  },
};

const MOCK_TICKETS = [
  { id: '1', title: 'Capture this week’s meetings', meta: 'High · Sarah', status: 'Ready' },
  { id: '2', title: 'Extract tickets from discussion', meta: 'Medium · Mike', status: 'Ready' },
  { id: '3', title: 'Process recording into next steps', meta: 'High · John', status: 'Ready' },
  { id: '4', title: 'Insights from user feedback', meta: 'Medium · Sarah', status: 'Ready' },
  { id: '5', title: 'Action items from standup', meta: 'High · Mike', status: 'Ready' },
  { id: '6', title: 'Ship arranged board automatically', meta: 'High · System', status: 'Done' },
];

const MOCK_SPRINTS = [
  {
    id: 's1',
    name: 'Sprint 14 — Auth harden',
    goal: 'Close auth blockers before launch',
    range: 'Jun 16 – Jun 27',
    progress: 72,
    tickets: 11,
    status: 'Active',
  },
  {
    id: 's2',
    name: 'Sprint 15 — Board polish',
    goal: 'Kanban density + dependency clarity',
    range: 'Jun 30 – Jul 11',
    progress: 18,
    tickets: 9,
    status: 'Planning',
  },
  {
    id: 's3',
    name: 'Sprint 13 — Meeting pipeline',
    goal: 'Transcript → tickets reliability',
    range: 'Jun 2 – Jun 13',
    progress: 100,
    tickets: 14,
    status: 'Done',
  },
];

const MOCK_MEETINGS = [
  {
    id: '1',
    title: 'Auth Dashboard — Sprint Review',
    status: 'completed' as const,
    date: 'Jun 26, 2026',
    platform: 'Google Meet',
    tickets: 8,
  },
  {
    id: '2',
    title: 'API Refactor Planning',
    status: 'processing' as const,
    date: 'Jun 25, 2026',
    platform: 'Zoom',
    tickets: 0,
  },
  {
    id: '3',
    title: 'Dependency Graph Design',
    status: 'completed' as const,
    date: 'Jun 24, 2026',
    platform: 'Teams',
    tickets: 5,
  },
  {
    id: '4',
    title: 'Q3 Roadmap Alignment',
    status: 'failed' as const,
    date: 'Jun 23, 2026',
    platform: 'Google Meet',
    tickets: 0,
  },
];

const MEETING_STATUS: Record<
  string,
  { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
  completed: {
    icon: CheckCircle2,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    label: 'Completed',
  },
  processing: {
    icon: Loader2,
    color: '#eab308',
    bg: 'rgba(234,179,8,0.15)',
    label: 'Processing',
  },
  failed: {
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
    label: 'Failed',
  },
};

const swipe = {
  initial: { y: '-110%', opacity: 0 },
  animate: { y: '0%', opacity: 1 },
  exit: { y: '110%', opacity: 0 },
};

function Chrome({
  title,
  action,
  children,
  minHeight = 'min(56vh, 560px)',
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  minHeight?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden"
      style={{
        boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
        minHeight,
      }}
    >
      <div
        className="border-b border-white/10 flex items-center justify-between px-5 bg-[#0d0d0d]"
        style={{ height: 56 }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <span className="text-base text-white/65">{title}</span>
        </div>
        {action ?? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-xs text-white/40">
              <span>Search</span>
              <span className="text-white/20">⌘K</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function TicketsMock() {
  return (
    <Chrome title="Tickets ready">
      <div className="p-5 flex flex-col gap-2.5" style={{ minHeight: 'min(52vh, 520px)' }}>
        {MOCK_TICKETS.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
          >
            <div className="min-w-0 flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
              <div className="min-w-0">
                <p className="text-base font-medium text-white/90 leading-snug truncate">
                  {t.title}
                </p>
                <p className="mt-1 text-xs text-white/40">{t.meta}</p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <span className="font-mono text-[10px] text-white/30">SYN-{t.id}</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  color: t.status === 'Done' ? '#86efac' : 'rgba(255,255,255,0.55)',
                  background:
                    t.status === 'Done' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                }}
              >
                {t.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Chrome>
  );
}

function SprintsMock() {
  return (
    <Chrome
      title="Sprints"
      action={
        <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs text-white/70">
          <Zap className="h-3.5 w-3.5" />
          Generate
        </div>
      }
    >
      <div className="grid gap-3 p-5 sm:grid-cols-3" style={{ minHeight: 'min(52vh, 520px)' }}>
        {MOCK_SPRINTS.map((s) => (
          <div
            key={s.id}
            className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                style={{
                  color:
                    s.status === 'Active'
                      ? '#93c5fd'
                      : s.status === 'Done'
                        ? '#86efac'
                        : 'rgba(255,255,255,0.5)',
                  background:
                    s.status === 'Active'
                      ? 'rgba(59,130,246,0.15)'
                      : s.status === 'Done'
                        ? 'rgba(34,197,94,0.12)'
                        : 'rgba(255,255,255,0.06)',
                }}
              >
                {s.status}
              </span>
              <span className="text-[10px] text-white/35 tabular-nums">{s.tickets} tickets</span>
            </div>
            <h3 className="mt-3 text-[15px] font-semibold text-white/90 leading-snug">{s.name}</h3>
            <p className="mt-1.5 text-xs text-white/45 leading-relaxed">{s.goal}</p>
            <div className="mt-auto pt-5">
              <div className="mb-2 flex items-center justify-between text-[10px] text-white/35">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {s.range}
                </span>
                <span className="tabular-nums">{s.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/70"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Chrome>
  );
}

function MeetingsMock() {
  return (
    <Chrome
      title="Meetings"
      action={
        <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs text-white/80">
          <Video className="h-3.5 w-3.5" />
          New meeting
        </div>
      }
    >
      <div
        className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2"
        style={{ minHeight: 'min(52vh, 520px)' }}
      >
        {MOCK_MEETINGS.map((meeting) => {
          const config = MEETING_STATUS[meeting.status];
          const Icon = config?.icon ?? Clock;
          const spin = meeting.status === 'processing';
          return (
            <div key={meeting.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: config?.color, backgroundColor: config?.bg }}
                >
                  <Icon className={`h-3 w-3 ${spin ? 'animate-spin' : ''}`} />
                  {config?.label}
                </span>
                <span className="text-[10px] text-white/30">{meeting.platform}</span>
              </div>
              <h3 className="text-[15px] font-medium text-white/90 leading-snug">
                {meeting.title}
              </h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-white/35">
                  <Clock className="h-3 w-3" />
                  {meeting.date}
                </span>
                {meeting.tickets > 0 && (
                  <span className="text-[11px] tabular-nums text-white/50">
                    {meeting.tickets} tickets
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Chrome>
  );
}

function ModeMock({ mode }: { mode: DoneMode }) {
  if (mode === 'kanban') {
    return <InteractiveKanbanDemo majestic arranged />;
  }
  if (mode === 'sprints') return <SprintsMock />;
  if (mode === 'meetings') return <MeetingsMock />;
  return <TicketsMock />;
}

/** Cycling noun for the Ship headline — swipe-down word change. */
export function DoneModeNoun({ mode, reduce }: { mode: DoneMode; reduce: boolean | null }) {
  return (
    <span
      className="relative inline-grid overflow-hidden"
      style={{ height: '1.2em', verticalAlign: 'baseline' }}
    >
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden>
        meetings.
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mode}
          initial={reduce ? false : swipe.initial}
          animate={swipe.animate}
          exit={reduce ? undefined : swipe.exit}
          transition={{ duration: 0.5, ease: EASE }}
          className="col-start-1 row-start-1 whitespace-nowrap justify-self-center"
          style={{ color: '#fff' }}
        >
          {MODE_COPY[mode].noun}.
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function DoneModeHint({ mode, reduce }: { mode: DoneMode; reduce: boolean | null }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={mode}
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: 12 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="inline-block"
      >
        {MODE_COPY[mode].hint}
      </motion.span>
    </AnimatePresence>
  );
}

export function useDoneModeCycle(active: boolean) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<DoneMode>('tickets');

  useEffect(() => {
    if (!active || reduce) return;
    const id = window.setInterval(() => {
      setMode((prev) => MODES[(MODES.indexOf(prev) + 1) % MODES.length]);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [active, reduce]);

  return { mode, reduce };
}

export function DoneModeStage({ mode, reduce }: { mode: DoneMode; reduce: boolean | null }) {
  return (
    <div className="relative w-full" style={{ minHeight: 'min(72vh, 720px)' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={reduce ? false : { y: 36, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: 40, opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="w-full"
        >
          <ModeMock mode={mode} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
