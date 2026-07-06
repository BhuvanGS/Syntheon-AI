'use client';

import { Lock } from 'lucide-react';

interface FeatureGateProps {
  feature: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function FeatureGate({ feature, title, description, children }: FeatureGateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-playfair text-xl font-bold text-foreground mb-1">
        {title ?? `${feature.replace(/_/g, ' ')} is a premium feature`}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description ??
          `Upgrade to unlock ${feature.replace(/_/g, ' ')} and more advanced features.`}
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        Available after beta.
      </p>
      {children}
    </div>
  );
}
