// lib/mud/skillTree.ts
// TUNNELCORE MUD — Skill Tree System
// Full tree definitions, unlock logic, synergy detection.
// Trees: CHROME, SYNAPSE, BALLISTIC, GHOST, UNIVERSAL, FREQUENCY

import type { AttributeName, CombatStyle, MudCharacter } from './types';

// ── Skill Node Definition ──────────────────────────────────────────────────

export type SkillTreeId = 'chrome' | 'synapse' | 'ballistic' | 'ghost' | 'universal' | 'frequency';

export interface SkillNode {
  id: string;
  name: string;
  tree: SkillTreeId;
  tier: 1 | 2 | 3 | 4;
  branch: 'a' | 'b';
  cost: number;                 // 1 for primary/universal/frequency, 2 for cross-class
  prereqSkills: string[];       // skill IDs required
  prereqAttribute?: {
    attribute: AttributeName;
    minimum: number;
  };
  description: string;          // mechanical effect
  flavorText: string;           // in-character description
  effectType: 'passive' | 'active' | 'reactive';
  synergyKey?: string;          // for item synergy matching
}

// ── Tree Unlock Requirements ───────────────────────────────────────────────

/** Minimum points invested in a tree to unlock a given tier */
export const TIER_PREREQS: Record<number, number> = {
  1: 0,
  2: 1,  // at least 1 point in tree (a T1 node)
  3: 3,  // 2 points in tree (both paths to T2) — actually just need the parent
  4: 5,  // need parent chain
};

// ── Combat Style to Primary Tree Mapping ───────────────────────────────────

export const STYLE_TO_TREE: Record<CombatStyle, SkillTreeId> = {
  CHROME: 'chrome',
  SYNAPSE: 'synapse',
  BALLISTIC: 'ballistic',
  GHOST_STYLE: 'ghost',
};

export const TREE_LABELS: Record<SkillTreeId, string> = {
  chrome: 'CHROME',
  synapse: 'SYNAPSE',
  ballistic: 'BALLISTIC',
  ghost: 'GHOST',
  universal: 'UNIVERSAL',
  frequency: 'FREQUENCY',
};

// ── Attribute Increase Flavor Text ─────────────────────────────────────────

export const ATTRIBUTE_LEVEL_FLAVOR: Record<AttributeName, string> = {
  BODY:   'your frame absorbs the change. heavier steps. harder hands. the world gives way a little more when you push.',
  REFLEX: 'the gap between thought and action narrows. you\'re not faster — you\'re less hesitant. the delay was never physical.',
  TECH:   'systems that were opaque become transparent. you see the architecture. the machine language reads like prose.',
  INT:    'connections form. the data you\'ve been collecting assembles into patterns. you\'re not smarter — you\'re less ignorant.',
  COOL:   'the temperature drops. not literally — inside. the panic recedes. the calculation begins. you become harder to read.',
  GHOST:  'the frequency sharpens. things you couldn\'t see before flicker at the edge of perception. the hum is louder. not unpleasant. familiar.',
};

