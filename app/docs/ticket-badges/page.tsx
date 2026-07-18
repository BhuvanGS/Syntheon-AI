import type { Metadata } from 'next';
import MiniTicketCard from '@/components/docs/mini-ticket-card';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('ticket-badges');

export default function TicketBadgesPage() {
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
        Ticket Badges
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Tickets display visual badges on the board for quick scanning:
      </p>

      <ul>
        <li>
          <strong>Priority dot</strong> — red (urgent), orange (high), yellow (medium), blue (low),
          gray (none)
        </li>
        <li>
          <strong>Type icon</strong> — bug, task, feature, spike
        </li>
        <li>
          <strong>Estimate chips</strong> — dots representing T-shirt size: 1 dot (Quick), 2
          (Standard), 3 (Deep), 4 (Epic)
        </li>
        <li>
          <strong>Label chips</strong> — colored chips with custom names
        </li>
        <li>
          <strong>Assignee avatar</strong> — small avatar of the assigned member
        </li>
        <li>
          <strong>Due date</strong> — date badge, turns red if overdue
        </li>
      </ul>

      <h3>Try it</h3>
      <MiniTicketCard />
    </>
  );
}
