'use client';

import { BrandLogo } from '@/components/brand-logo';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

const APP_URL = 'https://app.syntheonhub.com';

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:support@syntheonhub.com?subject=${encodeURIComponent(
      form.subject || 'Syntheon Hub Support'
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

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
        .contact-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 12px 16px;
          color: #fff;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .contact-input:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }
        .contact-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .contact-label {
          display: block;
          fontsize: 13px;
          fontweight: 500;
          color: rgba(255, 255, 255, 0.5);
          marginbottom: 0.5rem;
          letterspacing: 0.02em;
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
      <section style={{ paddingTop: '140px', textAlign: 'center', padding: '140px 5vw 40px' }}>
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
          Contact
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
          Get in touch.
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          Questions, feedback, or just want to say hi? We usually respond within 24 hours.
        </p>
      </section>

      {/* Contact grid */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 5vw 80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <motion.a
            href="mailto:support@syntheonhub.com"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '2rem',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              General Support
            </p>
            <p
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#fff',
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: '0.5rem',
              }}
            >
              support@syntheonhub.com
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Billing, account issues, bug reports, and general questions.
            </p>
          </motion.a>

          <motion.a
            href="mailto:privacy@syntheonhub.com"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '2rem',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              Privacy & Data
            </p>
            <p
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#fff',
                fontFamily: "'Space Grotesk', sans-serif",
                marginBottom: '0.5rem',
              }}
            >
              privacy@syntheonhub.com
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Data requests, deletion, DPDP Act grievances. 72hr response.
            </p>
          </motion.a>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '2.5rem',
          }}
        >
          {sent ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '0.75rem',
                }}
              >
                Your email client should be open.
              </p>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>
                If not, email us directly at{' '}
                <a
                  href="mailto:support@syntheonhub.com"
                  style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
                >
                  support@syntheonhub.com
                </a>
              </p>
              <button
                onClick={() => setSent(false)}
                style={{
                  marginTop: '1.5rem',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '0.5rem 1.25rem',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label className="contact-label">Name</label>
                  <input
                    className="contact-input"
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="contact-label">Email</label>
                  <input
                    className="contact-input"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="contact-label">Subject</label>
                <input
                  className="contact-input"
                  type="text"
                  required
                  placeholder="What's this about?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="contact-label">Message</label>
                <textarea
                  className="contact-input"
                  required
                  rows={5}
                  placeholder="Tell us more..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ resize: 'vertical', minHeight: '120px' }}
                />
              </div>
              <button
                type="submit"
                style={{
                  justifySelf: 'start',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#000',
                  background: '#fff',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Send Message
              </button>
            </form>
          )}
        </motion.div>
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
