import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Syntheon Hub uses cookies and similar technologies on our websites and app.',
  alternates: { canonical: 'https://syntheonhub.com/cookie-policy' },
  openGraph: {
    title: 'Cookie Policy | Syntheon Hub',
    description: 'Cookie and tracking technology policy for Syntheon Hub.',
    url: 'https://syntheonhub.com/cookie-policy',
  },
};

export default function CookiePolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
