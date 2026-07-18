'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

const LINES = [
  { speaker: 'Sarah', text: 'Auth is blocking the dashboard ship.' },
  { speaker: 'Mike', text: 'I’ll own the fix — end of week.' },
  { speaker: 'Alex', text: 'Dependency: schema review before merge.' },
];

const TICKETS = [
  { title: 'Fix auth blocking dashboard', tag: 'High' },
  { title: 'Schema review before merge', tag: 'Blocked' },
  { title: 'Ship dashboard by Friday', tag: 'In progress' },
];

/**
 * Signature hero stage: Talk → Work → Done without stock imagery.
 */
export function TalkWorkDoneStage() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) {
      setPhase(2);
      return;
    }
    // Play Talk → Work → Done once. Never loop the same phases.
    setPhase(0);
    const t1 = window.setTimeout(() => setPhase(1), 2600);
    const t2 = window.setTimeout(() => setPhase(2), 5200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [reduce]);

  return (
    <div
      className="twd-stage"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 920,
        margin: '0 auto',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.12)',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
        overflow: 'hidden',
        minHeight: 420,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.06), transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={dot} />
        <span style={dot} />
        <span style={dot} />
        <span
          style={{
            marginLeft: 12,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          {phase === 0 ? 'Talk' : phase === 1 ? 'Work' : 'Done'}
        </span>
      </div>

      <div style={{ position: 'relative', padding: '28px 24px 32px', minHeight: 340 }}>
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="talk"
              initial={reduce ? false : { opacity: 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(6px)' }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <p style={caption}>Live meeting</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                {LINES.map((line, i) => (
                  <motion.div
                    key={line.text}
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.18, duration: 0.5, ease: EASE }}
                    style={lineCard}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                      {line.speaker}
                    </span>
                    <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.88)', fontSize: 15 }}>
                      {line.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="work"
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p style={caption}>Extracting tickets</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {TICKETS.map((t, i) => (
                  <motion.div
                    key={t.title}
                    initial={reduce ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.1 + i * 0.14, duration: 0.55, ease: EASE }}
                    style={ticketCard}
                  >
                    <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{t.title}</span>
                    <span style={tag}>{t.tag}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="done"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p style={caption}>On the board</p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                  marginTop: 16,
                }}
              >
                {['Captured', 'In progress', 'Done'].map((col, ci) => (
                  <div
                    key={col}
                    style={{
                      borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(0,0,0,0.35)',
                      padding: 10,
                      minHeight: 160,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: 10,
                      }}
                    >
                      {col}
                    </p>
                    {TICKETS.filter((_, ti) =>
                      ci === 0 ? ti === 1 : ci === 1 ? ti === 2 : ti === 0
                    ).map((t) => (
                      <motion.div
                        key={t.title}
                        layout
                        style={{
                          ...ticketCard,
                          marginBottom: 8,
                          padding: '10px 12px',
                        }}
                      >
                        <span style={{ fontSize: 13, color: '#fff' }}>{t.title}</span>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const dot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.18)',
  display: 'inline-block',
};

const caption: CSSProperties = {
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  margin: 0,
};

const lineCard: CSSProperties = {
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.03)',
  padding: '14px 16px',
};

const ticketCard: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  padding: '14px 16px',
};

const tag: CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.55)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 999,
  padding: '4px 10px',
  whiteSpace: 'nowrap',
};
