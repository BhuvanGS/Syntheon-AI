'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sidebar } from '@/components/sidebar';
import {
  Github,
  CheckCircle2,
  Link2Off,
  Users,
  Copy,
  RefreshCw,
  Trash2,
  Link,
  Building2,
  Palette,
  Sun,
  Moon,
  Monitor,
  ShieldCheck,
  UserMinus,
  ChevronDown,
  ExternalLink,
  Calendar,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { GitHubConnectButton } from '@/components/github-connect-button';
import { ApiKeyManager } from '@/components/api-key-manager';
import { ProjectCreateDialog } from '@/components/project-create-dialog';
import { DynamicIslandSearch } from '@/components/dynamic-island-search';
import { NotificationBell } from '@/components/notification-bell';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Mail } from 'lucide-react';

const TABS = [
  { id: 'connections', label: 'Connections', icon: Link },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface Project {
  id: string;
  name: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('connections');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam as TabId);
    }
  }, [searchParams]);

  const { setActive, userMemberships, createOrganization } = useOrganizationList({
    userMemberships: true,
  });
  const { membership, organization, invitations } = useOrganization({
    invitations: { infinite: true, pageSize: 20 },
  });
  const isAdmin = membership?.role === 'org:admin';

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [integrationStatusLoaded, setIntegrationStatusLoaded] = useState(false);
  const [isProjectCreateOpen, setIsProjectCreateOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [savingOrgName, setSavingOrgName] = useState(false);
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);
  const memberships = userMemberships.data ?? [];
  const { memberships: orgMemberships } = useOrganization({
    memberships: { infinite: true, pageSize: 50 },
  });
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteToRevoke, setInviteToRevoke] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    setOrgName(organization?.name ?? '');
  }, [organization?.id, organization?.name]);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        setProjectsLoading(true);
        const projectsRes = await fetch('/api/projects');
        if (isMounted && projectsRes.ok) {
          setProjects(await projectsRes.json());
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        if (isMounted) setProjectsLoading(false);
      }
    }

    async function loadIntegrationStatus() {
      try {
        const statusRes = await fetch('/api/integrations/status');
        if (isMounted && statusRes.ok) {
          const data = await statusRes.json();
          setGithubConnected(Boolean(data.githubConnected));
          setGithubUser(data.githubUser ?? null);
          setGoogleConnected(Boolean(data.googleConnected));
        }
      } catch (error) {
        console.error('Failed to load integration status:', error);
      } finally {
        if (isMounted) setIntegrationStatusLoaded(true);
      }
    }

    // Load projects immediately, don't wait for slow integration status
    void loadProjects();
    void loadIntegrationStatus();

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
    const googleConnectedParam = searchParams.get('google_connected');
    const googleError = searchParams.get('google_error');
    if (
      !integrationStatusLoaded &&
      !githubConnectedParam &&
      !githubError &&
      !googleConnectedParam &&
      !googleError
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

    if (googleConnectedParam === 'true') {
      setGoogleConnected(true);
      toast({
        title: '✅ Google Calendar Connected!',
        description: 'You can now create Google Meet links from Syntheon.',
      });
    }

    if (googleError) {
      const detail = searchParams.get('google_error_detail');
      toast({
        title: '❌ Google Connection Failed',
        description: detail || googleError,
        variant: 'destructive',
      });
    }
  }, [searchParams, integrationStatusLoaded]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !organization) return;
    setInviting(true);
    try {
      const res = await fetch('/api/organization/invite-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress: inviteEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to create invite');
      }

      const inviteUrl = String(data?.invitation?.url ?? '').trim();
      if (!inviteUrl) {
        throw new Error('Invite created, but no invite URL was returned.');
      }

      setGeneratedInviteLink(inviteUrl);

      try {
        await navigator.clipboard.writeText(inviteUrl);
        toast({ title: 'Invite sent', description: 'Invitation link copied to clipboard.' });
      } catch {
        toast({ title: 'Invite sent', description: 'Copy the invitation link below.' });
      }

      await organization?.reload?.();
      setInviteEmail('');
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

  async function handleRemoveMember(membershipId: string) {
    const m = orgMemberships?.data?.find((x) => x.id === membershipId);
    if (!m) return;
    setRemovingMemberId(membershipId);
    try {
      await m.destroy();
      await organization?.reload?.();
      toast({ title: 'Member removed' });
    } catch {
      toast({ title: 'Failed to remove member', variant: 'destructive' });
    } finally {
      setRemovingMemberId(null);
      setMemberToRemove(null);
    }
  }

  async function handleChangeRole(membershipId: string, newRole: 'org:admin' | 'org:member') {
    const m = orgMemberships?.data?.find((x) => x.id === membershipId);
    if (!m) return;
    setChangingRoleId(membershipId);
    try {
      await m.update({ role: newRole });
      await organization?.reload?.();
      toast({ title: 'Role updated' });
    } catch {
      toast({ title: 'Failed to update role', variant: 'destructive' });
    } finally {
      setChangingRoleId(null);
    }
  }

  async function handleRevokeInvite() {
    if (!inviteToRevoke) return;
    const inv = invitations?.data?.find((i) => i.id === inviteToRevoke.id);
    if (!inv) return;
    try {
      await inv.revoke();
      setInviteToRevoke(null);
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

  async function handleConnectGoogle() {
    try {
      const res = await fetch('/api/oauth/google/initiate', { method: 'POST' });
      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        toast({
          title: 'Failed to start Google OAuth',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Failed to start Google OAuth',
        description: 'Please try again.',
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

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Clean light interface' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Match your OS preference' },
  ] as const;

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
          <div className="flex items-center gap-2">
            <NotificationBell />
            <DynamicIslandSearch />
          </div>
        </header>

        <main className="flex-1 overflow-auto animate-fade-in-up">
          <div className="p-6 max-w-2xl mx-auto w-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Settings</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your integrations and workspace preferences
              </p>
            </div>

            {/* ── Segmented control ─────────────────────────────── */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/50 mb-6">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                      transition-all duration-200 cursor-pointer
                      ${
                        active
                          ? 'bg-background text-foreground shadow-sm border border-border/60'
                          : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Connections tab ───────────────────────────────── */}
            {activeTab === 'connections' && (
              <div className="space-y-5 animate-fade-in-up">
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
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDisconnectGithub}
                            className="text-destructive hover:text-destructive gap-1.5"
                          >
                            <Link2Off className="h-3.5 w-3.5" /> Disconnect
                          </Button>
                        )}
                      </div>
                    ) : isAdmin ? (
                      <GitHubConnectButton onSuccess={() => setGithubConnected(true)} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        GitHub repository not connected
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Google Calendar */}
                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Calendar className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">Google Calendar</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Create Google Meet links directly from Syntheon
                          </CardDescription>
                        </div>
                      </div>
                      {googleConnected && (
                        <Badge variant="default" className="text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Connected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    {googleConnected ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Google Calendar is connected
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            You can create Google Meet links from any project.
                          </p>
                        </div>
                        {isAdmin && (
                          <Badge variant="outline" className="text-[10px]">
                            Active
                          </Badge>
                        )}
                      </div>
                    ) : isAdmin ? (
                      <Button
                        onClick={handleConnectGoogle}
                        className="rounded-full gap-2"
                        size="sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Connect Google Calendar
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">Google Calendar not connected</p>
                    )}
                  </CardContent>
                </Card>

                {/* API Key */}
                <ApiKeyManager />
              </div>
            )}

            {/* ── Organization tab ─────────────────────────────── */}
            {activeTab === 'organization' && (
              <div className="space-y-5 animate-fade-in-up">
                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Organization</CardTitle>
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
                        <Button
                          type="submit"
                          size="sm"
                          disabled={creatingOrg || !newOrgName.trim()}
                        >
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
                              savingOrgName ||
                              !orgName.trim() ||
                              orgName.trim() === organization.name
                            }
                          >
                            {savingOrgName ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Members — admin only */}
                {isAdmin && (
                  <Card className="border-border/60 shadow-none">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">Members</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            Manage members of {organization?.name ?? 'your org'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-4 space-y-4">
                      {/* Invite banner */}
                      <div className="flex items-center justify-between rounded-xl border border-dashed border-border/70 bg-muted/30 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Invite your team</p>
                            <p className="text-xs text-muted-foreground">
                              Collaborators get access to all projects in{' '}
                              {organization?.name ?? 'your org'}.
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setInviteDialogOpen(true)}
                          className="gap-2 shrink-0 ml-4"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Send Invite
                        </Button>
                      </div>

                      {/* Current members */}
                      {(orgMemberships?.data?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Current members
                          </p>
                          <div className="space-y-2">
                            {orgMemberships!.data!.map((m) => {
                              const name =
                                [m.publicUserData?.firstName, m.publicUserData?.lastName]
                                  .filter(Boolean)
                                  .join(' ') ||
                                m.publicUserData?.identifier ||
                                'Unknown';
                              const isMe =
                                m.publicUserData?.userId === membership?.publicUserData?.userId;
                              const isOrgAdmin = m.role === 'org:admin';
                              return (
                                <div
                                  key={m.id}
                                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                                >
                                  <div className="flex items-center gap-2">
                                    {m.publicUserData?.imageUrl ? (
                                      <img
                                        src={m.publicUserData.imageUrl}
                                        alt={name}
                                        className="h-7 w-7 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                        {name[0]?.toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm text-foreground">
                                        {name}
                                        {isMe && (
                                          <span className="ml-1 text-[10px] text-muted-foreground">
                                            (you)
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground capitalize">
                                        {isOrgAdmin ? 'Admin' : 'Member'}
                                      </p>
                                    </div>
                                  </div>
                                  {!isMe && (
                                    <div className="flex items-center gap-1">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 gap-1 text-xs"
                                            disabled={changingRoleId === m.id}
                                          >
                                            <ShieldCheck className="h-3 w-3" />
                                            {changingRoleId === m.id
                                              ? '...'
                                              : isOrgAdmin
                                                ? 'Admin'
                                                : 'Member'}
                                            <ChevronDown className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => handleChangeRole(m.id, 'org:admin')}
                                            disabled={isOrgAdmin}
                                          >
                                            Make Admin
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleChangeRole(m.id, 'org:member')}
                                            disabled={!isOrgAdmin}
                                          >
                                            Make Member
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        disabled={removingMemberId === m.id}
                                        onClick={() => setMemberToRemove({ id: m.id, name })}
                                      >
                                        <UserMinus className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Pending invitations */}
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
                                    Pending · invited {new Date(inv.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                                  onClick={() =>
                                    setInviteToRevoke({ id: inv.id, email: inv.emailAddress })
                                  }
                                >
                                  Revoke
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Send invite dialog */}
                <Dialog
                  open={inviteDialogOpen}
                  onOpenChange={(o) => {
                    setInviteDialogOpen(o);
                    if (!o) {
                      setInviteEmail('');
                      setGeneratedInviteLink('');
                    }
                  }}
                >
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invite a member</DialogTitle>
                      <DialogDescription>
                        They'll receive an email invite to join{' '}
                        {organization?.name ?? 'your organization'}.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleInvite}>
                      <div className="py-2">
                        <Input
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          disabled={inviting}
                          autoFocus
                        />
                      </div>
                      {generatedInviteLink && (
                        <div className="mb-2 rounded-lg border border-border/60 bg-muted/30 p-3">
                          <p className="text-[11px] text-muted-foreground mb-2">
                            Invitation link ready
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(generatedInviteLink);
                                  toast({
                                    title: 'Copied',
                                    description: 'Invitation link copied.',
                                  });
                                } catch {
                                  toast({
                                    title: 'Copy failed',
                                    description: 'Please copy the link manually.',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                window.open(generatedInviteLink, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setGeneratedInviteLink('')}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <DialogFooter className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setInviteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
                          {inviting ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : null}
                          {inviting ? 'Sending...' : 'Send invite & get link'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Revoke invite confirmation dialog */}
                <AlertDialog
                  open={Boolean(inviteToRevoke)}
                  onOpenChange={(o) => {
                    if (!o) setInviteToRevoke(null);
                  }}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke invite?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The invite sent to{' '}
                        <span className="font-medium text-foreground">{inviteToRevoke?.email}</span>{' '}
                        will be cancelled and the link will no longer work.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleRevokeInvite}
                      >
                        Revoke
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Remove member confirmation dialog */}
                <AlertDialog
                  open={Boolean(memberToRemove)}
                  onOpenChange={(o) => {
                    if (!o) setMemberToRemove(null);
                  }}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {memberToRemove?.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        They will lose access to this organization immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => memberToRemove && handleRemoveMember(memberToRemove.id)}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* ── Appearance tab ────────────────────────────────── */}
            {activeTab === 'appearance' && (
              <div className="space-y-5 animate-fade-in-up">
                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Palette className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Theme</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Choose how Syntheon looks for you
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-5">
                    <div className="grid grid-cols-3 gap-3">
                      {themeOptions.map((opt) => {
                        const Icon = opt.icon;
                        const active = theme === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setTheme(opt.value)}
                            className={`
                              group relative flex flex-col items-center gap-3 rounded-xl border-2 p-5
                              transition-all duration-200 cursor-pointer
                              ${
                                active
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-border/60 hover:border-border hover:bg-muted/30'
                              }
                            `}
                          >
                            <div
                              className={`
                                h-10 w-10 rounded-lg flex items-center justify-center transition-colors
                                ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:text-foreground'}
                              `}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p
                                className={`text-sm font-medium ${active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                              >
                                {opt.label}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {opt.description}
                              </p>
                            </div>
                            {active && (
                              <div className="absolute top-2.5 right-2.5">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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
