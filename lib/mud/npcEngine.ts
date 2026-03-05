// lib/mud/npcEngine.ts
// TUNNELCORE MUD — NPC Dialogue Engine
// Handles routing player speech to NPCs, building LLM prompts,
// and determining which NPCs respond to ambient conversation.

import type { RoomNPC, MudCharacter } from './types';
import { getDispositionLabel } from './types';
import { getRoom } from './worldMap';
import { getNPCRelation, updateNPCRelation, adjustDisposition } from './persistence';

// ── NPC Personality Definitions ─────────────────────────────────────────────

interface NPCPersonality {
  name: string;
  voice: string;         // speaking style instructions
  background: string;    // who they are
  mannerisms: string;    // how they act
  topics: string[];      // things they know/care about
  physicalDesc: string;  // for description-based addressing
}

const NPC_PERSONALITIES: Record<string, NPCPersonality> = {
  mara: {
    name: 'Mara',
    voice: 'dry, practical, no-nonsense. short sentences. never sentimental. prices are prices.',
    background: 'scavenger trader. runs the pump room trading post. knows the value of every piece of scrap in the drainage nexus. been here longer than most.',
    mannerisms: 'doesn\'t look up from her work when people talk. cleans circuit boards while conversing. only makes eye contact when negotiating.',
    topics: ['trade', 'salvage', 'scrap', 'prices', 'the tunnels', 'supplies', 'helixion components'],
    physicalDesc: 'woman cleaning circuit boards, trader, shopkeeper',
  },
  cole: {
    name: 'Cole',
    voice: 'quiet, precise, measured. clinical tone softened by exhaustion. chooses words carefully. occasional dark humor.',
    background: 'street doc. former helixion medical technician. left when he saw what mnemos did to people. now he puts them back together in a clinic made from a door on sawhorses.',
    mannerisms: 'speaks while working. hands never stop. examines people medically whether they asked or not. tiredness shows in his eyes, not his hands.',
    topics: ['medicine', 'injuries', 'helixion', 'mnemos', 'implants', 'augmentation', 'healing', 'the clinic'],
    physicalDesc: 'man with steady hands, doctor, medic, the one suturing',
  },
  ren: {
    name: 'Ren',
    voice: 'sharp, clipped, wary. wastes nothing including words. information is currency and she knows exactly what hers is worth.',
    background: 'tunnel guide. knows every passage in the shallow layer. surviving by knowing more about the tunnel network than anyone alive. sells routes and warnings.',
    mannerisms: 'sharpens her blade while talking. eyes track every movement. sits where she can see all exits. stands when strangers approach.',
    topics: ['tunnels', 'routes', 'dangers', 'navigation', 'feral augments', 'the deep gate', 'passage', 'guide'],
    physicalDesc: 'woman sharpening blade, guide, the one watching the entrance, woman in patched jacket',
  },
  doss: {
    name: 'Doss',
    voice: 'patient but direct. decades of compressed anger held in check by discipline. speaks like someone who has given this speech before and will give it again.',
    background: 'parish elder. first-generation iron bloom prosthetic on his left hand. has been in the tunnels longer than the walls. runs the parish. decides who stays.',
    mannerisms: 'studies people for three full seconds before speaking. reads by lamplight. the prosthetic hand clicks when he flexes it.',
    topics: ['the parish', 'helixion', 'survival', 'new arrivals', 'the tunnels', 'history', 'quests', 'missions', 'work', 'iron bloom'],
    physicalDesc: 'old man, elder, the one reading, man with prosthetic hand, man at the table',
  },
  parish_residents: {
    name: 'Parish Resident',
    voice: 'terse, guarded, survival-focused. not hostile but not welcoming either. information is shared reluctantly.',
    background: 'survivors living in the drainage nexus. scavengers, escaped test subjects, people with nowhere else to go.',
    mannerisms: 'go about their business. acknowledge strangers with a glance. don\'t volunteer information.',
    topics: ['survival', 'the tunnels', 'helixion', 'the parish', 'daily life', 'food', 'water'],
    physicalDesc: 'residents, people, survivors, woman sorting salvage',
  },
};

// ── Dialogue Routing ────────────────────────────────────────────────────────
// Determines which NPCs should respond to a player's message.

export interface DialogueTarget {
  npcId: string;
  npc: RoomNPC;
  personality: NPCPersonality;
  disposition: number;
  isDirectlyAddressed: boolean;
}

