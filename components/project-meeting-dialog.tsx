'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Video,
  Sparkles,
  Link2,
  CalendarDays,
  AlertCircle,
  Settings,
  Lock,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Mode = 'paste' | 'create';

interface ProjectMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreated?: () => void | Promise<void>;
}

export function ProjectMeetingDialog({
  open,
  onOpenChange,
  projectId,
  onCreated,
}: ProjectMeetingDialogProps) {
  const [mode, setMode] = useState<Mode>('create');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [checkingGoogle, setCheckingGoogle] = useState(false);
  const [createdMeetUrl, setCreatedMeetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    setMeetingUrl('');
    setMeetingTitle('');
    setStartTime('');
    setSubmitting(false);
    setHasJoined(false);
    setCreatedMeetUrl(null);
    setError(null);
    setLimitReached(null);

    // Default start time to now + 5 minutes
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    setStartTime(now.toISOString().slice(0, 16));

    // Check Google connection status
    setCheckingGoogle(true);
    fetch('/api/integrations/status')
      .then((r) => r.json().catch(() => ({})))
      .then((data) => setGoogleConnected(Boolean(data.googleConnected)))
      .finally(() => setCheckingGoogle(false));
  }, [open]);

  async function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingUrl.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/bot/continue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingUrl: meetingUrl.trim(), projectId }),
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        setLimitReached({ used: data.used ?? 0, limit: data.limit ?? 2 });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create meeting');
      }

      await onCreated?.();
      setHasJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start meeting');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateGoogleMeet(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingTitle.trim() || !startTime) return;

    setSubmitting(true);
    setError(null);
    try {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default

      const res = await fetch('/api/meetings/create-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meetingTitle.trim(),
          description: `Meeting for project ${projectId}`,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          projectId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create Google Meet');
      }

      setCreatedMeetUrl(data.meetUrl);

      // Open Meet in new tab
      window.open(data.meetUrl, '_blank');

      // Also trigger bot to join
      try {
        const botRes = await fetch('/api/bot/continue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingUrl: data.meetUrl, projectId }),
        });
        if (botRes.status === 403) {
          const botData = await botRes.json().catch(() => ({}));
          setLimitReached({ used: botData.used ?? 0, limit: botData.limit ?? 2 });
          return;
        }
      } catch {
        // Bot join failure is non-fatal — user still has the meeting link
      }

      await onCreated?.();
      setHasJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl border-border bg-background shadow-2xl">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary w-fit mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Project meetings
          </div>
          <DialogTitle className="font-playfair text-2xl text-foreground">
            Start a meeting under this project
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create'
              ? 'Create a Google Meet instantly and Syntheon Hub will join automatically.'
              : 'Paste an existing meeting URL and Syntheon Hub will attach the recorded session.'}
          </DialogDescription>
        </DialogHeader>

        {/* Limit reached */}
        {limitReached ? (
          <div className="space-y-4 rounded-2xl border border-primary/10 bg-primary/5 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <p className="font-playfair text-2xl text-foreground">
                You've hit the free plan limit
              </p>
              <p className="text-sm text-muted-foreground">
                You've used all {limitReached.limit} meetings this month on the Free plan. Upgrade
                to Pro for unlimited meetings, dependencies, and API access.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Link href="/pricing">
                <Button className="rounded-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  Upgrade to Pro
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                Maybe later
              </Button>
            </div>
          </div>
        ) : !hasJoined ? (
          <div className="flex items-center rounded-full border border-border bg-card p-0.5 w-fit">
            <button
              onClick={() => {
                setMode('create');
                setError(null);
              }}
              className={cn(
                'h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors',
                mode === 'create'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Create Meet
            </button>
            <button
              onClick={() => {
                setMode('paste');
                setError(null);
              }}
              className={cn(
                'h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors',
                mode === 'paste'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Link2 className="h-3.5 w-3.5" />
              Paste URL
            </button>
          </div>
        ) : null}

        {!limitReached && !hasJoined ? (
          mode === 'paste' ? (
            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Meeting URL</label>
                <Input
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="bg-white"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !meetingUrl.trim()}
                  className="rounded-full gap-2"
                >
                  <Video className="h-4 w-4" />
                  {submitting ? 'Starting...' : 'Start meeting'}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleCreateGoogleMeet} className="space-y-4">
              {!googleConnected && !checkingGoogle ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <CalendarDays className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground">Google Calendar not connected</p>
                  <p className="text-sm text-muted-foreground">
                    Connect Google Calendar in Settings to create Meet links directly from Syntheon
                    Hub.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (window.location.href = '/settings?tab=connections')}
                    className="rounded-full gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Open Settings
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Meeting title</label>
                    <Input
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      placeholder="Sprint planning - June 25"
                      className="bg-white"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Start time</label>
                    <Input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  {createdMeetUrl && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Video className="h-4 w-4" />
                        <span className="font-medium">Google Meet created!</span>
                      </div>
                      <p className="text-xs text-green-700 truncate">{createdMeetUrl}</p>
                    </div>
                  )}
                </>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !meetingTitle.trim() || !startTime || !googleConnected}
                  className="rounded-full gap-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  {submitting ? 'Creating...' : 'Create & open Google Meet'}
                </Button>
              </DialogFooter>
            </form>
          )
        ) : (
          <div className="space-y-4 rounded-2xl border border-primary/10 bg-primary/5 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <p className="font-playfair text-2xl text-foreground">
                Syntheon - AI will shortly join the meeting
              </p>
              <p className="text-sm text-muted-foreground">
                You can close this popup now or wait for the meeting to connect.
              </p>
              {createdMeetUrl && (
                <p className="text-xs text-primary font-medium truncate max-w-md mx-auto">
                  {createdMeetUrl}
                </p>
              )}
            </div>
            <DialogFooter className="pt-2 justify-center">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full gap-2"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
