'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { PricingTable } from '@clerk/nextjs';
import { CreditCard, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PLAN_FEATURES: Record<string, string[]> = {
  Free: ['2 meetings/mo', '25 tickets', '1 project', 'Basic board'],
  Pro: ['Unlimited meetings', '500 tickets', '10 projects', 'Dependencies', 'API access'],
  Max: ['Everything unlimited', 'Analytics', 'Sprint-stones', 'Roadmap', 'Priority support'],
  Enterprise: ['SSO', 'Audit logs', 'Data residency', 'Dedicated support'],
};

export function BillingTab() {
  const { isLoaded, has } = useAuth();
  const { organization } = useOrganization();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isOrg = Boolean(organization);
  const billingType = isOrg ? 'organization' : 'user';

  const currentPlan =
    has?.({ plan: 'user_max' }) || has?.({ plan: 'org:org_max' })
      ? 'Max'
      : has?.({ plan: 'user_pro' }) || has?.({ plan: 'org:org_pro' })
        ? 'Pro'
        : 'Free';

  const planBadgeColor =
    currentPlan === 'Max'
      ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      : currentPlan === 'Pro'
        ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
        : 'bg-muted text-muted-foreground border-border';

  return (
    <div className="p-6 space-y-6">
      {/* Current plan card */}
      <div className="rounded-2xl border border-border bg-muted/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-playfair font-bold text-foreground">Billing</h2>
            <p className="text-xs text-muted-foreground">
              {isOrg ? `Billed per seat for ${organization?.name}` : 'Personal subscription'}
            </p>
          </div>
        </div>

        {/* Current plan badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${planBadgeColor}`}>
              {currentPlan}
            </span>
            {currentPlan === 'Free' && (
              <span className="text-xs text-muted-foreground">Limited to 2 meetings/mo</span>
            )}
          </div>
          {currentPlan !== 'Free' && (
            <span className="text-xs text-muted-foreground">
              {isOrg ? 'Per seat' : 'Monthly/Annual'}
            </span>
          )}
        </div>

        {/* Plan features */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(PLAN_FEATURES[currentPlan] ?? []).map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing table for upgrade */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">
            {currentPlan === 'Free' ? 'Upgrade your plan' : 'Change plan'}
          </h3>
          <Link
            href="/pricing"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View full pricing
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <PricingTable for={billingType} />
      </div>
    </div>
  );
}
