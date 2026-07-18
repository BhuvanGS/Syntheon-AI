import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'Syntheon Hub joins your meetings, extracts action items, and creates organized tickets automatically. See the full workflow in action.',
  alternates: { canonical: 'https://syntheonhub.com/how-it-works' },
  openGraph: {
    title: 'How Syntheon Hub Works — Meetings to tickets, automatically',
    description:
      'AI joins your meetings, extracts action items, creates tickets. See the workflow.',
    url: 'https://syntheonhub.com/how-it-works',
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
