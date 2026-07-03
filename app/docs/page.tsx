'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const APP_URL = 'https://app.syntheonhub.com';

const SECTIONS = [
  {
    group: 'Getting Started',
    items: [
      { id: 'getting-started', label: 'Overview' },
      { id: 'trial', label: 'Free Trial' },
    ],
  },
  {
    group: 'Dashboard',
    items: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'sidebar', label: 'Sidebar Navigation' },
      { id: 'search', label: 'Global Search' },
      { id: 'notifications', label: 'Notifications' },
    ],
  },
  {
    group: 'Meetings',
    items: [
      { id: 'meetings', label: 'Meetings' },
      { id: 'meeting-states', label: 'Meeting States' },
      { id: 'transcripts', label: 'Transcripts' },
    ],
  },
  {
    group: 'Tickets',
    items: [
      { id: 'ticket-extraction', label: 'AI Ticket Extraction' },
      { id: 'ticket-fields', label: 'Ticket Fields' },
      { id: 'ticket-badges', label: 'Ticket Badges' },
      { id: 'editing-tickets', label: 'Editing & Rejecting' },
    ],
  },
  {
    group: 'Kanban Board',
    items: [
      { id: 'board', label: 'Board Columns' },
      { id: 'filtering', label: 'Filtering' },
      { id: 'bulk-actions', label: 'Bulk Actions' },
      { id: 'command-palette', label: 'Command Palette' },
    ],
  },
  {
    group: 'Projects',
    items: [
      { id: 'projects', label: 'Projects' },
      { id: 'project-tabs', label: 'Project Tabs' },
      { id: 'importing', label: 'Importing Tickets' },
      { id: 'project-settings', label: 'Project Settings' },
    ],
  },
  {
    group: 'Dependencies',
    items: [
      { id: 'dependencies', label: 'Dependencies' },
      { id: 'dependency-graph', label: 'Dependency Graph' },
      { id: 'cascading', label: 'Cascading Regressions' },
    ],
  },
  {
    group: 'Sprint-stones',
    items: [
      { id: 'sprints', label: 'Sprint-stones' },
      { id: 'burndown', label: 'Burndown Chart' },
      { id: 'velocity', label: 'Velocity' },
      { id: 'cycle-time', label: 'Cycle Time' },
      { id: 'milestones', label: 'Milestones' },
    ],
  },
  { group: 'Analytics', items: [{ id: 'analytics', label: 'Analytics' }] },
  { group: 'Future Viz', items: [{ id: 'roadmap', label: 'Future Viz (Gantt)' }] },
  {
    group: 'Members',
    items: [
      { id: 'members', label: 'Members' },
      { id: 'roles', label: 'Roles & Permissions' },
    ],
  },
  {
    group: 'Settings',
    items: [
      { id: 'settings', label: 'Settings Overview' },
      { id: 'integrations', label: 'Integrations' },
      { id: 'organizations', label: 'Organizations' },
      { id: 'domains', label: 'Domain Verification' },
      { id: 'preferences', label: 'Preferences' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { id: 'shortcuts', label: 'Keyboard Shortcuts' },
      { id: 'labels', label: 'Label Management' },
    ],
  },
];

