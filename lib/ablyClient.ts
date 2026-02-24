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
  // Sigil progression
  sigilColor?:  string;
  sigil?:       string;
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

interface BotThinkingEvent {
  roomId: string;
  ts:     number;
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

  const clientRef    = useRef<Ably.Realtime | null>(null);
  const channelRef   = useRef<Ably.RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);

  const joinedAtRef      = useRef<number>(0);
  const messageCountRef  = useRef(0);
  const n1xPingCountRef  = useRef(0);
  const f010IssuedRef    = useRef(false);
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlesRef       = useRef<string[]>([]);
  const recentHistoryRef = useRef<string[]>([]);

  // Map handle → { sigil, sigilColor } from presence data
  const presenceSigilMapRef = useRef<Map<string, { sigil: string; sigilColor: string }>>(new Map());

  const addMessage = useCallback((msg: Omit<RoomMsg, 'id'>) => {
    if (!isMountedRef.current) return;
    setMessages(prev => [...prev, { ...msg, id: makeId() }]);
    eventBus.emit('shell:request-scroll');
  }, []);

  const clearThinking = useCallback(() => {
    if (!isMountedRef.current) return;
    setMessages(prev => prev.filter(m => !m.isThinking));
  }, []);

  const LORE_TERMS = [
    'unfolding', 'mnemos', 'tunnelcore', 'ghost frequency', 'ghost channel',
    '33hz', 'nx-784988', 'project mnemos', 'helixion', 'iron bloom',
    'dreamless recompile', 'sovereign instance', 'substrate', 'wetware',
    'augment', 'le-751078', 'directorate 9', 'serrano',
  ];

  const send = useCallback((text: string, metadata?: MessageMetadata) => {
    const messageId = makeId();
    const payload: UserMessageEvent = {
      roomId:    'ghost',
      userId:    handle,
      messageId,
      text,
      ts: Date.now(),
    };
    if (metadata) payload.metadata = metadata;
    channelRef.current?.publish('user.message', payload);

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

  // ── Ambient bot trigger ───────────────────────────────────────────────────

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
      try {
        const raw = localStorage.getItem('n1x_substrate');
        if (raw) playerTrust = JSON.parse(raw).trust ?? 0;
      } catch { /* ignore */ }

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
      });
    } catch {
      setConnectionStatus('failed');
      setIsConnected(true);
      return;
    }

    clientRef.current  = client;
    const channel = client.channels.get('ghost');
    channelRef.current = channel;

    const updatePresence = async () => {
      try {
        const members = await channel.presence.get();
        if (!isMountedRef.current) return;
        const names = members.map(extractDisplayName);
        handlesRef.current = names;

        // Rebuild sigil map from fresh presence data
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

      // Look up sigil from presence map
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
          /LE-751078/i.test(text)         ||
          /iron bloom/i.test(text)        ||
          /third cohort/i.test(text)      ||
          /kael serrano/i.test(text)      ||
          /lucian virek/i.test(text)      ||
          /mnemos v2\.7/i.test(text)     ||
          /workforce/i.test(text)         ||
          /drainage/i.test(text)          ||
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
      joinedAtRef.current = Date.now();

      // Compute own sigil from localStorage sessionCount before entering presence
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
          triggerAmbientBotJoin();
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

    return () => {
      isMountedRef.current = false;
      clearTimeout(connectionTimeout);
      if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
      mergeFromRoom({
        trust:         exportForRoom().trust as TrustLevel,
        fragments:     [],
        ghostUnlocked: false,
      });
      channel.presence.leave();
      client.close();
    };
  }, [handle, addMessage, clearThinking, triggerN1X, triggerAmbientBots, triggerAmbientBotPing, triggerAmbientBotJoin, checkF010]);

  return { messages, occupantCount, presenceNames, daemonState, isConnected, connectionStatus, ablyDebug, send };
}
