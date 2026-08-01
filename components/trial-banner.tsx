'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { AlertTriangle, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTrialQuery, useUsageQuery } from '@/hooks/use-workspace-queries';

const FREE_MEETING_LIMIT = 10;

export function TrialBanner() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { isLoaded: authLoaded, has } = useAuth();

  const isPaid =
    has?.({ plan: 'user_pro' }) ||
    has?.({ plan: 'user_max' }) ||
    has?.({ plan: 'org:org_pro' }) ||
    has?.({ plan: 'org:org_max' });
  const currentPlan =
    has?.({ plan: 'user_max' }) || has?.({ plan: 'org:org_max' })
      ? 'Max'
      : has?.({ plan: 'user_pro' }) || has?.({ plan: 'org:org_pro' })
        ? 'Pro'
        : 'Free';

  const { data: trial } = useTrialQuery(Boolean(organization?.id));
  const { data: usageRaw } = useUsageQuery(authLoaded && !isPaid);
  const usage = usageRaw
    ? {
        meetingsUsed: usageRaw.meetingsUsed ?? 0,
        meetingsLimit: usageRaw.meetingsLimit ?? FREE_MEETING_LIMIT,
      }
    : null;

  if (!orgLoaded || !authLoaded) return null;

  const days = trial?.daysLeft ?? 0;
  const totalDays = trial?.trialDays ?? 7;
  const isTrial = trial?.isTrial && !trial.expired;
  const isUrgent = isTrial && days <= 7;

  if (trial?.expired) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/10 text-xs font-medium text-destructive"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Trial expired</span>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (isPaid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium',
          currentPlan === 'Max'
            ? 'border-purple-500/30 bg-purple-500/10 text-purple-600'
            : 'border-blue-500/30 bg-blue-500/10 text-blue-600'
        )}
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="font-bold">{currentPlan}</span>
        <span className="opacity-50">·</span>
        <span className="opacity-70">Unlimited meetings</span>
      </motion.div>
    );
  }

  if (isTrial) {
    const progress = Math.max(0, Math.min(100, ((totalDays - days) / totalDays) * 100));
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium',
          isUrgent
            ? 'border-primary/30 bg-primary/10 text-primary'
            : 'border-primary/20 bg-primary/5 text-primary'
        )}
      >
        {isUrgent ? (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>
          {days === 0 ? 'Trial ends today' : days === 1 ? '1 day left' : `${days} days left`}
        </span>
        <div className="hidden sm:block w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={cn('h-full rounded-full', isUrgent ? 'bg-primary' : 'bg-primary/60')}
          />
        </div>
      </motion.div>
    );
  }

  if (usage) {
    const remaining = Math.max(0, usage.meetingsLimit - usage.meetingsUsed);
    const isExhausted = remaining === 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium',
          isExhausted
            ? 'border-destructive/20 bg-destructive/10 text-destructive'
            : 'border-border bg-muted/40 text-muted-foreground'
        )}
      >
        <Zap className="h-3.5 w-3.5 shrink-0" />
        <span className="font-bold">Free</span>
        <span className="opacity-50">·</span>
        <span>
          {isExhausted ? '0 meetings left' : `${remaining}/${usage.meetingsLimit} meetings left`}
        </span>
      </motion.div>
    );
  }

  return null;
}
