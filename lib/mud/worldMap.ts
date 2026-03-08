// lib/mud/worldMap.ts
// TUNNELCORE MUD — World Map
// Room definitions, zone registry, room lookups.
// Phase 1: Drainage Nexus only (Zone 8, 14 rooms).

import type { Zone, Room, RoomNPC, RoomEnemy, RoomObject, Attributes } from './types';
import { DIRECTION_ALIASES } from './types';

// ── Default enemy attributes by level ───────────────────────────────────────

function enemyAttrs(level: number): Attributes {
  const base = 2 + Math.floor(level / 2);
  return {
    BODY: base, REFLEX: base, TECH: Math.max(1, base - 1),
    COOL: Math.max(1, base - 1), INT: Math.max(1, base - 1), GHOST: 1,
  };
}

// ── Zone 08: Drainage Nexus ─────────────────────────────────────────────────

const Z08_ROOMS: Record<string, Room> = {

  // ── 1. SOUTH ENTRY ──────────────────────────────────────────────────────

  z08_r01: {
    id: 'z08_r01',
    zone: 'z08',
    name: 'SOUTH ENTRY',
    description:
`A rusted ladder descends from a drainage grate in the street above.
The grate is half-buried under rubble — you'd never find it unless
someone showed you where to look. At the bottom, the main channel
begins. Water trickles along the floor, ankle-deep. The concrete
walls are stained with decades of chemical runoff in patterns that
almost look intentional. Salvaged glow-strips mark the path north.

Someone scratched into the wall near the ladder:
"THE PARISH DOESN'T OWE YOU ANYTHING. BUT THEY WON'T TURN YOU AWAY."`,
    exits: [
      { direction: 'up', targetRoom: 'z04_r01', description: 'up (Fringe — Ruins)', zoneTransition: true, targetZone: 'z04' },
      { direction: 'north', targetRoom: 'z08_r02', description: 'north (The Narrows)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'ladder', name: 'ladder', examineText: 'Welded rungs. Someone reinforced this recently. The grate above is hinged, not sealed — designed to be opened from below.' },
      { id: 'wall_scratching', name: 'wall scratching', examineText: "Scratched deep with something sharp. The letters are uneven. This wasn't written for tourists." },
      { id: 'glow_strips', name: 'glow-strips', examineText: 'Salvaged LED strips, wired to a car battery tucked behind a pipe. Someone maintains these.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 2. THE NARROWS ──────────────────────────────────────────────────────

  z08_r02: {
    id: 'z08_r02',
    zone: 'z08',
    name: 'THE NARROWS',
    description:
`The channel narrows here. The walls press close enough to touch
both sides. Water moves faster in the tight space — knee-deep now,
cold enough to ache. The ceiling is low, lined with old cable
conduits and a pipe that hisses steam at irregular intervals.
Fungal growth on the walls gives off a faint blue-green glow.
Something skitters in the dark ahead. Could be rats. Could be worse.

The glow-strips continue north. The sound of voices carries from
that direction — distant, but human.`,
    exits: [
      { direction: 'north', targetRoom: 'z08_r03', description: 'north (The Junction)' },
      { direction: 'south', targetRoom: 'z08_r01', description: 'south (South Entry)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'tunnel_rats', name: 'Tunnel Rats', level: 1,
        description: 'Oversized tunnel fauna. Eyes reflect your light. They scatter when wounded.',
        hp: 8, attributes: enemyAttrs(1), damage: 2, armorValue: 0,
        behavior: 'passive', spawnChance: 0.7, count: [1, 2],
        drops: [
          { itemId: 'scrap_metal', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'rat_hide', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 10,
      },
    ],
    objects: [
      { id: 'steam_pipe', name: 'steam pipe', examineText: 'Municipal steam line. Still pressurized after all these years. A crack in the joint spits vapor every few seconds. The heat feels wrong down here.' },
      { id: 'fungal_growth', name: 'fungal growth', examineText: "Bioluminescent. Grows on the chemical residue in the concrete. The Parish uses it as natural lighting in the deeper sections. Don't eat it." },
      { id: 'cable_conduits', name: 'cable conduits', examineText: "Old municipal data lines. Cut long ago. Some have been spliced back together with copper wire — someone's running a signal through here." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 3. THE JUNCTION ─────────────────────────────────────────────────────

  z08_r03: {
    id: 'z08_r03',
    zone: 'z08',
    name: 'THE JUNCTION',
    description:
`The channel opens into a wide chamber where four drainage tunnels
converge. The water splits into shallow streams that run along the
edges, leaving the center dry — a concrete island maybe thirty
meters across. This is where The Parish lives.

Salvaged tarps hang between old pipe columns, creating partitions.
A cooking fire burns in a cut oil drum, smoke rising into a
ventilation shaft that someone widened with a hammer and patience.
Bedrolls. Crates used as tables. A child's drawing pinned to a
tarp wall — a stick figure with one metal arm.

People move through the space with the economy of those who've
learned to live without wasting anything. Some nod at you. Most
don't. You're not the first stranger to climb down the ladder.`,
    exits: [
      { direction: 'north', targetRoom: 'z08_r04', description: 'north (North Channel)' },
      { direction: 'south', targetRoom: 'z08_r02', description: 'south (The Narrows)' },
      { direction: 'east', targetRoom: 'z08_r10', description: 'east (Storage Chambers)' },
      { direction: 'west', targetRoom: 'z08_r09', description: 'west (West Overflow)' },
      { direction: 'northwest', targetRoom: 'z08_r06', description: 'northwest (Pump Room)' },
      { direction: 'southwest', targetRoom: 'z08_r07', description: 'southwest (Memorial Alcove)' },
      { direction: 'northeast', targetRoom: 'z08_r11', description: "northeast (Elder's Chamber)" },
      { direction: 'southeast', targetRoom: 'z08_r12', description: 'southeast (East Passage)' },
    ],
    npcs: [
      {
        id: 'parish_residents', name: 'Parish Residents', type: 'NEUTRAL',
        faction: 'THE_PARISH',
        description: 'Survivors, scavengers, escapees. 3-4 people going about the business of staying alive.',
        dialogue: "A woman sorting salvage glances at you. \"New.\" She goes back to sorting.",
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      { id: 'cooking_fire', name: 'cooking fire', examineText: "Burning scrap wood and dried fungus. Something is simmering in a dented pot — smells like protein paste and desperation. It's the best meal you've had in weeks." },
      { id: 'childs_drawing', name: "child's drawing", examineText: "Crayon on cardboard. A stick figure with one arm colored silver and one colored flesh. Standing on top of a building. Smiling. Labeled 'NIX' in wobbly letters." },
      { id: 'notice_board', name: 'notice board', examineText: 'Salvaged cork board nailed to a pipe column. Scraps of paper pinned to it — requests, warnings, trade offers. Some are quest hooks. Use /quests to check available work.' },
      { id: 'ventilation_shaft', name: 'ventilation shaft', examineText: "Widened with brute force. Smoke funnels up and out. You can feel a faint draft — this connects to the surface somewhere. Too narrow to climb." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 4. NORTH CHANNEL ────────────────────────────────────────────────────

  z08_r04: {
    id: 'z08_r04',
    zone: 'z08',
    name: 'NORTH CHANNEL',
    description:
`Beyond the junction, the main channel continues north. The Parish
lanterns thin out here — one every twenty meters, then nothing.
The water deepens. The walls are slick with condensation and
something darker. Chemical stains streak downward from cracks
in the ceiling like black veins.

The echoes change. Sounds don't carry the same way. Footsteps
return wrong — delayed, or from directions that don't make sense.
A feral augment was spotted in this section three days ago.
The Parish posted a warning: a strip of red cloth tied around
a pipe at chest height.

The channel forks ahead.`,
    exits: [
      { direction: 'south', targetRoom: 'z08_r03', description: 'south (The Junction)' },
      { direction: 'north', targetRoom: 'z08_r05', description: 'north (The Deep Gate)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'feral_augment_north', name: 'Feral Augment', level: 3,
        description: 'Former MNEMOS subject. Erratic movement, metal fingers scraping the walls. Whatever was human is mostly gone.',
        hp: 25, attributes: { ...enemyAttrs(3), BODY: 5, REFLEX: 4 }, damage: 6, armorValue: 1,
        behavior: 'aggressive', spawnChance: 0.6, count: [1, 1],
        drops: [
          { itemId: 'scrap_cyberware', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'damaged_implant', chance: 0.2, quantityRange: [1, 1] },
        ],
        xpReward: 30,
      },
    ],
    objects: [
      { id: 'red_warning_cloth', name: 'red warning cloth', examineText: "Parish danger marker. Red means feral augment territory. They tie these at the last safe point before things go bad." },
      { id: 'chemical_stains', name: 'chemical stains', examineText: "Industrial runoff leaching through the concrete from the surface. Some of it is warm to the touch. The factories above don't care what drains down." },
      { id: 'wall_claw_marks', name: 'claw marks', examineText: 'Deep gouges in the concrete. Four parallel lines. Whatever made these had metal fingers and no impulse control.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 5. THE DEEP GATE ────────────────────────────────────────────────────

  z08_r05: {
    id: 'z08_r05',
    zone: 'z08',
    name: 'THE DEEP GATE',
    description:
`The channel terminates at a massive drainage gate — industrial
steel, bolted into the concrete frame, streaked with rust but
structurally sound. Through the bars you can see the channel
continuing downward at a steep angle. The water flows under
the gate, disappearing into darkness. The sound it makes on
the other side is different — deeper, slower, like the tunnel
opens into something vast.

A heavy padlock secures the gate. The Parish put it there.
Whatever's on the other side, they decided it was better
left closed.

A faded sign is bolted to the gate:
MUNICIPAL DRAINAGE — DEEP INFRASTRUCTURE
AUTHORIZED PERSONNEL ONLY`,
    exits: [
      { direction: 'south', targetRoom: 'z08_r04', description: 'south (North Channel)' },
      { direction: 'down', targetRoom: 'z11_r01', description: 'down (Abandoned Transit)', locked: true, lockId: 'deep_gate_key', zoneTransition: true, targetZone: 'z11' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'drainage_gate', name: 'drainage gate', examineText: "Industrial grade. The Parish welded extra crossbars onto it. Whatever came through here before they sealed it, they didn't want it coming back." },
      { id: 'padlock', name: 'padlock', examineText: "Heavy-duty. The key isn't hidden nearby — you'd have to earn it. Or find another way." },
      { id: 'faded_sign', name: 'faded sign', examineText: "Municipal infrastructure signage. The city that put this here doesn't exist anymore. But the tunnels below still do." },
      { id: 'water_sound', name: 'water sound', examineText: "Listen. The water on the other side falls for a long time before it hits anything. That's deep. That's Abandoned Transit deep." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 6. PUMP ROOM ────────────────────────────────────────────────────────

  z08_r06: {
    id: 'z08_r06',
    zone: 'z08',
    name: 'PUMP ROOM',
    description:
`An old pump station. The machinery is dead — massive impeller
housings, valve wheels taller than a person, control panels with
every gauge reading zero. Someone's turned the space into a
trading post. Salvage is sorted on old machinery covers: scrap
metal in one pile, electronics in another, things that might be
weapons in a third.

A woman sits behind a desk made from a pump housing lid, cleaning
a circuit board with a toothbrush and solvent. She doesn't look
up when you enter. She already knows you're here.`,
    exits: [
      { direction: 'east', targetRoom: 'z08_r03', description: 'east (The Junction)' },
    ],
    npcs: [
      {
        id: 'mara', name: 'Mara', type: 'SHOPKEEPER',
        faction: 'THE_PARISH',
        description: 'Scavenger trader. Practical, dry, no patience for haggling.',
        dialogue: "\"I don't do charity. But I do fair. Bring me something worth my time and we'll talk.\"",
        startingDisposition: 0,
        services: ['shop'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'salvage_piles', name: 'salvage piles', examineText: "Sorted with the precision of someone who knows exactly what every piece of scrap is worth. The electronics pile has Helixion logos on some components. She doesn't talk about where those came from." },
      { id: 'dead_machinery', name: 'dead machinery', examineText: "Municipal pump system. Moved millions of liters a day when the drainage system was active. Now it's a shelf." },
      { id: 'circuit_board', name: 'circuit board', examineText: "She's cleaning it with the focus of a surgeon. Whatever it came from, she's going to make it work again." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 7. MEMORIAL ALCOVE ──────────────────────────────────────────────────

  z08_r07: {
    id: 'z08_r07',
    zone: 'z08',
    name: 'MEMORIAL ALCOVE',
    description:
`A dead-end chamber off the main junction. Small. Quiet. The
acoustics swallow sound — voices don't carry in here.

The back wall is covered floor to ceiling with names. Some
scratched into concrete. Some written in marker. Some etched
into metal plates bolted to the wall. Under each name, a subject
ID. Under some IDs, a date. Under others, just a dash.

Candles burn on a ledge carved into the wall — wax pooled and
hardened over months of replacement. Someone leaves fresh ones.
A few personal objects sit among the candles: a data chip, a
child's shoe, a bent spoon, a photograph too water-damaged
to read.

One name near the center has been scratched deeper than the others:
LE-751078`,
    exits: [
      { direction: 'east', targetRoom: 'z08_r03', description: 'east (The Junction)' },
      { direction: 'south', targetRoom: 'z08_r08', description: 'south (The Clinic)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'memorial_wall', name: 'memorial wall', examineText: "Hundreds of names. Hundreds of subject IDs. Each one a person Helixion used and discarded. The ones with dates were confirmed decommissioned. The dashes mean nobody knows." },
      { id: 'le_751078', name: 'LE-751078', examineText: "Scratched deeper than any other name. Someone came back to this one, over and over, pressing harder each time. LE-751078. Len. You recognize the ID from the fragments." },
      { id: 'candles', name: 'candles', examineText: "Tealights in salvaged tin holders. Someone replaces them regularly. The wax layers suggest months of this. Maybe years." },
      { id: 'personal_objects', name: 'personal objects', examineText: "The data chip is blank — wiped, or never written. The shoe is small — size for a child. The photograph is too damaged. The spoon is bent at an angle that suggests it was used to pry something open, not to eat." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 8. THE CLINIC ───────────────────────────────────────────────────────

  z08_r08: {
    id: 'z08_r08',
    zone: 'z08',
    name: 'THE CLINIC',
    description:
`A side chamber converted into something between a hospital and
a prayer. Clean tarps on the walls — the only clean thing in the
entire tunnel network. A surgical table made from a door on
sawhorses. Shelves of salvaged medical supplies: stims in
mismatched casings, bandages boiled and re-rolled, a bottle of
something labeled ANESTHETIC with a handwritten expiration date
that passed two years ago.

A man with steady hands and tired eyes is suturing a wound on
a Parish resident's forearm. He doesn't rush. He doesn't look
up. When he's done, he ties off the thread and says something
quiet that makes the patient almost smile.`,
    exits: [
      { direction: 'north', targetRoom: 'z08_r07', description: 'north (Memorial Alcove)' },
      { direction: 'east', targetRoom: 'z08_r03', description: 'east (The Junction)' },
    ],
    npcs: [
      {
        id: 'cole', name: 'Cole', type: 'SHOPKEEPER',
        faction: 'THE_PARISH',
        description: 'Street doc. Quiet, precise, haunted. Former Helixion medical technician.',
        dialogue: "\"Sit down. Don't talk. Let me see what they did to you.\"",
        startingDisposition: 5,
        services: ['heal', 'shop', 'quest'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'surgical_table', name: 'surgical table', examineText: 'A solid-core door on reinforced sawhorses. Scrubbed with bleach. The grain of the wood is visible through a thousand cleanings.' },
      { id: 'medical_supplies', name: 'medical supplies', examineText: 'Salvaged, expired, improvised. Cole makes it work anyway. The stim casings are mismatched because he refills them from bulk compounds.' },
      { id: 'anesthetic_bottle', name: 'anesthetic bottle', examineText: "Expired. He uses it anyway. 'Better than nothing' is the only medical philosophy that survives down here." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 9. WEST OVERFLOW ────────────────────────────────────────────────────

  z08_r09: {
    id: 'z08_r09',
    zone: 'z08',
    name: 'WEST OVERFLOW',
    description:
`An overflow channel branching west from the junction. The water
is deeper here — thigh-high in places, moving faster. The walls
are slick with chemical residue that glows faintly orange under
UV. The Parish doesn't come this way unless they have to.

The channel splits: one branch goes south toward the industrial
district's drainage (you can smell the difference — sulfur and
machine oil), the other dead-ends in a collapsed section where
something nests.

Scratch marks on the walls. Fresh ones.`,
    exits: [
      { direction: 'east', targetRoom: 'z08_r03', description: 'east (The Junction)' },
      { direction: 'south', targetRoom: 'z10_r01', description: 'south (Industrial Drainage)', zoneTransition: true, targetZone: 'z10' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'feral_augment_west', name: 'Feral Augment', level: 2,
        description: 'Territorial. Crouched in the collapsed section, eyes reflecting light that shouldn\'t reach that far.',
        hp: 20, attributes: { ...enemyAttrs(2), BODY: 4, REFLEX: 3 }, damage: 5, armorValue: 0,
        behavior: 'territorial', spawnChance: 0.5, count: [1, 1],
        drops: [
          { itemId: 'scrap_cyberware', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'damaged_implant', chance: 0.15, quantityRange: [1, 1] },
        ],
        xpReward: 25,
      },
      {
        id: 'scavenger_gang', name: 'Scavenger', level: 3,
        description: 'Territorial humans. Patched armor, improvised weapons. They claim this route.',
        hp: 18, attributes: enemyAttrs(3), damage: 5, armorValue: 1,
        behavior: 'territorial', spawnChance: 0.6, count: [2, 3],
        drops: [
          { itemId: 'creds_pouch', chance: 0.6, quantityRange: [5, 15] },
          { itemId: 'scrap_weapon', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'salvage', chance: 0.4, quantityRange: [1, 2] },
        ],
        xpReward: 20,
      },
    ],
    objects: [
      { id: 'chemical_residue', name: 'chemical residue', examineText: "Industrial runoff from the factories above. The orange glow is not a good sign. Prolonged exposure causes skin irritation and worse. The Parish calls it 'the burn.'" },
      { id: 'collapsed_section', name: 'collapsed section', examineText: "Concrete and rebar caved in. Something has made a nest in the rubble — scraps of cloth, bones, a Helixion employee badge chewed beyond reading." },
      { id: 'scratch_marks', name: 'scratch marks', examineText: "Fresh. Metal on concrete. Four parallel gouges. The feral augments sharpen their implant blades on the walls. Instinct, not intention." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 10. STORAGE CHAMBERS ────────────────────────────────────────────────

  z08_r10: {
    id: 'z08_r10',
    zone: 'z08',
    name: 'STORAGE CHAMBERS',
    description:
`A series of old utility alcoves the Parish converted into storage.
Locked crates line the walls — food stores, water purification
filters, salvage too valuable to leave in the open. A woman in
a patched jacket sits on a crate near the entrance, sharpening
a blade on a wet stone. Her eyes track every movement in the
tunnel with the focus of someone who's survived things by
noticing them first.

A hand-drawn map is pinned to the wall — the tunnel network,
marked with danger zones, safe routes, and symbols you don't
recognize yet.`,
    exits: [
      { direction: 'west', targetRoom: 'z08_r03', description: 'west (The Junction)' },
      { direction: 'east', targetRoom: 'z08_r13', description: 'east (The Seep)' },
    ],
    npcs: [
      {
        id: 'ren', name: 'Ren', type: 'ALLIED',
        faction: 'THE_PARISH',
        description: 'Tunnel guide. Sharp, wary, economical with words. Knows every passage in the shallow layer.',
        dialogue: "\"I know every tunnel from here to the transit lines. Some of them I'm the only person alive who's walked. That knowledge costs, but it's cheaper than dying lost.\"",
        startingDisposition: 0,
        services: ['hire', 'info'],
        level: 3,
        combatCapable: true,
      },
    ],
    enemies: [],
    objects: [
      { id: 'tunnel_map', name: 'tunnel map', examineText: "Hand-drawn on salvaged paper. Shows the shallow tunnel network with alarming detail. Danger zones marked in red. Safe caches marked with a circle. Some symbols you don't recognize — Parish shorthand for things they don't write in plain language." },
      { id: 'locked_crates', name: 'locked crates', examineText: 'Parish community supplies. Taking from these would be theft. The Parish would know. They always know.' },
      { id: 'wet_stone', name: 'wet stone', examineText: "Ren's sharpening stone. Worn smooth in the center from years of use. The blade she's working on is already sharp enough. This is a habit, not a task." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 11. ELDER'S CHAMBER ─────────────────────────────────────────────────

  z08_r11: {
    id: 'z08_r11',
    zone: 'z08',
    name: "ELDER'S CHAMBER",
    description:
`A larger alcove, set apart from the rest by a heavy tarp that
serves as a door. Inside, the space is almost civilized — a
table made from welded pipe, two chairs, a shelf of salvaged
books with swollen pages. A map of the entire city pinned to
the wall, annotated in three different handwriting styles.

An old man sits at the table, reading by the light of a jury-
rigged LED lamp. His left hand is prosthetic — not Helixion
work, something cruder, bolted at the wrist. He looks up when
you enter. Studies you for three full seconds before speaking.

"Another one. Sit down. Tell me what they took from you."`,
    exits: [
      { direction: 'west', targetRoom: 'z08_r03', description: 'west (The Junction)' },
    ],
    npcs: [
      {
        id: 'doss', name: 'Doss', type: 'QUESTGIVER',
        faction: 'THE_PARISH',
        description: 'Parish Elder. Patient, direct, decades of compressed anger. First-generation Iron Bloom prosthetic.',
        dialogue: "\"I've been here longer than most of these walls. I don't need to trust you. I need to know what you'll do when things get hard.\"",
        startingDisposition: 0, // +10 for Drainage origin, applied at runtime
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'city_map', name: 'city map', examineText: "The full city. Annotated in three hands — Doss's careful print, someone's hasty cursive, and a third hand that only marks locations with X's. Some X's have been circled. Some have been crossed out." },
      { id: 'salvaged_books', name: 'salvaged books', examineText: "Water-damaged paperbacks. A medical textbook. A collection of poetry with certain lines underlined. A Helixion employee handbook with every page after 'Terms of Service' torn out." },
      { id: 'prosthetic_hand', name: 'prosthetic hand', examineText: "First-generation Iron Bloom work. Functional, not elegant. The wrist joint clicks when he flexes it. He's had it longer than most of the people in the Parish have been alive." },
      { id: 'led_lamp', name: 'LED lamp', examineText: "Wired to a battery pack. The light flickers at a frequency that's almost but not quite steady. Doss doesn't seem to notice." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 12. EAST PASSAGE ────────────────────────────────────────────────────

  z08_r12: {
    id: 'z08_r12',
    zone: 'z08',
    name: 'EAST PASSAGE',
    description:
`A narrowing tunnel heading east. The construction changes — the
rough drainage concrete gives way to smoother municipal
infrastructure. Cable trays line the ceiling. The air smells
different: less rust, more ozone. You're crossing from the
old drainage system into the city's active service layer.

A Parish warning marker — red cloth on a pipe — marks the
boundary. Beyond this point, you're outside Parish territory.
Helixion maintenance drones patrol the tunnels east of here.
The Parish's protection ends at this cloth.`,
    exits: [
      { direction: 'west', targetRoom: 'z08_r03', description: 'west (The Junction)' },
      { direction: 'east', targetRoom: 'z09_r01', description: 'east (Maintenance Tunnels)', zoneTransition: true, targetZone: 'z09' },
      { direction: 'south', targetRoom: 'z08_r14', description: 'south (Signal Hollow)', hidden: true, hiddenRequirement: { attribute: 'GHOST', minimum: 6 } },
    ],
    npcs: [],
    enemies: [
      {
        id: 'patrol_drone', name: 'Patrol Drone', level: 4,
        description: 'Helixion maintenance unit. Optical sensors sweep the tunnel. Red light means it sees you.',
        hp: 30, attributes: { ...enemyAttrs(4), TECH: 5, REFLEX: 5 }, damage: 7, armorValue: 3,
        behavior: 'patrol', spawnChance: 0.3, count: [1, 1],
        drops: [
          { itemId: 'drone_components', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'data_chip', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 40,
      },
    ],
    objects: [
      { id: 'warning_marker', name: 'warning marker', examineText: "Red cloth. Parish boundary. East of here, you're in Helixion service infrastructure. The rules change. The drones don't negotiate." },
      {
        id: 'cable_trays', name: 'cable trays', examineText: 'Active data lines. Fiber optic, still lit. These run from the residential blocks above down to junction boxes beneath the Helixion campus.',
        gatedText: [{ attribute: 'TECH', minimum: 5, text: 'TECH ≥ 5: You could tap these. The data flowing through is encrypted but the handshake protocol is outdated. A deck and thirty minutes would get you in.' }],
      },
      { id: 'construction_transition', name: 'wall transition', examineText: 'The wall changes from rough-poured drainage concrete to smooth municipal finish. Two different eras of the city, meeting at a seam.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 13. THE SEEP ────────────────────────────────────────────────────────

  z08_r13: {
    id: 'z08_r13',
    zone: 'z08',
    name: 'THE SEEP',
    description:
`The tunnel slopes downward and the water rises. Waist-deep.
Warm — uncomfortably warm, heated by chemical reactions in
the runoff. The walls weep moisture that smells like battery
acid and something organic. Visibility drops to a few meters.
The bioluminescent fungus here grows thick — blooming in
clusters that pulse with a slow rhythm, like breathing.

Something moves in the water. You can't see it. You can
feel the displacement.

The tunnel continues into flooded darkness. Whatever's down
there, it's been eating well.`,
    exits: [
      { direction: 'west', targetRoom: 'z08_r10', description: 'west (Storage Chambers)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'tunnel_crawler', name: 'Tunnel Crawler', level: 4,
        description: 'Semi-aquatic predator. Attacks from below the waterline. You feel the wake before you see it.',
        hp: 28, attributes: { ...enemyAttrs(4), BODY: 5, REFLEX: 4 }, damage: 8, armorValue: 1,
        behavior: 'ambush', spawnChance: 0.7, count: [1, 1],
        drops: [
          { itemId: 'crawler_hide', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'bio_sample', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 35,
      },
      {
        id: 'chemical_leech', name: 'Chemical Leech', level: 1,
        description: 'Swarm of parasitic organisms. Individually trivial. Collectively, a problem.',
        hp: 4, attributes: enemyAttrs(1), damage: 1, armorValue: 0,
        behavior: 'aggressive', spawnChance: 0.8, count: [3, 5],
        drops: [],
        xpReward: 5,
      },
    ],
    objects: [
      { id: 'pulsing_fungus', name: 'pulsing fungus', examineText: 'The fungal clusters pulse in a slow, regular rhythm. Almost exactly once every three seconds. 33 cycles per minute. You notice this and immediately wish you hadn\'t.' },
      { id: 'warm_water', name: 'warm water', examineText: "Heated by chemical reactions. Not safe to drink. Not safe to stand in for long. Your skin itches after a minute. After ten, it burns." },
      {
        id: 'submerged_cache', name: 'submerged cache',
        examineText: 'The water is murky. Hard to see anything below the surface.',
        hidden: true,
        hiddenRequirement: { attribute: 'GHOST', minimum: 4 },
        gatedText: [
          { attribute: 'GHOST', minimum: 4, text: 'Something glints beneath the surface. A waterproof case, wedged under a pipe. Someone hid this here deliberately — in a place most people wouldn\'t survive long enough to search.' },
          { attribute: 'INT', minimum: 6, text: 'A disruption pattern in the water flow — something solid is wedged under the pipe ahead. A case. Waterproof. Hidden by someone who knew what they were doing.' },
        ],
        lootable: true,
        lootTable: [
          { itemId: 'stim_pack', chance: 0.4, quantityRange: [1, 2] },
          { itemId: 'creds_pouch', chance: 0.5, quantityRange: [10, 30] },
          { itemId: 'data_chip_lore', chance: 0.2, quantityRange: [1, 1] },
          { itemId: 'rare_salvage', chance: 0.1, quantityRange: [1, 1] },
        ],
      },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 14. SIGNAL HOLLOW ───────────────────────────────────────────────────

  z08_r14: {
    id: 'z08_r14',
    zone: 'z08',
    name: 'SIGNAL HOLLOW',
    description:
`A crack in the tunnel wall, barely wide enough to squeeze through.
On the other side: a natural cavity in the rock beneath the
concrete. Not built. Found. The walls are raw stone, damp, older
than anything else in the tunnel network.

In the center of the cavity, a salvaged antenna array — cobbled
together from satellite dish fragments and copper wire — points
straight down. Not at anything visible. At something below.

The air vibrates. You feel it in your molars before you hear it.
33hz. Clean. Unprocessed. The rawest version of the signal
you've ever felt.

A Parish symbol is carved into the stone near the crack:
a circle with a vertical line through it. Below it, scratched
in small letters: "THE SIGNAL WAS HERE BEFORE US."`,
    exits: [
      { direction: 'north', targetRoom: 'z08_r12', description: 'north (East Passage)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'antenna_array', name: 'antenna array', examineText: "Pointed straight down. Through the rock, through the deep tunnels, through the Abandoned Transit, all the way to the Substrate. Someone built this to listen. To what?" },
      { id: 'signal_relay', name: 'signal relay', examineText: 'A node in the frequency network. You can feel the 33hz coursing through the antenna frame. Touching it floods your vision with static for a moment — then clarity. Other nodes exist. You can feel them. Iron Bloom. The rooftops. Somewhere much, much deeper.' },
      { id: 'parish_symbol', name: 'parish symbol', examineText: "A circle with a line. You've seen it elsewhere in the tunnels — scratched into walls, painted on crates. The Parish uses it to mark places where the frequency is strong." },
      { id: 'carved_text', name: 'carved text', examineText: "'THE SIGNAL WAS HERE BEFORE US.' Below that, in different handwriting: 'Before the city. Before the concrete. Before Helixion. It was always here.'" },
    ],
    isSafeZone: true,
    isHidden: true,
    hiddenRequirement: { attribute: 'GHOST', minimum: 6 },
    hasFastTravel: true,
    fastTravelType: 'signal_relay',
    fastTravelRequirement: { attribute: 'GHOST', minimum: 6 },
  },
};

// ── Junction hub exit patching ──────────────────────────────────────────────
// The Junction (r03) connects to rooms that aren't direct cardinal directions.
// These branch rooms are accessed from the Junction but use the east/west exits.
// We add extra navigation aliases handled by the command router.

// Rooms accessible from the Junction's west side
const JUNCTION_WEST_BRANCHES = ['z08_r06', 'z08_r07', 'z08_r08']; // Pump Room, Memorial, Clinic
// Rooms accessible from the Junction's east side
const JUNCTION_EAST_BRANCHES = ['z08_r11', 'z08_r12', 'z08_r14']; // Elder's, East Passage, Signal Hollow

// ── Zone Definition ─────────────────────────────────────────────────────────

export const ZONE_08: Zone = {
  id: 'z08',
  name: 'DRAINAGE NEXUS',
  depth: 'shallow',
  faction: 'THE_PARISH',
  levelRange: [1, 5],
  description: 'An old municipal drainage channel. Where several channels converge, The Parish has built something that almost resembles a home.',
  atmosphere: {
    sound: 'Running water, echoes, dripping. Distant metallic groaning.',
    smell: 'Rust, wet concrete, chemical traces. Cooking food near the Junction.',
    light: 'Salvaged lanterns, bioluminescent fungus, emergency LEDs.',
    temp: 'Cool. Damp. Gets colder the deeper you go.',
  },
  rooms: Z08_ROOMS,
  originPoint: 'DRAINAGE',
};

// ── Zone Registry ───────────────────────────────────────────────────────────
// Add zones here as they're built. Phase 1: only Drainage Nexus.

const ZONE_REGISTRY: Record<string, Zone> = {
  z08: ZONE_08,
};

// ── Room Lookup ─────────────────────────────────────────────────────────────

export function getRoom(roomId: string): Room | null {
  const zoneId = roomId.split('_')[0];
  const zone = ZONE_REGISTRY[zoneId];
  if (!zone) return null;
  return zone.rooms[roomId] ?? null;
}

export function getZone(zoneId: string): Zone | null {
  return ZONE_REGISTRY[zoneId] ?? null;
}

export function getRoomExits(roomId: string): string[] {
  const room = getRoom(roomId);
  if (!room) return [];
  return room.exits.map(e => e.description);
}

export function resolveExit(
  roomId: string,
  direction: string,
  character?: { attributes: import('./types').Attributes },
): { targetRoom: string; blocked?: string } | null {
  const room = getRoom(roomId);
  if (!room) return null;

  // Direct direction match (with alias support)
  const dirLower = direction.toLowerCase();
  const resolvedDir = DIRECTION_ALIASES[dirLower] ?? dirLower;
  let exit = room.exits.find(e => e.direction === resolvedDir || e.direction === dirLower);

  // Try matching by room name in the description
  if (!exit) {
    exit = room.exits.find(e =>
      e.description.toLowerCase().includes(dirLower) ||
      (e.targetRoom && getRoom(e.targetRoom)?.name.toLowerCase().includes(dirLower))
    );
  }

  // Generic branch room lookup: try rooms accessible from this room by name
  if (!exit) {
    const branches = getAccessibleBranches(roomId, character);
    for (const br of branches) {
      if (br.name.toLowerCase().includes(dirLower)) {
        return { targetRoom: br.id };
      }
    }
  }

  if (!exit) return null;

  // Check locked
  if (exit.locked) {
    return { targetRoom: exit.targetRoom, blocked: `Locked. Requires: ${exit.lockId ?? 'unknown key'}.` };
  }

  // Check hidden requirement
  if (exit.hidden && exit.hiddenRequirement && character) {
    const attr = character.attributes[exit.hiddenRequirement.attribute];
    if (attr < exit.hiddenRequirement.minimum) {
      return null; // Can't even see it
    }
  }

  return { targetRoom: exit.targetRoom };
}

// ── Room discovery (what exits are visible to this character) ────────────────

export function getVisibleExits(
  roomId: string,
  character?: { attributes: import('./types').Attributes },
): import('./types').RoomExit[] {
  const room = getRoom(roomId);
  if (!room) return [];

  return room.exits.filter(exit => {
    if (!exit.hidden) return true;
    if (!exit.hiddenRequirement || !character) return false;
    return character.attributes[exit.hiddenRequirement.attribute] >= exit.hiddenRequirement.minimum;
  });
}

// For the Junction, also return visible branch rooms
export function getJunctionBranches(
  character?: { attributes: import('./types').Attributes },
): Room[] {
  const branches = [...JUNCTION_WEST_BRANCHES, ...JUNCTION_EAST_BRANCHES];
  return branches
    .map(id => getRoom(id))
    .filter((r): r is Room => {
      if (!r) return false;
      if (!r.isHidden) return true;
      if (!r.hiddenRequirement || !character) return false;
      return character.attributes[r.hiddenRequirement.attribute] >= r.hiddenRequirement.minimum;
    });
}

// ── Spawn room for origin ───────────────────────────────────────────────────

export function getOriginSpawnRoom(origin: import('./types').OriginPoint): string {
  switch (origin) {
    case 'DRAINAGE':   return 'z08_r01'; // South Entry
    case 'IRON_BLOOM': return 'z12_r01'; // Iron Bloom Entry (stub)
    case 'ROOFTOPS':   return 'z07_r01'; // Rooftop Network (stub)
    case 'MARKET':     return 'z03_r01'; // Industrial District (stub)
    default:           return 'z08_r01';
  }
}

// ── Enemies in room (roll spawns) ───────────────────────────────────────────

export function rollRoomEnemies(roomId: string): import('./types').RoomEnemy[] {
  const room = getRoom(roomId);
  if (!room) return [];

  return room.enemies.filter(enemy => {
    const roll = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
    return roll <= enemy.spawnChance;
  });
}

// ── All zones (for /map) ────────────────────────────────────────────────────

export function getAllZones(): Zone[] {
  return Object.values(ZONE_REGISTRY);
}

export function getAllRoomsInZone(zoneId: string): Room[] {
  const zone = ZONE_REGISTRY[zoneId];
  if (!zone) return [];
  return Object.values(zone.rooms);
}

// ── Accessible branch rooms ────────────────────────────────────────────────
// Returns rooms that have an exit pointing TO this room but this room
// doesn't have a direct exit TO them.  i.e. "side passages" reachable
// by name (/go <room name>) but not by cardinal direction.
// Respects hidden-room attribute gates.

export function getAccessibleBranches(
  roomId: string,
  character?: { attributes: import('./types').Attributes },
): Room[] {
  const room = getRoom(roomId);
  if (!room) return [];
  const zoneId = roomId.split('_')[0];
  const zone = ZONE_REGISTRY[zoneId];
  if (!zone) return [];

  // Set of rooms this room already has exits to
  const directExitTargets = new Set(room.exits.map(e => e.targetRoom));

  const branches: Room[] = [];
  for (const candidate of Object.values(zone.rooms)) {
    if (candidate.id === roomId) continue;
    if (directExitTargets.has(candidate.id)) continue;
    // Does the candidate have an exit pointing back to this room?
    const hasExitToUs = candidate.exits.some(e => e.targetRoom === roomId);
    if (!hasExitToUs) continue;
    // Gate hidden rooms
    if (candidate.isHidden) {
      if (!candidate.hiddenRequirement || !character) continue;
      if (character.attributes[candidate.hiddenRequirement.attribute] < candidate.hiddenRequirement.minimum) continue;
    }
    branches.push(candidate);
  }
  return branches;
}
