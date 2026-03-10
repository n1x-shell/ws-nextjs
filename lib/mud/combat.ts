// lib/mud/combat.ts
// TUNNELCORE MUD — Combat Engine (Clock-Based)
// Forged in the Dark × Cortex Prime hybrid system.
// Replaces d20 + HP with clock ticking and dice pools.

import type {
  MudCharacter, RoomEnemy, ClockCombatState, ClockCombatant,
  ClockCombatEnd, ClockChange, CombatLogEntry, EnemyBehavior,
  LootEntry, Item,
} from './types';
import type { DieSize, ActionType, ApproachType, RollResult, ActionOutcome, PoolDie } from './dicePool';
import {
  assemblePool, rollPool, resolveOutcome, assessAction,
  attributeToDie, rollDie, getOutcomeTier, getStyleDieSize, formatPoolCompact,
} from './dicePool';
import type { Clock, ClockTrigger } from './clockEngine';
import {
  createClock, createClockFull, tickClock, drainClock, resetClock,
  isClockFull, isClockEmpty, findClock, replaceClock, processTriggers,
  renderClockText, filterClocks, clockPercent, removeClock, addClock,
  PLAYER_HARM_CLOCK, PLAYER_CRITICAL_CLOCK, PLAYER_DOWNED_CLOCK,
  ARMOR_CLOCK, RAM_CLOCK, ENEMY_HARM_CLOCK, ENEMY_ARMOR_CLOCK,
  STATUS_CLOCK, calculateHarmSegments, enemyHarmForTier, armorSegmentsForTier,
} from './clockEngine';

// ── Quickhack Definitions ──────────────────────────────────────────────────

export interface QuickhackDef {
  id: string;
  name: string;
  ramDrain: number;
  description: string;
  techReq: number;
  statusClock?: { name: string; segments: number };
  hackDamage?: number;
  // Legacy compat fields
  ramCost?: number;
  damage?: number;
  damageType?: string;
  duration?: number;
  effectType?: string;
  effectValue?: number;
}

export const QUICKHACKS: QuickhackDef[] = [
  { id: 'short_circuit', name: 'Short Circuit', ramDrain: 2, ramCost: 2, description: '2 ticks on harm, ignores armor', techReq: 4, hackDamage: 2 },
  { id: 'overheat', name: 'Overheat', ramDrain: 3, ramCost: 3, description: 'BURNING 3-seg status clock', techReq: 5, statusClock: { name: 'BURNING', segments: 3 } },
  { id: 'weapon_glitch', name: 'Weapon Glitch', ramDrain: 2, ramCost: 2, description: 'JAMMED 2-seg status clock', techReq: 5, statusClock: { name: 'JAMMED', segments: 2 } },
  { id: 'reboot_optics', name: 'Reboot Optics', ramDrain: 3, ramCost: 3, description: 'BLINDED 2-seg status clock', techReq: 6, statusClock: { name: 'BLINDED', segments: 2 } },
  { id: 'synapse_burnout', name: 'Synapse Burnout', ramDrain: 5, ramCost: 5, description: '3 harm ticks + STUNNED 2-seg', techReq: 7, hackDamage: 3, statusClock: { name: 'STUNNED', segments: 2 } },
  { id: 'system_reset', name: 'System Reset', ramDrain: 4, ramCost: 4, description: 'DISABLED 3-seg status clock', techReq: 7, statusClock: { name: 'DISABLED', segments: 3 } },
];

export function getAvailableHacks(tech: number, combatStyle: string): QuickhackDef[] {
  if (combatStyle !== 'SYNAPSE' && tech < 6) return [];
  return QUICKHACKS.filter(h => tech >= h.techReq);
}

// ── Enemy Migration Helpers ────────────────────────────────────────────────

function getEnemyTier(enemy: RoomEnemy): number {
  if (enemy.tier) return enemy.tier;
  if (enemy.level <= 2) return 1;
  if (enemy.level <= 5) return 2;
  if (enemy.level <= 9) return 3;
  if (enemy.level <= 14) return 4;
  return 5;
}

function getEnemyAttackDice(enemy: RoomEnemy): DieSize[] {
  if (enemy.attackDice) return enemy.attackDice;
  const tier = getEnemyTier(enemy);
  switch (tier) {
    case 1: return [6];
    case 2: return [6, 6];
    case 3: return [8, 6];
    case 4: return [8, 8];
    case 5: return [10, 8, 6];
    default: return [6];
  }
}

function getEnemyHarmSegments(enemy: RoomEnemy): number {
  if (enemy.harmSegments) return enemy.harmSegments;
  return enemyHarmForTier(getEnemyTier(enemy));
}

