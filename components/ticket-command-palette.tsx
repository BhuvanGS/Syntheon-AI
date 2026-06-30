'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Ticket,
  Video,
  FolderKanban,
  Sparkles,
  Filter,
  Tag,
  UserPlus,
  Plus,
  ArrowRight,
  Bug,
  CheckCircle2,
  Zap,
  FlaskConical,
} from 'lucide-react';
import {
  PRIORITY_CONFIG,
  TYPE_CONFIG,
  type TicketPriority,
  type TicketType,
} from '@/components/ticket-badges';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onFilterPriority?: (p: TicketPriority) => void;
  onFilterType?: (t: TicketType) => void;
  onFilterStatus?: (s: string) => void;
  onFilterAssignee?: (a: 'all' | 'mine' | 'unassigned') => void;
  onFilterDueDate?: (d: 'all' | 'overdue' | 'today' | 'this_week' | 'none') => void;
  onCreateTicket?: () => void;
  onAssignTicket?: (ticketId: string) => void;
  onLabelTicket?: (ticketId: string, labelName: string) => void;
  onMoveTicket?: (ticketId: string, status: string) => void;
  tickets?: { id: string; title: string; status: string }[];
  labels?: { id: string; name: string; color: string }[];
}

export function CommandPalette({
  open,
  onClose,
  onFilterPriority,
  onFilterType,
  onFilterStatus,
  onFilterAssignee,
  onFilterDueDate,
  onCreateTicket,
  tickets = [],
  labels = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  const buildCommands = useCallback((): CommandItem[] => {
    const cmds: CommandItem[] = [];
    const q = query.trim().toLowerCase();

    // If query starts with /, treat as command mode
    const isCommandMode = q.startsWith('/');
    const cmd = isCommandMode ? q.slice(1) : q;

    // /filter commands
    if (!isCommandMode || cmd.startsWith('filter') || cmd.startsWith('f')) {
      const filterPrefix = 'filter';

      if (!isCommandMode || cmd === filterPrefix || cmd.startsWith(filterPrefix)) {
        // Status filters
        const statuses = [
          { key: 'backlog', label: 'Backlog' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'done', label: 'Done' },
          { key: 'blocked', label: 'Blocked' },
        ];
        for (const s of statuses) {
          if (
            !isCommandMode ||
            s.label.toLowerCase().includes(cmd.replace(filterPrefix, '').trim())
          ) {
            cmds.push({
              id: `filter-status-${s.key}`,
              label: `Filter: Status → ${s.label}`,
              icon: <Filter className="h-3.5 w-3.5" />,
              group: 'Filters',
              action: () => {
                onFilterStatus?.(s.key);
                handleClose();
              },
            });
          }
        }

        // Priority filters
        for (const p of Object.keys(PRIORITY_CONFIG) as TicketPriority[]) {
          const label = PRIORITY_CONFIG[p].label;
          if (
            !isCommandMode ||
            label.toLowerCase().includes(cmd.replace(filterPrefix, '').trim())
          ) {
            cmds.push({
              id: `filter-priority-${p}`,
              label: `Filter: Priority → ${label}`,
              icon: (
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: PRIORITY_CONFIG[p].color }}
                />
              ),
              group: 'Filters',
              action: () => {
                onFilterPriority?.(p);
                handleClose();
              },
            });
          }
        }

        // Type filters
        for (const t of Object.keys(TYPE_CONFIG) as TicketType[]) {
          const config = TYPE_CONFIG[t];
          const Icon = config.icon;
          if (
            !isCommandMode ||
            config.label.toLowerCase().includes(cmd.replace(filterPrefix, '').trim())
          ) {
            cmds.push({
              id: `filter-type-${t}`,
              label: `Filter: Type → ${config.label}`,
              icon: <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />,
              group: 'Filters',
              action: () => {
                onFilterType?.(t);
                handleClose();
              },
            });
          }
        }

        // Assignee filters
        const assigneeFilters = [
          { key: 'all' as const, label: 'All assignees' },
          { key: 'mine' as const, label: 'Assigned to me' },
          { key: 'unassigned' as const, label: 'Unassigned' },
        ];
        for (const a of assigneeFilters) {
          cmds.push({
            id: `filter-assignee-${a.key}`,
            label: `Filter: ${a.label}`,
            icon: <UserPlus className="h-3.5 w-3.5" />,
            group: 'Filters',
            action: () => {
              onFilterAssignee?.(a.key);
              handleClose();
            },
          });
        }

        // Due date filters
        const dueDateFilters = [
          { key: 'overdue' as const, label: 'Overdue' },
          { key: 'today' as const, label: 'Due today' },
          { key: 'this_week' as const, label: 'Due this week' },
          { key: 'none' as const, label: 'No due date' },
        ];
        for (const d of dueDateFilters) {
          cmds.push({
            id: `filter-due-${d.key}`,
            label: `Filter: ${d.label}`,
            icon: <Filter className="h-3.5 w-3.5" />,
            group: 'Filters',
            action: () => {
              onFilterDueDate?.(d.key);
              handleClose();
            },
          });
        }
      }
    }

    // /create command
    if (!isCommandMode || cmd.startsWith('create') || cmd.startsWith('c')) {
      cmds.push({
        id: 'create-ticket',
        label: 'Create new ticket',
        icon: <Plus className="h-3.5 w-3.5" />,
        group: 'Actions',
        action: () => {
          onCreateTicket?.();
          handleClose();
        },
        shortcut: 'C',
      });
    }

    // /label commands — search tickets then assign labels
    if (!isCommandMode || cmd.startsWith('label') || cmd.startsWith('l')) {
      if (labels.length > 0 && tickets.length > 0) {
        const labelSearch = isCommandMode
          ? cmd
              .replace(/^label/, '')
              .replace(/^l/, '')
              .trim()
          : '';
        for (const label of labels) {
          if (!labelSearch || label.name.toLowerCase().includes(labelSearch)) {
            cmds.push({
              id: `label-${label.id}`,
              label: `Label: #${label.name}`,
              icon: (
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
              ),
              group: 'Labels',
              action: () => {
                handleClose();
              },
            });
          }
        }
      }
    }

    // Ticket search (when not in command mode)
    if (!isCommandMode && q) {
      const matching = tickets.filter((t) => t.title.toLowerCase().includes(q)).slice(0, 5);
      for (const t of matching) {
        cmds.push({
          id: `ticket-${t.id}`,
          label: t.title,
          icon: <Ticket className="h-3.5 w-3.5" />,
          group: 'Tickets',
          action: () => {
            handleClose();
          },
        });
      }
    }

    return cmds;
  }, [
    query,
    tickets,
    labels,
    onFilterStatus,
    onFilterPriority,
    onFilterType,
    onFilterAssignee,
    onFilterDueDate,
    onCreateTicket,
    handleClose,
  ]);

  const commands = buildCommands();
  const grouped = commands.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const flatCommands = commands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatCommands[selectedIndex]) {
      e.preventDefault();
      flatCommands[selectedIndex].action();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[18vh]"
          data-cmd-palette="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-xl mx-4 bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type / for commands, or search tickets…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none min-w-0 font-mono"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="flex items-center justify-center h-6 w-6 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <kbd className="font-mono text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border rounded px-1.5 py-0.5 shrink-0">
                esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {flatCommands.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                  {query.trim().startsWith('/')
                    ? `Unknown command "${query.trim()}". Try /filter, /create, /label`
                    : 'No matching tickets. Type / for commands.'}
                </div>
              )}

              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 bg-muted/20">
                    {group}
                  </div>
                  {items.map((cmd) => {
                    runningIndex++;
                    const idx = runningIndex;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          idx === selectedIndex ? 'bg-muted' : 'hover:bg-muted/60'
                        }`}
                      >
                        <span className="text-primary shrink-0">{cmd.icon}</span>
                        <span className="text-sm text-foreground flex-1 truncate">{cmd.label}</span>
                        {cmd.shortcut && (
                          <kbd className="font-mono text-[10px] text-muted-foreground bg-muted/60 border border-border rounded px-1.5 py-0.5">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        {idx === selectedIndex && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground/60" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer hints */}
            <div className="border-t border-border/60 px-4 py-2 flex items-center gap-4 bg-muted/30 shrink-0">
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
              <span className="text-[10px] text-muted-foreground ml-auto">
                <kbd className="font-mono bg-background border border-border rounded px-1 py-0.5">
                  /
                </kbd>{' '}
                commands
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
