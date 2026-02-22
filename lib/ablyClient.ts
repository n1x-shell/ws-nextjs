'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Ably from 'ably';
import { exportForRoom, mergeFromRoom, type TrustLevel } from '@/lib/argState';
import { eventBus } from '@/lib/eventBus';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DaemonState = 'active' | 'exposed';

export interface RoomMsg {
  id:           string;
  handle:       string;
  text:         string;
  ts:           number;
  isN1X:        boolean;
  isSystem:     boolean;
  isUnprompted: boolean;
  isThinking?:  boolean; // ephemeral — N1X typing indicator
}

// ── Event shapes (must match /api/bot) ───────────────────────────────────────

interface UserMessageEvent {
  roomId:    string;
  userId:    string;
  messageId: string;
  text:      string;
  ts:        number;
}

interface BotMessageEvent {
  roomId:      string;
  messageId:   string;
  replyTo:     string | null;
  text:        string;
  ts:          number;
  isUnprompted?: boolean;
  isF010?:     boolean;
}

interface BotThinkingEvent {
  roomId: string;
  ts:     number;
}

// ── f010 thresholds ───────────────────────────────────────────────────────────

const F010_MIN_TIME_MS   = 10 * 60 * 1000;
const F010_MIN_MESSAGES  = 10;
const F010_MIN_N1X_PINGS = 2;

// How long after presence.enter() to wait before reading member count.
const PRESENCE_SETTLE_MS = 1200;

// How long to show the "N1X is thinking" indicator before it auto-clears.
const THINKING_CLEAR_MS = 8000;

function makeId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'connecting' | 'connected' | 'failed';

interface UseAblyRoomResult {
  messages:       RoomMsg[];
  occupantCount:  number;
  daemonState:    DaemonState;
  isConnected:    boolean;
  connectionStatus: ConnectionStatus;
  ablyDebug:      string;
  send:           (text: string) => void;
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
  const thinkingTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlesRef       = useRef<string[]>([]);
  const recentHistoryRef = useRef<string[]>([]);

  // ── Message helpers ───────────────────────────────────────────────────────

  const addMessage = useCallback((msg: Omit<RoomMsg, 'id'>) => {
    if (!isMountedRef.current) return;
    setMessages(prev => [...prev, { ...msg, id: makeId() }]);
    eventBus.emit('shell:request-scroll');
  }, []);

  // Replace or remove the thinking indicator
  const clearThinking = useCallback(() => {
    if (!isMountedRef.current) return;
    setMessages(prev => prev.filter(m => !m.isThinking));
  }, []);

  // ── send ──────────────────────────────────────────────────────────────────
  // Publishes user.message with a stable messageId for dedup on /api/bot.

  const send = useCallback((text: string) => {
    const messageId = makeId();
    channelRef.current?.publish('user.message', {
      roomId:    'ghost',
      userId:    handle,
      messageId,
      text,
      ts: Date.now(),
    } satisfies UserMessageEvent);
  }, [handle]);

  // ── N1X trigger ───────────────────────────────────────────────────────────

