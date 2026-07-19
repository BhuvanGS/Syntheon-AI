'use client';

import { useReducedMotion, motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';

export type IsoLayer = {
  left: string;
  right: string;
};

type IsoStackProps = {
  layers: IsoLayer[];
  motif?: 'handoff' | 'capture' | 'board' | 'clean';
  muted?: boolean;
  float?: boolean;
  className?: string;
  style?: CSSProperties;
};

const MOTIFS: Record<NonNullable<IsoStackProps['motif']>, number[][]> = {
  handoff: [
    [1, 1],
    [2, 1],
    [2, 2],
    [3, 2],
    [4, 2],
    [4, 3],
    [5, 3],
    [6, 3],
    [7, 2],
    [8, 2],
    [8, 1],
    [9, 1],
    [3, 1],
    [6, 2],
    [5, 4],
  ],
  capture: [
    [2, 0],
    [3, 0],
    [3, 1],
    [3, 2],
    [4, 2],
    [5, 2],
    [5, 3],
    [6, 3],
    [7, 3],
    [7, 4],
    [8, 4],
  ],
  board: [
    [1, 0],
    [1, 1],
    [1, 2],
    [3, 1],
    [3, 2],
    [3, 3],
    [5, 0],
    [5, 1],
    [5, 2],
    [5, 3],
    [5, 4],
    [7, 2],
    [7, 3],
    [9, 1],
    [9, 2],
  ],
  clean: [
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [4, 1],
    [5, 1],
    [4, 3],
    [5, 3],
  ],
};

const COLS = 12;
const ROWS = 6;
const DEPTH = 14;

function PixelTop({
  motif,
  muted,
}: {
  motif: NonNullable<IsoStackProps['motif']>;
  muted?: boolean;
}) {
  const lit = new Set(MOTIFS[motif].map(([x, y]) => `${x},${y}`));
  const cells: ReactNode[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const on = lit.has(`${x},${y}`);
      cells.push(
        <div
          key={`${x}-${y}`}
          style={{
            borderRadius: 1,
            background: on
              ? muted
                ? 'rgba(255,255,255,0.28)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.38) 100%)'
              : 'rgba(255,255,255,0.04)',
            boxShadow: on ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : undefined,
          }}
        />
      );
    }
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        width: '100%',
        height: '100%',
        gap: 1.5,
        background: 'rgba(0,0,0,0.55)',
        padding: 2,
      }}
    >
      {cells}
    </div>
  );
}

/**
 * Small isometric product stack — reference: layered harness/runtime bricks.
 * Dark precision, extruded depth, gentle float.
 */
export function IsoStack({
  layers,
  motif = 'clean',
  muted = false,
  float = true,
  className,
  style,
}: IsoStackProps) {
  const reduce = useReducedMotion();
  const slabH = 46;

  return (
    <motion.div
      className={className}
      aria-hidden
      style={{
        width: '100%',
        maxWidth: 420,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: 1100,
        position: 'relative',
        minHeight: 280,
        ...style,
      }}
      animate={float && !reduce ? { y: [0, -10, 0] } : undefined}
      transition={
        float && !reduce ? { duration: 6.2, repeat: Infinity, ease: 'easeInOut' } : undefined
      }
    >
      {/* Soft ground shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          width: 210,
          height: 36,
          transform: 'translateX(-42%) rotate(-12deg)',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: 300,
          transform: 'rotateX(58deg) rotateZ(-34deg)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
        }}
      >
        {/* Top surface + extruded rim */}
        <div style={{ position: 'relative', transformStyle: 'preserve-3d', marginBottom: 0 }}>
          <div
            style={{
              height: 124,
              borderRadius: 5,
              border: '1px solid rgba(255,255,255,0.16)',
              background: muted
                ? 'linear-gradient(145deg, #161616 0%, #0e0e0e 100%)'
                : 'linear-gradient(145deg, #1e1e1e 0%, #121212 100%)',
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.04),
                0 32px 60px rgba(0,0,0,0.6)
              `,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(125deg, rgba(255,255,255,0.08) 0%, transparent 42%, transparent 100%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <PixelTop motif={motif} muted={muted} />
          </div>

          {/* Right face of top brick */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: -DEPTH,
              width: DEPTH,
              height: 124,
              transformOrigin: 'left center',
              transform: 'rotateY(90deg)',
              background: muted
                ? 'linear-gradient(180deg, #0c0c0c 0%, #080808 100%)'
                : 'linear-gradient(180deg, #101010 0%, #090909 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: 'none',
            }}
          />
          {/* Front face of top brick */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: -DEPTH,
              width: '100%',
              height: DEPTH,
              transformOrigin: 'center top',
              transform: 'rotateX(-90deg)',
              background: muted
                ? 'linear-gradient(90deg, #0a0a0a 0%, #0e0e0e 100%)'
                : 'linear-gradient(90deg, #0c0c0c 0%, #141414 50%, #0c0c0c 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderTop: 'none',
            }}
          />
        </div>

        {/* Stacked slabs with side extrusion */}
        {layers.map((layer, i) => {
          const face = muted
            ? i === 0
              ? 'linear-gradient(180deg, #1c1c1c 0%, #121212 100%)'
              : i === 1
                ? 'linear-gradient(180deg, #161616 0%, #0f0f0f 100%)'
                : 'linear-gradient(180deg, #121212 0%, #0c0c0c 100%)'
            : i === 0
              ? 'linear-gradient(180deg, #262626 0%, #171717 100%)'
              : i === 1
                ? 'linear-gradient(180deg, #1c1c1c 0%, #121212 100%)'
                : 'linear-gradient(180deg, #161616 0%, #0e0e0e 100%)';

          return (
            <motion.div
              key={`${layer.left}-${i}`}
              style={{
                position: 'relative',
                transformStyle: 'preserve-3d',
                marginTop: -1,
              }}
              animate={float && !reduce ? { y: [0, i % 2 === 0 ? -2 : 2, 0] } : undefined}
              transition={
                float && !reduce
                  ? {
                      duration: 5.5 + i * 0.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.35,
                    }
                  : undefined
              }
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  height: slabH,
                  padding: '0 18px',
                  border: '1px solid rgba(255,255,255,0.11)',
                  borderTopColor: 'rgba(255,255,255,0.05)',
                  background: face,
                  boxShadow: `
                    ${DEPTH}px 0 0 ${muted ? '#080808' : '#0a0a0a'},
                    ${DEPTH}px 10px 22px rgba(0,0,0,0.45)
                  `,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 650,
                    letterSpacing: '0.14em',
                    color: muted ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.9)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {layer.left}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    color: muted ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.42)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {layer.right}
                </span>
                {/* Specular edge */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 18%, transparent 82%, rgba(255,255,255,0.03) 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
              {/* Right extrusion face */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: -DEPTH,
                  width: DEPTH,
                  height: slabH,
                  transformOrigin: 'left center',
                  transform: 'rotateY(90deg)',
                  background:
                    i === 0
                      ? 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)'
                      : 'linear-gradient(180deg, #0e0e0e 0%, #080808 100%)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: 'none',
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
