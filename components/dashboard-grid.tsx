'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  Video,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  Circle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid } from 'recharts';

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
    color: 'text-muted-foreground',
    fill: 'rgba(255,255,255,0.28)',
    Icon: Circle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-foreground',
    fill: 'rgba(255,255,255,0.72)',
    Icon: Clock,
  },
  done: {
    label: 'Done',
    color: 'text-emerald-400',
    fill: '#34d399',
    Icon: CheckCircle2,
  },
  blocked: {
    label: 'Blocked',
    color: 'text-red-400',
    fill: '#f87171',
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
    color: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  amber: { label: 'At Risk', color: 'text-amber-400', dot: 'bg-amber-400' },
  red: { label: 'Blocked', color: 'text-red-400', dot: 'bg-red-400' },
};

const throughputChartConfig = {
  created: { label: 'Created', color: 'rgba(255,255,255,0.28)' },
  completed: { label: 'Completed', color: 'rgba(255,255,255,0.85)' },
} satisfies ChartConfig;

const statusChartConfig = {
  backlog: { label: 'Backlog', color: 'rgba(255,255,255,0.28)' },
  in_progress: { label: 'In Progress', color: 'rgba(255,255,255,0.72)' },
  done: { label: 'Done', color: '#34d399' },
  blocked: { label: 'Blocked', color: '#f87171' },
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
    <div className="app-page">
      <header>
        <p className="app-eyebrow">Workspace</p>
        <h2 className="app-title mt-2">{organizationName ?? 'Organization'}</h2>
        <p className="app-subtitle">Everything happening across your team — at a glance.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          {
            label: 'Projects',
            value: projects.length,
            sub: `${tickets.filter((t) => t.status !== 'done').length} open tickets`,
            view: 'projects',
          },
          {
            label: 'Completed · 7d',
            value: last7Completed,
            sub: `${last7Created} created`,
            view: 'tickets',
            trend: completedTrend,
          },
          {
            label: 'Overdue',
            value: overdueTickets.length,
            sub: overdueTickets.length > 0 ? `${staleTickets.length} stale` : 'All on time',
            view: 'tickets',
            alert: overdueTickets.length > 0,
          },
          {
            label: 'Completion',
            value: `${completionPct}%`,
            sub: `${statusCounts.done} of ${tickets.length} done`,
            view: 'tickets',
          },
        ].map(({ label, value, sub, view, trend, alert }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigateTo(view)}
            className="app-kpi text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="app-kpi-label">{label}</span>
              {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />}
              {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
              {trend === 'flat' && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <p className={cn('app-kpi-value', alert && 'text-red-400')}>{value}</p>
            <p className="app-kpi-sub">{sub}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <section className="app-panel app-panel-pad lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="app-section-label">Throughput</h3>
              <p className="app-section-hint">Created vs completed · last 14 days</p>
            </div>
            <div className="flex items-center gap-4 text-[12px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
                Created <span className="font-medium text-foreground">{last7Created}</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                Done <span className="font-medium text-foreground">{last7Completed}</span>
              </span>
            </div>
          </div>
          <ChartContainer config={throughputChartConfig} className="h-[200px] w-full">
            <BarChart data={throughputData} barGap={2}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
                interval={1}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="created"
                fill="var(--color-created)"
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
              <Bar
                dataKey="completed"
                fill="var(--color-completed)"
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ChartContainer>
        </section>

        <section
          className="app-panel app-panel-pad cursor-pointer transition-colors hover:bg-white/[0.03]"
          onClick={() => navigateTo('tickets')}
        >
          <div className="mb-4">
            <h3 className="app-section-label">Status</h3>
            <p className="app-section-hint">{tickets.length} tickets in play</p>
          </div>
          <ChartContainer config={statusChartConfig} className="mx-auto h-[150px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="backlog" />} />
              <Pie
                data={statusPieData}
                dataKey="value"
                nameKey="name"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={3}
                stroke="transparent"
              >
                {statusPieData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((status) => {
              const config = statusConfig[status];
              return (
                <button
                  key={status}
                  type="button"
                  onClick={(e) => handleStatusClick(status, e)}
                  className="flex items-baseline justify-between gap-2 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <span className={cn('text-[11px]', config.color)}>{config.label}</span>
                  <span className="text-[15px] font-semibold tabular-nums tracking-tight text-foreground">
                    {statusCounts[status]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <section className="app-panel app-panel-pad">
          <div className="mb-4">
            <h3 className="app-section-label">Needs attention</h3>
            <p className="app-section-hint">
              {overdueTickets.length} overdue · {staleTickets.length} stale
            </p>
          </div>
          <div className="max-h-[280px] space-y-0.5 overflow-y-auto">
            {overdueTickets.length === 0 && staleTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="mb-2 h-6 w-6 text-emerald-400/60" />
                <p className="text-[13px] text-muted-foreground">All tickets on track</p>
              </div>
            ) : (
              <>
                {overdueTickets.slice(0, 4).map((t) => {
                  const m = memberMap.get(t.assignee_user_id || '');
                  const assigneeName = m ? getMemberName(m) : t.assignee || 'Unassigned';
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => navigateTo('tickets')}
                      className="app-row w-full text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {t.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {getProjectName(projects, t.projectId)} · {assigneeName}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-red-400">
                        {Math.abs(hoursUntilDue(t.due_date!))}h overdue
                      </span>
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
                      type="button"
                      onClick={() => navigateTo('tickets')}
                      className="app-row w-full text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {t.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {getProjectName(projects, t.projectId)} · {assigneeName}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-amber-400">
                        {daysAgo(ref)}d stale
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </section>

        <section className="app-panel app-panel-pad lg:col-span-2">
          <div className="mb-4">
            <h3 className="app-section-label">Recent activity</h3>
            <p className="app-section-hint">Latest updates across the org</p>
          </div>
          <div className="max-h-[280px] space-y-0.5 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-muted-foreground">
                No recent activity
              </p>
            ) : (
              recentActivity.map((item, i) => (
                <div key={`${item.ticketId}-${item.kind}-${i}`} className="app-row">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                    {item.kind === 'completed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-foreground/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-foreground">
                      <span className="font-medium">{item.assigneeName}</span>{' '}
                      <span className="text-muted-foreground">
                        {item.kind === 'completed' ? 'completed' : 'created'}
                      </span>{' '}
                      <span className="font-medium">{item.title}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.projectName} · {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <section className="app-panel app-panel-pad">
          <button
            type="button"
            onClick={() => navigateTo('projects')}
            className="mb-4 flex w-full items-start justify-between text-left"
          >
            <div>
              <h3 className="app-section-label">Project health</h3>
              <p className="app-section-hint">Progress and risk</p>
            </div>
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
          </button>
          {projects.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No projects yet.</p>
          ) : (
            <div className="space-y-1">
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
                    type="button"
                    onClick={(e) => handleProjectClick(project.id, e)}
                    className="app-row group w-full text-left"
                  >
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', ragC.dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {project.name}
                        </p>
                        <span className={cn('shrink-0 text-[11px]', ragC.color)}>{ragC.label}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={pPct} className="h-1 flex-1" />
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {pDone}/{pTickets.length}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="app-panel app-panel-pad lg:col-span-2">
          <button
            type="button"
            onClick={() => navigateTo('members')}
            className="mb-4 flex w-full items-start justify-between text-left"
          >
            <div>
              <h3 className="app-section-label">Team workload</h3>
              <p className="app-section-hint">Open tickets and completion</p>
            </div>
            <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
          </button>
          {orgMembers.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No members yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
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
                  <div key={m.id} className="app-row">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={m.publicUserData?.imageUrl} />
                      <AvatarFallback className="bg-white/[0.08] text-[11px] text-foreground">
                        {name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-medium text-foreground">
                          {name}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {open} open
                        </span>
                      </div>
                      <Progress value={pct} className="h-1" />
                      <div className="mt-1.5 flex gap-3 text-[11px] text-muted-foreground">
                        {inProgress > 0 && <span>{inProgress} active</span>}
                        {blocked > 0 && <span className="text-red-400">{blocked} blocked</span>}
                        {done > 0 && <span>{done} done</span>}
                        {open === 0 && done === 0 && <span>No tickets</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="app-panel app-panel-pad">
        <button
          type="button"
          onClick={() => navigateTo('meetings')}
          className="mb-4 flex w-full items-start justify-between text-left"
        >
          <div>
            <h3 className="app-section-label">Recent meetings</h3>
            <p className="app-section-hint">Open a session to review tickets</p>
          </div>
          <ArrowUpRight className="mt-0.5 h-4 w-4 text-muted-foreground" />
        </button>
        {meetings.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No meetings yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.slice(0, 6).map((meeting) => (
              <button
                key={meeting.id}
                type="button"
                onClick={(e) => handleMeetingClick(meeting.id, e)}
                className="app-row group w-full text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <Video className="h-4 w-4 text-foreground/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {meeting.projectName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {meeting.platform} · {new Date(meeting.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] capitalize text-muted-foreground">
                  {meeting.status.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
