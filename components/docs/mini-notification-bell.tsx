'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'assignment' | 'block' | 'meeting' | 'sprint';
  title: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFS: Notification[] = [
  {
    id: '1',
    type: 'assignment',
    title: 'Ticket "Fix login redirect" assigned to you',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'block',
    title: 'Ticket "Refactor auth flow" is blocked by "Setup DB schema"',
    time: '15m ago',
    read: false,
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Meeting "Sprint Planning Q3" completed — 8 tickets extracted',
    time: '1h ago',
    read: false,
  },
  {
    id: '4',
    type: 'sprint',
    title: 'Sprint 5 ended — 14 tickets completed',
    time: '3h ago',
    read: true,
  },
  {
    id: '5',
    type: 'assignment',
    title: 'Ticket "Add dark mode toggle" assigned to you',
    time: '5h ago',
    read: true,
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  assignment: { icon: '◇', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  block: { icon: '⛔', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  meeting: { icon: '◉', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  sprint: { icon: '▦', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
};

export default function MiniNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
      {/* Bell button mock */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: open ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <Bell size={16} strokeWidth={2} />
          {unread > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#fff',
                fontSize: '9px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}
            >
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: '10px',
                  color: 'rgba(59,130,246,0.7)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification items */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {notifs.map((n) => {
              const cfg = TYPE_CONFIG[n.type];
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: n.read ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}
                >
                  {/* Unread dot */}
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: n.read ? 'transparent' : '#3b82f6',
                      flexShrink: 0,
                      marginTop: '5px',
                    }}
                  />
                  {/* Icon */}
                  <span
                    style={{
                      fontSize: '11px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '5px',
                      background: cfg.bg,
                      color: cfg.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {cfg.icon}
                  </span>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '11px',
                        color: n.read ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)',
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {n.title}
                    </p>
                    <p
                      style={{
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.25)',
                        margin: '2px 0 0',
                      }}
                    >
                      {n.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.375rem 0.75rem',
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
              {unread} unread of {notifs.length} total
            </span>
          </div>
        </div>
      )}

      {!open && (
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          Click the bell to see notifications
        </p>
      )}
    </div>
  );
}
