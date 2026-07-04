import MiniKanban from '@/components/docs/mini-kanban';

export default function BoardPage() {
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
        Board Columns
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Tickets land on a Kanban board with four columns:
      </p>

      <ul>
        <li>
          <strong>Backlog</strong> — new and unstarted tickets
        </li>
        <li>
          <strong>In Progress</strong> — actively being worked on
        </li>
        <li>
          <strong>Blocked</strong> — waiting on a dependency or external factor
        </li>
        <li>
          <strong>Done</strong> — completed
        </li>
      </ul>
      <p>
        Drag tickets between columns to update status. Hard dependencies block moving a ticket to In
        Progress or Done if the parent ticket is not yet Done.
      </p>

      <h3>Try it</h3>
      <MiniKanban />
    </>
  );
}
