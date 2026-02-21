import Ably from 'ably';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  const client = new Ably.Rest(apiKey);
  const tokenRequest = await client.auth.createTokenRequest({
    capability: {
      'port-33': ['publish', 'subscribe', 'presence', 'history'],
    },
  });

  return Response.json(tokenRequest);
}
