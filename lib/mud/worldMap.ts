// lib/mud/worldMap.ts
// TUNNELCORE MUD — World Map
// Room definitions, zone registry, room lookups.
// Phase 1: Drainage Nexus (Zone 8, 14 rooms). Phase 2: Maintenance Tunnels (Zone 9, 11 rooms).
// Phase 3: Industrial District (Zone 3, 15 rooms). Phase 4: Residential Blocks (Zone 2, 15 rooms).

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
      { direction: 'up', targetRoom: 'z04_r07', description: 'up (Fringe — Drainage Access)', zoneTransition: true, targetZone: 'z04' },
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
    traitDice: [{ name: 'NARROW PASSAGE', die: 6, benefitsActions: ['flee'] }],
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
    traitDice: [{ name: 'SAFE GROUND', die: 6, benefitsActions: ['recover'], color: '#a5f3fc' }],
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
    traitDice: [{ name: 'CROSSFIRE ANGLES', die: 8, hindersActions: ['flee'], color: '#ff6b6b' }],
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
    traitDice: [{ name: 'TOXIC SPORES', die: 8, hindersActions: ['attack', 'scan'], color: '#c084fc' }],
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
    traitDice: [{ name: 'HIGH GROUND', die: 6, benefitsActions: ['attack', 'scan'] }],
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
      { direction: 'south', targetRoom: 'z08_r02', description: 'maintenance access hatch leads down to the narrows' },
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
    traitDice: [{ name: 'TOXIC RUNOFF', die: 8, benefitsActions: ['hack'], hindersActions: ['attack'], color: '#4ade80' }],
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
    traitDice: [{ name: 'LOW LIGHT', die: 6, benefitsActions: ['sneak'], hindersActions: ['scan'] }],
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
    traitDice: [{ name: 'DEEP WATER', die: 8, hindersActions: ['flee', 'attack'], color: '#60a5fa' }],
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
      { direction: 'south', targetRoom: 'z08_r04', description: 'an old service tunnel connects to the north channel' },
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
      { direction: 'south', targetRoom: 'z08_r09', description: 'drainage pipes connect to the overflow tunnels' },
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
    traitDice: [{ name: 'CONFINED SPACE', die: 6, benefitsActions: ['attack'], hindersActions: ['flee'], color: '#ff6b6b' }],
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
      { direction: 'west', targetRoom: 'z08_r03', description: 'a narrow crawlway winds back toward the junction' },
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
      { direction: 'south', targetRoom: 'z09_r03', description: 'a maintenance duct behind the server racks' },
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
      { direction: 'south', targetRoom: 'z09_r11', description: 'the gap opens into the shaft below' },
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

// ── Zone 04: The Fringe ─────────────────────────────────────────────────────

