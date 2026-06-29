'use client';

import { useEffect, useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TrialStatus {
  isTrial: boolean;
  daysLeft: number | null;
  expired: boolean;
  trialDays?: number;
}

export function TrialBanner() {
  const { organization, isLoaded } = useOrganization();
  const [trial, setTrial] = useState<TrialStatus | null>(null);

  useEffect(() => {
    if (!organization?.id) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/organizations/${organization!.id}/trial`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setTrial(data);
      } catch {
        // silent
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [organization?.id]);

  if (!isLoaded || !trial || !trial.isTrial) return null;

  const days = trial.daysLeft ?? 0;
  const totalDays = trial.trialDays ?? 30;
  const progress = Math.max(0, Math.min(100, ((totalDays - days) / totalDays) * 100));

  if (trial.expired) {
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
          <span className="text-destructive/60 hidden sm:inline">— upgrade to continue</span>
        </motion.div>
      </AnimatePresence>
    );
  }

  const isUrgent = days <= 7;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-default',
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
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>
              {totalDays}-day free trial · {days} days remaining
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
