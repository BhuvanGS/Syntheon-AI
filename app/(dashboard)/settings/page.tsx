'use client';

import { useEffect, useState, Suspense } from 'react';
import { useUser, useOrganization, useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Sliders, ArrowLeft, Plug, LogOut, CreditCard, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { LoadingMessage } from '@/components/loading-message';
import { IntegrationsTab } from '@/components/settings/integrations-tab';
import { OrganizationsTab } from '@/components/settings/organizations-tab';
import { PreferencesTab } from '@/components/settings/preferences-tab';
import { BillingTab } from '@/components/settings/billing-tab';
import { SettingsHeader } from '@/components/settings/settings-chrome';

type SettingsTab = 'integrations' | 'organizations' | 'preferences' | 'billing' | 'legal';

const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Plug; description: string }> = [
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Plug,
    description: 'External services',
  },
  {
    id: 'organizations',
    label: 'Organizations',
    icon: Building2,
    description: 'Workspace & members',
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    description: 'Plan & usage',
  },
  { id: 'legal', label: 'Legal', icon: Scale, description: 'Policies & terms' },
  { id: 'preferences', label: 'Preferences', icon: Sliders, description: 'Theme & privacy' },
];

const VALID_TABS: SettingsTab[] = [
  'integrations',
  'organizations',
  'billing',
  'legal',
  'preferences',
];

export default function SettingsPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>('integrations');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && VALID_TABS.includes(tab as SettingsTab)) {
      setActiveTab(tab as SettingsTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`);
  };

  if (!user || !organization) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingMessage />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex w-[15.5rem] shrink-0 flex-col border-r border-border bg-background sm:w-64">
        <div className="border-b border-border px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-5 h-8 gap-2 px-2 text-[13px] text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Button>
          <p className="app-eyebrow">Workspace</p>
          <h1 className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-foreground">
            Settings
          </h1>
          <p className="mt-1 truncate text-[13px] text-muted-foreground">{organization.name}</p>
        </div>

        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="space-y-0.5" aria-label="Settings">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150',
                    isActive
                      ? 'bg-white/[0.06] text-foreground'
                      : 'text-muted-foreground hover:bg-white/[0.035] hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive ? 'text-foreground' : 'opacity-70')}
                  />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium tracking-[-0.01em]">
                      {tab.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {tab.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            className="h-9 w-full justify-start gap-2 px-3 text-[13px] text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">
        {activeTab === 'integrations' && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <LoadingMessage />
              </div>
            }
          >
            <IntegrationsTab />
          </Suspense>
        )}
        {activeTab === 'organizations' && <OrganizationsTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'legal' && (
          <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-4xl space-y-6">
              <SettingsHeader
                title="Legal"
                description="Privacy, terms, cookies, and data rights."
              />
              <div className="app-panel overflow-hidden">
                <iframe
                  src="/legal?embed=1"
                  title="Syntheon Hub Legal"
                  className="h-[78vh] w-full bg-background"
                />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'preferences' && <PreferencesTab />}
      </main>
    </div>
  );
}
