// app/api/mod/route.ts
// Server-side mod action dispatcher.
// Validates ADMIN_SECRET, then publishes mod events to the n1x:mod Ably channel.
// Clients subscribe to n1x:mod (subscribe-only capability) to receive kicks/mutes.

import Ably from 'ably';

export const dynamic = 'force-dynamic';

interface ModAction {
  type:        'kick' | 'mute' | 'unmute';
  clientId:    string;
  durationMs?: number | null;
}

interface ModRequest {
  adminSecret: string;
  verify?:     boolean;
  action?:     ModAction;
}

export async function POST(request: Request) {
  let body: ModRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  const { adminSecret, verify, action } = body;

  // ── Validate secret ──────────────────────────────────────────────────────
  const expected = process.env.ADMIN_SECRET?.trim();
  if (!expected) {
    return Response.json({ error: 'mod system not configured' }, { status: 500 });
  }
  if (!adminSecret || adminSecret.trim() !== expected) {
    return Response.json({ error: 'unauthorized' }, { status: 403 });
  }

  // ── Verify-only mode (used for /mod auth) ────────────────────────────────
  if (verify) {
    return Response.json({ ok: true });
  }

  // ── Publish mod action ───────────────────────────────────────────────────
  if (!action || !action.type || !action.clientId) {
    return Response.json({ error: 'missing action' }, { status: 400 });
  }

  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  try {
    const rest = new Ably.Rest(apiKey);
    const channel = rest.channels.get('n1x:mod');

    const payload: ModAction = {
      type:     action.type,
      clientId: action.clientId,
    };
    if (action.type === 'mute') {
      payload.durationMs = action.durationMs ?? null;
    }

    await channel.publish('mod', payload);
    return Response.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
