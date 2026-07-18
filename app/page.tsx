'use client';

import Link from 'next/link';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { BrandLogo } from '@/components/brand-logo';
import { TalkWorkDoneStage } from '@/components/promo/talk-work-done-stage';
import { InteractiveKanbanDemo } from '@/components/promo/interactive-kanban';
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
        <BeforeAfterSection />
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
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75, ease: EASE }}
        style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}
      >
        <p style={chapterLabel}>The real cost</p>
        <h2
          style={{
            ...display,
            fontSize: 'clamp(2.25rem, 6vw, 4.25rem)',
            fontWeight: 700,
            lineHeight: 1.08,
            margin: '1rem 0 1.5rem',
            color: '#fff',
          }}
        >
          Stop rewriting every call into a backlog by hand.
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.52)',
            maxWidth: '46ch',
          }}
        >
          The room aligns for forty minutes. Then someone becomes the unpaid project manager —
          digging through notes, Slack threads, and half-remembered owners.
        </p>
      </motion.div>
    </section>
  );
}

function WasteSection() {
  const wastes = [
    {
      kill: 'Copy-pasting action items into Linear at midnight',
      keep: 'Owners and due dates attach themselves.',
    },
    {
      kill: 'Decisions rotting in a Notion page no one opens',
      keep: 'Every commitment becomes a tracked ticket.',
    },
    {
      kill: 'Another “quick summary” that still needs translation',
      keep: 'Structure — not another paragraph of notes.',
    },
    {
      kill: 'Paying for transcription that stops at the transcript',
      keep: 'The board fills. You stay in the room.',
    },
  ];

  return (
    <section
      style={{
        padding: 'clamp(4rem, 10vh, 7rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={chapterLabel}>Enough</p>
        <h2
          style={{
            ...display,
            fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            margin: '0.75rem 0 2.5rem',
            color: '#fff',
            maxWidth: '22ch',
          }}
        >
          You didn&apos;t hire yourself to be a human Jira bot.
        </h2>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {wastes.map((w) => (
            <li
              key={w.kill}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
                gap: '1.25rem 2rem',
                padding: '1.5rem 0',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
              className="lp-waste-row"
            >
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.28)',
                    marginBottom: 8,
                  }}
                >
                  Without
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
                    lineHeight: 1.4,
                    color: 'rgba(255,255,255,0.38)',
                    textDecoration: 'line-through',
                    textDecorationColor: 'rgba(255,255,255,0.25)',
                  }}
                >
                  {w.kill}
                </p>
              </div>
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.45)',
                    marginBottom: 8,
                  }}
                >
                  With Syntheon
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
                    lineHeight: 1.4,
                    color: 'rgba(255,255,255,0.88)',
                  }}
                >
                  {w.keep}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section
      style={{
        padding: 'clamp(5rem, 12vh, 9rem) 5vw',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 40%, transparent 100%)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ maxWidth: 720, marginBottom: '3.5rem' }}>
          <p style={chapterLabel}>The gap</p>
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
            Meetings don&apos;t fail in the room. They fail in the handoff.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '1.0625rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '48ch',
            }}
          >
            Notes, Notion dumps, and generic AI summaries still leave you translating conversation
            into execution. That translation is where velocity dies.
          </p>
        </div>

        <div
          className="lp-gap-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}
        >
          <div style={contrastPanel}>
            <p
              style={{ ...chapterLabel, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.35)' }}
            >
              Still happening
            </p>
            <ul style={contrastList}>
              {[
                'Action items trapped in chat scrollback',
                'Owners assigned by vibes, not by the board',
                'Friday “what did we decide?” archaeology',
                'Deep work sacrificed to cleanup docs',
              ].map((line) => (
                <li key={line} style={contrastItem}>
                  <span aria-hidden style={contrastMarkBad}>
                    —
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              ...contrastPanel,
              borderColor: 'rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <p style={{ ...chapterLabel, marginBottom: '1.25rem' }}>What closes the gap</p>
            <ul style={contrastList}>
              {[
                'Structured tickets from the live conversation',
                'Owners, priorities, and dependencies attached',
                'Work already on the Kanban when the call ends',
                'You stay in the meeting — not the aftermath',
              ].map((line) => (
                <li key={line} style={contrastItem}>
                  <span aria-hidden style={contrastMarkGood}>
                    →
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
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
      body="Syntheon Hub sits in the call, listens with you, and keeps every decision, blocker, and commitment."
    >
      <div style={demoFrame}>
        <p style={demoLabel}>Live capture</p>
        {[
          { who: 'Priya', line: 'Launch is blocked until billing webhooks are green.' },
          { who: 'Jordan', line: 'I’ll take the webhook fix — ship Monday.' },
          { who: 'Chen', line: 'Hold merge until the staging smoke suite passes.' },
        ].map((row) => (
          <div key={row.line} style={transcriptRow}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, minWidth: 48 }}>
              {row.who}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 15 }}>{row.line}</span>
          </div>
        ))}
      </div>
    </Chapter>
  );
}

function ChapterWork() {
  return (
    <Chapter
      id="work"
      label="Work"
      title="Talk crystallizes into tickets."
      body="Action items, owners, priorities, and dependencies land as structured work — not a pile of notes."
      invert
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { title: 'Green billing webhooks for launch', meta: 'High · Jordan · Mon' },
          { title: 'Staging smoke suite before merge', meta: 'Blocked · Chen' },
          { title: 'Unblock launch path', meta: 'In progress · Priya' },
        ].map((t) => (
          <div key={t.title} style={workTicket}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{t.title}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t.meta}</span>
          </div>
        ))}
      </div>
    </Chapter>
  );
}

