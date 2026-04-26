'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Ticket, Video, FolderKanban } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'ticket' | 'meeting' | 'project';
  title: string;
  subtitle?: string;
}

interface DynamicIslandSearchProps {
  onSelectTicket?: (id: string) => void;
  onSelectMeeting?: (id: string) => void;
  onSelectProject?: (id: string) => void;
}

export function DynamicIslandSearch({
  onSelectTicket,
  onSelectMeeting,
  onSelectProject,
}: DynamicIslandSearchProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const close = useCallback(() => {
    setExpanded(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        expanded ? close() : open();
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [expanded, open, close]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    if (expanded) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, close]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const debounce = setTimeout(async () => {
      setLoading(true);
      try {
        const [ticketsRes, meetingsRes, projectsRes] = await Promise.all([
          fetch('/api/tickets'),
          fetch('/api/meetings'),
          fetch('/api/projects'),
        ]);
        const [ticketsData, meetingsData, projectsData] = await Promise.all([
          ticketsRes.json(),
          meetingsRes.json(),
          projectsRes.json(),
        ]);

        const q = query.toLowerCase();

        const ticketsArr: any[] = Array.isArray(ticketsData)
          ? ticketsData
          : (ticketsData.tickets ?? []);
        const meetingsArr: any[] = Array.isArray(meetingsData)
          ? meetingsData
          : (meetingsData.meetings ?? []);
        const projectsArr: any[] = Array.isArray(projectsData)
          ? projectsData
          : (projectsData.projects ?? []);

        const ticketResults: SearchResult[] = ticketsArr
          .filter(
            (t: any) =>
              t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
          )
          .slice(0, 4)
          .map((t: any) => ({
            id: t.id,
            type: 'ticket' as const,
            title: t.title,
            subtitle: t.status?.replace('_', ' '),
          }));

        const meetingResults: SearchResult[] = meetingsArr
          .filter((m: any) => (m.projectName ?? m.project_name)?.toLowerCase().includes(q))
          .slice(0, 3)
          .map((m: any) => ({
            id: m.id,
            type: 'meeting' as const,
            title: m.projectName ?? m.project_name,
            subtitle: m.platform,
          }));

        const projectResults: SearchResult[] = projectsArr
          .filter((p: any) => p.name?.toLowerCase().includes(q))
          .slice(0, 3)
          .map((p: any) => ({
            id: p.id,
            type: 'project' as const,
            title: p.name,
            subtitle: 'Project',
          }));

        setResults([...ticketResults, ...meetingResults, ...projectResults]);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    close();
    if (result.type === 'ticket') onSelectTicket?.(result.id);
    if (result.type === 'meeting') onSelectMeeting?.(result.id);
    if (result.type === 'project') onSelectProject?.(result.id);
  };

  const typeIcon = (type: SearchResult['type']) => {
    if (type === 'ticket') return <Ticket className="h-3.5 w-3.5 shrink-0" />;
    if (type === 'meeting') return <Video className="h-3.5 w-3.5 shrink-0" />;
    return <FolderKanban className="h-3.5 w-3.5 shrink-0" />;
  };

  const typeColor = (type: SearchResult['type']) => {
    if (type === 'ticket') return 'text-primary';
    if (type === 'meeting') return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <div ref={containerRef} className="relative flex items-center justify-end">
      <div
        className={`
          relative flex items-center bg-foreground overflow-hidden
          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${
            expanded
              ? 'w-72 rounded-2xl shadow-2xl shadow-black/20'
              : 'w-8 h-8 rounded-full cursor-pointer hover:scale-110'
          }
        `}
        style={{ minHeight: '2rem' }}
        onClick={!expanded ? open : undefined}
      >
        {/* Search icon — always visible, left side when expanded */}
        <div
          className={`flex items-center justify-center shrink-0 transition-all duration-300 ${expanded ? 'pl-3 pr-1' : 'w-full h-full'}`}
        >
          <Search
            className={`text-background transition-all duration-300 ${expanded ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5'}`}
          />
        </div>

        {/* Input */}
        {expanded && (
          <>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tickets, meetings, projects…"
              className="flex-1 bg-transparent text-background placeholder:text-background/40 text-xs outline-none py-2 pr-1 min-w-0"
            />
            <button
              type="button"
              onClick={close}
              className="flex items-center justify-center h-8 w-8 shrink-0 text-background/60 hover:text-background transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        )}
      </div>

      {/* Results dropdown */}
      {expanded && (
        <div className="absolute top-10 right-0 w-72 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-50">
          {loading && <div className="px-4 py-3 text-xs text-muted-foreground">Searching…</div>}

          {!loading && query && results.length === 0 && (
            <div className="px-4 py-3 text-xs text-muted-foreground">No results for "{query}"</div>
          )}

          {!loading && !query && (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              Type to search across tickets, meetings & projects
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-1">
              {results.map((result, i) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selectedIndex ? 'bg-muted' : 'hover:bg-muted/60'
                  }`}
                >
                  <span className={typeColor(result.type)}>{typeIcon(result.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-border/60 px-4 py-2 flex items-center gap-3 bg-muted/30">
            <span className="text-[10px] text-muted-foreground">
              <kbd className="font-mono bg-background border border-border rounded px-1 py-0.5">
                ↑↓
              </kbd>{' '}
              navigate
            </span>
            <span className="text-[10px] text-muted-foreground">
              <kbd className="font-mono bg-background border border-border rounded px-1 py-0.5">
                ↵
              </kbd>{' '}
              select
            </span>
            <span className="text-[10px] text-muted-foreground">
              <kbd className="font-mono bg-background border border-border rounded px-1 py-0.5">
                esc
              </kbd>{' '}
              close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
