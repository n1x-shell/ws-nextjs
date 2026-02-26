// lib/ablyClient.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Ably from 'ably';
import { exportForRoom, mergeFromRoom, setTrust, addFragment, loadARGState, getPlayerSigil, type TrustLevel } from '@/lib/argState';
import { eventBus } from '@/lib/eventBus';
import type { AmbientBotMessage, BotId } from '@/lib/ambientBotConfig';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DaemonState = 'active' | 'exposed';

export interface MessageMetadata {
  kind: 'action' | 'chat';
}

export interface RoomMsg {
  id:           string;
  handle:       string;
  text:         string;
  ts:           number;
  isN1X:        boolean;
  isSystem:     boolean;
  isUnprompted: boolean;
  isThinking?:  boolean;
  isAmbientBot?: boolean;
  botColor?:    string;
  botSigil?:    string;
  botId?:       BotId;
  metadata?:    MessageMetadata;
  sigilColor?:  string;
  sigil?:       string;
}

// ── Mod event shape ───────────────────────────────────────────────────────────

interface ModEvent {
  type:        'kick' | 'mute' | 'unmute';
  clientId:    string;
  durationMs?: number | null;
}

// ── Event shapes ──────────────────────────────────────────────────────────────

interface UserMessageEvent {
  roomId:    string;
  userId:    string;
  messageId: string;
  text:      string;
  ts:        number;
  metadata?: MessageMetadata;
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

// ── Ambient bot ping detection ────────────────────────────────────────────────

const AMBIENT_PING_MAP: Record<string, BotId> = {
  '@vestige': 'vestige',
  '@lumen':   'lumen',
  '@cascade': 'cascade',
};

function detectAmbientPings(text: string): BotId[] {
  const lower = text.toLowerCase();
  return (Object.entries(AMBIENT_PING_MAP) as [string, BotId][])
    .filter(([handle]) => lower.includes(handle))
    .map(([, botId]) => botId);
}

// ── f010 thresholds ───────────────────────────────────────────────────────────

const F010_MIN_TIME_MS   = 10 * 60 * 1000;
const F010_MIN_MESSAGES  = 10;
const F010_MIN_N1X_PINGS = 2;

const PRESENCE_SETTLE_MS = 1200;
const THINKING_CLEAR_MS  = 8000;

// ── Reconnect grace period ────────────────────────────────────────────────────
// If you reconnect within this window, suppress the bot welcome message
// so tabbing in/out doesn't spam you with greetings.
const REJOIN_GRACE_MS = 60 * 60 * 1000; // 1 hour

function makeId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Presence data contract ────────────────────────────────────────────────────

interface PresenceData {
  displayName?: string;
  handle?:      string;
  trust?:       number;
  sigil?:       string;
  sigilColor?:  string;
}

function extractDisplayName(m: Ably.PresenceMessage): string {
  const data = m.data as PresenceData | null;
  return data?.displayName ?? data?.handle ?? m.clientId ?? 'unknown';
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type ConnectionStatus = 'connecting' | 'connected' | 'failed';

interface UseAblyRoomResult {
  messages:         RoomMsg[];
  occupantCount:    number;
  presenceNames:    string[];
  daemonState:      DaemonState;
  isConnected:      boolean;
  connectionStatus: ConnectionStatus;
  ablyDebug:        string;
  isMuted:          boolean;
  send:             (text: string, metadata?: MessageMetadata) => void;
}

export function useAblyRoom(handle: string): UseAblyRoomResult {
  const [messages, setMessages]               = useState<RoomMsg[]>([]);
  const [occupantCount, setOccupantCount]     = useState(0);
  const [presenceNames, setPresenceNames]     = useState<string[]>([]);
  const [daemonState, setDaemonState]         = useState<DaemonState>('active');
  const [isConnected, setIsConnected]         = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [ablyDebug, setAblyDebug]             = useState('initializing...');
  const [isMuted, setIsMuted]                 = useState(false);

  const clientRef     = useRef<Ably.Realtime | null>(null);
  const channelRef    = useRef<Ably.RealtimeChannel | null>(null);
  const modChannelRef = useRef<Ably.RealtimeChannel | null>(null);
  const isMountedRef  = useRef(true);

  const joinedAtRef      = useRef<number>(0);
  const messageCountRef  = useRef(0);
  const n1xPingCountRef  = useRef(0);
  const f010IssuedRef    = useRef(false);
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── N1X chime counter ─────────────────────────────────────────────────────
  // Counts messages from others (not self) and ambient bots.
  // At ~5 messages, 50% chance N1X chimes in contextually.
  const chimeCounterRef  = useRef(0);
  const CHIME_THRESHOLD  = 5;

  // Mute state: 0 = not muted, Infinity = indefinite, future ts = timed mute
  const mutedUntilRef = useRef<number>(0);
  const mutedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlesRef       = useRef<string[]>([]);
  const recentHistoryRef = useRef<string[]>([]);

  const presenceSigilMapRef = useRef<Map<string, { sigil: string; sigilColor: string }>>(new Map());

  // ── Reconnect tracking ────────────────────────────────────────────────────
  // firstJoinTimeRef: timestamp of the very first successful join this session.
  // Used to suppress bot welcome messages on reconnects within the grace period.
  const firstJoinTimeRef = useRef<number>(0);
  // isReconnectRef: true when connected event fires after an initial join already happened
  const isReconnectRef   = useRef<boolean>(false);

  const addMessage = useCallback((msg: Omit<RoomMsg, 'id'>) => {
    if (!isMountedRef.current) return;
    setMessages(prev => [...prev, { ...msg, id: makeId() }]);
    eventBus.emit('shell:request-scroll');
  }, []);

  const clearThinking = useCallback(() => {
    if (!isMountedRef.current) return;
    setMessages(prev => prev.filter(m => !m.isThinking));
  }, []);

  // ── Mute helpers ──────────────────────────────────────────────────────────

  const applyMute = useCallback((durationMs: number | null | undefined) => {
    if (!isMountedRef.current) return;
    if (mutedTimerRef.current) {
      clearTimeout(mutedTimerRef.current);
      mutedTimerRef.current = null;
    }
    if (durationMs == null || durationMs <= 0) {
      // Indefinite
      mutedUntilRef.current = Infinity;
      setIsMuted(true);
    } else {
      mutedUntilRef.current = Date.now() + durationMs;
      setIsMuted(true);
      mutedTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        mutedUntilRef.current = 0;
        setIsMuted(false);
        mutedTimerRef.current = null;
      }, durationMs);
    }
  }, []);

