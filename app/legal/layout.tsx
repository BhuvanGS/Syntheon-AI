import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Terms of service, privacy policy, and legal information for Syntheon Hub.',
  alternates: { canonical: 'https://syntheonhub.com/legal' },
  openGraph: {
    title: 'Legal | Syntheon Hub',
    description: 'Terms of service, privacy policy, and legal information for Syntheon Hub.',
    url: 'https://syntheonhub.com/legal',
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
