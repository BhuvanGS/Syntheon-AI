'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { ProjectMeetingDialog } from '@/components/project-meeting-dialog';
import { FolderKanban, Plus, Video, Ticket, ArrowRight, Sparkles } from 'lucide-react';

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
  status: 'completed' | 'processing' | 'failed';
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
  meeting_id: string;
}

interface ProjectsWorkspaceProps {
  projects: Project[];
  meetings: Meeting[];
  tickets: Ticket[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onSelectMeeting: (meetingId: string) => void;
  onCreateProject: () => void;
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
  onRefresh,
}: ProjectsWorkspaceProps) {
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);

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

  const totalTickets = projectTickets.length;
  const readyTickets = projectTickets.filter(
    (ticket) => ticket.status === 'in_progress' || ticket.status === 'done'
  ).length;

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
            variant="secondary"
            onClick={() => setIsTicketDialogOpen(true)}
            className="rounded-full gap-2"
            disabled={projectMeetings.length === 0}
          >
            <Ticket className="h-4 w-4" />
            New ticket
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
                          : 'bg-primary/10 text-primary'
                      }
                    >
                      {meeting.status}
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
                Create a meeting first, then write manual tickets against it.
              </p>
              <Button
                onClick={() => setIsTicketDialogOpen(true)}
                className="rounded-full gap-2"
                disabled={projectMeetings.length === 0}
              >
                <Ticket className="h-4 w-4" />
                New ticket
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => onSelectMeeting(ticket.meeting_id)}
                  className="rounded-2xl border border-border bg-white p-4 text-left hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-playfair text-lg font-bold text-foreground">
                      {ticket.title}
                    </h3>
                    <Badge
                      className={
                        ticket.status === 'done'
                          ? 'bg-green-100 text-green-800'
                          : ticket.status === 'blocked'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-primary/10 text-primary'
                      }
                    >
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ticket.description || 'No description provided.'}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{ticket.assignee ? `@${ticket.assignee}` : 'Unassigned'}</span>
                    <span className="text-primary font-medium">Open meeting</span>
                  </div>
                </button>
              ))}
            </div>
          )}
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
        onCreated={onRefresh}
      />
    </div>
  );
}
