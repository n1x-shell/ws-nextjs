// lib/mud/items.ts
// TUNNELCORE MUD — Item Database
// All item definitions. Items are templates — instances are created from these.

import type { Item, ItemCategory, ItemTier, Archetype, CombatStyle } from './types';

// ── Item Templates ──────────────────────────────────────────────────────────
// Use createItem() to make inventory instances from templates.

export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  tier: ItemTier;
  slot?: Item['slot'];
  stackable: boolean;
  damage?: number;
  damageType?: Item['damageType'];
  armorValue?: number;
  cyberwareTier?: number;
  ramCost?: number;
  buyPrice?: number;
  sellPrice?: number;
  healAmount?: number;
  effectId?: string;
  questItem?: boolean;
  loreItem?: boolean;
}

const ITEMS: Record<string, ItemTemplate> = {

  // ── Materials / Salvage ─────────────────────────────────────────────────

  scrap_metal: {
    id: 'scrap_metal', name: 'Scrap Metal',
    description: 'Twisted metal. Worth something to the right buyer.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 2,
  },
  rat_hide: {
    id: 'rat_hide', name: 'Rat Hide',
    description: 'Tough tunnel rat skin. Mara might want it.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 3,
  },
  salvage: {
    id: 'salvage', name: 'Salvage Components',
    description: 'Assorted electronic components. Useful for repair and trade.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 5,
  },
  rare_salvage: {
    id: 'rare_salvage', name: 'Rare Salvage',
    description: 'High-grade components. Helixion manufacturing marks partially ground off.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 25,
  },
  drone_components: {
    id: 'drone_components', name: 'Drone Components',
    description: 'Helixion patrol drone internals. Sensor arrays, micro-servos, armored housing.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 12,
  },
  crawler_hide: {
    id: 'crawler_hide', name: 'Crawler Hide',
    description: 'Semi-aquatic predator skin. Tough, chemical-resistant. Has uses.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 8,
  },
  bio_sample: {
    id: 'bio_sample', name: 'Bio-Sample',
    description: 'Organic tissue sample from the tunnel fauna. Serrano might pay for this.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 10,
  },

  // ── Cyberware drops ─────────────────────────────────────────────────────

  scrap_cyberware: {
    id: 'scrap_cyberware', name: 'Scrap Cyberware',
    description: 'Damaged augment component. Ripped out, not removed. Might be repairable.',
    category: 'cyberware', tier: 'SCRAP', stackable: false,
    sellPrice: 8,
  },
  damaged_implant: {
    id: 'damaged_implant', name: 'Damaged Neural Implant',
    description: 'MNEMOS-series implant fragment. The circuitry is fried but the housing is intact.',
    category: 'cyberware', tier: 'SCRAP', stackable: false,
    sellPrice: 15,
  },

  // ── Currency / Containers ───────────────────────────────────────────────

  creds_pouch: {
    id: 'creds_pouch', name: 'CREDS',
    description: 'Universal currency. Digital tokens stored on a chip.',
    category: 'utility', tier: 'COMMON', stackable: true,
    // Special: quantity is added directly to currency.creds on pickup
  },

  // ── Data / Lore ─────────────────────────────────────────────────────────

  data_chip: {
    id: 'data_chip', name: 'Data Chip',
    description: 'Encrypted data chip. Contents unknown without a deck.',
    category: 'lore', tier: 'COMMON', stackable: true,
    sellPrice: 10, loreItem: true,
  },
  data_chip_lore: {
    id: 'data_chip_lore', name: 'Data Chip [DECRYPTED]',
    description: 'A fragment of Helixion internal communications. Names, dates, test cohort numbers.',
    category: 'lore', tier: 'COMMON', stackable: false,
    loreItem: true,
  },

  // ── Consumables ─────────────────────────────────────────────────────────

  stim_pack: {
    id: 'stim_pack', name: 'Stim Pack',
    description: 'Emergency medical stimulant. Restores HP. Tastes like battery acid.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    healAmount: 15, buyPrice: 10, sellPrice: 4,
  },
  medkit: {
    id: 'medkit', name: 'Medkit',
    description: 'Salvaged medical kit. Bandages, antiseptic, suture thread. Restores significant HP.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    healAmount: 30, buyPrice: 25, sellPrice: 10,
  },
  antitox: {
    id: 'antitox', name: 'Antitox',
    description: 'Chemical hazard neutralizer. Cures poison and chemical burns.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 15, sellPrice: 6, effectId: 'cure_poison',
  },
  neural_stabilizer: {
    id: 'neural_stabilizer', name: 'Neural Stabilizer',
    description: 'Counters mesh interference effects. Clears the static in your head.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 20, sellPrice: 8, effectId: 'cure_mesh',
  },

  // ── Weapons (starting + early game) ─────────────────────────────────────

  scrap_weapon: {
    id: 'scrap_weapon', name: 'Scrap Blade',
    description: 'Sharpened metal shard wrapped in tape. It cuts. That is the extent of its qualities.',
    category: 'weapon_melee', tier: 'SCRAP', stackable: false,
    slot: 'weapon_primary', damage: 3, damageType: 'melee',
    buyPrice: 8, sellPrice: 3,
  },
  reinforced_arm: {
    id: 'reinforced_arm', name: 'Reinforced Cybernetic Arm',
    description: "Like Nix's. The hydraulics are crude but the impact is real.",
    category: 'weapon_melee', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 5, damageType: 'melee',
  },
  scavenged_pistol: {
    id: 'scavenged_pistol', name: 'Scavenged Pistol',
    description: 'Rusted but functional. 30 rounds is optimistic but accurate.',
    category: 'weapon_ranged', tier: 'SCRAP', stackable: false,
    slot: 'weapon_primary', damage: 4, damageType: 'ranged',
  },
  mono_wire: {
    id: 'mono_wire', name: 'Mono-Wire',
    description: 'Molecularly thin filament. Silent. Devastating at close range.',
    category: 'weapon_melee', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 5, damageType: 'melee',
  },
  quickhack_deck: {
    id: 'quickhack_deck', name: 'Quickhack Deck',
    description: 'Cobbled-together neural interface for remote system penetration.',
    category: 'weapon_ranged', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 4, damageType: 'hack',
  },

  // ── Armor (starting + early game) ───────────────────────────────────────

  light_armor: {
    id: 'light_armor', name: 'Light Armor',
    description: 'Reinforced jacket. Stops small-caliber rounds. Mostly.',
    category: 'armor', tier: 'SCRAP', stackable: false,
    slot: 'armor', armorValue: 2,
    buyPrice: 15, sellPrice: 5,
  },
  ballistic_vest: {
    id: 'ballistic_vest', name: 'Ballistic Vest',
    description: 'Military surplus. Kevlar weave with ceramic inserts.',
    category: 'armor', tier: 'COMMON', stackable: false,
    slot: 'armor', armorValue: 3,
  },

  // ── Cyberware (equippable) ──────────────────────────────────────────────

  neural_shunt: {
    id: 'neural_shunt', name: 'Neural Shunt',
    description: 'Redirects implant signals. Basic mesh interference protection.',
    category: 'cyberware', tier: 'COMMON', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 1,
  },
  signal_scrambler: {
    id: 'signal_scrambler', name: 'Signal Scrambler',
    description: 'Makes your frequency signature harder to track. 3 charges before burnout.',
    category: 'cyberware', tier: 'COMMON', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 1,
  },
  optical_camo: {
    id: 'optical_camo', name: 'Optical Camo',
    description: 'Light-bending surface layer. 3 charges. Imperfect but effective in low light.',
    category: 'cyberware', tier: 'COMMON', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 1,
  },

  // ── Utility ─────────────────────────────────────────────────────────────

  emp_grenade: {
    id: 'emp_grenade', name: 'EMP Grenade',
    description: 'Disables electronics in a radius. One use. Affects cyberware too.',
    category: 'utility', tier: 'COMMON', stackable: true,
    buyPrice: 30, sellPrice: 12,
  },

  // ── Quest Items ─────────────────────────────────────────────────────────

  deep_gate_key: {
    id: 'deep_gate_key', name: 'Deep Gate Key',
    description: 'Heavy iron key. Opens the drainage gate to the deep infrastructure below.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
};

// ── Item Lookup ─────────────────────────────────────────────────────────────

export function getItemTemplate(id: string): ItemTemplate | null {
  return ITEMS[id] ?? null;
}

export function createItem(templateId: string, quantity: number = 1): Item | null {
  const template = ITEMS[templateId];
  if (!template) return null;

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    tier: template.tier,
    slot: template.slot,
    stackable: template.stackable,
    quantity,
    damage: template.damage,
    damageType: template.damageType,
    armorValue: template.armorValue,
    cyberwareTier: template.cyberwareTier,
    ramCost: template.ramCost,
    buyPrice: template.buyPrice,
    sellPrice: template.sellPrice,
    healAmount: template.healAmount,
    effectId: template.effectId,
    questItem: template.questItem,
    loreItem: template.loreItem,
  };
}

