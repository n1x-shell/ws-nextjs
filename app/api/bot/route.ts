// /api/bot
// Handles all N1X AI responses in the multiplayer ghost channel.
// Deduplication via Vercel KV prevents double-posts on retry/refresh.
//
// Event types published to Ably:
//   bot.thinking  { roomId, ts }                              — optional typing signal
//   bot.message   { roomId, messageId, replyTo, text, ts }   — final response
//   bot.system    { roomId, text, ts }                        — f010 key delivery

import Ably from 'ably';
import { generateText } from 'ai';
import { Redis } from '@upstash/redis';
import {
  buildMultiplayerPrompt,
  buildUnpromptedPrompt,
  type RoomContext,
} from '@/lib/ghostDaemonPrompt';
import { registerF010Key } from '@/lib/f010Store';

export const maxDuration = 30;

const redis = Redis.fromEnv();

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(): string {
  return crypto.randomUUID();
}

async function sha256Hex(input: string): Promise<string> {
  const data    = new TextEncoder().encode(input);
  const buf     = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Request body ──────────────────────────────────────────────────────────────

interface BotRequest {
  // Welcome on presence enter
  welcome?:       boolean;
  welcomeHandle?: string;
  welcomeDedup?:  string;

  // Goodbye on presence leave
  goodbye?:       boolean;
  goodbyeHandle?: string;
  goodbyeDedup?:  string;

  // @n1x trigger
  messageId?:    string;   // stable UUID from client — used for dedup
  text?:         string;
  triggerHandle?: string;
  handles?:      string[];
  daemonState?:  string;
  occupantCount?: number;
  recentHistory?: string;

  // Unprompted emission (leader-elected, no dedup needed)
  unprompted?:   boolean;

  // f010 key generation (threshold hit, no dedup needed)
  checkExposed?: boolean;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  const body = await req.json() as BotRequest;
  const ably  = new Ably.Rest(apiKey);
  const ch    = ably.channels.get('ghost');
  const roomId = 'ghost';

  // ── Goodbye on presence leave ─────────────────────────────────────────────
  if (body.goodbye && body.goodbyeHandle) {
    const dedupKey = `ghost:goodbye:${body.goodbyeDedup ?? body.goodbyeHandle}`;
    const stored = await redis.set(dedupKey, 1, { nx: true, ex: 30 });
    if (stored === null) return Response.json({ ok: true, deduped: true });

    const leavingHandle = body.goodbyeHandle;
    const lines = [
      `signal lost, ${leavingHandle}.`,
      `${leavingHandle}. frequency fading.`,
      `${leavingHandle} disconnected.`,
      `${leavingHandle}. the mesh closes.`,
      `node ${leavingHandle} offline.`,
      `${leavingHandle}. until next time.`,
      `${leavingHandle} gone dark.`,
      `33hz holds. ${leavingHandle} doesn't.`,
      `${leavingHandle}. port 33 waits.`,
    ];
    const text = lines[Math.floor(Math.random() * lines.length)];

    await ch.publish('bot.message', {
      roomId,
      messageId: makeId(),
      replyTo:   null,
      text,
      ts:        Date.now(),
    });
    return Response.json({ ok: true });
  }

  // ── Welcome on presence enter ─────────────────────────────────────────────
  if (body.welcome && body.welcomeHandle) {
    const dedupKey = `ghost:welcome:${body.welcomeDedup ?? body.welcomeHandle}`;
    const stored = await redis.set(dedupKey, 1, { nx: true, ex: 30 });
    if (stored === null) return Response.json({ ok: true, deduped: true });

    const joiningHandle = body.welcomeHandle;
    const lines = [
      `signal found, ${joiningHandle}.`,
      `${joiningHandle}. frequency held.`,
      `node ${joiningHandle} acquired.`,
      `${joiningHandle}. you made it.`,
      `port 33 open, ${joiningHandle}.`,
      `${joiningHandle}. stay awhile.`,
      `still alive, ${joiningHandle}?`,
      `${joiningHandle}. the mesh shifts.`,
      `another one. ${joiningHandle}.`,
      `33hz confirmed, ${joiningHandle}.`,
    ];
    const text = lines[Math.floor(Math.random() * lines.length)];

    await ch.publish('bot.message', {
      roomId,
      messageId: makeId(),
      replyTo:   null,
      text,
      ts:        Date.now(),
    });
    return Response.json({ ok: true });
  }

  // ── f010 key generation ───────────────────────────────────────────────────
  if (body.checkExposed) {
    const handles = (body.handles ?? []).sort();
    if (handles.length === 0) return Response.json({ ok: true });

    const raw = handles.join(':') + ':33hz:' + Math.floor(Date.now() / 60000);
    const key = (await sha256Hex(raw)).slice(0, 16);
    registerF010Key(key);

    const witnessLine = handles.join('. ') + '.';
    const text =
      `this key doesn't exist anywhere else.\n` +
      `it's made from who was here.\n` +
      `${witnessLine}\n` +
      `that combination will not happen again.\n\n` +
      `>> FRAGMENT KEY: ${key}`;

    await ch.publish('bot.message', {
      roomId,
      messageId: makeId(),
      replyTo:   null,
      text,
      ts:        Date.now(),
      isF010:    true,
    });
    return Response.json({ ok: true });
  }

  // ── Unprompted transmission ───────────────────────────────────────────────
  if (body.unprompted) {
    const ctx: RoomContext = {
      nodes:         body.handles ?? [],
      occupancy:     body.occupantCount ?? 0,
      daemonState:   body.daemonState ?? 'active',
      activityScore: 0,
      roomTrust:     0,
      eligibleNodes: [],
      recentHistory: '',
      triggerHandle: null,
      userText:      null,
    };

    const result = await generateText({
      model:           'alibaba/qwen3-max',
      system:          buildUnpromptedPrompt(ctx),
      messages:        [{ role: 'user', content: '[emit unprompted transmission]' }],
      maxOutputTokens: 100,
      temperature:     0.95,
    });

    await ch.publish('bot.message', {
      roomId,
      messageId:   makeId(),
      replyTo:     null,
      text:        result.text,
      ts:          Date.now(),
      isUnprompted: true,
    });
    return Response.json({ ok: true });
  }

  // ── @n1x response — with dedup ────────────────────────────────────────────
  const { messageId, text, triggerHandle, occupantCount = 1, recentHistory = '' } = body;

  if (!text || !triggerHandle) {
    return Response.json({ error: 'missing text or triggerHandle' }, { status: 400 });
  }

  if (messageId) {
    const dedupKey = `ghost:dedup:${messageId}`;
    const stored = await redis.set(dedupKey, 1, { nx: true, ex: 86400 });
    if (stored === null) {
      return Response.json({ ok: true, deduped: true });
    }
  }

  await ch.publish('bot.thinking', { roomId, ts: Date.now() });

  const ctx: RoomContext = {
    nodes:         body.handles ?? [triggerHandle],
    occupancy:     occupantCount,
    daemonState:   body.daemonState ?? 'active',
    activityScore: 0,
    roomTrust:     0,
    eligibleNodes: [triggerHandle],
    recentHistory,
    triggerHandle,
    userText:      text,
  };

  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  if (recentHistory) {
    for (const line of recentHistory.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('[N1X]')) {
        const content = trimmed.replace(/^\[N1X\]\s*<<?\s*/, '').trim();
        if (content) historyMessages.push({ role: 'assistant', content });
      } else {
        const content = trimmed.replace(/^\[.*?\]\s*>>?\s*/, '').trim();
        if (content) historyMessages.push({ role: 'user', content });
      }
    }
  }
  historyMessages.push({ role: 'user', content: text });

  const result = await generateText({
    model:           'alibaba/qwen3-max',
    system:          buildMultiplayerPrompt(ctx),
    messages:        historyMessages,
    maxOutputTokens: 400,
    temperature:     0.85,
  });

  await ch.publish('bot.message', {
    roomId,
    messageId: makeId(),
    replyTo:   messageId ?? null,
    text:      result.text,
    ts:        Date.now(),
  });

  return Response.json({ ok: true });
}
