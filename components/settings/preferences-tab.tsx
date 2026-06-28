'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun, Palette } from 'lucide-react';
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
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">Customize your workspace appearance</p>
      </div>

      <Card className="border-border/60 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
              <Palette className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Choose your preferred theme
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <RadioGroup value={theme} onValueChange={setTheme}>
            <div className="space-y-3">
              {themes.map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.value;
                return (
                  <div
                    key={t.value}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border/60 hover:border-border/80'
                    )}
                    onClick={() => setTheme(t.value)}
                  >
                    <RadioGroupItem value={t.value} id={t.value} />
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={cn(
                          'h-9 w-9 rounded-lg flex items-center justify-center shrink-0',
                          isSelected ? 'bg-primary/10' : 'bg-muted/50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor={t.value} className="text-sm font-medium cursor-pointer">
                          {t.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
