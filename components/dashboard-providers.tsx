'use client';

import { QueryProvider } from '@/components/query-provider';
import { SseProvider } from '@/components/sse-provider';
import { OrgCacheGuard } from '@/components/org-cache-guard';
import { SseQueryBridge } from '@/components/sse-query-bridge';

/** Client-side dashboard shell: Query > SSE > org cache guard + bridge. */
export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SseProvider>
        <OrgCacheGuard>
          <SseQueryBridge />
          {children}
        </OrgCacheGuard>
      </SseProvider>
    </QueryProvider>
  );
}
