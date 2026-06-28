'use client';

import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  Video,
  Ticket,
  CheckCircle2,
  Users,
  Clock,
  ArrowUpRight,
  BarChart3,
  Circle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
  assignee_user_id?: string | null;
  projectId?: string | null;
  meeting_id: string | null;
  due_date?: string | null;
}

interface OrgMember {
  id: string;
  role: string;
  publicUserData?: {
    userId?: string;
    identifier?: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string;
  };
}

interface DashboardGridProps {
  organizationName?: string;
  projects: Project[];
  meetings: Meeting[];
  tickets: Ticket[];
  orgMembers: OrgMember[];
}

const statusConfig = {
  backlog: {
    label: 'Backlog',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    Icon: Circle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    Icon: Clock,
  },
  done: {
    label: 'Done',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    Icon: CheckCircle2,
  },
  blocked: {
    label: 'Blocked',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    Icon: AlertCircle,
  },
};

export function DashboardGrid({
  organizationName,
  projects,
  meetings,
  tickets,
  orgMembers,
}: DashboardGridProps) {
  const router = useRouter();

  const completionPct = tickets.length
    ? Math.round((tickets.filter((t) => t.status === 'done').length / tickets.length) * 100)
    : 0;

  const statusCounts = {
    backlog: tickets.filter((t) => t.status === 'backlog').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    done: tickets.filter((t) => t.status === 'done').length,
    blocked: tickets.filter((t) => t.status === 'blocked').length,
  };

  function handleMeetingClick(meetingId: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    router.push(`/dashboard?view=ticket-detail&meetingId=${meetingId}`);
  }

  function handleProjectClick(projectId: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    router.push(`/project?projectId=${projectId}&tab=kanban`);
  }

  function handleStatusClick(status: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    router.push(`/dashboard?view=tickets&status=${status}`);
  }

  function navigateTo(view: string) {
    router.push(`/dashboard?view=${view}`);
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          {organizationName ?? 'Organization'} Overview
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Everything happening across your workspace
        </p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Projects',
            value: projects.length,
            Icon: FolderKanban,
            color: 'text-primary',
            bg: 'bg-primary/5',
            view: 'projects',
          },
          {
            label: 'Meetings',
            value: meetings.length,
            Icon: Video,
            color: 'text-blue-500',
            bg: 'bg-blue-500/5',
            view: 'meetings',
          },
          {
            label: 'Tickets',
            value: tickets.length,
            Icon: Ticket,
            color: 'text-orange-500',
            bg: 'bg-orange-500/5',
            view: 'tickets',
          },
          {
            label: 'Completion',
            value: `${completionPct}%`,
            Icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/5',
            view: 'tickets',
          },
        ].map(({ label, value, Icon, color, bg, view }) => (
          <Card
            key={label}
            className={cn(
              'border-border/60 shadow-none hover:border-border/80 transition-colors cursor-pointer',
              bg
            )}
            onClick={() => view && navigateTo(view)}
          >
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

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Meetings widget */}
        <Card
          className="border-border/60 shadow-none lg:row-span-2 bg-blue-500/[0.03] cursor-pointer hover:border-blue-500/30 transition-colors"
          onClick={() => navigateTo('meetings')}
        >
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Meetings</CardTitle>
                <CardDescription className="text-xs mt-0.5">Recent meetings</CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Video className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meetings yet.</p>
            ) : (
              <div className="space-y-2">
                {meetings.slice(0, 6).map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={(e) => handleMeetingClick(meeting.id, e)}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-border/60 bg-muted/50 hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Video className="h-4 w-4 text-primary" />
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
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Status 2x2 widget */}
        <Card
          className="border-border/60 shadow-none bg-orange-500/[0.03] cursor-pointer hover:border-orange-500/30 transition-colors"
          onClick={() => navigateTo('tickets')}
        >
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Ticket Status</CardTitle>
                <CardDescription className="text-xs mt-0.5">Click to filter</CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Ticket className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
                const config = statusConfig[status];
                const Icon = config.Icon;
                return (
                  <button
                    key={status}
                    onClick={(e) => handleStatusClick(status, e)}
                    className={cn(
                      'flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:shadow-sm',
                      config.bg,
                      config.border
                    )}
                  >
                    <Icon className={cn('h-5 w-5 mb-2', config.color)} />
                    <p className="text-2xl font-semibold text-foreground">{statusCounts[status]}</p>
                    <p className={cn('text-xs font-medium', config.color)}>{config.label}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Projects widget */}
        <Card
          className="border-border/60 shadow-none bg-primary/[0.03] cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => navigateTo('projects')}
        >
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Projects</CardTitle>
                <CardDescription className="text-xs mt-0.5">Click to open</CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => {
                  const pTickets = tickets.filter((t) => t.projectId === project.id).length;
                  const pDone = tickets.filter(
                    (t) => t.projectId === project.id && t.status === 'done'
                  ).length;
                  const pPct = pTickets ? Math.round((pDone / pTickets) * 100) : 0;
                  return (
                    <button
                      key={project.id}
                      onClick={(e) => handleProjectClick(project.id, e)}
                      className="w-full text-left rounded-lg border border-border/60 bg-muted/50 p-3 hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <FolderKanban className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {project.name}
                          </p>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <Progress value={pPct} className="h-1 mb-1.5" />
                      <p className="text-[11px] text-muted-foreground">
                        {pDone}/{pTickets} tickets done
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Workload widget */}
        <Card
          className="border-border/60 shadow-none lg:col-span-2 bg-purple-500/[0.03] cursor-pointer hover:border-purple-500/30 transition-colors"
          onClick={() => navigateTo('members')}
        >
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Member Workload</CardTitle>
                <CardDescription className="text-xs mt-0.5">Ticket distribution</CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {orgMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {orgMembers.slice(0, 6).map((m) => {
                  const memberTickets = tickets.filter(
                    (t) => t.assignee_user_id === m.publicUserData?.userId
                  );
                  const done = memberTickets.filter((t) => t.status === 'done').length;
                  const pct = memberTickets.length
                    ? Math.round((done / memberTickets.length) * 100)
                    : 0;
                  const name =
                    [m.publicUserData?.firstName, m.publicUserData?.lastName]
                      .filter(Boolean)
                      .join(' ') ||
                    m.publicUserData?.identifier ||
                    'Member';
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/50"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={m.publicUserData?.imageUrl} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground truncate">
                            {name}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                            {done}/{memberTickets.length} done
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
