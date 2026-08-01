'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

/** Clears the entire query cache when the active Clerk org changes. */
export function OrgCacheGuard({ children }: { children: React.ReactNode }) {
  const { orgId } = useAuth();
  const queryClient = useQueryClient();
  const prevOrgIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const prev = prevOrgIdRef.current;
    // Skip the initial mount — only clear on an actual org switch.
    if (prev !== undefined && prev !== orgId) {
      queryClient.clear();
    }
    prevOrgIdRef.current = orgId;
  }, [orgId, queryClient]);

  return <>{children}</>;
}
