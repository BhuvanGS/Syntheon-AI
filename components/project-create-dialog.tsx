'use client';

import { useEffect, useState } from 'react';
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
import { FolderPlus, Sparkles, Lock } from 'lucide-react';

export interface BoardColumn {
  id: string;
  label: string;
  color: string;
  status: string;
}

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: { name: string; context: string }) => Promise<void> | void;
}

export function ProjectCreateDialog({ open, onOpenChange, onCreate }: ProjectCreateDialogProps) {
  const [name, setName] = useState('');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState<{
    resource: string;
    used: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setName('');
    setContext('');
    setSubmitting(false);
    setError(null);
    setLimitReached(null);
  }, [open]);

  const canCreate = name.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    setLimitReached(null);
    try {
      await onCreate({
        name: name.trim(),
        context: context.trim(),
      });
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      if (msg.includes('limit')) {
        setLimitReached({ resource: 'projects', used: 0, limit: 1 });
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-border bg-background shadow-2xl">
        {limitReached ? (
          <div className="space-y-4 rounded-2xl border border-primary/10 bg-primary/5 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <p className="font-playfair text-2xl text-foreground">
                You've hit the beta testing limit
              </p>
              <p className="text-sm text-muted-foreground">
                You've used all {limitReached.limit} {limitReached.resource} during the beta. Limits
                will be lifted after the beta period ends.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-full"
              >
                Maybe later
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary w-fit mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Syntheon Hub Projects
              </div>
              <DialogTitle className="font-playfair text-2xl text-foreground">
                Create a new project
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Start a workspace for a product, client, or feature stream. You'll set up your board
                columns next.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Atlas Revamp"
                className="bg-white"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Context</label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="A short description of the project goals, scope, and constraints."
                className="min-h-28 bg-white"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

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
                disabled={submitting || !canCreate}
                className="rounded-full gap-2"
              >
                <FolderPlus className="h-4 w-4" />
                {submitting ? 'Creating...' : 'Create project'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
