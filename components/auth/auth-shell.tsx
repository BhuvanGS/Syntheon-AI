'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import type { ReactNode } from 'react';

const DISPLAY =
  'var(--font-bricolage), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

/**
 * Premium auth shell — matches marketing dark precision.
 * No consent gate; legal acceptance is the line under the form.
 */
export function AuthShell({
  children,
  mode,
}: {
  children: ReactNode;
  mode: 'sign-in' | 'sign-up';
}) {
  const headline = mode === 'sign-in' ? 'Welcome back.' : 'Start shipping from speak.';
  const support =
    mode === 'sign-in'
      ? 'Sign in to your workspace. Meetings become tickets — Speak. Shape. Ship.'
      : 'Create your free account. Join meetings; leave with a board that is already current.';

  return (
    <div className="min-h-screen flex bg-[#050505] text-white" style={{ fontFamily: DISPLAY }}>
      {/* Brand panel */}
      <div
        className="hidden md:flex md:w-[48%] lg:w-[52%] relative flex-col justify-between px-12 lg:px-16 py-12 overflow-hidden"
        style={{
          borderRight: '1px solid rgba(255,255,255,0.08)',
          background:
            'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255,255,255,0.06), transparent 55%), #050505',
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 relative z-10 no-underline text-white">
          <BrandLogo size={30} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Syntheon Hub
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <p
            style={{
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '1.25rem',
              fontWeight: 500,
            }}
          >
            Speak · Shape · Ship
          </p>
          <h1
            style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              margin: 0,
              textWrap: 'balance',
            }}
          >
            {headline}
          </h1>
          <p
            style={{
              marginTop: '1.25rem',
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '36ch',
            }}
          >
            {support}
          </p>
        </div>

        <p
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', position: 'relative', zIndex: 10 }}
        >
          © {new Date().getFullYear()} Syntheon Hub
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">
        <div aria-hidden className="md:hidden absolute top-6 left-6 flex items-center gap-2">
          <BrandLogo size={26} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>Syntheon Hub</span>
        </div>

        <div className="w-full max-w-[400px] mt-14 md:mt-0">
          <div className="auth-clerk-wrap">{children}</div>
          <LegalAgreeLine mode={mode} />
        </div>
      </div>

      <style jsx global>{`
        .auth-clerk-wrap .cl-rootBox,
        .auth-clerk-wrap .cl-card {
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        .auth-clerk-wrap .cl-cardBox {
          box-shadow: none !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 20px !important;
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  );
}

function LegalAgreeLine({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const verb = mode === 'sign-in' ? 'signing in' : 'signing up';
  return (
    <p
      style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        fontSize: 13,
        lineHeight: 1.55,
        color: 'rgba(255,255,255,0.42)',
        maxWidth: '36ch',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      By {verb}, you agree to our{' '}
      <Link
        href="/legal#terms"
        style={{
          color: 'rgba(255,255,255,0.75)',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link
        href="/legal#privacy"
        style={{
          color: 'rgba(255,255,255,0.75)',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        Privacy Policy
      </Link>
      , and acknowledge our{' '}
      <Link
        href="/legal"
        style={{
          color: 'rgba(255,255,255,0.75)',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        Legal
      </Link>{' '}
      notices.
    </p>
  );
}
