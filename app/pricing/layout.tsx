import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for teams of all sizes. Start free, scale as you grow.',
  openGraph: {
    title: 'Syntheon Hub Pricing — Start free, scale as you grow',
    description: 'Simple, transparent pricing for teams of all sizes.',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
