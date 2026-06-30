import type { TicketPriority, TicketType, TicketEstimate } from '@/components/ticket-badges';

export interface TicketFilters {
  status: string | null;
  priority: TicketPriority | null;
  type: TicketType | null;
  estimate: TicketEstimate | null;
  labelIds: string[];
  assignee: 'all' | 'mine' | 'unassigned';
  dueDate: 'all' | 'overdue' | 'today' | 'this_week' | 'none';
}

export const EMPTY_FILTERS: TicketFilters = {
  status: null,
  priority: null,
  type: null,
  estimate: null,
  labelIds: [],
  assignee: 'all',
  dueDate: 'all',
};
