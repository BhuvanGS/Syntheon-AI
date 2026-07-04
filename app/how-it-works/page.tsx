'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const APP_URL = 'https://app.syntheonhub.com';

export default function HowItWorksPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const steps = [
    {
      number: '01',
      title: 'Connect your calendar',
      desc: 'Sign up and connect your Google Calendar, Outlook, or manual meeting links. Syntheon Hub detects upcoming meetings automatically.',
      detail: [
        'Works with Google Meet, Zoom, and Microsoft Teams',
        'No extension required — everything runs in the browser',
        'Set up in under 2 minutes',
      ],
    },
    {
      number: '02',
      title: 'Syntheon Hub joins the meeting',
      desc: 'When the meeting starts, Syntheon Hub joins as a participant. It records, transcribes, and listens for decisions, action items, and blockers.',
      detail: [
        'Bot appears as "Syntheon Hub" in the call',
        'All participants should be informed the meeting is being recorded',
        'Bot leaves automatically when the meeting ends',
      ],
    },
    {
      number: '03',
      title: 'Tickets are extracted automatically',
      desc: 'Within 2 minutes of the meeting ending, your dashboard shows every discussion point as a structured ticket — with title, description, priority, and labels.',
      detail: [
        'AI identifies action items, insights, and decisions',
        'Each ticket gets a priority, type, and estimate',
        'Confidence score shows how clearly it was discussed',
        'Edit or reject any ticket before it hits the board',
      ],
    },
    {
      number: '04',
      title: 'Board updates automatically',
      desc: 'Tickets land on your Kanban board in the right columns. Dependencies are inferred and mapped. No manual dragging required.',
      detail: [
        'Tickets placed in Backlog, In Progress, Blocked, or Done',
        'Hard and soft dependencies mapped automatically',
        'Labels and assignees suggested from context',
        'Everything editable — you stay in control',
      ],
    },
    {
      number: '05',
      title: 'Track sprints and velocity',
      desc: 'Watch burndown charts, cycle times, and milestone progress update in real time as your team moves tickets across the board.',
      detail: [
        'Burndown charts generated automatically',
        'Cycle time and velocity tracked per sprint',
        'Milestone progress at a glance',
        'Dependency blockers surfaced before they stall work',
      ],
    },
    {
      number: '06',
      title: 'Repeat every meeting',
      desc: 'Every meeting feeds the same board. Tickets accumulate, dependencies update, and your project stays in sync — without a single manual update.',
      detail: [
        'Context carries forward between meetings',
        'Board stays current without manual work',
        'Meeting history tracked in your dashboard',
        'Your team always knows what to work on next',
      ],
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
      <section style={{ paddingTop: '140px', textAlign: 'center', padding: '140px 5vw 80px' }}>
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
          How it works
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
          From meeting to organized work.
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          Six steps. Zero manual ticket writing. Here&apos;s how Syntheon Hub turns every meeting
          into structured, trackable work.
        </p>
      </section>

      {/* Steps */}
      <section style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 5vw 120px' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{ display: 'flex', gap: '2rem', marginBottom: '4rem', alignItems: 'flex-start' }}
          >
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {step.number}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: '1px',
                    height: '80px',
                    background: 'rgba(255,255,255,0.08)',
                    margin: '8px auto',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: '#fff',
                  letterSpacing: '-0.02em',
                }}
              >
                {step.title}
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.7,
                  marginBottom: '1.25rem',
                }}
              >
                {step.desc}
              </p>
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                {step.detail.map((d, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: j < step.detail.length - 1 ? '0.6rem' : 0,
                    }}
                  >
                    <span
                      style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', flexShrink: 0 }}
                    >
                      —
                    </span>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '80px 5vw',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '1rem',
            letterSpacing: '-0.03em',
          }}
        >
          Stop writing tickets.
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem' }}>
          Let Syntheon Hub do it after every meeting.
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
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
