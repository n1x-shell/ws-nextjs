import { generateText } from 'ai';
import { buildMultiplayerPrompt, buildUnpromptedPrompt, RoomContext } from '@/lib/ghostDaemonPrompt';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { roomContext, userMessage, unprompted } = await req.json() as {
      roomContext: RoomContext;
      userMessage?: string;
      unprompted?: boolean;
    };

    if (!roomContext) {
      return Response.json({ error: 'missing roomContext' }, { status: 400 });
    }

    const systemPrompt = unprompted
      ? buildUnpromptedPrompt(roomContext)
      : buildMultiplayerPrompt(roomContext);

    const messages = unprompted
      ? [{ role: 'user' as const, content: '[emit unprompted transmission now]' }]
      : [{ role: 'user' as const, content: userMessage || '' }];

    const { text } = await generateText({
      model: 'alibaba/qwen3-max',
      system: systemPrompt,
      messages,
      maxOutputTokens: unprompted ? 80 : 200,
      temperature: unprompted ? 0.9 : 0.8,
    });

    return Response.json({ text: text.trim() });
  } catch (err) {
    console.error('ghost/chat error:', err);
    return Response.json({ error: 'signal degraded' }, { status: 500 });
  }
}
