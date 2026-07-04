export default function ProjectSettingsPage() {
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
        Project Settings
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The Settings tab within a project lets you:
      </p>

      <ul>
        <li>Rename the project</li>
        <li>Manage labels (create, edit, delete, assign colors)</li>
        <li>Delete the project (admin only — tickets are unassigned but not deleted)</li>
      </ul>
    </>
  );
}
