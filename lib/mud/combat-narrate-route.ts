// app/api/mud/combat-narrate/route.ts
// TUNNELCORE MUD — Combat Narration via LLM
// Receives mechanical results, returns 1-3 sentences of visceral fiction.
// The LLM narrates what the clocks mean in the world. Engine is truth, LLM is beauty.

import { NextResponse } from 'next/server';

interface NarrateRequest {
  action: string;
  outcome: string;
  clockChanges: {
    name: string;
    from: number;
    to: number;
    segments: number;
    filled: boolean;
  }[];
  enemyNames: string[];
  roomName: string;
  roomDescription: string;
  playerHandle: string;
  playerStyle: string;
  roundNumber: number;
  previousNarrative?: string;
}

const SYSTEM_PROMPT = `You are the narrator for TUNNELCORE, a cyberpunk text MUD set in an underground city.
You narrate combat actions in terse, visceral, second-person prose.
You are given mechanical results (dice outcomes, clock changes) and must describe what physically happens.

Rules:
- Maximum 2-3 sentences. Never exceed 40 words.
- Second person present tense. "you" not "they."
- Use the clock states to convey urgency. If harm clock is filling, the prose gets more desperate.
- If a clock fills, that's a dramatic turning point. Mark it.
- Never mention game mechanics by name. No "dice," "clocks," "segments," "rolls."
- The world is dark, wet, industrial. Metal, rust, phosphor light, humming frequencies.
- On critical success: transcendent, almost supernatural competence.
- On botch/failure: brutal, physical, consequential.
- Reference the room atmosphere and enemy behavior, not just the hit.
- Keep continuity with the previous narration if provided.`;

export async function POST(request: Request) {
  try {
    const body: NarrateRequest = await request.json();

    // Build the user prompt from mechanical results
    const clockDesc = body.clockChanges
      .map(c => `${c.name}: ${c.from}→${c.to}/${c.segments}${c.filled ? ' [FILLED]' : ''}`)
      .join(', ');

    const userPrompt = [
      `Round ${body.roundNumber}. ${body.playerHandle} (${body.playerStyle}).`,
      `Action: ${body.action}. Outcome: ${body.outcome}.`,
      `Changes: ${clockDesc || 'none'}.`,
      `Enemies: ${body.enemyNames.join(', ') || 'none'}.`,
      `Room: ${body.roomName}. ${body.roomDescription.slice(0, 100)}.`,
      body.previousNarrative ? `Previous: "${body.previousNarrative}"` : '',
    ].filter(Boolean).join(' ');

    // Check if we have an AI provider configured
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback: generate a simple narration without LLM
      const narrative = generateFallbackNarration(body);
      return NextResponse.json({ narrative });
    }

    // If using Qwen via DashScope (primary TUNNELCORE LLM)
    if (process.env.DASHSCOPE_API_KEY) {
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-max',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 80,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const narrative = data.choices?.[0]?.message?.content?.trim() ?? '';
        return NextResponse.json({ narrative });
      }
    }

    // Fallback
    const narrative = generateFallbackNarration(body);
    return NextResponse.json({ narrative });

  } catch (error) {
    console.error('[TUNNELCORE] Narration error:', error);
    return NextResponse.json({ narrative: '' });
  }
}

// ── Fallback narration (no LLM) ──────────────────────────────────────────

function generateFallbackNarration(body: NarrateRequest): string {
  const { action, outcome, clockChanges, enemyNames } = body;
  const enemy = enemyNames[0] ?? 'the target';

  const filledClocks = clockChanges.filter(c => c.filled);

  if (outcome === 'critical') {
    return `the blow lands with surgical precision. ${enemy} staggers — the fight shifts in your favor.`;
  }
  if (outcome === 'strong') {
    return `solid hit. ${enemy} reels. you press the advantage.`;
  }
  if (outcome === 'success') {
    return `you connect. ${enemy} absorbs the impact but you see the damage register.`;
  }
  if (outcome === 'partial') {
    if (action === 'attack') return `you land a glancing blow but leave yourself open. ${enemy} makes you pay for it.`;
    if (action === 'hack') return `the breach is partial — you got through but tripped an alert.`;
    return `it works, barely. the cost is written in the damage you take.`;
  }
  if (outcome === 'failure') {
    return `the strike goes wide. ${enemy} punishes the opening. you feel it in your teeth.`;
  }

  if (filledClocks.length > 0) {
    const name = filledClocks[0].name.toLowerCase();
    return `the ${name} hits its limit. something changes in the air.`;
  }

  return '';
}