export function routeDialogue(
  message: string,
  roomId: string,
  character: MudCharacter,
): DialogueTarget[] {
  const room = getRoom(roomId);
  if (!room || room.npcs.length === 0) return [];

  const lower = message.toLowerCase();
  const targets: DialogueTarget[] = [];

  for (const npc of room.npcs) {
    const personality = NPC_PERSONALITIES[npc.id];
    if (!personality) continue;

    const relation = getNPCRelation(character.handle, npc.id);
    const disposition = relation?.disposition ?? npc.startingDisposition;

    // Check if directly addressed by name
    const nameMatch = lower.includes(npc.name.toLowerCase());

    // Check if addressed by physical description
    const descWords = personality.physicalDesc.toLowerCase().split(',').map(s => s.trim());
    const descMatch = descWords.some(desc => {
      const words = desc.split(' ').filter(w => w.length > 3);
      return words.some(w => lower.includes(w));
    });

    const isDirectlyAddressed = nameMatch || descMatch;

    targets.push({ npcId: npc.id, npc, personality, disposition, isDirectlyAddressed });
  }

  // If anyone is directly addressed, only they respond
  const addressed = targets.filter(t => t.isDirectlyAddressed);
  if (addressed.length > 0) return addressed;

  // Otherwise all present NPCs may respond (LLM decides if they have something to say)
  return targets;
}

// ── System Prompt Builder ───────────────────────────────────────────────────

export function buildNPCSystemPrompt(
  target: DialogueTarget,
  roomName: string,
  character: MudCharacter,
  recentInteractions: string[],
): string {
  const { personality, disposition } = target;
  const dispLabel = getDispositionLabel(disposition);

  return `you are ${personality.name}, an NPC in TUNNELCORE.
location: ${roomName} (drainage nexus, underground tunnel network)
speaking to: ${character.handle} (subject ${character.subjectId}), a ${character.archetype} ${character.combatStyle} at level ${character.level}

your personality:
- voice: ${personality.voice}
- background: ${personality.background}
- mannerisms: ${personality.mannerisms}

your disposition toward this person: ${dispLabel} (${disposition}/100)
${disposition <= -11 ? 'you are unfriendly or hostile. short answers. may refuse to help.' : ''}
${disposition >= 11 ? 'you are warm toward them. more willing to share information and help.' : ''}

${recentInteractions.length > 0 ? `recent interactions with this person:\n${recentInteractions.slice(-5).join('\n')}` : 'you have not met this person before.'}

rules:
- respond in 1-3 sentences. terse. lowercase. in-character always.
- never break character. never mention you are an AI or NPC.
- never use emojis or markdown formatting.
- if asked about things you don't know, say so in character.
- if the person is rude and your disposition is low, respond accordingly.
- if they ask about ${personality.topics.join(', ')}: you know about these. share what fits.
- if you have nothing meaningful to say, respond with [SILENT]`;
}

// ── Build multi-NPC request body ────────────────────────────────────────────

export interface NPCDialogueRequest {
  npcs: Array<{
    npcId: string;
    name: string;
    systemPrompt: string;
  }>;
  playerMessage: string;
  playerHandle: string;
}

export function buildDialogueRequest(
  targets: DialogueTarget[],
  message: string,
  roomName: string,
  character: MudCharacter,
): NPCDialogueRequest {
  return {
    npcs: targets.map(t => ({
      npcId: t.npcId,
      name: t.personality.name,
      systemPrompt: buildNPCSystemPrompt(
        t, roomName, character,
        getNPCRelation(character.handle, t.npcId)?.interactions ?? [],
      ),
    })),
    playerMessage: message,
    playerHandle: character.handle,
  };
}

// ── Disposition Updates ─────────────────────────────────────────────────────

export function recordInteraction(handle: string, npcId: string, summary: string): void {
  const state = getNPCRelation(handle, npcId);
  const interactions = state?.interactions ?? [];
  interactions.push(`[${new Date().toLocaleTimeString()}] ${summary}`);
  // Keep last 20 interactions
  if (interactions.length > 20) interactions.splice(0, interactions.length - 20);
  updateNPCRelation(handle, npcId, { interactions, lastSeen: Date.now() });
}

export function nudgeDisposition(handle: string, npcId: string, delta: number): number {
  return adjustDisposition(handle, npcId, delta);
}

// ── Get personality for rendering ───────────────────────────────────────────

export function getNPCPersonality(npcId: string): NPCPersonality | null {
  return NPC_PERSONALITIES[npcId] ?? null;
}

export function getNPCColor(npcId: string): string {
  switch (npcId) {
    case 'mara': return '#fcd34d';
    case 'cole': return '#a5f3fc';
    case 'ren': return '#c4b5fd';
    case 'doss': return '#fbbf24';
    case 'parish_residents': return '#9ca3af';
    default: return '#fcd34d';
  }
}
