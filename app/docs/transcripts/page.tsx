import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('transcripts');

export default function TranscriptsPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Meetings
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
        Transcripts
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        After a meeting completes, the full transcript is available on the meeting detail page. The
        transcript shows speaker labels and timestamps. You can delete the transcript at any time —
        this does not affect tickets already imported to a project.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Privacy</p>
        <p className="doc-card-text">
          Transcripts are encrypted at rest. We do not read them manually or use them to train AI
          models. You can delete them anytime.
        </p>
      </div>
    </>
  );
}
