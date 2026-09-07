'use client';

import { PricingTable, useAuth, useOrganization } from '@clerk/nextjs';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoadingMessage } from '@/components/loading-message';
import { Button } from '@/components/ui/button';
import {
  SettingsBody,
  SettingsCallout,
  SettingsHeader,
  SettingsPanel,
  SettingsPanelHead,
  SettingsSectionLabel,
} from '@/components/settings/settings-chrome';
import { cn } from '@/lib/utils';
import { useBillingAccess } from '@/hooks/use-billing-access';

const PLAN_FEATURES: Record<string, string[]> = {
  Free: ['7-day trial', 'Then paused until upgrade', 'Existing work stays readable'],
  Pro: ['Unlimited meetings', '500 tickets', '10 projects', 'Dependencies', 'API access'],
  Max: ['Everything unlimited', 'Analytics', 'Sprint-stones', 'Roadmap', 'Priority support'],
};

const PLAN_LIMITS: Record<string, { meetings: number; tickets: number; projects: number }> = {
  Free: { meetings: 10, tickets: 50, projects: 3 },
  Pro: { meetings: Infinity, tickets: 500, projects: 10 },
  Max: { meetings: Infinity, tickets: Infinity, projects: Infinity },
};

interface UsageData {
  meetingsUsed: number;
  ticketsUsed: number;
  projectsUsed: number;
  writePaused?: boolean;
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === Infinity;
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const remaining = isUnlimited ? Infinity : Math.max(limit - used, 0);
  const isExhausted = !isUnlimited && remaining === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-foreground">{label}</span>
        <span
          className={cn(
            'tabular-nums',
            isExhausted ? 'font-medium text-red-400' : 'text-muted-foreground'
          )}
        >
          {isUnlimited
            ? `${used} used`
            : isExhausted
              ? 'Limit reached'
              : `${used}/${limit} · ${remaining} left`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isExhausted ? 'bg-red-400' : pct > 80 ? 'bg-white/55' : 'bg-white/80'
          )}
          style={{ width: isUnlimited ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BillingTab() {
  const { isLoaded, has } = useAuth();
  const { organization } = useOrganization();
  const { isAdmin, writePaused, isPaid } = useBillingAccess();
  const [usage, setUsage] = useState<UsageData | null>(null);

  const currentPlan =
    has?.({ plan: 'user_max' }) || has?.({ plan: 'org:org_max' })
      ? 'Max'
      : has?.({ plan: 'user_pro' }) || has?.({ plan: 'org:org_pro' })
        ? 'Pro'
        : 'Free';

  const limits = PLAN_LIMITS[currentPlan] ?? PLAN_LIMITS.Free;

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    void (async () => {
      try {
        const [usageRes, projectsRes] = await Promise.all([
          fetch('/api/usage').then((r) => r.json().catch(() => ({}))),
          fetch('/api/projects').then((r) => r.json().catch(() => [])),
        ]);

        const projectList = Array.isArray(projectsRes) ? projectsRes : (projectsRes.projects ?? []);

        if (!cancelled) {
          setUsage({
            meetingsUsed: usageRes.meetingsUsed ?? 0,
            ticketsUsed: usageRes.ticketsUsed ?? 0,
            projectsUsed: projectList.length,
            writePaused: Boolean(usageRes.writePaused),
          });
        }
      } catch {
        // silent
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, currentPlan]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingMessage />
      </div>
    );
  }

  const isOrg = Boolean(organization);
  const paused = writePaused || Boolean(usage?.writePaused);

  return (
    <SettingsBody>
      <SettingsHeader
        title="Billing"
        description={
          isOrg ? `Plan and usage for ${organization?.name}.` : 'Your personal plan and usage.'
        }
      />

      {paused && (
        <SettingsCallout tone="danger">
          <p className="font-medium text-foreground">Trial expired — paid actions are paused</p>
          <p className="mt-1">
            {isAdmin
              ? 'The meeting bot, new tickets, and new projects stay off until you subscribe. Existing meetings and tickets remain readable.'
              : 'Ask an organization admin to upgrade. You can still open existing meetings and tickets.'}
          </p>
          {isAdmin ? (
            <Button asChild className="mt-3">
              <Link href="/pricing">Choose a plan</Link>
            </Button>
          ) : null}
        </SettingsCallout>
      )}

      <SettingsPanel>
        <SettingsPanelHead
          title="Current plan"
          hint={
            paused
              ? 'Trial ended'
              : isOrg
                ? 'Billed per seat for this organization'
                : 'Personal subscription'
          }
          action={
            <span className="rounded-md border border-border bg-white/[0.04] px-2.5 py-1 text-[12px] font-semibold tracking-[-0.01em] text-foreground">
              {paused && !isPaid ? 'Expired' : currentPlan}
            </span>
          }
        />

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(PLAN_FEATURES[currentPlan] ?? []).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Check className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
              {feature}
            </li>
          ))}
        </ul>

        {usage && (
          <div className="mt-6 space-y-4 rounded-xl border border-border bg-white/[0.02] p-4">
            <SettingsSectionLabel>Usage this period</SettingsSectionLabel>
            <UsageBar label="Meetings" used={usage.meetingsUsed} limit={limits.meetings} />
            <UsageBar label="Tickets" used={usage.ticketsUsed} limit={limits.tickets} />
            <UsageBar label="Projects" used={usage.projectsUsed} limit={limits.projects} />
          </div>
        )}
      </SettingsPanel>

      {isAdmin ? (
        <SettingsPanel>
          <SettingsPanelHead
            title="Upgrade"
            hint={isOrg ? 'Organization plans apply to every member' : 'Personal checkout'}
          />
          <div className="mt-4">
            <PricingTable for={isOrg ? 'organization' : 'user'} />
          </div>
        </SettingsPanel>
      ) : (
        <SettingsCallout>
          <p className="font-medium text-foreground">Only admins can change the plan</p>
          <p className="mt-1">
            Contact an organization admin if you need meetings, tickets, or projects unlocked.
          </p>
        </SettingsCallout>
      )}
    </SettingsBody>
  );
}
