// lib/mud/types.ts
// TUNNELCORE MUD — Core Type Definitions
// Zero dependencies. All MUD modules import from here.

// ── Attributes ──────────────────────────────────────────────────────────────

export type AttributeName = 'BODY' | 'REFLEX' | 'TECH' | 'COOL' | 'INT' | 'GHOST';

export interface Attributes {
  BODY:   number;  // HP, melee damage, carry capacity, physical checks
  REFLEX: number;  // Dodge, initiative, crit rate, ranged accuracy
  TECH:   number;  // Hacking, device interaction, crafting, repair
  COOL:   number;  // NPC disposition, barter prices, intimidation, deception
  INT:    number;  // XP gain modifier, puzzle solving, scan depth, lore discovery
  GHOST:  number;  // Mesh resistance, 33hz attunement, hidden content access
}

export const ATTRIBUTE_MIN = 3;
export const ATTRIBUTE_MAX_CREATION = 10;
export const ATTRIBUTE_MAX = 15;
export const ATTRIBUTE_BASE_POOL = 30; // 6 attrs × 3 base + 12 bonus = 30
export const ATTRIBUTE_BONUS_POINTS = 12;

// ── Archetypes ──────────────────────────────────────────────────────────────

export type Archetype = 'DISCONNECTED' | 'SOVEREIGN' | 'INTEGRATED';

export const ARCHETYPE_INFO: Record<Archetype, {
  label: string;
  description: string;
  prompt: string;
  bonusAttributes: Partial<Attributes>;
  cyberwareCap: number; // max tier
}> = {
  DISCONNECTED: {
    label: 'DISCONNECTED',
    description: 'No implant abilities. Pure flesh. Bonus BODY and COOL. Immune to mesh/hack effects. Max Tier 1 cyberware.',
    prompt: '"I ripped it out."',
    bonusAttributes: { BODY: 2, COOL: 2 },
    cyberwareCap: 1,
  },
  SOVEREIGN: {
    label: 'SOVEREIGN',
    description: 'Recompiled implant, like Nix. Balanced. All cyberware tiers. Vulnerable to high-level mesh but can resist with GHOST.',
    prompt: '"I broke its leash."',
    bonusAttributes: { BODY: 1, GHOST: 1 },
    cyberwareCap: 3,
  },
  INTEGRATED: {
    label: 'INTEGRATED',
    description: 'Full augment embrace. Bonus TECH and REFLEX. Advanced cyberware/hacking. Vulnerable to EMP and mesh.',
    prompt: '"I learned to use it."',
    bonusAttributes: { TECH: 2, REFLEX: 2 },
    cyberwareCap: 3,
  },
};

// ── Combat Styles ───────────────────────────────────────────────────────────

export type CombatStyle = 'CHROME' | 'SYNAPSE' | 'BALLISTIC' | 'GHOST_STYLE';

export const COMBAT_STYLE_INFO: Record<CombatStyle, {
  label: string;
  description: string;
  prompt: string;
  primaryAttributes: [AttributeName, AttributeName];
}> = {
  CHROME: {
    label: 'CHROME',
    description: 'Melee-focused. Cybernetic arms, mantis blades, gorilla fists.',
    prompt: '"I get close."',
    primaryAttributes: ['BODY', 'REFLEX'],
  },
  SYNAPSE: {
    label: 'SYNAPSE',
    description: 'Hacking-focused. Quickhacks, daemon uploads, system overrides.',
    prompt: '"I get in their head."',
    primaryAttributes: ['TECH', 'INT'],
  },
  BALLISTIC: {
    label: 'BALLISTIC',
    description: 'Ranged-focused. Firearms, smart weapons, tech weapons.',
    prompt: '"I don\'t miss."',
    primaryAttributes: ['REFLEX', 'COOL'],
  },
  GHOST_STYLE: {
    label: 'GHOST',
    description: 'Stealth-focused. Optical camo, silent takedowns, infiltration.',
    prompt: '"They don\'t see me coming."',
    primaryAttributes: ['COOL', 'GHOST'],
  },
};

// ── Items ───────────────────────────────────────────────────────────────────

