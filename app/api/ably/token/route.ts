export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ABLY_API_KEY not set' }), {
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

  const res = await fetch(`https://rest.ably.io/keys/${keyName}/requestToken`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      capability: { 'port-33': ['publish', 'subscribe', 'presence', 'history'] },
      ttl: 3600000,
    }),
  });

  const body = await res.json();

  return new Response(JSON.stringify(body), {
    status: res.ok ? 200 : 502,
    headers: { 'Content-Type': 'application/json' },
  });
}
