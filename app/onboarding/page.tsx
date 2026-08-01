'use client';

import { BrandLogo } from '@/components/brand-logo';

import { useState, useEffect, useCallback } from 'react';
import { useOrganizationList, useUser } from '@clerk/nextjs';
import { Building2, Users, ArrowRight, Loader2, Link2, ArrowLeft, Clock } from 'lucide-react';
import { isPublicDomainEmail, generateOrgNameFromDomain } from '@/lib/org-utils';
import { extractDomain } from '@/lib/public-domains';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingMessage } from '@/components/loading-message';
import { motion, AnimatePresence } from 'motion/react';
import { WelcomeDialog } from '@/components/welcome-dialog';

type Step = 'loading' | 'choose' | 'create' | 'join' | 'join-existing' | 'waiting' | 'error';

type DomainCheckResult = {
  exists: boolean;
  orgId?: string;
  orgName?: string;
} | null;

type WaitingInfo = {
  orgId: string;
  orgName: string | null;
};

export default function OnboardingPage() {
  const { user } = useUser();
  const { createOrganization, setActive, userMemberships } = useOrganizationList({
    userMemberships: true,
  });

  const [step, setStep] = useState<Step>('loading');
  const [orgName, setOrgName] = useState('');
  const [joinLinkInput, setJoinLinkInput] = useState('');
  const [waiting, setWaiting] = useState<WaitingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [domainCheck, setDomainCheck] = useState<DomainCheckResult>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const memberships = userMemberships.data ?? [];

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';
  const isPublicDomain = userEmail ? isPublicDomainEmail(userEmail) : false;
  const emailDomain = userEmail ? extractDomain(userEmail) : null;

  useEffect(() => {
    if (!user) return;
    if (showWelcome) return;

    // Single membership → activate and enter app
    if (memberships.length === 1 && setActive) {
      const onlyOrg = memberships[0];
      setActive({ organization: onlyOrg.organization.id })
        .then(() => window.location.assign('/dashboard'))
        .catch(() => setStep(isPublicDomain ? 'error' : 'choose'));
      return;
    }

    // Multiple memberships → let the user pick (don't auto-pick first)
    if (memberships.length > 1) {
      setStep('choose');
      return;
    }

    // No memberships yet — restore waiting lobby if a request is pending
    if (!isPublicDomain && step !== 'waiting' && !waiting) {
      void (async () => {
        try {
          const res = await fetch('/api/organizations/join', { credentials: 'include' });
          const data = await res.json();
          if (data.pending && data.orgId) {
            setWaiting({ orgId: data.orgId, orgName: data.orgName ?? null });
            setStep('waiting');
          }
        } catch {
          // ignore
        }
      })();
    }

    // No memberships yet
    if (isPublicDomain) {
      let cancelled = false;
      const startedAt = Date.now();
      const pollMs = 2000;
      const maxWaitMs = 15000;

      const tick = async () => {
        if (cancelled) return;
        try {
          await userMemberships.revalidate?.();
        } catch {
          // ignore
        }
        if (cancelled) return;
        if (Date.now() - startedAt >= maxWaitMs) {
          setStep('error');
        }
      };

      const interval = setInterval(() => {
        void tick();
      }, pollMs);
      const initial = setTimeout(() => {
        void tick();
      }, 1500);

      return () => {
        cancelled = true;
        clearInterval(interval);
        clearTimeout(initial);
      };
    }

    // B2B: domain check effect handles the step; fallback to choose
    if (!isPublicDomain && domainCheck === null && step !== 'waiting') {
      const timeout = setTimeout(() => {
        setStep((prev) => (prev === 'loading' ? 'choose' : prev));
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [
    user,
    memberships,
    isPublicDomain,
    setActive,
    domainCheck,
    showWelcome,
    userMemberships,
    step,
    waiting,
  ]);

  // Domain check
  useEffect(() => {
    if (!user || !userEmail || isPublicDomain || !emailDomain) return;
    if (memberships.length > 0) return;
    if (step === 'waiting') return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/organizations');
        const data = await res.json();
        if (!cancelled) {
          setDomainCheck(data);
          if (data.exists) {
            setStep((prev) => (prev === 'waiting' ? prev : 'join-existing'));
          } else {
            const suggestedName = generateOrgNameFromDomain(emailDomain);
            setOrgName(suggestedName);
            setStep((prev) => (prev === 'waiting' ? prev : 'create'));
          }
        }
      } catch {
        if (!cancelled) {
          setStep((prev) => (prev === 'waiting' ? prev : 'choose'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, userEmail, isPublicDomain, emailDomain, memberships.length, step]);

  // Poll waiting lobby for approval
  useEffect(() => {
    if (step !== 'waiting' || !waiting?.orgId) return;

    let cancelled = false;
    const tick = async () => {
      try {
        await userMemberships.revalidate?.();
        const joined = (userMemberships.data ?? []).find(
          (m) => m.organization.id === waiting.orgId
        );
        if (joined && setActive) {
          await setActive({ organization: waiting.orgId });
          window.location.assign('/dashboard');
          return;
        }

        const statusRes = await fetch('/api/organizations/join', { credentials: 'include' });
        const status = await statusRes.json();
        if (cancelled) return;
        if (status.status === 'rejected' && status.orgId === waiting.orgId) {
          setError('Your join request was declined by an admin.');
          setWaiting(null);
          setStep(domainCheck?.exists ? 'join-existing' : 'choose');
        }
      } catch {
        // keep waiting
      }
    };

    const interval = setInterval(() => {
      void tick();
    }, 3000);
    void tick();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [step, waiting, setActive, userMemberships, domainCheck]);

  const handleSelectOrg = useCallback(
    (orgId: string) => {
      if (!setActive) return;
      setLoading(true);
      setError('');
      setActive({ organization: orgId })
        .then(() => window.location.assign('/dashboard'))
        .catch((err: any) => {
          setError(err?.errors?.[0]?.message || 'Failed to switch organization');
          setLoading(false);
        });
    },
    [setActive]
  );

  const handleRetry = useCallback(() => {
    setError('');
    setLoading(true);
    setStep('loading');
    window.location.reload();
  }, []);

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim() || !createOrganization) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: orgName.trim(),
          domain: emailDomain,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create organization');
      await setActive({ organization: data.id });
      setShowWelcome(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  }

  async function submitJoinRequest(body: { token?: string; orgId?: string }) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to request access');

      if (data.alreadyMember && data.orgId && setActive) {
        await setActive({ organization: data.orgId });
        window.location.assign('/dashboard');
        return;
      }

      setWaiting({ orgId: data.orgId, orgName: data.orgName ?? null });
      setStep('waiting');
    } catch (err: any) {
      setError(err?.message || 'Failed to request access');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinWithLink(e: React.FormEvent) {
    e.preventDefault();
    if (!joinLinkInput.trim()) return;
    await submitJoinRequest({ token: joinLinkInput.trim() });
  }

  async function handleRequestDomainJoin() {
    if (!domainCheck?.orgId) return;
    await submitJoinRequest({ orgId: domainCheck.orgId });
  }

  if (step === 'loading' && !isPublicDomain && domainCheck === null && !waiting) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 mb-12"
        >
          <BrandLogo size={32} />
          <span className="font-playfair text-xl font-bold text-foreground">Syntheon Hub</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <LoadingMessage />
        </motion.div>
      </div>
    );
  }

  if (step === 'loading' && isPublicDomain) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 mb-12"
        >
          <BrandLogo size={32} />
          <span className="font-playfair text-xl font-bold text-foreground">Syntheon Hub</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <LoadingMessage />
        </motion.div>
      </div>
    );
  }

  if (step === 'error' && isPublicDomain) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 mb-12"
        >
          <BrandLogo size={32} />
          <span className="font-playfair text-xl font-bold text-foreground">Syntheon Hub</span>
        </motion.div>
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="font-playfair text-3xl font-bold text-foreground">Workspace not ready</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t finish setting up your personal workspace. You can retry or create one
            manually.
          </p>
          <div className="flex flex-col gap-2">
            <Button className="rounded-full" onClick={handleRetry}>
              Retry
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setOrgName(user?.firstName ? `${user.firstName}'s Workspace` : 'My Workspace');
                setStep('create');
              }}
            >
              Create workspace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2.5 mb-10"
      >
        <BrandLogo size={32} />
        <span className="font-playfair text-xl font-bold text-foreground">Syntheon Hub</span>
      </motion.div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="font-playfair text-3xl font-bold text-foreground">
                  Welcome{user?.firstName ? `, ${user.firstName}` : ''}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Get started by setting up your organization workspace.
                </p>
              </div>

              {memberships.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Continue with an existing organization
                  </p>
                  <div className="space-y-2">
                    {memberships.map((membership) => (
                      <button
                        key={membership.id}
                        type="button"
                        disabled={loading}
                        onClick={() => handleSelectOrg(membership.organization.id)}
                        className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-left transition-all hover:border-primary/30 hover:shadow-sm disabled:opacity-60"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {membership.organization.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {membership.role === 'org:admin' ? 'Admin' : 'Member'}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep('create')}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-muted/40 p-5 text-left transition-all hover:border-primary/30 hover:shadow-md disabled:opacity-60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Create an organization</p>
                    <p className="text-sm text-muted-foreground">
                      Set up a new workspace for your team. You&apos;ll be the admin.
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep('join')}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-muted/40 p-5 text-left transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Join with a link</p>
                    <p className="text-sm text-muted-foreground">
                      Paste the join link from your admin. You&apos;ll wait for approval.
                    </p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setStep(domainCheck?.exists ? 'join-existing' : 'choose')}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <h1 className="font-playfair text-3xl font-bold text-foreground">
                  Create your organization
                </h1>
                <p className="text-sm text-muted-foreground">
                  This will be your team&apos;s shared workspace in Syntheon Hub.
                </p>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Organization name
                    </label>
                    <Input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. ChannelWorks, SyntheonHQ..."
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-full gap-2"
                  disabled={loading || !orgName.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  {loading ? 'Creating...' : 'Create organization'}
                </Button>
              </form>
            </motion.div>
          )}

          {step === 'join-existing' && domainCheck?.exists && (
            <motion.div
              key="join-existing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h1 className="font-playfair text-3xl font-bold text-foreground">Join your team</h1>
                <p className="text-sm text-muted-foreground">
                  An organization for{' '}
                  <span className="font-medium text-foreground">{emailDomain}</span> already exists.
                  Request access and wait for an admin to approve you.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{domainCheck.orgName}</p>
                    <p className="text-xs text-muted-foreground">{emailDomain}</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button
                type="button"
                className="w-full rounded-full gap-2"
                disabled={loading}
                onClick={() => void handleRequestDomainJoin()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {loading ? 'Requesting...' : 'Request to join'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('join')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Have a join link instead?
              </button>
            </motion.div>
          )}

          {step === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setStep(domainCheck?.exists ? 'join-existing' : 'choose')}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <h1 className="font-playfair text-3xl font-bold text-foreground">
                  Join with a link
                </h1>
                <p className="text-sm text-muted-foreground">
                  Paste the join link your admin shared. You&apos;ll enter a waiting room until they
                  approve you.
                </p>
              </div>

              <form onSubmit={handleJoinWithLink} className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Join link
                  </label>
                  <Input
                    value={joinLinkInput}
                    onChange={(e) => setJoinLinkInput(e.target.value)}
                    placeholder="https://app.syntheonhub.com/join?token=..."
                    autoFocus
                    disabled={loading}
                  />
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-full gap-2"
                  disabled={loading || !joinLinkInput.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  {loading ? 'Requesting...' : 'Request to join'}
                </Button>
              </form>
            </motion.div>
          )}

          {step === 'waiting' && waiting && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h1 className="font-playfair text-3xl font-bold text-foreground">Waiting room</h1>
                <p className="text-sm text-muted-foreground">
                  Your request to join{' '}
                  <span className="font-medium text-foreground">
                    {waiting.orgName || 'the organization'}
                  </span>{' '}
                  is pending admin approval.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-5 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {waiting.orgName || 'Organization'}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Waiting for an admin to approve
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This page updates automatically when you&apos;re approved.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WelcomeDialog
        open={showWelcome}
        onClose={() => {
          setShowWelcome(false);
          window.location.assign('/dashboard');
        }}
      />
    </div>
  );
}
