import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('organizations');

export default function OrganizationsPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Settings
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
        Organizations
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The Organizations tab lets admins manage organization details: name, slug, and logo. This is
        also where you see plan status, share a join link, and approve access requests.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Join links</p>
        <p className="doc-card-text">
          Admins generate a shareable join link. Recipients sign in, enter a waiting room, and wait
          for approval. Rotating the link immediately invalidates the previous URL. Join codes are
          no longer used.
        </p>
      </div>

      <div className="doc-card">
        <p className="doc-card-title">Verified domains</p>
        <p className="doc-card-text">
          For company email domains, use{' '}
          <a href="/docs/domains" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Verified Domains
          </a>{' '}
          — affiliation email verification (not DNS). That path is separate from the join link
          lobby.
        </p>
      </div>
    </>
  );
}
