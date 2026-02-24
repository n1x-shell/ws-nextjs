// /api/nodes
// Returns the current presence count on the ghost channel via Ably REST.
// Called by InterfaceLayer to keep NODES up to date without requiring
// the user to be connected to the Ably room.

import Ably from 'ably';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ count: 4 }, { status: 200 });
  }
  try {
    const rest = new Ably.Rest(apiKey);
    const channel = rest.channels.get('ghost');
    const result = await channel.presence.get();
    // +4 for ambient bots (Vestige, Lumen, Cascade + ghost-daemon)
    return Response.json({ count: result.items.length + 4 });
  } catch {
    return Response.json({ count: 4 });
  }
}
