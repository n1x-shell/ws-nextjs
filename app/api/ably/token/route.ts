import Ably from 'ably';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ABLY_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rest = new Ably.Rest(apiKey);
  const tr = await rest.auth.createTokenRequest({
    capability: { 'port-33': ['publish', 'subscribe', 'presence', 'history'] },
    ttl: 3600000,
  });

  // Ably REST requires timestamp as a string, not a number
  const body = {
    ...tr,
    timestamp: String(tr.timestamp),
    ttl: String(tr.ttl),
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
