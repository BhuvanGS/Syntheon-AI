'use client';

import { useMemo } from 'react';
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isWeekend,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Milestone, Layers, Flag } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface RoadmapTicket {
  id: string;
  title: string;
  status?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  isGroup?: boolean;
  milestoneId?: string | null;
  dependency_ticket_id?: string | null;
}

interface RoadmapMilestone {
  id: string;
  name: string;
  due_date?: string | null;
  status: string;
}

interface RoadmapViewProps {
  tickets: RoadmapTicket[];
  milestones: RoadmapMilestone[];
  onTicketClick?: (ticket: RoadmapTicket) => void;
  onMilestoneClick?: (milestone: RoadmapMilestone) => void;
}

const DAY_WIDTH = 40;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 56;
const RAIL_WIDTH = 280;

function safeParse(d?: string | null): Date | null {
  if (!d) return null;
  try {
    const parsed = parseISO(d);
    if (isNaN(parsed.getTime())) return null;
    return startOfDay(parsed);
  } catch {
    return null;
  }
}

const STATUS_COLORS: Record<string, string> = {
  backlog: 'bg-muted text-muted-foreground border-dashed border-foreground/25',
  todo: 'bg-foreground/15 text-foreground border border-foreground/25',
  in_progress: 'bg-foreground text-background',
  in_review: 'bg-foreground/55 text-background',
  done: 'bg-foreground/20 text-foreground/60',
  blocked: 'bg-destructive text-destructive-foreground',
};

const MILESTONE_COLORS: Record<string, string> = {
  planned: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
};

