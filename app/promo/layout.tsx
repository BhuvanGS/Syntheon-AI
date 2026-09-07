import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/site-seo';

/** Alternate landing — do not index; homepage owns the product query. */
export const metadata: Metadata = {
  title: 'Promo',
  robots: { index: false, follow: false },
  alternates: { canonical: SITE_ORIGIN },
};

export default function PromoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
