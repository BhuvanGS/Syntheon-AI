import MiniAnalytics from '@/components/docs/mini-analytics';

export default function AnalyticsPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Analytics
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
        Analytics
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The Analytics tab shows project-level statistics:
      </p>

      <ul>
        <li>
          <strong>Backlog size</strong> — tickets in backlog
        </li>
        <li>
          <strong>In Progress count</strong> — tickets actively being worked on
        </li>
        <li>
          <strong>Completion rate</strong> — percentage of tickets Done
        </li>
        <li>
          <strong>Blocked count</strong> — tickets currently blocked by dependencies
        </li>
      </ul>

      <h3>Try it</h3>
      <MiniAnalytics />
    </>
  );
}
