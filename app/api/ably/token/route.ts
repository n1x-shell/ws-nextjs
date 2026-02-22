import Ably from 'ably';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  try {
    const client = new Ably.Rest(apiKey);
    const tokenRequest = await client.auth.createTokenRequest({
      capability: { 'port-33': ['publish', 'subscribe', 'presence', 'history'] },
    });
    return Response.json(tokenRequest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
