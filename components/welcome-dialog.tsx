'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeDialog({ open, onClose }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-playfair font-bold text-foreground">
                Welcome to Syntheon Hub
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Your workspace is ready
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground leading-relaxed">
          You&apos;re in. Start a meeting, and Syntheon Hub will turn the conversation into tickets
          on your board.
        </p>

        <div className="pt-2">
          <Button onClick={onClose} className="w-full rounded-full">
            Get started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
