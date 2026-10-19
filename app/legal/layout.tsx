import type { Metadata } from 'next';
import { ROBOTS_INDEX } from '@/lib/seo-robots';
import { SITE_ORIGIN } from '@/lib/site-seo';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Terms of service, privacy policy, and legal information for Syntheon Hub.',
  robots: ROBOTS_INDEX,
  alternates: { canonical: `${SITE_ORIGIN}/legal` },
  openGraph: {
    title: 'Legal | Syntheon Hub',
    description: 'Terms of service, privacy policy, and legal information for Syntheon Hub.',
    url: 'https://syntheonhub.com/legal',
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
