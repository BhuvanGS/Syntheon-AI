import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Page padding + max width for settings tab bodies. */
export function SettingsBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-8 sm:px-8 lg:px-10 lg:py-10', className)}>
      <div className="mx-auto max-w-3xl space-y-8">{children}</div>
    </div>
  );
}

/** Tab page title — matches dashboard app-title vocabulary. */
export function SettingsHeader({
  eyebrow = 'Settings',
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="app-section-head">
      <div className="app-section-head-copy">
        <p className="app-eyebrow">{eyebrow}</p>
        <h2 className="app-title mt-2">{title}</h2>
        {description ? <p className="app-subtitle">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Hairline panel — prefer over nested Card chrome. */
export function SettingsPanel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn('app-panel overflow-hidden', padded && 'app-panel-pad', className)}>
      {children}
    </section>
  );
}

export function SettingsPanelHead({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h3 className="app-section-label">{title}</h3>
        {hint ? <p className="app-section-hint">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SettingsSectionLabel({ children }: { children: ReactNode }) {
  return <p className="app-eyebrow">{children}</p>;
}

export function SettingsEmpty({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-14 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1.5 text-[13px] text-muted-foreground">{description}</p>
    </div>
  );
}

export function SettingsCallout({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'warn' | 'danger';
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-[13px] leading-relaxed',
        tone === 'neutral' && 'border-border bg-white/[0.03] text-muted-foreground',
        tone === 'warn' && 'border-white/10 bg-white/[0.04] text-muted-foreground',
        tone === 'danger' && 'border-red-500/25 bg-red-500/[0.06] text-red-300/90'
      )}
    >
      {children}
    </div>
  );
}
