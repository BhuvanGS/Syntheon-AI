'use client';

import { useState, useEffect } from 'react';
import { useUser, useOrganization, useOrganizationList } from '@clerk/nextjs';
import { extractDomain } from '@/lib/public-domains';
import {
  Building2,
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Clock,
  AlertTriangle,
  Loader2,
  Copy,
  CheckCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/island-toast';
import { cn } from '@/lib/utils';

interface OrgMetadata {
  companyName: string;
  managerName: string;
  allowAccessRequests: boolean;
  joinCode: string | null;
}

interface AccessRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

interface SentInvite {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'revoked';
  invitedAt: string;
  token: string | null;
}

export function OrganizationsTab() {
  const { user } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { showToast } = useToast();
  const { userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: true, pageSize: 50 },
  });
  const [orgMetadata, setOrgMetadata] = useState<OrgMetadata>({
    companyName: '',
    managerName: '',
    allowAccessRequests: false,
    joinCode: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [sentInvitesLoading, setSentInvitesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmToggleDialog, setConfirmToggleDialog] = useState(false);
  const [switchingOrgId, setSwitchingOrgId] = useState<string | null>(null);
  const [createOrgDialogOpen, setCreateOrgDialogOpen] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    companyName: '',
    managerName: '',
    allowAccessRequests: false,
  });
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJoinCode, setCopiedJoinCode] = useState(false);
  const [rotatingCode, setRotatingCode] = useState(false);
  const [confirmRotateCode, setConfirmRotateCode] = useState(false);
  const [revokeInviteId, setRevokeInviteId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [reinviteEmail, setReinviteEmail] = useState<string | null>(null);

  const memberships = userMemberships?.data ?? [];
  const currentMembership = memberships.find((m) => m.organization.id === organization?.id);
  const isAdmin = currentMembership?.role === 'org:admin';

  useEffect(() => {
    if (!organization?.id) return;
    void loadOrgMetadata();
    if (isAdmin) {
      void loadAccessRequests();
      void loadSentInvites();
    }
  }, [organization?.id, isAdmin]);

  async function loadOrgMetadata() {
    if (!organization?.id) return;
    try {
      const res = await fetch(`/api/organizations/${organization.id}/metadata`);
      if (res.ok) {
        const data = await res.json();
        setOrgMetadata({
          companyName: data.companyName || '',
          managerName: data.managerName || '',
          allowAccessRequests: data.allowAccessRequests || false,
          joinCode: data.joinCode || null,
        });
      }
    } catch (error) {
      console.error('Failed to load org metadata:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAccessRequests() {
    if (!organization?.id || !isAdmin) return;
    setRequestsLoading(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}/access-requests`);
      if (res.ok) {
        const data = await res.json();
        setAccessRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load access requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  }

  async function loadSentInvites() {
    if (!organization?.id || !isAdmin) return;
    setSentInvitesLoading(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}/sent-invites`);
      if (res.ok) {
        const data = await res.json();
        setSentInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Failed to load sent invites:', error);
    } finally {
      setSentInvitesLoading(false);
    }
  }

  async function handleSaveMetadata() {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgMetadata),
      });
      if (!res.ok) throw new Error('Failed to save');
      showToast('Organization details updated', 'success');
    } catch (error) {
      showToast('Failed to save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAccessRequests(enabled: boolean) {
    if (!enabled) {
      setConfirmToggleDialog(true);
      return;
    }
    await updateAccessRequestsSetting(enabled);
  }

  async function updateAccessRequestsSetting(enabled: boolean) {
    if (!organization?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...orgMetadata, allowAccessRequests: enabled }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setOrgMetadata((prev) => ({ ...prev, allowAccessRequests: enabled }));
      setConfirmToggleDialog(false);
      showToast(
        enabled
          ? 'Users can now request access to your organization'
          : 'Only invited users can join your organization',
        'success'
      );
    } catch (error) {
      showToast('Failed to update. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleRevokeInvite(inviteId: string) {
    setRevokeInviteId(inviteId);
  }

  async function confirmRevokeInvite() {
    if (!organization?.id || !revokeInviteId) return;
    setRevoking(true);
    try {
      const res = await fetch(
        `/api/organizations/${organization.id}/sent-invites/${revokeInviteId}`,
        {
          method: 'POST',
        }
      );
      if (!res.ok) throw new Error('Failed to revoke invite');
      await loadSentInvites();
      showToast('The invitation has been revoked.', 'success');
    } catch (error) {
      showToast('Failed to revoke invite. Please try again.', 'error');
    } finally {
      setRevoking(false);
      setRevokeInviteId(null);
    }
  }

  async function sendInvite(email: string) {
    if (!organization?.id) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send invite');
      const data = await res.json();
      setGeneratedInviteLink(data.inviteLink || '');
      setCopiedLink(false);
      await loadSentInvites();
      showToast('An invitation has been sent to ' + data.email, 'success');
    } catch (error) {
      showToast('Failed to send invite. Please try again.', 'error');
    } finally {
      setInviting(false);
    }
  }

  function handleSendInviteClick() {
    const email = inviteEmail.trim();
    if (!email || !organization?.id) return;
    const wasRevoked = sentInvites.some(
      (invite) => invite.email.toLowerCase() === email.toLowerCase() && invite.status === 'revoked'
    );
    if (wasRevoked) {
      setReinviteEmail(email);
      return;
    }
    void sendInvite(email);
  }

  async function handleAccessRequest(requestId: string, action: 'approve' | 'reject') {
    if (!organization?.id) return;
    try {
      const res = await fetch(
        `/api/organizations/${organization.id}/access-requests/${requestId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );
      if (!res.ok) throw new Error('Failed to process request');
      await loadAccessRequests();
      showToast(`Access request has been ${action}d`, 'success');
    } catch (error) {
      showToast('Failed to process request. Please try again.', 'error');
    }
  }

  async function handleSwitchOrganization(orgId: string) {
    if (!setActive) return;
    setSwitchingOrgId(orgId);
    try {
      await setActive({ organization: orgId });
      showToast('Organization switched', 'success');
      window.location.assign('/dashboard');
    } catch (error) {
      showToast('Failed to switch organization. Please try again.', 'error');
    } finally {
      setSwitchingOrgId(null);
    }
  }

  const filteredRequests = accessRequests.filter(
    (req) =>
      req.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = filteredRequests.filter((r) => r.status === 'pending');
  const completedRequests = filteredRequests.filter((r) => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-playfair font-bold text-foreground">Organizations</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your organization settings and memberships
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="my-org" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-org">My Organization</TabsTrigger>
          <TabsTrigger value="joinable">Joinable</TabsTrigger>
          {isAdmin && <TabsTrigger value="requests">Requests</TabsTrigger>}
        </TabsList>

        {/* My Organization Tab */}
        <TabsContent value="my-org" className="space-y-6">
          <Card className="border-border/60 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Organization Details</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Basic information about your organization
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-xs">
                  Organization Name
                </Label>
                <Input
                  id="org-name"
                  value={organization?.name || ''}
                  disabled
                  className="bg-muted/30"
                />
                <p className="text-[11px] text-muted-foreground">
                  Managed by Clerk. Contact support to change.
                </p>
              </div>

              {isAdmin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-xs">
                      Company Name
                    </Label>
                    <Input
                      id="company-name"
                      value={orgMetadata.companyName}
                      onChange={(e) =>
                        setOrgMetadata((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                      placeholder="e.g. Acme Inc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manager-name" className="text-xs">
                      Organization Manager
                    </Label>
                    <Input
                      id="manager-name"
                      value={orgMetadata.managerName}
                      onChange={(e) =>
                        setOrgMetadata((prev) => ({ ...prev, managerName: e.target.value }))
                      }
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="access-requests" className="text-sm font-medium">
                          Allow Access Requests
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Let users request to join your organization
                        </p>
                      </div>
                      <Switch
                        id="access-requests"
                        checked={orgMetadata.allowAccessRequests}
                        onCheckedChange={handleToggleAccessRequests}
                      />
                    </div>

                    {orgMetadata.allowAccessRequests && (
                      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-700">
                        <p className="font-medium mb-1">Access requests are enabled</p>
                        <p>
                          Users can request to join your organization. You'll review and approve
                          requests in the Requests tab.
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSaveMetadata}
                    disabled={saving}
                    className="w-full rounded-full"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}

              {!isAdmin && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700">
                  Only organization admins can edit these settings.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Joinable Organizations Tab */}
        <TabsContent value="joinable" className="space-y-4">
          <Card className="border-border/60 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Your Organizations</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Organizations you're a member of
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              {memberships.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No organizations yet</p>
                  <p className="text-xs text-muted-foreground">
                    Create or join an organization to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memberships.map((m) => {
                    const isActive = m.organization.id === organization?.id;
                    const isSwitching = switchingOrgId === m.organization.id;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {m.organization.name}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {m.role === 'org:admin' ? 'Admin' : 'Member'}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isActive ? 'secondary' : 'outline'}
                          disabled={isActive || isSwitching}
                          onClick={() => handleSwitchOrganization(m.organization.id)}
                        >
                          {isActive ? 'Active' : isSwitching ? 'Switching...' : 'Switch'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <Separator className="my-4" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="requests" className="space-y-4">
            {/* Join Code Card */}
            <Card className="border-border/60 shadow-none overflow-hidden">
              <div className="relative bg-muted/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Organization Join Code</p>
                    <p className="text-xs text-muted-foreground">
                      Share this code with team members so they can join
                    </p>
                  </div>
                </div>
                {orgMetadata.joinCode ? (
                  <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 px-6 py-5">
                    <code className="text-4xl font-mono font-black tracking-[0.15em] text-foreground">
                      {orgMetadata.joinCode.slice(0, 4)}
                      <span className="text-primary/40 mx-1">-</span>
                      {orgMetadata.joinCode.slice(4)}
                    </code>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmRotateCode(true)}
                        disabled={rotatingCode}
                        className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Rotate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(orgMetadata.joinCode!);
                          setCopiedJoinCode(true);
                          showToast('Join code copied to clipboard', 'success');
                          setTimeout(() => setCopiedJoinCode(false), 2000);
                        }}
                        className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors duration-200"
                      >
                        {copiedJoinCode ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-primary transition-all duration-200" />
                            <span className="text-primary">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 transition-all duration-200" />
                            <span>Copy code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!organization?.id) return;
                      setRotatingCode(true);
                      try {
                        const res = await fetch(
                          `/api/organizations/${organization.id}/rotate-join-code`,
                          { method: 'POST' }
                        );
                        if (!res.ok) throw new Error('Failed to generate code');
                        const data = await res.json();
                        setOrgMetadata((prev) => ({ ...prev, joinCode: data.joinCode }));
                        showToast('Join code generated', 'success');
                      } catch {
                        showToast('Failed to generate join code', 'error');
                      } finally {
                        setRotatingCode(false);
                      }
                    }}
                    disabled={rotatingCode}
                    className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-dashed border-primary/30 px-6 py-5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors duration-200"
                  >
                    {rotatingCode ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Generate join code
                      </>
                    )}
                  </button>
                )}
              </div>
            </Card>

            {/* Invite Users (only when access requests are enabled) */}
            {orgMetadata.allowAccessRequests && (
              <Card className="border-border/60 shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <UserPlus className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Invite Users</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Invite team members to your organization
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={handleSendInviteClick}
                        disabled={inviting || !inviteEmail.trim()}
                      >
                        {inviting ? 'Sending...' : 'Send Invite'}
                      </Button>
                    </div>
                    {generatedInviteLink && (
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Invite link generated</p>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedInviteLink);
                            setCopiedLink(true);
                            showToast('Invite link copied to clipboard', 'success');
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-200"
                          style={{ color: copiedLink ? '#16a34a' : 'currentColor' }}
                        >
                          {copiedLink ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600 transition-all duration-200" />
                              <span className="text-green-600 transition-colors duration-200">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 transition-all duration-200" />
                              <span className="transition-colors duration-200">Copy link</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="incoming" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="incoming">
                  Incoming{' '}
                  {pendingRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
              </TabsList>

              <TabsContent value="incoming" className="space-y-4">
                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                        <UserPlus className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Incoming Requests</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Users requesting to join your organization
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search incoming requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {requestsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : accessRequests.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                          <Clock className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          No incoming requests
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Access requests will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingRequests.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Pending</p>
                            {pendingRequests.map((req) => (
                              <div
                                key={req.id}
                                className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {req.userName || 'Unknown User'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                                  <p className="text-[11px] text-muted-foreground mt-1">
                                    Requested {new Date(req.requestedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAccessRequest(req.id, 'reject')}
                                  >
                                    <X className="h-3.5 w-3.5 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAccessRequest(req.id, 'approve')}
                                  >
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {completedRequests.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Completed</p>
                            {completedRequests.map((req) => (
                              <div
                                key={req.id}
                                className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 opacity-60"
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {req.userName || 'Unknown User'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                                </div>
                                <Badge
                                  variant={req.status === 'approved' ? 'default' : 'secondary'}
                                  className="text-xs capitalize"
                                >
                                  {req.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outgoing" className="space-y-4">
                <Card className="border-border/60 shadow-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <UserPlus className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">Outgoing Requests</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Invitations you've sent to join your organization
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    {sentInvitesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : sentInvites.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                          <UserPlus className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">No invites sent</p>
                        <p className="text-xs text-muted-foreground">
                          Invitations you send will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sentInvites.map((invite) => (
                          <div
                            key={invite.id}
                            className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-medium text-foreground">{invite.email}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Sent {new Date(invite.invitedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  invite.status === 'pending'
                                    ? 'secondary'
                                    : invite.status === 'revoked'
                                      ? 'destructive'
                                      : 'outline'
                                }
                                className="text-xs capitalize"
                              >
                                {invite.status}
                              </Badge>
                              {invite.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRevokeInvite(invite.id)}
                                >
                                  <X className="h-3.5 w-3.5 mr-1" />
                                  Revoke
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}
      </Tabs>

      {/* Confirm Disable Access Requests Dialog */}
      <Dialog open={confirmToggleDialog} onOpenChange={setConfirmToggleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Disable Access Requests?
            </DialogTitle>
            <DialogDescription>
              If you disable access requests, users will no longer be able to request access to your
              organization. Only invited users will be able to join.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700">
            Any pending requests will remain in your queue, but new users won't be able to submit
            requests.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmToggleDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => updateAccessRequestsSetting(false)} disabled={saving}>
              {saving ? 'Disabling...' : 'Disable Access Requests'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Organization Dialog */}
      <Dialog
        open={createOrgDialogOpen}
        onOpenChange={(o) => {
          setCreateOrgDialogOpen(o);
          if (!o) {
            setNewOrgForm({
              name: '',
              companyName: '',
              managerName: '',
              allowAccessRequests: false,
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              This creates a separate workspace with its own projects, meetings, and members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">Organization Name</Label>
              <Input
                value={newOrgForm.name}
                onChange={(e) => setNewOrgForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Acme Labs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Company Name</Label>
              <Input
                value={newOrgForm.companyName}
                onChange={(e) =>
                  setNewOrgForm((prev) => ({ ...prev, companyName: e.target.value }))
                }
                placeholder="e.g. Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Organization Manager</Label>
              <Input
                value={newOrgForm.managerName}
                onChange={(e) =>
                  setNewOrgForm((prev) => ({ ...prev, managerName: e.target.value }))
                }
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Allow Access Requests</Label>
                <p className="text-xs text-muted-foreground">
                  Let users request to join this organization
                </p>
              </div>
              <Switch
                checked={newOrgForm.allowAccessRequests}
                onCheckedChange={(checked) =>
                  setNewOrgForm((prev) => ({ ...prev, allowAccessRequests: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOrgDialogOpen(false)}
              disabled={creatingOrg}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!newOrgForm.name.trim()) return;
                setCreatingOrg(true);
                try {
                  const res = await fetch('/api/organizations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...newOrgForm,
                      domain:
                        extractDomain(user?.primaryEmailAddress?.emailAddress ?? '') ?? undefined,
                    }),
                  });
                  if (!res.ok) throw new Error('Failed to create organization');
                  const data = await res.json();
                  setCreateOrgDialogOpen(false);
                  setNewOrgForm({
                    name: '',
                    companyName: '',
                    managerName: '',
                    allowAccessRequests: false,
                  });
                  showToast(`${data.name} has been created successfully.`, 'success');
                  window.location.reload();
                } catch (error) {
                  showToast('Failed to create organization. Please try again.', 'error');
                } finally {
                  setCreatingOrg(false);
                }
              }}
              disabled={creatingOrg || !newOrgForm.name.trim()}
            >
              {creatingOrg ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-invite Previously Revoked User Dialog */}
      <Dialog
        open={Boolean(reinviteEmail)}
        onOpenChange={(open) => {
          if (!open) setReinviteEmail(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Previously revoked user
            </DialogTitle>
            <DialogDescription>
              <strong>{reinviteEmail}</strong> was previously revoked. Do you want to send a new
              invitation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReinviteEmail(null)} disabled={inviting}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!reinviteEmail) return;
                void sendInvite(reinviteEmail);
                setReinviteEmail(null);
              }}
              disabled={inviting}
            >
              {inviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Invite Confirmation Dialog */}
      <Dialog
        open={Boolean(revokeInviteId)}
        onOpenChange={(open) => {
          if (!open) setRevokeInviteId(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Revoke Invitation?
            </DialogTitle>
            <DialogDescription>
              This will cancel the invitation and the recipient will no longer be able to join your
              organization using this link.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeInviteId(null)} disabled={revoking}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRevokeInvite} disabled={revoking}>
              {revoking ? 'Revoking...' : 'Revoke Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate Join Code Confirmation */}
      <Dialog
        open={confirmRotateCode}
        onOpenChange={(open) => {
          if (!open) setConfirmRotateCode(false);
        }}
      >
        <DialogContent className="sm:max-w-md border-border bg-background shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl text-foreground flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Rotate Join Code?
            </DialogTitle>
            <DialogDescription>
              A new 8-digit code will be generated. The old code will stop working immediately.
              Anyone trying to join with the old code will be rejected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmRotateCode(false)}
              disabled={rotatingCode}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!organization?.id) return;
                setRotatingCode(true);
                try {
                  const res = await fetch(
                    `/api/organizations/${organization.id}/rotate-join-code`,
                    { method: 'POST' }
                  );
                  if (!res.ok) throw new Error('Failed to rotate code');
                  const data = await res.json();
                  setOrgMetadata((prev) => ({ ...prev, joinCode: data.joinCode }));
                  setConfirmRotateCode(false);
                  showToast('Join code rotated successfully', 'success');
                } catch {
                  showToast('Failed to rotate join code', 'error');
                } finally {
                  setRotatingCode(false);
                }
              }}
              disabled={rotatingCode}
            >
              {rotatingCode ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rotating...
                </>
              ) : (
                'Rotate Code'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
