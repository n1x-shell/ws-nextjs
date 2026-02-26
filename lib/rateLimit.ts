// lib/rateLimit.ts
//
// Per-IP rate limiting using a Redis sliding window counter.
//
// Uses a simple fixed-window INCR/EXPIRE pattern backed by the existing
// @upstash/redis client — no additional package required.
//
// Usage:
//   const result = await rateLimit(redis, req, { limit: 10, windowSeconds: 60 });
//   if (!result.allowed) {
//     return new Response('Too Many Requests', {
//       status: 429,
//       headers: rateLimitHeaders(result),
//     });
//   }

import { Redis } from '@upstash/redis';

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Rolling window duration in seconds. */
  windowSeconds: number;
  /** Namespace prefix so different endpoints don't share counters. */
  prefix?: string;
}

export interface RateLimitResult {
  allowed:   boolean;
  limit:     number;
  remaining: number;
  /** Unix timestamp (seconds) when the current window resets. */
  resetAt:   number;
  /** The resolved IP string, for logging. */
  ip:        string;
}

// ── IP extraction ─────────────────────────────────────────────────────────────
//
// Vercel and most reverse proxies append the originating IP to
// X-Forwarded-For. We take the *last* entry appended by a trusted proxy
// rather than blindly trusting whatever the client sends as the first entry,
// which is trivially spoofable.
//
// Fallback chain:
//   1. cf-connecting-ip (Cloudflare)
//   2. x-real-ip        (Nginx / generic)
//   3. Last IP in x-forwarded-for
//   4. "unknown"        (treated as a shared bucket — still rate limited)

export function extractIp(req: Request): string {
  const h = req.headers;

  const cf = h.get('cf-connecting-ip');
  if (cf) return sanitizeIp(cf);

  const realIp = h.get('x-real-ip');
  if (realIp) return sanitizeIp(realIp);

  const forwarded = h.get('x-forwarded-for');
  if (forwarded) {
    // XFF is a comma-separated list; the rightmost value is set by the last
    // trusted proxy and is harder to spoof than the leftmost.
    const parts = forwarded.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) return sanitizeIp(parts[parts.length - 1]);
  }

  return 'unknown';
}

/** Strip port numbers and brackets from IPv6 literals to get a stable key. */
function sanitizeIp(raw: string): string {
  // Remove IPv6 brackets e.g. [::1] -> ::1
  let ip = raw.replace(/^\[|\]$/g, '');
  // Remove port from IPv4+port e.g. 1.2.3.4:5678 -> 1.2.3.4
  const v4WithPort = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/;
  const match = ip.match(v4WithPort);
  if (match) ip = match[1];
  return ip;
}

// ── Rate limiter ──────────────────────────────────────────────────────────────

export async function rateLimit(
  redis:   Redis,
  req:     Request,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { limit, windowSeconds, prefix = 'rl' } = options;

  const ip  = extractIp(req);
  const now = Math.floor(Date.now() / 1000);

  // Bucket key is scoped to the current fixed window so it auto-expires.
  // e.g.  rl:bot:1.2.3.4:28123456   (28123456 = unix_ts / 60)
  const bucket  = Math.floor(now / windowSeconds);
  const key     = `${prefix}:${ip}:${bucket}`;
  const resetAt = (bucket + 1) * windowSeconds;

  // INCR atomically increments (creates at 0 if absent) and returns new value.
  const count = await redis.incr(key);

  // Set TTL on first request so the key self-cleans.
  // On subsequent requests within the window the key already has a TTL.
  if (count === 1) {
    // Add a small buffer so the key survives until the window boundary.
    await redis.expire(key, windowSeconds + 5);
  }

  const remaining = Math.max(0, limit - count);
  const allowed   = count <= limit;

  return { allowed, limit, remaining, resetAt, ip };
}

// ── Standard rate-limit response headers (RFC 6585 / IETF draft) ──────────────

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit':     String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset':     String(result.resetAt),
    'Retry-After':           String(result.resetAt - Math.floor(Date.now() / 1000)),
  };
}

// ── Convenience — returns a 429 Response ready to return from a route ─────────

export function tooManyRequests(result: RateLimitResult): Response {
  return Response.json(
    {
      error:   'Too Many Requests',
      resetAt: result.resetAt,
    },
    {
      status:  429,
      headers: rateLimitHeaders(result),
    },
  );
}
