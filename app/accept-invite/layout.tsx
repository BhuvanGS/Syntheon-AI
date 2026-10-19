import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo-robots';

export const metadata: Metadata = noindexMetadata('Accept invite');

export default function AcceptInviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
