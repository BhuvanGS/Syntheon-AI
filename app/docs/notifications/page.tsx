import MiniNotificationBell from '@/components/docs/mini-notification-bell';

export default function NotificationsPage() {
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
        Notifications
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The notification bell in the top header shows recent activity: tickets assigned to you,
        dependency blocks, meeting completions, and sprint updates. Click the bell to see a dropdown
        of recent notifications.
      </p>

      <h3>Try it</h3>
      <MiniNotificationBell />
    </>
  );
}
