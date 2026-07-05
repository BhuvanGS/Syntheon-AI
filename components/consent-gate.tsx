'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ConsentForm } from '@/components/consent-form';
import { Loader2 } from 'lucide-react';

const CONSENT_LOCAL_KEY = 'syntheon_pre_auth_consent';
const CONSENT_PURPOSES_KEY = 'syntheon_pre_auth_consent_purposes';

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();
  const [consentStatus, setConsentStatus] = useState<'loading' | 'needed' | 'valid'>('loading');

  const checkConsent = useCallback(async () => {
    if (!userId) {
      setConsentStatus('loading');
      return;
    }
    try {
      const res = await fetch('/api/consent');
      if (res.ok) {
        const data = await res.json();
        if (data.hasConsent) {
          setConsentStatus('valid');
          return;
        }
      }

      // Check if user gave pre-auth consent — persist it to DB now
      const localConsent =
        typeof window !== 'undefined' ? localStorage.getItem(CONSENT_LOCAL_KEY) : null;
      const localPurposes =
        typeof window !== 'undefined' ? localStorage.getItem(CONSENT_PURPOSES_KEY) : null;

      if (localConsent === 'true' && localPurposes) {
        const purposes = JSON.parse(localPurposes) as string[];
        const recordRes = await fetch('/api/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purposes }),
        });
        if (recordRes.ok) {
          localStorage.removeItem(CONSENT_LOCAL_KEY);
          localStorage.removeItem(CONSENT_PURPOSES_KEY);
          setConsentStatus('valid');
          return;
        }
      }

      setConsentStatus('needed');
    } catch {
      setConsentStatus('needed');
    }
  }, [userId]);

  useEffect(() => {
    if (isLoaded) {
      void checkConsent();
    }
  }, [isLoaded, checkConsent]);

  if (!isLoaded || consentStatus === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-sans">Checking consent status...</p>
      </div>
    );
  }

  if (consentStatus === 'valid') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <ConsentForm loading={false} onConsentGiven={() => setConsentStatus('valid')} />
    </div>
  );
}
