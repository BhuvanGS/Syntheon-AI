import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('editing-tickets');

export default function EditingTicketsPage() {
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
        Editing & Rejecting Tickets
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Review, edit, reject, or manually create tickets.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Editing</p>
        <p className="doc-card-text">
          Click any ticket on the board to open the edit dialog. Update title, description,
          priority, type, estimate, labels, assignee, and due date. Changes save automatically.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Rejecting</p>
        <p className="doc-card-text">
          Before importing tickets to a project, you can reject irrelevant ones. Rejected tickets
          are archived and do not appear on the board.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Manual ticket creation</p>
        <p className="doc-card-text">
          Press <code>Cmd+K</code> then type <code>/create</code> to manually create a ticket from
          scratch, without a meeting.
        </p>
      </div>
    </>
  );
}
