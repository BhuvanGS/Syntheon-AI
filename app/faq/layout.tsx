import type { Metadata } from 'next';
import { JsonLd, buildFaqJsonLd } from '@/components/seo/json-ld';
import { FAQ_ITEMS } from '@/lib/faq-content';
import { FAQ_SEO, SITE_ORIGIN } from '@/lib/site-seo';

export const metadata: Metadata = {
  title: FAQ_SEO.title,
  description: FAQ_SEO.description,
  alternates: { canonical: `${SITE_ORIGIN}/faq` },
  openGraph: {
    title: `${FAQ_SEO.title} | Syntheon Hub`,
    description: FAQ_SEO.description,
    url: `${SITE_ORIGIN}/faq`,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    title: `${FAQ_SEO.title} | Syntheon Hub`,
    description: FAQ_SEO.description,
    images: ['/og-image.png'],
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
