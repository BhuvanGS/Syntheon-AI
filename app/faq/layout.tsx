import type { Metadata } from 'next';
import { JsonLd, buildFaqJsonLd } from '@/components/seo/json-ld';
import { FAQ_ITEMS } from '@/lib/faq-content';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Syntheon — how it works, pricing, integrations, and more.',
  alternates: { canonical: 'https://syntheonhub.com/faq' },
  openGraph: {
    title: 'Syntheon Hub FAQ — Frequently asked questions',
    description: 'Everything you need to know about Syntheon Hub.',
    url: 'https://syntheonhub.com/faq',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={buildFaqJsonLd([...FAQ_ITEMS])} />
      {children}
    </>
  );
}
