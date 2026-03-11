// lib/mud/types.ts
// TUNNELCORE MUD — Core Type Definitions
// Zero dependencies. All MUD modules import from here.
// Clock-based combat system (Forged in the Dark × Cortex Prime)

// ── Attributes ──────────────────────────────────────────────────────────────

export type AttributeName = 'BODY' | 'REFLEX' | 'TECH' | 'COOL' | 'INT' | 'GHOST';

export interface Attributes {
  BODY:   number;  // harm clock size, melee pool, carry capacity, physical checks
  REFLEX: number;  // ranged pool, flee pool, initiative analog
  TECH:   number;  // hack pool, RAM clock size, device interaction
  COOL:   number;  // NPC disposition, barter prices, stealth pool
  INT:    number;  // scan pool, XP gain modifier, puzzle solving
  GHOST:  number;  // mesh resistance, 33hz attunement, hidden content access
}

export const ATTRIBUTE_MIN = 3;
export const ATTRIBUTE_MAX_CREATION = 10;
export const ATTRIBUTE_MAX = 15;
export const ATTRIBUTE_BASE_POOL = 30;
export const ATTRIBUTE_BONUS_POINTS = 12;

// ── Archetypes ──────────────────────────────────────────────────────────────

export type Archetype = 'DISCONNECTED' | 'SOVEREIGN' | 'INTEGRATED';

export const ARCHETYPE_INFO: Record<Archetype, {
  label: string;
  description: string;
  prompt: string;
  bonusAttributes: Partial<Attributes>;
  cyberwareCap: number;
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
  damage?: number;
  damageType?: 'melee' | 'ranged' | 'electric' | 'fire' | 'hack';
  armorValue?: number;
  dieSize?: number;
  armorSegments?: number;
  cyberwareTier?: number;
  ramCost?: number;
  buyPrice?: number;
  sellPrice?: number;
  healAmount?: number;
  harmDrain?: number;
  criticalDrain?: number;
  armorRestore?: number;
  effectId?: string;
  questItem?: boolean;
  loreItem?: boolean;
}

export type GearSlots = Partial<Record<ItemSlot, Item>>;

export interface Currency {
  creds: number;
  scrip: number;
}

// ── Character ───────────────────────────────────────────────────────────────

export type OriginPoint = 'DRAINAGE' | 'IRON_BLOOM' | 'ROOFTOPS' | 'MARKET';

export interface MudCharacter {
  handle: string;
  subjectId: string;
  archetype: Archetype;
  combatStyle: CombatStyle;
  attributes: Attributes;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  harmSegments: number;
  criticalSegments: number;
  armorSegments: number;
  ramSegments: number;
  styleDie: number;
  currentRoom: string;
  origin: OriginPoint;
  skillPoints: number;
  unlockedSkills: string[];
  gear: GearSlots;
  inventory: Item[];
  currency: Currency;
  cyberware: Item[];
  augmentSlots: {
    neural: import('./cyberwareDB').CyberwareItem | null;
    chassis: import('./cyberwareDB').CyberwareItem | null;
    limbs: import('./cyberwareDB').CyberwareItem | null;
  };
  augmentInventory: import('./cyberwareDB').CyberwareItem[];
  sealedSlots: import('./cyberwareDB').AugmentSlotType[];
  ram: number;
  maxRam: number;
  deaths: number;
  createdAt: number;
  lastSaved: number;
  isDead: boolean;
  godMode?: boolean;
  pendingLevelUps: number;
  unspentAttributePoints: number;
  crossClassTree?: string;
  uniqueDrops: string[];
  discoveredSynergies: string[];
  completedMilestones: string[];
  // ── Stress system (Blades) ──
  stress: number;           // current stress (0-8)
  maxStress: number;        // always 8
  traumas: string[];        // permanent complications from stress overflow
  lastCombatLoot?: string[];
  pendingSalvage?: {
    enemies: Array<{
      name: string;
      drops: Array<{ itemId: string; name: string; taken: boolean }>;
    }>;
  };
}

// ── World State ─────────────────────────────────────────────────────────────

export interface MudWorldState {
  visitedRooms: string[];
  discoveredNPCs: string[];
  activeQuests: string[];
  completedQuests: string[];
  failedQuests: string[];
  declinedQuests: string[];
  worldFlags: Record<string, boolean | string | number>;
  partyId: string | null;
  activeClocks?: import('./clockEngine').Clock[];
  clockHistory?: {
    clockId: string;
    event: 'filled' | 'drained' | 'created' | 'destroyed';
    timestamp: number;
    context: string;
  }[];
}

// ── NPC State ───────────────────────────────────────────────────────────────

export type DispositionLabel = 'HOSTILE' | 'UNFRIENDLY' | 'NEUTRAL' | 'FRIENDLY' | 'DEVOTED';

export interface NPCRelation {
  disposition: number;
  interactions: string[];
  questsGiven: string[];
  questsComplete: string[];
  questsFailed: string[];
  lastSeen: number;
  timesDefeated: number;
  flags: string[];
}

