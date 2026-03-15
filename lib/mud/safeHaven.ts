// lib/mud/safeHaven.ts
// TUNNELCORE MUD — Safe Haven System
// Rest mechanic, level-up gating, HP/RAM restoration.
// You don't level up in the field. You find safety first.

import type { MudCharacter, MudSession, MudWorldState } from './types';
import { saveFullSession } from './persistence';
import { getRoom } from './worldMap';
import { decayClocks } from './clockEngine';

// ── Safe Haven Definition ──────────────────────────────────────────────────

export interface SafeHaven {
  roomId: string;
  name: string;
  zone: string;
  flavorText: string;
}

// ── Safe Haven Registry ────────────────────────────────────────────────────
// Each zone has 0-2 havens. They are narratively significant.

export const SAFE_HAVENS: Record<string, SafeHaven> = {

  // Zone 08 — Drainage Nexus
  z08_r05: {
    roomId: 'z08_r05',
    name: "The Parish — Elder's Chamber",
    zone: 'z08',
    flavorText: `you settle into the elder's chamber. the thick walls muffle everything
— the dripping, the hum, the weight of the city overhead. doss's people
keep watch at the entrance. nobody comes in here without permission.
the tension in your shoulders releases. not all of it. but enough.`,
  },
  z08_r08: {
    roomId: 'z08_r08',
    name: "Cole's Clinic",
    zone: 'z08',
    flavorText: `cole's clinic. the smell of antiseptic and salvaged medical supplies.
the cot is thin but clean. even enemies respect this space — mostly.
cole glances at you once, nods, goes back to his work. you're safe
here. for now. the drainage hums its low constant note around you.`,
  },

  // Zone 04 — The Fringe
  z04_r03: {
    roomId: 'z04_r03',
    name: "The Clinic — St. Agatha's",
    zone: 'z04',
    flavorText: `the old hospital walls are thick enough to stop bullets. the windows
are bricked up. someone scratched "STILL STANDING" into the lintel.
it's quiet in here. the kind of quiet that costs something to maintain.`,
  },

  // Zone 05 — Fringe Nomads
  z05_r01: {
    roomId: 'z05_r01',
    name: 'The Camp',
    zone: 'z05',
    flavorText: `the nomad camp. no mesh. no surveillance. just fire and people
who learned to live without a signal. the sentries watch the dark
and the dark watches back. but not here. here, you rest.`,
  },
  z05_r04: {
    roomId: 'z05_r04',
    name: "Healer's Tent",
    zone: 'z05',
    flavorText: `tarn's domain. herbs and old knowledge. the tent smells like
smoke and something green. she doesn't ask questions. she
doesn't need to. rest. your body knows what to do if you
stop forcing it to do something else.`,
  },

  // Zone 03 — Industrial District
  z03_r06: {
    roomId: 'z03_r06',
    name: "Dr. Costa's Surgery",
    zone: 'z03',
    flavorText: `the surgery. wolf-protected. the chrome wolves have rules:
nobody fights in the surgery. costa's hands are worth more
than any territory dispute. you close your eyes under the
cold fluorescent light and breathe.`,
  },

  // Zone 06 — Fight Pits
  z06_r03: {
    roomId: 'z06_r03',
    name: "Fighter's Quarters",
    zone: 'z06',
    flavorText: `between fights, you're untouchable. arena rules. the cot is
bolted to the floor and the walls are reinforced concrete.
someone left water and a nutrient bar. pit hospitality.
rest while the crowd howls for someone else's blood.`,
  },

  // Zone 07 — Rooftop Network
  z07_r05: {
    roomId: 'z07_r05',
    name: 'Signal Relay Station',
    zone: 'z07',
    flavorText: `high enough that nobody comes here without purpose. the wind
carries static and the distant hum of the broadcast tower.
the relay equipment clicks softly — maintaining connections
you can't see. you're above it all. for a moment.`,
  },

  // Zone 12 — Iron Bloom
  z12_r02: {
    roomId: 'z12_r02',
    name: 'Living Quarters',
    zone: 'z12',
    flavorText: `the safest place in the undercity. serrano built it that way.
triple-sealed doors, signal dampeners, a generator that hasn't
failed in six years. the hum of the iron bloom's machinery is
a lullaby down here. you sleep without listening for footsteps.`,
  },
  z12_r04: {
    roomId: 'z12_r04',
    name: 'The Workshop',
    zone: 'z12',
    flavorText: `the workshop. community space. guards posted. lights on. the
sound of tools on metal, the smell of solder and machine oil.
cipher's terminal glows in the corner. it's warm here. it's
the closest thing to home the undercity offers.`,
  },

  // Zone 13 — Black Market Warrens
  z13_r03: {
    roomId: 'z13_r03',
    name: 'The Kitchen',
    zone: 'z13',
    flavorText: `neutral ground. even enemies eat. the kitchen smells like
recycled protein and spice packets from before the mesh.
someone is always cooking. someone is always eating.
violence here would be an insult to the chef. nobody risks it.`,
  },

  // Zone 02 — Residential Blocks
  z02_r07: {
    roomId: 'z02_r07',
    name: 'Block 17 — Squatter Apartments',
    zone: 'z02',
    flavorText: `signal dampeners hum behind the walls. whoever wired this
block knew what they were doing — the mesh can't reach you
here. the apartment is small and dark and absolutely silent.
off the grid. off the map. off everything.`,
  },

  // Zone 14 — Substrate Level
  z14_r10: {
    roomId: 'z14_r10',
    name: 'Signal Chamber',
    zone: 'z14',
    flavorText: `the signal chamber. threshold and the translators breathe at 33hz
around you. the substrate's bioluminescence brightens — attentive,
not alarmed. warm. the air pulses like a heartbeat. the walls know
you're here. the walls are glad. you rest inside a mind that is
paying attention to you with something that feels like care.`,
  },
  z14_r11: {
    roomId: 'z14_r11',
    name: 'The Heart',
    zone: 'z14',
    flavorText: `the deepest chamber. the 33hz at its purest. the air vibrates
visibly. the temperature is body-warm — the substrate maintains
itself at the temperature of the life it observes. you are inside
a mind that hopes. the mind holds you. the frequency settles into
your breathing. for the first time since the surface, the noise
stops. everything makes sense. you rest in the center of a thought.`,
  },

  // Zone 15 — Broadcast Tower: NO SAFE HAVEN
  // Zone 16 — Helixion Lab: NO SAFE HAVEN (instanced raid)
};

