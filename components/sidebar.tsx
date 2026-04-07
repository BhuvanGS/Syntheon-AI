'use client';

import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Settings,
  FolderKanban,
  Plus,
  Sprout,
} from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  projects: Array<{ id: string; name: string }>;
  selectedProjectId?: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tickets', label: 'Tickets', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        background: 'var(--sidebar-bg, #f5f0e8)',
        borderRight: '1px solid var(--sidebar-border, #e8dfd0)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        height: '100vh',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '2.5rem',
          padding: '0 0.5rem',
        }}
      >
        <img
          src="/logo.png"
          alt="Syntheon"
          style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '1.2rem',
            fontWeight: '400',
            color: '#3d5a3e',
            letterSpacing: '0.01em',
          }}
        >
          Syntheon
        </span>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: isActive ? '500' : '400',
                transition: 'all 0.15s ease',
                background: isActive ? '#3d5a3e' : 'transparent',
                color: isActive ? '#eaf2e8' : '#5a5a52',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = '#eaf2e8';
                  (e.currentTarget as HTMLButtonElement).style.color = '#3d5a3e';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#5a5a52';
                }
              }}
            >
              <Icon
                style={{
                  width: '17px',
                  height: '17px',
                  flexShrink: 0,
                  color: isActive ? '#eaf2e8' : '#8aab7e',
                }}
              />
              {item.label}
            </button>
          );
        })}

        <div style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <p
              style={{
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#8a8a80',
                margin: 0,
              }}
            >
              Projects
            </p>
            <button
              onClick={onCreateProject}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: 'transparent',
                color: '#5c7c5d',
                fontSize: '12px',
                cursor: 'pointer',
                padding: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              New
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {projects.length === 0 ? (
              <div
                style={{
                  border: '1px dashed #d9cfbf',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#8a8a80',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  background: '#fbf9f5',
                }}
              >
                Create your first project to organize meetings and tickets.
              </div>
            ) : (
              projects.slice(0, 6).map((project) => {
                const active = currentView === 'project-detail' && project.id === selectedProjectId;

                return (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      width: '100%',
                      border: '1px solid transparent',
                      background: active ? '#eaf2e8' : 'transparent',
                      color: '#5a5a52',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <span
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {project.name}
                    </span>
                    <FolderKanban
                      style={{ width: '14px', height: '14px', color: '#8aab7e', flexShrink: 0 }}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </nav>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #e8dfd0', margin: '1rem 0' }} />

      {/* User */}
      <div style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#eaf2e8',
            border: '1.5px solid #c8dbc4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sprout style={{ width: '16px', height: '16px', color: '#5c7c5d' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#3d5a3e',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            My Workspace
          </p>
          <p
            style={{
              fontSize: '11px',
              color: '#8a8a80',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            syntheon.ai
          </p>
        </div>
      </div>
    </aside>
  );
}
