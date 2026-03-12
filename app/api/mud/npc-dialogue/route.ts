// app/api/mud/npc-dialogue/route.ts
// TUNNELCORE MUD — NPC Dialogue Endpoint
// Takes NPC definitions + player message, returns NPC responses as JSON.
// Does NOT publish to Ably — responses render locally via addLocalMsg.

import { generateText } from 'ai';
import { onyx } from '@/lib/onyxProvider';

export const maxDuration = 15;

interface NPCEntry {
  npcId: string;
  name: string;
  systemPrompt: string;
}

interface DialogueRequest {
  npcs: NPCEntry[];
  playerMessage: string;
  playerHandle: string;
}

interface NPCResponse {
  npcId: string;
  name: string;
  text: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DialogueRequest;
    const { npcs, playerMessage, playerHandle } = body;

    if (!npcs?.length || !playerMessage) {
      return Response.json({ error: 'missing npcs or message' }, { status: 400 });
    }

    // Generate responses for each NPC in parallel
    const responses: NPCResponse[] = [];

    const results = await Promise.allSettled(
      npcs.map(async (npc) => {
        const result = await generateText({
          model: onyx('alibaba/qwen3-max'),
          system: npc.systemPrompt,
          messages: [
            { role: 'user', content: `[${playerHandle}]: ${playerMessage}` },
          ],
          maxOutputTokens: 120,
          temperature: 0.85,
        });
        return { npcId: npc.npcId, name: npc.name, text: result.text.trim() };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { npcId, name, text } = result.value;
        // Respect [SILENT] — NPC chose not to respond
        if (text && text !== '[SILENT]' && !text.includes('[SILENT]')) {
          // Strip any name prefix the model may have added
          const cleaned = text
            .replace(/^\[.*?\]\s*[:>]+\s*/i, '')
            .replace(new RegExp(`^${name}\\s*[:>]+\\s*`, 'i'), '')
            .trim();
          if (cleaned) {
            responses.push({ npcId, name, text: cleaned });
          }
        }
      }
      // Silently skip failed NPC responses
    }

    return Response.json({ responses });
  } catch (err) {
    console.error('[npc-dialogue] Error:', err);
    return Response.json({ responses: [] });
  }
}
