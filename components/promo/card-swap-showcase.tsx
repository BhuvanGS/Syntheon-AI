'use client';

import CardSwap, { Card } from '@/components/CardSwap';
import { ShowcaseKanban } from '@/components/promo/showcase-kanban';
import { ShowcaseMeetings } from '@/components/promo/showcase-meetings';
import { ShowcaseDependencies } from '@/components/promo/showcase-dependencies';

export function CardSwapShowcase() {
  return (
    <section style={{ padding: '8rem 5vw', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
        {/* Title on the left */}
        <div style={{ flex: '1 1 400px', maxWidth: '500px' }}>
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
            Everything in one place
          </p>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            Kanban, meetings, and dependencies.
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '1.5rem',
              lineHeight: 1.6,
            }}
          >
            Watch the cards swap to explore every part of Syntheon Hub. Hover to pause.
          </p>
        </div>

        {/* CardSwap on the right */}
        <div
          style={{
            flex: '1 1 600px',
            position: 'relative',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardSwap
            width={680}
            height={520}
            cardDistance={70}
            verticalDistance={50}
            delay={3000}
            skewAmount={4}
            easing="elastic"
            pauseOnHover
          >
            <Card>
              <div
                style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '20px' }}
              >
                <ShowcaseKanban hero />
              </div>
            </Card>
            <Card>
              <div
                style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '20px' }}
              >
                <ShowcaseMeetings hero />
              </div>
            </Card>
            <Card>
              <div
                style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '20px' }}
              >
                <ShowcaseDependencies hero />
              </div>
            </Card>
          </CardSwap>
        </div>
      </div>
    </section>
  );
}
