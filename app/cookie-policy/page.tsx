'use client';

import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        html {
          color-scheme: dark;
        }
      `}</style>

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          background: 'rgba(0,0,0,0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <nav
          style={{
            padding: '0 5vw',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            <ArrowLeft size={16} />
            Back to Syntheon Hub
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '8rem 5vw 6rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <Cookie size={32} color="#fff" />
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}
          >
            Cookie Policy
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
            Last updated: July 5, 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              What are cookies?
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Cookies are small text files stored on your device when you visit a website. They help
              us recognize your device, remember your preferences, and keep you signed in. We also
              use similar technologies like web beacons and local storage where necessary.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              How we use cookies
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Syntheon Hub uses cookies only for essential functionality. We do not use cookies for
              advertising, tracking, or profiling.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              Types of cookies we use
            </h2>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <li
                style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Authentication cookies
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  Set by Clerk to keep you signed in securely and protect your account. These are
                  strictly necessary and cannot be disabled.
                </p>
              </li>
              <li
                style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Preference cookies
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  Remember your theme choice (light, dark, or system) and other display preferences.
                </p>
              </li>
              <li
                style={{
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Local storage for consent
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  We store your DPDP consent preferences locally on your device so you do not have
                  to re-consent on every visit before signing in.
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              Third-party cookies
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Our authentication provider, Clerk, may use cookies to manage sessions and security.
              We do not allow advertising or analytics third-party cookies on Syntheon Hub.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              Managing cookies
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              You can manage or delete cookies through your browser settings. Please note that
              disabling essential cookies may prevent you from signing in or using core features.
            </p>
          </section>

          <section>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '0.75rem',
              }}
            >
              Contact us
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              If you have questions about our cookie policy, contact us at{' '}
              <a
                href="mailto:privacy@syntheon.ai"
                style={{ color: '#fff', textDecoration: 'underline' }}
              >
                privacy@syntheon.ai
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '2rem 5vw',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          &copy; 2026 Syntheon Hub. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
