'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Ably from 'ably';
import { exportForRoom, mergeFromRoom, type TrustLevel } from '@/lib/argState';
import { eventBus } from '@/lib/eventBus';

// ── Types ─────────────────────────────────────────────────────────────────────

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
const F010_MIN_TIME_MS   = 10 * 60 * 1000;
const F010_MIN_MESSAGES  = 10;
const F010_MIN_N1X_PINGS = 2;

// How long to wait after presence.enter() before reading member count.
// Ably presence propagates across the network in ~500-800ms. 1200ms is safe.
const PRESENCE_SETTLE_MS = 1200;

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'connecting' | 'connected' | 'failed';

interface UseAblyRoomResult {
  messages: RoomMsg[];
  occupantCount: number;
  daemonState: DaemonState;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  ablyDebug: string;
  send: (text: string) => void;
}

export function useAblyRoom(handle: string): UseAblyRoomResult {
  const [messages, setMessages]               = useState<RoomMsg[]>([]);
  const [occupantCount, setOccupantCount]     = useState(0);
  const [daemonState, setDaemonState]         = useState<DaemonState>('active');
  const [isConnected, setIsConnected]         = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [ablyDebug, setAblyDebug]             = useState('initializing...');

  const clientRef    = useRef<Ably.Realtime | null>(null);
  const channelRef   = useRef<Ably.RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);

  // f010 tracking
  const joinedAtRef       = useRef<number>(0);
  const messageCountRef   = useRef(0);
  const n1xPingCountRef   = useRef(0);
  const f010IssuedRef     = useRef(false);
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

  // ── f010 threshold check ──────────────────────────────────────────────────

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

    let client: Ably.Realtime;

    try {
      client = new Ably.Realtime({
        authUrl: `${window.location.origin}/api/ably/token`,
        authMethod: 'GET',
        // clientId must be set here so Ably includes it in the token exchange.
        // Presence operations (enter/leave/get) require a clientId on the connection —
        // without it, presence.enter() throws 40012 silently and occupant counts break.
        clientId: handle,
      });
    } catch {
      // Ably init threw synchronously — go offline immediately
      setConnectionStatus('failed');
      setIsConnected(true);
      return;
    }

    clientRef.current = client;
    const channel = client.channels.get('ghost');
    channelRef.current = channel;

    // ── Presence ──────────────────────────────────────────────────────────

    const updatePresence = async () => {
      try {
        const members = await channel.presence.get();
        if (!isMountedRef.current) return;
        handlesRef.current = members.map(
          m => (m.data as { handle?: string })?.handle ?? m.clientId ?? 'unknown'
        );
        setOccupantCount(members.length);
      } catch { /* ignore */ }
    };

    // Keep occupant count live after boot
    channel.presence.subscribe(updatePresence);

    // ── Chat ──────────────────────────────────────────────────────────────

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

    // ── N1X ───────────────────────────────────────────────────────────────

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

    // ── System ────────────────────────────────────────────────────────────

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

    // ── Connection ────────────────────────────────────────────────────────

    const connectionTimeout = setTimeout(() => {
      if (!isMountedRef.current) return;
      if (client.connection.state !== 'connected') {
        setAblyDebug('timeout after 30s');
        setConnectionStatus('failed');
        setIsConnected(true);
      }
    }, 30000);

    client.connection.on('connecting', () => {
      setAblyDebug('connecting...');
    });

    client.connection.on('connected', () => {
      if (!isMountedRef.current) return;
      clearTimeout(connectionTimeout);
      setAblyDebug('connected');
      setConnectionStatus('connected');
      joinedAtRef.current = Date.now();

      // Enter presence, wait for it to propagate across the Ably network,
      // then read the real member count BEFORE signalling isConnected.
      // TelnetSession gates its boot decision on isConnected — delaying it
      // here guarantees it sees the correct occupantCount and does not
      // false-trigger offline mode because presence hadn't settled yet.
      channel.presence
        .enter({ handle, trust: exportForRoom().trust })
        .then(() => new Promise<void>(resolve => setTimeout(resolve, PRESENCE_SETTLE_MS)))
        .then(() => updatePresence())
        .then(() => {
          if (isMountedRef.current) setIsConnected(true);
        })
        .catch(() => {
          // presence.enter failed — unblock the UI anyway
          if (isMountedRef.current) setIsConnected(true);
        });
    });

    client.connection.on('failed', () => {
      if (!isMountedRef.current) return;
      clearTimeout(connectionTimeout);
      const err = client.connection.errorReason;
      setAblyDebug(
        `failed [${err?.code ?? '?'}]: ${err?.message ?? 'unknown'} | status: ${err?.statusCode ?? '?'}`
      );
      setConnectionStatus('failed');
      setIsConnected(true);
    });

    client.connection.on('suspended', () => {
      if (!isMountedRef.current) return;
      clearTimeout(connectionTimeout);
      const err = client.connection.errorReason;
      setAblyDebug(`suspended [${err?.code ?? '?'}]: ${err?.message ?? 'unknown'}`);
      setConnectionStatus('failed');
      setIsConnected(true);
    });

    client.connection.on('disconnected', () => {
      if (!isMountedRef.current) return;
      const err = client.connection.errorReason;
      setAblyDebug(
        `disconnected [${err?.code ?? '?'}]: ${err?.message ?? ''} | status: ${err?.statusCode ?? '?'}`
      );
    });

    const unpromptedInterval = setInterval(maybeUnprompted, 10 * 60 * 1000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(connectionTimeout);
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

  return { messages, occupantCount, daemonState, isConnected, connectionStatus, ablyDebug, send };
}
