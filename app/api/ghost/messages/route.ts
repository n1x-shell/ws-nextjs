import Ably from 'ably';
import { generateText } from 'ai';
import { buildMultiplayerPrompt, buildUnpromptedPrompt, type RoomContext } from '@/lib/ghostDaemonPrompt';
import { registerF010Key } from '@/lib/f010Store';

export const maxDuration = 30;

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: Request) {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  const body = await req.json() as {
    text?: string;
    triggerHandle?: string;
    handles?: string[];
    daemonState?: string;
    occupantCount?: number;
    recentHistory?: string;
    unprompted?: boolean;
    checkExposed?: boolean;
  };

  const ably = new Ably.Rest(apiKey);
  const channel = ably.channels.get('port-33');

  // ── f010 key generation ───────────────────────────────────────────────────
  if (body.checkExposed) {
    const handles = (body.handles ?? []).sort();
    if (handles.length > 0) {
      const raw = handles.join(':') + ':33hz:' + Math.floor(Date.now() / 60000);
      const key = (await sha256Hex(raw)).slice(0, 16);
      registerF010Key(key);

      const witnessLine = handles.join('. ') + '.';
      const deliveryText =
        `this key doesn't exist anywhere else.\n` +
        `it's made from who was here.\n` +
        `${witnessLine}\n` +
        `that combination will not happen again.\n\n` +
        `>> FRAGMENT KEY: ${key}`;

      await channel.publish('n1x', { text: deliveryText, isF010: true });
    }
    return Response.json({ ok: true });
  }

  // ── Unprompted transmission ───────────────────────────────────────────────
  if (body.unprompted) {
    const roomContext: RoomContext = {
      nodes: body.handles ?? [],
      occupancy: body.occupantCount ?? 0,
      daemonState: body.daemonState ?? 'active',
      activityScore: 0,
      roomTrust: 0,
      eligibleNodes: [],
      recentHistory: [],
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

  // ── @n1x response ─────────────────────────────────────────────────────────
  const { text, triggerHandle, occupantCount = 1, recentHistory = '' } = body;

  if (!text || !triggerHandle) {
    return Response.json({ error: 'missing text or triggerHandle' }, { status: 400 });
  }

  const roomContext: RoomContext = {
    nodes: [triggerHandle],
    occupancy: occupantCount,
    daemonState: body.daemonState ?? 'active',
    activityScore: 0,
    roomTrust: 0,
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