export type ItemTier = 'SCRAP' | 'COMMON' | 'MIL_SPEC' | 'HELIXION' | 'PROTOTYPE';
export type ItemSlot = 'weapon_primary' | 'weapon_sidearm' | 'armor' | 'cyberware_1' | 'cyberware_2' | 'cyberware_3' | 'utility_1' | 'utility_2' | 'utility_3';
export type ItemCategory = 'weapon_melee' | 'weapon_ranged' | 'armor' | 'cyberware' | 'consumable' | 'quest' | 'lore' | 'material' | 'utility';

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  tier: ItemTier;
  slot?: ItemSlot;
  stackable: boolean;
  quantity: number;
  // Combat stats (optional, only for weapons/armor)
  damage?: number;       // base damage
  damageType?: 'melee' | 'ranged' | 'electric' | 'fire' | 'hack';
  armorValue?: number;   // flat damage reduction
  // Cyberware
  cyberwareTier?: number; // 1-3
  ramCost?: number;       // for quickhack items
  // Commerce
  buyPrice?: number;
  sellPrice?: number;
  // Effects
  healAmount?: number;
  effectId?: string;      // reference to effect system
  // Flags
  questItem?: boolean;
  loreItem?: boolean;
}

// ── Equipment (equipped items) ──────────────────────────────────────────────

export type GearSlots = Partial<Record<ItemSlot, Item>>;

// ── Currency ────────────────────────────────────────────────────────────────

export interface Currency {
  creds: number;
  scrip: number; // undercity barter token
}

// ── Character ───────────────────────────────────────────────────────────────

export type OriginPoint = 'DRAINAGE' | 'IRON_BLOOM' | 'ROOFTOPS' | 'MARKET';

export interface MudCharacter {
  handle: string;
  subjectId: string;         // format: XX-######
  archetype: Archetype;
  combatStyle: CombatStyle;
  attributes: Attributes;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  currentRoom: string;       // room ID: z##_r##
  origin: OriginPoint;
  skillPoints: number;
  unlockedSkills: string[];
  gear: GearSlots;
  inventory: Item[];
  currency: Currency;
  cyberware: Item[];         // installed cyberware (max 3 slots)
  ram: number;               // current RAM
  maxRam: number;            // TECH × 2
  deaths: number;            // for ghost echo tracking
  createdAt: number;
  lastSaved: number;
  isDead: boolean;
  // ── Progression (added by progression systems) ────────────────────────
  pendingLevelUps: number;      // levels earned but not yet integrated at safe haven
  unspentAttributePoints: number; // attribute points awaiting allocation
  crossClassTree?: string;      // secondary combat tree ID (unlocks at level 10)
  uniqueDrops: string[];        // item IDs of unique drops already received
  discoveredSynergies: string[]; // synergy IDs the player has activated
  lastCombatLoot?: string[];    // item IDs from last combat for /loot review
  pendingSalvage?: {            // post-combat salvage awaiting collection
    enemies: Array<{
      name: string;
      drops: Array<{ itemId: string; name: string; taken: boolean }>;
    }>;
  };
}

// ── World State (per-character) ─────────────────────────────────────────────

export interface MudWorldState {
  visitedRooms: string[];
  discoveredNPCs: string[];
  activeQuests: string[];
  completedQuests: string[];
  failedQuests: string[];
  declinedQuests: string[];
  worldFlags: Record<string, boolean | string | number>;
  partyId: string | null;
}

// ── NPC State (per-character) ───────────────────────────────────────────────

export type DispositionLabel = 'HOSTILE' | 'UNFRIENDLY' | 'NEUTRAL' | 'FRIENDLY' | 'DEVOTED';

export interface NPCRelation {
  disposition: number;       // -100 to +100
  interactions: string[];    // log of significant events
  questsGiven: string[];
  questsComplete: string[];
  questsFailed: string[];
  lastSeen: number;          // timestamp
  timesDefeated: number;     // for enemies that survive
  flags: string[];           // arbitrary state flags
}

export type NPCStateMap = Record<string, NPCRelation>;

// ── Combat State ────────────────────────────────────────────────────────────

export type CombatantType = 'player' | 'enemy' | 'ally';

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  hp: number;
  maxHp: number;
  attributes: Attributes;
  initiative: number;
  ap: number;                // action points remaining this turn
  effects: ActiveEffect[];
  gear?: GearSlots;
  ram?: number;
  maxRam?: number;
  isDowned?: boolean;
  bleedoutTurns?: number;
}

export interface ActiveEffect {
  id: string;
  name: string;
  turnsRemaining: number;
  effectType: 'damage_over_time' | 'stun' | 'blind' | 'buff' | 'debuff' | 'bleed';
  value: number;
}

export interface CombatState {
  active: boolean;
  combatants: Combatant[];
  turnOrder: string[];       // combatant IDs in initiative order
  currentTurn: number;       // index into turnOrder
  round: number;
  log: string[];             // combat event log
  sourceEnemies: RoomEnemy[]; // original room enemies for XP/drops on victory
}

