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
          <strong>Supabase</strong> — data storage (Mumbai region)
        </li>
        <li>
          <strong>Vercel</strong> — hosting
        </li>
        <li>
          <strong>Razorpay</strong> — payment processing
        </li>
      </ul>
      <p>No external integrations to configure — everything works out of the box.</p>
    </>
  );
}
