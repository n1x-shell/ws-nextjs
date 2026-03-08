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
