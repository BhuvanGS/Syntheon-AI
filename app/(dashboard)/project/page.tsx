'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { ProjectsWorkspace } from '@/components/projects-workspace';
import { ProjectCreateDialog } from '@/components/project-create-dialog';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { TicketDetail } from '@/components/ticket-detail';
import { toast } from '@/hooks/use-toast';

type ViewType = 'project' | 'ticket-detail';
type ProjectTab = 'meetings' | 'tickets' | 'list' | 'kanban' | 'analytics' | 'dependencies';

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

const pageStyle: React.CSSProperties = {
  padding: '2rem 2.5rem',
  overflowY: 'auto',
  height: '100%',
  background: '#faf8f4',
};

const validProjectTabs: ProjectTab[] = [
  'meetings',
  'tickets',
  'list',
  'kanban',
  'analytics',
  'dependencies',
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
    let isMounted = true;

    async function loadWorkspace() {
      try {
        const [projectsRes, meetingsRes, ticketsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/meetings'),
          fetch('/api/tickets'),
        ]);

        if (!isMounted) return;

        if (projectsRes.ok) setProjects(await projectsRes.json());
        if (meetingsRes.ok) setMeetings(await meetingsRes.json());
        if (ticketsRes.ok) setTickets(await ticketsRes.json());
      } catch (error) {
        console.error('Failed to load workspace data:', error);
      }
    }

    void loadWorkspace();
    return () => {
      isMounted = false;
    };
  }, []);

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
    await refreshWorkspace();
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
    await refreshWorkspace();
    router.push(`/project?projectId=${data.project.id}&tab=kanban`);
    toast({ title: 'Project created', description: `${data.project.name} is ready.` });
  }

  if (!projectId) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#faf8f4' }}>
      <Sidebar
        currentView="project-detail"
        projects={projects}
        selectedProjectId={projectId}
        onCreateProject={() => setIsProjectCreateOpen(true)}
      />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            height: '56px',
            borderBottom: '1px solid #e8dfd0',
            background: '#faf8f4',
            display: 'flex',
            alignItems: 'center',
            padding: '0 2.5rem',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: '#8a8a80',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: '300',
            }}
          >
            {currentView === 'project'
              ? 'Project workspace and meeting history'
              : 'Tickets for this meeting'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8aab7e' }}
            />
            <span
              style={{ fontSize: '12px', color: '#8aab7e', fontFamily: "'DM Sans', sans-serif" }}
            >
              Live
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentView === 'ticket-detail' && selectedMeeting && (
            <div style={pageStyle}>
              <button
                onClick={() => {
                  setCurrentView('project');
                  setSelectedMeeting(null);
                  setPreferredTab('meetings');
                  router.replace(`/project?projectId=${projectId}&tab=meetings`, {
                    scroll: false,
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#5c7c5d',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: '500',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0,
                }}
              >
                ← Back to Meetings
              </button>
              <TicketDetail
                meetingId={selectedMeeting}
                onSelectMeeting={handleMeetingSelect}
                onDeleteMeeting={handleDeleteMeeting}
              />
            </div>
          )}

          {currentView === 'project' && (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
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
        </div>
      </main>

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
