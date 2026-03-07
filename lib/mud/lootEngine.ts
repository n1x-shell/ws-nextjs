// lib/mud/lootEngine.ts
// TUNNELCORE MUD — Loot Engine
// Loot roll mechanics, enemy loot tables, drop resolution.
// Every drop tells a story.

import type { MudCharacter, Item } from './types';
import { createItem, getItemTemplate } from './items';

// ── Loot Table Types ───────────────────────────────────────────────────────

export type LootTier = 'common' | 'uncommon' | 'rare' | 'unique';

export interface LootTableEntry {
  itemId: string;
  tier: LootTier;
  weight: number;
  conditions?: {
    playerLevelMin?: number;
    questFlag?: string;
    attributeGate?: { attribute: string; minimum: number };
    uniqueDrop?: boolean;
  };
}

export interface EnemyLootTable {
  enemyId: string;
  entries: LootTableEntry[];
}

// ── Tier Weight Distribution ───────────────────────────────────────────────

const TIER_RANGES: Record<LootTier, [number, number]> = {
  common:   [1, 60],
  uncommon: [61, 85],
  rare:     [86, 95],
  unique:   [96, 100],
};

// ── Dice ───────────────────────────────────────────────────────────────────

function roll100(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (arr[0] % 100) + 1;
}

function rollWeighted<T extends { weight: number }>(entries: T[]): T | null {
  if (entries.length === 0) return null;
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  let roll = (arr[0] % totalWeight) + 1;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
}

// ── Roll Resolution ────────────────────────────────────────────────────────

export interface LootRollResult {
  items: Item[];
  displayLines: string[];
}

export function rollLoot(
  enemyId: string,
  enemyLevel: number,
  character: MudCharacter,
): LootRollResult {
  const table = LOOT_TABLES[enemyId];
  if (!table) return { items: [], displayLines: [] };

  // Roll 1d100 with modifiers
  let roll = roll100();

  // Level differential modifier: +5 per level above player, -10 per level below
  const levelDiff = enemyLevel - character.level;
  if (levelDiff > 0) roll += levelDiff * 5;
  if (levelDiff < 0) roll += levelDiff * 10; // negative, so subtracts
  roll = Math.max(1, Math.min(100, roll));

  // GHOST bonus: +1 per point
  roll = Math.min(100, roll + character.attributes.GHOST);

  // Determine tier
  let tier: LootTier = 'common';
  for (const [t, [min, max]] of Object.entries(TIER_RANGES) as [LootTier, [number, number]][]) {
    if (roll >= min && roll <= max) { tier = t; break; }
  }

  // Filter entries by tier and conditions
  const eligible = table.entries.filter(e => {
    if (e.tier !== tier) return false;
    if (e.conditions) {
      if (e.conditions.playerLevelMin && character.level < e.conditions.playerLevelMin) return false;
      if (e.conditions.uniqueDrop && character.uniqueDrops?.includes(e.itemId)) return false;
      if (e.conditions.attributeGate) {
        const attr = e.conditions.attributeGate.attribute as keyof typeof character.attributes;
        if (character.attributes[attr] < e.conditions.attributeGate.minimum) return false;
      }
    }
    return true;
  });

  // If no eligible entries at this tier, fall down to common
  const fallback = eligible.length === 0
    ? table.entries.filter(e => e.tier === 'common')
    : eligible;

  // Roll weighted within tier
  const selected = rollWeighted(fallback);
  if (!selected) return { items: [], displayLines: [] };

  const item = createItem(selected.itemId);
  if (!item) return { items: [], displayLines: [] };

  // Track unique drops
  if (selected.conditions?.uniqueDrop) {
    if (!character.uniqueDrops) character.uniqueDrops = [];
    character.uniqueDrops.push(selected.itemId);
  }

  const tierLabel = tier.toUpperCase();
  const displayLines = [`  [${tierLabel}] ${item.name}`];

  return { items: [item], displayLines };
}

