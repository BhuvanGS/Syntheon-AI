'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Github } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GitHubConnectButton } from '@/components/github-connect-button';
import { ApiKeyManager } from '@/components/api-key-manager';
import { LinearConnectButton } from '@/components/linear-connect-button';
import { ProjectCreateDialog } from '@/components/project-create-dialog';

interface Project {
  id: string;
  name: string;
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

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [linearConnected, setLinearConnected] = useState(false);
  const [linearTeam, setLinearTeam] = useState<string | null>(null);
  const [integrationStatusLoaded, setIntegrationStatusLoaded] = useState(false);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const [statusRes, projectsRes] = await Promise.all([
          fetch('/api/integrations/status'),
          fetch('/api/projects'),
        ]);

        if (!isMounted) return;

        if (statusRes.ok) {
          const data = await statusRes.json();
          setGithubConnected(Boolean(data.githubConnected));
          setGithubUser(data.githubUser ?? null);
          setLinearConnected(Boolean(data.linearConnected));
          setLinearTeam(data.linearTeam ?? null);
        }

        if (projectsRes.ok) {
          setProjects(await projectsRes.json());
        }
      } catch (error) {
        console.error('Failed to load settings data:', error);
      } finally {
        if (isMounted) setIntegrationStatusLoaded(true);
      }
    }

    void load();
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
      toast({ title: '✅ GitHub Connected!', description: `Connected as @${githubUserParam}` });
    }

    if (githubError) {
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
      toast({
        title: '✅ Linear Connected!',
        description: linearTeamParam
          ? `Connected to ${linearTeamParam}`
          : 'Linear account linked successfully',
      });
    }

    if (linearError) {
      toast({
        title: '❌ Linear Connection Failed',
        description: linearErrorDetail || linearError,
        variant: 'destructive',
      });
    }
  }, [searchParams, integrationStatusLoaded]);

  async function handleDisconnectGithub() {
    try {
      const res = await fetch('/api/integrations/github/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setGithubConnected(false);
      setGithubUser(null);
      toast({
        title: 'GitHub Disconnected',
        description: 'Your GitHub account has been unlinked.',
      });
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
      toast({
        title: 'Linear Disconnected',
        description: 'Your Linear account has been unlinked.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Linear. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const handleCreateProject = useCallback(
    async (payload: { name: string; context: string; deployUrl: string; branchBase: string }) => {
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
      router.push(`/project?projectId=${data.project.id}&tab=kanban`);
      toast({ title: 'Project created', description: `${data.project.name} is ready.` });
    },
    [router]
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#faf8f4' }}>
      <Sidebar
        currentView="settings"
        projects={projects}
        selectedProjectId={null}
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
            Configure your workspace
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: '#f0f4ff',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Github size={24} color="#5c7c5d" />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.4rem',
                        fontWeight: '400',
                        color: '#2c2c28',
                        marginBottom: '0.25rem',
                      }}
                    >
                      GitHub
                    </h2>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#8a8a80',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Connect your GitHub account to create branches, commits, and pull requests
                    </p>
                  </div>
                </div>

                {githubConnected && (
                  <div
                    style={{
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '500',
                    }}
                  >
                    ✓ Connected
                  </div>
                )}
              </div>

              {githubConnected ? (
                <div>
                  <div
                    style={{
                      background: '#f1f8f5',
                      border: '1px solid #c8e6c9',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ color: '#2e7d32', fontSize: '20px' }}>✓</div>
                    <div>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#1b5e20',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: '500',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Connected as{' '}
                        <code
                          style={{
                            background: '#ffffff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '12px',
                            border: '1px solid #c8e6c9',
                          }}
                        >
                          @{githubUser}
                        </code>
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#558b2f',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Your GitHub account is linked to Syntheon
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectGithub}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#ffebee',
                      color: '#c62828',
                      border: '1px solid #ef9a9a',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: '#f5f0ff',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontWeight: 700,
                      color: '#5c3b8a',
                      fontSize: '16px',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    L
                  </div>
                  <div>
                    <h2
                      style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.4rem',
                        fontWeight: '400',
                        color: '#2c2c28',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Linear
                    </h2>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#8a8a80',
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Connect Linear to create and update issue tickets from meeting tickets
                    </p>
                  </div>
                </div>

                {linearConnected && (
                  <div
                    style={{
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '500',
                    }}
                  >
                    ✓ Connected
                  </div>
                )}
              </div>

              {linearConnected ? (
                <div>
                  <div
                    style={{
                      background: '#f1f8f5',
                      border: '1px solid #c8e6c9',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ color: '#2e7d32', fontSize: '20px' }}>✓</div>
                    <div>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#1b5e20',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: '500',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Linear account connected
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#558b2f',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {linearTeam
                          ? `Default team: ${linearTeam}`
                          : 'Default team selected from your workspace'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectLinear}
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: '#ffebee',
                      color: '#c62828',
                      border: '1px solid #ef9a9a',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Disconnect Linear
                  </button>
                </div>
              ) : (
                <LinearConnectButton onSuccess={() => setLinearConnected(true)} />
              )}
            </div>
          </div>
        </div>
      </main>

      <ProjectCreateDialog
        open={isProjectCreateOpen}
        onOpenChange={setIsProjectCreateOpen}
        onCreate={handleCreateProject}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
