'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type WaitlistStatus = 'pending' | 'approved' | 'rejected';

type WaitlistEntry = {
  id: string;
  name?: string;
  email: string;
  note?: string;
  status: WaitlistStatus;
  requestedAt: string;
  reviewedAt?: string;
};

export function AdminWaitlistPanel() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decisionReasonById, setDecisionReasonById] = useState<Record<string, string>>({});

  async function loadEntries() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/waitlist?status=pending', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load waitlist');
      setEntries(data.entries ?? []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEntries();
  }, []);

  async function review(id: string, status: 'approved' | 'rejected') {
    setError('');
    try {
      const res = await fetch(`/api/admin/waitlist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, decisionReason: decisionReasonById[id] ?? '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update waitlist entry');
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Failed to update waitlist entry');
    }
  }

  const pendingCount = useMemo(
    () => entries.filter((entry) => entry.status === 'pending').length,
    [entries]
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-foreground">
            Admin Portal — Beta Waitlist
          </h1>
          <p className="mt-2 text-muted-foreground font-sans">
            Pending approvals: <span className="text-foreground font-medium">{pendingCount}</span>
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-muted-foreground">
            Loading waitlist...
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-muted-foreground">
            No pending waitlist requests.
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-border bg-card/60 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-foreground font-medium">{entry.name || 'Unknown user'}</p>
                    <p className="text-sm text-muted-foreground font-sans">{entry.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested: {new Date(entry.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => review(entry.id, 'approved')}>Approve</Button>
                    <Button variant="destructive" onClick={() => review(entry.id, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {entry.note ? (
                    <p className="text-sm text-foreground/90 font-sans">Note: {entry.note}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground font-sans">No note provided.</p>
                  )}
                  <Input
                    placeholder="Optional decision reason"
                    value={decisionReasonById[entry.id] ?? ''}
                    onChange={(e) =>
                      setDecisionReasonById((prev) => ({ ...prev, [entry.id]: e.target.value }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-400 font-sans">{error}</p>}
      </div>
    </div>
  );
}
