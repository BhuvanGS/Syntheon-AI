'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/island-toast';
import {
  SettingsBody,
  SettingsHeader,
  SettingsPanel,
  SettingsPanelHead,
  SettingsSectionLabel,
} from '@/components/settings/settings-chrome';

export function IntegrationsTab() {
  const { user } = useUser();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const googleConnectedParam = searchParams.get('google_connected');
    const googleError = searchParams.get('google_error');
    const googleErrorDetail = searchParams.get('google_error_detail');

    if (googleConnectedParam === 'true') {
      showToast('Google Calendar connected successfully', 'success');
      setGoogleConnected(true);
    } else if (googleError) {
      showToast(googleErrorDetail || `Google connection failed: ${googleError}`, 'error');
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    async function loadStatus() {
      if (!user) return;
      try {
        const res = await fetch('/api/integrations/status');
        if (res.ok) {
          const data = await res.json();
          setGoogleConnected(data.googleConnected ?? false);
        }
      } catch (error) {
        console.error('Failed to load integration status:', error);
      } finally {
        setLoading(false);
      }
    }
    void loadStatus();
  }, [user]);

  async function handleGoogleConnect() {
    try {
      const res = await fetch('/api/oauth/google/initiate', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to initiate Google OAuth');
      const { authorizationUrl } = await res.json();
      window.location.href = authorizationUrl;
    } catch {
      showToast('Could not connect to Google Calendar', 'error');
    }
  }

  async function handleGoogleDisconnect() {
    try {
      const res = await fetch('/api/integrations/google/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setGoogleConnected(false);
      showToast('Google Calendar has been disconnected', 'success');
    } catch {
      showToast('Failed to disconnect. Please try again.', 'error');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SettingsBody>
      <SettingsHeader
        title="Integrations"
        description="Connect services so meetings and calendars stay in sync."
      />

      <div className="space-y-3">
        <SettingsSectionLabel>Available</SettingsSectionLabel>
        <SettingsPanel>
          <SettingsPanelHead
            title="Google Calendar"
            hint="Create meetings and sync events from your calendar."
            action={
              googleConnected ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              ) : null
            }
          />
          <div className="app-divider -mx-5 sm:-mx-6" />
          <div className="flex items-center justify-between gap-4 pt-5">
            <div className="min-w-0 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
                <Calendar className="h-4 w-4 text-foreground/80" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {googleConnected ? 'Calendar linked' : 'Not connected'}
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {googleConnected
                    ? 'Your Google Calendar is linked to this workspace.'
                    : 'Connect to create Google Meet links from Syntheon Hub.'}
                </p>
              </div>
            </div>
            {googleConnected ? (
              <Button variant="outline" size="sm" onClick={handleGoogleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button size="sm" onClick={handleGoogleConnect}>
                Connect
              </Button>
            )}
          </div>
        </SettingsPanel>
      </div>
    </SettingsBody>
  );
}
