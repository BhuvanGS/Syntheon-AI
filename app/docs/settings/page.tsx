import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('settings');

export default function SettingsPage() {
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
        Settings Overview
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The Settings page has four tabs (admin sees all, members see only Preferences):
      </p>

      <ul>
        <li>
          <strong>Integrations</strong> — manage connected services
        </li>
        <li>
          <strong>Organizations</strong> — manage organization details
        </li>
        <li>
          <strong>Domains</strong> — verify a company email domain for B2B discovery and enrollment
        </li>
        <li>
          <strong>Preferences</strong> — personal preferences
        </li>
      </ul>
    </>
  );
}
