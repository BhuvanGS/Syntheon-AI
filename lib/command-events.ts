type CommandHandler = (payload?: unknown) => void;
const handlers = new Map<string, Set<CommandHandler>>();

export function onCommand(event: string, handler: CommandHandler) {
  if (!handlers.has(event)) handlers.set(event, new Set());
  handlers.get(event)!.add(handler);
  return () => {
    handlers.get(event)?.delete(handler);
  };
}

export function emitCommand(event: string, payload?: unknown) {
  handlers.get(event)?.forEach((h) => h(payload));
}

export type CommandEvents = {
  'filter:open-dialog': void;
  'filter:priority': string;
  'filter:type': string;
  'filter:status': string;
  'filter:assignee': 'all' | 'mine' | 'unassigned';
  'filter:dueDate': 'all' | 'overdue' | 'today' | 'this_week' | 'none';
  'create:ticket': void;
};