const Z04_ROOMS: Record<string, Room> = {

  // ── 1. THE BORDER ─────────────────────────────────────────────────────────

  z04_r01: {
    id: 'z04_r01',
    zone: 'z04',
    name: 'THE BORDER',
    description:
`you can see the exact line. on one side — the residential blocks.
streetlamps that work. pavement without cracks. mesh signal at
full strength. on the other side — the fringe. no lamps. no
signal. the pavement breaks within three meters.

the air changes. the hum of the mesh thins and dies. each step
west drops the signal strength. for someone with standard implants
this would feel like unease — a manufactured reluctance. for you
it feels like a hand letting go.`,
    exits: [
      { direction: 'east', targetRoom: 'z02_r01', description: 'east (Residential Blocks — Outer Blocks)', zoneTransition: true, targetZone: 'z02' },
      { direction: 'west', targetRoom: 'z04_r02', description: 'west (Rubble Streets)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'the_line', name: 'the line', examineText: 'The last maintained streetlamp — still lit — and then darkness. The pavement changes within three meters. There\'s no fence. No sign. Just the place where maintenance stopped and nobody came back.' },
      { id: 'mesh_boundary', name: 'mesh boundary', examineText: 'GHOST ≥ 3: You can feel it — the mesh signal dropping like a cliff edge. Full strength on one side. Nothing on the other. The transition zone is less than ten meters wide. Helixion didn\'t fade coverage gradually. They cut it.' },
      { id: 'last_streetlamp', name: 'last streetlamp', examineText: 'Still powered. Still lit. The maintenance boundary runs exactly to this pole and not one meter further. It illuminates the broken pavement ahead like a spotlight on the threshold of something the city doesn\'t want to see.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 2. RUBBLE STREETS ─────────────────────────────────────────────────────

  z04_r02: {
    id: 'z04_r02',
    zone: 'z04',
    name: 'RUBBLE STREETS',
    description:
`the streets are still streets — you can see where the lanes were,
where the sidewalks ran. but everything is broken. potholes deep
enough to break an ankle. road buckled upward from root systems.
cars abandoned so long they've become landscape — rusted to the
color of the buildings, windows gone, interiors colonized by moss.

buildings on either side. five to eight stories. standing but
sagging. some apartments still have curtains. the curtains don't
move. nobody's home. nobody's been home for a long time.

a dog watches you from a doorway. thin and alert and not afraid.
it's deciding if you're food or competition.`,
    exits: [
      { direction: 'east', targetRoom: 'z04_r01', description: 'east (The Border)' },
      { direction: 'west', targetRoom: 'z04_r03', description: 'west (Collapsed Overpass)' },
      { direction: 'south', targetRoom: 'z04_r06', description: 'south (The Waking Room)' },
      { direction: 'north', targetRoom: 'z04_r08', description: 'north (The Clinic)' },
    ],
    npcs: [
      {
        id: 'oska', name: 'Oska', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'Thirties. Quick eyes, steady hands. Sitting on the hood of an abandoned car, a hand-drawn map spread across the windshield.',
        dialogue: "\"I draw what's real. The city forgot this place exists but I haven't. You want to know where you're going, or you want to learn by falling through a floor?\"",
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [
      {
        id: 'feral_dogs', name: 'Feral Dogs', level: 2,
        description: 'Pack hunters. Thin but not starving. Won\'t attack alone — they circle, then commit.',
        hp: 8, attributes: enemyAttrs(2), damage: 2, armorValue: 0,
        behavior: 'territorial', spawnChance: 0.5, count: [2, 3],
        drops: [],
        xpReward: 6,
      },
      {
        id: 'fringe_scavenger', name: 'Scavenger', level: 2,
        description: 'Solo. Won\'t attack unless you\'re carrying visible salvage. Flight-first — runs if losing.',
        hp: 12, attributes: enemyAttrs(2), damage: 3, armorValue: 1,
        behavior: 'territorial', spawnChance: 0.4, count: [1, 1],
        drops: [
          { itemId: 'scrap_metal', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'nutrient_bar', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'fringe_salvage', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 10,
      },
    ],
    objects: [
      { id: 'abandoned_cars', name: 'abandoned cars', examineText: 'Rusted beyond recognition. One has a child\'s car seat in the back, straps still buckled. Nobody drove out. They just stopped.' },
      { id: 'sagging_buildings', name: 'sagging buildings', examineText: 'Five stories. Pre-Helixion residential. Structural steel visible where the façade has fallen — orange with rust but holding. The buildings lean against each other like exhausted soldiers.' },
      { id: 'curtained_windows', name: 'curtained windows', examineText: 'Curtains. Still hanging. Faded by years of sun but still there. Someone chose those curtains. Someone hung them with care. That someone left or died and the curtains stayed. The Fringe is full of choices that outlasted the people who made them.' },
      { id: 'feral_dog', name: 'feral dog', examineText: 'Mixed breed. Thin but surviving. The pack is three or four, moving between buildings. The dog is deciding which kind of person you are.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 3. COLLAPSED OVERPASS ─────────────────────────────────────────────────

  z04_r03: {
    id: 'z04_r03',
    zone: 'z04',
    name: 'COLLAPSED OVERPASS',
    description:
`the highway overpass that once carried traffic over the western
district has partially collapsed. the eastern half still stands —
a concrete ribbon fifty meters above, guardrails rusted, weeds
growing from the joints. the western half fell.

the collapse created new geography. concrete slabs the size of
rooms leaning against each other. passages through the rubble.
the impact zone is a canyon of broken highway and twisted rebar.

graffiti on the standing section, high up: "WE DIDN'T LEAVE.
YOU LEFT US." beneath it, a list of names. people who survived
the collapse. people who are still here.`,
    exits: [
      { direction: 'east', targetRoom: 'z04_r02', description: 'east (Rubble Streets)' },
      { direction: 'south', targetRoom: 'z04_r06', description: 'south (The Waking Room)' },
      { direction: 'west', targetRoom: 'z04_r04', description: 'west (Underpass)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'fringe_scavenger', name: 'Scavenger', level: 3,
        description: 'Territorial. Patched clothing, improvised weapon. Claims this section of rubble.',
        hp: 15, attributes: enemyAttrs(3), damage: 4, armorValue: 1,
        behavior: 'territorial', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'scrap_metal', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'nutrient_bar', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'fringe_salvage', chance: 0.4, quantityRange: [1, 2] },
        ],
        xpReward: 12,
      },
    ],
    objects: [
      { id: 'graffiti', name: 'graffiti', examineText: '"WE DIDN\'T LEAVE. YOU LEFT US." The letters are large and steady — someone took their time. Beneath it, a list of names. Not scratched like the Memorial Alcove — painted deliberately. People who survived. People who are still here.' },
      { id: 'collapse_rubble', name: 'collapse rubble', examineText: 'The fallen highway created passages — some cleared by scavengers, some accidental gaps. Structurally unpredictable. Some sections compacted solid. Others shift when you breathe on them.' },
      { id: 'standing_overpass', name: 'standing overpass', examineText: 'The eastern half held. Fifty meters of highway with nowhere to go. Weeds in the expansion joints. Guardrails rusted through. From below it looks like a bridge to a place that doesn\'t exist anymore.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 4. UNDERPASS ──────────────────────────────────────────────────────────

  z04_r04: {
    id: 'z04_r04',
    zone: 'z04',
    name: 'UNDERPASS',
    description:
`beneath the standing section of the overpass the world narrows.
the highway deck blocks the sky. support pillars create a
colonnade of stained concrete — each one tagged with graffiti,
each one holding the weight of a road nobody drives.

the underpass is the main passage deeper. scavengers leave markers
here — warnings, directions, trade offers scratched into the
pillars. an informal economy of information conducted in concrete
dust.

the light is dim. the ground is damp. water collects from overpass
drainage that no longer routes anywhere useful.

something deeper in the underpass is watching you.`,
    exits: [
      { direction: 'east', targetRoom: 'z04_r03', description: 'east (Collapsed Overpass)' },
      { direction: 'south', targetRoom: 'z04_r05', description: 'south (Scavenger Cache)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'ruin_stalker', name: 'Ruin Stalker', level: 5,
        description: 'Lurks in the deeper shadows between pillars. The first stalker encounter. Doesn\'t attack immediately — follows, closing distance when you\'re not looking.',
        hp: 25, attributes: enemyAttrs(5), damage: 6, armorValue: 2,
        behavior: 'ambush', spawnChance: 0.5, count: [1, 1],
        drops: [
          { itemId: 'hoarded_salvage', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'stalker_lore_scrap', chance: 0.2, quantityRange: [1, 1] },
        ],
        xpReward: 30,
      },
    ],
    objects: [
      { id: 'pillar_markings', name: 'pillar markings', examineText: 'Scavenger shorthand scratched into concrete. Arrows with dates — passage reports. "SOUTH CLEAR 3/12." "DOGS EAST." "STALKER — AVOID AFTER DARK." A crude trade board: "HAVE: COPPER WIRE. NEED: FOOD. LEAVE AT PILLAR 6." The Fringe has no mesh. So they write on walls. The oldest technology.' },
      { id: 'pooled_water', name: 'pooled water', examineText: 'Rainwater collects here. The overpass drainage broke years ago and now it pools beneath the pillars. Clearer than the drainage below but not clean. Reflects the underpass columns like a dark mirror.' },
      { id: 'shadow_movement', name: 'shadow movement', examineText: 'GHOST ≥ 4: At the edge of visibility, between the furthest pillars — movement. Not animal. Human-shaped but wrong. Too slow. Too patient. It\'s watching you the way stone watches: without effort, without urgency, without end.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 5. SCAVENGER CACHE ────────────────────────────────────────────────────

  z04_r05: {
    id: 'z04_r05',
    zone: 'z04',
    name: 'SCAVENGER CACHE',
    description:
`beneath the standing overpass, sheltered from rain, a communal
supply point. not a shop — an arrangement. shelves made from
car hoods and concrete blocks, stocked by dozens of people over
years. items grouped by type: food, water, materials, tools,
medical. some have prices scratched on paper tags. some are
marked "TAKE IF NEED."

the economy is trust and everyone knows the penalty for
breaking it.

a fire pit sits in the center. warm. someone was here recently.
the fringe is empty but the cache fire is always warm.`,
    exits: [
      { direction: 'north', targetRoom: 'z04_r04', description: 'north (Underpass)' },
      { direction: 'east', targetRoom: 'z04_r02', description: 'a scavenger trail cuts through the rubble' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'cache_shelves', name: 'cache shelves', examineText: 'Car hoods on concrete blocks. Stocked by dozens over years. Items grouped by type. Some have prices on paper tags. Some marked "TAKE IF NEED." The economy is trust.' },
      { id: 'honor_system_note', name: 'honor system note', examineText: 'Scratched into the wall above the shelves: "TAKE WHAT YOU NEED. LEAVE WHAT YOU CAN. STEAL AND YOU\'RE ON YOUR OWN." Multiple authors over time. Below, in a different hand: "THE CACHE KEEPS US ALIVE. RESPECT IT." Below that: "DARO STOLE FOOD 8/3. DON\'T HELP DARO."' },
      { id: 'fire_pit', name: 'fire pit', examineText: 'Blackened stone ring. Ash from a hundred fires. The scorch marks on the overpass concrete above are deep — years of use. It\'s warm. Someone was here recently.' },
      { id: 'stolen_blueprints', name: 'old blueprints', examineText: 'Rolled paper, hand-drawn. Drainage schematics — pre-Helixion notation. Name in the corner: Kai Morrow. Every tunnel, every junction, every connection. A scavenger traded these thinking they were worthless.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 6. THE WAKING ROOM ───────────────────────────────────────────────────

  z04_r06: {
    id: 'z04_r06',
    zone: 'z04',
    name: 'THE WAKING ROOM',
    description:
`you open your eyes.

ceiling. stained plaster, cracked in patterns that look like
river systems. daylight through a broken window. dust floating
in the light, slow, like it has nowhere to be. your body is on
a mattress on the floor. the mattress is old. the floor is
concrete.

you don't know where you are. your hands go to your temples —
instinct — and find nothing. no implants. no neural interface.
no mesh connection. your head is bare skin and bone and silence.

in the silence, you hear your own heartbeat. you haven't heard
your own heartbeat in years. maybe ever.

a woman sits on a chair across the room. she's been watching
you. waiting for you to wake up.

"easy. you're safe. drink this. i'll explain what i can."`,
    exits: [
      { direction: 'north', targetRoom: 'z04_r02', description: 'north (Rubble Streets)' },
      { direction: 'south', targetRoom: 'z04_r09', description: 'south (Deep Ruins)' },
    ],
    npcs: [
      {
        id: 'lira', name: 'Lira', type: 'QUESTGIVER',
        faction: 'NONE',
        description: 'Thirties. Lean, strong, tired. Natural mesh rejector. She finds people who\'ve been dumped and gives them a start.',
        dialogue: "\"Easy. You're safe. That's step one. Step two is you drink this water. Step three is I tell you everything I know, which isn't enough, but it's more than you have.\"",
        startingDisposition: 25,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'the_mattress', name: 'the mattress', examineText: 'Old. Stained. But someone put a clean blanket on it — folded, placed. Lira prepared for you. Or for whoever was next. A bottle of water and a nutrient bar on the floor beside it. This mattress has saved lives. It doesn\'t look like much. It doesn\'t have to.' },
      { id: 'broken_window', name: 'broken window', examineText: 'The glass is gone. The frame is intact. Through it: the Fringe. Gray buildings against gray sky. No movement. No sound except wind. It tells you everything — you\'re somewhere the world stopped looking.' },
      { id: 'your_temples', name: 'your temples', examineText: 'You touch the skin where implants should be. Smooth. Scarred faintly — healed over. Someone removed hardware with skill but not kindness. The mesh would connect here. It doesn\'t. The silence in your skull is deafening and it is yours.' },
      { id: 'lira_chair', name: 'lira\'s chair', examineText: 'Plastic. Cracked. Taped together. She\'s sat in it many times. Water bottles and nutrient bar wrappers around it — the remains of other mornings like this one, other people like you. You\'re not the first. That should be comforting. It isn\'t.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 7. DRAINAGE ACCESS ────────────────────────────────────────────────────

  z04_r07: {
    id: 'z04_r07',
    zone: 'z04',
    name: 'DRAINAGE ACCESS',
    description:
`a service hatch in the basement of a partially collapsed building.
the ground floor is accessible — upper floors are not. the
basement is reached by a concrete stairway descending into
darkness and the smell of water.

the hatch is set into the basement floor — heavy steel, municipal
markings faded. pried open so many times the lock is stripped.
below: a vertical shaft with maintenance rungs leading down into
the drainage system. you can hear water. you can smell rust.

glow-strips on the shaft walls — parish markers. they're telling
you the way down is safe. that someone is waiting at the bottom.`,
    exits: [
      { direction: 'north', targetRoom: 'z04_r09', description: 'north (Deep Ruins)' },
      { direction: 'down', targetRoom: 'z08_r01', description: 'down (Drainage Nexus — South Entry)', zoneTransition: true, targetZone: 'z08' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'feral_dogs', name: 'Feral Dogs', level: 2,
        description: 'Denned in the collapsed building\'s ground floor. Not aggressive unless cornered.',
        hp: 8, attributes: enemyAttrs(2), damage: 2, armorValue: 0,
        behavior: 'territorial', spawnChance: 0.4, count: [1, 2],
        drops: [],
        xpReward: 6,
      },
    ],
    objects: [
      { id: 'service_hatch', name: 'service hatch', examineText: 'Municipal infrastructure. Markings read "DRAINAGE ACCESS — AUTHORIZED PERSONNEL ONLY." The lock has been defeated so many times it\'s decorative. Hinges greased — someone maintains this. Below: rungs descending into darkness and the sound of water.' },
      { id: 'parish_glow_strips', name: 'glow-strips', examineText: 'Bioluminescent strips — the same kind used in the Drainage Nexus. Green-cyan glow, faint but visible in the shaft\'s darkness. Parish route markers. If you see the glow-strips, you\'re going the right way.' },
      { id: 'collapsed_stairwell', name: 'collapsed stairwell', examineText: 'Building stairway collapsed at the second floor. Concrete and rebar blocking upward passage. Below the collapse, stairs continue to the basement. The building failed upward and held downward. Sometimes the way down is all that\'s left.' },
      {
        id: 'shaft_sounds', name: 'shaft sounds',
        examineText: 'Water flowing — not a trickle, a channel. Echoes suggesting large spaces. Metallic groaning of old pipes.',
        gatedText: [{ attribute: 'GHOST', minimum: 3, text: 'GHOST ≥ 3: Beneath the water sounds — a hum. 33hz. Rising through the drainage system like heat through a chimney. The frequency is down there.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 8. THE CLINIC ─────────────────────────────────────────────────────────

  z04_r08: {
    id: 'z04_r08',
    zone: 'z04',
    name: 'THE CLINIC',
    description:
`st. agatha's community hospital. the sign is still mounted above
the entrance, letters faded, one hinge broken so it hangs at an
angle. three stories. the only public building in the outer fringe.
built forty years ago. abandoned fifteen.

ground floor: a gutted emergency department. stretcher frames
without mattresses. curtain tracks with no curtains. tiles white
once, now the color of old bone.

someone has been using this space. not as a hospital — as a
shelter. a sleeping bag in an examination bay. canned food on a
medical cart. and a man with a chrome arm sitting on a gurney,
staring at the wall. he hears you come in. he hears everything
twice.`,
    exits: [
      { direction: 'south', targetRoom: 'z04_r02', description: 'south (Rubble Streets)' },
      { direction: 'west', targetRoom: 'z04_r06', description: 'a back corridor leads toward the waking room' },
    ],
    npcs: [
      {
        id: 'echo', name: 'Echo', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Indeterminate age. Chrome arm — Helixion work, medical grade, grafted not chosen. Early test subject. Dual-memory interference. He hears everything twice.',
        dialogue: "\"…you're here. That's — you're here. I heard you come in. I heard you come in again. The second time hasn't happened yet. It will. Give it a moment.\"",
        startingDisposition: 0,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'hospital_sign', name: 'hospital sign', examineText: 'ST. AGATHA\'S COMMUNITY HOSPITAL. The A in Agatha is missing. One hinge broken. The sign hangs crooked — a building that forgot it was supposed to help people, wearing the name of a saint who wouldn\'t recognize it.' },
      { id: 'gutted_emergency_dept', name: 'emergency department', examineText: 'Stretcher frames. Curtain tracks. The ghost of a triage system. Someone stripped everything useful years ago — mattresses, equipment, even the light fixtures. The bones of the building remain. The bones of a hospital are depressing in a way other ruins aren\'t.' },
      { id: 'echo_gurney', name: 'echo\'s gurney', examineText: 'A hospital gurney with a sleeping bag on it. Canned food stacked on a medical cart beside it. He lives here. In a hospital. In the emergency department. Maybe because it\'s the only place that matches what\'s happening in his head. Or because the echoes in the tile corridors sound almost like company.' },
      { id: 'chrome_arm', name: 'chrome arm', examineText: 'Helixion medical-grade cybernetic. Not chosen — grafted. The interface scars at the shoulder are surgical but aggressive. This was done to him, not for him. The arm works perfectly. The man attached to it does not.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 9. DEEP RUINS ────────────────────────────────────────────────────────

  z04_r09: {
    id: 'z04_r09',
    zone: 'z04',
    name: 'DEEP RUINS',
    description:
`deeper into the fringe the buildings close in. streets narrow
where walls have partially collapsed into them. the sky is
visible but reduced — a strip of gray between leaning facades
that almost touch overhead.

the buildings here are older. pre-war construction — heavy stone
and mortar, not concrete and steel. ornamental details survive:
carved lintels, art deco metalwork, a stone face above a doorway
with moss growing from its eyes.

the ground is uneven — subsidence has tilted entire blocks. doors
hang at wrong angles. windows that were once level are now
parallelograms. everything leans. walking through the deep ruins
feels like walking through a building that's falling down very,
very slowly.

you are not alone here.`,
    exits: [
      { direction: 'north', targetRoom: 'z04_r06', description: 'north (The Waking Room)' },
      { direction: 'south', targetRoom: 'z04_r07', description: 'south (Drainage Access)' },
      { direction: 'east', targetRoom: 'z04_r10', description: 'east (Stalker Territory)' },
      { direction: 'west', targetRoom: 'z04_r11', description: 'west (The Hermit\'s Tower)', hidden: true, hiddenRequirement: { attribute: 'GHOST', minimum: 5 } },
      { direction: 'southwest', targetRoom: 'z04_r12', description: 'southwest (Overgrown Courtyard)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'ruin_stalker', name: 'Ruin Stalker', level: 6,
        description: 'Moves through the leaning buildings, using shifted geometry to approach from angles that shouldn\'t exist. Doesn\'t speak. Doesn\'t make sound until close.',
        hp: 30, attributes: enemyAttrs(6), damage: 7, armorValue: 2,
        behavior: 'ambush', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'hoarded_salvage', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'rare_salvage', chance: 0.15, quantityRange: [1, 1] },
          { itemId: 'stalker_lore_scrap', chance: 0.2, quantityRange: [1, 1] },
        ],
        xpReward: 35,
      },
      {
        id: 'feral_dogs', name: 'Feral Dogs', level: 4,
        description: 'Deep ruins pack. Larger and more aggressive. They\'ve learned to avoid the stalkers — smart enough to be dangerous.',
        hp: 14, attributes: enemyAttrs(4), damage: 4, armorValue: 0,
        behavior: 'territorial', spawnChance: 0.4, count: [2, 3],
        drops: [],
        xpReward: 10,
      },
    ],
    objects: [
      { id: 'leaning_facades', name: 'leaning facades', examineText: 'Buildings tilted on their foundations. Subsidence — the ground beneath is hollow. Drainage tunnels, old infrastructure, maybe the Substrate. In fifty years they\'ll meet in the middle and the street will become a tunnel. The Fringe is sinking into the undercity. Or the undercity is rising.' },
      { id: 'art_deco_details', name: 'art deco details', examineText: 'Carved stone, metal scrollwork, a face above a doorway. Pre-war craftsmanship. Someone built this with pride. The moss growing from the stone face\'s eyes looks like tears. Probably not intentional. Effective anyway.' },
      { id: 'tilted_geometry', name: 'tilted geometry', examineText: 'Every angle is wrong. Door frames are parallelograms. Window sills slope. The floor inside visible ground-floor apartments tilts at three degrees — not enough to prevent walking, enough to make your brain insist something is fundamentally wrong.' },
      {
        id: 'subsidence_cracks', name: 'subsidence cracks',
        examineText: 'Cracks in the street surface. Deep — you can\'t see the bottom. Air rises from them, warm and humid.',
        gatedText: [{ attribute: 'GHOST', minimum: 4, text: 'GHOST ≥ 4: The 33hz hum is stronger here than anywhere else on the surface. The Substrate is close. The Fringe is thin. The boundary between surface and deep is failing.' }],
      },
      { id: 'dumping_site', name: 'dumping site', examineText: 'Behind a collapsed wall — drag marks. A clearing where someone was left. Helixion medical restraint fragments. An ID tag reader, smashed. Boot prints — uniform treads. They dumped someone here this week. This isn\'t random. This is a route.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 10. STALKER TERRITORY ─────────────────────────────────────────────────

  z04_r10: {
    id: 'z04_r10',
    zone: 'z04',
    name: 'STALKER TERRITORY',
    description:
`the buildings here have been modified. not repaired — modified.
doorways widened by force. walls broken through to create passages
that don't follow the original floor plans. furniture dragged into
piles that serve as barriers or nests or things you don't have a
word for.

the stalkers live here. three, maybe four — hard to count because
they move through the walls, through the holes they've made. they
were people. clothes reduced to rags. shoes worn to nothing. but
the eyes are wrong. the movement is wrong. they've adapted to the
ruins so completely that the ruins are part of them.

you shouldn't be here. they know you are.`,
    exits: [
      { direction: 'west', targetRoom: 'z04_r09', description: 'west (Deep Ruins)' },
      { direction: 'south', targetRoom: 'z04_r07', description: 'stalker trails lead down to the drainage access' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'ruin_stalker', name: 'Ruin Stalker', level: 7,
        description: 'Home ground. They use modified passages to flank, appear from holes in walls, retreat into spaces too small to follow. The highest-level enemies in the zone.',
        hp: 35, attributes: { ...enemyAttrs(7), BODY: 6, REFLEX: 6 }, damage: 9, armorValue: 3,
        behavior: 'ambush', spawnChance: 0.7, count: [3, 4],
        drops: [
          { itemId: 'hoarded_salvage', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'rare_salvage', chance: 0.2, quantityRange: [1, 1] },
          { itemId: 'stalker_lore_scrap', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 40,
      },
    ],
    objects: [
      { id: 'modified_walls', name: 'modified walls', examineText: 'Broken through with force — not tools. Bare hands. The edges of the holes are smoothed from repeated passage. These aren\'t escape routes. They\'re pathways. The stalkers rebuilt the interior space into a three-dimensional network that ignores floors, walls, and the concept of rooms.' },
      { id: 'nest_piles', name: 'nest piles', examineText: 'Furniture, clothing, debris dragged into mounds. Not random. Soft things in the center, hard things on the outside. They sleep here. The shapes are human-sized hollows. They still curl up. They still seek warmth.' },
      { id: 'stalker_evidence', name: 'stalker evidence', examineText: 'Shoes. Worn to nothing but still worn. A shirt, reduced to threads but not discarded. A belt buckle with initials — "R.M." Someone was R.M. The stalkers don\'t speak but they still dress. The ruin ate their minds. It didn\'t eat their habits.' },
      {
        id: 'stalker_watching', name: 'stalker watching',
        examineText: 'You feel observed. The shadows between the modified walls seem to shift.',
        gatedText: [{ attribute: 'GHOST', minimum: 5, text: 'GHOST ≥ 5: In the wall. A hole, shoulder-width. And in the hole — eyes. Reflecting what little light there is. Watching. Patient. It could attack. It hasn\'t. You are in its home and it\'s deciding what you are.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 11. THE HERMIT'S TOWER ───────────────────────────────────────────────

  z04_r11: {
    id: 'z04_r11',
    zone: 'z04',
    name: "THE HERMIT'S TOWER",
    description:
`a narrow tower — eight stories, standalone, the only building in
the deep ruins that stands perfectly vertical. not leaning. not
crumbling. someone has been maintaining it.

inside, the stairwell is intact. clean. every other step has a
small glow-stick wedged into the concrete — breadcrumbs leading
up. the tower smells like wood smoke and tea and dried herbs.

the top floor is one room. a 360-degree view of the fringe through
windows repaired with polymer sheeting. a wood-burning stove. a
bed. shelves of books — physical books, hundreds. a chair by the
window facing east, toward the city.

a man lives here. he's been here longer than anyone else in the
fringe.`,
    exits: [
      { direction: 'down', targetRoom: 'z04_r09', description: 'down (Deep Ruins)' },
      { direction: 'south', targetRoom: 'z04_r12', description: 'an overgrown path descends toward the courtyard' },
    ],
    npcs: [
      {
        id: 'kai', name: 'Kai', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'Sixties. Lean but not frail. Gray hair, tied back. Speaks slowly, precisely, like someone remembering how. Former city planner. Twenty years alone.',
        dialogue: "\"…you're here. That's unusual. Sit, if you want. I have tea. The books aren't for borrowing but I'll tell you what's in them if you ask.\"",
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'book_shelves', name: 'book shelves', examineText: 'Hundreds of books. Physical. Paper. He carried them here one at a time over twenty years. A shelf labeled "BEFORE" — the city\'s founding. A shelf labeled "DURING" — technical manuals for infrastructure he built. A shelf labeled "AFTER" has one book on it, handwritten, with no title.' },
      { id: 'window_view', name: 'window view', examineText: 'The Fringe spread below. The pattern of decay visible — outer ruins still recognizable as a city, deep ruins where buildings lean and streets disappear. The overpass, broken against the sky. East, beyond the blocks, the Helixion tower. Kai has been watching it for twenty years. He says it gets taller every year.' },
      { id: 'handwritten_book', name: 'handwritten book', examineText: 'The single book on the "AFTER" shelf. Handwritten, bound in salvaged leather. No title. First line: "The city I helped build is killing the people who live in it. This is my record of how." Twenty years of observation. The Fringe\'s decay documented by the man who designed what came before it.' },
      {
        id: 'floor_vibration', name: 'floor vibration',
        examineText: 'The tower floor vibrates. Faintly. Constantly.',
        gatedText: [{ attribute: 'GHOST', minimum: 3, text: 'GHOST ≥ 3: 33hz. The tower sits directly above a Substrate conduit. Kai built his home on a pulse point — not because he understood the frequency, but because it felt alive. He\'s been listening to the Substrate\'s heartbeat for two decades without knowing its name.' }],
      },
    ],
    isSafeZone: true,
    isHidden: true,
    hiddenRequirement: { attribute: 'GHOST', minimum: 5 },
  },

  // ── 12. OVERGROWN COURTYARD ──────────────────────────────────────────────

  z04_r12: {
    id: 'z04_r12',
    zone: 'z04',
    name: 'OVERGROWN COURTYARD',
    description:
`an apartment courtyard that nature reclaimed. buildings on four
sides, five stories each, but the courtyard itself has become a
garden. not cultivated. wild. trees pushed through paving stones.
ivy on the south-facing walls. grass knee-high where the
playground used to be.

the playground equipment is still here — swing set, climbing
frame, slide. rusted, overgrown, standing. a tree has grown
through the climbing frame, trunk threading between the bars.

this is the most beautiful place in the fringe. also the quietest.
nothing hunts here. the dogs don't come. the stalkers don't come.
something about this courtyard discourages intrusion. something
older than the mesh.

the 33hz hum is strong here. you feel it in the ground through
the soles of your shoes.`,
    exits: [
      { direction: 'northeast', targetRoom: 'z04_r09', description: 'northeast (Deep Ruins)' },
      { direction: 'south', targetRoom: 'z04_r13', description: 'south (Iron Bloom Entrance)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'playground_equipment', name: 'playground equipment', examineText: 'The swing set creaks in the wind. Chains intact — rusted but holding. If you push the swing, it moves. It\'s been waiting fifteen years. The climbing frame has a tree growing through it, trunk and metal merged. The tree didn\'t avoid the obstacle. It incorporated it. There\'s a lesson there.' },
      { id: 'wild_garden', name: 'wild garden', examineText: 'This isn\'t gardening. This is absence. Nobody planted these trees. Nobody cultivated the ivy. The courtyard was abandoned and nature returned. In a city managed by Helixion — every tree curated, every park designed — this is the only place where plants grow without permission.' },
      {
        id: 'ground_vibration', name: 'ground vibration',
        examineText: 'The earth hums. Stronger than anywhere on the surface. The trees grow faster here — rings visible where a trunk split are wider than they should be.',
        gatedText: [{ attribute: 'GHOST', minimum: 4, text: 'GHOST ≥ 4: The frequency creates a standing wave here — constructive interference that living things can feel. The dogs avoid it. The stalkers avoid it. You stand in it and feel calm for the first time since you woke up. The Substrate is close to the surface. The frequency accelerates growth. Life responds to it.' }],
      },
      { id: 'the_silence', name: 'the silence', examineText: 'Listen. No dogs. No stalkers. No wind. The courtyard is a pocket of stillness. The 33hz hum fills the space where sound should be — not noise, but presence. The most peaceful place in the game. And the emptiest.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 13. IRON BLOOM ENTRANCE ──────────────────────────────────────────────

  z04_r13: {
    id: 'z04_r13',
    zone: 'z04',
    name: 'IRON BLOOM ENTRANCE',
    description:
`a basement. beneath the southernmost building in the fringe — a
squat concrete structure that might have been a utility substation.
the entrance is a storm cellar door, heavy steel, hidden under
debris that looks natural until you realize it's arranged.

below: a reinforced room. bare concrete walls. a single light —
battery-powered, warm. a table. two chairs. a woman standing
against the wall with her arms crossed, evaluating you before
you've said a word.

this is the surface vetting point for iron bloom. the resistance
doesn't advertise. you find them because someone trusted you
enough to tell you where to look. if you found this place without
a referral, the woman at the wall has questions.`,
    exits: [
      { direction: 'north', targetRoom: 'z04_r12', description: 'north (Overgrown Courtyard)' },
      { direction: 'down', targetRoom: 'z12_r01', description: 'down (Iron Bloom Server Farm)', locked: true, lockId: 'iron_bloom_access', zoneTransition: true, targetZone: 'z12' },
    ],
    npcs: [
      {
        id: 'sable', name: 'Sable', type: 'QUESTGIVER',
        faction: 'IRON_BLOOM',
        description: 'Former Helixion security. Flat eyes. Assessing posture. She hasn\'t moved since you entered. Every sentence is a test.',
        dialogue: "\"Name. Who sent you. What you're carrying. In that order.\"",
        startingDisposition: -10,
        services: ['quest'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'vetting_room', name: 'vetting room', examineText: 'No decoration. No comfort. Two chairs, one table, one light. Designed for evaluation. The concrete walls are thick enough to contain sound. The single exit is behind Sable. Everything about this space says "you are not in control here."' },
      {
        id: 'the_passage_down', name: 'passage down',
        examineText: 'Behind the room, past a locked blast door: a stairway descending. Deeper than a normal basement.',
        gatedText: [{ attribute: 'GHOST', minimum: 4, text: 'GHOST ≥ 4: The 33hz hum is present. You\'re descending toward the deep infrastructure. Iron Bloom built their headquarters in the bones of the old city.' }],
      },
      { id: 'sable_evaluation', name: 'sable', examineText: 'She hasn\'t moved. Eyes tracked you down the stairs. Weight on her back foot — ready. Hands empty but her jacket sits wrong on the left side. She\'s armed. Always armed. She was Helixion security. She knows what she\'s protecting and what she\'s protecting it from.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },
};

// ── Zone 04 Definition ──────────────────────────────────────────────────────

export const ZONE_04: Zone = {
  id: 'z04',
  name: 'THE FRINGE',
  depth: 'surface',
  faction: 'NONE',
  levelRange: [2, 8],
  description: 'The old city. No power grid, no mesh, no maintenance. Collapsed buildings and people too stubborn to leave. The DISCONNECTED origin.',
  atmosphere: {
    sound: 'Wind through empty buildings. Creaking structures. Distant collapse. Dogs barking.',
    smell: 'Concrete dust. Mold. Wet plaster. Rain. Vegetation in the cracks.',
    light: 'Gray daylight only. No artificial light. Interior spaces are dark.',
    temp: 'Exposed to weather. Cold when wind blows. Warmer in sheltered ruins.',
  },
  rooms: Z04_ROOMS,
  originPoint: undefined,
};

// ── Zone 03: Industrial District ────────────────────────────────────────────

const Z03_ROOMS: Record<string, Room> = {

  // ── 1. THE WATERFRONT ──────────────────────────────────────────────────────

  z03_r01: {
    id: 'z03_r01',
    zone: 'z03',
    name: 'THE WATERFRONT',
    description:
`The city ends here. A broad concrete embankment runs along
the waterline — cracked, stained with chemical residue,
studded with rusted bollards and mooring hooks. The water
is the color of spent coolant: gray-green, opaque, with
an oily film that catches the light in sick rainbows.

Fog rolls in from the water most mornings and hangs between
the warehouse buildings until the factories heat up enough
to burn it off. The air tastes like salt and sulfur.

To the north, cargo cranes stand against the sky. To the
west, the factory sprawl begins. South along the embankment,
runoff channels drain factory waste into the water in
streams of yellow and orange.`,
    exits: [
      { direction: 'north', targetRoom: 'z03_r02', description: 'north (Cargo Docks)' },
      { direction: 'west', targetRoom: 'z03_r09', description: 'west (Wolf Garage)' },
      { direction: 'south', targetRoom: 'z03_r04', description: 'south (Runoff Channel)' },
    ],
    npcs: [
      {
        id: 'dock_workers', name: 'Dock Workers', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Manual laborers. Mesh-compliant, too busy and too tired to care about anything except the next shift.',
        dialogue: "A man eating from a tin container glances at you with the professional disinterest of someone who's learned not to notice things.",
        startingDisposition: 0,
      },
    ],
    enemies: [
      {
        id: 'dock_scavenger_waterfront', name: 'Dock Scavenger', level: 4,
        description: 'Desperate. Armed with improvised weapons. Picks through what washes up. Skittish during the day — attacks the wounded or outnumbered.',
        hp: 14, attributes: enemyAttrs(4), damage: 3, armorValue: 1,
        behavior: 'passive', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'scrap_metal', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'improvised_weapon', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'fringe_salvage', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 18,
      },
    ],
    objects: [
      { id: 'waterline', name: 'waterline', examineText: 'The water shouldn\'t be this color. Chemical runoff from twenty years of industrial processing. Nothing lives in it. Nothing has lived in it for a decade.' },
      { id: 'mooring_hooks', name: 'mooring hooks', examineText: 'Rusted solid. Some of these berths haven\'t held a ship in years. The active berths are further north at the Cargo Docks.' },
      { id: 'lunch_tins', name: 'lunch tins', examineText: 'Synth-protein and rice. One of the dock workers has a real tomato — stands out like a gemstone against the gray. He eats it slowly. Real food is currency out here.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 2. CARGO DOCKS ────────────────────────────────────────────────────────

  z03_r02: {
    id: 'z03_r02',
    zone: 'z03',
    name: 'CARGO DOCKS',
    description:
`The active section of the waterfront. Cargo cranes tower
overhead, automated arms swinging containers from ship to
shore. Stacks of shipping containers form corridors and
canyons — metal walls in faded colors, labels in languages
from places you've never been.

A workforce of fifty moves through the yard in high-vis
vests, guided by mesh-integrated logistics. Every container
has a destination. The system doesn't ask what's inside the
containers marked with Helixion's logo and a classification
code that doesn't appear in any public manifest.

A supervisor's office sits elevated on a gantry, overlooking
the yard. Lights on. Someone's watching.`,
    exits: [
      { direction: 'south', targetRoom: 'z03_r01', description: 'south (The Waterfront)' },
      { direction: 'west', targetRoom: 'z03_r05', description: 'west (Factory Row)' },
      { direction: 'east', targetRoom: 'z03_r03', description: 'east (Salvage Yard)' },
      { direction: 'up', targetRoom: 'z03_r14', description: 'up (Dock Boss Office)' },
    ],
    npcs: [
      {
        id: 'dock_laborers', name: 'Dock Laborers', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'On the clock. Won\'t stop to talk unless it\'s between shifts. They know which containers are restricted.',
        dialogue: "\"Can't talk. Shift runs until six. Come back then. Or don't.\"",
        startingDisposition: 0,
      },
    ],
    enemies: [
      {
        id: 'dock_scavenger_docks', name: 'Dock Scavenger', level: 5,
        description: 'Night spawn. The scavengers hit the cargo yard after dark, trying to crack containers before security loops back.',
        hp: 18, attributes: enemyAttrs(5), damage: 4, armorValue: 1,
        behavior: 'passive', spawnChance: 0.4, count: [2, 3],
        drops: [
          { itemId: 'scrap_metal', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'improvised_weapon', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'fringe_salvage', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 20,
      },
      {
        id: 'corporate_security_docks', name: 'Corporate Security', level: 7,
        description: 'Private military contractor. Patrols the Helixion container section. Protects the containers, not the workers.',
        hp: 32, attributes: { ...enemyAttrs(7), REFLEX: 5 }, damage: 8, armorValue: 5,
        behavior: 'patrol', spawnChance: 0.3, count: [1, 1],
        drops: [
          { itemId: 'milspec_sidearm', chance: 0.15, quantityRange: [1, 1] },
          { itemId: 'security_keycard_basic', chance: 0.2, quantityRange: [1, 1] },
          { itemId: 'ballistic_vest_helixion', chance: 0.1, quantityRange: [1, 1] },
        ],
        xpReward: 50,
      },
    ],
    objects: [
      { id: 'helixion_containers', name: 'helixion containers', examineText: 'Matte gray, Helixion logo, classification code HX-7C. The manifest system doesn\'t list contents — just \'PRIORITY INFRASTRUCTURE COMPONENTS.\' TECH ≥ 6: The containers communicate with a dedicated satellite uplink. Whatever\'s inside, Helixion tracks it from orbit. INT ≥ 7: The delivery schedule matches the Broadcast Tower construction timeline.' },
      { id: 'cargo_cranes', name: 'cargo cranes', examineText: 'Automated. The arms swing on pre-programmed routes. Each container weighs tons and the cranes move them like playing cards. TECH ≥ 5: The automation algorithm is Helixion-designed. The cranes prioritize HX-coded containers. Everything else waits.' },
      { id: 'manifest_terminal', name: 'manifest terminal', examineText: 'Shipping records. Most containers are mundane — raw materials, consumer goods, food supplies. TECH ≥ 6: The HX-7C containers have arrival dates but no origin ports listed. They come from nowhere. Fifteen have arrived in the last month. The frequency is increasing.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 3. SALVAGE YARD ───────────────────────────────────────────────────────

  z03_r03: {
    id: 'z03_r03',
    zone: 'z03',
    name: 'SALVAGE YARD',
    description:
`South of the main docks, where the embankment curves into a
shallow bay. Wreckage, industrial waste, things that fell off
ships and were never claimed. The deposit has been formalized
into a salvage operation — a fenced acre of sorted metal,
electronics, machine parts, and unidentifiable debris.

The yard is technically legal. The dock authority tolerates it
because the scavengers keep the waterline clear. In practice
it's a marketplace for anything too stolen, too broken, or
too questionable to sell through normal channels.

A man with a cutting torch is dismantling something that used
to be a security drone. The Helixion logo on its chassis has
been partially ground off. He doesn't look up.`,
    exits: [
      { direction: 'north', targetRoom: 'z03_r02', description: 'north (Cargo Docks)' },
      { direction: 'west', targetRoom: 'z03_r05', description: 'a gap in the chain-link leads to factory row' },
    ],
    npcs: [
      {
        id: 'salvage_workers', name: 'Salvage Workers', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'Independent operators. 2-3 present. Buy, sell, trade salvage. Low-tier gear at low prices.',
        dialogue: "\"You buying or selling? Either way, don't touch the weird bin.\"",
        startingDisposition: 0,
        services: ['shop'],
      },
    ],
    enemies: [
      {
        id: 'dock_scavenger_yard', name: 'Dock Scavenger', level: 5,
        description: 'Territorial over prime salvage spots. Will fight if you start taking high-value scrap without buying.',
        hp: 18, attributes: enemyAttrs(5), damage: 4, armorValue: 1,
        behavior: 'territorial', spawnChance: 0.4, count: [2, 3],
        drops: [
          { itemId: 'scrap_metal', chance: 0.6, quantityRange: [1, 3] },
          { itemId: 'improvised_weapon', chance: 0.25, quantityRange: [1, 1] },
          { itemId: 'fringe_salvage', chance: 0.4, quantityRange: [1, 2] },
        ],
        xpReward: 20,
      },
      {
        id: 'feral_augment_yard', name: 'Feral Augment', level: 5,
        description: 'Wanders in from the southern ruins. Attracted by the metal and the noise.',
        hp: 20, attributes: { ...enemyAttrs(5), BODY: 5, REFLEX: 4 }, damage: 5, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0.25, count: [1, 1],
        drops: [
          { itemId: 'damaged_implant', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'scrap_cyberware', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 28,
      },
    ],
    objects: [
      { id: 'drone_chassis', name: 'drone chassis', examineText: 'Helixion security drone. Pulled from the water or shot down — hard to tell. The man with the torch is stripping its targeting array. TECH ≥ 5: The serial links to campus perimeter inventory. This drone was active three weeks ago.' },
      { id: 'salvage_piles', name: 'salvage piles', examineText: 'Metal sorted by type: ferrous in one pile, aluminum in another, copper carefully coiled. Electronics sorted by condition: working, repairable, components-only. A bin labeled \'WEIRD\' contains items nobody can identify.' },
      { id: 'weird_bin', name: 'weird bin', examineText: 'The black fluid is warm. Not body-warm — fever-warm. It moves when you tilt the tube, slower than liquid should. GHOST ≥ 5: The chip in the bin hums at 33hz. It\'s a fragment of a neural lattice. Not Helixion\'s — older. Someone dredged this from the deep water.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 4. RUNOFF CHANNEL ─────────────────────────────────────────────────────

  z03_r04: {
    id: 'z03_r04',
    zone: 'z03',
    name: 'RUNOFF CHANNEL',
    description:
`A concrete channel running from the factory district to the
waterfront, carrying the effluent of Helixion's manufacturing
process. The liquid is the wrong color — yellow-orange,
viscous, steaming faintly in the cooler air. The smell is
sharp enough to make your eyes water from ten meters away.

The channel is three meters wide and two deep. Metal grating
bridges it at intervals. At the base, the runoff feeds into a
larger drainage pipe that descends underground — the connection
to the Industrial Drainage system and eventually the tunnels
where the Parish lives.

The concrete walls are stained permanently. Chemical etchings
that almost look like writing. Almost.

A dead feral augment lies at the channel's edge. It tried
to drink the water. That was a mistake.`,
    exits: [
      { direction: 'north', targetRoom: 'z03_r01', description: 'north (The Waterfront)' },
      { direction: 'down', targetRoom: 'z10_r01', description: 'down (Industrial Drainage)', zoneTransition: true, targetZone: 'z10' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'feral_augment_runoff', name: 'Feral Augment', level: 6,
        description: 'Drawn to the chemical warmth of the runoff. Aggressive, disoriented by the fumes.',
        hp: 24, attributes: { ...enemyAttrs(6), BODY: 5, REFLEX: 4 }, damage: 6, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'damaged_implant', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'scrap_cyberware', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 30,
      },
    ],
    objects: [
      { id: 'runoff_liquid', name: 'runoff liquid', examineText: 'Don\'t touch it. TECH ≥ 4: cadmium, chromium compounds, and something synthetic that doesn\'t match any known industrial byproduct. This is what Helixion\'s factories produce as waste. This is what filters down to the Parish.' },
      { id: 'chemical_etchings', name: 'chemical etchings', examineText: 'The runoff has carved patterns into the concrete over years. Branching, fractal, like river deltas or neural pathways. GHOST ≥ 6: They\'re not random. The chemical reactions follow the same substrate patterns that run beneath the city. The runoff is toxic — but the stone underneath remembers what it used to be.' },
      { id: 'dead_augment', name: 'dead augment', examineText: 'Face-down at the channel\'s edge. Hands blistered where they touched the liquid. Augmented arm gone from chrome to green. Whatever they were before Helixion, whatever they were after, they ended here, thirsty enough to drink poison.' },
      { id: 'drainage_pipe', name: 'drainage pipe', examineText: 'The channel narrows into a large pipe descending at a steep angle. You can hear the liquid echoing below — falling for a long time. This feeds the Industrial Drainage system. Everything Helixion pours out up here ends up in the tunnels where people live.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 5. FACTORY ROW ────────────────────────────────────────────────────────

  z03_r05: {
    id: 'z03_r05',
    zone: 'z03',
    name: 'FACTORY ROW',
    description:
`A wide industrial boulevard lined with factory buildings.
The road surface is heavy-duty composite, scarred by years
of cargo vehicles. To the east, active factories hum — lit,
guarded, smoke rising from stacks. To the west, dead
factories stand dark — windows broken, gates chained, the
machinery inside visible through gaps like bones through skin.

The contrast is the district in miniature. Helixion keeps
half the infrastructure alive because it needs it. The other
half rots because it doesn't. The Chrome Wolves live in the
gap between the two.

A Wolf patrol — three augmented figures on modified
motorcycles — rolls down the boulevard at walking speed.
They're not looking for trouble. They're showing the flag.`,
    exits: [
      { direction: 'north', targetRoom: 'z02_r11', description: 'north (Residential Blocks — Transit Station)', zoneTransition: true, targetZone: 'z02' },
      { direction: 'south', targetRoom: 'z03_r02', description: 'south (Cargo Docks)' },
      { direction: 'east', targetRoom: 'z03_r06', description: 'east (Active Factory)' },
      { direction: 'west', targetRoom: 'z03_r07', description: 'west (Dead Factory)' },
    ],
    npcs: [
      {
        id: 'factory_workers', name: 'Factory Workers', type: 'NEUTRAL',
        faction: 'HELIXION',
        description: 'Shift workers heading to or from the active factories. Mesh-compliant, tired, carrying lunch pails.',
        dialogue: "One of them nods. The others don't. Nobody talks near the Wolves.",
        startingDisposition: 0,
      },
    ],
    enemies: [
      {
        id: 'chrome_wolves_patrol', name: 'Chrome Wolves Patrol', level: 7,
        description: 'On motorcycles. Not hostile by default — they patrol and observe. If the player\'s Chrome Wolves disposition is Hostile, they engage. Otherwise they nod and pass.',
        hp: 30, attributes: { ...enemyAttrs(7), BODY: 6, REFLEX: 5, COOL: 5 }, damage: 7, armorValue: 4,
        behavior: 'patrol', spawnChance: 0.6, count: [2, 3],
        drops: [
          { itemId: 'wolf_token', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'chrome_components', chance: 0.25, quantityRange: [1, 1] },
          { itemId: 'creds_pouch', chance: 0.5, quantityRange: [10, 20] },
        ],
        xpReward: 45,
      },
    ],
    objects: [
      { id: 'active_factories', name: 'active factories', examineText: 'Lit up. Running. The nearest one has HELIXION MANUFACTURING — DIVISION 7 on the gate. Behind the fence: loading bays, smokestacks, the hum of heavy machinery. Corporate security patrols the perimeter.' },
      { id: 'dead_factories', name: 'dead factories', examineText: 'Dark. Chained gates, broken windows, graffiti. The Chrome Wolves\' territory starts where the chain-link ends. Some buildings have been converted — welding light through windows, music, cooking. Others are truly dead.' },
      { id: 'wolf_motorcycles', name: 'wolf motorcycles', examineText: 'Modified. Heavy frames, augmented engines. The riders\' augmentations match their bikes — chrome arms, enhanced optics, the kind of body modification that says \'I chose this.\' Augmentation is identity, not compromise.' },
      { id: 'road_scars', name: 'road scars', examineText: 'Composite road surface gouged by years of heavy vehicles. Some scars fresh — cargo trucks. Some old — tracks from machines that no longer exist, leading to factories that no longer run. The road remembers everything.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 6. ACTIVE FACTORY ─────────────────────────────────────────────────────

  z03_r06: {
    id: 'z03_r06',
    zone: 'z03',
    name: 'ACTIVE FACTORY',
    description:
`HELIXION MANUFACTURING — DIVISION 7. The fence is three
meters of reinforced chain-link topped with sensor wire.
The gate is manned by corporate security in tactical gear
— private military contractors. Cheaper than campus
enforcers. Less augmented. Still armed enough to kill you.

Inside the fence: a loading bay, a parking lot, and the
factory building itself — massive concrete, no ground-floor
windows. Narrow observation slits on the upper level glow
blue-white. Smokestacks exhale thin gray-white vapor. The
air near the building tastes metallic.

Workers enter through biometric turnstiles. They don't exit
during shift. Eight-hour rotations. What they build inside,
they can't discuss — the mesh doesn't let them form the words.`,
    exits: [
      { direction: 'west', targetRoom: 'z03_r05', description: 'west (Factory Row)' },
      { direction: 'in', targetRoom: 'z03_r12', description: 'in (Foreman\'s Office) — requires keycard or escort' },
    ],
    npcs: [
      {
        id: 'factory_shift_workers', name: 'Shift Workers', type: 'NEUTRAL',
        faction: 'HELIXION',
        description: 'Factory-grade mesh suppression. They can talk about their commute, their lunch, the weather. They cannot talk about their work.',
        dialogue: "\"Work is— it's— the weather's been cold lately.\" The sentence starts and then changes. They don't notice.",
        startingDisposition: 0,
      },
    ],
    enemies: [
      {
        id: 'corporate_security_factory', name: 'Corporate Security', level: 8,
        description: 'Patrol the fence perimeter. Will engage if the player enters without authorization. Won\'t chase beyond the fence line.',
        hp: 38, attributes: { ...enemyAttrs(8), REFLEX: 6 }, damage: 9, armorValue: 5,
        behavior: 'patrol', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'milspec_sidearm', chance: 0.15, quantityRange: [1, 1] },
          { itemId: 'security_keycard_basic', chance: 0.2, quantityRange: [1, 1] },
          { itemId: 'ballistic_vest_helixion', chance: 0.1, quantityRange: [1, 1] },
        ],
        xpReward: 55,
      },
    ],
    objects: [
      { id: 'biometric_turnstile', name: 'biometric turnstile', examineText: 'Full scan — retinal, neural signature, mesh compliance check. TECH ≥ 7: The scanner also performs a real-time memory audit. If a worker has formed specific memories about the production process since their last scan, those memories are flagged for mesh suppression. They forget what they built before they get home.' },
      { id: 'smokestacks', name: 'smokestacks', examineText: 'Thin vapor. Not traditional combustion exhaust. TECH ≥ 6: The chemical signature includes aerosolized neural paste byproducts. Whatever they\'re building, it interfaces with human neurology.' },
      { id: 'observation_windows', name: 'observation windows', examineText: 'Narrow slits. Blue-white light. You can\'t see inside from this angle. But you can hear something through the walls — not machinery. A hum. Low, steady. GHOST ≥ 5: 33hz. The factory is resonating. The production process uses the frequency.' },
      { id: 'security_checkpoint', name: 'security checkpoint', examineText: 'Helixion perimeter patrol station. Two guards, a barrier arm, camera coverage. The checkpoint has been edging further into the street — twenty meters past the fence line. Into wolf territory. TECH ≥ 7: The camera network links to campus security. Destroying this checkpoint blinds them. Hacking it shows them ghosts.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 7. DEAD FACTORY ───────────────────────────────────────────────────────

  z03_r07: {
    id: 'z03_r07',
    zone: 'z03',
    name: 'DEAD FACTORY',
    description:
`One of a dozen factories that stopped running when Helixion
consolidated manufacturing. The gate is open — chain cut
years ago. Loading bay doors hang at angles. Inside: a
cavernous floor of silent machinery, conveyor belts frozen
mid-transport, control panels dark.

The Chrome Wolves have claimed the perimeter but not the
interior. The interior belongs to whatever's still moving
inside — factory automata never deactivated, running their
last program on emergency battery. The sound of their
servos echoing in the dark is the loneliest noise in the
district.

Tools and salvage are scattered near the entrance — Wolf
scouts strip what they can from the accessible areas.
The deeper sections haven't been cleared.`,
    exits: [
      { direction: 'east', targetRoom: 'z03_r05', description: 'east (Factory Row)' },
      { direction: 'west', targetRoom: 'z03_r10', description: 'west (The Wolf Den)' },
      { direction: 'in', targetRoom: 'z03_r08', description: 'in (Automata Floor)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'chrome_wolves_scout', name: 'Chrome Wolves Scout', level: 7,
        description: 'Working the perimeter, stripping salvage. Not hostile if Wolf disposition is Neutral or better.',
        hp: 28, attributes: { ...enemyAttrs(7), REFLEX: 5, COOL: 5 }, damage: 6, armorValue: 3,
        behavior: 'territorial', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'salvage', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'wolf_token', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 40,
      },
      {
        id: 'feral_augment_factory', name: 'Feral Augment', level: 6,
        description: 'Lurking in the deeper sections near the automata.',
        hp: 24, attributes: { ...enemyAttrs(6), BODY: 5, REFLEX: 4 }, damage: 6, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0.3, count: [1, 1],
        drops: [
          { itemId: 'damaged_implant', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'scrap_cyberware', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 30,
      },
    ],
    objects: [
      { id: 'frozen_machinery', name: 'frozen machinery', examineText: 'Assembly equipment for — checking the old signage — consumer electronics. Before Helixion pivoted to neural technology, this factory made things that plugged into walls, not brains. The production line is a fossil.' },
      { id: 'wolf_salvage', name: 'wolf salvage', examineText: 'The Wolves strip copper, circuit boards, servo motors, anything repurposable. Efficient and organized — labeled containers, sorted materials. They run their operation like a business. Because it is one.' },
      { id: 'automata_sounds', name: 'automata sounds', examineText: 'Listen. Deeper in the building — the click-whir of robotic arms cycling through assembly motions. The hiss of pneumatic grippers closing on nothing. They\'re building ghosts. Emergency batteries have kept them going for years. Nobody turned them off because nobody knows how.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 8. AUTOMATA FLOOR ─────────────────────────────────────────────────────

  z03_r08: {
    id: 'z03_r08',
    zone: 'z03',
    name: 'AUTOMATA FLOOR',
    description:
`The deep interior of the dead factory. Emergency lighting
casts everything in red. The production line stretches the
length of the building — and every station is active.

Robotic arms swing and grip and place and weld, performing
the exact sequence they were doing when the power was cut
years ago. Emergency batteries keep the servos alive. The
arms assemble nothing — grippers close on empty air, welders
fire at bare conveyor belt, quality scanners check products
that don't exist.

Some automata have degraded. Movements jerky, off-axis. A
welding arm fires its torch at the ceiling. One unit has
torn itself from its mounting and drags itself along the
floor by one arm, still trying to reach its station.

They're dangerous because they don't know you're here and
they don't care. You're an obstacle between them and a task
they'll never complete.`,
    exits: [
      { direction: 'out', targetRoom: 'z03_r07', description: 'out (Dead Factory)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'industrial_automaton', name: 'Industrial Automaton', level: 7,
        description: 'Running programs. Attacks because you enter their operational radius, not because they choose to. Predictable patterns. High damage. TECH ≥ 6 can deactivate individuals.',
        hp: 40, attributes: { ...enemyAttrs(7), BODY: 7, TECH: 1 }, damage: 10, armorValue: 5,
        behavior: 'aggressive', spawnChance: 0.8, count: [3, 4],
        drops: [
          { itemId: 'servo_core', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'power_cell_depleted', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'salvage', chance: 0.3, quantityRange: [1, 2] },
        ],
        xpReward: 35,
      },
    ],
    objects: [
      { id: 'control_panel', name: 'control panel', examineText: 'Master control for the production line. Dark — main power is cut. But the emergency override is still active. TECH ≥ 9: You can interface and send a shutdown command to all units. The floor goes quiet for the first time in years. The silence is louder than the machines.' },
      { id: 'dragging_automaton', name: 'dragging automaton', examineText: 'It tore itself free from its mounting. Base plate still attached to the floor, bolts sheared. It drags itself with one arm, the other hanging useless, trailing sparks. It\'s trying to reach station 14. It will never reach station 14. It will try until its battery dies. GHOST ≥ 4: You feel something. Not the frequency. Something simpler. Sympathy.' },
      { id: 'emergency_batteries', name: 'emergency batteries', examineText: 'Industrial-grade power cells. Running for years on reserve. Worth significant CREDS if salvaged — the Wolves would pay well. Removing them kills the automata. The factory finally stops. Is that mercy or murder? They\'re machines. It shouldn\'t matter. It does.' },
      { id: 'loot_cache', name: 'loot cache', examineText: 'A worker\'s locker behind station 14. Inside: a photograph, a data chip with a goodbye message to someone named \'Eli,\' and a high-quality toolkit. The last worker on this line left their things behind. The automaton is trying to deliver them to a station nobody will ever staff again.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 9. WOLF GARAGE ────────────────────────────────────────────────────────

  z03_r09: {
    id: 'z03_r09',
    zone: 'z03',
    name: 'WOLF GARAGE',
    description:
`A converted warehouse where the Chrome Wolves maintain
their vehicles and do first-line augmentation work. Roll-up
doors open onto the waterfront side. Inside: motorcycles in
various states of assembly, welding stations, a hydraulic
lift with a truck on it, and the constant sound of metal
being shaped by people who love metal.

The Wolves here are mechanics first. Their chrome isn't just
combat augmentation — it's art. Modified arms with custom
engraving. Optical implants with aesthetic irises. They
modify themselves the way they modify their machines:
constantly, deliberately, with pride.

The air smells like motor oil, hot metal, and the ozone
signature of active cyberware. Music plays from a speaker
bolted to the ceiling — heavy, rhythmic, the bass shaking
the tools on the workbenches.`,
    exits: [
      { direction: 'east', targetRoom: 'z03_r01', description: 'east (The Waterfront)' },
      { direction: 'north', targetRoom: 'z03_r10', description: 'north (The Wolf Den)' },
    ],
    npcs: [
      {
        id: 'wolf_mechanics', name: 'Wolf Mechanics', type: 'NEUTRAL',
        faction: 'CHROME_WOLVES',
        description: 'Chrome Wolves faction. 3-4 present. Neutral if disposition ≥ 0. Talk about machines, augmentation, Wolf philosophy.',
        dialogue: "\"My body, my blueprint. That's the creed. You want to understand the Wolves? Start there.\"",
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      { id: 'motorcycle_line', name: 'motorcycle line', examineText: 'Eight machines in various stages. The closest is stripped to the frame — engine out, being rebuilt with salvaged Helixion power cells. The furthest is complete: matte black, low-slung, engine housing engraved with a wolf skull. Every machine is unique. Mass production is what Helixion does. The Wolves make things by hand.' },
      { id: 'hydraulic_lift', name: 'hydraulic lift', examineText: 'A cargo truck on the lift. Undercarriage modified — concealed compartment large enough for four people, lined with mesh-dampening material. A smuggling vehicle.' },
      { id: 'custom_chrome', name: 'custom chrome', examineText: 'A workbench covered in augmentation components — fingers, wrist joints, optical lenses. Each hand-finished. One forearm assembly has been engraved: \'MY BODY, MY BLUEPRINT.\' The Wolves\' creed.' },
      { id: 'music_speaker', name: 'music speaker', examineText: 'Bolted to a ceiling beam. The bass is physical — you feel it in your chest. The Wolves work to music the way other people work to silence. The rhythm matches their hammer strikes. The garage runs on beat.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 10. THE WOLF DEN ──────────────────────────────────────────────────────

  z03_r10: {
    id: 'z03_r10',
    zone: 'z03',
    name: 'THE WOLF DEN',
    description:
`The largest of the dead factories, fully converted. The
exterior is reinforced — welded steel plates over the original
walls, firing positions cut into the upper level, the Helixion
logo on the smokestack replaced with a spray-painted wolf
skull the size of a car.

Inside: a community. The factory floor divided into zones —
common area with tables and cooking stations, workshop wing,
sleeping quarters in the old offices, a raised platform at
the far end where the pack's leadership holds court.
Everything industrial-aesthetic by choice, not poverty.

Fifty to sixty Chrome Wolves live and operate from the Den.
The air smells like grilled meat, engine grease, and ozone.
Someone is always working. Someone is always eating. Someone
is always sparring in the corner. The Den never sleeps.`,
    exits: [
      { direction: 'east', targetRoom: 'z03_r07', description: 'east (Dead Factory)' },
      { direction: 'south', targetRoom: 'z03_r09', description: 'south (Wolf Garage)' },
      { direction: 'north', targetRoom: 'z03_r11', description: 'north (Ripperdoc Clinic)' },
      { direction: 'west', targetRoom: 'z03_r15', description: 'west (District Border)' },
    ],
    npcs: [
      {
        id: 'chrome_wolves_members', name: 'Chrome Wolves', type: 'NEUTRAL',
        faction: 'CHROME_WOLVES',
        description: 'Faction. 6-8 present. Sparring, cooking, repairing gear, playing cards. Loud, physical, direct.',
        dialogue: "A Wolf looks you over. \"New face. You here for work or just passing through? Don't lie.\"",
        startingDisposition: 0,
      },
      {
        id: 'voss', name: 'Voss', type: 'QUESTGIVER',
        faction: 'CHROME_WOLVES',
        description: 'Wolf Lieutenant. Massive augmentation — both arms chrome, targeting optic, subdermal armor. Speaks in short sentences. Means every word.',
        dialogue: "\"Talk is cheap. Chrome isn't. Show me what you're made of — literally — and we'll see if there's a conversation worth having.\"",
        startingDisposition: 0,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'welded_throne', name: 'welded throne', examineText: 'Motorcycle frames welded into a seat. Not comfortable — that\'s the point. The command position in the Wolf pack isn\'t a reward. It\'s a station. Voss sits in it like she was built for it. She probably was.' },
      { id: 'sparring_corner', name: 'sparring corner', examineText: 'Two Wolves fighting bare-knuckle with augmented arms. The impacts sound like car crashes. They\'re grinning. One lands a hit that cracks a wall tile and they both laugh. This is how the Wolves calibrate.' },
      { id: 'wolf_banner', name: 'wolf banner', examineText: 'A flag above the platform: matte black, wolf skull in chrome paint, the words \'MY BODY, MY BLUEPRINT.\' Tattooed, engraved, or painted on nearly every Wolf in the Den. Not a motto. An oath.' },
      { id: 'cooking_stations', name: 'cooking stations', examineText: 'Real meat on a grill made from a factory press. The Wolves eat well — actual food, not synthesized. They cook in the open and share without asking. You\'re either pack or you\'re not. If you are, you eat.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 11. RIPPERDOC CLINIC ──────────────────────────────────────────────────

  z03_r11: {
    id: 'z03_r11',
    zone: 'z03',
    name: 'RIPPERDOC CLINIC',
    description:
`A converted factory office suite, three rooms deep. The
front room is a waiting area — metal chairs, a table with
old magazines nobody reads, a sign that says "NO REFUNDS"
in three languages. The middle room is prep — sterilization,
cyberware components in labeled drawers, diagnostics.

The back room is the operating theater. A surgical chair
under industrial work lights. Nerve threaders, bone anchors,
neural sync calibrators. The chair has restraint straps.
Not for control. For when the pain reflex kicks and the
patient tries to leave mid-procedure.

A woman in surgical scrubs and a leather apron is cleaning
tools. Her own augmentations are subtle — you'd miss them
if you weren't looking. Her left hand has too many degrees
of articulation.`,
    exits: [
      { direction: 'south', targetRoom: 'z03_r10', description: 'south (The Wolf Den)' },
      { direction: 'east', targetRoom: 'z03_r07', description: 'service tunnel to the dead factory' },
    ],
    npcs: [
      {
        id: 'dr_costa', name: 'Dr. Rin Costa', type: 'SHOPKEEPER',
        faction: 'CHROME_WOLVES',
        description: 'Ripperdoc. Forties. Precise. Former Helixion biomedical engineer. Operates under Wolf protection.',
        dialogue: "\"Sit down. Shirt off. Let me see what they did to you before I decide what I can do for you.\"",
        startingDisposition: 5,
        services: ['shop', 'heal'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'cyberware_drawers', name: 'cyberware drawers', examineText: 'Labeled, organized, temperature-controlled. Fingers, eyes, subdermal plating, reflex enhancers. Catalogued with source notes — some Wolf salvage, some Freemarket imports, some Helixion. Serial numbers that match campus inventory. Stolen. Every piece of chrome in this drawer used to be inside someone Helixion owned.' },
      { id: 'surgical_chair', name: 'surgical chair', examineText: 'Industrial. Leather worn smooth. Restraint straps adjustable. Neural contact array in the headrest — she monitors brain activity during installation. Pain management: a local anesthetic injector and a bite guard. She apologizes for the bite guard. It\'s necessary.' },
      { id: 'dr_costa_augments', name: 'dr costa\'s hands', examineText: 'Her hands. The articulation is wrong — too many joints, too precise. She can rotate her fingers independently on axes human fingers don\'t have. Surgical augmentation designed for surgical augmentation. She modified herself to be better at modifying others.' },
      { id: 'no_refunds_sign', name: 'no refunds sign', examineText: '\'NO REFUNDS.\' Three languages. She means it. The sign is old. Beneath it, someone scratched: \'But she\'s never needed to offer one.\'' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 12. FOREMAN'S OFFICE ──────────────────────────────────────────────────

  z03_r12: {
    id: 'z03_r12',
    zone: 'z03',
    name: "FOREMAN'S OFFICE",
    description:
`Ground floor, past the turnstile, through a corridor of
industrial gray. The foreman's office is glass-walled,
overlooking the factory floor through observation windows
with blinds always half-closed. Inside: a desk buried in
production schedules, a coffee machine running since morning,
and a man who looks like he hasn't slept properly in months.

The view through the window shows the factory floor —
automated assembly arms, conveyor systems, workers in
clean-room suits performing tasks the glass muffles into
pantomime. What they're assembling is not immediately
identifiable. Components. Modular. Designed to connect
in sequences that look biological.`,
    exits: [
      { direction: 'out', targetRoom: 'z03_r06', description: 'out (Active Factory)' },
      { direction: 'in', targetRoom: 'z03_r13', description: 'in (Assembly Line) — restricted' },
    ],
    npcs: [
      {
        id: 'brenn', name: 'Karl Brenn', type: 'QUESTGIVER',
        faction: 'HELIXION',
        description: 'Factory foreman. Fifties. Big hands, quiet voice. Scared. He knows what they\'re building. The mesh won\'t let him say it.',
        dialogue: "\"I can't— the words don't— give me a minute.\"",
        startingDisposition: -15,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'production_schedules', name: 'production schedules', examineText: 'Stacked on the desk. Numbers, timelines, component codes. TECH ≥ 6: The production rate has doubled in three months. Whatever the factory is building, Helixion wants it faster. The schedule for next month is blank — marked only \'FINAL ASSEMBLY.\'' },
      { id: 'coffee_machine', name: 'coffee machine', examineText: 'Running since morning. The pot is half-full of something that used to be coffee. Brenn drinks it because it\'s the only thing the mesh doesn\'t regulate.' },
      { id: 'observation_window', name: 'observation window', examineText: 'The factory floor through half-closed blinds. Workers in clean-room suits at stations. Automated arms handling the large pieces. The workers do the fine connections — neural-grade circuitry that machines aren\'t delicate enough to handle.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 13. ASSEMBLY LINE ─────────────────────────────────────────────────────

  z03_r13: {
    id: 'z03_r13',
    zone: 'z03',
    name: 'ASSEMBLY LINE',
    description:
`The factory floor. Clean-room environment — filtered air,
controlled humidity, precision equipment humming. Workers
in sealed suits perform tasks at stations along a conveyor.
Automated arms handle heavy assembly. The workers do fine
work — connecting neural-grade circuitry machines aren't
delicate enough to handle.

On the conveyor: components. Each one a curved panel, roughly
a meter long, covered in neural resonance amplification
circuitry. They look like scales. Or feathers. Or the
segments of a spine. Hundreds of them, tested, calibrated,
packed into matte-gray containers.

HX-7C.

This is what's inside the containers. This is what the
Broadcast Tower is made of.`,
    exits: [
      { direction: 'out', targetRoom: 'z03_r12', description: 'out (Foreman\'s Office)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'corporate_security_assembly', name: 'Corporate Security', level: 9,
        description: 'Interior guards. Better equipped than perimeter. If the player is here without authorization, they engage and trigger factory lockdown.',
        hp: 42, attributes: { ...enemyAttrs(9), REFLEX: 6, COOL: 6 }, damage: 10, armorValue: 6,
        behavior: 'patrol', spawnChance: 0.6, count: [1, 2],
        drops: [
          { itemId: 'milspec_sidearm', chance: 0.2, quantityRange: [1, 1] },
          { itemId: 'security_keycard_basic', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'ballistic_vest_helixion', chance: 0.15, quantityRange: [1, 1] },
        ],
        xpReward: 65,
      },
      {
        id: 'automated_defense', name: 'Automated Defense', level: 9,
        description: 'Factory security system. Activates on lockdown. Ceiling-mounted suppressant dispensers — chemical damage per turn.',
        hp: 40, attributes: { ...enemyAttrs(9), TECH: 7 }, damage: 6, armorValue: 7,
        behavior: 'aggressive', spawnChance: 0.4, count: [1, 1],
        drops: [
          { itemId: 'security_components', chance: 0.5, quantityRange: [1, 1] },
        ],
        xpReward: 50,
      },
    ],
    objects: [
      { id: 'resonance_amplifiers', name: 'resonance amplifiers', examineText: 'Each panel is a neural resonance amplifier. Circuitry designed to receive a frequency input and amplify it across a specific range. The input frequency is calibrated to 33hz. Hundreds of these, assembled into the Broadcast Tower\'s spire, would turn a natural phenomenon into a city-wide neural broadcast.' },
      { id: 'production_terminal', name: 'production terminal', examineText: 'TECH ≥ 8: The production manifest. Component specifications. Delivery schedules. Assembly instructions for the Broadcast Tower\'s resonance array. The amplifiers are arranged in a Fibonacci spiral, each one reinforcing the next. The design is beautiful. It\'s also a machine for ending human autonomy.' },
      { id: 'worker_stations', name: 'worker stations', examineText: 'The workers\' hands move with mechanical precision — the mesh guiding their motor functions. The final connections require human neural proximity — the circuitry calibrates to living tissue during assembly. The workers are part of the manufacturing process. Their bodies are tools.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 14. DOCK BOSS OFFICE ──────────────────────────────────────────────────

  z03_r14: {
    id: 'z03_r14',
    zone: 'z03',
    name: 'DOCK BOSS OFFICE',
    description:
`An elevated office on a gantry above the cargo yard. The
windows are floor-to-ceiling, overlooking the dock operation.
From up here you can see every crane, every container, every
worker, and the water beyond.

The office is functional — a desk, three monitors showing
manifests and security feeds, a filing cabinet that hasn't
been opened digitally because the man behind the desk doesn't
trust digital. An ashtray with a cigarette burning. A bottle
of something amber. Two glasses, one clean.

He was expecting you. Or someone like you. Sooner or later,
everyone with questions about the Helixion shipments ends up
in this office.`,
    exits: [
      { direction: 'down', targetRoom: 'z03_r02', description: 'down (Cargo Docks)' },
      { direction: 'south', targetRoom: 'z03_r01', description: 'fire escape overlooks the waterfront' },
    ],
    npcs: [
      {
        id: 'oyunn', name: 'Oyunn', type: 'SHOPKEEPER',
        faction: 'FREEMARKET',
        description: 'Dock Boss. Fifties. Heavy. Patient. Controls the dock operation. Helixion needs the docks and Oyunn runs them.',
        dialogue: "\"The second glass is for you. Sit down. I hear things and you want things. Let's see if those facts meet in the middle.\"",
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'security_feeds', name: 'security feeds', examineText: 'Three monitors. The dock yard from four angles. Every crane, every container, every worker. Oyunn sees everything that happens on his docks. He also sees what doesn\'t happen — the gaps in the schedules, the containers that arrive without manifests.' },
      { id: 'filing_cabinet', name: 'filing cabinet', examineText: 'Physical records. Fifteen years of dock operations on paper. Oyunn doesn\'t trust digital because digital can be erased. Paper endures. The drawer labeled \'HX\' is thicker than the others.' },
      { id: 'amber_bottle', name: 'amber bottle', examineText: 'No label. The liquid is the color of old honey. The second glass is clean and turned upright — he poured it when he heard your footsteps on the gantry stairs. He\'s been doing this long enough to know the sound of someone with questions.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 15. DISTRICT BORDER ───────────────────────────────────────────────────

  z03_r15: {
    id: 'z03_r15',
    zone: 'z03',
    name: 'DISTRICT BORDER',
    description:
`The Chrome Wolf territory thins at the western edge, where
the factories give way to waste ground — rubble, rusted
fencing, dead lots. The air smells different here: less
machine oil, more dust and something else. Sweat. Blood.
The copper tang of violence conducted as entertainment.

A path of beaten dirt leads through a gap in the fencing
toward a structure that used to be a water treatment plant.
The concrete basin has been repurposed. Lights blaze from
within. You can hear the crowd before you see them —
cheering, jeering, the impact sounds of bodies hitting
bodies with modifications that make the impacts louder than
they should be.

A man sits at a folding table near the entrance, taking
bets. He looks at you like a butcher looks at a cut of
meat. Evaluating.`,
    exits: [
      { direction: 'east', targetRoom: 'z03_r10', description: 'east (The Wolf Den)' },
      { direction: 'west', targetRoom: 'z06_r01', description: 'west (Fight Pits)', zoneTransition: true, targetZone: 'z06' },
    ],
    npcs: [
      {
        id: 'rade', name: 'Rade', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'Fight Pit operator. Indeterminate age. Lean. Missing left ear, replaced with a low-grade audio implant. Every sentence prices you.',
        dialogue: "\"Fighter or spectator? Fighters go left. Spectators go right. Spectators pay at the door. Fighters pay with what's under their skin.\"",
        startingDisposition: 0,
        services: ['quest', 'shop'],
      },
    ],
    enemies: [
      {
        id: 'feral_augment_border', name: 'Feral Augment', level: 7,
        description: 'In the waste ground between districts. Disoriented, territorial.',
        hp: 28, attributes: { ...enemyAttrs(7), BODY: 6, REFLEX: 5 }, damage: 7, armorValue: 2,
        behavior: 'territorial', spawnChance: 0.35, count: [1, 2],
        drops: [
          { itemId: 'damaged_implant', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'scrap_cyberware', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 35,
      },
    ],
    objects: [
      { id: 'pit_entrance', name: 'pit entrance', examineText: 'The repurposed water treatment plant. The basin is the arena. The bleachers are scaffolding. The lights are industrial floods. They watch people break each other in a place where the mesh can\'t see.' },
      { id: 'betting_table', name: 'betting table', examineText: 'Rade\'s operation. Handwritten odds on a whiteboard. Tonight\'s card lists fighters by nickname — Chrome Jaw, Deadswitch, Moth, The Silencer. Rade crosses out names that don\'t come back and he doesn\'t erase them. The whiteboard is a history of damage.' },
      { id: 'waste_ground', name: 'waste ground', examineText: 'No-man\'s-land between Industrial and Fringe. No faction claims it. Rubble and fencing create a natural boundary — a demilitarized zone of neglect.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },
};

// ── Zone 03 Definition ──────────────────────────────────────────────────────

export const ZONE_03: Zone = {
  id: 'z03',
  name: 'INDUSTRIAL DISTRICT',
  depth: 'surface',
  faction: 'CHROME_WOLVES',
  levelRange: [4, 12],
  description: 'Factories, docks, Chrome Wolves. The city\'s mechanical heart. Helixion runs the active half. The Wolves claimed the dead half. Between them: rust, heat, and everything the city makes and throws away.',
  atmosphere: {
    sound: 'Docks: gulls, cargo cranes, water. Factories: pneumatic hammers, silence from dead ones. Wolf territory: engines, metal music, surgical tools.',
    smell: 'Machine oil. Sulfur. Chemical runoff. Wolf territory adds ozone and grilled meat.',
    light: 'Docks: fog, gray water. Factory strip: sodium floods at active sites, dark at dead ones. Wolf territory: welding sparks, neon.',
    temp: 'Hot near active factories. Cool at the waterfront. The Wolf Den is warm — bodies and engines.',
  },
  rooms: Z03_ROOMS,
  originPoint: undefined,
};

// ── Zone 02: Residential Blocks ────────────────────────────────────────────

const Z02_ROOMS: Record<string, Room> = {

  // ── 1. OUTER BLOCKS ───────────────────────────────────────────────────────

  z02_r01: {
    id: 'z02_r01',
    zone: 'z02',
    name: 'OUTER BLOCKS',
    description:
`The buildings here are old. Pre-Helixion construction —
poured concrete, rusting rebar showing through cracks in
the facades, windows patched with polymer sheets. The
streetlamps work every third one. The rest are dead or
stolen for parts.

The mesh still reaches — it reaches everywhere — but the
infrastructure support doesn't. No curated ambient sound.
No calming terpenes in the air vents. Just the raw signal,
doing its work without the luxury packaging.

A group of young men stand on a corner, watching everyone
who passes. Graffiti on a wall: "UPGRADE OR DIE." Someone
crossed out "OR" and wrote "AND."`,
    exits: [
      { direction: 'west', targetRoom: 'z04_r01', description: 'west (Fringe — The Border)', zoneTransition: true, targetZone: 'z04' },
      { direction: 'east', targetRoom: 'z02_r06', description: 'east (Condemned Tower)' },
      { direction: 'south', targetRoom: 'z02_r02', description: 'south (The Corner)' },
    ],
    npcs: [
      {
        id: 'residents_outer', name: 'Outer Block Residents', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Less polished than inner block residents. More aware. More tired. They make eye contact.',
        dialogue: "A woman sorting laundry glances at you. \"You look lost.\" She goes back to sorting.",
        startingDisposition: 0,
      },
    ],
    enemies: [
      {
        id: 'street_thugs', name: 'Street Thugs', level: 5,
        description: 'Opportunistic. Won\'t attack if you look dangerous. Low coordination. Flee if one drops.',
        hp: 18, attributes: { ...enemyAttrs(5), BODY: 4, REFLEX: 4 }, damage: 5, armorValue: 1,
        behavior: 'territorial', spawnChance: 0.5, count: [2, 3],
        drops: [
          { itemId: 'creds_pouch', chance: 0.6, quantityRange: [5, 15] },
          { itemId: 'scrap_weapon', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'cheap_stim', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 25,
      },
      {
        id: 'mesh_addict', name: 'Mesh-Addict', level: 5,
        description: 'Overloaded implant. Erratic. Sometimes hostile, sometimes catatonic. Neural feedback attacks.',
        hp: 14, attributes: { ...enemyAttrs(5), GHOST: 3 }, damage: 4, armorValue: 0,
        behavior: 'passive', spawnChance: 0.3, count: [1, 1],
        drops: [
          { itemId: 'damaged_mesh_components', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'stim_residue', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 15,
      },
    ],
    objects: [
      { id: 'graffiti', name: 'graffiti', examineText: "'UPGRADE OR DIE.' The correction is in a different hand, different paint. 'UPGRADE AND DIE.' Neither artist is wrong. Beneath both, someone smaller wrote: 'what if I just want to stay?'" },
      { id: 'dead_streetlamps', name: 'dead streetlamps', examineText: "The poles are still standing. The fixtures are gutted — salvaged for copper and circuit boards. Helixion maintains the inner blocks. Out here, maintenance requests have been pending for three years." },
      { id: 'polymer_windows', name: 'polymer windows', examineText: "Heat-sealed polymer sheeting replacing broken glass. From the outside, you can see the glow of screens through the translucent material. Everyone's home. Everyone's connected. Nobody's looking out." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 2. THE CORNER ────────────────────────────────────────────────────────

  z02_r02: {
    id: 'z02_r02',
    zone: 'z02',
    name: 'THE CORNER',
    description:
`A street intersection where two apartment blocks create a
sheltered L-shape. Someone's rigged a tarp between the
buildings — shade and rain cover for the cluster of activity
beneath it. A food cart selling synth-protein bowls. A woman
mending clothes with a sewing machine powered by a car
battery. Two old men playing a board game on an upturned crate.

Normal. Aggressively normal. The kind of normalcy people
build in places where nothing else is guaranteed.

A narrow door between a laundromat and a boarded-up noodle
shop has no sign. But people come and go from it at odd hours,
and nobody asks questions.`,
    exits: [
      { direction: 'north', targetRoom: 'z02_r01', description: 'north (Outer Blocks)' },
      { direction: 'east', targetRoom: 'z02_r05', description: 'east (Back Alley)' },
    ],
    npcs: [
      {
        id: 'pee_okoro', name: 'Pee Okoro', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'Black market pharmacist. Mid-forties. Calm, precise, no small talk. Knows every compound.',
        dialogue: "\"No names. No questions. Tell me what hurts and I'll tell you what it costs.\"",
        startingDisposition: 0,
        services: ['shop'],
      },
      {
        id: 'food_cart_vendor', name: 'Food Cart Vendor', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Sells synth-protein bowls from a battered cart. Gossips about the neighborhood.',
        dialogue: "\"Bowl? Five creds. Best you'll get without walking to the market.\"",
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      { id: 'unmarked_door', name: 'unmarked door', examineText: "No sign. No handle on the outside — it opens from within. Knock twice. Pause. Knock once. That's the pattern. Everyone in the outer blocks knows it. Nobody says it out loud." },
      { id: 'sewing_machine', name: 'sewing machine', examineText: "Foot-pedal operated, powered by a jury-rigged battery. The woman mending clothes has done this a thousand times. She doesn't look up. The garment she's working on has Helixion employee markings on the collar — she's removing them." },
      { id: 'board_game', name: 'board game', examineText: "Old men. Real game pieces, not digital. One of them is blind — he plays by touch. They've been playing this game longer than the mesh has existed. It's the only thing in the neighborhood the firmware can't improve." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 3. BLOCK MARKET ──────────────────────────────────────────────────────

  z02_r03: {
    id: 'z02_r03',
    zone: 'z02',
    name: 'BLOCK MARKET',
    description:
`An open-air market occupying a pedestrian street between
two residential towers. Stalls and carts crowd both sides —
salvage, clothing, food, electronics, things that fell off
corporate supply trucks. The air smells like frying oil and
ozone. Music plays from three different sources, none of
them in sync.

The market is loud. This is intentional. Noise covers
conversation. The mesh monitors data traffic, not audio —
so the market operates in the gap between what Helixion
tracks and what it can hear.

A Freemarket vendor has a stall near the center — slightly
better goods, slightly higher prices, and a look in her
eye that says she knows exactly where everything came from.`,
    exits: [
      { direction: 'west', targetRoom: 'z02_r06', description: 'west (Condemned Tower)' },
      { direction: 'east', targetRoom: 'z02_r09', description: 'east (Inner Boulevard)' },
      { direction: 'south', targetRoom: 'z02_r04', description: 'south (Mid Blocks)' },
    ],
    npcs: [
      {
        id: 'devi', name: 'Devi', type: 'SHOPKEEPER',
        faction: 'FREEMARKET',
        description: 'Freemarket fence. Sharp, fast-talking, delighted by good merchandise.',
        dialogue: "\"Everything has a price and everything has a buyer. I'm the part in between. What are we moving today?\"",
        startingDisposition: 0,
        services: ['shop', 'info'],
      },
      {
        id: 'market_vendors', name: 'Market Vendors', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Stall operators. Salvage, clothing, food, electronics. Prices vary — COOL checks for better deals.',
        dialogue: "A vendor waves you over. \"Everything works. Mostly. Refunds are a concept from the inner blocks.\"",
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      { id: 'market_stalls', name: 'market stalls', examineText: "An ecosystem of small commerce. Someone sells handmade soap. Someone else sells reprogrammed personal devices. A third stall has a suspiciously large quantity of Helixion-branded nutrient bars — the kind that only ship to the campus. They fell off a truck. Several trucks." },
      { id: 'competing_music', name: 'competing music', examineText: "Three different sources — a speaker playing synth-pop, a busker with a string instrument, and someone's apartment window bleeding bass. None of it harmonizes. All of it feels more alive than the curated ambient in the inner blocks." },
      {
        id: 'drainage_grate', name: 'drainage grate', examineText: 'Set into the market street. Water flows below. You can hear it — and beneath the water sound, something else. A hum.',
        gatedText: [{ attribute: 'GHOST', minimum: 4, text: '33hz. Coming from below. The market sits on top of a junction in the tunnel network and nobody here has any idea.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 4. MID BLOCKS ────────────────────────────────────────────────────────

  z02_r04: {
    id: 'z02_r04',
    zone: 'z02',
    name: 'MID BLOCKS',
    description:
`The transition zone. Buildings here are fifteen to twenty
years old — the first wave of Helixion-era construction.
The facades are intact but stained. The infrastructure works
but groans. The people here work. They commute to Helixion
or its subsidiaries. They update their firmware on schedule.
They are fine.

They are fine.

A woman stands at a crosswalk, waiting for a light that
hasn't changed in three minutes. She doesn't seem to notice.
Fire escapes zigzag up the building faces. One of them,
on the south-facing tower, has plants growing on the
upper landings. Real plants.`,
    exits: [
      { direction: 'north', targetRoom: 'z02_r03', description: 'north (Block Market)' },
      { direction: 'south', targetRoom: 'z02_r11', description: 'south (Transit Station)' },
      { direction: 'up', targetRoom: 'z02_r13', description: 'up (Rooftop Garden — fire escape)' },
    ],
    npcs: [
      {
        id: 'tomas_wren', name: 'Tomas Wren', type: 'QUESTGIVER',
        faction: 'NONE',
        description: 'Mesh-addict in recovery. Late thirties. Former Helixion compliance engineer. Twitchy. Paranoid. Brilliant.',
        dialogue: "\"They don't— the signal isn't— sorry. I know how it works. The mesh. I built part of it. Do you have any modulators?\"",
        startingDisposition: 0,
        services: ['quest', 'info'],
      },
    ],
    enemies: [
      {
        id: 'mesh_addict_mid', name: 'Mesh-Addict', level: 6,
        description: 'Overloaded implant. Erratic. Neural feedback attacks cause 1-turn disorientation.',
        hp: 18, attributes: { ...enemyAttrs(6), GHOST: 3 }, damage: 5, armorValue: 0,
        behavior: 'passive', spawnChance: 0.4, count: [1, 1],
        drops: [
          { itemId: 'damaged_mesh_components', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'stim_residue', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 18,
      },
    ],
    objects: [
      { id: 'woman_at_crosswalk', name: 'woman at crosswalk', examineText: "She's been standing there for four minutes. The light hasn't changed. She hasn't checked. Her eyes are focused on something you can't see — mesh overlay, feeding her information. Or feeding her calm. Or feeding her nothing at all and she's standing here because the signal told her to wait." },
      { id: 'fire_escape_plants', name: 'fire escape plants', examineText: "Real plants. Climbing the fire escape of the south tower. Someone's been growing them deliberately — soil in containers, a water collection system made from cut bottles. In a city where Helixion provides everything, someone decided to grow something themselves. Follow the fire escape up to find the Rooftop Garden." },
      { id: 'apartment_4c', name: 'apartment 4C', examineText: "Door ajar. Small and cluttered — takeout containers, cracked data tablets, wires stripped and reconnected in compulsive patterns. A man sits on the floor against the wall. He looks at you like you're either a rescue or a threat and he can't decide which." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 5. BACK ALLEY ────────────────────────────────────────────────────────

  z02_r05: {
    id: 'z02_r05',
    zone: 'z02',
    name: 'BACK ALLEY',
    description:
`A narrow passage between two outer-block apartment towers.
Dumpsters, drainage pipes, the backs of shops that face
the main streets. The kind of space designed for utilities
that becomes a space for everything the main streets don't
want visible.

Someone has set up a folding chair, a small table, and a
thermos of coffee between two dumpsters. A man in a gray
jacket sits there like he's waiting for a bus. He's not.
He's working. He's been working this alley for six years.
Everyone in the outer blocks knows where to find him.
Nobody uses his real name.`,
    exits: [
      { direction: 'west', targetRoom: 'z02_r02', description: 'west (The Corner)' },
      { direction: 'east', targetRoom: 'z02_r08', description: 'east (Preacher\'s Corner)' },
    ],
    npcs: [
      {
        id: 'sixer', name: 'Sixer', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'Civilian informant. Genial. Forgettable on purpose. Information doesn\'t depreciate.',
        dialogue: "\"Sixer. That's what people call me. Sit down. Tell me what you need to know. Or what you need to not be known.\"",
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [
      {
        id: 'street_thugs_alley', name: 'Street Thugs', level: 6,
        description: 'Opportunistic. These know the alley. They avoid Sixer\'s corner.',
        hp: 22, attributes: { ...enemyAttrs(6), BODY: 5, REFLEX: 4 }, damage: 5, armorValue: 1,
        behavior: 'territorial', spawnChance: 0.3, count: [1, 2],
        drops: [
          { itemId: 'creds_pouch', chance: 0.6, quantityRange: [5, 15] },
          { itemId: 'scrap_weapon', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'cheap_stim', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 25,
      },
    ],
    objects: [
      { id: 'folding_chair', name: 'folding chair', examineText: "Worn. The seat fabric is patched. He's been sitting in this chair, in this alley, between these dumpsters, for six years. The dumpster owners know him. The rats know him. The alley is his office and the overhead is zero." },
      { id: 'thermos', name: 'thermos', examineText: "Coffee. Real coffee — not synth-brew. Sixer has a supplier. He won't say who. The coffee is better than anything in the inner blocks. He considers it a professional expense." },
      {
        id: 'dumpster_cache', name: 'dumpster cache',
        examineText: 'A row of dumpsters. Nothing unusual.',
        hidden: true, hiddenRequirement: { attribute: 'GHOST', minimum: 5 },
        gatedText: [
          { attribute: 'GHOST', minimum: 5, text: "One of the dumpsters has a false bottom. Sixer's archive — data chips, handwritten notes, a physical map of the D9 agent rotation marked with colored pins. He keeps it analog. The mesh can't index paper." },
          { attribute: 'INT', minimum: 6, text: "One dumpster sits differently than the others — weight distributed wrong. A false bottom. Sixer's analog intelligence archive." },
        ],
      },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 6. CONDEMNED TOWER ───────────────────────────────────────────────────

  z02_r06: {
    id: 'z02_r06',
    zone: 'z02',
    name: 'CONDEMNED TOWER',
    description:
`Block 17. Eighteen stories of pre-Helixion residential
construction, condemned after a structural inspection that
may or may not have actually happened. The ground floor is
boarded up — plywood and chain-link over the entrances,
municipal condemnation notices faded past reading.

The boards have been pried back and replaced so many times
the nails don't hold anymore. Everyone in the outer blocks
knows about Block 17. Nobody reports it. The people inside
have nowhere else to go.

From the outside, you can see light moving on the upper
floors. Candles or flashlights. The building is supposed
to be empty. It is not.`,
    exits: [
      { direction: 'west', targetRoom: 'z02_r01', description: 'west (Outer Blocks)' },
      { direction: 'east', targetRoom: 'z02_r03', description: 'east (Block Market)' },
      { direction: 'down', targetRoom: 'z02_r07', description: 'down (Squatter Floors)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'street_thugs_tower', name: 'Street Thugs', level: 7,
        description: 'Block 17 regulars. They control access. Can be fought, bribed, or talked past (COOL ≥ 6). They\'re protecting the people inside.',
        hp: 26, attributes: { ...enemyAttrs(7), BODY: 5, COOL: 4 }, damage: 6, armorValue: 2,
        behavior: 'territorial', spawnChance: 0.6, count: [2, 2],
        drops: [
          { itemId: 'creds_pouch', chance: 0.5, quantityRange: [5, 15] },
          { itemId: 'scrap_weapon', chance: 0.2, quantityRange: [1, 1] },
          { itemId: 'cheap_stim', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 30,
      },
    ],
    objects: [
      { id: 'condemnation_notices', name: 'condemnation notices', examineText: "Municipal order, dated four years ago. 'UNSAFE FOR HABITATION.' The inspection code links to a contractor that doesn't exist. Someone condemned this building on paper to clear it for redevelopment. The redevelopment never came. The people didn't leave." },
      { id: 'cut_chain_link', name: 'cut chain link', examineText: "A clean cut, hidden behind the dumpster. Rewired to look intact from a distance. The opening is wide enough for one person. Beyond it: a dark stairwell that smells like damp concrete and cooking." },
      { id: 'light_on_upper_floors', name: 'lights above', examineText: "Flickering. Moving between rooms. Multiple light sources on floors 3 through 8. Above that, the building is dark — structurally compromised. Below, the basement connects to the city's utility infrastructure." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 7. SQUATTER FLOORS ───────────────────────────────────────────────────

  z02_r07: {
    id: 'z02_r07',
    zone: 'z02',
    name: 'SQUATTER FLOORS',
    description:
`Inside Block 17, the condemned building is alive. Floors 3
through 8 have been claimed — walls knocked out between
apartments to create communal spaces, stairwells reinforced
with salvaged steel, a water collection system running from
the roof through PVC pipes wired to the walls like veins.

These people are not on the mesh. Their implants are active,
but modified. Mesh modulators, homebrew firmware patches,
signal dampeners. The compliance system sees them as
low-priority anomalies. Not sovereign. Not flagged. Fuzzy.

A woman is teaching three children to read from a physical
book. A man repairs a generator. Someone is cooking actual
food — not synth-protein, not nutrient paste. Onions. You
can smell onions. You haven't smelled real onions in years.`,
    exits: [
      { direction: 'up', targetRoom: 'z02_r06', description: 'up (Condemned Tower)' },
      { direction: 'down', targetRoom: 'z09_r03', description: 'down (Maintenance Tunnels — Ventilation Hub)', zoneTransition: true, targetZone: 'z09' },
    ],
    npcs: [
      {
        id: 'squatter_residents', name: 'Squatter Residents', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'The most self-aware civilian population in the zone. They know about the mesh. They chose a condemned building over compliance.',
        dialogue: "A man repairing a generator looks up. \"You're not from here.\" He studies you for a moment. \"Neither were any of us. Close the door.\"",
        startingDisposition: -5,
      },
    ],
    enemies: [],
    objects: [
      { id: 'physical_book', name: 'physical book', examineText: "A real book. Paper. Printed before the mesh. The woman teaching from it reads aloud and the children follow the words with their fingers. The book is a dictionary. She's teaching them words the mesh autocomplete doesn't suggest." },
      { id: 'water_collection', name: 'water collection', examineText: "PVC pipes running from the roof through six floors. Rainwater, filtered through gravel and charcoal. It's not clean by corporate standards. It's theirs. They built it." },
      { id: 'signal_dampeners', name: 'signal dampeners', examineText: "Jury-rigged from old router housings and copper mesh. Hung on walls like art. They create micro dead zones — small enough that the mesh reads them as interference, not defiance. The people here live in the static between compliance and sovereignty." },
      {
        id: 'iron_bloom_dead_drop', name: 'loose brick',
        examineText: 'A brick in the basement stairwell. Looks like every other brick.',
        hidden: true, hiddenRequirement: { attribute: 'INT', minimum: 7 },
        gatedText: [
          { attribute: 'INT', minimum: 7, text: "A loose brick in the basement stairwell. Behind it — a waterproof case with the Iron Bloom sigil scratched into the lid. Instructions for contacting the resistance. A frequency to tune to. A warning: 'Do not attempt contact unless you are certain you are not followed.'" },
        ],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 8. PREACHER'S CORNER ─────────────────────────────────────────────────

  z02_r08: {
    id: 'z02_r08',
    zone: 'z02',
    name: "PREACHER'S CORNER",
    description:
`A small plaza where the outer blocks meet the mid blocks.
A defunct fountain — dry for years, the basin cracked, weeds
growing through the concrete. Benches that people still use.
A streetlamp that works.

A man stands on the fountain's rim, talking. He talks every
day. He's been talking for two years. Most people walk past
without looking. Some stop, listen for a few seconds, shake
their heads, and keep moving.

He's talking about a sound. A frequency. Something under
the city that was there before the city was built. He says
it speaks. He says Helixion knows and is trying to capture
it. He is correct about every single thing he's saying.
Nobody believes him.`,
    exits: [
      { direction: 'west', targetRoom: 'z02_r05', description: 'west (Back Alley)' },
      { direction: 'east', targetRoom: 'z02_r11', description: 'east (Transit Station)' },
    ],
    npcs: [
      {
        id: 'jonas', name: 'Jonas', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Street preacher. Fifties. Gaunt. Everything he says sounds like a sermon but the content is engineering.',
        dialogue: "\"You can hear it, can't you? Under the traffic. Under the mesh. Under everything they built on top of it. 33 cycles per second. It was here first.\"",
        startingDisposition: 20,
        services: ['info'],
      },
    ],
    enemies: [
      {
        id: 'd9_plainclothes_preacher', name: 'D9 Plainclothes', level: 8,
        description: 'One agent. Watches Jonas. Classified as "non-credible dissident — no action required." Notes anyone who talks to Jonas too long.',
        hp: 34, attributes: { ...enemyAttrs(8), COOL: 6, GHOST: 5, REFLEX: 6 }, damage: 8, armorValue: 4,
        behavior: 'ambush', spawnChance: 0.0, count: [1, 1],
        drops: [
          { itemId: 'd9_credentials', chance: 0.15, quantityRange: [1, 1] },
          { itemId: 'surveillance_equipment', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 60,
      },
    ],
    objects: [
      {
        id: 'defunct_fountain', name: 'defunct fountain',
        examineText: "The basin is cracked. Weeds grow through. The fountain hasn't worked in years but the infrastructure is still connected — water pipes beneath the plaza, feeding into the drainage system below.",
        gatedText: [{ attribute: 'GHOST', minimum: 5, text: "You can feel something through the pipes. A vibration. Faint. 33hz. Jonas stands on this fountain because he can feel it through his feet." }],
      },
      { id: 'jonas_corner', name: "jonas's corner", examineText: "He's been standing here so long the stone is worn where his feet rest. Some residents leave food. A few leave notes tucked into the fountain's edge. Prayer or solidarity, it's hard to tell." },
      { id: 'folded_notes', name: 'folded notes', examineText: "Dozens, tucked into cracks in the fountain. They say things like: 'I hear it too.' 'My daughter started dreaming about tunnels.' 'Is it God?' 'Thank you for saying it.' 'You're not crazy.' Jonas doesn't read them. He knows they're there." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 9. INNER BOULEVARD ───────────────────────────────────────────────────

  z02_r09: {
    id: 'z02_r09',
    zone: 'z02',
    name: 'INNER BOULEVARD',
    description:
`The difference is immediate. The pavement is smooth. The
streetlamps are smart — they brighten as you approach and
dim when you pass. Holographic advertisements float at eye
level: Helixion wellness products, MNEMOS v2.7 testimonials,
a smiling family with the tagline "TOGETHER, IN SYNC."

The buildings are newer — glass and composite, twenty stories.
The ground floors are commercial: a Helixion café, a fitness
center, a mesh wellness spa. The air smells like synthetic
botanicals, engineered calm.

People walk slowly. Nobody rushes. Their faces are relaxed
in a way that doesn't look like relaxation — it looks like
the absence of everything that makes a person tense. The
mesh working exactly as designed.`,
    exits: [
      { direction: 'west', targetRoom: 'z02_r03', description: 'west (Block Market)' },
      { direction: 'east', targetRoom: 'z01_r01', description: 'east (Helixion Campus — Security Perimeter)', zoneTransition: true, targetZone: 'z01' },
      { direction: 'south', targetRoom: 'z02_r10', description: 'south (Mesh Clinic)' },
      { direction: 'up', targetRoom: 'z02_r12', description: 'up (Penthouse Level — elevator)' },
    ],
    npcs: [
      {
        id: 'residents_inner', name: 'Inner Block Residents', type: 'NEUTRAL',
        faction: 'HELIXION',
        description: 'Fully mesh-compliant. Polite. Helpful. Identical in their pleasantness. Answers arrive with a half-second delay.',
        dialogue: "\"Can I help you? This is a wonderful neighborhood. I've lived here for—\" She pauses. Half a second. \"—seven years. I love it.\"",
        startingDisposition: 5,
      },
    ],
    enemies: [],
    objects: [
      { id: 'holographic_ads', name: 'holographic ads', examineText: "'TOGETHER, IN SYNC.' The family in the ad is smiling with their teeth but not their eyes. The testimonial is from 'MAYA, 34, MESH USER SINCE V1.2.' Maya says: 'I don't even remember what it was like before. And that's the best part.' You read it twice. The second time is worse." },
      { id: 'mesh_wellness_spa', name: 'mesh wellness spa', examineText: "A storefront offering 'cognitive optimization sessions.' The treatment menu: Stress Dissolution, Focus Enhancement, Memory Curation, Emotional Calibration. The last one costs the most." },
      { id: 'helixion_cafe', name: 'helixion café', examineText: "Real food. Good food. The menu doesn't list prices in CREDS — it deducts automatically from your mesh account. If you don't have a mesh account, you don't eat here. The barista smiles and the smile is perfect and it means nothing." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 10. MESH CLINIC ──────────────────────────────────────────────────────

  z02_r10: {
    id: 'z02_r10',
    zone: 'z02',
    name: 'MESH CLINIC',
    description:
`A ground-floor clinic with the Helixion health logo on the
door. Inside: white walls, white floors, the smell of
sterilization. Comfortable chairs in the waiting area. A
screen playing a loop of mesh testimonials.

Through the glass panels you can see reclining chairs,
monitoring equipment, neural interface terminals. Everything
looks medical. Everything looks professional. Everything
looks exactly like the Compliance Wing in the Helixion
Campus, except smaller, friendlier, and located in a
neighborhood where people come voluntarily.

A sign on the wall: "FIRMWARE UPDATE 2.7.4 AVAILABLE."

A woman in the waiting area clutches her purse and stares
at the testimonial screen. She's been sitting there for
twenty minutes. She hasn't moved.`,
    exits: [
      { direction: 'north', targetRoom: 'z02_r09', description: 'north (Inner Boulevard)' },
      { direction: 'west', targetRoom: 'z02_r04', description: 'a side exit leads to the mid blocks' },
    ],
    npcs: [
      {
        id: 'clinic_staff', name: 'Clinic Staff', type: 'NEUTRAL',
        faction: 'HELIXION',
        description: 'They look like nurses. They are nurses. They also function as compliance monitors — their mesh interfaces detect anomalous neural signatures.',
        dialogue: "\"Welcome to Helixion Health. Do you have an appointment? We have openings for firmware 2.7.4 this afternoon.\"",
        startingDisposition: 5,
      },
      {
        id: 'waiting_patient', name: 'Waiting Patient', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'The woman with the purse. Here for a firmware update she\'s been putting off.',
        dialogue: "\"I've been having these dreams. The update is supposed to fix that.\"",
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      { id: 'testimonial_screen', name: 'testimonial screen', examineText: "'I sleep better.' 'My focus is incredible.' 'I don't have bad dreams anymore.' The syntax is identical in every testimonial. Not the words — the rhythm. The mesh didn't write these. But it shaped the minds that did." },
      { id: 'treatment_rooms', name: 'treatment rooms', examineText: "Through the glass: a reclining chair with neural interface contacts on the headrest. Monitoring screens. A cabinet of sealed neural paste cartridges. Consumer grade. Same function as the Compliance Wing. Friendlier packaging." },
      {
        id: 'firmware_sign', name: 'firmware sign',
        examineText: "'2.7.4 AVAILABLE.' The version number.",
        gatedText: [{ attribute: 'TECH', minimum: 6, text: "You recognize the versioning scheme from the Chrysalis research files. The consumer firmware shares a codebase with Chrysalis. Not the identity overwrite — not yet. But the architecture is compatible. V2.7 is the foundation. Chrysalis is the building they plan to put on top of it." }],
      },
      {
        id: 'clinic_records', name: 'clinic records',
        examineText: 'A terminal behind the reception desk. Requires access.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: "Patient records. Update histories. Adverse reactions filed under 'integration anomalies.' Three patients in the last month reported 'persistent subconscious frequency awareness.' Each was prescribed an accelerated update schedule. The records don't say what frequency. They don't have to." }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 11. TRANSIT STATION ──────────────────────────────────────────────────

  z02_r11: {
    id: 'z02_r11',
    zone: 'z02',
    name: 'TRANSIT STATION',
    description:
`An underground station for the city's automated transit
system. Escalators descend from street level into a tiled
concourse. The tiles are cracked but clean. Screens display
route maps and schedules. The trains run on time. The trains
always run on time.

The platform is broad, well-lit, and smells like recycled
air and brake dust. A busker plays a keyboard with half the
keys dead — the melody adapts around the gaps. A Helixion
vending machine sells nutrient bars and single-dose stims.

A transit map on the wall shows connections to every surface
district. The map has a blank space in the center where
Helixion Campus sits — no transit stop. You can see the
campus from anywhere in the city but you can't take the
train there.`,
    exits: [
      { direction: 'north', targetRoom: 'z02_r04', description: 'north (Mid Blocks)' },
      { direction: 'west', targetRoom: 'z02_r08', description: 'west (Preacher\'s Corner)' },
      { direction: 'south', targetRoom: 'z03_r05', description: 'south (Industrial District — Factory Row)', zoneTransition: true, targetZone: 'z03' },
    ],
    npcs: [
      {
        id: 'transit_passengers', name: 'Transit Passengers', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Commuters. They stare at nothing, listen to nothing, and stand in the exact same spot every day because the mesh tells them which door aligns with their exit.',
        dialogue: "A man glances at you, then at a spot on the ground two inches from his feet. He adjusts. The mesh told him where to stand.",
        startingDisposition: 0,
      },
      {
        id: 'busker', name: 'Busker', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Plays a broken keyboard. The melody adapts around the dead keys.',
        dialogue: "\"The dead keys? Yeah. I know which ones. I play around them. That's the whole point — you play around what's broken.\"",
        startingDisposition: 5,
      },
    ],
    enemies: [
      {
        id: 'd9_plainclothes_transit', name: 'D9 Plainclothes', level: 8,
        description: 'Stationed at the concourse permanently. The transit system is a natural chokepoint.',
        hp: 34, attributes: { ...enemyAttrs(8), COOL: 6, GHOST: 5, REFLEX: 6 }, damage: 8, armorValue: 4,
        behavior: 'ambush', spawnChance: 0.0, count: [1, 1],
        drops: [
          { itemId: 'd9_credentials', chance: 0.1, quantityRange: [1, 1] },
          { itemId: 'surveillance_equipment', chance: 0.25, quantityRange: [1, 1] },
        ],
        xpReward: 60,
      },
    ],
    objects: [
      { id: 'transit_map', name: 'transit map', examineText: "The whole surface network. Industrial District south. Fringe west. Residential throughout. But the center of the map — where Helixion Campus sits — is blank. No stop. No connection. The most important building in the city is unreachable by public transit. You go there on Helixion's terms, not yours." },
      { id: 'vending_machine', name: 'vending machine', examineText: "Helixion-branded. Nutrient bars, water, single-dose stim packs. Prices are low — subsidized. The mesh knows what you buy and when. Every transaction is data." },
      {
        id: 'schedule_screens', name: 'schedule screens',
        examineText: 'The trains run every four minutes. They have never been late.',
        gatedText: [{ attribute: 'TECH', minimum: 5, text: "The schedule isn't just timing — it's crowd management. The algorithm distributes passengers to minimize unmonitored clustering. The mesh manages foot traffic across the entire city through transit timing." }],
      },
      {
        id: 'busker_melody', name: 'busker melody',
        examineText: "He plays around the dead keys. The melody is strange — modal, not major or minor.",
        gatedText: [{ attribute: 'GHOST', minimum: 4, text: "The ventilation shaft above the platform hums at a sub-frequency. His melody is harmonizing with it. Not intentionally. Intuitively. The frequency finds musicians first." }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    hasFastTravel: true,
    fastTravelType: 'transit_station',
  },

  // ── 12. PENTHOUSE LEVEL ──────────────────────────────────────────────────

  z02_r12: {
    id: 'z02_r12',
    zone: 'z02',
    name: 'PENTHOUSE LEVEL',
    description:
`The elevator requires a keycard for floors above 15. Above
15, the hallway carpet gets thicker. The lighting gets warmer.
The air gets cleaner. By the time you reach the penthouse
level, you're in a different city.

Open-plan apartments with floor-to-ceiling windows. Smart
furniture. A kitchen with real fruit — actual oranges. Art
on the walls that a person chose, not an algorithm.

The mesh is different here. Not stronger — subtler. Down
below, the mesh is a leash. Up here, it's a silk glove.
The people who live at this altitude don't feel managed.
They feel optimized.

One apartment is unlocked. The resident hasn't been home
in three days. The food in the refrigerator is expiring.
The mesh still shows their status as "active."`,
    exits: [
      { direction: 'down', targetRoom: 'z02_r09', description: 'down (Inner Boulevard — elevator)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'd9_plainclothes_penthouse', name: 'D9 Plainclothes', level: 8,
        description: 'Disguised as building security. Permanent watch over Helixion middle management.',
        hp: 34, attributes: { ...enemyAttrs(8), COOL: 6, GHOST: 5, REFLEX: 6 }, damage: 8, armorValue: 4,
        behavior: 'ambush', spawnChance: 0.0, count: [1, 1],
        drops: [
          { itemId: 'd9_credentials', chance: 0.15, quantityRange: [1, 1] },
          { itemId: 'surveillance_equipment', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 60,
      },
    ],
    objects: [
      {
        id: 'empty_apartment', name: 'empty apartment',
        examineText: "Three days. The food is turning. Fruit flies. The mesh shows the resident as 'active — compliance 99.2%.' But they're not here. Their toothbrush is dry. Their bed is made.",
        gatedText: [{ attribute: 'TECH', minimum: 6, text: "The apartment's internal mesh log shows a 'priority compliance appointment' three days ago. No return entry. The appointment was at the Mesh Clinic. The clinic has no record of their visit." }],
      },
      { id: 'real_fruit', name: 'real fruit', examineText: "Oranges. Actual oranges. The smell is overwhelming — sweet, acidic, alive. You haven't been near real citrus in months. This is what money buys in Helixion's city. Not freedom. Oranges." },
      { id: 'smart_furniture', name: 'smart furniture', examineText: "The chair adjusts when you sit. Lumbar support calibrated to your spine. The bed maintains optimal sleep temperature. Every surface is designed to make the occupant more productive. Comfort in service of output." },
      { id: 'penthouse_windows', name: 'penthouse windows', examineText: "The whole city spread below. From this height, the outer blocks look distant and small. The Fringe is a dark smear on the horizon. The Helixion tower rises to the north. You understand why the people who live here don't question anything. From this high up, the system looks like it works." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 13. ROOFTOP GARDEN ───────────────────────────────────────────────────

  z02_r13: {
    id: 'z02_r13',
    zone: 'z02',
    name: 'ROOFTOP GARDEN',
    description:
`You climb the fire escape past twelve floors of mid-block
apartments and emerge onto a rooftop that shouldn't exist.

A garden. A real garden. Raised beds built from reclaimed
wood and filled with actual soil — not hydroponic substrate,
not growing medium, but dirt. Tomatoes climbing bamboo
stakes. Herbs in clay pots. Leafy greens under salvaged
UV panels. A small cistern collecting rainwater.

A woman in her sixties kneels in the dirt, transplanting
seedlings with bare hands. She doesn't look up. She knows
you're here. She's deciding if she cares.

To the east, more rooftops. One of them has an antenna
that shouldn't be there.`,
    exits: [
      { direction: 'down', targetRoom: 'z02_r04', description: 'down (Mid Blocks — fire escape)' },
      { direction: 'east', targetRoom: 'z02_r14', description: 'east (Pirate Studio — rooftop crossing)' },
    ],
    npcs: [
      {
        id: 'mae', name: 'Mae', type: 'QUESTGIVER',
        faction: 'NONE',
        description: 'Rooftop gardener. Sixties. Weathered. Short sentences. Former biology teacher.',
        dialogue: "\"This is mine. I grew it. Not the mesh. Not Helixion. Me. My hands in the dirt. If you're going to stand there, make yourself useful and water the tomatoes.\"",
        startingDisposition: -5,
        services: ['quest', 'shop'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'raised_beds', name: 'raised beds', examineText: "Tomatoes. Actual tomatoes. Warm from the UV panels. Red and imperfect and real. Mae grows food that tastes like food used to taste. Before nutrient paste. Before Helixion optimized the human diet and removed everything that wasn't efficient." },
      { id: 'cistern', name: 'cistern', examineText: "Rainwater collection. Gravity-fed irrigation. Mae built this herself. It's not elegant. It works. The water tastes like sky — slightly acidic from the smog, but earned." },
      { id: 'rooftop_view', name: 'rooftop view', examineText: "The city. From this height, people are the apartments with lights on. The laundry on fire escapes. The sound of someone playing music too loud. Human from this angle." },
      { id: 'distant_antenna', name: 'distant antenna', examineText: "On a rooftop two buildings east. An antenna that doesn't match standard Helixion relay hardware. Improvised — salvaged components, irregular shape. Someone's broadcasting from that rooftop. The path across looks crossable if you're careful." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 14. PIRATE STUDIO ────────────────────────────────────────────────────

  z02_r14: {
    id: 'z02_r14',
    zone: 'z02',
    name: 'PIRATE STUDIO',
    description:
`Two rooftops east of Mae's garden, accessible by a narrow
catwalk someone welded between the buildings. The antenna
is larger up close — a Frankenstein assembly of satellite
dish fragments, copper coils, and repurposed Helixion relay
hardware, all feeding into a waterproof equipment case
bolted to the roof.

Inside a converted maintenance shed: screens, recording
equipment, a microphone, stacks of data chips, and a woman
who hasn't slept in two days and doesn't plan to start.

A hand-drawn sign on the shed door: "FREQUENCY UNKNOWN —
THE NEWS THEY DON'T WANT BROADCAST."`,
    exits: [
      { direction: 'west', targetRoom: 'z02_r13', description: 'west (Rooftop Garden — catwalk)' },
      { direction: 'up', targetRoom: 'z02_r15', description: 'up (Rooftop Access — ladder)' },
    ],
    npcs: [
      {
        id: 'asha_osei', name: 'Asha Osei', type: 'QUESTGIVER',
        faction: 'NONE',
        description: 'Underground journalist. Thirties. Intense. Runs "Frequency Unknown" — pirate data feed.',
        dialogue: "\"I don't care who you are. I care what you've seen. If it's true, I'll broadcast it. If it's not, get off my roof.\"",
        startingDisposition: 5,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'antenna_array', name: 'antenna array', examineText: "Asha built this from salvage. It broadcasts on a frequency the mesh doesn't monitor — a gap in the spectrum she found by accident. The broadcast range covers the residential blocks and part of the industrial district. She reaches maybe ten thousand people. It's enough." },
      { id: 'recording_equipment', name: 'recording equipment', examineText: "Old but functional. Physical recording media — not digital, not mesh-compatible. She records analog because analog can't be remotely wiped. Every source is stored on physical media in a fireproof case under the table." },
      { id: 'data_chip_stacks', name: 'data chip stacks', examineText: "Her archive. Months of stories. Disappearances. Compliance anomalies. D9 patrol patterns. A folder labeled 'CHRYSALIS?' with a question mark traced over so many times the ink is thick. She's been circling the truth without enough evidence to broadcast it." },
      {
        id: 'frequency_unknown_sign', name: 'frequency unknown sign',
        examineText: "'FREQUENCY UNKNOWN.' She chose the name because the gap in the spectrum she broadcasts through has no official designation.",
        gatedText: [{ attribute: 'GHOST', minimum: 5, text: "The gap she's broadcasting through is adjacent to 33hz. Not on it. Next to it. Like the frequency left room." }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 15. ROOFTOP ACCESS ───────────────────────────────────────────────────

  z02_r15: {
    id: 'z02_r15',
    zone: 'z02',
    name: 'ROOFTOP ACCESS',
    description:
`Above the Pirate Studio, a ladder leads to the highest point
on this building cluster — a flat concrete platform with
the city's rooftop infrastructure stretching in every
direction. Water tanks, HVAC units, antenna masts, and
the narrow catwalks and maintenance paths that connect
building to building across the skyline.

This is where the Rooftop Network begins. The signal pirates
and off-grid communities who live above the city use these
paths. From here, you can reach the Rooftop Network zone
and eventually the Helixion Tower rooftop far to the west.

The wind is strong. The mesh signal is weaker up here.
For the first time since entering the inner blocks, your
thoughts feel like they belong entirely to you.`,
    exits: [
      { direction: 'down', targetRoom: 'z02_r14', description: 'down (Pirate Studio)' },
      { direction: 'north', targetRoom: 'z07_r01', description: 'north (Rooftop Network)', zoneTransition: true, targetZone: 'z07' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'rooftop_panorama', name: 'rooftop panorama', examineText: "The whole city. Laundry on fire escapes. A child flying a kite from an outer block roof. Mae's garden, two buildings west, a patch of green in the gray. The city looks like it's trying to be alive despite everything built to prevent it." },
      { id: 'weakened_mesh', name: 'weakened mesh', examineText: "The mesh signal attenuates at this height. Fewer relay amplifiers. More electromagnetic interference from exposed HVAC and antenna equipment. Your thoughts clear. The subtle background hum you've been ignoring since you entered the inner blocks — you notice it now only because it's gone. That hum was the mesh. It was always the mesh." },
      { id: 'catwalk_entrance', name: 'catwalk entrance', examineText: "A narrow maintenance catwalk stretching between this building and the next. The Rooftop Network. A highway above the city used by people who decided the streets were too watched. The catwalks are old, some are missing sections, and the wind is merciless. But it's free." },
    ],
    isSafeZone: false,
    isHidden: false,
  },
};

export const ZONE_02: Zone = {
  id: 'z02',
  name: 'RESIDENTIAL BLOCKS',
  depth: 'surface',
  faction: 'NONE',
  levelRange: [5, 10],
  description: 'Where the general population lives. Mesh-controlled comfort. The cage with the nicest furniture.',
  atmosphere: {
    sound: 'Inner: ambient hum, curated music, calm. Outer: traffic, shouting, illegal speakers, dogs.',
    smell: 'Inner: synthetic fragrance, nothing organic. Outer: cooking food, exhaust, wet concrete, drainage grates.',
    light: 'Inner: clean white streetlamps, holographic ads. Outer: neon, flickering fluorescents, shadows.',
    temp: 'Climate-managed inner blocks. Weather-exposed outer blocks.',
  },
  rooms: Z02_ROOMS,
  originPoint: undefined,
};

// ── Zone Registry ───────────────────────────────────────────────────────────

const ZONE_REGISTRY: Record<string, Zone> = {
  z02: ZONE_02,
  z03: ZONE_03,
  z04: ZONE_04,
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