// ── Room System ─────────────────────────────────────────────────────────────

export type Direction = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest' | 'up' | 'down' | 'in' | 'out';

/** Shorthand aliases for direction matching (used in /go command resolution) */
export const DIRECTION_ALIASES: Record<string, Direction> = {
  n: 'north', s: 'south', e: 'east', w: 'west',
  ne: 'northeast', nw: 'northwest', se: 'southeast', sw: 'southwest',
  u: 'up', d: 'down',
};

export interface RoomExit {
  direction: Direction;
  targetRoom: string;        // room ID
  description: string;       // e.g. "north (The Narrows)"
  locked?: boolean;
  lockId?: string;           // key item or quest flag required
  hidden?: boolean;          // requires GHOST or INT check
  hiddenRequirement?: { attribute: AttributeName; minimum: number };
  zoneTransition?: boolean;  // crossing into another zone
  targetZone?: string;       // zone ID if transition
}

export type NPCType = 'QUESTGIVER' | 'SHOPKEEPER' | 'ALLIED' | 'NEUTRAL' | 'ENEMY' | 'BOSS';

export interface RoomNPC {
  id: string;
  name: string;
  type: NPCType;
  faction: string;
  description: string;
  dialogue: string;          // first-encounter hook
  startingDisposition: number;
  services?: ('shop' | 'heal' | 'quest' | 'hire' | 'info')[];
  level?: number;
  combatCapable?: boolean;
}

export interface RoomEnemy {
  id: string;
  name: string;
  level: number;
  description: string;
  hp: number;
  attributes: Attributes;
  damage: number;
  armorValue: number;
  behavior: 'passive' | 'territorial' | 'aggressive' | 'ambush' | 'patrol';
  spawnChance: number;       // 0-1, 1 = always present
  count: [number, number];   // [min, max] spawn count
  drops: LootEntry[];
  xpReward: number;
}

export interface LootEntry {
  itemId: string;
  chance: number;            // 0-1
  quantityRange: [number, number];
}

export interface RoomObject {
  id: string;
  name: string;
  examineText: string;
  // Gated descriptions for attribute checks
  gatedText?: {
    attribute: AttributeName;
    minimum: number;
    text: string;
  }[];
  // Interactive
  lootable?: boolean;
  lootTable?: LootEntry[];
  interactable?: boolean;
  interactAction?: string;   // event ID
  hidden?: boolean;
  hiddenRequirement?: { attribute: AttributeName; minimum: number };
}

export interface Room {
  id: string;                // format: z##_r## (e.g. z08_r01)
  zone: string;              // zone ID (e.g. z08)
  name: string;
  description: string;       // the room's display text (the ```block``` from the zone doc)
  exits: RoomExit[];
  npcs: RoomNPC[];
  enemies: RoomEnemy[];
  objects: RoomObject[];
  isSafeZone: boolean;       // combat not allowed / NPCs protected
  isHidden: boolean;         // room only visible with attribute check
  hiddenRequirement?: { attribute: AttributeName; minimum: number };
  // Fast travel
  hasFastTravel?: boolean;
  fastTravelType?: 'transit_station' | 'drainage_access' | 'signal_relay' | 'iron_bloom_shuttle';
  fastTravelRequirement?: { attribute: AttributeName; minimum: number };
}

// ── Zone ────────────────────────────────────────────────────────────────────

export type ZoneDepth = 'surface' | 'shallow' | 'deep' | 'substrate' | 'all_layers' | 'instanced';

export interface Zone {
  id: string;
  name: string;
  depth: ZoneDepth;
  faction: string;
  levelRange: [number, number];
  description: string;
  atmosphere: {
    sound: string;
    smell: string;
    light: string;
    temp?: string;
  };
  rooms: Record<string, Room>;
  originPoint?: OriginPoint;
}

// ── Quest System ────────────────────────────────────────────────────────────

export type QuestType = 'FETCH' | 'ELIMINATE' | 'ESCORT' | 'INVESTIGATE' | 'DELIVERY' | 'DIALOGUE' | 'SABOTAGE' | 'ARENA' | 'MULTI';
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed' | 'expired';

export interface QuestObjective {
  id: string;
  description: string;
  type: 'go_to' | 'kill' | 'collect' | 'talk_to' | 'deliver' | 'examine' | 'survive' | 'escort';
  target: string;            // room ID, NPC ID, item ID, etc.
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  xp: number;
  creds?: number;
  scrip?: number;
  items?: string[];          // item IDs
  factionRep?: Record<string, number>;
  worldFlags?: Record<string, boolean | string | number>;
  unlocks?: string[];        // room IDs, NPC IDs, etc.
}

