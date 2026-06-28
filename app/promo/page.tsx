'use client';

import { useRef } from 'react';
import { HeroSection } from '@/components/promo/hero-section';
import { ProblemSection } from '@/components/promo/problem-section';
import { DemoSection } from '@/components/promo/demo-section';
import { FeaturesSection } from '@/components/promo/features-section';
import { CTASection } from '@/components/promo/cta-section';

export default function PromoPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <main
      ref={containerRef}
      className="relative bg-black text-white overflow-x-hidden"
      style={{ scrollBehavior: 'smooth' }}
    >
      <HeroSection />
      <ProblemSection />
      <DemoSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
}
