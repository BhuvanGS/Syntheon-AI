import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { BrandLogo } from '@/components/brand-logo';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This URL is not on the Syntheon Hub board.',
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
        <div style={{ width: '100%', maxWidth: 520 }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.38)',
            }}
          >
            Missing from the board
          </p>
          <h1
            style={{
              margin: '0.85rem 0 0.75rem',
              fontSize: 'clamp(2rem, 5vw, 2.75rem)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
            }}
          >
            This ticket was never extracted.
          </h1>
          <p
            style={{
              margin: '0 0 2rem',
              fontSize: 16,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '36ch',
            }}
          >
            The URL doesn&apos;t exist. Nothing to assign, nothing to ship.
          </p>

          <div
            aria-hidden
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: '2rem',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              Backlog
            </div>
            <div style={{ padding: 14 }}>
              <div
                style={{
                  border: '1px dashed rgba(255,255,255,0.18)',
                  borderRadius: 10,
                  padding: '18px 16px',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.35)',
                  }}
                >
                  Empty slot
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 13,
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.72)',
                  }}
                >
                  404
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link
              href={primary.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 40,
                padding: '0 16px',
                borderRadius: 8,
                background: '#fff',
                color: '#050505',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {primary.label}
            </Link>
            <Link
              href={secondary.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 40,
                padding: '0 16px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.16)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              {secondary.label}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
