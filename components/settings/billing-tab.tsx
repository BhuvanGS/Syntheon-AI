'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoadingMessage } from '@/components/loading-message';
import {
  SettingsBody,
  SettingsCallout,
  SettingsHeader,
  SettingsPanel,
  SettingsPanelHead,
  SettingsSectionLabel,
} from '@/components/settings/settings-chrome';
import { cn } from '@/lib/utils';

const PLAN_FEATURES: Record<string, string[]> = {
  Beta: ['10 meetings/mo', '50 tickets', '3 projects', 'All features unlocked'],
  Free: ['2 meetings/mo', '25 tickets', '1 project', 'Basic board'],
  Pro: ['Unlimited meetings', '500 tickets', '10 projects', 'Dependencies', 'API access'],
  Max: ['Everything unlimited', 'Analytics', 'Sprint-stones', 'Roadmap', 'Priority support'],
  Enterprise: ['SSO', 'Audit logs', 'Data residency', 'Dedicated support'],
};

const PLAN_LIMITS: Record<string, { meetings: number; tickets: number; projects: number }> = {
  Beta: { meetings: 10, tickets: 50, projects: 3 },
  Free: { meetings: 2, tickets: 25, projects: 1 },
  Pro: { meetings: Infinity, tickets: 500, projects: 10 },
  Max: { meetings: Infinity, tickets: Infinity, projects: Infinity },
};

interface UsageData {
  meetingsUsed: number;
  ticketsUsed: number;
  projectsUsed: number;
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

function isBetaActiveClient(): boolean {
  const enabled = ['1', 'true', 'yes', 'on'].includes(
    (process.env.NEXT_PUBLIC_BETA_MODE ?? '').trim().toLowerCase()
  );
  if (!enabled) return false;
  const startAtStr = process.env.NEXT_PUBLIC_BETA_START_AT;
  if (!startAtStr) return false;
  const startAt = new Date(startAtStr);
  if (Number.isNaN(startAt.getTime())) return false;
  const durationRaw = process.env.NEXT_PUBLIC_BETA_DURATION_DAYS;
  const durationDays = Number.parseInt(durationRaw ?? '', 10) || 15;
  const endAt = new Date(startAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  return now >= startAt && now < endAt;
}

export function BillingTab() {
  const { isLoaded, has } = useAuth();
  const { organization } = useOrganization();
  const [usage, setUsage] = useState<UsageData | null>(null);

  const betaActive = isBetaActiveClient();

  const clerkPlan =
    has?.({ plan: 'user_max' }) || has?.({ plan: 'org:org_max' })
      ? 'Max'
      : has?.({ plan: 'user_pro' }) || has?.({ plan: 'org:org_pro' })
        ? 'Pro'
        : 'Free';

  const currentPlan = betaActive ? 'Beta' : clerkPlan;
  const limits = PLAN_LIMITS[currentPlan] ?? PLAN_LIMITS.Free;

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    void (async () => {
      try {
        const [usageRes, projectsRes] = await Promise.all([
          fetch('/api/usage').then((r) => r.json().catch(() => ({}))),
          fetch('/api/projects?limit=100').then((r) => r.json().catch(() => ({ projects: [] }))),
        ]);

        if (!cancelled) {
          setUsage({
            meetingsUsed: usageRes.meetingsUsed ?? 0,
            ticketsUsed: usageRes.ticketsUsed ?? 0,
            projectsUsed: (projectsRes.projects ?? []).length,
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

  return (
    <SettingsBody>
      <SettingsHeader
        title="Billing"
        description={
          isOrg ? `Plan and usage for ${organization?.name}.` : 'Your personal plan and usage.'
        }
      />

      <SettingsPanel>
        <SettingsPanelHead
          title="Current plan"
          hint={isOrg ? 'Billed per seat for this organization' : 'Personal subscription'}
          action={
            <span className="rounded-md border border-border bg-white/[0.04] px-2.5 py-1 text-[12px] font-semibold tracking-[-0.01em] text-foreground">
              {currentPlan}
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

      <SettingsCallout>
        <p className="font-medium text-foreground">All features unlocked during beta</p>
        <p className="mt-1">Paid subscriptions will open after the beta period ends.</p>
      </SettingsCallout>
    </SettingsBody>
  );
}
