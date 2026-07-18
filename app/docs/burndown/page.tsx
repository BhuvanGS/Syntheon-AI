import type { Metadata } from 'next';
import MiniBurndownChart from '@/components/docs/mini-burndown-chart';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('burndown');

export default function BurndownPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Sprint-stones
      </p>
      <h1
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '2.25rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '0.5rem',
          letterSpacing: '-0.03em',
        }}
      >
        Burndown Chart
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Tracks remaining work across the sprint. The ideal line shows perfect progress; the actual
        line shows real progress. Updates automatically as tickets move to Done. Helps identify if a
        sprint is on track or at risk.
      </p>

      <h3>Try it</h3>
      <MiniBurndownChart />
    </>
  );
}
