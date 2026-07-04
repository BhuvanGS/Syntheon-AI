export default function BulkActionsPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Kanban Board
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
        Bulk Actions
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Press <code>Cmd+B</code> to enter bulk selection mode. Select multiple tickets and update
        them in one action:
      </p>

      <ul>
        <li>Change status</li>
        <li>Change priority</li>
        <li>Change assignee</li>
        <li>Add or remove labels</li>
      </ul>
      <p>
        A bulk action bar appears at the top of the board when tickets are selected. Press{' '}
        <code>Esc</code> to exit bulk mode.
      </p>
    </>
  );
}
