'use client';

import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { ProjectsWorkspace } from '@/components/projects-workspace';
import { ProjectCreateDialog } from '@/components/project-create-dialog';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { TicketDetail } from '@/components/ticket-detail';
import { Button } from '@/components/ui/button';
import { DynamicIslandSearch } from '@/components/dynamic-island-search';
import { NotificationBell } from '@/components/notification-bell';
import { toast } from '@/hooks/use-toast';

type ViewType = 'project' | 'ticket-detail';
type ProjectTab =
  | 'meetings'
  | 'tickets'
  | 'list'
  | 'kanban'
  | 'analytics'
  | 'dependencies'
  | 'members'
  | 'settings';

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

const validProjectTabs: ProjectTab[] = [
  'meetings',
  'tickets',
  'list',
  'kanban',
  'analytics',
  'dependencies',
  'members',
];

function ProjectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = searchParams.get('projectId');
  const tabParam = searchParams.get('tab') as ProjectTab | null;
  const resolvedTab: ProjectTab =
    tabParam && validProjectTabs.includes(tabParam) ? tabParam : 'kanban';

  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('project');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [preferredTab, setPreferredTab] = useState<ProjectTab>(resolvedTab);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);
  const [isMeetingTicketOpen, setIsMeetingTicketOpen] = useState(false);
  const [meetingTicketMeetingId, setMeetingTicketMeetingId] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) return;
      const projectsData = await res.json();
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, []);

  const loadScopedWorkspace = useCallback(async (targetProjectId: string | null) => {
    try {
      const meetingsUrl = targetProjectId
        ? `/api/meetings?projectId=${targetProjectId}`
        : '/api/meetings';
      const ticketsUrl = targetProjectId
        ? `/api/tickets?projectId=${targetProjectId}`
        : '/api/tickets';
      const [meetingsRes, ticketsRes] = await Promise.all([fetch(meetingsUrl), fetch(ticketsUrl)]);

      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setMeetings(Array.isArray(meetingsData) ? meetingsData : (meetingsData.meetings ?? []));
      }
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(Array.isArray(ticketsData) ? ticketsData : (ticketsData.tickets ?? []));
      }
    } catch (error) {
      console.error('Failed to load scoped workspace data:', error);
    }
  }, []);

  useEffect(() => {
    if (!projectId) {
      router.replace('/dashboard');
    }
  }, [projectId, router]);

  useEffect(() => {
    const tab = searchParams.get('tab') as ProjectTab | null;
    if (tab && validProjectTabs.includes(tab)) {
      setPreferredTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const lastFetchRef = useRef<{ projectId: string | null; time: number }>({
    projectId: null,
    time: 0,
  });

  useEffect(() => {
    // Skip re-fetch on tab resume (same project, fetched within last 5s)
    const last = lastFetchRef.current;
    if (last.projectId === projectId && Date.now() - last.time < 5000) return;

    async function loadWorkspace() {
      lastFetchRef.current = { projectId, time: Date.now() };
      await loadScopedWorkspace(projectId);
    }

    void loadWorkspace();
  }, [projectId, loadScopedWorkspace]);

  const refreshWorkspace = useCallback(async () => {
    await loadScopedWorkspace(projectId);
  }, [projectId, loadScopedWorkspace]);

  function handleTabChange(tab: ProjectTab) {
    if (!projectId) return;
    setPreferredTab(tab);
    router.replace(`/project?projectId=${projectId}&tab=${tab}`, { scroll: false });
  }

  function handleProjectSelect(id: string) {
    router.push(`/project?projectId=${id}&tab=kanban`);
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
    const res = await fetch(`/api/meetings/${meetingId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Failed to delete meeting');
    }
    await refreshWorkspace();
    setSelectedMeeting(null);
    setCurrentView('project');
    toast({ title: 'Meeting deleted', description: 'The meeting was removed from Supabase.' });
  }

  async function handleDeleteProject(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Failed to delete project');
    }
    await Promise.all([loadProjects(), refreshWorkspace()]);
    if (projectId === id) {
      router.push('/dashboard');
    }
    toast({ title: 'Project deleted', description: 'The project was removed from Supabase.' });
  }

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
    await Promise.all([loadProjects(), refreshWorkspace()]);
    router.push(`/project?projectId=${data.project.id}&tab=kanban`);
    toast({ title: 'Project created', description: `${data.project.name} is ready.` });
  }

  if (!projectId) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        currentView="project-detail"
        projects={projects}
        selectedProjectId={projectId}
        onCreateProject={() => setIsProjectCreateOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
          <h1 className="text-sm font-semibold text-foreground">
            {currentView === 'project' ? 'Project Workspace' : 'Meeting Tickets'}
          </h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <DynamicIslandSearch
              onSelectTicket={(id) => {
                const t = tickets.find((x) => x.id === id);
                if (t?.projectId) {
                  router.push(`/project?projectId=${t.projectId}&tab=list`);
                } else {
                  router.push('/dashboard?view=tickets');
                }
              }}
              onSelectMeeting={(id) => {
                setSelectedMeeting(id);
                setCurrentView('ticket-detail');
              }}
              onSelectProject={(id) => {
                router.push(`/project?projectId=${id}`);
              }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-auto animate-fade-in-up">
          {currentView === 'ticket-detail' && selectedMeeting && (
            <div className="p-6 max-w-5xl mx-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentView('project');
                  setSelectedMeeting(null);
                  setPreferredTab('meetings');
                  router.replace(`/project?projectId=${projectId}&tab=meetings`, {
                    scroll: false,
                  });
                }}
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

          {currentView === 'project' && (
            <div className="h-full flex flex-col overflow-hidden">
              <ProjectsWorkspace
                projects={projects}
                meetings={meetings}
                tickets={tickets}
                selectedProjectId={projectId}
                preferredTab={preferredTab}
                onTabChange={handleTabChange}
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
        meetings={meetings.map((m) => ({ id: m.id, projectName: m.projectName }))}
        defaultMeetingId={meetingTicketMeetingId}
        onCreated={refreshWorkspace}
      />
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectContent />
    </Suspense>
  );
}
