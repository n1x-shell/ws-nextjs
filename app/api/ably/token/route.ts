export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ABLY_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const colonIdx = apiKey.indexOf(':');
  if (colonIdx === -1) {
    return new Response(JSON.stringify({ error: 'ABLY_API_KEY malformed — expected keyName:keySecret' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const keyName = apiKey.slice(0, colonIdx);
  const credentials = btoa(apiKey);

  try {
    // Use Ably's server time to avoid clock-skew errors (40104)
    const timeRes = await fetch('https://rest.ably.io/time');
    const [ablyTime] = await timeRes.json() as [number];

    const res = await fetch(`https://rest.ably.io/keys/${keyName}/requestToken`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        capability: { 'port-33': ['publish', 'subscribe', 'presence', 'history'] },
        ttl: 3600000,   // 1 hour
        timestamp: ablyTime,
      }),
    });

    const body = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Ably ${res.status}`, detail: body }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
