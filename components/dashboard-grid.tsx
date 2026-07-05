'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  FolderKanban,
  Video,
  Ticket,
  CheckCircle2,
  Users,
  Clock,
  ArrowUpRight,
  Circle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  CalendarClock,
  Flame,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

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
    fill: '#f59e0b',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    Icon: Circle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-500',
    fill: '#3b82f6',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    Icon: Clock,
  },
  done: {
    label: 'Done',
    color: 'text-emerald-500',
    fill: '#10b981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    Icon: CheckCircle2,
  },
  blocked: {
    label: 'Blocked',
    color: 'text-red-500',
    fill: '#ef4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    Icon: AlertCircle,
  },
};

const STALE_DAYS = 3;
const OVERDUE_THRESHOLD_HOURS = 0;

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}
function hoursUntilDue(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / 3600000);
}
function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getMemberName(m: OrgMember): string {
  return (
    [m.publicUserData?.firstName, m.publicUserData?.lastName].filter(Boolean).join(' ') ||
    m.publicUserData?.identifier?.split('@')[0] ||
    'Member'
  );
}

function getProjectName(projects: Project[], projectId?: string | null): string {
  if (!projectId) return 'Unassigned';
  return projects.find((p) => p.id === projectId)?.name ?? 'Unknown Project';
}

function ragStatus(pct: number, blockedCount: number): 'green' | 'amber' | 'red' {
  if (blockedCount > 0) return 'red';
  if (pct < 25) return 'amber';
  return 'green';
}

