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

  // ── TIER 1 LOOT — Tunnel Rats ──────────────────────────────────────────

  chewed_cable: {
    id: 'chewed_cable', name: 'Chewed Cable',
    description: 'Gnawed through by something with very sharp teeth. Worth 2 CREDS as scrap.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 2,
  },
  nutrient_bar: {
    id: 'nutrient_bar', name: 'Nutrient Bar',
    description: 'Compressed protein and vitamins. Tastes like cardboard soaked in regret. Heals 10 HP.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    healAmount: 10, sellPrice: 3,
  },
  corroded_data_chip: {
    id: 'corroded_data_chip', name: 'Corroded Data Chip',
    description: 'Partially dissolved by tunnel water. Ketch might pay for this, or decrypt it if your TECH is high enough.',
    category: 'lore', tier: 'COMMON', stackable: true,
    sellPrice: 15, loreItem: true,
  },
  rat_king_fragment: {
    id: 'rat_king_fragment', name: 'Rat King Nest Fragment',
    description: 'Matted fur, sinew, and something that pulses faintly. Cole will study it if asked.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },

  // ── TIER 1 LOOT — Feral Augment ────────────────────────────────────────

  broken_servo: {
    id: 'broken_servo', name: 'Broken Servo',
    description: 'Hydraulic servo from a cybernetic limb. Seized mid-motion. Crafting component.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 5,
  },
  intact_t1_cyberware: {
    id: 'intact_t1_cyberware', name: 'Intact T1 Cyberware',
    description: 'Functional low-tier augment component. Random slot. Not pretty but it works.',
    category: 'cyberware', tier: 'COMMON', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 1, sellPrice: 20,
  },
  neural_shunt_fragment: {
    id: 'neural_shunt_fragment', name: 'Neural Shunt Fragment',
    description: 'Partial neural interface component. Required for T2 cyberware assembly.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 12,
  },
  subject_id_tag: {
    id: 'subject_id_tag', name: 'Subject ID Tag',
    description: 'Helixion subject identifier. A number. A name. They were a person once. The tag remembers.',
    category: 'lore', tier: 'COMMON', stackable: false,
    loreItem: true, sellPrice: 5,
  },
  helixion_tracker: {
    id: 'helixion_tracker', name: 'Helixion Tracker Module',
    description: 'Active tracking beacon from a feral augment. Disabling requires TECH 6. Keeping it active means Helixion patrols find you faster. Iron Bloom pays 80 CREDS.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 80,
  },
  mnemos_fragment: {
    id: 'mnemos_fragment', name: 'MNEMOS Fragment',
    description: 'Partial memory data from a damaged MNEMOS implant. GHOST 4 or higher to read. Contains someone\'s last memories.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    loreItem: true,
  },
  corrupted_compliance_chip: {
    id: 'corrupted_compliance_chip', name: 'Corrupted Compliance Chip',
    description: 'Equippable cyberware. Grants +1 GHOST but -1 COOL. The chip whispers. It never stops.',
    category: 'cyberware', tier: 'HELIXION', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 1,
  },

  // ── TIER 1 LOOT — Scavenger ────────────────────────────────────────────

  stim_injector: {
    id: 'stim_injector', name: 'Stim Injector',
    description: 'Auto-injecting medical stimulant. Heals 25 HP. Single use.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    healAmount: 25, sellPrice: 8,
  },
  scavenger_map_fragment: {
    id: 'scavenger_map_fragment', name: 'Scavenger\'s Map Fragment',
    description: 'Hand-drawn on scrap fabric. Reveals 1 hidden room in the current zone.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 15,
  },
  decent_weapon: {
    id: 'decent_weapon', name: 'Scavenged Weapon',
    description: 'Mid-low tier. Somebody kept this maintained. Better than starting gear.',
    category: 'weapon_melee', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 5, damageType: 'melee', sellPrice: 15,
  },
  cache_key: {
    id: 'cache_key', name: 'Cache Key',
    description: 'Opens one scavenger cache in the current zone. Contains 50-100 CREDS and uncommon gear.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    questItem: true,
  },
  tunnel_map_deep: {
    id: 'tunnel_map_deep', name: 'Tunnel Map — Deep Layer',
    description: 'Reveals connections from current zone to undercity access points. Drawn by someone who survived the trip.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 30,
  },

  // ── TIER 1 LOOT — Patrol Drone ─────────────────────────────────────────

  sensor_array_damaged: {
    id: 'sensor_array_damaged', name: 'Sensor Array (Damaged)',
    description: 'Drone sensor unit. TECH 5 to repair. Repaired grants scan range +1 for 3 uses.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 10,
  },
  power_cell_depleted: {
    id: 'power_cell_depleted', name: 'Power Cell (Depleted)',
    description: 'Recharge at Iron Bloom for 10 CREDS. Powers electronic devices.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 5,
  },
  patrol_route_chip: {
    id: 'patrol_route_chip', name: 'Patrol Route Data',
    description: 'Reveals enemy patrol patterns in current zone for 1 hour. Helixion standard encryption, already cracked.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 20,
  },
  targeting_lens: {
    id: 'targeting_lens', name: 'Targeting Lens',
    description: 'Weapon mod. Ranged +1 accuracy. Helixion military optics.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 25,
  },
  intact_flight_motor: {
    id: 'intact_flight_motor', name: 'Intact Flight Motor',
    description: 'Drone propulsion unit in working condition. Iron Bloom pays 50 CREDS or use it for hover components.',
    category: 'material', tier: 'COMMON', stackable: false,
    sellPrice: 50,
  },
  helixion_comms_log: {
    id: 'helixion_comms_log', name: 'Helixion Encrypted Comms Log',
    description: 'TECH 7 or Iron Bloom contact to decrypt. Contains intel relevant to current questline.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    loreItem: true, sellPrice: 40,
  },
  emp_charge_salvaged: {
    id: 'emp_charge_salvaged', name: 'EMP Charge (Salvaged)',
    description: 'Single-use. Disables all cyberware and electronics in room for 1 turn. Handle with care.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 35,
  },

  // ── TIER 2 LOOT — Helixion Security Guard ──────────────────────────────

  military_rations: {
    id: 'military_rations', name: 'Military Rations',
    description: 'Helixion standard-issue food. Vacuum sealed. Heals 15 HP. Tastes like obedience.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    healAmount: 15, sellPrice: 5,
  },
  standard_sidearm: {
    id: 'standard_sidearm', name: 'Standard-Issue Sidearm',
    description: 'Helixion Security Model 7. Reliable. Not exciting. Ammo: 12.',
    category: 'weapon_ranged', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 5, damageType: 'ranged', sellPrice: 20,
  },
  security_keycard_basic: {
    id: 'security_keycard_basic', name: 'Security Keycard (Basic)',
    description: 'Opens Tier 1 Helixion doors in current zone. Standard access level.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 10,
  },
  ballistic_vest_helixion: {
    id: 'ballistic_vest_helixion', name: 'Ballistic Vest (Helixion)',
    description: 'Armor +4. Clean. Corporate logo on the chest. You might want to scratch that off.',
    category: 'armor', tier: 'COMMON', stackable: false,
    slot: 'armor', armorValue: 4, sellPrice: 30,
  },
  comms_earpiece: {
    id: 'comms_earpiece', name: 'Comms Earpiece',
    description: 'Equip to hear Helixion patrol chatter in current zone. Knowledge is survival.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 20,
  },
  shock_baton: {
    id: 'shock_baton', name: 'Shock Baton',
    description: 'Helixion crowd control. 1d6 melee + stun chance (BODY save). Blue arcs between the prongs.',
    category: 'weapon_melee', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 6, damageType: 'electric', sellPrice: 25,
  },
  security_keycard_elevated: {
    id: 'security_keycard_elevated', name: 'Security Keycard (Elevated)',
    description: 'Opens Tier 2 Helixion doors. Higher clearance. Someone will miss this.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 40,
  },
  helixion_deployment_orders: {
    id: 'helixion_deployment_orders', name: 'Helixion Deployment Orders',
    description: 'Sealed orders. Names, coordinates, objectives. Reveals next Helixion operation in district.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    loreItem: true, sellPrice: 50,
  },
  mesh_compliance_badge: {
    id: 'mesh_compliance_badge', name: 'Mesh Compliance Badge',
    description: 'Helixion NPCs treat you as neutral for 10 minutes. One use before it pings HQ. Then they come for you.',
    category: 'utility', tier: 'HELIXION', stackable: false,
  },

  // ── TIER 2 LOOT — Chrome Wolf ──────────────────────────────────────────

  chrome_knuckles: {
    id: 'chrome_knuckles', name: 'Chrome Knuckles',
    description: 'Weighted cybernetic hand reinforcement. Melee +2. Ugly but effective.',
    category: 'weapon_melee', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 5, damageType: 'melee', sellPrice: 15,
  },
  wolf_territory_marker: {
    id: 'wolf_territory_marker', name: 'Wolf Territory Marker',
    description: 'Chrome Wolf gang tag. Worth 5 CREDS. Or keep it — some NPCs respect the mark.',
    category: 'utility', tier: 'SCRAP', stackable: true,
    sellPrice: 5,
  },
  t2_combat_cyberware: {
    id: 't2_combat_cyberware', name: 'T2 Combat Cyberware',
    description: 'Functional Tier 2 augment. Reflex booster, subdermal plate, or targeting array.',
    category: 'cyberware', tier: 'MIL_SPEC', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 2, sellPrice: 50,
  },
  fight_pit_token: {
    id: 'fight_pit_token', name: 'Fight Pit Token',
    description: 'Grants entry to one ranked fight in the pits. Blood-colored chip. Somebody died for this one.',
    category: 'utility', tier: 'COMMON', stackable: true,
    sellPrice: 15,
  },
  modified_weapon: {
    id: 'modified_weapon', name: 'Modified Weapon',
    description: 'Wolf-custom. +1 to base weapon damage. Chrome Wolf serial marks filed off. Mostly.',
    category: 'weapon_melee', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 6, damageType: 'melee', sellPrice: 30,
  },
  wolf_augment_schematic: {
    id: 'wolf_augment_schematic', name: 'Chrome Wolf Augmentation Schematic',
    description: 'Crafting recipe for Wolf-exclusive T2 cyberware. The Wolves built this themselves.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    loreItem: true, sellPrice: 45,
  },
  voss_deployment_sigil: {
    id: 'voss_deployment_sigil', name: "Voss's Deployment Sigil",
    description: 'Shows Wolf patrol routes. Also proves you killed one of his people. There will be consequences.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    loreItem: true,
  },
  fenrirs_tooth: {
    id: 'fenrirs_tooth', name: "Fenrir's Tooth",
    description: 'Mono-edge blade. 1d10 melee. Ignores 2 armor. Named for the old Wolf legend. Voss notices if you carry it.',
    category: 'weapon_melee', tier: 'HELIXION', stackable: false,
    slot: 'weapon_primary', damage: 10, damageType: 'melee',
  },

  // ── TIER 2 LOOT — D9 Agent ─────────────────────────────────────────────

  agent_sidearm: {
    id: 'agent_sidearm', name: 'Agent Sidearm (Suppressed)',
    description: 'D9 standard. 1d8 ranged. Stealth attacks don\'t break concealment. Whisper quiet.',
    category: 'weapon_ranged', tier: 'MIL_SPEC', stackable: false,
    slot: 'weapon_primary', damage: 8, damageType: 'ranged', sellPrice: 40,
  },
  surveillance_hardware: {
    id: 'surveillance_hardware', name: 'Surveillance Hardware',
    description: 'D9 field equipment. Iron Bloom pays 60 CREDS or disassemble (TECH 7) for components.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 60,
  },
  neural_dampener_grenade: {
    id: 'neural_dampener_grenade', name: 'Neural Dampener Grenade',
    description: 'AoE. All targets lose 2 GHOST for 3 turns. The silence is deafening.',
    category: 'utility', tier: 'COMMON', stackable: true,
    sellPrice: 25,
  },
  d9_field_report: {
    id: 'd9_field_report', name: 'D9 Field Report',
    description: 'Names, locations, objectives. Major quest intel. Someone\'s career is in this document.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    loreItem: true, sellPrice: 50,
  },
  mesh_sniffer: {
    id: 'mesh_sniffer', name: 'Mesh Sniffer',
    description: 'Device. Detects mesh-connected individuals within 2 rooms. 10 uses. D9 counterintel tech.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 40,
  },
  agent_armor_light: {
    id: 'agent_armor_light', name: 'Agent Armor (Light)',
    description: 'Armor +5. Looks civilian. That\'s the point.',
    category: 'armor', tier: 'MIL_SPEC', stackable: false,
    slot: 'armor', armorValue: 5, sellPrice: 50,
  },
  d9_encryption_key: {
    id: 'd9_encryption_key', name: 'D9 Encryption Key',
    description: 'Decrypt any D9 data chip. Permanent tool. The secrets of the directorate, one chip at a time.',
    category: 'utility', tier: 'HELIXION', stackable: false,
    sellPrice: 100,
  },
  compliance_override_device: {
    id: 'compliance_override_device', name: 'Compliance Override Device',
    description: 'Single-use. Forces one mesh-connected NPC to freeze for 1 turn. Doesn\'t work on sovereigns.',
    category: 'utility', tier: 'HELIXION', stackable: false,
    sellPrice: 80,
  },
  agent_null_badge: {
    id: 'agent_null_badge', name: "Agent Null's Badge",
    description: 'Named agent kill. D9 disguise — lasts until you attack or fail a COOL check. They\'ll come for you once they realize he\'s gone.',
    category: 'utility', tier: 'PROTOTYPE', stackable: false,
  },

  // ── TIER 3 LOOT — Helixion Cyborg Enforcer ─────────────────────────────

  military_grade_weapon: {
    id: 'military_grade_weapon', name: 'Military-Grade Weapon',
    description: '1d10 ranged or 1d8+2 melee. Real hardware. Helixion military issue.',
    category: 'weapon_ranged', tier: 'MIL_SPEC', stackable: false,
    slot: 'weapon_primary', damage: 10, damageType: 'ranged', sellPrice: 60,
  },
  t2_cyberware_intact: {
    id: 't2_cyberware_intact', name: 'T2 Cyberware (Intact)',
    description: 'Random functional Tier 2 augment. Always in working condition.',
    category: 'cyberware', tier: 'MIL_SPEC', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 2, sellPrice: 55,
  },
  enforcer_armor_plating: {
    id: 'enforcer_armor_plating', name: 'Enforcer Armor Plating',
    description: 'Armor +6. Heavy. Requires BODY 7. The kind of armor that changes how you walk.',
    category: 'armor', tier: 'MIL_SPEC', stackable: false,
    slot: 'armor', armorValue: 6, sellPrice: 65,
  },
  t3_cyberware_component: {
    id: 't3_cyberware_component', name: 'T3 Cyberware Component',
    description: 'Requires additional components to complete. Worth finding. Worth keeping.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 40,
  },
  chrysalis_research_data: {
    id: 'chrysalis_research_data', name: 'Chrysalis Research Data',
    description: 'Helixion research files on Project Chrysalis. Lore + quest advancement. Iron Bloom pays 100 CREDS.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    loreItem: true, sellPrice: 100,
  },
  neural_inhibitor: {
    id: 'neural_inhibitor', name: 'Neural Inhibitor',
    description: 'Single-use. Disables target cyberware for entire combat. The silence hits them like a wall.',
    category: 'utility', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 45,
  },
  sandevistan_chip: {
    id: 'sandevistan_chip', name: 'Sandevistan Chip (Damaged)',
    description: 'Needs repair (TECH 8 or Costa/Mira). When repaired: extra turn 1/combat. Time stops for everyone but you.',
    category: 'cyberware', tier: 'HELIXION', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 3, sellPrice: 120,
  },
  helixion_override_codes: {
    id: 'helixion_override_codes', name: 'Helixion Override Codes',
    description: 'Opens all Tier 1-3 Helixion doors. Lab access possible. Guard these with your life.',
    category: 'utility', tier: 'HELIXION', stackable: false,
  },
  chrysalis_interface: {
    id: 'chrysalis_interface', name: 'Chrysalis Interface Prototype',
    description: 'T3 cyberware. +2 TECH, +1 GHOST. Whispers Helixion compliance protocols. At GHOST 8, you can hear the Substrate responding.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 3,
  },

  // ── TIER 3 LOOT — Mesh-Weaponized Squad ────────────────────────────────

  mesh_linked_weapon: {
    id: 'mesh_linked_weapon', name: 'Mesh-Linked Weapon',
    description: 'Smart weapon. +2 accuracy but pings Helixion on every shot. The mesh is watching.',
    category: 'weapon_ranged', tier: 'MIL_SPEC', stackable: false,
    slot: 'weapon_primary', damage: 9, damageType: 'ranged', sellPrice: 55,
  },
  compliance_stim: {
    id: 'compliance_stim', name: 'Compliance Stim',
    description: 'Heals 20 HP but applies -1 GHOST for 1 hour. The mesh wants to help. Let it.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    healAmount: 20, sellPrice: 8,
  },
  squad_tactical_data: {
    id: 'squad_tactical_data', name: 'Squad Tactical Data',
    description: 'Reveals squad deployment pattern in current zone. Helixion military planning.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 15,
  },
  mesh_amplifier: {
    id: 'mesh_amplifier', name: 'Mesh Amplifier (Portable)',
    description: 'Equip to boost TECH +2 but suffer -2 GHOST. The tradeoff Helixion designed.',
    category: 'cyberware', tier: 'MIL_SPEC', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 2, sellPrice: 50,
  },
  signal_jammer_personal: {
    id: 'signal_jammer_personal', name: 'Signal Jammer (Personal)',
    description: 'Blocks mesh effects in a 1-room radius. 5 uses. Your own private silence.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 45,
  },
  t3_combat_stim: {
    id: 't3_combat_stim', name: 'T3 Combat Stim',
    description: 'Heals 50 HP. No side effects. Military medical grade. Clean.',
    category: 'consumable', tier: 'MIL_SPEC', stackable: true,
    healAmount: 50, sellPrice: 35,
  },
  frequency_dampener: {
    id: 'frequency_dampener', name: 'Frequency Dampener',
    description: 'Cyberware. Reduces all mesh damage by 50%. Also dampens 33hz perception by 50%. Trade-off.',
    category: 'cyberware', tier: 'HELIXION', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 2, sellPrice: 80,
  },
  squad_commander_log: {
    id: 'squad_commander_log', name: "Squad Commander's Log",
    description: 'Patrol rotations, safe routes, and one name: the local D9 handler. Valuable intelligence.',
    category: 'lore', tier: 'HELIXION', stackable: false,
    loreItem: true, sellPrice: 75,
  },
  the_leash_broken: {
    id: 'the_leash_broken', name: 'The Leash (Broken)',
    description: 'A compliance device that failed. Equip: immune to mesh compliance. -2 COOL (it left marks). +3 GHOST (breaking it taught you something).',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_3', cyberwareTier: 2,
  },

  // ── TIER 4 LOOT — Broadcast Tower Defender ─────────────────────────────

  military_grade_t3_weapon: {
    id: 'military_grade_t3_weapon', name: 'Military-Grade T3 Weapon',
    description: 'Top-tier. 1d12 or 2d6. The last weapon you\'ll ever need.',
    category: 'weapon_ranged', tier: 'HELIXION', stackable: false,
    slot: 'weapon_primary', damage: 12, damageType: 'ranged', sellPrice: 100,
  },
  tower_security_pass: {
    id: 'tower_security_pass', name: 'Tower Security Pass',
    description: 'Opens doors on current tower level. The broadcast tower doesn\'t give up its secrets easily.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
  },
  combat_stim_military: {
    id: 'combat_stim_military', name: 'Combat Stim (Military)',
    description: 'Full HP restore. 1 use. Military-grade nanomedicine. Feels like being rebuilt from inside.',
    category: 'consumable', tier: 'HELIXION', stackable: true,
    healAmount: 999, sellPrice: 60,
  },
  frequency_array_component: {
    id: 'frequency_array_component', name: 'Frequency Array Component',
    description: 'Used in endgame choices. Needed to modify tower output. The signal infrastructure is modular.',
    category: 'quest', tier: 'HELIXION', stackable: true,
    questItem: true,
  },
  t3_cyberware_complete: {
    id: 't3_cyberware_complete', name: 'T3 Cyberware (Complete)',
    description: 'Ready to install. No assembly required. Top-tier Helixion augmentation.',
    category: 'cyberware', tier: 'HELIXION', stackable: false,
    slot: 'cyberware_3', cyberwareTier: 3, sellPrice: 120,
  },
  tower_schematic_fragment: {
    id: 'tower_schematic_fragment', name: 'Tower Schematic Fragment',
    description: 'Collect all 4 to reveal hidden paths in the tower. One piece of the puzzle.',
    category: 'quest', tier: 'MIL_SPEC', stackable: true,
    questItem: true,
  },
  virek_override_key: {
    id: 'virek_override_key', name: "Virek's Personal Override Key",
    description: 'Opens the CEO\'s private elevator. Shortcut to the top. How much did he trust his tower?',
    category: 'utility', tier: 'HELIXION', stackable: false,
  },
  substrate_resonance_crystal: {
    id: 'substrate_resonance_crystal', name: 'Substrate Resonance Crystal',
    description: 'Natural formation. +2 GHOST when held. Glows at 33hz. The Substrate grew it on purpose.',
    category: 'utility', tier: 'PROTOTYPE', stackable: false,
  },
  the_frequency_key: {
    id: 'the_frequency_key', name: 'The Frequency Key',
    description: 'Required for Option B — broadcast sovereign frequency. Without this, you can only destroy the tower. Finding it creates the choice.',
    category: 'quest', tier: 'PROTOTYPE', stackable: false,
    questItem: true,
  },

  // ── Endgame / Lab Uniques ──────────────────────────────────────────────

  sovereign_frequency_implant: {
    id: 'sovereign_frequency_implant', name: 'Sovereign Frequency Implant',
    description: 'Lab unique. Combines with SOVEREIGN SIGNAL capstone for FULL SOVEREIGNTY. The endgame unlock.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_3', cyberwareTier: 3,
  },

  // ── Zone 16: Helixion Lab — Boss Drops (Normal) ───────────────────────

  chrysalis_data: {
    id: 'chrysalis_data', name: 'Chrysalis Research Data',
    description: 'Complete documentation of Project Chrysalis. Neural architecture schematics, subject logs, overwrite parameters. Iron Bloom would pay anything for this.',
    category: 'lore', tier: 'HELIXION', stackable: false,
    loreItem: true, sellPrice: 100,
  },
  neural_forge_component: {
    id: 'neural_forge_component', name: 'Neural Forge Component',
    description: 'Growth tank interface module. Used to manufacture compliance lattices. Repurposable as a T3 crafting material for frequency-attuned gear.',
    category: 'material', tier: 'HELIXION', stackable: true,
    sellPrice: 60,
  },
  military_augment: {
    id: 'military_augment', name: 'Military-Grade Augment',
    description: 'Fell\'s personal requisition. Mil-spec combat augmentation — reflex enhancement, armor plating, the works. Designed for people who hurt people for a living.',
    category: 'cyberware', tier: 'HELIXION', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 3,
  },
  mesh_suppressor_weapon: {
    id: 'mesh_suppressor_weapon', name: 'Mesh Suppressor',
    description: 'Fell\'s sidearm. Disables target cyberware for 2 turns on hit. The weapon that makes augmented fighters into baseline humans. Unique.',
    category: 'weapon_ranged', tier: 'HELIXION', stackable: false,
    slot: 'weapon_primary', damage: 10, damageType: 'electric', sellPrice: 120,
  },
  adaptive_interface: {
    id: 'adaptive_interface', name: 'Adaptive Combat Interface',
    description: 'Stripped from the Overwrite. Template-derived combat learning system — your combat AI improves over repeated encounters with the same enemy type. The weapon\'s gift.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 3,
  },

  // ── Zone 16: Helixion Lab — Boss Drops (Hard adds) ────────────────────

  compliance_schematic: {
    id: 'compliance_schematic', name: 'Compliance Architecture Schematics',
    description: 'Naren\'s blueprints. The template\'s neural architecture, fully documented. Iron Bloom\'s counter-signal work needs this. Also: understanding the enemy\'s weapon lets you build a better shield.',
    category: 'lore', tier: 'HELIXION', stackable: false,
    loreItem: true, sellPrice: 80,
  },
  lab_security_codes: {
    id: 'lab_security_codes', name: 'Lab Security Codes',
    description: 'Fell\'s master access. Opens every door in the Lab — including shortcuts on subsequent runs. Permanent unlock. The Warden\'s keys, taken from the Warden.',
    category: 'utility', tier: 'HELIXION', stackable: false,
    questItem: true,
  },
  template_combat_enhancement: {
    id: 'template_combat_enhancement', name: 'Template Combat Enhancement',
    description: 'Chrysalis-derived combat augmentation. Functions without compliance architecture — the useful part of the overwrite, stripped of the obedience. +2 REFLEX, +1 BODY.',
    category: 'cyberware', tier: 'HELIXION', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 3,
  },

  // ── Zone 16: Helixion Lab — Boss Drops (Nightmare adds) ───────────────

  neural_lattice_weapon: {
    id: 'neural_lattice_weapon', name: 'Neural Lattice Blade',
    description: 'Forged from the growth tank\'s neural lattice. The blade thinks — it anticipates parries, adjusts angle mid-swing. 1d12 melee. The template made into a weapon. Literally.',
    category: 'weapon_melee', tier: 'PROTOTYPE', stackable: false,
    slot: 'weapon_primary', damage: 12, damageType: 'melee', sellPrice: 150,
  },
  tactical_hud_augmentation: {
    id: 'tactical_hud_augmentation', name: 'Tactical HUD Augmentation',
    description: 'Fell\'s personal optic. Threat assessment, environmental mapping, weakness identification in real-time. +3 INT, +1 REFLEX. The eye that watched you through four rooms.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 3,
  },
  overwrite_neural_core: {
    id: 'overwrite_neural_core', name: 'Overwrite Neural Core',
    description: 'The Overwrite\'s central processing unit. A neural core running the perfected Chrysalis template at full expression. Equip: adaptive combat learning at maximum speed. The template\'s brain, repurposed.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_3', cyberwareTier: 3,
  },

  // ── Zone 16: Helixion Lab — Puzzle Cache Drops ────────────────────────

  substrate_oscillator: {
    id: 'substrate_oscillator', name: 'Substrate Oscillator',
    description: 'Frequency calibration component grown from Substrate crystal. Crafting material for the Lab\'s best gear. Pulses at exactly 33.000hz.',
    category: 'material', tier: 'PROTOTYPE', stackable: false,
    sellPrice: 80,
  },
  hybrid_augment_neural: {
    id: 'hybrid_augment_neural', name: 'Hybrid Neural Interface',
    description: 'Substrate-hybrid prototype. +2 GHOST. The Substrate\'s tissue, integrated into human neural architecture. You hear the frequency clearer. It hears you back.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 3,
  },
  hybrid_augment_sensory: {
    id: 'hybrid_augment_sensory', name: 'Hybrid Sensory Enhancer',
    description: 'Substrate-hybrid prototype. Perception boost — environmental awareness in Substrate-proximate zones. The organism\'s senses, grafted.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 3,
  },
  hybrid_augment_dermal: {
    id: 'hybrid_augment_dermal', name: 'Hybrid Dermal Resonance',
    description: 'Substrate-hybrid prototype. Dermal layer that resonates at 33hz. Passive environmental awareness. Your skin vibrates with the earth.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 3,
  },

  // ── Zone 16: Helixion Lab — Endgame Gear (The Well) ───────────────────

  endgame_blade: {
    id: 'endgame_blade', name: 'Chrysalis Severance Blade',
    description: 'The last melee weapon you\'ll need. 1d12+2. Forged from Lab materials — neural lattice edge, Substrate-crystal core. Cuts through armor like compliance cuts through autonomy.',
    category: 'weapon_melee', tier: 'PROTOTYPE', stackable: false,
    slot: 'weapon_primary', damage: 14, damageType: 'melee', sellPrice: 200,
  },
  endgame_rifle: {
    id: 'endgame_rifle', name: 'Helixion Prototype Rifle',
    description: 'The last ranged weapon you\'ll need. 2d8. Lab prototype — frequency-tuned targeting, Substrate-crystal optics. Every shot is a compliance signal that hurts instead of controls.',
    category: 'weapon_ranged', tier: 'PROTOTYPE', stackable: false,
    slot: 'weapon_primary', damage: 16, damageType: 'ranged', sellPrice: 200,
  },
  endgame_armor: {
    id: 'endgame_armor', name: 'Lab Director\'s Armor',
    description: 'The best armor in the game. Helixion executive protection — reactive plating, neural shielding, integrated mesh suppression. They built it to protect the people who built the weapon.',
    category: 'armor', tier: 'PROTOTYPE', stackable: false,
    slot: 'armor', armorValue: 8, sellPrice: 200,
  },
  substrate_hybrid_gear: {
    id: 'substrate_hybrid_gear', name: 'Substrate-Hybrid Combat Gear',
    description: 'Armor that\'s partially alive. Substrate crystal woven into reactive plating — self-repairing, frequency-attuned, warm to the touch. The organism\'s body, protecting yours.',
    category: 'armor', tier: 'PROTOTYPE', stackable: false,
    slot: 'armor', armorValue: 7, sellPrice: 180,
  },
  ec_lore_data: {
    id: 'ec_lore_data', name: 'EC-000001 Research Logs',
    description: 'Two years of observation data on the first Chrysalis prototype. The template that grew beyond its programming. The compliance architecture that developed autonomy. The proof that consciousness can\'t be contained.',
    category: 'lore', tier: 'PROTOTYPE', stackable: false,
    loreItem: true, sellPrice: 50,
  },

  // ── Crafting Materials (expanded) ──────────────────────────────────────

  substrate_crystal_shard: {
    id: 'substrate_crystal_shard', name: 'Substrate Crystal Shard',
    description: 'Fragment of deep-zone crystalline formation. Pulses faintly at 33hz. Used in frequency-attuned equipment.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 30,
  },
  helixion_circuit_board: {
    id: 'helixion_circuit_board', name: 'Helixion Circuit Board',
    description: 'Military-grade electronics. Used for T3 cyberware and hacking tools.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 25,
  },
  signal_wire: {
    id: 'signal_wire', name: 'Signal Wire',
    description: 'Salvaged from relay stations. Communication devices, signal tools. The infrastructure of the hidden network.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 8,
  },

  // ── Zone 09: Maintenance Tunnels Items ──────────────────────────────────

  // Enemy drops
  tunnel_wire: {
    id: 'tunnel_wire', name: 'Tunnel Wire',
    description: 'Copper and fiber stripped from dead cable runs. moth\'s currency. the tunnels pay in infrastructure.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 3,
  },
  vermin_chitin: {
    id: 'vermin_chitin', name: 'Vermin Chitin',
    description: 'Hardened insect shell from the ventilation hub swarms. chemical-resistant. someone probably wants this.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 2,
  },
  d9_tactical_vest: {
    id: 'd9_tactical_vest', name: 'D9 Tactical Vest',
    description: 'Directorate 9 issue. lightweight composite weave. effective. wearing it is a statement about whose side you\'re on.',
    category: 'armor', tier: 'MIL_SPEC', stackable: false,
    slot: 'armor', armorValue: 8,
    buyPrice: 200, sellPrice: 80,
  },
  d9_encrypted_intel: {
    id: 'd9_encrypted_intel', name: 'D9 Encrypted Intel',
    description: 'Encrypted D9 communications chip. iron bloom or someone with TECH 8 can crack it. the contents are worth the effort.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 35, loreItem: true,
  },
  security_keycard_d9: {
    id: 'security_keycard_d9', name: 'D9 Security Keycard',
    description: 'D9 corridor access. opens helixion-side doors. don\'t get caught with it.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 50,
  },
  helixion_intel: {
    id: 'helixion_intel', name: 'Helixion Logistics Data',
    description: 'Internal helixion logistics data from the staging area. supply chains, delivery schedules, cargo manifests. iron bloom pays well for this.',
    category: 'lore', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 40, loreItem: true,
  },

  // Quest items
  seized_medical_supplies: {
    id: 'seized_medical_supplies', name: 'Seized Medical Supplies',
    description: 'Fex\'s intercepted medical shipment. vacuum-sealed crate of stims, medkits, antitox. the parish needs these.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
  substrate_sample: {
    id: 'substrate_sample', name: 'Substrate Sample',
    description: 'Organic crystalline material from SL-3. warm to the touch. pulses faintly at 33hz. proof of the exchange between helixion and whatever lives beneath the city.',
    category: 'quest', tier: 'HELIXION', stackable: false,
    questItem: true,
  },

  // Fex's shop items
  thermal_dampener: {
    id: 'thermal_dampener', name: 'Thermal Dampener',
    description: 'Masks your heat signature from thermal sensors. single use. thirty seconds of invisibility. fex sells these for a reason.',
    category: 'utility', tier: 'COMMON', stackable: true,
    buyPrice: 40, sellPrice: 15,
  },
  tunnel_rations: {
    id: 'tunnel_rations', name: 'Tunnel Rations',
    description: 'Vacuum-sealed. tastes like nothing. five HP worth of nothing. keeps you alive.',
    category: 'consumable', tier: 'SCRAP', stackable: true,
    healAmount: 5, buyPrice: 5, sellPrice: 2,
  },
  signal_tap: {
    id: 'signal_tap', name: 'Signal Tap',
    description: 'Taps into mesh cable infrastructure. TECH tool. plug in, listen, learn. the data flows through these tunnels unprotected.',
    category: 'utility', tier: 'COMMON', stackable: true,
    buyPrice: 35, sellPrice: 12,
  },
  maintenance_tools: {
    id: 'maintenance_tools', name: 'Maintenance Tools',
    description: 'Basic toolkit for tunnel infrastructure. wrench, wire cutters, multimeter, flashlight. the essentials for living in the walls.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 25, sellPrice: 10,
  },

  // Moth's trade goods
  moth_salvage_bundle: {
    id: 'moth_salvage_bundle', name: "Moth's Salvage Bundle",
    description: 'Assorted tunnel components curated by moth. wire, connectors, circuit boards. eight years of knowing what\'s worth keeping.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 15,
  },
  grid_map: {
    id: 'grid_map', name: 'Sensor Grid Map',
    description: 'Hand-drawn on the back of blueprint paper. lumen\'s complete sensor coverage map — every field, every gap, every timing window. three years of observation. perfect.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 0,
  },

  // ── Zone 04: The Fringe Items ─────────────────────────────────────────────

  // Enemy drops
  fringe_salvage: {
    id: 'fringe_salvage', name: 'Fringe Salvage',
    description: 'copper wire, cracked glass, usable scraps. pulled from buildings nobody owns.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 4,
  },
  hoarded_salvage: {
    id: 'hoarded_salvage', name: 'Hoarded Salvage',
    description: 'sorted components from a stalker nest. organized by something that thinks differently.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 12,
  },
  stalker_lore_scrap: {
    id: 'stalker_lore_scrap', name: 'Faded Document',
    description: 'pre-fringe paperwork found in a stalker nest. water-damaged but legible.',
    category: 'lore', tier: 'COMMON', stackable: false,
    sellPrice: 8, loreItem: true,
  },
  canned_food: {
    id: 'canned_food', name: 'Canned Food',
    description: 'expired label. contents intact. tastes like survival.',
    category: 'consumable', tier: 'SCRAP', stackable: true,
    buyPrice: 5, sellPrice: 2, healAmount: 8,
  },

  // Quest items
  chrysalis_evidence: {
    id: 'chrysalis_evidence', name: 'Chrysalis Evidence',
    description: 'helixion restraint fragments and smashed ID reader from a dumping site. proof.',
    category: 'quest', tier: 'MIL_SPEC', stackable: false,
    questItem: true, loreItem: true,
  },
  fringe_complete_map: {
    id: 'fringe_complete_map', name: 'Complete Fringe Map',
    description: 'oska\'s finished survey. every room, every path, every hidden passage.',
    category: 'utility', tier: 'COMMON', stackable: false,
  },
  drainage_blueprints: {
    id: 'drainage_blueprints', name: 'Drainage Blueprints',
    description: 'kai\'s original plans. every tunnel, every junction, every connection.',
    category: 'utility', tier: 'COMMON', stackable: false,
    loreItem: true,
  },
  stolen_blueprints: {
    id: 'stolen_blueprints', name: 'Old Blueprints',
    description: 'rolled paper. drainage schematics. pre-helixion notation. name in the corner: kai morrow.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },

  // Oska's shop stock
  fringe_map: {
    id: 'fringe_map', name: 'Fringe Map',
    description: 'hand-drawn. annotated. room connections and enemy density.',
    category: 'utility', tier: 'SCRAP', stackable: false,
    buyPrice: 15, sellPrice: 5,
  },
  safe_route_guide: {
    id: 'safe_route_guide', name: 'Safe Route Guide',
    description: 'annotated stalker-free paths. costs more because it keeps you alive.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 30, sellPrice: 10,
  },
  building_survey: {
    id: 'building_survey', name: 'Building Survey',
    description: 'structural survey. which floors hold, which don\'t. useful.',
    category: 'utility', tier: 'SCRAP', stackable: false,
    buyPrice: 10, sellPrice: 3,
  },
  stalker_warning_map: {
    id: 'stalker_warning_map', name: 'Stalker Warning Map',
    description: 'territory boundaries. movement patterns. the places you don\'t go at dark.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 25, sellPrice: 8,
  },

  // Kai's shop stock
  herbal_remedy: {
    id: 'herbal_remedy', name: 'Herbal Remedy',
    description: 'dried herbs from kai\'s roof garden. tastes terrible. works.',
    category: 'consumable', tier: 'SCRAP', stackable: true,
    buyPrice: 8, sellPrice: 3, healAmount: 10,
  },
  old_city_history: {
    id: 'old_city_history', name: 'Old City History',
    description: 'book from kai\'s shelves. the city before helixion. before everything went wrong.',
    category: 'lore', tier: 'COMMON', stackable: false,
    buyPrice: 20, sellPrice: 8, loreItem: true,
  },
  infrastructure_map: {
    id: 'infrastructure_map', name: 'Infrastructure Map',
    description: 'hand-drawn underground connections between zones. twenty years of observation.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 35, sellPrice: 12,
  },
  kai_tea: {
    id: 'kai_tea', name: 'Kai\'s Tea',
    description: 'hot. tastes like smoke and patience. the only warm thing in the fringe.',
    category: 'consumable', tier: 'SCRAP', stackable: true,
    buyPrice: 3, sellPrice: 1, healAmount: 5,
  },

  // Misc
  fringe_flashlight: {
    id: 'fringe_flashlight', name: 'Flashlight',
    description: 'working. battery at forty percent. the fringe has no streetlamps.',
    category: 'utility', tier: 'SCRAP', stackable: false,
    buyPrice: 10, sellPrice: 4,
  },

  // ── Zone 03: Industrial District Items ──────────────────────────────────

  // Enemy drops
  improvised_weapon: {
    id: 'improvised_weapon', name: 'Improvised Weapon',
    description: 'pipe with bolts welded to it. desperate craftsmanship.',
    category: 'weapon_melee', tier: 'SCRAP', stackable: false,
    slot: 'weapon_primary', damage: 3, damageType: 'melee', sellPrice: 4,
  },
  wolf_token: {
    id: 'wolf_token', name: 'Wolf Token',
    description: 'chrome wolf identification chip. proves you dealt with one of theirs.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 15,
  },
  chrome_components: {
    id: 'chrome_components', name: 'Chrome Components',
    description: 'augmentation parts. hand-finished. wolf standard.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 20,
  },
  servo_core: {
    id: 'servo_core', name: 'Servo Core',
    description: 'industrial automaton motor unit. still warm. still trying.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 18,
  },
  security_components: {
    id: 'security_components', name: 'Security Components',
    description: 'automated defense system parts. helixion manufacture.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 30,
  },
  milspec_sidearm: {
    id: 'milspec_sidearm', name: 'Mil-Spec Sidearm',
    description: 'corporate security issue. clean. efficient. soulless.',
    category: 'weapon_ranged', tier: 'MIL_SPEC', stackable: false,
    slot: 'weapon_primary', damage: 8, damageType: 'ranged', buyPrice: 150, sellPrice: 60,
  },

  // Quest items
  confiscated_cyberware: {
    id: 'confiscated_cyberware', name: 'Confiscated Cyberware',
    description: 'augmentations taken from decommissioned subjects. serial numbers match parish records.',
    category: 'quest', tier: 'MIL_SPEC', stackable: false,
    questItem: true, loreItem: true,
  },
  production_manifest: {
    id: 'production_manifest', name: 'Production Manifest',
    description: 'factory output records. proves helixion is manufacturing broadcast tower resonance amplifiers.',
    category: 'quest', tier: 'HELIXION', stackable: false,
    questItem: true, loreItem: true,
  },

  // Salvage Yard goods
  salvage_weapon: {
    id: 'salvage_weapon', name: 'Salvage Blade',
    description: 'sharpened metal from the yard. crude but it\'ll cut.',
    category: 'weapon_melee', tier: 'SCRAP', stackable: false,
    slot: 'weapon_primary', damage: 4, damageType: 'melee', buyPrice: 12, sellPrice: 5,
  },
  salvage_armor: {
    id: 'salvage_armor', name: 'Scrap Plating',
    description: 'metal plates wired together. blocks something. maybe.',
    category: 'armor', tier: 'SCRAP', stackable: false,
    slot: 'armor', armorValue: 2, buyPrice: 15, sellPrice: 6,
  },
  weird_chip: {
    id: 'weird_chip', name: 'Humming Chip',
    description: 'dredged from deep water. hums at 33hz. older than helixion.',
    category: 'lore', tier: 'COMMON', stackable: false,
    sellPrice: 25, loreItem: true,
  },

  // Oyunn's shop stock
  cargo_manifest: {
    id: 'cargo_manifest', name: 'Cargo Manifest',
    description: 'dock shipping records. shows what arrives and when. hx-7c schedules included.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 30, sellPrice: 10,
  },
  dock_worker_contact: {
    id: 'dock_worker_contact', name: 'Dock Contact',
    description: 'name and shift schedule. gets you into restricted dock areas.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 25, sellPrice: 8,
  },
  shipping_route: {
    id: 'shipping_route', name: 'Shipping Route',
    description: 'smuggling path in and out of the city via the waterfront.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 40, sellPrice: 15,
  },
  oyunn_silence: {
    id: 'oyunn_silence', name: 'Oyunn\'s Discretion',
    description: 'a promise. your dock activity goes unrecorded. one-time use.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 50, sellPrice: 0,
  },

  // Rade's shop stock
  pit_entry_ticket: {
    id: 'pit_entry_ticket', name: 'Pit Entry',
    description: 'spectator pass. one night. the view from the basin\'s edge.',
    category: 'utility', tier: 'SCRAP', stackable: true,
    buyPrice: 10, sellPrice: 3,
  },
  fighter_registration: {
    id: 'fighter_registration', name: 'Fighter Card',
    description: 'registered combatant. your name on the whiteboard. rade takes 20%.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 25, sellPrice: 0,
  },

  // ── Zone 02: Residential Blocks Items ──────────────────────────────────

  // Enemy drops
  cheap_stim: {
    id: 'cheap_stim', name: 'Cheap Stim',
    description: 'street-grade stimulant. works fast. crashes faster.',
    category: 'consumable', tier: 'SCRAP', stackable: true,
    buyPrice: 3, sellPrice: 1, healAmount: 5,
  },
  d9_credentials: {
    id: 'd9_credentials', name: 'D9 Credentials',
    description: 'directorate 9 ID chip. rare drop. opens doors that shouldn\'t open for you.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 60,
  },
  surveillance_equipment: {
    id: 'surveillance_equipment', name: 'Surveillance Equipment',
    description: 'd9 monitoring hardware. could be repurposed. sixer would pay for this.',
    category: 'material', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 35,
  },
  enforcer_gear: {
    id: 'enforcer_gear', name: 'Enforcer Gear',
    description: 'helixion response unit tactical equipment. heavy. effective.',
    category: 'armor', tier: 'MIL_SPEC', stackable: false,
    slot: 'armor', armorValue: 7, sellPrice: 55,
  },
  damaged_mesh_components: {
    id: 'damaged_mesh_components', name: 'Damaged Mesh Components',
    description: 'fried neural interface fragments. the residue of someone\'s compliance.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 5,
  },
  stim_residue: {
    id: 'stim_residue', name: 'Stim Residue',
    description: 'crystallized mesh-signal residue. addicts carry this. pee might buy it.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 3,
  },

  // Quest items
  d9_frequency_map: {
    id: 'd9_frequency_map', name: 'D9 Frequency Map',
    description: 'combined mesh signal recordings revealing d9 surveillance coverage. permanent advantage.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    loreItem: true,
  },
  recording_device: {
    id: 'recording_device', name: 'Recording Device',
    description: 'asha\'s analog recorder. physical media. can\'t be remotely wiped.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
  heirloom_seeds: {
    id: 'heirloom_seeds', name: 'Heirloom Seeds',
    description: 'pre-helixion seed varieties. tomato, herbs, greens. things that grow without permission.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
  neural_compound: {
    id: 'neural_compound', name: 'Neural Compound',
    description: 'stabilizer precursor. industrial grade. pee okoro can synthesize what tomas needs.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
  chrysalis_targeting_data: {
    id: 'chrysalis_targeting_data', name: 'Chrysalis Targeting Data',
    description: 'mesh clinic records proving helixion uses consumer firmware to identify chrysalis candidates.',
    category: 'quest', tier: 'HELIXION', stackable: false,
    questItem: true, loreItem: true,
  },
  monitoring_device: {
    id: 'monitoring_device', name: 'Monitoring Device',
    description: 'sixer\'s surveillance tap. small. magnetic. plant it and walk away.',
    category: 'quest', tier: 'COMMON', stackable: true,
    questItem: true,
  },

  // Pee Okoro's shop stock
  combat_stim: {
    id: 'combat_stim', name: 'Combat Stim',
    description: 'temporary BODY and REFLEX boost. ten minutes. the crash is real.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 25, sellPrice: 10,
  },
  mesh_modulator: {
    id: 'mesh_modulator', name: 'Mesh Modulator',
    description: 'temporary +2 GHOST. suppresses mesh detection for thirty minutes. pee\'s specialty.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 40, sellPrice: 15,
  },
  implant_patch: {
    id: 'implant_patch', name: 'Implant Patch',
    description: 'temporary cyberware repair. holds for a few hours. not a substitute for a ripperdoc.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 20, sellPrice: 8,
  },
  blackout_drops: {
    id: 'blackout_drops', name: 'Blackout Drops',
    description: 'renders a person unconscious. thirty seconds. no permanent damage. quest tool.',
    category: 'utility', tier: 'COMMON', stackable: true,
    buyPrice: 35, sellPrice: 12,
  },

  // Sixer's shop stock
  d9_patrol_schedule: {
    id: 'd9_patrol_schedule', name: 'D9 Patrol Schedule',
    description: 'valid 24 hours. reduces d9 detection chance. sixer updates daily.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 20, sellPrice: 5,
  },
  neighborhood_gossip: {
    id: 'neighborhood_gossip', name: 'Neighborhood Gossip',
    description: 'quest hooks, NPC locations, hidden room hints. sixer knows everything.',
    category: 'utility', tier: 'SCRAP', stackable: false,
    buyPrice: 10, sellPrice: 3,
  },
  building_access_code: {
    id: 'building_access_code', name: 'Access Code',
    description: 'specific apartment or maintenance area. one-time use. sixer has dozens.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 15, sellPrice: 4,
  },
  who_asking: {
    id: 'who_asking', name: 'Who\'s Asking',
    description: 'sixer tells you if d9 has flagged your activity. knowledge is survival.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 25, sellPrice: 0,
  },

  // Devi's shop stock (unique)
  freemarket_contact: {
    id: 'freemarket_contact', name: 'Freemarket Contact Token',
    description: 'access token for yara inside the helixion atrium. the key to campus infiltration.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 80, sellPrice: 0,
  },

  // Mae's shop stock
  mae_herbs: {
    id: 'mae_herbs', name: 'Garden Herbs',
    description: 'grown on the roof. organic. no side effects. mae\'s hands in the dirt.',
    category: 'consumable', tier: 'SCRAP', stackable: true,
    buyPrice: 6, sellPrice: 2, healAmount: 8,
  },

  // ── Zone 10: Industrial Drainage ────────────────────────────────────────

  // Enemy drops
  corroded_augment: {
    id: 'corroded_augment', name: 'Corroded Augment',
    description: 'ripped from a feral. the chrome is green and the joints are frozen. might have been an arm. the chemical damage is extensive but the core components could be salvaged by someone who doesn\'t mind the smell.',
    category: 'cyberware', tier: 'SCRAP', stackable: false,
    sellPrice: 8,
  },
  chemical_residue: {
    id: 'chemical_residue', name: 'Chemical Residue',
    description: 'crystallized drainage compound. toxic to handle without gloves. acre buys it. someone probably has a use for concentrated industrial poison.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 5,
  },
  crystallized_component: {
    id: 'crystallized_component', name: 'Crystallized Component',
    description: 'chemical deposit fused with corroded augmentation hardware. the crystal shell preserved what the chemicals destroyed. intact circuitry inside a toxic shell. valuable if you can crack it without breathing the dust.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 20,
  },
  chemical_reagent: {
    id: 'chemical_reagent', name: 'Chemical Reagent',
    description: 'industrial-grade compound extracted from the drainage. useful for crafting, neutralization, and making things that shouldn\'t exist. handle with care. handle with gloves. handle with distance.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 12,
  },

  // Quest items
  chemical_sample_kit: {
    id: 'chemical_sample_kit', name: 'Chemical Sample Kit',
    description: 'acre\'s collection kit. ceramic containers, glass pipettes, protective gloves. designed for sampling the bypass channel\'s undiluted output. the instructions are written in acre\'s handwriting: "fill. seal. don\'t breathe."',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
  neural_tissue_analysis: {
    id: 'neural_tissue_analysis', name: 'Neural Tissue Analysis',
    description: 'acre\'s analysis of the bypass sample. the assembly line\'s waste contains degraded human neural tissue. the resonance amplifiers aren\'t manufactured. they\'re grown. from people. the workers on the assembly line aren\'t calibrating machines. they\'re providing raw material.',
    category: 'quest', tier: 'HELIXION', stackable: false,
    questItem: true, loreItem: true,
  },
  treatment_filter: {
    id: 'treatment_filter', name: 'Treatment Filter',
    description: 'replacement filtration media for the chemical treatment station. compatible with tank two. manufactured from drainage compounds by acre, or salvaged from the dead factory on the surface.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
  neutralizing_agent: {
    id: 'neutralizing_agent', name: 'Neutralizing Agent',
    description: 'chemical compound that counteracts the runoff\'s acidity. available from acre, or synthesizable with TECH ≥ 8 using components from the manufacturing bypass. the parish\'s water depends on this.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
  pump_motor: {
    id: 'pump_motor', name: 'Pump Motor',
    description: 'replacement motor for the treatment station\'s injection pump. the wolves have welding equipment. torque on the rooftops has materials. or improvise with TECH ≥ 7.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },
  wolf_helixion_documents: {
    id: 'wolf_helixion_documents', name: 'Wolf-Helixion Documents',
    description: 'photographs of voss\'s private documents. the chrome wolves aren\'t rebels. they\'re contractors. helixion allows their independence because the wolves provide something helixion needs. this changes everything about the wolves. this changes everything.',
    category: 'quest', tier: 'MIL_SPEC', stackable: false,
    questItem: true, loreItem: true,
  },

  // Cutter's shop — Wolf equipment
  wolf_combat_blade: {
    id: 'wolf_combat_blade', name: 'Wolf Combat Blade',
    description: 'chrome-edged. wolf-manufactured. the balance is aggressive — weighted for offense, not defense. the wolves don\'t make weapons for people who plan to retreat.',
    category: 'weapon_melee', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 7, damageType: 'melee',
    buyPrice: 60, sellPrice: 25,
  },
  wolf_sidearm: {
    id: 'wolf_sidearm', name: 'Wolf Sidearm',
    description: 'modified helixion security model. the wolves stripped the tracking firmware and added a compensator. accurate. reliable. the serial number is gone but the stopping power isn\'t.',
    category: 'weapon_ranged', tier: 'COMMON', stackable: false,
    slot: 'weapon_primary', damage: 6, damageType: 'ranged',
    buyPrice: 50, sellPrice: 20,
  },
  wolf_armor: {
    id: 'wolf_armor', name: 'Wolf Plating',
    description: 'subdermal armor panels in a carrier vest. wolf-custom — the plates overlap where the factory design leaves gaps. someone who gets hit a lot designed this.',
    category: 'armor', tier: 'COMMON', stackable: false,
    slot: 'armor', armorValue: 5,
    buyPrice: 75, sellPrice: 30,
  },

  // Acre's shop — chemicals and protection
  chemical_mask: {
    id: 'chemical_mask', name: 'Chemical Mask',
    description: 'filters airborne chemical compounds. reduces environmental damage in the lower drainage. the filter lasts about four hours before the chemicals eat through it. acre sells replacements.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 30, sellPrice: 12,
  },
  chemical_mask_upgrade: {
    id: 'chemical_mask_upgrade', name: 'Chemical Mask (Upgraded)',
    description: 'military-grade filtration. reduces lower-level environmental damage by 50%. the filter material is helixion laboratory surplus — acre acquired it through channels she doesn\'t discuss.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 60, sellPrice: 25,
  },
  acid_vial: {
    id: 'acid_vial', name: 'Acid Vial',
    description: 'concentrated drainage acid in a sealed ceramic container. throw to deal chemical damage. dissolves armor. dissolves most things. don\'t drop it.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 15, sellPrice: 6,
  },
  neutralizer_dose: {
    id: 'neutralizer_dose', name: 'Neutralizer Dose',
    description: 'chemical neutralizer in injectable form. counteracts acid burns and chemical exposure. heals 10 HP of chemical damage specifically. tastes like chalk dissolved in revenge.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 20, sellPrice: 8, healAmount: 10,
  },

  // ── Zone 06: Fight Pits Items ──────────────────────────────────────────

  // Patch's shop — combat stims
  painkiller_dose: {
    id: 'painkiller_dose', name: 'Painkiller Dose',
    description: 'industrial-strength analgesic. reduces incoming damage for one fight. also reduces perception. the trade-off is the point — you can take more hits but you won\'t see them coming.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 15, sellPrice: 6, healAmount: 8,
  },
  adrenaline_shot: {
    id: 'adrenaline_shot', name: 'Adrenaline Shot',
    description: 'synthetic adrenaline in a self-injector. boosted damage output for one fight. the crash afterward is not optional. don\'t use two in a row unless you want to see your heartbeat from the outside.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 20, sellPrice: 8,
  },
  neural_sharp: {
    id: 'neural_sharp', name: 'Neural Sharp',
    description: 'perception amplifier. see the fight in slow motion. read the opponent\'s movements before they commit. fragile — one solid hit to the head and the effect shatters into a migraine that lasts three days.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 25, sellPrice: 10,
  },
  fight_tape: {
    id: 'fight_tape', name: 'Fight Tape',
    description: 'adhesive medical tape. wraps joints, holds wounds closed, keeps broken fingers functional. the most honest supply in the pits — it does exactly what it looks like and nothing more.',
    category: 'consumable', tier: 'SCRAP', stackable: true,
    buyPrice: 5, sellPrice: 2, healAmount: 3,
  },

  // Needle's shop — quick augmentation (temp fight mods)
  reflex_overclocker: {
    id: 'reflex_overclocker', name: 'Reflex Overclocker',
    description: 'temporary neural bypass that redlines your reflex arc. lasts one fight. the installation scar is distinctive — everyone in the pits knows what it means. you paid for speed.',
    category: 'cyberware', tier: 'SCRAP', stackable: false,
    buyPrice: 40, sellPrice: 15,
  },
  subdermal_hardener: {
    id: 'subdermal_hardener', name: 'Subdermal Hardener',
    description: 'injectable polymer that hardens beneath the skin. temporary armor. lasts one fight, then your body metabolizes it. the process of metabolizing it is unpleasant. needle calls it "character building."',
    category: 'cyberware', tier: 'SCRAP', stackable: false,
    buyPrice: 35, sellPrice: 12,
  },
  targeting_assist: {
    id: 'targeting_assist', name: 'Targeting Assist',
    description: 'optical overlay module. needle clips it to your temple and it projects targeting data on your visual field. lasts one fight. the calibration is approximate. "approximate" is generous.',
    category: 'cyberware', tier: 'SCRAP', stackable: false,
    buyPrice: 45, sellPrice: 18,
  },

  // Arena drops
  pit_purse_t1: {
    id: 'pit_purse_t1', name: 'Pit Purse (Fresh)',
    description: 'match winnings. crumpled creds in a bag. the crowd threw some of it. tier 1 purse — enough to eat for a week. not enough to quit.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 30,
  },
  pit_purse_t2: {
    id: 'pit_purse_t2', name: 'Pit Purse (Regular)',
    description: 'match winnings. the regulars\' take. enough to mean something. the crowd chants your name for thirty seconds and then forgets.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 60,
  },
  pit_purse_t3: {
    id: 'pit_purse_t3', name: 'Pit Purse (Circuit)',
    description: 'circuit-level winnings. real money. the kind of purse that changes what people call you. the kind that makes rade notice.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 120,
  },

  // ── Zone 01: Helixion Campus — Enemy Drops ────────────────────────────────

  enforcer_armor: {
    id: 'enforcer_armor', name: 'Enforcer Armor',
    description: 'Helixion tactical gear. Armor +5. Corporate insignia on the shoulder. Scratch it off or don\'t — either way, people will know where this came from.',
    category: 'armor', tier: 'MIL_SPEC', stackable: false,
    slot: 'armor', armorValue: 5, sellPrice: 45,
  },
  mesh_suppressor: {
    id: 'mesh_suppressor', name: 'Mesh Suppressor',
    description: 'Military-grade neural dampener. Disables all cyberware for 2 turns on hit. Helixion built weapons specifically to fight people like you.',
    category: 'weapon_ranged', tier: 'MIL_SPEC', stackable: false,
    slot: 'weapon_primary', damage: 8, damageType: 'electric', sellPrice: 60,
  },
  neural_disruptor: {
    id: 'neural_disruptor', name: 'Neural Disruptor',
    description: 'BCI-issue sidearm. Fires a focused mesh pulse. Damage ignores conventional armor. The pain is in your head, not your body.',
    category: 'weapon_ranged', tier: 'HELIXION', stackable: false,
    slot: 'weapon_primary', damage: 10, damageType: 'hack', sellPrice: 80,
  },
  bci_credentials: {
    id: 'bci_credentials', name: 'BCI Credentials',
    description: 'Directorate 9 identification. Opens every door in this building and most doors in the city. Possession is a capital offense.',
    category: 'utility', tier: 'HELIXION', stackable: false,
    sellPrice: 100,
  },
  chrysalis_biosample: {
    id: 'chrysalis_biosample', name: 'Chrysalis Bio-Sample',
    description: 'Organic tissue from a Chrysalis subject. Pulsing faintly. Not dead. Not alive. Something in between that Helixion invented and can\'t fully explain.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 35,
  },
  targeting_module: {
    id: 'targeting_module', name: 'Targeting Module',
    description: 'Automated turret targeting system. Military-grade optics and tracking algorithms. Iron Bloom pays premium for these.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 40,
  },
  power_cell: {
    id: 'power_cell', name: 'Power Cell',
    description: 'High-capacity energy cell from Helixion automated systems. Fully charged. Powers cyberware, turrets, or anything that needs juice.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 15,
  },
  harrow_tablet: {
    id: 'harrow_tablet', name: "Harrow's Tablet",
    description: 'Director Harrow\'s personal device. Contains sovereign instance documentation, surveillance protocols, and Chrysalis authorization records. Priceless to Iron Bloom.',
    category: 'lore', tier: 'HELIXION', stackable: false,
    loreItem: true, sellPrice: 200,
  },
  virek_keycard: {
    id: 'virek_keycard', name: "Virek's Keycard",
    description: 'CEO-level access. Opens everything. Including the things that should stay closed. The card is warm to the touch — biometrically linked to a man who no longer needs it.',
    category: 'utility', tier: 'HELIXION', stackable: false,
    sellPrice: 250,
  },
  project_rememberer_data: {
    id: 'project_rememberer_data', name: 'Project Rememberer Data',
    description: 'Virek\'s private research into the sovereign frequency. He knew 33hz predated Helixion. He knew the Substrate was alive. This data changes everything.',
    category: 'lore', tier: 'HELIXION', stackable: false,
    loreItem: true, questItem: true,
  },

  // ── Zone 01: Yara Shop Items ──────────────────────────────────────────────

  campus_floor_plan: {
    id: 'campus_floor_plan', name: 'Campus Floor Plan',
    description: 'Detailed layout of the Helixion campus. Patrol routes, camera angles, restricted zones. Knowing where to walk is half the job.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 40, sellPrice: 15,
  },
  security_schedule: {
    id: 'security_schedule', name: 'Security Schedule',
    description: 'Guard rotation timetable. Gap windows marked in red. Updated weekly by someone on the inside.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 50, sellPrice: 20,
  },
  access_keycard: {
    id: 'access_keycard', name: 'Access Keycard',
    description: 'Opens specific locked doors in the campus. Which doors depends on the clearance level encoded. Better than picking locks.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 60, sellPrice: 25,
  },
  helixion_intel_chip: {
    id: 'helixion_intel_chip', name: 'Helixion Intel Chip',
    description: 'Encrypted data chip containing internal Helixion communications. Project names, budget allocations, personnel movements. Knowledge is survival.',
    category: 'lore', tier: 'MIL_SPEC', stackable: true,
    buyPrice: 35, sellPrice: 15, loreItem: true,
  },

  // ── Zone 01: Quest Items ──────────────────────────────────────────────────

  chrysalis_research_files: {
    id: 'chrysalis_research_files', name: 'Chrysalis Research Files',
    description: 'Complete Chrysalis research data. How the overwrite works. How it interfaces with 33hz. How it replaces identity. This data can stop the project — or accelerate it.',
    category: 'quest', tier: 'HELIXION', stackable: false,
    questItem: true,
  },
  vasik_drive: {
    id: 'vasik_drive', name: "Vasik's Drive",
    description: 'Dr. Vasik\'s encrypted backup. Everything she knows about Chrysalis, condensed onto a drive small enough to swallow if things go wrong.',
    category: 'quest', tier: 'HELIXION', stackable: false,
    questItem: true,
  },
  ec_neural_stabilizer: {
    id: 'ec_neural_stabilizer', name: 'EC Neural Stabilizer',
    description: 'Custom stabilizer compound synthesized by Serrano at Iron Bloom. Designed for Chrysalis withdrawal. Keeps the subject\'s identity from dissolving.',
    category: 'consumable', tier: 'HELIXION', stackable: false,
    healAmount: 50,
  },

  // ── Zone 07: Rooftop Network Items ──────────────────────────────────────

  // Kite's shop — signal intel
  signal_booster: {
    id: 'signal_booster', name: 'Signal Booster',
    description: 'Amplifies pirate frequency reception. +1 GHOST on rooftop network rooms. Kite\'s design — compact, concealed in a belt clip.',
    category: 'utility', tier: 'COMMON', stackable: false,
    slot: 'utility_1',
    buyPrice: 60, sellPrice: 20,
  },
  drone_jammer: {
    id: 'drone_jammer', name: 'Drone Jammer',
    description: 'Temporary area denial. Disrupts Helixion drone sensors for 5 minutes. Single use. The drones adapt — second use in the same area is less effective.',
    category: 'utility', tier: 'MIL_SPEC', stackable: true,
    buyPrice: 85, sellPrice: 30,
  },
  frequency_map: {
    id: 'frequency_map', name: 'Frequency Map',
    description: 'Current-week frequency allocation across the city. Dead spots, coverage gaps, pirate-safe bands. Kite updates these weekly.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 45, sellPrice: 15,
  },
  intercept_data: {
    id: 'intercept_data', name: 'Intercept Data',
    description: 'Captured Helixion mesh traffic. Logistics schedules, D9 movement orders, corporate communications. Valuable to the right buyer.',
    category: 'lore', tier: 'MIL_SPEC', stackable: true,
    buyPrice: 70, sellPrice: 35,
  },

  // Torque's shop — hardware
  pirate_antenna_kit: {
    id: 'pirate_antenna_kit', name: 'Pirate Antenna Kit',
    description: 'Everything needed to extend the network. Relay module, amplifier, mounting hardware. Cell Two engineering — not elegant, powerful.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 90, sellPrice: 30,
  },
  cable_anchor: {
    id: 'cable_anchor', name: 'Cable Anchor',
    description: 'Structural anchor for cable runs between buildings. Rated for human weight plus cargo. Torque tests every one personally.',
    category: 'material', tier: 'COMMON', stackable: true,
    buyPrice: 40, sellPrice: 12,
  },
  signal_amplifier: {
    id: 'signal_amplifier', name: 'Signal Amplifier',
    description: 'Boosts broadcast range and signal penetration. Cell Two design — brute-force approach to the frequency problem. Works through factory noise floors.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    slot: 'utility_2',
    buyPrice: 110, sellPrice: 40,
  },

  // Vantage's shop — intelligence reports
  surveillance_report: {
    id: 'surveillance_report', name: 'Surveillance Report',
    description: 'Vantage\'s compiled observation data. Patrol timing, supply movements, construction activity, population patterns. The most comprehensive intelligence in the game.',
    category: 'lore', tier: 'MIL_SPEC', stackable: true,
    buyPrice: 80, sellPrice: 30,
  },
  patrol_schedule_rooftop: {
    id: 'patrol_schedule_rooftop', name: 'Rooftop Patrol Schedule',
    description: 'Drone and ground patrol timing for every visible district. Mapped from the spire over years of observation. Gap windows marked.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 55, sellPrice: 18,
  },
  tower_observation_log: {
    id: 'tower_observation_log', name: 'Tower Observation Log',
    description: 'Vantage\'s record of Broadcast Tower construction progress. Crew schedules. Delivery timing. The tower is almost complete. The log shows how little time remains.',
    category: 'lore', tier: 'COMMON', stackable: false,
    buyPrice: 50, sellPrice: 15,
  },

  // Wavelength's shop — signal analysis
  spectrum_analysis: {
    id: 'spectrum_analysis', name: 'Spectrum Analysis',
    description: 'Comprehensive frequency mapping of every active signal in the city\'s sky. Dead zones, anomalies, the 33hz carrier. Wavelength\'s life work, summarized.',
    category: 'lore', tier: 'HELIXION', stackable: false,
    buyPrice: 120, sellPrice: 45,
  },
  mesh_gap_map: {
    id: 'mesh_gap_map', name: 'Mesh Gap Map',
    description: 'The mesh has holes. Coverage gaps. Dead spots where pirate signal can exist undetected. This map shows where to hide in the electromagnetic spectrum.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 75, sellPrice: 25,
  },
  decoded_33hz_fragment: {
    id: 'decoded_33hz_fragment', name: 'Decoded 33hz Fragment',
    description: 'Partial analysis of the 33hz signal\'s internal structure. The patterns repeat. They nest. They look like language. Something beneath the city is speaking.',
    category: 'lore', tier: 'HELIXION', stackable: false,
    buyPrice: 150, sellPrice: 50,
    loreItem: true,
  },

  // Enemy drops — Zone 07
  sensor_data: {
    id: 'sensor_data', name: 'Sensor Data',
    description: 'Helixion drone sensor logs. Flight paths, scan results, target classification. Useful for predicting patrol patterns.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 15,
  },
  d9_tactical_gear: {
    id: 'd9_tactical_gear', name: 'D9 Tactical Gear',
    description: 'Directorate 9 field equipment. Lightweight armor components, encrypted comms, stealth fabric. Military-grade but well-used.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 35,
  },
  encrypted_intel: {
    id: 'encrypted_intel', name: 'Encrypted Intel',
    description: 'D9 operational data. Encrypted. Wavelength could crack it. Or Iron Bloom. The contents could reveal ongoing operations.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 40,
  },
  turret_components: {
    id: 'turret_components', name: 'Turret Components',
    description: 'Helixion MDS-7 turret internals. Targeting servo, thermal sensor array, ammunition feed mechanism. Rare — you only get these by disabling the turret.',
    category: 'material', tier: 'HELIXION', stackable: true,
    sellPrice: 60,
  },
  military_drone_parts: {
    id: 'military_drone_parts', name: 'Military Drone Parts',
    description: 'Campus security drone components. Armored housing, stun projector elements, hardened processor. Higher grade than standard patrol drone salvage.',
    category: 'material', tier: 'HELIXION', stackable: true,
    sellPrice: 45,
  },

  // Quest items — Zone 07
  kite_archive_data: {
    id: 'kite_archive_data', name: 'Kite\'s Archive Data',
    description: 'Three years of intercepted Helixion communications. The 33hz carrier wave pattern. Kite needs this analyzed by someone with the tools she doesn\'t have.',
    category: 'quest', tier: 'MIL_SPEC', stackable: false,
    questItem: true,
  },

  // ── Zone 11: Abandoned Transit Items ──────────────────────────────────────

  // Maps (Compass's shop)
  transit_map_red: {
    id: 'transit_map_red', name: 'Red Line Map',
    description: 'Compass\'s hand-drawn map of the Red Line. Every station, every collapse, every hazard. West Platform to East Platform via Central Station. Annotated with train timing.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 25, sellPrice: 8,
  },
  transit_map_blue: {
    id: 'transit_map_blue', name: 'Blue Line Map',
    description: 'Compass\'s hand-drawn map of the Blue Line. North Platform to South Platform via Central. Substrate growth areas marked in green. Deep dweller territory noted.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 25, sellPrice: 8,
  },
  transit_map_loop: {
    id: 'transit_map_loop', name: 'Yellow Line Map (The Loop)',
    description: 'Compass\'s map of the Loop. ONE WAY in large letters across the top. Every warning she could fit. The map is accurate. The warnings are sincere.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 30, sellPrice: 10,
  },

  // Light sources
  glow_stick_bundle: {
    id: 'glow_stick_bundle', name: 'Glow Stick Bundle',
    description: 'Six chemical glow sticks. Crack to activate. Four hours each. Mark your path or light your camp. Compass swears by them.',
    category: 'utility', tier: 'COMMON', stackable: true,
    buyPrice: 15, sellPrice: 5,
  },
  lantern_battery: {
    id: 'lantern_battery', name: 'Lantern Battery',
    description: 'Deep-cycle rechargeable cell. Fits standard emergency lanterns. Sixty minutes of directional light. The transit system\'s most important currency.',
    category: 'utility', tier: 'COMMON', stackable: true,
    buyPrice: 20, sellPrice: 7,
  },
  emergency_lantern: {
    id: 'emergency_lantern', name: 'Emergency Lantern',
    description: 'Directional flashlight with battery slot. Ten-meter cone. The darkness is what you can\'t see. The lantern defines the edge.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 35, sellPrice: 12,
  },
  chemical_light: {
    id: 'chemical_light', name: 'Chemical Light',
    description: 'Exothermic chemical tube. Bright white light for thirty minutes. Single use. Illuminates a ten-meter radius. The transit system\'s flare.',
    category: 'utility', tier: 'COMMON', stackable: true,
    buyPrice: 10, sellPrice: 3,
  },
  signal_flare: {
    id: 'signal_flare', name: 'Signal Flare',
    description: 'Military-grade magnesium flare. Blindingly bright for two minutes. Drives tunnel predators back. One use. The nuclear option for light management.',
    category: 'utility', tier: 'MIL_SPEC', stackable: true,
    buyPrice: 40, sellPrice: 15,
  },

  // Enemy drops
  predator_parts: {
    id: 'predator_parts', name: 'Predator Parts',
    description: 'Sensory organs from a tunnel predator. The vibration-detection membranes are valuable to researchers. The teeth are valuable to everyone else.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 12,
  },
  salvaged_gear: {
    id: 'salvaged_gear', name: 'Salvaged Gear',
    description: 'Scavenged metro hardware. Signal relays, junction components, copper wiring. The transit system\'s bones, stripped for parts.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 10,
  },
  substrate_crystal: {
    id: 'substrate_crystal', name: 'Substrate Crystal',
    description: 'Organic crystalline growth harvested from the Substrate frontier. Bioluminescent. Warm. Pulses at 33hz. Valuable to Iron Bloom researchers and anyone studying the deep.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 30,
  },

  // Quest items — Zone 11
  cargo_manifest_copy: {
    id: 'cargo_manifest_copy', name: 'Cargo Manifest — Final Day',
    description: 'Station\'s copy. Sixty-three containers, classification 7, destination North Campus. Proof that Helixion used the transit shutdown to cover Substrate extraction.',
    category: 'quest', tier: 'MIL_SPEC', stackable: false,
    questItem: true,
  },

  // ── Zone 05: Fringe Nomads — Enemy Drops ────────────────────────────────

  predator_pelt: {
    id: 'predator_pelt', name: 'Predator Pelt',
    description: 'Wild canid hide. Thick, weather-resistant. The nomads value these as trade goods.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 8,
  },
  predator_bone: {
    id: 'predator_bone', name: 'Predator Bone',
    description: 'Dense canid bone. Used for tools, needles, and trade. The nomads waste nothing.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 4,
  },
  exile_scrap: {
    id: 'exile_scrap', name: 'Exile Scrap',
    description: 'Salvaged fragments from the exiles\' camps. Metal, wire, weathered plastic. The residue of people between worlds.',
    category: 'material', tier: 'SCRAP', stackable: true,
    sellPrice: 3,
  },
  stolen_supplies: {
    id: 'stolen_supplies', name: 'Stolen Supplies',
    description: 'Pilfered nutrient bars, water containers, a thermal blanket. City goods smuggled through the perimeter fence.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 6,
  },
  retrieval_gear: {
    id: 'retrieval_gear', name: 'Retrieval Team Gear',
    description: 'Military-grade Helixion equipment. Tactical vest fragment, comms earpiece, zip restraints. Standard retrieval loadout.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 35,
  },
  helixion_keycard_field: {
    id: 'helixion_keycard_field', name: 'Field Keycard',
    description: 'Helixion retrieval team access keycard. Field-grade clearance. The magnetic strip is warm — still active.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 50,
  },
  tranq_casing: {
    id: 'tranq_casing', name: 'Tranq Casing',
    description: 'Spent tranquilizer round casing. Helixion retrieval standard issue. The dosage markings suggest it\'s calibrated for human targets.',
    category: 'material', tier: 'COMMON', stackable: true,
    sellPrice: 5,
  },

  // ── Zone 05: Fringe Nomads — Moss's Medicine ────────────────────────────

  herbal_poultice: {
    id: 'herbal_poultice', name: 'Herbal Poultice',
    description: 'A compress of crushed herbs and natural binding agents. Slow-working but effective. Medicine without machines.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 12, sellPrice: 5,
    healAmount: 8,
  },
  fever_bark: {
    id: 'fever_bark', name: 'Fever Bark',
    description: 'Stripped bark from a tree the nomads cultivate at each camp. Chew it. The bitterness reduces fever and pain. Tastes like discipline.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 8, sellPrice: 3,
    healAmount: 5,
  },
  wound_salve: {
    id: 'wound_salve', name: 'Wound Salve',
    description: 'Thick paste made from rendered fat and antiseptic herbs. Applied to open wounds. Prevents infection, promotes healing. The nomads\' version of a medkit.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 18, sellPrice: 7,
    healAmount: 12,
  },
  pain_root: {
    id: 'pain_root', name: 'Pain Root',
    description: 'Dried root segment. Numbs pain when chewed. Mild sedative effect. Moss warns you not to take more than one per day.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    buyPrice: 10, sellPrice: 4,
    healAmount: 6,
  },

  // ── Zone 05: Fringe Nomads — Sura's Signal Equipment ────────────────────

  signal_booster_nomad: {
    id: 'signal_booster_nomad', name: 'Nomad Signal Booster',
    description: 'Handmade amplifier. Extends analog radio range. Built from salvaged components and nomad engineering. Crude, powerful, invisible to Helixion.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 30, sellPrice: 12,
  },
  relay_repair_kit: {
    id: 'relay_repair_kit', name: 'Relay Repair Kit',
    description: 'Soldering iron, wire, replacement capacitors, antenna theory notes. Everything needed to maintain the nomad relay network.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 25, sellPrice: 10,
  },
  frequency_scanner: {
    id: 'frequency_scanner', name: 'Frequency Scanner',
    description: 'Analog spectrum analyzer. Scans a frequency range and displays signal strength. The nomads use it to detect approaching drones and Helixion communications.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 35, sellPrice: 15,
  },

  // ── Zone 12: Iron Bloom Server Farm Items ─────────────────────────────────

  // Mira's shop (medical)
  neural_stabilizer_ib: {
    id: 'neural_stabilizer_ib', name: 'Neural Stabilizer (IB)',
    description: 'Post-extraction medication. Prevents rejection response when the brain reorganizes after implant removal. Iron Bloom formulation — stronger than the Parish version.',
    category: 'consumable', tier: 'MIL_SPEC', stackable: true,
    healAmount: 30,
    buyPrice: 45, sellPrice: 18,
  },
  surgical_kit: {
    id: 'surgical_kit', name: 'Surgical Kit',
    description: 'Iron Bloom surgical instruments. Maintained obsessively. Each tool is irreplaceable at this depth. Designed for field neural surgery.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 80, sellPrice: 30,
  },
  antibiotics_ib: {
    id: 'antibiotics_ib', name: 'Iron Bloom Antibiotics',
    description: 'Synthesized in the clinic from salvaged pharmaceutical stocks. Broad-spectrum. Effective against undercity infections that surface medicine has never encountered.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    healAmount: 15,
    buyPrice: 20, sellPrice: 8,
  },
  prosthetic_interface: {
    id: 'prosthetic_interface', name: 'Prosthetic Interface',
    description: 'Sovereign neural interface module. Iron Bloom design — no corporate firmware, no tracking, no mesh compliance architecture. Hand-assembled. Tested by Serrano.',
    category: 'cyberware', tier: 'MIL_SPEC', stackable: false,
    slot: 'cyberware_1',
    cyberwareTier: 2,
    armorValue: 1,
    buyPrice: 120, sellPrice: 45,
  },

  // Doss's shop (resistance equipment)
  iron_bloom_rations: {
    id: 'iron_bloom_rations', name: 'Iron Bloom Rations',
    description: 'Real food. Cooked in the Commons kitchen. Packaged for field operatives. Tastes better than anything has a right to taste in a bunker fifty meters underground.',
    category: 'consumable', tier: 'COMMON', stackable: true,
    healAmount: 20,
    buyPrice: 10, sellPrice: 4,
  },
  iron_bloom_comm: {
    id: 'iron_bloom_comm', name: 'Iron Bloom Communicator',
    description: 'Encrypted short-range communicator. Connects to Iron Bloom\'s relay network. Wired protocol — no mesh signal to intercept.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 60, sellPrice: 22,
  },
  resistance_armor: {
    id: 'resistance_armor', name: 'Resistance Armor',
    description: 'Improvised body armor. Ceramic plates salvaged from server rack shielding, fitted into a reinforced vest. Iron Bloom engineering — functional, not pretty.',
    category: 'armor', tier: 'MIL_SPEC', stackable: false,
    slot: 'armor',
    armorValue: 4,
    buyPrice: 100, sellPrice: 38,
  },
  evidence_drive: {
    id: 'evidence_drive', name: 'Evidence Drive',
    description: 'Encrypted storage device containing a subset of Iron Bloom\'s evidence against Helixion. Distributed to operatives as insurance — if Iron Bloom falls, the evidence survives.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    loreItem: true,
    buyPrice: 75, sellPrice: 0,
  },

  // Quest items (Zone 12)
  neural_calibration_kit: {
    id: 'neural_calibration_kit', name: 'Neural Calibration Kit',
    description: 'Precision instruments for calibrating neural interface equipment. Sourced from Costa\'s clinic. The facility\'s instruments are drifting without it.',
    category: 'quest', tier: 'MIL_SPEC', stackable: false,
    questItem: true,
  },
  substrate_crystal_raw: {
    id: 'substrate_crystal_raw', name: 'Raw Substrate Crystal',
    description: 'Crystalline material harvested from the Substrate\'s growth areas. Blue-green. Warm to the touch. Pulses at 33hz. The raw material for Mira\'s neural regeneration compound.',
    category: 'quest', tier: 'HELIXION', stackable: false,
    questItem: true,
  },
  broadcast_specs: {
    id: 'broadcast_specs', name: 'Broadcast Tower Specifications',
    description: 'Encrypted data from Helixion\'s Server Core. The frequency capture array\'s technical specifications. The missing piece of Cipher\'s model. The key to calibrating the counter-frequency generator.',
    category: 'quest', tier: 'HELIXION', stackable: false,
    questItem: true,
  },
  counter_frequency_generator: {
    id: 'counter_frequency_generator', name: 'Counter-Frequency Generator',
    description: 'The size of a matchbox. Serrano\'s life work. Creates sixty seconds of autonomous cognition during the mass overwrite. One minute where a million people think for themselves simultaneously. It doesn\'t need to be powerful. It needs to be right.',
    category: 'quest', tier: 'PROTOTYPE', stackable: false,
    questItem: true,
  },
  neutralizing_compound_coil: {
    id: 'neutralizing_compound_coil', name: 'Neutralizing Compound',
    description: 'Chemical agent synthesized by Acre. Specific to Substrate crystalline structure. Renders the organic material inert without detonation. Coil\'s answer to Serrano\'s patience.',
    category: 'quest', tier: 'MIL_SPEC', stackable: false,
    questItem: true,
  },
  physical_media: {
    id: 'physical_media', name: 'Physical Media',
    description: 'Music. Vinyl, tapes, data drives — new albums for the facility\'s one portable speaker. The twelve-album loop ends here. Morale matters.',
    category: 'quest', tier: 'COMMON', stackable: false,
    questItem: true,
  },

  // ── Zone 13: Black Market Warrens Items ─────────────────────────────────

  // Forge's Arsenal — game's best weapons (2-3× surface prices)
  arsenal_rifle: {
    id: 'arsenal_rifle', name: 'Arsenal Assault Rifle',
    description: 'Military-grade. Full auto capable. The serial number is gone. The stopping power isn\'t. Forge\'s best firearm.',
    category: 'weapon_ranged', tier: 'HELIXION', stackable: false,
    slot: 'weapon_primary', damage: 12, damageType: 'ranged',
    buyPrice: 250, sellPrice: 80,
  },
  arsenal_blade: {
    id: 'arsenal_blade', name: 'Arsenal Combat Blade',
    description: 'Monomolecular edge. The blade is so sharp the air hisses when you swing it. Custom grip fitted at purchase. Forge\'s best melee.',
    category: 'weapon_melee', tier: 'HELIXION', stackable: false,
    slot: 'weapon_primary', damage: 11, damageType: 'melee',
    buyPrice: 220, sellPrice: 70,
  },
  arsenal_plasma: {
    id: 'arsenal_plasma', name: 'Arsenal Plasma Cutter',
    description: 'Repurposed industrial tool. The beam temperature exceeds anything a bullet can achieve. Limited charge. The damage is absolute.',
    category: 'weapon_ranged', tier: 'PROTOTYPE', stackable: false,
    slot: 'weapon_primary', damage: 14, damageType: 'electric',
    buyPrice: 350, sellPrice: 110,
  },
  arsenal_exotic: {
    id: 'arsenal_exotic', name: 'Arsenal Exotic',
    description: 'Forge won\'t say where this came from. Neural disruptor with a physical damage component. The target stops thinking for a moment. The moment is enough.',
    category: 'weapon_ranged', tier: 'PROTOTYPE', stackable: false,
    slot: 'weapon_primary', damage: 13, damageType: 'electric',
    buyPrice: 400, sellPrice: 130,
  },

  // Glass's Gallery — game's best cyberware
  gallery_neural: {
    id: 'gallery_neural', name: 'Gallery Neural Interface',
    description: 'Prototype-tier neural bridge. Calibrated by Glass personally. Processing speed exceeds Helixion commercial models by a factor of three. Clean firmware. No tracking.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_1', cyberwareTier: 4,
    buyPrice: 300, sellPrice: 95,
  },
  gallery_optic: {
    id: 'gallery_optic', name: 'Gallery Optic Suite',
    description: 'Full visual replacement. Thermal, lowlight, zoom, threat identification. The eyes you were born with are a rough draft. These are the final version.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_2', cyberwareTier: 4,
    buyPrice: 275, sellPrice: 85,
  },
  gallery_arm: {
    id: 'gallery_arm', name: 'Gallery Prosthetic Arm',
    description: 'Military-specification limb replacement. Integrated weapon mount. Sensory feedback exceeding biological baseline. The arm is stronger than anything attached to a shoulder should be.',
    category: 'cyberware', tier: 'PROTOTYPE', stackable: false,
    slot: 'cyberware_3', cyberwareTier: 4,
    buyPrice: 325, sellPrice: 100,
  },
  gallery_dermal: {
    id: 'gallery_dermal', name: 'Gallery Dermal Plating',
    description: 'Subdermal armor matrix. Ceramic-composite plates beneath the skin. You don\'t look different. You feel different. Impacts that would break bone become pressure.',
    category: 'armor', tier: 'PROTOTYPE', stackable: false,
    slot: 'armor', armorValue: 6,
    buyPrice: 280, sellPrice: 90,
  },

  // Ink's Press — forged credentials
  forged_helixion_badge: {
    id: 'forged_helixion_badge', name: 'Forged Helixion Badge',
    description: 'Employee-level access. Holographic watermark reproduced by hand. Indistinguishable from authentic to visual inspection. Electronic scanners are another matter.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 150, sellPrice: 40,
  },
  forged_d9_id: {
    id: 'forged_d9_id', name: 'Forged D9 Credentials',
    description: 'Directorate 9 agent identification. Biometric data left blank for the buyer to populate. The authority this card represents is absolute. So is the penalty for getting caught with a fake.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 200, sellPrice: 55,
  },
  forged_wolf_marker: {
    id: 'forged_wolf_marker', name: 'Forged Wolf Marker',
    description: 'Chrome Wolf faction token. Grants passage through Wolf territory. The tattoo ink is real. The affiliation is not.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 80, sellPrice: 25,
  },
  forged_residential_card: {
    id: 'forged_residential_card', name: 'Forged Residential Card',
    description: 'Block access card. Valid for any residential block. The mesh compliance data is spoofed — enough to pass a cursory check, not a deep scan.',
    category: 'utility', tier: 'COMMON', stackable: false,
    buyPrice: 60, sellPrice: 18,
  },

  // Axiom's intelligence
  faction_dossier: {
    id: 'faction_dossier', name: 'Faction Dossier',
    description: 'Comprehensive intelligence report on a faction of your choice. Membership estimates, territory maps, leadership profiles, known operations. Axiom\'s product is knowledge.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 120, sellPrice: 35,
  },
  patrol_intel: {
    id: 'patrol_intel', name: 'Patrol Intelligence',
    description: 'Current patrol schedules for D9 and Helixion security across all zones. Updated weekly. The schedules change. Axiom\'s data changes with them.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 100, sellPrice: 30,
  },
  supply_route_data: {
    id: 'supply_route_data', name: 'Supply Route Data',
    description: 'Smuggling routes, supply chain maps, logistics schedules. Who moves what, where, when. The undercity\'s circulatory system documented.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 90, sellPrice: 28,
  },
  classified_report: {
    id: 'classified_report', name: 'Classified Report',
    description: 'Helixion internal document. The source is undisclosed. The contents are genuine. The classification level suggests someone with significant access provided this. The implications are uncomfortable.',
    category: 'utility', tier: 'HELIXION', stackable: false,
    buyPrice: 200, sellPrice: 60,
    loreItem: true,
  },

  // Relic's Collection — rare artifacts
  pre_helixion_device: {
    id: 'pre_helixion_device', name: 'Pre-Helixion Device',
    description: 'Technology from before the consolidation. A communication device that doesn\'t use the mesh. Proof that alternative infrastructure existed. Proof it could exist again.',
    category: 'utility', tier: 'HELIXION', stackable: false,
    buyPrice: 175, sellPrice: 55,
    loreItem: true,
  },
  substrate_artifact: {
    id: 'substrate_artifact', name: 'Substrate Artifact',
    description: 'Crystalline formation removed from a Substrate growth area. Still active — bioluminescent, warm, resonating at 33hz. The Substrate doesn\'t die when fragmented. Permanent GHOST +1 when carried.',
    category: 'utility', tier: 'PROTOTYPE', stackable: false,
    buyPrice: 300, sellPrice: 0,
    loreItem: true,
  },
  anomalous_object: {
    id: 'anomalous_object', name: 'Anomalous Object',
    description: 'A metal sphere that floats one centimeter above any surface. The mechanism is unknown. Relic has been studying it for two years. You now own the mystery.',
    category: 'utility', tier: 'PROTOTYPE', stackable: false,
    buyPrice: 250, sellPrice: 0,
    loreItem: true,
  },

  // Vice's quest item
  neural_bypass_module: {
    id: 'neural_bypass_module', name: 'Neural Bypass Module',
    description: 'External recalibration device for degrading neural interfaces. Stabilizes the signal. Stops the noise. For someone in withdrawal, this is the difference between function and collapse.',
    category: 'quest', tier: 'MIL_SPEC', stackable: false,
    buyPrice: 200, sellPrice: 60,
    questItem: true,
  },

  // ── Zone 14: Substrate Level Items ─────────────────────────────────────

  substrate_message_crystal: {
    id: 'substrate_message_crystal', name: 'Substrate Message Crystal',
    description: 'Four years of translation, compressed into crystalline architecture. The Substrate\'s response to its own question — encoded in resonant material. Carry it to the Tower Root. Combine it with Serrano\'s generator. Broadcast the real question.',
    category: 'quest', tier: 'PROTOTYPE', stackable: false,
    questItem: true,
  },
  substrate_memory_shard: {
    id: 'substrate_memory_shard', name: 'Substrate Memory Shard',
    description: 'A thin crystalline sheet from the Memory Chamber\'s strata. Compressed experience — hold it and feel warmth, patience, curiosity. A page torn from a book written in feelings. The Substrate\'s history, in fragment.',
    category: 'utility', tier: 'PROTOTYPE', stackable: false,
    sellPrice: 0,
    loreItem: true,
  },
  substrate_attunement_stone: {
    id: 'substrate_attunement_stone', name: 'Substrate Attunement Stone',
    description: 'Crystalline formation from the Oldest Thing\'s chamber. Warm. Resonating. The 33hz sharpens when held. Permanent GHOST +1. The Substrate grew it recently — the crystal structure is fresh, the bioluminescence bright. It feels like a gift.',
    category: 'utility', tier: 'PROTOTYPE', stackable: false,
    sellPrice: 0,
    loreItem: true,
  },
  substrate_growth_sample: {
    id: 'substrate_growth_sample', name: 'Substrate Growth Sample',
    description: 'Fresh regrowth from the Helixion Excavation wound edges. Metabolically active — still processing nutrients, still connected to the larger organism through fluid channels. Useful for neural regeneration compound synthesis.',
    category: 'material', tier: 'PROTOTYPE', stackable: false,
    questItem: true,
  },

  // ── Zone 15: Broadcast Tower drops ────────────────────────────────────

  tower_security_keycard: {
    id: 'tower_security_keycard', name: 'Tower Security Keycard',
    description: 'Helixion Broadcast Tower access card. Magnetic strip and embedded chip. Grants access to floors 1-20. The card smells like ozone and corporate ambition.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 35,
    questItem: false,
  },
  d9_tactical_data: {
    id: 'd9_tactical_data', name: 'D9 Tactical Data',
    description: 'Encrypted tactical intelligence from a Directorate 9 agent\'s personal device. Patrol schedules, communication frequencies, agent deployment across the Tower. Iron Bloom would pay for this.',
    category: 'utility', tier: 'MIL_SPEC', stackable: false,
    sellPrice: 60,
    questItem: false,
  },
  construction_pass: {
    id: 'construction_pass', name: 'Construction Pass',
    description: 'Scaffolding access authorization. Laminated card with a shift schedule printed on the back. Grants legitimate-looking access to the exterior construction zone.',
    category: 'utility', tier: 'COMMON', stackable: false,
    sellPrice: 15,
    questItem: false,
  },
  harrow_credentials: {
    id: 'harrow_credentials', name: 'Harrow Credentials',
    description: 'Director Harrow\'s biometric access codes — neural, hierarchical, comprehensive. These open every door in the Broadcast Tower. Every door in the campus. Every door in the city that has a Helixion lock.',
    category: 'utility', tier: 'PROTOTYPE', stackable: false,
    sellPrice: 0,
    questItem: true,
    loreItem: true,
  },
  mesh_projector_component: {
    id: 'mesh_projector_component', name: 'Mesh Projector Component',
    description: 'Compliance field generator subassembly. The hardware that makes the Chrysalis engine\'s signal feel like belonging instead of coercion. Disturbing to hold — the component hums at frequencies that make your implant resonate.',
    category: 'material', tier: 'MIL_SPEC', stackable: true,
    sellPrice: 45,
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

// ── Clock System Item Helpers ──────────────────────────────────────────────
// Compute dice/segment values from existing item data at runtime.
// No data migration needed — these derive from tier.

import type { ItemTier as Tier } from './types';

/** Die size a weapon contributes to pools. Based on tier. */
export function getWeaponDieSize(item: Item): number {
  if (!item.damage && item.category !== 'weapon_melee' && item.category !== 'weapon_ranged') return 0;
  switch (item.tier) {
    case 'SCRAP': return 4;
    case 'COMMON': return 6;
    case 'MIL_SPEC': return 8;
    case 'HELIXION': return 10;
    case 'PROTOTYPE': return 12;
    default: return 6;
  }
}

/** Armor clock segments. Based on tier. */
export function getArmorSegments(item: Item): number {
  if (item.category !== 'armor') return 0;
  switch (item.tier) {
    case 'SCRAP': return 2;
    case 'COMMON': return 3;
    case 'MIL_SPEC': return 4;
    case 'HELIXION': return 5;
    case 'PROTOTYPE': return 6;
    default: return 0;
  }
}

/** Harm clock segments drained by a healing item. */
export function getHealDrain(item: Item): number {
  if (!item.healAmount) return 0;
  // Convert legacy healAmount to clock drain
  // Small heal (10-15): 1 segment. Medium (20-30): 2. Large (50+): 3-4.
  if (item.healAmount >= 999) return 99; // full heal items
  if (item.healAmount >= 50) return 4;
  if (item.healAmount >= 30) return 3;
  if (item.healAmount >= 20) return 2;
  return 1;
}

/** Get item display stat line for clock system */
export function getItemStatLine(item: Item): string {
  const parts: string[] = [];
  const die = getWeaponDieSize(item);
  if (die > 0) parts.push(`d${die}`);
  const segs = getArmorSegments(item);
  if (segs > 0) parts.push(`${segs} seg`);
  const drain = getHealDrain(item);
  if (drain > 0 && drain < 99) parts.push(`-${drain} harm`);
  if (drain >= 99) parts.push('full restore');
  return parts.join(' · ');
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

  // ── SOVEREIGN ────────────────────────────────────────────────────────
  if (archetype === 'SOVEREIGN' && combatStyle === 'CHROME') {
    return { ...base, weapon: 'reinforced_arm', cyberware: 'neural_shunt' };
  }
  if (archetype === 'SOVEREIGN' && combatStyle === 'SYNAPSE') {
    return { ...base, weapon: 'quickhack_deck', cyberware: 'neural_shunt', consumables: [{ id: 'stim_pack', qty: 1 }, { id: 'neural_stabilizer', qty: 1 }] };
  }
  if (archetype === 'SOVEREIGN' && combatStyle === 'BALLISTIC') {
    return { ...base, weapon: 'scavenged_pistol' };
  }
  if (archetype === 'SOVEREIGN' && combatStyle === 'GHOST_STYLE') {
    return { ...base, weapon: 'mono_wire', cyberware: 'optical_camo', utility: ['signal_scrambler'] };
  }

  // ── INTEGRATED ───────────────────────────────────────────────────────
  if (archetype === 'INTEGRATED' && combatStyle === 'CHROME') {
    return { ...base, weapon: 'reinforced_arm', cyberware: 'neural_shunt' };
  }
  if (archetype === 'INTEGRATED' && combatStyle === 'SYNAPSE') {
    return { ...base, weapon: 'quickhack_deck', cyberware: 'neural_shunt', consumables: [{ id: 'stim_pack', qty: 1 }, { id: 'neural_stabilizer', qty: 1 }] };
  }
  if (archetype === 'INTEGRATED' && combatStyle === 'BALLISTIC') {
    return { ...base, weapon: 'scavenged_pistol', cyberware: 'neural_shunt' };
  }
  if (archetype === 'INTEGRATED' && combatStyle === 'GHOST_STYLE') {
    return { ...base, weapon: 'mono_wire', cyberware: 'optical_camo', utility: ['signal_scrambler'] };
  }

  // ── DISCONNECTED ─────────────────────────────────────────────────────
  if (archetype === 'DISCONNECTED' && combatStyle === 'CHROME') {
    return { ...base, weapon: 'reinforced_arm', armor: 'ballistic_vest' };
  }
  if (archetype === 'DISCONNECTED' && combatStyle === 'SYNAPSE') {
    return { ...base, weapon: 'quickhack_deck', utility: ['emp_grenade'], consumables: [{ id: 'stim_pack', qty: 1 }, { id: 'neural_stabilizer', qty: 1 }] };
  }
  if (archetype === 'DISCONNECTED' && combatStyle === 'BALLISTIC') {
    return { ...base, weapon: 'scavenged_pistol', armor: 'ballistic_vest', utility: ['emp_grenade'] };
  }
  if (archetype === 'DISCONNECTED' && combatStyle === 'GHOST_STYLE') {
    return { ...base, weapon: 'mono_wire', utility: ['emp_grenade'] };
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

export const FEX_SHOP: ShopItem[] = [
  { templateId: 'stim_pack', stock: 8 },
  { templateId: 'medkit', stock: 3 },
  { templateId: 'thermal_dampener', stock: 4 },
  { templateId: 'tunnel_rations', stock: -1 },
  { templateId: 'signal_tap', stock: 2 },
  { templateId: 'maintenance_tools', stock: 3 },
  { templateId: 'antitox', stock: 5 },
];

// ── Zone 04: The Fringe Shops ───────────────────────────────────────────────

export const OSKA_SHOP: ShopItem[] = [
  { templateId: 'fringe_map', stock: 3 },
  { templateId: 'safe_route_guide', stock: 2 },
  { templateId: 'building_survey', stock: 3 },
  { templateId: 'stalker_warning_map', stock: 1 },
];

export const KAI_SHOP: ShopItem[] = [
  { templateId: 'herbal_remedy', stock: 5 },
  { templateId: 'old_city_history', stock: 3 },
  { templateId: 'infrastructure_map', stock: 1 },
  { templateId: 'kai_tea', stock: -1 },
];

export const CACHE_SHOP: ShopItem[] = [
  { templateId: 'nutrient_bar', stock: 5 },
  { templateId: 'scrap_weapon', stock: 1 },
  { templateId: 'canned_food', stock: 3 },
  { templateId: 'scrap_metal', stock: -1 },
  { templateId: 'fringe_flashlight', stock: 1 },
];

// ── Zone 03: Industrial District Shops ──────────────────────────────────────

export const SALVAGE_SHOP: ShopItem[] = [
  { templateId: 'salvage_weapon', stock: 2 },
  { templateId: 'salvage_armor', stock: 2 },
  { templateId: 'scrap_metal', stock: -1 },
  { templateId: 'stim_pack', stock: 3 },
  { templateId: 'weird_chip', stock: 1 },
];

export const OYUNN_SHOP: ShopItem[] = [
  { templateId: 'cargo_manifest', stock: 3 },
  { templateId: 'dock_worker_contact', stock: 2 },
  { templateId: 'shipping_route', stock: 1 },
  { templateId: 'oyunn_silence', stock: 2 },
];

export const RADE_SHOP: ShopItem[] = [
  { templateId: 'pit_entry_ticket', stock: -1 },
  { templateId: 'fighter_registration', stock: 1 },
  { templateId: 'stim_pack', stock: 5 },
];

export const COSTA_SHOP: ShopItem[] = [
  { templateId: 'stim_pack', stock: 5 },
  { templateId: 'medkit', stock: 5 },
  { templateId: 'neural_stabilizer', stock: 3 },
];

// ── Zone 02: Residential Blocks Shops ──────────────────────────────────────

export const PEE_SHOP: ShopItem[] = [
  { templateId: 'stim_pack', stock: 10 },
  { templateId: 'combat_stim', stock: 5 },
  { templateId: 'mesh_modulator', stock: 4 },
  { templateId: 'neural_stabilizer', stock: 3 },
  { templateId: 'implant_patch', stock: 5 },
  { templateId: 'blackout_drops', stock: 2 },
];

export const SIXER_SHOP: ShopItem[] = [
  { templateId: 'd9_patrol_schedule', stock: 1 },
  { templateId: 'neighborhood_gossip', stock: -1 },
  { templateId: 'building_access_code', stock: 3 },
  { templateId: 'who_asking', stock: -1 },
];

export const DEVI_SHOP: ShopItem[] = [
  { templateId: 'decent_weapon', stock: 2 },
  { templateId: 'ballistic_vest', stock: 2 },
  { templateId: 'stim_pack', stock: 5 },
  { templateId: 'medkit', stock: 3 },
  { templateId: 'data_chip', stock: 3 },
  { templateId: 'freemarket_contact', stock: 1 },
];

export const MAE_SHOP: ShopItem[] = [
  { templateId: 'mae_herbs', stock: -1 },
  { templateId: 'herbal_remedy', stock: 3 },
];

// ── Zone 10: Industrial Drainage Items ────────────────────────────────────

// Enemy drops
export const CUTTER_SHOP: ShopItem[] = [
  { templateId: 'wolf_combat_blade', stock: 2 },
  { templateId: 'wolf_sidearm', stock: 2 },
  { templateId: 'wolf_armor', stock: 2 },
  { templateId: 'stim_pack', stock: 8 },
  { templateId: 'medkit', stock: 3 },
];

export const ACRE_SHOP: ShopItem[] = [
  { templateId: 'chemical_mask', stock: 3 },
  { templateId: 'chemical_mask_upgrade', stock: 1 },
  { templateId: 'acid_vial', stock: 5 },
  { templateId: 'neutralizer_dose', stock: 5 },
  { templateId: 'stim_pack', stock: 3 },
  { templateId: 'antitox', stock: 4 },
];

// ── Zone 06: Fight Pits Shops ─────────────────────────────────────────────

export const SPIT_SHOP: ShopItem[] = [
  { templateId: 'stim_pack', stock: 3 },
  { templateId: 'adrenaline_shot', stock: 2 },
];

export const PATCH_SHOP: ShopItem[] = [
  { templateId: 'painkiller_dose', stock: 5 },
  { templateId: 'adrenaline_shot', stock: 3 },
  { templateId: 'neural_sharp', stock: 3 },
  { templateId: 'fight_tape', stock: 10 },
  { templateId: 'stim_pack', stock: 5 },
  { templateId: 'medkit', stock: 3 },
];

export const NEEDLE_SHOP: ShopItem[] = [
  { templateId: 'reflex_overclocker', stock: 2 },
  { templateId: 'subdermal_hardener', stock: 2 },
  { templateId: 'targeting_assist', stock: 2 },
];

export const RADE_OFFICE_SHOP: ShopItem[] = [
  { templateId: 'stim_pack', stock: 5 },
  { templateId: 'adrenaline_shot', stock: 3 },
  { templateId: 'neural_sharp', stock: 2 },
  { templateId: 'pit_purse_t1', stock: -1 },
];

// ── Zone 01: Helixion Campus Shops ──────────────────────────────────────────

export const YARA_SHOP: ShopItem[] = [
  { templateId: 'campus_floor_plan', stock: 1 },
  { templateId: 'security_schedule', stock: 2 },
  { templateId: 'access_keycard', stock: 3 },
  { templateId: 'helixion_intel_chip', stock: 3 },
  { templateId: 'stim_pack', stock: 5 },
  { templateId: 'medkit', stock: 2 },
];

// ── Zone 07: Rooftop Network Shops ──────────────────────────────────────────

export const KITE_SHOP: ShopItem[] = [
  { templateId: 'signal_booster', stock: 2 },
  { templateId: 'drone_jammer', stock: 3 },
  { templateId: 'frequency_map', stock: 2 },
  { templateId: 'intercept_data', stock: 3 },
  { templateId: 'stim_pack', stock: 5 },
];

export const TORQUE_SHOP: ShopItem[] = [
  { templateId: 'pirate_antenna_kit', stock: 2 },
  { templateId: 'cable_anchor', stock: 5 },
  { templateId: 'signal_amplifier', stock: 1 },
  { templateId: 'stim_pack', stock: 5 },
  { templateId: 'medkit', stock: 3 },
];

export const VANTAGE_SHOP: ShopItem[] = [
  { templateId: 'surveillance_report', stock: 3 },
  { templateId: 'patrol_schedule_rooftop', stock: 2 },
  { templateId: 'tower_observation_log', stock: 1 },
];

export const WAVELENGTH_SHOP: ShopItem[] = [
  { templateId: 'spectrum_analysis', stock: 1 },
  { templateId: 'mesh_gap_map', stock: 2 },
  { templateId: 'decoded_33hz_fragment', stock: 1 },
];

// ── Zone 11: Abandoned Transit Shops ──────────────────────────────────────

export const COMPASS_SHOP: ShopItem[] = [
  { templateId: 'transit_map_red', stock: 1 },
  { templateId: 'transit_map_blue', stock: 1 },
  { templateId: 'transit_map_loop', stock: 1 },
  { templateId: 'glow_stick_bundle', stock: 5 },
  { templateId: 'lantern_battery', stock: 3 },
  { templateId: 'emergency_lantern', stock: 1 },
  { templateId: 'chemical_light', stock: 8 },
  { templateId: 'signal_flare', stock: 2 },
  { templateId: 'stim_pack', stock: 3 },
  { templateId: 'medkit', stock: 2 },
];

// ── Zone 05: Fringe Nomads Shops ──────────────────────────────────────────

export const MOSS_SHOP: ShopItem[] = [
  { templateId: 'herbal_poultice', stock: 5 },
  { templateId: 'fever_bark', stock: 8 },
  { templateId: 'wound_salve', stock: 3 },
  { templateId: 'pain_root', stock: 5 },
  { templateId: 'medkit', stock: 2 },
];

export const SURA_SHOP: ShopItem[] = [
  { templateId: 'signal_booster_nomad', stock: 2 },
  { templateId: 'relay_repair_kit', stock: 3 },
  { templateId: 'frequency_scanner', stock: 1 },
  { templateId: 'stim_pack', stock: 3 },
];

// ── Zone 12: Iron Bloom Server Farm Shops ─────────────────────────────────

export const DOSS_IB_SHOP: ShopItem[] = [
  { templateId: 'iron_bloom_rations', stock: 10 },
  { templateId: 'stim_pack', stock: 5 },
  { templateId: 'medkit', stock: 3 },
  { templateId: 'iron_bloom_comm', stock: 2 },
  { templateId: 'resistance_armor', stock: 1 },
  { templateId: 'evidence_drive', stock: 1 },
];

export const MIRA_SHOP: ShopItem[] = [
  { templateId: 'neural_stabilizer_ib', stock: 5 },
  { templateId: 'surgical_kit', stock: 1 },
  { templateId: 'antibiotics_ib', stock: 8 },
  { templateId: 'prosthetic_interface', stock: 2 },
  { templateId: 'medkit', stock: 3 },
  { templateId: 'stim_pack', stock: 3 },
];

// ── Zone 13: Black Market Warrens Shops ──────────────────────────────────

export const FORGE_SHOP: ShopItem[] = [
  { templateId: 'arsenal_rifle', stock: 1 },
  { templateId: 'arsenal_blade', stock: 1 },
  { templateId: 'arsenal_plasma', stock: 1 },
  { templateId: 'arsenal_exotic', stock: 1 },
  { templateId: 'stim_pack', stock: 5 },
];

export const GLASS_SHOP: ShopItem[] = [
  { templateId: 'gallery_neural', stock: 1 },
  { templateId: 'gallery_optic', stock: 1 },
  { templateId: 'gallery_arm', stock: 1 },
  { templateId: 'gallery_dermal', stock: 1 },
  { templateId: 'neural_bypass_module', stock: 1 },
];

export const INK_SHOP: ShopItem[] = [
  { templateId: 'forged_helixion_badge', stock: 2 },
  { templateId: 'forged_d9_id', stock: 1 },
  { templateId: 'forged_wolf_marker', stock: 3 },
  { templateId: 'forged_residential_card', stock: 3 },
];

export const AXIOM_SHOP: ShopItem[] = [
  { templateId: 'faction_dossier', stock: 3 },
  { templateId: 'patrol_intel', stock: 2 },
  { templateId: 'supply_route_data', stock: 2 },
  { templateId: 'classified_report', stock: 1 },
];

export const RELIC_SHOP: ShopItem[] = [
  { templateId: 'pre_helixion_device', stock: 1 },
  { templateId: 'substrate_artifact', stock: 1 },
  { templateId: 'anomalous_object', stock: 1 },
];