function getEnemyArmorSegments(enemy: RoomEnemy): number {
  if (enemy.armorSegments !== undefined) return enemy.armorSegments;
  if (enemy.armorValue && enemy.armorValue > 0) return Math.min(4, Math.ceil(enemy.armorValue / 2));
  return 0;
}

function getEnemyBehavior(enemy: RoomEnemy): EnemyBehavior {
  if (typeof enemy.behavior === 'object') return enemy.behavior;
  switch (enemy.behavior) {
    case 'aggressive': return { type: 'aggressive', targetPriority: 'harm' };
    case 'territorial': return { type: 'defensive', targetPriority: 'harm' };
    case 'passive': return { type: 'defensive', targetPriority: 'danger' };
    case 'ambush': return { type: 'sniper', targetPriority: 'harm' };
    case 'patrol': return { type: 'defensive', targetPriority: 'harm' };
    default: return { type: 'aggressive', targetPriority: 'harm' };
  }
}

// ── Combat Initialization ──────────────────────────────────────────────────

export function initClockCombat(character: MudCharacter, enemies: RoomEnemy[], roomClocks?: Clock[]): ClockCombatState {
  const clocks: Clock[] = [];
  const combatants: ClockCombatant[] = [];
  const environmentClocks: string[] = [];

  // Player clocks
  const harmSegs = character.harmSegments || calculateHarmSegments(character.attributes.BODY, character.archetype);
  clocks.push(createClock({ ...PLAYER_HARM_CLOCK, segments: harmSegs }, 'player'));
  clocks.push(createClock({ ...PLAYER_CRITICAL_CLOCK, segments: character.criticalSegments || 4 }, 'player'));

  let armorClockId: string | null = null;
  const armorItem = character.gear?.armor;
  if (armorItem) {
    const armorSegs = character.armorSegments || armorSegmentsForTier(armorItem.tier);
    const ac = createClockFull(ARMOR_CLOCK(armorSegs), 'player');
    clocks.push(ac);
    armorClockId = ac.id;
  }

  let ramClockId: string | null = null;
  const ramSegs = character.ramSegments || character.attributes.TECH * 2;
  if (ramSegs > 0) {
    const rc = createClockFull(RAM_CLOCK(ramSegs), 'player');
    clocks.push(rc);
    ramClockId = rc.id;
  }

  // Enemy clocks
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const tier = getEnemyTier(e);
    const eid = `enemy_${e.id}_${i}`;

    const ehc = createClock(ENEMY_HARM_CLOCK(eid, e.name, getEnemyHarmSegments(e)), eid);
    clocks.push(ehc);

    let eArmorId: string | null = null;
    const eArmorSegs = getEnemyArmorSegments(e);
    if (eArmorSegs > 0) {
      const eac = createClockFull(ENEMY_ARMOR_CLOCK(eid, e.name, eArmorSegs), eid);
      clocks.push(eac);
      eArmorId = eac.id;
    }

    combatants.push({
      id: eid, name: e.name, tier,
      harmClockId: ehc.id, armorClockId: eArmorId,
      behavior: getEnemyBehavior(e),
      attackDice: getEnemyAttackDice(e),
      statusClocks: [], defeated: false,
      xpReward: e.xpReward, drops: e.drops,
    });
  }

  if (roomClocks) {
    for (const rc of roomClocks) {
      clocks.push(rc);
      environmentClocks.push(rc.id);
    }
  }

  return {
    active: true, round: 1, clocks, enemies: combatants,
    playerClocks: { harm: 'player_harm', critical: 'player_critical', armor: armorClockId, downed: null, ram: ramClockId },
    turnPhase: 'player_choose', approachChosen: false,
    log: [], sourceEnemies: enemies, environmentClocks, narrativeContext: '',
  };
}

// ── Player Action Step 1: Choose ───────────────────────────────────────────

export interface PlayerActionSetup {
  combat: ClockCombatState;
  context: import('./dicePool').ActionContext;
  pool: PoolDie[];
  error?: string;
}

export function setPlayerAction(combat: ClockCombatState, character: MudCharacter, action: ActionType, approach: ApproachType, targetId?: string): PlayerActionSetup {
  const living = combat.enemies.filter(e => !e.defeated);
  if ((action === 'attack' || action === 'hack') && living.length === 0) {
    return { combat, context: { position: 'risky', effect: 'standard', reason: '' }, pool: [], error: 'no enemies' };
  }

  if ((action === 'attack' || action === 'hack') && !targetId) targetId = living[0]?.id;

  if (targetId) {
    const match = living.find(e => e.id === targetId || e.name.toLowerCase().includes((targetId ?? '').toLowerCase()));
    if (match) targetId = match.id;
  }

  const maxTier = Math.max(1, ...living.map(e => e.tier));
  const context = assessAction(character, action, approach, combat.clocks, maxTier);
  const pool = assemblePool({ character, action, approach, combatClocks: combat.clocks, enemyTier: maxTier });

  return {
    combat: { ...combat, turnPhase: 'player_resolve', approachChosen: true, currentApproach: approach, currentAction: action, currentTargetId: targetId },
    context, pool,
  };
}

