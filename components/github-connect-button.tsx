'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GitHubConnectButtonProps {
  onSuccess?: () => void;
}

export function GitHubConnectButton({ onSuccess }: GitHubConnectButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);

      // Call the initiate endpoint
      const res = await fetch('/api/oauth/github/initiate', {
        method: 'POST',
      });

      const data = await res.json();

      if (!data.authorizationUrl) {
        throw new Error('Failed to get authorization URL');
      }

      // Redirect to GitHub
      window.location.href = data.authorizationUrl;

      onSuccess?.();
    } catch (error) {
      console.error('Failed to connect GitHub:', error);
      toast({
        title: 'Connection Failed',
        description: 'Could not start GitHub authentication',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleConnect} disabled={loading} className="gap-2">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>Connect GitHub</span>
    </Button>
  );
}