// lib/mud/clockEngine.ts
// TUNNELCORE MUD — Clock Engine (Forged in the Dark)
// Pure functions. Zero UI. Zero side effects.
// Clocks are the mechanical spine of the resolution system.

// ── Clock Data Structures ──────────────────────────────────────────────────

export type ClockCategory =
  | 'harm'           // player/enemy damage clocks
  | 'armor'          // damage absorption clocks
  | 'progress'       // quest/objective advancement
  | 'danger'         // reinforcements, alarms, collapse
  | 'environment'    // toxic, fire, radiation, mesh exposure
  | 'heat'           // faction attention / wanted level
  | 'countdown'      // time pressure (X rounds until event)
  | 'boss_phase'     // boss behavior transitions
  | 'status'         // bleed, stun, burning, jammed
  | 'ram';           // SYNAPSE resource clock (drains on use, regens)

export interface LinkedClock {
  targetClockId: string;
  ticksOnFill: number;
  ticksOnTick?: number;
  condition?: string;
}

export interface ClockTrigger {
  type: 'cascade'
    | 'spawn_clock'
    | 'end_combat'
    | 'phase_shift'
    | 'narrative_event'
    | 'damage_cascade'
    | 'faction_entanglement'
    | 'environmental_effect'
    | 'flee_forced'
    | 'permadeath';
  payload?: Record<string, unknown>;
}

export interface Clock {
  id: string;
  name: string;
  segments: number;
  filled: number;
  category: ClockCategory;
  color?: string;
  visible: boolean;
  persistent: boolean;
  linkedClocks?: LinkedClock[];
  onFill?: ClockTrigger;
  decayRate?: number;
  owner?: string;
}

// ── Clock Templates ────────────────────────────────────────────────────────

export interface ClockTemplate {
  id: string;
  name: string;
  segments: number;
  category: ClockCategory;
  color?: string;
  visible: boolean;
  persistent: boolean;
  decayRate?: number;
  linkedClocks?: LinkedClock[];
  onFill?: ClockTrigger;
}

// ── Standard Templates ─────────────────────────────────────────────────────

export const PLAYER_HARM_CLOCK: ClockTemplate = {
  id: 'player_harm',
  name: 'HARM',
  segments: 6,
  category: 'harm',
  color: '#ff4444',
  visible: true,
  persistent: false,
  linkedClocks: [{ targetClockId: 'player_critical', ticksOnFill: 1 }],
  onFill: { type: 'damage_cascade' },
};

export const PLAYER_CRITICAL_CLOCK: ClockTemplate = {
  id: 'player_critical',
  name: 'CRITICAL',
  segments: 4,
  category: 'harm',
  color: '#ff2222',
  visible: true,
  persistent: false,
  linkedClocks: [{ targetClockId: 'player_downed', ticksOnFill: 1 }],
  onFill: { type: 'damage_cascade', payload: { state: 'downed' } },
};

export const PLAYER_DOWNED_CLOCK: ClockTemplate = {
  id: 'player_downed',
  name: 'BLEEDOUT',
  segments: 3,
  category: 'harm',
  color: '#cc0000',
  visible: true,
  persistent: false,
  onFill: { type: 'permadeath' },
};

export function ARMOR_CLOCK(segments: number): ClockTemplate {
  return {
    id: 'player_armor',
    name: 'ARMOR',
    segments,
    category: 'armor',
    color: '#6699ff',
    visible: true,
    persistent: false,
  };
}

export function RAM_CLOCK(segments: number): ClockTemplate {
  return {
    id: 'player_ram',
    name: 'RAM',
    segments,
    category: 'ram',
    color: '#00ccff',
    visible: true,
    persistent: false,
  };
}

export function ENEMY_HARM_CLOCK(enemyId: string, name: string, segments: number): ClockTemplate {
  return {
    id: `harm_${enemyId}`,
    name: `${name} HARM`,
    segments,
    category: 'harm',
    color: '#ff6644',
    visible: true,
    persistent: false,
    onFill: { type: 'end_combat', payload: { enemyId } },
  };
}

export function ENEMY_ARMOR_CLOCK(enemyId: string, name: string, segments: number): ClockTemplate {
  return {
    id: `armor_${enemyId}`,
    name: `${name} ARMOR`,
    segments,
    category: 'armor',
    color: '#6699ff',
    visible: true,
    persistent: false,
  };
}

