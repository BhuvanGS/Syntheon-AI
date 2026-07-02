import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetTime) store.delete(key);
  }
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyFn?: (req: NextRequest) => string;
}

export function rateLimit({ windowMs, max, keyFn }: RateLimitOptions) {
  return async function check(req: NextRequest, userId?: string): Promise<NextResponse | null> {
    cleanup();

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const key = keyFn ? keyFn(req) : `${userId ?? ip}`;

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return null;
    }

    entry.count++;
    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    return null;
  };
}

export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
});

export const webhookRateLimit = rateLimit({
  windowMs: 60_000,
  max: 30,
});

export const aiRateLimit = rateLimit({
  windowMs: 60_000,
  max: 10,
});
