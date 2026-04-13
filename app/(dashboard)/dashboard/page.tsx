'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { FolderKanban, Video, Ticket, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { MeetingCards } from '@/components/meeting-cards';
import { TicketDetail } from '@/components/ticket-detail';
import { TicketsBoard } from '@/components/tickets-board';
import { ProjectsWorkspace } from '@/components/projects-workspace';
import { ProjectCreateDialog } from '@/components/project-create-dialog';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

type ViewType = 'dashboard' | 'meetings' | 'projects' | 'tickets' | 'ticket-detail';

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
  specsDetected: number;
  status: 'completed' | 'processing' | 'failed' | 'not_admitted';
  date: string;
  platform: string;
  deployUrl?: string | null;
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

function DashboardContent() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);
  const [isMeetingTicketOpen, setIsMeetingTicketOpen] = useState(false);
  const [meetingTicketMeetingId, setMeetingTicketMeetingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspace() {
      try {
        const [projectsRes, meetingsRes, ticketsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/meetings'),
          fetch('/api/tickets'),
        ]);

        if (!isMounted) return;

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        if (meetingsRes.ok) {
          const meetingsData = await meetingsRes.json();
          setMeetings(meetingsData);
        }

        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          setTickets(ticketsData);
        }
      } catch (error) {
        console.error('Failed to load workspace data:', error);
      }
    }

    void loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleViewChange(view: ViewType) {
    setCurrentView(view);
    if (view !== 'ticket-detail') setSelectedMeeting(null);
  }

  function handleMeetingSelect(meetingId: string) {
    setSelectedMeeting(meetingId);
    setCurrentView('ticket-detail');
  }

  function handleMeetingTicketCreate(meetingId: string) {
    setMeetingTicketMeetingId(meetingId);
    setIsMeetingTicketOpen(true);
  }

  async function handleDeleteMeeting(meetingId: string) {
    const res = await fetch(`/api/meetings/${meetingId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Failed to delete meeting');
    }

    await refreshWorkspace();
    setSelectedMeeting(null);
    setCurrentView('meetings');

    toast({ title: 'Meeting deleted', description: 'The meeting was removed from Supabase.' });
  }

  function handleProjectSelect(projectId: string) {
    if (!projectId) {
      setCurrentView('projects');
      return;
    }
    router.push(`/project?projectId=${projectId}&tab=kanban`);
  }

  async function handleDeleteProject(projectId: string) {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Failed to delete project');
    }

    await refreshWorkspace();
    toast({ title: 'Project deleted', description: 'The project was removed from Supabase.' });
  }

  const refreshWorkspace = useCallback(async () => {
    try {
      const [projectsRes, meetingsRes, ticketsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/meetings'),
        fetch('/api/tickets'),
      ]);

      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (meetingsRes.ok) setMeetings(await meetingsRes.json());
      if (ticketsRes.ok) setTickets(await ticketsRes.json());
    } catch (error) {
      console.error('Failed to refresh workspace data:', error);
    }
  }, []);

  async function handleCreateProject(payload: {
    name: string;
    context: string;
    deployUrl: string;
    branchBase: string;
  }) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Failed to create project');
    }

    const data = await res.json();
    await refreshWorkspace();
    router.push(`/project?projectId=${data.project.id}&tab=kanban`);
    toast({ title: 'Project created', description: `${data.project.name} is ready.` });
  }

  const doneCount = tickets.filter((t) => t.status === 'done').length;
  const completionPct = tickets.length ? Math.round((doneCount / tickets.length) * 100) : 0;

  const STATS = [
    { label: 'Projects', value: projects.length, Icon: FolderKanban, color: 'text-primary' },
    { label: 'Meetings', value: meetings.length, Icon: Video, color: 'text-blue-500' },
    { label: 'Tickets', value: tickets.length, Icon: Ticket, color: 'text-orange-500' },
    {
      label: 'Completion',
      value: `${completionPct}%`,
      Icon: CheckCircle2,
      color: 'text-emerald-500',
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentView={currentView}
        projects={projects}
        selectedProjectId={null}
        onSelectProject={handleProjectSelect}
        onCreateProject={() => setIsProjectCreateOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
          <h1 className="text-sm font-semibold text-foreground">
            {currentView === 'dashboard' && 'Dashboard'}
            {currentView === 'meetings' && 'Meetings'}
            {currentView === 'projects' && 'Projects'}
            {currentView === 'tickets' && 'Tickets'}
            {currentView === 'ticket-detail' && 'Meeting Tickets'}
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {/* ── DASHBOARD ── */}
          {currentView === 'dashboard' && (
            <div className="p-6 space-y-5 max-w-5xl mx-auto w-full">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Overview</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Your workspace at a glance</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {STATS.map(({ label, value, Icon, color }) => (
                  <Card key={label} className="border-border/60 shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-medium">{label}</span>
                        <Icon className={cn('h-4 w-4', color)} />
                      </div>
                      <p className="text-2xl font-semibold text-foreground">{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Projects */}
              <Card className="border-border/60 shadow-none">
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">Projects</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Jump back into your active workspaces
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 h-7"
                      onClick={() => handleViewChange('projects')}
                    >
                      View all <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {projects.length === 0 ? (
                    <div className="border border-dashed border-border rounded-lg p-8 text-center">
                      <FolderKanban className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">No projects yet</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Create a project to organise meetings and tickets.
                      </p>
                      <Button size="sm" onClick={() => setIsProjectCreateOpen(true)}>
                        Create project
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {projects.slice(0, 6).map((project) => {
                        const pTickets = tickets.filter((t) => t.projectId === project.id).length;
                        const pMeetings = meetings.filter((m) => m.projectId === project.id).length;
                        return (
                          <button
                            key={project.id}
                            onClick={() => handleProjectSelect(project.id)}
                            className="text-left rounded-lg border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
                          >
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                <FolderKanban className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {project.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {project.repo || 'No repo set'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Video className="h-3 w-3" /> {pMeetings} meetings
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="h-3 w-3" /> {pTickets} tickets
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meetings */}
              <Card className="border-border/60 shadow-none">
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold">Recent Meetings</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Your latest recorded sessions
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 h-7"
                      onClick={() => handleViewChange('meetings')}
                    >
                      View all <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {meetings.length === 0 ? (
                    <div className="border border-dashed border-border rounded-lg p-8 text-center">
                      <Video className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">No meetings yet</p>
                      <p className="text-xs text-muted-foreground">
                        Start a meeting from a project to begin collecting tickets.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {meetings.slice(0, 5).map((meeting) => (
                        <button
                          key={meeting.id}
                          onClick={() => handleMeetingSelect(meeting.id)}
                          className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-muted/50 px-2 -mx-2 rounded-md transition-colors"
                        >
                          <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Video className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {meeting.projectName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {meeting.platform} · {new Date(meeting.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={meeting.status === 'completed' ? 'default' : 'secondary'}
                            className="text-[10px] shrink-0"
                          >
                            {meeting.status}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── MEETINGS ── */}
          {currentView === 'meetings' && (
            <div className="p-6">
              <div className="max-w-5xl mx-auto">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-foreground">Meetings</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    All your recorded meeting sessions
                  </p>
                </div>
                <MeetingCards
                  onSelectMeeting={handleMeetingSelect}
                  onCreateTicket={handleMeetingTicketCreate}
                />
              </div>
            </div>
          )}

          {/* ── TICKETS ── */}
          {currentView === 'tickets' && (
            <div className="p-6">
              <div className="max-w-5xl mx-auto">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-foreground">Tickets</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    All extracted tickets across every meeting
                  </p>
                </div>
                <TicketsBoard
                  onSelectMeeting={handleMeetingSelect}
                  onSelectProject={handleProjectSelect}
                  onSaved={refreshWorkspace}
                />
              </div>
            </div>
          )}

          {/* ── TICKET DETAIL ── */}
          {currentView === 'ticket-detail' && selectedMeeting && (
            <div className="p-6 max-w-5xl mx-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewChange('meetings')}
                className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
              >
                ← Back to Meetings
              </Button>
              <TicketDetail
                meetingId={selectedMeeting}
                onSelectMeeting={handleMeetingSelect}
                onDeleteMeeting={handleDeleteMeeting}
              />
            </div>
          )}

          {/* ── PROJECTS ── */}
          {currentView === 'projects' && (
            <div className="p-6">
              <ProjectsWorkspace
                projects={projects}
                meetings={meetings}
                tickets={tickets}
                selectedProjectId={null}
                onSelectProject={handleProjectSelect}
                onSelectMeeting={handleMeetingSelect}
                onCreateProject={() => setIsProjectCreateOpen(true)}
                onDeleteProject={handleDeleteProject}
                onRefresh={refreshWorkspace}
              />
            </div>
          )}
        </main>
      </div>

      <ProjectCreateDialog
        open={isProjectCreateOpen}
        onOpenChange={setIsProjectCreateOpen}
        onCreate={handleCreateProject}
      />

      <ManualTicketDialog
        open={isMeetingTicketOpen}
        onOpenChange={setIsMeetingTicketOpen}
        meetings={meetings.map((meeting) => ({ id: meeting.id, projectName: meeting.projectName }))}
        defaultMeetingId={meetingTicketMeetingId}
        onCreated={refreshWorkspace}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