const ragConfig = {
  green: {
    label: 'On Track',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
  amber: { label: 'At Risk', color: 'text-amber-600', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
  red: { label: 'Blocked', color: 'text-red-600', bg: 'bg-red-500/10', dot: 'bg-red-500' },
};

const throughputChartConfig = {
  created: { label: 'Created', color: '#f59e0b' },
  completed: { label: 'Completed', color: '#10b981' },
} satisfies ChartConfig;

const statusChartConfig = {
  backlog: { label: 'Backlog', color: '#f59e0b' },
  in_progress: { label: 'In Progress', color: '#3b82f6' },
  done: { label: 'Done', color: '#10b981' },
  blocked: { label: 'Blocked', color: '#ef4444' },
} satisfies ChartConfig;

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

  const memberMap = useMemo(() => {
    const m = new Map<string, OrgMember>();
    for (const mem of orgMembers) {
      if (mem.publicUserData?.userId) m.set(mem.publicUserData.userId, mem);
    }
    return m;
  }, [orgMembers]);

  const throughputData = useMemo(() => {
    const days: { date: string; label: string; created: number; completed: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      const created = tickets.filter((t) => {
        if (!t.createdAt) return false;
        const c = new Date(t.createdAt);
        return c >= d && c < next;
      }).length;
      const completed = tickets.filter((t) => {
        if (!t.updatedAt || t.status !== 'done') return false;
        const c = new Date(t.updatedAt);
        return c >= d && c < next;
      }).length;
      days.push({ date: d.toISOString(), label, created, completed });
    }
    return days;
  }, [tickets]);

  const last7Created = throughputData.slice(7).reduce((s, d) => s + d.created, 0);
  const prev7Created = throughputData.slice(0, 7).reduce((s, d) => s + d.created, 0);
  const createdTrend =
    last7Created === prev7Created ? 'flat' : last7Created > prev7Created ? 'up' : 'down';

  const last7Completed = throughputData.slice(7).reduce((s, d) => s + d.completed, 0);
  const prev7Completed = throughputData.slice(0, 7).reduce((s, d) => s + d.completed, 0);
  const completedTrend =
    last7Completed === prev7Completed ? 'flat' : last7Completed > prev7Completed ? 'up' : 'down';

  const overdueTickets = useMemo(
    () =>
      tickets
        .filter(
          (t) =>
            t.due_date &&
            t.status !== 'done' &&
            hoursUntilDue(t.due_date) <= OVERDUE_THRESHOLD_HOURS
        )
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()),
    [tickets]
  );

  const staleTickets = useMemo(
    () =>
      tickets.filter((t) => {
        if (t.status === 'done') return false;
        const ref = t.updatedAt || t.createdAt;
        if (!ref) return false;
        return daysAgo(ref) >= STALE_DAYS;
      }),
    [tickets]
  );

  const recentActivity = useMemo(() => {
    const items: {
      ticketId: string;
      title: string;
      status: string;
      assigneeName: string;
      projectName: string;
      timestamp: string;
      kind: 'created' | 'completed' | 'updated';
    }[] = [];
    for (const t of tickets) {
      if (t.createdAt) {
        const creator = memberMap.get(t.user_id || '');
        items.push({
          ticketId: t.id,
          title: t.title,
          status: t.status,
          assigneeName: creator ? getMemberName(creator) : 'Someone',
          projectName: getProjectName(projects, t.projectId),
          timestamp: t.createdAt,
          kind: 'created',
        });
      }
      if (t.updatedAt && t.status === 'done' && t.updatedAt !== t.createdAt) {
        const m = memberMap.get(t.assignee_user_id || '');
        items.push({
          ticketId: t.id,
          title: t.title,
          status: t.status,
          assigneeName: m ? getMemberName(m) : t.assignee || 'Someone',
          projectName: getProjectName(projects, t.projectId),
          timestamp: t.updatedAt,
          kind: 'completed',
        });
      }
    }
    return items
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [tickets, memberMap, projects]);

  const statusPieData = (Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(
    (k) => ({
      name: statusConfig[k].label,
      key: k,
      value: statusCounts[k],
      fill: statusConfig[k].fill,
    })
  );

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

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Active Projects',
            value: projects.length,
            sub: `${tickets.filter((t) => t.status !== 'done').length} open tickets`,
            Icon: FolderKanban,
            color: 'text-primary',
            bg: 'bg-primary/5',
            view: 'projects',
          },
          {
            label: 'Throughput (7d)',
            value: last7Completed,
            sub: `${last7Created} created`,
            Icon: TrendingUp,
            color:
              completedTrend === 'up'
                ? 'text-emerald-500'
                : completedTrend === 'down'
                  ? 'text-red-500'
                  : 'text-muted-foreground',
            bg: 'bg-emerald-500/5',
            view: 'tickets',
          },
          {
            label: 'Overdue',
            value: overdueTickets.length,
            sub: overdueTickets.length > 0 ? `${staleTickets.length} stale` : 'All on time',
            Icon: CalendarClock,
            color: overdueTickets.length > 0 ? 'text-red-500' : 'text-emerald-500',
            bg: overdueTickets.length > 0 ? 'bg-red-500/5' : 'bg-emerald-500/5',
            view: 'tickets',
          },
          {
            label: 'Completion',
            value: `${completionPct}%`,
            sub: `${statusCounts.done}/${tickets.length} done`,
            Icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/5',
            view: 'tickets',
          },
        ].map(({ label, value, sub, Icon, color, bg, view }) => (
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
              <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Throughput chart + Status donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Throughput Chart */}
        <Card className="border-border/60 shadow-none lg:col-span-2">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Throughput
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Tickets created vs completed (14 days)
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-amber-500" />
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium text-foreground">{last7Created}</span>
                  {createdTrend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  {createdTrend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {createdTrend === 'flat' && <Minus className="h-3 w-3 text-muted-foreground" />}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-foreground">{last7Completed}</span>
                  {completedTrend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  {completedTrend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {completedTrend === 'flat' && <Minus className="h-3 w-3 text-muted-foreground" />}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ChartContainer config={throughputChartConfig} className="h-[200px] w-full">
              <BarChart data={throughputData} barGap={2}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.3}
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  interval={1}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="created"
                  fill="var(--color-created)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Donut */}
        <Card
          className="border-border/60 shadow-none bg-orange-500/[0.03] cursor-pointer hover:border-orange-500/30 transition-colors"
          onClick={() => navigateTo('tickets')}
        >
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Status Mix</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {tickets.length} total tickets
                </CardDescription>
              </div>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Ticket className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ChartContainer config={statusChartConfig} className="h-[160px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="backlog" />} />
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
                const config = statusConfig[status];
                const Icon = config.Icon;
                return (
                  <button
                    key={status}
                    onClick={(e) => handleStatusClick(status, e)}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all hover:shadow-sm',
                      config.bg,
                      config.border
                    )}
                  >
                    <Icon className={cn('h-3.5 w-3.5', config.color)} />
                    <span className="text-sm font-semibold text-foreground">
                      {statusCounts[status]}
                    </span>
                    <span className={cn('text-[10px] font-medium', config.color)}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Overdue/Stale alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overdue & Stale Tickets */}
        <Card className="border-border/60 shadow-none lg:col-span-1 bg-red-500/[0.02]">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-500" />
                  Needs Attention
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {overdueTickets.length} overdue · {staleTickets.length} stale
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 max-h-[280px] overflow-y-auto">
            {overdueTickets.length === 0 && staleTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mb-2" />
                <p className="text-sm text-muted-foreground">All tickets on track</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueTickets.slice(0, 4).map((t) => {
                  const m = memberMap.get(t.assignee_user_id || '');
                  const assigneeName = m ? getMemberName(m) : t.assignee || 'Unassigned';
                  return (
                    <button
                      key={t.id}
                      onClick={() => navigateTo('tickets')}
                      className="w-full flex items-start gap-2.5 p-2.5 text-left rounded-lg border border-red-500/20 bg-red-500/5 hover:border-red-500/40 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {getProjectName(projects, t.projectId)} · {assigneeName}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-[9px] shrink-0">
                        {Math.abs(hoursUntilDue(t.due_date!))}h overdue
                      </Badge>
                    </button>
                  );
                })}
                {staleTickets.slice(0, 4).map((t) => {
                  const m = memberMap.get(t.assignee_user_id || '');
                  const assigneeName = m ? getMemberName(m) : t.assignee || 'Unassigned';
                  const ref = t.updatedAt || t.createdAt!;
                  return (
                    <button
                      key={`stale-${t.id}`}
                      onClick={() => navigateTo('tickets')}
                      className="w-full flex items-start gap-2.5 p-2.5 text-left rounded-lg border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {getProjectName(projects, t.projectId)} · {assigneeName}
                        </p>
                      </div>
                      <Badge className="text-[9px] shrink-0 bg-amber-500/15 text-amber-600 border-amber-500/20">
                        {daysAgo(ref)}d stale
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="border-border/60 shadow-none lg:col-span-2">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Latest ticket updates across the org
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 max-h-[280px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item, i) => (
                  <div
                    key={`${item.ticketId}-${item.kind}-${i}`}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
                        item.kind === 'completed' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
                      )}
                    >
                      {item.kind === 'completed' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">
                        <span className="font-medium">{item.assigneeName}</span>{' '}
                        <span className="text-muted-foreground">
                          {item.kind === 'completed' ? 'completed' : 'created'}
                        </span>{' '}
                        <span className="font-medium">{item.title}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.projectName} · {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Projects with RAG + Member Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Projects with RAG status */}
        <Card
          className="border-border/60 shadow-none bg-primary/[0.03] cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => navigateTo('projects')}
        >
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Project Health</CardTitle>
                <CardDescription className="text-xs mt-0.5">RAG status & progress</CardDescription>
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
                  const pTickets = tickets.filter((t) => t.projectId === project.id);
                  const pDone = pTickets.filter((t) => t.status === 'done').length;
                  const pBlocked = pTickets.filter((t) => t.status === 'blocked').length;
                  const pPct = pTickets.length ? Math.round((pDone / pTickets.length) * 100) : 0;
                  const rag = ragStatus(pPct, pBlocked);
                  const ragC = ragConfig[rag];
                  return (
                    <button
                      key={project.id}
                      onClick={(e) => handleProjectClick(project.id, e)}
                      className="w-full text-left rounded-lg border border-border/60 bg-muted/50 p-3 hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn('h-2 w-2 rounded-full shrink-0', ragC.dot)} />
                          <p className="text-sm font-semibold text-foreground truncate">
                            {project.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn('text-[10px] font-medium', ragC.color)}>
                            {ragC.label}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <Progress value={pPct} className="h-1 mb-1.5" />
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">
                          {pDone}/{pTickets.length} done
                        </p>
                        {pBlocked > 0 && (
                          <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {pBlocked} blocked
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Workload — enhanced */}
        <Card
          className="border-border/60 shadow-none lg:col-span-2 bg-purple-500/[0.03] cursor-pointer hover:border-purple-500/30 transition-colors"
          onClick={() => navigateTo('members')}
        >
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Team Workload</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Open tickets & completion per member
                </CardDescription>
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
                  const open = memberTickets.filter((t) => t.status !== 'done').length;
                  const done = memberTickets.filter((t) => t.status === 'done').length;
                  const blocked = memberTickets.filter((t) => t.status === 'blocked').length;
                  const inProgress = memberTickets.filter((t) => t.status === 'in_progress').length;
                  const pct = memberTickets.length
                    ? Math.round((done / memberTickets.length) * 100)
                    : 0;
                  const name = getMemberName(m);
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
                            {open} open · {done} done
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5 mb-1" />
                        <div className="flex items-center gap-2 text-[10px]">
                          {inProgress > 0 && (
                            <span className="text-blue-500 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {inProgress}
                            </span>
                          )}
                          {blocked > 0 && (
                            <span className="text-red-500 flex items-center gap-0.5">
                              <AlertCircle className="h-2.5 w-2.5" />
                              {blocked}
                            </span>
                          )}
                          {open === 0 && done === 0 && (
                            <span className="text-muted-foreground">No tickets</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Meetings (retained) */}
      <Card
        className="border-border/60 shadow-none bg-blue-500/[0.03] cursor-pointer hover:border-blue-500/30 transition-colors"
        onClick={() => navigateTo('meetings')}
      >
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Recent Meetings</CardTitle>
              <CardDescription className="text-xs mt-0.5">Click to view details</CardDescription>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
    </div>
  );
}
