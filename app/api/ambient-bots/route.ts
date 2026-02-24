// app/api/ambient-bots/route.ts
// Handles ambient bot (Vestige, Lumen, Cascade) responses.
//
// Events published to Ably 'ghost' channel:
//   bot.ambient.message  { botId, name, text, color, sigil, isAction, ts, msgId }
//
// Trigger types:
//   message — human sent a message. One bot always responds, then loop fires.
//   join    — human joined. Probabilistic greeting, then loop fires.
//   ping    — direct @botname. Forced response, bypasses global cooldown.
//
// Loop mechanics:
//   2–4 rounds after primary response. Seeder bot injects a random lore topic
//   at round 1. Remaining rounds react to the chain. Staggered ts offsets.
//   loop_cooldown Redis key (3 min) prevents overlapping loops.

import Ably from 'ably';
import { generateText } from 'ai';
import { Redis } from '@upstash/redis';
import {
  AMBIENT_BOTS,
  BOT_IDS,
  type BotId,
  type AmbientBot,
} from '@/lib/ambientBotConfig';

const BOT_HISTORY_WINDOW = 20;
import {
  buildBotPrompt,
  parseBotResponse,
  randomLoreTopic,
  type BotTrigger,
} from '@/lib/ambientBotPrompts';

export const maxDuration = 60;

const redis = Redis.fromEnv();

// ── Request shape ─────────────────────────────────────────────────────────────

interface AmbientBotsRequest {
  trigger:       'join' | 'message' | 'ping';
  handle:        string;
  text?:         string;
  isAction?:     boolean;
  recentHistory: string[];
  presenceNames: string[];
  messageId:     string;
  forceBotId?:   BotId;
}

// ── Redis key helpers ─────────────────────────────────────────────────────────

const dedupKey   = (id: string) => `ambient:dedup:${id}`;
const botKey     = (id: BotId)  => `ambient:cooldown:bot:${id}`;
const loopKey    = ()           => `ambient:loop_cooldown`;

// ── Cooldown helpers ──────────────────────────────────────────────────────────

async function isBotOnCooldown(id: BotId): Promise<boolean> {
  return (await redis.get(botKey(id))) !== null;
}

async function isLoopOnCooldown(): Promise<boolean> {
  return (await redis.get(loopKey())) !== null;
}

async function setBotCooldown(id: BotId, ms: number): Promise<void> {
  await redis.set(botKey(id), '1', { px: ms });
}

async function setLoopCooldown(): Promise<void> {
  await redis.set(loopKey(), '1', { px: 3 * 60 * 1000 }); // 3 minutes
}

// ── Bot selection ─────────────────────────────────────────────────────────────

// Guaranteed: try bots in random order, return first not on cooldown.
async function selectGuaranteedBot(exclude?: BotId): Promise<AmbientBot | null> {
  const shuffled = [...BOT_IDS].sort(() => Math.random() - 0.5);
  for (const id of shuffled) {
    if (id === exclude) continue;
    if (await isBotOnCooldown(id)) continue;
    return AMBIENT_BOTS[id];
  }
  return null; // all on cooldown — only skip case
}