// ── Player Action Step 2: Resolve ──────────────────────────────────────────

export interface PlayerResolveResult {
  combat: ClockCombatState;
  result: RollResult;
  outcome: ActionOutcome;
  clockChanges: ClockChange[];
  triggered: ClockTrigger[];
  narrativePrompt: string;
}

export function resolvePlayerAction(combat: ClockCombatState, character: MudCharacter): PlayerResolveResult {
  const action = combat.currentAction ?? 'attack';
  const approach = combat.currentApproach ?? 'measured';
  const targetId = combat.currentTargetId;
  const maxTier = Math.max(1, ...combat.enemies.filter(e => !e.defeated).map(e => e.tier));

  const pool = assemblePool({ character, action, approach, combatClocks: combat.clocks, enemyTier: maxTier });
  const result = rollPool(pool);
  const context = assessAction(character, action, approach, combat.clocks, maxTier);
  const outcome = resolveOutcome(result, context.position, context.effect);

  const clockChanges: ClockChange[] = [];
  let clocks = [...combat.clocks];
  const triggered: ClockTrigger[] = [];
  const updatedEnemies = [...combat.enemies];
  const godMode = character.godMode ?? false;

  // Target ticks
  if (targetId && outcome.targetTicks > 0) {
    const enemy = updatedEnemies.find(e => e.id === targetId);
    if (enemy) {
      let remaining = outcome.targetTicks;
      if (enemy.armorClockId) {
        const ac = findClock(clocks, enemy.armorClockId);
        if (ac && !isClockFull(ac)) {
          const from = ac.filled;
          const r = tickClock(ac, remaining);
          clocks = clocks.map(c => c.id === ac.id ? r.clock : c);
          remaining = r.overflow;
          clockChanges.push({ clockId: ac.id, clockName: ac.name, from, to: r.clock.filled, segments: r.clock.segments, filled: r.filled });
        }
      }
      if (remaining > 0) {
        const hc = findClock(clocks, enemy.harmClockId);
        if (hc) {
          const from = hc.filled;
          const r = tickClock(hc, remaining);
          clocks = clocks.map(c => c.id === hc.id ? r.clock : c);
          clockChanges.push({ clockId: hc.id, clockName: hc.name, from, to: r.clock.filled, segments: r.clock.segments, filled: r.filled });
          if (r.filled) {
            enemy.defeated = true;
            const trig = processTriggers(r.clock, clocks);
            clocks = trig.updatedClocks;
            triggered.push(...trig.triggered);
          }
        }
      }
    }
  }

  // Danger ticks
  if (outcome.dangerTicks > 0 && !godMode) {
    const pc = { ...combat.playerClocks };
    applyPlayerHarm(pc, clocks, outcome.dangerTicks, clockChanges, triggered);
  }

  // Drain on strong/critical
  if (outcome.dangerTicks < 0) {
    const h = findClock(clocks, combat.playerClocks.harm);
    if (h && h.filled > 0) {
      const from = h.filled;
      const d = drainClock(h, Math.abs(outcome.dangerTicks));
      clocks = clocks.map(c => c.id === d.id ? d : c);
      clockChanges.push({ clockId: d.id, clockName: d.name, from, to: d.filled, segments: d.segments, filled: false });
    }
  }

  const target = combat.enemies.find(e => e.id === targetId);
  const logEntry: CombatLogEntry = {
    round: combat.round, actor: 'player', action: `${action} (${approach})`,
    clockChanges: clockChanges.map(cc => ({ clockId: cc.clockId, name: cc.clockName, from: cc.from, to: cc.to, segments: cc.segments })),
    rollResult: result,
  };

  const narrativePrompt = `action:${action} outcome:${outcome.tier} target:${target?.name ?? '?'} changes:${clockChanges.map(c => `${c.clockName}:${c.from}->${c.to}`).join(',')}`;

  return {
    combat: { ...combat, clocks, enemies: updatedEnemies, turnPhase: 'enemy_action', approachChosen: false, currentAction: undefined, currentApproach: undefined, currentTargetId: undefined, log: [...combat.log, logEntry], narrativeContext: narrativePrompt },
    result, outcome, clockChanges, triggered, narrativePrompt,
  };
}

// ── Apply player harm through armor → harm → critical → downed ─────────