  const triggerN1X = useCallback(async (text: string, messageId: string) => {
    const recentHistory = recentHistoryRef.current.slice(-20).join('\n');
    try {
      await fetch('/api/bot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          text,
          triggerHandle:  handle,
          handles:        handlesRef.current,
          daemonState:    f010IssuedRef.current ? 'exposed' : 'active',
          occupantCount:  handlesRef.current.length,
          recentHistory,
        }),
      });
    } catch { /* ghost channel unreliable by design */ }
  }, [handle]);

  // ── Unprompted transmission ───────────────────────────────────────────────

  const maybeUnprompted = useCallback(async () => {
    const count   = handlesRef.current.length;
    const cooldown = Date.now() - lastUnpromptedRef.current >= 8 * 60 * 1000;
    if (count < 2 || !cooldown) return;

    lastUnpromptedRef.current = Date.now();
    try {
      await fetch('/api/bot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unprompted:    true,
          handles:       handlesRef.current,
          daemonState:   f010IssuedRef.current ? 'exposed' : 'active',
          occupantCount: count,
        }),
      });
    } catch { /* fail silently */ }
  }, []);

  // ── f010 check ────────────────────────────────────────────────────────────

  const checkF010 = useCallback(async () => {
    if (f010IssuedRef.current) return;
    if (handlesRef.current.length < 2) return;

    const timeOk = Date.now() - joinedAtRef.current >= F010_MIN_TIME_MS;
    const msgsOk = messageCountRef.current   >= F010_MIN_MESSAGES;
    const pingOk = n1xPingCountRef.current   >= F010_MIN_N1X_PINGS;

    if (timeOk && msgsOk && pingOk) {
      f010IssuedRef.current = true;
      setDaemonState('exposed');
      try {
        await fetch('/api/bot', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkExposed: true, handles: handlesRef.current }),
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
        authUrl:    `${window.location.origin}/api/ably-token`,
        authMethod: 'GET',
        // clientId required for presence.enter() — must match capability '*' on token
        clientId:   handle,
      });
    } catch {
      setConnectionStatus('failed');
      setIsConnected(true);
      return;
    }

    clientRef.current  = client;
    const channel = client.channels.get('ghost');
    channelRef.current = channel;

    // ── Presence ──────────────────────────────────────────────────────────

    const welcomedRef = useRef<Set<string>>(new Set());
    const goodbyedRef = useRef<Set<string>>(new Set());

    const updatePresence = async (member?: Ably.PresenceMessage) => {
      // Welcome each handle once per session
      if (member?.action === 'enter' && member.clientId !== handle) {
        const joiningHandle = (member.data as { handle?: string })?.handle ?? member.clientId ?? 'unknown';
        if (!welcomedRef.current.has(joiningHandle)) {
          welcomedRef.current.add(joiningHandle);
          goodbyedRef.current.delete(joiningHandle); // reset so goodbye fires if they leave again
          const dedupKey = `${joiningHandle}:${Math.floor(Date.now() / 10000)}`;
          fetch('/api/bot', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ welcome: true, welcomeHandle: joiningHandle, welcomeDedup: dedupKey }),
          }).catch(() => {});
        }
      }

      // Goodbye each handle once per departure
      if (member?.action === 'leave' && member.clientId !== handle) {
        const leavingHandle = (member.data as { handle?: string })?.handle ?? member.clientId ?? 'unknown';
        if (!goodbyedRef.current.has(leavingHandle)) {
          goodbyedRef.current.add(leavingHandle);
          welcomedRef.current.delete(leavingHandle); // reset so welcome fires if they return
          const dedupKey = `${leavingHandle}:${Math.floor(Date.now() / 10000)}`;
          fetch('/api/bot', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goodbye: true, goodbyeHandle: leavingHandle, goodbyeDedup: dedupKey }),
          }).catch(() => {});
        }
      }

      try {
        const members = await channel.presence.get();
        if (!isMountedRef.current) return;
        handlesRef.current = members.map(
          m => (m.data as { handle?: string })?.handle ?? m.clientId ?? 'unknown'
        );
        setOccupantCount(members.length);
      } catch { /* ignore */ }
    };

    channel.presence.subscribe(updatePresence);

    // ── user.message ─────────────────────────────────────────────────────
    // All nodes publish with this event type; everyone subscribes to display.

    channel.subscribe('user.message', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as UserMessageEvent;

      addMessage({
        handle:       data.userId,
        text:         data.text,
        ts:           data.ts,
        isN1X:        false,
        isSystem:     false,
        isUnprompted: false,
      });

      // Append to history for N1X context
      recentHistoryRef.current = [
        ...recentHistoryRef.current.slice(-29),
        `  [${data.userId}] >> ${data.text}`,
      ];

      // Only the sender triggers the bot — prevents N * responses
      if (data.userId === handle) {
        messageCountRef.current += 1;

        if (data.text.toLowerCase().includes('@n1x')) {
          n1xPingCountRef.current += 1;
          triggerN1X(data.text, data.messageId);
        }

        checkF010();
        maybeUnprompted();
      }
    });

    // ── bot.thinking ─────────────────────────────────────────────────────
    // Ephemeral typing indicator — shown for up to THINKING_CLEAR_MS then removed.

    channel.subscribe('bot.thinking', (_msg: Ably.Message) => {
      if (!isMountedRef.current) return;

      // Remove any existing thinking indicator before adding a new one
      setMessages(prev => [
        ...prev.filter(m => !m.isThinking),
        {
          id:           makeId(),
          handle:       'N1X',
          text:         '...',
          ts:           Date.now(),
          isN1X:        true,
          isSystem:     false,
          isUnprompted: false,
          isThinking:   true,
        },
      ]);
      eventBus.emit('shell:request-scroll');

      // Auto-clear in case bot.message arrives late or not at all
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = setTimeout(clearThinking, THINKING_CLEAR_MS);
    });

    // ── bot.message ───────────────────────────────────────────────────────
    // Final AI response. Replaces the thinking indicator.

    channel.subscribe('bot.message', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as BotMessageEvent;

      // Clear thinking indicator and timer
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      clearThinking();

      addMessage({
        handle:       'N1X',
        text:         data.text,
        ts:           data.ts,
        isN1X:        true,
        isSystem:     false,
        isUnprompted: data.isUnprompted ?? false,
      });

      // Append N1X response to history for future context
      recentHistoryRef.current = [
        ...recentHistoryRef.current.slice(-29),
        `  [N1X] << ${data.text.replace(/\n/g, ' ').slice(0, 120)}`,
      ];
    });

    // ── bot.system ────────────────────────────────────────────────────────
    // System notices from the server (rare — reserved for future use).

    channel.subscribe('bot.system', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as { text: string };
      addMessage({
        handle:       'SYSTEM',
        text:         data.text,
        ts:           Date.now(),
        isN1X:        false,
        isSystem:     true,
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

    client.connection.on('connecting', () => setAblyDebug('connecting...'));

    client.connection.on('connected', () => {
      if (!isMountedRef.current) return;
      clearTimeout(connectionTimeout);
      setAblyDebug('connected');
      setConnectionStatus('connected');
      joinedAtRef.current = Date.now();

      // Enter presence, wait for network propagation, read real count, THEN
      // signal isConnected. This is what prevents the presence race and false
      // offline boots — TelnetSession gates its boot decision on isConnected.
      channel.presence
        .enter({ handle, trust: exportForRoom().trust })
        .then(() => new Promise<void>(resolve => setTimeout(resolve, PRESENCE_SETTLE_MS)))
        .then(() => updatePresence())
        .then(() => { if (isMountedRef.current) setIsConnected(true); })
        .catch(() => { if (isMountedRef.current) setIsConnected(true); });
    });

    client.connection.on('failed', () => {
      if (!isMountedRef.current) return;
      clearTimeout(connectionTimeout);
      const err = client.connection.errorReason;
      setAblyDebug(`failed [${err?.code ?? '?'}]: ${err?.message ?? 'unknown'} | status: ${err?.statusCode ?? '?'}`);
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
      setAblyDebug(`disconnected [${err?.code ?? '?'}]: ${err?.message ?? ''} | status: ${err?.statusCode ?? '?'}`);
    });

    const unpromptedInterval = setInterval(maybeUnprompted, 10 * 60 * 1000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(connectionTimeout);
      clearInterval(unpromptedInterval);
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);

      mergeFromRoom({
        trust:        exportForRoom().trust as TrustLevel,
        fragments:    [],
        ghostUnlocked: false,
      });

      channel.presence.leave();
      client.close();
    };
  }, [handle, addMessage, clearThinking, triggerN1X, maybeUnprompted, checkF010]);

  return { messages, occupantCount, daemonState, isConnected, connectionStatus, ablyDebug, send };
}
