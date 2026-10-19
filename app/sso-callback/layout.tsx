import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo-robots';

export const metadata: Metadata = noindexMetadata('Sign in');

export default function SsoCallbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
