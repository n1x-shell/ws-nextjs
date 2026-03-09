// lib/mud/worldMap.ts
// TUNNELCORE MUD — World Map
// Room definitions, zone registry, room lookups.
// Phase 1: Drainage Nexus (Zone 8, 14 rooms). Phase 2: Maintenance Tunnels (Zone 9, 11 rooms).

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
      { id: 'notice_board', name: 'notice board', examineText: 'Salvaged cork board nailed to a pipe column. Scraps of paper pinned to it — requests, warnings, trade offers. Some are job postings. Use /jobs to check available work.' },
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

// ── Zone 09: Maintenance Tunnels ────────────────────────────────────────────

const Z09_ROOMS: Record<string, Room> = {

  // ── 1. WEST JUNCTION ─────────────────────────────────────────────────────

  z09_r01: {
    id: 'z09_r01',
    zone: 'z09',
    name: 'WEST JUNCTION',
    description:
`a concrete junction where three tunnel corridors meet. ceiling
low — two and a half meters — lined with cable bundles, pipe
runs, ventilation ducts. everything functional. nothing maintained.
dust on every horizontal surface, thick enough to record footprints.
emergency amber strips cast the junction in flat light. some have
failed. pockets of darkness between pools of dim glow.

footprints in the dust. not yours. multiple sets, different sizes,
going different directions. you're not the first person to find
these tunnels. you're not alone down here.`,
    exits: [
      { direction: 'west', targetRoom: 'z08_r12', description: 'west (Drainage Nexus — East Passage)', zoneTransition: true, targetZone: 'z08' },
      { direction: 'south', targetRoom: 'z09_r02', description: 'south (Cable Gallery)' },
      { direction: 'down', targetRoom: 'z10_r01', description: 'down (Industrial Drainage — utility shaft)', zoneTransition: true, targetZone: 'z10' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'tunnel_rats_z09', name: 'Tunnel Rats', level: 4,
        description: 'Large. Adapted to the electrical environment. Thin fur, enlarged eyes. Scatter from light. Nest defense only.',
        hp: 12, attributes: enemyAttrs(4), damage: 3, armorValue: 0,
        behavior: 'passive', spawnChance: 0.6, count: [3, 4],
        drops: [
          { itemId: 'scrap_metal', chance: 0.4, quantityRange: [1, 2] },
          { itemId: 'tunnel_wire', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 12,
      },
    ],
    objects: [
      { id: 'dust_footprints', name: 'dust footprints', examineText: 'Multiple sets. Some old — dust partially refilled the tracks. Some recent — sharp edges, clear tread patterns. At least three people in the past month. GHOST ≥ 4: One set leads south with purpose — regular stride, familiar route. Another wanders — exploring, hesitant. The third set is barefoot. Barefoot in maintenance tunnels. Someone lives here.' },
      { id: 'access_panels', name: 'access panels', examineText: 'Cable termination points, electrical switchgear, valve manifolds. The residential blocks\' infrastructure, accessible from below. TECH ≥ 5: Some panels control building systems — power routing, ventilation, mesh signal distribution. You could shut down power to an entire apartment building from here. Nobody would know why.' },
      { id: 'emergency_lighting', name: 'emergency lighting', examineText: 'Amber strips along the floor — battery-backed emergency system. Some have failed. Twenty-year lifespan. These have been running for fifteen. In five more years, the western tunnels will be completely dark. Nobody will replace them.' },
      { id: 'cable_bundles_z09', name: 'cable bundles', examineText: 'Fiber optic and copper, bundled and secured to the ceiling with cable trays. Fiber carries mesh signal to every building above. Copper carries power. TECH ≥ 6: The mesh signal passes through this junction. You could tap it — intercept residential mesh traffic, read the data, even modify it before it reaches the apartments. Down here, you could do it from the source.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 2. CABLE GALLERY ─────────────────────────────────────────────────────

  z09_r02: {
    id: 'z09_r02',
    zone: 'z09',
    name: 'CABLE GALLERY',
    description:
`a long corridor — fifty meters, straight, wide enough for a
maintenance cart that hasn't been here in a decade. the walls
are cable. not decorated with cable — made of cable. thousands
of runs, bundled and secured, covering every surface floor to
ceiling. fiber optic bundles glow faintly — data moving through
glass. copper runs oxidized green where condensation pooled.

the gallery hums. every cable carries current or signal and the
combined vibration creates a sound felt as much as heard. low,
constant, sits in your chest at 60hz. not 33hz. the city's own
frequency. infrastructure, not biology. machine, not heartbeat.

at the gallery's midpoint, a side passage leads to something
that shouldn't exist.`,
    exits: [
      { direction: 'north', targetRoom: 'z09_r01', description: 'north (West Junction)' },
      { direction: 'south', targetRoom: 'z09_r03', description: 'south (Ventilation Hub)' },
      { direction: 'east', targetRoom: 'z09_r05', description: 'east (Forgotten Server Room)', hidden: true, hiddenRequirement: { attribute: 'GHOST', minimum: 5 } },
    ],
    npcs: [
      {
        id: 'moth', name: 'Moth', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'Small woman, fifties. Moves like the rats — quick, quiet, against the walls. Sitting at the gallery midpoint eating from a can.',
        dialogue: "\"…don't scream. I'm not going to hurt you. I just need to know if you're alone.\"",
        startingDisposition: -10,
        services: ['shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'cable_walls', name: 'cable walls', examineText: 'Thousands of runs. Fiber, copper, coaxial, types you don\'t recognize. Organized by layer — power at the bottom, mesh signal in the middle, legacy at the top. The legacy layer is dead — analog telephone, cable television, pre-mesh internet. Ghost infrastructure. The nervous system of a city that doesn\'t exist anymore.' },
      { id: 'fiber_glow', name: 'fiber glow', examineText: 'Fiber optic bundles glow faintly where the emergency lighting is dim. Data — light pulses carrying mesh traffic. Millions of transmissions per second, visible as a shimmer in the glass. The residential blocks\' entire digital life flowing through this corridor. Accessible, readable, completely unprotected.' },
      { id: 'the_hum', name: 'the hum', examineText: 'Cable vibration, power hum, the acoustic effect of thousands of current-carrying conductors in an enclosed space. Approximately 60hz — mains frequency. NOT the 33hz Substrate pulse. The city\'s own frequency. Learning to tell them apart matters.' },
      { id: 'hidden_passage', name: 'hidden passage', examineText: 'GHOST ≥ 5: Behind a loose access panel, a narrow passage branches east. The panel has been opened and closed many times — dust pattern shows regular use. Moth doesn\'t go this way. She says the passage leads to a room that \'hums wrong.\' She means the 33hz.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 3. VENTILATION HUB ───────────────────────────────────────────────────

  z09_r03: {
    id: 'z09_r03',
    zone: 'z09',
    name: 'VENTILATION HUB',
    description:
`the corridor opens into a space that shouldn't exist beneath
apartment buildings. a chamber — twenty meters across, fifteen
high — dominated by industrial ventilation machinery. four massive
air handling units, each the size of a shipping container. ductwork
branches in every direction. the units run on automatic, cycling
air through the residential blocks above. unattended for years.
the noise is constant and enormous.

the chamber is the city's lungs. the air you breathe in every
residential apartment passes through these machines. the units
also contain mesh signal repeaters — the ducts double as signal
waveguides. you breathe the mesh. literally.`,
    exits: [
      { direction: 'north', targetRoom: 'z09_r02', description: 'north (Cable Gallery)' },
      { direction: 'south', targetRoom: 'z09_r04', description: 'south (Smuggler\'s Corridor)' },
      { direction: 'up', targetRoom: 'z02_r07', description: 'up (Residential Blocks — Squatter Floors)', zoneTransition: true, targetZone: 'z02' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'tunnel_vermin_swarm', name: 'Tunnel Vermin Swarm', level: 5,
        description: 'Warm air and vibration attract them. Large adapted cockroaches nesting in the ventilation housing. Swarm when disturbed.',
        hp: 18, attributes: enemyAttrs(5), damage: 2, armorValue: 0,
        behavior: 'passive', spawnChance: 0.5, count: [2, 4],
        drops: [
          { itemId: 'vermin_chitin', chance: 0.3, quantityRange: [1, 2] },
        ],
        xpReward: 15,
      },
    ],
    objects: [
      { id: 'air_handling_units', name: 'air handling units', examineText: 'Industrial. Enormous. Each unit processes air for approximately fifty apartment buildings. Filters clogged — years without replacement. Air quality in the blocks has been slowly degrading. Nobody above has noticed because the mesh doesn\'t flag infrastructure issues in neglected zones. The lungs of the city are failing and the city doesn\'t know.' },
      { id: 'mesh_repeaters', name: 'mesh repeaters', examineText: 'TECH ≥ 6: Embedded in the air handling units. Mesh signal modulated onto a carrier wave propagated through the ductwork — the ducts act as waveguides distributing signal into every room in every building. You breathe mesh-frequency air. TECH ≥ 8: The repeaters can be disabled. Doing so drops mesh coverage in approximately fifty buildings. Residents would feel it as anxiety, confusion — withdrawal. The mesh is a dependency.' },
      { id: 'the_noise', name: 'the noise', examineText: 'Constant 85-decibel roar. Conversation impossible without shouting. GHOST checks are easier here — noise covers movement, footsteps, even combat. But it also covers approaching threats. Acoustically dangerous both ways.' },
      { id: 'renovation_cables', name: 'renovation cable runs', examineText: 'New cable installation — recent, clean, Helixion branding on the conduit. Running to the building directly above. TECH ≥ 6: These are mesh-compliance monitoring lines. When active, they extend surveillance into the tunnel infrastructure beneath the building. Moth\'s living space would be exposed. The cable junction box has standard Helixion connectors. Disable them before they go active and the monitoring never reaches down here.' },
      { id: 'drainage_grates', name: 'drainage grates', examineText: 'Below the catwalks: grated floor sections showing utility shafts descending into darkness. Narrow — too small for comfort, large enough if desperate. GHOST ≥ 5: Warm air rises from below. Not machine warmth — organic warmth. Biological activity in the deep shafts. Something alive. Something large enough to generate heat.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 4. SMUGGLER'S CORRIDOR ───────────────────────────────────────────────

  z09_r04: {
    id: 'z09_r04',
    zone: 'z09',
    name: "SMUGGLER'S CORRIDOR",
    description:
`a long utility corridor running south from the ventilation hub.
every twenty meters, an access panel opens onto cable infrastructure
serving a different building. some panel numbers scratched out and
replaced with symbols — a system of marks that means nothing to
you and everything to someone.

smuggler marks. this corridor is a contraband highway. medical
supplies, stims, unregistered cyberware, food that didn't come
through helixion supply chains. the marks indicate drop points,
safe sections, timing windows.

the corridor is cleaner than the rest of the western tunnels.
someone sweeps it. someone maintains the lighting. someone cares
about this passage because it makes them money.`,
    exits: [
      { direction: 'north', targetRoom: 'z09_r03', description: 'north (Ventilation Hub)' },
      { direction: 'east', targetRoom: 'z09_r06', description: 'east (The Bulkhead)' },
    ],
    npcs: [
      {
        id: 'fex', name: 'Fex', type: 'SHOPKEEPER',
        faction: 'FREEMARKET',
        description: 'Thirties. Quick, lean, perpetually amused. Leaning against a panel midway along the corridor. Waiting for a delivery or a customer.',
        dialogue: "\"Looking for something? I probably have it. Don't have it? I can get it. Can't get it? It doesn't exist. — What's your budget?\"",
        startingDisposition: 0,
        services: ['shop', 'quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'smuggler_marks', name: 'smuggler marks', examineText: 'Scratched into the walls beside access panels. Circles (drop points), arrows (safe direction), crosses (avoid), stars (timing windows). GHOST ≥ 4: Standardized Freemarket smuggler notation. Used across the city\'s underground passages. Learning the system reveals an invisible navigation layer.' },
      { id: 'access_panel_drops', name: 'access panel drops', examineText: 'Some panels modified — hinges oiled, latches replaced, interiors cleaned. Active drop points. Goods left in the cable space behind the panel, collected by the next courier. Low-tech. Highly effective.' },
      { id: 'maintained_lighting', name: 'maintained lighting', examineText: 'Emergency lighting in this section works. All of it. Failed strips replaced. Floor swept. The difference between this corridor and the rest of the western tunnels is maintenance. Investment implies value. Value implies traffic.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 5. FORGOTTEN SERVER ROOM ─────────────────────────────────────────────

  z09_r05: {
    id: 'z09_r05',
    zone: 'z09',
    name: 'FORGOTTEN SERVER ROOM',
    description:
`behind the loose panel in the cable gallery, through a narrow
passage that smells like old air and hot metal. a room that time
forgot.

pre-helixion server room. beige metal housings, fans spinning on
dying bearings, LED indicators blinking in patterns that mean
nothing to modern systems. installed when the residential blocks
were built. managed the buildings' original systems — climate,
security, utilities. helixion migrated everything and forgot these
existed. running on a dedicated circuit nobody thought to cut.
fifteen years. the data is intact.

the servers hum. not at 60hz. at 33hz. every oscillator has
drifted to the substrate's frequency. the room hums wrong.`,
    exits: [
      { direction: 'west', targetRoom: 'z09_r02', description: 'west (Cable Gallery)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'old_servers', name: 'old servers', examineText: 'Pre-Helixion hardware. Decades old. Still running because nobody cut the dedicated power circuit. The data on them is intact — building management records, resident databases, communication logs. TECH ≥ 6: The resident database contains records predating Helixion\'s absorption. Names, apartment numbers, biometric profiles. Cross-reference with memorial wall entries in the Drainage Nexus and the names match. Helixion\'s recruitment targets lived in these buildings. The subjects were chosen by address.' },
      { id: 'comm_archive', name: 'communication archive', examineText: 'Thousands of messages. Last two years before Helixion absorbed the infrastructure. Early messages normal — weather, dinner plans. Late messages anxious. \'Have you noticed the new equipment on the roof?\' \'Did you get the mandatory health screening?\' \'My neighbor hasn\'t been home in a week.\' Archive ends mid-conversation. Someone was typing \'I think something is wrong with—\' and then Helixion pulled the plug.' },
      { id: '33hz_resonance', name: '33hz resonance', examineText: 'The servers hum at 33hz. Old oscillators drifted from 50hz mains to the Substrate\'s frequency over fifteen years. TECH ≥ 8: The drift isn\'t random. The oscillators converged. Different components, different starting frequencies, same destination. The Substrate\'s frequency doesn\'t just broadcast. It attracts. It pulls other oscillations toward itself. The servers didn\'t drift. They were tuned.' },
    ],
    isSafeZone: true,
    isHidden: true,
    hiddenRequirement: { attribute: 'GHOST', minimum: 5 },
  },

  // ── 6. THE BULKHEAD ──────────────────────────────────────────────────────

  z09_r06: {
    id: 'z09_r06',
    zone: 'z09',
    name: 'THE BULKHEAD',
    description:
`a wall of steel. floor to ceiling, wall to wall. security bulkhead
installed when helixion built the campus — sealing campus
infrastructure from residential, maintained from neglected,
controlled from forgotten.

heavy-gauge steel. single access door — biometric lock, magnetic
seal, camera above the frame. this side: dust, dim light, the hum
of neglected cables. the other side (visible through a reinforced
window): bright clinical white, clean corridors, helixion logo
stenciled on the wall.

the door has never been opened from this side. approaching it is
a statement. opening it is an act of war.

but the bulkhead was installed by humans who think in straight
lines. the tunnels were built by engineers who thought in systems.`,
    exits: [
      { direction: 'west', targetRoom: 'z09_r04', description: 'west (Smuggler\'s Corridor)' },
      { direction: 'east', targetRoom: 'z09_r07', description: 'east (Sensor Corridor)', locked: true, lockId: 'bulkhead_bypass' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'the_bulkhead', name: 'the bulkhead', examineText: 'Steel. Heavy-gauge. Installed during campus construction. The residential side sealed off as a security measure. Helixion maintained their half. Nobody maintained the other. TECH ≥ 7: The biometric lock is military-grade but the magnetic seal runs on the same power grid as the western tunnels\' emergency lighting. Cut the power and the seal fails. The biometric stays active but the door can be forced. GHOST ≥ 6: The camera above the door has a blind spot — floor level, left side. Designed for standing humans, not crawling ones.' },
      { id: 'bulkhead_camera', name: 'bulkhead camera', examineText: 'Continuous recording. Feeds to a D9 monitoring station. Approaching within five meters triggers an alert. TECH ≥ 6: The camera feed can be looped — a 30-second recording replayed to mask approach. The loop window is enough to reach the door. Not enough to open it.' },
      { id: 'reinforced_window', name: 'reinforced window', examineText: 'Through the glass: bright white corridors. Clean. The contrast with this side is absolute. Two different cities sharing the same underground. The window is a mirror. It shows you what the city looks like when someone is paying attention.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 7. SENSOR CORRIDOR ───────────────────────────────────────────────────

  z09_r07: {
    id: 'z09_r07',
    zone: 'z09',
    name: 'SENSOR CORRIDOR',
    description:
`past the bulkhead. the world changed.

the corridor is bright — white LED strips running the ceiling's
full length. floor clean. walls clean. air different — processed,
temperature-controlled, antiseptic nothing. cable runs enclosed
in sealed conduit. utility panels locked. everything neat and
maintained and watched.

sensor modules at every junction. small boxes mounted at knee
height, chest height, ceiling level. motion detectors. thermal
sensors. the tunnel equivalent of campus biometric monitoring.
anything that moves through here is tracked, logged, evaluated.
the sensors don't trigger alarms. they trigger analysis.

moving through the sensor corridor is a puzzle. the sensors have
coverage patterns. the patterns have gaps. the gaps are small
and they move.`,
    exits: [
      { direction: 'west', targetRoom: 'z09_r06', description: 'west (The Bulkhead)' },
      { direction: 'south', targetRoom: 'z09_r09', description: 'south (Helixion Service Corridor)' },
      { direction: 'east', targetRoom: 'z09_r08', description: 'east (The Gap)', hidden: true, hiddenRequirement: { attribute: 'GHOST', minimum: 6 } },
    ],
    npcs: [],
    enemies: [
      {
        id: 'd9_tunnel_patrol_sensor', name: 'D9 Tunnel Patrol', level: 12,
        description: 'Two agents. Arrive only if sensors triggered. Professional. Combat-trained. Cover angles, subvocal mesh comms. Fighting is loud — reinforcements in 10 minutes.',
        hp: 65, attributes: { ...enemyAttrs(12), REFLEX: 8, GHOST: 7, COOL: 7 }, damage: 12, armorValue: 5,
        behavior: 'patrol', spawnChance: 0.0, count: [2, 2],
        drops: [
          { itemId: 'd9_tactical_vest', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'd9_encrypted_intel', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'agent_sidearm', chance: 0.2, quantityRange: [1, 1] },
        ],
        xpReward: 120,
      },
    ],
    objects: [
      { id: 'sensor_modules', name: 'sensor modules', examineText: 'Small, angular, mounted at three heights. TECH ≥ 6: Helixion MPS-3 Multi-Spectrum Sensor Platform. Motion, thermal, and pressure in a single package. Military-grade. The overkill says something — whatever Helixion protects down here, they protect it seriously. Sensors self-calibrate every 18 hours. During calibration: a 30-second gap in thermal coverage.' },
      { id: 'clean_corridor', name: 'clean corridor', examineText: 'Spotless. Recently cleaned — no dust, no debris, no footprints. Freshly painted Helixion white. Cable conduits sealed and locked. Everything about this corridor says \'this space is observed, maintained, and controlled.\' The neglected western tunnels are thirty meters behind you. The contrast is violent.' },
      { id: 'the_gap_entrance', name: 'the gap entrance', examineText: 'GHOST ≥ 6: Between two sensor modules — a section of wall that doesn\'t match. Same Helixion white paint but the surface beneath is different. Not poured concrete. Brick. Old brick from before the Helixion construction. The sensor coverage skips this section — a one-meter gap where neither module\'s field reaches. TECH ≥ 5: Behind the brick — a cavity. Big enough for a person.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 8. THE GAP (hidden room) ─────────────────────────────────────────────

  z09_r08: {
    id: 'z09_r08',
    zone: 'z09',
    name: 'THE GAP',
    description:
`a cavity between walls. old construction on one side — brick,
mortar, original tunnel structure from decades before helixion.
new construction on the other — poured concrete, the bulkhead
extension. between them: a space roughly two meters wide and ten
meters long.

someone lives here.

a sleeping pad. water container. food — helixion nutrient bars,
wrappers precisely folded and stacked. a single LED strip,
battery-powered, cold blue. books. hand-tools. a journal open
to a page covered in small, precise handwriting.

and a person, sitting against the old wall, watching you with
the expression of someone who has been alone for so long that
another face is both miracle and threat.`,
    exits: [
      { direction: 'west', targetRoom: 'z09_r07', description: 'west (Sensor Corridor)' },
    ],
    npcs: [
      {
        id: 'lumen', name: 'Lumen', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Indeterminate age. Could be thirty, could be fifty. Former Helixion infrastructure engineer. Three years between two walls.',
        dialogue: "\"…you're real. you're actually real. I'm — I haven't — how long has it been since — no. Don't answer that. I know how long.\"",
        startingDisposition: -10,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'lumen_journal', name: 'journal', examineText: 'Small, precise handwriting. Engineering notes becoming personal reflections becoming fragments. Recent entries are less structured — the handwriting wavers. Three years of absolute solitude recorded in diminishing coherence.' },
      { id: 'nutrient_bars_stacked', name: 'nutrient bar wrappers', examineText: 'Helixion standard issue. Precisely folded and stacked. She steals them during the 30-second sensor calibration window — the gap in thermal coverage she designed. Her own creation is her food source and her prison.' },
      { id: 'old_wall', name: 'old wall', examineText: 'Brick. Pre-Helixion. The mortar is warm — not from heating, from the earth behind it. The deeper infrastructure radiates heat. Lumen sleeps against this wall. She says it breathes. She means the warmth cycles. But the word she chose was \'breathes.\'' },
      { id: 'sensor_grid_map', name: 'sensor grid map', examineText: 'Hand-drawn on the back of blueprint paper. The sensor corridor\'s complete coverage map — every sensor\'s field, every gap, every timing window. Patrol schedule plotted over 72 hours. Calibration windows in red. This map turns the sensor corridor from impossible to difficult. Three years of observation through cracks in the wall. Perfect.' },
    ],
    isSafeZone: true,
    isHidden: true,
    hiddenRequirement: { attribute: 'GHOST', minimum: 6 },
  },

  // ── 9. HELIXION SERVICE CORRIDOR ─────────────────────────────────────────

  z09_r09: {
    id: 'z09_r09',
    zone: 'z09',
    name: 'HELIXION SERVICE CORRIDOR',
    description:
`the main service corridor beneath the helixion campus. wider than
the sensor corridor — wide enough for vehicles. floor marked with
guidance lines: yellow for maintenance, red for security, blue for
logistics. ceiling high enough for automated carts that move
supplies between campus buildings without going through public
spaces above.

the corridor runs the full length of the campus underground.
access doors branch to buildings — each biometric-locked, each
leading to a service elevator. from here you could reach any
building on campus without passing through a single public space.

d9 agents walk this corridor. not patrolling — moving. using the
service infrastructure as a covert transit system. the tunnels
are d9's circulatory system.`,
    exits: [
      { direction: 'north', targetRoom: 'z09_r07', description: 'north (Sensor Corridor)' },
      { direction: 'south', targetRoom: 'z09_r10', description: 'south (Staging Area)' },
    ],
    npcs: [
      {
        id: 'hale', name: 'Hale', type: 'QUESTGIVER',
        faction: 'HELIXION',
        description: 'Forties. Tired. At a maintenance console along the corridor. Working. Trying to look like he\'s only working.',
        dialogue: "\"Don't— don't talk to me. Keep walking. — Wait. Come back. But don't look at me. Look at the console. — Something's wrong down here. I need to tell someone.\"",
        startingDisposition: -15,
        services: ['quest', 'info'],
      },
    ],
    enemies: [
      {
        id: 'd9_tunnel_patrol_service', name: 'D9 Tunnel Patrol', level: 13,
        description: 'Two agents on active patrol. Purposeful movement. If you\'re in their path, they engage. If you\'re in a side niche, they pass.',
        hp: 70, attributes: { ...enemyAttrs(13), REFLEX: 9, GHOST: 7, COOL: 8 }, damage: 13, armorValue: 6,
        behavior: 'patrol', spawnChance: 0.4, count: [2, 2],
        drops: [
          { itemId: 'd9_tactical_vest', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'd9_encrypted_intel', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'security_keycard_d9', chance: 0.2, quantityRange: [1, 1] },
        ],
        xpReward: 130,
      },
    ],
    objects: [
      { id: 'guidance_lines', name: 'guidance lines', examineText: 'Yellow, red, blue. Maintenance, security, logistics. The lines organize traffic beneath the campus. Yellow leads to maintenance access. Red leads to security positions. Blue leads to supply depots. GHOST ≥ 6: A fourth line — gray, barely visible against the floor. Leads south. Toward the section Hale was rerouted around. Doesn\'t appear on any maintenance schematic.' },
      { id: 'service_elevators', name: 'service elevators', examineText: 'Access doors every thirty meters. Each labeled with the building it serves: \'COMPLIANCE WING — SL ACCESS,\' \'RESEARCH WING — SL ACCESS.\' Biometric locks with utility override keypads. TECH ≥ 7 or Hale\'s codes: utility overrides bypass biometrics during maintenance windows.' },
      { id: 'utility_console', name: 'utility console', examineText: 'Maintenance control terminal. Power routing, ventilation management, lighting controls for the campus infrastructure. TECH ≥ 7: With the right codes, this console can trigger building-wide system events — power fluctuations, ventilation failures, lighting malfunctions. The kind of distraction that draws security attention away from other areas.' },
      { id: 'd9_traffic', name: 'D9 traffic', examineText: 'Watch the corridor for ten minutes. Two agents pass — walking, not patrolling. Briefcases. No uniforms. They\'re commuting. The service corridor is D9\'s highway. GHOST ≥ 7: One agent has a communication device displaying a patrol roster. Photograph it and Lumen\'s schedule map becomes complete.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 10. STAGING AREA ─────────────────────────────────────────────────────

  z09_r10: {
    id: 'z09_r10',
    zone: 'z09',
    name: 'STAGING AREA',
    description:
`past the gray line on the floor. past the door that isn't on any
maintenance schematic. into a section converted into something
else entirely.

the corridor widens into a loading bay. concrete. high ceiling.
vehicle access — a ramp leading to the surface, gated, large
enough for trucks. palletized cargo, some in opaque plastic, some
in matte gray containers marked with helixion codes. automated
forklift sorting. the logistics are professional. the security
is intense.

the containers are HX-7C specification — same as the industrial
district docks. same matte gray. same satellite tracking. but
these aren't coming from the docks. they're coming from below.
from the deep access shaft. the supply chain runs the wrong
direction. the containers aren't arriving from outside the city.
they're arriving from beneath it.`,
    exits: [
      { direction: 'north', targetRoom: 'z09_r09', description: 'north (Helixion Service Corridor)' },
      { direction: 'east', targetRoom: 'z09_r11', description: 'east (Deep Access Shaft)' },
      { direction: 'up', targetRoom: 'z01_r01', description: 'up (Helixion Campus — Service Sublevel)', zoneTransition: true, targetZone: 'z01' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'staging_security', name: 'Staging Security', level: 14,
        description: 'Armed guards on rotation. They guard the deep access shaft entrance and the cargo bay. D9 backup in 5 minutes if engaged.',
        hp: 80, attributes: { ...enemyAttrs(14), BODY: 9, REFLEX: 8, COOL: 8 }, damage: 14, armorValue: 7,
        behavior: 'aggressive', spawnChance: 0.8, count: [2, 2],
        drops: [
          { itemId: 'security_keycard_d9', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'helixion_intel', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'military_rations', chance: 0.5, quantityRange: [1, 2] },
        ],
        xpReward: 150,
      },
    ],
    objects: [
      { id: 'hx7c_containers', name: 'HX-7C containers', examineText: 'Matte gray. Satellite-tracked. Same spec as the Cargo Docks in the Industrial District. TECH ≥ 8: Origin codes indicate subterranean retrieval. Not manufactured. Retrieved. These hold material from the Substrate Level. The Tower is being built from two directions.' },
      { id: 'cargo_manifest', name: 'cargo manifest', examineText: 'TECH ≥ 9: Digital manifest. Contents: \'SUBSTRATE MATERIAL — CLASS 7 — PROJECT REMEMBERER.\' Delivery frequency: weekly. Volume: increasing. Destination: Broadcast Tower construction, upper array section. TECH ≥ 10: The factory-built resonance amplifiers are designed to interface with Substrate material. The Tower\'s antenna array is a hybrid — manufactured technology wrapped around organic architecture.' },
      { id: 'the_ramp', name: 'the ramp', examineText: 'Vehicle access to the surface. Gated. Large enough for trucks. Ramp leads to a service entrance on the campus perimeter — disguised as a utility access point. GHOST ≥ 6: Heavy truck tracks. Used at night, 0200-0400, when campus activity is minimal.' },
      { id: 'deep_shaft_entrance', name: 'deep shaft entrance', examineText: 'Heavy door opens onto a vertical shaft — service elevator, industrial grade, descending into darkness. Three levels below this one. The lowest is labeled \'SL-3.\' TECH ≥ 7: SL-3 corresponds to the Substrate Level depth estimate. Helixion has a private elevator to the Substrate.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 11. DEEP ACCESS SHAFT ────────────────────────────────────────────────

  z09_r11: {
    id: 'z09_r11',
    zone: 'z09',
    name: 'DEEP ACCESS SHAFT',
    description:
`the service elevator. industrial grade. the car is large —
designed for cargo, not people. reinforced steel walls. controls
simple: three levels below, one above. the shaft descends through
rock — not concrete, not construction. rock. the tunnel
infrastructure ends and the earth begins.

the temperature drops, then rises. the walls change — cut stone
to something less regular, less geometric. the rock is warm. the
air humid. and the 33hz frequency, a faint hum in the maintenance
tunnels above, becomes a physical presence. you feel it in the
elevator car. you feel it in your teeth.

first level below: abandoned transit. second level: unfinished,
raw tunnel. third level — SL-3 — locked. helixion credentials
required. the panel shows it active. whatever's at the bottom,
the elevator visits regularly.`,
    exits: [
      { direction: 'west', targetRoom: 'z09_r10', description: 'west (Staging Area)' },
      { direction: 'down', targetRoom: 'z11_r01', description: 'down (Abandoned Transit — service ladder)', zoneTransition: true, targetZone: 'z11' },
    ],
    npcs: [
      {
        id: 'reed', name: 'Reed', type: 'QUESTGIVER',
        faction: 'IRON_BLOOM',
        description: 'Thirties. Controlled. In the elevator shaft\'s maintenance alcove — a small space between floors, accessible from the service ladder.',
        dialogue: "\"Don't use the elevator. — I heard you coming. Shaft acoustics. You hear everything. — I'm Reed. Iron Bloom. Four months listening to what goes up and what comes down. The numbers don't add up.\"",
        startingDisposition: -5,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'elevator_shaft', name: 'elevator shaft', examineText: 'Vertical. Deep. Shaft walls transition from poured concrete (campus level) to cut stone (first sub-level) to something that might be natural rock (deeper). The further down you go, the warmer the walls get, and the stronger the 33hz becomes.' },
      { id: 'reed_alcove', name: 'Reed\'s alcove', examineText: 'Maintenance space between elevator stops. Reed made it livable: sleeping bag, water, nutrient bars, a tablet with Iron Bloom encryption running a monitoring program. Photographs pinned to the wall — cargo manifests, guard faces, time-stamped shots. Four months of intelligence, one frame at a time.' },
      { id: 'cargo_logs', name: 'cargo logs', examineText: 'Reed\'s photographed manifests. Going down: sensor arrays, frequency modulators, neural interface hardware. Coming up: organic crystalline substrate. Volume up is 1.4× the volume down. The discrepancy is consistent across every logged exchange. Reed has highlighted this ratio in red. Circled it. Underlined it. The Substrate is giving more than it receives.' },
      { id: 'collapsed_passage', name: 'collapsed passage', examineText: 'A side passage off the main shaft — partially blocked by structural collapse. Rubble, bent steel, broken conduit. TECH ≥ 6: The passage connects to Iron Bloom server farm infrastructure through the deep tunnels. Clearing it opens a smuggling route. The collapse looks structural but the cut marks on the steel suggest someone brought this down deliberately.' },
      { id: 'shaft_frequency', name: 'shaft frequency', examineText: 'The 33hz is strong here. The shaft acts as a resonant column — the frequency from below amplified by the vertical structure, like sound in an organ pipe. Reed says it changes at night — intensifies. Pulses. Sounds like breathing. She says she\'s probably imagining that. She says the dreams are getting specific.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },
};

// ── Zone 09 Definition ──────────────────────────────────────────────────────

export const ZONE_09: Zone = {
  id: 'z09',
  name: 'MAINTENANCE TUNNELS',
  depth: 'shallow',
  faction: 'NONE',
  levelRange: [4, 14],
  description: 'The city\'s plumbing. Cable runs, ventilation, service corridors. Neglected west, locked-down east. The bulkhead divides two worlds.',
  atmosphere: {
    sound: 'West: electrical hum, ventilation fans, dripping. East: sensor chirps, drone servos, D9 boots.',
    smell: 'West: dust, copper, mold. East: recycled antiseptic air.',
    light: 'West: emergency amber strips, some dead. East: clinical white LEDs. No shadows.',
    temp: 'West: cool, damp. East: climate-controlled, sterile.',
  },
  rooms: Z09_ROOMS,
  originPoint: undefined,
};

// ── Zone Registry ───────────────────────────────────────────────────────────

const ZONE_REGISTRY: Record<string, Zone> = {
  z08: ZONE_08,
  z09: ZONE_09,
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