/** Roll loot for multiple enemies at once (post-combat) */
export function rollCombatLoot(
  enemies: Array<{ id: string; level: number }>,
  character: MudCharacter,
): LootRollResult {
  const allItems: Item[] = [];
  const allLines: string[] = [];

  for (const enemy of enemies) {
    const result = rollLoot(enemy.id, enemy.level, character);
    allItems.push(...result.items);
    allLines.push(...result.displayLines);
  }

  return { items: allItems, displayLines: allLines };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ENEMY LOOT TABLES ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const LOOT_TABLES: Record<string, EnemyLootTable> = {

  // ── TIER 1 — Levels 1-5 ─────────────────────────────────────────────────

  tunnel_rats: {
    enemyId: 'tunnel_rats',
    entries: [
      { itemId: 'scrap_metal', tier: 'common', weight: 40 },
      { itemId: 'rat_hide', tier: 'common', weight: 30 },
      { itemId: 'chewed_cable', tier: 'common', weight: 20 },
      { itemId: 'nutrient_bar', tier: 'uncommon', weight: 60 },
      { itemId: 'corroded_data_chip', tier: 'uncommon', weight: 40 },
      { itemId: 'rat_king_fragment', tier: 'rare', weight: 100 },
    ],
  },

  feral_augment: {
    enemyId: 'feral_augment',
    entries: [
      { itemId: 'scrap_cyberware', tier: 'common', weight: 35 },
      { itemId: 'damaged_implant', tier: 'common', weight: 35 },
      { itemId: 'broken_servo', tier: 'common', weight: 30 },
      { itemId: 'intact_t1_cyberware', tier: 'uncommon', weight: 50 },
      { itemId: 'neural_shunt_fragment', tier: 'uncommon', weight: 30 },
      { itemId: 'subject_id_tag', tier: 'uncommon', weight: 20 },
      { itemId: 'helixion_tracker', tier: 'rare', weight: 60 },
      { itemId: 'mnemos_fragment', tier: 'rare', weight: 40 },
      { itemId: 'corrupted_compliance_chip', tier: 'unique', weight: 100, conditions: { uniqueDrop: true } },
    ],
  },

  scavenger: {
    enemyId: 'scavenger',
    entries: [
      { itemId: 'creds_pouch', tier: 'common', weight: 40 },
      { itemId: 'scrap_weapon', tier: 'common', weight: 35 },
      { itemId: 'salvage', tier: 'common', weight: 25 },
      { itemId: 'stim_injector', tier: 'uncommon', weight: 40 },
      { itemId: 'scavenger_map_fragment', tier: 'uncommon', weight: 35 },
      { itemId: 'decent_weapon', tier: 'uncommon', weight: 25 },
      { itemId: 'cache_key', tier: 'rare', weight: 60 },
      { itemId: 'tunnel_map_deep', tier: 'rare', weight: 40 },
    ],
  },

  patrol_drone: {
    enemyId: 'patrol_drone',
    entries: [
      { itemId: 'drone_components', tier: 'common', weight: 40 },
      { itemId: 'sensor_array_damaged', tier: 'common', weight: 35 },
      { itemId: 'power_cell_depleted', tier: 'common', weight: 25 },
      { itemId: 'patrol_route_chip', tier: 'uncommon', weight: 50 },
      { itemId: 'targeting_lens', tier: 'uncommon', weight: 30 },
      { itemId: 'intact_flight_motor', tier: 'uncommon', weight: 20 },
      { itemId: 'helixion_comms_log', tier: 'rare', weight: 70 },
      { itemId: 'emp_charge_salvaged', tier: 'rare', weight: 30 },
    ],
  },

  // ── TIER 2 — Levels 6-12 ────────────────────────────────────────────────

  helixion_guard: {
    enemyId: 'helixion_guard',
    entries: [
      { itemId: 'creds_pouch', tier: 'common', weight: 30 },
      { itemId: 'military_rations', tier: 'common', weight: 25 },
      { itemId: 'standard_sidearm', tier: 'common', weight: 25 },
      { itemId: 'security_keycard_basic', tier: 'common', weight: 20 },
      { itemId: 'ballistic_vest_helixion', tier: 'uncommon', weight: 40 },
      { itemId: 'comms_earpiece', tier: 'uncommon', weight: 30 },
      { itemId: 'shock_baton', tier: 'uncommon', weight: 30 },
      { itemId: 'security_keycard_elevated', tier: 'rare', weight: 50 },
      { itemId: 'helixion_deployment_orders', tier: 'rare', weight: 50 },
      { itemId: 'mesh_compliance_badge', tier: 'unique', weight: 100, conditions: { uniqueDrop: true } },
    ],
  },

  chrome_wolf: {
    enemyId: 'chrome_wolf',
    entries: [
      { itemId: 'creds_pouch', tier: 'common', weight: 30 },
      { itemId: 'chrome_knuckles', tier: 'common', weight: 25 },
      { itemId: 'stim_pack', tier: 'common', weight: 25 },
      { itemId: 'wolf_territory_marker', tier: 'common', weight: 20 },
      { itemId: 't2_combat_cyberware', tier: 'uncommon', weight: 40 },
      { itemId: 'fight_pit_token', tier: 'uncommon', weight: 30 },
      { itemId: 'modified_weapon', tier: 'uncommon', weight: 30 },
      { itemId: 'wolf_augment_schematic', tier: 'rare', weight: 60 },
      { itemId: 'voss_deployment_sigil', tier: 'rare', weight: 40 },
      { itemId: 'fenrirs_tooth', tier: 'unique', weight: 100, conditions: { uniqueDrop: true } },
    ],
  },

  d9_agent: {
    enemyId: 'd9_agent',
    entries: [
      { itemId: 'creds_pouch', tier: 'common', weight: 30 },
      { itemId: 'agent_sidearm', tier: 'common', weight: 30 },
      { itemId: 'surveillance_hardware', tier: 'common', weight: 20 },
      { itemId: 'neural_dampener_grenade', tier: 'common', weight: 20 },
      { itemId: 'd9_field_report', tier: 'uncommon', weight: 40 },
      { itemId: 'mesh_sniffer', tier: 'uncommon', weight: 30 },
      { itemId: 'agent_armor_light', tier: 'uncommon', weight: 30 },
      { itemId: 'd9_encryption_key', tier: 'rare', weight: 50 },
      { itemId: 'compliance_override_device', tier: 'rare', weight: 50 },
      { itemId: 'agent_null_badge', tier: 'unique', weight: 100, conditions: { uniqueDrop: true } },
    ],
  },

  // ── TIER 3 — Levels 13-18 ───────────────────────────────────────────────

  helixion_cyborg_enforcer: {
    enemyId: 'helixion_cyborg_enforcer',
    entries: [
      { itemId: 'creds_pouch', tier: 'common', weight: 25 },
      { itemId: 'military_grade_weapon', tier: 'common', weight: 30 },
      { itemId: 't2_cyberware_intact', tier: 'common', weight: 25 },
      { itemId: 'enforcer_armor_plating', tier: 'common', weight: 20 },
      { itemId: 't3_cyberware_component', tier: 'uncommon', weight: 40 },
      { itemId: 'chrysalis_research_data', tier: 'uncommon', weight: 35 },
      { itemId: 'neural_inhibitor', tier: 'uncommon', weight: 25 },
      { itemId: 'sandevistan_chip', tier: 'rare', weight: 50 },
      { itemId: 'helixion_override_codes', tier: 'rare', weight: 50 },
      { itemId: 'chrysalis_interface', tier: 'unique', weight: 100, conditions: { uniqueDrop: true } },
    ],
  },

  mesh_weaponized_squad: {
    enemyId: 'mesh_weaponized_squad',
    entries: [
      { itemId: 'creds_pouch', tier: 'common', weight: 30 },
      { itemId: 'mesh_linked_weapon', tier: 'common', weight: 30 },
      { itemId: 'compliance_stim', tier: 'common', weight: 20 },
      { itemId: 'squad_tactical_data', tier: 'common', weight: 20 },
      { itemId: 'mesh_amplifier', tier: 'uncommon', weight: 40 },
      { itemId: 'signal_jammer_personal', tier: 'uncommon', weight: 35 },
      { itemId: 't3_combat_stim', tier: 'uncommon', weight: 25 },
      { itemId: 'frequency_dampener', tier: 'rare', weight: 50 },
      { itemId: 'squad_commander_log', tier: 'rare', weight: 50 },
      { itemId: 'the_leash_broken', tier: 'unique', weight: 100, conditions: { uniqueDrop: true } },
    ],
  },

  // ── TIER 4 — Levels 18-20 ──────────────────────────────────────────────

  broadcast_tower_defender: {
    enemyId: 'broadcast_tower_defender',
    entries: [
      { itemId: 'creds_pouch', tier: 'common', weight: 25 },
      { itemId: 'military_grade_t3_weapon', tier: 'common', weight: 30 },
      { itemId: 'tower_security_pass', tier: 'common', weight: 25 },
      { itemId: 'combat_stim_military', tier: 'common', weight: 20 },
      { itemId: 'frequency_array_component', tier: 'uncommon', weight: 40 },
      { itemId: 't3_cyberware_complete', tier: 'uncommon', weight: 35 },
      { itemId: 'tower_schematic_fragment', tier: 'uncommon', weight: 25 },
      { itemId: 'virek_override_key', tier: 'rare', weight: 50 },
      { itemId: 'substrate_resonance_crystal', tier: 'rare', weight: 50 },
      { itemId: 'the_frequency_key', tier: 'unique', weight: 100, conditions: { uniqueDrop: true } },
    ],
  },
};

// ── Table Lookup ───────────────────────────────────────────────────────────

export function getLootTable(enemyId: string): EnemyLootTable | null {
  return LOOT_TABLES[enemyId] ?? null;
}

export function hasLootTable(enemyId: string): boolean {
  return enemyId in LOOT_TABLES;
}
