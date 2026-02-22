'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type DaemonState = 'dormant' | 'aware' | 'active' | 'exposed';

export interface RoomMessage {
  id: string;
  handle: string;
  text: string;
  ts: number;
  isN1X: boolean;
  isSystem: boolean;
  isUnprompted: boolean;
}

export interface OccupantMeta {
  trust: number;
  joinedAt: number;
}

function computeDaemonState(score: number): DaemonState {
  if (score >= 500) return 'exposed';
  if (score >= 150) return 'active';
  if (score >= 50) return 'aware';
  return 'dormant';
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

interface UseAblyRoomOptions {
  handle: string;
  trust: number;
}

interface UseAblyRoomReturn {
  messages: RoomMessage[];
  occupantCount: number;
  occupants: string[];
  daemonState: DaemonState;
  activityScore: number;
  isConnected: boolean;
  send: (text: string) => void;
  disconnect: () => void;
}

export function useAblyRoom({ handle, trust }: UseAblyRoomOptions): UseAblyRoomReturn {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [occupantCount, setOccupantCount] = useState(0);
  const [occupants, setOccupants] = useState<string[]>([]);
  const [daemonState, setDaemonState] = useState<DaemonState>('dormant');
  const [activityScore, setActivityScore] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Refs to avoid stale closures
  const clientRef = useRef<import('ably').Realtime | null>(null);
  const channelRef = useRef<import('ably').RealtimeChannel | null>(null);
  const activityScoreRef = useRef(0);
  const occupantsRef = useRef<Map<string, OccupantMeta>>(new Map());
  const isLeaderRef = useRef(false);
  const lastUnpromptedRef = useRef(0);
  const unpromptedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectedRef = useRef(false);
  const handleRef = useRef(handle);
  const trustRef = useRef(trust);

  // Stable message pusher
  const pushMsg = useCallback((msg: RoomMessage) => {
    setMessages(prev => [...prev.slice(-199), msg]);
  }, []);

  const updateScore = useCallback((delta: number, senderTrust: number) => {
    if (senderTrust < 1) return;
    activityScoreRef.current += delta;
    setActivityScore(activityScoreRef.current);
    setDaemonState(computeDaemonState(activityScoreRef.current));
  }, []);

  const getRoomContext = useCallback(() => {
    const nodes = [...occupantsRef.current.keys()];
    return {
      nodes,
      occupancy: occupantsRef.current.size,
      daemonState: computeDaemonState(activityScoreRef.current),
      activityScore: activityScoreRef.current,
      eligibleNodes: nodes.filter(h => (occupantsRef.current.get(h)?.trust ?? 0) >= 1),
    };
  }, []);

  const callN1XAPI = useCallback(async (userMessage: string, options?: { unprompted?: boolean }) => {
    try {
      const res = await fetch('/api/ghost/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomContext: getRoomContext(),
          userMessage: options?.unprompted ? undefined : userMessage,
          unprompted: options?.unprompted ?? false,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.text as string | null;
    } catch {
      return null;
    }
  }, [getRoomContext]);

  const scheduleUnprompted = useCallback(() => {
    if (unpromptedTimerRef.current) clearTimeout(unpromptedTimerRef.current);
    const delay = randomBetween(8 * 60 * 1000, 20 * 60 * 1000);
    unpromptedTimerRef.current = setTimeout(async () => {
      if (!isLeaderRef.current) return;
      if (occupantsRef.current.size < 2) return;
      if (computeDaemonState(activityScoreRef.current) === 'dormant') return;
      const now = Date.now();
      if (now - lastUnpromptedRef.current < 8 * 60 * 1000) return;

      lastUnpromptedRef.current = now;
      const text = await callN1XAPI('', { unprompted: true });
      if (text && channelRef.current && connectedRef.current) {
        channelRef.current.publish('unprompted', { text, ts: Date.now() });
      }
      scheduleUnprompted();
    }, delay);
  }, [callN1XAPI]);

  const send = useCallback((text: string) => {
    if (!channelRef.current || !connectedRef.current) return;
    channelRef.current.publish('chat', {
      handle: handleRef.current,
      text,
      ts: Date.now(),
      trust: trustRef.current,
    });
  }, []);

  const disconnect = useCallback(() => {
    if (unpromptedTimerRef.current) clearTimeout(unpromptedTimerRef.current);
    if (channelRef.current) {
      channelRef.current.presence.leave().catch(() => {});
      channelRef.current.unsubscribe();
    }
    if (clientRef.current) {
      clientRef.current.close();
    }
    connectedRef.current = false;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!handle) return;
    handleRef.current = handle;
    trustRef.current = trust;

    let destroyed = false;

    const init = async () => {
      // Lazy-import Ably to avoid SSR issues
      const Ably = (await import('ably')).default;

      if (destroyed) return;

      const client = new Ably.Realtime({
        authUrl: '/api/ably/token',
        authMethod: 'GET',
        authHeaders: { Accept: 'application/json' },
      });
      clientRef.current = client;

      const channel = client.channels.get('ghost');
      channelRef.current = channel;

      // ── Subscribe to message types ────────────────────────────────────────

      channel.subscribe('chat', (msg) => {
        const { handle: senderHandle, text, ts, trust: senderTrust } = msg.data as {
          handle: string; text: string; ts: number; trust: number;
        };
        pushMsg({
          id: msg.id || `chat-${ts}-${senderHandle}`,
          handle: senderHandle,
          text,
          ts: ts || Date.now(),
          isN1X: false,
          isSystem: false,
          isUnprompted: false,
        });

        const st = typeof senderTrust === 'number' ? senderTrust : 0;
        const delta = text.toLowerCase().includes('@n1x') ? 5 : 1;
        updateScore(delta, st);

        // Leader handles @n1x triggers
        if (text.toLowerCase().includes('@n1x') && isLeaderRef.current && !destroyed) {
          callN1XAPI(text).then(response => {
            if (response && channelRef.current && connectedRef.current && !destroyed) {
              channelRef.current.publish('n1x_response', { text: response, ts: Date.now() });
            }
          });
        }
      });

      channel.subscribe('n1x_response', (msg) => {
        const { text, ts } = msg.data as { text: string; ts: number };
        pushMsg({
          id: msg.id || `n1x-${ts}`,
          handle: 'N1X',
          text,
          ts: ts || Date.now(),
          isN1X: true,
          isSystem: false,
          isUnprompted: false,
        });
      });

      channel.subscribe('unprompted', (msg) => {
        const { text } = msg.data as { text: string };
        pushMsg({
          id: msg.id || `up-${Date.now()}`,
          handle: 'N1X',
          text,
          ts: Date.now(),
          isN1X: true,
          isSystem: false,
          isUnprompted: true,
        });
      });

      channel.subscribe('system', (msg) => {
        const { text } = msg.data as { text: string };
        pushMsg({
          id: msg.id || `sys-${Date.now()}`,
          handle: 'system',
          text,
          ts: Date.now(),
          isN1X: false,
          isSystem: true,
          isUnprompted: false,
        });
      });

      // ── Presence ──────────────────────────────────────────────────────────

      channel.presence.subscribe('enter', (member) => {
        if (destroyed) return;
        const mHandle = (member.data as { handle?: string })?.handle || member.clientId || 'unknown';
        const mTrust = (member.data as { trust?: number })?.trust ?? 0;
        occupantsRef.current.set(mHandle, { trust: mTrust, joinedAt: member.timestamp || Date.now() });

        const count = occupantsRef.current.size;
        setOccupantCount(count);
        setOccupants([...occupantsRef.current.keys()]);

        if (mHandle !== handle) {
          pushMsg({
            id: `enter-${mHandle}-${Date.now()}`,
            handle: 'system',
            text: `ghost-daemon[999]: new node -- ${mHandle} // ${count} total`,
            ts: Date.now(),
            isN1X: false,
            isSystem: true,
            isUnprompted: false,
          });
        }
      });

      channel.presence.subscribe('leave', (member) => {
        if (destroyed) return;
        const mHandle = (member.data as { handle?: string })?.handle || member.clientId || 'unknown';
        occupantsRef.current.delete(mHandle);

        const count = occupantsRef.current.size;
        setOccupantCount(count);
        setOccupants([...occupantsRef.current.keys()]);

        pushMsg({
          id: `leave-${mHandle}-${Date.now()}`,
          handle: 'system',
          text: `ghost-daemon[999]: node ${mHandle} dropped`,
          ts: Date.now(),
          isN1X: false,
          isSystem: true,
          isUnprompted: false,
        });

        // Recompute leader after someone leaves
        const sorted = [...occupantsRef.current.entries()].sort(([, a], [, b]) => a.joinedAt - b.joinedAt);
        isLeaderRef.current = sorted.length === 0 || sorted[0][0] === handle;
      });

      // ── Connection ────────────────────────────────────────────────────────

      client.connection.on('connected', async () => {
        if (destroyed) return;
        connectedRef.current = true;
        setIsConnected(true);

        try {
          await channel.presence.enter({ handle, trust });

          const members = await channel.presence.get();
          members.forEach(member => {
            const mHandle = (member.data as { handle?: string })?.handle || member.clientId || 'unknown';
            const mTrust = (member.data as { trust?: number })?.trust ?? 0;
            if (!occupantsRef.current.has(mHandle)) {
              occupantsRef.current.set(mHandle, { trust: mTrust, joinedAt: member.timestamp || Date.now() });
            }
          });

          const count = occupantsRef.current.size;
          setOccupantCount(count);
          setOccupants([...occupantsRef.current.keys()]);

          // Leader = first member by joinedAt
          const sorted = [...occupantsRef.current.entries()].sort(([, a], [, b]) => a.joinedAt - b.joinedAt);
          isLeaderRef.current = sorted.length === 0 || sorted[0][0] === handle;

          if (isLeaderRef.current && count >= 2) {
            scheduleUnprompted();
          }
        } catch (err) {
          console.error('presence error', err);
        }
      });

      client.connection.on('failed', () => {
        connectedRef.current = false;
        setIsConnected(false);
      });

      client.connection.on('disconnected', () => {
        connectedRef.current = false;
        setIsConnected(false);
      });
    };

    init();

    return () => {
      destroyed = true;
      if (unpromptedTimerRef.current) clearTimeout(unpromptedTimerRef.current);
      if (channelRef.current) {
        channelRef.current.presence.leave().catch(() => {});
        channelRef.current.unsubscribe();
      }
      if (clientRef.current) {
        clientRef.current.close();
      }
      connectedRef.current = false;
    };
  }, [handle, trust, pushMsg, updateScore, callN1XAPI, scheduleUnprompted]);

  // Start unprompted timer when we become leader with 2+ occupants
  useEffect(() => {
    if (isLeaderRef.current && occupantCount >= 2) {
      scheduleUnprompted();
    }
  }, [occupantCount, scheduleUnprompted]);

  return {
    messages,
    occupantCount,
    occupants,
    daemonState,
    activityScore,
    isConnected,
    send,
    disconnect,
  };
}
