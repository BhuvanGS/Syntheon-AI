import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { BrandLogo } from '@/components/brand-logo';
import { NotFoundBoard } from '@/components/not-found-board';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'Ticket 404 extracted on The Internet board.',
  robots: { index: false, follow: true },
};

const FONT =
  'var(--font-bricolage), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

export default async function NotFound() {
  const host = (await headers()).get('host') ?? '';
  const isApp = host.startsWith('app.');

  const primary = isApp
    ? { href: '/dashboard', label: 'Back to dashboard' }
    : { href: '/', label: 'Back to home' };

  const secondary = isApp
    ? { href: '/settings', label: 'Settings' }
    : { href: '/docs', label: 'Docs' };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#fff',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          height: 64,
          padding: '0 5vw',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Link
          href={isApp ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
            color: '#fff',
          }}
        >
          <BrandLogo size={28} />
          <span style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-0.02em' }}>
            Syntheon Hub
          </span>
        </Link>
      </header>

      <main
        style={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          padding: 'clamp(3rem, 8vh, 6rem) 5vw',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.38)',
            }}
          >
            The Internet
          </p>
          <h1
            style={{
              margin: '0.75rem 0 1.75rem',
              fontSize: 'clamp(1.85rem, 4.5vw, 2.4rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.12,
              textWrap: 'balance',
            }}
          >
            Ticket 404 extracted.
          </h1>
          <NotFoundBoard primary={primary} secondary={secondary} />
        </div>
      </main>
    </div>
  );
}
