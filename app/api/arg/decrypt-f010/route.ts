// Validates f010 keys against PartyKit room storage.
// Called by the decrypt command for keys not in the local hardcoded table.

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

    const partykitHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
    if (!partykitHost) {
      return Response.json({ valid: false, error: 'partykit not configured' }, { status: 503 });
    }

    // Query PartyKit room storage via the REST API
    // PartyKit exposes: GET https://<host>/party/<room-id>  (with storage access via party server)
    // We use the PartyKit parties API to read room state
    const roomApiUrl = `https://${partykitHost}/party/port-33`;

    // Fetch current room state
    const roomRes = await fetch(roomApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!roomRes.ok) {
      // If we can't reach PartyKit, check can't be made — fail closed
      return Response.json({ valid: false }, { status: 200 });
    }

    const roomData = await roomRes.json() as { f010Events?: Array<{ key: string }> };
    const f010Events = roomData?.f010Events ?? [];

    const isValid = f010Events.some((e) => e.key === key.toLowerCase().trim());

    return Response.json({
      valid: isValid,
      content: isValid ? F010_CONTENT : undefined,
    });
  } catch {
    return Response.json({ valid: false }, { status: 200 });
  }
}
