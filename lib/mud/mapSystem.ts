// lib/mud/mapSystem.ts
// TUNNELCORE MUD — Map System
// Wires purchasable/lootable map items into fog-of-war reveal,
// encounter avoidance, hidden room reveal, and enemy marking.
// Maps are passive — effects apply while the item is in inventory.

import type { MudCharacter } from './types';
import { getAllRoomsInZone } from './worldMap';

// ── Map Effect Definition ────────────────────────────────────────────────────

export interface MapEffect {
  /** Zones whose rooms are fully revealed on the fog map */
  revealZones?: string[];
  /** Specific room IDs to reveal */
  revealRooms?: string[];
  /** Zones where hidden rooms become visible on fog map */
  revealHiddenInZones?: string[];
  /** Reveal hidden rooms in whatever zone the player is currently in */
  revealHiddenCurrentZone?: boolean;
  /** Zones where encounters can be avoided */
  encounterAvoidZones?: string[];
  /** Probability of avoiding an encounter (0–1), default 0.5 */
  encounterAvoidChance?: number;
  /** Zones where enemy positions are marked on unvisited rooms */
  markEnemiesInZones?: string[];
}

// ── Map Effect Registry ──────────────────────────────────────────────────────
// Keyed by item template ID.  Only items listed here have map effects.

const MAP_EFFECTS: Record<string, MapEffect> = {

  // ── Oska's shop (z04 — the Fringe) ──────────────────────────────────────
  fringe_map: {
    revealZones: ['z04'],
  },
  safe_route_guide: {
    encounterAvoidZones: ['z04'],
    encounterAvoidChance: 0.5,
  },
  building_survey: {
    revealHiddenInZones: ['z04'],
  },
  stalker_warning_map: {
    markEnemiesInZones: ['z04'],
  },

  // Oska quest reward — complete survey
  fringe_complete_map: {
    revealZones: ['z04'],
    revealHiddenInZones: ['z04'],
    markEnemiesInZones: ['z04'],
  },

  // ── Kai's shop (z04 — the Fringe) ──────────────────────────────────────
  infrastructure_map: {
    revealZones: ['z08', 'z09', 'z10'],
  },
  drainage_blueprints: {
    revealZones: ['z08'],
  },

  // ── Lumen quest reward (z09 — Maintenance Tunnels) ─────────────────────
  grid_map: {
    revealZones: ['z09'],
    markEnemiesInZones: ['z09'],
  },

  // ── Loot drops (any zone) ──────────────────────────────────────────────
  tunnel_map_deep: {
    revealZones: ['z08', 'z09', 'z10'],
  },
  scavenger_map_fragment: {
    revealHiddenCurrentZone: true,
  },

  // ── Kite's shop (z07 — Rooftop Network) ────────────────────────────────
  frequency_map: {
    revealZones: ['z07'],
  },

  // ── Vantage's shop (z07) ───────────────────────────────────────────────
  patrol_schedule_rooftop: {
    encounterAvoidZones: ['z01', 'z02', 'z03'],
    encounterAvoidChance: 0.4,
  },
  surveillance_report: {
    markEnemiesInZones: ['z01'],
  },

  // ── Quest rewards ──────────────────────────────────────────────────────
  d9_frequency_map: {
    encounterAvoidZones: ['z02'],
    encounterAvoidChance: 0.5,
    markEnemiesInZones: ['z02'],
  },

  // ── Wavelength's shop (z07) ────────────────────────────────────────────
  mesh_gap_map: {
    revealHiddenInZones: ['z02', 'z04'],
  },

  // ── Compass's shop (z11 — Abandoned Transit, future) ───────────────────
  transit_map_red: {
    revealZones: ['z11'],
  },
  transit_map_blue: {
    revealZones: ['z11'],
  },
  transit_map_loop: {
    revealZones: ['z11'],
  },
};

// ── Internal helper ──────────────────────────────────────────────────────────

function getActiveEffects(char: MudCharacter): MapEffect[] {
  const effects: MapEffect[] = [];
  for (const item of char.inventory) {
    const effect = MAP_EFFECTS[item.id];
    if (effect) effects.push(effect);
  }
  return effects;
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Room IDs revealed by map items in inventory (non-hidden rooms only). */
export function getMapRevealedRooms(char: MudCharacter): Set<string> {
  const revealed = new Set<string>();
  const effects = getActiveEffects(char);

  for (const effect of effects) {
    if (effect.revealZones) {
      for (const zoneId of effect.revealZones) {
        for (const room of getAllRoomsInZone(zoneId)) {
          if (!room.isHidden) revealed.add(room.id);
        }
      }
    }
    if (effect.revealRooms) {
      for (const rid of effect.revealRooms) revealed.add(rid);
    }
  }

  return revealed;
}

/** Zones in which maps reveal hidden rooms on the fog map. */
export function getMapHiddenRevealZones(char: MudCharacter): Set<string> {
  const zones = new Set<string>();
  for (const effect of getActiveEffects(char)) {
    if (effect.revealHiddenInZones) {
      for (const z of effect.revealHiddenInZones) zones.add(z);
    }
  }
  return zones;
}

/** True when any map item reveals hidden rooms in the player's current zone. */
export function revealsHiddenInCurrentZone(char: MudCharacter): boolean {
  return getActiveEffects(char).some(e => e.revealHiddenCurrentZone);
}

/** Zones in which enemy positions are marked on the map even for unvisited rooms. */
export function getMapEnemyMarkedZones(char: MudCharacter): Set<string> {
  const zones = new Set<string>();
  for (const effect of getActiveEffects(char)) {
    if (effect.markEnemiesInZones) {
      for (const z of effect.markEnemiesInZones) zones.add(z);
    }
  }
  return zones;
}

/**
 * Best encounter-avoidance probability for a zone (0–1, 0 = no avoidance).
 * If multiple maps cover the same zone, the highest chance wins.
 */
export function getEncounterAvoidanceChance(char: MudCharacter, zoneId: string): number {
  let best = 0;
  for (const effect of getActiveEffects(char)) {
    if (effect.encounterAvoidZones && effect.encounterAvoidZones.indexOf(zoneId) !== -1) {
      const chance = effect.encounterAvoidChance ?? 0.5;
      if (chance > best) best = chance;
    }
  }
  return best;
}

/** True if the item template has a registered map effect. */
export function hasMapEffect(itemId: string): boolean {
  return itemId in MAP_EFFECTS;
}

/** Human-readable summary of a map item's passive effect (for UI tooltips). */
export function getMapEffectSummary(itemId: string): string | null {
  const effect = MAP_EFFECTS[itemId];
  if (!effect) return null;

  const parts: string[] = [];
  if (effect.revealZones?.length) parts.push('reveals zone layout');
  if (effect.revealHiddenInZones?.length || effect.revealHiddenCurrentZone) parts.push('reveals hidden passages');
  if (effect.encounterAvoidZones?.length) {
    const pct = Math.round((effect.encounterAvoidChance ?? 0.5) * 100);
    parts.push(`${pct}% encounter avoidance`);
  }
  if (effect.markEnemiesInZones?.length) parts.push('marks hostile positions');

  return parts.length > 0 ? parts.join(' \u00b7 ') : null;
}
