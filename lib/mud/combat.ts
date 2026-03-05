// lib/mud/combat.ts
// TUNNELCORE MUD — Combat Engine
// Client-side deterministic combat. crypto.getRandomValues for fairness.

import type {
  MudCharacter, CombatState, Combatant, ActiveEffect,
  RoomEnemy, Attributes, CombatStyle, GearSlots,
} from './types';


// ── Dice ────────────────────────────────────────────────────────────────────

function roll(sides: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (arr[0] % sides) + 1;
}

export function d20(): number { return roll(20); }
export function d6(): number { return roll(6); }
export function d8(): number { return roll(8); }

// ── Flavor text pools ───────────────────────────────────────────────────────

const MELEE_HIT = [
  'connects with a sickening crunch',
  'slams home — metal meets flesh',
  'tears through with brutal force',
  'lands clean — they stagger',
  'hits hard enough to feel it in your teeth',
];
const MELEE_MISS = [
  'swings wide — nothing but air',
  'they twist aside at the last second',
  'glances off armor — no damage',
  'you overextend — they slip past',
];
const RANGED_HIT = [
  'finds its mark — blood and sparks',
  'punches through — clean hit',
  'tags them center mass',
  'the round connects — they jerk sideways',
];
const RANGED_MISS = [
  'goes wide — ricochets into darkness',
  'they drop behind cover just in time',
  'the shot sparks off a pipe overhead',
];
const HACK_HIT = [
  'their systems seize — you\'re in',
  'the daemon lands — circuits scream',
  'neural feedback loop initiated',
  'breach successful — their mesh buckles',
];
const HACK_MISS = [
  'their firewall holds — access denied',
  'the hack bounces — they purged it',
  'ICE intercepts the payload',
];
const ENEMY_MELEE = [
  'lunges at you with exposed metal',
  'swings hard — desperation in every movement',
  'charges, augmented limbs thrashing',
  'rakes at you with chrome fingers',
];
const ENEMY_RANGED = [
  'opens fire from across the room',
  'squeezes off a burst — muzzle flash in the dark',
  'takes aim and fires',
];

function pick<T>(arr: T[]): T { return arr[roll(arr.length) - 1]; }

// ── Quickhack Definitions ───────────────────────────────────────────────────

export interface QuickhackDef {
  id: string; name: string; ramCost: number;
  damage?: number; damageType?: string; duration?: number;
  effectType?: ActiveEffect['effectType']; effectValue?: number;
  description: string; techReq: number;
}

export const QUICKHACKS: QuickhackDef[] = [
  { id: 'short_circuit', name: 'Short Circuit', ramCost: 2, damage: 0, description: '1d6 electric, ignores armor', techReq: 6 },
  { id: 'overheat', name: 'Overheat', ramCost: 3, damage: 0, description: '1d8 fire over 2 turns', techReq: 6, effectType: 'damage_over_time', duration: 2 },
  { id: 'weapon_glitch', name: 'Weapon Glitch', ramCost: 2, damage: 0, description: 'target weapon jams 1 turn', techReq: 6, effectType: 'debuff', duration: 1 },
  { id: 'reboot_optics', name: 'Reboot Optics', ramCost: 3, damage: 0, description: 'target blinded 1 turn (-5 attacks)', techReq: 7, effectType: 'blind', duration: 1, effectValue: 5 },
  { id: 'synapse_burnout', name: 'Synapse Burnout', ramCost: 5, damage: 0, description: '2d8 damage + stun 1 turn', techReq: 8, effectType: 'stun', duration: 1 },
  { id: 'system_reset', name: 'System Reset', ramCost: 4, damage: 0, description: 'disable cyberware 2 turns', techReq: 7, effectType: 'debuff', duration: 2 },
];

export function getAvailableHacks(tech: number, combatStyle: CombatStyle): QuickhackDef[] {
  if (combatStyle !== 'SYNAPSE' && tech < 6) return [];
  return QUICKHACKS.filter(h => tech >= h.techReq);
}

// ── Combat Initialization ───────────────────────────────────────────────────

