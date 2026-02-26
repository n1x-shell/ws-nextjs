// /api/ably-token
// Issues Ably token requests to clients. API key never leaves the server.
// clientId '*' = wildcard; clients set their own (the player handle).
// Without a clientId, presence.enter() throws 40012 silently.
//
// All tokens include n1x:mod [subscribe] so every client can receive
// mod actions (kicks, mutes, unmutes) published by admins via /api/mod.
//
// Rate limited: 30 token requests per IP per minute to prevent unlimited
// Ably connection creation and quota exhaustion.

import Ably from 'ably';
import { Redis } from '@upstash/redis';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const redis = Redis.fromEnv();

export async function GET(req: Request) {
  // ── Rate limiting — 30 requests per IP per minute ─────────────────────────
  const rl = await rateLimit(redis, req, {
    limit:         30,
    windowSeconds: 60,
    prefix:        'rl:ably-token',
  });
  if (!rl.allowed) return tooManyRequests(rl);

  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }
  try {
    const rest = new Ably.Rest(apiKey);
    const tokenRequest = await rest.auth.createTokenRequest({
      capability: {
        ghost:       ['subscribe', 'presence', 'history'],
        'n1x:mod':   ['subscribe'],
        'n1x:shell': ['presence'],
      },
      clientId: '*',
      ttl: 3600 * 1000,
    });
    return Response.json(tokenRequest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
