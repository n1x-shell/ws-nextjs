'use client';

// lib/useShellPresence.ts
// Joins the n1x:shell Ably presence channel on page load so every visitor
// is counted in NODES, even if they never enter the chat room.
// Uses a stable per-browser visitor ID stored in localStorage.

import { useEffect } from 'react';
import * as Ably from 'ably';

function getVisitorId(): string {
  const KEY = 'n1x_visitor_id';
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const id = 'visitor-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return 'visitor-' + Math.random().toString(36).slice(2, 10);
  }
}

export function useShellPresence() {
  useEffect(() => {
    let client: Ably.Realtime | null = null;
    let cancelled = false;

    const connect = async () => {
      try {
        const visitorId = getVisitorId();
        client = new Ably.Realtime({
          authUrl:    `${window.location.origin}/api/ably-token`,
          authMethod: 'GET',
          clientId:   visitorId,
        });

        const channel = client.channels.get('n1x:shell');

        client.connection.once('connected', () => {
          if (cancelled) return;
          channel.presence.enter({ type: 'shell' }).catch(() => {/* ignore */});
        });
      } catch { /* ignore — non-critical */ }
    };

    connect();

    return () => {
      cancelled = true;
      try {
        client?.channels.get('n1x:shell').presence.leave();
        client?.close();
      } catch { /* ignore */ }
    };
  }, []);
}
