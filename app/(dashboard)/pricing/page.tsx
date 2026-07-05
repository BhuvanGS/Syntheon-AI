'use client';

import { useState } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { PricingTable } from '@clerk/nextjs';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BillingType = 'user' | 'organization';

export default function PricingPage() {
  const { isLoaded, has } = useAuth();
  const { organization } = useOrganization();
  const router = useRouter();

  const isOrg = Boolean(organization);
  const [billingType, setBillingType] = useState<BillingType>(isOrg ? 'organization' : 'user');

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
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
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Current plan banner */}
        <div
          className={cn('rounded-xl border p-4 mb-8 flex items-center justify-between', planColor)}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wide opacity-70">Your current plan</p>
              <p className="text-lg font-bold">{currentPlan}</p>
            </div>
          </div>
          {currentPlan === 'Free' && (
            <div className="text-right">
              <p className="text-xs opacity-70">2 meetings/mo · 1 project · 25 tickets</p>
              <p className="text-xs font-medium mt-0.5">Upgrade to unlock more</p>
            </div>
          )}
          {currentPlan === 'Pro' && (
            <div className="text-right">
              <p className="text-xs opacity-70">Unlimited meetings · 10 projects · 500 tickets</p>
              <p className="text-xs font-medium mt-0.5">Dependencies · API access</p>
            </div>
          )}
          {currentPlan === 'Max' && (
            <div className="text-right">
              <p className="text-xs opacity-70">Everything unlimited</p>
              <p className="text-xs font-medium mt-0.5">Analytics · Sprint-stones · Roadmap</p>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-playfair text-4xl font-bold text-foreground">Choose your plan</h1>
          <p className="text-muted-foreground mt-2">Upgrade anytime. Cancel anytime.</p>
        </div>

        {/* Billing type toggle (only show if user is in an org) */}
        {isOrg && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
              <button
                onClick={() => setBillingType('organization')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
                  billingType === 'organization'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Organization plans
              </button>
              <button
                onClick={() => setBillingType('user')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-all',
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

        {/* Pricing table */}
        <div className="flex justify-center">
          <PricingTable for={billingType} />
        </div>
      </div>
    </div>
  );
}
