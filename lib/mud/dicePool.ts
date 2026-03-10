// lib/mud/dicePool.ts
// TUNNELCORE MUD — Dice Pool System (Cortex Prime)
// Replaces d20 single-roll resolution. Attributes become die sizes.
// Pure functions. Zero UI. Zero side effects.

import type { Clock } from './clockEngine';
import { clockPercent } from './clockEngine';
import type { MudCharacter, CombatStyle, ItemTier } from './types';

// ── Die Sizes ──────────────────────────────────────────────────────────────

export type DieSize = 4 | 6 | 8 | 10 | 12;

/** Map attribute value (3-15) to die size. */
export function attributeToDie(value: number): DieSize {
  if (value <= 4) return 4;
  if (value <= 6) return 6;
  if (value <= 8) return 8;
  if (value <= 10) return 10;
  return 12;
}

/** Map item tier to die size. */
export function tierToDie(tier: ItemTier): DieSize {
  switch (tier) {
    case 'SCRAP': return 4;
    case 'COMMON': return 6;
    case 'MIL_SPEC': return 8;
    case 'HELIXION': return 10;
    case 'PROTOTYPE': return 12;
    default: return 6;
  }
}

/** Step a die up by one size. d4→d6→d8→d10→d12. */
export function stepUp(die: DieSize): DieSize {
  switch (die) {
    case 4: return 6;
    case 6: return 8;
    case 8: return 10;
    case 10: return 12;
    case 12: return 12;
  }
}

/** Step a die down by one size. d12→d10→d8→d6→d4. */
export function stepDown(die: DieSize): DieSize {
  switch (die) {
    case 4: return 4;
    case 6: return 4;
    case 8: return 6;
    case 10: return 8;
    case 12: return 10;
  }
}

// ── Rolling ────────────────────────────────────────────────────────────────

/** Roll a single die using crypto.getRandomValues. */
export function rollDie(size: DieSize): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (arr[0] % size) + 1;
}

// ── Pool Entry ─────────────────────────────────────────────────────────────

export interface PoolDie {
  label: string;
  size: DieSize;
  source: 'attribute' | 'skill' | 'gear' | 'augment' | 'environment' | 'status' | 'complication';
  value?: number;
  isComplication?: boolean;
}

// ── Action & Approach Types ────────────────────────────────────────────────

export type ActionType = 'attack' | 'hack' | 'defend' | 'flee' | 'scan' | 'sneak' | 'resist' | 'recover';
export type ApproachType = 'aggressive' | 'measured' | 'desperate';

// ── Position & Effect ──────────────────────────────────────────────────────

export type Position = 'controlled' | 'risky' | 'desperate';
export type EffectLevel = 'limited' | 'standard' | 'great';

export interface ActionContext {
  position: Position;
  effect: EffectLevel;
  reason: string;
}

// ── Pool Context ───────────────────────────────────────────────────────────

export interface PoolContext {
  character: MudCharacter;
  action: ActionType;
  approach: ApproachType;
  targetClockId?: string;
  environmentalFactors?: string[];
  combatClocks?: Clock[];
  enemyTier?: number;
}

// ── Pool Assembly ──────────────────────────────────────────────────────────

/** Primary attribute for a given action type. */
function getPrimaryAttribute(action: ActionType, character: MudCharacter): { attr: string; value: number } {
  const a = character.attributes;
  switch (action) {
    case 'attack': {
      // Melee uses BODY, ranged uses REFLEX
      const wpn = character.gear?.weapon_primary;
      if (wpn?.damageType === 'ranged') return { attr: 'REFLEX', value: a.REFLEX };
      if (wpn?.damageType === 'hack') return { attr: 'TECH', value: a.TECH };
      return { attr: 'BODY', value: a.BODY };
    }
    case 'hack': return { attr: 'TECH', value: a.TECH };
    case 'defend': return { attr: a.BODY >= a.REFLEX ? 'BODY' : 'REFLEX', value: Math.max(a.BODY, a.REFLEX) };
    case 'flee': return { attr: 'REFLEX', value: a.REFLEX };
    case 'scan': return { attr: 'INT', value: a.INT };
    case 'sneak': return { attr: 'COOL', value: a.COOL };
    case 'resist': return { attr: 'GHOST', value: a.GHOST };
    case 'recover': return { attr: 'BODY', value: a.BODY };
  }
}

