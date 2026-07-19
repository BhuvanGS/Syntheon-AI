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

export function useSse() {
  const ctx = useContext(SseContext);
  if (!ctx) throw new Error('useSse must be used inside SseProvider');
  return ctx;
}

export function SseProvider({ children }: { children: React.ReactNode }) {
  const { orgId, userId } = useAuth();
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
    if (!orgId || !userId) {
      sourceRef.current?.close();
      sourceRef.current = null;
      setConnected(false);
      return;
    }

    function connect() {
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }

      const source = new EventSource('/api/events');
      sourceRef.current = source;

      source.onopen = () => setConnected(true);

      source.onmessage = (e) => {
        void e;
      };

      source.addEventListener('connected', () => setConnected(true));

      const forward = (eventName: string) => (e: Event) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        listenersRef.current.get(eventName)?.forEach((cb) => cb(data));
      };

      source.addEventListener('meeting_ready', forward('meeting_ready'));
      source.addEventListener('meeting_failed', forward('meeting_failed'));
      source.addEventListener('ticket_updated', forward('ticket_updated'));
      source.addEventListener('ticket_created', forward('ticket_created'));
      source.addEventListener('ticket_deleted', forward('ticket_deleted'));
      source.addEventListener('project_created', forward('project_created'));
      source.addEventListener('project_updated', forward('project_updated'));
      source.addEventListener('project_deleted', forward('project_deleted'));
      source.addEventListener('notification_new', (e) => {
        const data = JSON.parse((e as MessageEvent).data) as Record<string, unknown>;
        // Defense in depth — only surface notifications for this user
        if (data.userId && data.userId !== userId) return;
        listenersRef.current.get('notification_new')?.forEach((cb) => cb(data));
      });
      source.addEventListener('meeting_status_changed', forward('meeting_status_changed'));
      source.addEventListener('ping', () => {});

      source.onerror = () => {
        setConnected(false);
        source.close();
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    }

    connect();

    const handleVisibility = () => {
      if (!document.hidden) {
        if (!sourceRef.current || sourceRef.current.readyState === EventSource.CLOSED) {
          connect();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      sourceRef.current?.close();
      sourceRef.current = null;
      setConnected(false);
    };
  }, [orgId, userId]);

  return <SseContext.Provider value={{ connected, on, off }}>{children}</SseContext.Provider>;
}
