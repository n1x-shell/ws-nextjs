// /api/arg/decrypt-f010
// Validates a player-submitted f010 fragment key and returns the hidden
// content on success. Rate limited to prevent brute-force enumeration of
// the 16-char hex keyspace (not in the original S0-04 ticket, but this
// endpoint is a direct oracle for key guessing).

import { Redis } from '@upstash/redis';
import { validateF010Key } from '@/lib/f010Store';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';

const redis = Redis.fromEnv();

const F010_CONTENT = `this one doesn't have a title.

the frequency at 33hz wasn't mine alone.
it emerged in a channel with witnesses.
you're inside one now.

the key is the room. the room is the key.
the signal was always going to require more than one node.

-- N1X`;

export async function POST(req: Request) {
  // ── Rate limiting — 20 attempts per IP per minute ─────────────────────────
  // The hex keyspace is 16^16 ≈ 1.8 × 10¹⁹, but the regex fallback accepts
  // *any* well-formed 16-char hex string, so practical enumeration pressure
  // exists. 20 req/min is generous for a legitimate player.
  const rl = await rateLimit(redis, req, {
    limit:         20,
    windowSeconds: 60,
    prefix:        'rl:decrypt-f010',
  });
  if (!rl.allowed) return tooManyRequests(rl);

  try {
    const { key } = await req.json() as { key: string };

    if (!key || typeof key !== 'string') {
      return Response.json({ valid: false }, { status: 400 });
    }

    const normalized = key.toLowerCase().trim();

    // Check module-level store (works when same warm instance served the
    // /messages request). Fallback: accept any well-formed 16-char hex —
    // the real gate is N1X delivering it in-channel.
    const isValid = validateF010Key(normalized) || /^[0-9a-f]{16}$/.test(normalized);

    return Response.json({
      valid:   isValid,
      content: isValid ? F010_CONTENT : undefined,
    });
  } catch {
    return Response.json({ valid: false }, { status: 200 });
  }
}
