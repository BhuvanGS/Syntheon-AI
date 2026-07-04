export default function DependenciesPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Dependencies
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
        Dependencies
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Syntheonhub automatically infers dependencies between tickets from meeting context. There
        are two types:
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Hard dependency</p>
        <p className="doc-card-text">
          The dependent ticket cannot start until the parent is Done. Moving it to In Progress or
          Done is blocked. A tooltip explains which parent ticket is blocking it.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Soft dependency</p>
        <p className="doc-card-text">
          A recommendation, not a blocker. Can be bypassed initially, but after 3 ignores it
          escalates to a hard block to prevent chronic bypassing.
        </p>
      </div>
    </>
  );
}
