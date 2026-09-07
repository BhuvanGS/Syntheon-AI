'use client';

import { useAuth, useOrganization } from '@clerk/nextjs';
import { useTrialQuery } from '@/hooks/use-workspace-queries';

export function isPaidFromHas(has: unknown): boolean {
  if (typeof has !== 'function') return false;
  const check = has as (params: { plan: string }) => boolean;
  return Boolean(
    check({ plan: 'user_pro' }) ||
    check({ plan: 'user_max' }) ||
    check({ plan: 'org:org_pro' }) ||
    check({ plan: 'org:org_max' })
  );
}

export function useBillingAccess() {
  const { isLoaded, has } = useAuth();
  const { membership } = useOrganization();
  const isAdmin = membership?.role === 'org:admin';
  const isPaid = isPaidFromHas(has);
  const trialQuery = useTrialQuery(isLoaded);

  const writePaused = Boolean(
    !isPaid && (trialQuery.data?.writePaused ?? trialQuery.data?.expired)
  );

  return {
    isLoaded: isLoaded && !trialQuery.isLoading,
    isAdmin,
    isPaid,
    writePaused,
    trial: trialQuery.data ?? null,
  };
}
