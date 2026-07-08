'use client';

import { Linkedin, Heart, MessageSquare } from 'lucide-react';

const FOUNDER_LINKEDIN = 'https://www.linkedin.com/in/bhuvan-gs/';
const PRODUCT_LINKEDIN = 'https://www.linkedin.com/in/syntheon-hub-ba901641a/';

export function FeedbackView() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-playfair font-bold text-foreground">Feedback</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Send your findings and feedback to the founder directly
            </p>
          </div>
        </div>

        {/* Message card */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you&apos;re interested in our product, I post updates about the application on
            LinkedIn. Follow along to stay in the loop — your support means a lot.
          </p>

          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            Thank you for being part of this journey.
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </div>
        </div>

        {/* LinkedIn links */}
        <div className="mt-6 space-y-3">
          <a
            href={FOUNDER_LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0A66C2]/20 transition-colors">
              <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Founder&apos;s LinkedIn</p>
              <p className="text-xs text-muted-foreground truncate">Bhuvan G S</p>
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
              Connect →
            </span>
          </a>

          <a
            href={PRODUCT_LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center shrink-0 group-hover:bg-[#0A66C2]/20 transition-colors">
              <Linkedin className="h-5 w-5 text-[#0A66C2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">SyntheonHub on LinkedIn</p>
              <p className="text-xs text-muted-foreground truncate">Follow for product updates</p>
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
              Follow →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
