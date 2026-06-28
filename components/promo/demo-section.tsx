'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { MockApp } from './mock-app';

export function DemoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [100, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-green-500/5 via-transparent to-transparent pointer-events-none" />

      <motion.div style={{ opacity, y }} className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-lg text-white/50 mb-4 uppercase tracking-widest">The solution</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-[family-name:var(--font-dm-serif)] mb-6 leading-tight">
            Ours begin
            <br />
            <span className="text-green-500/80">where meetings end.</span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Record your meeting. SyntheonHub extracts the work, creates tickets, and maps the
            dependencies.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <MockApp />
        </motion.div>
      </motion.div>
    </section>
  );
}