function applyPlayerHarm(pc: ClockCombatState['playerClocks'], clocks: Clock[], ticks: number, changes: ClockChange[], triggered: ClockTrigger[]): void {
  let remaining = ticks;

  // Armor absorbs (armor fills UP = consumed)
  if (pc.armor) {
    const a = findClock(clocks, pc.armor);
    if (a && a.filled < a.segments) {
      const from = a.filled;
      const r = tickClock(a, remaining);
      const idx = clocks.findIndex(c => c.id === a.id);
      if (idx !== -1) clocks[idx] = r.clock;
      remaining = r.overflow;
      changes.push({ clockId: a.id, clockName: a.name, from, to: r.clock.filled, segments: r.clock.segments, filled: r.filled });
    }
  }

  if (remaining > 0) {
    const h = findClock(clocks, pc.harm);
    if (h) {
      const from = h.filled;
      const r = tickClock(h, remaining);
      const idx = clocks.findIndex(c => c.id === h.id);
      if (idx !== -1) clocks[idx] = r.clock;
      remaining = r.overflow;
      changes.push({ clockId: h.id, clockName: h.name, from, to: r.clock.filled, segments: r.clock.segments, filled: r.filled });
      if (r.filled) {
        const trig = processTriggers(r.clock, clocks);
        for (let i = 0; i < clocks.length; i++) {
          const u = trig.updatedClocks.find(c => c.id === clocks[i].id);
          if (u) clocks[i] = u;
        }
        triggered.push(...trig.triggered);
      }
    }
  }

  const crit = findClock(clocks, pc.critical);
  if (crit && isClockFull(crit) && !pc.downed) {
    const dc = createClock(PLAYER_DOWNED_CLOCK, 'player');
    clocks.push(dc);
    pc.downed = dc.id;
  }
}

// ── Enemy Actions ──────────────────────────────────────────────────────────

export interface EnemyActionResult {
  enemyId: string;
  enemyName: string;
  action: string;
  clockChanges: ClockChange[];
  rollTotal: number;
  hitPlayer: boolean;
}

export function processEnemyActions(combat: ClockCombatState, godMode?: boolean): { combat: ClockCombatState; actions: EnemyActionResult[]; clockChanges: ClockChange[]; narrativePrompt: string } {
  let clocks = [...combat.clocks];
  const allChanges: ClockChange[] = [];
  const actions: EnemyActionResult[] = [];
  const pc = { ...combat.playerClocks };

  for (const enemy of combat.enemies) {
    if (enemy.defeated) continue;

    const isStunned = enemy.statusClocks.some(id => {
      const sc = findClock(clocks, id);
      return sc && sc.name.includes('STUNNED') && !isClockFull(sc);
    });

    if (isStunned) {
      const stunId = enemy.statusClocks.find(id => { const sc = findClock(clocks, id); return sc && sc.name.includes('STUNNED'); });
      if (stunId) { const sc = findClock(clocks, stunId); if (sc) { const r = tickClock(sc, 1); clocks = clocks.map(c => c.id === sc.id ? r.clock : c); } }
      actions.push({ enemyId: enemy.id, enemyName: enemy.name, action: 'stunned', clockChanges: [], rollTotal: 0, hitPlayer: false });
      continue;
    }

    const dice: PoolDie[] = enemy.attackDice.map(size => ({ label: enemy.name, size, source: 'attribute' as const }));
    if (enemy.behavior.type === 'swarm') {
      const same = combat.enemies.filter(e => !e.defeated && e.name === enemy.name && e.id !== enemy.id);
      for (const _ of same) dice.push({ label: 'Swarm', size: 6, source: 'skill' });
    }

    const result = rollPool(dice);
    let ticks = 0;
    if (result.total >= 15) ticks = 3;
    else if (result.total >= 10) ticks = 2;
    else if (result.total >= 5) ticks = 1;
    if (enemy.behavior.type === 'sniper') ticks += 1;

    const enemyChanges: ClockChange[] = [];
    if (ticks > 0 && !godMode) applyPlayerHarm(pc, clocks, ticks, enemyChanges, []);

    allChanges.push(...enemyChanges);
    actions.push({ enemyId: enemy.id, enemyName: enemy.name, action: ticks > 0 ? 'attack' : 'miss', clockChanges: enemyChanges, rollTotal: result.total, hitPlayer: ticks > 0 && !godMode });

    // Tick status clocks on this enemy
    for (const scId of [...enemy.statusClocks]) {
      const sc = findClock(clocks, scId);
      if (!sc || isClockFull(sc)) continue;
      if (sc.name === 'BURNING') {
        const hc = findClock(clocks, enemy.harmClockId);
        if (hc && !isClockFull(hc)) { const from = hc.filled; const r = tickClock(hc, 1); clocks = clocks.map(c => c.id === hc.id ? r.clock : c); allChanges.push({ clockId: hc.id, clockName: `${enemy.name} HARM`, from, to: r.clock.filled, segments: r.clock.segments, filled: r.filled }); if (r.filled) enemy.defeated = true; }
      }
      const sr = tickClock(sc, 1);
      clocks = clocks.map(c => c.id === sc.id ? sr.clock : c);
      if (sr.filled) enemy.statusClocks = enemy.statusClocks.filter(id => id !== scId);
    }
  }

  const logEntry: CombatLogEntry = { round: combat.round, actor: 'enemies', action: actions.map(a => `${a.enemyName}:${a.action}`).join(';'), clockChanges: allChanges.map(cc => ({ clockId: cc.clockId, name: cc.clockName, from: cc.from, to: cc.to, segments: cc.segments })) };
  const narrativePrompt = actions.filter(a => a.hitPlayer).map(a => `${a.enemyName} hits`).join('. ');

  return { combat: { ...combat, clocks, playerClocks: pc, turnPhase: 'environment_tick', log: [...combat.log, logEntry] }, actions, clockChanges: allChanges, narrativePrompt };
}

