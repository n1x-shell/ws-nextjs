// /api/ambient-bots
// Handles ambient bot (Vestige, Lumen, Cascade) responses.
//
// Events published to Ably 'ghost' channel:
//   bot.ambient.message  { botId, name, text, color, sigil, isAction, ts, msgId }
//
// Called by the client (message sender only, never all clients) to avoid duplicate triggers.

import Ably from 'ably';
import { generateText } from 'ai';
import { Redis } from '@upstash/redis';
import {
  AMBIENT_BOTS,
  BOT_IDS,
  GLOBAL_AMBIENT_COOLDOWN_MS,
  BOT_HISTORY_WINDOW,
  type BotId,
  type AmbientBot,
} from '@/lib/ambientBotConfig';
import {
  buildBotPrompt,
  parseBotResponse,
  type BotTrigger,
} from '@/lib/ambientBotPrompts';

export const maxDuration = 45;

const redis = Redis.fromEnv();

// ── Request shape ─────────────────────────────────────────────────────────────

interface AmbientBotsRequest {
  trigger:      'join' | 'message';
  handle:       string;
  text?:        string;
  isAction?:    boolean;
  recentHistory: string[];
  presenceNames: string[];
  messageId:    string;
}

// ── Redis key helpers ─────────────────────────────────────────────────────────

const dedupKey  = (id: string) => `ambient:dedup:${id}`;
const botKey    = (id: BotId)  => `ambient:cooldown:bot:${id}`;
const globalKey = ()           => `ambient:cooldown:global`;

// ── Cooldown checks ───────────────────────────────────────────────────────────

async function isBotOnCooldown(id: BotId): Promise<boolean> {
  const v = await redis.get(botKey(id));
  return v !== null;
}

async function isGlobalOnCooldown(): Promise<boolean> {
  const v = await redis.get(globalKey());
  return v !== null;
}

async function setBotCooldown(id: BotId, ms: number): Promise<void> {
  await redis.set(botKey(id), '1', { px: ms });
}

async function setGlobalCooldown(ms: number): Promise<void> {
  await redis.set(globalKey(), '1', { px: ms });
}

// ── Bot selection ─────────────────────────────────────────────────────────────

