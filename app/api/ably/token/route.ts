export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  const colonIdx = apiKey.indexOf(':');
  if (colonIdx === -1) {
    return Response.json({ error: 'ABLY_API_KEY malformed — expected keyName:keySecret' }, { status: 500 });
  }

  const keyName = apiKey.slice(0, colonIdx);
  const credentials = btoa(apiKey);

  try {
    // Request a signed TokenDetails (not a TokenRequest) from Ably REST
    // This returns { token, expires, issued, capability, clientId }
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

    if (!res.ok) {
      return Response.json({ error: `Ably ${res.status}`, detail: body }, { status: 502 });
    }

    return Response.json(body);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