// ── Environment Tick ───────────────────────────────────────────────────────

export function tickEnvironment(combat: ClockCombatState): { combat: ClockCombatState; clockChanges: ClockChange[] } {
  let clocks = [...combat.clocks];
  const changes: ClockChange[] = [];

  for (const envId of combat.environmentClocks) {
    const c = findClock(clocks, envId);
    if (!c || isClockFull(c)) continue;
    const from = c.filled;
    const r = tickClock(c, 1);
    clocks = clocks.map(x => x.id === c.id ? r.clock : x);
    changes.push({ clockId: c.id, clockName: c.name, from, to: r.clock.filled, segments: r.clock.segments, filled: r.filled });
  }

  if (combat.playerClocks.downed) {
    const d = findClock(clocks, combat.playerClocks.downed);
    if (d && !isClockFull(d)) { const from = d.filled; const r = tickClock(d, 1); clocks = clocks.map(c => c.id === d.id ? r.clock : c); changes.push({ clockId: d.id, clockName: d.name, from, to: r.clock.filled, segments: r.clock.segments, filled: r.filled }); }
  }

  // RAM regen
  if (combat.playerClocks.ram) {
    const ram = findClock(clocks, combat.playerClocks.ram);
    if (ram && ram.filled > 0) { const d = drainClock(ram, 1); clocks = clocks.map(c => c.id === ram.id ? d : c); }
  }

  return { combat: { ...combat, clocks, turnPhase: 'end_check', round: combat.round + 1 }, clockChanges: changes };
}

// ── Combat End Check ───────────────────────────────────────────────────────

export function checkClockCombatEnd(combat: ClockCombatState): ClockCombatEnd {
  if (combat.playerClocks.downed) {
    const d = findClock(combat.clocks, combat.playerClocks.downed);
    if (d && isClockFull(d)) return { over: true, victory: false, xpGained: 0, drops: [], survivingClocks: [] };
  }

  if (combat.enemies.every(e => e.defeated)) {
    let xp = 0;
    const drops: string[] = [];
    for (const e of combat.enemies) {
      xp += e.xpReward;
      for (const drop of e.drops) { if (Math.random() <= drop.chance) drops.push(drop.itemId); }
    }
    return { over: true, victory: true, xpGained: xp, drops, survivingClocks: combat.clocks.filter(c => c.persistent) };
  }

  return { over: false };
}

// ── Flee ───────────────────────────────────────────────────────────────────

export interface FleeResult { pool: PoolDie[]; result: RollResult; escaped: boolean; harmTicks: number; clockChanges: ClockChange[]; flavorText: string; }

export function attemptFleeAction(combat: ClockCombatState, character: MudCharacter): { combat: ClockCombatState; flee: FleeResult } {
  const maxTier = Math.max(1, ...combat.enemies.filter(e => !e.defeated).map(e => e.tier));
  const pool = assemblePool({ character, action: 'flee', approach: 'measured', combatClocks: combat.clocks, enemyTier: maxTier });
  const result = rollPool(pool);
  const tier = getOutcomeTier(result.total);

  let escaped = false; let harmTicks = 0; let flavorText = '';
  if (tier === 'success' || tier === 'strong' || tier === 'critical') { escaped = true; flavorText = 'you break away — footsteps echoing behind you as the distance grows.'; }
  else if (tier === 'partial') { escaped = true; harmTicks = 1; flavorText = 'you slip out — but not before taking a parting blow.'; }
  else { escaped = false; harmTicks = 2; flavorText = 'they cut off your escape. you\'re still in this.'; }

  let clocks = [...combat.clocks];
  const pc = { ...combat.playerClocks };
  const changes: ClockChange[] = [];
  if (harmTicks > 0 && !character.godMode) applyPlayerHarm(pc, clocks, harmTicks, changes, []);

  return {
    combat: { ...combat, clocks, playerClocks: pc, active: !escaped, turnPhase: escaped ? 'end_check' : 'enemy_action' },
    flee: { pool, result, escaped, harmTicks, clockChanges: changes, flavorText },
  };
}

