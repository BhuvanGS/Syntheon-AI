'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  X,
  CheckSquare,
  Trash2,
  Tag,
  UserPlus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import {
  PRIORITY_CONFIG,
  TYPE_CONFIG,
  ESTIMATE_CONFIG,
  type TicketPriority,
  type TicketType,
  type TicketEstimate,
} from '@/components/ticket-badges';

interface BulkActionBarProps {
  selectedIds: string[];
  totalCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  onBulkUpdate: (updates: Record<string, unknown>) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  labels: { id: string; name: string; color: string }[];
  statuses: { key: string; label: string }[];
}

function BulkDropdown({
  label,
  children,
}: {
  label: string;
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
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-foreground hover:bg-muted/60 transition-colors border border-border"
      >
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] bg-popover border border-border rounded-lg shadow-lg py-1 max-h-[300px] overflow-y-auto">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function BulkActionBar({
  selectedIds,
  totalCount,
  onSelectAll,
  onClear,
  onBulkUpdate,
  onBulkDelete,
  labels,
  statuses,
}: BulkActionBarProps) {
  const [applying, setApplying] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleUpdate = async (updates: Record<string, unknown>) => {
    setApplying(true);
    try {
      await onBulkUpdate(updates);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">
          {selectedIds.length} of {totalCount} selected
        </span>
        {selectedIds.length < totalCount && (
          <button
            onClick={onSelectAll}
            className="text-xs text-primary hover:underline font-medium"
          >
            Select all ({totalCount})
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-border" />

      <div className="flex items-center gap-2 flex-wrap">
        {/* Status */}
        <BulkDropdown label="Status">
          {(close) => (
            <>
              {statuses.map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    handleUpdate({ status: s.key });
                    close();
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors capitalize"
                >
                  {s.label}
                </button>
              ))}
            </>
          )}
        </BulkDropdown>

        {/* Priority */}
        <BulkDropdown label="Priority">
          {(close) => (
            <>
              {(Object.keys(PRIORITY_CONFIG) as TicketPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    handleUpdate({ priority: p });
                    close();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors"
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: PRIORITY_CONFIG[p].color }}
                  />
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </>
          )}
        </BulkDropdown>

        {/* Type */}
        <BulkDropdown label="Type">
          {(close) => (
            <>
              {(Object.keys(TYPE_CONFIG) as TicketType[]).map((t) => {
                const config = TYPE_CONFIG[t];
                const Icon = config.icon;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      handleUpdate({ type: t });
                      close();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                    {config.label}
                  </button>
                );
              })}
            </>
          )}
        </BulkDropdown>

        {/* Estimate */}
        <BulkDropdown label="Estimate">
          {(close) => (
            <>
              {(Object.keys(ESTIMATE_CONFIG) as TicketEstimate[]).map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    handleUpdate({ estimate: e });
                    close();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/60 transition-colors"
                >
                  <span className="text-[8px] tracking-tighter">{ESTIMATE_CONFIG[e].symbol}</span>
                  {ESTIMATE_CONFIG[e].label}
                </button>
              ))}
            </>
          )}
        </BulkDropdown>

        {/* Labels */}
        <BulkDropdown label="Labels">
          {(close) => (
            <>
              {labels.length === 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">No labels yet</div>
              )}
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => {
                    handleUpdate({ addLabel: label.id });
                    close();
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
            </>
          )}
        </BulkDropdown>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {applying && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        {confirmingDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-destructive font-medium">
              Delete {selectedIds.length} tickets?
            </span>
            <button
              onClick={async () => {
                setApplying(true);
                try {
                  await onBulkDelete();
                  setConfirmingDelete(false);
                } finally {
                  setApplying(false);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-white bg-destructive hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Confirm
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
        <div className="w-px h-5 bg-border" />
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
}
