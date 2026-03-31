'use client';

import { OAuthConnectButton } from '@/components/oauth-connect-button';

interface LinearConnectButtonProps {
  onSuccess?: () => void;
}

export function LinearConnectButton({ onSuccess }: LinearConnectButtonProps) {
  return (
    <OAuthConnectButton
      label="Connect Linear"
      providerName="Linear"
      initiateEndpoint="/api/oauth/linear/initiate"
      onSuccess={onSuccess}
    />
  );
}
