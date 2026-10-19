'use client';

import Link from 'next/link';
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
          <Link href="/pricing">Upgrade</Link>
        </Button>
        {!compact ? (
          <Button asChild variant="ghost" size="default">
            <Link href="/settings?tab=billing">Billing</Link>
          </Button>
        ) : null}
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
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-foreground">
      <span className="font-medium">Plan limit hit.</span>
      <span className="text-muted-foreground">
        {isAdmin ? 'Consider upgrading to keep creating work.' : 'Ask an admin about upgrading.'}
      </span>
      <BillingUpgradeCtas compact className="ml-auto" />
    </div>
  );
}

export function BillingPausedCard({ className }: { className?: string }) {
  const { writePaused, isAdmin } = useBillingAccess();
  if (!writePaused) return null;

  return (
    <div className={cn('rounded-lg border border-border bg-muted/30 px-4 py-3', className)}>
      <p className="text-sm font-medium text-foreground">Plan limit hit</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {isAdmin
          ? 'This plan’s limit is reached. Consider upgrading to start meetings and create tickets or projects.'
          : 'This plan’s limit is reached. Ask an organization admin about upgrading.'}
      </p>
      <div className="mt-3">
        <BillingUpgradeCtas />
      </div>
    </div>
  );
}

export function PlanLimitBlock({
  resource,
  onDismiss,
}: {
  code?: string;
  resource: string;
  limit: number;
  onDismiss: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-5">
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">Plan limit hit</p>
        <p className="text-sm text-muted-foreground">
          You can’t add more {resource} on this plan. Consider upgrading to continue.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onDismiss}>
          Not now
        </Button>
        <BillingUpgradeCtas />
      </div>
    </div>
  );
}
