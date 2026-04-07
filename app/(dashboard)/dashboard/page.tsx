// app/(dashboard)/dashboard/settings/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { MeetingCards } from '@/components/meeting-cards';
import { TicketDetail } from '@/components/ticket-detail';
import { TicketsBoard } from '@/components/tickets-board';
import { ProjectsWorkspace } from '@/components/projects-workspace';
import { ProjectCreateDialog } from '@/components/project-create-dialog';
import { ManualTicketDialog } from '@/components/manual-ticket-dialog';
import { Github } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GitHubConnectButton } from '@/components/github-connect-button';
import { ApiKeyManager } from '@/components/api-key-manager';
import { LinearConnectButton } from '@/components/linear-connect-button';

type ViewType = 'dashboard' | 'meetings' | 'projects' | 'tickets' | 'settings' | 'ticket-detail' | 'project-detail';

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
  status: 'completed' | 'processing' | 'failed';
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
  meeting_id: string;
}

const pageStyle: React.CSSProperties = {
  padding: '2rem 2.5rem',
  overflowY: 'auto',
  height: '100%',
  background: '#faf8f4',
};

const headingStyle: React.CSSProperties = {
  fontFamily: "'DM Serif Display', serif",
  fontSize: '2.2rem',
  fontWeight: '400',
  color: '#2c2c28',
  marginBottom: '0.25rem',
};

const subStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#8a8a80',
  fontWeight: '300',
  marginBottom: '2rem',
  fontFamily: "'DM Sans', sans-serif",
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [linearConnected, setLinearConnected] = useState(false);
  const [linearTeam, setLinearTeam] = useState<string | null>(null);
  const [integrationStatusLoaded, setIntegrationStatusLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);
  const [isMeetingTicketOpen, setIsMeetingTicketOpen] = useState(false);
  const [meetingTicketMeetingId, setMeetingTicketMeetingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadIntegrationStatus() {
      try {
        const res = await fetch('/api/integrations/status');
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted) return;

        setGithubConnected(Boolean(data.githubConnected));
        setGithubUser(data.githubUser ?? null);
        setLinearConnected(Boolean(data.linearConnected));
        setLinearTeam(data.linearTeam ?? null);
      } catch (error) {
        console.error('Failed to load integration status:', error);
      } finally {
        if (isMounted) setIntegrationStatusLoaded(true);
      }
    }

    void loadIntegrationStatus();

    return () => {
      isMounted = false;
    };
  }, []);

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

  useEffect(() => {
    const githubConnectedParam = searchParams.get('github_connected');
    const githubError = searchParams.get('github_error');
    const githubUserParam = searchParams.get('github_user');
    const linearConnectedParam = searchParams.get('linear_connected');
    const linearError = searchParams.get('linear_error');
    const linearErrorDetail = searchParams.get('linear_error_detail');
    const linearTeamParam = searchParams.get('linear_team');

    if (
      !integrationStatusLoaded &&
      !githubConnectedParam &&
      !githubError &&
      !linearConnectedParam &&
      !linearError
    ) {
      return;
    }

    if (githubConnectedParam === 'true') {
      setGithubConnected(true);
      setGithubUser(githubUserParam);
      setCurrentView('settings');
      toast({ title: '✅ GitHub Connected!', description: `Connected as @${githubUserParam}` });
    }

    if (githubError) {
      setCurrentView('settings');
      const detail = searchParams.get('github_error_detail');
      toast({
        title: '❌ Connection Failed',
        description: detail || githubError,
        variant: 'destructive',
      });
    }

    if (linearConnectedParam === 'true') {
      setLinearConnected(true);
      setLinearTeam(linearTeamParam);
      setCurrentView('settings');
      toast({
        title: '✅ Linear Connected!',
        description: linearTeamParam ? `Connected to ${linearTeamParam}` : 'Linear account linked successfully',
      });
    }

    if (linearError) {
      setCurrentView('settings');
      toast({
        title: '❌ Linear Connection Failed',
        description: linearErrorDetail || linearError,
        variant: 'destructive',
      });
    }
  }, [searchParams, integrationStatusLoaded]);

  function handleViewChange(view: ViewType) {
    setCurrentView(view);
    if (view !== 'ticket-detail') setSelectedMeeting(null);
    if (view !== 'project-detail') setSelectedProjectId(null);
  }

  function handleMeetingSelect(meetingId: string) {
    setSelectedMeeting(meetingId);
    setCurrentView('ticket-detail');
  }

  function handleMeetingTicketCreate(meetingId: string) {
    setMeetingTicketMeetingId(meetingId);
    setIsMeetingTicketOpen(true);
  }

  function handleProjectSelect(projectId: string) {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
  }

  async function refreshWorkspace() {
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
  }

  async function handleCreateProject(payload: { name: string; context: string; deployUrl: string; branchBase: string }) {
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
    setSelectedProjectId(data.project.id);
    setCurrentView('project-detail');
    toast({ title: 'Project created', description: `${data.project.name} is ready.` });
  }

  async function handleDisconnectGithub() {
    try {
      const res = await fetch('/api/integrations/github/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');

      setGithubConnected(false);
      setGithubUser(null);
      toast({ title: 'GitHub Disconnected', description: 'Your GitHub account has been unlinked.' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to disconnect GitHub. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function handleDisconnectLinear() {
    try {
      const res = await fetch('/api/integrations/linear/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');

      setLinearConnected(false);
      setLinearTeam(null);
      toast({ title: 'Linear Disconnected', description: 'Your Linear account has been unlinked.' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Linear. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#faf8f4' }}>
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleProjectSelect}
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
          <p style={{ fontSize: '13px', color: '#8a8a80', fontFamily: "'DM Sans', sans-serif", fontWeight: '300' }}>
            {currentView === 'dashboard' && 'Overview of your meetings and work items'}
            {currentView === 'meetings' && 'All your recorded meetings'}
            {currentView === 'projects' && 'Workspace projects and project tickets'}
            {currentView === 'project-detail' && 'Project workspace and meeting history'}
            {currentView === 'tickets' && 'All extracted tickets'}
            {currentView === 'settings' && 'Configure your workspace'}
            {currentView === 'ticket-detail' && 'Tickets for this meeting'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8aab7e' }} />
            <span style={{ fontSize: '12px', color: '#8aab7e', fontFamily: "'DM Sans', sans-serif" }}>Live</span>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentView === 'dashboard' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Dashboard</h1>
              <p style={subStyle}>Overview of your meetings and work items</p>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8dfd0',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: '400', color: '#2c2c28', marginBottom: '0.25rem' }}>
                      Projects
                    </h2>
                    <p style={{ fontSize: '13px', color: '#8a8a80', fontFamily: "'DM Sans', sans-serif" }}>
                      Keep track of your active workspaces and jump back in quickly.
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewChange('projects')}
                    style={{
                      background: '#f4f7f1',
                      border: '1px solid #d9e4d2',
                      color: '#3d5a3e',
                      padding: '0.55rem 1rem',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    View all projects
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div style={{ border: '1px dashed #d9cfbf', borderRadius: '12px', padding: '1.25rem', background: '#fbf9f5', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#5a5a52', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                      No projects yet. Create one to organize meetings and tickets.
                    </p>
                    <button
                      onClick={() => setIsProjectCreateOpen(true)}
                      style={{
                        marginTop: '1rem',
                        background: '#3d5a3e',
                        color: '#f8fbf7',
                        border: 'none',
                        padding: '0.65rem 1rem',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      Create project
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {projects.slice(0, 4).map((project) => {
                      const projectTickets = tickets.filter((ticket) => ticket.projectId === project.id).length;
                      const projectMeetings = meetings.filter((meeting) => meeting.projectId === project.id).length;

                      return (
                        <button
                          key={project.id}
                          onClick={() => handleProjectSelect(project.id)}
                          style={{
                            textAlign: 'left',
                            background: '#ffffff',
                            border: '1px solid #e8dfd0',
                            borderRadius: '16px',
                            padding: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 0 rgba(61, 90, 62, 0.03)',
                          }}
                        >
                          <p style={{ margin: '0 0 0.35rem', fontFamily: "'DM Serif Display', serif", fontSize: '1.05rem', color: '#2c2c28' }}>
                            {project.name}
                          </p>
                          <p style={{ margin: '0 0 0.75rem', fontSize: '12px', color: '#8a8a80', fontFamily: "'DM Sans', sans-serif" }}>
                            {project.repo}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '12px', color: '#5a5a52', fontFamily: "'DM Sans', sans-serif" }}>
                            <span>{projectMeetings} meetings</span>
                            <span>{projectTickets} tickets</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8dfd0',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: '400', color: '#2c2c28', marginBottom: '0.25rem' }}>
                      Meetings
                    </h2>
                    <p style={{ fontSize: '13px', color: '#8a8a80', fontFamily: "'DM Sans', sans-serif" }}>
                      Keep track of your active meetings and jump back in quickly.
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewChange('meetings')}
                    style={{
                      background: '#f4f7f1',
                      border: '1px solid #d9e4d2',
                      color: '#3d5a3e',
                      padding: '0.55rem 1rem',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    View all meetings
                  </button>
                </div>

                {meetings.length === 0 ? (
                  <div style={{ border: '1px dashed #d9cfbf', borderRadius: '12px', padding: '1.25rem', background: '#fbf9f5', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#5a5a52', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                      No meetings yet. Start one from a project or the meetings tab.
                    </p>
                    <button
                      onClick={() => handleViewChange('meetings')}
                      style={{
                        marginTop: '1rem',
                        background: '#3d5a3e',
                        color: '#f8fbf7',
                        border: 'none',
                        padding: '0.65rem 1rem',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      Go to meetings
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {meetings.slice(0, 4).map((meeting) => (
                      <button
                        key={meeting.id}
                        onClick={() => handleMeetingSelect(meeting.id)}
                        style={{
                          textAlign: 'left',
                          background: '#ffffff',
                          border: '1px solid #e8dfd0',
                          borderRadius: '16px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 0 rgba(61, 90, 62, 0.03)',
                        }}
                      >
                        <p style={{ margin: '0 0 0.35rem', fontFamily: "'DM Serif Display', serif", fontSize: '1.05rem', color: '#2c2c28' }}>
                          {meeting.projectName}
                        </p>
                        <p style={{ margin: '0 0 0.75rem', fontSize: '12px', color: '#8a8a80', fontFamily: "'DM Sans', sans-serif" }}>
                          {meeting.platform} • {new Date(meeting.date).toLocaleDateString()}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '12px', color: '#5a5a52', fontFamily: "'DM Sans', sans-serif" }}>
                          <span>{meeting.status}</span>
                          <span>Open meeting</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'meetings' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Meetings</h1>
              <p style={subStyle}>All your recorded meetings</p>
              <MeetingCards onSelectMeeting={handleMeetingSelect} onCreateTicket={handleMeetingTicketCreate} />
            </div>
          )}

          {currentView === 'tickets' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Tickets</h1>
              <p style={subStyle}>All extracted tickets across every meeting</p>
              <TicketsBoard onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'ticket-detail' && selectedMeeting && (
            <div style={pageStyle}>
              <button
                onClick={() => handleViewChange('meetings')}
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
              <TicketDetail meetingId={selectedMeeting} onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {(currentView === 'projects' || currentView === 'project-detail') && (
            <div style={pageStyle}>
              <ProjectsWorkspace
                projects={projects}
                meetings={meetings}
                tickets={tickets}
                selectedProjectId={selectedProjectId}
                onSelectProject={handleProjectSelect}
                onSelectMeeting={handleMeetingSelect}
                onCreateProject={() => setIsProjectCreateOpen(true)}
                onRefresh={refreshWorkspace}
              />
            </div>
          )}

          {currentView === 'settings' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Settings</h1>
              <p style={subStyle}>Manage your integrations and preferences</p>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8dfd0',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', background: '#f0f4ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Github size={24} color="#5c7c5d" />
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: '400', color: '#2c2c28', marginBottom: '0.25rem' }}>GitHub</h2>
                      <p style={{ fontSize: '14px', color: '#8a8a80', fontFamily: "'DM Sans', sans-serif" }}>Connect your GitHub account to create branches, commits, and pull requests</p>
                    </div>
                  </div>

                  {githubConnected && (
                    <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                      ✓ Connected
                    </div>
                  )}
                </div>

                {githubConnected ? (
                  <div>
                    <div style={{ background: '#f1f8f5', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: '#2e7d32', fontSize: '20px' }}>✓</div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#1b5e20', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', marginBottom: '0.25rem' }}>
                          Connected as <code style={{ background: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', border: '1px solid #c8e6c9' }}>@{githubUser}</code>
                        </p>
                        <p style={{ fontSize: '12px', color: '#558b2f', fontFamily: "'DM Sans', sans-serif" }}>Your GitHub account is linked to Syntheon</p>
                      </div>
                    </div>
                    <button onClick={handleDisconnectGithub} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', borderRadius: '6px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', cursor: 'pointer' }}>
                      Disconnect GitHub
                    </button>
                  </div>
                ) : (
                  <GitHubConnectButton onSuccess={() => setGithubConnected(true)} />
                )}
              </div>

              <ApiKeyManager />

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8dfd0',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginTop: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', background: '#f5f0ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, color: '#5c3b8a', fontSize: '16px', fontFamily: "'DM Sans', sans-serif" }}>
                      L
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: '400', color: '#2c2c28', marginBottom: '0.25rem' }}>Linear</h2>
                      <p style={{ fontSize: '14px', color: '#8a8a80', fontFamily: "'DM Sans', sans-serif" }}>Connect Linear to create and update issue tickets from meeting tickets</p>
                    </div>
                  </div>

                  {linearConnected && (
                    <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>
                      ✓ Connected
                    </div>
                  )}
                </div>

                {linearConnected ? (
                  <div>
                    <div style={{ background: '#f1f8f5', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: '#2e7d32', fontSize: '20px' }}>✓</div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#1b5e20', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', marginBottom: '0.25rem' }}>Linear account connected</p>
                        <p style={{ fontSize: '12px', color: '#558b2f', fontFamily: "'DM Sans', sans-serif" }}>{linearTeam ? `Default team: ${linearTeam}` : 'Default team selected from your workspace'}</p>
                      </div>
                    </div>
                    <button onClick={handleDisconnectLinear} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a', borderRadius: '6px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', cursor: 'pointer' }}>
                      Disconnect Linear
                    </button>
                  </div>
                ) : (
                  <LinearConnectButton onSuccess={() => setLinearConnected(true)} />
                )}
              </div>
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
