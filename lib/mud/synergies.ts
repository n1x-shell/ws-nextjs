// lib/mud/synergies.ts
// TUNNELCORE MUD — Synergy System
// Item + Skill combos that unlock special abilities.
// Not documented in-game — players discover by experimentation.

import type { MudCharacter } from './types';

// ── Synergy Definition ─────────────────────────────────────────────────────

export interface Synergy {
  id: string;
  name: string;
  itemId: string;
  requiredSkill: string;
  secondarySkill?: string;     // some synergies need two skills
  description: string;
  effectDescription: string;
  discoveryHint: string;       // NPC dialogue hint
  hintNPC: string;             // which NPC gives the hint
}

// ── Synergy Registry ───────────────────────────────────────────────────────

export const SYNERGIES: Synergy[] = [
  {
    id: 'compliance_echo',
    name: 'COMPLIANCE ECHO',
    itemId: 'corrupted_compliance_chip',
    requiredSkill: 'freq_resonance',
    description: 'Once per combat, force one mesh-connected enemy to repeat their last action.',
    effectDescription: 'the chip remembers what the mesh told it to do. now it tells them.',
    discoveryHint: 'compliance chips have echo patterns — if you know how to listen.',
    hintNPC: 'cole',
  },
  {
    id: 'wolfs_jaw',
    name: "WOLF'S JAW",
    itemId: 'fenrirs_tooth',
    requiredSkill: 'chrome_heavy_blow',
    description: "Fenrir's Tooth deals +1d6 on first attack per combat.",
    effectDescription: 'the blade remembers the wolf who named it. voss recognizes the fighting style.',
    discoveryHint: 'the original fenrir fought like something that had already decided you were dead.',
    hintNPC: 'voss',
  },
  {
    id: 'chrysalis_override',
    name: 'CHRYSALIS OVERRIDE',
    itemId: 'chrysalis_interface',
    requiredSkill: 'synapse_ghost_in_wire',
    description: 'Hack Chrysalis-affected NPCs to temporarily restore their original personality. Lasts 1 conversation.',
    effectDescription: 'they remember who they were. they\'ll forget again. but for that moment, they\'re real.',
    discoveryHint: 'theoretically possible to reverse the interface — if you had both the hardware and the reach.',
    hintNPC: 'cipher',
  },
  {
    id: 'leash_resonance',
    name: 'LEASH RESONANCE',
    itemId: 'the_leash_broken',
    requiredSkill: 'freq_attunement',
    description: 'The broken leash vibrates at 33hz. Acts as compass toward nearest Substrate access point.',
    effectDescription: 'the leash hums. pointing down. always down. toward the signal\'s source.',
    discoveryHint: 'broken chains sing. if you\'ve got the ears for it.',
    hintNPC: 'jonas',
  },
  {
    id: 'deep_cover',
    name: 'DEEP COVER',
    itemId: 'agent_null_badge',
    requiredSkill: 'uni_silver_tongue',
    description: 'D9 disguise lasts 30 minutes instead of 10. D9 NPCs share classified intel.',
    effectDescription: 'they think you\'re one of them. you almost are.',
    discoveryHint: 'd9 agents have verbal codes that change weekly. the badge auto-updates them.',
    hintNPC: 'asha',
  },
  {
    id: 'substrate_attunement',
    name: 'SUBSTRATE ATTUNEMENT',
    itemId: 'substrate_resonance_crystal',
    requiredSkill: 'freq_resonance',
    description: 'Crystal bonds permanently to one piece of equipment. +1 to primary stat, faint 33hz bioluminescent glow.',
    effectDescription: 'the crystal bonds to your gear. it pulses. it remembers the deep frequency.',
    discoveryHint: 'items the earth has touched resonate differently. gear that\'s been to the substrate... changes.',
    hintNPC: 'signal_npc',
  },
  {
    id: 'full_sovereignty',
    name: 'FULL SOVEREIGNTY',
    itemId: 'sovereign_frequency_implant',
    requiredSkill: 'freq_sovereign_signal',
    description: 'Immune to ALL mesh/compliance effects. Once per session, broadcast sovereign frequency to entire zone.',
    effectDescription: 'the tower isn\'t the only broadcast source anymore. you are.',
    discoveryHint: 'the theoretical framework is sound. you\'d need both the implant and the attunement.',
    hintNPC: 'serrano',
  },
];

// ── Synergy Detection ──────────────────────────────────────────────────────

const SYNERGY_MAP = new Map<string, Synergy>();
for (const syn of SYNERGIES) {
  SYNERGY_MAP.set(syn.id, syn);
}

/** Check if a character has activated a specific synergy */
export function hasSynergy(character: MudCharacter, synergyId: string): boolean {
  return character.discoveredSynergies?.includes(synergyId) ?? false;
}

/** Get all synergies a character currently qualifies for (including undiscovered) */
export function getEligibleSynergies(character: MudCharacter): Synergy[] {
  const inventory = [
    ...character.inventory.map(i => i.id),
    ...Object.values(character.gear).filter(Boolean).map(i => i!.id),
    ...character.cyberware.map(i => i.id),
  ];

  return SYNERGIES.filter(syn => {
    // Must have the item
    if (!inventory.includes(syn.itemId)) return false;
    // Must have the required skill
    if (!character.unlockedSkills.includes(syn.requiredSkill)) return false;
    // Must have secondary skill if required
    if (syn.secondarySkill && !character.unlockedSkills.includes(syn.secondarySkill)) return false;
    return true;
  });
}

/** Check for newly activated synergies and return them */
export function checkNewSynergies(character: MudCharacter): Synergy[] {
  const eligible = getEligibleSynergies(character);
  const discovered = character.discoveredSynergies ?? [];
  const newSynergies = eligible.filter(s => !discovered.includes(s.id));

  // Auto-discover
  for (const syn of newSynergies) {
    if (!character.discoveredSynergies) character.discoveredSynergies = [];
    character.discoveredSynergies.push(syn.id);
  }

  return newSynergies;
}

/** Get all discovered synergies for display */
export function getDiscoveredSynergies(character: MudCharacter): Synergy[] {
  const discovered = character.discoveredSynergies ?? [];
  return discovered.map(id => SYNERGY_MAP.get(id)).filter(Boolean) as Synergy[];
}

export function getSynergyById(id: string): Synergy | null {
  return SYNERGY_MAP.get(id) ?? null;
}