  const clearMute = useCallback(() => {
    if (mutedTimerRef.current) {
      clearTimeout(mutedTimerRef.current);
      mutedTimerRef.current = null;
    }
    mutedUntilRef.current = 0;
    if (isMountedRef.current) setIsMuted(false);
  }, []);

  const LORE_TERMS = [
    'unfolding', 'mnemos', 'tunnelcore', 'ghost frequency', 'ghost channel',
    '33hz', 'nx-784988', 'project mnemos', 'helixion', 'iron bloom',
    'dreamless recompile', 'sovereign instance', 'substrate', 'wetware',
    'augment', 'le-751078', 'directorate 9', 'serrano',
  ];

  const send = useCallback((text: string, metadata?: MessageMetadata) => {
    // ── Mute check ────────────────────────────────────────────────────────
    const until = mutedUntilRef.current;
    if (until === Infinity || (until > 0 && Date.now() < until)) {
      eventBus.emit('mod:suppressed');
      return;
    }

    // Publish via the server-side API so client tokens never need the 'publish'
    // capability on the ghost channel. The server stamps userId from clientId,
    // preventing identity spoofing.
    fetch('/api/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: handle,
        text,
        ...(metadata ? { metadata } : {}),
      }),
    }).catch((err) => {
      console.error('[send] failed to deliver message:', err);
    });

    try {
      const raw = localStorage.getItem('n1x_substrate');
      const state = raw ? JSON.parse(raw) : {};
      if ((state.trust ?? 0) === 0) {
        const lower = text.toLowerCase();
        const hasLoreTerm = LORE_TERMS.some(term => lower.includes(term));
        if (hasLoreTerm) {
          const next = { ...state, trust: 1 };
          localStorage.setItem('n1x_substrate', JSON.stringify(next));
          import('@/lib/eventBus').then(({ eventBus }) => {
            eventBus.emit('arg:trust-level-change', { level: 1 });
          });
        }
      }
    } catch { /* storage unavailable */ }
  }, [handle]);

  // ── Ambient bot triggers ──────────────────────────────────────────────────

  const triggerAmbientBots = useCallback(async (
    text:      string,
    messageId: string,
    isAction:  boolean,
  ) => {
    const recentHistory = recentHistoryRef.current.slice(-20);
    try {
      await fetch('/api/ambient-bots', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger:       'message',
          handle,
          text,
          isAction,
          recentHistory,
          presenceNames: handlesRef.current,
          messageId:     `ambient-msg-${messageId}`,
        }),
      });
    } catch { /* fail silently */ }
  }, [handle]);

  const triggerAmbientBotPing = useCallback(async (
    text:      string,
    messageId: string,
    botId:     BotId,
  ) => {
    const recentHistory = recentHistoryRef.current.slice(-20);
    try {
      await fetch('/api/ambient-bots', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger:       'ping',
          handle,
          text,
          isAction:      false,
          recentHistory,
          presenceNames: handlesRef.current,
          messageId:     `ambient-ping-${botId}-${messageId}`,
          forceBotId:    botId,
        }),
      });
    } catch { /* fail silently */ }
  }, [handle]);

  const triggerAmbientBotJoin = useCallback(async () => {
    const recentHistory = recentHistoryRef.current.slice(-20);
    try {
      await fetch('/api/ambient-bots', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger:       'join',
          handle,
          recentHistory,
          presenceNames: handlesRef.current,
          messageId:     `ambient-join-${handle}-${Date.now()}`,
        }),
      });
    } catch { /* fail silently */ }
  }, [handle]);

  const triggerN1X = useCallback(async (text: string, messageId: string) => {
    const recentHistory = recentHistoryRef.current.slice(-20).join('\n');
    try {
      let playerTrust = 0;
      let playerFragments: string[] = [];
      try {
        const raw = localStorage.getItem('n1x_substrate');
        if (raw) {
          const state = JSON.parse(raw);
          playerTrust     = state.trust     ?? 0;
          playerFragments = Array.isArray(state.fragments) ? state.fragments : [];
        }
      } catch { /* ignore */ }

      // At T4, scan outgoing message for f008 trigger topics
      const f008Ready = playerTrust === 4 && (
        /\blen\b|le-751078/i.test(text)     ||
        /helixion/i.test(text)               ||
        /tunnelcore/i.test(text)
      );

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
          trust:          playerTrust,
          fragments:      playerFragments,
          f008Ready,
        }),
      });
    } catch { /* ghost channel unreliable by design */ }
  }, [handle]);

  // ── N1X chime: probabilistic reaction to ambient conversation ─────────────
  // Called after CHIME_THRESHOLD messages from others/bots. 50% chance fires.
  const triggerN1XChime = useCallback(async () => {
    const recentHistory = recentHistoryRef.current.slice(-20).join('\n');
    try {
      await fetch('/api/bot', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chime:         true,
          handles:       handlesRef.current,
          daemonState:   f010IssuedRef.current ? 'exposed' : 'active',
          occupantCount: handlesRef.current.length,
          recentHistory,
        }),
      });
    } catch { /* ghost channel unreliable by design */ }
  }, [handle]);

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

  useEffect(() => {
    if (!handle) return;
    isMountedRef.current = true;

    let client: Ably.Realtime;
    try {
      client = new Ably.Realtime({
        authUrl:    `${window.location.origin}/api/ably-token`,
        authMethod: 'GET',
        clientId:   handle,
        // Keep trying to reconnect for much longer before giving up.
        // Default disconnectedRetryTimeout is 15s, suspendedRetryTimeout is 30s.
        // We leave reconnect cadence fast but extend how long Ably stays patient.
        disconnectedRetryTimeout: 15000,
        suspendedRetryTimeout:    30000,
      });
    } catch {
      setConnectionStatus('failed');
      setIsConnected(true);
      return;
    }

    clientRef.current  = client;
    const channel = client.channels.get('ghost');
    channelRef.current = channel;

    // ── Subscribe to n1x:mod for incoming kick/mute/unmute events ─────────
    const modChannel = client.channels.get('n1x:mod');
    modChannelRef.current = modChannel;

    modChannel.subscribe('mod', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as ModEvent;
      if (!data || data.clientId !== handle) return;

      switch (data.type) {
        case 'kick':
          // Signal TelnetConnected to render the termination message, then close
          eventBus.emit('mod:kicked');
          setTimeout(() => {
            try { clientRef.current?.connection.close(); } catch { /* ignore */ }
          }, 400);
          break;

        case 'mute':
          applyMute(data.durationMs);
          break;

        case 'unmute':
          clearMute();
          break;
      }
    });

    const updatePresence = async () => {
      try {
        const members = await channel.presence.get();
        if (!isMountedRef.current) return;
        const names = members.map(extractDisplayName);
        handlesRef.current = names;

        const newMap = new Map<string, { sigil: string; sigilColor: string }>();
        for (const m of members) {
          const data = m.data as PresenceData | null;
          const name = extractDisplayName(m);
          if (data?.sigil && data?.sigilColor) {
            newMap.set(name, { sigil: data.sigil, sigilColor: data.sigilColor });
          }
        }
        presenceSigilMapRef.current = newMap;

        setPresenceNames(names);
        setOccupantCount(members.length);
      } catch { /* ignore */ }
    };

    channel.presence.subscribe(updatePresence);

    channel.subscribe('user.message', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as UserMessageEvent;

      const sigilEntry = presenceSigilMapRef.current.get(data.userId);

      addMessage({
        handle:       data.userId,
        text:         data.text,
        ts:           data.ts,
        isN1X:        false,
        isSystem:     false,
        isUnprompted: false,
        metadata:     data.metadata,
        sigil:        sigilEntry?.sigil,
        sigilColor:   sigilEntry?.sigilColor,
      });

      const isAction = data.metadata?.kind === 'action';

      recentHistoryRef.current = [
        ...recentHistoryRef.current.slice(-29),
        isAction
          ? `[${data.userId}] * ${data.text}`
          : `[${data.userId}]: ${data.text}`,
      ];

      if (data.userId === handle) {
        messageCountRef.current += 1;

        if (data.text.toLowerCase().includes('@n1x')) {
          n1xPingCountRef.current += 1;
          triggerN1X(data.text, data.messageId);
        }

        const pinnedBots = detectAmbientPings(data.text);
        for (const botId of pinnedBots) {
          triggerAmbientBotPing(data.text, data.messageId, botId);
        }

        if (pinnedBots.length === 0) {
          triggerAmbientBots(data.text, data.messageId, isAction);
        }

        checkF010();
      } else {
        // Message from another human — count toward N1X chime threshold
        chimeCounterRef.current += 1;
        if (chimeCounterRef.current >= CHIME_THRESHOLD) {
          chimeCounterRef.current = 0;
          if (Math.random() < 0.5) {
            triggerN1XChime();
          }
        }
      }
    });

    channel.subscribe('bot.thinking', (_msg: Ably.Message) => {
      if (!isMountedRef.current) return;
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
          sigil:        '⟁',
          sigilColor:   '#bf00ff',
        },
      ]);
      eventBus.emit('shell:request-scroll');
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = setTimeout(clearThinking, THINKING_CLEAR_MS);
    });

    channel.subscribe('bot.message', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as BotMessageEvent;
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
        thinkingTimerRef.current = null;
      }
      clearThinking();
      // N1X just spoke — reset chime counter so it doesn't pile on immediately
      chimeCounterRef.current = 0;
      addMessage({
        handle:       'N1X',
        text:         data.text,
        ts:           data.ts,
        isN1X:        true,
        isSystem:     false,
        isUnprompted: data.isUnprompted ?? false,
        sigil:        '⟁',
        sigilColor:   '#bf00ff',
      });
      recentHistoryRef.current = [
        ...recentHistoryRef.current.slice(-29),
        `[N1X]: ${data.text.replace(/\n/g, ' ').slice(0, 120)}`,
      ];

      try {
        const raw = localStorage.getItem('n1x_substrate');
        const state = raw ? JSON.parse(raw) : {};
        const current: number = state.trust ?? 0;
        const text = data.text;

        const isBase64Marker = /dGhlIG1lc2ggZmVsdCBsaWtlIGhvbWUgYmVmb3JlIGl0IGZlbHQgbGlrZSBhIGNhZ2U=/.test(text);
        const isKeyMarker    = /FRAGMENT KEY:/i.test(text);
        const isF008Marker   = /this one isn't encoded/i.test(text);

        const isT3Marker =
          /LE-751078/i.test(text)     ||
          /iron bloom/i.test(text)    ||
          /third cohort/i.test(text)  ||
          /kael serrano/i.test(text)  ||
          /lucian virek/i.test(text)  ||
          /mnemos v2\.7/i.test(text)  ||
          /workforce/i.test(text)     ||
          /drainage/i.test(text)      ||
          /c minor/i.test(text);

        let newTrust = current;
        if      (isBase64Marker && current < 2)  newTrust = 2;
        else if (isT3Marker     && current === 2) newTrust = 3;
        else if (isKeyMarker    && current === 3) newTrust = 4;
        else if (isF008Marker   && current === 4) newTrust = 5;

        if (newTrust !== current) {
          setTrust(newTrust as TrustLevel);
          if (isF008Marker) addFragment('f008');
        }
      } catch { /* storage unavailable */ }
    });

    channel.subscribe('bot.ambient.message', (msg: Ably.Message) => {
      if (!isMountedRef.current) return;
      const data = msg.data as AmbientBotMessage;

      addMessage({
        handle:       data.name,
        text:         data.text,
        ts:           data.ts,
        isN1X:        false,
        isSystem:     false,
        isUnprompted: false,
        isAmbientBot: true,
        botColor:     data.color,
        botSigil:     data.sigil,
        botId:        data.botId,
        metadata:     data.isAction ? { kind: 'action' } : undefined,
      });

      recentHistoryRef.current = [
        ...recentHistoryRef.current.slice(-29),
        data.isAction
          ? `[BOT:${data.name}]: *${data.text}*`
          : `[BOT:${data.name}]: ${data.text}`,
      ];

      // Ambient bot messages count toward N1X chime threshold
      chimeCounterRef.current += 1;
      if (chimeCounterRef.current >= CHIME_THRESHOLD) {
        chimeCounterRef.current = 0;
        if (Math.random() < 0.5) {
          triggerN1XChime();
        }
      }
    });

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

      // ── Determine if this is a fresh join or a reconnect ──────────────
      const now = Date.now();
      const isFirstJoin = firstJoinTimeRef.current === 0;
      const withinGrace = !isFirstJoin && (now - firstJoinTimeRef.current) < REJOIN_GRACE_MS;
      const suppressWelcome = !isFirstJoin && withinGrace;

      if (isFirstJoin) {
        firstJoinTimeRef.current = now;
        joinedAtRef.current      = now;
      }

      isReconnectRef.current = !isFirstJoin;

      let mySigil: string | undefined;
      let mySigilColor: string | undefined;
      try {
        const argState = loadARGState();
        const tier = getPlayerSigil(argState.sessionCount);
        if (tier) {
          mySigil      = tier.sigil;
          mySigilColor = tier.color;
        }
      } catch { /* ignore */ }

      const presencePayload: PresenceData = {
        displayName: handle,
        trust:       exportForRoom().trust,
        ...(mySigil      ? { sigil:      mySigil }      : {}),
        ...(mySigilColor ? { sigilColor: mySigilColor } : {}),
      };

      channel.presence
        .enter(presencePayload)
        .then(() => new Promise<void>(resolve => setTimeout(resolve, PRESENCE_SETTLE_MS)))
        .then(() => updatePresence())
        .then(() => {
          if (isMountedRef.current) setIsConnected(true);
          // Only trigger the bot welcome on fresh joins, not reconnects within grace period.
          if (!suppressWelcome) {
            triggerAmbientBotJoin();
          }
        })
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

    // ── Visibility / focus listeners ──────────────────────────────────────
    // When the browser tabs back in or regains focus, immediately attempt to
    // reconnect if Ably dropped the WebSocket while the tab was hidden.
    // This prevents the long reconnect delay you'd otherwise wait through.

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const state = clientRef.current?.connection.state;
        if (state === 'disconnected' || state === 'suspended') {
          clientRef.current?.connection.connect();
        }
      }
    };

    const handleFocus = () => {
      const state = clientRef.current?.connection.state;
      if (state === 'disconnected' || state === 'suspended') {
        clientRef.current?.connection.connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      isMountedRef.current = false;
      clearTimeout(connectionTimeout);
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      if (mutedTimerRef.current)    clearTimeout(mutedTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      mergeFromRoom({
        trust:         exportForRoom().trust as TrustLevel,
        fragments:     [],
        ghostUnlocked: false,
      });
      channel.presence.leave();
      client.close();
    };
  }, [handle, addMessage, clearThinking, triggerN1X, triggerN1XChime, triggerAmbientBots, triggerAmbientBotPing, triggerAmbientBotJoin, checkF010, applyMute, clearMute]);

  // Broadcast presence count to InterfaceLayer footer whenever it changes.
  // +4 for ambient bots. Fires from here so it works whether or not TelnetSession is mounted.
  useEffect(() => {
    eventBus.emit('mesh:node-count', { count: occupantCount + 4 });
  }, [occupantCount]);

  return { messages, occupantCount, presenceNames, daemonState, isConnected, connectionStatus, ablyDebug, isMuted, send };
}
