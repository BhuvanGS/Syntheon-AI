'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { stripHtml } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle,
  Pencil,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckSquare,
  Square,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { AssigneePicker, type AssigneeValue } from '@/components/assignee-picker';
import { TicketDependencyPanel } from '@/components/ticket-dependency-panel';
import { DependencyBlockerModal } from '@/components/dependency-blocker-modal';
import { DateRangePicker } from '@/components/date-range-picker';
import { MentionEditor } from '@/components/mention-editor';
import { useSse } from '@/components/sse-provider';
import { format, parseISO, isToday, isPast, isTomorrow, isThisWeek } from 'date-fns';
import {
  TicketBadges,
  type TicketPriority,
  type TicketType,
  type TicketEstimate,
} from '@/components/ticket-badges';
import { EMPTY_FILTERS, type TicketFilters } from '@/components/ticket-filter-bar';
import { FilterDialog } from '@/components/ticket-filter-dialog';
import { TicketMetadataEditor } from '@/components/ticket-metadata-editor';
import { BulkActionBar } from '@/components/ticket-bulk-bar';
import { LabelManager } from '@/components/label-manager';
import { onCommand } from '@/lib/command-events';

type TicketStatus = string;

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority?: TicketPriority;
  type?: TicketType;
  estimate?: TicketEstimate;
  labels?: string[];
  assignee?: string | null;
  assignee_user_id?: string | null;
  projectId?: string | null;
  meeting_id: string | null;
  start_date?: string | null;
  due_date?: string | null;
  deadline_time?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface Label {
  id: string;
  name: string;
  color: string;
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
  const { user } = useUser();
  const { memberships } = useOrganization({ memberships: true });
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [filters, setFilters] = useState<TicketFilters>(EMPTY_FILTERS);
  const [labels, setLabels] = useState<Label[]>([]);
  const [labelMap, setLabelMap] = useState<Record<string, { name: string; color: string }>>({});
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [metaPriority, setMetaPriority] = useState<TicketPriority>('none');
  const [metaType, setMetaType] = useState<TicketType>('task');
  const [metaEstimate, setMetaEstimate] = useState<TicketEstimate>('none');
  const [metaLabels, setMetaLabels] = useState<string[]>([]);

  // Stale ticket detection (7 days without update, not done)
  const isTicketStale = (ticket: (typeof tickets)[number]) => {
    if (ticket.status === 'done') return false;
    const now = new Date();
    const updatedAt = ticket.updatedAt
      ? new Date(ticket.updatedAt)
      : new Date(ticket.createdAt || now);
    const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate >= 7;
  };
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
  const [ticketEditForm, setTicketEditForm] = useState<{
    title: string;
    description: string;
    assignee: AssigneeValue | null;
    status: TicketStatus;
    start_date: string;
    due_date: string;
    deadline_time: string;
  }>({
    title: '',
    description: '',
    assignee: null,
    status: 'backlog',
    start_date: '',
    due_date: '',
    deadline_time: '',
  });
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [deletingTicketId, setDeletingTicketId] = useState<string | null>(null);

  const { on: sseOn, off: sseOff } = useSse();

  // Dependency blocker modal state
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [blockerModalData, setBlockerModalData] = useState<{
    message: string;
    blockers: Array<{ id: string; depends_on: string; type: string; title?: string }>;
    isHardBlock: boolean;
    onRevert: () => void;
    onProceed?: () => void;
  } | null>(null);

  const PAGE_SIZE = 40;
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [ticketsHasMore, setTicketsHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    void fetchAll();
  }, [ticketPage]);

  // Fetch labels
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/labels');
        if (res.ok) {
          const data = await res.json();
          const labelArr: Label[] = data.labels ?? [];
          setLabels(labelArr);
          const map: Record<string, { name: string; color: string }> = {};
          for (const l of labelArr) map[l.id] = { name: l.name, color: l.color };
          setLabelMap(map);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Keyboard shortcuts: cmd+B for bulk mode
  // cmd+K is handled by DynamicIslandSearch globally
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b' && !e.shiftKey) {
        e.preventDefault();
        setBulkMode((v) => {
          if (v) setSelectedIds(new Set());
          return !v;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Listen for command events from global search
  useEffect(() => {
    const unsubs = [
      onCommand('filter:open-dialog', () => setFilterDialogOpen(true)),
      onCommand('filter:priority', (p) =>
        setFilters((prev) => ({ ...prev, priority: p as TicketPriority }))
      ),
      onCommand('filter:type', (t) => setFilters((prev) => ({ ...prev, type: t as TicketType }))),
      onCommand('filter:status', (s) => setFilters((prev) => ({ ...prev, status: s as string }))),
      onCommand('filter:assignee', (a) =>
        setFilters((prev) => ({ ...prev, assignee: a as 'all' | 'mine' | 'unassigned' }))
      ),
      onCommand('filter:dueDate', (d) =>
        setFilters((prev) => ({
          ...prev,
          dueDate: d as 'all' | 'overdue' | 'today' | 'this_week' | 'none',
        }))
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Sync assignee filter with the filter bar
  useEffect(() => {
    setFilters((prev) => ({ ...prev, assignee: assigneeFilter }));
  }, [assigneeFilter]);

  // Filtered tickets based on all filter criteria
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.priority && (ticket.priority ?? 'none') !== filters.priority) return false;
      if (filters.type && (ticket.type ?? 'task') !== filters.type) return false;
      if (filters.estimate && (ticket.estimate ?? 'none') !== filters.estimate) return false;
      if (filters.labelIds.length > 0) {
        const ticketLabels = ticket.labels ?? [];
        if (!filters.labelIds.some((id) => ticketLabels.includes(id))) return false;
      }
      if (filters.assignee === 'mine' && ticket.assignee_user_id !== user?.id) return false;
      if (filters.assignee === 'unassigned' && ticket.assignee_user_id) return false;
      if (filters.dueDate !== 'all') {
        if (!ticket.due_date) {
          if (filters.dueDate !== 'none') return false;
        } else {
          const d = parseISO(ticket.due_date);
          if (filters.dueDate === 'overdue' && !(isPast(d) && !isToday(d))) return false;
          if (filters.dueDate === 'today' && !isToday(d)) return false;
          if (filters.dueDate === 'this_week' && !isThisWeek(d, { weekStartsOn: 1 })) return false;
          if (filters.dueDate === 'none') return false;
        }
      }
      return true;
    });
  }, [tickets, filters, user?.id]);

  async function fetchAll() {
    try {
      const offset = (ticketPage - 1) * PAGE_SIZE;
      const [ticketsRes, meetingsRes] = await Promise.all([
        fetch(`/api/tickets?limit=${PAGE_SIZE}&offset=${offset}`),
        fetch('/api/meetings?limit=50'),
      ]);
      const [ticketsData, meetingsData] = await Promise.all([
        ticketsRes.json(),
        meetingsRes.json(),
      ]);
      const ticketsArr: Ticket[] = Array.isArray(ticketsData)
        ? ticketsData
        : (ticketsData.tickets ?? []);
      const meetingsArr: Meeting[] = Array.isArray(meetingsData)
        ? meetingsData
        : (meetingsData.meetings ?? []);
      setTicketsTotal(
        Array.isArray(ticketsData) ? ticketsArr.length : (ticketsData.total ?? ticketsArr.length)
      );
      setTicketsHasMore(Array.isArray(ticketsData) ? false : Boolean(ticketsData.hasMore));

      if (ticketsArr.length === 0 && offset > 0) {
        setTicketPage((p) => Math.max(1, p - 1));
        return;
      }

      setTickets(ticketsArr);
      setMeetings(meetingsArr);
      setOriginalStatusById(
        ticketsArr.reduce<Record<string, TicketStatus>>((acc, ticket) => {
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

  // Real-time refresh via SSE
  useEffect(() => {
    const handleRefresh = () => {
      void fetchAll();
    };
    sseOn('ticket_created', handleRefresh);
    sseOn('ticket_updated', handleRefresh);
    sseOn('ticket_deleted', handleRefresh);
    sseOn('project_updated', handleRefresh);
    sseOn('project_deleted', handleRefresh);
    return () => {
      sseOff('ticket_created', handleRefresh);
      sseOff('ticket_updated', handleRefresh);
      sseOff('ticket_deleted', handleRefresh);
      sseOff('project_updated', handleRefresh);
      sseOff('project_deleted', handleRefresh);
    };
  }, [sseOn, sseOff]);

  function openTicketEditor(ticket: Ticket) {
    setTicketToEdit(ticket);
    setTicketEditForm({
      title: ticket.title,
      description: ticket.description || '',
      assignee:
        ticket.assignee_user_id && ticket.assignee
          ? { userId: ticket.assignee_user_id, displayName: ticket.assignee }
          : null,
      status: ticket.status,
      start_date: ticket.start_date || '',
      due_date: ticket.due_date || '',
      deadline_time: ticket.deadline_time || '',
    });
    setMetaPriority(ticket.priority ?? 'none');
    setMetaType(ticket.type ?? 'task');
    setMetaEstimate(ticket.estimate ?? 'none');
    setMetaLabels(ticket.labels ?? []);
  }

  async function handleSaveTicketEdit() {
    if (!ticketToEdit) return;

    setUpdatingTicketId(ticketToEdit.id);
    try {
      let res = await fetch(`/api/tickets/${ticketToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticketEditForm.title.trim(),
          description: ticketEditForm.description.trim(),
          assignee: ticketEditForm.assignee?.displayName ?? null,
          assigneeUserId: ticketEditForm.assignee?.userId ?? null,
          status: ticketEditForm.status,
          start_date: ticketEditForm.start_date || null,
          due_date: ticketEditForm.due_date || null,
          deadline_time: ticketEditForm.deadline_time || null,
          priority: metaPriority,
          type: metaType,
          estimate: metaEstimate,
          labels: metaLabels,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 422 && data?.error === 'soft_blocked') {
          const blockersWithTitles = (data?.blockers || []).map((b: any) => ({
            ...b,
            title: tickets.find((t) => t.id === b.depends_on)?.title,
          }));
          setBlockerModalData({
            message: data?.message || 'This move has unresolved soft dependencies.',
            blockers: blockersWithTitles,
            isHardBlock: false,
            onRevert: () => {
              setBlockerModalOpen(false);
              setTicketEditForm((prev) => ({ ...prev, status: ticketToEdit.status }));
            },
            onProceed: async () => {
              setBlockerModalOpen(false);
              const bypassRes = await fetch(`/api/tickets/${ticketToEdit.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: ticketEditForm.title.trim(),
                  description: ticketEditForm.description.trim(),
                  assignee: ticketEditForm.assignee?.displayName ?? null,
                  assigneeUserId: ticketEditForm.assignee?.userId ?? null,
                  status: ticketEditForm.status,
                  start_date: ticketEditForm.start_date || null,
                  due_date: ticketEditForm.due_date || null,
                  deadline_time: ticketEditForm.deadline_time || null,
                  priority: metaPriority,
                  type: metaType,
                  estimate: metaEstimate,
                  labels: metaLabels,
                  bypassGate: true,
                }),
              });
              if (bypassRes.ok) {
                const updated = await bypassRes.json();
                setTickets((prev) =>
                  prev.map((t) => (t.id === ticketToEdit.id ? { ...t, ...updated } : t))
                );
                setTicketToEdit(null);
              } else if (bypassRes.status === 422) {
                const errData = await bypassRes.json().catch(() => ({}));
                const bwt = (errData?.blockers || []).map((b: any) => ({
                  ...b,
                  title: tickets.find((t) => t.id === b.depends_on)?.title,
                }));
                setBlockerModalData({
                  message: errData?.message || 'Blocked by unresolved hard dependencies.',
                  blockers: bwt,
                  isHardBlock: true,
                  onRevert: () => {
                    setBlockerModalOpen(false);
                    setTicketEditForm((prev) => ({ ...prev, status: ticketToEdit.status }));
                  },
                });
                setBlockerModalOpen(true);
              }
            },
          });
          setBlockerModalOpen(true);
          return;
        }

        if (!res.ok) {
          const finalData = await res.json().catch(() => data || {});
          if (res.status === 422 && finalData?.error === 'hard_blocked') {
            const blockersWithTitles = (finalData?.blockers || []).map((b: any) => ({
              ...b,
              title: tickets.find((t) => t.id === b.depends_on)?.title,
            }));
            setBlockerModalData({
              message: finalData?.message || 'Blocked by unresolved hard dependencies.',
              blockers: blockersWithTitles,
              isHardBlock: true,
              onRevert: () => {
                setBlockerModalOpen(false);
                setTicketEditForm((prev) => ({ ...prev, status: ticketToEdit.status }));
              },
            });
            setBlockerModalOpen(true);
            return;
          }
          throw new Error(finalData?.error || 'Failed to update ticket');
        }
      }

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketToEdit.id
            ? {
                ...ticket,
                title: ticketEditForm.title.trim(),
                description: ticketEditForm.description.trim(),
                assignee: ticketEditForm.assignee?.displayName ?? null,
                assignee_user_id: ticketEditForm.assignee?.userId ?? null,
                status: ticketEditForm.status,
                start_date: ticketEditForm.start_date || null,
                due_date: ticketEditForm.due_date || null,
                deadline_time: ticketEditForm.deadline_time || null,
                priority: metaPriority,
                type: metaType,
                estimate: metaEstimate,
                labels: metaLabels,
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
    const changes = Object.entries(pendingChanges).map(([ticketId, status]) => ({
      ticketId,
      status,
    }));
    if (changes.length === 0) return;

    setSaving(true);
    try {
      let res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 422 && data?.error === 'soft_blocked') {
          const blockersWithTitles = (data?.blockers || []).map((b: any) => ({
            ...b,
            title: tickets.find((t) => t.id === b.depends_on)?.title,
          }));
          setBlockerModalData({
            message: data?.message || 'This move has unresolved soft dependencies.',
            blockers: blockersWithTitles,
            isHardBlock: false,
            onRevert: () => {
              setBlockerModalOpen(false);
              fetchAll();
            },
            onProceed: async () => {
              setBlockerModalOpen(false);
              const bypassRes = await fetch('/api/tickets', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ changes, bypassGate: true }),
              });
              if (bypassRes.ok) {
                fetchAll();
              } else if (bypassRes.status === 422) {
                const errData = await bypassRes.json().catch(() => ({}));
                const bwt = (errData?.blockers || []).map((b: any) => ({
                  ...b,
                  title: tickets.find((t) => t.id === b.depends_on)?.title,
                }));
                setBlockerModalData({
                  message: errData?.message || 'Blocked by unresolved hard dependencies.',
                  blockers: bwt,
                  isHardBlock: true,
                  onRevert: () => {
                    setBlockerModalOpen(false);
                    fetchAll();
                  },
                });
                setBlockerModalOpen(true);
              }
            },
          });
          setBlockerModalOpen(true);
          return;
        }

        if (!res.ok) {
          const finalData = await res.json().catch(() => data || {});
          if (res.status === 422 && finalData?.error === 'hard_blocked') {
            const blockersWithTitles = (finalData?.blockers || []).map((b: any) => ({
              ...b,
              title: tickets.find((t) => t.id === b.depends_on)?.title,
            }));
            setBlockerModalData({
              message: finalData?.message || 'Blocked by unresolved hard dependencies.',
              blockers: blockersWithTitles,
              isHardBlock: true,
              onRevert: () => {
                setBlockerModalOpen(false);
                fetchAll();
              },
            });
            setBlockerModalOpen(true);
            return;
          } else if (res.status === 422 && finalData?.error === 'soft_blocked') {
            const blockersWithTitles = (finalData?.blockers || []).map((b: any) => ({
              ...b,
              title: tickets.find((t) => t.id === b.depends_on)?.title,
            }));
            setBlockerModalData({
              message: finalData?.message || 'Blocked by unresolved soft dependencies.',
              blockers: blockersWithTitles,
              isHardBlock: false,
              onRevert: () => {
                setBlockerModalOpen(false);
                fetchAll();
              },
              onProceed: async () => {
                setBlockerModalOpen(false);
                const bypassRes = await fetch('/api/tickets', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ changes, bypassGate: true }),
                });
                if (bypassRes.ok) {
                  fetchAll();
                } else if (bypassRes.status === 422) {
                  const errData = await bypassRes.json().catch(() => ({}));
                  const bwt = (errData?.blockers || []).map((b: any) => ({
                    ...b,
                    title: tickets.find((t) => t.id === b.depends_on)?.title,
                  }));
                  setBlockerModalData({
                    message: errData?.message || 'Blocked by unresolved hard dependencies.',
                    blockers: bwt,
                    isHardBlock: true,
                    onRevert: () => {
                      setBlockerModalOpen(false);
                      fetchAll();
                    },
                  });
                  setBlockerModalOpen(true);
                }
              },
            });
            setBlockerModalOpen(true);
            return;
          }
          throw new Error(finalData?.error || 'Failed to save ticket changes');
        }
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

  const defaultColumns = [
    {
      key: 'backlog',
      title: 'Backlog',
      icon: <Circle className="w-4 h-4" />,
      color: 'border-border bg-muted/30',
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
  ];

  const columns = useMemo(() => {
    const knownKeys = new Set(defaultColumns.map((c) => c.key));
    const extraKeys = new Set<string>();
    for (const t of tickets) {
      if (t.status && !knownKeys.has(t.status)) {
        extraKeys.add(t.status);
      }
    }
    if (extraKeys.size === 0) return defaultColumns;
    const extra = [...extraKeys].map((key) => ({
      key,
      title: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: <Circle className="w-4 h-4" />,
      color: 'border-border bg-muted/30',
      badge: 'bg-muted text-muted-foreground',
    }));
    return [...defaultColumns, ...extra];
  }, [tickets]);

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
      <div className="bg-muted/50 rounded-2xl p-12 border border-border text-center animate-fade-in-up">
        <p className="text-2xl font-playfair font-bold text-foreground mb-2">No tickets yet</p>
        <p className="text-muted-foreground">Record a meeting to extract Jira-like tickets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-muted/40">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'mine', label: 'Mine' },
                { key: 'unassigned', label: 'Unassigned' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setAssigneeFilter(key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  assigneeFilter === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-muted/40">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3 h-3" />
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              Kanban
            </button>
          </div>
          <button
            onClick={() => {
              setBulkMode((v) => {
                if (v) setSelectedIds(new Set());
                return !v;
              });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              bulkMode
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'text-muted-foreground hover:text-foreground border-border bg-muted/40'
            }`}
            title="Toggle bulk select (⌘B)"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Bulk
          </button>
          <button
            onClick={() => setFilterDialogOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
              filters.status ||
              filters.priority ||
              filters.type ||
              filters.estimate ||
              filters.labelIds.length > 0 ||
              filters.assignee !== 'all' ||
              filters.dueDate !== 'all'
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'text-muted-foreground hover:text-foreground border-border bg-muted/40'
            }`}
            title="Filter tickets"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </button>
          <button
            onClick={() => setLabelManagerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors text-muted-foreground hover:text-foreground border border-border bg-muted/40"
          >
            <Tag className="h-3.5 w-3.5" />
            Labels
          </button>
        </div>
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

      {/* Filter dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        onChange={setFilters}
        labels={labels}
        statuses={columns.map((c) => ({ key: c.key, label: c.title }))}
        tickets={tickets.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          type: t.type,
          estimate: t.estimate,
          labels: t.labels,
          assignee: t.assignee,
          due_date: t.due_date,
        }))}
      />

      {/* Bulk action bar */}
      {bulkMode && (
        <BulkActionBar
          selectedIds={[...selectedIds]}
          totalCount={filteredTickets.length}
          onSelectAll={() => setSelectedIds(new Set(filteredTickets.map((t) => t.id)))}
          onClear={() => setSelectedIds(new Set())}
          statuses={columns.map((c) => ({ key: c.key, label: c.title }))}
          onBulkUpdate={async (updates) => {
            const ids = [...selectedIds];
            if (ids.length === 0) return;
            await fetch('/api/tickets/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ticketIds: ids, ...updates }),
            });
            setTickets((prev) =>
              prev.map((t) => (selectedIds.has(t.id) ? { ...t, ...(updates as any) } : t))
            );
            setSelectedIds(new Set());
            await onSaved?.();
          }}
          labels={labels}
        />
      )}

      <Dialog open={isDiscardConfirmOpen} onOpenChange={setIsDiscardConfirmOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Discard ticket changes?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You have {Object.keys(pendingChanges).length} unsaved ticket moves. This will revert
              all of them.
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
        <DialogContent className="sm:max-w-2xl border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Update ticket
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Edit name, description, assignee, and status before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={ticketEditForm.title}
                onChange={(e) =>
                  setTicketEditForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Ticket title"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Description</label>
              <MentionEditor
                content={ticketEditForm.description}
                onChange={(html) =>
                  setTicketEditForm((prev) => ({
                    ...prev,
                    description: html,
                  }))
                }
                placeholder="Describe the ticket..."
                disabled={Boolean(updatingTicketId)}
                members={(memberships?.data ?? []).map((m) => ({
                  userId: m.publicUserData?.userId ?? '',
                  displayName:
                    [m.publicUserData?.firstName, m.publicUserData?.lastName]
                      .filter(Boolean)
                      .join(' ') ||
                    m.publicUserData?.identifier ||
                    'Team member',
                }))}
                tickets={tickets.map((t) => ({ id: t.id, title: t.title, status: t.status }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Assignee</label>
                <AssigneePicker
                  value={ticketEditForm.assignee}
                  onChange={(val) => setTicketEditForm((prev) => ({ ...prev, assignee: val }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select
                  value={ticketEditForm.status}
                  onValueChange={(value) =>
                    setTicketEditForm((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Dates</p>
              <DateRangePicker
                startDate={ticketEditForm.start_date || undefined}
                dueDate={ticketEditForm.due_date || undefined}
                deadlineTime={ticketEditForm.deadline_time || undefined}
                onStartDateChange={(date) =>
                  setTicketEditForm((prev) => ({ ...prev, start_date: date || '' }))
                }
                onDueDateChange={(date) =>
                  setTicketEditForm((prev) => ({ ...prev, due_date: date || '' }))
                }
                onDeadlineTimeChange={(time) =>
                  setTicketEditForm((prev) => ({ ...prev, deadline_time: time || '' }))
                }
                disabled={Boolean(updatingTicketId)}
              />
            </div>

            <div className="border-t border-border/60 pt-3">
              <p className="text-sm font-medium text-foreground mb-2">Properties</p>
              <TicketMetadataEditor
                priority={metaPriority}
                type={metaType}
                estimate={metaEstimate}
                labels={metaLabels}
                onPriorityChange={setMetaPriority}
                onTypeChange={setMetaType}
                onEstimateChange={setMetaEstimate}
                onLabelsChange={setMetaLabels}
                availableLabels={labels}
                onManageLabels={() => setLabelManagerOpen(true)}
              />
            </div>

            {ticketToEdit && (
              <div className="border-t border-border/60 pt-4">
                <TicketDependencyPanel
                  ticketId={ticketToEdit.id}
                  projectId={ticketToEdit.projectId}
                  projectTickets={tickets
                    .filter((t) => t.projectId === ticketToEdit.projectId)
                    .map((t) => ({ id: t.id, title: t.title, status: t.status }))}
                />
              </div>
            )}
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
        <DialogContent className="sm:max-w-lg border-border bg-background shadow-2xl">
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

      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
        <span className="text-xs text-muted-foreground">
          Showing {(ticketPage - 1) * PAGE_SIZE + 1}-
          {Math.min(ticketPage * PAGE_SIZE, ticketsTotal || 0)} of {ticketsTotal}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={() => setTicketPage((p) => Math.max(1, p - 1))}
            disabled={ticketPage <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page {ticketPage}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={() => setTicketPage((p) => p + 1)}
            disabled={!ticketsHasMore || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {columns.map((column) => {
            const columnTickets = filteredTickets.filter((ticket) => ticket.status === column.key);

            return (
              <div
                key={column.key}
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
                className={`min-w-[280px] w-[280px] rounded-2xl border-2 transition-colors h-fit flex flex-col ${
                  dragOverColumn === column.key
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {column.icon}
                    <span
                      style={{
                        color: {
                          backlog: '#8a8a80',
                          in_progress: '#3d7abf',
                          blocked: '#b84040',
                          done: '#3d8a5e',
                        }[column.key],
                      }}
                    >
                      {column.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-background rounded-full px-2 py-0.5 border border-border">
                    {columnTickets.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2 p-3">
                  {columnTickets.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <p className="text-xs text-muted-foreground/50">Drop tickets here</p>
                    </div>
                  )}

                  {columnTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      draggable={!bulkMode}
                      onDragStart={(e) => {
                        if (bulkMode) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedTicketId(ticket.id);
                        e.dataTransfer.setData('text/plain', ticket.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDraggedTicketId(null);
                        setDragOverColumn(null);
                      }}
                      className={`rounded-xl border bg-muted/40 p-3 shadow-sm hover-lift text-left hover:bg-muted/60 transition-colors ${
                        bulkMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                      } ${draggedTicketId === ticket.id ? 'opacity-40 scale-[0.98]' : ''} ${
                        selectedIds.has(ticket.id)
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border'
                      }`}
                      onClick={() => {
                        if (bulkMode) {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(ticket.id)) next.delete(ticket.id);
                            else next.add(ticket.id);
                            return next;
                          });
                        } else {
                          openTicketSource(ticket);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-start gap-2 flex-1">
                          {bulkMode && (
                            <span className="mt-0.5 shrink-0">
                              {selectedIds.has(ticket.id) ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4 text-muted-foreground" />
                              )}
                            </span>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <TicketBadges
                                priority={ticket.priority ?? 'none'}
                                type={ticket.type ?? 'task'}
                                estimate={ticket.estimate ?? 'none'}
                                labels={ticket.labels ?? []}
                                labelMap={labelMap}
                              />
                            </div>
                            <p className="text-sm font-medium text-foreground line-clamp-2">
                              {ticket.title}
                            </p>
                            {isTicketStale(ticket) && (
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Stale (7+ days)</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {!bulkMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTicketEditor(ticket);
                            }}
                            className="shrink-0 rounded-full border border-primary/20 bg-primary/5 p-1 text-primary hover:bg-primary/10"
                            aria-label="Update ticket"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {ticket.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {stripHtml(ticket.description)}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{getMeetingName(ticket.meeting_id)}</span>
                        <span>{ticket.assignee ? `@${ticket.assignee}` : 'Unassigned'}</span>
                      </div>
                      {ticket.due_date &&
                        (() => {
                          const d = parseISO(ticket.due_date);
                          const overdue = isPast(d) && !isToday(d);
                          const todayOrTomorrow = isToday(d) || isTomorrow(d);
                          return (
                            <div
                              className={`mt-1.5 flex items-center gap-1 text-[10px] font-medium ${
                                overdue
                                  ? 'text-red-500'
                                  : todayOrTomorrow
                                    ? 'text-amber-500'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>
                                Due {format(d, 'MMM d')}
                                {ticket.deadline_time ? ` at ${ticket.deadline_time}` : ''}
                              </span>
                            </div>
                          );
                        })()}
                    </div>
                  ))}

                  {dragOverColumn === column.key && columnTickets.length > 0 && (
                    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 py-3 text-center text-xs text-primary">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'list' &&
        (() => {
          const statusColors: Record<string, { color: string; bg: string }> = {
            backlog: { color: '#8a8a80', bg: '#f3f3f0' },
            in_progress: { color: '#3d7abf', bg: '#eff5ff' },
            done: { color: '#3d8a5e', bg: '#edf7f1' },
            blocked: { color: '#b84040', bg: '#fdf0f0' },
          };
          const statusLabel: Record<string, string> = {
            backlog: 'Backlog',
            in_progress: 'In Progress',
            done: 'Done',
            blocked: 'Blocked',
          };
          function getStatusMeta(status: string) {
            return statusColors[status] ?? { color: '#64748b', bg: '#f1f5f9' };
          }
          function getStatusLabel(status: string) {
            return (
              statusLabel[status] ??
              status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
            );
          }
          const gridCols = bulkMode
            ? 'grid-cols-[28px_minmax(200px,1fr)_120px_100px_100px_80px_40px]'
            : 'grid-cols-[minmax(200px,1fr)_120px_100px_100px_80px_40px]';
          return (
            <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
              <div
                className={`grid ${gridCols} items-center px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground border-b border-border/60 bg-muted/40`}
              >
                {bulkMode && <span />}
                <span>Title</span>
                <span>Status</span>
                <span>Props</span>
                <span>Due</span>
                <span>Assignee</span>
                <span />
              </div>
              {filteredTickets.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No tickets found.
                </div>
              ) : (
                filteredTickets.map((ticket, i) => {
                  const s = getStatusMeta(ticket.status);
                  return (
                    <div
                      key={ticket.id}
                      className={`grid ${gridCols} items-center px-4 py-3 gap-2 hover:bg-muted/40 transition-colors ${
                        i < filteredTickets.length - 1 ? 'border-b border-border/40' : ''
                      } ${selectedIds.has(ticket.id) ? 'bg-primary/5' : ''}`}
                      onClick={() => {
                        if (bulkMode) {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(ticket.id)) next.delete(ticket.id);
                            else next.add(ticket.id);
                            return next;
                          });
                        }
                      }}
                    >
                      {bulkMode && (
                        <span className="shrink-0">
                          {selectedIds.has(ticket.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                      )}
                      <div className="flex items-center gap-2 min-w-0">
                        <TicketBadges
                          priority={ticket.priority ?? 'none'}
                          type={ticket.type ?? 'task'}
                          estimate={ticket.estimate ?? 'none'}
                          labels={ticket.labels ?? []}
                          labelMap={labelMap}
                        />
                        <span
                          className="font-medium text-sm text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={(e) => {
                            if (bulkMode) return;
                            e.stopPropagation();
                            openTicketSource(ticket);
                          }}
                        >
                          {ticket.title}
                        </span>
                        {isTicketStale(ticket) && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-yellow-500/10 text-yellow-700 border-yellow-500/20 shrink-0 whitespace-nowrap"
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Stale
                          </Badge>
                        )}
                      </div>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium w-fit"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {getMeetingName(ticket.meeting_id)}
                      </span>
                      <span
                        className={`text-xs font-medium truncate ${
                          ticket.due_date
                            ? isPast(parseISO(ticket.due_date)) &&
                              !isToday(parseISO(ticket.due_date))
                              ? 'text-red-500'
                              : isToday(parseISO(ticket.due_date)) ||
                                  isTomorrow(parseISO(ticket.due_date))
                                ? 'text-amber-500'
                                : 'text-muted-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {ticket.due_date ? format(parseISO(ticket.due_date), 'MMM d') : '—'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {ticket.assignee ? `@${ticket.assignee}` : '—'}
                      </span>
                      {!bulkMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTicketEditor(ticket);
                          }}
                          className="rounded-full border border-primary/20 bg-primary/5 p-1 text-primary hover:bg-primary/10 justify-self-end"
                          aria-label="Edit ticket"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}

      {/* Dependency Blocker Modal */}
      {blockerModalData && (
        <DependencyBlockerModal
          isOpen={blockerModalOpen}
          onClose={() => setBlockerModalOpen(false)}
          onGoToTicket={(ticketId) => {
            setBlockerModalOpen(false);
            const ticket = tickets.find((t) => t.id === ticketId);
            if (ticket) openTicketEditor(ticket);
          }}
          onRevert={blockerModalData.onRevert}
          onProceed={blockerModalData.onProceed}
          message={blockerModalData.message}
          blockers={blockerModalData.blockers}
          isHardBlock={blockerModalData.isHardBlock}
        />
      )}

      {/* Label Manager */}
      <LabelManager
        open={labelManagerOpen}
        onClose={() => setLabelManagerOpen(false)}
        labels={labels}
        onRefresh={() => {
          void (async () => {
            const res = await fetch('/api/labels');
            if (res.ok) {
              const data = await res.json();
              const labelArr: Label[] = data.labels ?? [];
              setLabels(labelArr);
              const map: Record<string, { name: string; color: string }> = {};
              for (const l of labelArr) map[l.id] = { name: l.name, color: l.color };
              setLabelMap(map);
            }
          })();
        }}
      />
    </div>
  );
}