export const REINFORCEMENT_CLOCK: ClockTemplate = {
  id: 'reinforcements',
  name: 'REINFORCEMENTS',
  segments: 6,
  category: 'danger',
  color: '#ffaa00',
  visible: true,
  persistent: false,
  onFill: { type: 'narrative_event', payload: { effect: 'reinforcements_arrive' } },
};

export const ALARM_CLOCK: ClockTemplate = {
  id: 'alarm',
  name: 'ALARM',
  segments: 4,
  category: 'danger',
  color: '#ff8800',
  visible: true,
  persistent: false,
  onFill: { type: 'narrative_event', payload: { effect: 'alert_state' } },
};

export function ENVIRONMENTAL_CLOCK(type: string, segments: number): ClockTemplate {
  return {
    id: `env_${type}`,
    name: type.toUpperCase(),
    segments,
    category: 'environment',
    color: '#aaff00',
    visible: true,
    persistent: true,
    onFill: { type: 'environmental_effect', payload: { envType: type } },
  };
}

export function HEAT_CLOCK(factionId: string): ClockTemplate {
  return {
    id: `heat_${factionId}`,
    name: `${factionId.replace(/_/g, ' ')} HEAT`,
    segments: 8,
    category: 'heat',
    color: '#ff6600',
    visible: true,
    persistent: true,
    decayRate: 1,
    onFill: { type: 'faction_entanglement', payload: { factionId } },
  };
}

export function STATUS_CLOCK(id: string, name: string, segments: number): ClockTemplate {
  return {
    id,
    name: name.toUpperCase(),
    segments,
    category: 'status',
    color: '#ffcc00',
    visible: true,
    persistent: false,
    onFill: { type: 'narrative_event', payload: { effect: id } },
  };
}

// ── Clock Operations (Pure Functions) ──────────────────────────────────────

/** Create a clock instance from a template. */
export function createClock(template: ClockTemplate, owner?: string): Clock {
  return {
    id: template.id,
    name: template.name,
    segments: template.segments,
    filled: 0,
    category: template.category,
    color: template.color,
    visible: template.visible,
    persistent: template.persistent,
    linkedClocks: template.linkedClocks ? [...template.linkedClocks] : undefined,
    onFill: template.onFill,
    decayRate: template.decayRate,
    owner: owner ?? undefined,
  };
}

/** Create a clock that starts full (e.g. armor, RAM — they drain). */
export function createClockFull(template: ClockTemplate, owner?: string): Clock {
  const clock = createClock(template, owner);
  clock.filled = clock.segments;
  return clock;
}

/** Tick a clock by N segments. Returns overflow (segments beyond max). */
export function tickClock(clock: Clock, ticks: number): { clock: Clock; overflow: number; filled: boolean } {
  const prev = clock.filled;
  const newFilled = Math.min(clock.segments, clock.filled + ticks);
  const overflow = Math.max(0, (clock.filled + ticks) - clock.segments);
  const updated: Clock = { ...clock, filled: newFilled };
  return {
    clock: updated,
    overflow,
    filled: newFilled >= clock.segments && prev < clock.segments,
  };
}

/** Drain a clock by N segments (healing, repair, decay). Minimum 0. */
export function drainClock(clock: Clock, ticks: number): Clock {
  return { ...clock, filled: Math.max(0, clock.filled - ticks) };
}

/** Reset a clock to 0 filled. */
export function resetClock(clock: Clock): Clock {
  return { ...clock, filled: 0 };
}

/** Check if a clock is full. */
export function isClockFull(clock: Clock): boolean {
  return clock.filled >= clock.segments;
}

/** Check if a clock is empty. */
export function isClockEmpty(clock: Clock): boolean {
  return clock.filled <= 0;
}

/** Get the fill percentage of a clock. */
export function clockPercent(clock: Clock): number {
  return clock.segments > 0 ? (clock.filled / clock.segments) * 100 : 0;
}

