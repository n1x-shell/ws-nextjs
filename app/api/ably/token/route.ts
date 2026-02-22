import Ably from 'ably';

export const maxDuration = 10;

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return new Response('ABLY_API_KEY not configured', { status: 500 });
  }

  try {
    const rest = new Ably.Rest(apiKey);
    const tr = await rest.auth.createTokenRequest({
      capability: { ghost: ['publish', 'subscribe', 'presence', 'history'] },
      ttl: 3600000,
    });

    const body = {
      ...tr,
      timestamp: String(tr.timestamp),
      ttl: String(tr.ttl),
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ably token error:', err);
    return new Response('token generation failed', { status: 500 });
  }
}
