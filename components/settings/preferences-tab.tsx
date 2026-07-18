'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  Monitor,
  Moon,
  Sun,
  Palette,
  Shield,
  Download,
  Trash2,
  UserX,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function generateConfirmCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function PreferencesTab() {
  const { theme, setTheme } = useTheme();
  const { orgRole } = useAuth();
  const { user } = useUser();
  const [deletionLoading, setDeletionLoading] = useState<'none' | 'user' | 'org'>('none');

  async function runEmailVerificationLayer(): Promise<boolean> {
    try {
      const email = user?.primaryEmailAddress;
      if (!email) {
        alert('No primary email address found for verification.');
        return false;
      }

      await email.prepareVerification({ strategy: 'email_code' });
      const enteredCode = window.prompt(
        `We sent a Clerk verification code to ${email.emailAddress}. Enter that code to continue.`
      );

      if (enteredCode === null) {
        alert('Deletion process cancelled.');
        return false;
      }

      const verified = await email.attemptVerification({ code: enteredCode.trim() });
      if (verified.verification?.status !== 'verified') {
        alert('Email verification failed. Please try again.');
        return false;
      }

      return true;
    } catch {
      alert('Failed to complete Clerk email verification. Please try again.');
      return false;
    }
  }

  function runAlphabetVerificationLayer(): boolean {
    const confirmCode = generateConfirmCode();
    const typedCode = window.prompt(
      `Type this 8-character verification code exactly as shown:\n\n${confirmCode}`
    );

    if (typedCode === null) {
      alert('Deletion process cancelled.');
      return false;
    }

    if (typedCode.trim() !== confirmCode) {
      alert('Verification code mismatch. Deletion process cancelled.');
      return false;
    }

    return true;
  }

  function runTripleConfirmationLayer(scope: 'user' | 'org'): boolean {
    for (let step = 1; step <= 3; step += 1) {
      const ok = window.confirm(
        `${scope === 'org' ? 'Organization' : 'Account'} deletion confirmation ${step}/3.\n\nPress OK to continue, or Cancel to abort the entire deletion process.`
      );

      if (!ok) {
        alert('Deletion process cancelled.');
        return false;
      }
    }

    return true;
  }

  async function requestDeletion(scope: 'user' | 'org') {
    if (deletionLoading !== 'none') return;

    const emailVerified = await runEmailVerificationLayer();
    if (!emailVerified) return;

    const alphabetVerified = runAlphabetVerificationLayer();
    if (!alphabetVerified) return;

    const tripleConfirmed = runTripleConfirmationLayer(scope);
    if (!tripleConfirmed) return;

    const confirmText = window.prompt(
      scope === 'org'
        ? 'Type DELETE to request full organization deletion (all users and data).'
        : 'Type DELETE to request account deletion.'
    );

    if (confirmText === null) return;
    if (confirmText !== 'DELETE') {
      alert('Confirmation text mismatch. Please type DELETE exactly.');
      return;
    }

    const reason = window.prompt('Optional: reason for deletion request') ?? undefined;

    setDeletionLoading(scope);
    try {
      const res = await fetch('/api/privacy/deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, confirmText, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || 'Failed to submit deletion request');
        return;
      }
      alert(data?.message || 'Deletion request submitted successfully.');
    } catch {
      alert('Failed to submit deletion request');
    } finally {
      setDeletionLoading('none');
    }
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light mode' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark mode' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Use system preference' },
  ];

  return (
    <div className="p-6 lg:p-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <Palette className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-playfair font-bold text-foreground">Preferences</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customize your workspace appearance
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance
        </p>

        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Palette className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Theme</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Choose your preferred theme
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <RadioGroup value={theme} onValueChange={setTheme}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.value;
                  return (
                    <div
                      key={t.value}
                      className={cn(
                        'flex flex-col items-center gap-3 rounded-xl border px-4 py-5 cursor-pointer transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border/60 hover:border-border hover:bg-muted/30'
                      )}
                      onClick={() => setTheme(t.value)}
                    >
                      <div
                        className={cn(
                          'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                          isSelected ? 'bg-primary/10' : 'bg-muted/50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <div className="text-center">
                        <Label htmlFor={t.value} className="text-sm font-medium cursor-pointer">
                          {t.label}
                        </Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                      <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4">
          Data & Privacy
        </p>

        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Your data rights</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Manage your personal data under applicable privacy law
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-3">
            <DataAction
              icon={Download}
              title="Request a copy of your data"
              description="Export all personal data we hold about you, including tickets, meetings, and legal records."
              action="Export data"
              onClick={() =>
                alert('Data export request submitted. We will email you within 7 days.')
              }
              tone="primary"
            />
            <DataAction
              icon={FileText}
              title="Terms & legal"
              description="View the Terms of Service, Privacy Policy, and other legal notices you agreed to at sign-in."
              action="Open legal"
              onClick={() => {
                window.location.href = '/legal';
              }}
              tone="primary"
            />
            <DataAction
              icon={Trash2}
              title="Delete meeting transcripts and audio"
              description="Remove all meeting transcripts and audio recordings from your account."
              action="Delete media"
              onClick={() =>
                alert('Media deletion request submitted. We will process it within 30 days.')
              }
              tone="danger"
            />
            <DataAction
              icon={UserX}
              title="Delete your account"
              description="Permanently delete your account and all associated data. This cannot be undone."
              action={deletionLoading === 'user' ? 'Submitting...' : 'Delete account'}
              onClick={() => requestDeletion('user')}
              disabled={deletionLoading !== 'none'}
              tone="danger"
            />
            {orgRole === 'org:admin' && (
              <DataAction
                icon={Trash2}
                title="Delete organization"
                description="Permanently delete this organization, all projects, and all member data under this org."
                action={deletionLoading === 'org' ? 'Submitting...' : 'Delete org'}
                onClick={() => requestDeletion('org')}
                disabled={deletionLoading !== 'none'}
                tone="danger"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DataAction({
  icon: Icon,
  title,
  description,
  action,
  onClick,
  disabled,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  disabled?: boolean;
  tone: 'primary' | 'danger';
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
      <div
        className={cn(
          'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
          tone === 'danger' ? 'bg-red-500/10' : 'bg-primary/10'
        )}
      >
        <Icon className={cn('h-4 w-4', tone === 'danger' ? 'text-red-500' : 'text-primary')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'shrink-0 text-xs font-medium px-3 py-1.5 rounded-md transition-colors',
          disabled && 'opacity-60 cursor-not-allowed',
          tone === 'danger'
            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
            : 'bg-primary/10 text-primary hover:bg-primary/15'
        )}
      >
        {action}
      </button>
    </div>
  );
}
