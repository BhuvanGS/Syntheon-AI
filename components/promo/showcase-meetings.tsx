'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Video, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';

const meetings = [
  {
    id: '1',
    title: 'Auth Dashboard — Sprint Review',
    status: 'completed',
    date: 'Jun 26, 2026',
    platform: 'Google Meet',
    tickets: 8,
  },
  {
    id: '2',
    title: 'API Refactor Planning',
    status: 'processing',
    date: 'Jun 25, 2026',
    platform: 'Zoom',
    tickets: 0,
  },
  {
    id: '3',
    title: 'Dependency Graph Design',
    status: 'completed',
    date: 'Jun 24, 2026',
    platform: 'Teams',
    tickets: 5,
  },
  {
    id: '4',
    title: 'Q3 Roadmap Alignment',
    status: 'failed',
    date: 'Jun 23, 2026',
    platform: 'Google Meet',
    tickets: 0,
  },
];

const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
  completed: {
    icon: CheckCircle2,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
    label: 'Completed',
  },
  processing: { icon: Loader2, color: '#eab308', bg: 'rgba(234,179,8,0.15)', label: 'Processing' },
  failed: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Failed' },
};

function MeetingsInner() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/60 overflow-hidden">
      {/* Header */}
      <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">S</span>
          </div>
          <span className="text-xs text-white/60">Meetings</span>
        </div>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-[10px] text-white/80"
          aria-label="Start new meeting"
        >
          <Video className="w-3 h-3" aria-hidden="true" />
          New meeting
        </button>
      </div>

      {/* Meeting cards grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {meetings.map((meeting, i) => {
          const config = STATUS_CONFIG[meeting.status];
          const Icon = config?.icon ?? Clock;
          const spin = meeting.status === 'processing';

          return (
            <motion.div
              key={meeting.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.3 }}
              className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-medium"
                  style={{ color: config?.color, backgroundColor: config?.bg }}
                >
                  <Icon
                    className={`w-2.5 h-2.5 ${spin ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  {config?.label}
                </span>
                <span className="text-[9px] text-white/30">{meeting.platform}</span>
              </div>
              <h3 className="text-xs text-white/90 font-medium mb-2 leading-snug">
                {meeting.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/30 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                  {meeting.date}
                </span>
                {meeting.tickets > 0 && (
                  <span className="text-[9px] text-white/50 tabular-nums">
                    {meeting.tickets} tickets
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function ShowcaseMeetings({ hero }: { hero?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);
  const x = useTransform(scrollYProgress, [0, 0.5], [-40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3]);

  const style = hero ? {} : { rotate, x, opacity, transformPerspective: 1200 };
  const className = hero ? 'relative w-full' : 'relative w-full max-w-3xl mx-auto';

  return (
    <motion.div ref={ref} style={style} className={className}>
      <MeetingsInner />
    </motion.div>
  );
}
