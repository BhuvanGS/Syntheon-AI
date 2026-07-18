'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';

interface NoiseProps {
  patternRefreshInterval?: number;
  /** 0–255 alpha per grain pixel. Keep low for premium subtlety. */
  patternAlpha?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * React Bits — Noise (adapted: fills parent, respects reduced motion, subtle alpha).
 */
export default function Noise({
  patternRefreshInterval = 3,
  patternAlpha = 10,
  className,
  style,
}: NoiseProps) {
  const grainRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId = 0;
    const canvasSize = 256;

    const resize = () => {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    };

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    resize();
    loop();

    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [patternRefreshInterval, patternAlpha, reduce]);

  if (reduce) return null;

  return (
    <canvas
      ref={grainRef}
      aria-hidden
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        imageRendering: 'pixelated',
        opacity: 0.45,
        mixBlendMode: 'overlay',
        ...style,
      }}
    />
  );
}
