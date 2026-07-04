import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Syntheon — how it works, pricing, integrations, and more.',
  openGraph: {
    title: 'Syntheon Hub FAQ — Frequently asked questions',
    description: 'Everything you need to know about Syntheon Hub.',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
