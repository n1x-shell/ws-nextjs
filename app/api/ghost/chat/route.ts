import { generateText } from 'ai';
import { buildMultiplayerPrompt, buildUnpromptedPrompt, type RoomContext } from '@/lib/ghostDaemonPrompt';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      roomContext: RoomContext;
      userMessage?: string;
      unprompted?: boolean;
    };

    const { roomContext, userMessage, unprompted } = body;

    if (!roomContext) {
      return Response.json({ error: 'missing roomContext' }, { status: 400 });
    }

    const systemPrompt = unprompted
      ? buildUnpromptedPrompt(roomContext)
      : buildMultiplayerPrompt(roomContext);

    const messages = unprompted
      ? [{ role: 'user' as const, content: '[emit unprompted transmission]' }]
      : [{ role: 'user' as const, content: userMessage ?? '' }];

    const result = await generateText({
      model: 'alibaba/qwen3-max',
      system: systemPrompt,
      messages,
      maxOutputTokens: unprompted ? 120 : 200,
      temperature: unprompted ? 1.0 : 1.0,
      topP: 0.95,
    });

    return Response.json({ text: result.text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
