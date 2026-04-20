'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationList, useUser } from '@clerk/nextjs';
import { Building2, Users, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Step = 'choose' | 'create' | 'join';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { createOrganization, setActive, userMemberships } = useOrganizationList({
    userMemberships: true,
  });

  const [step, setStep] = useState<Step>('choose');
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim() || !createOrganization) return;
    setLoading(true);
    setError('');
    try {
      const org = await createOrganization({ name: orgName.trim() });
      await setActive({ organization: org.id });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinViaInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      // Clerk invite links are handled via the /accept-invitation route
      // We redirect to the Clerk-managed invite URL
      const url = inviteCode.trim();
      if (url.startsWith('http')) {
        window.location.href = url;
      } else {
        setError('Please paste the full invite link you received.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Invalid invite link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-playfair text-xl font-bold text-foreground">Syntheon</span>
      </div>

      <div className="w-full max-w-md">
        {step === 'choose' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-playfair text-3xl font-bold text-foreground">
                Welcome{user?.firstName ? `, ${user.firstName}` : ''}
              </h1>
              <p className="text-muted-foreground">
                Get started by setting up your organization workspace.
              </p>
            </div>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setStep('create')}
                className={cn(
                  'flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-md'
                )}
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
                onClick={() => setStep('join')}
                className={cn(
                  'flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-md'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">Join via invite link</p>
                  <p className="text-sm text-muted-foreground">
                    Your admin sent you an invite. Paste the link to join.
                  </p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground mt-1" />
              </button>
            </div>
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStep('choose')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
              <h1 className="font-playfair text-3xl font-bold text-foreground">
                Create your organization
              </h1>
              <p className="text-muted-foreground">
                This will be your team's shared workspace in Syntheon.
              </p>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Organization name</label>
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. ChannelWorks, SyntheonHQ..."
                  autoFocus
                  disabled={loading}
                />
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
          </div>
        )}

        {step === 'join' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStep('choose')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
              <h1 className="font-playfair text-3xl font-bold text-foreground">Join your team</h1>
              <p className="text-muted-foreground">
                Paste the invite link your admin shared with you.
              </p>
            </div>

            <form onSubmit={handleJoinViaInvite} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Invite link</label>
                <Input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="https://..."
                  autoFocus
                  disabled={loading}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full rounded-full gap-2"
                disabled={loading || !inviteCode.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {loading ? 'Joining...' : 'Join organization'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
