'use client';

import { useState } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { Settings, Building2, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IntegrationsTab } from '@/components/settings/integrations-tab';
import { OrganizationsTab } from '@/components/settings/organizations-tab';
import { PreferencesTab } from '@/components/settings/preferences-tab';

type SettingsTab = 'integrations' | 'organizations' | 'preferences';

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Settings }> = [
  { id: 'integrations', label: 'Integrations', icon: Settings },
  { id: 'organizations', label: 'Organizations', icon: Building2 },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
];

export default function SettingsPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState<SettingsTab>('integrations');

  if (!user || !organization) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border/60 bg-card/30 p-6">
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your workspace</p>
        </div>
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'organizations' && <OrganizationsTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
        </div>
      </main>
    </div>
  );
}
