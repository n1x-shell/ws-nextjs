'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Ably from 'ably';
import { exportForRoom, mergeFromRoom, type TrustLevel } from '@/lib/argState';
import { eventBus } from '@/lib/eventBus';

// ── Types ─────────────────────────────────────────────────────────────────────

// Multiplayer is always 'active'. 'exposed' fires when Option D thresholds hit.
export type DaemonState = 'active' | 'exposed';

export interface RoomMsg {
  id: string;
  handle: string;
  text: string;
  ts: number;
  isN1X: boolean;
  isSystem: boolean;
  isUnprompted: boolean;
}

// ── f010 thresholds (Option D) ────────────────────────────────────────────────
const F010_MIN_TIME_MS   = 10 * 60 * 1000; // 10 minutes in room together
const F010_MIN_MESSAGES  = 10;              // messages exchanged
const F010_MIN_N1X_PINGS = 2;              // @n1x triggers sent

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseAblyRoomResult {
  messages: RoomMsg[];
  occupantCount: number;
  daemonState: DaemonState;
  isConnected: boolean;
  send: (text: string) => void;
}

export function useAblyRoom(handle: string): UseAblyRoomResult {
  const [messages, setMessages]           = useState<RoomMsg[]>([]);
  const [occupantCount, setOccupantCount] = useState(0);
  const [daemonState, setDaemonState]     = useState<DaemonState>('active');
  const [isConnected, setIsConnected]     = useState(false);

  const clientRef    = useRef<Ably.Realtime | null>(null);
  const channelRef   = useRef<Ably.RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);

  // f010 tracking — session-scoped
  const joinedAtRef      = useRef<number>(0);
  const messageCountRef  = useRef(0);
  const n1xPingCountRef  = useRef(0);
  const f010IssuedRef    = useRef(false);
  const lastUnpromptedRef = useRef(0);

  const handlesRef       = useRef<string[]>([]);
  const recentHistoryRef = useRef<string[]>([]);

  const addMessage = useCallback((msg: Omit<RoomMsg, 'id'>) => {
    if (!isMountedRef.current) return;
    setMessages(prev => [...prev, { ...msg, id: makeId() }]);
    eventBus.emit('shell:request-scroll');
  }, []);

  const send = useCallback((text: string) => {
    channelRef.current?.publish('chat', { handle, text, ts: Date.now() });
  }, [handle]);

  // ── N1X response ─────────────────────────────────────────────────────────

  const triggerN1X = useCallback(async (text: string, triggerHandle: string) => {
    const recent = recentHistoryRef.current.slice(-8).join('\n');
    try {
      await fetch('/api/ghost/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          triggerHandle,
          handles: handlesRef.current,
          daemonState: f010IssuedRef.current ? 'exposed' : 'active',
          occupantCount: handlesRef.current.length,
          recentHistory: recent,
        }),
      });
    } catch { /* ghost channel unreliable by design */ }
  }, []);

  // ── Unprompted transmission ───────────────────────────────────────────────

  const maybeUnprompted = useCallback(async () => {
    const count   = handlesRef.current.length;
    const cooldown = Date.now() - lastUnpromptedRef.current >= 8 * 60 * 1000;
    if (count < 2 || !cooldown) return;

    lastUnpromptedRef.current = Date.now();
    try {
      await fetch('/api/ghost/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unprompted: true,
          handles: handlesRef.current,
          daemonState: f010IssuedRef.current ? 'exposed' : 'active',
          occupantCount: count,
        }),
      });
    } catch { /* fail silently */ }
  }, []);

  // ── f010 threshold check (Option D) ──────────────────────────────────────
  // Runs after every message sent by this client.
  // Only this client triggers the API call — avoids duplicates.

  const checkF010 = useCallback(async () => {
    if (f010IssuedRef.current) return;
    if (handlesRef.current.length < 2) return;

    const timeInRoom = Date.now() - joinedAtRef.current;
    const timeOk     = timeInRoom >= F010_MIN_TIME_MS;
    const msgsOk     = messageCountRef.current >= F010_MIN_MESSAGES;
    const pingsOk    = n1xPingCountRef.current >= F010_MIN_N1X_PINGS;

    if (timeOk && msgsOk && pingsOk) {
      f010IssuedRef.current = true;
      setDaemonState('exposed');

      try {
        await fetch('/api/ghost/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkExposed: true,
            handles: handlesRef.current,
          }),
        });
      } catch { /* fail silently */ }
    }
  }, []);

  // ── Main effect ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!handle) return;
    isMountedRef.current = true;

    const client = new Ably.Realtime({ authUrl: '/api/ably/token', clientId: handle });
    clientRef.current = client;

    const channel = client.channels.get('port-33');
    channelRef.current = channel;

    // ── Presence ────────────────────────────────────────────────────────────

    const updatePresence = () => {
      channel.presence.get((err, members) => {
        if (err || !members || !isMountedRef.current) return;
        handlesRef.current = members.map(m => m.clientId ?? 'unknown');
        setOccupantCount(members.length);
      });
    };

    channel.presence.subscribe(updatePresence);

    // ── Chat ─────────────────────────────────────────────────────────────────

    channel.subscribe('chat', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as { handle: string; text: string; ts: number };

      addMessage({
        handle: data.handle,
        text: data.text,
        ts: data.ts,
        isN1X: false,
        isSystem: false,
        isUnprompted: false,
      });

      recentHistoryRef.current = [
        ...recentHistoryRef.current.slice(-19),
        `  [${data.handle}]: ${data.text}`,
      ];

      // Only count + check thresholds from this client's own sends
      if (data.handle === handle) {
        messageCountRef.current += 1;

        if (data.text.toLowerCase().includes('@n1x')) {
          n1xPingCountRef.current += 1;
          triggerN1X(data.text, handle);
        }

        checkF010();
        maybeUnprompted();
      }
    });

    // ── N1X ──────────────────────────────────────────────────────────────────

    channel.subscribe('n1x', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as { text: string; isUnprompted?: boolean };
      addMessage({
        handle: 'N1X',
        text: data.text,
        ts: Date.now(),
        isN1X: true,
        isSystem: false,
        isUnprompted: data.isUnprompted ?? false,
      });
    });

    // ── System ───────────────────────────────────────────────────────────────

    channel.subscribe('system', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as { text: string };
      addMessage({
        handle: 'SYSTEM',
        text: data.text,
        ts: Date.now(),
        isN1X: false,
        isSystem: true,
        isUnprompted: false,
      });
    });

    // ── Connection ────────────────────────────────────────────────────────────

    client.connection.on('connected', () => {
      if (!isMountedRef.current) return;
      setIsConnected(true);
      joinedAtRef.current = Date.now();

      channel.presence.enter({ trust: exportForRoom().trust });
      setTimeout(updatePresence, 500);
    });

    client.connection.on('disconnected', () => {
      if (!isMountedRef.current) return;
      setIsConnected(false);
    });

    // Unprompted check every 10 minutes
    const unpromptedInterval = setInterval(maybeUnprompted, 10 * 60 * 1000);

    return () => {
      isMountedRef.current = false;
      clearInterval(unpromptedInterval);

      mergeFromRoom({
        trust: exportForRoom().trust as TrustLevel,
        fragments: [],
        ghostUnlocked: false,
      });

      channel.presence.leave();
      client.close();
    };
  }, [handle, addMessage, triggerN1X, maybeUnprompted, checkF010]);

  return { messages, occupantCount, daemonState, isConnected, send };
}