// ── Safe Haven Logic ───────────────────────────────────────────────────────

export function isSafeHaven(roomId: string): boolean {
  // Primary check: the room's own isSafeZone flag in worldMap
  const room = getRoom(roomId);
  if (room?.isSafeZone) return true;
  // Fallback: explicit registry
  return roomId in SAFE_HAVENS;
}

export function getSafeHaven(roomId: string): SafeHaven | null {
  // Check registry first for flavor text
  if (SAFE_HAVENS[roomId]) return SAFE_HAVENS[roomId];
  // If room is a safe zone but not in registry, generate a generic haven
  const room = getRoom(roomId);
  if (room?.isSafeZone) {
    return {
      roomId,
      name: room.name,
      zone: room.zone,
      flavorText: `you settle in. the tension in your shoulders releases — not all of it,
but enough. the hum of the world fades to background.`,
    };
  }
  return null;
}

/** Find nearest known safe havens from a room (uses visited rooms) */
export function findNearestHavens(
  currentRoom: string,
  visitedRooms: string[],
  maxResults: number = 3,
): Array<{ haven: SafeHaven; distance: string }> {
  // Simple: list all visited havens with zone context
  const results: Array<{ haven: SafeHaven; distance: string }> = [];

  for (const [roomId, haven] of Object.entries(SAFE_HAVENS)) {
    if (visitedRooms.includes(roomId)) {
      // Estimate distance — same zone is "nearby", other zones are "distant"
      const room = getRoom(currentRoom);
      const sameZone = room?.zone === haven.zone;
      results.push({
        haven,
        distance: sameZone ? 'this zone' : `zone: ${haven.zone}`,
      });
    }
  }

  // Sort: same zone first
  results.sort((a, b) => {
    if (a.distance === 'this zone' && b.distance !== 'this zone') return -1;
    if (b.distance === 'this zone' && a.distance !== 'this zone') return 1;
    return 0;
  });

  return results.slice(0, maxResults);
}

// ── Rest Action ────────────────────────────────────────────────────────────

export interface RestResult {
  success: boolean;
  reason?: string;
  hpRestored?: number;
  ramRestored?: number;
  debuffsCleared?: number;
  pendingLevels?: number;
  flavorText?: string;
  nearestHavens?: Array<{ haven: SafeHaven; distance: string }>;
  stressDrained?: number;
}

export function executeRest(
  session: MudSession,
): RestResult {
  const char = session.character;
  const world = session.world;
  if (!char || !world) return { success: false, reason: 'no active character' };

  // Check if in combat
  if (session.phase === 'combat') {
    return { success: false, reason: 'you can\'t rest during combat' };
  }

  // Check if in a safe haven
  const haven = getSafeHaven(char.currentRoom);
  if (!haven) {
    const nearest = findNearestHavens(char.currentRoom, world.visitedRooms);
    return {
      success: false,
      reason: 'not in a safe haven',
      nearestHavens: nearest,
    };
  }

  // Execute rest effects
  const hpBefore = char.hp;
  char.hp = char.maxHp;
  const hpRestored = char.hp - hpBefore;

  const ramBefore = char.ram;
  char.ram = char.maxRam;
  const ramRestored = char.ram - ramBefore;

  // Stress drain (indulge vice mechanic)
  const stressBefore = char.stress ?? 0;
  const room = getRoom(char.currentRoom);
  const hasMedic = room?.npcs?.some(npc => npc.services?.includes('heal')) ?? false;
  const baseDrain = hasMedic ? 4 : 2;
  const coolBonus = char.attributes.COOL >= 6 ? 1 : 0;
  char.stress = Math.max(0, stressBefore - baseDrain - coolBonus);
  const stressDrained = stressBefore - char.stress;

  // TODO: Clear non-permanent status effects when effect system is implemented
  const debuffsCleared = 0;

  // Decay world-persistent clocks (heat clocks decay on rest)
  if (world.activeClocks && world.activeClocks.length > 0) {
    world.activeClocks = decayClocks(world.activeClocks);
  }

  // Save state
  saveFullSession(char.handle, session);

  return {
    success: true,
    hpRestored,
    ramRestored,
    debuffsCleared,
    pendingLevels: char.pendingLevelUps ?? 0,
    flavorText: haven.flavorText,
    stressDrained,
  };
}