// ── Quickhack ──────────────────────────────────────────────────────────────

export interface HackResult { combat: ClockCombatState; result: RollResult; outcome: ActionOutcome; clockChanges: ClockChange[]; hackApplied: boolean; ramDrained: number; statusCreated?: string; error?: string; }

export function resolveQuickhack(combat: ClockCombatState, character: MudCharacter, hackId: string, targetId: string): HackResult {
  const hack = QUICKHACKS.find(h => h.id === hackId || h.name.toLowerCase().replace(/\s+/g, '_') === hackId);
  const emptyResult: RollResult = { pool: [], effectDie: 0, secondDie: 0, total: 0, complications: [], heroicOpportunity: false, botch: true };
  if (!hack) return { combat, result: emptyResult, outcome: { tier: 'failure', targetTicks: 0, dangerTicks: 0, description: 'unknown hack' }, clockChanges: [], hackApplied: false, ramDrained: 0, error: 'unknown hack' };

  const ramClock = combat.playerClocks.ram ? findClock(combat.clocks, combat.playerClocks.ram) : null;
  const availRam = ramClock ? (ramClock.segments - ramClock.filled) : 0;
  if (availRam < hack.ramDrain) return { combat, result: emptyResult, outcome: { tier: 'failure', targetTicks: 0, dangerTicks: 0, description: 'not enough RAM' }, clockChanges: [], hackApplied: false, ramDrained: 0, error: `need ${hack.ramDrain} RAM, have ${availRam}` };

  let clocks = [...combat.clocks];
  if (ramClock) { const r = tickClock(ramClock, hack.ramDrain); clocks = clocks.map(c => c.id === ramClock.id ? r.clock : c); }

  const maxTier = Math.max(1, ...combat.enemies.filter(e => !e.defeated).map(e => e.tier));
  const pool = assemblePool({ character, action: 'hack', approach: combat.currentApproach ?? 'measured', combatClocks: clocks, enemyTier: maxTier });
  const result = rollPool(pool);
  const ctx = assessAction(character, 'hack', combat.currentApproach ?? 'measured', clocks, maxTier);
  const outcome = resolveOutcome(result, ctx.position, ctx.effect);

  const changes: ClockChange[] = [];
  const enemies = [...combat.enemies];
  let statusCreated: string | undefined;

  const target = enemies.find(e => e.id === targetId);
  if (target) {
    const totalTicks = (hack.hackDamage ?? 0) + outcome.targetTicks;
    if (totalTicks > 0) {
      const hc = findClock(clocks, target.harmClockId);
      if (hc) { const from = hc.filled; const r = tickClock(hc, totalTicks); clocks = clocks.map(c => c.id === hc.id ? r.clock : c); changes.push({ clockId: hc.id, clockName: hc.name, from, to: r.clock.filled, segments: r.clock.segments, filled: r.filled }); if (r.filled) target.defeated = true; }
    }
    if (hack.statusClock && outcome.tier !== 'failure') {
      const sc = createClock(STATUS_CLOCK(`status_${hack.id}_${targetId}`, hack.statusClock.name, hack.statusClock.segments), targetId);
      clocks.push(sc);
      target.statusClocks.push(sc.id);
      statusCreated = hack.statusClock.name;
    }
  }

  if (outcome.dangerTicks > 0 && !character.godMode) { const pc = { ...combat.playerClocks }; applyPlayerHarm(pc, clocks, outcome.dangerTicks, changes, []); }

  return { combat: { ...combat, clocks, enemies, turnPhase: 'enemy_action', log: [...combat.log, { round: combat.round, actor: 'player', action: `hack:${hack.name}`, clockChanges: changes.map(c => ({ clockId: c.clockId, name: c.clockName, from: c.from, to: c.to, segments: c.segments })), rollResult: result }] }, result, outcome, clockChanges: changes, hackApplied: true, ramDrained: hack.ramDrain, statusCreated };
}

// ── Scan ───────────────────────────────────────────────────────────────────

export interface ScanResult { success: boolean; revealedClocks: Clock[]; weaknesses: string[]; behaviorHint: string; rollResult: RollResult; error?: string; }

