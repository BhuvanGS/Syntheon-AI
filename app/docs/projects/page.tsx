import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('projects');

export default function ProjectsPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Projects
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
        Projects
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Projects organize tickets, meetings, sprints, dependencies, and members into a single
        workspace. Create a project from the sidebar <code>+</code> button.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Project limits</p>
        <p className="doc-card-text">
          Starter: 1 project. Growth: 5 projects. Team: unlimited projects.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Project workspace</p>
        <p className="doc-card-text">
          Each project has its own workspace with tabs for Tickets, Meetings, Analytics,
          Dependencies, Future Viz, Sprint-stones, and Members (admin only).
        </p>
      </div>
    </>
  );
}
