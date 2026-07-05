'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const APP_URL = 'https://app.syntheonhub.com';

export default function FAQPage() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<number | null>(0);
  useEffect(() => setMounted(true), []);

  const faqs = [
    {
      q: 'What is Syntheon Hub?',
      a: 'Syntheon Hub is an AI project manager that joins your meetings, transcribes them, and automatically extracts structured tickets with titles, descriptions, priorities, and labels. It organizes everything onto a Kanban board and maps dependencies — so your team never has to write tickets manually.',
    },
    {
      q: 'What platforms does Syntheon Hub support?',
      a: 'Syntheon Hub works with Google Meet, Zoom, and Microsoft Teams. The bot joins as a participant, records the meeting, and leaves automatically when it ends. No browser extension or installation required.',
    },
    {
      q: 'What counts as a meeting?',
      a: 'A meeting is any call where the Syntheon Hub bot joins and transcribes. Whether it is 5 minutes or 2 hours, it counts as one meeting against your monthly limit.',
    },
    {
      q: 'How does AI ticket extraction work?',
      a: 'After each meeting, Syntheon Hub analyzes the transcript using AI to identify action items, decisions, insights, and blockers. Each becomes a structured ticket with a title, description, priority, type, and estimate. Dependencies between tickets are also mapped automatically.',
    },
    {
      q: 'Do I need any extensions or integrations?',
      a: 'No. Syntheon Hub works entirely in the browser. Just sign up, start a meeting, and the bot joins your call automatically. No Chrome extension, no GitHub connection, no Linear setup — everything is self-contained.',
    },
    {
      q: 'Can I edit the tickets after extraction?',
      a: 'Absolutely. Every ticket is fully editable — title, description, priority, type, estimate, labels, assignee, and column. You stay in complete control. You can also reject tickets before they hit the board.',
    },
    {
      q: 'What is the dependency graph?',
      a: 'The dependency graph visualizes hard and soft blockers between tickets. Syntheon Hub automatically infers dependencies from meeting context, so you know what must ship first before work gets stuck.',
    },
    {
      q: 'What happens if I exceed my meeting limit?',
      a: 'We will notify you when you reach 80% of your limit. Once exceeded, the bot feature pauses until your next billing cycle. You can upgrade anytime to continue.',
    },
    {
      q: 'Is there a free trial?',
      a: 'Yes. Every plan starts with a 7-day free trial. No credit card required to start. If you are not satisfied within 7 days and have processed fewer than 2 meetings, we offer a full refund.',
    },
    {
      q: 'Can I change plans anytime?',
      a: 'Yes. Upgrades take effect immediately (pro-rated). Downgrades take effect at the next billing cycle.',
    },
    {
      q: 'Do you offer annual pricing?',
      a: 'Annual plans with a 20% discount are coming soon. Contact us at support@syntheonhub.com to discuss early access.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay. All prices are in INR inclusive of GST.',
    },
    {
      q: 'Is my meeting data secure?',
      a: 'Audio files are deleted immediately after transcription. We never store raw audio. Transcripts are encrypted at rest and can be deleted by you at any time. We do not read your transcripts manually or use them to train AI models.',
    },
    {
      q: 'Do I need consent from meeting participants?',
      a: 'Yes. You are solely responsible for obtaining consent from all meeting participants before using the Syntheon Hub bot. Recording laws vary by jurisdiction. The bot appears as "Syntheon Hub" in the call, making it clear to everyone that the meeting is being recorded.',
    },
    {
      q: 'Can I use Syntheon Hub for multiple projects?',
      a: 'Yes. Depending on your plan, you can have 1, 5, or unlimited projects. Each project has its own Kanban board, tickets, dependencies, and sprint tracking.',
    },
    {
      q: 'What is sprint tracking?',
      a: 'Sprint tracking shows burndown charts, cycle time, velocity, and milestone progress. Everything updates automatically as your team moves tickets across the board — no manual reporting required.',
    },
  ];

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
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
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
          <img
            src="/syntheon-logo.png"
            alt="Syntheon Hub"
            width={28}
            height={28}
            style={{ borderRadius: '6px', objectFit: 'cover' }}
          />
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
          <img
            src="/syntheon-logo.png"
            alt="Syntheon Hub"
            width={24}
            height={24}
            style={{ borderRadius: '4px' }}
          />
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
