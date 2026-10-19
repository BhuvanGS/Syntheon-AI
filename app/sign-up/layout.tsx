import type { Metadata } from 'next';
import { noindexMetadata } from '@/lib/seo-robots';

export const metadata: Metadata = noindexMetadata('Sign up');

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
