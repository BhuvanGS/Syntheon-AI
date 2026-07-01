'use client';

import { useState, useMemo, useCallback } from 'react';
import { GripVertical, PlusCircle, Loader2 } from 'lucide-react';
import {
  TicketBadges,
  type TicketPriority,
  type TicketType,
  type TicketEstimate,
} from '@/components/ticket-badges';

interface BacklogTicket {
  id: string;
  title: string;
  status: string;
  priority?: string;
  type?: string;
  estimate?: string;
  labels?: string[];
  assignee?: string | null;
  dependency_ticket_id?: string | null;
  rank?: number | null;
  createdAt?: string | null;
  [key: string]: unknown;
}

interface BacklogViewProps {
  tickets: BacklogTicket[];
  labelMap: Record<string, { name: string; color: string }>;
  onReorder: (rankUpdates: { id: string; rank: number }[]) => Promise<void>;
  onTicketClick: (ticket: BacklogTicket) => void;
  onAddTicket: () => void;
}

export function BacklogView({
  tickets,
  labelMap,
  onReorder,
  onTicketClick,
  onAddTicket,
}: BacklogViewProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const backlogTickets = useMemo(() => {
    return tickets
      .filter((t) => t.status === 'backlog' && !t.dependency_ticket_id)
      .sort((a, b) => {
        if (a.rank != null && b.rank != null) return a.rank - b.rank;
        if (a.rank != null) return -1;
        if (b.rank != null) return 1;
        return (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      });
  }, [tickets]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, id: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedId && draggedId !== id) {
        setDragOverId(id);
      }
    },
    [draggedId]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      setDragOverId(null);

      if (!draggedId || draggedId === targetId) {
        setDraggedId(null);
        return;
      }

      const draggedIndex = backlogTickets.findIndex((t) => t.id === draggedId);
      const targetIndex = backlogTickets.findIndex((t) => t.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedId(null);
        return;
      }

      const reordered = [...backlogTickets];
      const [moved] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      const rankUpdates = reordered.map((t, idx) => ({ id: t.id, rank: idx + 1 }));

      setSaving(true);
      try {
        await onReorder(rankUpdates);
      } finally {
        setSaving(false);
        setDraggedId(null);
      }
    },
    [draggedId, backlogTickets, onReorder]
  );

  if (backlogTickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground mb-3">No tickets in backlog</p>
        <button
          onClick={onAddTicket}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add ticket to backlog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Backlog ({backlogTickets.length})
        </h3>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
        {backlogTickets.map((ticket, idx) => (
          <div
            key={ticket.id}
            draggable
            onDragStart={(e) => handleDragStart(e, ticket.id)}
            onDragOver={(e) => handleDragOver(e, ticket.id)}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => handleDrop(e, ticket.id)}
            onClick={() => onTicketClick(ticket)}
            className={`flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing transition-colors ${
              idx < backlogTickets.length - 1 ? 'border-b border-border/40' : ''
            } ${draggedId === ticket.id ? 'opacity-40' : ''} ${
              dragOverId === ticket.id
                ? 'bg-primary/10 border-t-2 border-t-primary'
                : 'hover:bg-muted/50'
            }`}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0 w-6">
              {idx + 1}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <TicketBadges
                priority={(ticket.priority ?? 'none') as TicketPriority}
                type={(ticket.type ?? 'task') as TicketType}
                estimate={(ticket.estimate ?? 'none') as TicketEstimate}
                labels={ticket.labels ?? []}
                labelMap={labelMap}
              />
            </div>
            <span className="text-sm font-medium text-foreground truncate flex-1">
              {ticket.title}
            </span>
            {ticket.assignee && (
              <span className="text-[11px] text-muted-foreground shrink-0">@{ticket.assignee}</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onAddTicket}
        className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-colors rounded-lg"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        Add ticket to backlog
      </button>
    </div>
  );
}
