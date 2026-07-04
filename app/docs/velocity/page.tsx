import MiniVelocityChart from '@/components/docs/mini-velocity-chart';

export default function VelocityPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Sprint-stones
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
        Velocity
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Measures how many tickets your team completes per sprint. Shown as a bar chart across recent
        sprints. Helps with forecasting and capacity planning for future sprints.
      </p>

      <h3>Try it</h3>
      <MiniVelocityChart />
    </>
  );
}
