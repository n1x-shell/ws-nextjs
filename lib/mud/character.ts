// lib/mud/character.ts
// TUNNELCORE MUD — Character Creation & Management
// Handles the creation state machine, stat calculations, and leveling.

import type {
  MudCharacter,
  Archetype,
  CombatStyle,
  OriginPoint,
  Attributes,
  CreationProgress,
  GearSlots,
  MudSession,
  AttributeName,
} from './types';
import {
  ARCHETYPE_INFO,
  COMBAT_STYLE_INFO,
  ATTRIBUTE_MIN,
  ATTRIBUTE_MAX_CREATION,
  ATTRIBUTE_BONUS_POINTS,
  calculateMaxHp,
  calculateMaxRam,
  xpForLevel,
  LEVEL_CAP,
  HP_PER_LEVEL,
} from './types';
import { createItem } from './items';
import { getStarterKit } from './items';
import { getOriginSpawnRoom } from './worldMap';
import { saveCharacter, saveWorld, saveNPCState } from './persistence';
import type { MudWorldState, NPCStateMap } from './types';

// ── Subject ID Generation ───────────────────────────────────────────────────

export function generateSubjectId(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTVWXYZ'; // no I, O, U to avoid confusion
  const prefix = letters[Math.floor(Math.random() * letters.length)]
               + letters[Math.floor(Math.random() * letters.length)];
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const num = (arr[0] % 900000) + 100000; // 6 digits
  return `${prefix}-${num}`;
}

// ── Default Attributes ──────────────────────────────────────────────────────

export function defaultAttributes(): Attributes {
  return {
    BODY: ATTRIBUTE_MIN,
    REFLEX: ATTRIBUTE_MIN,
    TECH: ATTRIBUTE_MIN,
    COOL: ATTRIBUTE_MIN,
    INT: ATTRIBUTE_MIN,
    GHOST: ATTRIBUTE_MIN,
  };
}

// ── Apply archetype bonuses ─────────────────────────────────────────────────

export function applyArchetypeBonuses(base: Attributes, archetype: Archetype): Attributes {
  const bonuses = ARCHETYPE_INFO[archetype].bonusAttributes;
  const result = { ...base };
  for (const [attr, val] of Object.entries(bonuses)) {
    result[attr as AttributeName] += val as number;
  }
  return result;
}

// ── Validate attribute distribution ─────────────────────────────────────────

export function validateAttributes(attrs: Attributes, archetype: Archetype): {
  valid: boolean;
  error?: string;
  totalSpent: number;
} {
  const base = defaultAttributes();
  const bonuses = ARCHETYPE_INFO[archetype].bonusAttributes;

  let totalSpent = 0;
  for (const key of Object.keys(attrs) as AttributeName[]) {
    const baseVal = base[key] + (bonuses[key] ?? 0);
    const spent = attrs[key] - baseVal;
    if (spent < 0) {
      return { valid: false, error: `${key} is below minimum (${baseVal})`, totalSpent: 0 };
    }
    if (attrs[key] > ATTRIBUTE_MAX_CREATION) {
      return { valid: false, error: `${key} exceeds creation cap (${ATTRIBUTE_MAX_CREATION})`, totalSpent: 0 };
    }
    totalSpent += spent;
  }

  if (totalSpent > ATTRIBUTE_BONUS_POINTS) {
    return { valid: false, error: `spent ${totalSpent} points but only have ${ATTRIBUTE_BONUS_POINTS}`, totalSpent };
  }

  return { valid: true, totalSpent };
}

// ── Parse attribute allocation from user input ──────────────────────────────
// Accepts formats like: "BODY 7 REFLEX 5 TECH 4 COOL 3 INT 5 GHOST 6"
// or: "7 5 4 3 5 6" (in BODY/REFLEX/TECH/COOL/INT/GHOST order)

const ATTR_ORDER: AttributeName[] = ['BODY', 'REFLEX', 'TECH', 'COOL', 'INT', 'GHOST'];