/** Process all linked clocks when a clock fills. Returns updated clock array and fired triggers. */
export function processTriggers(
  filledClock: Clock,
  allClocks: Clock[],
): { updatedClocks: Clock[]; triggered: ClockTrigger[] } {
  const triggered: ClockTrigger[] = [];
  let clocks = [...allClocks];

  // Fire the onFill trigger of the filled clock
  if (filledClock.onFill) {
    triggered.push(filledClock.onFill);
  }

  // Process linked clocks
  if (filledClock.linkedClocks) {
    for (const link of filledClock.linkedClocks) {
      const idx = clocks.findIndex(c => c.id === link.targetClockId);
      if (idx === -1) continue;

      const result = tickClock(clocks[idx], link.ticksOnFill);
      clocks[idx] = result.clock;

      // If the linked clock also filled, recursively process its triggers
      if (result.filled) {
        const sub = processTriggers(result.clock, clocks);
        clocks = sub.updatedClocks;
        triggered.push(...sub.triggered);
      }
    }
  }

  return { updatedClocks: clocks, triggered };
}

/** Get a visual representation of a clock for terminal display. */
export function renderClockText(clock: Clock): string {
  const filled = '█'.repeat(clock.filled);
  const empty = '░'.repeat(Math.max(0, clock.segments - clock.filled));
  const suffix = isClockFull(clock) ? ' FULL' : '';
  return `${clock.name} ${filled}${empty} [${clock.filled}/${clock.segments}]${suffix}`;
}

/** Compact render for HUD bar (no name). */
export function renderClockBar(clock: Clock): string {
  const filled = '█'.repeat(clock.filled);
  const empty = '░'.repeat(Math.max(0, clock.segments - clock.filled));
  return `${filled}${empty}`;
}

/** Get all clocks matching a category or owner. */
export function filterClocks(
  clocks: Clock[],
  filter: { category?: ClockCategory; owner?: string; visible?: boolean },
): Clock[] {
  return clocks.filter(c => {
    if (filter.category && c.category !== filter.category) return false;
    if (filter.owner && c.owner !== filter.owner) return false;
    if (filter.visible !== undefined && c.visible !== filter.visible) return false;
    return true;
  });
}

/** Find a clock by ID. */
export function findClock(clocks: Clock[], id: string): Clock | undefined {
  return clocks.find(c => c.id === id);
}

/** Replace a clock by ID in an array. */
export function replaceClock(clocks: Clock[], updated: Clock): Clock[] {
  return clocks.map(c => c.id === updated.id ? updated : c);
}

/** Add a clock to an array (no duplicates). */
export function addClock(clocks: Clock[], clock: Clock): Clock[] {
  if (clocks.some(c => c.id === clock.id)) return clocks;
  return [...clocks, clock];
}

/** Remove a clock by ID. */
export function removeClock(clocks: Clock[], id: string): Clock[] {
  return clocks.filter(c => c.id !== id);
}

/** Get all persistent clocks (survive combat end). */
export function getPersistentClocks(clocks: Clock[]): Clock[] {
  return clocks.filter(c => c.persistent);
}

/** Decay all clocks that have a decay rate (for rest / downtime). */
export function decayClocks(clocks: Clock[]): Clock[] {
  return clocks.map(c => {
    if (c.decayRate && c.decayRate > 0 && c.filled > 0) {
      return drainClock(c, c.decayRate);
    }
    return c;
  });
}

// ── Armor Segment Mapping ──────────────────────────────────────────────────

import type { ItemTier } from './types';

export function armorSegmentsForTier(tier: ItemTier): number {
  switch (tier) {
    case 'SCRAP': return 2;
    case 'COMMON': return 3;
    case 'MIL_SPEC': return 4;
    case 'HELIXION': return 5;
    case 'PROTOTYPE': return 6;
    default: return 0;
  }
}

// ── Harm Segment Calculation ───────────────────────────────────────────────

import type { Archetype } from './types';

export function calculateHarmSegments(body: number, archetype: Archetype): number {
  const base = 4 + Math.floor(body / 3);
  const bonus = archetype === 'DISCONNECTED' ? 2 : archetype === 'SOVEREIGN' ? 1 : 0;
  return base + bonus;
}

export function calculateCriticalSegments(): number {
  return 4;
}

export function calculateDownedSegments(): number {
  return 3;
}

// ── Enemy Tier → Harm Segments ─────────────────────────────────────────────

export function enemyHarmForTier(tier: number): number {
  switch (tier) {
    case 1: return 3;
    case 2: return 4;
    case 3: return 5;
    case 4: return 6;
    case 5: return 8;
    default: return 4;
  }
}
