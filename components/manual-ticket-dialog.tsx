'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CirclePlus, Sparkles } from 'lucide-react';
import { AssigneePicker, type AssigneeValue } from '@/components/assignee-picker';
import { TicketMetadataEditor } from '@/components/ticket-metadata-editor';
import {
  type TicketPriority,
  type TicketType,
  type TicketEstimate,
} from '@/components/ticket-badges';

interface MeetingOption {
  id: string;
  projectName: string;
}

interface ManualTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetings: MeetingOption[];
  defaultMeetingId?: string | null;
  defaultProjectId?: string | null;
  defaultStatus?: string;
  statusOptions?: { value: string; label: string }[];
  projectOnly?: boolean;
  onCreated?: () => void | Promise<void>;
}

export function ManualTicketDialog({
  open,
  onOpenChange,
  meetings,
  defaultMeetingId,
  defaultProjectId,
  defaultStatus,
  statusOptions,
  projectOnly = false,
  onCreated,
}: ManualTicketDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>(defaultStatus ?? 'backlog');
  const [assignee, setAssignee] = useState<AssigneeValue | null>(null);
  const [meetingId, setMeetingId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [priority, setPriority] = useState<TicketPriority>('none');
  const [type, setType] = useState<TicketType>('task');
  const [estimate, setEstimate] = useState<TicketEstimate>('none');
  const [labels, setLabels] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<
    { id: string; name: string; color: string }[]
  >([]);
  const wasOpenRef = useRef(false);

  const resolvedMeetingId = useMemo(
    () => (projectOnly ? '' : meetingId || defaultMeetingId || meetings[0]?.id || ''),
    [meetingId, defaultMeetingId, meetings, projectOnly]
  );

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus ?? 'backlog');
      setAssignee(null);
      setMeetingId(projectOnly ? '' : defaultMeetingId || meetings[0]?.id || '');
      setPriority('none');
      setType('task');
      setEstimate('none');
      setLabels([]);
      setSubmitting(false);
    }

    wasOpenRef.current = open;
  }, [open, defaultMeetingId, defaultStatus, meetings, projectOnly]);

  useEffect(() => {
    if (open) {
      void (async () => {
        try {
          const res = await fetch('/api/labels');
          if (res.ok) {
            const data = await res.json();
            setAvailableLabels(data.labels ?? []);
          }
        } catch {
          // ignore
        }
      })();
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        assignee: assignee?.displayName ?? null,
        assigneeUserId: assignee?.userId ?? null,
        projectId: defaultProjectId ?? null,
        priority,
        type,
        estimate,
        labels,
      };

      const res = resolvedMeetingId
        ? await fetch(`/api/meetings/${resolvedMeetingId}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : defaultProjectId
          ? await fetch(`/api/projects/${defaultProjectId}/tickets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          : null;

      if (!res) {
        throw new Error('No meeting available for ticket creation');
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create ticket');
      }

      await onCreated?.();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-border bg-background shadow-2xl">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary w-fit mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Manual ticket writing
          </div>
          <DialogTitle className="font-playfair text-2xl text-foreground">
            Create a ticket
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {projectOnly
              ? 'Write a Jira-style ticket manually for this project without linking it to a meeting.'
              : 'Write a Jira-style ticket manually and attach it to one of your meetings.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Design the billing settings panel"
              className="bg-background"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add enough context for the next person to execute without asking twice."
              className="min-h-28 bg-background"
            />
          </div>

          <div className={`grid grid-cols-1 gap-4 ${projectOnly ? '' : 'sm:grid-cols-2'}`}>
            {!projectOnly && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Meeting</label>
                <Select
                  value={resolvedMeetingId}
                  onValueChange={(value) => setMeetingId(value)}
                  disabled={meetings.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a meeting" />
                  </SelectTrigger>
                  <SelectContent>
                    {meetings.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        No meetings available
                      </SelectItem>
                    ) : (
                      meetings.map((meeting) => (
                        <SelectItem key={meeting.id} value={meeting.id}>
                          {meeting.projectName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {(statusOptions && statusOptions.length > 0
                    ? statusOptions
                    : [
                        { value: 'backlog', label: 'Backlog' },
                        { value: 'in_progress', label: 'In progress' },
                        { value: 'done', label: 'Done' },
                        { value: 'blocked', label: 'Blocked' },
                      ]
                  ).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Assignee</label>
            <AssigneePicker value={assignee} onChange={setAssignee} />
          </div>

          <div className="border-t border-border/60 pt-3">
            <p className="text-sm font-medium text-foreground mb-2">Properties</p>
            <TicketMetadataEditor
              priority={priority}
              type={type}
              estimate={estimate}
              labels={labels}
              onPriorityChange={setPriority}
              onTypeChange={setType}
              onEstimateChange={setEstimate}
              onLabelsChange={setLabels}
              availableLabels={availableLabels}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="rounded-full gap-2"
            >
              <CirclePlus className="h-4 w-4" />
              {submitting ? 'Creating...' : 'Create ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