export function parseAttributeInput(
  input: string,
  archetype: Archetype,
): { attrs: Attributes; error?: string } {
  const base = defaultAttributes();
  const bonuses = ARCHETYPE_INFO[archetype].bonusAttributes;

  // Apply bonuses to base
  for (const [attr, val] of Object.entries(bonuses)) {
    base[attr as AttributeName] += val as number;
  }

  const trimmed = input.trim().toUpperCase();
  const tokens = trimmed.split(/[\s,]+/);

  // Try named format: BODY 7 REFLEX 5 ...
  const named: Partial<Record<AttributeName, number>> = {};
  let i = 0;
  let isNamed = false;
  while (i < tokens.length) {
    if (ATTR_ORDER.includes(tokens[i] as AttributeName)) {
      isNamed = true;
      const attr = tokens[i] as AttributeName;
      const val = parseInt(tokens[i + 1], 10);
      if (isNaN(val)) return { attrs: base, error: `invalid value for ${attr}` };
      named[attr] = val;
      i += 2;
    } else if (isNamed) {
      return { attrs: base, error: `unexpected token: ${tokens[i]}` };
    } else {
      break;
    }
  }

  if (isNamed) {
    // Fill in defaults for unmentioned attributes
    const result = { ...base };
    for (const [attr, val] of Object.entries(named)) {
      result[attr as AttributeName] = val;
    }
    return { attrs: result };
  }

  // Try positional format: 7 5 4 3 5 6
  const nums = tokens.map(t => parseInt(t, 10));
  if (nums.length === 6 && nums.every(n => !isNaN(n))) {
    const result = { ...base };
    ATTR_ORDER.forEach((attr, idx) => {
      result[attr] = nums[idx];
    });
    return { attrs: result };
  }

  // Try bonus-only format: +4 +2 +1 +0 +2 +3
  const bonusNums = tokens.map(t => parseInt(t.replace('+', ''), 10));
  if (bonusNums.length === 6 && bonusNums.every(n => !isNaN(n) && n >= 0)) {
    const result = { ...base };
    ATTR_ORDER.forEach((attr, idx) => {
      result[attr] = base[attr] + bonusNums[idx];
    });
    return { attrs: result };
  }

  return { attrs: base, error: 'could not parse. use: BODY 7 REFLEX 5 ... or: 7 5 4 3 5 6' };
}

// ── Build Character ─────────────────────────────────────────────────────────

export function buildCharacter(
  handle: string,
  archetype: Archetype,
  combatStyle: CombatStyle,
  attributes: Attributes,
  origin: OriginPoint,
): MudCharacter {
  const subjectId = generateSubjectId();
  const maxHp = calculateMaxHp(attributes.BODY, archetype, 1);
  const maxRam = calculateMaxRam(attributes.TECH);

  const starterKit = getStarterKit(archetype, combatStyle);

  // Build gear
  const gear: GearSlots = {};
  const weapon = createItem(starterKit.weapon);
  if (weapon && weapon.slot) gear[weapon.slot] = weapon;
  const armor = createItem(starterKit.armor);
  if (armor && armor.slot) gear[armor.slot] = armor;

  // Build inventory
  const inventory = starterKit.consumables
    .map(({ id, qty }) => createItem(id, qty))
    .filter(Boolean) as import('./types').Item[];

  if (starterKit.utility) {
    starterKit.utility.forEach(id => {
      const item = createItem(id);
      if (item) inventory.push(item);
    });
  }

  // Cyberware
  const cyberware: import('./types').Item[] = [];
  if (starterKit.cyberware) {
    const cw = createItem(starterKit.cyberware);
    if (cw) cyberware.push(cw);
  }

  const character: MudCharacter = {
    handle,
    subjectId,
    archetype,
    combatStyle,
    attributes,
    level: 1,
    xp: 0,
    hp: maxHp,
    maxHp,
    currentRoom: getOriginSpawnRoom(origin),
    origin,
    skillPoints: 0,
    unlockedSkills: [],
    gear,
    inventory,
    currency: { creds: starterKit.creds, scrip: starterKit.scrip },
    cyberware,
    ram: maxRam,
    maxRam,
    deaths: 0,
    createdAt: Date.now(),
    lastSaved: Date.now(),
    isDead: false,
    // Progression fields
    pendingLevelUps: 0,
    unspentAttributePoints: 0,
    uniqueDrops: [],
    discoveredSynergies: [],
  };

  return character;
}

// ── Finalize Character (save everything) ────────────────────────────────────

