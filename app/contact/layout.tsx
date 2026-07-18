import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Syntheon Hub support for product help, billing questions, or partnership inquiries.',
  alternates: { canonical: 'https://syntheonhub.com/contact' },
  openGraph: {
    title: 'Contact Syntheon Hub',
    description: 'Get in touch with the Syntheon Hub team.',
    url: 'https://syntheonhub.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
