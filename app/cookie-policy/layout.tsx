import type { Metadata } from 'next';
import { ROBOTS_INDEX } from '@/lib/seo-robots';
import { SITE_ORIGIN } from '@/lib/site-seo';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Syntheon Hub uses cookies and similar technologies on our websites and app.',
  robots: ROBOTS_INDEX,
  alternates: { canonical: `${SITE_ORIGIN}/cookie-policy` },
  openGraph: {
    title: 'Cookie Policy | Syntheon Hub',
    description: 'Cookie and tracking technology policy for Syntheon Hub.',
    url: `${SITE_ORIGIN}/cookie-policy`,
  },
};

export default function CookiePolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
