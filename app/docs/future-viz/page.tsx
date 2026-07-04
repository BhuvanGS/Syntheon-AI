import MiniGantt from '@/components/docs/mini-gantt';

export default function FutureVizPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Future Viz
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
        Future Viz (Gantt)
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The Future Viz tab shows a Gantt-style timeline of your project. Tickets with due dates
        appear as bars on the timeline. Milestones appear as diamond markers. Drag to adjust dates.
        Zoom in/out to see daily, weekly, or monthly views.
      </p>

      <h3>Try it</h3>
      <MiniGantt />
    </>
  );
}
