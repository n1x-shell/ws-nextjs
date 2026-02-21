import Ably from 'ably';
import { generateText } from 'ai';
import { buildMultiplayerPrompt, buildUnpromptedPrompt, type RoomContext } from '@/lib/ghostDaemonPrompt';

export const maxDuration = 30;

// ── f010 key store ────────────────────────────────────────────────────────────
// Module-level — survives across requests on the same warm instance.
// If the instance restarts, new keys are reissued on the next exposed trigger.
const issuedF010Keys = new Set<string>();

export function validateF010Key(key: string): boolean {
  return issuedF010Keys.has(key);
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcDaemonState(activityScore: number, roomTrust: number): string {
  if (roomTrust >= 5) return 'exposed';
  if (activityScore >= 150 || roomTrust >= 2) return 'active';
  if (activityScore >= 50) return 'aware';
  return 'dormant';
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  const body = await req.json() as {
    text?: string;
    triggerHandle?: string;
    handles?: string[];
    activityScore?: number;
    roomTrust?: number;
    daemonState?: string;
    occupantCount?: number;
    recentHistory?: string;
    unprompted?: boolean;
    checkExposed?: boolean;
  };

  const ably = new Ably.Rest(apiKey);
  const channel = ably.channels.get('port-33');

  // ── f010 key generation (called when daemonState hits exposed) ─────────────
  if (body.checkExposed) {
    const handles = body.handles ?? [];
    const activityScore = body.activityScore ?? 0;
    const roomTrust = body.roomTrust ?? 0;

    if (calcDaemonState(activityScore, roomTrust) === 'exposed' && handles.length > 0) {
      const raw = handles.sort().join(':') + ':33hz:' + Math.floor(Date.now() / 60000); // minute-resolution
      const key = (await sha256Hex(raw)).slice(0, 16);
      issuedF010Keys.add(key);

      const witnessLine = handles.join('. ') + '.';
      const deliveryText = `this key doesn't exist anywhere else.\nit's made from who was here.\n${witnessLine}\nthat combination will not happen again.\n\n>> FRAGMENT KEY: ${key}`;

      await channel.publish('n1x', { text: deliveryText, isF010: true });
      await channel.publish('system', {
        text: 'ghost-daemon[999]: daemonState transition: active → exposed',
      });
    }

    return Response.json({ ok: true });
  }

  // ── Unprompted transmission ────────────────────────────────────────────────
  if (body.unprompted) {
    const roomContext: RoomContext = {
      nodes: body.handles ?? [],
      occupancy: body.occupantCount ?? 0,
      daemonState: body.daemonState ?? 'aware',
      activityScore: body.activityScore ?? 0,
      roomTrust: body.roomTrust ?? 0,
      eligibleNodes: [],
      recentHistory: '',
      triggerHandle: null,
      userText: null,
    };

    const result = await generateText({
      model: 'alibaba/qwen3-max',
      system: buildUnpromptedPrompt(roomContext),
      messages: [{ role: 'user', content: '[emit unprompted transmission]' }],
      maxOutputTokens: 100,
      temperature: 0.95,
    });

    await channel.publish('n1x', { text: result.text, isUnprompted: true });
    return Response.json({ ok: true });
  }

  // ── @n1x response ──────────────────────────────────────────────────────────
  const { text, triggerHandle, activityScore = 0, roomTrust = 0, occupantCount = 1, recentHistory = '' } = body;

  if (!text || !triggerHandle) {
    return Response.json({ error: 'missing text or triggerHandle' }, { status: 400 });
  }

  const daemonState = calcDaemonState(activityScore, roomTrust);

  const roomContext: RoomContext = {
    nodes: [triggerHandle],
    occupancy: occupantCount,
    daemonState,
    activityScore,
    roomTrust,
    eligibleNodes: [triggerHandle],
    recentHistory,
    triggerHandle,
    userText: text,
  };

  const result = await generateText({
    model: 'alibaba/qwen3-max',
    system: buildMultiplayerPrompt(roomContext),
    messages: [{ role: 'user', content: text }],
    maxOutputTokens: 200,
    temperature: 0.8,
  });

  await channel.publish('n1x', { text: result.text });
  return Response.json({ ok: true });
}
