'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FolderKanban,
  Video,
  Ticket,
  CheckCircle2,
  Users,
  Clock,
  AlertCircle,
  CalendarClock,
  Flame,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { MeetingCards } from '@/components/meeting-cards';
import { TicketDetail } from '@/components/ticket-detail';
import { TicketsBoard } from '@/components/tickets-board';
import { ProjectsWorkspace } from '@/components/projects-workspace';
import { ProjectCreateDialog } from '@/components/project-create-dialog';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { DynamicIslandSearch } from '@/components/dynamic-island-search';
import { NotificationBell } from '@/components/notification-bell';
import { GanttCalendar } from '@/components/gantt-calendar';
import { DashboardGrid } from '@/components/dashboard-grid';
import { LoadingMessage } from '@/components/loading-message';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useUser, useOrganization } from '@clerk/nextjs';
import { onCommand, emitCommand } from '@/lib/command-events';
import { FeedbackView } from '@/components/feedback-view';
import {
  useInvalidateWorkspace,
  useMeetingsQuery,
  useProjectsQuery,
  useTicketsQuery,
} from '@/hooks/use-workspace-queries';

type ViewType =
  | 'dashboard'
  | 'meetings'
  | 'projects'
  | 'tickets'
  | 'ticket-detail'
  | 'members'
  | 'calendar'
  | 'feedback';

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
  status: string;
  user_id?: string | null;
  assignee?: string | null;
  assignee_user_id?: string | null;
  projectId?: string | null;
  meeting_id: string | null;
  due_date?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface OrgMember {
  id: string;
  userId: string;
  role: string;
  identifier: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { membership, organization } = useOrganization();
  const isAdmin = membership?.role === 'org:admin';
  // Admin-only: load memberships lazily
  const orgQueryConfig = useMemo(
    () => (isAdmin ? { memberships: { infinite: true, pageSize: 50 } } : {}),
    [isAdmin]
  );
  const { memberships } = useOrganization(orgQueryConfig);

  // Drive view from URL — no state needed, avoids sync delay
  const currentView: ViewType = (searchParams.get('view') as ViewType) || 'dashboard';

  const membershipReady = membership !== undefined;
  const projectsQuery = useProjectsQuery(membershipReady);
  const meetingsQuery = useMeetingsQuery({ limit: 50 }, membershipReady);
  const ticketsQuery = useTicketsQuery({ limit: 50 }, membershipReady);
  const invalidateWorkspace = useInvalidateWorkspace();

  const projects = (projectsQuery.data ?? []) as Project[];
  const meetings = (meetingsQuery.data?.items ?? []) as Meeting[];
  const tickets = (ticketsQuery.data?.items ?? []) as Ticket[];

  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);
  const [isMeetingTicketOpen, setIsMeetingTicketOpen] = useState(false);
  const [meetingTicketMeetingId, setMeetingTicketMeetingId] = useState<string | null>(null);

  const memoizedMeetingOptions = useMemo(
    () => meetings.map((m) => ({ id: m.id, projectName: m.projectName })),
    [meetings]
  );

  // Listen for create:ticket command from global search (works on any view)
  useEffect(() => {
    return onCommand('create:ticket', () => {
      setMeetingTicketMeetingId(null);
      setIsMeetingTicketOpen(true);
    });
  }, []);

  // Listen for filter:open-dialog — switch to tickets view, then re-emit so the mounted component catches it
  useEffect(() => {
    return onCommand('filter:open-dialog', () => {
      if (currentView !== 'tickets' && currentView !== 'projects') {
        handleViewChange('tickets');
        setTimeout(() => emitCommand('filter:open-dialog'), 200);
      }
    });
  }, [currentView]);

  const refreshWorkspace = useCallback(async () => {
    await invalidateWorkspace();
  }, [invalidateWorkspace]);

  function handleViewChange(view: ViewType) {
    if (view === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard?view=${view}`);
    }
    if (view !== 'ticket-detail') setSelectedMeeting(null);
  }

  function handleMeetingSelect(meetingId: string) {
    setSelectedMeeting(meetingId);
    router.push(`/dashboard?view=ticket-detail&meetingId=${meetingId}`);
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
    router.push('/dashboard?view=meetings');

    toast({
      title: 'Meeting deleted',
      description: 'The meeting was removed from your workspace.',
    });
  }

  function handleProjectSelect(projectId: string) {
    if (!projectId) {
      router.push('/dashboard?view=projects');
      return;
    }
    router.push(`/project?projectId=${projectId}&tab=tickets`);
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
    toast({
      title: 'Project deleted',
      description: 'The project was removed from your workspace.',
    });
  }

  async function handleCreateProject(payload: { name: string; context: string }) {
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
    router.push(`/project?projectId=${data.project.id}&tab=tickets`);
    toast({ title: 'Project created', description: `${data.project.name} is ready.` });
  }

  const doneCount = tickets.filter((t) => t.status === 'done').length;
  const completionPct = tickets.length ? Math.round((doneCount / tickets.length) * 100) : 0;

  // My tickets (assigned to me)
  const myTickets = tickets.filter((t) => t.assignee_user_id === user?.id);
  const myDone = myTickets.filter((t) => t.status === 'done').length;
  const myInProgress = myTickets.filter((t) => t.status === 'in_progress').length;
  const myOverdue = myTickets.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length;
  const myBlocked = myTickets.filter((t) => t.status === 'blocked').length;
  const myBacklog = myTickets.filter((t) => t.status === 'backlog').length;
  const myUpcoming = myTickets
    .filter((t) => t.due_date && t.status !== 'done' && new Date(t.due_date) >= new Date())
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);
  const myRecentActivity = myTickets
    .filter((t) => t.updatedAt || t.createdAt)
    .map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      kind: t.status === 'done' ? 'completed' : ('updated' as const),
      timestamp: t.updatedAt || t.createdAt!,
      projectName: projects.find((p) => p.id === t.projectId)?.name ?? 'Unassigned',
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);
  const myThroughputData = useMemo(() => {
    const days: { label: string; completed: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      const completed = myTickets.filter((t) => {
        if (!t.updatedAt || t.status !== 'done') return false;
        const c = new Date(t.updatedAt);
        return c >= d && c < next;
      }).length;
      days.push({ label, completed });
    }
    return days;
  }, [myTickets]);
  const myLast7Completed = myThroughputData.slice(7).reduce((s, d) => s + d.completed, 0);

  // Per-member workload for admin
  const orgMembers = memberships?.data ?? [];

  return (
    <div className="app flex h-screen bg-background">
      <Sidebar
        currentView={currentView}
        projects={projects}
        selectedProjectId={null}
        onSelectProject={handleProjectSelect}
        onCreateProject={() => setIsProjectCreateOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6 sm:px-8">
          <h1 className="text-[13px] font-medium tracking-[-0.01em] text-muted-foreground">
            {currentView === 'dashboard' && (isAdmin ? 'Organization' : 'Home')}
            {currentView === 'meetings' && 'Meetings'}
            {currentView === 'projects' && 'Projects'}
            {currentView === 'tickets' && 'Tickets'}
            {currentView === 'members' && 'Members'}
            {currentView === 'calendar' && 'Future Viz'}
            {currentView === 'ticket-detail' && 'Meeting tickets'}
            {currentView === 'feedback' && 'Feedback'}
          </h1>
          <div className="flex items-center gap-2">
            <NotificationBell onNavigateToTicket={() => handleViewChange('tickets')} />
            <DynamicIslandSearch
              onSelectTicket={(id) => {
                const t = tickets.find((x) => x.id === id);
                if (t?.meeting_id) {
                  setSelectedMeeting(t.meeting_id);
                  handleViewChange('ticket-detail');
                } else {
                  handleViewChange('tickets');
                }
              }}
              onSelectMeeting={(id) => {
                setSelectedMeeting(id);
                handleViewChange('ticket-detail');
              }}
              onSelectProject={(id) => handleProjectSelect(id)}
            />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {/* ── ADMIN DASHBOARD ── */}
          {currentView === 'dashboard' && isAdmin && (
            <DashboardGrid
              organizationName={organization?.name}
              projects={projects}
              meetings={meetings}
              tickets={tickets}
              orgMembers={orgMembers}
            />
          )}

          {/* ── MEMBER DASHBOARD ── */}
          {currentView === 'dashboard' && !isAdmin && (
            <div className="app-page max-w-4xl">
              <header>
                <p className="app-eyebrow">Personal</p>
                <h2 className="app-title mt-2">Hey {user?.firstName ?? 'there'}</h2>
                <p className="app-subtitle">
                  Your work at a glance — tickets, deadlines, and projects.
                </p>
              </header>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {[
                  {
                    label: 'My tickets',
                    value: myTickets.length,
                    sub: `${myBacklog} in backlog`,
                  },
                  {
                    label: 'In progress',
                    value: myInProgress,
                    sub: myBlocked > 0 ? `${myBlocked} blocked` : 'None blocked',
                    alert: myBlocked > 0,
                  },
                  {
                    label: 'Completed · 7d',
                    value: myLast7Completed,
                    sub: `${myDone} all-time`,
                  },
                  {
                    label: 'Overdue',
                    value: myOverdue,
                    sub: myOverdue > 0 ? 'Needs attention' : 'All on time',
                    alert: myOverdue > 0,
                  },
                ].map(({ label, value, sub, alert }) => (
                  <div key={label} className="app-kpi">
                    <span className="app-kpi-label">{label}</span>
                    <p className={cn('app-kpi-value', alert && 'text-red-400')}>{value}</p>
                    <p className="app-kpi-sub">{sub}</p>
                  </div>
                ))}
              </div>

              {myBlocked > 0 && (
                <section className="app-panel app-panel-pad">
                  <h3 className="app-section-label">
                    {myBlocked} ticket{myBlocked > 1 ? 's' : ''} blocked
                  </h3>
                  <p className="app-section-hint">Unblock these to keep momentum</p>
                  <div className="mt-3 space-y-0.5">
                    {myTickets
                      .filter((t) => t.status === 'blocked')
                      .slice(0, 3)
                      .map((t) => (
                        <div key={t.id} className="app-row">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                            {t.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {projects.find((p) => p.id === t.projectId)?.name ?? 'Unassigned'}
                          </span>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
                <section className="app-panel app-panel-pad">
                  <h3 className="app-section-label">Upcoming deadlines</h3>
                  <p className="app-section-hint">Next due tickets</p>
                  <div className="mt-3 space-y-0.5">
                    {myUpcoming.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 className="mb-2 h-6 w-6 text-emerald-400/60" />
                        <p className="text-[13px] text-muted-foreground">No upcoming deadlines</p>
                      </div>
                    ) : (
                      myUpcoming.map((t) => {
                        const daysLeft = Math.ceil(
                          (new Date(t.due_date!).getTime() - Date.now()) / 86400000
                        );
                        return (
                          <div key={t.id} className="app-row">
                            <span
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold tabular-nums',
                                daysLeft <= 1
                                  ? 'bg-red-500/10 text-red-400'
                                  : daysLeft <= 3
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-white/[0.06] text-foreground'
                              )}
                            >
                              {daysLeft}d
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-foreground">
                                {t.title}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {projects.find((p) => p.id === t.projectId)?.name ?? 'Unassigned'} ·{' '}
                                {new Date(t.due_date!).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="app-panel app-panel-pad">
                  <h3 className="app-section-label">Recent activity</h3>
                  <p className="app-section-hint">Your latest ticket updates</p>
                  <div className="mt-3 max-h-[240px] space-y-0.5 overflow-y-auto">
                    {myRecentActivity.length === 0 ? (
                      <p className="py-8 text-center text-[13px] text-muted-foreground">
                        No recent activity
                      </p>
                    ) : (
                      myRecentActivity.map((item, i) => (
                        <div key={`${item.id}-${i}`} className="app-row">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                            {item.kind === 'completed' ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Circle className="h-3 w-3 text-foreground/50" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] text-foreground">
                              <span className="text-muted-foreground">{item.kind}</span>{' '}
                              <span className="font-medium">{item.title}</span>
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {item.projectName}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <section className="app-panel app-panel-pad">
                <h3 className="app-section-label">My tickets</h3>
                <p className="app-section-hint">Assigned to you</p>
                <div className="mt-3 space-y-0.5">
                  {myTickets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
                      <Ticket className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
                      <p className="text-[13px] text-muted-foreground">
                        No tickets assigned to you yet.
                      </p>
                    </div>
                  ) : (
                    myTickets.slice(0, 8).map((ticket) => (
                      <div key={ticket.id} className="app-row">
                        <span
                          className={cn(
                            'shrink-0 text-[11px] font-medium capitalize',
                            ticket.status === 'done' && 'text-emerald-400',
                            ticket.status === 'in_progress' && 'text-foreground',
                            ticket.status === 'blocked' && 'text-red-400',
                            ticket.status === 'backlog' && 'text-muted-foreground'
                          )}
                        >
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <p className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                          {ticket.title}
                        </p>
                        {ticket.due_date && (
                          <span
                            className={cn(
                              'flex shrink-0 items-center gap-1 text-[11px]',
                              new Date(ticket.due_date) < new Date() && ticket.status !== 'done'
                                ? 'text-red-400'
                                : 'text-muted-foreground'
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {new Date(ticket.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="app-panel app-panel-pad">
                <h3 className="app-section-label">My projects</h3>
                <p className="app-section-hint">Projects you&apos;re part of</p>
                <div className="mt-3">
                  {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
                      <FolderKanban className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
                      <p className="text-[13px] text-muted-foreground">No projects assigned yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {projects.slice(0, 4).map((project) => {
                        const pTickets = myTickets.filter((t) => t.projectId === project.id);
                        const pDone = pTickets.filter((t) => t.status === 'done').length;
                        const pPct = pTickets.length
                          ? Math.round((pDone / pTickets.length) * 100)
                          : 0;
                        return (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleProjectSelect(project.id)}
                            className="app-row w-full text-left"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                              <FolderKanban className="h-3.5 w-3.5 text-foreground/70" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-foreground">
                                {project.name}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {pTickets.length} tickets assigned to me
                              </p>
                              {pTickets.length > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Progress value={pPct} className="h-1 flex-1" />
                                  <span className="text-[11px] tabular-nums text-muted-foreground">
                                    {pDone}/{pTickets.length}
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ── MEMBERS (admin only) ── */}
          {currentView === 'members' && isAdmin && (
            <div className="p-6 max-w-4xl mx-auto w-full space-y-5">
              <div className="mb-1">
                <h2 className="text-xl font-semibold text-foreground">Team Members</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Workload & ticket distribution across {organization?.name ?? 'your org'}
                </p>
              </div>

              {/* Team summary stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Total Members',
                    value: orgMembers.length,
                    Icon: Users,
                    color: 'text-purple-500',
                  },
                  {
                    label: 'Total Tickets',
                    value: tickets.length,
                    Icon: Ticket,
                    color: 'text-orange-500',
                  },
                  {
                    label: 'Unassigned',
                    value: tickets.filter((t) => !t.assignee_user_id).length,
                    Icon: AlertCircle,
                    color: 'text-amber-500',
                  },
                  {
                    label: 'Blocked',
                    value: tickets.filter((t) => t.status === 'blocked').length,
                    Icon: Flame,
                    color: 'text-red-500',
                  },
                ].map(({ label, value, Icon, color }) => (
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

              <Card className="border-border/60 shadow-none">
                <CardContent className="p-0">
                  {orgMembers.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">No members yet</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Go to Settings to generate an invite link for your team.
                      </p>
                      <Button size="sm" onClick={() => router.push('/settings')}>
                        Go to Settings
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {orgMembers.map((m) => {
                        const memberTickets = tickets.filter(
                          (t) => t.assignee_user_id === m.publicUserData?.userId
                        );
                        const done = memberTickets.filter((t) => t.status === 'done').length;
                        const inProg = memberTickets.filter(
                          (t) => t.status === 'in_progress'
                        ).length;
                        const blocked = memberTickets.filter((t) => t.status === 'blocked').length;
                        const overdue = memberTickets.filter(
                          (t) =>
                            t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
                        ).length;
                        const stale = memberTickets.filter((t) => {
                          if (t.status === 'done') return false;
                          const ref = t.updatedAt || t.createdAt;
                          if (!ref) return false;
                          return Math.floor((Date.now() - new Date(ref).getTime()) / 86400000) >= 3;
                        }).length;
                        const open = memberTickets.length - done;
                        const pct = memberTickets.length
                          ? Math.round((done / memberTickets.length) * 100)
                          : 0;
                        const name =
                          [m.publicUserData?.firstName, m.publicUserData?.lastName]
                            .filter(Boolean)
                            .join(' ') ||
                          m.publicUserData?.identifier?.split('@')[0] ||
                          'Member';
                        return (
                          <div key={m.id} className="px-5 py-4">
                            <div className="flex items-center gap-4 mb-3">
                              <Avatar className="h-9 w-9 shrink-0">
                                <AvatarImage src={m.publicUserData?.imageUrl} />
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                  {name[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {m.publicUserData?.identifier}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {m.role === 'org:admin' ? 'Admin' : 'Member'}
                              </Badge>
                            </div>

                            {/* Workload bar */}
                            {memberTickets.length > 0 && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden flex">
                                  <div
                                    className="bg-blue-500"
                                    style={{ width: `${(inProg / memberTickets.length) * 100}%` }}
                                  />
                                  <div
                                    className="bg-amber-500"
                                    style={{
                                      width: `${((memberTickets.length - done - inProg - blocked) / memberTickets.length) * 100}%`,
                                    }}
                                  />
                                  <div
                                    className="bg-red-500"
                                    style={{ width: `${(blocked / memberTickets.length) * 100}%` }}
                                  />
                                  <div
                                    className="bg-emerald-500"
                                    style={{ width: `${(done / memberTickets.length) * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {pct}% done
                                </span>
                              </div>
                            )}

                            {/* Status badges */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Ticket className="h-3 w-3" /> {memberTickets.length} total
                              </span>
                              {inProg > 0 && (
                                <span className="flex items-center gap-1 text-blue-500">
                                  <Clock className="h-3 w-3" /> {inProg} active
                                </span>
                              )}
                              {done > 0 && (
                                <span className="flex items-center gap-1 text-emerald-500">
                                  <CheckCircle2 className="h-3 w-3" /> {done} done
                                </span>
                              )}
                              {blocked > 0 && (
                                <span className="flex items-center gap-1 text-red-500">
                                  <AlertCircle className="h-3 w-3" /> {blocked} blocked
                                </span>
                              )}
                              {overdue > 0 && (
                                <span className="flex items-center gap-1 text-red-500 font-medium">
                                  <CalendarClock className="h-3 w-3" /> {overdue} overdue
                                </span>
                              )}
                              {stale > 0 && (
                                <span className="flex items-center gap-1 text-amber-500">
                                  <Flame className="h-3 w-3" /> {stale} stale
                                </span>
                              )}
                              {open === 0 && done === 0 && (
                                <span className="text-muted-foreground">No tickets assigned</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── CALENDAR — Gantt timeline ── */}
          {currentView === 'calendar' && (
            <div className="p-6 max-w-5xl mx-auto w-full h-full flex flex-col">
              <div className="mb-5 shrink-0">
                <h2 className="text-xl font-semibold text-foreground">Future Viz</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Visual timeline of every ticket across your projects
                </p>
              </div>
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
                <div className="min-h-[600px] max-h-[calc(100vh-200px)] overflow-hidden rounded-2xl border border-border">
                  <GanttCalendar
                    tickets={tickets as any}
                    projects={projects as any}
                    onSelectTicket={(id) => {
                      const t = tickets.find((x) => x.id === id);
                      if (t?.meeting_id) {
                        setSelectedMeeting(t.meeting_id);
                        handleViewChange('ticket-detail');
                      } else {
                        handleViewChange('tickets');
                      }
                    }}
                  />
                </div>

                {/* Upcoming deadlines sidebar */}
                <Card className="border-border/60 shadow-none hidden lg:flex flex-col max-h-[600px]">
                  <CardHeader className="pb-3 pt-5 px-5 shrink-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      Deadlines
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">Next due tickets</CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 overflow-y-auto flex-1">
                    {(() => {
                      const upcoming = tickets
                        .filter((t) => t.due_date && t.status !== 'done')
                        .sort(
                          (a, b) =>
                            new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
                        )
                        .slice(0, 10);
                      if (upcoming.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle2 className="h-7 w-7 text-emerald-500/50 mb-2" />
                            <p className="text-sm text-muted-foreground">No deadlines</p>
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2">
                          {upcoming.map((t) => {
                            const daysLeft = Math.ceil(
                              (new Date(t.due_date!).getTime() - Date.now()) / 86400000
                            );
                            const isOverdue = daysLeft < 0;
                            return (
                              <div
                                key={t.id}
                                className="flex items-center gap-2.5 p-2 rounded-lg border border-border/60 bg-muted/50 cursor-pointer hover:border-primary/30 transition-all"
                                onClick={() => {
                                  if (t.meeting_id) {
                                    setSelectedMeeting(t.meeting_id);
                                    handleViewChange('ticket-detail');
                                  } else {
                                    handleViewChange('tickets');
                                  }
                                }}
                              >
                                <div
                                  className={cn(
                                    'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold',
                                    isOverdue
                                      ? 'bg-red-500/10 text-red-500'
                                      : daysLeft <= 1
                                        ? 'bg-red-500/10 text-red-500'
                                        : daysLeft <= 3
                                          ? 'bg-amber-500/10 text-amber-500'
                                          : 'bg-blue-500/10 text-blue-500'
                                  )}
                                >
                                  {isOverdue ? `${Math.abs(daysLeft)}d` : `${daysLeft}d`}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-medium text-foreground truncate">
                                    {t.title}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {projects.find((p) => p.id === t.projectId)?.name ??
                                      'Unassigned'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ── MEETINGS ── */}
          {currentView === 'meetings' && (
            <div className="app-page max-w-5xl">
              <header>
                <p className="app-eyebrow">Workspace</p>
                <h2 className="app-title mt-2">Meetings</h2>
                <p className="app-subtitle">All your recorded meeting sessions.</p>
              </header>
              <MeetingCards
                onSelectMeeting={handleMeetingSelect}
                onCreateTicket={handleMeetingTicketCreate}
              />
            </div>
          )}

          {/* ── TICKETS ── */}
          {currentView === 'tickets' && (
            <div className="app-page max-w-5xl">
              <header className="space-y-5">
                <div>
                  <p className="app-eyebrow">Workspace</p>
                  <h2 className="app-title mt-2">Tickets</h2>
                  <p className="app-subtitle">All extracted tickets across every meeting.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    {
                      label: 'Total',
                      value: tickets.length,
                      color: 'text-foreground',
                      bg: 'bg-white/[0.06]',
                    },
                    {
                      label: 'In Progress',
                      value: tickets.filter((t) => t.status === 'in_progress').length,
                      color: 'text-foreground',
                      bg: 'bg-white/[0.06]',
                    },
                    {
                      label: 'Done',
                      value: tickets.filter((t) => t.status === 'done').length,
                      color: 'text-emerald-400',
                      bg: 'bg-emerald-500/10',
                    },
                    {
                      label: 'Blocked',
                      value: tickets.filter((t) => t.status === 'blocked').length,
                      color: 'text-red-400',
                      bg: 'bg-red-500/10',
                    },
                    {
                      label: 'Backlog',
                      value: tickets.filter((t) => t.status === 'backlog').length,
                      color: 'text-muted-foreground',
                      bg: 'bg-white/[0.06]',
                    },
                    {
                      label: 'Overdue',
                      value: tickets.filter(
                        (t) =>
                          t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
                      ).length,
                      color: 'text-red-400',
                      bg: 'bg-red-500/10',
                    },
                  ].map(({ label, value, color, bg }) => (
                    <div
                      key={label}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium',
                        bg,
                        color
                      )}
                    >
                      {label}
                      <span className="font-semibold tabular-nums text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </header>

              <div className="mt-2">
                <TicketsBoard
                  onSelectMeeting={handleMeetingSelect}
                  onSelectProject={handleProjectSelect}
                  onSaved={refreshWorkspace}
                />
              </div>
            </div>
          )}

          {/* ── TICKET DETAIL ── */}
          {currentView === 'ticket-detail' &&
            (selectedMeeting || searchParams.get('meetingId')) && (
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
                  meetingId={(selectedMeeting ?? searchParams.get('meetingId'))!}
                  onSelectMeeting={handleMeetingSelect}
                  onDeleteMeeting={handleDeleteMeeting}
                />
              </div>
            )}

          {/* ── PROJECTS ── */}
          {currentView === 'projects' && (
            <div className="app-page max-w-5xl">
              <header>
                <p className="app-eyebrow">Workspace</p>
                <h2 className="app-title mt-2">Projects</h2>
                <p className="app-subtitle">Manage your workspaces and teams.</p>
              </header>
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
                showHeader={false}
              />
            </div>
          )}
          {/* ── FEEDBACK ── */}
          {currentView === 'feedback' && <FeedbackView />}
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
        meetings={memoizedMeetingOptions}
        defaultMeetingId={meetingTicketMeetingId}
        onCreated={refreshWorkspace}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoadingMessage />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
