export default function TicketFieldsPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Tickets
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
        Ticket Fields
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Every ticket has the following fields, all editable:
      </p>

      <ul>
        <li>
          <strong>Title</strong> — concise summary of the action item or decision
        </li>
        <li>
          <strong>Description</strong> — detailed context from the transcript
        </li>
        <li>
          <strong>Priority</strong> — urgent, high, medium, low, or none
        </li>
        <li>
          <strong>Type</strong> — bug, task, feature, or spike
        </li>
        <li>
          <strong>Estimate</strong> — T-shirt sizing: Quick, Standard, Deep, Epic, or none
        </li>
        <li>
          <strong>Labels</strong> — custom tags with colors, auto-assigned from meeting context
        </li>
        <li>
          <strong>Assignee</strong> — organization member assigned to the ticket
        </li>
        <li>
          <strong>Due date</strong> — optional deadline
        </li>
        <li>
          <strong>Status</strong> — backlog, in_progress, blocked, or done
        </li>
      </ul>
    </>
  );
}
