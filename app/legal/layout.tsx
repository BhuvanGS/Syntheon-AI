import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Terms of service, privacy policy, and legal information for Syntheon Hub.',
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
