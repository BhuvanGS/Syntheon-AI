'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  Monitor,
  Moon,
  Sun,
  Download,
  Trash2,
  UserX,
  FileText,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  SettingsBody,
  SettingsHeader,
  SettingsPanel,
  SettingsPanelHead,
  SettingsSectionLabel,
} from '@/components/settings/settings-chrome';

type DeletionRequest = {
  id: string;
  scope: 'user';
  status: string;
  requestedAt: string;
  warningDueAt: string;
  scheduledFor: string;
  warningSentAt?: string | null;
  processedAt?: string | null;
};

function formatScheduleDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function PreferencesTab() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [exportLoading, setExportLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deletionReason, setDeletionReason] = useState('');

  const activeDeletionRequests = deletionRequests.filter(
    (r) => r.scope === 'user' && (r.status === 'pending' || r.status === 'warning_sent')
  );

  const loadDeletionRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/privacy/deletion');
      if (!res.ok) return;
      const data = await res.json();
      const requests = Array.isArray(data?.requests) ? data.requests : [];
      setDeletionRequests(requests.filter((r: DeletionRequest) => r.scope === 'user'));
    } catch {
      // Non-blocking; banner simply won't show until next successful fetch
    }
  }, []);

  useEffect(() => {
    void loadDeletionRequests();
  }, [loadDeletionRequests]);

  async function handleExport() {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const res = await fetch('/api/privacy/export', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast({
          title: 'Export failed',
          description: data?.error || 'Could not export your data.',
          variant: 'destructive',
        });
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/i);
      const filename =
        match?.[1] || `syntheon-data-export-${new Date().toISOString().slice(0, 10)}.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export ready',
        description: 'Your personal data download has started.',
      });
    } catch {
      toast({
        title: 'Export failed',
        description: 'Could not export your data.',
        variant: 'destructive',
      });
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteMedia() {
    if (mediaLoading) return;
    setMediaLoading(true);
    try {
      const res = await fetch('/api/privacy/delete-media', { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast({
          title: 'Media deletion failed',
          description: data?.error || 'Could not delete meeting media.',
          variant: 'destructive',
        });
        return;
      }

      const cleared = typeof data?.clearedMeetings === 'number' ? data.clearedMeetings : 0;
      toast({
        title: 'Media deleted',
        description:
          cleared === 0
            ? 'No meeting transcripts or media files needed clearing.'
            : `Cleared transcripts and media from ${cleared} meeting${cleared === 1 ? '' : 's'}.`,
      });
      setMediaDialogOpen(false);
    } catch {
      toast({
        title: 'Media deletion failed',
        description: 'Could not delete meeting media.',
        variant: 'destructive',
      });
    } finally {
      setMediaLoading(false);
    }
  }

  function openDeletionDialog() {
    if (deletionLoading) return;
    setConfirmText('');
    setDeletionReason('');
    setDeletionDialogOpen(true);
  }

  async function submitDeletion() {
    if (deletionLoading) return;
    if (confirmText !== 'DELETE') {
      toast({
        title: 'Confirmation required',
        description: 'Type DELETE exactly to continue.',
        variant: 'destructive',
      });
      return;
    }

    setDeletionLoading(true);
    try {
      const res = await fetch('/api/privacy/deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: 'user',
          confirmText,
          reason: deletionReason.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 409) {
        toast({
          title: 'Request already pending',
          description: data?.error || 'An active account deletion request already exists.',
          variant: 'destructive',
        });
        await loadDeletionRequests();
        return;
      }

      if (!res.ok) {
        toast({
          title: 'Deletion request failed',
          description: data?.error || 'Failed to submit deletion request.',
          variant: 'destructive',
        });
        return;
      }

      const scheduledFor = data?.request?.scheduledFor
        ? formatScheduleDate(data.request.scheduledFor)
        : null;

      toast({
        title: 'Account deletion scheduled',
        description: scheduledFor
          ? `${data?.message || 'Request submitted.'} Scheduled for ${scheduledFor}.`
          : data?.message || 'Deletion request submitted successfully.',
      });

      setDeletionDialogOpen(false);
      setConfirmText('');
      setDeletionReason('');
      await loadDeletionRequests();
    } catch {
      toast({
        title: 'Deletion request failed',
        description: 'Failed to submit deletion request.',
        variant: 'destructive',
      });
    } finally {
      setDeletionLoading(false);
    }
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Bright canvas' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Near-black precision' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Match device' },
  ];

  return (
    <SettingsBody>
      <SettingsHeader
        title="Preferences"
        description="Appearance and data controls for your account."
      />

      <div className="space-y-3">
        <SettingsSectionLabel>Appearance</SettingsSectionLabel>
        <SettingsPanel>
          <SettingsPanelHead title="Theme" hint="Choose how Syntheon Hub looks on this device." />
          <RadioGroup value={theme} onValueChange={setTheme}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {themes.map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.value;
                return (
                  <label
                    key={t.value}
                    htmlFor={t.value}
                    className={cn(
                      'flex cursor-pointer flex-col items-start gap-3 rounded-xl border px-4 py-4 text-left transition-colors duration-150',
                      isSelected
                        ? 'border-white/20 bg-white/[0.06]'
                        : 'border-border bg-transparent hover:bg-white/[0.03]'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        isSelected ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">{t.label}</span>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{t.description}</p>
                    </div>
                    <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                  </label>
                );
              })}
            </div>
          </RadioGroup>
        </SettingsPanel>
      </div>

      <div className="space-y-3">
        <SettingsSectionLabel>Data & privacy</SettingsSectionLabel>
        <SettingsPanel padded={false}>
          <div className="app-panel-pad pb-2">
            <SettingsPanelHead
              title="Your data rights"
              hint="Export a copy of your data or review policies."
            />
          </div>
          <div className="divide-y divide-border border-t border-border">
            <DataAction
              icon={Download}
              title="Request a copy of your data"
              description="Download a personal data copy (account, transcripts, tickets, and consent records) immediately."
              action={exportLoading ? 'Exporting…' : 'Export'}
              onClick={() => void handleExport()}
              disabled={exportLoading}
            />
            <DataAction
              icon={FileText}
              title="Terms & legal"
              description="Open Terms of Service, Privacy Policy, and related notices in Settings."
              action="Open"
              onClick={() => router.push('/settings?tab=legal')}
            />
          </div>
        </SettingsPanel>
      </div>

      <div className="space-y-3">
        <SettingsSectionLabel>Danger zone</SettingsSectionLabel>

        {activeDeletionRequests.length > 0 && (
          <div
            role="status"
            className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-medium text-foreground">Deletion request pending</p>
              {activeDeletionRequests.map((req) => (
                <p key={req.id} className="text-[13px] leading-relaxed text-muted-foreground">
                  Account erasure is scheduled for{' '}
                  <span className="text-foreground">{formatScheduleDate(req.scheduledFor)}</span>
                  {req.status === 'warning_sent'
                    ? '. Final warning has been sent (48 hours before deletion).'
                    : '. Final warning is sent 48 hours before deletion.'}
                </p>
              ))}
            </div>
          </div>
        )}

        <SettingsPanel padded={false} className="border-red-500/25">
          <div className="app-panel-pad pb-2">
            <SettingsPanelHead
              title="Irreversible actions"
              hint="These permanently remove data or schedule account erasure."
            />
          </div>
          <div className="divide-y divide-border border-t border-red-500/15">
            <DataAction
              icon={Trash2}
              title="Delete meeting transcripts and audio"
              description="Transcripts deleted immediately. Audio is already purged after transcription."
              action={mediaLoading ? 'Deleting…' : 'Delete media'}
              onClick={() => setMediaDialogOpen(true)}
              disabled={mediaLoading || deletionLoading}
              tone="danger"
            />
            <DataAction
              icon={UserX}
              title="Delete your account"
              description="Account erasure runs after a 30-day grace period. Final warning 48 hours before deletion."
              action={deletionLoading ? 'Submitting…' : 'Delete account'}
              onClick={openDeletionDialog}
              disabled={deletionLoading || mediaLoading}
              tone="danger"
            />
          </div>
        </SettingsPanel>
      </div>

      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="border-red-500/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete meeting media?</DialogTitle>
            <DialogDescription>
              This clears transcripts and media file references from meetings you own. Tickets and
              your account are not deleted. Audio is already purged after transcription.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMediaDialogOpen(false)}
              disabled={mediaLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDeleteMedia()}
              disabled={mediaLoading}
            >
              {mediaLoading ? 'Deleting…' : 'Delete media'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletionDialogOpen}
        onOpenChange={(open) => {
          if (!open && !deletionLoading) {
            setDeletionDialogOpen(false);
            setConfirmText('');
            setDeletionReason('');
          }
        }}
      >
        <DialogContent className="border-red-500/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This schedules permanent deletion of your account and associated data after a 30-day
              grace period. A final warning is sent 48 hours before deletion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="deletion-confirm">Type DELETE to confirm</Label>
              <Input
                id="deletion-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                disabled={deletionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deletion-reason">Reason (optional)</Label>
              <Textarea
                id="deletion-reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Tell us why you're leaving (optional)"
                rows={3}
                disabled={deletionLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeletionDialogOpen(false);
                setConfirmText('');
                setDeletionReason('');
              }}
              disabled={deletionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void submitDeletion()}
              disabled={confirmText !== 'DELETE' || deletionLoading}
            >
              {deletionLoading ? 'Submitting…' : 'Delete account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsBody>
  );
}

function DataAction({
  icon: Icon,
  title,
  description,
  action,
  onClick,
  disabled,
  tone = 'default',
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
      <Icon
        className={
          tone === 'danger'
            ? 'mt-0.5 h-4 w-4 shrink-0 text-red-400'
            : 'mt-0.5 h-4 w-4 shrink-0 text-muted-foreground'
        }
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Button
        variant={tone === 'danger' ? 'ghost' : 'outline'}
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'shrink-0',
          tone === 'danger' && 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
        )}
      >
        {action}
      </Button>
    </div>
  );
}
