'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  PRIORITY_CONFIG,
  TYPE_CONFIG,
  ESTIMATE_CONFIG,
  TicketBadges,
  type TicketPriority,
  type TicketType,
  type TicketEstimate,
} from '@/components/ticket-badges';
import { EMPTY_FILTERS, type TicketFilters } from '@/components/ticket-filter-bar';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
  labels: { id: string; name: string; color: string }[];
  statuses: { key: string; label: string }[];
  tickets: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority?: TicketPriority;
    type?: TicketType;
    estimate?: TicketEstimate;
    labels?: string[];
    assignee?: string | null;
    due_date?: string | null;
  }[];
}

function Dropdown({
  label,
  active,
  children,
  onClear,
}: {
  label: string;
  active: boolean;
  children: (close: () => void) => React.ReactNode;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full justify-between ${
          active
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
        }`}
      >
        {label}
        <ChevronDown className="h-4 w-4 shrink-0" />
      </button>
      {active && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute right-10 top-2.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 min-w-[200px] bg-popover border border-border rounded-lg shadow-lg py-1.5 max-h-[300px] overflow-y-auto">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  onChange,
  labels,
  statuses,
  tickets,
}: FilterDialogProps) {
  const activeCount =
    (filters.status ? 1 : 0) +
    (filters.priority ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.estimate ? 1 : 0) +
    filters.labelIds.length +
    (filters.assignee !== 'all' ? 1 : 0) +
    (filters.dueDate !== 'all' ? 1 : 0);

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (filters.status) result = result.filter((t) => t.status === filters.status);
    if (filters.priority)
      result = result.filter((t) => (t.priority ?? 'none') === filters.priority);
    if (filters.type) result = result.filter((t) => (t.type ?? 'task') === filters.type);
    if (filters.estimate)
      result = result.filter((t) => (t.estimate ?? 'none') === filters.estimate);
    if (filters.labelIds.length > 0) {
      result = result.filter((t) => {
        const tLabels = t.labels ?? [];
        return filters.labelIds.some((id) => tLabels.includes(id));
      });
    }
    if (filters.assignee === 'unassigned') result = result.filter((t) => !t.assignee);
    else if (filters.assignee === 'mine') result = result.filter((t) => t.assignee);
    if (filters.dueDate !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      result = result.filter((t) => {
        if (!t.due_date) return filters.dueDate === 'none';
        const d = new Date(t.due_date);
        const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (filters.dueDate === 'overdue') return dDay < today;
        if (filters.dueDate === 'today') return dDay.getTime() === today.getTime();
        if (filters.dueDate === 'this_week') {
          const dayOfWeek = today.getDay();
          const monday = new Date(today);
          monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          return dDay >= monday && dDay <= sunday;
        }
        if (filters.dueDate === 'none') return false;
        return true;
      });
    }
    return result;
  }, [tickets, filters]);

  const labelMap = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    for (const l of labels) map[l.id] = { name: l.name, color: l.color };
    return map;
  }, [labels]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl border-border bg-background p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Filter tickets</DialogTitle>
        <div className="flex h-[70vh]">
          {/* Left pane — filter parameters */}
          <div className="w-[340px] shrink-0 border-r border-border flex flex-col">
            <div className="px-4 py-3.5 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Filters</span>
                {activeCount > 0 && (
                  <span className="bg-primary/10 text-primary rounded-full px-2 text-xs font-bold">
                    {activeCount}
                  </span>
                )}
              </div>
              {activeCount > 0 && (
                <button
                  onClick={() => onChange({ ...EMPTY_FILTERS })}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Assignee filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Assignee
                </label>
                <div className="flex gap-1.5">
                  {(
                    [
                      { key: 'all', label: 'All' },
                      { key: 'mine', label: 'Mine' },
                      { key: 'unassigned', label: 'Unassigned' },
                    ] as const
                  ).map((a) => (
                    <button
                      key={a.key}
                      onClick={() => onChange({ ...filters, assignee: a.key })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        filters.assignee === a.key
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <Dropdown
                label="Status"
                active={!!filters.status}
                onClear={() => onChange({ ...filters, status: null })}
              >
                {(close) => (
                  <>
                    {statuses.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => {
                          onChange({ ...filters, status: s.key });
                          close();
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors ${
                          filters.status === s.key ? 'text-primary font-medium' : 'text-foreground'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </>
                )}
              </Dropdown>

              {/* Priority filter */}
              <Dropdown
                label="Priority"
                active={!!filters.priority}
                onClear={() => onChange({ ...filters, priority: null })}
              >
                {(close) => (
                  <>
                    {(Object.keys(PRIORITY_CONFIG) as TicketPriority[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          onChange({ ...filters, priority: p });
                          close();
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors ${
                          filters.priority === p ? 'text-primary font-medium' : 'text-foreground'
                        }`}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: PRIORITY_CONFIG[p].color }}
                        />
                        {PRIORITY_CONFIG[p].label}
                      </button>
                    ))}
                  </>
                )}
              </Dropdown>

              {/* Type filter */}
              <Dropdown
                label="Type"
                active={!!filters.type}
                onClear={() => onChange({ ...filters, type: null })}
              >
                {(close) => (
                  <>
                    {(Object.keys(TYPE_CONFIG) as TicketType[]).map((t) => {
                      const config = TYPE_CONFIG[t];
                      const Icon = config.icon;
                      return (
                        <button
                          key={t}
                          onClick={() => {
                            onChange({ ...filters, type: t });
                            close();
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors ${
                            filters.type === t ? 'text-primary font-medium' : 'text-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" style={{ color: config.color }} />
                          {config.label}
                        </button>
                      );
                    })}
                  </>
                )}
              </Dropdown>

              {/* Estimate filter */}
              <Dropdown
                label="Estimate"
                active={!!filters.estimate}
                onClear={() => onChange({ ...filters, estimate: null })}
              >
                {(close) => (
                  <>
                    {(Object.keys(ESTIMATE_CONFIG) as TicketEstimate[]).map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          onChange({ ...filters, estimate: e });
                          close();
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors ${
                          filters.estimate === e ? 'text-primary font-medium' : 'text-foreground'
                        }`}
                      >
                        <span className="text-[10px] tracking-tighter">
                          {ESTIMATE_CONFIG[e].symbol}
                        </span>
                        {ESTIMATE_CONFIG[e].label}
                      </button>
                    ))}
                  </>
                )}
              </Dropdown>

              {/* Label filter */}
              <Dropdown
                label="Labels"
                active={filters.labelIds.length > 0}
                onClear={() => onChange({ ...filters, labelIds: [] })}
              >
                {(close) => (
                  <>
                    {labels.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No labels yet</div>
                    )}
                    {labels.map((label) => {
                      const selected = filters.labelIds.includes(label.id);
                      return (
                        <button
                          key={label.id}
                          onClick={() => {
                            if (selected) {
                              onChange({
                                ...filters,
                                labelIds: filters.labelIds.filter((id) => id !== label.id),
                              });
                            } else {
                              onChange({ ...filters, labelIds: [...filters.labelIds, label.id] });
                            }
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/60 transition-colors ${
                            selected ? 'text-primary font-medium' : 'text-foreground'
                          }`}
                        >
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          {label.name}
                          {selected && <X className="h-3.5 w-3.5 ml-auto" />}
                        </button>
                      );
                    })}
                    <button
                      onClick={close}
                      className="w-full text-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground border-t border-border mt-1"
                    >
                      Done
                    </button>
                  </>
                )}
              </Dropdown>

              {/* Due date filter */}
              <Dropdown
                label="Due date"
                active={filters.dueDate !== 'all'}
                onClear={() => onChange({ ...filters, dueDate: 'all' })}
              >
                {(close) => (
                  <>
                    {(
                      [
                        { key: 'all', label: 'All dates' },
                        { key: 'overdue', label: 'Overdue' },
                        { key: 'today', label: 'Due today' },
                        { key: 'this_week', label: 'Due this week' },
                        { key: 'none', label: 'No due date' },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.key}
                        onClick={() => {
                          onChange({ ...filters, dueDate: d.key });
                          close();
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors ${
                          filters.dueDate === d.key ? 'text-primary font-medium' : 'text-foreground'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </>
                )}
              </Dropdown>
            </div>
          </div>

          {/* Right pane — filtered tickets preview */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3.5 border-b border-border/60 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
              </span>
              <button
                onClick={() => onOpenChange(false)}
                className="text-sm text-primary hover:underline font-medium"
              >
                Done
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <Filter className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    No tickets match these filters
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting or clearing some filters.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => onOpenChange(false)}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <TicketBadges
                          priority={ticket.priority ?? 'none'}
                          type={ticket.type ?? 'task'}
                          estimate={ticket.estimate ?? 'none'}
                          labels={ticket.labels ?? []}
                          labelMap={labelMap}
                        />
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {ticket.title}
                      </p>
                      {ticket.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {ticket.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        {ticket.assignee && (
                          <span className="text-xs text-muted-foreground">@{ticket.assignee}</span>
                        )}
                        {ticket.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Due {new Date(ticket.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
