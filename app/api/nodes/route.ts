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
    // n1x:shell = all visitors (shell + chat users)
    // ghost = chat users only (subset of shell)
    const shellChannel = rest.channels.get('n1x:shell');
    const shellResult  = await shellChannel.presence.get();
    const shellCount   = shellResult.items.length;

    // +4 for ambient bots (Vestige, Lumen, Cascade + ghost-daemon)
    return Response.json({ count: shellCount + 4 });
  } catch {
    return Response.json({ count: 4 });
  }
}
