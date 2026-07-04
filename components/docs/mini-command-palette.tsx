'use client';

import { useState, useEffect } from 'react';

const COMMANDS = [
  { cmd: '/filter', desc: 'Open the filter dialog', icon: '▦' },
  { cmd: '/create', desc: 'Create a new ticket', icon: '✦' },
  { cmd: '/label', desc: 'Open the label manager', icon: '🏷' },
];

const RECENT = [
  { title: 'Fix login redirect', type: 'ticket', icon: '◇' },
  { title: 'Sprint Planning Q3', type: 'meeting', icon: '◉' },
  { title: 'Mobile App', type: 'project', icon: '▤' },
];

export default function MiniCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isCommand = query.startsWith('/');
  const filteredCmds = isCommand ? COMMANDS.filter((c) => c.cmd.startsWith(query)) : COMMANDS;
  const items = isCommand ? filteredCmds : RECENT;
  const maxIndex = isCommand ? filteredCmds.length - 1 : RECENT.length - 1;

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
      {/* Trigger hint */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '0.625rem 0.875rem',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>⌘</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            Press Cmd+K to open command palette
          </span>
          <kbd
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '1px 5px',
              marginLeft: 'auto',
            }}
          >
            K
          </kbd>
        </div>
      )}

      {/* Command palette overlay */}
      {open && (
        <div
          style={{
            background: 'rgba(10,10,10,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>›</span>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.min(i + 1, maxIndex));
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.max(i - 1, 0));
                }
              }}
              autoFocus
              placeholder="Type a command or search…"
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
                color: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                padding: '1px 5px',
              }}
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div style={{ padding: '0.375rem', maxHeight: '200px', overflowY: 'auto' }}>
            {isCommand ? (
              <>
                <p
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.25)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.25rem 0.5rem',
                    margin: 0,
                  }}
                >
                  Commands
                </p>
                {filteredCmds.map((c, i) => (
                  <div
                    key={c.cmd}
                    onMouseEnter={() => setActiveIndex(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.625rem',
                      borderRadius: '6px',
                      background: activeIndex === i ? 'rgba(255,255,255,0.05)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                      {c.icon}
                    </span>
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
                {filteredCmds.length === 0 && (
                  <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                      No matching commands
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.25)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.25rem 0.5rem',
                    margin: 0,
                  }}
                >
                  Recent
                </p>
                {RECENT.map((r, i) => (
                  <div
                    key={r.title}
                    onMouseEnter={() => setActiveIndex(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.625rem',
                      borderRadius: '6px',
                      background: activeIndex === i ? 'rgba(255,255,255,0.05)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      {r.icon}
                    </span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                      {r.title}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.2)',
                        marginLeft: 'auto',
                        textTransform: 'uppercase',
                      }}
                    >
                      {r.type}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    marginTop: '0.375rem',
                    paddingTop: '0.375rem',
                  }}
                >
                  <p
                    style={{
                      fontSize: '9px',
                      color: 'rgba(255,255,255,0.2)',
                      padding: '0.25rem 0.5rem',
                      margin: 0,
                    }}
                  >
                    Type / for commands
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '0.75rem',
          textAlign: 'center',
        }}
      >
        {open
          ? 'Type / for commands · Use ↑↓ to navigate · Esc to close'
          : 'Click above or press Cmd+K'}
      </p>
    </div>
  );
}
