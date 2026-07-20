'use client';

import Link from 'next/link';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { BrandLogo } from '@/components/brand-logo';
import { TalkWorkDoneStage } from '@/components/promo/talk-work-done-stage';
import {
  DoneModeHint,
  DoneModeNoun,
  DoneModeStage,
  useDoneModeCycle,
} from '@/components/promo/done-showcase';
import { AsciiLogoProp } from '@/components/promo/ascii-logo-prop';
import { InteractiveKanbanDemo } from '@/components/promo/interactive-kanban';
import { ShowcaseMeetings } from '@/components/promo/showcase-meetings';
import { SmoothScroll } from '@/components/promo/smooth-scroll';
import TrueFocus from '@/components/promo/true-focus';
import Noise from '@/components/promo/noise';
import { ScrollSeconds } from '@/components/promo/scroll-seconds';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.syntheonhub.com';
const EASE = [0.16, 1, 0.3, 1] as const;

/** Single typeface for the entire landing surface (incl. nested demos). */
const LP_FONT =
  'var(--font-bricolage), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

const display: CSSProperties = {
  fontFamily: LP_FONT,
  letterSpacing: '-0.03em',
  textWrap: 'balance',
};

export default function LandingPage() {
  const [pageOrigin] = useState(() => Date.now());

  return (
    <SmoothScroll>
      <div
        className="lp"
        style={{
          fontFamily: LP_FONT,
          background: '#050505',
          color: '#fff',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        <style>{landingCss}</style>
        <Nav />
        <Hero />
        <ProblemSection />
        <WasteSection />
        <PipelineSection />
        <ChapterTalk />
        <ChapterWork />
        <ChapterDone pageOrigin={pageOrigin} />
        <WhoSection />
        <PricingSection />
        <FinalCTA />
        <Footer />
      </div>
    </SmoothScroll>
  );
}

function Nav() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(5,5,5,0.72)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '14px 5vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: '#fff',
          }}
        >
          <BrandLogo size={28} />
          <span style={{ ...display, fontSize: 18, fontWeight: 600 }}>Syntheon Hub</span>
        </Link>
        <nav
          className="lp-nav-links"
          style={{ display: 'flex', alignItems: 'center', gap: 28 }}
          aria-label="Primary"
        >
          <Link href="/how-it-works" style={navLink}>
            How it works
          </Link>
          <Link href="/legal" style={navLink}>
            Legal
          </Link>
          <Link href={`${APP_URL}/sign-in`} style={navLink}>
            Sign in
          </Link>
          <Link href={`${APP_URL}/sign-up`} style={ctaPrimary}>
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      style={{
        padding: 'clamp(3.5rem, 10vh, 6.5rem) 5vw clamp(4rem, 9vh, 7rem)',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 45% at 50% -10%, rgba(255,255,255,0.07), transparent 55%)',
          pointerEvents: 'none',
        }}
      />
      <Noise patternAlpha={9} patternRefreshInterval={4} />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ textAlign: 'center', maxWidth: 860, margin: '0 auto 3.25rem' }}
        >
          <p
            style={{
              margin: '0 auto 1.35rem',
              maxWidth: 520,
              fontSize: 'clamp(1rem, 2.1vw, 1.2rem)',
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.48)',
              fontWeight: 500,
            }}
          >
            Stop wasting your best hours after the meeting ends.
          </p>
          <TrueFocus
            sentence="Talk. Work. Done."
            blurAmount={5}
            borderColor="rgba(255,255,255,0.85)"
            animationDuration={0.5}
            pauseBetweenAnimations={1}
            style={{
              ...display,
              fontSize: 'clamp(2.75rem, 8vw, 5.5rem)',
              fontWeight: 700,
              lineHeight: 1.02,
              color: '#fff',
            }}
          />
          <p
            style={{
              margin: '1.35rem auto 0',
              maxWidth: 460,
              fontSize: 'clamp(1.05rem, 2.2vw, 1.2rem)',
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            Leave the cleanup behind. Commitments crystallize into tickets before the call hangs up.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              justifyContent: 'center',
              marginTop: '2.15rem',
            }}
          >
            <Link href={`${APP_URL}/sign-up`} style={ctaPrimaryLarge}>
              Start free
            </Link>
            <Link href="/how-it-works" style={ctaGhost}>
              See how it works
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: reduce ? 0 : 0.15, ease: EASE }}
        >
          <TalkWorkDoneStage />
        </motion.div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="problem"
      style={{
        padding: 'clamp(5rem, 14vh, 10rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 55% 50% at 20% 40%, rgba(255,255,255,0.04), transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0.35 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.75, ease: EASE }}
        className="lp-split"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
          gap: 'clamp(2.5rem, 6vw, 4.5rem)',
          alignItems: 'center',
        }}
      >
        <div>
          <p style={chapterLabel}>The real cost</p>
          <h2
            style={{
              ...display,
              fontSize: 'clamp(2.1rem, 5.2vw, 3.75rem)',
              fontWeight: 700,
              lineHeight: 1.08,
              margin: '1rem 0 1.25rem',
              color: '#fff',
            }}
          >
            Stop rewriting every call into a backlog by hand.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.52)',
              maxWidth: '38ch',
            }}
          >
            The room aligns. Then someone becomes the unpaid project manager.
          </p>
        </div>
        <AsciiLogoProp />
      </motion.div>
    </section>
  );
}

