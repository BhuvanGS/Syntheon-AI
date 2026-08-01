'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  /** Hover-only focus (React Bits manualMode). Auto-cycle when false. */
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
  style?: CSSProperties;
  /** Auto-cycle once through the words, then keep hover interaction. */
  playOnce?: boolean;
}

interface FocusRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * React Bits — True Focus
 * Auto-cycles words with corner brackets; hover anytime to focus a word (interactive).
 */
export default function TrueFocus({
  sentence = 'Speak. Shape. Ship.',
  separator = ' ',
  manualMode = false,
  blurAmount = 5,
  borderColor = 'rgba(255,255,255,0.85)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className,
  style,
  playOnce = false,
}: TrueFocusProps) {
  const reduce = useReducedMotion();
  const words = sentence.split(separator).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [autoDone, setAutoDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 });

  const activeIndex = hoverIndex !== null ? hoverIndex : currentIndex;

  const measure = useCallback(() => {
    const el = wordRefs.current[activeIndex];
    const parent = containerRef.current;
    if (!el || !parent) return;
    const parentRect = parent.getBoundingClientRect();
    const activeRect = el.getBoundingClientRect();
    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height,
    });
  }, [activeIndex]);

  useEffect(() => {
    measure();
  }, [measure, words.length, style]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // Auto-cycle (React Bits default) — paused while hovering
  useEffect(() => {
    if (reduce || manualMode || hoverIndex !== null || autoDone) return;

    const tickMs = (animationDuration + pauseBetweenAnimations) * 1000;
    const id = window.setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (playOnce && next >= words.length) {
          setAutoDone(true);
          return words.length - 1;
        }
        return next % words.length;
      });
    }, tickMs);

    return () => clearInterval(id);
  }, [
    reduce,
    manualMode,
    hoverIndex,
    autoDone,
    playOnce,
    animationDuration,
    pauseBetweenAnimations,
    words.length,
  ]);

  if (reduce) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.35em',
          ...style,
        }}
      >
        {words.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      role="group"
      aria-label={sentence}
      style={{
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.35em',
        outline: 'none',
        userSelect: 'none',
        ...style,
      }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      {words.map((word, index) => {
        const isActive = index === activeIndex;
        return (
          <span
            key={`${word}-${index}`}
            ref={(el) => {
              wordRefs.current[index] = el;
            }}
            tabIndex={0}
            onFocus={() => setHoverIndex(index)}
            onBlur={() => setHoverIndex(null)}
            onMouseEnter={() => setHoverIndex(index)}
            onClick={() => setHoverIndex(index)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`,
              outline: 'none',
              userSelect: 'none',
            }}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: activeIndex >= 0 ? 1 : 0,
        }}
        transition={{ duration: animationDuration }}
      >
        <span style={corner(borderColor, 'tl')} />
        <span style={corner(borderColor, 'tr')} />
        <span style={corner(borderColor, 'bl')} />
        <span style={corner(borderColor, 'br')} />
      </motion.div>
    </div>
  );
}

function corner(borderColor: string, pos: 'tl' | 'tr' | 'bl' | 'br'): CSSProperties {
  const base: CSSProperties = {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 3,
    borderStyle: 'solid',
    borderColor,
    borderWidth: 0,
    filter: `drop-shadow(0 0 4px ${borderColor})`,
  };
  if (pos === 'tl') return { ...base, top: -10, left: -10, borderTopWidth: 3, borderLeftWidth: 3 };
  if (pos === 'tr')
    return { ...base, top: -10, right: -10, borderTopWidth: 3, borderRightWidth: 3 };
  if (pos === 'bl')
    return { ...base, bottom: -10, left: -10, borderBottomWidth: 3, borderLeftWidth: 3 };
  return { ...base, bottom: -10, right: -10, borderBottomWidth: 3, borderRightWidth: 3 };
}
