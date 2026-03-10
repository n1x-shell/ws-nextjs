// lib/mud/persistence.ts
// TUNNELCORE MUD — Persistence Layer
// All MUD state lives in localStorage under structured keys.
// Keys are per-handle so multiple characters on one device are possible.

import type {
  MudCharacter,
  MudWorldState,
  NPCStateMap,
  CombatState,
  ClockCombatState,
  MudSession,
} from './types';
import { calculateHarmSegments, armorSegmentsForTier } from './clockEngine';
import { getStyleDieSize } from './dicePool';

// ── Storage Keys ────────────────────────────────────────────────────────────

const PREFIX = 'n1x_mud';

function characterKey(handle: string): string {
  return `${PREFIX}_character_${handle}`;
}
function worldKey(handle: string): string {
  return `${PREFIX}_world_${handle}`;
}
function npcKey(handle: string): string {
  return `${PREFIX}_npc_${handle}`;
}
function combatKey(handle: string): string {
  return `${PREFIX}_combat_${handle}`;
}

// Meta key: tracks which handles have characters
const HANDLES_KEY = `${PREFIX}_handles`;

// ── Helpers ─────────────────────────────────────────────────────────────────

function read<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[TUNNELCORE] Failed to write ${key}:`, e);
  }
}

function remove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ── Character ───────────────────────────────────────────────────────────────

export function loadCharacter(handle: string): MudCharacter | null {
  const char = read<MudCharacter>(characterKey(handle));
  if (!char) return null;

  // Migration: add augment fields for saves created before augment system
  if (!char.augmentSlots) {
    char.augmentSlots = { neural: null, chassis: null, limbs: null };
  }
  if (!char.augmentInventory) {
    char.augmentInventory = [];
  }
  if (!char.sealedSlots) {
    char.sealedSlots = char.archetype === 'DISCONNECTED' ? ['neural'] : [];
  }

  // Migration: add clock-based fields for characters created before clock system
  if (char.harmSegments === undefined || char.harmSegments === 0) {
    char.harmSegments = calculateHarmSegments(char.attributes.BODY, char.archetype);
  }
  if (char.criticalSegments === undefined || char.criticalSegments === 0) {
    char.criticalSegments = 4;
  }
  if (char.armorSegments === undefined) {
    const armor = char.gear?.armor;
    char.armorSegments = armor ? armorSegmentsForTier(armor.tier) : 0;
  }
  if (char.ramSegments === undefined || char.ramSegments === 0) {
    char.ramSegments = char.attributes.TECH * 2;
  }
  if (char.styleDie === undefined || char.styleDie === 0) {
    char.styleDie = getStyleDieSize(char);
  }
  if (!char.completedMilestones) {
    char.completedMilestones = [];
  }
  if (char.stress === undefined) {
    char.stress = 0;
    char.maxStress = 8;
  }
  if (!char.traumas) {
    char.traumas = [];
  }

  return char;
}

export function saveCharacter(handle: string, character: MudCharacter): void {
  character.lastSaved = Date.now();
  write(characterKey(handle), character);
  registerHandle(handle);
}

export function deleteCharacter(handle: string): void {
  remove(characterKey(handle));
  remove(worldKey(handle));
  remove(npcKey(handle));
  remove(combatKey(handle));
  unregisterHandle(handle);
}

// ── World State ─────────────────────────────────────────────────────────────

const DEFAULT_WORLD: MudWorldState = {
  visitedRooms: [],
  discoveredNPCs: [],
  activeQuests: [],
  completedQuests: [],
  failedQuests: [],
  declinedQuests: [],
  worldFlags: {},
  partyId: null,
};

export function loadWorld(handle: string): MudWorldState {
  const raw = read<MudWorldState>(worldKey(handle));
  if (!raw) return { ...DEFAULT_WORLD };
  // Migration: ensure declinedQuests exists for saves created before this field
  if (!raw.declinedQuests) raw.declinedQuests = [];
  return raw;
}

export function saveWorld(handle: string, world: MudWorldState): void {
  write(worldKey(handle), world);
}

export function updateWorld(handle: string, patch: Partial<MudWorldState>): MudWorldState {
  const current = loadWorld(handle);
  const next = { ...current, ...patch };
  saveWorld(handle, next);
  return next;
}

export function addVisitedRoom(handle: string, roomId: string): void {
  const world = loadWorld(handle);
  if (!world.visitedRooms.includes(roomId)) {
    world.visitedRooms.push(roomId);
    saveWorld(handle, world);
  }
}

export function addDiscoveredNPC(handle: string, npcId: string): void {
  const world = loadWorld(handle);
  if (!world.discoveredNPCs.includes(npcId)) {
    world.discoveredNPCs.push(npcId);
    saveWorld(handle, world);
  }
}

// ── NPC State ───────────────────────────────────────────────────────────────

export function loadNPCState(handle: string): NPCStateMap {
  return read<NPCStateMap>(npcKey(handle)) ?? {};
}

export function saveNPCState(handle: string, state: NPCStateMap): void {
  write(npcKey(handle), state);
}

export function getNPCRelation(handle: string, npcId: string) {
  const state = loadNPCState(handle);
  return state[npcId] ?? null;
}

export function updateNPCRelation(
  handle: string,
  npcId: string,
  patch: Partial<import('./types').NPCRelation>,
): void {
  const state = loadNPCState(handle);
  const current = state[npcId] ?? {
    disposition: 0,
    interactions: [],
    questsGiven: [],
    questsComplete: [],
    questsFailed: [],
    lastSeen: 0,
    timesDefeated: 0,
    flags: [],
  };
  state[npcId] = { ...current, ...patch, lastSeen: Date.now() };
  saveNPCState(handle, state);
}

export function adjustDisposition(handle: string, npcId: string, delta: number): number {
  const state = loadNPCState(handle);
  const current = state[npcId] ?? {
    disposition: 0,
    interactions: [],
    questsGiven: [],
    questsComplete: [],
    questsFailed: [],
    lastSeen: 0,
    timesDefeated: 0,
    flags: [],
  };
  current.disposition = Math.max(-100, Math.min(100, current.disposition + delta));
  current.lastSeen = Date.now();
  state[npcId] = current;
  saveNPCState(handle, state);
  return current.disposition;
}

// ── Combat State ────────────────────────────────────────────────────────────

export function loadCombat(handle: string): ClockCombatState | null {
  const raw = read<ClockCombatState>(combatKey(handle));
  if (!raw) return null;
  // If old CombatState format (has 'combatants' field), discard it
  if ('combatants' in raw && !('clocks' in raw)) {
    clearCombat(handle);
    return null;
  }
  return raw;
}

export function saveCombat(handle: string, combat: ClockCombatState): void {
  write(combatKey(handle), combat);
}

export function clearCombat(handle: string): void {
  remove(combatKey(handle));
}

// ── Full Session Load (for MUD activation) ──────────────────────────────────

export function loadFullSession(handle: string): MudSession | null {
  const character = loadCharacter(handle);
  if (!character) return null;
  if (character.isDead) return null;

  return {
    phase: 'active',
    character,
    world: loadWorld(handle),
    npcState: loadNPCState(handle),
    combat: loadCombat(handle),
    creation: null,
  };
}

export function saveFullSession(handle: string, session: MudSession): void {
  if (session.character) saveCharacter(handle, session.character);
  if (session.world) saveWorld(handle, session.world);
  if (session.npcState) saveNPCState(handle, session.npcState);
  if (session.combat) saveCombat(handle, session.combat);
  else clearCombat(handle);
}

// ── Handle Registry ─────────────────────────────────────────────────────────

function registerHandle(handle: string): void {
  const handles = read<string[]>(HANDLES_KEY) ?? [];
  if (!handles.includes(handle)) {
    handles.push(handle);
    write(HANDLES_KEY, handles);
  }
}

function unregisterHandle(handle: string): void {
  const handles = read<string[]>(HANDLES_KEY) ?? [];
  write(HANDLES_KEY, handles.filter(h => h !== handle));
}

export function getRegisteredHandles(): string[] {
  return read<string[]>(HANDLES_KEY) ?? [];
}

export function hasExistingCharacter(handle: string): boolean {
  return loadCharacter(handle) !== null;
}

// ── Permadeath ──────────────────────────────────────────────────────────────

export function executePermadeath(handle: string): {
  deathRoom: string;
  droppedGear: import('./types').Item[];
} | null {
  const character = loadCharacter(handle);
  if (!character) return null;

  const deathRoom = character.currentRoom;
  const droppedGear = [
    ...character.inventory,
    ...Object.values(character.gear).filter(Boolean) as import('./types').Item[],
  ];

  // Mark as dead (keep the record for memorial/ghost system)
  character.isDead = true;
  character.deaths += 1;
  saveCharacter(handle, character);

  // Clear active state
  clearCombat(handle);

  return { deathRoom, droppedGear };
}

// ── Debug / Dev ─────────────────────────────────────────────────────────────

export function clearAllMudData(): void {
  if (typeof window === 'undefined') return;
  const handles = getRegisteredHandles();
  handles.forEach(deleteCharacter);
  remove(HANDLES_KEY);
}

export function exportMudData(handle: string): string {
  return JSON.stringify({
    character: loadCharacter(handle),
    world: loadWorld(handle),
    npcState: loadNPCState(handle),
    combat: loadCombat(handle),
  }, null, 2);
}