function WasteSection() {
  const reduce = useReducedMotion();

  const notes = [
    'webhook stuff — jordan??',
    'hold merge? chen said something',
    'billing green before launch',
    'smoke suite… staging?',
    'who owns auth fix',
  ];

  const tickets = [
    { title: 'Green billing webhooks for launch', meta: 'High · Jordan · Mon' },
    { title: 'Staging smoke suite before merge', meta: 'Blocked · Chen' },
    { title: 'Unblock launch path', meta: 'In progress · Priya' },
  ];

  return (
    <section
      style={{
        padding: 'clamp(4rem, 10vh, 7rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          style={{
            maxWidth: 520,
            marginLeft: 'auto',
            marginBottom: 'clamp(2.5rem, 5vh, 3.5rem)',
            textAlign: 'right',
          }}
        >
          <p style={{ ...chapterLabel, color: 'rgba(255,255,255,0.55)' }}>Enough</p>
          <h2
            style={{
              ...display,
              fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              margin: '0.75rem 0 0',
              color: '#fff',
            }}
          >
            You didn&apos;t hire yourself to be a human Jira bot.
          </h2>
        </div>

        <div
          className="lp-iso-pair"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(1rem, 3vw, 1.5rem)',
            alignItems: 'stretch',
          }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <p
              style={{
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: '#f0a8a0',
                marginBottom: 12,
              }}
            >
              Without
            </p>
            <div
              style={{
                ...appChrome,
                borderColor: 'rgba(232,140,130,0.22)',
                background:
                  'linear-gradient(165deg, rgba(232,140,130,0.07) 0%, #070707 38%, #070707 100%)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.55)',
              }}
            >
              <div
                style={{
                  ...appChromeHead,
                  borderBottomColor: 'rgba(232,140,130,0.14)',
                  background: 'rgba(232,140,130,0.05)',
                }}
              >
                <span
                  style={{ ...appChromeTitle, color: 'rgba(255,220,214,0.9)', fontWeight: 500 }}
                >
                  Meeting notes
                </span>
              </div>
              <div
                style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {notes.map((line) => (
                  <p
                    key={line}
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: 1.45,
                      color: 'rgba(255,230,226,0.78)',
                      textDecoration: 'line-through',
                      textDecorationColor: 'rgba(232,140,130,0.4)',
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
          >
            <p
              style={{
                fontSize: 12,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: '#9fd4b8',
                marginBottom: 12,
              }}
            >
              With Syntheon Hub
            </p>
            <div
              style={{
                ...appChrome,
                borderColor: 'rgba(120,200,160,0.28)',
                background:
                  'linear-gradient(165deg, rgba(120,200,160,0.08) 0%, #0a0a0a 38%, #0a0a0a 100%)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(120,200,160,0.08)',
              }}
            >
              <div
                style={{
                  ...appChromeHead,
                  borderBottomColor: 'rgba(120,200,160,0.16)',
                  background: 'rgba(120,200,160,0.06)',
                }}
              >
                <span
                  style={{ ...appChromeTitle, color: 'rgba(210,245,225,0.95)', fontWeight: 500 }}
                >
                  Tickets
                </span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tickets.map((t) => (
                  <div
                    key={t.title}
                    style={{
                      ...workTicket,
                      borderColor: 'rgba(120,200,160,0.18)',
                      background: 'rgba(120,200,160,0.05)',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#f2fbf6' }}>
                      {t.title}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(180,230,205,0.75)' }}>{t.meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  const reduce = useReducedMotion();

  const steps = [
    {
      n: '01',
      label: 'In the call',
      title: 'Listening live',
      detail: 'Decisions, owners, and blockers tagged as they land.',
      chrome: 'Live · Auth sync',
      accent: '#8eb4e8',
      accentSoft: 'rgba(142,180,232,0.1)',
      accentBorder: 'rgba(142,180,232,0.28)',
      rows: [
        { k: 'Priya', v: 'Billing webhooks block launch.' },
        { k: 'Jordan', v: 'I’ll own the fix — Monday.' },
      ],
    },
    {
      n: '02',
      label: 'As you talk',
      title: 'Tickets form',
      detail: 'Structured work — priority, owner, due — not a notes dump.',
      chrome: 'Extracting · 3 items',
      accent: '#d4b88a',
      accentSoft: 'rgba(212,184,138,0.1)',
      accentBorder: 'rgba(212,184,138,0.28)',
      rows: [
        { k: 'SYN-12', v: 'Green billing webhooks' },
        { k: 'SYN-13', v: 'Staging smoke suite' },
      ],
    },
    {
      n: '03',
      label: 'When it ends',
      title: 'Already on the board',
      detail: 'Columns filled. Nothing left to retype after the call.',
      chrome: 'Board · Arranged',
      accent: '#9fd4b8',
      accentSoft: 'rgba(120,200,160,0.1)',
      accentBorder: 'rgba(120,200,160,0.28)',
      rows: [
        { k: 'Ready', v: 'Webhooks · Jordan' },
        { k: 'Blocked', v: 'Smoke suite · Chen' },
      ],
    },
  ];

  return (
    <section
      style={{
        padding: 'clamp(5rem, 12vh, 9rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ maxWidth: 560, marginBottom: 'clamp(2.5rem, 5vh, 3.5rem)' }}>
          <p style={chapterLabel}>The handoff</p>
          <h2
            style={{
              ...display,
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              margin: '0.75rem 0 1rem',
              color: '#fff',
            }}
          >
            From talk to board before the call hangs up.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '42ch',
            }}
          >
            One continuous path — capture, structure, ship-ready columns.
          </p>
        </div>

        <div
          className="lp-pipeline"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 'clamp(1rem, 2.5vw, 1.35rem)',
            alignItems: 'stretch',
          }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: step.accent,
                    fontWeight: 600,
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    ...display,
                    fontSize: 22,
                    fontWeight: 700,
                    color: step.accent,
                    opacity: 0.35,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {step.n}
                </span>
              </div>
              <h3
                style={{
                  ...display,
                  fontSize: '1.25rem',
                  fontWeight: 650,
                  margin: '0 0 0.5rem',
                  color: '#fff',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  margin: '0 0 1.15rem',
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: 'rgba(255,255,255,0.48)',
                  flex: '0 0 auto',
                }}
              >
                {step.detail}
              </p>
              <div
                style={{
                  ...appChrome,
                  flex: 1,
                  background: `linear-gradient(165deg, ${step.accentSoft} 0%, #080808 40%, #080808 100%)`,
                  borderColor: step.accentBorder,
                }}
              >
                <div
                  style={{
                    ...appChromeHead,
                    background: step.accentSoft,
                    borderBottomColor: step.accentBorder,
                  }}
                >
                  <span style={{ ...appChromeTitle, color: step.accent, fontWeight: 500 }}>
                    {step.chrome}
                  </span>
                </div>
                <div
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {step.rows.map((row) => (
                    <div
                      key={row.v}
                      style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: step.accent,
                          opacity: 0.75,
                          minWidth: 52,
                          paddingTop: 1,
                        }}
                      >
                        {row.k}
                      </span>
                      <span
                        style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}
                      >
                        {row.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoSection() {
  return (
    <section
      style={{
        padding: 'clamp(5rem, 12vh, 8rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <p style={chapterLabel}>Built for</p>
        <h2
          style={{
            ...display,
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            fontWeight: 700,
            margin: '0.75rem 0 1.25rem',
            color: '#fff',
          }}
        >
          Founders and eng leads drowning in calls.
        </h2>
        <p
          style={{
            margin: '0 auto',
            maxWidth: '42ch',
            fontSize: '1.0625rem',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          If your calendar is full and your board is empty — or full of tickets you typed yourself —
          Syntheon Hub is the layer between talk and ship.
        </p>
      </div>
    </section>
  );
}

function ChapterTalk() {
  return (
    <Chapter
      id="talk"
      label="Talk"
      title="It joins the meeting."
      body="Syntheon Hub sits in the call and keeps every decision, blocker, and commitment."
    >
      <ShowcaseMeetings hero />
    </Chapter>
  );
}

function ChapterWork() {
  const reduce = useReducedMotion();

  const tickets = [
    { title: 'Green billing webhooks for launch', meta: 'High · Jordan · Mon' },
    { title: 'Staging smoke suite before merge', meta: 'Blocked · Chen' },
    { title: 'Unblock launch path', meta: 'In progress · Priya' },
    { title: 'Attach owners from the call', meta: 'Medium · System' },
  ];

  return (
    <section
      id="work"
      style={{
        padding: 'clamp(5rem, 12vh, 9rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0.4 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{ maxWidth: 1280, margin: '0 auto' }}
      >
        <div style={{ maxWidth: 560, marginBottom: 'clamp(2rem, 4vh, 3rem)' }}>
          <p style={chapterLabel}>Work</p>
          <h2
            style={{
              ...display,
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              margin: '0.75rem 0 1rem',
              color: '#fff',
            }}
          >
            Talk crystallizes into tickets.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.52)',
              maxWidth: '38ch',
            }}
          >
            Owners, priorities, and dependencies land as structured work — not a pile of notes.
          </p>
        </div>

        <div
          className="lp-work-split"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 0.72fr) minmax(0, 1.6fr)',
            gap: 'clamp(1rem, 3vw, 1.5rem)',
            alignItems: 'stretch',
          }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: EASE }}
            style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: 12,
              }}
            >
              From the call
            </p>
            <div style={{ ...appChrome, flex: 1 }}>
              <div style={appChromeHead}>
                <span style={appChromeTitle}>Tickets</span>
              </div>
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tickets.map((t, i) => (
                  <motion.div
                    key={t.title}
                    style={workTicket}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.08 + i * 0.08, ease: EASE }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{t.title}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{t.meta}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
            style={{ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 12,
              }}
            >
              On the board
            </p>
            <InteractiveKanbanDemo arranged compact />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

const SCROLL_TIME_CAP_SEC = 18;

function ChapterDone({ pageOrigin }: { pageOrigin: number }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.28 });
  const [counterValue, setCounterValue] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const { mode } = useDoneModeCycle(inView);

  useEffect(() => {
    if (!inView) return;
    // Snapshot only when the section is reached — never keep counting in the background.
    const elapsed = Math.round((Date.now() - pageOrigin) / 1000);
    const capped = Math.min(SCROLL_TIME_CAP_SEC, Math.max(1, elapsed));
    setRevealed(true);
    if (reduce) {
      setCounterValue(capped);
      return;
    }
    // Mount at 0, then animate up to capped (max 18).
    const id = window.requestAnimationFrame(() => {
      setCounterValue(capped);
    });
    return () => window.cancelAnimationFrame(id);
  }, [inView, pageOrigin, reduce]);

  return (
    <section
      id="done"
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(4rem, 8vh, 6rem) 0 clamp(3rem, 6vh, 5rem)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        // Do not clip display type / blur bleed — root already guards overflow-x
        overflow: 'visible',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 85% 60% at 50% 15%, rgba(255,255,255,0.08), transparent 62%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', width: '100%' }}>
        <div
          style={{
            textAlign: 'center',
            maxWidth: 980,
            margin: '0 auto',
            padding: '0 clamp(1.25rem, 5vw, 2.5rem) 3rem',
          }}
        >
          <motion.p
            style={chapterLabel}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: EASE }}
          >
            Done
          </motion.p>

          {revealed && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: EASE }}
              style={{
                margin: '1.75rem 0 0',
                textAlign: 'center',
                paddingTop: '0.15em',
                overflow: 'visible',
              }}
            >
              <ScrollSeconds
                target={counterValue}
                style={{
                  ...display,
                  fontSize: 'clamp(4.75rem, 15vw, 8.5rem)',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              />
            </motion.div>
          )}

          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.95, delay: reduce ? 0 : 0.15, ease: EASE }}
            style={{
              ...display,
              fontSize: 'clamp(1.85rem, 4.6vw, 3.35rem)',
              fontWeight: 700,
              lineHeight: 1.12,
              margin: '1.25rem 0 0',
              color: '#fff',
              textWrap: 'pretty',
              overflow: 'visible',
            }}
          >
            By the time you scrolled here,
            <br />
            Syntheon Hub had already arranged the
            <br />
            <DoneModeNoun mode={mode} reduce={reduce} />
          </motion.h2>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.35, ease: EASE }}
            style={{
              margin: '1.35rem auto 0',
              maxWidth: '40ch',
              fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              minHeight: '3.2em',
            }}
          >
            <DoneModeHint mode={mode} reduce={reduce} />
          </motion.p>
        </div>

        <motion.div
          className="lp-done-stage"
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 1, delay: reduce ? 0 : 0.45, ease: EASE }}
          style={{
            width: '100%',
            padding: '0 clamp(0.75rem, 2.5vw, 2rem)',
            maxWidth: 1480,
            margin: '0 auto',
            overflow: 'visible',
          }}
        >
          {inView ? (
            <DoneModeStage mode={mode} reduce={reduce} />
          ) : (
            <div style={{ minHeight: '40vh' }} />
          )}
        </motion.div>
      </div>
    </section>
  );
}

