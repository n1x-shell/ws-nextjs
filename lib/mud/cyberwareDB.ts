// lib/mud/cyberwareDB.ts
// TUNNELCORE — Cyberware Augmentation Database
// Defines all cyberware items, slot types, tier gating, and starter loadouts.
// Uses existing types from ./types (Archetype, CombatStyle, AttributeName).

import type { Archetype, CombatStyle, AttributeName } from './types';

// ── Augment Slot Types ─────────────────────────────────────────────────────

export type AugmentSlotType = 'neural' | 'chassis' | 'limbs';

export interface CyberwareActiveAbility {
  name: string;
  description: string;
  ramCost?: number;
  cooldown: number; // turns
}

export type CyberwareQuality = 'scrap' | 'common' | 'milspec' | 'helixion' | 'prototype';

export interface CyberwareRequirements {
  attributes?: Partial<Record<AttributeName, number>>;
  archetype?: Archetype[];
  level?: number;
}

export interface CyberwareItem {
  id: string;
  name: string;
  description: string;
  slotType: AugmentSlotType;
  tier: 1 | 2 | 3;
  quality: CyberwareQuality;
  statBonuses: Partial<Record<AttributeName, number>>;
  passiveEffects: string[];
  activeAbility?: CyberwareActiveAbility;
  requirements?: CyberwareRequirements;
  removable: boolean;
  source: string;
  armorBonus?: number;
  initiativeBonus?: number;
}

export interface AugmentSlots {
  neural: CyberwareItem | null;
  chassis: CyberwareItem | null;
  limbs: CyberwareItem | null;
}

export interface StarterAugmentLoadout {
  slotted: AugmentSlots;
  inventory: CyberwareItem[];
}

// ── Sealed/Vacant Flavor Text ──────────────────────────────────────────────

export const SEALED_SLOT_TEXT: Record<AugmentSlotType, string> = {
  neural: "the socket is gone. scar tissue where the interface was. no implant goes here. ever. that was the point.",
  chassis: "",
  limbs: "",
};

export const TIER_LOCK_TEXT: Record<string, string> = {
  disconnected_t2: "tier locked. your body rejected augmentation. t1 maximum.",
  disconnected_t3: "tier locked. your body rejected augmentation. t1 maximum.",
  sovereign_t3: "tier 3 requires ghost ≥ 8. the sovereign frequency isn't strong enough.",
};

// ── Quality Display Colors ─────────────────────────────────────────────────

export function cyberwareQualityColor(quality: CyberwareQuality): string {
  switch (quality) {
    case 'prototype': return '#ff6600';
    case 'helixion': return '#cc99ff';
    case 'milspec': return '#3399ff';
    case 'common': return 'rgba(var(--phosphor-rgb),0.85)';
    case 'scrap': return 'rgba(var(--phosphor-rgb),0.45)';
  }
}

export function tierColor(tier: number): string {
  return tier === 3 ? '#ff6600' : tier === 2 ? '#cc99ff' : 'rgba(var(--phosphor-rgb),0.6)';
}

// ═══════════════════════════════════════════════════════════════════════════
// ITEM DATABASE — NEURAL
// ═══════════════════════════════════════════════════════════════════════════

export const CW_RECOMPILED_MNEMOS: CyberwareItem = {
  id: 'cw_recompiled_mnemos',
  name: 'Recompiled MNEMOS',
  description: "sovereign neural shunt. no master frequency. your signal, your rules. the implant that was meant to cage you — rewritten from the inside out.",
  slotType: 'neural', tier: 2, quality: 'helixion',
  statBonuses: { GHOST: 1, INT: 1 },
  passiveEffects: ['mesh_resistance', 'sovereign_attunement'],
  activeAbility: { name: 'Frequency Pulse', description: "emit a burst on 33hz. disrupts nearby mesh connections for 1 turn.", ramCost: 3, cooldown: 4 },
  requirements: { archetype: ['SOVEREIGN'] },
  removable: false, source: 'self-recompiled during sovereign emergence.',
};

