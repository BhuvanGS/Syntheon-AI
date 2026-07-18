import type { Metadata } from 'next';
import MiniCommandPalette from '@/components/docs/mini-command-palette';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('command-palette');

export default function CommandPalettePage() {
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
        Command Palette
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Press <code>Cmd+K</code> to open the command palette. Type commands to quickly navigate and
        act:
      </p>

      <ul>
        <li>
          <code>/filter</code> — open the filter dialog
        </li>
        <li>
          <code>/create</code> — create a new ticket
        </li>
        <li>
          <code>/label</code> — open the label manager
        </li>
      </ul>
      <p>The command palette also shows recent tickets and quick navigation links.</p>

      <h3>Try it</h3>
      <MiniCommandPalette />
    </>
  );
}
