import type { Metadata } from 'next';
import { HOW_IT_WORKS_SEO, SITE_ORIGIN } from '@/lib/site-seo';

export const metadata: Metadata = {
  title: HOW_IT_WORKS_SEO.title,
  description: HOW_IT_WORKS_SEO.description,
  alternates: { canonical: `${SITE_ORIGIN}/how-it-works` },
  openGraph: {
    title: `${HOW_IT_WORKS_SEO.title} | Syntheon Hub`,
    description: HOW_IT_WORKS_SEO.description,
    url: `${SITE_ORIGIN}/how-it-works`,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: HOW_IT_WORKS_SEO.title }],
  },
  twitter: {
    title: `${HOW_IT_WORKS_SEO.title} | Syntheon Hub`,
    description: HOW_IT_WORKS_SEO.description,
    images: ['/og-image.png'],
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
