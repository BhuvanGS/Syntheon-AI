'use client';

import { BrandLogo } from '@/components/brand-logo';
import { useEffect, useMemo, useState } from 'react';
import { useOrganizationList, useUser } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, Clock, Loader2, Link2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingMessage } from '@/components/loading-message';
import { motion } from 'motion/react';
import { Suspense } from 'react';

type LobbyState =
  | { kind: 'loading' }
  | { kind: 'requesting' }
  | { kind: 'waiting'; orgId: string; orgName: string | null }
  | { kind: 'approved'; orgId: string; orgName: string | null }
  | { kind: 'rejected'; orgName: string | null }
  | { kind: 'error'; message: string }
  | { kind: 'missing_token' };

function JoinPageInner() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setActive, userMemberships } = useOrganizationList({ userMemberships: true });
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);

  const [state, setState] = useState<LobbyState>({ kind: 'loading' });

  useEffect(() => {
    if (!user) return;
    if (!token) {
      setState({ kind: 'missing_token' });
      return;
    }

    let cancelled = false;

    (async () => {
      setState({ kind: 'requesting' });
      try {
        const res = await fetch('/api/organizations/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setState({ kind: 'error', message: data.error || data.message || 'Failed to join' });
          return;
        }

        if (data.alreadyMember && data.orgId && setActive) {
          await setActive({ organization: data.orgId });
          window.location.assign('/dashboard');
          return;
        }

        setState({
          kind: 'waiting',
          orgId: data.orgId,
          orgName: data.orgName ?? null,
        });
      } catch {
        if (!cancelled) setState({ kind: 'error', message: 'Failed to submit join request' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, token, setActive]);

  // Poll until membership appears or request is rejected
  useEffect(() => {
    if (state.kind !== 'waiting') return;

    let cancelled = false;
    const orgId = state.orgId;

    const tick = async () => {
      try {
        await userMemberships.revalidate?.();
        const memberships = userMemberships.data ?? [];
        const joined = memberships.find((m) => m.organization.id === orgId);
        if (joined && setActive) {
          setState({ kind: 'approved', orgId, orgName: state.orgName });
          await setActive({ organization: orgId });
          window.location.assign('/dashboard');
          return;
        }

        const statusRes = await fetch('/api/organizations/join', { credentials: 'include' });
        const status = await statusRes.json();
        if (cancelled) return;

        if (status.status === 'rejected' && status.orgId === orgId) {
          setState({ kind: 'rejected', orgName: state.orgName });
          return;
        }

        if (status.status === 'approved' && status.orgId === orgId) {
          // Membership may lag slightly — revalidate will catch it next tick
          await userMemberships.revalidate?.();
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
  }, [state, setActive, userMemberships]);

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

      <div className="w-full max-w-md">
        {(state.kind === 'loading' || state.kind === 'requesting') && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <LoadingMessage />
            <p className="text-sm text-muted-foreground">Submitting your join request…</p>
          </div>
        )}

        {state.kind === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
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
                  {state.orgName || 'the organization'}
                </span>{' '}
                is pending admin approval.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-5 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{state.orgName || 'Organization'}</p>
                  <p className="text-xs text-muted-foreground">Waiting for an admin to approve</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This page updates automatically. You can close it and come back later.
            </p>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => router.push('/onboarding')}
            >
              Back to onboarding
            </Button>
          </motion.div>
        )}

        {state.kind === 'approved' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="text-sm text-muted-foreground">Approved — taking you to the dashboard…</p>
          </div>
        )}

        {state.kind === 'rejected' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <XCircle className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h1 className="font-playfair text-3xl font-bold text-foreground">Request declined</h1>
              <p className="text-sm text-muted-foreground">
                An admin declined your request to join{' '}
                <span className="font-medium text-foreground">
                  {state.orgName || 'the organization'}
                </span>
                .
              </p>
            </div>
            <Button className="rounded-full" onClick={() => router.push('/onboarding')}>
              Back to onboarding
            </Button>
          </div>
        )}

        {state.kind === 'missing_token' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Link2 className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h1 className="font-playfair text-3xl font-bold text-foreground">
                Join link required
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask your admin for a join link, or request access from onboarding if your company
                domain already has a workspace.
              </p>
            </div>
            <Button className="rounded-full" onClick={() => router.push('/onboarding')}>
              Go to onboarding
            </Button>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <XCircle className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h1 className="font-playfair text-3xl font-bold text-foreground">
                Couldn&apos;t join
              </h1>
              <p className="text-sm text-muted-foreground">{state.message}</p>
            </div>
            <Button className="rounded-full" onClick={() => router.push('/onboarding')}>
              Back to onboarding
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6"
          style={{ backgroundColor: '#0a0a0a' }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <JoinPageInner />
    </Suspense>
  );
}
