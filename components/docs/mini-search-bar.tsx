'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchResult {
  id: string;
  type: 'ticket' | 'meeting' | 'project';
  title: string;
  subtitle: string;
}

const ALL_RESULTS: SearchResult[] = [
  {
    id: '1',
    type: 'ticket',
    title: 'Fix login redirect bug',
    subtitle: 'Mobile App · High priority',
  },
  { id: '2', type: 'ticket', title: 'Add dark mode toggle', subtitle: 'API Refactor · Medium' },
  { id: '3', type: 'meeting', title: 'Sprint Planning Q3', subtitle: 'Google Meet · 42 min' },
  { id: '4', type: 'ticket', title: 'Refactor auth flow', subtitle: 'API Refactor · Urgent' },
  { id: '5', type: 'project', title: 'Marketing Site', subtitle: '3 members · 24 tickets' },
  { id: '6', type: 'meeting', title: 'Design Review', subtitle: 'Zoom · 18 min' },
  { id: '7', type: 'ticket', title: 'Setup CI pipeline', subtitle: 'Mobile App · Medium' },
  { id: '8', type: 'project', title: 'Mobile App', subtitle: '5 members · 47 tickets' },
];

const TYPE_ICONS: Record<string, string> = {
  ticket: '◇',
  meeting: '◉',
  project: '▤',
};

const TYPE_COLORS: Record<string, string> = {
  ticket: '#3b82f6',
  meeting: '#22c55e',
  project: '#8b5cf6',
};

export default function MiniSearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? ALL_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_RESULTS;

  const isCommand = query.startsWith('/');

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

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
      {/* Search input */}
      <div
        ref={ref}
        style={{
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0,0,0,0.4)',
            border: `1px solid ${open ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            transition: 'border-color 0.15s',
          }}
        >
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>⌘</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              }
            }}
            placeholder="Search tickets, meetings, projects…  or type / for commands"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '13px',
              fontFamily: 'inherit',
            }}
          />
          <kbd
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '1px 5px',
            }}
          >
            K
          </kbd>
        </div>

        {/* Results dropdown */}
        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '0.375rem',
              zIndex: 10,
              maxHeight: '240px',
              overflowY: 'auto',
              backdropFilter: 'blur(12px)',
            }}
          >
            {isCommand ? (
              <>
                {[
                  { cmd: '/filter', desc: 'Open filter dialog' },
                  { cmd: '/create', desc: 'Create a new ticket' },
                  { cmd: '/label', desc: 'Open label manager' },
                ].map((c, i) => (
                  <div
                    key={c.cmd}
                    onMouseEnter={() => setActiveIndex(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.375rem 0.625rem',
                      borderRadius: '6px',
                      background: activeIndex === i ? 'rgba(255,255,255,0.05)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <code
                      style={{
                        fontSize: '12px',
                        color: '#3b82f6',
                        background: 'rgba(59,130,246,0.1)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      {c.cmd}
                    </code>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {c.desc}
                    </span>
                  </div>
                ))}
              </>
            ) : filtered.length > 0 ? (
              filtered.map((r, i) => (
                <div
                  key={r.id}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 0.625rem',
                    borderRadius: '6px',
                    background: activeIndex === i ? 'rgba(255,255,255,0.05)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '12px', color: TYPE_COLORS[r.type] }}>
                    {TYPE_ICONS[r.type]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.title}
                    </p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                      {r.subtitle}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '9px',
                      color: TYPE_COLORS[r.type],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {r.type}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                  No results found
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        Type to search · Type / for commands · Use ↑↓ to navigate
      </p>
    </div>
  );
}
