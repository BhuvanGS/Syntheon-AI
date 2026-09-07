'use client';

import { PricingTable, useAuth, useOrganization } from '@clerk/nextjs';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoadingMessage } from '@/components/loading-message';
import { useBillingAccess } from '@/hooks/use-billing-access';

type BillingType = 'user' | 'organization';

export default function PricingPage() {
  const { isLoaded, has } = useAuth();
  const { organization } = useOrganization();
  const { isAdmin, writePaused } = useBillingAccess();
  const router = useRouter();

  const isOrg = Boolean(organization);
  const [billingType, setBillingType] = useState<BillingType>(isOrg ? 'organization' : 'user');

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingMessage />
      </div>
    );
  }

  const currentPlan =
    has?.({ plan: 'user_max' }) || has?.({ plan: 'org:org_max' })
      ? 'Max'
      : has?.({ plan: 'user_pro' }) || has?.({ plan: 'org:org_pro' })
        ? 'Pro'
        : 'Free';

  const planColor =
    currentPlan === 'Max'
      ? 'border-purple-500/30 bg-purple-500/5 text-purple-600'
      : currentPlan === 'Pro'
        ? 'border-blue-500/30 bg-blue-500/5 text-blue-600'
        : 'border-border bg-muted/40 text-muted-foreground';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div
          className={cn('mb-8 flex items-center justify-between rounded-xl border p-4', planColor)}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wide opacity-70">Your current plan</p>
              <p className="text-lg font-bold">
                {writePaused && currentPlan === 'Free' ? 'Trial expired' : currentPlan}
              </p>
            </div>
          </div>
          {currentPlan === 'Free' && (
            <div className="text-right">
              <p className="text-xs opacity-70">
                Meetings, tickets, and projects pause after trial
              </p>
              <p className="mt-0.5 text-xs font-medium">Upgrade to turn the bot back on</p>
            </div>
          )}
          {currentPlan === 'Pro' && (
            <div className="text-right">
              <p className="text-xs opacity-70">Unlimited meetings · 10 projects · 500 tickets</p>
              <p className="mt-0.5 text-xs font-medium">Dependencies · API access</p>
            </div>
          )}
          {currentPlan === 'Max' && (
            <div className="text-right">
              <p className="text-xs opacity-70">Everything unlimited</p>
              <p className="mt-0.5 text-xs font-medium">Analytics · Sprint-stones · Roadmap</p>
            </div>
          )}
        </div>

        <div className="mb-10 text-center">
          <h1 className="font-playfair text-4xl font-bold text-foreground">Choose your plan</h1>
          <p className="mt-2 text-muted-foreground">
            {isAdmin
              ? 'Subscribe to resume meetings, ticket extraction, and new projects.'
              : 'Only an organization admin can change the workspace plan.'}
          </p>
        </div>

        {isOrg && isAdmin && (
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setBillingType('organization')}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-all',
                  billingType === 'organization'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Organization plans
              </button>
              <button
                type="button"
                onClick={() => setBillingType('user')}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-all',
                  billingType === 'user'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Personal plans
              </button>
            </div>
          </div>
        )}

        {isAdmin ? (
          <PricingTable for={isOrg ? billingType : 'user'} />
        ) : (
          <div className="mx-auto max-w-md rounded-xl border border-border bg-muted/30 p-8 text-center">
            <p className="text-sm font-medium text-foreground">Ask an admin to upgrade</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Members cannot start checkout. Existing tickets and meetings stay visible.
            </p>
            <Button asChild className="mt-4">
              <a href="/settings?tab=billing">Open billing</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
