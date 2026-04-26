'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Sparkles,
  GitBranch,
  Layers,
  Zap,
  BookOpen,
  CreditCard,
  Scale,
  ArrowUpRight,
} from 'lucide-react';

// React Bits components (JS — inferred prop types are loose, cast to any)
import OrbRaw from '@/components/Orb';
import MagicRingsRaw from '@/components/MagicRings';
import AntigravityRaw from '@/components/Antigravity';
import LogoLoopRaw from '@/components/LogoLoop';
import GlassIconsRaw from '@/components/GlassIcons';
import VerticalDockRaw from '@/components/VerticalDock';
import DecryptedTextRaw from '@/components/DecryptedText';

const Orb = OrbRaw as any;
const MagicRings = MagicRingsRaw as any;
const Antigravity = AntigravityRaw as any;
const LogoLoop = LogoLoopRaw as any;
const GlassIcons = GlassIconsRaw as any;
const VerticalDock = VerticalDockRaw as any;
const DecryptedText = DecryptedTextRaw as any;

// ─── Theme tokens (monochrome — black & white only) ──────────────
const C = {
  ink: '#000000', // pure black
  inkSoft: '#0d0d0d',
  cream: '#ffffff',
  creamWarm: '#fafafa',
  matcha: '#000000', // primary == black
  matchaMid: '#525252',
  matchaLight: '#a3a3a3',
  mint: '#e5e5e5',
  beige: '#e5e5e5',
  text: '#0a0a0a',
  muted: '#737373',
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Tech stack for LogoLoop (text nodes — clean & monochrome)
  const techLogos = [
    { node: <TechBadge label="Next.js" /> },
    { node: <TechBadge label="Supabase" /> },
    { node: <TechBadge label="Clerk" /> },
    { node: <TechBadge label="OpenAI" /> },
    { node: <TechBadge label="GitHub" /> },
    { node: <TechBadge label="Vercel" /> },
    { node: <TechBadge label="Three.js" /> },
    { node: <TechBadge label="Tiptap" /> },
    { node: <TechBadge label="shadcn/ui" /> },
    { node: <TechBadge label="TailwindCSS" /> },
  ];

  // GlassIcons feature row
  const glassItems = [
    { icon: <Bot size={22} />, color: 'green', label: 'Bot joins' },
    { icon: <Sparkles size={22} />, color: 'green', label: 'Specs extracted' },
    { icon: <GitBranch size={22} />, color: 'green', label: 'PR opened' },
    { icon: <Layers size={22} />, color: 'green', label: 'MCT context' },
    { icon: <Zap size={22} />, color: 'green', label: 'Live preview' },
  ];

  // Side Dock — vertical
  const dockItems = [
    {
      icon: <BookOpen size={20} color={C.cream} />,
      label: 'How it works',
      onClick: () => (window.location.href = '/how-it-works'),
    },
    {
      icon: <CreditCard size={20} color={C.cream} />,
      label: 'Pricing',
      onClick: () => (window.location.href = '/pricing'),
    },
    {
      icon: <Scale size={20} color={C.cream} />,
      label: 'Legal',
      onClick: () => (window.location.href = '/legal'),
    },
    {
      icon: <ArrowUpRight size={20} color={C.cream} />,
      label: 'Open App',
      onClick: () => (window.location.href = '/dashboard'),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.cream,
        color: C.text,
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        html {
          scroll-behavior: smooth;
        }

        /* Fix GlassIcons for monochrome theme — horizontal row, always-visible labels, glass look */
        .syntheon-glass .icon-btns {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 2.5rem;
          grid-gap: 0;
          padding: 1rem 0 3rem;
          grid-template-columns: none;
        }
        .syntheon-glass .icon-btn {
          width: 5.5em;
          height: 5.5em;
        }
        .syntheon-glass .icon-btn__back {
          background: linear-gradient(135deg, #2a2a2a, #000000) !important;
          box-shadow: 0.4em -0.4em 1em rgba(0, 0, 0, 0.22);
        }
        .syntheon-glass .icon-btn__front {
          background: rgba(255, 255, 255, 0.4) !important;
          box-shadow:
            0 0 0 0.08em rgba(255, 255, 255, 0.6) inset,
            0 8px 24px rgba(0, 0, 0, 0.12);
          color: #ffffff;
        }
        .syntheon-glass .icon-btn__icon {
          color: #ffffff;
          width: 1.75em;
          height: 1.75em;
        }
        .syntheon-glass .icon-btn__label {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #5a5a52;
          opacity: 1 !important;
          transform: translateY(30%) !important;
          top: 100%;
        }
        .syntheon-glass .icon-btn:hover .icon-btn__label {
          color: #000000;
        }

        /* Smooth section reveal */
        .reveal-section {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 0.8s ease-out,
            transform 0.8s ease-out;
        }
        .reveal-section.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes recPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>

      {/* ─── HERO with Orb background + "Syntheon" centered ───────── */}
      <section
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: C.ink,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Orb — oversized to fill & extend past hero */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(115vmin, 1200px)',
            height: 'min(115vmin, 1200px)',
            opacity: 0.9,
          }}
        >
          {mounted && (
            <Orb hue={0} hoverIntensity={0.25} rotateOnHover={true} forceHoverState={false} />
          )}
        </div>

        {/* Subtle vignette overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 35%, rgba(15,20,16,0.6) 95%)',
            pointerEvents: 'none',
          }}
        />

        {/* Start free — top right, localized to hero */}
        <Link
          href="/dashboard"
          style={{
            position: 'absolute',
            top: '1.75rem',
            right: '1.75rem',
            zIndex: 5,
            background: C.cream,
            color: C.ink,
            padding: '11px 24px',
            borderRadius: '999px',
            fontSize: '14px',
            fontWeight: 500,
            textDecoration: 'none',
            letterSpacing: '0.01em',
            boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)')
          }
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'none')}
        >
          Start free →
        </Link>

        {/* Hero content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            maxWidth: '900px',
            padding: '0 2rem',
            pointerEvents: 'none',
          }}
        >
          <h1
            style={{
              fontFamily: "'Fraunces', 'DM Serif Display', serif",
              fontSize: 'clamp(4rem, 14vw, 11rem)',
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: C.cream,
              margin: 0,
              textShadow: '0 8px 60px rgba(255,255,255,0.18)',
            }}
          >
            Syntheon
          </h1>

          <p
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              color: C.matchaLight,
              marginTop: '1.5rem',
              marginBottom: '2.5rem',
              letterSpacing: '0.01em',
            }}
          >
            Conversations, compiled into software.
          </p>
        </div>

        {/* scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            color: C.matchaLight,
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.6,
          }}
        >
          ↓ scroll
        </div>
      </section>

      {/* ─── Smooth transition from ink → cream ───────────────────── */}
      <div
        aria-hidden
        style={{
          height: '200px',
          background: `linear-gradient(180deg, ${C.ink} 0%, ${C.cream} 100%)`,
        }}
      />

      {/* ─── GlassIcons feature row ───────────────────────────────── */}
      <section
        className="syntheon-glass"
        style={{
          background: C.cream,
          padding: '2rem 2rem 7rem',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionLabel>Pipeline</SectionLabel>
          <h2 style={sectionH2}>Five steps. Zero tickets written.</h2>
          <p
            style={{
              fontSize: '1rem',
              color: C.muted,
              maxWidth: '560px',
              margin: '1.25rem auto 0',
              lineHeight: 1.7,
              fontWeight: 300,
              textAlign: 'center',
            }}
          >
            Every conversation — compiled, shipped, remembered.
          </p>
          <div
            style={{
              marginTop: '3rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <GlassIcons items={glassItems} />
          </div>
        </div>
      </section>

      {/* ─── Antigravity showcase ─────────────────────────────────── */}
      <section
        style={{
          background: C.inkSoft,
          color: C.cream,
          padding: '8rem 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '12px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: C.matchaLight,
                marginBottom: '1.5rem',
                fontWeight: 500,
              }}
            >
              Meeting Context Transfer
            </div>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '1.5rem',
              }}
            >
              Every conversation, <em style={{ color: C.matchaLight }}>remembered.</em>
            </h2>
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.8,
                color: 'rgba(250,248,244,0.7)',
                fontWeight: 300,
                marginBottom: '2rem',
              }}
            >
              Big projects span multiple meetings. Syntheon remembers everything — every spec
              discussed, every file built. Follow-up meetings generate only the precise changes
              needed, not a full rewrite.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                'Meeting 1 · Calculator',
                'Meeting 2 · Scientific mode',
                'Meeting 3 · Dark mode',
              ].map((s) => (
                <span
                  key={s}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid rgba(255,255,255,0.18)`,
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    color: C.matchaLight,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ height: '460px', position: 'relative' }}>
            {mounted && (
              <Antigravity
                count={280}
                magnetRadius={6}
                ringRadius={6}
                waveSpeed={0.4}
                waveAmplitude={1}
                particleSize={1.4}
                lerpSpeed={0.05}
                color={C.matchaLight}
                autoAnimate={true}
                particleVariance={1}
              />
            )}
          </div>
        </div>
      </section>

      {/* ─── MagicRings — recording animation showcase ────────────── */}
      <section
        style={{
          background: C.cream,
          padding: '8rem 2rem',
          textAlign: 'center',
        }}
      >
        <SectionLabel>Live capture</SectionLabel>
        <h2 style={sectionH2}>The bot is listening.</h2>
        <p
          style={{
            fontSize: '1.05rem',
            color: C.muted,
            maxWidth: '560px',
            margin: '1.25rem auto 3rem',
            lineHeight: 1.7,
            fontWeight: 300,
          }}
        >
          One click sends Syntheon into any Google Meet, Zoom, or Teams call. It transcribes,
          extracts intent, and structures everything in real-time.
        </p>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            height: 'min(780px, 80vh)',
            margin: '0 auto',
            borderRadius: '32px',
            overflow: 'hidden',
            background: C.ink,
            border: `1px solid ${C.beige}`,
            boxShadow: '0 40px 120px rgba(0,0,0,0.35)',
          }}
        >
          {mounted && (
            <MagicRings
              color={C.matchaLight}
              colorTwo={C.mint}
              ringCount={8}
              speed={0.85}
              baseRadius={0.42}
              radiusStep={0.11}
              ringGap={1.4}
              opacity={1}
              noiseAmount={0.07}
              lineThickness={2.2}
              attenuation={9}
            />
          )}
          {/* Center text — DecryptedText */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              padding: '0 2rem',
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Fraunces', serif",
                fontSize: 'clamp(1.2rem, 3.2vw, 2.4rem)',
                color: C.cream,
                fontWeight: 400,
                letterSpacing: '0.01em',
                textAlign: 'center',
                maxWidth: '900px',
                lineHeight: 1.3,
                textShadow: '0 6px 40px rgba(0,0,0,0.6)',
                pointerEvents: 'auto',
              }}
            >
              {mounted && <LoopingDecrypt />}
            </div>
          </div>
          {/* REC indicator badge */}
          <div
            style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15,20,16,0.6)',
              border: '1px solid rgba(220,38,38,0.4)',
              borderRadius: '999px',
              padding: '6px 14px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.18em',
              color: '#f5a5a5',
              textTransform: 'uppercase',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#dc2626',
                boxShadow: '0 0 8px #dc2626',
                animation: 'recPulse 1.4s infinite',
              }}
            />
            REC
          </div>
        </div>
      </section>

      {/* ─── LogoLoop tech stack ──────────────────────────────────── */}
      <section
        style={{
          background: C.creamWarm,
          padding: '5rem 0',
          borderTop: `1px solid ${C.beige}`,
          borderBottom: `1px solid ${C.beige}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', padding: '0 2rem' }}>
          <SectionLabel>Built on</SectionLabel>
        </div>
        <div style={{ height: '60px' }}>
          <LogoLoop
            logos={techLogos}
            speed={50}
            direction="left"
            logoHeight={32}
            gap={56}
            pauseOnHover={true}
            fadeOut={true}
            fadeOutColor={C.creamWarm}
            ariaLabel="Built with"
          />
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <section
        style={{
          background: C.cream,
          padding: '6rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2.5rem',
            textAlign: 'center',
          }}
        >
          {[
            { v: '< 2 min', l: 'meeting → specs' },
            { v: '0', l: 'tickets written by hand' },
            { v: '100%', l: 'ideas captured' },
            { v: '1 click', l: 'spec → deployed' },
          ].map((s) => (
            <div key={s.l}>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '3rem',
                  fontWeight: 300,
                  color: C.matcha,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '13px',
                  color: C.muted,
                  letterSpacing: '0.02em',
                  fontWeight: 400,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: C.matcha,
          padding: '6rem 2rem',
          textAlign: 'center',
          color: C.cream,
        }}
      >
        <h2
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}
        >
          Ready to stop writing tickets?
        </h2>
        <p style={{ color: C.matchaLight, marginBottom: '2rem', fontWeight: 300 }}>
          Start free. No credit card required.
        </p>
        <Link
          href="/dashboard"
          style={{
            background: C.cream,
            color: C.matcha,
            padding: '16px 40px',
            borderRadius: '999px',
            fontSize: '15px',
            fontWeight: 500,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Get started free →
        </Link>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer
        style={{
          background: C.ink,
          color: 'rgba(250,248,244,0.6)',
          padding: '4rem 2rem 8rem',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2.5rem',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '1.25rem',
                color: C.cream,
                marginBottom: '0.5rem',
                fontWeight: 400,
              }}
            >
              Syntheon
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Turns conversations into software. Bengaluru, India.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              { label: 'How it works', href: '/how-it-works' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Dashboard', href: '/dashboard' },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: 'Privacy', href: '/legal#privacy' },
              { label: 'Terms', href: '/legal#terms' },
              { label: 'Refund', href: '/legal#refund' },
              { label: 'DPA', href: '/legal#dpa' },
            ]}
          />
          <FooterCol
            title="Contact"
            links={[
              { label: 'support@syntheon.ai', href: 'mailto:support@syntheon.ai' },
              { label: 'privacy@syntheon.ai', href: 'mailto:privacy@syntheon.ai' },
            ]}
          />
        </div>
        <div
          style={{
            maxWidth: '1100px',
            margin: '3rem auto 0',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(250,248,244,0.08)',
            fontSize: '12px',
            color: 'rgba(250,248,244,0.4)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span>© 2026 Syntheon AI</span>
          <span>Governed by Indian law · Courts of Bengaluru</span>
        </div>
      </footer>

      {/* ─── Floating Vertical Dock (right side) ─────────────────── */}
      <div
        style={{
          position: 'fixed',
          right: '1.25rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          pointerEvents: 'auto',
          height: 'auto',
        }}
      >
        <VerticalDock
          items={dockItems}
          panelWidth={60}
          baseItemSize={44}
          magnification={60}
          distance={160}
        />
      </div>
    </div>
  );
}

// ─── Helper components ──────────────────────────────────────────────

// Looping decrypt: uses animateOn="click" + clickMode="toggle" and fires
// programmatic clicks on a timer. Toggle alternates forward (decrypt) and
// reverse (encrypt) animations — so it's truly bidirectional.
function LoopingDecrypt() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Sequence: scrambled → click (forward decrypt ~2.1s) → dwell ~1.5s →
    // click (reverse encrypt ~2.1s) → dwell ~1.5s → repeat.
    const tick = () => {
      const target = wrapperRef.current?.querySelector(
        '[data-decrypt-target]'
      ) as HTMLElement | null;
      target?.click();
    };
    // First click after a short delay so initial scrambled state is visible.
    const first = setTimeout(tick, 800);
    const id = setInterval(tick, 3600);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return (
    <div ref={wrapperRef} style={{ display: 'inline-block' }}>
      <DecryptedText
        text="Messy meetings to structured execution"
        animateOn="click"
        clickMode="toggle"
        sequential={true}
        revealDirection="start"
        speed={55}
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+"
        parentClassName="inline-block"
        encryptedClassName="opacity-70"
        data-decrypt-target=""
      />
    </div>
  );
}

function TechBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '15px',
        fontWeight: 500,
        color: C.matcha,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        textAlign: 'center',
        fontSize: '11px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: C.matchaMid,
        fontWeight: 500,
        marginBottom: '1rem',
      }}
    >
      {children}
    </div>
  );
}

const sectionH2: React.CSSProperties = {
  fontFamily: "'Fraunces', serif",
  fontSize: 'clamp(2rem, 4.5vw, 3rem)',
  fontWeight: 300,
  textAlign: 'center',
  letterSpacing: '-0.02em',
  color: C.text,
  margin: 0,
  lineHeight: 1.15,
};

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: C.matchaLight,
          marginBottom: '1rem',
          fontWeight: 500,
        }}
      >
        {title}
      </div>
      {links.map((l) => (
        <div key={l.label} style={{ marginBottom: '0.5rem' }}>
          <Link
            href={l.href}
            style={{
              fontSize: '14px',
              color: 'rgba(250,248,244,0.6)',
              textDecoration: 'none',
            }}
          >
            {l.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
