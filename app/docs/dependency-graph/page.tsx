import MiniDependencyGraph from '@/components/docs/mini-dependency-graph';

export default function DependencyGraphPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Dependencies
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
        Dependency Graph
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        View the dependency graph from the Dependencies tab in a project. The graph uses a BFS
        layered layout:
      </p>

      <ul>
        <li>Red solid lines for hard dependencies</li>
        <li>Gray dashed lines for soft dependencies</li>
        <li>Nodes are color-coded by ticket status</li>
        <li>Zoom and pan support</li>
        <li>Click a node to see ticket details</li>
      </ul>

      <h3>Try it</h3>
      <MiniDependencyGraph />
    </>
  );
}