export function RoadmapView({
  tickets,
  milestones,
  onTicketClick,
  onMilestoneClick,
}: RoadmapViewProps) {
  const [anchor, setAnchor] = useState(() => startOfMonth(new Date()));
  const today = startOfDay(new Date());

  const rangeStart = useMemo(() => subMonths(anchor, 1), [anchor]);
  const rangeEnd = useMemo(() => addMonths(anchor, 3), [anchor]);
  const days = useMemo(
    () => eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    [rangeStart, rangeEnd]
  );
  const totalWidth = days.length * DAY_WIDTH;

  // Group tickets: groups/parents with children, then standalone tickets with dates
  const { groupRows, standaloneRows } = useMemo(() => {
    const childrenByParent = new Map<string, RoadmapTicket[]>();
    for (const t of tickets) {
      if (t.dependency_ticket_id) {
        const arr = childrenByParent.get(t.dependency_ticket_id) ?? [];
        arr.push(t);
        childrenByParent.set(t.dependency_ticket_id, arr);
      }
    }

    const groupRows: {
      parent: RoadmapTicket;
      children: RoadmapTicket[];
      start: Date;
      end: Date;
    }[] = [];
    const standaloneRows: { ticket: RoadmapTicket; start: Date; end: Date }[] = [];

    for (const t of tickets) {
      if (t.dependency_ticket_id) continue; // skip children, they're shown inside groups
      const children = childrenByParent.get(t.id) ?? [];
      const isGroup = t.isGroup || children.length > 0;

      const allDates = [t, ...children]
        .map((x) => [safeParse(x.start_date), safeParse(x.due_date)])
        .flat()
        .filter((d): d is Date => d !== null);

      if (allDates.length === 0) continue;

      const start = allDates.reduce((min, d) => (d < min ? d : min));
      const end = allDates.reduce((max, d) => (d > max ? d : max));

      if (isGroup) {
        groupRows.push({ parent: t, children, start, end });
      } else {
        standaloneRows.push({ ticket: t, start, end });
      }
    }

    groupRows.sort((a, b) => a.start.getTime() - b.start.getTime());
    standaloneRows.sort((a, b) => a.start.getTime() - b.start.getTime());

    return { groupRows, standaloneRows };
  }, [tickets]);

  // Milestones with dates
  const datedMilestones = useMemo(() => {
    return milestones
      .map((m) => ({ ...m, date: safeParse(m.due_date) }))
      .filter((m): m is RoadmapMilestone & { date: Date } => m.date !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [milestones]);

  const totalRows = groupRows.length + standaloneRows.length + (datedMilestones.length > 0 ? 1 : 0);

  // Month bands
  const monthBands: { label: string; startIdx: number; days: number }[] = [];
  days.forEach((d, i) => {
    const last = monthBands[monthBands.length - 1];
    const label = format(d, 'MMMM yyyy');
    if (!last || last.label !== label) {
      monthBands.push({ label, startIdx: i, days: 1 });
    } else {
      last.days += 1;
    }
  });

  if (groupRows.length === 0 && standaloneRows.length === 0 && datedMilestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Milestone className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground mb-1">No roadmap data yet.</p>
        <p className="text-xs text-muted-foreground/70">
          Add due dates to tickets and milestones to see them on the timeline.
        </p>
      </div>
    );
  }

  const goPrev = () => setAnchor((d) => subMonths(d, 1));
  const goNext = () => setAnchor((d) => addMonths(d, 1));
  const goToday = () => setAnchor(startOfMonth(new Date()));

  function renderBar(start: Date, end: Date, rowIdx: number) {
    const startOffset = differenceInCalendarDays(start, rangeStart);
    const lengthDays = differenceInCalendarDays(end, start) + 1;
    const left = startOffset * DAY_WIDTH;
    const width = Math.max(lengthDays * DAY_WIDTH - 4, DAY_WIDTH - 4);
    return { left, width };
  }

  let currentRow = 0;

  return (
    <div className="flex flex-col h-full bg-background border border-border rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={goPrev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="h-8 px-3 text-xs font-medium"
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={goNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-3 text-sm font-semibold text-foreground tabular-nums">
            {format(anchor, 'MMMM yyyy')}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3 w-3" /> Groups
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flag className="h-3 w-3" /> Milestones
          </span>
        </div>
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-auto">
        <div className="relative" style={{ width: RAIL_WIDTH + totalWidth, minWidth: '100%' }}>
          {/* Header */}
          <div
            className="sticky top-0 z-30 flex bg-card/95 backdrop-blur-sm border-b border-border"
            style={{ height: HEADER_HEIGHT }}
          >
            <div
              className="sticky left-0 z-10 flex items-center px-4 border-r border-border bg-card/95 backdrop-blur-sm"
              style={{ width: RAIL_WIDTH, minWidth: RAIL_WIDTH, height: HEADER_HEIGHT }}
            >
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                Roadmap · {groupRows.length + standaloneRows.length} items
              </span>
            </div>
            <div className="relative" style={{ width: totalWidth, height: HEADER_HEIGHT }}>
              <div className="absolute top-0 left-0 right-0 h-7 flex">
                {monthBands.map((band) => (
                  <div
                    key={band.label + band.startIdx}
                    className="border-r border-border/50 px-2 flex items-center"
                    style={{ width: band.days * DAY_WIDTH }}
                  >
                    <span className="text-xs font-semibold text-foreground tabular-nums">
                      {band.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute top-7 left-0 right-0 bottom-0 flex">
                {days.map((d, i) => {
                  const isToday = isSameDay(d, today);
                  const weekend = isWeekend(d);
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex flex-col items-center justify-center text-[10px] tabular-nums border-r',
                        weekend && 'bg-muted/40',
                        isToday && 'bg-primary/10',
                        'border-border/40'
                      )}
                      style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}
                    >
                      <span
                        className={cn(
                          'font-medium',
                          isToday ? 'text-primary font-bold' : 'text-muted-foreground'
                        )}
                      >
                        {format(d, 'd')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Today line */}
          {(() => {
            const offset = differenceInCalendarDays(today, rangeStart);
            if (offset < 0) return null;
            const left = RAIL_WIDTH + offset * DAY_WIDTH + DAY_WIDTH / 2;
            return (
              <div
                className="pointer-events-none absolute top-0 bottom-0 z-10 flex flex-col items-center"
                style={{ left, transform: 'translateX(-50%)' }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-primary -mt-1 ring-4 ring-background shadow-md" />
                <div className="w-px flex-1 bg-primary/60" />
              </div>
            );
          })()}

          {/* Milestone row */}
          {datedMilestones.length > 0 && (
            <div
              className="flex border-b border-border/60 bg-muted/20"
              style={{ height: ROW_HEIGHT + 8 }}
            >
              <div
                className="sticky left-0 z-20 flex items-center px-4 border-r border-border bg-muted/20"
                style={{ width: RAIL_WIDTH, minWidth: RAIL_WIDTH }}
              >
                <Flag className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
                <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                  Milestones
                </span>
              </div>
              <div className="relative" style={{ width: totalWidth, height: ROW_HEIGHT + 8 }}>
                {datedMilestones.map((m) => {
                  const offset = differenceInCalendarDays(m.date, rangeStart);
                  if (offset < 0 || offset > days.length) return null;
                  const left = offset * DAY_WIDTH + DAY_WIDTH / 2;
                  const isOverdue = m.date < today && m.status !== 'completed';
                  return (
                    <div
                      key={m.id}
                      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                      style={{ left, transform: 'translateX(-50%) translateY(-50%)' }}
                      onClick={() => onMilestoneClick?.(m)}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rotate-45 border-2 border-background shadow-md group-hover:scale-125 transition-transform',
                          MILESTONE_COLORS[m.status] ?? MILESTONE_COLORS.planned,
                          isOverdue && 'ring-2 ring-red-500/50'
                        )}
                      />
                      <span
                        className={cn(
                          'absolute top-full mt-1 text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded bg-background border border-border/60 shadow-sm',
                          isOverdue ? 'text-red-500' : 'text-foreground'
                        )}
                      >
                        {m.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group rows */}
          {groupRows.map(({ parent, children, start, end }) => {
            const rowIdx = currentRow++;
            const { left, width } = renderBar(start, end, rowIdx);
            const done = children.filter((c) => c.status === 'done').length;
            const total = children.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div
                key={parent.id}
                className={cn(
                  'flex border-b border-border/60 group/row',
                  rowIdx % 2 === 1 && 'bg-muted/20'
                )}
                style={{ height: ROW_HEIGHT }}
              >
                <button
                  onClick={() => onTicketClick?.(parent)}
                  className="sticky left-0 z-20 flex items-center gap-2 px-4 border-r border-border text-left bg-background/95 backdrop-blur-sm hover:bg-accent"
                  style={{ width: RAIL_WIDTH, minWidth: RAIL_WIDTH, height: ROW_HEIGHT }}
                >
                  <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {parent.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {total > 0 ? `${done}/${total} done · ${pct}%` : 'No children'}
                    </p>
                  </div>
                </button>
                <div
                  className="relative shrink-0"
                  style={{ width: totalWidth, height: ROW_HEIGHT }}
                >
                  <div className="absolute inset-0 flex pointer-events-none">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className={cn(
                          'border-r',
                          isWeekend(d) && 'bg-muted/30',
                          'border-border/30'
                        )}
                        style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => onTicketClick?.(parent)}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 rounded-lg px-3 flex items-center gap-2 text-xs font-medium shadow-sm hover:shadow-md transition-all',
                      STATUS_COLORS[parent.status ?? 'backlog'] ?? STATUS_COLORS.backlog
                    )}
                    style={{ left, width, height: ROW_HEIGHT - 12 }}
                  >
                    <span className="truncate">{parent.title}</span>
                    {total > 0 && <span className="text-[10px] opacity-70 shrink-0">{pct}%</span>}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Standalone ticket rows */}
          {standaloneRows.map(({ ticket, start, end }) => {
            const rowIdx = currentRow++;
            const { left, width } = renderBar(start, end, rowIdx);
            return (
              <div
                key={ticket.id}
                className={cn(
                  'flex border-b border-border/60 group/row',
                  rowIdx % 2 === 1 && 'bg-muted/20'
                )}
                style={{ height: ROW_HEIGHT }}
              >
                <button
                  onClick={() => onTicketClick?.(ticket)}
                  className="sticky left-0 z-20 flex items-center gap-2 px-4 border-r border-border text-left bg-background/95 backdrop-blur-sm hover:bg-accent"
                  style={{ width: RAIL_WIDTH, minWidth: RAIL_WIDTH, height: ROW_HEIGHT }}
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      ticket.status === 'done'
                        ? 'bg-green-500'
                        : ticket.status === 'blocked'
                          ? 'bg-red-500'
                          : ticket.status === 'in_progress'
                            ? 'bg-blue-500'
                            : 'bg-muted-foreground/40'
                    )}
                  />
                  <span className="text-[13px] font-medium text-foreground truncate flex-1 min-w-0">
                    {ticket.title}
                  </span>
                </button>
                <div
                  className="relative shrink-0"
                  style={{ width: totalWidth, height: ROW_HEIGHT }}
                >
                  <div className="absolute inset-0 flex pointer-events-none">
                    {days.map((d, i) => (
                      <div
                        key={i}
                        className={cn(
                          'border-r',
                          isWeekend(d) && 'bg-muted/30',
                          'border-border/30'
                        )}
                        style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => onTicketClick?.(ticket)}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 rounded-full px-3 flex items-center text-xs font-medium shadow-sm hover:shadow-md transition-all',
                      STATUS_COLORS[ticket.status ?? 'backlog'] ?? STATUS_COLORS.backlog
                    )}
                    style={{ left, width, height: ROW_HEIGHT - 16 }}
                  >
                    <span className="truncate">{ticket.title}</span>
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ height: 16 }} />
        </div>
      </div>
    </div>
  );
}
