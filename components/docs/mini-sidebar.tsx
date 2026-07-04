'use client';

import { useState } from 'react';

type Role = 'admin' | 'member';

const ADMIN_NAV = [
  { icon: '▦', label: 'Dashboard' },
  { icon: '◉', label: 'Meetings' },
  { icon: '◐', label: 'Members' },
  { icon: '▤', label: 'Future Viz' },
  { icon: '◇', label: 'Tickets' },
  { icon: '⚙', label: 'Settings' },
];

const MEMBER_NAV = [
  { icon: '▦', label: 'My Dashboard' },
  { icon: '◉', label: 'Meetings' },
  { icon: '⚙', label: 'Settings' },
];

const PROJECTS = [
  { name: 'Mobile App', color: '#3b82f6' },
  { name: 'API Refactor', color: '#8b5cf6' },
  { name: 'Marketing Site', color: '#22c55e' },
];

export default function MiniSidebar() {
  const [role, setRole] = useState<Role>('admin');
  const [active, setActive] = useState('Dashboard');
  const [expanded, setExpanded] = useState(true);

  const nav = role === 'admin' ? ADMIN_NAV : MEMBER_NAV;

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
      {/* Role toggle */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem' }}>
        <button
          onClick={() => {
            setRole('admin');
            setActive('Dashboard');
          }}
          style={{
            flex: 1,
            padding: '4px 8px',
            borderRadius: '6px',
            border: `1px solid ${role === 'admin' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
            background: role === 'admin' ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: role === 'admin' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Admin
        </button>
        <button
          onClick={() => {
            setRole('member');
            setActive('My Dashboard');
          }}
          style={{
            flex: 1,
            padding: '4px 8px',
            borderRadius: '6px',
            border: `1px solid ${role === 'member' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
            background: role === 'member' ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: role === 'member' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Member
        </button>
      </div>

      {/* Sidebar mock */}
      <div
        style={{
          width: '100%',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '0.625rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {/* Logo + org */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.5rem',
            marginBottom: '0.375rem',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            S
          </div>
          <div>
            <p
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                fontWeight: 600,
              }}
            >
              Acme Inc
            </p>
            <p
              style={{
                fontSize: '9px',
                color: role === 'admin' ? '#3b82f6' : '#22c55e',
                margin: 0,
              }}
            >
              {role === 'admin' ? 'Admin' : 'Member'}
            </p>
          </div>
        </div>

        {/* Nav items */}
        {nav.map((item) => (
          <div
            key={item.label}
            onClick={() => setActive(item.label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '4px 0.5rem',
              borderRadius: '6px',
              background: active === item.label ? 'rgba(255,255,255,0.06)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                color: active === item.label ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
              }}
            >
              {item.icon}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: active === item.label ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                fontWeight: active === item.label ? 500 : 400,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}

        {/* Projects section */}
        {role === 'admin' && (
          <>
            <div
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.5rem 0.25rem',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                {expanded ? '▼' : '▶'}
              </span>
              <span
                style={{
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              >
                Projects
              </span>
              <span
                style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.3)',
                  marginLeft: 'auto',
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </span>
            </div>
            {expanded &&
              PROJECTS.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '3px 0.5rem 3px 1.25rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '2px',
                      background: p.color,
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{p.name}</span>
                </div>
              ))}
          </>
        )}

        {/* User footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 0.5rem 0.25rem',
          }}
        >
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'rgba(59,130,246,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              color: '#3b82f6',
              fontWeight: 600,
            }}
          >
            JD
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>John Doe</p>
            <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Acme Inc</p>
          </div>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}>
            ⏻
          </span>
        </div>
      </div>

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        Toggle between Admin and Member roles
      </p>
    </div>
  );
}
