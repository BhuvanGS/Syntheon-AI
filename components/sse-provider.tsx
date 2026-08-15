'use client';

import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

type SseEventCallback = (payload: Record<string, unknown>) => void;

interface SseContextValue {
  connected: boolean;
  on: (event: string, cb: SseEventCallback) => void;
  off: (event: string, cb: SseEventCallback) => void;
}

const SseContext = createContext<SseContextValue | null>(null);

/** Short JSON polls — avoids holding an OpenNext Lambda for the session. */
const POLL_MS = 3000;
const HIDDEN_POLL_MS = 15000;

export function useSse() {
  const ctx = useContext(SseContext);
  if (!ctx) throw new Error('useSse must be used inside SseProvider');
  return ctx;
}

export function SseProvider({ children }: { children: React.ReactNode }) {
  const { orgId, userId } = useAuth();
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<Map<string, Set<SseEventCallback>>>(new Map());
  const orgCursorRef = useRef('');
  const userCursorRef = useRef('');
  const inflightRef = useRef(false);

  const on = useCallback((event: string, cb: SseEventCallback) => {
    const listeners = listenersRef.current;
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(cb);
  }, []);

  const off = useCallback((event: string, cb: SseEventCallback) => {
    listenersRef.current.get(event)?.delete(cb);
  }, []);

  useEffect(() => {
    if (!orgId || !userId) {
      setConnected(false);
      return;
    }

    orgCursorRef.current = new Date().toISOString();
    userCursorRef.current = orgCursorRef.current;
    let cancelled = false;

    const emit = (type: string, payload: Record<string, unknown>) => {
      if (type === 'notification_new' && payload.userId && payload.userId !== userId) return;
      listenersRef.current.get(type)?.forEach((cb) => cb(payload));
    };

    const poll = async () => {
      if (cancelled || inflightRef.current) return;
      inflightRef.current = true;
      try {
        const params = new URLSearchParams({
          orgAfter: orgCursorRef.current,
          userAfter: userCursorRef.current,
        });
        const res = await fetch(`/api/events?${params.toString()}`, { cache: 'no-store' });
        if (cancelled) return;
        if (!res.ok) {
          setConnected(false);
          return;
        }
        const data = (await res.json()) as {
          events?: Array<{ type: string; payload?: unknown; eventKey: string; channel: string }>;
          orgCursor?: string;
          userCursor?: string;
        };
        setConnected(true);
        if (typeof data.orgCursor === 'string' && data.orgCursor) {
          orgCursorRef.current = data.orgCursor;
        }
        if (typeof data.userCursor === 'string' && data.userCursor) {
          userCursorRef.current = data.userCursor;
        }
        for (const event of data.events ?? []) {
          const payload =
            event.payload && typeof event.payload === 'object'
              ? (event.payload as Record<string, unknown>)
              : {};
          emit(event.type, payload);
        }
      } catch {
        if (!cancelled) setConnected(false);
      } finally {
        inflightRef.current = false;
      }
    };

    void poll();

    let timer: ReturnType<typeof setInterval> | null = null;
    const arm = () => {
      if (timer) clearInterval(timer);
      const ms = document.hidden ? HIDDEN_POLL_MS : POLL_MS;
      timer = setInterval(() => {
        void poll();
      }, ms);
    };
    arm();

    const handleVisibility = () => {
      arm();
      if (!document.hidden) void poll();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timer) clearInterval(timer);
      setConnected(false);
    };
  }, [orgId, userId]);

  return <SseContext.Provider value={{ connected, on, off }}>{children}</SseContext.Provider>;
}
