import MiniSidebar from '@/components/docs/mini-sidebar';

export default function SidebarPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Dashboard
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
        Sidebar Navigation
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The left sidebar is your main navigation. It shows the Syntheon Hub logo, your organization
        name, and your role badge (Admin or Member).
      </p>

      <h3>Admin navigation</h3>
      <ul>
        <li>
          <strong>Dashboard</strong> — organization overview with stats
        </li>
        <li>
          <strong>Meetings</strong> — all meetings across the organization
        </li>
        <li>
          <strong>Members</strong> — manage organization members and roles
        </li>
        <li>
          <strong>Future Viz</strong> — calendar/Gantt view of upcoming work
        </li>
        <li>
          <strong>Tickets</strong> — all tickets across all projects
        </li>
        <li>
          <strong>Settings</strong> — integrations, organization, domains, preferences
        </li>
      </ul>

      <h3>Member navigation</h3>
      <ul>
        <li>
          <strong>My Dashboard</strong> — personal dashboard
        </li>
        <li>
          <strong>Meetings</strong> — meetings you have access to
        </li>
        <li>
          <strong>Settings</strong> — preferences only
        </li>
      </ul>

      <h3>Projects section</h3>
      <p>
        Below the nav items, the sidebar lists your projects. Click a project to open its workspace.
        Admins can create new projects with the <code>+</code> button.
      </p>

      <h3>User footer</h3>
      <p>
        The bottom of the sidebar shows your avatar, name, and organization. Click{' '}
        <code>Log out</code> to sign out.
      </p>

      <h3>Try it</h3>
      <MiniSidebar />
    </>
  );
}