// ══════════════════════════════════════════════════════════════════════════════
// ── SKILL NODE DEFINITIONS ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const CHROME_NODES: SkillNode[] = [
  // Branch A — Offense
  {
    id: 'chrome_heavy_blow', name: 'Heavy Blow', tree: 'chrome',
    tier: 1, branch: 'a', cost: 1, prereqSkills: [],
    description: 'Melee attacks deal +2 damage.',
    flavorText: 'you learned to put your whole body into it. the chrome helps.',
    effectType: 'passive',
  },
  {
    id: 'chrome_mantis_rush', name: 'Mantis Rush', tree: 'chrome',
    tier: 2, branch: 'a', cost: 1, prereqSkills: ['chrome_heavy_blow'],
    description: 'Charge attack: move + attack as 1 AP. Double melee range.',
    flavorText: 'close the distance before they know you\'re moving. the servos scream. so do they.',
    effectType: 'active',
  },
  {
    id: 'chrome_berserk', name: 'Berserk', tree: 'chrome',
    tier: 3, branch: 'a', cost: 1, prereqSkills: ['chrome_mantis_rush'],
    prereqAttribute: { attribute: 'BODY', minimum: 7 },
    description: 'Activate: gain 2 extra AP for 3 turns. 1/combat. Cannot hack or use tech during berserk.',
    flavorText: 'the inhibitors come off. everything gets very simple. very fast. very red.',
    effectType: 'active',
  },
  {
    id: 'chrome_gorilla_arms', name: 'GORILLA ARMS', tree: 'chrome',
    tier: 4, branch: 'a', cost: 1, prereqSkills: ['chrome_berserk'],
    prereqAttribute: { attribute: 'BODY', minimum: 9 },
    description: 'Unarmed attacks deal 2d8. Can break doors, walls, and environmental obstacles.',
    flavorText: 'your hands are weapons now. the walls are suggestions. some rooms only open for fists like yours.',
    effectType: 'passive',
  },
  // Branch B — Defense
  {
    id: 'chrome_iron_skin', name: 'Iron Skin', tree: 'chrome',
    tier: 1, branch: 'b', cost: 1, prereqSkills: [],
    description: 'Passive armor +3.',
    flavorText: 'subdermal plating. you don\'t feel the small hits anymore. that should worry you more than it does.',
    effectType: 'passive',
  },
  {
    id: 'chrome_deflect', name: 'Deflect', tree: 'chrome',
    tier: 2, branch: 'b', cost: 1, prereqSkills: ['chrome_iron_skin'],
    prereqAttribute: { attribute: 'REFLEX', minimum: 5 },
    description: 'Reactive: when hit by melee, reduce damage by BODY modifier. 2/combat.',
    flavorText: 'you read the swing before it lands. redirect. absorb. return.',
    effectType: 'reactive',
  },
  {
    id: 'chrome_fortress', name: 'Chrome Fortress', tree: 'chrome',
    tier: 3, branch: 'b', cost: 1, prereqSkills: ['chrome_deflect'],
    prereqAttribute: { attribute: 'BODY', minimum: 8 },
    description: 'Armor value applies at 2x against ranged attacks. You become the cover.',
    flavorText: 'bullets flatten against you. you are the wall between them and the people behind you.',
    effectType: 'passive',
  },
  {
    id: 'chrome_juggernaut', name: 'JUGGERNAUT', tree: 'chrome',
    tier: 4, branch: 'b', cost: 1, prereqSkills: ['chrome_fortress'],
    prereqAttribute: { attribute: 'BODY', minimum: 9 },
    description: 'On kill: heal 15% of max HP. Immune to stun effects. You are the immovable object.',
    flavorText: 'they can\'t stop you. they know it. you know it. the math changes when one side can\'t be moved.',
    effectType: 'passive',
  },
];

const SYNAPSE_NODES: SkillNode[] = [
  // Branch A — Spread
  {
    id: 'synapse_buffer', name: 'Buffer', tree: 'synapse',
    tier: 1, branch: 'a', cost: 1, prereqSkills: [],
    description: '+4 RAM capacity.',
    flavorText: 'more headroom. more payload. the implant expands its allocation.',
    effectType: 'passive',
  },
  {
    id: 'synapse_spread', name: 'Spread', tree: 'synapse',
    tier: 2, branch: 'a', cost: 1, prereqSkills: ['synapse_buffer'],
    description: 'Quickhacks hit 2 targets simultaneously.',
    flavorText: 'why breach one system when the exploit works on two?',
    effectType: 'passive',
  },
  {
    id: 'synapse_daemon_king', name: 'Daemon King', tree: 'synapse',
    tier: 3, branch: 'a', cost: 1, prereqSkills: ['synapse_spread'],
    prereqAttribute: { attribute: 'TECH', minimum: 8 },
    description: 'Daemons persist at 2x duration.',
    flavorText: 'your programs outlast theirs. persistence is a weapon.',
    effectType: 'passive',
  },
  {
    id: 'synapse_neural_cascade', name: 'NEURAL CASCADE', tree: 'synapse',
    tier: 4, branch: 'a', cost: 1, prereqSkills: ['synapse_daemon_king'],
    prereqAttribute: { attribute: 'TECH', minimum: 9 },
    description: 'On kill via hack: free quickhack on nearest enemy. Chain reaction.',
    flavorText: 'when one falls, the cascade finds the next. your code is an epidemic.',
    effectType: 'reactive',
  },
  // Branch B — Breach
  {
    id: 'synapse_ice_breaker', name: 'ICE Breaker', tree: 'synapse',
    tier: 1, branch: 'b', cost: 1, prereqSkills: [],
    description: 'Quickhack damage +2.',
    flavorText: 'you crack ICE like eggshells. the corporate firewalls were designed for amateurs.',
    effectType: 'passive',
    synergyKey: 'ice_breaker',
  },
  {
    id: 'synapse_feedback_loop', name: 'Feedback Loop', tree: 'synapse',
    tier: 2, branch: 'b', cost: 1, prereqSkills: ['synapse_ice_breaker'],
    prereqAttribute: { attribute: 'INT', minimum: 6 },
    description: 'On successful hack: +2 RAM regen.',
    flavorText: 'each breach feeds the next. you built a perpetual motion machine inside your skull.',
    effectType: 'reactive',
  },
  {
    id: 'synapse_ghost_in_wire', name: 'Ghost in Wire', tree: 'synapse',
    tier: 3, branch: 'b', cost: 1, prereqSkills: ['synapse_feedback_loop'],
    prereqAttribute: { attribute: 'TECH', minimum: 8 },
    description: 'Hack through walls: 2 room range.',
    flavorText: 'you don\'t need line of sight. the mesh is everywhere. so are you.',
    effectType: 'passive',
    synergyKey: 'ghost_in_wire',
  },
  {
    id: 'synapse_system_zero', name: 'SYSTEM ZERO', tree: 'synapse',
    tier: 4, branch: 'b', cost: 1, prereqSkills: ['synapse_ghost_in_wire'],
    prereqAttribute: { attribute: 'TECH', minimum: 9 },
    description: 'Target all enemies in room: 1d4 to each. Reboot their cyberware. 1/combat.',
    flavorText: 'everything stops. every implant, every augment, every piece of chrome in the room goes dark. except yours.',
    effectType: 'active',
  },
];

