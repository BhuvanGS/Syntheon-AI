import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('ticket-extraction');

export default function TicketExtractionPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Tickets
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
        AI Ticket Extraction
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        After each meeting, Syntheon Hub uses AI (powered by Groq) to analyze the transcript and
        extract structured tickets. The AI identifies action items, decisions, insights, and
        blockers from the conversation.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">What gets extracted</p>
        <p className="doc-card-text">
          Each ticket includes a title, description, priority, type, estimate, labels, and a
          confidence score. Dependencies between tickets are also inferred automatically during
          import.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Confidence score</p>
        <p className="doc-card-text">
          Each ticket has a confidence score (0-100) indicating how clearly the item was discussed
          in the meeting. Low-confidence tickets are flagged for review.
        </p>
      </div>
    </>
  );
}
