'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { TicketDependencyPanel } from '@/components/ticket-dependency-panel';
import { TicketDependencyGraph } from '@/components/ticket-dependency-graph';
import { ProjectTicketImportDialog } from '@/components/project-ticket-import-dialog';
import { ProjectMeetingDialog } from '@/components/project-meeting-dialog';
import {
  FolderKanban,
  Plus,
  Video,
  Ticket,
  ArrowRight,
  Sparkles,
  Download,
  Pencil,
  Trash2,
  GitBranch,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  repo: string;
  deployUrl?: string | null;
  meetings: string[];
  ticketIds: string[];
  files: string[];
  context: string;
  updatedAt?: string;
}

interface Meeting {
  id: string;
  projectName: string;
  meetingId: string;
  projectId?: string | null;
  status: 'completed' | 'processing' | 'failed' | 'not_admitted';
  date: string;
  platform: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in_progress' | 'done' | 'blocked';
  assignee?: string | null;
  projectId?: string | null;
  meeting_id: string | null;
}

interface ProjectsWorkspaceProps {
  projects: Project[];
  meetings: Meeting[];
  tickets: Ticket[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onSelectMeeting: (meetingId: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (projectId: string) => Promise<void> | void;
  onRefresh: () => Promise<void> | void;
}

export function ProjectsWorkspace({
  projects,
  meetings,
  tickets,
  selectedProjectId,
  onSelectProject,
  onSelectMeeting,
  onCreateProject,
  onDeleteProject,
  onRefresh,
}: ProjectsWorkspaceProps) {
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket | null>(null);
  const [ticketEditForm, setTicketEditForm] = useState({
    title: '',
    description: '',
    assignee: '',
    status: 'backlog' as Ticket['status'],
  });
  const [savingTicketId, setSavingTicketId] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const projectMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.projectId === selectedProject?.id),
    [meetings, selectedProject?.id]
  );

  const projectTickets = useMemo(
    () => tickets.filter((ticket) => ticket.projectId === selectedProject?.id),
    [tickets, selectedProject?.id]
  );

  const projectMeetingIdSet = useMemo(
    () => new Set(projectMeetings.map((meeting) => meeting.id)),
    [projectMeetings]
  );

  const meetingNameById = useMemo(
    () => new Map(meetings.map((meeting) => [meeting.id, meeting.projectName])),
    [meetings]
  );

  const totalTickets = projectTickets.length;
  const readyTickets = projectTickets.filter(
    (ticket) => ticket.status === 'in_progress' || ticket.status === 'done'
  ).length;

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

