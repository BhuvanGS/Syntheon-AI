'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { TERMS_ACCEPTANCE_PURPOSES } from '@/lib/consent-constants';

/**
 * Silently records terms acceptance after login.
 * Never blocks the UI — agreeing happens via the auth page legal line.
 */
export function TermsAcceptanceStamp({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const stamped = useRef(false);

  useEffect(() => {
    if (!isLoaded || !userId || stamped.current) return;
    stamped.current = true;

    void (async () => {
      try {
        const res = await fetch('/api/consent');
        if (res.ok) {
          const data = (await res.json()) as { hasConsent?: boolean };
          if (data.hasConsent) return;
        }
        await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purposes: TERMS_ACCEPTANCE_PURPOSES,
            source: 'auth_agree_line',
          }),
        });
      } catch {
        // Non-blocking — retry on next session
        stamped.current = false;
      }
    })();
  }, [isLoaded, userId]);

  return <>{children}</>;
}
