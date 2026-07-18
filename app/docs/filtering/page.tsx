import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('filtering');

export default function FilteringPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Kanban Board
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
        Filtering
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Use the filter bar above the board to filter tickets by:
      </p>

      <ul>
        <li>Status (backlog, in_progress, blocked, done)</li>
        <li>Priority (urgent, high, medium, low, none)</li>
        <li>Type (bug, task, feature, spike)</li>
        <li>Estimate (Quick, Standard, Deep, Epic)</li>
        <li>Label (custom labels)</li>
        <li>Assignee (organization members)</li>
        <li>Due date (overdue, upcoming, none)</li>
      </ul>
      <p>
        Press <code>Cmd+K</code> then type <code>/filter</code> to open the filter dialog quickly.
      </p>
    </>
  );
}
