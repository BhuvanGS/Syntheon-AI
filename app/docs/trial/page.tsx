import type { Metadata } from 'next';
import MiniTrialBanner from '@/components/docs/mini-trial-banner';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('trial');

export default function TrialPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Getting Started
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
        Free Trial
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Every plan includes a 7-day free trial. No credit card required to start.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Trial banner</p>
        <p className="doc-card-text">
          A trial banner appears in the top header bar showing days remaining. It displays a
          progress bar and turns red when the trial is about to expire. If the trial expires,
          features are paused until you subscribe.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Refund policy</p>
        <p className="doc-card-text">
          If you are not satisfied within 7 days and have processed fewer than 2 meetings, you get a
          full refund. No questions asked.
        </p>
      </div>

      <h3>Try it</h3>
      <MiniTrialBanner />
    </>
  );
}
