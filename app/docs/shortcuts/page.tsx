export default function ShortcutsPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Reference
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
        Keyboard Shortcuts
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Syntheonhub supports the following keyboard shortcuts:
      </p>

      <div className="doc-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            Global search (Dynamic Island)
          </span>
          <code>Cmd+K</code>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            Bulk selection mode
          </span>
          <code>Cmd+B</code>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            Open filter dialog
          </span>
          <code>Cmd+K</code> → <code>/filter</code>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            Create new ticket
          </span>
          <code>Cmd+K</code> → <code>/create</code>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
          }}
        >
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
            Open label manager
          </span>
          <code>Cmd+K</code> → <code>/label</code>
        </div>
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
        On Windows/Linux, use <code>Ctrl</code> instead of <code>Cmd</code>.
      </p>
    </>
  );
}