/** Does the action align with the character's combat style? */
function styleAligns(action: ActionType, style: CombatStyle, character: MudCharacter): boolean {
  const wpn = character.gear?.weapon_primary;
  switch (style) {
    case 'CHROME':
      return action === 'attack' && (wpn?.damageType === 'melee' || !wpn);
    case 'SYNAPSE':
      return action === 'hack';
    case 'BALLISTIC':
      return action === 'attack' && wpn?.damageType === 'ranged';
    case 'GHOST_STYLE':
      return action === 'sneak' || (action === 'attack' && false); // stealth attacks handled by skill nodes
    default:
      return false;
  }
}

/** Get the style die size. Defaults to d6, grows with skill tree investment. */
export function getStyleDieSize(character: MudCharacter): DieSize {
  // Count nodes unlocked in primary tree
  const styleToTree: Record<CombatStyle, string> = {
    CHROME: 'chrome', SYNAPSE: 'synapse', BALLISTIC: 'ballistic', GHOST_STYLE: 'ghost',
  };
  const treePrefix = styleToTree[character.combatStyle] ?? 'chrome';
  const count = character.unlockedSkills.filter(s => s.startsWith(treePrefix)).length;

  // 0-1 nodes: d6, 2-3: d8, 4-5: d10, 6+: d12
  if (count >= 6) return 12;
  if (count >= 4) return 10;
  if (count >= 2) return 8;
  return 6;
}

/** Assemble the full dice pool for an action. */
export function assemblePool(ctx: PoolContext): PoolDie[] {
  const pool: PoolDie[] = [];
  const { character, action } = ctx;

  // 1. Primary attribute die
  const primary = getPrimaryAttribute(action, character);
  pool.push({
    label: primary.attr,
    size: attributeToDie(primary.value),
    source: 'attribute',
  });

  // 2. Combat style die (if action aligns)
  if (styleAligns(action, character.combatStyle, character)) {
    const styleDie = getStyleDieSize(character);
    const styleLabel = character.combatStyle === 'GHOST_STYLE' ? 'GHOST' : character.combatStyle;
    pool.push({
      label: styleLabel,
      size: styleDie,
      source: 'skill',
    });
  }

  // 3. Gear die (weapon on attack/hack, armor on defend)
  if (action === 'attack' || action === 'hack') {
    const wpn = character.gear?.weapon_primary;
    if (wpn) {
      pool.push({
        label: wpn.name,
        size: tierToDie(wpn.tier),
        source: 'gear',
      });
    }
  } else if (action === 'defend') {
    const armor = character.gear?.armor;
    if (armor) {
      pool.push({
        label: armor.name,
        size: tierToDie(armor.tier),
        source: 'gear',
      });
    }
  }

  // 4. Augment dice — each relevant equipped augment adds a die
  if (character.augmentSlots) {
    const slots = character.augmentSlots;
    const augTierToDie = (t: number): DieSize => t >= 3 ? 8 : t >= 2 ? 6 : 4;
    if (action === 'attack' && slots.limbs) {
      pool.push({
        label: slots.limbs.name,
        size: augTierToDie(slots.limbs.tier),
        source: 'augment',
      });
    }
    if (action === 'hack' && slots.neural) {
      pool.push({
        label: slots.neural.name,
        size: augTierToDie(slots.neural.tier),
        source: 'augment',
      });
    }
    if ((action === 'defend' || action === 'flee') && slots.chassis) {
      pool.push({
        label: slots.chassis.name,
        size: augTierToDie(slots.chassis.tier),
        source: 'augment',
      });
    }
  }

  // 5. Skill node dice — check unlocked skills for pool bonuses
  // Tier 1 nodes: add d6 asset die, Tier 2: step up existing, etc.
  // (Handled via skill clock effects in combat resolution — simplified here)
  const skillDice = getSkillPoolDice(character, action);
  pool.push(...skillDice);

  // 6. Complication dice from status/environmental clocks
  if (ctx.combatClocks) {
    const statusClocks = ctx.combatClocks.filter(
      c => c.category === 'status' && c.owner === 'player' && c.filled > 0,
    );
    for (const sc of statusClocks) {
      pool.push({
        label: sc.name,
        size: sc.filled >= 2 ? 8 : 6,
        source: 'complication',
        isComplication: true,
      });
    }

    // Environmental clocks above 50% add complication dice
    const envClocks = ctx.combatClocks.filter(
      c => c.category === 'environment' && clockPercent(c) > 50,
    );
    for (const ec of envClocks) {
      pool.push({
        label: ec.name,
        size: 6,
        source: 'complication',
        isComplication: true,
      });
    }
  }

  return pool;
}