export function scanEnemy(combat: ClockCombatState, character: MudCharacter, targetId: string): ScanResult {
  const maxTier = Math.max(1, ...combat.enemies.filter(e => !e.defeated).map(e => e.tier));
  const pool = assemblePool({ character, action: 'scan', approach: 'measured', combatClocks: combat.clocks, enemyTier: maxTier });
  const result = rollPool(pool);
  const tier = getOutcomeTier(result.total);
  const target = combat.enemies.find(e => e.id === targetId);
  if (!target) return { success: false, revealedClocks: [], weaknesses: [], behaviorHint: '???', rollResult: result };

  if (tier === 'failure') return { success: false, revealedClocks: [], weaknesses: ['scan failed'], behaviorHint: '???', rollResult: result };

  const revealed: Clock[] = [];
  const hc = findClock(combat.clocks, target.harmClockId);
  if (hc) revealed.push(hc);
  if (tier !== 'partial' && target.armorClockId) { const ac = findClock(combat.clocks, target.armorClockId); if (ac) revealed.push(ac); }
  if (tier === 'strong' || tier === 'critical') { for (const id of target.statusClocks) { const sc = findClock(combat.clocks, id); if (sc) revealed.push(sc); } }

  const weaknesses: string[] = [];
  if (target.behavior.type === 'swarm') weaknesses.push('vulnerable to area attacks');
  if (target.tier <= 2) weaknesses.push('low threat');
  if (target.tier >= 4) weaknesses.push('heavily augmented');

  return { success: true, revealedClocks: revealed, weaknesses, behaviorHint: `${target.behavior.type} / ${target.behavior.targetPriority}`, rollResult: result };
}

// ── Use Item ───────────────────────────────────────────────────────────────

export function useItemInCombat(combat: ClockCombatState, character: MudCharacter, item: Item): { combat: ClockCombatState; clockChanges: ClockChange[]; success: boolean; message: string } {
  const changes: ClockChange[] = [];
  let clocks = [...combat.clocks];
  const drain = item.harmDrain ?? (item.healAmount ? Math.max(1, Math.ceil(item.healAmount / 10)) : 0);

  if (drain > 0) {
    const h = findClock(clocks, combat.playerClocks.harm);
    if (h && h.filled > 0) { const from = h.filled; const d = drainClock(h, drain); clocks = clocks.map(c => c.id === h.id ? d : c); changes.push({ clockId: h.id, clockName: h.name, from, to: d.filled, segments: d.segments, filled: false }); }
  }
  if (item.criticalDrain) {
    const cr = findClock(clocks, combat.playerClocks.critical);
    if (cr && cr.filled > 0) { const from = cr.filled; const d = drainClock(cr, item.criticalDrain); clocks = clocks.map(c => c.id === cr.id ? d : c); changes.push({ clockId: cr.id, clockName: cr.name, from, to: d.filled, segments: d.segments, filled: false }); }
  }
  if (item.armorRestore && combat.playerClocks.armor) {
    const a = findClock(clocks, combat.playerClocks.armor);
    if (a && a.filled > 0) { const from = a.filled; const d = drainClock(a, item.armorRestore); clocks = clocks.map(c => c.id === a.id ? d : c); changes.push({ clockId: a.id, clockName: a.name, from, to: d.filled, segments: d.segments, filled: false }); }
  }

  return { combat: { ...combat, clocks }, clockChanges: changes, success: changes.length > 0, message: changes.length > 0 ? changes.map(c => `${c.clockName}: ${c.from}→${c.to}`).join(', ') : 'no effect' };
}

// ── Sync to character ──────────────────────────────────────────────────────

export function syncClockCombatToCharacter(combat: ClockCombatState, character: MudCharacter): void {
  const h = findClock(combat.clocks, combat.playerClocks.harm);
  const cr = findClock(combat.clocks, combat.playerClocks.critical);
  if (h) { const pct = 1 - (h.filled / h.segments); const cPen = cr ? (cr.filled / cr.segments) * 0.3 : 0; character.hp = Math.max(0, Math.round(character.maxHp * (pct - cPen))); }
  const ram = combat.playerClocks.ram ? findClock(combat.clocks, combat.playerClocks.ram) : null;
  if (ram) character.ram = ram.segments - ram.filled;
}

// ── Convenience / Compat ───────────────────────────────────────────────────

export function isPlayersTurn(combat: ClockCombatState): boolean { return combat.turnPhase === 'player_choose' || combat.turnPhase === 'player_resolve'; }
export function getAllLivingEnemies(combat: ClockCombatState): ClockCombatant[] { return combat.enemies.filter(e => !e.defeated); }
export function getEnemyById(combat: ClockCombatState, id: string): ClockCombatant | undefined { return combat.enemies.find(e => e.id === id && !e.defeated); }
export function getFirstEnemy(combat: ClockCombatState): ClockCombatant | undefined { return combat.enemies.find(e => !e.defeated); }
export function getCurrentTurnId(combat: ClockCombatState): string { return isPlayersTurn(combat) ? 'player' : 'enemy'; }
export function hpBar(hp: number, max: number, width = 20): string { const f = Math.max(0, Math.round((hp / max) * width)); return '█'.repeat(f) + '░'.repeat(width - f); }

