import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('domains');

export default function DomainsPage() {
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
        Verified Domains
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Admins can verify a company email domain (e.g. <code>yourcompany.com</code>) so teammates on
        that domain can discover and join the organization. Public inboxes like Gmail cannot be
        verified.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">How verification works</p>
        <p className="doc-card-text">
          Ownership is proven with an affiliation email — not a DNS TXT record. An admin adds the
          domain, enters an email on that domain, and confirms the one-time code sent to that inbox.
          Once verified, enrollment can invite or suggest membership for matching sign-ups.
        </p>
      </div>

      <div className="doc-card">
        <p className="doc-card-title">Enrollment modes</p>
        <p className="doc-card-text">
          Choose how verified-domain users join: automatic invitation for faster onboarding, or
          manual approval when admins should confirm each request.
        </p>
      </div>

      <div className="doc-card">
        <p className="doc-card-title">Join links</p>
        <p className="doc-card-text">
          Separately, admins can share an organization join link from Settings → Organizations.
          Anyone with the link enters a waiting room until an admin approves — useful when the
          teammate does not use a verified company domain.
        </p>
      </div>
    </>
  );
}
