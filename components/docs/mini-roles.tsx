'use client';

import { useState } from 'react';

type Role = 'admin' | 'member';

const PERMISSIONS: {
  category: string;
  items: { label: string; admin: boolean; member: boolean }[];
}[] = [
  {
    category: 'Dashboard',
    items: [
      { label: 'Organization dashboard', admin: true, member: false },
      { label: 'Personal dashboard', admin: true, member: true },
    ],
  },
  {
    category: 'Meetings',
    items: [
      { label: 'View all meetings', admin: true, member: false },
      { label: 'View assigned meetings', admin: true, member: true },
      { label: 'Start meetings', admin: true, member: true },
    ],
  },
  {
    category: 'Projects',
    items: [
      { label: 'Create projects', admin: true, member: false },
      { label: 'Delete projects', admin: true, member: false },
      { label: 'View project tickets', admin: true, member: true },
      { label: 'Edit tickets', admin: true, member: true },
    ],
  },
  {
    category: 'Members',
    items: [
      { label: 'Manage members', admin: true, member: false },
      { label: 'Change roles', admin: true, member: false },
      { label: 'Remove members', admin: true, member: false },
    ],
  },
  {
    category: 'Settings',
    items: [
      { label: 'Integrations', admin: true, member: false },
      { label: 'Organization settings', admin: true, member: false },
      { label: 'Verified domains', admin: true, member: false },
      { label: 'Join link / access requests', admin: true, member: false },
      { label: 'Preferences', admin: true, member: true },
    ],
  },
];

export default function MiniRoles() {
  const [hoveredRole, setHoveredRole] = useState<Role | null>(null);

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
      {/* Role cards */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div
          onMouseEnter={() => setHoveredRole('admin')}
          onMouseLeave={() => setHoveredRole(null)}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: `1px solid ${hoveredRole === 'admin' ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
            background:
              hoveredRole === 'admin' ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.015)',
            transition: 'all 0.15s',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              marginBottom: '0.25rem',
            }}
          >
            <span
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}
            />
            <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600 }}>Admin</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Full access to everything
          </p>
        </div>
        <div
          onMouseEnter={() => setHoveredRole('member')}
          onMouseLeave={() => setHoveredRole(null)}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '8px',
            border: `1px solid ${hoveredRole === 'member' ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.06)'}`,
            background:
              hoveredRole === 'member' ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.015)',
            transition: 'all 0.15s',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              marginBottom: '0.25rem',
            }}
          >
            <span
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}
            />
            <span style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>Member</span>
          </div>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            Limited, task-focused access
          </p>
        </div>
      </div>

      {/* Permission matrix */}
      <div
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 50px 50px',
            background: 'rgba(255,255,255,0.03)',
            padding: '0.375rem 0.625rem',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Permission
          </span>
          <span
            style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 600, textAlign: 'center' }}
          >
            Admin
          </span>
          <span
            style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600, textAlign: 'center' }}
          >
            Member
          </span>
        </div>

        {/* Rows */}
        {PERMISSIONS.map((cat) => (
          <div key={cat.category}>
            <div
              style={{
                padding: '0.25rem 0.625rem',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              <span
                style={{
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.3)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {cat.category}
              </span>
            </div>
            {cat.items.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 50px 50px',
                  padding: '0.25rem 0.625rem',
                  borderTop: '1px solid rgba(255,255,255,0.02)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                  {item.label}
                </span>
                <span style={{ textAlign: 'center', fontSize: '12px' }}>
                  {item.admin ? (
                    <span style={{ color: '#3b82f6' }}>✓</span>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>—</span>
                  )}
                </span>
                <span style={{ textAlign: 'center', fontSize: '12px' }}>
                  {item.member ? (
                    <span style={{ color: '#22c55e' }}>✓</span>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>—</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        Hover the role cards above to highlight · ✓ = allowed · — = not allowed
      </p>
    </div>
  );
}