export type NPCStateMap = Record<string, NPCRelation>;

// ── Legacy Combat State (kept for migration) ────────────────────────────────

export type CombatantType = 'player' | 'enemy' | 'ally';

export interface Combatant {
  id: string;
  name: string;
  type: CombatantType;
  hp: number;
  maxHp: number;
  attributes: Attributes;
  initiative: number;
  ap: number;
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
  turnOrder: string[];
  currentTurn: number;
  round: number;
  log: string[];
  sourceEnemies: RoomEnemy[];
}

// ── NEW: Clock-Based Combat State ──────────────────────────────────────────

import type { Clock, ClockTrigger } from './clockEngine';
import type { DieSize, RollResult, ApproachType, ActionType } from './dicePool';

export type { DieSize, RollResult, ApproachType, ActionType, ClockTrigger };

export type TurnPhase =
  | 'player_choose'
  | 'player_resolve'
  | 'enemy_action'
  | 'environment_tick'
  | 'end_check';

export interface EnemyBehavior {
  type: 'aggressive' | 'defensive' | 'swarm' | 'sniper' | 'hacker' | 'boss';
  targetPriority: 'harm' | 'danger' | 'status';
  retreatThreshold?: number;
  specialAction?: string;
}

export interface ClockCombatant {
  id: string;
  name: string;
  tier: number;
  harmClockId: string;
  armorClockId: string | null;
  behavior: EnemyBehavior;
  attackDice: DieSize[];
  dangerClockId?: string;
  statusClocks: string[];
  defeated: boolean;
  xpReward: number;
  drops: LootEntry[];
}

export interface CombatLogEntry {
  round: number;
  actor: string;
  action: string;
  clockChanges: { clockId: string; name: string; from: number; to: number; segments: number }[];
  rollResult?: RollResult;
  narrative?: string;
}

export interface ClockCombatState {
  active: boolean;
  round: number;
  clocks: Clock[];
  enemies: ClockCombatant[];
  playerClocks: {
    harm: string;
    critical: string;
    armor: string | null;
    downed: string | null;
    ram: string | null;
  };
  turnPhase: TurnPhase;
  approachChosen: boolean;
  currentApproach?: ApproachType;
  currentAction?: ActionType;
  currentTargetId?: string;
  log: CombatLogEntry[];
  sourceEnemies: RoomEnemy[];
  environmentClocks: string[];
  narrativeContext: string;
  // ── Blades/Cortex mechanics ──
  surge: number;                // current surge points (0-3, reset per combat)
  complications: Complication[]; // active complications on all participants
  roomTraits: RoomTrait[];       // copied from room at combat init
  pendingResist?: {              // set when enemy harm is incoming, cleared after player responds
    harmTicks: number;
    attribute: AttributeName;
    source: string;
  };
}

export type ClockCombatEnd =
  | { over: false }
  | { over: true; victory: boolean; xpGained: number; drops: string[]; survivingClocks: Clock[] };

export interface ClockChange {
  clockId: string;
  clockName: string;
  from: number;
  to: number;
  segments: number;
  filled: boolean;
  triggerFired?: ClockTrigger;
}

// ── Room System ─────────────────────────────────────────────────────────────

export type Direction = 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest' | 'up' | 'down' | 'in' | 'out';

export const DIRECTION_ALIASES: Record<string, Direction> = {
  n: 'north', s: 'south', e: 'east', w: 'west',
  ne: 'northeast', nw: 'northwest', se: 'southeast', sw: 'southwest',
  u: 'up', d: 'down',
};

export interface RoomExit {
  direction: Direction;
  targetRoom: string;
  description: string;
  locked?: boolean;
  lockId?: string;
  hidden?: boolean;
  hiddenRequirement?: { attribute: AttributeName; minimum: number };
  zoneTransition?: boolean;
  targetZone?: string;
}

export type NPCType = 'QUESTGIVER' | 'SHOPKEEPER' | 'ALLIED' | 'NEUTRAL' | 'ENEMY' | 'BOSS';

export interface InfoEntry {
  text: string;
  gated?: { attribute: AttributeName; minimum: number };
}

export interface RoomNPC {
  id: string;
  name: string;
  type: NPCType;
  faction: string;
  description: string;
  dialogue: string;
  startingDisposition: number;
  services?: ('shop' | 'heal' | 'quest' | 'hire' | 'info')[];
  level?: number;
  combatCapable?: boolean;
  infoEntries?: InfoEntry[];
}

// ── NPC Modal Payload ────────────────────────────────────────────────────────

export type NPCServiceType = 'shop' | 'heal' | 'quest' | 'hire' | 'info';

export interface NPCModalPayload {
  npcId: string;
  npcName: string;
  npcType: NPCType;
  description: string;
  dialogue: string;
  services: NPCServiceType[];
  faction?: string;
  disposition?: number;
  defaultTab?: string;
  infoEntries?: InfoEntry[];
}

