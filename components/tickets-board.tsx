'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Clock, CheckCircle, AlertCircle, Circle, Pencil } from 'lucide-react';

type TicketStatus = 'backlog' | 'in_progress' | 'done' | 'blocked';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  assignee?: string | null;
  projectId?: string | null;
  meeting_id: string | null;
}

interface Meeting {
  id: string;
  projectName: string;
}

interface TicketsBoardProps {
  onSelectMeeting: (meetingId: string) => void;
  onSelectProject: (projectId: string) => void;
  onSaved?: () => Promise<void> | void;
}

export function TicketsBoard({ onSelectMeeting, onSelectProject, onSaved }: TicketsBoardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TicketStatus | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, TicketStatus>>({});
  const [originalStatusById, setOriginalStatusById] = useState<Record<string, TicketStatus>>({});
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [ticketEditForm, setTicketEditForm] = useState({
    title: '',
    description: '',
    assignee: '',
    status: 'backlog' as TicketStatus,
  });
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [ticketsRes, meetingsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/meetings'),
      ]);
      const [ticketsData, meetingsData] = await Promise.all([
        ticketsRes.json(),
        meetingsRes.json(),
      ]);
      setTickets(ticketsData);
      setMeetings(meetingsData);
      setOriginalStatusById(
        (ticketsData as Ticket[]).reduce<Record<string, TicketStatus>>((acc, ticket) => {
          acc[ticket.id] = ticket.status;
          return acc;
        }, {})
      );
      setPendingChanges({});
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  function openTicketEditor(ticket: Ticket) {
    setTicketToEdit(ticket);
    setTicketEditForm({
      title: ticket.title,
      description: ticket.description || '',
      assignee: ticket.assignee || '',
      status: ticket.status,
    });
  }

  async function handleSaveTicketEdit() {
    if (!ticketToEdit) return;

    setUpdatingTicketId(ticketToEdit.id);
    try {
      const res = await fetch(`/api/tickets/${ticketToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticketEditForm.title.trim(),
          description: ticketEditForm.description.trim(),
          assignee: ticketEditForm.assignee.trim() || null,
          status: ticketEditForm.status,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update ticket');
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketToEdit.id
            ? {
                ...ticket,
                title: ticketEditForm.title.trim(),
                description: ticketEditForm.description.trim(),
                assignee: ticketEditForm.assignee.trim() || null,
                status: ticketEditForm.status,
              }
            : ticket
        )
      );
      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[ticketToEdit.id];
        return next;
      });
      setOriginalStatusById((prev) => ({
        ...prev,
        [ticketToEdit.id]: ticketEditForm.status,
      }));

      setTicketToEdit(null);
      await onSaved?.();
    } finally {
      setUpdatingTicketId(null);
    }
  }

  async function handleDeleteTicket() {
    if (!ticketToDelete) return;

    setDeletingTicketId(ticketToDelete.id);
    try {
      const res = await fetch(`/api/tickets/${ticketToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete ticket');
      }

      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketToDelete.id));
      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[ticketToDelete.id];
        return next;
      });
      setOriginalStatusById((prev) => {
        const next = { ...prev };
        delete next[ticketToDelete.id];
        return next;
      });
      setTicketToDelete(null);
      await onSaved?.();
    } finally {
      setDeletingTicketId(null);
    }
  }

  const hasPendingChanges = useMemo(() => Object.keys(pendingChanges).length > 0, [pendingChanges]);

  function moveTicket(ticketId: string, nextStatus: TicketStatus) {
    setTickets((prev) => {
      const current = prev.find((ticket) => ticket.id === ticketId);
      if (!current || current.status === nextStatus) return prev;

      const original = originalStatusById[ticketId] ?? current.status;
      setPendingChanges((existing) => {
        const next = { ...existing };
        if (original === nextStatus) {
          delete next[ticketId];
        } else {
          next[ticketId] = nextStatus;
        }
        return next;
      });

      return prev.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: nextStatus } : ticket
      );
    });
  }

  async function saveChanges() {
    const changes = Object.entries(pendingChanges).map(([ticketId, status]) => ({ ticketId, status }));
    if (changes.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to save ticket changes');
      }

      setOriginalStatusById((prev) => {
        const merged = { ...prev };
        for (const [ticketId, status] of Object.entries(pendingChanges)) {
          merged[ticketId] = status;
        }
        return merged;
      });
      setPendingChanges({});
      await onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    setTickets((prev) =>
      prev.map((ticket) => {
        const originalStatus = originalStatusById[ticket.id];
        if (!originalStatus) return ticket;
        return { ...ticket, status: originalStatus };
      })
    );
    setPendingChanges({});
  }

  function handleDiscardClick() {
    if (Object.keys(pendingChanges).length > 3) {
      setIsDiscardConfirmOpen(true);
      return;
    }

    discardChanges();
  }

  function openTicketSource(ticket: Ticket) {
    if (ticket.meeting_id) {
      onSelectMeeting(ticket.meeting_id);
      return;
    }

    if (ticket.projectId) {
      onSelectProject(ticket.projectId);
    }
  }

  function getMeetingName(meetingId: string | null) {
    if (!meetingId) return 'Project-only ticket';
    return meetings.find((m) => m.id === meetingId)?.projectName || meetingId;
  }

  function getSourceCta(ticket: Ticket) {
    if (ticket.meeting_id) return 'Open meeting';
    if (ticket.projectId) return 'Open project';
    return 'Project-only';
  }

  const columns = [
    {
      key: 'backlog',
      title: 'Backlog',
      icon: <Circle className="w-4 h-4" />,
      color: 'border-border bg-card',
      badge: 'bg-muted text-muted-foreground',
    },
    {
      key: 'in_progress',
      title: 'In Progress',
      icon: <Clock className="w-4 h-4" />,
      color: 'border-primary/20 bg-primary/5',
      badge: 'bg-primary/20 text-primary',
    },
    {
      key: 'blocked',
      title: 'Blocked',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'border-destructive/20 bg-destructive/5',
      badge: 'bg-destructive/20 text-destructive',
    },
    {
      key: 'done',
      title: 'Done',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'border-green-200 bg-green-50',
      badge: 'bg-green-100 text-green-800',
    },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
        <span className="text-muted-foreground">Loading tickets...</span>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-12 border border-border text-center">
        <p className="text-2xl font-playfair font-bold text-foreground mb-2">No tickets yet</p>
        <p className="text-muted-foreground">Record a meeting to extract Jira-like tickets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {hasPendingChanges && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscardClick}
              disabled={saving}
              className="rounded-full"
            >
              Discard changes
            </Button>
            <Button onClick={saveChanges} disabled={saving} className="rounded-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Saving...' : `Save changes (${Object.keys(pendingChanges).length})`}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-[#f9f6f1] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Discard ticket changes?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You have {Object.keys(pendingChanges).length} unsaved ticket moves. This will revert all
              of them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDiscardConfirmOpen(false)}
              className="rounded-full"
            >
              Keep editing
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                discardChanges();
                setIsDiscardConfirmOpen(false);
              }}
              className="rounded-full"
            >
              Discard all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(ticketToEdit)}
        onOpenChange={(open) => {
          if (!open) setTicketToEdit(null);
        }}
      >
        <DialogContent className="sm:max-w-xl border-border bg-[#f9f6f1] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">Update ticket</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Edit name, description, assignee, and status before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <label className="block text-sm text-muted-foreground">
              Name
              <input
                value={ticketEditForm.title}
                onChange={(e) =>
                  setTicketEditForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Ticket title"
              />
            </label>

            <label className="block text-sm text-muted-foreground">
              Description
              <textarea
                value={ticketEditForm.description}
                onChange={(e) =>
                  setTicketEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="mt-1 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="Describe the ticket"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm text-muted-foreground">
                Assignee
                <input
                  value={ticketEditForm.assignee}
                  onChange={(e) =>
                    setTicketEditForm((prev) => ({
                      ...prev,
                      assignee: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="Optional assignee"
                />
              </label>

              <label className="block text-sm text-muted-foreground">
                Status
                <select
                  value={ticketEditForm.status}
                  onChange={(e) =>
                    setTicketEditForm((prev) => ({
                      ...prev,
                      status: e.target.value as TicketStatus,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="backlog">Backlog</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (!ticketToEdit) return;
                setTicketToDelete(ticketToEdit);
                setTicketToEdit(null);
              }}
              className="rounded-full"
              disabled={Boolean(updatingTicketId)}
            >
              Delete ticket
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTicketToEdit(null)}
              className="rounded-full"
              disabled={Boolean(updatingTicketId)}
            >
              Discard changes
            </Button>
            <Button
              type="button"
              onClick={handleSaveTicketEdit}
              className="rounded-full"
              disabled={Boolean(updatingTicketId) || ticketEditForm.title.trim().length === 0}
            >
              {updatingTicketId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirm changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(ticketToDelete)}
        onOpenChange={(open) => {
          if (!open) setTicketToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-lg border-border bg-[#f9f6f1] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Delete this ticket?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently remove &quot;{ticketToDelete?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTicketToDelete(null)}
              className="rounded-full"
              disabled={Boolean(deletingTicketId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTicket}
              className="rounded-full gap-2"
              disabled={Boolean(deletingTicketId)}
            >
              {deletingTicketId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Delete ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTickets = tickets.filter((ticket) => ticket.status === column.key);

        return (
          <div key={column.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-foreground">
                {column.icon}
                {column.title}
              </div>
              <Badge className={`text-xs px-2 py-0.5 rounded-full font-medium ${column.badge}`}>
                {columnTickets.length}
              </Badge>
            </div>

            <div
              className={`flex flex-col gap-3 min-h-[220px] rounded-2xl p-3 border ${column.color}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(column.key);
              }}
              onDragLeave={() => {
                setDragOverColumn((prev) => (prev === column.key ? null : prev));
              }}
              onDrop={(e) => {
                e.preventDefault();
                const ticketId = e.dataTransfer.getData('text/plain') || draggedTicketId;
                if (ticketId) moveTicket(ticketId, column.key);
                setDragOverColumn(null);
                setDraggedTicketId(null);
              }}
            >
              {columnTickets.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">No tickets here</p>
              )}

              {columnTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedTicketId(ticket.id);
                    e.dataTransfer.setData('text/plain', ticket.id);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragEnd={() => {
                    setDraggedTicketId(null);
                    setDragOverColumn(null);
                  }}
                  className={`bg-white rounded-xl p-4 border border-border transition-all duration-200 group ${
                    ticket.meeting_id
                      ? 'hover:border-primary/30 hover:shadow-md cursor-pointer'
                      : ticket.projectId
                        ? 'hover:border-primary/30 hover:shadow-md cursor-pointer'
                        : 'cursor-default'
                  }`}
                  onClick={() => {
                    openTicketSource(ticket);
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-playfair font-bold text-foreground group-hover:text-primary transition-colors text-sm leading-snug">
                      {ticket.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                        {column.title}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTicketEditor(ticket);
                        }}
                        className="rounded-full border border-primary/20 bg-primary/5 p-1.5 text-primary hover:bg-primary/10"
                        aria-label="Update ticket"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {ticket.description && (
                    <p className="text-xs text-muted-foreground leading-5 line-clamp-3">
                      {ticket.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-medium ${
                        ticket.meeting_id ? 'text-primary hover:underline' : 'text-muted-foreground'
                      }`}
                    >
                      {getMeetingName(ticket.meeting_id)}
                    </span>
                    <span className="text-muted-foreground">
                      {ticket.assignee ? `@${ticket.assignee}` : 'Unassigned'}
                    </span>
                    <span className="text-primary font-medium">{getSourceCta(ticket)}</span>
                  </div>
                </div>
              ))}

              {dragOverColumn === column.key && (
                <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 py-4 text-center text-xs text-primary">
                  Drop here to move
                </div>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
