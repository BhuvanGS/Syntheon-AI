'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { Bot, Sparkles, GitBranch, Layers, Zap, Menu, X, Calendar } from 'lucide-react';
import { InteractiveKanbanDemo } from '@/components/promo/interactive-kanban';
import { ScrollStackShowcase } from '@/components/promo/scroll-stack-showcase';
import { CardSwapShowcase } from '@/components/promo/card-swap-showcase';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';

const MagicRings = dynamic(() => import('@/components/MagicRings').then((m) => m.default), {
  ssr: false,
}) as any;

const APP_URL = 'https://app.syntheonhub.com';

const stats = [
  { value: '8+', label: 'Tickets per meeting' },
  { value: '2 min', label: 'Processing time' },
  { value: '3', label: 'Platforms supported' },
  { value: '0', label: 'Manual ticket writing' },
];

const features = [
  {
    icon: Bot,
    title: 'Meeting Bot',
    desc: 'Syntheon Hub joins your Google Meet, Zoom, or Teams call. It records, transcribes, and extracts decisions automatically.',
  },
  {
    icon: Sparkles,
    title: 'AI Ticket Extraction',
    desc: 'Conversations become structured tickets with titles, descriptions, priorities, and labels in seconds.',
  },
  {
    icon: Layers,
    title: 'Kanban Board',
    desc: 'Tickets land in the right column automatically. Filter by priority, type, assignee, or label.',
  },
  {
    icon: GitBranch,
    title: 'Dependency Graph',
    desc: 'Visualize hard and soft blockers. Know what must ship first before work gets stuck.',
  },
  {
    icon: Calendar,
    title: 'Sprint Tracking',
    desc: 'Track velocity, cycle time, and milestones. See burndown charts and sprint progress at a glance.',
  },
  {
    icon: Zap,
    title: 'Auto-Organize',
    desc: 'No manual updates. Syntheon Hub moves tickets, sets dependencies, and keeps your board in sync after every meeting.',
  },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.6)',
        textDecoration: 'none',
        transition: 'color 0.2s',
      }}
      className="hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded px-2 py-1"
    >
      {children}
    </Link>
  );
}

function Nav({
  mounted,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mounted: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}) {
  return (
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
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}
        >
          <img
            src="/syntheon-logo.png"
            alt="Syntheon Hub logo"
            width={28}
            height={28}
            style={{ borderRadius: '6px', objectFit: 'cover' }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Syntheon Hub
          </span>
        </Link>
        <div
          className="hidden md:flex"
          style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}
        >
          <NavLink href="/how-it-works">How It Works</NavLink>
          <NavLink href="/#pricing">Pricing</NavLink>
          <NavLink href="/docs">Docs</NavLink>
          <Link
            href={`${APP_URL}/sign-in`}
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              transition: 'color 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            Sign In
          </Link>
          <Link
            href={`${APP_URL}/sign-up`}
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#000',
              background: '#fff',
              textDecoration: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            Start Free
          </Link>
        </div>
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            padding: '1rem 5vw',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <NavLink href="/how-it-works">How It Works</NavLink>
          <NavLink href="/#pricing">Pricing</NavLink>
          <NavLink href="/docs">Docs</NavLink>
          <Link
            href={`${APP_URL}/sign-in`}
            style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
          >
            Sign In
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
              textAlign: 'center',
            }}
          >
            Start Free
          </Link>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '70px' }}>
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          padding: '5rem 5vw 0',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '-0.01em',
            marginBottom: '1.5rem',
          }}
        >
          The AI project manager for every meeting
        </p>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            fontWeight: 700,
            lineHeight: 0.85,
            letterSpacing: '-0.05em',
            color: '#fff',
            margin: 0,
            textWrap: 'balance',
          }}
        >
          Syntheon Hub
        </h1>

        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(1.25rem, 3vw, 2rem)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '-0.02em',
            marginTop: '1.75rem',
            maxWidth: '760px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Your meetings, organized into work.
        </p>
      </div>

      {/* Interactive product showcase below */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', padding: '2rem 2vw 6rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <InteractiveKanbanDemo />
        </motion.div>
      </div>
    </section>
  );
}

