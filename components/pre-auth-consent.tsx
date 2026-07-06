'use client';

import { useState, useEffect } from 'react';
import { ConsentForm } from '@/components/consent-form';

const CONSENT_LOCAL_KEY = 'syntheon_pre_auth_consent';
const CONSENT_PURPOSES_KEY = 'syntheon_pre_auth_consent_purposes';

export function PreAuthConsent({ children }: { children: React.ReactNode }) {
  const [hasPreAuthConsent, setHasPreAuthConsent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem(CONSENT_LOCAL_KEY) : null;
    if (stored === 'true') setHasPreAuthConsent(true);
  }, []);

  if (!mounted) {
    return <div className="flex-1" />;
  }

  if (hasPreAuthConsent) {
    return <>{children}</>;
  }

  return (
    <ConsentForm
      onConsentGiven={(purposes) => {
        localStorage.setItem(CONSENT_LOCAL_KEY, 'true');
        localStorage.setItem(CONSENT_PURPOSES_KEY, JSON.stringify(purposes));
        setHasPreAuthConsent(true);
      }}
    />
  );
}