const BALLISTIC_NODES: SkillNode[] = [
  // Branch A — Precision
  {
    id: 'ballistic_steady_aim', name: 'Steady Aim', tree: 'ballistic',
    tier: 1, branch: 'a', cost: 1, prereqSkills: [],
    description: 'Ranged attacks deal +2 damage.',
    flavorText: 'breathe. squeeze. the round goes where you tell it.',
    effectType: 'passive',
  },
  {
    id: 'ballistic_quick_draw', name: 'Quick Draw', tree: 'ballistic',
    tier: 2, branch: 'a', cost: 1, prereqSkills: ['ballistic_steady_aim'],
    description: '+3 initiative. First shot matters most.',
    flavorText: 'the fastest draw in the drainage. they\'re still reaching when you\'re already firing.',
    effectType: 'passive',
  },
  {
    id: 'ballistic_ricochet', name: 'Ricochet', tree: 'ballistic',
    tier: 3, branch: 'a', cost: 1, prereqSkills: ['ballistic_quick_draw'],
    prereqAttribute: { attribute: 'REFLEX', minimum: 8 },
    description: 'Missed shots hit random enemy at half damage.',
    flavorText: 'you don\'t miss. sometimes the bullet just takes the scenic route.',
    effectType: 'passive',
  },
  {
    id: 'ballistic_deadeye', name: 'DEADEYE', tree: 'ballistic',
    tier: 4, branch: 'a', cost: 1, prereqSkills: ['ballistic_ricochet'],
    prereqAttribute: { attribute: 'REFLEX', minimum: 9 },
    description: 'Crit range: 18-20. Crit = instant kill on non-boss. 1/combat.',
    flavorText: 'one shot. one certainty. the math has been done. the result is you, standing.',
    effectType: 'passive',
  },
  // Branch B — Suppression
  {
    id: 'ballistic_ammo_eff', name: 'Ammo Efficiency', tree: 'ballistic',
    tier: 1, branch: 'b', cost: 1, prereqSkills: [],
    description: '2x clip size. Make every magazine count.',
    flavorText: 'you learned to count rounds in the dark. waste nothing.',
    effectType: 'passive',
  },
  {
    id: 'ballistic_covering_fire', name: 'Covering Fire', tree: 'ballistic',
    tier: 2, branch: 'b', cost: 1, prereqSkills: ['ballistic_ammo_eff'],
    prereqAttribute: { attribute: 'COOL', minimum: 6 },
    description: '1 AP: target gets -3 to actions next turn.',
    flavorText: 'you don\'t have to hit them. just convince them that moving is a bad idea.',
    effectType: 'active',
  },
  {
    id: 'ballistic_suppression', name: 'Suppression', tree: 'ballistic',
    tier: 3, branch: 'b', cost: 1, prereqSkills: ['ballistic_covering_fire'],
    prereqAttribute: { attribute: 'COOL', minimum: 7 },
    description: 'Suppressed targets can\'t move for 2 turns.',
    flavorText: 'they\'re pinned. they know it. you know it. the only question is what happens next.',
    effectType: 'active',
  },
  {
    id: 'ballistic_artillery', name: 'ARTILLERY', tree: 'ballistic',
    tier: 4, branch: 'b', cost: 1, prereqSkills: ['ballistic_suppression'],
    prereqAttribute: { attribute: 'REFLEX', minimum: 9 },
    description: 'Ranged attack hits all enemies in room. Half damage. 1/combat.',
    flavorText: 'saturate the area. nothing survives the crossfire. nothing.',
    effectType: 'active',
  },
];

