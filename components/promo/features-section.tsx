'use client';

import { motion } from 'motion/react';
import { Video, Ticket, GitBranch, Bell, Sparkles, Zap } from 'lucide-react';

// React Bits component
import GlassIconsRaw from '@/components/GlassIcons';
const GlassIcons = GlassIconsRaw as any;

const features = [
  {
    icon: Video,
    title: 'Meeting capture',
    description:
      'Record Google Meet, Zoom, or Teams. SyntheonHub transcribes and extracts decisions automatically.',
  },
  {
    icon: Ticket,
    title: 'Ticket generation',
    description:
      'Turn discussions into backlog items with titles, descriptions, and acceptance criteria in seconds.',
  },
  {
    icon: GitBranch,
    title: 'Dependency mapping',
    description:
      'Visualize hard and soft blockers. Know what must ship first before work gets stuck.',
  },
  {
    icon: Bell,
    title: 'Smart notifications',
    description:
      'Get notified when dependencies resolve, meetings finish processing, or tickets need attention.',
  },
  {
    icon: Sparkles,
    title: 'AI-assisted workflow',
    description: 'Let AI suggest ticket splits, detect stale work, and summarize meeting outcomes.',
  },
  {
    icon: Zap,
    title: 'Project boards',
    description:
      'Kanban, list, calendar, and Gantt views — all synced from your meetings and tickets.',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-lg text-white/50 mb-4 uppercase tracking-widest"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-[family-name:var(--font-dm-serif)] mb-6"
          >
            Everything after the meeting
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.3 }}
                className="group p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
