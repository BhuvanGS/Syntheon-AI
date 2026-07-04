import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Syntheon joins your meetings, extracts action items, and creates organized tickets automatically. See the full workflow in action.',
  openGraph: {
    title: 'How Syntheon Works — Meetings to tickets, automatically',
    description: 'AI joins your meetings, extracts action items, creates tickets. See the workflow.',
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
