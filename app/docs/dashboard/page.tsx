import type { Metadata } from 'next';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('dashboard');

export default function DashboardPage() {
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
        Dashboard
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        The dashboard is your home base. Admins see the Organization Dashboard with stats across all
        projects. Members see a personal view of their assigned tickets and meetings.
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Admin Dashboard</p>
        <p className="doc-card-text">
          Shows total meetings, tickets extracted, projects, and members. Quick access to recent
          meetings and project shortcuts.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Member Dashboard</p>
        <p className="doc-card-text">
          Shows your assigned tickets grouped by status, upcoming meetings, and personal progress
          stats.
        </p>
      </div>
    </>
  );
}