const GHOST_NODES: SkillNode[] = [
  // Branch A — Infiltration
  {
    id: 'ghost_shadow_step', name: 'Shadow Step', tree: 'ghost',
    tier: 1, branch: 'a', cost: 1, prereqSkills: [],
    description: 'Stealth +2. Harder to detect.',
    flavorText: 'you move like the dark moves. not fast — just inevitable.',
    effectType: 'passive',
    synergyKey: 'shadow_step',
  },
  {
    id: 'ghost_vanish', name: 'Vanish', tree: 'ghost',
    tier: 2, branch: 'a', cost: 1, prereqSkills: ['ghost_shadow_step'],
    description: 'Re-enter stealth mid-combat. 1/combat.',
    flavorText: 'one second you\'re there. the next, you\'re a rumor.',
    effectType: 'active',
  },
  {
    id: 'ghost_freq_cloak', name: 'Frequency Cloak', tree: 'ghost',
    tier: 3, branch: 'a', cost: 1, prereqSkills: ['ghost_vanish'],
    prereqAttribute: { attribute: 'GHOST', minimum: 7 },
    description: 'Invisible to all electronic detection. Immune to scan.',
    flavorText: 'you exist at a frequency they can\'t tune to. their instruments say you\'re not here. they\'re right.',
    effectType: 'passive',
  },
  {
    id: 'ghost_ghost_walk', name: 'GHOST WALK', tree: 'ghost',
    tier: 4, branch: 'a', cost: 1, prereqSkills: ['ghost_freq_cloak'],
    prereqAttribute: { attribute: 'GHOST', minimum: 9 },
    description: 'Move through 1 locked door per room. Phase. The walls are suggestions.',
    flavorText: 'you don\'t open doors anymore. you pass through them. the matter moves aside. it knows you.',
    effectType: 'active',
  },
  // Branch B — Assassination
  {
    id: 'ghost_whisper_kill', name: 'Whisper Kill', tree: 'ghost',
    tier: 1, branch: 'b', cost: 1, prereqSkills: [],
    description: 'Stealth kill = silent, no alert.',
    flavorText: 'they don\'t hear. they don\'t scream. they just... stop.',
    effectType: 'passive',
  },
  {
    id: 'ghost_patient_blade', name: 'Patient Blade', tree: 'ghost',
    tier: 2, branch: 'b', cost: 1, prereqSkills: ['ghost_whisper_kill'],
    prereqAttribute: { attribute: 'COOL', minimum: 6 },
    description: 'Study target 1 turn: next attack auto-crits.',
    flavorText: 'watch them. learn their rhythm. find the gap. there\'s always a gap.',
    effectType: 'active',
  },
  {
    id: 'ghost_marked_for_death', name: 'Marked for Death', tree: 'ghost',
    tier: 3, branch: 'b', cost: 1, prereqSkills: ['ghost_patient_blade'],
    prereqAttribute: { attribute: 'COOL', minimum: 8 },
    description: 'Mark persists even if stealth broken. +50% damage from all sources for 3 turns.',
    flavorText: 'they don\'t know they\'re already dead. but their body does. it starts flinching before you move.',
    effectType: 'active',
  },
  {
    id: 'ghost_frequency_strike', name: 'FREQUENCY STRIKE', tree: 'ghost',
    tier: 4, branch: 'b', cost: 1, prereqSkills: ['ghost_marked_for_death'],
    prereqAttribute: { attribute: 'GHOST', minimum: 9 },
    description: 'Attack from stealth at 33hz. 3x damage. Target hears the hum before they die.',
    flavorText: 'the signal becomes the blade. the frequency becomes the wound. they hear 33hz and then nothing.',
    effectType: 'active',
  },
];

