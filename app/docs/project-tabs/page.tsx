export default function ProjectTabsPage() {
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
        Project Tabs
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Each project workspace has the following tabs:
      </p>

      <ul>
        <li>
          <strong>Tickets</strong> — Kanban board with all project tickets, filtering, bulk actions,
          and command palette
        </li>
        <li>
          <strong>Meetings</strong> — meetings associated with this project, start new meetings,
          view transcripts
        </li>
        <li>
          <strong>Analytics</strong> — project stats: backlog size, in-progress count, completion
          rate, blocked tickets
        </li>
        <li>
          <strong>Dependencies</strong> — visual dependency graph with hard and soft links
        </li>
        <li>
          <strong>Future Viz</strong> — Gantt-style timeline view of tickets and milestones
        </li>
        <li>
          <strong>Sprint-stones</strong> — sprint planning with burndown, velocity, cycle time, and
          milestones
        </li>
        <li>
          <strong>Members</strong> (admin only) — manage project members and their roles
        </li>
        <li>
          <strong>Settings</strong> — rename project, manage labels, delete project
        </li>
      </ul>
    </>
  );
}
