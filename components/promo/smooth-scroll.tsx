'use client';

import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import Lenis from 'lenis';

export const MKT_FONT =
  'var(--font-bricolage), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

export const mktFontCss = `
  html.lp-lenis {
    scroll-behavior: auto !important;
  }
  html.lp-lenis,
  html.lp-lenis body {
    height: auto;
  }
  .mkt,
  .mkt *:not(code):not(pre):not([class*="font-mono"]) {
    font-family: var(--font-bricolage), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important;
  }
  .mkt [class*="font-mono"] {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  }
`;

function forceScrollTop(lenis?: Lenis | null) {
  if (typeof window === 'undefined') return;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Drop hash so reload never jumps to #done / #pricing mid-page
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  lenis?.scrollTo(0, { immediate: true });
}

/**
 * Awwwards-style inertia scrolling. Skips when prefers-reduced-motion.
 * Always resets to the top on mount / reload.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  // Before paint — kill restored scroll position immediately
  useLayoutEffect(() => {
    forceScrollTop();
  }, []);

  useEffect(() => {
    forceScrollTop();

    const onPageShow = (e: PageTransitionEvent) => {
      // bfcache restore still restores scroll — reset again
      forceScrollTop();
      if (e.persisted) forceScrollTop();
    };
    window.addEventListener('pageshow', onPageShow);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      forceScrollTop();
      return () => window.removeEventListener('pageshow', onPageShow);
    }

    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 0.95,
      lerp: 0.085,
      syncTouch: false,
      anchors: true,
    });

    document.documentElement.classList.add('lp-lenis');
    forceScrollTop(lenis);

    // Beat browser scroll restoration that fires after paint
    const t0 = window.setTimeout(() => forceScrollTop(lenis), 0);
    const t1 = window.setTimeout(() => forceScrollTop(lenis), 50);
    const t2 = window.setTimeout(() => forceScrollTop(lenis), 200);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(frame);
      lenis.destroy();
      document.documentElement.classList.remove('lp-lenis');
    };
  }, []);

  return <>{children}</>;
}

/** Smooth scroll + Bricolage typeface for marketing surfaces. */
export function MarketingSurface({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <div className="mkt" style={{ fontFamily: MKT_FONT, minHeight: '100vh' }}>
        <style>{mktFontCss}</style>
        {children}
      </div>
    </SmoothScroll>
  );
}
