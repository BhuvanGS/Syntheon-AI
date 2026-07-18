import type { Metadata } from 'next';
import MiniSearchBar from '@/components/docs/mini-search-bar';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('search');

export default function SearchPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Dashboard
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
        Global Search
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The Dynamic Island search bar in the top header lets you search across tickets, meetings,
        and projects instantly. Results update as you type. Click any result to navigate directly to
        it.
      </p>

      <h3>Try it</h3>
      <MiniSearchBar />
    </>
  );
}
