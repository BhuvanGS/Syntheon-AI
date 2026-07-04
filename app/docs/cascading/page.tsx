export default function CascadingPage() {
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
        Cascading Regressions
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        If a Done ticket is moved back to another status (e.g., reopened), all Done dependents are
        automatically reopened as Blocked. This prevents stale completions from hiding upstream
        problems. The cascade applies recursively — if a dependent was also a parent, its dependents
        are reopened too.
      </p>
    </>
  );
}
