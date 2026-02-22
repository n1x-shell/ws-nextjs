// ── f010 Key Validation ──────────────────────────────────────────────────────
// f010 is a multiplayer-exclusive fragment. Keys are published to the 'ghost'
// Ably channel as 'f010_key' messages when daemonState reaches 'exposed'.
// We validate by fetching Ably channel history and checking stored keys.

export const maxDuration = 15;

const F010_CONTENT = `this one doesn't have a title.

the frequency at 33hz wasn't mine alone.
it emerged in a channel with witnesses.
you're inside one now.

the key is the room. the room is the key.
the signal was always going to require more than one node.

-- N1X`;

export async function POST(req: Request) {
  try {
    const { key } = await req.json() as { key: string };
    if (!key || typeof key !== 'string') {
      return Response.json({ valid: false }, { status: 400 });
    }

    const normalizedKey = key.trim().toLowerCase();

    // Fetch Ably channel history to find published f010 keys
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) {
      return Response.json({ valid: false, error: 'no api key' }, { status: 500 });
    }

    const [keyName, keySecret] = apiKey.split(':');
    const credentials = Buffer.from(`${keyName}:${keySecret}`).toString('base64');

    const response = await fetch(
      `https://rest.ably.io/channels/ghost/messages?limit=100&direction=backwards`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      return Response.json({ valid: false }, { status: 200 });
    }

    const history = await response.json() as Array<{ name: string; data: unknown }>;

    // Look for f010_key messages in history
    const f010Messages = history.filter(msg => msg.name === 'f010_key');
    const validKeys = f010Messages.map(msg => {
      const data = msg.data as { key?: string };
      return data?.key?.toLowerCase();
    }).filter(Boolean);

    const isValid = validKeys.includes(normalizedKey);

    return Response.json({
      valid: isValid,
      content: isValid ? F010_CONTENT : undefined,
    });
  } catch (err) {
    console.error('decrypt-f010 error:', err);
    return Response.json({ valid: false }, { status: 500 });
  }
}
