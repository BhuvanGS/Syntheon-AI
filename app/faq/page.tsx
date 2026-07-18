'use client';

import { BrandLogo } from '@/components/brand-logo';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQ_ITEMS } from '@/lib/faq-content';

const APP_URL = 'https://app.syntheonhub.com';

export default function FAQPage() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<number | null>(0);
  useEffect(() => setMounted(true), []);

  const faqs = FAQ_ITEMS;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        html {
          scroll-behavior: smooth;
          color-scheme: dark;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '0 5vw',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}
        >
          <BrandLogo size={28} />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Syntheon Hub
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {mounted ? (
            <>
              <Link
                href="/pricing"
                style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                Pricing
              </Link>
              <Link
                href="/how-it-works"
                style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                How it works
              </Link>
              <Link
                href={`${APP_URL}/sign-up`}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000',
                  background: '#fff',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                }}
              >
                Start Free
              </Link>
            </>
          ) : null}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: '140px', textAlign: 'center', padding: '140px 5vw 60px' }}>
        <p
          style={{
            fontSize: '12px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          FAQ
        </p>
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            textWrap: 'balance',
            marginBottom: '1.5rem',
          }}
        >
          Questions, answered.
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          Everything you need to know about Syntheon Hub.
        </p>
      </section>

      {/* FAQ list */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '20px 5vw 100px' }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.5rem' }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '1.25rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '16px',
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {faq.q}
              <span
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '20px',
                  flexShrink: 0,
                  marginLeft: '1rem',
                  transition: 'transform 0.2s',
                  transform: open === i ? 'rotate(45deg)' : 'none',
                }}
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <p
                    style={{
                      fontSize: '15px',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.7,
                      paddingBottom: '1.25rem',
                      paddingRight: '2rem',
                    }}
                  >
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '60px 5vw',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>
          Still have questions? Email us at{' '}
          <a
            href="mailto:support@syntheonhub.com"
            style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
          >
            support@syntheonhub.com
          </a>
        </p>
        <Link
          href={`${APP_URL}/sign-up`}
          style={{
            display: 'inline-block',
            fontSize: '16px',
            fontWeight: 600,
            color: '#000',
            background: '#fff',
            textDecoration: 'none',
            padding: '1rem 2.5rem',
            borderRadius: '6px',
          }}
        >
          Start Free
        </Link>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '3rem 5vw',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <BrandLogo size={24} />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Syntheon Hub
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link
            href="/"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link
            href="/pricing"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Pricing
          </Link>
          <Link
            href="/docs"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Docs
          </Link>
          <Link
            href="/how-it-works"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            How it works
          </Link>
          <Link
            href="/legal"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Legal
          </Link>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>2026 Syntheon Hub.</p>
      </footer>
    </div>
  );
}
