import Ably from 'ably';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }
  try {
    const rest = new Ably.Rest(apiKey);
    const tokenRequest = await rest.auth.createTokenRequest({
      capability: { 'port-33': ['publish', 'subscribe', 'presence', 'history'] },
      ttl: 3600 * 1000, // 1 hour in ms
    });
    return Response.json(tokenRequest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
