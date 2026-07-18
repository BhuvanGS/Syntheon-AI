'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { motion, useMotionValueEvent, useSpring, useReducedMotion } from 'motion/react';

/**
 * Clean scroll-time readout — no flip-clock box, no gradient masks.
 * Animates 0 → target with a spring, then settles as display type + unit.
 */
export function ScrollSeconds({ target, style }: { target: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  const spring = useSpring(0, { stiffness: 70, damping: 22, mass: 0.65 });
  const [shown, setShown] = useState(reduce ? target : 0);

  useEffect(() => {
    if (reduce) {
      setShown(target);
      return;
    }
    spring.set(0);
    const id = requestAnimationFrame(() => spring.set(target));
    return () => cancelAnimationFrame(id);
  }, [target, reduce, spring]);

  useMotionValueEvent(spring, 'change', (v) => {
    setShown(Math.round(v));
  });

  const digits = String(Math.min(99, Math.max(0, shown))).padStart(2, '0');

  return (
    <p
      aria-label={`${shown} seconds`}
      style={{
        margin: 0,
        display: 'inline-flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.04em',
        lineHeight: 0.95,
        color: '#fff',
        ...style,
      }}
    >
      <motion.span key={digits} initial={false} style={{ display: 'inline-block' }}>
        {digits}
      </motion.span>
      <span
        style={{
          marginLeft: '0.06em',
          fontSize: '0.42em',
          fontWeight: 650,
          letterSpacing: '-0.02em',
          color: 'rgba(255,255,255,0.72)',
          lineHeight: 1,
          transform: 'translateY(-0.08em)',
        }}
      >
        s
      </span>
    </p>
  );
}
