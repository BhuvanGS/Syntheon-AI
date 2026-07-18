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

type SettingsTab = 'integrations' | 'organizations' | 'preferences' | 'billing' | 'legal';

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
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    description: 'Plan & subscription',
  },
  { id: 'legal', label: 'Legal', icon: Scale, description: 'Privacy, terms & policies' },
  { id: 'preferences', label: 'Preferences', icon: Sliders, description: 'Appearance & theme' },
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
      <div className="flex h-screen items-center justify-center">
        <LoadingMessage />
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
                  onClick={() => handleTabChange(tab.id)}
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

        {/* Logout footer */}
        <div className="p-4 border-t border-border/40">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto">
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
            <div className="p-5">
              <div className="mb-3">
                <h2 className="text-lg font-playfair font-bold text-foreground">Legal Center</h2>
                <p className="text-sm text-muted-foreground">
                  Privacy Policy, Terms, Cookies, DPDP and rights
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/20 overflow-hidden">
                <iframe
                  src="/legal?embed=1"
                  title="Syntheon Hub Legal"
                  className="w-full h-[78vh] bg-background"
                />
              </div>
            </div>
          )}
          {activeTab === 'preferences' && <PreferencesTab />}
        </div>
      </main>
    </div>
  );
}
