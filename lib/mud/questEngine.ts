// lib/mud/questEngine.ts
// TUNNELCORE MUD — Quest Engine
// Quest definitions, objective tracking, rewards.

import type {
  Quest, QuestObjective, QuestReward,
  MudCharacter, MudWorldState,
} from './types';
import { saveWorld, loadWorld, updateNPCRelation, getNPCRelation } from './persistence';
import { addXP } from './character';
import { createItem } from './items';

// ── Quest Registry ──────────────────────────────────────────────────────────

export const QUEST_REGISTRY: Record<string, Quest> = {
  q001_lost_subject: {
    id: 'q001_lost_subject',
    title: 'THE LOST SUBJECT',
    giver: 'doss',
    tier: 1,
    type: 'MULTI',
    description: `a new test subject was dumped in the tunnels by helixion three days ago. retrieval team will come for them. find the subject before they do.`,
    objectives: [
      { id: 'obj_talk_doss', description: 'Talk to Doss about the missing subject', type: 'talk_to', target: 'doss', current: 0, required: 1, completed: false },
      { id: 'obj_search_north', description: 'Search the North Channel', type: 'go_to', target: 'z08_r04', current: 0, required: 1, completed: false },
      { id: 'obj_find_subject', description: 'Find the test subject', type: 'examine', target: 'subject_trail', current: 0, required: 1, completed: false },
      { id: 'obj_return', description: 'Return to Doss', type: 'talk_to', target: 'doss', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 100, creds: 30, items: ['stim_pack', 'stim_pack'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 1,
  },
  q002_mara_scrap: {
    id: 'q002_mara_scrap',
    title: 'SCRAP RUN',
    giver: 'mara',
    tier: 1,
    type: 'FETCH',
    description: `mara needs drone components. the patrol drones in the east passage drop them. bring her 2.`,
    objectives: [
      { id: 'obj_get_drone', description: 'Collect 2 drone components', type: 'collect', target: 'drone_components', current: 0, required: 2, completed: false },
      { id: 'obj_deliver', description: 'Deliver to Mara', type: 'deliver', target: 'mara', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 75, creds: 20 },
    repeatable: true,
    prerequisites: [],
    levelRequirement: 1,
  },
  q003_cole_supplies: {
    id: 'q003_cole_supplies',
    title: 'MEDICAL SALVAGE',
    giver: 'cole',
    tier: 1,
    type: 'FETCH',
    description: `cole's running low on bio-samples for synthesizing antitox. the seep has creatures that carry what he needs.`,
    objectives: [
      { id: 'obj_get_bio', description: 'Collect 1 bio-sample from The Seep', type: 'collect', target: 'bio_sample', current: 0, required: 1, completed: false },
      { id: 'obj_return_cole', description: 'Return to Cole', type: 'deliver', target: 'cole', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 60, creds: 15, items: ['medkit'] },
    repeatable: true,
    prerequisites: [],
    levelRequirement: 1,
  },

  // ── Zone 09: Maintenance Tunnels Quests ──────────────────────────────────

  q004_renovation: {
    id: 'q004_renovation',
    title: 'THE RENOVATION',
    giver: 'moth',
    tier: 2,
    type: 'SABOTAGE',
    description: `moth's old building is getting helixion mesh-compliance hardware. the new cable runs will extend monitoring into the tunnel infrastructure beneath the building. they'll find her. disable the cables from below before they go active.`,
    objectives: [
      { id: 'obj_find_cables', description: 'find the new cable runs in the Ventilation Hub', type: 'go_to', target: 'z09_r03', current: 0, required: 1, completed: false },
      { id: 'obj_disable', description: 'disable the cable runs (TECH ≥ 6)', type: 'examine', target: 'renovation_cables', current: 0, required: 1, completed: false },
      { id: 'obj_return_moth', description: 'return to Moth', type: 'talk_to', target: 'moth', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 120, creds: 25 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 4,
  },
  q005_shipment: {
    id: 'q005_shipment',
    title: 'THE SHIPMENT',
    giver: 'fex',
    tier: 2,
    type: 'FETCH',
    description: `fex had a medical shipment coming through — supplies for the parish. her courier got intercepted by d9 in the sensor corridor. courier escaped. supplies didn't. the cargo is in a d9 seizure cache on the helixion side. cross the bulkhead. get it back.`,
    objectives: [
      { id: 'obj_cross_bulkhead', description: 'cross the bulkhead to the Helixion side', type: 'go_to', target: 'z09_r07', current: 0, required: 1, completed: false },
      { id: 'obj_find_cache', description: 'find the D9 seizure cache', type: 'examine', target: 'clean_corridor', current: 0, required: 1, completed: false },
      { id: 'obj_recover_supplies', description: 'recover the medical supplies', type: 'collect', target: 'seized_medical_supplies', current: 0, required: 1, completed: false },
      { id: 'obj_return_fex', description: 'return to Fex', type: 'deliver', target: 'fex', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 150, creds: 40 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 5,
  },
  q006_supply_line: {
    id: 'q006_supply_line',
    title: 'SUPPLY LINE',
    giver: 'fex',
    tier: 2,
    type: 'MULTI',
    description: `fex wants a permanent supply corridor from the maintenance tunnels to the iron bloom server farm. the route passes through the deep access shaft but the passage is blocked by collapse. clear it. open the road.`,
    objectives: [
      { id: 'obj_reach_shaft', description: 'reach the Deep Access Shaft', type: 'go_to', target: 'z09_r11', current: 0, required: 1, completed: false },
      { id: 'obj_clear_passage', description: 'clear the collapsed passage', type: 'examine', target: 'collapsed_passage', current: 0, required: 1, completed: false },
      { id: 'obj_return_fex_supply', description: 'return to Fex', type: 'talk_to', target: 'fex', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 125, creds: 30 },
    repeatable: false,
    prerequisites: ['q005_shipment'],
    levelRequirement: 5,
  },
  q007_maintenance_override: {
    id: 'q007_maintenance_override',
    title: 'MAINTENANCE OVERRIDE',
    giver: 'hale',
    tier: 3,
    type: 'MULTI',
    description: `hale knows something is wrong beneath the campus. he's been rerouted around a section that doesn't appear on his maintenance schedule. he'll give you utility override codes — trigger a distraction, access the staging area, and document what helixion is building down there. he needs to know. the not-knowing is worse than the danger.`,
    objectives: [
      { id: 'obj_talk_hale', description: 'get utility codes from Hale', type: 'talk_to', target: 'hale', current: 0, required: 1, completed: false },
      { id: 'obj_trigger_distraction', description: 'trigger distraction at the utility console', type: 'examine', target: 'utility_console', current: 0, required: 1, completed: false },
      { id: 'obj_access_staging', description: 'access the Staging Area', type: 'go_to', target: 'z09_r10', current: 0, required: 1, completed: false },
      { id: 'obj_document', description: 'document the containers', type: 'examine', target: 'hx7c_containers', current: 0, required: 1, completed: false },
      { id: 'obj_return_hale', description: 'return to Hale', type: 'talk_to', target: 'hale', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 250, creds: 60 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 7,
  },
  q008_the_exchange: {
    id: 'q008_the_exchange',
    title: 'THE EXCHANGE',
    giver: 'reed',
    tier: 3,
    type: 'INVESTIGATE',
    description: `reed has been monitoring the elevator for four months. every third delivery, the exchange rate is unequal — more substrate material comes up than helixion technology goes down. either helixion is extracting independently, or the substrate is giving more than it receives. ride the elevator to SL-3. document what happens at the bottom.`,
    objectives: [
      { id: 'obj_talk_reed', description: 'talk to Reed about the discrepancy', type: 'talk_to', target: 'reed', current: 0, required: 1, completed: false },
      { id: 'obj_ride_elevator', description: 'ride the elevator to SL-3', type: 'go_to', target: 'z14_r01', current: 0, required: 1, completed: false },
      { id: 'obj_document_exchange', description: 'document the Substrate exchange', type: 'examine', target: 'substrate_exchange', current: 0, required: 1, completed: false },
      { id: 'obj_return_reed', description: 'return to Reed', type: 'talk_to', target: 'reed', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 300, creds: 75, items: ['substrate_sample'] },
    repeatable: false,
    prerequisites: ['q007_maintenance_override'],
    levelRequirement: 8,
  },

  // ── Zone 04: The Fringe Quests ─────────────────────────────────────────────

  q009_first_steps: {
    id: 'q009_first_steps',
    title: 'FIRST STEPS',
    giver: 'lira',
    tier: 1,
    type: 'MULTI',
    description: `lira saved your life. now prove you can keep it. find a weapon, find food, find someone who knows this place.`,
    objectives: [
      { id: 'obj_weapon', description: 'Find a weapon', type: 'collect', target: 'scrap_weapon', current: 0, required: 1, completed: false },
      { id: 'obj_food', description: 'Find food', type: 'collect', target: 'nutrient_bar', current: 0, required: 1, completed: false },
      { id: 'obj_info', description: 'Talk to Oska in the Rubble Streets', type: 'talk_to', target: 'oska', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 80, creds: 15 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 1,
  },
  q010_the_name: {
    id: 'q010_the_name',
    title: 'THE NAME',
    giver: 'lira',
    tier: 2,
    type: 'INVESTIGATE',
    description: `more subjects dumped in the fringe. one per week. lira wants to know why. the trail leads through the deep ruins.`,
    objectives: [
      { id: 'obj_search_deep', description: 'Search the Deep Ruins', type: 'go_to', target: 'z04_r09', current: 0, required: 1, completed: false },
      { id: 'obj_examine_site', description: 'Examine the dumping site', type: 'examine', target: 'dumping_site', current: 0, required: 1, completed: false },
      { id: 'obj_return_lira', description: 'Return to Lira', type: 'talk_to', target: 'lira', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 150, creds: 35, items: ['chrysalis_evidence'] },
    repeatable: false,
    prerequisites: ['q009_first_steps'],
    levelRequirement: 3,
  },
  q011_dead_zones: {
    id: 'q011_dead_zones',
    title: 'DEAD ZONES',
    giver: 'oska',
    tier: 1,
    type: 'MULTI',
    description: `oska's maps have gaps. three areas too dangerous to survey alone. scout them and report back.`,
    objectives: [
      { id: 'obj_survey_underpass', description: 'Survey the Underpass', type: 'go_to', target: 'z04_r04', current: 0, required: 1, completed: false },
      { id: 'obj_survey_stalker', description: 'Survey Stalker Territory', type: 'go_to', target: 'z04_r10', current: 0, required: 1, completed: false },
      { id: 'obj_survey_clinic', description: 'Survey the Clinic', type: 'go_to', target: 'z04_r08', current: 0, required: 1, completed: false },
      { id: 'obj_return_oska', description: 'Return to Oska', type: 'talk_to', target: 'oska', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 100, creds: 20, items: ['fringe_complete_map'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 2,
  },
  q012_old_plans: {
    id: 'q012_old_plans',
    title: 'THE OLD PLANS',
    giver: 'kai',
    tier: 2,
    type: 'FETCH',
    description: `kai's drainage blueprints were taken from his tower months ago. scavengers, probably. the plans reveal the full tunnel network.`,
    objectives: [
      { id: 'obj_search_cache', description: 'Search the Scavenger Cache', type: 'go_to', target: 'z04_r05', current: 0, required: 1, completed: false },
      { id: 'obj_find_blueprints', description: 'Find the blueprints', type: 'examine', target: 'stolen_blueprints', current: 0, required: 1, completed: false },
      { id: 'obj_return_kai', description: 'Return to Kai', type: 'talk_to', target: 'kai', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 175, creds: 30, items: ['drainage_blueprints'] },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 3,
  },
  q013_verification: {
    id: 'q013_verification',
    title: 'VERIFICATION',
    giver: 'sable',
    tier: 2,
    type: 'MULTI',
    description: `sable guards the way to iron bloom. prove you belong. bring evidence of helixion wrongdoing, a referral from someone she trusts, or clear the stalker nest and bring proof.`,
    objectives: [
      { id: 'obj_get_evidence', description: 'Obtain Helixion evidence', type: 'collect', target: 'chrysalis_evidence', current: 0, required: 1, completed: false },
      { id: 'obj_present_sable', description: 'Present to Sable', type: 'talk_to', target: 'sable', current: 0, required: 1, completed: false },
    ],
    rewards: { xp: 200, creds: 50 },
    repeatable: false,
    prerequisites: [],
    levelRequirement: 4,
  },
};

// ── Quest State Management ──────────────────────────────────────────────────

export function getAvailableQuests(character: MudCharacter, world: MudWorldState): Quest[] {
  return Object.values(QUEST_REGISTRY).filter(q => {
    if (world.activeQuests.includes(q.id)) return false;
    if (world.completedQuests.includes(q.id) && !q.repeatable) return false;
    if ((world.declinedQuests ?? []).includes(q.id)) return false;
    if (q.levelRequirement && character.level < q.levelRequirement) return false;
    if (q.prerequisites.some(p => !world.completedQuests.includes(p))) return false;
    return true;
  });
}

export function getActiveQuests(world: MudWorldState): Quest[] {
  return world.activeQuests
    .map(id => QUEST_REGISTRY[id])
    .filter(Boolean);
}

export function getDeclinedQuests(world: MudWorldState): Quest[] {
  return (world.declinedQuests ?? [])
    .map(id => QUEST_REGISTRY[id])
    .filter(Boolean);
}

export function getNPCQuests(npcId: string, character: MudCharacter, world: MudWorldState): Quest[] {
  return getAvailableQuests(character, world).filter(q => q.giver === npcId);
}

export function declineQuest(
  handle: string, questId: string,
): { success: boolean; error?: string } {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return { success: false, error: 'job not found' };
  const world = loadWorld(handle);
  // Remove from active if it was active
  world.activeQuests = world.activeQuests.filter(id => id !== questId);
  // Clean up progress flags so re-accepting starts fresh
  for (const obj of quest.objectives) {
    delete world.worldFlags[`quest_${questId}_${obj.id}`];
  }
  // Add to declined
  if (!world.declinedQuests) world.declinedQuests = [];
  if (!world.declinedQuests.includes(questId)) {
    world.declinedQuests.push(questId);
  }
  saveWorld(handle, world);
  return { success: true };
}

export function undeclineQuest(
  handle: string, questId: string,
): { success: boolean; error?: string } {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return { success: false, error: 'job not found' };
  const world = loadWorld(handle);
  if (!world.declinedQuests) world.declinedQuests = [];
  world.declinedQuests = world.declinedQuests.filter(id => id !== questId);
  saveWorld(handle, world);
  return { success: true };
}

export function startQuest(
  handle: string, questId: string,
): { success: boolean; quest?: Quest; error?: string } {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return { success: false, error: 'job not found' };

  const world = loadWorld(handle);
  if (world.activeQuests.includes(questId)) return { success: false, error: 'already active' };
  if (world.completedQuests.includes(questId) && !quest.repeatable) return { success: false, error: 'already completed' };

  // Reset objectives for repeatable quests
  const freshQuest = {
    ...quest,
    objectives: quest.objectives.map(o => ({ ...o, current: 0, completed: false })),
  };

  world.activeQuests.push(questId);
  saveWorld(handle, world);
  return { success: true, quest: freshQuest };
}

// ── Objective Tracking ──────────────────────────────────────────────────────

export interface QuestProgress {
  questId: string;
  objectiveId: string;
  completed: boolean;
  questComplete: boolean;
}

// Track quest progress. Returns which objectives/quests were just completed.
export function trackObjective(
  handle: string,
  type: QuestObjective['type'],
  target: string,
  amount: number = 1,
): QuestProgress[] {
  const world = loadWorld(handle);
  const results: QuestProgress[] = [];

  for (const questId of world.activeQuests) {
    const quest = QUEST_REGISTRY[questId];
    if (!quest) continue;

    // Load quest progress from world flags
    for (const obj of quest.objectives) {
      if (obj.completed) continue;
      if (obj.type !== type) continue;

      // Match target
      let matches = false;
      if (type === 'go_to') matches = target === obj.target;
      else if (type === 'talk_to') matches = target === obj.target;
      else if (type === 'collect') matches = target === obj.target;
      else if (type === 'deliver') matches = target === obj.target;
      else if (type === 'examine') matches = target === obj.target;
      else if (type === 'kill') matches = target === obj.target;

      if (!matches) continue;

      // Get stored progress
      const flagKey = `quest_${questId}_${obj.id}`;
      const current = (world.worldFlags[flagKey] as number) ?? 0;
      const newVal = Math.min(obj.required, current + amount);
      world.worldFlags[flagKey] = newVal;
      obj.current = newVal;

      if (newVal >= obj.required) {
        obj.completed = true;
        const allDone = quest.objectives.every(o => {
          const fk = `quest_${questId}_${o.id}`;
          return ((world.worldFlags[fk] as number) ?? 0) >= o.required;
        });

        results.push({
          questId, objectiveId: obj.id,
          completed: true, questComplete: allDone,
        });
      }
    }
  }

  saveWorld(handle, world);
  return results;
}

// ── Quest Completion ────────────────────────────────────────────────────────

export function completeQuest(
  handle: string, character: MudCharacter, questId: string,
): { rewards: QuestReward; leveledUp: boolean; newLevel?: number } | null {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return null;

  const world = loadWorld(handle);

  // Remove from active, add to completed
  world.activeQuests = world.activeQuests.filter(id => id !== questId);
  world.completedQuests.push(questId);

  // Clean up progress flags
  for (const obj of quest.objectives) {
    delete world.worldFlags[`quest_${questId}_${obj.id}`];
  }

  saveWorld(handle, world);

  // Apply rewards
  const rewards = quest.rewards;
  if (rewards.creds) character.currency.creds += rewards.creds;
  if (rewards.scrip) character.currency.scrip += rewards.scrip;
  if (rewards.items) {
    for (const itemId of rewards.items) {
      const item = createItem(itemId);
      if (item) {
        const existing = character.inventory.find(i => i.id === itemId && i.stackable);
        if (existing) existing.quantity += 1;
        else character.inventory.push(item);
      }
    }
  }

  // XP
  let leveledUp = false;
  let newLevel: number | undefined;
  if (rewards.xp) {
    const result = addXP(character, rewards.xp);
    leveledUp = result.leveled;
    newLevel = result.newLevel;
  }

  // Disposition boost with quest giver
  if (quest.giver) {
    updateNPCRelation(handle, quest.giver, {
      questsComplete: [...(getNPCQuestsComplete(handle, quest.giver)), questId],
    });
  }

  return { rewards, leveledUp, newLevel };
}

function getNPCQuestsComplete(handle: string, npcId: string): string[] {
  const rel = getNPCRelation(handle, npcId);
  return rel?.questsComplete ?? [];
}

// ── Check if a quest objective is ready to complete ─────────────────────────

export function getQuestObjectiveProgress(
  handle: string, questId: string,
): { objectives: Array<{ id: string; description: string; current: number; required: number; done: boolean }> } | null {
  const quest = QUEST_REGISTRY[questId];
  if (!quest) return null;

  const world = loadWorld(handle);
  return {
    objectives: quest.objectives.map(obj => {
      const flagKey = `quest_${questId}_${obj.id}`;
      const current = (world.worldFlags[flagKey] as number) ?? 0;
      return {
        id: obj.id,
        description: obj.description,
        current,
        required: obj.required,
        done: current >= obj.required,
      };
    }),
  };
}

export function isQuestComplete(handle: string, questId: string): boolean {
  const progress = getQuestObjectiveProgress(handle, questId);
  if (!progress) return false;
  return progress.objectives.every(o => o.done);
}