export function finalizeCharacter(character: MudCharacter): MudSession {
  // Save character
  saveCharacter(character.handle, character);

  // Initialize world state
  const world: MudWorldState = {
    visitedRooms: [character.currentRoom],
    discoveredNPCs: [],
    activeQuests: [],
    completedQuests: [],
    failedQuests: [],
    declinedQuests: [],
    worldFlags: {},
    partyId: null,
  };
  saveWorld(character.handle, world);

  // Initialize NPC state (empty — populated on first contact)
  const npcState: NPCStateMap = {};
  saveNPCState(character.handle, npcState);

  return {
    phase: 'active',
    character,
    world,
    npcState,
    combat: null,
    creation: null,
  };
}

// ── Leveling ────────────────────────────────────────────────────────────────

export function addXP(character: MudCharacter, amount: number): {
  character: MudCharacter;
  leveled: boolean;
  newLevel?: number;
  xpGained: number;
  pendingLevels: number;
} {
  // INT modifier: +5% XP per point above 3
  const intBonus = Math.max(0, character.attributes.INT - 3) * 0.05;
  const adjustedAmount = Math.floor(amount * (1 + intBonus));

  character.xp += adjustedAmount;

  // Check level up — does NOT auto-level. Sets pendingLevelUps instead.
  if (character.level >= LEVEL_CAP) {
    return { character, leveled: false, xpGained: adjustedAmount, pendingLevels: character.pendingLevelUps ?? 0 };
  }

  // Count how many levels worth of XP we've accumulated
  let pendingNew = 0;
  let checkLevel = character.level + (character.pendingLevelUps ?? 0);
  while (checkLevel < LEVEL_CAP) {
    const nextXP = xpForLevel(checkLevel + 1);
    if (character.xp >= nextXP) {
      checkLevel++;
      pendingNew++;
    } else {
      break;
    }
  }

  // Calculate total pending (existing + new)
  const existingPending = character.pendingLevelUps ?? 0;
  // Only add NEW pending levels beyond what's already pending
  const totalTargetLevel = character.level + existingPending + pendingNew;
  const newPending = totalTargetLevel - character.level - existingPending;

  if (newPending > 0) {
    character.pendingLevelUps = existingPending + newPending;
    return {
      character,
      leveled: true,
      newLevel: character.level + character.pendingLevelUps,
      xpGained: adjustedAmount,
      pendingLevels: character.pendingLevelUps,
    };
  }

  return { character, leveled: false, xpGained: adjustedAmount, pendingLevels: existingPending };
}

// ── Attribute Point Spending (on level up) ──────────────────────────────────

export function spendAttributePoint(
  character: MudCharacter,
  attribute: AttributeName,
): { success: boolean; error?: string } {
  // Each level grants +1 attribute point — tracked implicitly
  // by checking if current total > expected total
  const expectedTotal = ATTRIBUTE_MIN * 6 + ATTRIBUTE_BONUS_POINTS
    + Object.values(ARCHETYPE_INFO[character.archetype].bonusAttributes).reduce((a, b) => a + (b ?? 0), 0)
    + (character.level - 1); // 1 point per level after 1

  const currentTotal = Object.values(character.attributes).reduce((a, b) => a + b, 0);

  if (currentTotal >= expectedTotal) {
    return { success: false, error: 'no attribute points available' };
  }

  if (character.attributes[attribute] >= 15) {
    return { success: false, error: `${attribute} is at maximum (15)` };
  }

  character.attributes[attribute] += 1;

  // Recalculate derived stats if BODY or TECH changed
  if (attribute === 'BODY') {
    const newMaxHp = calculateMaxHp(character.attributes.BODY, character.archetype, character.level);
    const hpGain = newMaxHp - character.maxHp;
    character.maxHp = newMaxHp;
    character.hp += hpGain;
  }
  if (attribute === 'TECH') {
    character.maxRam = calculateMaxRam(character.attributes.TECH);
  }

  return { success: true };
}

// ── Healing ─────────────────────────────────────────────────────────────────

export function healCharacter(character: MudCharacter, amount: number): number {
  const before = character.hp;
  character.hp = Math.min(character.maxHp, character.hp + amount);
  return character.hp - before;
}

