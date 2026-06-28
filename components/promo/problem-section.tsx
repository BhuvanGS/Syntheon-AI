'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const requests = [
  'Need GitHub integration',
  'Fix staging deployment',
  'Review API auth',
  'Calendar sync broken',
  'Need sprint planning',
  'Can we split OAuth into two tickets?',
  'Update dependencies',
  'Add error logging',
  'Review PR #234',
  'Deploy to production',
];

export function ProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.9, 1]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden"
    >
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-6xl mx-auto text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-lg text-white/50 mb-6 uppercase tracking-widest"
        >
          The problem
        </motion.p>

        <h2 className="text-4xl md:text-6xl lg:text-7xl font-[family-name:var(--font-dm-serif)] mb-16 leading-tight">
          Most meetings end
          <br />
          <span className="text-white/40">with nothing shipped.</span>
        </h2>

        <div className="relative h-[400px] w-full max-w-4xl mx-auto">
          {requests.map((request, i) => {
            const angle = (i / requests.length) * Math.PI * 2;
            const radius = 180 + (i % 3) * 60;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.6;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                whileInView={{ opacity: 1, scale: 1, x, y }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, amount: 0.3 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-2xl whitespace-nowrap">
                  <span className="text-sm md:text-base text-white/80 font-light">{request}</span>
                </div>
              </motion.div>
            );
          })}

          {/* Center element */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center"
          >
            <span className="text-4xl text-white/20">?</span>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-xl text-white/50 mt-16 max-w-xl mx-auto"
        >
          Decisions scatter across Slack, Notion, and Jira. By Monday, nobody remembers what was
          decided.
        </motion.p>
      </motion.div>
    </section>
  );
}