function Chapter({
  id,
  label,
  title,
  body,
  children,
  invert,
}: {
  id: string;
  label: string;
  title: string;
  body: string;
  children: ReactNode;
  invert?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <section
      id={id}
      style={{
        padding: 'clamp(5rem, 12vh, 9rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0.4 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, ease: EASE }}
        className={invert ? 'lp-chapter lp-chapter--invert' : 'lp-chapter'}
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
          gap: 'clamp(2rem, 5vw, 4rem)',
          alignItems: 'center',
        }}
      >
        <div style={{ order: invert ? 2 : 1 }}>
          <p style={chapterLabel}>{label}</p>
          <h2
            style={{
              ...display,
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              margin: '0.75rem 0 1rem',
              color: '#fff',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.52)',
              maxWidth: '38ch',
            }}
          >
            {body}
          </p>
        </div>
        <div style={{ order: invert ? 1 : 2 }}>{children}</div>
      </motion.div>
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
      features: ['10 meetings/mo', '50 tickets', '3 projects', 'Kanban board'],
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$8.50',
      period: '/mo',
      note: 'billed annually',
      desc: 'For small teams shipping fast',
      features: ['Unlimited meetings', '500 tickets', '10 projects', 'Dependencies', 'API access'],
      highlight: true,
    },
    {
      name: 'Max',
      price: '$14.50',
      period: '/mo',
      note: 'billed annually',
      desc: 'For teams that want everything',
      features: [
        'Everything unlimited',
        'Analytics',
        'Sprint-stones',
        'Roadmap',
        'Priority support',
      ],
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      style={{
        padding: 'clamp(5rem, 12vh, 9rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3.5rem' }}>
        <p style={chapterLabel}>Pricing</p>
        <h2
          style={{
            ...display,
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            fontWeight: 700,
            margin: '0.75rem 0 0',
            color: '#fff',
          }}
        >
          Start free. Scale when ready.
        </h2>
        <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.45)', fontSize: 16 }}>
          7-day free trial on paid plans. No credit card required.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              border: plan.highlight
                ? '1px solid rgba(255,255,255,0.22)'
                : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '2rem 1.75rem',
              background: plan.highlight ? 'rgba(255,255,255,0.035)' : 'transparent',
              position: 'relative',
            }}
          >
            {plan.highlight && (
              <span
                style={{
                  position: 'absolute',
                  top: -11,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#fff',
                  color: '#050505',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: 999,
                  letterSpacing: '0.04em',
                }}
              >
                Popular
              </span>
            )}
            <h3 style={{ ...display, fontSize: 22, fontWeight: 650, margin: '0 0 0.35rem' }}>
              {plan.name}
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
              {plan.desc}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
              <span style={{ ...display, fontSize: 36, fontWeight: 700 }}>{plan.price}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
            </div>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.5rem',
                minHeight: 18,
              }}
            >
              {plan.note ?? '\u00a0'}
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {plan.features.map((f) => (
                <li
                  key={f}
                  style={{ fontSize: 14, color: 'rgba(255,255,255,0.62)', display: 'flex', gap: 8 }}
                >
                  <span aria-hidden style={{ color: 'rgba(255,255,255,0.35)' }}>
                    ·
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={`${APP_URL}/sign-up`}
              style={{
                ...ctaPrimary,
                display: 'block',
                textAlign: 'center',
                background: plan.highlight ? '#fff' : 'transparent',
                color: plan.highlight ? '#050505' : '#fff',
                border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)',
                padding: '0.8rem 1.25rem',
              }}
            >
              Join beta
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      style={{
        padding: 'clamp(6rem, 14vh, 10rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.05), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
        <h2
          style={{
            ...display,
            fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.08,
            margin: 0,
            color: '#fff',
          }}
        >
          Your calendar shouldn&apos;t own your roadmap.
          <br />
          Take the board back.
        </h2>
        <p
          style={{
            margin: '1.5rem auto 2.25rem',
            fontSize: 17,
            color: 'rgba(255,255,255,0.48)',
            maxWidth: 480,
          }}
        >
          Join the beta. No credit card. No cleanup shift waiting after the call.
        </p>
        <Link href={`${APP_URL}/sign-up`} style={ctaPrimaryLarge}>
          Start free
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '4rem 5vw 2rem',
      }}
    >
      <div
        className="lp-footer-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: '2.5rem',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <BrandLogo size={26} />
            <span style={{ ...display, fontSize: 18, fontWeight: 600 }}>Syntheon Hub</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.42)', maxWidth: 280 }}>
            Talk becomes work. Work lands done.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { label: 'How it works', href: '/how-it-works' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Legal', href: '/legal' },
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Cookies', href: '/cookie-policy' },
            { label: 'Terms', href: '/terms' },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { label: 'Sign in', href: `${APP_URL}/sign-in` },
            { label: 'Sign up', href: `${APP_URL}/sign-up` },
          ]}
        />
        <FooterCol
          title="Contact"
          links={[{ label: 'hello@syntheonhub.com', href: 'mailto:hello@syntheonhub.com' }]}
        />
      </div>
      <div
        style={{
          maxWidth: 1100,
          margin: '2.5rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          © 2026 Syntheon Hub. All rights reserved.
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
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
          margin: '0 0 1rem',
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
          gap: 8,
        }}
      >
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const navLink: CSSProperties = {
  fontSize: 14,
  color: 'rgba(255,255,255,0.55)',
  textDecoration: 'none',
};

