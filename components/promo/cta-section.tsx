'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

// React Bits component
import MagicRingsRaw from '@/components/MagicRings';
const MagicRings = MagicRingsRaw as any;

export function CTASection() {
  const [email, setEmail] = useState('');

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden">
      {/* React Bits MagicRings background */}
      <div className="absolute inset-0 opacity-30">
        <MagicRings />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-lg text-white/50 mb-6 uppercase tracking-widest"
        >
          Early access
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl lg:text-8xl font-[family-name:var(--font-dm-serif)] mb-8 leading-tight"
        >
          Stop losing
          <br />
          <span className="text-green-500/80">meeting decisions.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-xl text-white/50 max-w-2xl mx-auto mb-12"
        >
          Join the free beta. 50 spots. No credit card required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-medium text-lg hover:bg-white/90 transition-colors whitespace-nowrap">
            Get access
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h3 className="text-4xl md:text-6xl font-[family-name:var(--font-dm-serif)] tracking-tight text-white">
            SyntheonHub
          </h3>
          <p className="text-white/40 mt-4 text-lg">SyntheonHub.dev</p>
        </motion.div>
      </div>
    </section>
  );
}
