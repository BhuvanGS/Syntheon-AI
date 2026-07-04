export default function LabelsPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Reference
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
        Label Management
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Labels are organization-scoped tags with custom names and colors. They are auto-assigned to
        tickets during AI extraction based on meeting context. You can also manage them manually:
      </p>

      <ul>
        <li>
          Create labels from the label manager (<code>Cmd+K</code> → <code>/label</code>)
        </li>
        <li>Choose from preset colors</li>
        <li>Edit or delete labels anytime</li>
        <li>Labels appear as colored chips on ticket cards</li>
      </ul>
    </>
  );
}
