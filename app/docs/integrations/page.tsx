import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('integrations');

export default function IntegrationsPage() {
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
        Integrations
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The Integrations tab in Settings shows connected services. Syntheon Hub uses the following
        services under the hood:
      </p>

      <ul>
        <li>
          <strong>Skribby</strong> — meeting transcription (bot joins calls)
        </li>
        <li>
          <strong>Groq</strong> — AI processing for ticket extraction and dependency inference
        </li>
        <li>
          <strong>Clerk</strong> — authentication and user management
        </li>
        <li>
          <strong>DynamoDB</strong> — data storage (AWS, Mumbai region)
        </li>
        <li>
          <strong>AWS</strong> — hosting (via SST + OpenNext)
        </li>
        <li>
          <strong>Razorpay</strong> — payment processing
        </li>
      </ul>
      <p>No external integrations to configure — everything works out of the box.</p>
    </>
  );
}
