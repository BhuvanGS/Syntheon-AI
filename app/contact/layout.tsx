import type { Metadata } from 'next';
import { ROBOTS_INDEX } from '@/lib/seo-robots';
import { SITE_ORIGIN } from '@/lib/site-seo';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Syntheon Hub support for product help, billing questions, or partnership inquiries.',
  robots: ROBOTS_INDEX,
  alternates: { canonical: `${SITE_ORIGIN}/contact` },
  openGraph: {
    title: 'Contact Syntheon Hub',
    description: 'Get in touch with the Syntheon Hub team.',
    url: 'https://syntheonhub.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
