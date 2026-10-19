import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo-robots';

export const metadata: Metadata = noindexMetadata('Sign in');

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
