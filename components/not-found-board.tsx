'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function NotFoundBoard({
  primary,
  secondary,
}: {
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.55)' }}
      >
        <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#0d0d0d] px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[11px] font-bold text-white">
              I
            </div>
            <span className="text-sm text-white/70">The Internet</span>
          </div>
          <span className="text-xs tabular-nums text-white/35">1 ticket</span>
        </div>

        <div className="p-4">
          <div className="flex min-h-[220px] flex-col rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/45" />
                <span className="text-[11px] font-semibold tracking-[0.16em] text-white/50 uppercase">
                  Extracted
                </span>
              </div>
              <span className="text-xs tabular-nums text-white/30">1</span>
            </div>

            <div className="px-3 pb-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="group w-full rounded-lg border border-white/12 bg-white/[0.04] px-3.5 py-3 text-left transition-colors hover:border-white/22 hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
              >
                <span className="block font-[family-name:var(--font-bricolage)] text-lg font-semibold tracking-tight text-white">
                  404
                </span>
                <span className="mt-1 block text-[12px] text-white/40">Click to open</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="border-white/12 bg-[#0c0c0c] text-white sm:max-w-md"
          showCloseButton
        >
          <DialogHeader>
            <p className="text-[11px] tracking-[0.16em] text-white/40 uppercase">
              The Internet · Extracted
            </p>
            <DialogTitle className="font-[family-name:var(--font-bricolage)] text-2xl tracking-tight text-white">
              404
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed text-white/60">
              This URL isn&apos;t a page on Syntheon Hub. The internet extracted it as a ticket
              anyway — open, assign nothing, and go back to a real board.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={primary.href}
              className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-[#050505] no-underline"
            >
              {primary.label}
            </Link>
            <Link
              href={secondary.href}
              className="inline-flex h-10 items-center rounded-lg border border-white/16 px-4 text-sm font-medium text-white/85 no-underline"
            >
              {secondary.label}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