const ctaPrimary: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#050505',
  background: '#fff',
  textDecoration: 'none',
  padding: '0.55rem 1rem',
  borderRadius: 999,
};

const ctaPrimaryLarge: CSSProperties = {
  ...ctaPrimary,
  fontSize: 16,
  padding: '0.9rem 1.75rem',
};

const ctaGhost: CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.85)',
  background: 'transparent',
  textDecoration: 'none',
  padding: '0.9rem 1.5rem',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.18)',
};

const chapterLabel: CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  margin: 0,
  fontWeight: 500,
};

const appChrome: CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#0a0a0a',
  overflow: 'hidden',
  boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
};

const appChromeHead: CSSProperties = {
  height: 44,
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  background: '#0d0d0d',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
};

const appChromeTitle: CSSProperties = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.6)',
};

const workTicket: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.03)',
};

const landingCss = `
  /* Lenis smooth scroll (Awwwards-style inertia) */
  html.lp-lenis {
    scroll-behavior: auto !important;
  }
  html.lp-lenis,
  html.lp-lenis body {
    height: auto;
  }

  /* Force landing typeface through Tailwind/demo overrides */
  .lp,
  .lp *:not(code):not(pre):not([class*="font-mono"]) {
    font-family: var(--font-bricolage), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
  }
  .lp [class*="font-mono"] {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  }
  @media (max-width: 860px) {
    .lp-chapter {
      grid-template-columns: 1fr !important;
    }
    .lp-chapter > div {
      order: unset !important;
    }
    .lp-split {
      grid-template-columns: 1fr !important;
      gap: 2.5rem !important;
    }
    .lp-iso-pair {
      grid-template-columns: 1fr !important;
      gap: 2.75rem !important;
    }
    .lp-footer-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    .lp-work-split {
      grid-template-columns: 1fr !important;
    }
    .lp-pipeline {
      grid-template-columns: 1fr !important;
    }
    .lp-nav-links a:not(:last-child) {
      display: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .twd-stage * {
      animation: none !important;
      transition: none !important;
    }
  }
  .lp-nav-links a:focus-visible,
  .lp a:focus-visible {
    outline: 2px solid rgba(255,255,255,0.7);
    outline-offset: 3px;
  }
`;
