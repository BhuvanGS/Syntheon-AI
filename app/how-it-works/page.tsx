'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('syntheon-theme');
    if (stored === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('syntheon-theme', next ? 'dark' : 'light');
  }

  const steps = [
    {
      number: '01',
      title: 'Install the Chrome extension',
      desc: 'Download the Syntheon extension from the Chrome Web Store. Connect your GitHub and Linear accounts in the settings. Takes less than 2 minutes.',
      detail: [
        'Available for Chrome and Chromium browsers',
        'Connect GitHub via OAuth — no PATs stored',
        'Connect Linear via OAuth',
        'Choose your target repository',
      ],
    },
    {
      number: '02',
      title: 'Open a meeting and send the bot',
      desc: 'Join any Google Meet, Zoom, or Microsoft Teams call. Click the Syntheon extension icon and hit "Send Bot to Meeting". The bot joins as a participant.',
      detail: [
        'Supports Google Meet, Zoom, and Teams',
        'Bot appears as "Syntheon AI" in the call',
        'All participants should be informed the meeting is being recorded',
        'Bot leaves automatically when meeting ends',
      ],
    },
    {
      number: '03',
      title: 'Review your spec blocks',
      desc: 'Within 2 minutes of the meeting ending, your dashboard shows every idea, feature, and constraint discussed as structured spec blocks.',
      detail: [
        'Each spec has a type: feature, idea, constraint, or improvement',
        'Confidence score shows how clearly it was discussed',
        'Add notes to guide the AI code generation',
        'Reject specs you do not want built',
      ],
    },
    {
      number: '04',
      title: 'Approve and ship',
      desc: 'Select the specs you want implemented. Click "Approve and Ship". Review the AI-generated plan, then execute it. A GitHub PR and Linear tickets are created automatically.',
      detail: [
        'AI generates a full development plan',
        'Linear parent ticket and subtasks created',
        'GitHub branch and pull request opened',
        'Code committed — ready for your review',
      ],
    },
    {
      number: '05',
      title: 'Merge and see it live',
      desc: 'Review the generated code on GitHub. Merge the PR. GitHub Actions deploys the application automatically. The live preview appears in your Syntheon dashboard.',
      detail: [
        'Always review AI-generated code before merging',
        'GitHub Actions handles deployment',
        'Live preview embedded in dashboard',
        'Deploy URL is permanent and unique per project',
      ],
    },
    {
      number: '06',
      title: 'Continue with MCT',
      desc: 'When the project needs more work, click "Continue Meeting" to send the bot to a follow-up call. It joins with full context of everything built so far.',
      detail: [
        'Bot knows all previous specs and files',
        'Generates only the precise changes needed',
        'Never rewrites working code unnecessarily',
        'Meeting chain tracked in your dashboard',
      ],
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: dark ? '#000000' : '#ffffff',
        color: dark ? '#fafafa' : '#0a0a0a',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'background 0.3s',
      }}
    >
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: `1px solid ${dark ? '#1f1f1f' : '#e5e5e5'}`,
          background: dark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          padding: '0 2rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          <img
            src="/logo.png"
            alt="Syntheon"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '18px',
              color: dark ? '#d4d4d4' : '#000000',
            }}
          >
            Syntheon
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            href="/pricing"
            style={{
              fontSize: '14px',
              color: dark ? '#a3a3a3' : '#525252',
              textDecoration: 'none',
            }}
          >
            Pricing
          </Link>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: `1px solid ${dark ? '#000000' : '#d4d4d4'}`,
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              color: dark ? '#a3a3a3' : '#525252',
            }}
          >
            {dark ? '☀ Light' : '☽ Dark'}
          </button>
          <Link
            href="/dashboard"
            style={{
              background: '#000000',
              color: '#f5f5f5',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            Open App
          </Link>
        </div>
      </nav>

      <section style={{ paddingTop: '120px', textAlign: 'center', padding: '120px 2rem 60px' }}>
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '400',
            marginBottom: '1rem',
            color: dark ? '#f5f5f5' : '#0a0a0a',
          }}
        >
          How Syntheon works
        </h1>
        <p
          style={{
            fontSize: '1.1rem',
            color: dark ? '#737373' : '#737373',
            fontWeight: '300',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          From your first meeting to deployed software in six steps.
        </p>
      </section>

      <section style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 2rem 100px' }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '3.5rem',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: dark ? '#1f1f1f' : '#f5f5f5',
                  border: `2px solid ${dark ? '#000000' : '#d4d4d4'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '14px',
                    color: '#525252',
                    fontWeight: '400',
                  }}
                >
                  {step.number}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: '2px',
                    height: '60px',
                    background: dark ? '#1f1f1f' : '#e5e5e5',
                    margin: '8px auto',
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: '1.5rem',
                  fontWeight: '400',
                  marginBottom: '0.75rem',
                  color: dark ? '#f5f5f5' : '#0a0a0a',
                }}
              >
                {step.title}
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: dark ? '#737373' : '#737373',
                  fontWeight: '300',
                  lineHeight: '1.7',
                  marginBottom: '1rem',
                }}
              >
                {step.desc}
              </p>
              <div
                style={{
                  background: dark ? '#0a0a0a' : '#ffffff',
                  border: `1px solid ${dark ? '#1f1f1f' : '#e5e5e5'}`,
                  borderRadius: '10px',
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
                    <span style={{ color: '#525252', fontSize: '14px', flexShrink: 0 }}>◎</span>
                    <span
                      style={{
                        fontSize: '13px',
                        color: dark ? '#a3a3a3' : '#737373',
                        fontWeight: '300',
                      }}
                    >
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section style={{ background: '#000000', padding: '60px 2rem', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '2rem',
            fontWeight: '400',
            color: '#f5f5f5',
            marginBottom: '1rem',
          }}
        >
          Ready to try it?
        </h2>
        <Link
          href="/dashboard"
          style={{
            background: '#f5f5f5',
            color: '#000000',
            padding: '14px 36px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Start free — no credit card
        </Link>
      </section>

      <footer
        style={{
          borderTop: `1px solid ${dark ? '#1f1f1f' : '#e5e5e5'}`,
          padding: '2rem',
          textAlign: 'center',
          background: dark ? '#000000' : '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: '14px',
              color: dark ? '#525252' : '#a3a3a3',
              textDecoration: 'none',
            }}
          >
            Home
          </Link>
          <Link
            href="/pricing"
            style={{
              fontSize: '14px',
              color: dark ? '#525252' : '#a3a3a3',
              textDecoration: 'none',
            }}
          >
            Pricing
          </Link>
          <Link
            href="/legal"
            style={{
              fontSize: '14px',
              color: dark ? '#525252' : '#a3a3a3',
              textDecoration: 'none',
            }}
          >
            Legal
          </Link>
        </div>
        <p style={{ fontSize: '12px', color: dark ? '#404040' : '#a3a3a3' }}>
          2026 Syntheon AI. Bengaluru, India.
        </p>
      </footer>
    </div>
  );
}
