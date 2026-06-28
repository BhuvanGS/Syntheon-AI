'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/island-toast';

type OAuthConnectButtonProps = {
  label: string;
  providerName: string;
  initiateEndpoint: string;
  onSuccess?: () => void;
};

export function OAuthConnectButton({
  label,
  providerName,
  initiateEndpoint,
  onSuccess,
}: OAuthConnectButtonProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);

      const res = await fetch(initiateEndpoint, {
        method: 'POST',
      });

      const data = await res.json();

      if (!data.authorizationUrl) {
        throw new Error('Failed to get authorization URL');
      }

      window.location.href = data.authorizationUrl;
      onSuccess?.();
    } catch (error) {
      console.error(`Failed to connect ${providerName}:`, error);
      showToast(`Could not start ${providerName} authentication`, 'error');
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleConnect} disabled={loading} className="gap-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{label}</span>
    </Button>
  );
}
