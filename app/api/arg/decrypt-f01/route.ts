// Validates f010 keys.
// Keys are 16-char hex strings delivered by N1X in the Ably channel
// when daemonState transitions to 'exposed'.
// The real gate is receiving the key from N1X — format check is the validation.

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

    const normalized = key.toLowerCase().trim();

    // 16-char hex — the key format N1X generates.
    // The real gate is that N1X delivered this key in the Ably channel.
    const isValid = /^[0-9a-f]{16}$/.test(normalized);

    return Response.json({
      valid: isValid,
      content: isValid ? F010_CONTENT : undefined,
    });
  } catch {
    return Response.json({ valid: false }, { status: 200 });
  }
}