export function getPlayerHarmClock(combat: ClockCombatState): Clock | undefined { return findClock(combat.clocks, combat.playerClocks.harm); }
export function getPlayerArmorClock(combat: ClockCombatState): Clock | undefined { return combat.playerClocks.armor ? findClock(combat.clocks, combat.playerClocks.armor) : undefined; }
export function getPlayerRamClock(combat: ClockCombatState): Clock | undefined { return combat.playerClocks.ram ? findClock(combat.clocks, combat.playerClocks.ram) : undefined; }
export function getEnemyClocks(combat: ClockCombatState, enemyId: string): { harm?: Clock; armor?: Clock; status: Clock[] } {
  const enemy = combat.enemies.find(e => e.id === enemyId);
  if (!enemy) return { status: [] };
  return {
    harm: findClock(combat.clocks, enemy.harmClockId),
    armor: enemy.armorClockId ? findClock(combat.clocks, enemy.armorClockId) : undefined,
    status: enemy.statusClocks.map(id => findClock(combat.clocks, id)).filter(Boolean) as Clock[],
  };
}
export function getPlayerCombatant(combat: ClockCombatState): { hp: number; maxHp: number; ap: number; ram: number; maxRam: number } {
  const h = findClock(combat.clocks, combat.playerClocks.harm);
  const ram = combat.playerClocks.ram ? findClock(combat.clocks, combat.playerClocks.ram) : null;
  const pct = h ? (1 - h.filled / h.segments) : 1;
  return { hp: Math.round(pct * 100), maxHp: 100, ap: isPlayersTurn(combat) ? 2 : 0, ram: ram ? (ram.segments - ram.filled) : 0, maxRam: ram ? ram.segments : 0 };
}
export function advanceTurn(combat: ClockCombatState): { nextId: string; newRound: boolean } { return { nextId: 'player', newRound: false }; }

// Legacy shim
export function initCombat(character: MudCharacter, enemies: RoomEnemy[]): ClockCombatState { return initClockCombat(character, enemies); }
export function resolvePlayerAttack(combat: ClockCombatState, targetId: string, character: MudCharacter): { error: string } | { hit: boolean; crit: boolean; damage: number; roll: number; attackTotal: number; defenseTotal: number; flavorHit: string; flavorMiss: string; targetId: string; targetName: string; killed: boolean } {
  const setup = setPlayerAction(combat, character, 'attack', 'measured', targetId);
  if (setup.error) return { error: setup.error };
  const res = resolvePlayerAction(setup.combat, character);
  const target = combat.enemies.find(e => e.id === targetId);
  const hit = res.outcome.tier !== 'failure';
  return { hit, crit: res.outcome.tier === 'critical', damage: res.outcome.targetTicks, roll: res.result.effectDie, attackTotal: res.result.total, defenseTotal: 0, flavorHit: '', flavorMiss: '', targetId: targetId, targetName: target?.name ?? '?', killed: target?.defeated ?? false };
}
export function attemptFlee(combat: ClockCombatState, character: MudCharacter, godMode?: boolean): { success: boolean; damageTaken?: number; flavorText: string } | { error: string } {
  const { flee } = attemptFleeAction(combat, character);
  return { success: flee.escaped, damageTaken: flee.harmTicks, flavorText: flee.flavorText };
}
export function processEnemyTurn(combat: ClockCombatState, enemyId: string, godMode?: boolean): { attackerId: string; attackerName: string; action: string; hit?: boolean; damage?: number; crit?: boolean; flavorText: string } {
  const enemy = combat.enemies.find(e => e.id === enemyId);
  if (!enemy) return { attackerId: enemyId, attackerName: '?', action: 'nothing', flavorText: '' };
  return { attackerId: enemyId, attackerName: enemy.name, action: 'attack', hit: true, damage: 1, flavorText: `${enemy.name} attacks` };
}
export function checkCombatEnd(combat: ClockCombatState, _?: RoomEnemy[]): { over: false } | { over: true; victory: boolean; xpGained: number; drops: string[] } {
  const r = checkClockCombatEnd(combat);
  if (!r.over) return { over: false };
  return { over: true, victory: r.victory, xpGained: r.xpGained, drops: r.drops };
}
export function syncCombatToCharacter(combat: ClockCombatState, character: MudCharacter): void { syncClockCombatToCharacter(combat, character); }
export type AttackResult = ReturnType<typeof resolvePlayerAttack> & { hit?: boolean };