// ── Process Level Up (pure stat changes, no UI) ────────────────────────────
// Called by the level-up modal. Applies pending levels, grants points.

export interface LevelUpResult {
  oldLevel: number;
  newLevel: number;
  hpGain: number;
  attrPoints: number;
  skillPoints: number;
}

export function processLevelUp(character: MudCharacter): LevelUpResult {
  const pending = character.pendingLevelUps ?? 0;
  if (pending <= 0) {
    return { oldLevel: character.level, newLevel: character.level, hpGain: 0, attrPoints: 0, skillPoints: 0 };
  }

  const oldLevel = character.level;
  const newLevel = oldLevel + pending;
  const oldMaxHp = character.maxHp;

  character.level = newLevel;
  character.pendingLevelUps = 0;

  // Recalculate HP
  character.maxHp = calculateMaxHp(character.attributes.BODY, character.archetype, character.level);
  character.hp = character.maxHp; // Full heal on level-up
  character.maxRam = calculateMaxRam(character.attributes.TECH);
  character.ram = character.maxRam;

  // Grant points
  if (!character.unspentAttributePoints) character.unspentAttributePoints = 0;
  character.unspentAttributePoints += pending;
  character.skillPoints += pending;

  return {
    oldLevel,
    newLevel,
    hpGain: character.maxHp - oldMaxHp,
    attrPoints: pending,
    skillPoints: pending,
  };
}

// ── Creation Step Descriptions (for the scripted flow) ──────────────────────

export const CREATION_STEPS = {
  archetype: {
    n1xText: `you survived the implant. that's the baseline.
the question is what you did after.
some people tear it out. some people break it.
some people learn to use it against itself.

what did you do?`,
    options: [
      { key: 'DISCONNECTED', display: '"I ripped it out."', description: 'Pure flesh. No implant. Bonus BODY + COOL. Immune to mesh/hack. Max Tier 1 cyberware.' },
      { key: 'SOVEREIGN', display: '"I broke its leash."', description: 'Recompiled implant. Balanced stats. All cyberware tiers. Resist mesh with GHOST.' },
      { key: 'INTEGRATED', display: '"I learned to use it."', description: 'Full augment embrace. Bonus TECH + REFLEX. Advanced cyberware. Vulnerable to EMP/mesh.' },
    ],
  },
  combatStyle: {
    n1xText: `the tunnels don't care about your philosophy.
they care about what you do when something comes at you in the dark.

how do you fight?`,
    options: [
      { key: 'CHROME', display: '"I get close."', description: 'Melee. Cybernetic arms, blades, fists. Scales with BODY + REFLEX.' },
      { key: 'SYNAPSE', display: '"I get in their head."', description: 'Hacking. Quickhacks, daemons, overrides. Scales with TECH + INT.' },
      { key: 'BALLISTIC', display: '"I don\'t miss."', description: 'Ranged. Firearms, smart weapons. Scales with REFLEX + COOL.' },
      { key: 'GHOST_STYLE', display: '"They don\'t see me coming."', description: 'Stealth. Camo, silent kills, infiltration. Scales with COOL + GHOST.' },
    ],
  },
  attributes: {
    n1xText: `six things matter down here. you've got 12 points to distribute.
everything starts at 3. cap is 10 at creation.
your archetype already pushed some numbers.

BODY    — hp, melee damage, carry capacity
REFLEX  — dodge, initiative, crit rate
TECH    — hacking, crafting, repair
COOL    — npc disposition, barter, deception
INT     — xp bonus, puzzles, scan depth
GHOST   — mesh resistance, 33hz attunement, hidden content

tell me your numbers.`,
  },
  origin: {
    n1xText: `one more thing. where do you start?

the city's got cracks. some of them are big enough to hide in.`,
    options: [
      {
        key: 'DRAINAGE',
        display: 'THE DRAINAGE',
        description: 'Tunnels under the eastern industrial district. Where everything dissolved and rebuilt. Not comfortable. But real.',
        available: true,
      },
      // These will be unlocked in later phases:
      // { key: 'IRON_BLOOM', display: 'THE IRON BLOOM', ... },
      // { key: 'ROOFTOPS', display: 'THE ROOFTOPS', ... },
    ],
  },
} as const;
