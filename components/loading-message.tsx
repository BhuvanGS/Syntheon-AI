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
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(Math.floor(Math.random() * MESSAGES.length));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <span key={index} className={cn('animate-fade-in text-sm text-muted-foreground', className)}>
      {MESSAGES[index]}
    </span>
  );
}
