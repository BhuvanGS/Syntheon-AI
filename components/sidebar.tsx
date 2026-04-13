'use client';

import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Settings, FolderKanban, Plus, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@clerk/nextjs';

interface SidebarProps {
  currentView?: string;
  onViewChange?: (view: any) => void;
  projects: Array<{ id: string; name: string }>;
  selectedProjectId?: string | null;
  onSelectProject?: (projectId: string) => void;
  onCreateProject: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const userInitial =
    user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? 'S';
  const userName = user?.fullName ?? user?.emailAddresses?.[0]?.emailAddress ?? 'My Workspace';

  return (
    <aside className="w-[220px] min-w-[220px] h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Syntheon"
            className="w-6 h-6 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="font-[family-name:var(--font-dm-serif)] text-[1.05rem] text-primary tracking-tight">
            Syntheon
          </span>
        </Link>
      </div>

      <Separator />

      {/* Main nav */}
      <nav className="px-2 pt-3 space-y-0.5 shrink-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <Separator className="mt-3" />

      {/* Projects */}
      <div className="px-2 pt-3 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-2 mb-2 shrink-0">
          <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
            Projects
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={onCreateProject}
            title="New project"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-1 px-1">
          {projects.length === 0 ? (
            <div className="mx-1 border border-dashed border-border rounded-lg p-3 text-center">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                No projects yet. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 pb-2">
              {projects.slice(0, 8).map((project) => {
                const active = pathname === '/project' && project.id === selectedProjectId;
                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      router.push(`/project?projectId=${project.id}&tab=kanban`);
                      onSelectProject?.(project.id);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-colors text-left',
                      active
                        ? 'bg-accent text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <FolderKanban className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span className="truncate text-[13px]">{project.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer / User */}
      <Separator />
      <div className="p-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-accent cursor-pointer transition-colors">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-foreground truncate">{userName}</p>
            <p className="text-[11px] text-muted-foreground truncate">syntheon.ai</p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>
      </div>
    </aside>
  );
}