const UNIVERSAL_NODES: SkillNode[] = [
  // Branch A — Crafting
  {
    id: 'uni_scavenger', name: 'Scavenger', tree: 'universal',
    tier: 1, branch: 'a', cost: 1, prereqSkills: [],
    description: '+50% loot from environmental containers.',
    flavorText: 'you see value where others see garbage. everything down here has a second life.',
    effectType: 'passive',
  },
  {
    id: 'uni_resourceful', name: 'Resourceful', tree: 'universal',
    tier: 2, branch: 'a', cost: 1, prereqSkills: ['uni_scavenger'],
    description: 'Craft without workbench. Field repairs.',
    flavorText: 'you don\'t need a workshop. a flat surface and steady hands. you\'ve done more with less.',
    effectType: 'passive',
  },
  {
    id: 'uni_alchemist', name: 'Alchemist', tree: 'universal',
    tier: 3, branch: 'a', cost: 1, prereqSkills: ['uni_resourceful'],
    prereqAttribute: { attribute: 'TECH', minimum: 6 },
    description: 'Craft T2 items at field workbench. Create basic stims from bio-samples.',
    flavorText: 'organic chemistry meets desperation. you can make medicine from tunnel fungus. it tastes terrible. it works.',
    effectType: 'passive',
  },
  {
    id: 'uni_self_sufficient', name: 'SELF-SUFFICIENT', tree: 'universal',
    tier: 4, branch: 'a', cost: 1, prereqSkills: ['uni_alchemist'],
    prereqAttribute: { attribute: 'TECH', minimum: 8 },
    description: 'Craft T3 items. Create stims from raw materials. You ARE the workshop.',
    flavorText: 'you carry the workshop in your head. materials are everywhere. you just need to see them.',
    effectType: 'passive',
  },
  // Branch B — Social
  {
    id: 'uni_street_smart', name: 'Street Smart', tree: 'universal',
    tier: 1, branch: 'b', cost: 1, prereqSkills: [],
    description: 'NPC prices -10%.',
    flavorText: 'you know what things are worth. more importantly, you know what sellers think they\'re worth.',
    effectType: 'passive',
  },
  {
    id: 'uni_silver_tongue', name: 'Silver Tongue', tree: 'universal',
    tier: 2, branch: 'b', cost: 1, prereqSkills: ['uni_street_smart'],
    prereqAttribute: { attribute: 'COOL', minimum: 5 },
    description: 'Disposition gains +50%. Unlock hidden dialogue.',
    flavorText: 'people tell you things they shouldn\'t. it\'s not charm — it\'s permission.',
    effectType: 'passive',
    synergyKey: 'silver_tongue',
  },
  {
    id: 'uni_double_agent', name: 'Double Agent', tree: 'universal',
    tier: 3, branch: 'b', cost: 1, prereqSkills: ['uni_silver_tongue'],
    prereqAttribute: { attribute: 'COOL', minimum: 7 },
    description: 'Maintain positive rep with opposed factions. The lies hold longer.',
    flavorText: 'everyone thinks you\'re on their side. the trick is believing it yourself, just enough.',
    effectType: 'passive',
  },
  {
    id: 'uni_ghost_broker', name: 'GHOST BROKER', tree: 'universal',
    tier: 4, branch: 'b', cost: 1, prereqSkills: ['uni_double_agent'],
    prereqAttribute: { attribute: 'COOL', minimum: 9 },
    description: 'Buy/sell with ANY faction regardless of rep. Information is currency and you print it.',
    flavorText: 'you trade in secrets. the market doesn\'t care about loyalty — it cares about leverage.',
    effectType: 'passive',
  },
];

