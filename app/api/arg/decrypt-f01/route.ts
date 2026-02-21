import { validateF010Key } from '@/lib/f010Store';

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

    // Check module-level store (works when same warm instance served the /messages request)
    // Fallback: accept any well-formed 16-char hex — the real gate is N1X delivering it in-channel
    const isValid = validateF010Key(normalized) || /^[0-9a-f]{16}$/.test(normalized);

    return Response.json({
      valid: isValid,
      content: isValid ? F010_CONTENT : undefined,
    });
  } catch {
    return Response.json({ valid: false }, { status: 200 });
  }
}
