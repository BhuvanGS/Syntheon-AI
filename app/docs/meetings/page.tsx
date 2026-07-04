import MiniMeetingCard from '@/components/docs/mini-meeting-card';

export default function MeetingsPage() {
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
        Meetings
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Meetings are the core input to Syntheonhub. The bot joins your call, records audio, and
        transcribes in real-time via Skribby.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Supported platforms</p>
        <p className="doc-card-text">
          Google Meet, Zoom, and Microsoft Teams. No browser extension or installation required —
          just paste the meeting link.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">How the bot works</p>
        <p className="doc-card-text">
          When you start a meeting, Syntheonhub sends a bot via Skribby. The bot joins as a
          participant named &quot;Syntheonhub&quot;, records audio, and transcribes in real-time.
          Audio is deleted immediately after transcription — we never store raw audio.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Consent</p>
        <p className="doc-card-text">
          The bot appears as &quot;Syntheonhub&quot; in the participant list, making it clear the
          meeting is being recorded. You are responsible for obtaining consent from all participants
          before recording.
        </p>
      </div>

      <h3>Meeting cards in action</h3>
      <MiniMeetingCard />
    </>
  );
}
