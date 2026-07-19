'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

const PRIORITY_DOT: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

const COLUMNS = [
  { id: 'backlog', label: 'Captured', color: '#737373' },
  { id: 'in_progress', label: 'Processing', color: '#3b82f6' },
  { id: 'blocked', label: 'Extracted', color: '#a3a3a3' },
  { id: 'done', label: 'Shipped', color: '#22c55e' },
];

interface Ticket {
  id: string;
  title: string;
  priority: string;
  correctColumn: string;
}

interface MeetingLine {
  id: string;
  speaker: string;
  text: string;
  ticketId: string;
}

const MEETING_LINES: MeetingLine[] = [
  {
    id: 'm1',
    speaker: 'Sarah',
    text: 'hey we captured all the meetings from this week',
    ticketId: '1',
  },
  {
    id: 'm2',
    speaker: 'Mike',
    text: 'I think we need to process this recording and figure out what to do next',
    ticketId: '3',
  },
  {
    id: 'm3',
    speaker: 'Sarah',
    text: 'can we extract tickets from the discussion?',
    ticketId: '2',
  },
  {
    id: 'm4',
    speaker: 'John',
    text: 'users are asking for better onboarding, we should track that as an insight',
    ticketId: '4',
  },
  {
    id: 'm5',
    speaker: 'Mike',
    text: 'action items from standup: fix the auth flow, update the dashboard, deploy by Friday',
    ticketId: '5',
  },
  {
    id: 'm6',
    speaker: 'Sarah',
    text: 'great, Syntheon Hub handled all of that automatically',
    ticketId: '6',
  },
];

const ALL_TICKETS: Ticket[] = [
  { id: '1', title: 'Capture this week’s meetings', priority: 'high', correctColumn: 'backlog' },
  {
    id: '2',
    title: 'Extract tickets from discussion',
    priority: 'medium',
    correctColumn: 'blocked',
  },
  {
    id: '3',
    title: 'Process recording into next steps',
    priority: 'high',
    correctColumn: 'in_progress',
  },
  { id: '4', title: 'Insights from user feedback', priority: 'medium', correctColumn: 'blocked' },
  { id: '5', title: 'Action items from standup', priority: 'high', correctColumn: 'blocked' },
  { id: '6', title: 'Ship arranged board automatically', priority: 'high', correctColumn: 'done' },
];

function scatterTickets(): Record<string, Ticket[]> {
  const columns: Record<string, Ticket[]> = { backlog: [], in_progress: [], blocked: [], done: [] };
  for (const ticket of ALL_TICKETS) {
    const wrongColumns = Object.keys(columns).filter((c) => c !== ticket.correctColumn);
    const randomColumn = wrongColumns[Math.floor(Math.random() * wrongColumns.length)];
    columns[randomColumn].push(ticket);
  }
  return columns;
}

function arrangedTickets(): Record<string, Ticket[]> {
  const columns: Record<string, Ticket[]> = { backlog: [], in_progress: [], blocked: [], done: [] };
  for (const ticket of ALL_TICKETS) {
    columns[ticket.correctColumn].push(ticket);
  }
  return columns;
}

const TICKETS_BY_ID: Record<string, Ticket> = Object.fromEntries(ALL_TICKETS.map((t) => [t.id, t]));
const STEP_DELAY = 2200;

function getInitialTickets(): Record<string, Ticket[]> {
  return {
    backlog: [ALL_TICKETS[0], ALL_TICKETS[1]],
    in_progress: [ALL_TICKETS[2], ALL_TICKETS[3]],
    blocked: [ALL_TICKETS[4]],
    done: [ALL_TICKETS[5]],
  };
}

