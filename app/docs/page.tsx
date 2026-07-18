import type { Metadata } from 'next';
import Link from 'next/link';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata();

const APP_URL = 'https://app.syntheonhub.com';

export default function DocsIndexPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Last updated: July 2026
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
        Syntheon Hub Docs
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Everything from your sidebar to your tickets — every component, A to Z.
      </p>

      <h2>Getting Started</h2>
      <p>
        Syntheon Hub turns your meetings into organized work. The bot joins your call, transcribes
        it, and AI extracts structured tickets with priorities, labels, dependencies, and estimates
        — all automatically.
      </p>
      <div className="doc-card">
        <p className="doc-card-title">1. Create an account</p>
        <p className="doc-card-text">
          Sign up at{' '}
          <Link href={`${APP_URL}/sign-up`} style={{ color: 'rgba(255,255,255,0.7)' }}>
            app.syntheonhub.com
          </Link>
          . No credit card required. Every plan starts with a 7-day free trial.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">2. Start a meeting</p>
        <p className="doc-card-text">
          From your dashboard, click <code>New Meeting</code> and paste a Google Meet, Zoom, or
          Microsoft Teams link. The bot joins as a participant named &quot;Syntheon Hub&quot;.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">3. Review extracted tickets</p>
        <p className="doc-card-text">
          Within 2 minutes of the meeting ending, tickets appear on your dashboard. Each has a
          title, description, priority, type, estimate, and labels. Edit or reject any ticket before
          it hits the board.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">4. Create a project</p>
        <p className="doc-card-text">
          Create a project from the sidebar. Import tickets into the project. Dependencies are
          inferred automatically. Your Kanban board, sprint-stones, and analytics update in
          real-time.
        </p>
      </div>

      <p style={{ marginTop: '2.5rem', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
        Browse the sidebar to explore each component in detail.
      </p>
    </>
  );
}
