export default function ImportingPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Projects
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
        Importing Tickets
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        After a meeting completes, import tickets into a project. During import:
      </p>

      <ul>
        <li>
          Tickets are created with all fields (title, description, priority, type, estimate, labels)
        </li>
        <li>Dependencies are inferred automatically using AI — no manual mapping required</li>
        <li>Hard and soft dependencies are created with cycle detection</li>
        <li>Imported tickets appear on the project board immediately</li>
      </ul>

      <div className="doc-card">
        <p className="doc-card-title">Dependency inference</p>
        <p className="doc-card-text">
          After import, the full project ticket list is analyzed by AI to infer dependencies. Each
          suggestion includes a dependency type (hard/soft), strength, and note. Cycles and
          duplicates are automatically prevented.
        </p>
      </div>
    </>
  );
}
