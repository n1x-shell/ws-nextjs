import Ably from 'ably';

export async function GET(request: Request) {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  // Extract clientId from query param if provided
  const url = new URL(request.url);
  const clientId = url.searchParams.get('clientId') ?? undefined;

  try {
    const client = new Ably.Rest(apiKey);
    const tokenRequest = await client.auth.createTokenRequest({
      clientId,
      capability: {
        'port-33': ['publish', 'subscribe', 'presence', 'history'],
      },
    });

    return Response.json(tokenRequest);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
