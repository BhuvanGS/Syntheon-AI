'use client';

const SPRINTS = [
  { name: 'Sprint 1', completed: 12 },
  { name: 'Sprint 2', completed: 15 },
  { name: 'Sprint 3', completed: 9 },
  { name: 'Sprint 4', completed: 18 },
  { name: 'Sprint 5', completed: 14 },
  { name: 'Sprint 6', completed: 22 },
];

const MAX_VAL = 25;

export default function MiniVelocityChart() {
  const avg = Math.round(SPRINTS.reduce((sum, s) => sum + s.completed, 0) / SPRINTS.length);
  const trend = SPRINTS[SPRINTS.length - 1].completed > SPRINTS[SPRINTS.length - 2].completed;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '1rem',
        margin: '1.5rem 0',
      }}
    >
      {/* Summary */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
        <div>
          <p
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Average
          </p>
          <p
            style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 600 }}
          >
            {avg}
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>
              tickets/sprint
            </span>
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Trend
          </p>
          <p
            style={{
              fontSize: '18px',
              margin: 0,
              fontWeight: 600,
              color: trend ? '#22c55e' : '#ef4444',
            }}
          >
            {trend ? '↑' : '↓'} {trend ? 'Improving' : 'Declining'}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.5rem',
          height: '120px',
          padding: '0 0.25rem',
        }}
      >
        {SPRINTS.map((s, i) => {
          const h = (s.completed / MAX_VAL) * 100;
          const isLast = i === SPRINTS.length - 1;
          return (
            <div
              key={s.name}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              {/* Value label */}
              <span
                style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}
              >
                {s.completed}
              </span>
              {/* Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '32px',
                  height: `${h}%`,
                  borderRadius: '4px 4px 0 0',
                  background: isLast
                    ? 'linear-gradient(180deg, #3b82f6, rgba(59,130,246,0.4))'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                  border: isLast
                    ? '1px solid rgba(59,130,246,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                  transition: 'height 0.3s',
                }}
              />
              {/* Label */}
              <span
                style={{
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.3)',
                  marginTop: '4px',
                  textAlign: 'center',
                }}
              >
                {s.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Average line indicator */}
      <div
        style={{
          position: 'relative',
          height: '1px',
          background: 'rgba(234,179,8,0.3)',
          margin: '0.5rem 0',
        }}
      >
        <span
          style={{
            position: 'absolute',
            right: 0,
            top: '-14px',
            fontSize: '9px',
            color: 'rgba(234,179,8,0.6)',
          }}
        >
          avg: {avg}
        </span>
      </div>

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.5rem',
          textAlign: 'center',
        }}
      >
        Latest sprint highlighted in blue
      </p>
    </div>
  );
}
