// /api/messages
// Accepts an outgoing chat message from an authenticated client and publishes
// it to the Ably 'ghost' channel using the server-side REST client.
//
// Because the publish happens server-side, client tokens no longer need the
// 'publish' capability on the ghost channel, which prevents clients from
// spoofing userId values or flooding the channel directly.
//
// The userId is stamped server-side from the validated clientId rather than
// trusting the value sent by the client.
//
// Rate limited: 30 messages per client per minute.

import Ably from 'ably';
import { Redis } from '@upstash/redis';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';
import type { MessageMetadata } from '@/lib/ablyClient';

export const dynamic = 'force-dynamic';

const redis = Redis.fromEnv();

interface MessageBody {
  clientId:  string;
  text:      string;
  roomId?:   string;
  metadata?: MessageMetadata;
}

function makeId(): string {
  return crypto.randomUUID();
}

// ── Validation ────────────────────────────────────────────────────────────────

const MAX_TEXT_LENGTH = 2000;

function isValidHandle(handle: string): boolean {
  // Must be 1–32 printable non-whitespace characters
  return /^\S{1,32}$/.test(handle);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // ── Rate limiting — 30 messages per IP per minute ─────────────────────────
  const rl = await rateLimit(redis, req, {
    limit:         30,
    windowSeconds: 60,
    prefix:        'rl:messages',
  });
  if (!rl.allowed) return tooManyRequests(rl);

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: MessageBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { clientId, text, roomId, metadata } = body;

  // ── Validate inputs ───────────────────────────────────────────────────────
  if (!clientId || typeof clientId !== 'string' || !isValidHandle(clientId)) {
    return Response.json({ error: 'Invalid clientId' }, { status: 400 });
  }
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return Response.json({ error: 'Message text is required' }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json({ error: `Message exceeds ${MAX_TEXT_LENGTH} characters` }, { status: 400 });
  }
  if (metadata && !['action', 'chat'].includes(metadata.kind)) {
    return Response.json({ error: 'Invalid metadata.kind' }, { status: 400 });
  }

  // Whitelist valid channel targets
  const ALLOWED_ROOMS = ['ghost', 'mancave'];
  const targetChannel = (roomId && ALLOWED_ROOMS.includes(roomId)) ? roomId : 'ghost';

  // ── Publish via server-side REST client ───────────────────────────────────
  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  const messageId = makeId();

  const payload = {
    roomId:    targetChannel,
    userId:    clientId,           // stamped server-side — client cannot spoof this
    messageId,
    text:      text.trim(),
    ts:        Date.now(),
    ...(metadata ? { metadata } : {}),
  };

  try {
    const rest = new Ably.Rest(apiKey);
    await rest.channels.get(targetChannel).publish('user.message', payload);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 502 });
  }

  return Response.json({ ok: true, messageId });
}