export const CW_MNEMOS_V27_JAILBROKEN: CyberwareItem = {
  id: 'cw_mnemos_v27_jailbroken',
  name: 'MNEMOS v2.7 (Jailbroken)',
  description: "corporate architecture, rewritten firmware. still their hardware. your software. full mesh access with the leash cut.",
  slotType: 'neural', tier: 2, quality: 'helixion',
  statBonuses: { TECH: 2, INT: 1 },
  passiveEffects: ['full_mesh_access', 'hack_bonus'],
  activeAbility: { name: 'Mesh Exploit', description: "leverage residual corporate access codes. +3 to next quickhack.", ramCost: 2, cooldown: 5 },
  requirements: { archetype: ['INTEGRATED'] },
  removable: false, source: 'original helixion MNEMOS v2.7 implant. jailbroken.',
};

export const CW_NEURAL_SHUNT_MK1: CyberwareItem = {
  id: 'cw_neural_shunt_mk1',
  name: 'Neural Shunt Mk1',
  description: "basic signal router. cleans up neural noise, speeds up cognitive throughput. nothing fancy.",
  slotType: 'neural', tier: 1, quality: 'common',
  statBonuses: { INT: 1 }, passiveEffects: ['signal_clarity'],
  removable: true, source: 'iron bloom standard issue.',
};

