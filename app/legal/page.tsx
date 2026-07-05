'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';

const APP_URL = 'https://app.syntheonhub.com';

export default function LegalPage() {
  const [active, setActive] = useState('privacy');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hash = window.location.hash.replace('#', '');
    if (hash) setActive(hash);
  }, []);

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'dpa', label: 'DPA' },
    { id: 'refund', label: 'Refund Policy' },
  ];

  const s = () => ({
    h1: {
      fontFamily: "'Space Grotesk', sans-serif" as const,
      fontSize: '1.75rem',
      fontWeight: 700,
      color: '#fff',
      marginBottom: '0.5rem',
      marginTop: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: "'Space Grotesk', sans-serif" as const,
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'rgba(255,255,255,0.85)',
      marginBottom: '0.5rem',
      marginTop: '2rem',
      letterSpacing: '-0.01em',
    },
    p: {
      fontSize: '15px',
      color: 'rgba(255,255,255,0.5)',
      lineHeight: 1.8,
      marginBottom: '1rem',
    },
    li: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.5)',
      lineHeight: 1.8,
      marginBottom: '0.4rem',
    },
  });

  const Privacy = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: March 2026
      </p>

      <h2 style={s().h1}>Privacy Policy</h2>
      <p style={s().p}>
        Syntheon Hub operates syntheonhub.com. This policy explains how we collect, use, and protect
        your personal data in accordance with the Digital Personal Data Protection Act 2023 (DPDP
        Act) and the Information Technology Act 2000.
      </p>

      <h2 style={s().h2}>Data we collect</h2>
      <p style={s().p}>
        <strong>Account data</strong> — name, email, profile picture collected via Clerk
        authentication.
      </p>
      <p style={s().p}>
        <strong>Meeting data</strong> — audio processed in real-time and deleted immediately after
        transcription. Transcripts stored encrypted and deleted when you choose.
      </p>
      <p style={s().p}>
        <strong>Integration data</strong> — calendar and meeting platform tokens stored with AES-256
        encryption. Never stored in plain text.
      </p>
      <p style={s().p}>
        <strong>Usage data</strong> — features used, meetings processed, tickets created. Used for
        billing limits and product improvement.
      </p>

      <h2 style={s().h2}>Meeting audio and transcripts</h2>
      <p style={s().p}>
        Audio files are deleted immediately after transcription. We never store raw audio.
        Transcripts are stored only as long as necessary for product functionality and can be
        deleted by you at any time. We do not read your transcripts manually, use them to train AI
        models, or share them with other users.
      </p>

      <h2 style={s().h2}>Third-party services</h2>
      <p style={s().p}>
        Skribby (transcription), Groq (AI), Clerk (auth), Supabase (database, Mumbai region), Vercel
        (hosting), Razorpay (payments). All have data processing agreements with us.
      </p>

      <h2 style={s().h2}>Your rights under DPDP Act 2023</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Access — request your data at privacy@syntheonhub.com',
          'Correction — update via Settings',
          'Erasure — delete account and all data via Settings',
          'Withdraw consent — disconnect integrations anytime',
          'Grievance — contact privacy@syntheonhub.com, 72hr response',
        ].map((r, i) => (
          <li key={i} style={s().li}>
            {r}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>Contact</h2>
      <p style={s().p}>
        Data Protection Officer:{' '}
        <a href="mailto:privacy@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.3)' }}>
          privacy@syntheonhub.com
        </a>
      </p>
    </div>
  );

  const Terms = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: March 2026
      </p>

      <h2 style={s().h1}>Terms of Service</h2>
      <p style={s().p}>
        By using Syntheon Hub you agree to these Terms. If you do not agree, do not use the service.
      </p>

      <h2 style={s().h2}>Eligibility</h2>
      <p style={s().p}>
        You must be 18 or older and capable of entering a binding legal agreement.
      </p>

      <h2 style={s().h2}>Subscription and payment</h2>
      <p style={s().p}>
        Plans are billed monthly in INR via Razorpay. Subscriptions auto-renew. You will be notified
        3 days before renewal. Exceeding usage limits pauses the relevant feature until the next
        billing cycle.
      </p>

      <h2 style={s().h2}>Acceptable use</h2>
      <p style={s().p}>
        You may use Syntheon Hub to record and process your own business meetings, extract tickets
        automatically, and organize projects in workspaces you own.
      </p>
      <p style={s().p}>
        You may not record meetings without participant consent, circumvent usage limits, or use the
        service for any illegal purpose under Indian law.
      </p>

      <h2 style={s().h2}>Meeting recording consent</h2>
      <p style={s().p}>
        You are solely responsible for obtaining consent from all meeting participants before using
        the Syntheon Hub bot. Recording laws vary by jurisdiction. By using Syntheon Hub, you
        represent and warrant that you have obtained all necessary consents from meeting
        participants. Syntheon Hub is not liable for your failure to obtain proper consent.
      </p>

      <h2 style={s().h2}>AI-generated content disclaimer</h2>
      <p style={s().p}>
        AI-extracted tickets may contain inaccuracies. You are solely responsible for reviewing all
        extracted tickets before acting on them. Syntheon Hub does not guarantee the accuracy or
        fitness of AI-generated content.
      </p>

      <h2 style={s().h2}>Intellectual property</h2>
      <p style={s().p}>
        You retain full ownership of your meeting transcripts, tickets, and all project data.
        Syntheon Hub claims no ownership over content you create using the platform.
      </p>

      <h2 style={s().h2}>Limitation of liability</h2>
      <p style={s().p}>
        Syntheon Hub's total liability shall not exceed the amount paid in the 3 months preceding
        the claim. We are not liable for indirect, incidental, or consequential damages.
      </p>

      <h2 style={s().h2}>Governing law</h2>
      <p style={s().p}>
        These Terms are governed by the laws of India. Disputes are subject to the exclusive
        jurisdiction of courts in Bengaluru, Karnataka.
      </p>

      <h2 style={s().h2}>Contact</h2>
      <p style={s().p}>
        <a href="mailto:legal@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.3)' }}>
          legal@syntheonhub.com
        </a>
      </p>
    </div>
  );

  const DPA = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: March 2026
      </p>

      <h2 style={s().h1}>Data Processing Agreement</h2>
      <p style={s().p}>
        This DPA governs the processing of personal data by Syntheon Hub ("Data Fiduciary") in
        accordance with the Digital Personal Data Protection Act 2023 and applicable Indian law.
      </p>

      <h2 style={s().h2}>Definitions</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Personal Data — any information relating to an identified or identifiable individual',
          'Data Principal — the individual whose personal data is processed (meeting participants)',
          'Data Fiduciary — Syntheon Hub, which determines the purpose and means of processing personal data',
          'Sub-processor — third-party services engaged by Syntheon Hub to process data on its behalf',
        ].map((d, i) => (
          <li key={i} style={s().li}>
            {d}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>Sub-processors</h2>
      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Service', 'Location', 'Purpose'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    color: 'rgba(255,255,255,0.4)',
                    fontWeight: 500,
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Skribby', 'EU', 'Meeting transcription'],
              ['Groq', 'USA', 'AI processing'],
              ['Supabase', 'India (Mumbai)', 'Data storage'],
              ['Vercel', 'USA', 'Hosting'],
              ['Clerk', 'USA', 'Authentication'],
              ['Razorpay', 'India', 'Payments'],
            ].map(([s, l, p], i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td
                  style={{
                    padding: '8px 12px',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500,
                  }}
                >
                  {s}
                </td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.5)' }}>{l}</td>
                <td style={{ padding: '8px 12px', color: 'rgba(255,255,255,0.5)' }}>{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={s().h2}>Security measures</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'AES-256 encryption for OAuth tokens at rest',
          'TLS 1.3 for all data in transit',
          'Row-level security in Supabase',
          'No plain-text credential storage',
          'Access logs retained for 90 days',
        ].map((m, i) => (
          <li key={i} style={s().li}>
            {m}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>Data breach notification</h2>
      <p style={s().p}>
        In the event of a personal data breach, Syntheon Hub will notify affected users within 72
        hours and report to the Data Protection Board of India as required.
      </p>

      <h2 style={s().h2}>Contact</h2>
      <p style={s().p}>
        Data Protection Officer:{' '}
        <a href="mailto:privacy@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.3)' }}>
          privacy@syntheonhub.com
        </a>
      </p>
    </div>
  );

  const Refund = () => (
    <div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
        Last updated: March 2026
      </p>

      <h2 style={s().h1}>Refund Policy</h2>
      <p style={s().p}>We want you to be completely satisfied with Syntheon Hub.</p>

      <h2 style={s().h2}>7-day money back guarantee</h2>
      <p style={s().p}>
        You are eligible for a full refund if you request it within 7 days of your first payment and
        have processed fewer than 2 meetings. No questions asked.
      </p>

      <h2 style={s().h2}>Service outage refund</h2>
      <p style={s().p}>
        If Syntheon Hub is unavailable for more than 24 continuous hours due to our infrastructure
        (not third-party services), you are eligible for a pro-rated refund for those days.
      </p>

      <h2 style={s().h2}>Non-refundable situations</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        {[
          'Dissatisfaction with AI-extracted ticket quality',
          'Third-party service issues (Skribby, Groq, Clerk)',
          'Your calendar or meeting platform misconfiguration',
          'Unused meetings in a billing period',
          'Cancellation mid-month',
          'Accounts terminated for Terms violations',
        ].map((r, i) => (
          <li key={i} style={s().li}>
            {r}
          </li>
        ))}
      </ul>

      <h2 style={s().h2}>How to request</h2>
      <p style={s().p}>
        Email{' '}
        <a href="mailto:refunds@syntheonhub.com" style={{ color: 'rgba(255,255,255,0.3)' }}>
          refunds@syntheonhub.com
        </a>{' '}
        from your registered email with your reason. We respond within 2 business days. Eligible
        refunds are processed within 5-7 business days to your original payment method via Razorpay.
      </p>

      <h2 style={s().h2}>Cancellation</h2>
      <p style={s().p}>
        Cancel anytime from Settings → Billing. Access continues until the end of your current
        billing period. No refund for remaining days unless covered above.
      </p>
    </div>
  );

  const content: Record<string, ReactNode> = {
    privacy: <Privacy />,
    terms: <Terms />,
    dpa: <DPA />,
    refund: <Refund />,
  };

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

      <div
        style={{
          paddingTop: '80px',
          maxWidth: '860px',
          margin: '0 auto',
          padding: '100px 5vw 100px',
          display: 'grid',
          gridTemplateColumns: '200px 1fr',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Legal documents
          </p>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActive(tab.id);
                window.history.replaceState(null, '', `#${tab.id}`);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: active === tab.id ? 'rgba(255,255,255,0.05)' : 'none',
                border: 'none',
                borderLeft:
                  active === tab.id ? '3px solid rgba(255,255,255,0.4)' : '3px solid transparent',
                padding: '10px 16px',
                fontSize: '14px',
                color: active === tab.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontWeight: active === tab.id ? 500 : 300,
                borderRadius: '0 6px 6px 0',
                marginBottom: '4px',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '2.5rem',
          }}
        >
          {content[active]}
        </div>
      </div>

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
            href="/faq"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            FAQ
          </Link>
          <Link
            href="/how-it-works"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            How it works
          </Link>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          2026 Syntheon Hub. Governed by Indian law.
        </p>
      </footer>
    </div>
  );
}