const FREQUENCY_NODES: SkillNode[] = [
  // Branch A — Broadcast
  {
    id: 'freq_resonance', name: 'Resonance', tree: 'frequency',
    tier: 1, branch: 'a', cost: 1, prereqSkills: [],
    prereqAttribute: { attribute: 'GHOST', minimum: 6 },
    description: 'Sense hidden rooms within 2 rooms. Passive.',
    flavorText: 'you feel them — spaces behind the walls where the signal bends. the architecture has secrets.',
    effectType: 'passive',
    synergyKey: 'resonance',
  },
  {
    id: 'freq_substrate_sense', name: 'Substrate Sense', tree: 'frequency',
    tier: 2, branch: 'a', cost: 1, prereqSkills: ['freq_resonance'],
    prereqAttribute: { attribute: 'GHOST', minimum: 7 },
    description: 'See through walls in Substrate zones. Detect hidden enemies. Passive.',
    flavorText: 'the Substrate shows you what\'s behind the concrete. it wants you to see.',
    effectType: 'passive',
  },
  {
    id: 'freq_pulse', name: 'Pulse', tree: 'frequency',
    tier: 3, branch: 'a', cost: 1, prereqSkills: ['freq_substrate_sense'],
    prereqAttribute: { attribute: 'GHOST', minimum: 8 },
    description: 'Emit 33hz burst: all mesh-connected enemies stunned 1 turn. All allies heal 10 HP. 1/combat.',
    flavorText: 'the signal erupts from you. everything mesh-connected freezes. your people feel it as warmth.',
    effectType: 'active',
  },
  {
    id: 'freq_sovereign_signal', name: 'SOVEREIGN SIGNAL', tree: 'frequency',
    tier: 4, branch: 'a', cost: 1, prereqSkills: ['freq_pulse'],
    prereqAttribute: { attribute: 'GHOST', minimum: 10 },
    description: 'Passive: all party members gain +2 GHOST while in your presence. The signal comes from you now.',
    flavorText: 'you don\'t receive the signal anymore. you ARE the signal. everyone near you can hear it.',
    effectType: 'passive',
    synergyKey: 'sovereign_signal',
  },
  // Branch B — Persistence
  {
    id: 'freq_attunement', name: 'Attunement', tree: 'frequency',
    tier: 1, branch: 'b', cost: 1, prereqSkills: [],
    prereqAttribute: { attribute: 'GHOST', minimum: 6 },
    description: 'Passive: +2 resist vs all mesh/hack effects.',
    flavorText: 'the signal wraps around you. a second skin made of frequency. the mesh slides off.',
    effectType: 'passive',
    synergyKey: 'attunement',
  },
  {
    id: 'freq_shield', name: 'Frequency Shield', tree: 'frequency',
    tier: 2, branch: 'b', cost: 1, prereqSkills: ['freq_attunement'],
    prereqAttribute: { attribute: 'GHOST', minimum: 7 },
    description: 'Absorb 1 mesh attack per combat. The signal protects you.',
    flavorText: 'the hack hits your firewall and dissolves. not your firewall — the signal\'s. it chose to protect you.',
    effectType: 'reactive',
  },
  {
    id: 'freq_echo', name: 'Echo', tree: 'frequency',
    tier: 3, branch: 'b', cost: 1, prereqSkills: ['freq_shield'],
    prereqAttribute: { attribute: 'GHOST', minimum: 9 },
    description: 'On death: persist as echo for 3 turns. Deal half damage. If party kills source, resurrect at 25% HP.',
    flavorText: 'you don\'t end. not immediately. the frequency holds your pattern for a few seconds longer.',
    effectType: 'reactive',
  },
  {
    id: 'freq_rememberer', name: 'REMEMBERER', tree: 'frequency',
    tier: 4, branch: 'b', cost: 1, prereqSkills: ['freq_echo'],
    prereqAttribute: { attribute: 'GHOST', minimum: 10 },
    description: 'The signal remembers everyone. On kill: absorb target\'s last memory. Unique lore per enemy.',
    flavorText: 'they were someone. the signal caught their last thought as they fell. you carry it now. all of them.',
    effectType: 'passive',
    synergyKey: 'rememberer',
  },
];

// ── Full Skill Registry ────────────────────────────────────────────────────

export const ALL_SKILLS: SkillNode[] = [
  ...CHROME_NODES,
  ...SYNAPSE_NODES,
  ...BALLISTIC_NODES,
  ...GHOST_NODES,
  ...UNIVERSAL_NODES,
  ...FREQUENCY_NODES,
];

const SKILL_MAP: Record<string, SkillNode> = {};
for (const node of ALL_SKILLS) {
  SKILL_MAP[node.id] = node;
}

// ── Lookups ────────────────────────────────────────────────────────────────

export function getSkillNode(id: string): SkillNode | null {
  return SKILL_MAP[id] ?? null;
}

export function getTreeNodes(tree: SkillTreeId): SkillNode[] {
  return ALL_SKILLS.filter(n => n.tree === tree);
}

