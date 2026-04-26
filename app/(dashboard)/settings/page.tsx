'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Github, CheckCircle2, Link2Off, Users, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { GitHubConnectButton } from '@/components/github-connect-button';
import { ApiKeyManager } from '@/components/api-key-manager';
import { LinearConnectButton } from '@/components/linear-connect-button';
import { ProjectCreateDialog } from '@/components/project-create-dialog';
import { DynamicIslandSearch } from '@/components/dynamic-island-search';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';

interface Project {
  id: string;
  name: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setActive, userMemberships, createOrganization } = useOrganizationList({
    userMemberships: true,
  });
  const { membership, organization, invitations } = useOrganization({
    invitations: { infinite: true, pageSize: 20 },
  });
  const isAdmin = membership?.role === 'org:admin';

  const [projects, setProjects] = useState<Project[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [linearConnected, setLinearConnected] = useState(false);
  const [linearTeam, setLinearTeam] = useState<string | null>(null);
  const [integrationStatusLoaded, setIntegrationStatusLoaded] = useState(false);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [savingOrgName, setSavingOrgName] = useState(false);
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);
  const memberships = userMemberships.data ?? [];

  useEffect(() => {
    setOrgName(organization?.name ?? '');
  }, [organization?.id, organization?.name]);

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

  async function handleCreateOrganization(e: React.FormEvent) {
    e.preventDefault();
    if (!createOrganization || !setActive || !newOrgName.trim()) return;
    setCreatingOrg(true);
    try {
      const created = await createOrganization({ name: newOrgName.trim() });
      await setActive({ organization: created.id });
      setNewOrgName('');
      toast({ title: 'Organization created', description: `${created.name} is now active.` });
      window.location.assign('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Failed to create organization',
        description: err?.errors?.[0]?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreatingOrg(false);
    }
  }

  async function handleSwitchOrganization(nextOrgId: string) {
    if (!setActive) return;
    setSwitchingOrgId(nextOrgId);
    try {
      await setActive({ organization: nextOrgId });
      toast({ title: 'Organization switched' });
      window.location.assign('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Failed to switch organization',
        description: err?.errors?.[0]?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSwitchingOrgId(null);
    }
  }

  async function handleSaveOrgName(e: React.FormEvent) {
    e.preventDefault();
    if (!organization || !isAdmin || !orgName.trim()) return;
    setSavingOrgName(true);
    try {
      await organization.update({ name: orgName.trim() });
      await organization.reload();
      toast({
        title: 'Organization updated',
        description: 'Organization name saved successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update organization',
        description: err?.errors?.[0]?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingOrgName(false);
    }
  }

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

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !organization) return;
    setInviting(true);
    try {
      await organization.inviteMember({ emailAddress: inviteEmail.trim(), role: 'org:member' });
      setInviteEmail('');
      await organization?.reload?.();
      toast({ title: 'Invite sent', description: `Invite sent to ${inviteEmail.trim()}` });
    } catch (err: any) {
      toast({
        title: 'Failed to send invite',
        description: err?.errors?.[0]?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setInviting(false);
    }
  }

  async function handleRevokeInvite(invitationId: string) {
    const inv = invitations?.data?.find((i) => i.id === invitationId);
    if (!inv) return;
    try {
      await inv.revoke();
      await organization?.reload?.();
      toast({ title: 'Invite revoked' });
    } catch {
      toast({ title: 'Failed to revoke invite', variant: 'destructive' });
    }
  }

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
    <div className="flex h-screen bg-background">
      <Sidebar
        currentView="settings"
        projects={projects}
        selectedProjectId={null}
        onCreateProject={() => setIsProjectCreateOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
          <h1 className="text-sm font-semibold text-foreground">Settings</h1>
          <DynamicIslandSearch />
        </header>

        <main className="flex-1 overflow-auto animate-fade-in-up">
          <div className="p-6 space-y-5 max-w-2xl mx-auto w-full">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Settings</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your integrations and workspace preferences
              </p>
            </div>

            <Card className="border-border/60 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Organization Settings</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Manage your active organization workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Current organization</p>
                  <p className="text-sm font-medium text-foreground">
                    {organization?.name ?? 'No organization selected'}
                  </p>
                </div>

                <form onSubmit={handleCreateOrganization} className="space-y-2">
                  <p className="text-xs text-muted-foreground">Create new organization</p>
                  <div className="flex gap-2">
                    <Input
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      disabled={creatingOrg}
                      placeholder="e.g. Acme Labs"
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" disabled={creatingOrg || !newOrgName.trim()}>
                      {creatingOrg ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Switch organization</p>
                  {memberships.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      You are not part of any organizations yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {memberships.map((m) => {
                        const selected = m.organization.id === organization?.id;
                        const isSwitching = switchingOrgId === m.organization.id;
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm text-foreground">{m.organization.name}</p>
                              <p className="text-[11px] text-muted-foreground capitalize">
                                {m.role === 'org:admin' ? 'Admin' : 'Member'}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={selected ? 'secondary' : 'outline'}
                              disabled={selected || isSwitching}
                              onClick={() => handleSwitchOrganization(m.organization.id)}
                            >
                              {selected ? 'Active' : isSwitching ? 'Switching...' : 'Switch'}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {isAdmin && organization && (
                  <form onSubmit={handleSaveOrgName} className="space-y-2">
                    <p className="text-xs text-muted-foreground">Organization name</p>
                    <div className="flex gap-2">
                      <Input
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        disabled={savingOrgName}
                        placeholder="Your organization name"
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={
                          savingOrgName || !orgName.trim() || orgName.trim() === organization.name
                        }
                      >
                        {savingOrgName ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Org Invitations — admin only */}
            {isAdmin && (
              <Card className="border-border/60 shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Team Invitations</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Invite members to {organization?.name ?? 'your org'} via email
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 space-y-4">
                  <form onSubmit={handleInvite} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={inviting}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={inviting || !inviteEmail.trim()}
                      className="shrink-0"
                    >
                      {inviting ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Send invite'
                      )}
                    </Button>
                  </form>

                  {(invitations?.data?.length ?? 0) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Pending invitations
                      </p>
                      <div className="space-y-2">
                        {invitations!.data!.map((inv) => (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm text-foreground">{inv.emailAddress}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Invited · expires {new Date(inv.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRevokeInvite(inv.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* GitHub */}
            <Card className="border-border/60 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Github className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">GitHub</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Create branches, commits, and pull requests
                      </CardDescription>
                    </div>
                  </div>
                  {githubConnected && (
                    <Badge variant="default" className="text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {githubConnected ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Connected as{' '}
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          @{githubUser}
                        </code>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        GitHub account is linked to Syntheon
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnectGithub}
                      className="text-destructive hover:text-destructive gap-1.5"
                    >
                      <Link2Off className="h-3.5 w-3.5" /> Disconnect
                    </Button>
                  </div>
                ) : (
                  <GitHubConnectButton onSuccess={() => setGithubConnected(true)} />
                )}
              </CardContent>
            </Card>

            {/* API Key */}
            <ApiKeyManager />

            {/* Linear */}
            <Card className="border-border/60 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#f5f0ff] flex items-center justify-center shrink-0 font-bold text-[#5c3b8a] text-sm">
                      L
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Linear</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Create and sync issue tickets from meeting transcripts
                      </CardDescription>
                    </div>
                  </div>
                  {linearConnected && (
                    <Badge variant="default" className="text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {linearConnected ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Linear account connected
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {linearTeam
                          ? `Default team: ${linearTeam}`
                          : 'Default team from your workspace'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnectLinear}
                      className="text-destructive hover:text-destructive gap-1.5"
                    >
                      <Link2Off className="h-3.5 w-3.5" /> Disconnect
                    </Button>
                  </div>
                ) : (
                  <LinearConnectButton onSuccess={() => setLinearConnected(true)} />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

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