// ── Starting Gear Sets ──────────────────────────────────────────────────────
// Based on archetype + combat style per the design doc.

export interface StarterKit {
  weapon: string;      // item template ID
  armor: string;
  cyberware?: string;
  utility?: string[];
  consumables: { id: string; qty: number }[];
  creds: number;
  scrip: number;
}

export function getStarterKit(archetype: Archetype, combatStyle: CombatStyle): StarterKit {
  const base: StarterKit = {
    weapon: 'scrap_weapon',
    armor: 'light_armor',
    consumables: [{ id: 'stim_pack', qty: 2 }],
    creds: 20,
    scrip: 5,
  };

  // Archetype + style combos from design doc
  if (archetype === 'SOVEREIGN' && combatStyle === 'CHROME') {
    return { ...base, weapon: 'reinforced_arm', cyberware: 'neural_shunt' };
  }
  if (archetype === 'INTEGRATED' && combatStyle === 'SYNAPSE') {
    return { ...base, weapon: 'quickhack_deck', cyberware: 'neural_shunt', consumables: [{ id: 'stim_pack', qty: 1 }, { id: 'neural_stabilizer', qty: 1 }] };
  }
  if (archetype === 'DISCONNECTED' && combatStyle === 'BALLISTIC') {
    return { ...base, weapon: 'scavenged_pistol', armor: 'ballistic_vest', utility: ['emp_grenade'] };
  }
  if (archetype === 'SOVEREIGN' && combatStyle === 'GHOST_STYLE') {
    return { ...base, weapon: 'mono_wire', cyberware: 'optical_camo', utility: ['signal_scrambler'] };
  }

  // Generic fallbacks by combat style
  if (combatStyle === 'CHROME') return { ...base, weapon: 'reinforced_arm' };
  if (combatStyle === 'SYNAPSE') return { ...base, weapon: 'quickhack_deck' };
  if (combatStyle === 'BALLISTIC') return { ...base, weapon: 'scavenged_pistol' };
  if (combatStyle === 'GHOST_STYLE') return { ...base, weapon: 'mono_wire' };

  return base;
}

// ── Shop Inventories ────────────────────────────────────────────────────────

export interface ShopItem {
  templateId: string;
  stock: number;      // -1 = unlimited
}

export const MARA_SHOP: ShopItem[] = [
  { templateId: 'scrap_weapon', stock: 3 },
  { templateId: 'light_armor', stock: 2 },
  { templateId: 'stim_pack', stock: 10 },
  { templateId: 'medkit', stock: 3 },
  { templateId: 'antitox', stock: 5 },
  { templateId: 'salvage', stock: -1 },
];

export const COLE_SHOP: ShopItem[] = [
  { templateId: 'stim_pack', stock: 8 },
  { templateId: 'medkit', stock: 5 },
  { templateId: 'antitox', stock: 4 },
  { templateId: 'neural_stabilizer', stock: 3 },
];

export const KETCH_SHOP: ShopItem[] = [
  { templateId: 'data_chip', stock: 3 },
  { templateId: 'stim_pack', stock: 5 },
  { templateId: 'emp_grenade', stock: 2 },
];
