import type { Metadata } from 'next';
import LandingPageClient from '@/components/marketing/landing-page-client';
import { HOME_KEYWORDS, HOME_SEO, SITE_ORIGIN } from '@/lib/site-seo';
import { ROBOTS_INDEX } from '@/lib/seo-robots';

export const metadata: Metadata = {
  title: HOME_SEO.title,
  description: HOME_SEO.description,
  keywords: [...HOME_KEYWORDS],
  alternates: { canonical: SITE_ORIGIN },
  robots: ROBOTS_INDEX,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_ORIGIN,
    siteName: 'Syntheon Hub',
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: HOME_SEO.ogAlt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_SEO.title,
    description: HOME_SEO.description,
    images: ['/og-image.png'],
  },
};

export default function HomePage() {
  return <LandingPageClient />;
}
