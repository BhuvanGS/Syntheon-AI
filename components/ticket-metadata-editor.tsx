'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Plus } from 'lucide-react';
import {
  PRIORITY_CONFIG,
  TYPE_CONFIG,
  ESTIMATE_CONFIG,
  type TicketPriority,
  type TicketType,
  type TicketEstimate,
} from '@/components/ticket-badges';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface TicketMetadataEditorProps {
  priority: TicketPriority;
  type: TicketType;
  estimate: TicketEstimate;
  labels: string[];
  timeEstimate?: number | null;
  timeSpent?: number | null;
  onPriorityChange: (p: TicketPriority) => void;
  onTypeChange: (t: TicketType) => void;
  onEstimateChange: (e: TicketEstimate) => void;
  onLabelsChange: (labels: string[]) => void;
  onTimeEstimateChange?: (h: number | null) => void;
  onTimeSpentChange?: (h: number | null) => void;
  availableLabels: Label[];
  onManageLabels?: () => void;
}

function FieldDropdown({
  label,
  current,
  children,
}: {
  label: string;
  current: string;
  children: (close: () => void) => React.ReactNode;
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
    <div ref={ref} className="relative app-field">
      <div className="app-field-head">
        <span className="app-field-label">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors hover:bg-white/[0.03]"
      >
        <span className="truncate text-left">{current}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-border bg-popover py-1 shadow-md max-h-[280px] overflow-y-auto">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function TicketMetadataEditor({
  priority,
  type,
  estimate,
  labels,
  timeEstimate,
  timeSpent,
  onPriorityChange,
  onTypeChange,
  onEstimateChange,
  onLabelsChange,
  onTimeEstimateChange,
  onTimeSpentChange,
  availableLabels,
  onManageLabels,
}: TicketMetadataEditorProps) {
  const [labelSearchOpen, setLabelSearchOpen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!labelSearchOpen) return;
    const handler = (e: MouseEvent) => {
      if (labelRef.current && !labelRef.current.contains(e.target as Node))
        setLabelSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [labelSearchOpen]);

  const selectedLabels = availableLabels.filter((l) => labels.includes(l.id));
  const unselectedLabels = availableLabels.filter((l) => !labels.includes(l.id));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Priority */}
        <FieldDropdown label="Priority" current={PRIORITY_CONFIG[priority].label}>
          {(close) => (
            <>
              {(Object.keys(PRIORITY_CONFIG) as TicketPriority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => {
                    onPriorityChange(p);
                    close();
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.06] ${
                    priority === p ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </>
          )}
        </FieldDropdown>

        <FieldDropdown label="Type" current={TYPE_CONFIG[type].label}>
          {(close) => (
            <>
              {(Object.keys(TYPE_CONFIG) as TicketType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    onTypeChange(t);
                    close();
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.06] ${
                    type === t ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </>
          )}
        </FieldDropdown>

        <FieldDropdown label="Estimate" current={ESTIMATE_CONFIG[estimate].label}>
          {(close) => (
            <>
              {(Object.keys(ESTIMATE_CONFIG) as TicketEstimate[]).map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => {
                    onEstimateChange(e);
                    close();
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.06] ${
                    estimate === e ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {ESTIMATE_CONFIG[e].label}
                </button>
              ))}
            </>
          )}
        </FieldDropdown>
      </div>

      {/* Time tracking */}
      {onTimeEstimateChange && onTimeSpentChange && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3">
            <span className="shrink-0 text-sm text-muted-foreground">Estimate (h)</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={timeEstimate ?? ''}
              onChange={(e) => onTimeEstimateChange(e.target.value ? Number(e.target.value) : null)}
              className="w-14 bg-transparent text-right text-xs font-medium text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>
          <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3">
            <span className="shrink-0 text-sm text-muted-foreground">Spent (h)</span>
            <input
              type="number"
              min={0}
              step={0.5}
              value={timeSpent ?? ''}
              onChange={(e) => onTimeSpentChange(e.target.value ? Number(e.target.value) : null)}
              className="w-14 bg-transparent text-right text-xs font-medium text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>
          <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3">
            <span className="shrink-0 text-sm text-muted-foreground">Remaining</span>
            <span
              className={`text-xs font-medium tabular-nums ${
                (timeEstimate ?? 0) - (timeSpent ?? 0) < 0 ? 'text-red-400' : 'text-foreground'
              }`}
            >
              {timeEstimate != null && timeSpent != null
                ? `${Math.max(0, timeEstimate - timeSpent)}h`
                : timeEstimate != null
                  ? `${timeEstimate}h`
                  : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Labels */}
      <div ref={labelRef} className="relative">
        <div className="flex min-h-10 items-center gap-2 flex-wrap rounded-lg border border-border bg-background px-3 py-2">
          {selectedLabels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: `${label.color}20`,
                color: label.color,
                border: `1px solid ${label.color}40`,
              }}
            >
              {label.name}
              <button
                type="button"
                onClick={() => onLabelsChange(labels.filter((id) => id !== label.id))}
                className="hover:opacity-70"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setLabelSearchOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add label
          </button>
          {onManageLabels && (
            <button
              type="button"
              onClick={onManageLabels}
              className="ml-auto text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              Manage
            </button>
          )}
        </div>

        {labelSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-popover border border-border rounded-xl shadow-lg py-1 max-h-[200px] overflow-y-auto">
            {unselectedLabels.length === 0 && availableLabels.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No labels available. {onManageLabels && 'Create some in Manage.'}
              </div>
            )}
            {unselectedLabels.length === 0 && availableLabels.length > 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">All labels selected</div>
            )}
            {unselectedLabels.map((label) => (
              <button
                type="button"
                key={label.id}
                onClick={() => {
                  onLabelsChange([...labels, label.id]);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors"
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                {label.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