export interface RoomEnemy {
  id: string;
  name: string;
  level: number;
  description?: string;
  hp?: number;
  attributes?: Attributes;
  damage?: number;
  armorValue?: number;
  behavior: string | EnemyBehavior;
  spawnChance: number;
  count: [number, number];
  drops: LootEntry[];
  xpReward: number;
  tier?: number;
  harmSegments?: number;
  armorSegments?: number;
  attackDice?: DieSize[];
  dangerClockContribution?: {
    clockTemplate: import('./clockEngine').ClockTemplate;
    ticksPerRound: number;
  };
  statusAbilities?: {
    clockTemplate: import('./clockEngine').ClockTemplate;
    chance: number;
  }[];
}

export interface LootEntry {
  itemId: string;
  chance: number;
  quantityRange: [number, number];
}

export interface RoomObject {
  id: string;
  name: string;
  examineText: string;
  gatedText?: {
    attribute: AttributeName;
    minimum: number;
    text: string;
  }[];
  lootable?: boolean;
  lootTable?: LootEntry[];
  interactable?: boolean;
  interactAction?: string;
  hidden?: boolean;
  hiddenRequirement?: { attribute: AttributeName; minimum: number };
}

export interface Room {
  id: string;
  zone: string;
  name: string;
  description: string;
  exits: RoomExit[];
  npcs: RoomNPC[];
  enemies: RoomEnemy[];
  objects: RoomObject[];
  isSafeZone: boolean;
  isHidden: boolean;
  hiddenRequirement?: { attribute: AttributeName; minimum: number };
  hasFastTravel?: boolean;
  fastTravelType?: 'transit_station' | 'drainage_access' | 'signal_relay' | 'iron_bloom_shuttle';
  fastTravelRequirement?: { attribute: AttributeName; minimum: number };
  environmentalClocks?: import('./clockEngine').ClockTemplate[];
  // ── Room trait dice (Cortex-style scene traits) ──
  traitDice?: RoomTrait[];
}

export interface RoomTrait {
  name: string;
  die: import('./dicePool').DieSize;
  /** Actions this trait helps (adds to pool). Empty = universal. */
  benefitsActions?: import('./dicePool').ActionType[];
  /** Actions this trait hinders (adds complication). */
  hindersActions?: import('./dicePool').ActionType[];
  color?: string;
}

// ── Complication (Cortex-style stepping dice) ───────────────────────────────
// Replaces segment-based status effects. Steps d6 → d8 → d10 → d12 → OUT.

export interface Complication {
  id: string;
  name: string;
  die: import('./dicePool').DieSize;
  /** Who has this complication: 'player' or enemy id */
  owner: string;
  /** Which pools this complication opposes (empty = all) */
  opposesActions?: import('./dicePool').ActionType[];
  /** Source that created it */
  source: string;
  /** Rounds remaining (-1 = permanent until treated) */
  duration: number;
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
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  xp: number;
  creds?: number;
  scrip?: number;
  items?: string[];
  factionRep?: Record<string, number>;
  worldFlags?: Record<string, boolean | string | number>;
  unlocks?: string[];
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
  giver: string;
  tier: 1 | 2 | 3 | 4 | 5;
  type: QuestType;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  failureConsequences?: {
    factionRep?: Record<string, number>;
    npcDisposition?: Record<string, number>;
  };
  branches?: QuestBranch[];
  repeatable: boolean;
  prerequisites: string[];
  levelRequirement?: number;
  expiresAfter?: number;
}

// ── Faction System ──────────────────────────────────────────────────────────

export type FactionId = 'IRON_BLOOM' | 'THE_PARISH' | 'HELIXION' | 'DIRECTORATE_9' | 'FREEMARKET' | 'THE_SIGNAL' | 'CHROME_WOLVES';

export interface FactionReputation {
  factionId: FactionId;
  reputation: number;
  label: DispositionLabel;
}

// ── Skill Trees ─────────────────────────────────────────────────────────────

export type SkillTreeType = 'CHROME' | 'SYNAPSE' | 'BALLISTIC' | 'GHOST_TREE';

// ── Level / Progression ─────────────────────────────────────────────────────

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
    case 'HOSTILE':    return 999;
    case 'UNFRIENDLY': return 1.5;
    case 'NEUTRAL':    return 1.0;
    case 'FRIENDLY':   return 0.9;
    case 'DEVOTED':    return 0.75;
  }
}

// ── Milestones (attribute advancement) ──────────────────────────────────────
// Attributes don't grow from level-up. They grow from specific triggers.

export interface Milestone {
  id: string;
  attribute: AttributeName;
  trigger: MilestoneTrigger;
  description: string;          // shown when earned
  flavor: string;               // in-character narration
}

export type MilestoneTrigger =
  | { type: 'quest_complete'; questId: string }
  | { type: 'zone_enter'; zoneId: string }
  | { type: 'level_reach'; level: number }
  | { type: 'kills_total'; count: number }
  | { type: 'skill_unlock'; skillId: string }
  | { type: 'boss_defeat'; enemyId: string }
  | { type: 'flag'; flag: string };

// ── MUD Session State ──────────────────────────────────────────────────────

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
  combat: ClockCombatState | null;
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
