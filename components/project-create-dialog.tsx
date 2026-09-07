'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
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
import { FolderPlus, X } from 'lucide-react';
import { PlanLimitBlock } from '@/components/billing-paused';
import { useBillingAccess } from '@/hooks/use-billing-access';

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
    code?: string;
  } | null>(null);
  const { writePaused } = useBillingAccess();

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
      if (msg.includes('limit') || msg.toLowerCase().includes('trial')) {
        setLimitReached({ resource: 'projects', used: 0, limit: 1, code: 'trial_expired' });
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl border-border bg-background shadow-2xl"
        showCloseButton={false}
      >
        {limitReached || writePaused ? (
          <PlanLimitBlock
            code={limitReached?.code ?? (writePaused ? 'trial_expired' : undefined)}
            resource={limitReached?.resource ?? 'projects'}
            limit={limitReached?.limit ?? 0}
            onDismiss={() => onOpenChange(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="block h-0.5 w-5 rounded-full bg-primary" />
                    <span className="block h-0.5 w-5 rounded-full bg-primary" />
                  </div>
                  <DialogTitle className="font-playfair text-2xl text-foreground">
                    Create a new project
                  </DialogTitle>
                </div>
                <DialogPrimitive.Close className="rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </div>
              <DialogDescription className="text-muted-foreground">
                Start a workspace for a product, client, or feature stream. You'll set up your board
                columns next.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="app-field">
                <div className="app-field-head">
                  <label className="app-field-label">Project name</label>
                </div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Atlas Revamp"
                  className="bg-white"
                  autoFocus
                />
              </div>

              <div className="app-field">
                <div className="app-field-head">
                  <label className="app-field-label">Context</label>
                </div>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="A short description of the project goals, scope, and constraints."
                  className="min-h-28 bg-white"
                />
              </div>
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
