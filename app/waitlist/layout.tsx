import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo-robots';

export const metadata: Metadata = noindexMetadata('Waitlist');

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