const SCROLL_TIME_CAP_SEC = 18;

function ChapterDone({ pageOrigin }: { pageOrigin: number }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.28 });
  const [counterValue, setCounterValue] = useState(0);
  const [revealed, setRevealed] = useState(false);

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
        overflow: 'hidden',
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
            maxWidth: 920,
            margin: '0 auto',
            padding: '0 5vw 3rem',
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
              initial={reduce ? false : { opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, ease: EASE }}
              style={{ margin: '1.75rem 0 0', textAlign: 'center' }}
            >
              <ScrollSeconds
                target={counterValue}
                style={{
                  ...display,
                  fontSize: 'clamp(4.75rem, 15vw, 8.5rem)',
                  fontWeight: 700,
                }}
              />
            </motion.div>
          )}

          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0 }}
            transition={{ duration: 0.95, delay: reduce ? 0 : 0.15, ease: EASE }}
            style={{
              ...display,
              fontSize: 'clamp(2rem, 5.2vw, 3.75rem)',
              fontWeight: 700,
              lineHeight: 1.08,
              margin: '1.25rem 0 0',
              color: '#fff',
            }}
          >
            By the time you scrolled here,
            <br />
            Syntheon had already arranged the tickets.
          </motion.h2>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.35, ease: EASE }}
            style={{
              margin: '1.35rem auto 0',
              maxWidth: '38ch',
              fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            You were still reading. The board was already current.
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
          }}
        >
          {inView ? (
            <InteractiveKanbanDemo majestic arranged />
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

const demoFrame: CSSProperties = {
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.02)',
  padding: '1.5rem',
};

const demoLabel: CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  margin: '0 0 1rem',
};

const transcriptRow: CSSProperties = {
  display: 'flex',
  gap: 14,
  padding: '12px 0',
  borderTop: '1px solid rgba(255,255,255,0.06)',
};

const workTicket: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '16px 18px',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.03)',
};

const contrastPanel: CSSProperties = {
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.015)',
  padding: 'clamp(1.5rem, 3vw, 2.25rem)',
};

const contrastList: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const contrastItem: CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  fontSize: 15,
  lineHeight: 1.5,
  color: 'rgba(255,255,255,0.72)',
};

const contrastMarkBad: CSSProperties = {
  color: 'rgba(255,255,255,0.28)',
  flexShrink: 0,
};

const contrastMarkGood: CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  flexShrink: 0,
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
    .lp-footer-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    .lp-waste-row {
      grid-template-columns: 1fr !important;
      gap: 0.75rem !important;
    }
    .lp-gap-grid {
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