function FadeIn({
  children,
  delay = 0,
  y = 40,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

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
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        html {
          scroll-behavior: smooth;
          color-scheme: dark;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
        html,
        body {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
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
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-black focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <Nav
        mounted={mounted}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main id="main">
        <HeroSection />
        <FadeIn>
          <StatsBar />
        </FadeIn>
        <ScrollStackShowcase />
        <FadeIn>
          <FeatureGrid />
        </FadeIn>
        <CardSwapShowcase />
        <FadeIn>
          <PricingSection />
        </FadeIn>
        <FadeIn>
          <FinalCTA mounted={mounted} />
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}

function StatsBar() {
  return (
    <section
      style={{
        padding: '5rem 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          textAlign: 'center',
        }}
      >
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.1}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 700,
                color: '#fff',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.03em',
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                marginTop: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {s.label}
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section style={{ padding: '10rem 5vw' }}>
      <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 5rem' }}>
        <p
          style={{
            fontSize: '12px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '1.5rem',
            fontWeight: 500,
          }}
        >
          Features
        </p>
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 700,
            color: '#fff',
            textWrap: 'balance',
            letterSpacing: '-0.03em',
          }}
        >
          Everything after the meeting
        </h2>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div
                style={{
                  padding: '2rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Icon size={22} color="#fff" aria-hidden="true" />
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '0.625rem',
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: '-0.02em',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'For solo founders getting started',
      features: ['2 meetings/mo', '25 tickets', '1 project', 'Basic Kanban board'],
      cta: 'Join Beta',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$8.50',
      period: '/mo',
      annualNote: 'billed annually',
      desc: 'For small teams shipping fast',
      features: ['Unlimited meetings', '500 tickets', '10 projects', 'Dependencies', 'API access'],
      cta: 'Join Beta',
      highlight: true,
    },
    {
      name: 'Max',
      price: '$14.50',
      period: '/mo',
      annualNote: 'billed annually',
      desc: 'For teams that want everything',
      features: [
        'Everything unlimited',
        'Analytics',
        'Sprint-stones',
        'Roadmap',
        'Priority support',
      ],
      cta: 'Join Beta',
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      style={{ padding: '10rem 5vw', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }}>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: '1.5rem',
          }}
        >
          Pricing
        </p>
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          Start free. Scale when ready.
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '1.5rem',
          }}
        >
          15-day free trial on paid plans. No credit card required.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              border: plan.highlight
                ? '1px solid rgba(255,255,255,0.2)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '2.5rem 2rem',
              background: plan.highlight ? 'rgba(255,255,255,0.04)' : 'transparent',
              position: 'relative',
            }}
          >
            {plan.highlight && (
              <span
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#fff',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  letterSpacing: '0.05em',
                }}
              >
                POPULAR
              </span>
            )}
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '24px',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '0.5rem',
              }}
            >
              {plan.name}
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>
              {plan.desc}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '4px',
                marginBottom: '0.25rem',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '40px',
                  fontWeight: 700,
                  color: '#fff',
                  letterSpacing: '-0.03em',
                }}
              >
                {plan.price}
              </span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
                {plan.period}
              </span>
            </div>
            {plan.annualNote && (
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
                {plan.annualNote}
              </p>
            )}
            {!plan.annualNote && <div style={{ marginBottom: '2rem' }} />}
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 2rem 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {plan.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`${APP_URL}/sign-up`}
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: '15px',
                fontWeight: 600,
                color: plan.highlight ? '#000' : '#fff',
                background: plan.highlight ? '#fff' : 'transparent',
                border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)',
                textDecoration: 'none',
                padding: '0.875rem 1.5rem',
                borderRadius: '8px',
                transition: 'all 0.2s',
              }}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ mounted }: { mounted: boolean }) {
  return (
    <section
      style={{
        padding: '12rem 5vw',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.15,
        }}
      >
        {mounted && <MagicRings width={600} height={600} />}
      </div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(3rem, 7vw, 6rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1,
            textWrap: 'balance',
            letterSpacing: '-0.04em',
          }}
        >
          Stop writing tickets.
          <br />
          Start shipping them.
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '2rem',
            marginBottom: '3rem',
          }}
        >
          Join the beta. No credit card required.
        </p>
        <Link
          href={`${APP_URL}/sign-up`}
          style={{
            display: 'inline-block',
            fontSize: '18px',
            fontWeight: 600,
            color: '#000',
            background: '#fff',
            textDecoration: 'none',
            padding: '1.125rem 3rem',
            borderRadius: '6px',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Start Free
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '5rem 5vw 2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem' }}>
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              marginBottom: '1.25rem',
            }}
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
                fontSize: '20px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              Syntheon Hub
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '300px' }}>
            Meetings to tickets, automatically. The project management layer for teams that ship.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { label: 'How It Works', href: '/how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
            { label: 'Docs', href: '/docs' },
            { label: 'FAQ', href: '/faq' },
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Cookie Policy', href: '/cookie-policy' },
            { label: 'Terms of Service', href: '/terms' },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { label: 'Sign In', href: `${APP_URL}/sign-in` },
            { label: 'Sign Up', href: `${APP_URL}/sign-up` },
          ]}
        />
        <FooterCol
          title="Resources"
          links={[
            { label: 'Documentation', href: '/how-it-works' },
            { label: 'Contact', href: 'mailto:hello@syntheonhub.com' },
          ]}
        />
      </div>
      <div
        style={{
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          &copy; 2026 Syntheon Hub. All rights reserved.
        </span>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Built with Next.js, Clerk, and Drizzle.
        </span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '1.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {title}
      </h4>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
