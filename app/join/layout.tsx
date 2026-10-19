import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo-robots';

export const metadata: Metadata = noindexMetadata('Join workspace');

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
