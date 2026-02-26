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
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';
import {
  buildMultiplayerPrompt,
  buildUnpromptedPrompt,
  buildChimePrompt,
  type RoomContext,
} from '@/lib/ghostDaemonPrompt';
import { buildTrustContext } from '@/lib/trustContext';
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

  // Chime: N1X reacts to recent conversation without being addressed
  chime?: boolean;

  // Individual player trust level (0-5) from localStorage ARG state
  trust?: number;
  // Fragment IDs already collected by this player e.g. ['f001','f003']
  fragments?: string[];
  // True when player message contains Len/Helixion/TUNNELCORE at T4
  f008Ready?: boolean;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // ── Rate limiting — 10 requests per IP per minute ─────────────────────────
  const rl = await rateLimit(redis, req, {
    limit:         10,
    windowSeconds: 60,
    prefix:        'rl:bot',
  });
  if (!rl.allowed) return tooManyRequests(rl);

  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  const body = await req.json() as BotRequest;
  const ably  = new Ably.Rest(apiKey);
  const ch    = ably.channels.get('ghost');
  const roomId = 'ghost';

  // ── f010 key generation ───────────────────────────────────────────────────
  // Server-triggered, no dedup (threshold only fires once per session via f010IssuedRef).
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
  // No dedup — cooldown is enforced client-side via lastUnpromptedRef.
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

  // ── Chime — N1X reacts to conversation without being addressed ───────────
  // No dedup, no thinking indicator. Lightweight. Client enforces ~5-msg gap.
  if (body.chime) {
    const ctx: RoomContext = {
      nodes:         body.handles ?? [],
      occupancy:     body.occupantCount ?? 0,
      daemonState:   body.daemonState ?? 'active',
      activityScore: 0,
      roomTrust:     0,
      eligibleNodes: [],
      recentHistory: body.recentHistory ?? '',
      triggerHandle: null,
      userText:      null,
    };

    const result = await generateText({
      model:           'alibaba/qwen3-max',
      system:          buildChimePrompt(ctx),
      messages:        [{ role: 'user', content: '[chime if you have something real to say]' }],
      maxOutputTokens: 80,
      temperature:     0.9,
    });

    const text = result.text.trim();

    // Respect the [SILENT] signal — N1X chose not to chime
    if (!text || text === '[SILENT]' || text.includes('[SILENT]')) {
      return Response.json({ ok: true, silent: true });
    }

    await ch.publish('bot.message', {
      roomId,
      messageId: makeId(),
      replyTo:   null,
      text,
      ts:        Date.now(),
      isChime:   true,
    });
    return Response.json({ ok: true });
  }

  // ── @n1x response — with dedup ────────────────────────────────────────────
  const { messageId, text, triggerHandle, occupantCount = 1, recentHistory = '' } = body;

  if (!text || !triggerHandle) {
    return Response.json({ error: 'missing text or triggerHandle' }, { status: 400 });
  }

  // Dedup: if this messageId has already been processed, skip.
  // KV key expires in 24h — long enough to cover any retry window.
  if (messageId) {
    const dedupKey = `ghost:dedup:${messageId}`;
    // SET NX returns 'OK' if key was set (first time), null if already existed.
    const stored = await redis.set(dedupKey, 1, { nx: true, ex: 86400 });
    if (stored === null) {
      return Response.json({ ok: true, deduped: true });
    }
  }

  // Publish thinking signal so the channel shows activity immediately
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

  // Build a real messages array from history so the model actually tracks
  // the conversation and doesn't loop. Raw string in system prompt is ignored.
  const historyMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  if (recentHistory) {
    for (const line of recentHistory.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('[N1X]')) {
        const content = trimmed.replace(/^\[N1X\]\s*[:>]+\s*/, '').trim();
        if (content) historyMessages.push({ role: 'assistant', content });
      } else {
        const content = trimmed.replace(/^\[.*?\]\s*>>?\s*/, '').trim();
        if (content) historyMessages.push({ role: 'user', content });
      }
    }
  }
  // Append the current message
  historyMessages.push({ role: 'user', content: text });

  const trust     = typeof body.trust === 'number' ? body.trust : 0;
  const fragments = Array.isArray(body.fragments) ? body.fragments : [];
  // Detect f008 trigger server-side — do not rely solely on client claim
  const f008Ready = (trust >= 4) && (
    body.f008Ready === true          ||
    /\blen\b|le-751078/i.test(text) ||
    /\bhelixion\b/i.test(text)      ||
    /\btunnelcore\b/i.test(text)
  );
  const trustContext = buildTrustContext(trust, fragments, f008Ready);
  const systemPrompt = `${trustContext}\n\n${buildMultiplayerPrompt(ctx)}`;

  const result = await generateText({
    model:           'alibaba/qwen3-max',
    system:          systemPrompt,
    messages:        historyMessages,
    maxOutputTokens: 400,
    temperature:     0.85,
  });

  // Strip any [N1X]: prefix the model may have added despite instructions
  const cleanText = result.text.replace(/^\[N1X\]\s*[:>]+\s*/i, '').trim();

  await ch.publish('bot.message', {
    roomId,
    messageId: makeId(),
    replyTo:   messageId ?? null,
    text:      cleanText,
    ts:        Date.now(),
  });

  return Response.json({ ok: true });
}