/** Get bonus dice from unlocked skill nodes. */
function getSkillPoolDice(character: MudCharacter, action: ActionType): PoolDie[] {
  const dice: PoolDie[] = [];
  const skills = character.unlockedSkills;

  // CHROME skills
  if (action === 'attack') {
    if (skills.includes('chrome_heavy_blow')) {
      dice.push({ label: 'Heavy Blow', size: 6, source: 'skill' });
    }
    if (skills.includes('chrome_berserk')) {
      // Berserk adds a d8 when active (tracked via status clock, not always present)
      // Passive check: add nothing here, activated in combat
    }
    if (skills.includes('chrome_gorilla_arms')) {
      const wpn = character.gear?.weapon_primary;
      if (!wpn || wpn.damageType === 'melee') {
        dice.push({ label: 'Gorilla Arms', size: 8, source: 'skill' });
      }
    }
    if (skills.includes('ballistic_steady_aim')) {
      const wpn = character.gear?.weapon_primary;
      if (wpn?.damageType === 'ranged') {
        dice.push({ label: 'Steady Aim', size: 6, source: 'skill' });
      }
    }
    if (skills.includes('ballistic_dead_eye')) {
      const wpn = character.gear?.weapon_primary;
      if (wpn?.damageType === 'ranged') {
        dice.push({ label: 'Dead Eye', size: 8, source: 'skill' });
      }
    }
  }

  // SYNAPSE hack skills
  if (action === 'hack') {
    if (skills.includes('synapse_ice_breaker')) {
      dice.push({ label: 'ICE Breaker', size: 6, source: 'skill' });
    }
    if (skills.includes('synapse_ghost_in_wire')) {
      dice.push({ label: 'Ghost in Wire', size: 8, source: 'skill' });
    }
  }

  // GHOST stealth/sneak skills
  if (action === 'sneak') {
    if (skills.includes('ghost_phantom_step')) {
      dice.push({ label: 'Phantom Step', size: 6, source: 'skill' });
    }
    if (skills.includes('ghost_predator')) {
      dice.push({ label: 'Predator', size: 8, source: 'skill' });
    }
  }

  // Defensive skills
  if (action === 'defend') {
    if (skills.includes('chrome_iron_skin')) {
      dice.push({ label: 'Iron Skin', size: 6, source: 'skill' });
    }
    if (skills.includes('chrome_deflect')) {
      dice.push({ label: 'Deflect', size: 6, source: 'skill' });
    }
  }

  // Universal skills
  if (skills.includes('uni_adrenaline') && action === 'attack') {
    // Adrenaline: once per combat add d6, tracked by combat state
  }
  if (skills.includes('uni_scavenger_eye') && action === 'scan') {
    dice.push({ label: 'Scavenger Eye', size: 6, source: 'skill' });
  }

  // Frequency skills
  if (action === 'resist' && skills.includes('freq_attunement')) {
    dice.push({ label: 'Attunement', size: 6, source: 'skill' });
  }

  return dice;
}

// ── Pool Resolution ────────────────────────────────────────────────────────

export interface RollResult {
  pool: PoolDie[];
  effectDie: number;
  secondDie: number;
  total: number;
  complications: PoolDie[];
  heroicOpportunity: boolean;
  botch: boolean;
}

/** Roll all dice in a pool. Returns sorted results. */
export function rollPool(pool: PoolDie[]): RollResult {
  // Separate regular dice from complications
  const regular: PoolDie[] = [];
  const complications: PoolDie[] = [];

  for (const die of pool) {
    const rolled = { ...die, value: rollDie(die.size) };
    if (die.isComplication) {
      complications.push(rolled);
    } else {
      regular.push(rolled);
    }
  }

  // Sort regular dice by value descending
  regular.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const effectDie = regular[0]?.value ?? 0;
  const secondDie = regular[1]?.value ?? 0;
  const total = effectDie + secondDie;

  // Check heroic opportunity (any die rolled max)
  const heroicOpportunity = regular.some(d => d.value === d.size);

  // Check botch (effect die is 1)
  const botch = effectDie === 1;

  // Check which complications fired (complication die > effect die → ticks danger)
  const firedComplications = complications.filter(c => (c.value ?? 0) > effectDie);

  return {
    pool: [...regular, ...complications],
    effectDie,
    secondDie,
    total,
    complications: firedComplications,
    heroicOpportunity,
    botch,
  };
}

