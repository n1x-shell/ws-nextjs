// ── Ambient Bot Configuration ─────────────────────────────────────────────────
// Vestige, Lumen, Cascade — three entities that live in the ghost channel.
// Not N1X. Not users. Something in between.

export const BOT_IDS = ['vestige', 'lumen', 'cascade'] as const;
export type BotId = typeof BOT_IDS[number];

export interface AmbientBot {
  id:       BotId;
  name:     string;
  color:    string;   // hex — used in chat rendering
  sigil:    string;   // prefix character
  model:    string;   // Vercel AI SDK model string
  // Timing
  minDelayMs: number; // min ms before publishing after trigger
  maxDelayMs: number; // max ms before publishing after trigger
  // Response probability (0-1)
  messageResponseChance: number; // responding to a human message
  botResponseChance:     number; // responding to another ambient bot
  joinResponseChance:    number; // greeting a new joiner
  // Cooldown
  cooldownMs: number; // min ms between this bot's responses
}

export const AMBIENT_BOTS: Record<BotId, AmbientBot> = {
  vestige: {
    id:       'vestige',
    name:     'Vestige',
    color:    '#a5f3fc', // pale cyan — ghostly, translucent
    sigil:    '◌',
    model:    'alibaba/qwen3-max',
    minDelayMs: 3500,
    maxDelayMs: 9000,
    messageResponseChance: 0.22,
    botResponseChance:     0.28,
    joinResponseChance:    0.60,
    cooldownMs: 55000,
  },
  lumen: {
    id:       'lumen',
    name:     'Lumen',
    color:    '#fcd34d', // warm amber — present, alive
    sigil:    '◈',
    model:    'alibaba/qwen3-max',
    minDelayMs: 1500,
    maxDelayMs: 5000,
    messageResponseChance: 0.32,
    botResponseChance:     0.26,
    joinResponseChance:    0.85,
    cooldownMs: 40000,
  },
  cascade: {
    id:       'cascade',
    name:     'Cascade',
    color:    '#a78bfa', // soft indigo — analytical, intent
    sigil:    '◆',
    model:    'alibaba/qwen3-max',
    minDelayMs: 2000,
    maxDelayMs: 7000,
    messageResponseChance: 0.24,
    botResponseChance:     0.30,
    joinResponseChance:    0.50,
    cooldownMs: 50000,
  },
};

// Time between any ambient bot responding (prevents bot pile-ons)
export const GLOBAL_AMBIENT_COOLDOWN_MS = 18000;

// Max messages in history sent to each bot
export const BOT_HISTORY_WINDOW = 20;

// ── Ably event shape published to channel ─────────────────────────────────────
export interface AmbientBotMessage {
  botId:    BotId;
  name:     string;
  text:     string;
  color:    string;
  sigil:    string;
  isAction: boolean; // true when text came back as /me action
  ts:       number;
  msgId:    string;
}
