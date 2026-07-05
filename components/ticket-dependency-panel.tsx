'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, AlertTriangle, ArrowRight, Link2, Pencil } from 'lucide-react';
import { useToast } from '@/components/island-toast';

type DependencyType = 'data' | 'structural' | 'logical' | 'resource';
type DependencyStrength = 'soft' | 'hard';

interface TicketDependency {
  id: string;
  ticket_id: string;
  depends_on_ticket_id: string;
  dependency_type: DependencyType;
  strength: DependencyStrength;
  note?: string | null;
  ignore_count: number;
  escalated: boolean;
}

interface ProjectTicket {
  id: string;
  title: string;
  status: string;
}

interface TicketDependencyPanelProps {
  ticketId: string;
  projectId?: string | null;
  projectTickets: ProjectTicket[];
}

const TYPE_LABELS: Record<DependencyType, string> = {
  data: 'Data',
  structural: 'Structural',
  logical: 'Logical',
  resource: 'Resource',
};

const STATUS_COLORS: Record<string, string> = {
  done: 'bg-green-100 text-green-800',
  in_progress: 'bg-primary/20 text-primary',
  blocked: 'bg-destructive/20 text-destructive',
  backlog: 'bg-muted text-muted-foreground',
};

export function TicketDependencyPanel({
  ticketId,
  projectId,
  projectTickets,
}: TicketDependencyPanelProps) {
  const [parents, setParents] = useState<TicketDependency[]>([]);
  const [children, setChildren] = useState<TicketDependency[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editingDepId, setEditingDepId] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const { showToast } = useToast();

  const [newDep, setNewDep] = useState({
    depends_on_ticket_id: '',
    dependency_type: 'logical' as DependencyType,
    strength: 'soft' as DependencyStrength,
    note: '',
  });
  const [editDep, setEditDep] = useState({
    dependency_type: 'logical' as DependencyType,
    strength: 'soft' as DependencyStrength,
    note: '',
  });

  const fetchDeps = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/dependencies`);
      if (!res.ok) return;
      const data = await res.json();
      setParents(data.parents ?? []);
      setChildren(data.children ?? []);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchDeps();
  }, [fetchDeps]);

  async function handleAddDep() {
    if (!newDep.depends_on_ticket_id) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depends_on_ticket_id: newDep.depends_on_ticket_id,
          dependency_type: newDep.dependency_type,
          strength: newDep.strength,
          note: newDep.note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data?.error ?? 'Failed to add dependency';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }
      setShowAddForm(false);
      setNewDep({
        depends_on_ticket_id: '',
        dependency_type: 'logical',
        strength: 'soft',
        note: '',
      });
      await fetchDeps();
      showToast('Dependency added', 'success');
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(dep: TicketDependency) {
    setEditingDepId(dep.id);
    setEditError(null);
    setEditDep({
      dependency_type: dep.dependency_type,
      strength: dep.strength,
      note: dep.note ?? '',
    });
    // Scroll to edit form after a short delay to let it render
    setTimeout(() => {
      const editForm = document.getElementById('dependency-edit-form');
      editForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  async function handleSaveEdit() {
    if (!editingDepId) return;
    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/dependencies/${editingDepId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dependency_type: editDep.dependency_type,
          strength: editDep.strength,
          note: editDep.note.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data?.error ?? 'Failed to update dependency';
        setEditError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }
      setEditingDepId(null);
      await fetchDeps();
      showToast('Dependency updated', 'success');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleRemove(depId: string) {
    setRemovingId(depId);
    try {
      await fetch(`/api/tickets/${ticketId}/dependencies/${depId}`, { method: 'DELETE' });
      await fetchDeps();
      showToast('Dependency removed', 'success');
    } finally {
      setRemovingId(null);
    }
  }

  const otherTickets = projectTickets.filter((t) => t.id !== ticketId);
  const usedParentIds = new Set(parents.map((d) => d.depends_on_ticket_id));
  // Also filter out children (tickets that depend on current) to prevent cycles
  const childrenIds = new Set(children.map((d) => d.ticket_id));
  const availableTickets = otherTickets.filter(
    (t) => !usedParentIds.has(t.id) && !childrenIds.has(t.id)
  );

  const ticketById = new Map(projectTickets.map((t) => [t.id, t]));

  if (!projectId) {
    return (
      <div className="rounded-none border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
        Dependencies are only available for project-linked tickets.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Link2 className="w-4 h-4 text-primary" />
          Dependencies
        </div>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      {parents.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
            Blocked by
          </p>
          {parents.map((dep) => {
            const parent = ticketById.get(dep.depends_on_ticket_id);
            return (
              <div
                key={dep.id}
                className="flex items-center justify-between gap-2 rounded-none border border-border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">
                    {parent?.title ?? dep.depends_on_ticket_id}
                  </span>
                  {parent && (
                    <Badge
                      className={`text-[10px] px-1.5 py-0 rounded-full shrink-0 ${STATUS_COLORS[parent.status] ?? STATUS_COLORS.backlog}`}
                    >
                      {parent.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    className={`text-[10px] px-1.5 py-0 rounded-full ${
                      dep.strength === 'hard' || dep.escalated
                        ? 'bg-destructive/15 text-destructive'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {dep.escalated ? 'escalated' : dep.strength}
                  </Badge>
                  <Badge className="text-[10px] px-1.5 py-0 rounded-full bg-primary/10 text-primary">
                    {TYPE_LABELS[dep.dependency_type]}
                  </Badge>
                  {dep.escalated && (
                    <AlertTriangle
                      className="w-3.5 h-3.5 text-amber-500"
                      aria-label="Auto-escalated to hard after repeated ignores"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(dep)}
                    className="rounded p-0.5 text-muted-foreground hover:text-primary"
                    aria-label="Edit dependency"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(dep.id)}
                    disabled={removingId === dep.id}
                    className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                    aria-label="Remove dependency"
                  >
                    {removingId === dep.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {children.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
            Blocking
          </p>
          {children.map((dep) => {
            const child = ticketById.get(dep.ticket_id);
            return (
              <div
                key={dep.id}
                className="flex items-center gap-2 rounded-none border border-border bg-background px-3 py-2"
              >
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 rotate-180" />
                <span className="text-sm text-foreground truncate">
                  {child?.title ?? dep.ticket_id}
                </span>
                {child && (
                  <Badge
                    className={`text-[10px] px-1.5 py-0 rounded-full ${STATUS_COLORS[child.status] ?? STATUS_COLORS.backlog}`}
                  >
                    {child.status.replace('_', ' ')}
                  </Badge>
                )}
                <Badge className="ml-auto text-[10px] px-1.5 py-0 rounded-full bg-primary/10 text-primary shrink-0">
                  {TYPE_LABELS[dep.dependency_type]}
                </Badge>
                <button
                  type="button"
                  onClick={() => openEdit(dep)}
                  className="rounded p-0.5 text-muted-foreground hover:text-primary"
                  aria-label="Edit dependency"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(dep.id)}
                  disabled={removingId === dep.id}
                  className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                  aria-label="Remove dependency"
                >
                  {removingId === dep.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {parents.length === 0 && children.length === 0 && !showAddForm && !loading && (
        <p className="text-xs text-muted-foreground">No dependencies yet.</p>
      )}

      {editingDepId && (
        <div
          id="dependency-edit-form"
          className="rounded-none border border-primary/20 bg-primary/5 p-3 space-y-3"
        >
          {(() => {
            const editingDep = [...parents, ...children].find((d) => d.id === editingDepId);
            const depTicket = editingDep
              ? ticketById.get(
                  parents.find((d) => d.id === editingDepId)?.depends_on_ticket_id ??
                    children.find((d) => d.id === editingDepId)?.ticket_id ??
                    ''
                )
              : null;
            const isParent = parents.some((d) => d.id === editingDepId);
            return (
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-foreground">
                  Editing {isParent ? 'dependency on' : 'dependent'}:
                </p>
                <span className="text-xs text-primary font-medium truncate">
                  {depTicket?.title ?? 'Unknown ticket'}
                </span>
              </div>
            );
          })()}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Type</label>
              <Select
                value={editDep.dependency_type}
                onValueChange={(value) =>
                  setEditDep((p) => ({ ...p, dependency_type: value as DependencyType }))
                }
              >
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logical">Logical</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="structural">Structural</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Strength</label>
              <Select
                value={editDep.strength}
                onValueChange={(value) =>
                  setEditDep((p) => ({ ...p, strength: value as DependencyStrength }))
                }
              >
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select strength" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft">Soft (advisory)</SelectItem>
                  <SelectItem value="hard">Hard (blocking)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Note (optional)</label>
            <Input
              value={editDep.note ?? ''}
              onChange={(e) => setEditDep((p) => ({ ...p, note: e.target.value }))}
              placeholder="Why this dependency exists"
              className="h-8 text-xs"
            />
          </div>

          {editError && <p className="text-xs text-destructive">{editError}</p>}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingDepId(null);
                setEditError(null);
              }}
              className="rounded-none text-xs h-7"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="rounded-none text-xs h-7 gap-1"
            >
              {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Save changes
            </Button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="rounded-none border border-primary/20 bg-primary/5 p-3 space-y-3">
          <p className="text-xs font-medium text-foreground">Add a dependency</p>

          {availableTickets.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No other tickets available in this project.
            </p>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  This ticket depends on
                </label>
                <Select
                  value={newDep.depends_on_ticket_id}
                  onValueChange={(value) =>
                    setNewDep((p) => ({ ...p, depends_on_ticket_id: value }))
                  }
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Select ticket…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTickets.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Type</label>
                  <Select
                    value={newDep.dependency_type}
                    onValueChange={(value) =>
                      setNewDep((p) => ({
                        ...p,
                        dependency_type: value as DependencyType,
                      }))
                    }
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logical">Logical</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Strength</label>
                  <Select
                    value={newDep.strength}
                    onValueChange={(value) =>
                      setNewDep((p) => ({ ...p, strength: value as DependencyStrength }))
                    }
                  >
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue placeholder="Select strength" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soft">Soft (advisory)</SelectItem>
                      <SelectItem value="hard">Hard (blocking)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Note (optional)</label>
                <Input
                  value={newDep.note ?? ''}
                  onChange={(e) => setNewDep((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Why this dependency exists"
                  className="h-8 text-xs"
                />
              </div>
            </>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setError(null);
              }}
              className="rounded-none text-xs h-7"
            >
              Cancel
            </Button>
            {availableTickets.length > 0 && (
              <Button
                type="button"
                size="sm"
                onClick={handleAddDep}
                disabled={submitting || !newDep.depends_on_ticket_id}
                className="rounded-none text-xs h-7 gap-1"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                Add dependency
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