export function getTreeNodesForStyle(style: CombatStyle): SkillNode[] {
  return getTreeNodes(STYLE_TO_TREE[style]);
}

// ── Unlock Logic ───────────────────────────────────────────────────────────

export function canUnlockSkill(
  skillId: string,
  character: MudCharacter,
  isCrossClass: boolean = false,
): { canUnlock: boolean; reason?: string } {
  const node = SKILL_MAP[skillId];
  if (!node) return { canUnlock: false, reason: 'skill not found' };

  // Already unlocked?
  if (character.unlockedSkills.includes(skillId)) {
    return { canUnlock: false, reason: 'already unlocked' };
  }

  // Cost check
  const cost = isCrossClass ? 2 : node.cost;
  if (character.skillPoints < cost) {
    return { canUnlock: false, reason: `requires ${cost} skill point${cost > 1 ? 's' : ''} (you have ${character.skillPoints})` };
  }

  // Prerequisite skills
  for (const prereq of node.prereqSkills) {
    if (!character.unlockedSkills.includes(prereq)) {
      const prereqNode = SKILL_MAP[prereq];
      return { canUnlock: false, reason: `requires ${prereqNode?.name ?? prereq}` };
    }
  }

  // Attribute prerequisite
  if (node.prereqAttribute) {
    const { attribute, minimum } = node.prereqAttribute;
    if (character.attributes[attribute] < minimum) {
      return { canUnlock: false, reason: `requires ${attribute} ≥ ${minimum} (you have ${character.attributes[attribute]})` };
    }
  }

  // Cross-class restrictions: T1-T2 only
  if (isCrossClass && node.tier > 2) {
    return { canUnlock: false, reason: 'cross-class only allows tier 1-2' };
  }

  // Cross-class: must be level 10+
  if (isCrossClass && character.level < 10) {
    return { canUnlock: false, reason: 'cross-class unlocks at level 10' };
  }

  // Frequency tree: GHOST ≥ 6 baseline
  if (node.tree === 'frequency' && character.attributes.GHOST < 6) {
    return { canUnlock: false, reason: 'frequency tree requires GHOST ≥ 6' };
  }

  return { canUnlock: true };
}

export function unlockSkill(
  character: MudCharacter,
  skillId: string,
  isCrossClass: boolean = false,
): { success: boolean; error?: string } {
  const check = canUnlockSkill(skillId, character, isCrossClass);
  if (!check.canUnlock) return { success: false, error: check.reason };

  const node = SKILL_MAP[skillId]!;
  const cost = isCrossClass ? 2 : node.cost;
  character.skillPoints -= cost;
  character.unlockedSkills.push(skillId);

  return { success: true };
}

// ── Tree Display Data ──────────────────────────────────────────────────────

export interface TreeDisplayNode {
  node: SkillNode;
  unlocked: boolean;
  available: boolean;     // can unlock right now
  reason?: string;        // why not available
}

export function getTreeDisplay(
  tree: SkillTreeId,
  character: MudCharacter,
  isCrossClass: boolean = false,
): TreeDisplayNode[] {
  const nodes = getTreeNodes(tree);
  return nodes.map(node => {
    const unlocked = character.unlockedSkills.includes(node.id);
    const check = unlocked ? { canUnlock: false } : canUnlockSkill(node.id, character, isCrossClass);
    return {
      node,
      unlocked,
      available: check.canUnlock,
      reason: unlocked ? undefined : check.reason,
    };
  });
}

/** Count points invested in a tree */
export function getPointsInTree(tree: SkillTreeId, character: MudCharacter): number {
  return ALL_SKILLS.filter(n => n.tree === tree && character.unlockedSkills.includes(n.id)).length;
}

/** Check if a character has access to the frequency tree */
export function hasFrequencyTreeAccess(character: MudCharacter): boolean {
  return character.attributes.GHOST >= 6;
}

/** Check if cross-class is available */
export function hasCrossClassAccess(character: MudCharacter): boolean {
  return character.level >= 10;
}

/** Get all available trees for a character */
export function getAvailableTrees(character: MudCharacter): SkillTreeId[] {
  const trees: SkillTreeId[] = [
    STYLE_TO_TREE[character.combatStyle],
    'universal',
  ];
  if (hasFrequencyTreeAccess(character)) trees.push('frequency');
  return trees;
}
