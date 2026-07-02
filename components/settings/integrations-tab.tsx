'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Calendar, Loader2, Plug } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/island-toast';

export function IntegrationsTab() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      showToast('Could not connect to Google Calendar', 'error');
    }
  }

  async function handleGoogleDisconnect() {
    try {
      const res = await fetch('/api/integrations/google/disconnect', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to disconnect');
      setGoogleConnected(false);
      showToast('Google Calendar has been disconnected', 'success');
    } catch (error) {
      showToast('Failed to disconnect. Please try again.', 'error');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-playfair font-bold text-foreground">Integrations</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Connect external services to enhance your workflow
            </p>
          </div>
        </div>
      </div>

      {/* Connected Integrations */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Available
        </p>

        <Card className="border-border/60 shadow-none overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Google Calendar</CardTitle>
                  {googleConnected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  )}
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Create meetings and sync events
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {googleConnected ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Connected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your Google Calendar is linked
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleGoogleDisconnect}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Not connected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Connect to create Google Meet links
                  </p>
                </div>
                <Button size="sm" onClick={handleGoogleConnect}>
                  Connect
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
