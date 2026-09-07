'use client';

import Link from 'next/link';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBillingAccess } from '@/hooks/use-billing-access';

export function BillingUpgradeCtas({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { isAdmin } = useBillingAccess();

  if (isAdmin) {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <Button asChild size={compact ? 'sm' : 'default'} className={compact ? 'h-7 px-2.5' : ''}>
          <Link href="/pricing">Upgrade plan</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          className={compact ? 'h-7 px-2.5' : ''}
        >
          <Link href="/settings?tab=billing">Billing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button
        asChild
        variant="secondary"
        size={compact ? 'sm' : 'default'}
        className={compact ? 'h-7 px-2.5' : ''}
      >
        <Link href="/settings?tab=billing">Ask an admin</Link>
      </Button>
    </div>
  );
}

export function BillingPausedBanner() {
  const { writePaused, isAdmin } = useBillingAccess();
  if (!writePaused) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium">Trial expired</span>
      <span className="text-destructive/80">
        {isAdmin
          ? 'Meetings, new tickets, and new projects are paused until you upgrade.'
          : 'Meetings and new work are paused. Ask an org admin to upgrade.'}
      </span>
      <BillingUpgradeCtas compact className="ml-auto" />
    </div>
  );
}

export function BillingPausedCard({ className }: { className?: string }) {
  const { writePaused, isAdmin } = useBillingAccess();
  if (!writePaused) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center',
        className
      )}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Lock className="h-6 w-6" />
      </div>
      <p className="font-playfair text-xl font-bold text-foreground">Trial expired</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {isAdmin
          ? 'The bot will not join new calls, and new tickets or projects cannot be created until this workspace is on a paid plan. Existing work stays readable.'
          : 'This workspace’s trial has ended. You can still open existing meetings and tickets. An organization admin needs to upgrade for new meetings and tickets.'}
      </p>
      <div className="mt-4 flex justify-center">
        <BillingUpgradeCtas />
      </div>
    </div>
  );
}

export function PlanLimitBlock({
  code,
  resource,
  limit,
  onDismiss,
}: {
  code?: string;
  resource: string;
  limit: number;
  onDismiss: () => void;
}) {
  const expired = code === 'trial_expired' || code === 'subscription_required';

  return (
    <div className="space-y-4 rounded-2xl border border-destructive/15 bg-destructive/5 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Lock className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <p className="font-playfair text-2xl text-foreground">
          {expired ? 'Trial expired' : 'Plan limit reached'}
        </p>
        <p className="text-sm text-muted-foreground">
          {expired
            ? 'Upgrade to start meetings, extract tickets, and create projects again.'
            : `You've used all ${limit} ${resource} on the current plan. Upgrade to continue.`}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDismiss} className="rounded-full">
          Maybe later
        </Button>
        <BillingUpgradeCtas />
      </div>
    </div>
  );
}