    setSavingTicketId(ticketToEdit.id);
    try {
      let res = await fetch(`/api/tickets/${ticketToEdit.id}`, {
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

        if (res.status === 422 && data?.error === 'soft_blocked') {
          const proceed = window.confirm(
            `${data?.message || 'This move has unresolved soft dependencies.'}\n\nProceed anyway?`
          );
          if (proceed) {
            res = await fetch(`/api/tickets/${ticketToEdit.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: ticketEditForm.title.trim(),
                description: ticketEditForm.description.trim(),
                assignee: ticketEditForm.assignee.trim() || null,
                status: ticketEditForm.status,
                bypassGate: true,
              }),
            });
          }
        }

        if (!res.ok) {
          const finalData = await res.json().catch(() => data || {});
          if (res.status === 422 && finalData?.error === 'hard_blocked') {
            window.alert(finalData?.message || 'Blocked by unresolved hard dependencies.');
            return;
          }
          if (res.status === 422 && finalData?.error === 'soft_blocked') {
            window.alert(finalData?.message || 'Blocked by unresolved soft dependencies.');
            return;
          }
          throw new Error(finalData?.error || 'Failed to update ticket');
        }
      }

      setTicketToEdit(null);
      await onRefresh();
    } finally {
      setSavingTicketId(null);
    }
  }

  async function handleDeleteTicket() {
    if (!ticketToDelete) return;

    setSavingTicketId(ticketToDelete.id);
    try {
      const res = await fetch(`/api/tickets/${ticketToDelete.id}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete ticket');
      }

      setTicketToDelete(null);
      await onRefresh();
    } finally {
      setSavingTicketId(null);
    }
  }

  useEffect(() => {
    if (!selectedProject) return;

    let active = true;
    const refresh = async () => {
      if (!active) return;
      await onRefresh();
    };

    const interval = setInterval(refresh, 5000);
    refresh();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [onRefresh, selectedProject?.id]);

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
              <FolderKanban className="h-3.5 w-3.5" />
              Projects
            </div>
            <h1 className="text-4xl font-playfair font-bold text-foreground">Your projects</h1>
            <p className="text-muted-foreground mt-2">
              Create a workspace, link meetings, and write tickets like Jira.
            </p>
          </div>

          <Button onClick={onCreateProject} className="rounded-full gap-2">
            <Plus className="h-4 w-4" />
            New project
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 border border-border text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderKanban className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-playfair font-bold text-foreground mb-2">
              No projects yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Create your first project to start organizing meetings and tickets.
            </p>
            <Button onClick={onCreateProject} className="rounded-full gap-2">
              <Sparkles className="h-4 w-4" />
              Create project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => {
              const projectTicketCount = tickets.filter(
                (ticket) => ticket.projectId === project.id
              ).length;
              const projectMeetingCount = meetings.filter(
                (meeting) => meeting.projectId === project.id
              ).length;

              return (
                <Card
                  key={project.id}
                  className="cursor-pointer border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                  onClick={() => onSelectProject(project.id)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="font-playfair text-xl text-foreground">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm text-muted-foreground">
                          {project.repo}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary border border-primary/10">
                        {projectMeetingCount} meetings
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.25rem]">
                      {project.context || 'No project context yet.'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{projectTicketCount} tickets</span>
                      <span>{project.files.length} files</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      Open project <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
            <FolderKanban className="h-3.5 w-3.5" />
            Project workspace
          </div>
          <h1 className="text-4xl font-playfair font-bold text-foreground">
            {selectedProject.name}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-3xl">
            {selectedProject.context || 'Add context so every meeting and ticket stays aligned.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={onCreateProject}
            className="rounded-full gap-2 bg-white"
          >
            <Plus className="h-4 w-4" />
            New project
          </Button>
          <Button onClick={() => setIsMeetingDialogOpen(true)} className="rounded-full gap-2">
            <Video className="h-4 w-4" />
            Start meeting
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
            className="rounded-full gap-2 bg-white"
          >
            <Download className="h-4 w-4" />
            Import tickets
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsTicketDialogOpen(true)}
            className="rounded-full gap-2"
          >
            <Ticket className="h-4 w-4" />
            New ticket
          </Button>
          <Button
            variant="destructive"
            onClick={() => setProjectToDelete(selectedProject)}
            className="rounded-full gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="font-playfair text-2xl">Project timeline</CardTitle>
            <CardDescription>Meetings linked to this project, ordered by creation.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {projectMeetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-[#faf8f4] p-8 text-center">
                <p className="font-medium text-foreground mb-2">No meetings yet</p>
                <p className="text-sm text-muted-foreground mb-5">
                  Start a project meeting to begin collecting tickets.
                </p>
                <Button onClick={() => setIsMeetingDialogOpen(true)} className="rounded-full gap-2">
                  <Video className="h-4 w-4" />
                  Start first meeting
                </Button>
              </div>
            ) : (
              projectMeetings.map((meeting) => (
                <button
                  key={meeting.id}
                  onClick={() => onSelectMeeting(meeting.id)}
                  className="w-full text-left rounded-2xl border border-border bg-white p-4 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-playfair text-lg font-bold text-foreground">
                        {meeting.projectName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {meeting.platform} • {new Date(meeting.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={
                        meeting.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : meeting.status === 'not_admitted'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-primary/10 text-primary'
                      }
                      title={
                        meeting.status === 'not_admitted'
                          ? 'Syntheon AI not admitted to meeting'
                          : undefined
                      }
                    >
                      {meeting.status === 'not_admitted' ? '!' : meeting.status}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border/70">
            <CardTitle className="font-playfair text-2xl">Project summary</CardTitle>
            <CardDescription>Jira-style control panel for this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#faf8f4] border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Meetings
                </p>
                <p className="text-2xl font-playfair font-bold text-foreground">
                  {projectMeetings.length}
                </p>
              </div>
              <div className="rounded-2xl bg-[#faf8f4] border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Tickets
                </p>
                <p className="text-2xl font-playfair font-bold text-foreground">{totalTickets}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ready to ship</span>
                <span className="font-medium text-foreground">{readyTickets}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${totalTickets ? Math.min(100, (readyTickets / totalTickets) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-[#faf8f4] p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Repo</p>
              <p className="font-medium text-foreground break-all">{selectedProject.repo}</p>
              {selectedProject.deployUrl && (
                <p className="text-sm text-muted-foreground break-all">
                  {selectedProject.deployUrl}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-[#faf8f4] p-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Files</p>
              <p className="text-sm text-foreground">
                {selectedProject.files.length} tracked files
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedProject.ticketIds.length} linked tickets
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border/70">
          <CardTitle className="font-playfair text-2xl">Project tickets</CardTitle>
          <CardDescription>
            All tickets attached to this project, including manual entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {projectTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-[#faf8f4] p-8 text-center">
              <p className="font-medium text-foreground mb-2">No tickets yet</p>
              <p className="text-sm text-muted-foreground mb-5">
                Import tickets from any meeting to populate this project.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => setIsImportDialogOpen(true)}
                  className="rounded-full gap-2"
                  disabled={meetings.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Import tickets from meeting
                </Button>
                <Button
                  onClick={() => setIsMeetingDialogOpen(true)}
                  variant="outline"
                  className="rounded-full gap-2 bg-white"
                >
                  <Video className="h-4 w-4" />
                  Start meeting
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectTickets.map((ticket) => {
                const hasMeetingLink = Boolean(ticket.meeting_id);

                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      if (ticket.meeting_id) onSelectMeeting(ticket.meeting_id);
                    }}
                    onKeyDown={(e) => {
                      if (!ticket.meeting_id) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectMeeting(ticket.meeting_id);
                      }
                    }}
                    role={hasMeetingLink ? 'button' : undefined}
                    tabIndex={hasMeetingLink ? 0 : -1}
                    className={`rounded-2xl border border-border bg-white p-4 text-left transition-all ${
                      hasMeetingLink ? 'hover:border-primary/30 hover:shadow-md' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-playfair text-lg font-bold text-foreground">
                        {ticket.title}
                      </h3>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openTicketEditor(ticket)}
                          className="rounded-full border border-primary/20 bg-primary/5 p-2 text-primary hover:bg-primary/10"
                          aria-label="Update ticket"
                          disabled={savingTicketId === ticket.id}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {ticket.meeting_id && !projectMeetingIdSet.has(ticket.meeting_id) && (
                      <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-primary">
                        Imported • {meetingNameById.get(ticket.meeting_id) || 'Meeting'}
                      </p>
                    )}
                    {!ticket.meeting_id && (
                      <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Manual project ticket
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {ticket.description || 'No description provided.'}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{ticket.assignee ? `@${ticket.assignee}` : 'Unassigned'}</span>
                      <span className="text-primary font-medium">
                        {hasMeetingLink ? 'Open meeting' : 'Project-only'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border/70">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle className="font-playfair text-2xl">Dependency graph</CardTitle>
          </div>
          <CardDescription>Visual map of ticket relationships and blocking chains.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <TicketDependencyGraph projectId={selectedProject.id} />
        </CardContent>
      </Card>

      <ProjectMeetingDialog
        open={isMeetingDialogOpen}
        onOpenChange={setIsMeetingDialogOpen}
        projectId={selectedProject.id}
        onCreated={onRefresh}
      />

      <ManualTicketDialog
        open={isTicketDialogOpen}
        onOpenChange={setIsTicketDialogOpen}
        meetings={projectMeetings.map((meeting) => ({
          id: meeting.id,
          projectName: meeting.projectName,
        }))}
        defaultMeetingId={projectMeetings[0]?.id}
        defaultProjectId={selectedProject.id}
        projectOnly
        onCreated={onRefresh}
      />

      <ProjectTicketImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        projectId={selectedProject.id}
        meetings={meetings}
        tickets={tickets}
        onCreated={onRefresh}
      />

      <Dialog
        open={Boolean(ticketToEdit)}
        onOpenChange={(open) => {
          if (!open) setTicketToEdit(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl border-border bg-[#f9f6f1] shadow-2xl">
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

            {ticketToEdit && ticketToEdit.projectId && (
              <div className="border-t border-border/60 pt-4">
                <TicketDependencyPanel
                  ticketId={ticketToEdit.id}
                  projectId={ticketToEdit.projectId}
                  projectTickets={projectTickets.map((t) => ({
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
                setTicketToDelete(ticketToEdit);
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
        <DialogContent className="sm:max-w-xl border-border bg-[#f9f6f1] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Delete this ticket?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently remove &quot;{ticketToDelete?.title}&quot; from this project.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTicketToDelete(null)}
              className="rounded-full"
              disabled={Boolean(savingTicketId)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTicket}
              className="rounded-full"
              disabled={Boolean(savingTicketId)}
            >
              Delete ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(projectToDelete)}
        onOpenChange={(open) => {
          if (!open) setProjectToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-xl border-border bg-[#f9f6f1] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground">
              Delete this project?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will remove the project from Supabase and unlink its meetings and tickets from
              the project. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setProjectToDelete(null)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                if (!projectToDelete) return;
                await onDeleteProject(projectToDelete.id);
                setProjectToDelete(null);
              }}
              className="rounded-full"
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
