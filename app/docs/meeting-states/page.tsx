import MiniMeetingStates from '@/components/docs/mini-meeting-states';

export default function MeetingStatesPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Meetings
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
        Meeting States
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Each meeting goes through a lifecycle with the following states:
      </p>

      <ul>
        <li>
          <strong>Recording</strong> — bot is actively in the call, transcribing
        </li>
        <li>
          <strong>Processing</strong> — transcript is being analyzed by AI to extract tickets
        </li>
        <li>
          <strong>Completed</strong> — tickets have been extracted and are ready for review
        </li>
        <li>
          <strong>Failed</strong> — something went wrong (rare, usually a bot admission issue)
        </li>
        <li>
          <strong>Not Admitted</strong> — bot was not admitted to the meeting by the host
        </li>
      </ul>
      <p>
        Meeting cards show a colored status badge with an icon for each state. Hover over the badge
        for a tooltip with more detail.
      </p>

      <h3>Try it</h3>
      <MiniMeetingStates />
    </>
  );
}
