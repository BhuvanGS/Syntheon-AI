'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun, Palette, Shield, Download, Trash2, UserX, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function PreferencesTab() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Light mode' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark mode' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Use system preference' },
  ];

  return (
    <div className="p-6 lg:p-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <Palette className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-playfair font-bold text-foreground">Preferences</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customize your workspace appearance
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance
        </p>

        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Palette className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Theme</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Choose your preferred theme
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <RadioGroup value={theme} onValueChange={setTheme}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.value;
                  return (
                    <div
                      key={t.value}
                      className={cn(
                        'flex flex-col items-center gap-3 rounded-xl border px-4 py-5 cursor-pointer transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border/60 hover:border-border hover:bg-muted/30'
                      )}
                      onClick={() => setTheme(t.value)}
                    >
                      <div
                        className={cn(
                          'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                          isSelected ? 'bg-primary/10' : 'bg-muted/50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <div className="text-center">
                        <Label htmlFor={t.value} className="text-sm font-medium cursor-pointer">
                          {t.label}
                        </Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                      <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4">
          Data & Privacy
        </p>

        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Your data rights</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Manage your personal data and consent under DPDP Act 2023
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-3">
            <DataAction
              icon={Download}
              title="Request a copy of your data"
              description="Export all personal data we hold about you, including tickets, meetings, and consent records."
              action="Export data"
              onClick={() => alert('Data export request submitted. We will email you within 7 days.')}
              tone="primary"
            />
            <DataAction
              icon={FileText}
              title="Manage consent"
              description="Review or withdraw your consent for AI processing and data collection."
              action="Review consent"
              onClick={() => alert('Consent review request submitted. We will email you within 48 hours.')}
              tone="primary"
            />
            <DataAction
              icon={Trash2}
              title="Delete meeting transcripts and audio"
              description="Remove all meeting transcripts and audio recordings from your account."
              action="Delete media"
              onClick={() => alert('Media deletion request submitted. We will process it within 30 days.')}
              tone="danger"
            />
            <DataAction
              icon={UserX}
              title="Delete your account"
              description="Permanently delete your account and all associated data. This cannot be undone."
              action="Delete account"
              onClick={() => alert('Account deletion request submitted. We will email you to confirm.')}
              tone="danger"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DataAction({
  icon: Icon,
  title,
  description,
  action,
  onClick,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  tone: 'primary' | 'danger';
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', tone === 'danger' ? 'bg-red-500/10' : 'bg-primary/10')}>
        <Icon className={cn('h-4 w-4', tone === 'danger' ? 'text-red-500' : 'text-primary')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={cn(
          'shrink-0 text-xs font-medium px-3 py-1.5 rounded-md transition-colors',
          tone === 'danger'
            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
            : 'bg-primary/10 text-primary hover:bg-primary/15'
        )}
      >
        {action}
      </button>
    </div>
  );
}
