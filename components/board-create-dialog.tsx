'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type BoardColumnDraft = {
  key: string;
  label: string;
  color: string;
  stageType: 'backlog' | 'in_progress' | 'done' | 'blocked';
};

export type BoardColumnResult = {
  id: string;
  label: string;
  color: string;
  status: string;
};

const COLUMN_COLORS = [
  '#64748b',
  '#3b82f6',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#a855f7',
  '#ec4899',
];

const STAGE_OPTIONS = [
  { value: 'backlog' as const, label: 'Backlog', color: '#f59e0b' },
  { value: 'in_progress' as const, label: 'In Progress', color: '#3b82f6' },
  { value: 'done' as const, label: 'Done', color: '#10b981' },
  { value: 'blocked' as const, label: 'Blocked', color: '#ef4444' },
];

function newKey() {
  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function defaultDrafts(): BoardColumnDraft[] {
  return [
    { key: newKey(), label: 'To Do', color: '#64748b', stageType: 'backlog' },
    { key: newKey(), label: 'In Progress', color: '#3b82f6', stageType: 'in_progress' },
    { key: newKey(), label: 'Done', color: '#22c55e', stageType: 'done' },
  ];
}

function emptyDraft(color = '#64748b'): BoardColumnDraft {
  return { key: newKey(), label: '', color, stageType: 'backlog' };
}

interface BoardCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (columns: BoardColumnResult[]) => void;
}

export function BoardCreateDialog({ open, onOpenChange, onCreate }: BoardCreateDialogProps) {
  const [drafts, setDrafts] = useState<BoardColumnDraft[]>(defaultDrafts);

  useEffect(() => {
    if (open) setDrafts(defaultDrafts());
  }, [open]);

  const validCount = drafts.filter((d) => d.label.trim()).length;
  const canCreate = validCount > 0;

  function updateDraft(key: string, patch: Partial<BoardColumnDraft>) {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function addColumn() {
    const nextColor = COLUMN_COLORS[drafts.length % COLUMN_COLORS.length];
    setDrafts((prev) => [...prev, emptyDraft(nextColor)]);
  }

  function removeColumn(key: string) {
    setDrafts((prev) => (prev.length <= 1 ? prev : prev.filter((d) => d.key !== key)));
  }

  function handleCreate() {
    const columns = drafts
      .filter((d) => d.label.trim())
      .map((d, i) => ({
        id: `stage-${Date.now().toString(36)}-${i}`,
        label: d.label.trim(),
        color: d.color,
        status: d.stageType,
      }));
    if (columns.length === 0) return;
    onCreate(columns);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-border bg-background p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 space-y-2 border-b border-border px-6 py-5 text-left sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
              <LayoutGrid className="h-5 w-5 text-foreground/80" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                Create your board
              </DialogTitle>
              <DialogDescription className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Set up the columns work will move through. Add as many as you need — you can edit
                them later.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-4">
            {drafts.map((draft, index) => (
              <div key={draft.key} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Column {index + 1}
                  </p>
                  {drafts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColumn(draft.key)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-red-400"
                      aria-label={`Remove column ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
                  <div className="app-field">
                    <div className="app-field-head">
                      <label className="app-field-label" htmlFor={`col-name-${draft.key}`}>
                        Column name
                      </label>
                    </div>
                    <Input
                      id={`col-name-${draft.key}`}
                      value={draft.label}
                      onChange={(e) => updateDraft(draft.key, { label: e.target.value })}
                      placeholder="e.g. To Do, Review, Done"
                      className="bg-background"
                      autoFocus={index === 0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (index === drafts.length - 1) addColumn();
                        }
                      }}
                    />
                  </div>

                  <div className="app-field">
                    <div className="app-field-head">
                      <label className="app-field-label">Color</label>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {COLUMN_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateDraft(draft.key, { color })}
                          className={cn(
                            'h-7 w-7 rounded-full transition-transform',
                            draft.color === color
                              ? 'scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background'
                              : 'hover:scale-110'
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="app-field mt-5">
                  <div className="app-field-head">
                    <label className="app-field-label">Set stage as</label>
                    <p className="app-field-hint">
                      Maps this column to a system status for analytics.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STAGE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateDraft(draft.key, { stageType: opt.value })}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          draft.stageType === opt.value
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                        )}
                      >
                        <span
                          className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                          style={{ backgroundColor: opt.color }}
                        />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addColumn}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 py-3.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:bg-white/[0.03] hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add another column
          </button>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate}
            className="rounded-full gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Create board{validCount > 0 ? ` · ${validCount}` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