export interface QuestBranch {
  id: string;
  label: string;
  description: string;
  consequences: {
    factionRep?: Record<string, number>;
    npcDisposition?: Record<string, number>;
    worldFlags?: Record<string, boolean | string | number>;
  };
  rewards: QuestReward;
}

export interface Quest {
  id: string;
  title: string;
  giver: string;             // NPC ID
  tier: 1 | 2 | 3 | 4 | 5;
  type: QuestType;
  description: string;       // in-character briefing
  objectives: QuestObjective[];
  rewards: QuestReward;
  failureConsequences?: {
    factionRep?: Record<string, number>;
    npcDisposition?: Record<string, number>;
  };
  branches?: QuestBranch[];
  repeatable: boolean;
  prerequisites: string[];   // quest IDs or world flags
  levelRequirement?: number;
  expiresAfter?: number;     // milliseconds, null = never
}

// ── Faction System ──────────────────────────────────────────────────────────

export type FactionId = 'IRON_BLOOM' | 'THE_PARISH' | 'HELIXION' | 'DIRECTORATE_9' | 'FREEMARKET' | 'THE_SIGNAL' | 'CHROME_WOLVES';

export interface FactionReputation {
  factionId: FactionId;
  reputation: number;        // -100 to +100, same scale as NPC disposition
  label: DispositionLabel;
}

// ── Skill Trees ─────────────────────────────────────────────────────────────

export type SkillTree = 'CHROME' | 'SYNAPSE' | 'BALLISTIC' | 'GHOST_TREE';

export interface SkillNode {
  id: string;
  tree: SkillTree;
  tier: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  prerequisite?: string;     // skill ID
  attributeRequirement?: { attribute: AttributeName; minimum: number };
  effect: string;            // effect description for display
}

// ── Level / Progression ─────────────────────────────────────────────────────

/** XP required for a given level: (level - 1) × level × 50 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * level * 50;
}

export const LEVEL_CAP = 20;
export const HP_PER_LEVEL = 10;

export function calculateMaxHp(body: number, archetype: Archetype, level: number): number {
  const base = body * 10;
  const archetypeBonus = archetype === 'DISCONNECTED' ? 20 : archetype === 'SOVEREIGN' ? 10 : 0;
  const levelBonus = (level - 1) * HP_PER_LEVEL;
  return base + archetypeBonus + levelBonus;
}

export function calculateMaxRam(tech: number): number {
  return tech * 2;
}

export function calculateCarryCapacity(body: number): number {
  return body * 5;
}

// ── Disposition Helpers ─────────────────────────────────────────────────────

export function getDispositionLabel(value: number): DispositionLabel {
  if (value <= -51) return 'HOSTILE';
  if (value <= -11) return 'UNFRIENDLY';
  if (value <= 10)  return 'NEUTRAL';
  if (value <= 50)  return 'FRIENDLY';
  return 'DEVOTED';
}

export function getPriceModifier(disposition: DispositionLabel): number {
  switch (disposition) {
    case 'HOSTILE':    return 999; // won't sell
    case 'UNFRIENDLY': return 1.5;
    case 'NEUTRAL':    return 1.0;
    case 'FRIENDLY':   return 0.9;
    case 'DEVOTED':    return 0.75;
  }
}

// ── MUD Session State (runtime, not persisted) ──────────────────────────────

export type MudPhase = 'inactive' | 'character_creation' | 'active' | 'combat' | 'dialogue' | 'dead';

export interface CreationProgress {
  step: 'archetype' | 'combat_style' | 'attributes' | 'origin' | 'confirm';
  archetype?: Archetype;
  combatStyle?: CombatStyle;
  attributes?: Attributes;
  origin?: OriginPoint;
}

export interface MudSession {
  phase: MudPhase;
  character: MudCharacter | null;
  world: MudWorldState | null;
  npcState: NPCStateMap | null;
  combat: CombatState | null;
  creation: CreationProgress | null;
}

// ── Command System ──────────────────────────────────────────────────────────

export interface MudCommandResult {
  output: React.ReactNode;
  error?: boolean;
  updateSession?: Partial<MudSession>;
}

export type MudCommandHandler = (
  args: string[],
  session: MudSession,
  context: MudCommandContext,
) => MudCommandResult | Promise<MudCommandResult>;

export interface MudCommandContext {
  addLocalMsg: (node: React.ReactNode) => void;
  handle: string;
  pushDelayed: (node: React.ReactNode, delayMs: number) => void;
  requestInput: (prompt: string) => Promise<string>;
}
