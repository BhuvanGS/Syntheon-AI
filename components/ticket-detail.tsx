'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSse } from '@/components/sse-provider';
import { stripHtml } from '@/lib/utils';
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
import {
  FileText,
  Gavel,
  Lightbulb,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { AssigneePicker, type AssigneeValue } from '@/components/assignee-picker';
import { TicketDependencyPanel } from '@/components/ticket-dependency-panel';
import { DependencyBlockerModal } from '@/components/dependency-blocker-modal';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'done' | 'blocked';
  assignee?: string | null;
  assignee_user_id?: string | null;
  projectId?: string | null;
  meeting_id: string;
}

interface Meeting {
  id: string;
  projectName: string;
  projectId?: string;
  deployUrl?: string;
  date?: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  name: string;
  repo?: string | null;
  meetings: string[];
  files: string[];
  context: string;
}

interface TicketDetailProps {
  meetingId: string;
  onSelectMeeting: (meetingId: string) => void;
  onDeleteMeeting?: (meetingId: string) => Promise<void> | void;
}

export function TicketDetail({ meetingId, onSelectMeeting, onDeleteMeeting }: TicketDetailProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('Meeting');
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryGenerating, setSummaryGenerating] = useState(false);
  const [savingTicketId, setSavingTicketId] = useState<string | null>(null);
  const [blockerModalOpen, setBlockerModalOpen] = useState(false);
  const [blockerModalData, setBlockerModalData] = useState<{
    message: string;
    blockers: Array<{ id: string; depends_on: string; type: string; title?: string }>;
    isHardBlock: boolean;
    onRevert: () => void;
    onProceed?: () => void;
  } | null>(null);
  const [isManualTicketOpen, setIsManualTicketOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [ticketEditForm, setTicketEditForm] = useState<{
    title: string;
    description: string;
    assignee: AssigneeValue | null;
    status: Ticket['status'];
  }>({
    title: '',
    description: '',
    assignee: null,
    status: 'backlog',
  });
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
    fetchMeetingData();
  }, [meetingId]);

  const { on, off } = useSse();

  useEffect(() => {
    if (meetingData?.projectId) fetchProject(meetingData.projectId);
  }, [meetingData?.projectId]);

  async function fetchTickets() {
    try {
      setLoading(true);
      const res = await fetch(`/api/meetings/${meetingId}/tickets`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error('Could not load tickets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMeeting() {
    if (!meetingToDelete || !onDeleteMeeting) return;
    await onDeleteMeeting(meetingToDelete);
    setMeetingToDelete(null);
  }

  async function fetchSummary() {
    setSummaryLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary ?? null);
      }
    } catch {
      // silently fail
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleGenerateSummary() {
    setSummaryGenerating(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/summary`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary ?? null);
      }
    } catch {
      // silently fail
    } finally {
      setSummaryGenerating(false);
    }
  }

  async function fetchMeetingData() {
    try {
      const res = await fetch('/api/meetings?limit=50');
      if (!res.ok) return;
      const data = await res.json();
      const meetingsArr = Array.isArray(data) ? data : (data.meetings ?? []);
      const meeting = meetingsArr.find((m: any) => m.id === meetingId);
      if (meeting) {
        setMeetingTitle(meeting.projectName);
        setMeetingData(meeting);
      }
    } catch {}
  }

  async function fetchProject(projectId: string) {
    try {
      const res = await fetch(`/api/projects?meetingId=${meetingId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data) setProject(data);
    } catch {}
  }

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
    });
  }

  async function handleSaveTicketEdit() {
    if (!ticketToEdit) return;

    setSavingTicketId(ticketToEdit.id);
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
                  bypassGate: true,
                }),
              });
              if (bypassRes.ok) {
                // refreshed
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
          if (res.status === 422 && finalData?.error === 'soft_blocked') {
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
                    bypassGate: true,
                  }),
                });
                if (bypassRes.ok) {
                  // refreshed
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
              }
            : ticket
        )
      );
      setTicketToEdit(null);
    } finally {
      setSavingTicketId(null);
    }
  }

  async function handleDeleteTicket() {
    if (!ticketToDelete) return;
    setSavingTicketId(ticketToDelete);

    try {
      const res = await fetch(`/api/tickets/${ticketToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ticket');

      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketToDelete));
      setTicketToDelete(null);
    } finally {
      setSavingTicketId(null);
    }
  }

  const readyTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'in_progress' || ticket.status === 'done'),
    [tickets]
  );

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
      <div className="max-w-5xl">
        <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">{meetingTitle}</h1>
        <div className="bg-card rounded-2xl p-12 border border-border text-center mt-8">
          <p className="text-2xl font-playfair font-bold mb-2">No tickets yet</p>
          <p className="text-muted-foreground">This meeting has not produced any tickets yet.</p>
        </div>
      </div>
    );
  }

  const blockedCount = tickets.filter((ticket) => ticket.status === 'blocked').length;
  const isFollowUp = !!(project?.id ?? meetingData?.projectId);

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-foreground">{meetingTitle}</h1>
          {isFollowUp && (
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium mt-3 inline-flex">
              Follow-up meeting
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              void fetchSummary();
              setSummaryOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <FileText className="h-4 w-4" />
            View Summary
          </button>
          <button
            onClick={() => setIsManualTicketOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New ticket
          </button>
          {onDeleteMeeting && (
            <button
              onClick={() => setMeetingToDelete(meetingId)}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete meeting
            </button>
          )}
        </div>
      </div>

      {project && (
        <p className="text-sm text-muted-foreground mb-1">
          Project: <span className="text-foreground font-medium">{project.name}</span>
          <span className="mx-2">-</span>
          {project.meetings.length} meeting{project.meetings.length > 1 ? 's' : ''}
          <span className="mx-2">-</span>
          {project.files.length} files in repo
        </p>
      )}

      <p className="text-muted-foreground mb-8">{tickets.length} tickets extracted</p>

      <div className="space-y-4 mb-8">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-card rounded-2xl p-6 border border-border transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-lg font-playfair font-bold text-foreground">
                    {ticket.title}
                  </h3>
                  <Badge
                    className={
                      ticket.status === 'backlog'
                        ? 'bg-muted text-muted-foreground'
                        : ticket.status === 'in_progress'
                          ? 'bg-primary/20 text-primary'
                          : ticket.status === 'blocked'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-green-100 text-green-800'
                    }
                  >
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-6">
                  {ticket.description ? stripHtml(ticket.description) : 'No description provided.'}
                </p>
              </div>
              {savingTicketId === ticket.id && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              {savingTicketId !== ticket.id && (
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openTicketEditor(ticket)}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Update
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                <p className="uppercase tracking-wide">Status</p>
                <p className="mt-1 text-sm text-foreground">{ticket.status.replace('_', ' ')}</p>
              </div>

              <div className="text-xs text-muted-foreground">
                <p className="uppercase tracking-wide">Assignee</p>
                <p className="mt-1 text-sm text-foreground">
                  {ticket.assignee ? `@${ticket.assignee}` : 'Unassigned'}
                </p>
              </div>

              <div className="flex items-end justify-between gap-2 text-xs text-muted-foreground md:justify-end">
                <div>
                  <p className="uppercase tracking-wide">Meeting</p>
                  <button
                    onClick={() => onSelectMeeting(ticket.meeting_id)}
                    className="mt-1 text-primary hover:underline font-medium"
                  >
                    Open meeting
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-8">
        <span>{tickets.length} total tickets</span>
        <span>{blockedCount} blocked</span>
      </div>

      <ManualTicketDialog
        open={isManualTicketOpen}
        onOpenChange={setIsManualTicketOpen}
        meetings={[{ id: meetingId, projectName: meetingTitle }]}
        defaultMeetingId={meetingId}
        onCreated={fetchTickets}
      />

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
              Edit title, description, assignee, and status before confirming.
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
                <div className="mt-1">
                  <AssigneePicker
                    value={ticketEditForm.assignee}
                    onChange={(val) => setTicketEditForm((prev) => ({ ...prev, assignee: val }))}
                  />
                </div>
              </label>

              <label className="block text-sm text-muted-foreground">
                Status
                <select
                  value={ticketEditForm.status}
                  onChange={(e) =>
                    setTicketEditForm((prev) => ({
                      ...prev,
                      status: e.target.value as Ticket['status'],
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

            {ticketToEdit && (
              <div className="border-t border-border/60 pt-4">
                <TicketDependencyPanel
                  ticketId={ticketToEdit.id}
                  projectId={ticketToEdit.projectId ?? meetingData?.projectId}
                  projectTickets={tickets.map((t) => ({
                    id: t.id,
                    title: t.title,
                    status: t.status,
                  }))}
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
                setTicketToDelete(ticketToEdit.id);
                setTicketToEdit(null);
              }}
              className="rounded-full"
              disabled={Boolean(savingTicketId)}
            >
              Delete ticket
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTicketToEdit(null)}
              className="rounded-full"
              disabled={Boolean(savingTicketId)}
            >
              Discard changes
            </Button>
            <Button
              type="button"
              onClick={handleSaveTicketEdit}
              className="rounded-full"
              disabled={Boolean(savingTicketId) || ticketEditForm.title.trim().length === 0}
            >
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
        <DialogContent className="sm:max-w-xl border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Delete this ticket?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently remove the ticket from the workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTicketToDelete(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTicket}
              className="rounded-full"
            >
              Delete ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(meetingToDelete)}
        onOpenChange={(open) => {
          if (!open) setMeetingToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-xl border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Delete this meeting?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will remove the meeting from Supabase and unlink its tickets from the meeting.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setMeetingToDelete(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteMeeting}
              className="rounded-full"
            >
              Delete meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {blockerModalData && (
        <DependencyBlockerModal
          isOpen={blockerModalOpen}
          onClose={() => setBlockerModalOpen(false)}
          onGoToTicket={(ticketId) => {
            setBlockerModalOpen(false);
            const t = tickets.find((tk) => tk.id === ticketId);
            if (t) setTicketToEdit(t);
          }}
          onRevert={blockerModalData.onRevert}
          onProceed={blockerModalData.onProceed}
          message={blockerModalData.message}
          blockers={blockerModalData.blockers}
          isHardBlock={blockerModalData.isHardBlock}
        />
      )}

      {/* ── Meeting Summary Sheet ── */}
      <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
        <SheetContent className="w-full sm:max-w-lg border-l border-border bg-background overflow-y-auto p-0">
          {/* Header banner */}
          <div className="px-6 pt-8 pb-5 border-b border-border/60 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                AI Summary
              </span>
            </div>
            <SheetTitle className="font-playfair text-2xl text-foreground">
              Meeting Summary
            </SheetTitle>
            <SheetDescription className="text-muted-foreground mt-1">
              {meetingTitle}
            </SheetDescription>
          </div>

          <div className="px-6 py-6">
            {summaryLoading || summaryGenerating ? (
              <div className="flex items-center gap-3 text-muted-foreground py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">
                  {summaryGenerating ? 'Generating summary...' : 'Loading summary...'}
                </span>
              </div>
            ) : summary ? (
              <div className="space-y-5">
                <SummarySections text={summary} />

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Generated by AI · May contain inaccuracies
                  </p>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryGenerating}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors disabled:opacity-40"
                  >
                    <Sparkles className="w-3 h-3" />
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  No summary available yet. Generate one from the meeting transcript.
                </p>
                <button
                  onClick={handleGenerateSummary}
                  disabled={summaryGenerating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Summary
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Summary Section Parser ──────────────────────────────────────
function SummarySections({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);

  const sections: {
    title: string;
    items: string[];
    icon: React.ReactNode;
    color: string;
    bg: string;
  }[] = [];
  let current: { title: string; items: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^DECISIONS/i.test(trimmed)) {
      if (current)
        sections.push({
          ...current,
          icon: <Gavel className="w-3.5 h-3.5" />,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
        });
      current = { title: 'Decisions', items: [] };
    } else if (/^ACTION ITEMS/i.test(trimmed)) {
      if (current)
        sections.push({
          ...current,
          icon: <ListChecks className="w-3.5 h-3.5" />,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
        });
      current = { title: 'Action Items', items: [] };
    } else if (/^KEY POINTS/i.test(trimmed)) {
      if (current)
        sections.push({
          ...current,
          icon: <Lightbulb className="w-3.5 h-3.5" />,
          color: 'text-sky-500',
          bg: 'bg-sky-500/10',
        });
      current = { title: 'Key Points', items: [] };
    } else if (current && trimmed.startsWith('*')) {
      current.items.push(trimmed.replace(/^\*+\s*/, '').trim());
    } else if (current) {
      current.items.push(trimmed);
    }
  }
  if (current) {
    let icon = <Lightbulb className="w-3.5 h-3.5" />;
    let color = 'text-sky-500';
    let bg = 'bg-sky-500/10';
    if (current.title === 'Decisions') {
      icon = <Gavel className="w-3.5 h-3.5" />;
      color = 'text-amber-500';
      bg = 'bg-amber-500/10';
    }
    if (current.title === 'Action Items') {
      icon = <ListChecks className="w-3.5 h-3.5" />;
      color = 'text-emerald-500';
      bg = 'bg-emerald-500/10';
    }
    sections.push({ ...current, icon, color, bg });
  }

  // Fallback: if no sections parsed, render as plain text
  if (sections.length === 0) {
    return <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">{text}</div>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.title} className="bg-card rounded-2xl border border-border/60 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center ${section.bg}`}>
              <span className={section.color}>{section.icon}</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </span>
          </div>
          <ul className="space-y-2.5">
            {section.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-6 text-foreground">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${section.color.replace('text-', 'bg-')}`}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
