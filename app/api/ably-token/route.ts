// /api/ably-token
// Issues Ably token requests to clients. API key never leaves the server.
// clientId '*' = wildcard; clients set their own (the player handle).
// Without a clientId, presence.enter() throws 40012 silently.

import Ably from 'ably';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }
  try {
    const rest = new Ably.Rest(apiKey);
    const tokenRequest = await rest.auth.createTokenRequest({
      capability: { ghost: ['publish', 'subscribe', 'presence', 'history'] },
      clientId: '*',
      ttl: 3600 * 1000,
    });
    return Response.json(tokenRequest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