export default function DocsPage() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState('getting-started');

  useEffect(() => {
    setMounted(true);
    const hash = window.location.hash.replace('#', '');
    if (hash) setActive(hash);
  }, []);

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
            alt="Syntheonhub"
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
            Syntheonhub
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
          {SECTIONS.map((sec, si) => (
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
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '6px 0.75rem',
                    fontSize: '13px',
                    color: active === item.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontWeight: active === item.id ? 500 : 400,
                    borderRadius: '6px',
                    marginBottom: '1px',
                    transition: 'all 0.15s',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Content Area */}
        <div
          style={{ flex: 1, maxWidth: '760px', padding: '3rem 5vw 5rem' }}
          className="docs-content"
        >
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>
            Last updated: July 2026
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
            Syntheonhub Docs
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem' }}>
            Everything from your sidebar to your tickets — every component, A to Z.
          </p>

          {/* === GETTING STARTED === */}
          <div id="getting-started" style={{ scrollMarginTop: '80px' }}>
            <h2>Getting Started</h2>
            <p>
              Syntheonhub turns your meetings into organized work. The bot joins your call,
              transcribes it, and AI extracts structured tickets with priorities, labels,
              dependencies, and estimates — all automatically.
            </p>
            <div className="doc-card">
              <p className="doc-card-title">1. Create an account</p>
              <p className="doc-card-text">
                Sign up at{' '}
                <Link href={`${APP_URL}/sign-up`} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  app.syntheonhub.com
                </Link>
                . No credit card required. Every plan starts with a 7-day free trial.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">2. Start a meeting</p>
              <p className="doc-card-text">
                From your dashboard, click <code>New Meeting</code> and paste a Google Meet, Zoom,
                or Microsoft Teams link. The bot joins as a participant named "Syntheonhub".
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">3. Review extracted tickets</p>
              <p className="doc-card-text">
                Within 2 minutes of the meeting ending, tickets appear on your dashboard. Each has a
                title, description, priority, type, estimate, and labels. Edit or reject any ticket
                before it hits the board.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">4. Create a project</p>
              <p className="doc-card-text">
                Create a project from the sidebar. Import tickets into the project. Dependencies are
                inferred automatically. Your Kanban board, sprint-stones, and analytics update in
                real-time.
              </p>
            </div>
          </div>

          {/* === FREE TRIAL === */}
          <div id="trial" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Free Trial</h2>
            <p>Every plan includes a 7-day free trial. No credit card required to start.</p>
            <div className="doc-card">
              <p className="doc-card-title">Trial banner</p>
              <p className="doc-card-text">
                A trial banner appears in the top header bar showing days remaining. It displays a
                progress bar and turns red when the trial is about to expire. If the trial expires,
                features are paused until you subscribe.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">Refund policy</p>
              <p className="doc-card-text">
                If you are not satisfied within 7 days and have processed fewer than 2 meetings, you
                get a full refund. No questions asked.
              </p>
            </div>
          </div>

          {/* === DASHBOARD === */}
          <div id="dashboard" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Dashboard</h2>
            <p>
              The dashboard is your home base. Admins see the Organization Dashboard with stats
              across all projects. Members see a personal view of their assigned tickets and
              meetings.
            </p>
            <div className="doc-card">
              <p className="doc-card-title">Admin Dashboard</p>
              <p className="doc-card-text">
                Shows total meetings, tickets extracted, projects, and members. Quick access to
                recent meetings and project shortcuts.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">Member Dashboard</p>
              <p className="doc-card-text">
                Shows your assigned tickets grouped by status, upcoming meetings, and personal
                progress stats.
              </p>
            </div>
          </div>

          {/* === SIDEBAR === */}
          <div id="sidebar" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Sidebar Navigation</h2>
            <p>
              The left sidebar is your main navigation. It shows the Syntheonhub logo, your
              organization name, and your role badge (Admin or Member).
            </p>
            <h3>Admin navigation</h3>
            <ul>
              <li>
                <strong>Dashboard</strong> — organization overview with stats
              </li>
              <li>
                <strong>Meetings</strong> — all meetings across the organization
              </li>
              <li>
                <strong>Members</strong> — manage organization members and roles
              </li>
              <li>
                <strong>Future Viz</strong> — calendar/Gantt view of upcoming work
              </li>
              <li>
                <strong>Tickets</strong> — all tickets across all projects
              </li>
              <li>
                <strong>Settings</strong> — integrations, organization, domains, preferences
              </li>
            </ul>
            <h3>Member navigation</h3>
            <ul>
              <li>
                <strong>My Dashboard</strong> — personal dashboard
              </li>
              <li>
                <strong>Meetings</strong> — meetings you have access to
              </li>
              <li>
                <strong>Settings</strong> — preferences only
              </li>
            </ul>
            <h3>Projects section</h3>
            <p>
              Below the nav items, the sidebar lists your projects. Click a project to open its
              workspace. Admins can create new projects with the <code>+</code> button.
            </p>
            <h3>User footer</h3>
            <p>
              The bottom of the sidebar shows your avatar, name, and organization. Click{' '}
              <code>Log out</code> to sign out.
            </p>
          </div>

          {/* === GLOBAL SEARCH === */}
          <div id="search" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Global Search</h2>
            <p>
              The Dynamic Island search bar in the top header lets you search across tickets,
              meetings, and projects instantly. Results update as you type. Click any result to
              navigate directly to it.
            </p>
          </div>

          {/* === NOTIFICATIONS === */}
          <div id="notifications" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Notifications</h2>
            <p>
              The notification bell in the top header shows recent activity: tickets assigned to
              you, dependency blocks, meeting completions, and sprint updates. Click the bell to see
              a dropdown of recent notifications.
            </p>
          </div>

          {/* === MEETINGS === */}
          <div id="meetings" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Meetings</h2>
            <p>
              Meetings are the core input to Syntheonhub. The bot joins your call, records audio,
              and transcribes in real-time via Skribby.
            </p>
            <div className="doc-card">
              <p className="doc-card-title">Supported platforms</p>
              <p className="doc-card-text">
                Google Meet, Zoom, and Microsoft Teams. No browser extension or installation
                required — just paste the meeting link.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">How the bot works</p>
              <p className="doc-card-text">
                When you start a meeting, Syntheonhub sends a bot via Skribby. The bot joins as a
                participant named "Syntheonhub", records audio, and transcribes in real-time. Audio
                is deleted immediately after transcription — we never store raw audio.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">Consent</p>
              <p className="doc-card-text">
                The bot appears as "Syntheonhub" in the participant list, making it clear the
                meeting is being recorded. You are responsible for obtaining consent from all
                participants before recording.
              </p>
            </div>
          </div>

          {/* === MEETING STATES === */}
          <div id="meeting-states" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Meeting States</h2>
            <p>Each meeting goes through a lifecycle with the following states:</p>
            <ul>
              <li>
                <strong>Recording</strong> — bot is actively in the call, transcribing
              </li>
              <li>
                <strong>Processing</strong> — transcript is being analyzed by AI to extract tickets
              </li>
              <li>
                <strong>Completed</strong> — tickets have been extracted and are ready for review
              </li>
              <li>
                <strong>Failed</strong> — something went wrong (rare, usually a bot admission issue)
              </li>
              <li>
                <strong>Not Admitted</strong> — bot was not admitted to the meeting by the host
              </li>
            </ul>
            <p>
              Meeting cards show a colored status badge with an icon for each state. Hover over the
              badge for a tooltip with more detail.
            </p>
          </div>

          {/* === TRANSCRIPTS === */}
          <div id="transcripts" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Transcripts</h2>
            <p>
              After a meeting completes, the full transcript is available on the meeting detail
              page. The transcript shows speaker labels and timestamps. You can delete the
              transcript at any time — this does not affect tickets already imported to a project.
            </p>
            <div className="doc-card">
              <p className="doc-card-title">Privacy</p>
              <p className="doc-card-text">
                Transcripts are encrypted at rest. We do not read them manually or use them to train
                AI models. You can delete them anytime.
              </p>
            </div>
          </div>

          {/* === TICKET EXTRACTION === */}
          <div id="ticket-extraction" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>AI Ticket Extraction</h2>
            <p>
              After each meeting, Syntheonhub uses AI (powered by Groq) to analyze the transcript
              and extract structured tickets. The AI identifies action items, decisions, insights,
              and blockers from the conversation.
            </p>
            <div className="doc-card">
              <p className="doc-card-title">What gets extracted</p>
              <p className="doc-card-text">
                Each ticket includes a title, description, priority, type, estimate, labels, and a
                confidence score. Dependencies between tickets are also inferred automatically
                during import.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">Confidence score</p>
              <p className="doc-card-text">
                Each ticket has a confidence score (0-100) indicating how clearly the item was
                discussed in the meeting. Low-confidence tickets are flagged for review.
              </p>
            </div>
          </div>

          {/* === TICKET FIELDS === */}
          <div id="ticket-fields" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Ticket Fields</h2>
            <p>Every ticket has the following fields, all editable:</p>
            <ul>
              <li>
                <strong>Title</strong> — concise summary of the action item or decision
              </li>
              <li>
                <strong>Description</strong> — detailed context from the transcript
              </li>
              <li>
                <strong>Priority</strong> — urgent, high, medium, low, or none
              </li>
              <li>
                <strong>Type</strong> — bug, task, feature, or spike
              </li>
              <li>
                <strong>Estimate</strong> — T-shirt sizing: Quick, Standard, Deep, Epic, or none
              </li>
              <li>
                <strong>Labels</strong> — custom tags with colors, auto-assigned from meeting
                context
              </li>
              <li>
                <strong>Assignee</strong> — organization member assigned to the ticket
              </li>
              <li>
                <strong>Due date</strong> — optional deadline
              </li>
              <li>
                <strong>Status</strong> — backlog, in_progress, blocked, or done
              </li>
            </ul>
          </div>

          {/* === TICKET BADGES === */}
          <div id="ticket-badges" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Ticket Badges</h2>
            <p>Tickets display visual badges on the board for quick scanning:</p>
            <ul>
              <li>
                <strong>Priority dot</strong> — red (urgent), orange (high), yellow (medium), blue
                (low), gray (none)
              </li>
              <li>
                <strong>Type icon</strong> — bug, task, feature, spike
              </li>
              <li>
                <strong>Estimate chips</strong> — dots representing T-shirt size: 1 dot (Quick), 2
                (Standard), 3 (Deep), 4 (Epic)
              </li>
              <li>
                <strong>Label chips</strong> — colored chips with custom names
              </li>
              <li>
                <strong>Assignee avatar</strong> — small avatar of the assigned member
              </li>
              <li>
                <strong>Due date</strong> — date badge, turns red if overdue
              </li>
            </ul>
          </div>

          {/* === EDITING TICKETS === */}
          <div id="editing-tickets" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Editing & Rejecting Tickets</h2>
            <div className="doc-card">
              <p className="doc-card-title">Editing</p>
              <p className="doc-card-text">
                Click any ticket on the board to open the edit dialog. Update title, description,
                priority, type, estimate, labels, assignee, and due date. Changes save
                automatically.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">Rejecting</p>
              <p className="doc-card-text">
                Before importing tickets to a project, you can reject irrelevant ones. Rejected
                tickets are archived and do not appear on the board.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">Manual ticket creation</p>
              <p className="doc-card-text">
                Press <code>Cmd+K</code> then type <code>/create</code> to manually create a ticket
                from scratch, without a meeting.
              </p>
            </div>
          </div>

          {/* === BOARD COLUMNS === */}
          <div id="board" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Kanban Board</h2>
            <p>Tickets land on a Kanban board with four columns:</p>
            <ul>
              <li>
                <strong>Backlog</strong> — new and unstarted tickets
              </li>
              <li>
                <strong>In Progress</strong> — actively being worked on
              </li>
              <li>
                <strong>Blocked</strong> — waiting on a dependency or external factor
              </li>
              <li>
                <strong>Done</strong> — completed
              </li>
            </ul>
            <p>
              Drag tickets between columns to update status. Hard dependencies block moving a ticket
              to In Progress or Done if the parent ticket is not yet Done.
            </p>
          </div>

          {/* === FILTERING === */}
          <div id="filtering" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Filtering</h2>
            <p>Use the filter bar above the board to filter tickets by:</p>
            <ul>
              <li>Status (backlog, in_progress, blocked, done)</li>
              <li>Priority (urgent, high, medium, low, none)</li>
              <li>Type (bug, task, feature, spike)</li>
              <li>Estimate (Quick, Standard, Deep, Epic)</li>
              <li>Label (custom labels)</li>
              <li>Assignee (organization members)</li>
              <li>Due date (overdue, upcoming, none)</li>
            </ul>
            <p>
              Press <code>Cmd+K</code> then type <code>/filter</code> to open the filter dialog
              quickly.
            </p>
          </div>

          {/* === BULK ACTIONS === */}
          <div id="bulk-actions" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Bulk Actions</h2>
            <p>
              Press <code>Cmd+B</code> to enter bulk selection mode. Select multiple tickets and
              update them in one action:
            </p>
            <ul>
              <li>Change status</li>
              <li>Change priority</li>
              <li>Change assignee</li>
              <li>Add or remove labels</li>
            </ul>
            <p>
              A bulk action bar appears at the top of the board when tickets are selected. Press{' '}
              <code>Esc</code> to exit bulk mode.
            </p>
          </div>

          {/* === COMMAND PALETTE === */}
          <div id="command-palette" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Command Palette</h2>
            <p>
              Press <code>Cmd+K</code> to open the command palette. Type commands to quickly
              navigate and act:
            </p>
            <ul>
              <li>
                <code>/filter</code> — open the filter dialog
              </li>
              <li>
                <code>/create</code> — create a new ticket
              </li>
              <li>
                <code>/label</code> — open the label manager
              </li>
            </ul>
            <p>The command palette also shows recent tickets and quick navigation links.</p>
          </div>

          {/* === DEPENDENCIES === */}
          <div id="dependencies" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Dependencies</h2>
            <p>
              Syntheonhub automatically infers dependencies between tickets from meeting context.
              There are two types:
            </p>
            <div className="doc-card">
              <p className="doc-card-title">Hard dependency</p>
              <p className="doc-card-text">
                The dependent ticket cannot start until the parent is Done. Moving it to In Progress
                or Done is blocked. A tooltip explains which parent ticket is blocking it.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">Soft dependency</p>
              <p className="doc-card-text">
                A recommendation, not a blocker. Can be bypassed initially, but after 3 ignores it
                escalates to a hard block to prevent chronic bypassing.
              </p>
            </div>
          </div>

          {/* === DEPENDENCY GRAPH === */}
          <div id="dependency-graph" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Dependency Graph</h2>
            <p>
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
          </div>

          {/* === CASCADING === */}
          <div id="cascading" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Cascading Regressions</h2>
            <p>
              If a Done ticket is moved back to another status (e.g., reopened), all Done dependents
              are automatically reopened as Blocked. This prevents stale completions from hiding
              upstream problems. The cascade applies recursively — if a dependent was also a parent,
              its dependents are reopened too.
            </p>
          </div>

          {/* === SPRINT-STONES === */}
          <div id="sprints" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Sprint-stones</h2>
            <p>
              Syntheonhub generates sprints from your backlog using AI. Each sprint includes a name,
              goal, date range, and a grouped set of tickets. The Sprint-stones tab provides sprint
              planning and tracking tools.
            </p>
          </div>

          {/* === BURNDOWN === */}
          <div id="burndown" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Burndown Chart</h2>
            <p>
              Tracks remaining work across the sprint. The ideal line shows perfect progress; the
              actual line shows real progress. Updates automatically as tickets move to Done. Helps
              identify if a sprint is on track or at risk.
            </p>
          </div>

          {/* === VELOCITY === */}
          <div id="velocity" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Velocity</h2>
            <p>
              Measures how many tickets your team completes per sprint. Shown as a bar chart across
              recent sprints. Helps with forecasting and capacity planning for future sprints.
            </p>
          </div>

          {/* === CYCLE TIME === */}
          <div id="cycle-time" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Cycle Time</h2>
            <p>
              Measures the time from when a ticket enters In Progress to when it reaches Done. Shown
              as an average across the sprint. Identifies bottlenecks in your workflow — if cycle
              time is high, tickets are spending too long in progress.
            </p>
          </div>

          {/* === MILESTONES === */}
          <div id="milestones" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Milestones</h2>
            <p>
              Create milestones to track larger goals. Link tickets to milestones. Milestone
              progress is calculated automatically based on linked ticket completion. View
              milestones in the Sprint-stones tab and on the Future Viz timeline.
            </p>
          </div>

          {/* === ANALYTICS === */}
          <div id="analytics" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Analytics</h2>
            <p>The Analytics tab shows project-level statistics:</p>
            <ul>
              <li>
                <strong>Backlog size</strong> — tickets in backlog
              </li>
              <li>
                <strong>In Progress count</strong> — tickets actively being worked on
              </li>
              <li>
                <strong>Completion rate</strong> — percentage of tickets Done
              </li>
              <li>
                <strong>Blocked count</strong> — tickets currently blocked by dependencies
              </li>
            </ul>
          </div>

          {/* === FUTURE VIZ === */}
          <div id="roadmap" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Future Viz (Gantt)</h2>
            <p>
              The Future Viz tab shows a Gantt-style timeline of your project. Tickets with due
              dates appear as bars on the timeline. Milestones appear as diamond markers. Drag to
              adjust dates. Zoom in/out to see daily, weekly, or monthly views.
            </p>
          </div>

          {/* === PROJECTS === */}
          <div id="projects" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Projects</h2>
            <p>
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
          </div>

          {/* === PROJECT TABS === */}
          <div id="project-tabs" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Project Tabs</h2>
            <p>Each project workspace has the following tabs:</p>
            <ul>
              <li>
                <strong>Tickets</strong> — Kanban board with all project tickets, filtering, bulk
                actions, and command palette
              </li>
              <li>
                <strong>Meetings</strong> — meetings associated with this project, start new
                meetings, view transcripts
              </li>
              <li>
                <strong>Analytics</strong> — project stats: backlog size, in-progress count,
                completion rate, blocked tickets
              </li>
              <li>
                <strong>Dependencies</strong> — visual dependency graph with hard and soft links
              </li>
              <li>
                <strong>Future Viz</strong> — Gantt-style timeline view of tickets and milestones
              </li>
              <li>
                <strong>Sprint-stones</strong> — sprint planning with burndown, velocity, cycle
                time, and milestones
              </li>
              <li>
                <strong>Members</strong> (admin only) — manage project members and their roles
              </li>
              <li>
                <strong>Settings</strong> — rename project, manage labels, delete project
              </li>
            </ul>
          </div>

          {/* === IMPORTING === */}
          <div id="importing" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Importing Tickets</h2>
            <p>After a meeting completes, import tickets into a project. During import:</p>
            <ul>
              <li>
                Tickets are created with all fields (title, description, priority, type, estimate,
                labels)
              </li>
              <li>Dependencies are inferred automatically using AI — no manual mapping required</li>
              <li>Hard and soft dependencies are created with cycle detection</li>
              <li>Imported tickets appear on the project board immediately</li>
            </ul>
            <div className="doc-card">
              <p className="doc-card-title">Dependency inference</p>
              <p className="doc-card-text">
                After import, the full project ticket list is analyzed by AI to infer dependencies.
                Each suggestion includes a dependency type (hard/soft), strength, and note. Cycles
                and duplicates are automatically prevented.
              </p>
            </div>
          </div>

          {/* === PROJECT SETTINGS === */}
          <div id="project-settings" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Project Settings</h2>
            <p>The Settings tab within a project lets you:</p>
            <ul>
              <li>Rename the project</li>
              <li>Manage labels (create, edit, delete, assign colors)</li>
              <li>Delete the project (admin only — tickets are unassigned but not deleted)</li>
            </ul>
          </div>

          {/* === MEMBERS === */}
          <div id="members" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Members</h2>
            <p>
              Admins can manage organization members from the Members view in the dashboard. See all
              members, their roles, and when they joined. Remove members or change roles.
            </p>
            <p>
              Within a project, the Members tab (admin only) shows which organization members are
              part of the project. Add or remove project members.
            </p>
          </div>

          {/* === ROLES === */}
          <div id="roles" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Roles & Permissions</h2>
            <div className="doc-card">
              <p className="doc-card-title">Admin</p>
              <p className="doc-card-text">
                Full access: dashboard, meetings, members, future viz, tickets, settings, project
                creation, project deletion, member management, integrations, organization settings,
                domain verification.
              </p>
            </div>
            <div className="doc-card">
              <p className="doc-card-title">Member</p>
              <p className="doc-card-text">
                Limited access: personal dashboard, meetings, preferences. Can view and work on
                assigned tickets in projects they belong to. Cannot create projects, manage members,
                or access organization settings.
              </p>
            </div>
          </div>

          {/* === SETTINGS === */}
          <div id="settings" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Settings</h2>
            <p>The Settings page has four tabs (admin sees all, members see only Preferences):</p>
            <ul>
              <li>
                <strong>Integrations</strong> — manage connected services
              </li>
              <li>
                <strong>Organizations</strong> — manage organization details
              </li>
              <li>
                <strong>Domains</strong> — verify domains for B2B auto-join
              </li>
              <li>
                <strong>Preferences</strong> — personal preferences
              </li>
            </ul>
          </div>

          {/* === INTEGRATIONS === */}
          <div id="integrations" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Integrations</h2>
            <p>
              The Integrations tab in Settings shows connected services. Syntheonhub uses the
              following services under the hood:
            </p>
            <ul>
              <li>
                <strong>Skribby</strong> — meeting transcription (bot joins calls)
              </li>
              <li>
                <strong>Groq</strong> — AI processing for ticket extraction and dependency inference
              </li>
              <li>
                <strong>Clerk</strong> — authentication and user management
              </li>
              <li>
                <strong>Supabase</strong> — data storage (Mumbai region)
              </li>
              <li>
                <strong>Vercel</strong> — hosting
              </li>
              <li>
                <strong>Razorpay</strong> — payment processing
              </li>
            </ul>
            <p>No external integrations to configure — everything works out of the box.</p>
          </div>

          {/* === ORGANIZATIONS === */}
          <div id="organizations" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Organizations</h2>
            <p>
              The Organizations tab lets admins manage organization details: name, slug, and logo.
              This is also where you can see the organization's plan and billing status.
            </p>
          </div>

          {/* === DOMAINS === */}
          <div id="domains" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Domain Verification</h2>
            <p>
              Admins can verify domain ownership (e.g., <code>yourcompany.com</code>) to enable
              auto-join. New users signing up with a verified domain email are automatically added
              to your organization.
            </p>
            <div className="doc-card">
              <p className="doc-card-title">How it works</p>
              <p className="doc-card-text">
                Add a DNS TXT record provided by Syntheonhub to your domain. Once verified, any user
                signing up with an email on that domain is automatically joined to your
                organization.
              </p>
            </div>
          </div>

          {/* === PREFERENCES === */}
          <div id="preferences" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Preferences</h2>
            <p>
              Personal preferences available to all users: theme settings, notification preferences,
              and profile information.
            </p>
          </div>

          {/* === SHORTCUTS === */}
          <div id="shortcuts" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Keyboard Shortcuts</h2>
            <div className="doc-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  Global search (Dynamic Island)
                </span>
                <code>Cmd+K</code>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  Bulk selection mode
                </span>
                <code>Cmd+B</code>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  Open filter dialog
                </span>
                <code>Cmd+K</code> → <code>/filter</code>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  Create new ticket
                </span>
                <code>Cmd+K</code> → <code>/create</code>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                }}
              >
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                  Open label manager
                </span>
                <code>Cmd+K</code> → <code>/label</code>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
              On Windows/Linux, use <code>Ctrl</code> instead of <code>Cmd</code>.
            </p>
          </div>

          {/* === LABELS === */}
          <div id="labels" style={{ scrollMarginTop: '80px', marginTop: '2.5rem' }}>
            <h2>Label Management</h2>
            <p>
              Labels are organization-scoped tags with custom names and colors. They are
              auto-assigned to tickets during AI extraction based on meeting context. You can also
              manage them manually:
            </p>
            <ul>
              <li>
                Create labels from the label manager (<code>Cmd+K</code> → <code>/label</code>)
              </li>
              <li>Choose from preset colors</li>
              <li>Edit or delete labels anytime</li>
              <li>Labels appear as colored chips on ticket cards</li>
            </ul>
          </div>
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
            alt="Syntheonhub"
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
            Syntheonhub
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
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>2026 Syntheonhub.</p>
      </footer>
    </div>
  );
}
