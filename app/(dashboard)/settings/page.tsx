'use client';

import { useState } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Building2, Sliders, ArrowLeft, Shield, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { IntegrationsTab } from '@/components/settings/integrations-tab';
import { OrganizationsTab } from '@/components/settings/organizations-tab';
import { OrganizationDomainsTab } from '@/components/settings/organization-domains-tab';
import { PreferencesTab } from '@/components/settings/preferences-tab';

type SettingsTab = 'integrations' | 'organizations' | 'domains' | 'preferences';

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Plug; description: string }> = [
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    description: 'Connect external services',
  },
  {
    id: 'organizations',
    label: 'Organizations',
    icon: Building2,
    description: 'Manage your workspace',
  },
  { id: 'domains', label: 'Verified Domains', icon: Shield, description: 'Domain-based access' },
  { id: 'preferences', label: 'Preferences', icon: Sliders, description: 'Appearance & theme' },
];

export default function SettingsPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('integrations');

  if (!user || !organization) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const orgInitial = organization.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Settings Sidebar */}
      <aside className="w-72 border-r border-border/60 bg-card/30 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-border/40">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 px-2 text-muted-foreground hover:text-foreground mb-4 -ml-1"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-lg font-playfair font-bold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your workspace</p>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm font-medium', isActive && 'text-primary')}>
                      {tab.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{tab.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Org badge footer */}
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 border border-border/40 px-3 py-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-primary">{orgInitial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{organization.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user.fullName ||
                  [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                  user.username ||
                  user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'organizations' && <OrganizationsTab />}
          {activeTab === 'domains' && <OrganizationDomainsTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
        </div>
      </main>
    </div>
  );
}