export function InteractiveKanbanDemo({
  majestic = false,
  /** Skip the live arrange animation — show final columns immediately. */
  arranged = false,
  /** Densify for side-by-side landing layouts — flexible columns, shorter board. */
  compact = false,
}: {
  majestic?: boolean;
  arranged?: boolean;
  compact?: boolean;
}) {
  const [tickets, setTickets] = useState<Record<string, Ticket[]>>(() =>
    arranged ? arrangedTickets() : getInitialTickets()
  );
  const [mounted, setMounted] = useState(false);
  const [activeLine, setActiveLine] = useState(arranged ? MEETING_LINES.length - 1 : -1);
  const [isComplete, setIsComplete] = useState(arranged);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || arranged) return;
    setTickets(scatterTickets());
  }, [mounted, arranged]);

  useEffect(() => {
    if (arranged) {
      setTickets(arrangedTickets());
      setActiveLine(MEETING_LINES.length - 1);
      setIsComplete(true);
      return;
    }

    MEETING_LINES.forEach((_, i) => {
      const t = setTimeout(
        () => {
          setActiveLine(i);
          const ticket = TICKETS_BY_ID[MEETING_LINES[i].ticketId];
          setTickets((prev) => {
            const next = { ...prev };
            for (const colId of Object.keys(next)) {
              next[colId] = next[colId].filter((t2) => t2.id !== ticket.id);
            }
            next[ticket.correctColumn] = [...next[ticket.correctColumn], ticket];
            return next;
          });
          if (i === MEETING_LINES.length - 1) {
            const finalT = setTimeout(() => {
              setIsComplete(true);
            }, 800);
            timeoutsRef.current.push(finalT);
          }
        },
        1000 + i * STEP_DELAY
      );
      timeoutsRef.current.push(t);
    });

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [mounted, arranged]);

  const colMin = compact ? 148 : majestic ? 220 : 240;
  const boardMinH = compact ? 340 : majestic ? 'min(72vh, 720px)' : '500px';
  const fluidCols = majestic || compact;

  return (
    <div className="w-full min-w-0">
      {!arranged && (
        <div
          className="rounded-xl mb-4"
          style={{
            height: majestic ? 72 : 64,
            background: 'rgba(255,255,255,0.04)',
            border: majestic ? '1px solid rgba(255,255,255,0.08)' : undefined,
          }}
        >
          <div className="flex items-center h-full px-5 gap-3">
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeLine >= 0 && (
                  <motion.div
                    key={activeLine}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3 whitespace-nowrap"
                  >
                    <span
                      className={
                        majestic
                          ? 'text-xl font-semibold text-white/90'
                          : 'text-lg font-semibold text-white/90'
                      }
                    >
                      {MEETING_LINES[activeLine].speaker}
                    </span>
                    <span className={majestic ? 'text-xl text-white/40' : 'text-lg text-white/40'}>
                      :-
                    </span>
                    <span className={majestic ? 'text-xl text-white/70' : 'text-lg text-white/70'}>
                      {MEETING_LINES[activeLine].text}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {activeLine < 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <span className={majestic ? 'text-xl text-white/40' : 'text-lg text-white/40'}>
                    Waiting for meeting transcript...
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden"
        style={{
          boxShadow: majestic
            ? '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)'
            : '0 25px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div
          className="border-b border-white/10 flex items-center justify-between px-5 bg-[#0d0d0d]"
          style={{ height: majestic ? 56 : 48 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
              <span className="text-xs font-bold text-white">S</span>
            </div>
            <span className={majestic ? 'text-base text-white/65' : 'text-sm text-white/60'}>
              {arranged ? 'Board arranged' : 'Kanban Board'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-xs text-white/40">
              <span>Search</span>
              <span className="text-white/20">⌘K</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/10" />
          </div>
        </div>

        <div
          className={`flex overflow-x-auto ${compact ? 'gap-2.5 p-3' : 'gap-4 p-5'}`}
          style={{ minHeight: boardMinH }}
        >
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] flex flex-col flex-1"
              style={{
                minWidth: colMin,
                ...(fluidCols ? { flex: '1 1 0', width: 'auto' } : { width: colMin }),
              }}
            >
              <div
                className={`flex items-center justify-between ${compact ? 'px-3 pt-3 pb-2' : 'px-4 pt-4 pb-3'}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span
                    className={`font-semibold uppercase tracking-widest ${compact ? 'text-[10px]' : 'text-xs'}`}
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </span>
                </div>
                <span className="text-xs text-white/30 tabular-nums">{tickets[col.id].length}</span>
              </div>

              <div className={`flex flex-col gap-2 flex-1 ${compact ? 'px-2 pb-2' : 'px-3 pb-3'}`}>
                <AnimatePresence mode="popLayout">
                  {tickets[col.id].map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      layout
                      initial={arranged ? false : { opacity: 0, scale: 0.85, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="group rounded-lg border transition-colors"
                      style={{
                        borderColor:
                          ticket.correctColumn === col.id
                            ? 'rgba(34,197,94,0.2)'
                            : 'rgba(255,255,255,0.1)',
                        background:
                          ticket.correctColumn === col.id
                            ? 'rgba(34,197,94,0.04)'
                            : 'rgba(255,255,255,0.03)',
                        padding: compact ? '0.7rem 0.75rem' : majestic ? '1.1rem 1.15rem' : '1rem',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: PRIORITY_DOT[ticket.priority] ?? '#737373' }}
                        />
                        <span
                          className={
                            compact
                              ? 'text-[13px] text-white/90 font-medium leading-snug'
                              : majestic
                                ? 'text-base text-white/90 font-medium leading-snug'
                                : 'text-[15px] text-white/90 font-medium leading-snug'
                          }
                        >
                          {ticket.title}
                        </span>
                      </div>
                      <div
                        className={`flex items-center justify-between ${compact ? 'mt-1.5' : 'mt-2.5'}`}
                      >
                        <span className="text-[10px] text-white/30 font-mono">SYN-{ticket.id}</span>
                        {ticket.correctColumn === col.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isComplete && !compact && (
        <motion.div
          initial={arranged ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-5 text-center"
        >
          <p
            className={
              majestic
                ? 'text-sm text-white/50 font-medium tracking-wide'
                : 'text-xs text-emerald-400 font-medium'
            }
          >
            All meetings processed. Tickets arranged automatically.
          </p>
        </motion.div>
      )}
    </div>
  );
}
