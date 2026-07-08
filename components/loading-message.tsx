'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const MESSAGES = [
  'Loading...',
  'Almost there.....',
  'Cloudfront delay hold on....',
  "You're seeing this because the page is loading",
];

export function LoadingMessage({
  className,
  intervalMs = 2500,
}: {
  className?: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <span key={index} className={cn('animate-fade-in text-sm text-muted-foreground', className)}>
      {MESSAGES[index]}
    </span>
  );
}
