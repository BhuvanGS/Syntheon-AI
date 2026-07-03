'use client';

import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack';
import { Mic, Sparkles, GitBranch, Calendar, Zap, Rocket } from 'lucide-react';

export function ScrollStackShowcase() {
  return (
    <section className="py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40 mb-4">
          How Syntheon Works
        </p>
        <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
          From meeting to shipped work.
        </h2>
        <p className="mt-4 text-lg text-white/40 max-w-2xl mx-auto">
          Scroll through the stack to see every step Syntheon handles automatically.
        </p>
      </div>

      <div className="w-[95vw] max-w-none mx-auto rounded-3xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60">
        <ScrollStack
          itemDistance={120}
          itemScale={0.05}
          itemStackDistance={20}
          stackPosition="20%"
          scaleEndPosition="12%"
          baseScale={0.85}
          rotationAmount={0}
          blurAmount={4}
          useWindowScroll
        >
          <ScrollStackItem>
            <div className="card-icon">
              <Mic size={28} />
            </div>
            <h2>Join the meeting</h2>
            <p>
              Syntheon joins your Google Meet, Zoom, or Teams call as a participant and records the
              conversation.
            </p>
          </ScrollStackItem>

          <ScrollStackItem>
            <div className="card-icon">
              <Sparkles size={28} />
            </div>
            <h2>Transcribe with AI</h2>
            <p>
              Every word is transcribed, speakers are identified, and key moments are timestamped
              automatically.
            </p>
          </ScrollStackItem>

          <ScrollStackItem>
            <div className="card-icon">
              <GitBranch size={28} />
            </div>
            <h2>Extract tickets</h2>
            <p>
              Decisions, blockers, and action items become structured tickets with titles,
              descriptions, and priorities.
            </p>
          </ScrollStackItem>

          <ScrollStackItem>
            <div className="card-icon">
              <Calendar size={28} />
            </div>
            <h2>Organize the board</h2>
            <p>
              Tickets land on the Kanban board in the right columns. Dependencies and due dates are
              set instantly.
            </p>
          </ScrollStackItem>

          <ScrollStackItem>
            <div className="card-icon">
              <Zap size={28} />
            </div>
            <h2>Auto-organize</h2>
            <p>
              Syntheon moves tickets to the right columns, sets dependencies, and keeps your board
              in sync — no manual updates needed.
            </p>
          </ScrollStackItem>

          <ScrollStackItem>
            <div className="card-icon">
              <Rocket size={28} />
            </div>
            <h2>Ship</h2>
            <p>
              Track velocity, cycle time, and milestones. Everything stays updated automatically as
              your team ships.
            </p>
          </ScrollStackItem>
        </ScrollStack>
      </div>
    </section>
  );
}