// ── Outcome Resolution ─────────────────────────────────────────────────────

export type OutcomeTier = 'failure' | 'partial' | 'success' | 'strong' | 'critical';

export interface ActionOutcome {
  tier: OutcomeTier;
  targetTicks: number;
  dangerTicks: number;
  bonusEffect?: string;
  description: string;
}

/** Determine outcome tier from total. */
export function getOutcomeTier(total: number): OutcomeTier {
  if (total <= 4) return 'failure';
  if (total <= 9) return 'partial';
  if (total <= 14) return 'success';
  if (total <= 19) return 'strong';
  return 'critical';
}

/** Calculate base target ticks for an outcome tier. */
function baseTicks(tier: OutcomeTier): { target: number; danger: number } {
  switch (tier) {
    case 'failure': return { target: 0, danger: 2 };
    case 'partial': return { target: 1, danger: 1 };
    case 'success': return { target: 2, danger: 0 };
    case 'strong': return { target: 3, danger: -1 }; // -1 = drain 1 from danger
    case 'critical': return { target: 3, danger: -1 }; // plus bonus
  }
}

/** Position modifies danger ticks on failure/partial. */
function positionDangerMod(position: Position, tier: OutcomeTier): number {
  if (tier === 'success' || tier === 'strong' || tier === 'critical') return 0;
  switch (position) {
    case 'controlled':
      return tier === 'partial' ? -1 : -1; // 0 on partial, 1 on failure
    case 'risky':
      return 0; // default values
    case 'desperate':
      return 1; // +1 danger on partial/failure
  }
}

/** Effect level modifies target ticks. */
function effectTickMod(effect: EffectLevel): number {
  switch (effect) {
    case 'limited': return -1;
    case 'standard': return 0;
    case 'great': return 1;
  }
}

/** Calculate full action outcome. */
export function resolveOutcome(
  result: RollResult,
  position: Position,
  effect: EffectLevel,
): ActionOutcome {
  const tier = result.botch ? 'failure' : getOutcomeTier(result.total);
  const base = baseTicks(tier);

  let targetTicks = Math.max(0, base.target + effectTickMod(effect));
  let dangerTicks = base.danger + positionDangerMod(position, tier);

  // Desperate position gives +1 effect die size equivalent: +1 target tick
  if (position === 'desperate' && targetTicks > 0) {
    targetTicks += 1;
  }

  // Complications from status/environment clocks add to danger
  dangerTicks += result.complications.length;

  // Heroic opportunity on critical: bonus effect
  const bonusEffect = tier === 'critical' ? 'heroic_bonus' : undefined;

  const description = formatOutcomeDescription(tier, targetTicks, dangerTicks);

  return { tier, targetTicks, dangerTicks, bonusEffect, description };
}

function formatOutcomeDescription(tier: OutcomeTier, targetTicks: number, dangerTicks: number): string {
  const label = tier.toUpperCase();
  const parts: string[] = [label];
  if (targetTicks > 0) parts.push(`+${targetTicks} target`);
  if (dangerTicks > 0) parts.push(`+${dangerTicks} danger`);
  if (dangerTicks < 0) parts.push(`drain ${Math.abs(dangerTicks)} danger`);
  return parts.join(' — ');
}

// ── Position & Effect Assessment ───────────────────────────────────────────

