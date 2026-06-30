'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Pencil, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelManagerProps {
  open: boolean;
  onClose: () => void;
  labels: Label[];
  onRefresh: () => void;
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#6b7280',
  '#a855f7',
];

export function LabelManager({ open, onClose, labels, onRefresh }: LabelManagerProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const newNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) newNameRef.current?.focus();
  }, [creating]);

  if (!open) return null;

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      });
      setNewName('');
      setNewColor(PRESET_COLORS[0]);
      setCreating(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/labels/${id}`, { method: 'DELETE' });
    onRefresh();
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    await fetch(`/api/labels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), color: editColor }),
    });
    setEditingId(null);
    onRefresh();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/60">
          <h3 className="font-playfair text-lg font-bold text-foreground">Manage Labels</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {labels.length === 0 && !creating && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No labels yet. Create one to start organizing tickets.
            </p>
          )}

          {labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30"
            >
              {editingId === label.id ? (
                <>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="h-6 w-6 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-xs flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(label.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <button
                    onClick={() => handleSaveEdit(label.id)}
                    className="text-primary hover:bg-primary/10 p-1 rounded"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm text-foreground flex-1">{label.name}</span>
                  <button
                    onClick={() => {
                      setEditingId(label.id);
                      setEditName(label.name);
                      setEditColor(label.color);
                    }}
                    className="text-muted-foreground hover:text-foreground p-1 rounded"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(label.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}

          {creating && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-6 w-6 rounded cursor-pointer border border-border"
              />
              <Input
                ref={newNameRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Label name…"
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setCreating(false);
                }}
              />
              <button
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="text-primary hover:bg-primary/10 p-1 rounded disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => setCreating(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Color presets when creating */}
          {creating && (
            <div className="flex items-center gap-1.5 flex-wrap px-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    newColor === c ? 'ring-2 ring-offset-1 ring-foreground scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border/60">
          {!creating && (
            <Button
              onClick={() => setCreating(true)}
              variant="outline"
              className="w-full rounded-full gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New label
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