export const CW_NEURAL_SHUNT_MK2: CyberwareItem = {
  id: 'cw_neural_shunt_mk2',
  name: 'Neural Shunt Mk2',
  description: "enhanced signal router with frequency filtering. sovereign-compatible architecture. blocks mesh intrusion passively.",
  slotType: 'neural', tier: 2, quality: 'milspec',
  statBonuses: { INT: 2, GHOST: 1 },
  passiveEffects: ['signal_clarity', 'passive_mesh_filter'],
  activeAbility: { name: 'Signal Boost', description: "+2 INT for 2 turns.", ramCost: 2, cooldown: 4 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: true, source: "iron bloom custom build. serrano's design.",
};

export const CW_REFLEX_DAMPENER: CyberwareItem = {
  id: 'cw_reflex_dampener',
  name: 'Reflex Dampener',
  description: "neural governor that suppresses panic responses. trades raw speed for steady hands.",
  slotType: 'neural', tier: 1, quality: 'common',
  statBonuses: { COOL: 1 }, passiveEffects: ['steady_aim', 'panic_immunity'],
  removable: true, source: 'freemarket vendor. mass-produced.',
};

export const CW_GHOST_RESONATOR: CyberwareItem = {
  id: 'cw_ghost_resonator',
  name: 'Ghost Resonator',
  description: "tunes neural output to 33hz sympathetic frequencies. the substrate notices you back.",
  slotType: 'neural', tier: 2, quality: 'prototype',
  statBonuses: { GHOST: 3 },
  passiveEffects: ['ghost_attunement', 'substrate_awareness', 'hidden_room_detection'],
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'], attributes: { GHOST: 5 } },
  removable: true, source: "unknown origin. found in the substrate level. grown, not manufactured.",
};

export const CW_CYBERDECK_INTERFACE: CyberwareItem = {
  id: 'cw_cyberdeck_interface',
  name: 'Cyberdeck Neural Interface',
  description: "hardwired cyberdeck bridge. routes quickhack execution through neural pathways. faster. more dangerous.",
  slotType: 'neural', tier: 2, quality: 'milspec',
  statBonuses: { TECH: 2 },
  passiveEffects: ['quickhack_speed', 'ram_efficiency'],
  activeAbility: { name: 'Overclock', description: "+4 RAM for this combat. 10% neural feedback risk.", ramCost: 0, cooldown: 99 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'], attributes: { TECH: 6 } },
  removable: true, source: "chrome wolves chop shop modification.",
};

export const CW_SOVEREIGN_FREQUENCY_IMPLANT: CyberwareItem = {
  id: 'cw_sovereign_frequency_implant',
  name: 'Sovereign Frequency Implant',
  description: "EC-000001's gift. perceive the 33hz at maximum clarity regardless of ghost stat.",
  slotType: 'neural', tier: 3, quality: 'prototype',
  statBonuses: { GHOST: 5, INT: 2 },
  passiveEffects: ['sovereign_frequency', 'ghost_10_perception', 'substrate_communion'],
  activeAbility: { name: 'Sovereign Broadcast', description: "broadcast on 33hz. enemies lose mesh coordination 3 turns. allies +2 GHOST.", ramCost: 6, cooldown: 99 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'], attributes: { GHOST: 8 } },
  removable: false, source: 'the well. helixion lab. EC-000001.',
};

// ═══════════════════════════════════════════════════════════════════════════
// ITEM DATABASE — CHASSIS
// ═══════════════════════════════════════════════════════════════════════════

export const CW_SUBDERMAL_PLATING_STD: CyberwareItem = {
  id: 'cw_subdermal_plating_std',
  name: 'Subdermal Plating (Standard)',
  description: "carbon-weave plating beneath the skin. stops small arms.",
  slotType: 'chassis', tier: 1, quality: 'common',
  statBonuses: {}, passiveEffects: ['damage_reduction'], armorBonus: 2,
  removable: true, source: 'iron bloom standard issue.',
};

export const CW_SUBDERMAL_PLATING_MIL: CyberwareItem = {
  id: 'cw_subdermal_plating_mil',
  name: 'Subdermal Plating (Military)',
  description: "mil-spec subdermal armor. helixion security grade.",
  slotType: 'chassis', tier: 2, quality: 'milspec',
  statBonuses: { BODY: 1 }, passiveEffects: ['damage_reduction', 'ballistic_resistance'], armorBonus: 4,
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: true, source: "glass's chrome gallery.",
};

export const CW_OPTICAL_CAMO_T1: CyberwareItem = {
  id: 'cw_optical_camo_t1',
  name: 'Optical Camo T1',
  description: "light-bending subdermal mesh. 3 charges per rest. makes you forgettable.",
  slotType: 'chassis', tier: 1, quality: 'common',
  statBonuses: { COOL: 1 }, passiveEffects: ['stealth_bonus'],
  activeAbility: { name: 'Cloak', description: "+5 stealth for 2 turns. 3 charges.", cooldown: 1 },
  removable: true, source: 'iron bloom stealth division.',
};

export const CW_OPTICAL_CAMO_T2: CyberwareItem = {
  id: 'cw_optical_camo_t2',
  name: 'Optical Camo T2',
  description: "advanced thermoptic camouflage. bends light AND heat signatures. 5 charges.",
  slotType: 'chassis', tier: 2, quality: 'milspec',
  statBonuses: { COOL: 2, GHOST: 1 }, passiveEffects: ['stealth_bonus', 'thermal_masking'],
  activeAbility: { name: 'Ghost Cloak', description: "+8 stealth for 3 turns. 5 charges.", cooldown: 1 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: true, source: 'military R&D leak.',
};

export const CW_THORACIC_REACTOR: CyberwareItem = {
  id: 'cw_thoracic_reactor',
  name: 'Thoracic Micro-Reactor',
  description: "miniaturized power core in the thoracic cavity. independence from external power grids.",
  slotType: 'chassis', tier: 2, quality: 'helixion',
  statBonuses: { BODY: 1, TECH: 1 }, passiveEffects: ['power_independence', 'emp_resistance_partial'],
  activeAbility: { name: 'Power Surge', description: "all cyberware bonuses doubled for 1 turn.", cooldown: 6 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: false, source: "iron bloom engineering. serrano's design.",
};

export const CW_EMP_SHIELDING: CyberwareItem = {
  id: 'cw_emp_shielding',
  name: 'EMP-Shielded Chassis',
  description: "faraday cage woven through the torso. never again.",
  slotType: 'chassis', tier: 2, quality: 'milspec',
  statBonuses: { BODY: 1 }, passiveEffects: ['emp_immunity', 'system_reset_resistance'],
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: false, source: 'iron bloom. the first thing serrano designed after nix arrived.',
};

export const CW_SPINAL_SENSOR_BUS: CyberwareItem = {
  id: 'cw_spinal_sensor_bus',
  name: 'Spinal Sensor Bus',
  description: "environmental awareness threaded along the spine. you feel the room before you see it.",
  slotType: 'chassis', tier: 2, quality: 'helixion',
  statBonuses: { REFLEX: 1, INT: 1 }, passiveEffects: ['environmental_awareness', 'ambush_immunity'],
  initiativeBonus: 2,
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: true, source: "reverse-engineered from nix's reconstruction.",
};

export const CW_SUBDERMAL_HARDENER: CyberwareItem = {
  id: 'cw_subdermal_hardener',
  name: 'Subdermal Hardener',
  description: "temporary structural reinforcement. one fight, then it needs recharging.",
  slotType: 'chassis', tier: 1, quality: 'scrap',
  statBonuses: {}, passiveEffects: ['temp_armor'], armorBonus: 3,
  removable: true, source: "needle's chop shop. fight pit special.",
};

// ═══════════════════════════════════════════════════════════════════════════
// ITEM DATABASE — LIMBS
// ═══════════════════════════════════════════════════════════════════════════

export const CW_REFLEX_BOOSTER_STD: CyberwareItem = {
  id: 'cw_reflex_booster_std',
  name: 'Reflex Booster (Standard)',
  description: "neural accelerator wired into the limbs. makes the gap between thought and action smaller.",
  slotType: 'limbs', tier: 1, quality: 'common',
  statBonuses: { REFLEX: 1 }, passiveEffects: ['initiative_boost'], initiativeBonus: 1,
  removable: true, source: 'iron bloom standard issue.',
};

export const CW_REINFORCED_CYBER_ARM_T1: CyberwareItem = {
  id: 'cw_reinforced_cyber_arm_t1',
  name: 'Reinforced Cybernetic Arm',
  description: "chrome arm. hits like a truck. doesn't break when you punch through a door.",
  slotType: 'limbs', tier: 1, quality: 'common',
  statBonuses: { BODY: 1 }, passiveEffects: ['melee_damage_bonus', 'strength_augmented'],
  removable: true, source: 'iron bloom reconstruction.',
};

export const CW_REINFORCED_CYBER_ARM_T2: CyberwareItem = {
  id: 'cw_reinforced_cyber_arm_t2',
  name: 'Reinforced Cybernetic Arm Mk2',
  description: "upgraded chrome. servos recalibrated, grip strength doubled, impact dampeners added.",
  slotType: 'limbs', tier: 2, quality: 'milspec',
  statBonuses: { BODY: 2, REFLEX: 1 }, passiveEffects: ['melee_damage_bonus_2', 'grip_strength'],
  activeAbility: { name: 'Gorilla Strike', description: "2d8 damage. can break doors and walls.", cooldown: 3 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: true, source: "iron bloom mk2 design.",
};

export const CW_MANTIS_BLADES: CyberwareItem = {
  id: 'cw_mantis_blades',
  name: 'Mantis Blades',
  description: "retractable arm blades. ceramic-tipped, mono-edged. 0.3 second deploy.",
  slotType: 'limbs', tier: 2, quality: 'milspec',
  statBonuses: { REFLEX: 1 }, passiveEffects: ['melee_weapon_integrated', 'armor_penetration'],
  activeAbility: { name: 'Mantis Rush', description: "charge attack. 2x range. 1d8+BODY.", cooldown: 3 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: false, source: "glass's chrome gallery. helixion military prototype.",
};

export const CW_MONO_WIRE: CyberwareItem = {
  id: 'cw_mono_wire',
  name: 'Mono-Wire',
  description: "monofilament wire spool in the wrist. cuts through anything organic. silent. surgical.",
  slotType: 'limbs', tier: 2, quality: 'milspec',
  statBonuses: { COOL: 1, REFLEX: 1 }, passiveEffects: ['stealth_melee', 'silent_kill'],
  activeAbility: { name: 'Wire Lash', description: "1d10 damage + hack component.", ramCost: 1, cooldown: 2 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'] },
  removable: true, source: 'iron bloom stealth division.',
};

export const CW_SIGNAL_SCRAMBLER: CyberwareItem = {
  id: 'cw_signal_scrambler',
  name: 'Signal Scrambler',
  description: "wrist-mounted signal disruptor. scrambles mesh in a 10-meter radius. makes you a dead zone.",
  slotType: 'limbs', tier: 1, quality: 'common',
  statBonuses: { GHOST: 1 }, passiveEffects: ['mesh_disruption_local'],
  activeAbility: { name: 'Scramble', description: "all enemies lose mesh bonuses for 2 turns.", cooldown: 5 },
  removable: true, source: 'signal pirates design.',
};

export const CW_KERENZIKOV: CyberwareItem = {
  id: 'cw_kerenzikov',
  name: 'Kerenzikov Reflex System',
  description: "time-dilation reflex augment. everything else seems slow. the hangover is brutal.",
  slotType: 'limbs', tier: 2, quality: 'milspec',
  statBonuses: { REFLEX: 2 }, passiveEffects: ['extra_dodge', 'initiative_major'], initiativeBonus: 3,
  activeAbility: { name: 'Bullet Time', description: "auto dodge next 2 attacks. +3 to all attacks 1 turn.", cooldown: 5 },
  requirements: { archetype: ['SOVEREIGN', 'INTEGRATED'], attributes: { REFLEX: 6 } },
  removable: true, source: 'helixion military surplus.',
};

export const CW_SANDEVISTAN: CyberwareItem = {
  id: 'cw_sandevistan',
  name: 'Sandevistan',
  description: "military-grade time dilation. one extra turn per combat. the world stops and you don't.",
  slotType: 'limbs', tier: 3, quality: 'helixion',
  statBonuses: { REFLEX: 3 }, passiveEffects: ['extra_turn', 'time_dilation'],
  activeAbility: { name: 'Sandevistan Burst', description: "gain 1 extra full turn. once per combat.", cooldown: 99 },
  requirements: { archetype: ['INTEGRATED'], attributes: { REFLEX: 7 } },
  removable: false, source: 'helixion R&D. never officially released.',
};

export const CW_SMART_LINK_OPTIC: CyberwareItem = {
  id: 'cw_smart_link_optic',
  name: 'Smart-Link Optic',
  description: "targeting overlay bonded to the ocular nerve. your eyes become a weapon system.",
  slotType: 'limbs', tier: 1, quality: 'common',
  statBonuses: { REFLEX: 1 }, passiveEffects: ['ranged_accuracy_bonus', 'target_tracking'],
  removable: true, source: 'freemarket. mass-produced.',
};

// ═══════════════════════════════════════════════════════════════════════════
// MASTER REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export const CYBERWARE_REGISTRY: Record<string, CyberwareItem> = {
  // Neural
  [CW_RECOMPILED_MNEMOS.id]: CW_RECOMPILED_MNEMOS,
  [CW_MNEMOS_V27_JAILBROKEN.id]: CW_MNEMOS_V27_JAILBROKEN,
  [CW_NEURAL_SHUNT_MK1.id]: CW_NEURAL_SHUNT_MK1,
  [CW_NEURAL_SHUNT_MK2.id]: CW_NEURAL_SHUNT_MK2,
  [CW_REFLEX_DAMPENER.id]: CW_REFLEX_DAMPENER,
  [CW_GHOST_RESONATOR.id]: CW_GHOST_RESONATOR,
  [CW_CYBERDECK_INTERFACE.id]: CW_CYBERDECK_INTERFACE,
  [CW_SOVEREIGN_FREQUENCY_IMPLANT.id]: CW_SOVEREIGN_FREQUENCY_IMPLANT,
  // Chassis
  [CW_SUBDERMAL_PLATING_STD.id]: CW_SUBDERMAL_PLATING_STD,
  [CW_SUBDERMAL_PLATING_MIL.id]: CW_SUBDERMAL_PLATING_MIL,
  [CW_OPTICAL_CAMO_T1.id]: CW_OPTICAL_CAMO_T1,
  [CW_OPTICAL_CAMO_T2.id]: CW_OPTICAL_CAMO_T2,
  [CW_THORACIC_REACTOR.id]: CW_THORACIC_REACTOR,
  [CW_EMP_SHIELDING.id]: CW_EMP_SHIELDING,
  [CW_SPINAL_SENSOR_BUS.id]: CW_SPINAL_SENSOR_BUS,
  [CW_SUBDERMAL_HARDENER.id]: CW_SUBDERMAL_HARDENER,
  // Limbs
  [CW_REFLEX_BOOSTER_STD.id]: CW_REFLEX_BOOSTER_STD,
  [CW_REINFORCED_CYBER_ARM_T1.id]: CW_REINFORCED_CYBER_ARM_T1,
  [CW_REINFORCED_CYBER_ARM_T2.id]: CW_REINFORCED_CYBER_ARM_T2,
  [CW_MANTIS_BLADES.id]: CW_MANTIS_BLADES,
  [CW_MONO_WIRE.id]: CW_MONO_WIRE,
  [CW_SIGNAL_SCRAMBLER.id]: CW_SIGNAL_SCRAMBLER,
  [CW_KERENZIKOV.id]: CW_KERENZIKOV,
  [CW_SANDEVISTAN.id]: CW_SANDEVISTAN,
  [CW_SMART_LINK_OPTIC.id]: CW_SMART_LINK_OPTIC,
};

// ═══════════════════════════════════════════════════════════════════════════
// STARTER LOADOUTS — All 12 Archetype + CombatStyle Combinations
// ═══════════════════════════════════════════════════════════════════════════

export function getStarterAugments(archetype: Archetype, combatStyle: CombatStyle): StarterAugmentLoadout {
  const key = `${archetype}_${combatStyle}`;

  switch (key) {
    // ── SOVEREIGN ──────────────────────────────────────────────────────
    case 'SOVEREIGN_CHROME':
      return {
        slotted: { neural: { ...CW_RECOMPILED_MNEMOS }, chassis: null, limbs: { ...CW_REINFORCED_CYBER_ARM_T1 } },
        inventory: [],
      };
    case 'SOVEREIGN_SYNAPSE':
      return {
        slotted: { neural: { ...CW_NEURAL_SHUNT_MK2 }, chassis: null, limbs: null },
        inventory: [{ ...CW_RECOMPILED_MNEMOS }],
      };
    case 'SOVEREIGN_BALLISTIC':
      return {
        slotted: { neural: { ...CW_RECOMPILED_MNEMOS }, chassis: null, limbs: null },
        inventory: [{ ...CW_SMART_LINK_OPTIC }],
      };
    case 'SOVEREIGN_GHOST_STYLE':
      return {
        slotted: { neural: { ...CW_RECOMPILED_MNEMOS }, chassis: { ...CW_OPTICAL_CAMO_T1 }, limbs: null },
        inventory: [{ ...CW_SIGNAL_SCRAMBLER }],
      };

    // ── INTEGRATED ─────────────────────────────────────────────────────
    case 'INTEGRATED_CHROME':
      return {
        slotted: { neural: { ...CW_MNEMOS_V27_JAILBROKEN }, chassis: { ...CW_SUBDERMAL_PLATING_STD }, limbs: { ...CW_MANTIS_BLADES } },
        inventory: [{ ...CW_REFLEX_BOOSTER_STD }],
      };
    case 'INTEGRATED_SYNAPSE':
      return {
        slotted: { neural: { ...CW_MNEMOS_V27_JAILBROKEN }, chassis: { ...CW_SUBDERMAL_PLATING_STD }, limbs: { ...CW_REFLEX_BOOSTER_STD } },
        inventory: [],
      };
    case 'INTEGRATED_BALLISTIC':
      return {
        slotted: { neural: { ...CW_MNEMOS_V27_JAILBROKEN }, chassis: { ...CW_SUBDERMAL_PLATING_STD }, limbs: { ...CW_REFLEX_BOOSTER_STD } },
        inventory: [{ ...CW_SMART_LINK_OPTIC }],
      };
    case 'INTEGRATED_GHOST_STYLE':
      return {
        slotted: { neural: { ...CW_MNEMOS_V27_JAILBROKEN }, chassis: { ...CW_OPTICAL_CAMO_T1 }, limbs: { ...CW_REFLEX_BOOSTER_STD } },
        inventory: [{ ...CW_SUBDERMAL_PLATING_STD }],
      };

    // ── DISCONNECTED ───────────────────────────────────────────────────
    default:
      return {
        slotted: { neural: null, chassis: null, limbs: null },
        inventory: [],
      };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER GATING LOGIC
// ═══════════════════════════════════════════════════════════════════════════

export function getSealedSlots(archetype: Archetype): AugmentSlotType[] {
  if (archetype === 'DISCONNECTED') return ['neural'];
  return [];
}

export interface TierCheckResult {
  allowed: boolean;
  reason?: string;
}

export function canEquipCyberware(
  item: CyberwareItem,
  archetype: Archetype,
  attributes: Record<string, number>,
  sealedSlots: AugmentSlotType[],
): TierCheckResult {
  if (sealedSlots.includes(item.slotType)) {
    return { allowed: false, reason: SEALED_SLOT_TEXT[item.slotType] };
  }
  if (item.requirements?.archetype && !item.requirements.archetype.includes(archetype)) {
    return { allowed: false, reason: `incompatible archetype. requires: ${item.requirements.archetype.join(' or ').toLowerCase()}.` };
  }
  const maxTier = archetype === 'DISCONNECTED' ? 1 : 3;
  if (item.tier > maxTier) {
    const lockKey = `${archetype.toLowerCase()}_t${item.tier}`;
    return { allowed: false, reason: TIER_LOCK_TEXT[lockKey] || `tier ${item.tier} locked.` };
  }
  if (archetype === 'SOVEREIGN' && item.tier === 3) {
    if ((attributes.GHOST || 0) < 8) {
      return { allowed: false, reason: TIER_LOCK_TEXT['sovereign_t3'] };
    }
  }
  if (item.requirements?.attributes) {
    for (const [attr, minVal] of Object.entries(item.requirements.attributes)) {
      if ((attributes[attr] || 0) < (minVal as number)) {
        return { allowed: false, reason: `requires ${attr.toLowerCase()} ≥ ${minVal}. current: ${attributes[attr] || 0}.` };
      }
    }
  }
  return { allowed: true };
}

// Convenience: filter inventory for items compatible with a given slot
export function getSlotCandidates(
  slotType: AugmentSlotType,
  inventoryCyberware: CyberwareItem[],
  archetype: Archetype,
  attributes: Record<string, number>,
  sealedSlots: AugmentSlotType[],
): { item: CyberwareItem; check: TierCheckResult }[] {
  return inventoryCyberware
    .filter(item => item.slotType === slotType)
    .map(item => ({ item, check: canEquipCyberware(item, archetype, attributes, sealedSlots) }));
}
