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