async function selectBot(
  triggerType: 'join' | 'message',
  exclude?: BotId,
): Promise<AmbientBot | null> {
  const candidates: AmbientBot[] = [];

  for (const id of BOT_IDS) {
    if (id === exclude) continue;
    const onCooldown = await isBotOnCooldown(id);
    if (onCooldown) continue;

    const bot = AMBIENT_BOTS[id];
    const chance = triggerType === 'join'
      ? bot.joinResponseChance
      : bot.messageResponseChance;

    if (Math.random() < chance) {
      candidates.push(bot);
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

async function selectSecondaryBot(
  primary: BotId,
  triggerType: 'join' | 'message',
): Promise<AmbientBot | null> {
  const candidates: AmbientBot[] = [];

  for (const id of BOT_IDS) {
    if (id === primary) continue;
    const onCooldown = await isBotOnCooldown(id);
    if (onCooldown) continue;

    const bot = AMBIENT_BOTS[id];
    if (Math.random() < bot.botResponseChance) {
      candidates.push(bot);
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── LLM call ──────────────────────────────────────────────────────────────────

async function generateBotResponse(
  bot:     AmbientBot,
  history: string[],
  trigger: BotTrigger,
): Promise<{ text: string; isAction: boolean; silent: boolean }> {
  try {
    const systemPrompt = buildBotPrompt(bot.id, history, trigger);

    const result = await generateText({
      model:           bot.model,
      system:          systemPrompt,
      messages:        [{ role: 'user', content: '[respond as instructed]' }],
      maxOutputTokens: 120,
      temperature:     0.88,
    });

    return parseBotResponse(result.text);
  } catch (err) {
    console.error(`[ambient-bots] ${bot.id} generation error:`, err);
    return { text: '', isAction: false, silent: true };
  }
}

// ── Ably publisher ────────────────────────────────────────────────────────────

function makeId(): string {
  return crypto.randomUUID();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function publishBotMessage(
  ch:       any,
  bot:      AmbientBot,
  text:     string,
  isAction: boolean,
  ts:       number,
): Promise<void> {
  await ch.publish('bot.ambient.message', {
    botId:    bot.id,
    name:     bot.name,
    text,
    color:    bot.color,
    sigil:    bot.sigil,
    isAction,
    ts,
    msgId:    makeId(),
  });
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.ABLY_API_KEY?.trim();
  if (!apiKey) {
    return Response.json({ error: 'ABLY_API_KEY not configured' }, { status: 500 });
  }

  let body: AmbientBotsRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 });
  }

  const { trigger, handle, text, isAction = false, recentHistory, messageId } = body;

  if (!handle || !messageId) {
    return Response.json({ error: 'missing handle or messageId' }, { status: 400 });
  }

  // ── Dedup ─────────────────────────────────────────────────────────────────
  const stored = await redis.set(dedupKey(messageId), 1, { nx: true, ex: 86400 });
  if (stored === null) {
    return Response.json({ ok: true, deduped: true });
  }

  // ── Global cooldown (skip for join triggers) ──────────────────────────────
  if (trigger === 'message') {
    const globalCooldown = await isGlobalOnCooldown();
    if (globalCooldown) {
      return Response.json({ ok: true, skipped: 'global_cooldown' });
    }
  }

  const ably = new Ably.Rest(apiKey);
  const ch   = ably.channels.get('ghost');

  const history = recentHistory.slice(-BOT_HISTORY_WINDOW);

  // ── Select primary bot ────────────────────────────────────────────────────
  const primaryBot = await selectBot(trigger);
  if (!primaryBot) {
    return Response.json({ ok: true, skipped: 'no_bot_available' });
  }

  await Promise.all([
    setBotCooldown(primaryBot.id, primaryBot.cooldownMs),
    setGlobalCooldown(GLOBAL_AMBIENT_COOLDOWN_MS),
  ]);

  const primaryTrigger: BotTrigger = {
    type:   trigger,
    handle,
    text,
    isAction,
  };

  const primaryResponse = await generateBotResponse(primaryBot, history, primaryTrigger);

  if (!primaryResponse.silent) {
    const ts = Date.now();
    await publishBotMessage(ch, primaryBot, primaryResponse.text, primaryResponse.isAction, ts);

    // ── Bot-to-bot: maybe a second bot responds ───────────────────────────
    const shouldBotRespond = trigger === 'message' && Math.random() < 0.35;

    if (shouldBotRespond) {
      const secondaryBot = await selectSecondaryBot(primaryBot.id, trigger);

      if (secondaryBot) {
        await setBotCooldown(secondaryBot.id, secondaryBot.cooldownMs);

        const actionPrefix = primaryResponse.isAction ? '*' : '';
        const actionSuffix = primaryResponse.isAction ? '*' : '';
        const updatedHistory = [
          ...history,
          `[BOT:${primaryBot.name}]: ${actionPrefix}${primaryResponse.text}${actionSuffix}`,
        ].slice(-BOT_HISTORY_WINDOW);

        const secondaryTrigger: BotTrigger = {
          type:     'bot',
          handle:   primaryBot.name,
          text:     primaryResponse.text,
          isAction: primaryResponse.isAction,
        };

        const secondaryResponse = await generateBotResponse(
          secondaryBot,
          updatedHistory,
          secondaryTrigger,
        );

        if (!secondaryResponse.silent) {
          const secondaryTs = ts + 2500;
          await publishBotMessage(
            ch,
            secondaryBot,
            secondaryResponse.text,
            secondaryResponse.isAction,
            secondaryTs,
          );
        }
      }
    }
  }

  return Response.json({ ok: true });
}
