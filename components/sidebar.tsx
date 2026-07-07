'use client';

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
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useOrganization, useAuth } from '@clerk/nextjs';
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
  const { isLoaded, has } = useAuth();
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
        'h-screen flex flex-col bg-sidebar border-r border-sidebar-border animate-fade-in transition-all duration-300',
        collapsed ? 'w-[52px] min-w-[52px]' : 'w-[220px] min-w-[220px]'
      )}
    >
      {/* Logo + Org + Collapse */}
      <div
        className={cn(
          'h-14 flex items-center px-3 shrink-0 gap-2',
          collapsed && 'justify-center px-0'
        )}
      >
        {!collapsed && (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 flex-1 min-w-0 group rounded-md py-1 hover:bg-accent/40"
            >
              <img
                src="/syntheon-logo.png"
                alt="Syntheon Hub"
                className="w-[30px] h-[30px] object-contain shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="min-w-0">
                <span className="font-[family-name:var(--font-space-grotesk)] text-[1.05rem] text-primary tracking-tight block truncate">
                  Syntheon Hub
                </span>
                {organization?.name && (
                  <span className="text-[10px] text-muted-foreground truncate block leading-none">
                    {organization.name}
                  </span>
                )}
              </div>
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
        {collapsed && (
          <img
            src="/syntheon-logo.png"
            alt="Syntheon Hub"
            className="w-[30px] h-[30px] object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      <Separator />

      {/* Projects first */}
      <div className="px-2 pt-2 shrink-0 flex flex-col">
        <div
          className={cn(
            'flex items-center justify-between px-2 mb-2 shrink-0',
            collapsed && 'justify-center'
          )}
        >
          {!collapsed && (
            <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
              Projects
            </span>
          )}
          {isAdmin && (!collapsed ? projects.length > 0 : true) && (
            <button
              onClick={onCreateProject}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md p-0.5 transition-colors"
              title="Create project"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[35vh] -mx-1 px-1">
          {projects.length === 0 ? (
            isAdmin && !collapsed ? (
              <div className="mx-1">
                <button
                  onClick={onCreateProject}
                  className="w-full flex items-center justify-center gap-1.5 rounded-full border border-dashed border-border bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create project
                </button>
              </div>
            ) : collapsed ? null : (
              <p className="text-xs text-muted-foreground px-2 py-4 text-center">No projects yet</p>
            )
          ) : (
            <div className="space-y-0.5 pb-2 stagger-children">
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
                      'group w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left press-down',
                      collapsed && 'justify-center px-0',
                      active
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                    title={collapsed ? project.name : undefined}
                  >
                    <FolderKanban
                      className={cn(
                        'h-3.5 w-3.5 shrink-0 text-primary/70 transition-transform duration-200',
                        active ? 'scale-110' : 'group-hover:scale-110'
                      )}
                    />
                    {!collapsed && <span className="truncate text-[13px]">{project.name}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      <Separator className="mt-2" />

      {/* Main nav */}
      <nav className={cn('px-2 pt-2 space-y-0.5 shrink-0 stagger-children', collapsed && 'px-1')}>
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
                'group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm press-down',
                collapsed && 'justify-center px-0',
                active
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform duration-200',
                  !active && 'group-hover:scale-110'
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Spacer pushes footer to bottom */}
      <div className="flex-1" />

      {/* Footer / User */}
      <Separator />
      <div className={cn('p-3 shrink-0', collapsed && 'p-2 flex flex-col items-center gap-2')}>
        {collapsed ? (
          <>
            <Avatar className="h-7 w-7 shrink-0 ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => router.push('/settings')}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="group flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-accent cursor-pointer w-full">
            <Avatar className="h-7 w-7 shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-foreground truncate">{userName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 flex items-center justify-center self-center mb-2"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}
    </aside>
  );
}
