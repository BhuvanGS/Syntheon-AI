'use client';

import { Heart, Sparkles } from 'lucide-react';
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-playfair font-bold text-foreground">
                Welcome to SyntheonHub
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                A message from the founder
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Hey! I&apos;m the founder of SyntheonHub and right now, it&apos;s just me building this.
          </p>
          <p>
            The idea started with a simple question:{' '}
            <em>What if work could be done just by talking?</em> That question became SyntheonHub.
          </p>
          <p>
            We&apos;re currently in beta, so you&apos;ll probably run into rough edges. Some parts
            of the UI or UX may feel unfinished, there might be architectural quirks, and a few
            features may not work exactly as intended yet. That&apos;s all part of the journey.
          </p>
          <p>
            I encourage you to explore everything, push the product to its limits, document bugs,
            leave comments, criticize it, or even get frustrated with it. Every bit of feedback
            helps me build something better.
          </p>
          <p>
            And if, after using SyntheonHub, you genuinely feel it has the potential to make a
            difference, I&apos;d love for you to leave your thoughts in the{' '}
            <span className="font-medium text-foreground">Feedback</span> section in the sidebar.
            Knowing that someone believes in this vision—and took the time to help improve it—means
            more than you can imagine.
          </p>
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            Thank you for giving SyntheonHub a chance.
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </p>

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700">
            <p className="font-medium">Important note</p>
            <p className="mt-1">
              The beta testing period ends on July 23rd, 2026, and the application will be closed
              after that date. Please make sure to share your feedback before then.
            </p>
            <p className="mt-2">
              You can use Clerk&apos;s test account to explore the app, but I would not recommend it
              for real usage.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={onClose} className="w-full rounded-full">
            Let&apos;s get started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
