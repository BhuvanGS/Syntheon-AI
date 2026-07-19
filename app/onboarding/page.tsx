'use client';

import { BrandLogo } from '@/components/brand-logo';

import { useState, useEffect, useCallback } from 'react';
import { useOrganizationList, useUser } from '@clerk/nextjs';
import {
  Building2,
  Users,
  ArrowRight,
  Loader2,
  Sparkles,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import {
  isPublicDomainEmail,
  generateOrgNameFromDomain,
  generatePersonalOrgName,
} from '@/lib/org-utils';
import { extractDomain } from '@/lib/public-domains';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';
import { LoadingMessage } from '@/components/loading-message';
import { motion, AnimatePresence } from 'motion/react';
import { WelcomeDialog } from '@/components/welcome-dialog';

type Step = 'loading' | 'choose' | 'create' | 'join' | 'join-existing' | 'error';

type DomainCheckResult = {
  exists: boolean;
  orgId?: string;
  orgName?: string;
} | null;

export default function OnboardingPage() {
  const { user } = useUser();
  const { createOrganization, setActive, userMemberships } = useOrganizationList({
    userMemberships: true,
  });

  const [step, setStep] = useState<Step>('loading');
  const [orgName, setOrgName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const rawJoinCode = joinCode.replace(/\D/g, '');
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
      // First check after a short delay for webhook
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
    if (!isPublicDomain && domainCheck === null) {
      const timeout = setTimeout(() => {
        setStep((prev) => (prev === 'loading' ? 'choose' : prev));
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [user, memberships, isPublicDomain, setActive, domainCheck, showWelcome, userMemberships]);

  // Domain check no longer passes email — server uses session email
  useEffect(() => {
    if (!user || !userEmail || isPublicDomain || !emailDomain) return;
    if (memberships.length > 0) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/organizations');
        const data = await res.json();
        if (!cancelled) {
          setDomainCheck(data);
          if (data.exists) {
            setStep('join-existing');
          } else {
            const suggestedName = generateOrgNameFromDomain(emailDomain);
            setOrgName(suggestedName);
            setStep('create');
          }
        }
      } catch {
        if (!cancelled) {
          setStep('choose');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, userEmail, isPublicDomain, emailDomain, memberships.length]);

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

  async function handleJoinWithCode(e: React.FormEvent) {
    e.preventDefault();
    if (rawJoinCode.length !== 8) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/organizations/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join');

      if (data.success || data.alreadyMember || data.joined) {
        if (data.orgId && setActive) {
          await setActive({ organization: data.orgId });
        }
        window.location.assign('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to join organization');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'loading' && !isPublicDomain && domainCheck === null) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: '#0a0a0a',
        }}
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
        style={{
          backgroundColor: '#0a0a0a',
        }}
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
        style={{
          backgroundColor: '#0a0a0a',
        }}
      >
        <div className="flex items-center gap-2.5 mb-12">
          <BrandLogo size={32} />
          <span className="font-playfair text-xl font-bold text-foreground">Syntheon Hub</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6 text-center"
        >
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
              <Building2 className="h-7 w-7" />
            </div>
          </div>
          <h1 className="font-playfair text-2xl font-bold text-foreground">
            Set up your workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Let&apos;s create your personal workspace to get started.
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button
            onClick={async () => {
              setLoading(true);
              setError('');
              try {
                const res = await fetch('/api/organizations', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    name: generatePersonalOrgName(
                      userEmail,
                      user?.fullName || user?.firstName || undefined
                    ),
                    domain: null,
                  }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to create workspace');
                if (data.id && setActive) {
                  await setActive({ organization: data.id });
                }
                window.location.assign('/dashboard');
              } catch (err: any) {
                setError(err?.message || 'Failed to create workspace');
                setLoading(false);
              }
            }}
            className="w-full rounded-full gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            {loading ? 'Creating...' : 'Create Workspace'}
          </Button>
          {error && (
            <Button
              onClick={handleRetry}
              variant="ghost"
              className="w-full rounded-full gap-2"
              disabled={loading}
            >
              <Sparkles className="h-4 w-4" />
              Retry
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{
        backgroundColor: '#0a0a0a',
      }}
    >
      <div className="flex items-center gap-2.5 mb-12">
        <BrandLogo size={32} />
        <span className="font-playfair text-xl font-bold text-foreground">Syntheon Hub</span>
      </div>

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
                      Set up a new workspace for your team. You'll be the admin.
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
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Join with a code</p>
                    <p className="text-sm text-muted-foreground">
                      Have an 8-digit join code? Enter it to join your team.
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
                  This will be your team's shared workspace in Syntheon Hub.
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

              <form onSubmit={handleJoinWithCode} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Enter join code
                  </label>
                  <div className="flex justify-center pt-1">
                    <InputOTP
                      maxLength={8}
                      value={joinCode}
                      onChange={(val) => setJoinCode(val)}
                      disabled={loading}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={1} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={2} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={3} className="h-12 w-10 text-lg font-bold" />
                      </InputOTPGroup>
                      <InputOTPSeparator className="mx-1" />
                      <InputOTPGroup>
                        <InputOTPSlot index={4} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={5} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={6} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={7} className="h-12 w-10 text-lg font-bold" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Ask your admin for the 8-digit join code.
                  </p>
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-full gap-2"
                  disabled={loading || rawJoinCode.length !== 8}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  {loading ? 'Joining...' : 'Join organization'}
                </Button>
              </form>
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
                <h1 className="font-playfair text-3xl font-bold text-foreground">Join your team</h1>
                <p className="text-sm text-muted-foreground">
                  Enter the 8-digit join code your admin shared with you.
                </p>
              </div>

              <form onSubmit={handleJoinWithCode} className="space-y-4">
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Join code
                  </label>
                  <div className="flex justify-center pt-1">
                    <InputOTP
                      maxLength={8}
                      value={joinCode}
                      onChange={(val) => setJoinCode(val)}
                      disabled={loading}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={1} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={2} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={3} className="h-12 w-10 text-lg font-bold" />
                      </InputOTPGroup>
                      <InputOTPSeparator className="mx-1" />
                      <InputOTPGroup>
                        <InputOTPSlot index={4} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={5} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={6} className="h-12 w-10 text-lg font-bold" />
                        <InputOTPSlot index={7} className="h-12 w-10 text-lg font-bold" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-full gap-2"
                  disabled={loading || rawJoinCode.length !== 8}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  {loading ? 'Joining...' : 'Join organization'}
                </Button>
              </form>
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