export function initCombat(character: MudCharacter, enemies: RoomEnemy[]): CombatState {
  const playerInit = character.attributes.REFLEX + d20();
  const playerCombatant: Combatant = {
    id: 'player', name: character.handle, type: 'player',
    hp: character.hp, maxHp: character.maxHp,
    attributes: { ...character.attributes },
    initiative: playerInit, ap: 2,
    effects: [], gear: character.gear ? { ...character.gear } : undefined,
    ram: character.ram, maxRam: character.maxRam,
  };

  const enemyCombatants: Combatant[] = enemies.map((e, i) => {
    const count = e.count[0] + roll(e.count[1] - e.count[0] + 1) - 1;
    // For simplicity, spawn one combatant per enemy definition
    return {
      id: `enemy_${e.id}_${i}`, name: e.name, type: 'enemy' as const,
      hp: e.hp, maxHp: e.hp,
      attributes: { ...e.attributes },
      initiative: e.attributes.REFLEX + d20(), ap: 2,
      effects: [],
      ram: 0, maxRam: 0,
    };
  });

  const all = [playerCombatant, ...enemyCombatants];
  all.sort((a, b) => b.initiative - a.initiative);

  return {
    active: true,
    combatants: all,
    turnOrder: all.map(c => c.id),
    currentTurn: 0,
    round: 1,
    log: [],
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getCombatant(combat: CombatState, id: string): Combatant | undefined {
  return combat.combatants.find(c => c.id === id);
}

function getPlayer(combat: CombatState): Combatant | undefined {
  return combat.combatants.find(c => c.type === 'player');
}

function getLivingEnemies(combat: CombatState): Combatant[] {
  return combat.combatants.filter(c => c.type === 'enemy' && c.hp > 0 && !c.isDowned);
}

function isPlayerTurn(combat: CombatState): boolean {
  return combat.turnOrder[combat.currentTurn] === 'player';
}

function hasEffect(c: Combatant, type: ActiveEffect['effectType']): boolean {
  return c.effects.some(e => e.effectType === type && e.turnsRemaining > 0);
}

function getWeaponDamage(gear?: GearSlots): { base: number; type: 'melee' | 'ranged' | 'hack' } {
  const wpn = gear?.weapon_primary;
  if (!wpn) return { base: 3, type: 'melee' };
  return { base: wpn.damage ?? 3, type: wpn.damageType === 'ranged' ? 'ranged' : wpn.damageType === 'hack' ? 'hack' : 'melee' };
}

function getArmorValue(gear?: GearSlots): number {
  return gear?.armor?.armorValue ?? 0;
}

function getAttackAttribute(wpn: { type: 'melee' | 'ranged' | 'hack' }, attrs: Attributes): number {
  switch (wpn.type) {
    case 'melee': return attrs.BODY;
    case 'ranged': return attrs.REFLEX;
    case 'hack': return attrs.TECH;
  }
}

// ── HP Bar ──────────────────────────────────────────────────────────────────

export function hpBar(hp: number, max: number, width = 20): string {
  const filled = Math.max(0, Math.round((hp / max) * width));
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ── Attack Resolution ───────────────────────────────────────────────────────

export interface AttackResult {
  hit: boolean; crit: boolean; damage: number; roll: number;
  attackTotal: number; defenseTotal: number;
  flavorHit: string; flavorMiss: string;
  targetId: string; targetName: string;
  killed: boolean;
}

export function resolvePlayerAttack(
  combat: CombatState, targetId: string, character: MudCharacter,
): AttackResult | { error: string } {
  const player = getPlayer(combat);
  const target = getCombatant(combat, targetId);
  if (!player || !target) return { error: 'invalid target' };
  if (player.ap < 1) return { error: 'not enough AP (need 1)' };
  if (target.hp <= 0) return { error: 'target is already down' };
  if (hasEffect(player, 'stun')) return { error: 'you are stunned — turn lost' };

  const wpn = getWeaponDamage(player.gear);
  const atkAttr = getAttackAttribute(wpn, player.attributes);
  const rollVal = d20();
  const isCrit = rollVal >= 18;
  const blindPenalty = hasEffect(player, 'blind') ? 5 : 0;
  const attackTotal = atkAttr + (wpn.base) + rollVal - blindPenalty;

  const armor = target.attributes.REFLEX + (target.gear ? getArmorValue(target.gear) : 0);
  const defenseTotal = armor;

  const hit = attackTotal > defenseTotal;
  let damage = 0;
  if (hit) {
    damage = wpn.base + atkAttr + d6();
    // Style bonus
    if (character.combatStyle === 'CHROME') damage += Math.floor(character.attributes.BODY / 3);
    if (character.combatStyle === 'BALLISTIC') damage += Math.floor(character.attributes.REFLEX / 3);
    if (character.combatStyle === 'GHOST_STYLE' && combat.round === 1) damage = Math.floor(damage * 1.5); // First-strike
    if (isCrit) damage *= 2;
    // Armor reduction
    const flatArmor = target.gear ? getArmorValue(target.gear) : Math.floor(target.attributes.BODY / 3);
    damage = Math.max(1, damage - flatArmor);
    target.hp = Math.max(0, target.hp - damage);
  }

  player.ap -= 1;
  const killed = target.hp <= 0;
  const flavors = wpn.type === 'ranged' ? { h: RANGED_HIT, m: RANGED_MISS } : { h: MELEE_HIT, m: MELEE_MISS };

  return {
    hit, crit: isCrit && hit, damage, roll: rollVal,
    attackTotal, defenseTotal,
    flavorHit: pick(flavors.h), flavorMiss: pick(flavors.m),
    targetId, targetName: target.name, killed,
  };
}

// ── Quickhack Resolution ────────────────────────────────────────────────────

export interface HackResult {
  hit: boolean; damage: number; effect?: string;
  hackName: string; targetName: string; ramSpent: number;
  roll: number; attackTotal: number; defenseTotal: number;
  killed: boolean;
}

export function resolveQuickhack(
  combat: CombatState, targetId: string, hackId: string, character: MudCharacter,
): HackResult | { error: string } {
  const player = getPlayer(combat);
  const target = getCombatant(combat, targetId);
  if (!player || !target) return { error: 'invalid target' };
  if (player.ap < 2) return { error: 'not enough AP (need 2)' };
  if (hasEffect(player, 'stun')) return { error: 'you are stunned' };

  const hack = QUICKHACKS.find(h => h.id === hackId);
  if (!hack) return { error: 'unknown quickhack' };
  if ((player.ram ?? 0) < hack.ramCost) return { error: `not enough RAM (need ${hack.ramCost}, have ${player.ram})` };

  const rollVal = d20();
  const attackTotal = character.attributes.TECH + rollVal;
  const defenseTotal = target.attributes.INT + Math.floor(target.attributes.TECH / 2);
  const hit = attackTotal > defenseTotal;

  player.ap -= 2;
  player.ram = (player.ram ?? 0) - hack.ramCost;

  let damage = 0;
  let effect: string | undefined;

  if (hit) {
    switch (hack.id) {
      case 'short_circuit': damage = d6(); break;
      case 'overheat':
        damage = d8();
        target.effects.push({ id: 'overheat', name: 'Overheat', turnsRemaining: 2, effectType: 'damage_over_time', value: d6() });
        effect = 'burning (2 turns)';
        break;
      case 'weapon_glitch':
        target.effects.push({ id: 'weapon_glitch', name: 'Weapon Glitch', turnsRemaining: 1, effectType: 'debuff', value: 0 });
        effect = 'weapon jammed (1 turn)';
        break;
      case 'reboot_optics':
        target.effects.push({ id: 'reboot_optics', name: 'Blinded', turnsRemaining: 1, effectType: 'blind', value: 5 });
        effect = 'blinded (1 turn)';
        break;
      case 'synapse_burnout':
        damage = d8() + d8();
        target.effects.push({ id: 'synapse_burnout', name: 'Stunned', turnsRemaining: 1, effectType: 'stun', value: 0 });
        effect = 'stunned (1 turn)';
        break;
      case 'system_reset':
        target.effects.push({ id: 'system_reset', name: 'Systems Down', turnsRemaining: 2, effectType: 'debuff', value: 0 });
        effect = 'cyberware disabled (2 turns)';
        break;
    }
    if (damage > 0) target.hp = Math.max(0, target.hp - damage); // Quickhacks ignore armor
  }

  return {
    hit, damage, effect, hackName: hack.name, targetName: target.name,
    ramSpent: hack.ramCost, roll: rollVal, attackTotal, defenseTotal,
    killed: target.hp <= 0,
  };
}

// ── Use Item ────────────────────────────────────────────────────────────────

export function useItemInCombat(
  combat: CombatState, character: MudCharacter, itemIndex: number,
): { healed?: number; error?: string; itemName: string } {
  const player = getPlayer(combat);
  if (!player) return { error: 'no player', itemName: '' };
  if (player.ap < 1) return { error: 'not enough AP (need 1)', itemName: '' };

  const item = character.inventory[itemIndex];
  if (!item) return { error: 'no item at that index', itemName: '' };
  if (!item.healAmount) return { error: 'that item has no combat use', itemName: item.name };

  player.ap -= 1;
  const healed = Math.min(item.healAmount, player.maxHp - player.hp);
  player.hp += healed;
  character.hp = player.hp;

  // Consume item
  if (item.stackable && item.quantity > 1) {
    item.quantity -= 1;
  } else {
    character.inventory.splice(itemIndex, 1);
  }

  return { healed, itemName: item.name };
}

// ── Scan ────────────────────────────────────────────────────────────────────

export interface ScanResult {
  success: boolean; targetName: string;
  hp?: number; maxHp?: number; attributes?: Attributes;
  weaknesses?: string[]; effects?: string[];
}

export function scanEnemy(
  combat: CombatState, targetId: string, character: MudCharacter,
): ScanResult | { error: string } {
  const player = getPlayer(combat);
  const target = getCombatant(combat, targetId);
  if (!player || !target) return { error: 'invalid target' };
  if (player.ap < 1) return { error: 'not enough AP (need 1)' };

  player.ap -= 1;
  const check = character.attributes.INT + d20();
  const success = check >= 12;

  if (!success) return { success: false, targetName: target.name };

  const weaknesses: string[] = [];
  if (target.attributes.TECH <= 2) weaknesses.push('low TECH — vulnerable to quickhacks');
  if (target.attributes.REFLEX <= 2) weaknesses.push('slow — easy to hit');
  if (target.attributes.BODY <= 3) weaknesses.push('fragile — low HP');

  return {
    success: true, targetName: target.name,
    hp: target.hp, maxHp: target.maxHp, attributes: target.attributes,
    weaknesses, effects: target.effects.map(e => `${e.name} (${e.turnsRemaining} turns)`),
  };
}

// ── Flee ────────────────────────────────────────────────────────────────────

export interface FleeResult {
  success: boolean; damageTaken?: number; flavorText: string;
}

export function attemptFlee(combat: CombatState, character: MudCharacter): FleeResult | { error: string } {
  const player = getPlayer(combat);
  if (!player) return { error: 'no player' };
  if (player.ap < 2) return { error: 'not enough AP (need 2)' };
  if (hasEffect(player, 'stun')) return { error: 'you are stunned — cannot flee' };

  player.ap -= 2;
  const playerRoll = character.attributes.REFLEX + d20();
  const enemies = getLivingEnemies(combat);
  const bestEnemy = Math.max(...enemies.map(e => e.attributes.REFLEX + d20()));

  if (playerRoll > bestEnemy) {
    combat.active = false;
    return { success: true, flavorText: 'you break away — footsteps echoing behind you as the distance grows.' };
  }

  // Failed — free attack from strongest enemy
  const attacker = enemies[0];
  if (attacker) {
    const dmg = Math.max(1, (attacker.attributes.BODY + d6()) - getArmorValue(player.gear));
    player.hp = Math.max(0, player.hp - dmg);
    character.hp = player.hp;
    return { success: false, damageTaken: dmg, flavorText: `you turn to run — ${attacker.name} catches you with a parting blow.` };
  }

  return { success: false, flavorText: 'you stumble but they block the exit.' };
}

// ── Enemy AI Turn ───────────────────────────────────────────────────────────

export interface EnemyAction {
  attackerId: string; attackerName: string;
  action: 'attack' | 'nothing' | 'stunned';
  hit?: boolean; damage?: number; crit?: boolean;
  flavorText: string;
}

export function processEnemyTurn(combat: CombatState, enemyId: string): EnemyAction {
  const enemy = getCombatant(combat, enemyId);
  const player = getPlayer(combat);
  if (!enemy || !player) return { attackerId: enemyId, attackerName: '?', action: 'nothing', flavorText: '' };

  // Reset AP
  enemy.ap = 2;

  // Tick effects
  tickEffects(enemy);

  if (hasEffect(enemy, 'stun')) {
    return { attackerId: enemyId, attackerName: enemy.name, action: 'stunned', flavorText: `${enemy.name} is stunned — turn lost.` };
  }

  if (enemy.hp <= 0) return { attackerId: enemyId, attackerName: enemy.name, action: 'nothing', flavorText: '' };

  // Simple AI: attack twice (2 AP)
  const results: EnemyAction[] = [];
  for (let i = 0; i < 2 && enemy.ap > 0; i++) {
    if (player.hp <= 0) break;
    const hasWeaponGlitch = hasEffect(enemy, 'debuff');
    if (hasWeaponGlitch && i === 0) {
      enemy.ap -= 1;
      results.push({ attackerId: enemyId, attackerName: enemy.name, action: 'nothing', flavorText: `${enemy.name}'s weapon jams — they struggle with it.` });
      continue;
    }

    const rollVal = d20();
    const blindPenalty = hasEffect(enemy, 'blind') ? 5 : 0;
    const atkTotal = enemy.attributes.BODY + rollVal - blindPenalty;
    const defTotal = player.attributes.REFLEX + getArmorValue(player.gear);
    const hit = atkTotal > defTotal;
    const isCrit = rollVal >= 18;

    enemy.ap -= 1;
    let damage = 0;
    if (hit) {
      damage = enemy.attributes.BODY + d6();
      if (isCrit) damage *= 2;
      damage = Math.max(1, damage - getArmorValue(player.gear));
      player.hp = Math.max(0, player.hp - damage);
    }

    results.push({
      attackerId: enemyId, attackerName: enemy.name,
      action: 'attack', hit, damage, crit: isCrit && hit,
      flavorText: hit ? `${enemy.name} ${pick(ENEMY_MELEE)} — ${damage} damage` : `${enemy.name} ${pick(ENEMY_MELEE)} — misses`,
    });
  }

  // Return combined result (just the first meaningful action for display)
  const meaningful = results.find(r => r.action === 'attack') ?? results[0];
  // Sum damage from all attacks
  const totalDmg = results.reduce((s, r) => s + (r.damage ?? 0), 0);
  if (meaningful && totalDmg > 0) meaningful.damage = totalDmg;
  return meaningful;
}

// ── Effect Ticking ──────────────────────────────────────────────────────────

function tickEffects(c: Combatant): { dotDamage: number } {
  let dotDamage = 0;
  c.effects = c.effects.filter(e => {
    if (e.effectType === 'damage_over_time' && e.turnsRemaining > 0) {
      dotDamage += e.value;
      c.hp = Math.max(0, c.hp - e.value);
    }
    e.turnsRemaining -= 1;
    return e.turnsRemaining > 0;
  });
  return { dotDamage };
}

// ── Turn Advancement ────────────────────────────────────────────────────────

export function advanceTurn(combat: CombatState): { nextId: string; newRound: boolean } {
  let nextIdx = combat.currentTurn + 1;
  let newRound = false;

  if (nextIdx >= combat.turnOrder.length) {
    nextIdx = 0;
    combat.round += 1;
    newRound = true;
    // RAM regen for player
    const player = getPlayer(combat);
    if (player && player.ram !== undefined && player.maxRam !== undefined) {
      player.ram = Math.min(player.maxRam, player.ram + 1);
    }
  }

  // Skip dead combatants
  let attempts = 0;
  while (attempts < combat.turnOrder.length) {
    const c = getCombatant(combat, combat.turnOrder[nextIdx]);
    if (c && c.hp > 0) break;
    nextIdx = (nextIdx + 1) % combat.turnOrder.length;
    if (nextIdx === 0) { combat.round += 1; newRound = true; }
    attempts++;
  }

  combat.currentTurn = nextIdx;
  const nextC = getCombatant(combat, combat.turnOrder[nextIdx]);
  if (nextC) {
    nextC.ap = 2;
    if (nextC.type === 'player') tickEffects(nextC);
  }

  return { nextId: combat.turnOrder[nextIdx], newRound };
}

// ── Combat End Check ────────────────────────────────────────────────────────

export type CombatEnd = { over: false } | { over: true; victory: boolean; xpGained: number; drops: string[] };

export function checkCombatEnd(combat: CombatState, enemies: RoomEnemy[]): CombatEnd {
  const player = getPlayer(combat);
  if (!player || player.hp <= 0) {
    return { over: true, victory: false, xpGained: 0, drops: [] };
  }

  const living = getLivingEnemies(combat);
  if (living.length === 0) {
    // Calculate XP and drops
    let xp = 0;
    const drops: string[] = [];
    for (const e of enemies) {
      xp += e.xpReward;
      for (const drop of e.drops) {
        if (Math.random() <= drop.chance) {
          drops.push(drop.itemId);
        }
      }
    }
    combat.active = false;
    return { over: true, victory: true, xpGained: xp, drops };
  }

  return { over: false };
}

// ── Sync combat HP back to character ────────────────────────────────────────

export function syncCombatToCharacter(combat: CombatState, character: MudCharacter): void {
  const player = getPlayer(combat);
  if (player) {
    character.hp = player.hp;
    character.ram = player.ram ?? character.ram;
  }
}

// ── Get current turn info ───────────────────────────────────────────────────

export function getCurrentTurnId(combat: CombatState): string {
  return combat.turnOrder[combat.currentTurn] ?? 'player';
}

export function isPlayersTurn(combat: CombatState): boolean {
  return getCurrentTurnId(combat) === 'player';
}

export function getFirstEnemy(combat: CombatState): Combatant | undefined {
  return getLivingEnemies(combat)[0];
}

export function getEnemyById(combat: CombatState, id: string): Combatant | undefined {
  return combat.combatants.find(c => c.id === id && c.type === 'enemy' && c.hp > 0);
}

export function getAllLivingEnemies(combat: CombatState): Combatant[] {
  return getLivingEnemies(combat);
}

export function getPlayerCombatant(combat: CombatState): Combatant | undefined {
  return getPlayer(combat);
}
