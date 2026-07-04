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
        Domain Verification
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Admins can verify domain ownership (e.g., <code>yourcompany.com</code>) to enable auto-join.
        New users signing up with a verified domain email are automatically added to your
        organization.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">How it works</p>
        <p className="doc-card-text">
          Add a DNS TXT record provided by Syntheonhub to your domain. Once verified, any user
          signing up with an email on that domain is automatically joined to your organization.
        </p>
      </div>
    </>
  );
}
