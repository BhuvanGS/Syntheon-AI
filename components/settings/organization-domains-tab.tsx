'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import {
  Shield,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/island-toast';
import { isPublicDomain, extractDomain } from '@/lib/public-domains';

type EnrollmentMode = 'manual_invitation' | 'automatic_invitation' | 'automatic_suggestion';

// Using any for Clerk's domain resource to avoid type conflicts
type OrganizationDomainResource = any;

interface DomainVerificationState {
  domain: string;
  affiliationEmail: string;
  verificationCode: string;
  step: 'input-email' | 'input-code' | 'complete';
}

export function OrganizationDomainsTab() {
  const { organization, isLoaded, membership } = useOrganization();
  const { showToast } = useToast();

  const [domains, setDomains] = useState<OrganizationDomainResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDomainDialogOpen, setAddDomainDialogOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [enrollmentMode, setEnrollmentMode] = useState<EnrollmentMode>('automatic_invitation');
  const [adding, setAdding] = useState(false);

  const [verificationState, setVerificationState] = useState<DomainVerificationState | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [deleteDomainId, setDeleteDomainId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = membership?.role === 'org:admin';

  useEffect(() => {
    if (organization?.id) {
      void loadDomains();
    }
  }, [organization?.id]);

  async function loadDomains() {
    if (!organization) return;

    setLoading(true);
    try {
      const domainList = await organization.getDomains();
      setDomains(domainList.data || []);
    } catch (error) {
      console.error('Failed to load domains:', error);
      showToast('Failed to load domains', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleAddDomainClick() {
    setNewDomainName('');
    setEnrollmentMode('automatic_invitation');
    setVerificationState(null);
    setAddDomainDialogOpen(true);
  }

  async function handleCreateDomain() {
    if (!organization || !newDomainName.trim()) return;

    const domainName = newDomainName.trim().toLowerCase();

    // Validate not a public domain
    if (isPublicDomain(domainName)) {
      showToast('Public email domains cannot be added as verified domains', 'error');
      return;
    }

    setAdding(true);
    try {
      // Create domain with enrollment mode
      const domain = await organization.createDomain(domainName, {
        enrollmentMode,
      });

      showToast(`Domain ${domainName} created. Now verify ownership.`, 'success');

      // Move to verification step
      setVerificationState({
        domain: domainName,
        affiliationEmail: '',
        verificationCode: '',
        step: 'input-email',
      });

      await loadDomains();
    } catch (error: any) {
      console.error('Failed to create domain:', error);
      showToast(error?.message || 'Failed to create domain', 'error');
    } finally {
      setAdding(false);
    }
  }

  async function handlePrepareVerification() {
    if (!organization || !verificationState) return;

    const email = verificationState.affiliationEmail.trim();
    if (!email) {
      showToast('Please enter an email address', 'error');
      return;
    }

    // Validate email domain matches
    const emailDomain = extractDomain(email);
    if (emailDomain !== verificationState.domain) {
      showToast(`Email must be from ${verificationState.domain} domain`, 'error');
      return;
    }

    setVerifying(true);
    try {
      // Find the domain resource
      const domainResource = domains.find((d) => d.name === verificationState.domain);
      if (!domainResource) {
        throw new Error('Domain not found');
      }

      // Prepare affiliation verification
      await domainResource.prepareAffiliationVerification({
        affiliationEmailAddress: email,
      });

      showToast(`Verification code sent to ${email}`, 'success');

      setVerificationState((prev) =>
        prev
          ? {
              ...prev,
              step: 'input-code',
            }
          : null
      );
    } catch (error: any) {
      console.error('Failed to prepare verification:', error);
      showToast(error?.message || 'Failed to send verification code', 'error');
    } finally {
      setVerifying(false);
    }
  }

  async function handleAttemptVerification() {
    if (!organization || !verificationState) return;

    const code = verificationState.verificationCode.trim();
    if (!code) {
      showToast('Please enter the verification code', 'error');
      return;
    }

    setVerifying(true);
    try {
      // Find the domain resource
      const domainResource = domains.find((d) => d.name === verificationState.domain);
      if (!domainResource) {
        throw new Error('Domain not found');
      }

      // Attempt verification
      await domainResource.attemptAffiliationVerification({
        code,
      });

      showToast('Domain verified successfully!', 'success');

      setVerificationState((prev) =>
        prev
          ? {
              ...prev,
              step: 'complete',
            }
          : null
      );

      await loadDomains();

      // Close dialog after brief delay
      setTimeout(() => {
        setAddDomainDialogOpen(false);
        setVerificationState(null);
      }, 2000);
    } catch (error: any) {
      console.error('Failed to verify domain:', error);
      showToast(error?.message || 'Invalid verification code', 'error');
    } finally {
      setVerifying(false);
    }
  }

  async function handleDeleteDomain() {
    if (!organization || !deleteDomainId) return;

    setDeleting(true);
    try {
      const domainResource = domains.find((d) => d.id === deleteDomainId);
      if (!domainResource) {
        throw new Error('Domain not found');
      }

      await domainResource.delete();

      showToast('Domain removed', 'success');
      await loadDomains();
    } catch (error: any) {
      console.error('Failed to delete domain:', error);
      showToast(error?.message || 'Failed to delete domain', 'error');
    } finally {
      setDeleting(false);
      setDeleteDomainId(null);
    }
  }

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
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-playfair font-bold text-foreground">Verified Domains</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage email domains for automatic organization membership
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Domain-Based Access</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Users with verified email domains can automatically join
                </CardDescription>
              </div>
            </div>
            {isAdmin && (
              <Button size="sm" className="rounded-full" onClick={handleAddDomainClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {!isAdmin && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 mb-4">
              Only organization admins can manage verified domains.
            </div>
          )}

          {domains.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No verified domains</p>
              <p className="text-xs text-muted-foreground">
                Add a domain to enable automatic organization membership
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">@{domain.name}</p>
                        {domain.verification?.status === 'verified' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={
                            domain.verification?.status === 'verified' ? 'default' : 'secondary'
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {domain.verification?.status === 'verified' ? 'Verified' : 'Pending'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {domain.enrollmentMode === 'automatic_invitation'
                            ? 'Auto-join'
                            : 'Manual approval'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button size="sm" variant="ghost" onClick={() => setDeleteDomainId(domain.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isAdmin && domains.length > 0 && (
            <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-xs text-blue-700">
              <p className="font-medium mb-1">How it works</p>
              <p>
                Users signing up with an email from a verified domain will automatically be invited
                to join this organization. Auto-join domains allow immediate access, while manual
                approval requires admin confirmation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Domain Dialog */}
      <Dialog open={addDomainDialogOpen} onOpenChange={setAddDomainDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {!verificationState ? 'Add Verified Domain' : 'Verify Domain Ownership'}
            </DialogTitle>
            <DialogDescription>
              {!verificationState
                ? 'Add an email domain to enable automatic organization membership'
                : verificationState.step === 'input-email'
                  ? 'Enter an email address on this domain to receive a verification code'
                  : verificationState.step === 'input-code'
                    ? 'Enter the verification code sent to your email'
                    : 'Domain verified successfully!'}
            </DialogDescription>
          </DialogHeader>

          {!verificationState ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain-name">Domain Name</Label>
                <Input
                  id="domain-name"
                  placeholder="company.com"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  disabled={adding}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the domain without @ symbol (e.g., company.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment-mode">Enrollment Mode</Label>
                <Select
                  value={enrollmentMode}
                  onValueChange={(value) => setEnrollmentMode(value as EnrollmentMode)}
                  disabled={adding}
                >
                  <SelectTrigger id="enrollment-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatic_invitation">
                      Automatic (users can join immediately)
                    </SelectItem>
                    <SelectItem value="manual_invitation">
                      Manual (admin approval required)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Public domains not allowed</p>
                    <p>
                      You cannot add public email domains like gmail.com or outlook.com. Only
                      company-owned domains can be verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : verificationState.step === 'input-email' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="affiliation-email">Email Address</Label>
                <Input
                  id="affiliation-email"
                  type="email"
                  placeholder={`admin@${verificationState.domain}`}
                  value={verificationState.affiliationEmail}
                  onChange={(e) =>
                    setVerificationState((prev) =>
                      prev ? { ...prev, affiliationEmail: e.target.value } : null
                    )
                  }
                  disabled={verifying}
                />
                <p className="text-xs text-muted-foreground">
                  Must be an email address from @{verificationState.domain}
                </p>
              </div>
            </div>
          ) : verificationState.step === 'input-code' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationState.verificationCode}
                  onChange={(e) =>
                    setVerificationState((prev) =>
                      prev ? { ...prev, verificationCode: e.target.value } : null
                    )
                  }
                  disabled={verifying}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Check {verificationState.affiliationEmail} for the verification code
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
              <p className="text-sm font-medium text-foreground">Domain Verified!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Users with @{verificationState.domain} can now join
              </p>
            </div>
          )}

          <DialogFooter>
            {!verificationState ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setAddDomainDialogOpen(false)}
                  disabled={adding}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateDomain} disabled={adding || !newDomainName.trim()}>
                  {adding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create & Verify'
                  )}
                </Button>
              </>
            ) : verificationState.step === 'input-email' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setAddDomainDialogOpen(false)}
                  disabled={verifying}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePrepareVerification}
                  disabled={verifying || !verificationState.affiliationEmail.trim()}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Code'
                  )}
                </Button>
              </>
            ) : verificationState.step === 'input-code' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    setVerificationState((prev) =>
                      prev ? { ...prev, step: 'input-email', verificationCode: '' } : null
                    )
                  }
                  disabled={verifying}
                >
                  Back
                </Button>
                <Button
                  onClick={handleAttemptVerification}
                  disabled={verifying || !verificationState.verificationCode.trim()}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Domain Confirmation */}
      <Dialog open={!!deleteDomainId} onOpenChange={(open) => !open && setDeleteDomainId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Remove Domain?
            </DialogTitle>
            <DialogDescription>
              Users with this email domain will no longer be able to automatically join your
              organization. Existing members will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDomainId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDomain} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Domain'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