/** Assess the position and effect for a given action. */
export function assessAction(
  character: MudCharacter,
  action: ActionType,
  approach: ApproachType,
  combatClocks: Clock[],
  enemyTier: number,
): ActionContext {
  let position: Position = 'risky' as Position;
  let effect: EffectLevel = 'standard';
  const reasons: string[] = [];

  // ── Position assessment ──
  // Player harm state
  const harmClock = combatClocks.find(c => c.id === 'player_harm');
  if (harmClock) {
    const pct = clockPercent(harmClock);
    if (pct >= 60) {
      position = 'desperate';
      reasons.push('heavy wounds');
    }
  }

  // Critical clock ticking
  const critClock = combatClocks.find(c => c.id === 'player_critical');
  if (critClock && critClock.filled > 0) {
    position = 'desperate';
    reasons.push('critical damage');
  }

  // Enemy count
  const enemyHarmClocks = combatClocks.filter(c => c.category === 'harm' && c.owner !== 'player' && c.owner !== 'environment');
  const liveEnemies = enemyHarmClocks.filter(c => c.filled < c.segments);
  if (liveEnemies.length >= 3) {
    if (position !== 'desperate') position = 'risky';
    reasons.push('outnumbered');
  }

  // Approach modifies position
  if (approach === 'aggressive') {
    if (position === 'controlled') position = 'risky';
    else if (position === 'risky') position = 'desperate';
    reasons.push('aggressive approach');
  } else if (approach === 'measured') {
    if (position === 'desperate') position = 'risky';
    else if (position === 'risky') position = 'controlled';
    reasons.push('measured approach');
  } else if (approach === 'desperate') {
    position = 'desperate';
    reasons.push('desperate approach');
  }

  // ── Effect assessment ──
  // Gear tier vs enemy tier
  const wpn = character.gear?.weapon_primary;
  const gearTier = wpn ? tierToNum(wpn.tier) : 1;
  if (gearTier > enemyTier) {
    effect = 'great';
    reasons.push('superior gear');
  } else if (gearTier < enemyTier - 1) {
    effect = 'limited';
    reasons.push('outclassed gear');
  }

  // Relevant skill nodes boost effect
  const treePrefix = getTreePrefix(character.combatStyle);
  const treePoints = character.unlockedSkills.filter(s => s.startsWith(treePrefix)).length;
  if (treePoints >= 4 && effect === 'standard') {
    effect = 'great';
    reasons.push('skill mastery');
  }

  // Environmental advantages
  const envClocks = combatClocks.filter(c => c.category === 'environment');
  if (envClocks.some(c => clockPercent(c) > 75)) {
    if (effect === 'great') effect = 'standard';
    reasons.push('hazardous environment');
  }

  return {
    position,
    effect,
    reason: reasons.join(', ') || 'standard engagement',
  };
}

function tierToNum(tier: ItemTier): number {
  switch (tier) {
    case 'SCRAP': return 1;
    case 'COMMON': return 2;
    case 'MIL_SPEC': return 3;
    case 'HELIXION': return 4;
    case 'PROTOTYPE': return 5;
    default: return 1;
  }
}

function getTreePrefix(style: CombatStyle): string {
  switch (style) {
    case 'CHROME': return 'chrome';
    case 'SYNAPSE': return 'synapse';
    case 'BALLISTIC': return 'ballistic';
    case 'GHOST_STYLE': return 'ghost';
  }
}

// ── Display Helpers ────────────────────────────────────────────────────────

/** Format a die for display: "BODY d8" */
export function formatDie(die: PoolDie): string {
  return `${die.label} d${die.size}`;
}

/** Format a rolled die for display: "BODY d8 → [6]" */
export function formatRolledDie(die: PoolDie): string {
  return `${die.label} d${die.size} → [${die.value ?? '?'}]`;
}

/** Format the pool compact line: "BODY d8 · CHROME d6 · Mantis Blades d8" */
export function formatPoolCompact(pool: PoolDie[]): string {
  const regular = pool.filter(d => !d.isComplication);
  const complications = pool.filter(d => d.isComplication);

  let str = regular.map(d => `${d.label} d${d.size}`).join(' · ');
  if (complications.length > 0) {
    str += ' │ ⚠ ' + complications.map(d => `${d.label} d${d.size}`).join(' · ');
  }
  return str;
}

/** Format roll results compact: "[6] · [4] · [7] │ ⚠ [2]    TOTAL: 13 → SUCCESS" */
export function formatRollCompact(result: RollResult): string {
  const regular = result.pool.filter(d => !d.isComplication);
  const complications = result.pool.filter(d => d.isComplication);

  let str = regular.map(d => `[${d.value}]`).join(' · ');
  if (complications.length > 0) {
    str += ' │ ⚠ ' + complications.map(d => `[${d.value}]`).join(' · ');
  }

  const tier = result.botch ? 'BOTCH' : getOutcomeTier(result.total).toUpperCase();
  str += `    TOTAL: ${result.total} → ${tier}`;
  return str;
}
