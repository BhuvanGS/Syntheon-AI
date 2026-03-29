// app/(dashboard)/dashboard/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { MeetingCards } from '@/components/meeting-cards';
import { SpecBlocksDetail } from '@/components/spec-blocks-detail';
import { Kanban } from '@/components/kanban';
import { AllSpecs } from '@/components/all-specs';
import { Settings } from '@/components/setting';
import { Github } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GitHubConnectButton } from '@/components/github-connect-button';
import { ApiKeyManager } from '@/components/api-key-manager';
import { LinearConnectButton } from '@/components/linear-connect-button';

type ViewType = 'dashboard' | 'meetings' | 'specs' | 'kanban' | 'settings' | 'spec-detail';

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

export default function Home() {
  const searchParams = useSearchParams();
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [linearConnected, setLinearConnected] = useState(false);
  const [linearTeam, setLinearTeam] = useState<string | null>(null);
  const [integrationStatusLoaded, setIntegrationStatusLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

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
        if (isMounted) {
          setIntegrationStatusLoaded(true);
        }
      }
    }

    void loadIntegrationStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Check for OAuth callback messages
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
      toast({
        title: '✅ GitHub Connected!',
        description: `Connected as @${githubUserParam}`,
      });
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
        description: linearTeamParam
          ? `Connected to ${linearTeamParam}`
          : 'Linear account linked successfully',
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
    if (view !== 'spec-detail') setSelectedMeeting(null);
  }

  function handleMeetingSelect(meetingId: string) {
    setSelectedMeeting(meetingId);
    setCurrentView('spec-detail');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#faf8f4' }}>
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
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
            {currentView === 'dashboard' && 'Overview of your meetings and specs'}
            {currentView === 'meetings' && 'All your recorded meetings'}
            {currentView === 'specs' && 'All extracted specifications'}
            {currentView === 'kanban' && 'Track your pipeline'}
            {currentView === 'settings' && 'Configure your workspace'}
            {currentView === 'spec-detail' && 'Spec blocks for this meeting'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#8aab7e',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                color: '#8aab7e',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Live
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {currentView === 'dashboard' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Dashboard</h1>
              <p style={subStyle}>Welcome to your meeting management hub</p>
              <MeetingCards onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'meetings' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Meetings</h1>
              <p style={subStyle}>All your recorded meetings</p>
              <MeetingCards onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'spec-detail' && selectedMeeting && (
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
              <SpecBlocksDetail meetingId={selectedMeeting} />
            </div>
          )}

          {currentView === 'specs' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Spec Blocks</h1>
              <p style={subStyle}>All extracted specifications across every meeting</p>
              <AllSpecs onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'kanban' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Kanban</h1>
              <p style={subStyle}>Track your meetings through the pipeline</p>
              <Kanban onSelectMeeting={handleMeetingSelect} />
            </div>
          )}

          {currentView === 'settings' && (
            <div style={pageStyle}>
              <h1 style={headingStyle}>Settings</h1>
              <p style={subStyle}>Manage your integrations and preferences</p>

              {/* GitHub Integration Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8dfd0',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem',
                }}
              >
                {/* Header */}
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

                {/* Content */}
                {githubConnected ? (
                  <div>
                    {/* Connected State */}
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
                      <div
                        style={{
                          color: '#2e7d32',
                          fontSize: '20px',
                        }}
                      >
                        ✓
                      </div>
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

                    {/* Permissions */}
                    <div
                      style={{
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e8dfd0',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#8a8a80',
                          fontWeight: '500',
                          marginBottom: '0.75rem',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Permissions granted:
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {[
                          'Create and manage repositories',
                          'Create branches and commits',
                          'Create pull requests',
                          'Create and manage issues',
                        ].map((perm, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: '13px',
                              color: '#8a8a80',
                              fontFamily: "'DM Sans', sans-serif",
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <span
                              style={{
                                width: '4px',
                                height: '4px',
                                background: '#8aab7e',
                                borderRadius: '50%',
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Not Connected State */}
                    <div
                      style={{
                        background: '#fff3e0',
                        border: '1px solid #ffe0b2',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ color: '#f57c00', fontSize: '20px', marginTop: '0.25rem' }}>
                        ⚠
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: '14px',
                            color: '#e65100',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: '500',
                            marginBottom: '0.25rem',
                          }}
                        >
                          GitHub not connected
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#d84315',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          You'll need to connect GitHub to use the "Ship" feature
                        </p>
                      </div>
                    </div>

                    {/* Connect Button */}
                    <GitHubConnectButton
                      onSuccess={() => {
                        setGithubConnected(true);
                      }}
                    />

                    {/* Permissions */}
                    <div
                      style={{
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e8dfd0',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#8a8a80',
                          fontWeight: '500',
                          marginBottom: '0.75rem',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        We'll request these permissions:
                      </p>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {[
                          'Create and manage repositories',
                          'Create branches and commits',
                          'Create pull requests',
                          'Create and manage issues',
                        ].map((perm, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: '13px',
                              color: '#8a8a80',
                              fontFamily: "'DM Sans', sans-serif",
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <span
                              style={{
                                width: '4px',
                                height: '4px',
                                background: '#8aab7e',
                                borderRadius: '50%',
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* API Key Manager */}
              <ApiKeyManager />

              {/* Linear Integration Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e8dfd0',
                  borderRadius: '12px',
                  padding: '2rem',
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
                        Connect Linear to create and update issue tickets from meeting specs
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
                    <div
                      style={{
                        color: '#2e7d32',
                        fontSize: '20px',
                      }}
                    >
                      ✓
                    </div>
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
                ) : (
                  <div>
                    <div
                      style={{
                        background: '#fff3e0',
                        border: '1px solid #ffe0b2',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ color: '#f57c00', fontSize: '20px', marginTop: '0.25rem' }}>
                        ⚠
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: '14px',
                            color: '#e65100',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: '500',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Linear not connected
                        </p>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#d84315',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          Connect Linear so Syntheon can create and update tickets for your shipped
                          specs
                        </p>
                      </div>
                    </div>

                    <LinearConnectButton
                      onSuccess={() => {
                        setLinearConnected(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
