'use client';

import { BrandLogo } from '@/components/brand-logo';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Settings,
  FolderKanban,
  Users,
  CalendarDays,
  Ticket,
  Home,
  Video,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useOrganization } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

interface SidebarProps {
  currentView?: string;
  onViewChange?: (view: any) => void;
  projects: Array<{ id: string; name: string }>;
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
  onCreateProject: () => void;
}

const ADMIN_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', view: null },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Video,
    href: '/dashboard?view=meetings',
    view: 'meetings',
  },
  {
    id: 'members',
    label: 'Members',
    icon: Users,
    href: '/dashboard?view=members',
    view: 'members',
  },
  {
    id: 'calendar',
    label: 'Future Viz',
    icon: CalendarDays,
    href: '/dashboard?view=calendar',
    view: 'calendar',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: Ticket,
    href: '/dashboard?view=tickets',
    view: 'tickets',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    href: '/dashboard?view=feedback',
    view: 'feedback',
  },
];

const MEMBER_NAV = [
  { id: 'dashboard', label: 'My Dashboard', icon: Home, href: '/dashboard', view: null },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: Video,
    href: '/dashboard?view=meetings',
    view: 'meetings',
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: MessageSquare,
    href: '/dashboard?view=feedback',
    view: 'feedback',
  },
];

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { membership, organization } = useOrganization();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = membership?.role === 'org:admin';
  const navItems = isAdmin ? ADMIN_NAV : MEMBER_NAV;

  const userEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? '';
  const userName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    userEmail?.split('@')[0] ||
    'User';
  const userInitial =
    user?.firstName?.[0] ??
    user?.username?.[0]?.toUpperCase() ??
    userEmail?.[0]?.toUpperCase() ??
    'S';

  return (
    <aside
      className={cn(
        'app flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300',
        collapsed ? 'w-[56px] min-w-[56px]' : 'w-[232px] min-w-[232px]'
      )}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center gap-2 px-3',
          collapsed && 'justify-center px-0'
        )}
      >
        {!collapsed && (
          <>
            <Link
              href="/dashboard"
              className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl py-1.5 pl-1 pr-2 hover:bg-white/[0.04]"
            >
              <BrandLogo
                size={28}
                className="transition-transform duration-300 group-hover:scale-105"
              />
              <div className="min-w-0">
                <span className="block truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
                  Syntheon Hub
                </span>
                {organization?.name && (
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {organization.name}
                  </span>
                )}
              </div>
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
        {collapsed && <BrandLogo size={28} />}
      </div>

      <div className="mx-3 h-px bg-border" />

      <div className="flex shrink-0 flex-col px-2 pt-3">
        <div
          className={cn(
            'mb-2 flex shrink-0 items-center justify-between px-2',
            collapsed && 'justify-center'
          )}
        >
          {!collapsed && <span className="app-eyebrow">Projects</span>}
          {isAdmin && (!collapsed ? projects.length > 0 : true) && (
            <button
              onClick={onCreateProject}
              className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              title="Create project"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <ScrollArea className="-mx-1 max-h-[35vh] px-1">
          {projects.length === 0 ? (
            isAdmin && !collapsed ? (
              <div className="mx-1">
                <button
                  onClick={onCreateProject}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-[12px] font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-white/[0.03] hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create project
                </button>
              </div>
            ) : collapsed ? null : (
              <p className="px-2 py-4 text-center text-[12px] text-muted-foreground">
                No projects yet
              </p>
            )
          ) : (
            <div className="space-y-0.5 pb-2">
              {projects.slice(0, 8).map((project) => {
                const active = pathname === '/project' && project.id === selectedProjectId;
                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      router.push(`/project?projectId=${project.id}&tab=tickets`);
                      onSelectProject?.(project.id);
                    }}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left',
                      collapsed && 'justify-center px-0',
                      active
                        ? 'bg-white/[0.08] font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                    )}
                    title={collapsed ? project.name : undefined}
                  >
                    <FolderKanban className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    {!collapsed && <span className="truncate text-[13px]">{project.name}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="mx-3 mt-2 h-px bg-border" />

      <nav className={cn('shrink-0 space-y-0.5 px-2 pt-3', collapsed && 'px-1.5')}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const currentView = searchParams.get('view');
          const active =
            item.view === null
              ? pathname === '/dashboard' && !currentView
              : currentView === item.view;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px]',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-white/[0.08] font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="mx-3 h-px bg-border" />
      <div className={cn('shrink-0 p-3', collapsed && 'flex flex-col items-center gap-2 p-2')}>
        {collapsed ? (
          <>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-white/[0.08] text-[11px] font-semibold text-foreground">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.04]">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-white/[0.08] text-[11px] font-semibold text-foreground">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-foreground">{userName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-2 flex shrink-0 items-center justify-center self-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}
    </aside>
  );
}