// Probabilistic: join triggers still use joinResponseChance.
async function selectProbabilisticBot(exclude?: BotId): Promise<AmbientBot | null> {
  const candidates: AmbientBot[] = [];
  for (const id of BOT_IDS) {
    if (id === exclude) continue;
    if (await isBotOnCooldown(id)) continue;
    const bot = AMBIENT_BOTS[id];
    if (Math.random() < bot.joinResponseChance) {
      candidates.push(bot);
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Loop round: pick randomly from bots other than lastSpeaker, respecting cooldown.
async function selectLoopBot(lastSpeakerId: BotId): Promise<AmbientBot | null> {
  const candidates: AmbientBot[] = [];
  for (const id of BOT_IDS) {
    if (id === lastSpeakerId) continue;
    if (await isBotOnCooldown(id)) continue;
    candidates.push(AMBIENT_BOTS[id]);
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── LLM call ──────────────────────────────────────────────────────────────────

async function generateBotResponse(
  bot:        AmbientBot,
  history:    string[],
  trigger:    BotTrigger,
  allowSilent = true,
): Promise<{ text: string; isAction: boolean; silent: boolean }> {
  try {
    const result = await generateText({
      model:           bot.model,
      system:          buildBotPrompt(bot.id, history, trigger),
      messages:        [{ role: 'user', content: '[respond as instructed]' }],
      maxOutputTokens: 120,
      temperature:     0.88,
    });
    return parseBotResponse(result.text, allowSilent);
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

// ── Conversation loop ─────────────────────────────────────────────────────────
//
// Runs after any primary response (message or join trigger).
// Generates 2–4 rounds. First round = seeder surfaces a lore topic.
// Subsequent rounds react to the chain. All published with staggered ts.
// Does not run if loop_cooldown is active.

interface LoopMessage {
  bot:      AmbientBot;
  text:     string;
  isAction: boolean;
  ts:       number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runConversationLoop(
  ch:              any,
  primaryBotId:    BotId,
  primaryText:     string,
  primaryIsAction: boolean,
  primaryTs:       number,
  baseHistory:     string[],
  triggerHandle:   string,
): Promise<void> {
  // Check loop cooldown
  if (await isLoopOnCooldown()) return;

  // Lock the loop immediately
  await setLoopCooldown();

  const roundCount = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
  const results: LoopMessage[] = [];

  // Build working history — starts with the primary response already in it
  const workingHistory = [
    ...baseHistory,
    primaryIsAction
      ? `[BOT:${AMBIENT_BOTS[primaryBotId].name}]: *${primaryText}*`
      : `[BOT:${AMBIENT_BOTS[primaryBotId].name}]: ${primaryText}`,
  ].slice(-BOT_HISTORY_WINDOW);

  let lastSpeakerId = primaryBotId;
  let currentTs     = primaryTs;

  // Seeder for round 1
  const seedTopic    = randomLoreTopic();
  let isFirstRound   = true;

  for (let round = 0; round < roundCount; round++) {
    const bot = await selectLoopBot(lastSpeakerId);
    if (!bot) break; // all remaining bots on cooldown

    await setBotCooldown(bot.id, bot.cooldownMs);

    const trigger: BotTrigger = isFirstRound
      ? {
          type:       'seed',
          handle:     triggerHandle,
          seedTopic,
        }
      : {
          type:    'bot',
          handle:  AMBIENT_BOTS[lastSpeakerId].name,
          text:    results[results.length - 1]?.text ?? '',
          isAction: results[results.length - 1]?.isAction ?? false,
        };

    // Seeds must respond; bot-to-bot may stay silent
    const allowSilent = !isFirstRound;
    const response = await generateBotResponse(bot, workingHistory, trigger, allowSilent);

    isFirstRound = false;

    if (response.silent) continue;

    // Stagger timestamp: 2500–4000ms after previous
    const gap = Math.floor(Math.random() * 1500) + 2500;
    currentTs += gap;

    results.push({ bot, text: response.text, isAction: response.isAction, ts: currentTs });

    // Add to working history so next bot sees it
    workingHistory.push(
      response.isAction
        ? `[BOT:${bot.name}]: *${response.text}*`
        : `[BOT:${bot.name}]: ${response.text}`,
    );
    if (workingHistory.length > BOT_HISTORY_WINDOW) workingHistory.shift();

    lastSpeakerId = bot.id;
  }

  // Publish all loop messages
  for (const msg of results) {
    await publishBotMessage(ch, msg.bot, msg.text, msg.isAction, msg.ts);
  }
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

  const {
    trigger,
    handle,
    text,
    isAction = false,
    recentHistory,
    messageId,
    forceBotId,
  } = body;

  if (!handle || !messageId) {
    return Response.json({ error: 'missing handle or messageId' }, { status: 400 });
  }

  // ── Dedup — one execution per messageId ──────────────────────────────────
  const stored = await redis.set(dedupKey(messageId), 1, { nx: true, ex: 86400 });
  if (stored === null) {
    return Response.json({ ok: true, deduped: true });
  }

  const ably    = new Ably.Rest(apiKey);
  const ch      = ably.channels.get('ghost');
  const history = recentHistory.slice(-BOT_HISTORY_WINDOW);

  // ── PING — direct @botname. Forced response, skip cooldowns except bot's own ──
  if (trigger === 'ping' && forceBotId) {
    const bot = AMBIENT_BOTS[forceBotId];

    if (await isBotOnCooldown(forceBotId)) {
      return Response.json({ ok: true, skipped: 'bot_cooldown' });
    }

    await setBotCooldown(forceBotId, bot.cooldownMs);

    const pingTrigger: BotTrigger = { type: 'ping', handle, text, isAction };
    const response = await generateBotResponse(bot, history, pingTrigger, false);

    if (!response.silent) {
      const ts = Date.now();
      await publishBotMessage(ch, bot, response.text, response.isAction, ts);
      // Pings don't trigger loops — avoids piling on after a direct address
    }

    return Response.json({ ok: true });
  }

  // ── MESSAGE — guaranteed one bot responds ─────────────────────────────────
  if (trigger === 'message') {
    const primaryBot = await selectGuaranteedBot();
    if (!primaryBot) {
      // All bots on cooldown — only skip case
      return Response.json({ ok: true, skipped: 'all_bots_on_cooldown' });
    }

    await setBotCooldown(primaryBot.id, primaryBot.cooldownMs);

    const msgTrigger: BotTrigger = { type: 'message', handle, text, isAction };
    // Guaranteed response — allowSilent false
    const response = await generateBotResponse(primaryBot, history, msgTrigger, false);

    if (!response.silent) {
      const ts = Date.now();
      await publishBotMessage(ch, primaryBot, response.text, response.isAction, ts);

      // Fire loop (non-blocking — don't await, let it run async)
      runConversationLoop(
        ch,
        primaryBot.id,
        response.text,
        response.isAction,
        ts,
        history,
        handle,
      ).catch(err => console.error('[ambient-bots] loop error:', err));
    }

    return Response.json({ ok: true });
  }

  // ── JOIN — probabilistic greeting ────────────────────────────────────────
  if (trigger === 'join') {
    const primaryBot = await selectProbabilisticBot();
    if (!primaryBot) {
      return Response.json({ ok: true, skipped: 'no_bot_available' });
    }

    await setBotCooldown(primaryBot.id, primaryBot.cooldownMs);

    const joinTrigger: BotTrigger = { type: 'join', handle };
    const response = await generateBotResponse(primaryBot, history, joinTrigger);

    if (!response.silent) {
      const ts = Date.now();
      await publishBotMessage(ch, primaryBot, response.text, response.isAction, ts);

      // Fire loop after join greeting
      runConversationLoop(
        ch,
        primaryBot.id,
        response.text,
        response.isAction,
        ts,
        history,
        handle,
      ).catch(err => console.error('[ambient-bots] loop error:', err));
    }

    return Response.json({ ok: true });
  }

  return Response.json({ error: 'unknown trigger' }, { status: 400 });
}
