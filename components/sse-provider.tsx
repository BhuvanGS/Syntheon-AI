'use client';

import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';

type SseEventCallback = (payload: Record<string, unknown>) => void;

interface SseContextValue {
  connected: boolean;
  on: (event: string, cb: SseEventCallback) => void;
  off: (event: string, cb: SseEventCallback) => void;
}

const SseContext = createContext<SseContextValue | null>(null);

export function useSse() {
  const ctx = useContext(SseContext);
  if (!ctx) throw new Error('useSse must be used inside SseProvider');
  return ctx;
}

export function SseProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const listenersRef = useRef<Map<string, Set<SseEventCallback>>>(new Map());
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const on = useCallback((event: string, cb: SseEventCallback) => {
    const listeners = listenersRef.current;
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(cb);
  }, []);

  const off = useCallback((event: string, cb: SseEventCallback) => {
    listenersRef.current.get(event)?.delete(cb);
  }, []);

  useEffect(() => {
    function connect() {
      if (sourceRef.current?.readyState === EventSource.OPEN) return;

      const source = new EventSource('/api/events');
      sourceRef.current = source;

      source.onopen = () => setConnected(true);

      source.onmessage = (e) => {
        // Default message handler — not used since we use named events
        void e;
      };

      source.addEventListener('connected', () => setConnected(true));

      source.addEventListener('meeting_ready', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('meeting_ready')?.forEach((cb) => cb(data));
      });

      source.addEventListener('meeting_failed', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('meeting_failed')?.forEach((cb) => cb(data));
      });

      source.addEventListener('ticket_updated', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('ticket_updated')?.forEach((cb) => cb(data));
      });

      source.addEventListener('ticket_created', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('ticket_created')?.forEach((cb) => cb(data));
      });

      source.addEventListener('ticket_deleted', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('ticket_deleted')?.forEach((cb) => cb(data));
      });

      source.addEventListener('project_created', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('project_created')?.forEach((cb) => cb(data));
      });

      source.addEventListener('project_updated', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('project_updated')?.forEach((cb) => cb(data));
      });

      source.addEventListener('project_deleted', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('project_deleted')?.forEach((cb) => cb(data));
      });

      source.addEventListener('notification_new', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('notification_new')?.forEach((cb) => cb(data));
      });

      source.addEventListener('meeting_status_changed', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get('meeting_status_changed')?.forEach((cb) => cb(data));
      });

      source.addEventListener('ping', () => {
        // Keep-alive, ignore
      });

      source.onerror = () => {
        setConnected(false);
        source.close();
        // Auto-reconnect after 3s
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    }

    connect();

    // Only reconnect on visibility change if connection was lost
    // Don't aggressively close/reconnect - causes unnecessary refetches
    const handleVisibility = () => {
      if (!document.hidden) {
        // Tab became visible - reconnect only if disconnected
        if (!sourceRef.current || sourceRef.current.readyState === EventSource.CLOSED) {
          connect();
        }
      }
      // Don't close on hidden - let browser handle connection management
      // This prevents refetches when switching tabs
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, []);

  return <SseContext.Provider value={{ connected, on, off }}>{children}</SseContext.Provider>;
}
