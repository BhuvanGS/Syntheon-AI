import type { Metadata } from 'next';
import MiniRoles from '@/components/docs/mini-roles';
import { docsMetadata } from '@/lib/docs-seo';

export const metadata: Metadata = docsMetadata('roles');

export default function RolesPage() {
  return (
    <>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
        Members
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
        Roles & Permissions
      </h1>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
        Syntheon Hub has two roles with different access levels:
      </p>

      <div className="doc-card">
        <p className="doc-card-title">Admin</p>
        <p className="doc-card-text">
          Full access: dashboard, meetings, members, future viz, tickets, settings, project
          creation, project deletion, member management, integrations, organization settings,
          verified domains, and join-link / access-request approval.
        </p>
      </div>
      <div className="doc-card">
        <p className="doc-card-title">Member</p>
        <p className="doc-card-text">
          Limited access: personal dashboard, meetings, preferences. Can view and work on assigned
          tickets in projects they belong to. Cannot create projects, manage members, or access
          organization settings.
        </p>
      </div>

      <h3>Permission matrix</h3>
      <MiniRoles />
    </>
  );
}
