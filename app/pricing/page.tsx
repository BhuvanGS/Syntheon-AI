'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const APP_URL = 'https://app.syntheonhub.com';

export default function PricingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const plans = [
    {
      name: 'Starter',
      price: '999',
      desc: 'Perfect for solo founders and small teams getting started.',
      features: [
        '5 meetings per month',
        'AI ticket extraction',
        'Kanban board with priorities & labels',
        'Dependency graph',
        '1 project',
        'Email support',
      ],
      cta: 'Start free trial',
      popular: false,
    },
    {
      name: 'Growth',
      price: '2,999',
      desc: 'For growing teams shipping features every week.',
      features: [
        '25 meetings per month',
        'AI ticket extraction',
        'Kanban board with priorities & labels',
        'Dependency graph',
        '5 projects',
        'Sprint tracking & burndown charts',
        'Priority email support',
        'Usage analytics',
      ],
      cta: 'Start free trial',
      popular: true,
    },
    {
      name: 'Team',
      price: '7,999',
      desc: 'Unlimited everything for serious engineering teams.',
      features: [
        'Unlimited meetings',
        'AI ticket extraction',
        'Kanban board with priorities & labels',
        'Dependency graph',
        'Unlimited projects',
        'Sprint tracking & burndown charts',
        'Dedicated support',
        'Usage analytics',
        'Custom bot name',
        'Early access to new features',
      ],
      cta: 'Start free trial',
      popular: false,
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
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
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
                href="/how-it-works"
                style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                How it works
              </Link>
              <Link
                href="/legal"
                style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                Legal
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
          Pricing
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
          Simple, honest pricing.
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '500px',
            margin: '0 auto 0.75rem',
          }}
        >
          All prices in INR. GST applicable. 7-day free trial on all plans.
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          No credit card required to start.
        </p>
      </section>

      {/* Plans */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 5vw 80px' }}>
        <div className="pricing-grid" style={{ alignItems: 'stretch' }}>
          {plans.map((plan, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: plan.popular
                  ? '1px solid rgba(255,255,255,0.2)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 16px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.05em',
                  }}
                >
                  Most popular
                </div>
              )}
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                {plan.name}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>₹</span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '3rem',
                    fontWeight: 700,
                    color: '#fff',
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>/month</span>
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: '1.5rem',
                  lineHeight: 1.6,
                }}
              >
                {plan.desc}
              </p>
              <Link
                href={`${APP_URL}/sign-up`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: plan.popular ? '#fff' : 'transparent',
                  color: plan.popular ? '#000' : 'rgba(255,255,255,0.7)',
                  border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  marginBottom: '1.5rem',
                }}
              >
                {plan.cta}
              </Link>
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '1.5rem',
                  flex: 1,
                }}
              >
                {plan.features.map((f, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span
                      style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', flexShrink: 0 }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 5vw 80px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Enterprise
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '1.5rem',
              lineHeight: 1.7,
              maxWidth: '500px',
              margin: '0 auto 1.5rem',
            }}
          >
            Custom deployment, SSO, dedicated support, SLA guarantees, and volume pricing for large
            engineering teams.
          </p>
          <a
            href="mailto:sales@syntheonhub.com"
            style={{
              display: 'inline-block',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Contact sales
          </a>
        </div>
      </section>

      {/* FAQ link */}
      <section
        style={{ maxWidth: '700px', margin: '0 auto', padding: '0 5vw 100px', textAlign: 'center' }}
      >
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
          Have questions?
        </p>
        <Link
          href="/faq"
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.3)',
            paddingBottom: '2px',
          }}
        >
          Read the FAQ →
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
            href="/how-it-works"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            How it works
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
