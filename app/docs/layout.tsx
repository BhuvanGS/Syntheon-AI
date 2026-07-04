'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, type ReactNode } from 'react';

const APP_URL = 'https://app.syntheonhub.com';

const NAV_GROUPS = [
  {
    group: 'Getting Started',
    items: [
      { slug: 'getting-started', label: 'Overview' },
      { slug: 'trial', label: 'Free Trial' },
    ],
  },
  {
    group: 'Dashboard',
    items: [
      { slug: 'dashboard', label: 'Dashboard' },
      { slug: 'sidebar', label: 'Sidebar Navigation' },
      { slug: 'search', label: 'Global Search' },
      { slug: 'notifications', label: 'Notifications' },
    ],
  },
  {
    group: 'Meetings',
    items: [
      { slug: 'meetings', label: 'Meetings' },
      { slug: 'meeting-states', label: 'Meeting States' },
      { slug: 'transcripts', label: 'Transcripts' },
    ],
  },
  {
    group: 'Tickets',
    items: [
      { slug: 'ticket-extraction', label: 'AI Ticket Extraction' },
      { slug: 'ticket-fields', label: 'Ticket Fields' },
      { slug: 'ticket-badges', label: 'Ticket Badges' },
      { slug: 'editing-tickets', label: 'Editing & Rejecting' },
    ],
  },
  {
    group: 'Kanban Board',
    items: [
      { slug: 'board', label: 'Board Columns' },
      { slug: 'filtering', label: 'Filtering' },
      { slug: 'bulk-actions', label: 'Bulk Actions' },
      { slug: 'command-palette', label: 'Command Palette' },
    ],
  },
  {
    group: 'Projects',
    items: [
      { slug: 'projects', label: 'Projects' },
      { slug: 'project-tabs', label: 'Project Tabs' },
      { slug: 'importing', label: 'Importing Tickets' },
      { slug: 'project-settings', label: 'Project Settings' },
    ],
  },
  {
    group: 'Dependencies',
    items: [
      { slug: 'dependencies', label: 'Dependencies' },
      { slug: 'dependency-graph', label: 'Dependency Graph' },
      { slug: 'cascading', label: 'Cascading Regressions' },
    ],
  },
  {
    group: 'Sprint-stones',
    items: [
      { slug: 'sprint-stones', label: 'Sprint-stones' },
      { slug: 'burndown', label: 'Burndown Chart' },
      { slug: 'velocity', label: 'Velocity' },
      { slug: 'cycle-time', label: 'Cycle Time' },
      { slug: 'milestones', label: 'Milestones' },
    ],
  },
  {
    group: 'Analytics',
    items: [{ slug: 'analytics', label: 'Analytics' }],
  },
  {
    group: 'Future Viz',
    items: [{ slug: 'future-viz', label: 'Future Viz (Gantt)' }],
  },
  {
    group: 'Members',
    items: [
      { slug: 'members', label: 'Members' },
      { slug: 'roles', label: 'Roles & Permissions' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { slug: 'settings', label: 'Settings Overview' },
      { slug: 'integrations', label: 'Integrations' },
      { slug: 'organizations', label: 'Organizations' },
      { slug: 'domains', label: 'Domain Verification' },
      { slug: 'preferences', label: 'Preferences' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { slug: 'shortcuts', label: 'Keyboard Shortcuts' },
      { slug: 'labels', label: 'Label Management' },
    ],
  },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (slug: string) => pathname === `/docs/${slug}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: 'hidden',
      }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        html {
          scroll-behavior: smooth;
          color-scheme: dark;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }
        .docs-content h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .docs-content h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .docs-content p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.8;
          margin-bottom: 1rem;
        }
        .docs-content ul {
          padding-left: 1.25rem;
          margin-bottom: 1rem;
        }
        .docs-content li {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.8;
          margin-bottom: 0.4rem;
        }
        .docs-content code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          background: rgba(255, 255, 255, 0.06);
          padding: 2px 6px;
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.8);
        }
        .docs-content strong {
          color: rgba(255, 255, 255, 0.85);
          font-weight: 600;
        }
        .doc-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
        }
        .doc-card-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 0.5rem;
        }
        .doc-card-text {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.7;
          margin: 0;
        }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '0 5vw',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none' }}
        >
          <img
            src="/syntheon-logo.png"
            alt="Syntheon Hub"
            width={28}
            height={28}
            style={{ borderRadius: '6px', objectFit: 'cover' }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '18px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Syntheon Hub
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {mounted ? (
            <>
              <Link
                href="/pricing"
                style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}
              >
                FAQ
              </Link>
              <Link
                href={`${APP_URL}/sign-up`}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000',
                  background: '#fff',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                }}
              >
                Start Free
              </Link>
            </>
          ) : null}
        </div>
      </nav>

      {/* Main Layout: sidebar + content */}
      <div style={{ display: 'flex', paddingTop: '64px' }}>
        {/* Left Sidebar */}
        <aside
          style={{
            width: '240px',
            minWidth: '240px',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: '64px',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            overflowY: 'auto',
            padding: '1.5rem 0.75rem',
          }}
        >
          {NAV_GROUPS.map((sec, si) => (
            <div key={si} style={{ marginBottom: '1.25rem' }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '0 0.75rem',
                  marginBottom: '0.5rem',
                }}
              >
                {sec.group}
              </p>
              {sec.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/docs/${item.slug}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 0.75rem',
                    fontSize: '13px',
                    color: isActive(item.slug) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                    fontWeight: isActive(item.slug) ? 500 : 400,
                    borderRadius: '6px',
                    marginBottom: '1px',
                    transition: 'all 0.15s',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </aside>

        {/* Content Area */}
        <div
          style={{ flex: 1, maxWidth: '760px', padding: '3rem 5vw 5rem' }}
          className="docs-content"
        >
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '3rem 5vw',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <img
            src="/syntheon-logo.png"
            alt="Syntheon Hub"
            width={24}
            height={24}
            style={{ borderRadius: '4px' }}
          />
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            Syntheon Hub
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link
            href="/"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link
            href="/pricing"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Pricing
          </Link>
          <Link
            href="/faq"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            FAQ
          </Link>
          <Link
            href="/docs"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Docs
          </Link>
          <Link
            href="/how-it-works"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            How it works
          </Link>
          <Link
            href="/legal"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
          >
            Legal
          </Link>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>2026 Syntheon Hub.</p>
      </footer>
    </div>
  );
}
