'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

type WaitlistStatus = 'pending' | 'approved' | 'rejected';

type WaitlistEntry = {
  id: string;
  status: WaitlistStatus;
  requestedAt: string;
  decisionReason?: string;
};

export function WaitlistClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [entry, setEntry] = useState<WaitlistEntry | null>(null);
  const [betaActive, setBetaActive] = useState(true);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  async function loadStatus() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load waitlist status');
      setEntry(data.entry ?? null);
      setBetaActive(Boolean(data.betaActive));
    } catch (err: any) {
      setError(err?.message || 'Failed to load waitlist status');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function submitRequest() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      setEntry(data.entry ?? null);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-sans text-sm">Loading waitlist status...</span>
        </div>
      </div>
    );
  }

  if (!betaActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-border bg-card/60 p-8 text-center">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-foreground">
            Beta is not active
          </h1>
          <p className="mt-3 text-muted-foreground font-sans">
            The beta waitlist is currently closed.
          </p>
          <Button className="mt-6" onClick={() => router.push('/sign-in')}>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  if (entry?.status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-xl rounded-2xl border border-border bg-card/60 p-8 text-center">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-foreground">
            You are approved
          </h1>
          <p className="mt-3 text-muted-foreground font-sans">
            Your beta access is active. You can continue to your dashboard.
          </p>
          <Button className="mt-6" onClick={() => router.push('/dashboard')}>
            Continue to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card/60 p-8">
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-foreground">
          Beta waitlist
        </h1>
        <p className="mt-3 text-muted-foreground font-sans leading-relaxed">
          Access is currently approval-based. Submit your request and we’ll review it from the admin
          portal.
        </p>

        {entry?.status === 'pending' ? (
          <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm font-sans text-amber-100">
              Your request is pending admin approval.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <label className="text-sm font-sans text-muted-foreground">
              Optional note for the admin
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tell us your use case / testing goals"
              className="min-h-28"
            />
            <Button onClick={submitRequest} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Join beta waitlist'}
            </Button>
          </div>
        )}

        {entry?.status === 'rejected' && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-sans text-red-100">
              Your previous request was rejected.
              {entry.decisionReason ? ` Reason: ${entry.decisionReason}` : ''}
            </p>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400 font-sans">{error}</p>}
      </div>
    </div>
  );
}
