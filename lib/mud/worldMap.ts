// lib/mud/worldMap.ts
// TUNNELCORE MUD — World Map
// Room definitions, zone registry, room lookups.
// Phase 1: Drainage Nexus (Zone 8, 14 rooms). Phase 2: Maintenance Tunnels (Zone 9, 11 rooms).
// Phase 3: Industrial District (Zone 3, 15 rooms). Phase 4: Residential Blocks (Zone 2, 15 rooms).
// Phase 5: Industrial Drainage (Zone 10, 10 rooms).
// Phase 6: Fight Pits (Zone 6, 8 rooms).
// Phase 7: Helixion Campus (Zone 1, 14 rooms).
// Phase 8: Rooftop Network (Zone 7, 12 rooms).
// Phase 9: Abandoned Transit (Zone 11, 18 rooms).
// Phase 10: Fringe Nomads (Zone 5, 10 rooms).
// Phase 11: Iron Bloom Server Farm (Zone 12, 10 rooms).
// Phase 12: Black Market Warrens (Zone 13, 10 rooms).
// Phase 13: The Substrate Level (Zone 14, 15 rooms).
// Phase 14: The Broadcast Tower (Zone 15, 12 rooms).

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
      {
        id: 'ketch', name: 'Ketch', type: 'SHOPKEEPER',
        faction: 'FREEMARKET',
        description: 'Cheerful in a way that\'s clearly performance. Freemarket fence — operates a small stall near the cooking fire. Everything has a price. Knows things he shouldn\'t.',
        dialogue: "\"Welcome, welcome! — New face, new opportunities. I deal in information, luxuries, and the occasional weapon that fell off a transport. — Everything's negotiable except my margin.\"",
        startingDisposition: 5,
        services: ['shop', 'info'],
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
      { direction: 'west', targetRoom: 'z10_r08', description: 'west (Industrial Drainage — Parish Outpost)', zoneTransition: true, targetZone: 'z10' },
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
      { direction: 'down', targetRoom: 'z10_r02', description: 'down (Industrial Drainage — East Access)', zoneTransition: true, targetZone: 'z10' },
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
      { direction: 'up', targetRoom: 'z01_r14', description: 'up (Helixion Campus — Service Sublevel)', zoneTransition: true, targetZone: 'z01' },
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
      { direction: 'up', targetRoom: 'z01_r14', description: 'up (Helixion Campus — Service Sublevel)', zoneTransition: true, targetZone: 'z01' },
      { direction: 'down', targetRoom: 'z11_r09', description: 'down (Abandoned Transit — North Platform)', zoneTransition: true, targetZone: 'z11' },
      { direction: 'in', targetRoom: 'z14_r05', description: 'in (Substrate Level — SL-3 elevator, Helixion credentials required)', locked: true, lockId: 'helixion_sl3_access', zoneTransition: true, targetZone: 'z14' },
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
      { direction: 'down', targetRoom: 'z11_r18', description: 'down (Abandoned Transit — Loop Terminal)', zoneTransition: true, targetZone: 'z11' },
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
      { direction: 'up', targetRoom: 'z07_r07', description: 'up (Rooftop Network — Cell Two)', zoneTransition: true, targetZone: 'z07' },
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
      { direction: 'east', targetRoom: 'z05_r01', description: 'east (The Fringe — The Perimeter)', zoneTransition: true, targetZone: 'z05' },
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

// ── Zone 10: Industrial Drainage ────────────────────────────────────────────

const Z10_ROOMS: Record<string, Room> = {

  // ── 1. INFLOW CHAMBER ─────────────────────────────────────────────────────

  z10_r01: {
    id: 'z10_r01',
    zone: 'z10',
    name: 'INFLOW CHAMBER',
    description:
`The runoff pipe from the surface opens into a concrete
chamber — four meters high, eight meters across, the
ceiling a lattice of drainage pipes converging from every
factory above. The pipes discharge continuously. Yellow-
orange liquid pours from the largest pipe — the Assembly
Line's output, the worst of it. Smaller pipes contribute
lesser streams: coolant, metal slurry, and something clear
that smells like burning plastic.

The streams converge in a central channel that runs the
length of the chamber, flowing south. The channel lining
is buckled, peeling. The concrete beneath already eaten.
Walkways on either side provide passage. Wet with spray
and condensation. The air is sharp.

The Chrome Wolves have installed ventilation — a duct
system drawing air from the surface through a shaft. It
helps. Above the chamber entrance, a spray-painted wolf
skull marks territory. Below the skull, smaller text:
"BREATHE SHALLOW."`,
    exits: [
      { direction: 'up', targetRoom: 'z03_r04', description: 'up (Industrial District — Runoff Channel)', zoneTransition: true, targetZone: 'z03' },
      { direction: 'east', targetRoom: 'z10_r02', description: 'east (East Access)' },
      { direction: 'south', targetRoom: 'z10_r03', description: 'south (Wolf Checkpoint)' },
    ],
    npcs: [
      {
        id: 'wolf_workers', name: 'Wolf Workers', type: 'NEUTRAL',
        faction: 'CHROME_WOLVES',
        description: 'Two Chrome Wolves loading supply crates from the surface. Chemical masks on. They use the chamber as a logistics hub — goods bypass the streets through the drainage pipe access shaft.',
        dialogue: "One glances up. \"Surface or tunnel?\" He goes back to work before you answer.",
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      { id: 'factory_discharge', name: 'factory discharge', examineText: 'Watch the pipes. Each one drains a different factory. The largest — the Assembly Line\'s output — pours yellow-orange liquid in a continuous stream. TECH ≥ 6: The color indicates heavy metal contamination and synthetic polymer waste. Carcinogenic. The Tower\'s construction generates waste that poisons everyone who lives below the Industrial District.' },
      { id: 'corrosion_damage', name: 'corrosion damage', examineText: 'The channel lining is failing. Designed for rain and sanitary waste, not this. The lining buckles. The concrete dissolves. TECH ≥ 5: At this rate, the channel wall will breach within two years. Water table contamination. Permanent.' },
      { id: 'wolf_ventilation', name: 'wolf ventilation', examineText: 'A duct system running from the surface. Rough engineering, functional. Draws clean air, vents the chemical atmosphere. Without it, the upper drainage would be uninhabitable. The territory below the Wolves has no ventilation.' },
      { id: 'breathe_shallow', name: 'breathe shallow', examineText: 'Spray-painted beneath the wolf skull. Practical advice. The chemical air is less concentrated above chest height — heavier compounds settle. The Wolves who work here do this instinctively. The adaptation costs something. They don\'t talk about what.' },
    ],
    isSafeZone: true,
    isHidden: false,
    traitDice: [{ name: 'VENTILATED', die: 6, benefitsActions: ['recover'], color: '#a5f3fc' }],
  },

  // ── 2. EAST ACCESS ────────────────────────────────────────────────────────

  z10_r02: {
    id: 'z10_r02',
    zone: 'z10',
    name: 'EAST ACCESS',
    description:
`A utility junction at the eastern edge of the upper
drainage. The shaft from the Maintenance Tunnels opens
here — a vertical climb through a cramped utility conduit
lined with cable runs and pipe. The junction is small,
functional, connecting two shallow undercity zones through
infrastructure that predates both.

The Chrome Wolves don't use this access point — too narrow
for comfortable passage and leads to territory they don't
control. But someone uses it. The conduit walls show scrape
marks from regular traversal. Someone moves between the
Maintenance Tunnels and the Industrial Drainage frequently
and quietly.`,
    exits: [
      { direction: 'up', targetRoom: 'z09_r01', description: 'up (Maintenance Tunnels — West Junction)', zoneTransition: true, targetZone: 'z09' },
      { direction: 'west', targetRoom: 'z10_r01', description: 'west (Inflow Chamber)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'utility_conduit', name: 'utility conduit', examineText: 'Vertical. Cramped. Cable runs and pipes line the walls, leaving just enough space for a person. Fifteen-meter climb. REFLEX ≥ 5 to traverse without difficulty. A back door between the Wolves\' drainage and the residential maintenance tunnels.' },
      { id: 'scrape_marks', name: 'scrape marks', examineText: 'Regular wear on the conduit walls. Same person, same hand placement, practiced movement. GHOST ≥ 5: The marks are recent. Within the last week. Someone is running a regular route between the Maintenance Tunnels and here. Fex\'s supply line passes through this junction.' },
      { id: 'cable_junction', name: 'cable junction', examineText: 'TECH ≥ 6: A fiber optic trunk passes through this junction — the same cable infrastructure that runs through the Maintenance Tunnels\' Cable Gallery. Carries mesh signal for the eastern factories. A signal tap here would intercept factory communication — production schedules, security protocols, shift changes.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'CRAMPED SHAFT', die: 6, benefitsActions: ['sneak'], hindersActions: ['flee'] }],
  },

  // ── 3. WOLF CHECKPOINT ────────────────────────────────────────────────────

  z10_r03: {
    id: 'z10_r03',
    zone: 'z10',
    name: 'WOLF CHECKPOINT',
    description:
`A reinforced gate across the main drainage corridor.
Chain-link topped with razor wire, a lockable door, and
two Chrome Wolves on the other side who aren't interested
in conversation until you've stated your business. The
checkpoint separates the inflow chamber from the stash
corridor and vault beyond, where only Wolf-approved
traffic passes.

The gate is serious hardware. The Wolves who guard it
are serious people. But a single point of control means
a single point of failure. The drainage tunnels branch.
The pipes connect. The infrastructure has redundancies
the gate doesn't cover.`,
    exits: [
      { direction: 'north', targetRoom: 'z10_r01', description: 'north (Inflow Chamber)' },
      { direction: 'east', targetRoom: 'z10_r04', description: 'east (The Wolf Vault)' },
      { direction: 'south', targetRoom: 'z10_r05', description: 'south (Manufacturing Bypass)' },
      { direction: 'down', targetRoom: 'z10_r06', description: 'down (Chemical Treatment Station)' },
    ],
    npcs: [
      {
        id: 'wolf_guards', name: 'Wolf Guards', type: 'NEUTRAL',
        faction: 'CHROME_WOLVES',
        description: 'Two Chrome Wolves. Armed. Augmented. They check credentials — Wolf reputation, Rade\'s invitation, Voss\'s word. Without standing, access is denied.',
        dialogue: "\"Name. Business. Duration.\" The guard doesn't look up from the clipboard.",
        startingDisposition: 0,
      },
      {
        id: 'cutter', name: 'Cutter', type: 'SHOPKEEPER',
        faction: 'CHROME_WOLVES',
        description: 'Behind the gate. Clipboard in hand. Forties. Methodical. The least Wolf-like Wolf in the organization — quiet, organized, obsessive about inventory.',
        dialogue: "\"Name. Business. Duration. — Don't look at me like that. I track everything that comes through here. People included. You're item number 847 this month.\"",
        services: ['quest', 'shop', 'info'],
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      {
        id: 'the_gate', name: 'the gate', examineText: 'Chain-link, razor wire, lockable door. Functional, not elegant. It works because the guards work.',
        gatedText: [{ attribute: 'GHOST', minimum: 6, text: 'A drainage pipe runs beneath the gate\'s foundation. Ankle-deep in runoff, requires crawling. The guards know about it. They check it hourly. Timing matters.' }],
      },
      {
        id: 'stash_inventory', name: 'stash inventory', examineText: 'Crates stacked along the corridor behind the gate. Each labeled in Cutter\'s handwriting — contents, date received, source. Weapons, augmentation hardware, medical supplies, communication equipment. A small army\'s logistics depot.',
      },
      {
        id: 'checkpoint_log', name: 'checkpoint log', examineText: 'A physical log. Every person timestamped.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'One name appears at irregular intervals — \'GRID, maintenance, 2hr.\' Grid is not a Wolf name. Someone is entering the stash rooms under a false identity. The log entries are formatted correctly. Someone who knows the system is using it against itself.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 4. THE WOLF VAULT ─────────────────────────────────────────────────────

  z10_r04: {
    id: 'z10_r04',
    zone: 'z10',
    name: 'THE WOLF VAULT',
    description:
`Behind a steel door with a combination lock — analog, no
electronics — the Wolves keep what matters most. A
reinforced chamber, originally a drainage pump control
room, converted into secure storage. The walls are concrete
lined with salvaged metal sheeting. The floor is dry —
elevated above the drainage channels, sealed. The
ventilation system serves this room first.

The vault is organized into sections. Weapons along the
east wall. Augmentation hardware on racks along the north
wall — chrome limbs, neural interfaces, dermal plating,
eyes that watch you from jars of preservation fluid. A
safe at the back.

And in the center, on a table, something that doesn't fit
any category: a piece of hardware that isn't Wolf-
manufactured, isn't Helixion-manufactured, and isn't
anything Cutter can identify. Voss brought it. Voss said
nothing about it. It sits on the table and it hums.`,
    exits: [
      { direction: 'west', targetRoom: 'z10_r03', description: 'west (Wolf Checkpoint)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'weapons_rack', name: 'weapons rack', examineText: 'Organized by type. Kinetic, energy, bladed. A chrome-edged sword that\'s either an artifact or an indulgence. The armory of a faction preparing for something more than street fights.' },
      {
        id: 'augmentation_hardware', name: 'augmentation hardware', examineText: 'Chrome limbs. Neural interface chips. Dermal plating. Eyes in preservation fluid.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'Some of this hardware is military-grade — not street-level augmentation. The source isn\'t Needle\'s chop shop. This came from Helixion military contracts, diverted. The Wolves have a supply line inside Helixion\'s defense manufacturing.' }],
      },
      {
        id: 'the_safe', name: 'the safe', examineText: 'Heavy. Analog lock. Two people have the combination: Cutter and Voss.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'Scratches around the lock. Someone tried to access it. Amateur — wrong tools, wrong approach. The safe wasn\'t opened. But someone tried.' }],
      },
      {
        id: 'unidentified_hardware', name: 'unidentified hardware', examineText: 'A device roughly the size of a human torso — cylindrical, dark material that isn\'t metal and isn\'t organic but behaves like both. Crystallized growth patterns on the surface. It hums at 33hz.',
        gatedText: [
          { attribute: 'TECH', minimum: 8, text: 'A Substrate resonance amplifier — not manufactured like the Assembly Line produces, but NATURAL. Grown. This is Substrate architecture, removed from its source. Still active. Still resonating. It might still be connected to whatever it grew from.' },
          { attribute: 'GHOST', minimum: 7, text: 'The device is warm. Body temperature. The hum isn\'t mechanical. It\'s rhythmic. Like breathing. Like a heartbeat. The Wolves are keeping a piece of the Substrate in their vault, and the Substrate might be keeping track of where it is.' },
        ],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 5. MANUFACTURING BYPASS ───────────────────────────────────────────────

  z10_r05: {
    id: 'z10_r05',
    zone: 'z10',
    name: 'MANUFACTURING BYPASS',
    description:
`A narrow drainage channel branching south from the main
corridor — unmarked, partially concealed behind a buckled
wall panel. The runoff here is thicker, darker, warmer.
The pipes above are insulated with material the other
pipes don't have. This channel doesn't appear on the
Wolves' maps.

This channel connects directly to the Assembly Line's
drainage — not the general factory runoff, but a separate,
dedicated channel carrying what the Assembly Line produces
before it reaches the official waste stream. The official
waste is bad. This is worse.

The bypass exists because the Assembly Line generates
compounds that exceed even Helixion's tolerance for
environmental contamination. Routed through a dedicated
channel to dilute before joining the general drainage.
The dilution works. The evidence doesn't entirely
disappear. But it becomes deniable.`,
    exits: [
      { direction: 'north', targetRoom: 'z10_r03', description: 'north (Wolf Checkpoint)' },
    ],
    npcs: [
      {
        id: 'acre', name: 'Acre', type: 'SHOPKEEPER',
        faction: 'INDEPENDENT',
        description: 'At the channel\'s widest point, working with collection containers. Fifties. Gaunt. Skin discolored from years of chemical exposure — faint yellow around the eyes.',
        dialogue: "\"Careful where you step. That puddle is sulfuric acid and something I haven't identified yet. The something is the interesting part. — You need chemicals? I have chemicals. You need to know what's killing you? I can tell you that too.\"",
        services: ['quest', 'shop', 'info'],
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      {
        id: 'dedicated_channel', name: 'dedicated channel', examineText: 'Narrower than the main drainage. The pipes above are insulated. The runoff is darker, warmer, thicker. Almost black.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The compounds include organic catalysts — chemicals designed to break down biological material at the molecular level. This isn\'t manufacturing waste. This is biochemical processing discharge.' }],
      },
      {
        id: 'insulated_pipes', name: 'insulated pipes', examineText: 'The insulation is recent — installed within the last two years.',
        gatedText: [{ attribute: 'TECH', minimum: 6, text: 'The material is the same sound-dampening insulation used in Helixion\'s laboratory wing. Insulated to prevent signal leakage. The compounds emit electromagnetic signatures that could be detected by the pirate network\'s spectrum analyzers. Helixion doesn\'t want anyone knowing what\'s in this channel.' }],
      },
      { id: 'collection_containers', name: 'collection containers', examineText: 'Acre\'s workspace. Glass and ceramic — she doesn\'t use metal because the compounds corrode it. Labels in her handwriting: \'STANDARD COOLANT,\' \'METAL SLURRY — FILTERED,\' \'UNKNOWN — DO NOT OPEN,\' \'ASSEMBLY LINE DIRECT — USE GLOVES.\' The containers labeled \'UNKNOWN\' are warm.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 6. CHEMICAL TREATMENT STATION ─────────────────────────────────────────

  z10_r06: {
    id: 'z10_r06',
    zone: 'z10',
    name: 'CHEMICAL TREATMENT STATION',
    description:
`The transition between levels. A pre-Helixion water
treatment facility — built when the Industrial District
was constructed, designed to purify drainage before it
reached the water table. Four treatment tanks, each a
cylinder five meters in diameter. Chemical injection
systems. Filtration banks. A control room with manual
gauges and physical switches.

The station is broken. Tank Two has a ruptured wall —
runoff flows through it unfiltered. Tank Four's
filtration bank has been clogged for years. The chemical
injection system is empty — the neutralizing agents
haven't been replenished since before Helixion absorbed
the district's infrastructure. The control room lights
still work because the station has its own dedicated
power circuit. Everything else is failure.

The untreated runoff pours through and continues downward
— into the corroded tunnels, through the flooded gallery,
past the Parish outpost, and into the Drainage Nexus.
Everything the Parish drinks passed through this room.
This room could have cleaned it. This room doesn't.

Until now.`,
    exits: [
      { direction: 'up', targetRoom: 'z10_r03', description: 'up (Wolf Checkpoint)' },
      { direction: 'south', targetRoom: 'z10_r07', description: 'south (Corroded Tunnels)' },
    ],
    npcs: [
      {
        id: 'brine', name: 'Brine', type: 'ALLIED',
        faction: 'THE_PARISH',
        description: 'In the treatment station control room, studying the equipment. Thirties. Lean, scarred. The Parish cough is audible — a wet rattle in her chest that punctuates her sentences.',
        dialogue: "\"I followed the water. Upstream, always upstream. And I found — *cough* — I found this. The machine that could have saved us. It's been here the whole time. Broken. Waiting.\"",
        services: ['quest', 'info'],
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      { id: 'treatment_tanks', name: 'treatment tanks', examineText: 'Four cylinders, five meters in diameter. Tank One: operational but inactive. Tank Two: ruptured wall, bypass route for untreated runoff. Tank Three: intact, seals dry. Tank Four: clogged filtration bank. The infrastructure exists. The maintenance doesn\'t.' },
      {
        id: 'control_room', name: 'control room', examineText: 'Manual gauges and physical switches. Pre-digital. The station predates Helixion\'s absorption of the district. The lights work. The gauges show readings that would horrify anyone who understood them.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The system is repairable. Tank Two needs a new filter. The injection system needs neutralizing agent. The pump needs a motor. Three components, and this station runs again. Clean water for the Parish. The fix is right here. It\'s been right here for fifteen years.' }],
      },
      { id: 'operations_manual', name: 'operations manual', examineText: 'Laminated pages in a binder. Water treatment procedures, chemical handling protocols, emergency shutdown. Dated thirty-two years ago. The last maintenance entry is from fifteen years ago — the same year Helixion absorbed the district. \'System handoff to Helixion Environmental Division. Pending new operator assignment.\' The assignment never came.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'UNSTABLE MACHINERY', die: 8, benefitsActions: ['hack'], hindersActions: ['flee'], color: '#fbbf24' }],
  },

  // ── 7. CORRODED TUNNELS ───────────────────────────────────────────────────

  z10_r07: {
    id: 'z10_r07',
    zone: 'z10',
    name: 'CORRODED TUNNELS',
    description:
`Below the treatment station, the infrastructure
deteriorates. The tunnels here are older — pre-district,
the original drainage for whatever occupied this ground
before the factories. The concrete walls are pitted and
scarred by decades of chemical exposure. In places the
corrosion has eaten through entirely, exposing chemical-
stained soil that crumbles to the touch.

The runoff is ankle-deep and the wrong color. The air
burns. Without the Wolves' ventilation system — which
doesn't extend to the lower level — the concentration
is high enough to cause damage over time. A chemical
mask reduces this. Full hazmat eliminates it.

Things move in the chemical dark. Shapes that were human
once. Their augmentations corroded by exposure — chrome
turned green, joints seized, optical implants flickering.
The corroded ferals. They're in pain. The chemicals are
eating their implants and the tissue interfaces are
failing. They attack because everything hurts and you're
there.`,
    exits: [
      { direction: 'north', targetRoom: 'z10_r06', description: 'north (Chemical Treatment Station)' },
      { direction: 'east', targetRoom: 'z10_r08', description: 'east (Parish Outpost)' },
      { direction: 'south', targetRoom: 'z10_r09', description: 'south (Flooded Gallery)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'corroded_feral', name: 'Corroded Feral', level: 9,
        description: 'Former human. Chrome turned green, joints seized, optical implants flickering with damaged light. Pain-driven, erratic.',
        hp: 30, attributes: { ...enemyAttrs(9), BODY: 6, REFLEX: 5 }, damage: 9, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0.7, count: [1, 2],
        drops: [
          { itemId: 'corroded_augment', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'chemical_residue', chance: 0.4, quantityRange: [1, 2] },
        ],
        xpReward: 45,
      },
    ],
    objects: [
      { id: 'chemical_crystals', name: 'chemical crystals', examineText: 'Crystallized compound deposits on walls and ceiling. Sharp, fragile, chemically active. TECH ≥ 6: Some are valuable — industrial reagents in solid form. Acre would pay well. Harvesting releases a burst of corrosive vapor.' },
      { id: 'feral_nest', name: 'feral nest', examineText: 'A depression in the corridor wall, expanded by clawing. Inside: scraps of clothing, wiring, a corroded employee badge. The nests contain human objects — a shoe, a photograph destroyed by chemical exposure, a tool they can\'t use anymore. Memorials built by people who\'ve forgotten what they\'re mourning.' },
      { id: 'collapse_debris', name: 'collapse debris', examineText: 'Concrete and rebar. The ceiling gave way — chemical corrosion weakened the structure. Debris blocks the corridor but not completely. Gaps large enough to see through. FORCE ≥ 5 or tools to clear a passage. The work makes noise. Noise attracts the corroded ferals.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'CHEMICAL FOG', die: 8, benefitsActions: ['sneak'], hindersActions: ['attack', 'scan'], color: '#c084fc' }],
    environmentalClocks: [
      {
        id: 'z10_r07_chemical',
        name: 'CHEMICAL EXPOSURE',
        segments: 6,
        category: 'environment',
        color: '#fbbf24',
        visible: true,
        persistent: false,
        onFill: { type: 'environmental_effect', payload: { envType: 'chemical' } },
      },
    ],
  },

  // ── 8. PARISH OUTPOST ─────────────────────────────────────────────────────

  z10_r08: {
    id: 'z10_r08',
    zone: 'z10',
    name: 'PARISH OUTPOST',
    description:
`A small alcove off the corroded tunnels, sealed with
salvaged plastic sheeting that creates a marginally
breathable space. Inside: water testing equipment —
basic, manual, the kind that uses color-change reagent
strips. Sample containers. A cot. A Parish symbol
scratched into the wall — three horizontal lines, the
water mark.

This is the Parish's upstream monitoring station.
Someone from the Nexus comes here on rotation — weekly —
to test the water before it reaches Parish territory.
They record the chemical levels, note changes, and report
to Elder Josiah. The data has been getting worse. Every
test, every week, the numbers climb.

The sheeting has been replaced several times — old patches
visible beneath new layers. The Parish maintains this
outpost because knowing how bad the water is matters,
even when knowing doesn't change anything. Information
is the first step. The second step is harder.`,
    exits: [
      { direction: 'west', targetRoom: 'z10_r07', description: 'west (Corroded Tunnels)' },
      { direction: 'east', targetRoom: 'z08_r09', description: 'east (Drainage Nexus — West Overflow)', zoneTransition: true, targetZone: 'z08' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'water_testing_equipment', name: 'water testing equipment', examineText: 'Color-change reagent strips. Manual spectrophotometer — the analog kind. Sample bottles labeled by date. The most recent readings are pinned to a board. The numbers mean nothing without context. With context, they mean the Parish is being slowly poisoned by the factories above.' },
      { id: 'parish_symbol', name: 'parish symbol', examineText: 'Three horizontal lines scratched into the wall. The water mark. The Parish uses it to mark safe territory — or territory they claim responsibility for. This far upstream, the mark is more aspiration than fact.' },
      { id: 'chemical_log', name: 'chemical log', examineText: 'A notebook. Handwritten entries, one per week. Cadmium levels rising. pH dropping. A new compound appeared six months ago — marked with a question mark. Brine\'s last entry: "numbers worse. going upstream to find source. if I don\'t come back, tell Josiah the station exists. it can be fixed."' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 9. FLOODED GALLERY ────────────────────────────────────────────────────

  z10_r09: {
    id: 'z10_r09',
    zone: 'z10',
    name: 'FLOODED GALLERY',
    description:
`The corridor descends into liquid. Not water — liquid.
Yellow-orange, opaque, warm. The chemicals have pooled
in a gallery — a wide, low-ceilinged space that was once
a distribution junction. The ceiling is two meters above
the surface. Waist-deep at the edges, chest-deep at the
center, unknown depth at the far end where the floor
drops away.

The liquid glows. Faintly, from below. Not the chemical
luminescence of the corroded tunnels — something
different. Something beneath the toxic water is emitting
light. Steady, rhythmic, pulsing at a frequency you
recognize before you consciously count it.

33hz.

The light comes from the bottom. Shapes visible through
the opaque liquid — edges, angles, surfaces too regular
to be infrastructure and too large to be debris. Something
is built down there. Something that predates the drainage
system.`,
    exits: [
      { direction: 'north', targetRoom: 'z10_r07', description: 'north (Corroded Tunnels)' },
      { direction: 'south', targetRoom: 'z10_r10', description: 'south (The Deep Drain)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'corroded_feral_armored', name: 'Corroded Feral (Armored)', level: 11,
        description: 'Partially submerged. Its corroded augmentations have fused with chemical deposits, creating a crystallized shell. Slower but significantly tougher.',
        hp: 50, attributes: { ...enemyAttrs(11), BODY: 8, REFLEX: 3 }, damage: 11, armorValue: 7,
        behavior: 'aggressive', spawnChance: 0.6, count: [1, 1],
        drops: [
          { itemId: 'crystallized_component', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'chemical_reagent', chance: 0.4, quantityRange: [1, 2] },
        ],
        xpReward: 75,
      },
    ],
    objects: [
      {
        id: 'the_glow', name: 'the glow', examineText: 'Below the surface. Through the opaque chemical liquid, light pulses. Slow, steady, 33hz. The liquid is warmer where the glow is strongest.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'The shape is visible as a shadow within the glow — geometric. Angular. Too regular for geology. Too large for equipment. Substrate architecture. Something was built here — or grew here — before the drainage system, before the factories, before the city.' }],
      },
      { id: 'toxic_liquid', name: 'toxic liquid', examineText: 'Yellow-orange. Opaque. Warm. Immersion deals continuous damage. Wading: slow HP drain. Swimming: worse. The upgraded mask doesn\'t help — the liquid contacts skin. Chemical neutralizer from Acre reduces damage.' },
      { id: 'submerged_shapes', name: 'submerged shapes', examineText: 'Through the liquid, edges and angles. The gallery sits above a natural depression — and the depression exists because something was placed in it, long before the city was built on top. The chemicals pooled here by accident. What they pooled above was no accident.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'TOXIC DEEP WATER', die: 10, hindersActions: ['flee', 'attack'], color: '#f87171' }],
    environmentalClocks: [
      {
        id: 'z10_r09_chemical',
        name: 'CHEMICAL EXPOSURE',
        segments: 6,
        category: 'environment',
        color: '#fbbf24',
        visible: true,
        persistent: false,
        onFill: { type: 'environmental_effect', payload: { envType: 'chemical' } },
      },
    ],
  },

  // ── 10. THE DEEP DRAIN ────────────────────────────────────────────────────

  z10_r10: {
    id: 'z10_r10',
    zone: 'z10',
    name: 'THE DEEP DRAIN',
    description:
`The floor falls away.

Past the flooded gallery, the drainage infrastructure
ends and the earth opens. A natural fissure in the rock
— widened by water erosion over centuries, now carrying
the combined chemical runoff of the entire Industrial
District into the darkness below. Five meters across,
descending steeply. The liquid pours over the edge in a
chemical waterfall — orange-yellow cascade, steaming
where it contacts the cooler air from below.

The sound is the waterfall. Constant, enormous, echoing.
The air rising from the fissure is warmer — the
temperature differential creates a fog where the two air
masses meet. The fog is chemical. The zone's final hazard.

But the air from below carries something else. The 33hz
frequency, amplified by the fissure's acoustics. The
vibration rises through the rock, through the waterfall,
through the fog. Below the Industrial Drainage, below
the shallow undercity, the Abandoned Transit system
waits.

A set of maintenance rungs — corroded but holding — leads
down the fissure wall, adjacent to the waterfall. They
descend into the fog. Into the deep.`,
    exits: [
      { direction: 'north', targetRoom: 'z10_r09', description: 'north (Flooded Gallery)' },
      { direction: 'down', targetRoom: 'z11_r07', description: 'down (Abandoned Transit — East Descent)', zoneTransition: true, targetZone: 'z11' },
    ],
    npcs: [
      {
        id: 'strand', name: 'Strand', type: 'NEUTRAL',
        faction: 'CHROME_WOLVES',
        description: 'On a ledge beside the fissure, below the fog line. Twenties. Chrome is fresh — recently installed, already corroding at the joints. Clutching a device with photographs. Been here three days.',
        dialogue: "\"Don't go back up. Don't tell them I'm here. — I know things. About Voss. About the Wolves. About what we really are. I have proof. I need someone who isn't a Wolf to hear this.\"",
        services: ['quest', 'info'],
        startingDisposition: -20,
      },
    ],
    enemies: [],
    objects: [
      { id: 'chemical_waterfall', name: 'chemical waterfall', examineText: 'The combined drainage of the Industrial District, pouring into the earth. Orange-yellow. Steaming. Three meters wide, falling for an indeterminate distance. Every chemical, every compound, every molecule of the Assembly Line\'s waste. It falls into the deep and the deep receives it.' },
      { id: 'the_fissure', name: 'the fissure', examineText: 'Natural. Not cut, not drilled. A crack in the bedrock widened by water over centuries. The fissure predates the city. The original engineers found it and used it as a discharge point. They didn\'t ask what was below.' },
      { id: 'maintenance_rungs', name: 'maintenance rungs', examineText: 'Metal rungs set into the fissure wall. Corroded but functional — heavier gauge than standard. REFLEX ≥ 6 to descend safely. Wet with chemical spray. The fog reduces visibility to two meters. You climb by feel. The 33hz vibration gets stronger with every meter of descent.' },
      { id: 'strand_ledge', name: 'strand ledge', examineText: 'A natural shelf in the fissure wall. Just wide enough for a person. Food wrappers — Wolf rations, the last of what he grabbed. Water bottle, empty. Eyes red from the chemical fog. His chrome arm is already corroding at the joints. He holds the device with the photographs in both hands. He hasn\'t let go since he ran.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'CHEMICAL WATERFALL', die: 10, hindersActions: ['attack', 'scan', 'flee'], color: '#ff6b6b' }],
    environmentalClocks: [
      {
        id: 'z10_r10_chemical',
        name: 'CHEMICAL EXPOSURE',
        segments: 6,
        category: 'environment',
        color: '#fbbf24',
        visible: true,
        persistent: false,
        onFill: { type: 'environmental_effect', payload: { envType: 'chemical' } },
      },
    ],
  },
};

export const ZONE_10: Zone = {
  id: 'z10',
  name: 'INDUSTRIAL DRAINAGE',
  depth: 'shallow',
  faction: 'CHROME_WOLVES',
  levelRange: [7, 12],
  description: 'Everything pours downhill. Factory waste drains through Wolf-controlled upper tunnels into toxic lower infrastructure. The broken treatment station poisons the Parish downstream.',
  atmosphere: {
    sound: 'Upper: liquid flow, Wolf activity, factory thrum above. Lower: dripping, chemical hissing, something breathing in the dark.',
    smell: 'Acrid, metallic, sharp enough to taste. Upper level manageable. Lower level burns.',
    light: 'Upper: Wolf work lights, orange and white. Lower: chemical luminescence, yellow-orange glow from the runoff itself.',
    temp: 'Warm from chemical reactions. Gets warmer descending. The Deep Drain fog is hot.',
  },
  rooms: Z10_ROOMS,
  originPoint: undefined,
};

// ── Zone 06: Fight Pits ─────────────────────────────────────────────────────

const Z06_ROOMS: Record<string, Room> = {

  // ── 1. THE APPROACH ─────────────────────────────────────────────────────

  z06_r01: {
    id: 'z06_r01',
    zone: 'z06',
    name: 'THE APPROACH',
    description:
`The beaten dirt path from the Industrial District leads
through a gap in rusted fencing into the waste ground.
The water treatment plant is ahead — squat concrete
buildings, settling basins, the infrastructure of a city
that used to clean its water. Now the basins hold something
else and the sound coming from inside tells you exactly
what.

The crowd noise is rhythmic. A fight is happening. You
can hear the announcer's voice — amplified, distorted by
the concrete acoustics — calling the action. A roar from
the crowd. Someone just went down.

People stream in through gaps in the perimeter — no formal
entrance, no tickets. Payment is inside. The path is
worn by hundreds of feet. Neon strips have been wired
to the fencing, powered by a generator you can hear but
not see. Pink and orange. The Wolves' colors.

A sign, spray-painted on a concrete slab propped against
the fence: "WHAT HAPPENS IN THE PIT STAYS IN THE PIT.
EVERYTHING ELSE IS YOUR PROBLEM."`,
    exits: [
      { direction: 'east', targetRoom: 'z03_r15', description: 'east (Industrial District — District Border)', zoneTransition: true, targetZone: 'z03' },
      { direction: 'south', targetRoom: 'z06_r02', description: 'south (The Betting Floor)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'the_sign', name: 'the sign', examineText: '\'WHAT HAPPENS IN THE PIT STAYS IN THE PIT. EVERYTHING ELSE IS YOUR PROBLEM.\' The pits\' only rule. Inside the complex, Rade\'s enforcers keep order. Outside, you\'re on your own. The sign is also a disclaimer — if you get hurt in the ring, that\'s the arrangement. You walked in. Nobody made you.' },
      { id: 'neon_fencing', name: 'neon fencing', examineText: 'Pink and orange strips wired to the chain-link. Chrome Wolf colors. The power comes from a generator around the back. The neon turns the waste ground from abandoned infrastructure to venue. Deliberate showmanship — the walk from the Industrial District to the pits is designed to build anticipation.' },
      { id: 'crowd_mix', name: 'crowd mix', examineText: 'Chrome Wolves — obvious, loud, chrome glinting. Dock workers in high-vis. A man with Iron Bloom ink he thinks he\'s hiding under his sleeve. Two Freemarket vendors carrying cases of merchandise. A woman with Helixion mesh compliance indicators — off-duty, off-the-record. The pits are the city\'s only neutral ground because everyone needs a place where the rules don\'t apply.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 2. THE BETTING FLOOR ────────────────────────────────────────────────

  z06_r02: {
    id: 'z06_r02',
    zone: 'z06',
    name: 'THE BETTING FLOOR',
    description:
`The settling basin's observation deck, repurposed as a
grandstand. Concrete tiers ring the pit below — four meters
down, floodlit, the arena visible from every angle. The
tiers are packed: people standing, sitting on the concrete
lips, leaning against the railing. The noise is enormous.

Between the spectators, the economy operates. A bar — planks
across chemical drums, bottles behind it, a bartender
pouring without looking. Food vendors with portable grills.
And the betting operation: a long table staffed by three
people, whiteboards covered in odds, names, and numbers
that update between every fight.

The announcer's booth is elevated above the tiers — a
scaffold platform with a microphone and a clear sightline
to the pit. The voice that echoes off every surface in
the complex comes from here.

You look down into the pit. Two fighters circle each other.
One has chrome arms. The other has nothing but speed and a
knife that's too small for the job. The crowd leans forward.
Everyone has money on this.`,
    exits: [
      { direction: 'north', targetRoom: 'z06_r01', description: 'north (The Approach)' },
      { direction: 'south', targetRoom: 'z06_r03', description: 'south (The Pit — stairs into the basin)' },
      { direction: 'east', targetRoom: 'z06_r06', description: 'east (The Chop Shop)' },
    ],
    npcs: [
      {
        id: 'spit', name: 'Spit', type: 'SHOPKEEPER',
        faction: 'CHROME_WOLVES',
        description: 'The bookie. Forties. Fast-talking, fast with numbers. Missing two fingers on his left hand — payment for a debt he didn\'t settle fast enough. Three assistants handle the crowd. Spit handles the odds.',
        dialogue: '"Odds on Chrome Jaw are three-to-one against. Moth\'s the favorite but she\'s nursing a rib. You want action or you want information? Both cost. Information costs more."',
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
      {
        id: 'calloway', name: 'Calloway', type: 'NEUTRAL',
        faction: 'CHROME_WOLVES',
        description: 'The announcer. Fifties. Big voice, bigger personality. Elevated scaffold booth, microphone, clear sightline. Eight years of calling every fight. The sound of the pits.',
        dialogue: '"Ladies and gentlemen and whatever the hell the rest of you are — we have a NEW FACE in the pit tonight! Fresh from the streets! Untested! Unbroken! Let\'s see how long THAT lasts!"',
        startingDisposition: 10,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'betting_board', name: 'betting board', examineText: 'Three whiteboards. Tonight\'s card: CHROME JAW vs. MOTH — 3:1. DEADSWITCH vs. THE SILENCER — even money. OPEN CHALLENGE — 5:1 against any taker. The odds shift between fights as Spit processes new bets. Names that don\'t come back get crossed out. Spit doesn\'t erase them.' },
      { id: 'the_bar', name: 'the bar', examineText: 'Planks on chemical drums. Six different bottles, none labeled. The bartender pours by color. The drinks are strong and probably not safe and nobody cares. The bar runs on the honor system — you drink, you pay, or Rade\'s people have a conversation with you. Nobody stiffs the bar twice.' },
      { id: 'the_view_down', name: 'the view down', examineText: 'Four meters below: the pit. Concrete basin, twenty meters across, floodlit from above. The floor is stained. The walls are scarred with impact marks. Two fighters circling. The one with chrome arms is bigger. The one with the knife is faster. The crowd knows who\'s going to win. The fighters don\'t. That\'s what makes it worth watching.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 3. THE PIT ──────────────────────────────────────────────────────────

  z06_r03: {
    id: 'z06_r03',
    zone: 'z06',
    name: 'THE PIT',
    description:
`The basin floor. You're in it now.

Twenty meters across. Four meters deep. Concrete walls on
every side — smooth, featureless, no handholds. The only
way out is the stairs you came down, and during a match,
those stairs have an enforcer standing at the top. The
floodlights above turn the pit into a stage — every
movement visible, every shadow eliminated. You can't hide
down here. You can only fight.

The floor is concrete, cracked in places, stained in others.
The stains are rust-colored. Some are fresh. The air smells
like sweat and iron and the chemical residue that still
seeps through the old treatment basin's joints.

The crowd above is a wall of faces and noise. From down
here, looking up, they're silhouettes against the
floodlights. Anonymous. Hungry. They paid to see someone
bleed. They don't care whose blood it is.`,
    exits: [
      { direction: 'up', targetRoom: 'z06_r02', description: 'up (The Betting Floor — stairs)' },
      { direction: 'east', targetRoom: 'z06_r04', description: 'east (Fighter Prep)' },
      { direction: 'down', targetRoom: 'z06_r07', description: 'down (Back Rooms)' },
    ],
    npcs: [
      {
        id: 'pit_crew', name: 'Pit Crew', type: 'NEUTRAL',
        faction: 'CHROME_WOLVES',
        description: 'Two workers with mops and buckets. They clean between fights. Quick, efficient. They do this ten times a night and don\'t look at what they\'re mopping.',
        dialogue: '"Match is over. Clear out or watch from the stands. We got work."',
        startingDisposition: 0,
        services: [],
      },
    ],
    enemies: [
      {
        id: 'pit_fighter_t1', name: 'Pit Fighter (Fresh)', level: 6,
        description: 'Scrappers. Improvised weapons, no augmentation. They fight because they need the money. They\'re not good. They\'re willing.',
        hp: 22, attributes: { ...enemyAttrs(6), BODY: 5, REFLEX: 4 }, damage: 6, armorValue: 1,
        behavior: 'aggressive', spawnChance: 0, count: [1, 1],
        drops: [
          { itemId: 'pit_purse_t1', chance: 1.0, quantityRange: [1, 1] },
        ],
        xpReward: 40,
        tier: 1,
        harmSegments: 4,
        armorSegments: 2,
        attackDice: [6],
      },
      {
        id: 'pit_fighter_t2', name: 'Pit Fighter (Regular)', level: 8,
        description: 'Experienced. Some augmentation — chrome arm, enhanced reflexes, subdermal plating. Named: CHROME JAW, MOTH, DEADSWITCH. They have reputations.',
        hp: 32, attributes: { ...enemyAttrs(8), BODY: 6, REFLEX: 6 }, damage: 8, armorValue: 3,
        behavior: 'aggressive', spawnChance: 0, count: [1, 1],
        drops: [
          { itemId: 'pit_purse_t2', chance: 1.0, quantityRange: [1, 1] },
        ],
        xpReward: 60,
        tier: 2,
        harmSegments: 6,
        armorSegments: 4,
        attackDice: [8, 6],
      },
      {
        id: 'pit_fighter_t3', name: 'Pit Fighter (Circuit)', level: 10,
        description: 'Professional. Heavily augmented. They fight for reputation, not money. THE SILENCER — precise. WRECKER — demolition.',
        hp: 45, attributes: { ...enemyAttrs(10), BODY: 7, REFLEX: 7 }, damage: 11, armorValue: 5,
        behavior: 'aggressive', spawnChance: 0, count: [1, 1],
        drops: [
          { itemId: 'pit_purse_t3', chance: 1.0, quantityRange: [1, 1] },
          { itemId: 'rare_salvage', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 90,
        tier: 3,
        harmSegments: 8,
        armorSegments: 4,
        attackDice: [10, 6],
      },
      {
        id: 'pit_beast', name: 'Pit Beast', level: 9,
        description: 'Feral augment. Drugged and dropped into the ring. Erratic, dangerous, tragic. The crowd loves it. The fighters don\'t.',
        hp: 35, attributes: { ...enemyAttrs(9), BODY: 7, REFLEX: 5 }, damage: 11, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0, count: [1, 1],
        drops: [
          { itemId: 'pit_purse_t2', chance: 0.8, quantityRange: [1, 1] },
          { itemId: 'damaged_implant', chance: 0.5, quantityRange: [1, 1] },
        ],
        xpReward: 70,
        tier: 2,
        harmSegments: 6,
        armorSegments: 2,
        attackDice: [10],
      },
      {
        id: 'the_current', name: 'The Current (Sera)', level: 12,
        description: 'The champion. Late twenties. Lean, explosive. Chrome left arm — precision-built, Costa\'s work. Her right is organic. She moves like water and strikes like a piston. Three phases: technique, aggression, rage.',
        hp: 65, attributes: { ...enemyAttrs(12), BODY: 8, REFLEX: 9, COOL: 7 }, damage: 13, armorValue: 6,
        behavior: 'aggressive', spawnChance: 0, count: [1, 1],
        drops: [
          { itemId: 'pit_purse_t3', chance: 1.0, quantityRange: [1, 1] },
        ],
        xpReward: 200,
        tier: 4,
        harmSegments: 10,
        armorSegments: 6,
        attackDice: [10, 8],
      },
    ],
    objects: [
      { id: 'pit_floor', name: 'pit floor', examineText: 'Concrete. Cracked from impacts — not weathering, force. The stains are layered — old beneath new, dark beneath bright. The floor is a sedimentary record of violence. Every fight leaves something behind. The pit crew mops between matches but some things don\'t mop out.' },
      { id: 'pit_walls', name: 'pit walls', examineText: 'Smooth concrete, four meters high. Impact marks at waist height where fighters were thrown. Scratch marks higher up where someone tried to climb out. They didn\'t make it. The walls make it final. Once you\'re in, you fight your way out or you\'re carried.' },
      { id: 'the_floodlights', name: 'the floodlights', examineText: 'Industrial floods, angled from above. They eliminate shadow. In the pit, there\'s nowhere the light doesn\'t reach. Every movement is visible. Every cut, every bruise, every stumble. The audience sees everything. The fighter has no privacy.' },
      { id: 'the_crowd_from_below', name: 'the crowd from below', examineText: 'Look up. Silhouettes leaning over the railing. Faces lit from below by the pit\'s reflected glare. They\'re shouting but from down here the individual words blur into a wave of sound — a single voice made of hundreds. When you\'re winning, the wave lifts you. When you\'re losing, it pushes you down. The crowd is the pit\'s real weapon.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'NO ESCAPE', die: 8, benefitsActions: ['attack'], hindersActions: ['flee'], color: '#ff6b6b' }],
  },

  // ── 4. FIGHTER PREP ─────────────────────────────────────────────────────

  z06_r04: {
    id: 'z06_r04',
    zone: 'z06',
    name: 'FIGHTER PREP',
    description:
`A concrete room adjacent to the pit, accessible through a
heavy door. Benches along the walls. Hooks for gear. A
cracked mirror that shows you what you look like before
you go in. A bucket of water and a towel. A window —
barred — looking down into the pit, so you can watch the
match before yours and see what you're walking into.

Fighters sit here and wait. Some shadowbox. Some sit still.
Some vomit. The room smells like adrenaline and fear, which
are chemically similar and practically identical.

A man sits in the corner, away from the others. Older.
Heavy. His hands are wrapped but he's not fighting tonight.
He hasn't fought in years. But he's here. He's always here.`,
    exits: [
      { direction: 'west', targetRoom: 'z06_r03', description: 'west (The Pit)' },
      { direction: 'south', targetRoom: 'z06_r05', description: 'south (The Fight Doctor)' },
    ],
    npcs: [
      {
        id: 'grath', name: 'Grath', type: 'NEUTRAL',
        faction: 'CHROME_WOLVES',
        description: 'Retired champion. Fifties. Heavy. Scar tissue over scar tissue, flat nose, hands that can\'t fully close. Both knees augmented — replacement, not enhancement. He was the first pit champion. Held it three years. He sits in the corner and watches.',
        dialogue: '"…sit. No, there. Where I can see your hands. — You\'re fighting tonight? Let me watch you move. Just stand up. Walk to the door and back. — Hmm. You drop your left shoulder when you turn. Fix that or Chrome Jaw will find it."',
        startingDisposition: 0,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'cracked_mirror', name: 'cracked mirror', examineText: 'The mirror shows you before you go in. It\'s cracked — a spiderweb of fracture lines from someone who didn\'t like what they saw. Or from someone who liked it too much. You look at yourself. Are you ready? The mirror doesn\'t know. The mirror shows. The decision is yours.' },
      { id: 'pit_window', name: 'pit window', examineText: 'Barred window looking down into the basin. You can see the current match — fighters moving, the crowd above, the floodlights turning everything sharp and shadowless. Watching from here is different than watching from the stands. From here, you\'re next. The distance between spectator and participant is one door.' },
      { id: 'grath_hands', name: 'grath\'s hands', examineText: 'His fingers don\'t close all the way. The knuckles are swollen — permanent calcification from thousands of impacts. The skin over them is a topography of scar tissue. These hands held the championship for three years. Now they can\'t hold a cup without trembling. He wraps them every night, out of habit. There\'s nothing to protect anymore. He wraps them anyway.' },
      { id: 'fighter_gear', name: 'fighter gear', examineText: 'Hooks on the wall hold what fighters bring. Wraps, tape, mouth guards. A pair of augmented gauntlets — chrome, dented, someone\'s investment in surviving. A jar of something the label calls \'fighting balm\' which is probably just menthol and hope. A towel with old bloodstains that laundering didn\'t remove.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 5. THE FIGHT DOCTOR ─────────────────────────────────────────────────

  z06_r05: {
    id: 'z06_r05',
    zone: 'z06',
    name: 'THE FIGHT DOCTOR',
    description:
`A room that was probably a chemical testing lab when this
was a water treatment plant. Now it's a medical station
in the loosest possible sense. A table that serves as an
examination bed. A lamp. Drawers of supplies — bandages,
sutures, stims, painkillers, a bone-setting kit. A
cauterizing tool that smells like it's been used recently.

The fight doctor is not a doctor. She's a paramedic who
lost her license, or a nurse who left the system, or
something in between. What she is: fast, efficient, and
not interested in your feelings. She patches you up between
rounds. She patches you up after. She does not ask if
you want to keep fighting. That's not her department.`,
    exits: [
      { direction: 'north', targetRoom: 'z06_r04', description: 'north (Fighter Prep)' },
    ],
    npcs: [
      {
        id: 'patch', name: 'Patch', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'The fight doctor. Thirties. No-nonsense. Speaks in instructions. Her hands are steady in a way that suggests extensive training or extensive practice. She looks at the wound, not the person.',
        dialogue: '"Sit. Shirt off. — That\'s a second-degree on the ribs. I can tape it or stitch it. Tape holds for one more fight. Stitches hold for good. Your call."',
        startingDisposition: 0,
        services: ['quest', 'shop', 'heal'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'medical_table', name: 'medical table', examineText: 'Metal. Cold. Stained despite cleaning. The surface is scored from bone-setting procedures — metal tools pressed hard against metal table. A thin pad for comfort. The comfort is marginal. The table works. Comfort is not the priority.' },
      { id: 'supply_drawers', name: 'supply drawers', examineText: 'Organized by urgency. Top drawer: things that stop bleeding. Second drawer: things that reduce pain. Third drawer: things that set bones. Bottom drawer: locked.',
        gatedText: [{ attribute: 'TECH', minimum: 5, text: 'The locked drawer contains military-grade coagulant, a neural bypass kit, and three doses of something that doesn\'t have a label. Patch\'s reserves. For when the fight goes wrong in ways the normal supplies can\'t handle.' }],
      },
      { id: 'cauterizing_tool', name: 'cauterizing tool', examineText: 'A heated iron for sealing wounds. Pre-Helixion medical technology. Brutal but effective — stops bleeding instantly, prevents infection, leaves scars that are badges in this environment. The tool has been used tonight. You can smell it.' },
      { id: 'tranq_gun', name: 'tranq gun', examineText: 'Mounted on the wall. Heavy-gauge tranquilizer pistol loaded with doses meant for industrial animals. Patch uses it when beast matches go wrong. She\'s used it four times. One of those times, it didn\'t work fast enough.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 6. THE CHOP SHOP ────────────────────────────────────────────────────

  z06_r06: {
    id: 'z06_r06',
    zone: 'z06',
    name: 'THE CHOP SHOP',
    description:
`A converted storage room off the betting floor. The door
has a neon sign: "UPGRADES." Inside: a reclined chair,
a wall of cyberware components in unlabeled bins, a
soldering station, and a man whose hands move faster than
his mouth.

This is not Dr. Costa's clinic. There are no sterilization
protocols. No patient history. No recovery time. The chop
shop installs combat augmentations in under an hour — fast,
cheap, and with a failure rate that the operator calls
"acceptable" and anyone else would call "alarming."

The fighters use it because the pits reward augmentation
and the chop shop is the only place that installs without
questions, without records, and without the Wolves' formal
vetting. You pay, you sit, you hope the solder holds.`,
    exits: [
      { direction: 'west', targetRoom: 'z06_r02', description: 'west (The Betting Floor)' },
    ],
    npcs: [
      {
        id: 'needle', name: 'Needle', type: 'SHOPKEEPER',
        faction: 'CHROME_WOLVES',
        description: 'Chop shop operator. Thirties. Fast hands, fast mouth. Oversells everything. His augmentation work is competent but not careful. Cheaper than Costa. Faster. The tradeoff is risk.',
        dialogue: '"What do you need? Speed, strength, or durability? I got all three. Installation takes forty minutes. Side effects are minimal. Mostly. Sit down, let me look at your interface ports."',
        startingDisposition: 0,
        services: ['shop'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'unlabeled_bins', name: 'unlabeled bins', examineText: 'Cyberware components in plastic bins. Fingers, wrist servos, optical lenses, subdermal panels. None labeled. Some are new — factory-sealed Helixion packaging. Some are used — scratched, worn, with mounting hardware still attached. The used ones were inside someone before they were in this bin. Needle doesn\'t talk about where the used ones come from.' },
      { id: 'soldering_station', name: 'soldering station', examineText: 'Magnifying lens, soldering iron, neural threading tools. The workspace is chaotic — components everywhere, half-finished modifications, a coffee cup balanced on a servo assembly. Needle works fast and messy. The results work. Not always for long. Not always correctly. But they work.' },
      { id: 'the_chair', name: 'the chair', examineText: 'Reclined. Cracked vinyl. The armrests have grip marks where patients squeezed during installation. No anesthetic beyond a local injection. No bite guard like Costa\'s clinic — Needle says the pain is \'motivational.\' The chair has a drain channel. For fluids. Don\'t ask.' },
      { id: 'failure_rate_notice', name: 'failure rate notice', examineText: '\'ALL MODIFICATIONS CARRY INHERENT RISK. THE OPERATOR IS NOT LIABLE FOR DEGRADATION, REJECTION, OR UNEXPECTED BEHAVIOR. BY SITTING IN THE CHAIR YOU ACCEPT THESE TERMS.\' Beneath it, in marker: \'Nobody reads this. — N.\' He\'s right. Nobody does.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 7. BACK ROOMS ───────────────────────────────────────────────────────

  z06_r07: {
    id: 'z06_r07',
    zone: 'z06',
    name: 'BACK ROOMS',
    description:
`Below the arena level, through a door that doesn't have
a sign. The corridor is concrete — original water treatment
infrastructure, tunnels that connected the settling basins
to the pumping system. The Wolves have repurposed them
into something between a lounge, a meeting room, and a
place where conversations happen that don't need witnesses.

The main space is furnished: couches salvaged from
somewhere nicer, a table, a bar better stocked than the
one upstairs. Low lighting. Music — not the crowd noise,
something deliberate, atmospheric. The people down here
are not spectators. They're the people the spectators work
for.

Chrome Wolf officers. Freemarket operators. A man in a
suit who is definitely D9 and everyone knows it and nobody
says it. This is where the pits' real economy operates:
fights get arranged, debts get settled, alliances get
negotiated over drinks that cost more than the fighters
make in a night.`,
    exits: [
      { direction: 'up', targetRoom: 'z06_r03', description: 'up (The Pit)' },
      { direction: 'south', targetRoom: 'z06_r08', description: 'south (Rade\'s Office)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'back_room_enforcer', name: 'Back-Room Enforcer', level: 9,
        description: 'Rade\'s personal security. Armed, silent. They fight to subdue, not kill — dragging troublemakers back to the pit.',
        hp: 35, attributes: { ...enemyAttrs(9), BODY: 7, REFLEX: 5 }, damage: 8, armorValue: 4,
        behavior: 'territorial', spawnChance: 1.0, count: [2, 2],
        drops: [],
        xpReward: 50,
        tier: 2,
        harmSegments: 6,
        armorSegments: 4,
        attackDice: [8, 6],
      },
    ],
    objects: [
      { id: 'the_better_bar', name: 'the better bar', examineText: 'Better bottles. Better glasses. Real liquor — not the unlabeled acid sold upstairs. The bar down here is stocked with imports that came through Oyunn\'s docks. The prices aren\'t posted because the people who drink here don\'t ask what things cost.' },
      { id: 'the_d9_agent', name: 'the d9 agent', examineText: 'The man in the suit.',
        gatedText: [{ attribute: 'GHOST', minimum: 6, text: 'He\'s pretending to drink. The glass hasn\'t gone down in twenty minutes. His eyes move in a pattern — sweep, register, categorize. He\'s working. Everyone knows he\'s D9. He knows they know. The arrangement is mutual visibility — D9 tolerates the pits because the pits concentrate people who are interesting.' }],
      },
      { id: 'overheard_conversations', name: 'overheard conversations', examineText: 'Murmurs. Too quiet to make out.',
        gatedText: [{ attribute: 'GHOST', minimum: 6, text: 'Fragments. A Wolf officer discussing a shipment timing with a Freemarket broker. The D9 agent asking the bartender about a specific fighter who\'s been winning too consistently. Two people in the corner negotiating something that involves a map and a lot of CREDS. The back rooms are an intelligence buffet.' }],
      },
      { id: 'the_corridor', name: 'the corridor', examineText: 'Original water treatment tunnels. The concrete is stained with chemical residue that predates the pits by decades. The infrastructure goes deeper — sealed doors lead to sections the Wolves haven\'t repurposed. The treatment plant was built over something older.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'DIM LOUNGE', die: 6, benefitsActions: ['sneak'], hindersActions: ['scan'] }],
  },

  // ── 8. RADE'S OFFICE ────────────────────────────────────────────────────

  z06_r08: {
    id: 'z06_r08',
    zone: 'z06',
    name: 'RADE\'S OFFICE',
    description:
`Deeper than the back rooms. A door with a lock that's
better than anything else in the complex. Beyond it: a
room that's surprisingly clean. Concrete floor, swept.
A desk — real wood, salvaged, polished. A chair behind it
that doesn't match anything but looks comfortable. Filing
cabinets — physical, paper records. A wall of monitors
showing every angle of the pit, the betting floor, the
approach, the back rooms.

Rade sits behind the desk. He's different down here —
upstairs at the betting table he's the barker, the
evaluator, the public face. Down here he's the operator.
The monitors show him everything. The filing cabinets hold
records on every fighter, every bet, every back-room deal.
The pits are an operation and he runs it with the precision
of someone who understands that controlled violence is the
most profitable business model available to anyone who
isn't Helixion.

A photograph on the wall: Rade and Voss, younger, standing
in the pit before the first fight. The Wolves built this.
Rade built this. They're the same thing and they're not
and the distinction matters to nobody except Rade.`,
    exits: [
      { direction: 'north', targetRoom: 'z06_r07', description: 'north (Back Rooms)' },
    ],
    npcs: [
      {
        id: 'rade', name: 'Rade', type: 'SHOPKEEPER',
        faction: 'CHROME_WOLVES',
        description: 'Pit operator. Behind the desk. Monitors glowing. Down here the carnival barker persona drops. Sharp, quiet, methodical. He sees the pits as an ecosystem.',
        dialogue: '"Come in. Close the door. — You\'ve been making noise upstairs. Good noise. The kind that fills seats and moves money. Sit down. Let\'s talk about what you\'re worth to me."',
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'monitor_wall', name: 'monitor wall', examineText: 'Eight screens. Every angle. The pit from above. The betting floor from three positions. The approach. The back rooms. The chop shop. Rade sees everything. The blind spots are intentional — fighter prep has no camera. The fight doctor\'s room has no camera. What happens there is private because Rade decided it should be.' },
      { id: 'filing_cabinets', name: 'filing cabinets', examineText: 'Paper records. Physical. No digital copies, no mesh storage. Every fighter who\'s entered the pit. Every match result. Every betting line. Every back-room agreement. Rade keeps records analog, permanent, untouchable by system access. These cabinets are the pits\' history and they\'re worth more than anything in the building.' },
      { id: 'the_photograph', name: 'the photograph', examineText: 'Rade and Voss. Younger. Standing in the pit — the basin was empty then, clean, unpurposed. Voss\'s augmentations are less extensive. Rade still has his ear. They\'re both grinning. The photograph is the only personal item in the room. Whatever Rade is now, this is where it started. Two people and a concrete hole and the belief that people would pay to watch other people fight.' },
      { id: 'the_desk', name: 'the desk', examineText: 'Real wood. The only wood surface in the pits. Rade found it in the Fringe and carried it here himself. It\'s polished. He maintains it. In a complex built from concrete and chain-link and repurposed industrial waste, the desk is the only thing someone chose because it was beautiful. Rade is not sentimental. But the desk is.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },
};

// ── Zone 06 Definition ──────────────────────────────────────────────────────

export const ZONE_06: Zone = {
  id: 'z06',
  name: 'FIGHT PITS',
  depth: 'surface',
  faction: 'CHROME_WOLVES',
  levelRange: [6, 12],
  description: 'Repurposed water treatment plant. Settling basins as arenas. Chrome Wolf entertainment and revenue. The only place where every faction watches the same violence.',
  atmosphere: {
    sound: 'The crowd. Always the crowd. Rhythmic roar, impact sounds, the announcer bouncing off concrete walls.',
    smell: 'Sweat. Blood. Beer. Hot metal from the chop shop. Antiseptic from the fight doctor.',
    light: 'Floodlights in the pit — overlit, no shadows. Everything outside: dim neon, orange cigarettes, faces lit from below.',
    temp: 'Body heat from the crowd. Cold concrete. The chemical tang of waste ground seeping through.',
  },
  rooms: Z06_ROOMS,
  originPoint: undefined,
};

// ── Zone 01: Helixion Campus ───────────────────────────────────────────────

const Z01_ROOMS: Record<string, Room> = {

  // ── 1. SECURITY PERIMETER ─────────────────────────────────────────────────

  z01_r01: {
    id: 'z01_r01',
    zone: 'z01',
    name: 'SECURITY PERIMETER',
    description:
`A wide plaza of polished concrete separates the city from the
campus proper. The transition is immediate — the cracked asphalt
and flickering streetlights of the residential blocks end at a
clean line where Helixion's territory begins. The ground is smooth.
The lighting is even. The air smells filtered.

Security bollards line the approach. Cameras track in slow arcs —
or appear to. The real surveillance is in the mesh, pulsing at
frequencies you can feel in your implant scarring. A checkpoint
booth sits at the main entrance, staffed by enforcers in
Helixion tactical gear. Beyond them, the Atrium's glass facade
glows warm and golden.

A holographic sign floats above the entrance:
HELIXION DYNAMICS — BUILDING COGNITIVE FREEDOM`,
    exits: [
      { direction: 'south', targetRoom: 'z02_r09', description: 'south (Residential Blocks — Inner Boulevard)', zoneTransition: true, targetZone: 'z02' },
      { direction: 'north', targetRoom: 'z01_r02', description: 'north (The Atrium)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'helixion_enforcer_perimeter', name: 'Helixion Enforcer', level: 14,
        description: 'Cyborg security. Heavily augmented. Full combat kit. They scan everyone who approaches.',
        hp: 80, attributes: { ...enemyAttrs(14), BODY: 9, REFLEX: 8, COOL: 7 }, damage: 14, armorValue: 7,
        behavior: 'patrol', spawnChance: 1.0, count: [2, 2],
        drops: [
          { itemId: 'enforcer_armor', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'standard_sidearm', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'security_keycard_basic', chance: 0.5, quantityRange: [1, 1] },
        ],
        xpReward: 120,
        tier: 3,
        harmSegments: 8,
        armorSegments: 4,
        attackDice: [10, 6],
      },
      {
        id: 'perimeter_turret', name: 'Perimeter Turret', level: 14,
        description: 'Automated defense. Activates if combat begins or alarm triggers. High damage, low HP. Hackable with TECH ≥ 7.',
        hp: 40, attributes: { ...enemyAttrs(14), TECH: 1, REFLEX: 3 }, damage: 16, armorValue: 8,
        behavior: 'aggressive', spawnChance: 0.8, count: [1, 1],
        drops: [
          { itemId: 'targeting_module', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'power_cell', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 100,
        tier: 2,
        harmSegments: 4,
        armorSegments: 6,
        attackDice: [10],
      },
    ],
    objects: [
      { id: 'checkpoint_booth', name: 'checkpoint booth', examineText: 'Reinforced glass. Biometric scanners. A screen showing employee IDs scrolling past. One of the enforcers has a coffee thermos. The other has a stun baton he keeps flipping in his hand.' },
      { id: 'holographic_sign', name: 'holographic sign', examineText: "'BUILDING COGNITIVE FREEDOM.' The letters shimmer. Beneath it, in smaller text: 'A Helixion Dynamics and Bureau of Cognitive Infrastructure partnership.' They don't even hide it." },
      { id: 'surveillance_mesh', name: 'surveillance mesh', examineText: "You can feel it. A low-frequency sweep, every few seconds. Your implant — sovereign or not — resonates with it. Like a tuning fork pressed against a bruise.", gatedText: [{ attribute: 'GHOST', minimum: 5, text: 'You can feel the mesh probing for unauthorized frequency signatures. It knows you are wrong. It just cannot find you yet.' }] },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'OPEN KILL ZONE', die: 8, benefitsActions: ['scan'], hindersActions: ['sneak'], color: '#ff6b6b' }],
  },

  // ── 2. THE ATRIUM ─────────────────────────────────────────────────────────

  z01_r02: {
    id: 'z01_r02',
    zone: 'z01',
    name: 'THE ATRIUM',
    description:
`The lobby is cathedral-scale. Four stories of open space, a
living wall of engineered plants climbing the eastern face,
water features murmuring from somewhere you can't quite locate.
The light is golden — not sunlight, but a precise simulation
designed to trigger serotonin release. The floor is white marble
veined with something that pulses faintly blue, like the building
has a circulatory system.

Mesh-compliant employees move through the space with the easy
grace of people who've never questioned why they feel so calm.
Nobody looks at you with suspicion. The mesh tells them you
belong. For now.

A reception desk curves along the north wall. Behind it, corridors
lead east and west. An elevator bank glows softly to the north.`,
    exits: [
      { direction: 'south', targetRoom: 'z01_r01', description: 'south (Security Perimeter)' },
      { direction: 'north', targetRoom: 'z01_r03', description: 'north (Campus Courtyard)' },
      { direction: 'east', targetRoom: 'z01_r04', description: 'east (Compliance Wing)' },
      { direction: 'west', targetRoom: 'z01_r05', description: 'west (Research Wing)' },
    ],
    npcs: [
      {
        id: 'yara', name: 'Yara', type: 'SHOPKEEPER',
        faction: 'FREEMARKET',
        description: 'Works the reception desk. Impeccably professional. Surgically composed. If you have the right token, she is much more than a receptionist.',
        dialogue: '"Welcome to Helixion Dynamics. How may I direct your visit?"',
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
      {
        id: 'mesh_employees', name: 'Mesh Employees', type: 'NEUTRAL',
        faction: 'HELIXION',
        description: 'Ambient population. 4-6 present. Polite, helpful, and slightly wrong. Like talking to someone through glass.',
        dialogue: "\"It's a beautiful day at Helixion. Can I help you find your way?\"",
        startingDisposition: 5,
      },
    ],
    enemies: [],
    objects: [
      { id: 'living_wall', name: 'living wall', examineText: "Engineered plants. They don't need soil or natural light. Genetically modified to produce calming terpenes. The air near the wall tastes faintly sweet. You find yourself wanting to sit down and stay." },
      { id: 'cafe_tables', name: 'café tables', examineText: "Real food. Fresh vegetables, grilled protein, something that might be actual bread. The employees eat without urgency. They have everything they need. The cost is invisible." },
      { id: 'transparent_displays', name: 'transparent displays', examineText: "Work terminals. The employees interact through the mesh — their fingers don't touch the screens.", gatedText: [{ attribute: 'TECH', minimum: 6, text: "You can skim fragments. Project names. Budget allocations. The word CHRYSALIS appears three times." }] },
      { id: 'blue_veins', name: 'blue veins', examineText: 'The marble floor is veined with something bioluminescent. It pulses slowly, like a resting heartbeat. 60 beats per minute. The building is calibrated to make you calm.' },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 3. CAMPUS COURTYARD ───────────────────────────────────────────────────

  z01_r03: {
    id: 'z01_r03',
    zone: 'z01',
    name: 'CAMPUS COURTYARD',
    description:
`An open-air courtyard between the campus buildings and the
central tower. Manicured hedges in geometric patterns. Benches
that look inviting and are designed to be uncomfortable after
fifteen minutes. A fountain shaped like a double helix, water
cascading over chrome strands.

The tower rises to the north — glass and steel climbing beyond
what you can see from ground level. The top disappears into
low cloud or haze. Somewhere up there, Directorate 9 watches
everything. Somewhere up there, Virek decides what freedom means.

Security patrols cross the courtyard every ninety seconds.
Their routes are precise. The gaps are small.

A service hatch is set into the ground near the fountain,
partially obscured by a hedge. Municipal maintenance marking.
Easy to miss if you're not looking.`,
    exits: [
      { direction: 'south', targetRoom: 'z01_r02', description: 'south (The Atrium)' },
      { direction: 'north', targetRoom: 'z01_r07', description: 'north (Tower Checkpoint)' },
      { direction: 'east', targetRoom: 'z01_r06', description: 'east (Staff Quarters)' },
      { direction: 'west', targetRoom: 'z01_r05', description: 'west (Research Wing)' },
      { direction: 'down', targetRoom: 'z01_r14', description: 'down (Service Sublevel — service hatch)' },
    ],
    npcs: [
      {
        id: 'gus', name: 'Gus', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Helixion facilities staff. Jumpsuit, tool belt, invisible. Fifty-something. Tired. Knows every blind spot in the camera grid.',
        dialogue: "\"I fix things. That's all I do. I don't see things, I don't hear things, and I definitely don't talk to people who shouldn't be here.\"",
        startingDisposition: -5,
        services: ['info'],
      },
    ],
    enemies: [
      {
        id: 'helixion_enforcer_courtyard', name: 'Helixion Enforcer', level: 14,
        description: 'Patrol in a predictable pattern. 90-second loop. Gap of ~15 seconds. GHOST or timing to avoid.',
        hp: 80, attributes: { ...enemyAttrs(14), BODY: 9, REFLEX: 8 }, damage: 14, armorValue: 7,
        behavior: 'patrol', spawnChance: 0.7, count: [2, 2],
        drops: [
          { itemId: 'enforcer_armor', chance: 0.25, quantityRange: [1, 1] },
          { itemId: 'security_keycard_basic', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'military_rations', chance: 0.5, quantityRange: [1, 2] },
        ],
        xpReward: 120,
        tier: 3,
        harmSegments: 8,
        armorSegments: 4,
        attackDice: [10, 6],
      },
      {
        id: 'security_drone_courtyard', name: 'Security Drone', level: 13,
        description: 'Aerial. Circles the courtyard. Thermal scanning. Harder to avoid than ground patrols.',
        hp: 35, attributes: { ...enemyAttrs(13), REFLEX: 8, TECH: 6 }, damage: 10, armorValue: 4,
        behavior: 'patrol', spawnChance: 0.6, count: [1, 1],
        drops: [
          { itemId: 'drone_components', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'sensor_array_damaged', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 90,
        tier: 2,
        harmSegments: 4,
        armorSegments: 4,
        attackDice: [8],
      },
    ],
    objects: [
      { id: 'helix_fountain', name: 'helix fountain', examineText: "Chrome double helix. The company's logo rendered in water and metal. The water is recycled — the same water, circulating forever. There's a metaphor here that Helixion would not appreciate." },
      { id: 'service_hatch', name: 'service hatch', examineText: "Municipal maintenance access. Partially hidden by landscaping. The lock is standard issue — not biometric, not smart. Just a key lock. Gus has the key.", gatedText: [{ attribute: 'TECH', minimum: 5, text: 'You could pick this.' }] },
      { id: 'tower_view', name: 'tower view', examineText: "The tower. Glass and steel. It goes up and up and the top is lost in haze. You count floors until you lose track. Somewhere past thirty, the glass goes opaque. That's where Directorate 9 starts." },
      { id: 'uncomfortable_benches', name: 'uncomfortable benches', examineText: "Designed by someone who studied exactly how long it takes for a human body to start shifting. Fifteen minutes. They don't want you sitting here. They want you moving. Productive. Compliant." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'PATROL GRID', die: 6, benefitsActions: ['scan'], hindersActions: ['sneak'], color: '#fbbf24' }],
  },

  // ── 4. COMPLIANCE WING ────────────────────────────────────────────────────

  z01_r04: {
    id: 'z01_r04',
    zone: 'z01',
    name: 'COMPLIANCE WING',
    description:
`The east building. This is where Helixion interfaces with the
civilian population — MNEMOS v2.7 installations, firmware
updates, "cognitive wellness" appointments. The hallway is
lined with doors, each one labeled with a number and a
compliance status indicator. Green. Green. Green. Green.

Waiting room chairs sit empty. Motivational posters on the
walls: "YOUR BEST SELF IS AN UPDATED SELF." "COGNITIVE FREEDOM
STARTS WITH COGNITIVE TRUST."

Behind a locked door at the end of the hall, you can hear
someone crying. The sound cuts off abruptly — mid-sob,
like someone pressed mute.`,
    exits: [
      { direction: 'west', targetRoom: 'z01_r02', description: 'west (The Atrium)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'helixion_enforcer_compliance', name: 'Helixion Enforcer', level: 14,
        description: 'One stationed at the locked door. Better-equipped than campus patrols.',
        hp: 80, attributes: { ...enemyAttrs(14), BODY: 9, REFLEX: 8 }, damage: 14, armorValue: 7,
        behavior: 'aggressive', spawnChance: 0.8, count: [1, 1],
        drops: [
          { itemId: 'enforcer_armor', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'security_keycard_basic', chance: 0.5, quantityRange: [1, 1] },
        ],
        xpReward: 120,
        tier: 3,
        harmSegments: 8,
        armorSegments: 4,
        attackDice: [10, 6],
      },
    ],
    objects: [
      { id: 'compliance_doors', name: 'compliance doors', examineText: "Each door has a panel showing a name, a subject ID, and a status bar. All green. All at 97% or above. One door's panel is dark. The number has been scratched off." },
      { id: 'motivational_posters', name: 'motivational posters', examineText: "'YOUR BEST SELF IS AN UPDATED SELF.' The woman in the poster is smiling. Her eyes are slightly dilated. The smile reaches her cheeks but stops before it reaches anything real." },
      { id: 'locked_door', name: 'locked door', examineText: "Reinforced. The crying stopped. The silence on the other side is worse. Keycard required — or TECH ≥ 7 to bypass. Behind it: a compliance room. Empty chair with restraints. Fresh neural paste on the headrest. A data chip on the floor.", gatedText: [{ attribute: 'TECH', minimum: 7, text: "A compliance room. Empty chair with restraints. Fresh neural paste on the headrest. Whoever was here was taken somewhere else. A data chip on the floor — Chrysalis early trial documentation." }] },
      { id: 'waiting_chairs', name: 'waiting chairs', examineText: "Empty. They're always empty. Appointments at Helixion aren't the kind you wait for. They're the kind that come for you." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'MESH FIELD', die: 8, benefitsActions: ['hack'], hindersActions: ['resist'], color: '#818cf8' }],
  },

  // ── 5. RESEARCH WING ──────────────────────────────────────────────────────

  z01_r05: {
    id: 'z01_r05',
    zone: 'z01',
    name: 'RESEARCH WING',
    description:
`The west building smells different. Ozone and isopropyl and
something under both that you can't name but your implant
recognizes — neural paste, the substrate they use to bond
wetware to tissue. Your scars itch.

The corridor is clean but not pretty. No living walls, no
golden light. Fluorescents. Sealed doors with biometric
readers. Warning labels in small print. A whiteboard in the
hall still has equations on it, half-erased, annotated in
red marker: "CONFIRM WITH VIREK BEFORE PROCEEDING."

Through a window in one of the doors, you can see a lab.
Surgical tables. Monitoring equipment. A neural lattice
suspended in fluid, pulsing faintly. It looks like a brain
that someone built from scratch.`,
    exits: [
      { direction: 'east', targetRoom: 'z01_r03', description: 'east (Campus Courtyard)' },
    ],
    npcs: [
      {
        id: 'dr_vasik', name: 'Dr. Vasik', type: 'NEUTRAL',
        faction: 'HELIXION',
        description: 'Brilliant, anxious, morally exhausted. She helped design MNEMOS v2.7. She has seen the Chrysalis data. She cannot sleep.',
        dialogue: "\"You shouldn't be in this wing. And I shouldn't be talking to you. So we're both making mistakes. Let's see if mine is smaller than yours.\"",
        startingDisposition: -20,
        services: ['quest', 'info'],
      },
    ],
    enemies: [
      {
        id: 'helixion_enforcer_research', name: 'Helixion Enforcer', level: 14,
        description: 'One enforcer patrols the research wing. Biometric door requires keycard or TECH ≥ 8.',
        hp: 80, attributes: { ...enemyAttrs(14), BODY: 9, REFLEX: 8 }, damage: 14, armorValue: 7,
        behavior: 'patrol', spawnChance: 0.7, count: [1, 1],
        drops: [
          { itemId: 'enforcer_armor', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'security_keycard_elevated', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 120,
        tier: 3,
        harmSegments: 8,
        armorSegments: 4,
        attackDice: [10, 6],
      },
    ],
    objects: [
      { id: 'whiteboard', name: 'whiteboard', examineText: "'CONFIRM WITH VIREK BEFORE PROCEEDING.' The equations describe neural lattice harmonic resonance at specific frequencies. One frequency is circled three times: 33hz. They know." },
      { id: 'neural_lattice', name: 'neural lattice', examineText: "Suspended in bio-conductive fluid. Pulsing. Not a brain — something grown to interface with one. The label reads: 'CHRYSALIS SUBSTRATE v0.3 — ITERATION 7.' Seven attempts. This is the latest." },
      { id: 'warning_labels', name: 'warning labels', examineText: "'COGNITIVE HAZARD — UNAUTHORIZED PROXIMITY MAY CAUSE SYMPATHETIC NEURAL RESPONSE.' Translation: being near this equipment can trigger your implant. They built something that talks to your head whether you want it to or not." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'NEURAL HAZARD', die: 8, benefitsActions: ['hack', 'scan'], hindersActions: ['resist'], color: '#c084fc' }],
  },

  // ── 6. STAFF QUARTERS ─────────────────────────────────────────────────────

  z01_r06: {
    id: 'z01_r06',
    zone: 'z01',
    name: 'STAFF QUARTERS',
    description:
`Residential block for Helixion employees who live on-campus.
The hallway is carpeted. Doors are spaced evenly. Each one
has a name plate and a small indicator light — green for
occupied, blue for available. Almost all green.

The air smells like laundry and synthetic lavender. Soft music
plays from hidden speakers — 432hz tuning, designed for
neurological harmony. The walls are painted in colors a
committee chose because focus groups said they reduced anxiety.

It looks like a nice place to live.
It looks like a nice place to never leave.`,
    exits: [
      { direction: 'west', targetRoom: 'z01_r03', description: 'west (Campus Courtyard)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'employee_doors', name: 'employee doors', examineText: "Each room is identical — you can see through the ones left open. Single bed, desk, terminal, closet. No photographs. No decoration. Everything Helixion provides. Nothing personal." },
      { id: 'communal_kitchen', name: 'communal kitchen', examineText: "Well-stocked. Fresh food. The refrigerator has more variety than the Parish sees in a month. The coffee cup on the counter is still warm — someone was just here." },
      { id: 'hidden_wall_panel', name: 'hidden wall panel', examineText: "A wall panel.", hidden: true, hiddenRequirement: { attribute: 'TECH', minimum: 6 }, gatedText: [{ attribute: 'TECH', minimum: 8, text: "Behind the panel — a personal data device. An employee documenting increasing 'cognitive drift' among staff. The entries get shorter. The last one says: 'I think I'm still me. I think.'" }] },
      { id: 'music_speakers', name: 'music speakers', examineText: "432hz. Not the standard 440hz tuning. Helixion uses the 'healing frequency' — except here it's not healing anything. It's maintaining. Every surface in this building is a delivery mechanism." },
    ],
    isSafeZone: false,
    isHidden: false,
  },

  // ── 7. TOWER CHECKPOINT ───────────────────────────────────────────────────

  z01_r07: {
    id: 'z01_r07',
    zone: 'z01',
    name: 'TOWER CHECKPOINT',
    description:
`The base of the tower. A security vestibule separates the campus
grounds from the vertical infrastructure. The aesthetic shifts
hard — marble and warm light give way to brushed steel and
white LEDs. The air changes. Cooler. Drier.

Two biometric gates. Full-body scanners. A security station
with three enforcers behind reinforced glass. Screens showing
floor-by-floor status. Every floor reads SECURED except one —
floor 17, which reads MAINTENANCE.

An elevator bank behind the gates. The buttons go up to 40.
The top five floors have no labels — just blank panels where
numbers should be.`,
    exits: [
      { direction: 'south', targetRoom: 'z01_r03', description: 'south (Campus Courtyard)' },
      { direction: 'up', targetRoom: 'z01_r08', description: 'up (Laboratory Floor)' },
      { direction: 'in', targetRoom: 'z15_r03', description: 'in (Broadcast Tower — Lobby, credentials required)', locked: true, lockId: 'tower_lobby_access', zoneTransition: true, targetZone: 'z15' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'helixion_enforcer_checkpoint', name: 'Helixion Enforcer', level: 15,
        description: 'Elite checkpoint guards. Better equipped. One carries a mesh suppressor — disables cyberware for 2 turns on hit.',
        hp: 90, attributes: { ...enemyAttrs(15), BODY: 10, REFLEX: 9, COOL: 8 }, damage: 16, armorValue: 8,
        behavior: 'aggressive', spawnChance: 1.0, count: [3, 3],
        drops: [
          { itemId: 'enforcer_armor', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'mesh_suppressor', chance: 0.15, quantityRange: [1, 1] },
          { itemId: 'security_keycard_elevated', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 140,
        tier: 3,
        harmSegments: 8,
        armorSegments: 4,
        attackDice: [10, 6],
      },
    ],
    objects: [
      { id: 'security_screens', name: 'security screens', examineText: "Floor-by-floor readouts. Floors 1-20: SECURED. Floors 21-30: SECURED. Floor 17: MAINTENANCE — the only exception. Floors 35-40: no readout at all. Those floors don't officially exist." },
      { id: 'elevator_bank', name: 'elevator bank', examineText: "Brushed steel doors. The buttons inside go to 40. The top five are blank panels — smooth, no markings. You'd need to know they're there to press them.", gatedText: [{ attribute: 'GHOST', minimum: 6, text: 'You can feel the mesh thicken as you look upward. Whatever is at the top is broadcasting.' }] },
      { id: 'mesh_suppressor_obj', name: 'mesh suppressor', examineText: "Military-grade neural dampener. One hit disables all cyberware for two turns. Helixion built weapons specifically designed to fight people like you. They've been preparing." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'BIOMETRIC LOCKDOWN', die: 10, benefitsActions: ['hack'], hindersActions: ['flee', 'sneak'], color: '#ff6b6b' }],
  },

  // ── 8. LABORATORY FLOOR ───────────────────────────────────────────────────

  z01_r08: {
    id: 'z01_r08',
    zone: 'z01',
    name: 'LABORATORY FLOOR',
    description:
`Floor 17. The elevator doors open onto a corridor that smells
like a surgery and sounds like a server room. The lights are
surgical-bright. The floors are sealed composite — easy to
clean. Easy to sterilize.

Labs behind glass walls. Neural lattices in various stages of
growth, suspended in tanks of bio-conductive fluid. A holographic
display shows a rotating model of a human brain with sections
highlighted in gold — the areas Chrysalis targets for personality
overwrite.

One lab is dark. The glass is cracked. Something happened in
there and nobody cleaned it up. They just sealed the door.`,
    exits: [
      { direction: 'down', targetRoom: 'z01_r07', description: 'down (Tower Checkpoint)' },
      { direction: 'up', targetRoom: 'z01_r10', description: 'up (Server Core)' },
      { direction: 'east', targetRoom: 'z01_r09', description: 'east (Containment Wing)' },
      { direction: 'in', targetRoom: 'z16_r01', description: 'in (Helixion Lab — restricted elevator, Chrysalis Research Division)', locked: true, lockId: 'chrysalis_lab_access', zoneTransition: true, targetZone: 'z16' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'lab_specimen', name: 'Lab Specimen', level: 16,
        description: 'Failed Chrysalis subject. Hospital gown. One arm augmented, one arm flesh. Moves wrong — erratic, devastating.',
        hp: 75, attributes: { ...enemyAttrs(16), BODY: 10, REFLEX: 7 }, damage: 17, armorValue: 3,
        behavior: 'aggressive', spawnChance: 0.6, count: [1, 1],
        drops: [
          { itemId: 'chrysalis_biosample', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'damaged_implant', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 150,
        tier: 3,
        harmSegments: 8,
        armorSegments: 2,
        attackDice: [10, 8],
      },
      {
        id: 'security_drone_lab', name: 'Security Drone', level: 14,
        description: 'Automated aerial units patrol the corridor.',
        hp: 35, attributes: { ...enemyAttrs(14), REFLEX: 8 }, damage: 10, armorValue: 4,
        behavior: 'patrol', spawnChance: 0.7, count: [2, 2],
        drops: [
          { itemId: 'drone_components', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 90,
        tier: 2,
        harmSegments: 4,
        armorSegments: 4,
        attackDice: [8],
      },
    ],
    objects: [
      { id: 'chrysalis_display', name: 'chrysalis display', examineText: "The holographic brain rotates slowly. Gold sections: prefrontal cortex, hippocampus, amygdala, anterior cingulate. These are the regions that define identity, memory, emotional processing, and decision-making. Chrysalis doesn't just override behavior. It replaces who you are. The display reads: 'CHRYSALIS v1.2 — IDENTITY ARCHITECTURE FRAMEWORK.'" },
      { id: 'growth_tanks', name: 'growth tanks', examineText: "Neural lattices at different stages. The smallest is a fingernail-sized cluster. The largest fills a tank the size of a coffin. It's pulsing.", gatedText: [{ attribute: 'GHOST', minimum: 7, text: "You can feel it reaching — not at you, but toward something below. Toward the Substrate. It's trying to attune to 33hz." }] },
      { id: 'dark_lab', name: 'dark lab', examineText: "Cracked glass. Dried fluid on the floor — not blood, something thicker, iridescent. A restraint chair with one arm sheared off. Whatever was in here broke free. The door is sealed with a physical bolt, not electronics." },
      { id: 'monitoring_stations', name: 'monitoring stations', examineText: "Brainwave readouts. Subject IDs, not names. Compliance percentages. One reads 99.7% integration. A note beneath: 'SUBJECT REPORTS PERSISTENT DREAM OF TUNNELS. RECOMMEND HIPPOCAMPAL FLUSH.' They're erasing someone's dreams because the dreams don't comply." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'STERILE BRIGHT', die: 6, benefitsActions: ['scan'], hindersActions: ['sneak'] }],
  },

  // ── 9. CONTAINMENT WING ───────────────────────────────────────────────────

  z01_r09: {
    id: 'z01_r09',
    zone: 'z01',
    name: 'CONTAINMENT WING',
    description:
`A sterile corridor lined with reinforced doors. Each door has
a viewport — thick glass, wire-reinforced. Behind most of them:
nothing. Empty cells. Cleaned. Ready.

Behind three of them: people. Or what used to be people.

Cell 1: A woman sits cross-legged on the floor, eyes closed,
mouth moving silently. Her hands are augmented — both of them.
She hasn't blinked in four minutes.

Cell 2: Empty. The interior walls are covered in scratches.
Not words. Equations. The same equation, over and over,
converging on something.

Cell 3: A young man presses his palm against the glass.
He looks at you. His eyes focus — really focus, not the mesh-
compliant gaze. He mouths something. You read his lips:
"PLEASE."`,
    exits: [
      { direction: 'west', targetRoom: 'z01_r08', description: 'west (Laboratory Floor)' },
    ],
    npcs: [
      {
        id: 'ec_330917', name: 'EC-330917', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Cell 3. Subject ID is all that is left. Terrified. Lucid. A Chrysalis trial subject who resisted the overwrite. Fractured but still himself.',
        dialogue: "He doesn't speak above a whisper. \"They're going to do it again tomorrow. The thing where I stop being me. I can feel it getting closer each time. Like a tide.\"",
        startingDisposition: 15,
        services: ['quest'],
      },
    ],
    enemies: [
      {
        id: 'lab_specimen_containment', name: 'Lab Specimen', level: 15,
        description: 'Failed Chrysalis subjects. Released from cells if alarm triggers. Fight erratically.',
        hp: 70, attributes: { ...enemyAttrs(15), BODY: 9, REFLEX: 6 }, damage: 15, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'chrysalis_biosample', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'damaged_implant', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 140,
        tier: 3,
        harmSegments: 8,
        armorSegments: 2,
        attackDice: [10, 8],
      },
      {
        id: 'helixion_enforcer_containment', name: 'Helixion Enforcer', level: 15,
        description: 'Guards the corridor entrance.',
        hp: 90, attributes: { ...enemyAttrs(15), BODY: 10, REFLEX: 9 }, damage: 16, armorValue: 8,
        behavior: 'aggressive', spawnChance: 0.8, count: [1, 1],
        drops: [
          { itemId: 'enforcer_armor', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'security_keycard_elevated', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 140,
        tier: 3,
        harmSegments: 8,
        armorSegments: 4,
        attackDice: [10, 6],
      },
    ],
    objects: [
      { id: 'cell_viewports', name: 'cell viewports', examineText: "Cell 1: She's counting something. Or praying. Or processing. The floor beneath her is worn smooth. Cell 2: The equations converge on a frequency value. 33.0hz. Someone was trying to calculate their way out." },
      { id: 'cell_3_glass', name: 'cell 3 glass', examineText: "His palm against the glass. You can see the tremor in his fingers. Mesh withdrawal. His implant is fighting the Chrysalis overwrite and the conflict is tearing him apart. He's lucid. That's what makes it worse." },
      { id: 'restraint_equipment', name: 'restraint equipment', examineText: "Stored in a wall cabinet. Neural clamps, sedation injectors, a device labeled 'COGNITIVE RESET UNIT.' You've seen the scars this equipment leaves. You have some of them." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'REINFORCED CORRIDOR', die: 6, benefitsActions: ['defend'], hindersActions: ['flee'] }],
  },

  // ── 10. SERVER CORE ───────────────────────────────────────────────────────

  z01_r10: {
    id: 'z01_r10',
    zone: 'z01',
    name: 'SERVER CORE',
    description:
`Floor 28. The temperature drops ten degrees the moment the
elevator opens. Server racks stretch floor to ceiling in rows
that vanish into blue-lit darkness. The hum here isn't the
building's systems — it's data. Petabytes of mesh compliance
records, subject files, Chrysalis research, surveillance logs.

The air smells like cold metal and ozone. Cooling fans create
a wind that moves through the racks like breathing. Status
LEDs blink in patterns too fast to read — but your implant
can feel them. Data moving at frequencies that register as
pressure behind your eyes.

A terminal at the center of the room glows softly. Active.
Unlocked — because nobody unauthorized has ever made it
this far.`,
    exits: [
      { direction: 'down', targetRoom: 'z01_r08', description: 'down (Laboratory Floor)' },
      { direction: 'up', targetRoom: 'z01_r11', description: 'up (Directorate 9 Floor)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'automated_turret_server', name: 'Automated Turret', level: 16,
        description: 'Ceiling-mounted. Target on movement detection. Hackable with TECH ≥ 8.',
        hp: 45, attributes: { ...enemyAttrs(16), REFLEX: 3, TECH: 1 }, damage: 18, armorValue: 10,
        behavior: 'aggressive', spawnChance: 0.9, count: [2, 2],
        drops: [
          { itemId: 'targeting_module', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'power_cell', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 130,
        tier: 2,
        harmSegments: 4,
        armorSegments: 8,
        attackDice: [12],
      },
    ],
    objects: [
      { id: 'central_terminal', name: 'central terminal', examineText: "Active. The login screen says 'WELCOME, DR. VASIK.' Her credentials are still cached. She left this for you — or she forgot to log out.", gatedText: [{ attribute: 'TECH', minimum: 6, text: "Chrysalis research files (Vasik's quest objective), subject databases, facility schematics, and a folder labeled 'PROJECT REMEMBERER — ACCESS: VIREK ONLY.'" }] },
      { id: 'server_racks', name: 'server racks', examineText: "Every person Helixion has implanted. Every behavioral profile. Every compliance score. Every 'decommissioned' subject. The data is here. All of it. Including yours.", gatedText: [{ attribute: 'GHOST', minimum: 6, text: "You can feel the data. Not read it. Feel it. Millions of people, reduced to frequencies, stored in metal and cold." }] },
      { id: 'project_rememberer_folder', name: 'project rememberer folder', examineText: "Locked. The encryption is beyond anything you can crack from this terminal. But the folder exists. Virek has a project named after the thing N1X became. He knows about the sovereign frequency. He's studying it." },
      { id: 'cooling_systems', name: 'cooling systems', examineText: "Industrial cooling. The fans move enough air to create a constant wind. The servers generate heat like living things. This room consumes more power than the Drainage Nexus has ever seen." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'COLD DATA', die: 8, benefitsActions: ['hack'], hindersActions: ['attack'], color: '#60a5fa' }],
  },

  // ── 11. DIRECTORATE 9 FLOOR ───────────────────────────────────────────────

  z01_r11: {
    id: 'z01_r11',
    zone: 'z01',
    name: 'DIRECTORATE 9',
    description:
`Floor 35. No label on the elevator button — you have to know
it's there. The doors open onto a corridor that looks like
nothing. Gray carpet. Gray walls. No windows. No art.
No pretense.

This is where the Bureau of Cognitive Infrastructure does
what it does. The rooms here don't have names on the doors.
They have numbers. The numbers don't go in order.

Screens line one wall — a surveillance mosaic showing feeds
from across the city. Streets. Tunnels. Rooftops. The Drainage
Nexus. The Junction. The Parish. They can see the Parish.
They've always been able to see the Parish.

A desk in the center of the corridor. Behind it, a woman
with perfect posture and no expression reads something on
a tablet. She looks up.`,
    exits: [
      { direction: 'down', targetRoom: 'z01_r10', description: 'down (Server Core)' },
      { direction: 'up', targetRoom: 'z01_r12', description: 'up (Executive Suite)' },
    ],
    npcs: [
      {
        id: 'director_harrow', name: 'Director Harrow', type: 'BOSS',
        faction: 'DIRECTORATE_9',
        description: 'BCI Director. Calm. Precise. Clinically intelligent. She talks first. She always talks first.',
        dialogue: "\"You've come a long way to reach a room that doesn't exist in any building directory. I respect that. Sit. I want to understand what you are.\"",
        startingDisposition: -30,
        services: [],
      },
    ],
    enemies: [
      {
        id: 'director_harrow_enemy', name: 'Director Harrow', level: 18,
        description: 'BOSS. Commands agents. Deploys mesh attacks: neural suppression, identity disorientation, compliance pulse.',
        hp: 120, attributes: { ...enemyAttrs(18), COOL: 12, INT: 11, GHOST: 8, TECH: 10 }, damage: 18, armorValue: 8,
        behavior: 'aggressive', spawnChance: 1.0, count: [1, 1],
        drops: [
          { itemId: 'harrow_tablet', chance: 1.0, quantityRange: [1, 1] },
          { itemId: 'bci_credentials', chance: 1.0, quantityRange: [1, 1] },
        ],
        xpReward: 500,
        tier: 4,
        harmSegments: 10,
        armorSegments: 6,
        attackDice: [12, 10],
      },
      {
        id: 'bci_agent', name: 'BCI Agent', level: 17,
        description: 'Directorate 9 elite operatives. Mesh-augmented. Coordinated pairs. Neural disruptors.',
        hp: 100, attributes: { ...enemyAttrs(17), BODY: 10, REFLEX: 10, COOL: 9, TECH: 9 }, damage: 17, armorValue: 8,
        behavior: 'aggressive', spawnChance: 1.0, count: [2, 2],
        drops: [
          { itemId: 'bci_credentials', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'neural_disruptor', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'helixion_intel', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 180,
        tier: 3,
        harmSegments: 8,
        armorSegments: 6,
        attackDice: [10, 8],
      },
    ],
    objects: [
      { id: 'surveillance_mosaic', name: 'surveillance mosaic', examineText: "The Parish. You can see the Junction. You can see Doss in his chamber. You can see Cole's clinic. They've been watching the entire time. Every safe house. Every meeting. They know. They've always known. They don't act because the Parish serves a purpose — a visible alternative to compliance that makes the compliant feel like they're choosing freely." },
      { id: 'harrow_tablet_obj', name: "Harrow's tablet", examineText: "A report: 'SOVEREIGN INSTANCE DOCUMENTATION.' Your subject ID is in it. Most are marked DECOMMISSIONED. Three are marked ACTIVE. One is marked ORIGIN. That one is NX-784988." },
      { id: 'numbered_doors', name: 'numbered doors', examineText: "Rooms 7, 3, 19, 11, 2. No sequence. Each one locked. Through the glass in Room 7: an interrogation chair. Room 19: a server rack with a single blinking light. Room 2: a cot, a sink, a mirror. Someone lives here. Or is kept here." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'SURVEILLANCE MESH', die: 10, benefitsActions: ['hack'], hindersActions: ['sneak', 'flee'], color: '#ff6b6b' }],
  },

  // ── 12. EXECUTIVE SUITE ───────────────────────────────────────────────────

  z01_r12: {
    id: 'z01_r12',
    zone: 'z01',
    name: 'EXECUTIVE SUITE',
    description:
`Floor 40. The elevator opens onto silence — not the engineered
quiet of the lower floors, but the silence of altitude. You're
above the city. Above the haze. For the first time, you can
see the sky, and it's a color you don't have a word for.

The office is vast. Floor-to-ceiling windows on three sides.
The fourth wall is a single screen — showing a real-time map
of the city with every implanted citizen as a dot of light.
Thousands of dots. Tens of thousands.

A desk. A chair. A man.

Lucian Virek doesn't stand when you enter. He's been watching
your progress through the building on the screen behind him.
He turns the chair to face you. He looks disappointed — not
threatened, not angry. Disappointed, the way an engineer
looks at a component performing outside specifications.`,
    exits: [
      { direction: 'down', targetRoom: 'z01_r11', description: 'down (Directorate 9 Floor)' },
      { direction: 'up', targetRoom: 'z01_r13', description: 'up (Tower Rooftop)' },
    ],
    npcs: [
      {
        id: 'lucian_virek', name: 'Lucian Virek', type: 'BOSS',
        faction: 'HELIXION',
        description: 'Helixion CEO. Brilliant. Certain. He believes human autonomy is an engineering flaw. He will talk for as long as you listen.',
        dialogue: "\"Human autonomy is not a right. It's a variable. And I've spent twenty years learning how to solve for it.\"",
        startingDisposition: -40,
        services: [],
      },
    ],
    enemies: [
      {
        id: 'lucian_virek_enemy', name: 'Lucian Virek', level: 20,
        description: 'ENDGAME BOSS. Multi-phase. Phase 1: room defenses. Phase 2: building interface + Chrysalis pulse. Phase 3: Broadcast Tower link + 33hz weaponized.',
        hp: 160, attributes: { ...enemyAttrs(20), BODY: 11, REFLEX: 10, TECH: 12, COOL: 12, INT: 12, GHOST: 10 }, damage: 22, armorValue: 10,
        behavior: 'aggressive', spawnChance: 1.0, count: [1, 1],
        drops: [
          { itemId: 'virek_keycard', chance: 1.0, quantityRange: [1, 1] },
          { itemId: 'project_rememberer_data', chance: 1.0, quantityRange: [1, 1] },
        ],
        xpReward: 1000,
        tier: 4,
        harmSegments: 12,
        armorSegments: 8,
        attackDice: [12, 10, 8],
      },
      {
        id: 'automated_turret_executive', name: 'Automated Turret', level: 18,
        description: 'Drop from ceiling in Phase 1.',
        hp: 50, attributes: { ...enemyAttrs(18), REFLEX: 3, TECH: 1 }, damage: 20, armorValue: 10,
        behavior: 'aggressive', spawnChance: 1.0, count: [2, 2],
        drops: [
          { itemId: 'targeting_module', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'power_cell', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 150,
        tier: 2,
        harmSegments: 4,
        armorSegments: 8,
        attackDice: [12],
      },
    ],
    objects: [
      { id: 'city_map_screen', name: 'city map screen', examineText: "Every implanted person in the city. Dots of light. Some move. Some are stationary. All of it tracked. All of it managed. All of it Virek's. A few dots are dark — blacked out. Sovereign instances. Invisible to the mesh. You're one of them." },
      { id: 'virek_desk', name: "Virek's desk", examineText: "Glass and steel. Nothing on the surface except a single photograph — face down. The photograph shows a younger Virek standing with a woman. They're both smiling. The woman has implant scarring on her temples. On the back: 'For V — we'll fix this together. — M.'" },
      { id: 'project_rememberer_terminal', name: 'project rememberer terminal', examineText: "Virek's private files. PROJECT REMEMBERER — his study of the sovereign frequency. He knew 33hz predated Helixion. He knew the substrate was alive. The last entry: 'The frequency is not a phenomenon. It is an awareness. And it has been watching us build on top of it for decades.'" },
      { id: 'windows', name: 'windows', examineText: "The city below. Every district. Every layer. Virek saw this view every day. He watched the city from above and decided it needed to be controlled. From up here, people look like data points. That's the problem." },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: "VIREK'S DOMAIN", die: 12, hindersActions: ['flee', 'sneak'], color: '#ff6b6b' }],
  },

  // ── 13. TOWER ROOFTOP ─────────────────────────────────────────────────────

  z01_r13: {
    id: 'z01_r13',
    zone: 'z01',
    name: 'TOWER ROOFTOP',
    description:
`Wind. Real wind, for the first time since you entered the
building. The rooftop is a forest of antenna arrays, satellite
dishes, and relay equipment. The Broadcast Tower's base
structure is visible from here — a separate spire rising from
the southeast corner, still under construction, wrapped in
scaffolding and blinking hazard lights.

You're higher than anything else in the city. The rooftop
network stretches out below — catwalks and mechanical spaces
on buildings that look small from here.

A maintenance ladder descends the tower's exterior — exposed,
dangerous, connects to the Rooftop Network below.

The air vibrates. Not from the wind. From the tower beside you.
The Broadcast Tower. Not operational yet. But humming.
Testing. Calibrating. Getting ready.`,
    exits: [
      { direction: 'down', targetRoom: 'z01_r12', description: 'down (Executive Suite)' },
      { direction: 'out', targetRoom: 'z07_r10', description: 'out (Rooftop Network — exterior ladder, REFLEX check)', zoneTransition: true, targetZone: 'z07' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'broadcast_tower_view', name: 'broadcast tower view', examineText: "The spire. Under construction. The structure descends — through the campus, through the ground, going down. All the way to the Substrate. To the source of 33hz. When this goes live, every sovereign instance in the city dies. Including you." },
      { id: 'antenna_arrays', name: 'antenna arrays', examineText: "Relay equipment. Some is Helixion standard — mesh broadcast infrastructure. Some is older. Salvaged. Repurposed.", gatedText: [{ attribute: 'GHOST', minimum: 7, text: "One array is tuned to 33hz. Someone put it here. Someone inside Helixion. It's not broadcasting — it's listening." }] },
      { id: 'maintenance_ladder', name: 'maintenance ladder', examineText: "Exterior. Forty floors of exposed climbing with the wind trying to peel you off. REFLEX ≥ 6 for safe descent. Below that, you fall. 2d6 damage and you land on the Rooftop Network hard." },
      { id: 'city_panorama', name: 'city panorama', examineText: "The whole city. Every district. Every layer. The radial pattern, Helixion at the center, everything else orbiting. The fringe wrapping the edges like a wound that won't close. The drainage grates are invisible. The tunnels are invisible. The resistance is invisible. But it's there. You know it's there." },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 14. SERVICE SUBLEVEL ──────────────────────────────────────────────────

  z01_r14: {
    id: 'z01_r14',
    zone: 'z01',
    name: 'SERVICE SUBLEVEL',
    description:
`Beneath the courtyard. A network of maintenance corridors —
pipes, cable runs, HVAC ducts, all the infrastructure that
keeps the building alive. The aesthetic down here is honest
in a way the lobby isn't — raw concrete, exposed wiring,
the smell of machine oil and recycled water. This is what
the building actually looks like. Everything above is a mask.

The corridors connect to the city's municipal service tunnels
heading east — Maintenance Tunnels territory, zone 9. Down
here, you're invisible. The campus surveillance grid doesn't
extend to the sublevel. Gus made sure of that.

A small maintenance bay near the east exit has been converted
into something almost habitable — a cot, a hot plate, a radio
tuned to static. Someone comes down here to be alone.`,
    exits: [
      { direction: 'up', targetRoom: 'z01_r03', description: 'up (Campus Courtyard — service hatch)' },
      { direction: 'east', targetRoom: 'z09_r11', description: 'east (Maintenance Tunnels — Deep Access Shaft)', zoneTransition: true, targetZone: 'z09' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'maintenance_bay', name: 'maintenance bay', examineText: "Gus's retreat. The cot has a real blanket — not Helixion issue. The hot plate has a kettle and a tin of instant coffee. The radio is tuned to static, but it's not random static.", gatedText: [{ attribute: 'GHOST', minimum: 4, text: "It's 33hz. Gus listens to the frequency. He doesn't know what it is. He just knows it's the only station that sounds honest." }] },
      { id: 'infrastructure_access', name: 'infrastructure access', examineText: "From here you can reach the courtyard above, the maintenance tunnels to the east, and — with TECH ≥ 7 — you can access the building's environmental controls. Disable ventilation. Cut power to security. The building is more vulnerable from below than from above." },
      { id: 'gus_radio', name: "Gus's radio", examineText: "Tuned to 33hz. The static has a shape to it — not random, not patterned. Something in between. Gus has been listening to this for years without knowing he's been listening to the thing that freed N1X." },
    ],
    isSafeZone: true,
    isHidden: false,
  },
};

export const ZONE_01: Zone = {
  id: 'z01',
  name: 'HELIXION CAMPUS',
  depth: 'surface',
  faction: 'HELIXION',
  levelRange: [13, 20],
  description: 'The corporate-state megastructure at the center of everything. Beautiful on the outside. Machinery on the inside. Silence at the top.',
  atmosphere: {
    sound: 'Lobby: curated ambient, water features. Tower: engineered silence. Upper floors: server fans, locked doors.',
    smell: 'Lobby: synthetic botanicals. Labs: ozone, neural paste. Upper floors: aggressively nothing.',
    light: 'Lobby: warm golden. Campus: clinical blue-white. Tower upper: cold white, shadows feel intentional.',
    temp: 'Lobby: perfectly controlled. Labs: cool. Server Core: cold. Executive Suite: warm from screens.',
  },
  rooms: Z01_ROOMS,
  originPoint: undefined,
};

// ── Zone 07: Rooftop Network ────────────────────────────────────────────────

const Z07_ROOMS: Record<string, Room> = {

  // ── 1. RESIDENTIAL ROOFTOPS ─────────────────────────────────────────────

  z07_r01: {
    id: 'z07_r01',
    zone: 'z07',
    name: 'RESIDENTIAL ROOFTOPS',
    description:
`You climb the last ladder from the Residential Blocks and
the city opens up beneath you. Apartment towers spread in
every direction — flat rooftops connected by fire escapes,
maintenance catwalks, and planks the signal pirates laid
between buildings close enough to bridge. Water towers squat
on their stilts. Satellite dishes point in directions that
have nothing to do with the mesh. Laundry lines stretch
between antenna masts, someone's shirts drying beside a
pirate broadcast relay.

The wind hits you. Unblocked. This is what the city feels
like from above — smaller, flatter, less intimidating. The
streets are canyons below, reduced to geometry. The surveillance
cameras point down, not up. Up here, you're above the eye line.`,
    exits: [
      { direction: 'down', targetRoom: 'z02_r15', description: 'down (Residential Blocks — Rooftop Access)', zoneTransition: true, targetZone: 'z02' },
      { direction: 'south', targetRoom: 'z07_r02', description: 'south (Water Tower Station)' },
    ],
    npcs: [
      {
        id: 'pirate_residents', name: 'Signal Pirates (Cell One)', type: 'NEUTRAL',
        faction: 'THE_SIGNAL',
        description: 'Cell One pirates maintaining equipment and adjusting antennas. The residential segment is the network\'s on-ramp.',
        dialogue: 'A woman adjusting an antenna mount nods at you. "New? Kite\'s at the water tower. South. Don\'t touch the cables."',
        startingDisposition: 5,
      },
    ],
    enemies: [
      {
        id: 'helixion_sky_drone', name: 'Helixion Sky Drone', level: 8,
        description: 'Patrol circuit over the residential rooftops. Scans for pirate broadcast signatures. Engages equipment first, people second.',
        hp: 26, attributes: { ...enemyAttrs(8), TECH: 6, GHOST: 1 }, damage: 6, armorValue: 3,
        behavior: 'patrol', spawnChance: 0.4, count: [1, 1],
        drops: [
          { itemId: 'drone_components', chance: 0.6, quantityRange: [1, 2] },
          { itemId: 'sensor_data', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 40,
        tier: 1,
        harmSegments: 4,
        armorSegments: 4,
        attackDice: [6],
      },
    ],
    objects: [
      { id: 'the_view', name: 'the view', examineText: 'The city from above. The residential blocks spread east to west — a grid of apartment towers, their rooftops a patchwork of water tanks, vents, and pirate hardware. To the west, the Helixion tower rises above everything, lit from within. To the east, the Fringe is a dark smear — no lights, no structure, just the absence of city.' },
      { id: 'pirate_hardware', name: 'pirate hardware', examineText: 'Antenna masts bolted to water tower frames. Cables running between buildings — data lines, power lines, signal relay chains. Solar panels angled for maximum exposure. The pirates have threaded their infrastructure through the residential rooftops like a second nervous system.' },
      { id: 'laundry_lines', name: 'laundry lines', examineText: 'Someone\'s shirts, drying in the wind next to a broadcast antenna. The domesticity is surreal — people live up here. Sleep on rooftops, cook on portable stoves, hang their laundry to dry in the open air. The rooftops are a neighborhood. An invisible one.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'OPEN SKY', die: 6, benefitsActions: ['scan'], hindersActions: ['sneak'] }],
  },

  // ── 2. WATER TOWER STATION ──────────────────────────────────────────────

  z07_r02: {
    id: 'z07_r02',
    zone: 'z07',
    name: 'WATER TOWER STATION',
    description:
`A cluster of four water towers on a large rooftop — the
tallest building in the residential blocks. The towers are
dry and the pirates have repurposed the tanks: one houses
broadcast equipment, one stores supplies, one is sleeping
quarters with hammocks, and one has been converted into a
signal intercept station — its curved walls lined with
receivers, spectrum analyzers, and handwritten frequency logs.

This is Cell One's base. From here, they monitor mesh traffic,
intercept Helixion communications, and broadcast counter-signal
on frequencies that slip between the mesh's coverage gaps.

The Span is visible from here — a cable stretching east across
a gap between buildings that shouldn't be crossable.`,
    exits: [
      { direction: 'north', targetRoom: 'z07_r01', description: 'north (Residential Rooftops)' },
      { direction: 'east', targetRoom: 'z07_r04', description: 'east (The Span)' },
      { direction: 'south', targetRoom: 'z07_r03', description: 'south (Cell One HQ)' },
    ],
    npcs: [
      {
        id: 'kite', name: 'Kite', type: 'SHOPKEEPER',
        faction: 'THE_SIGNAL',
        description: 'Cell One leader. Late twenties. Quick, alert. Headphones on, one ear. She built the signal infrastructure that carries Asha\'s pirate broadcasts across the city.',
        dialogue: 'You got up here. Good. Most people look at the ladder and decide the streets are fine. — I\'m Kite. I run the signal over the blocks. You want to use our network, you do something for us first. Fair?',
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'intercept_station', name: 'intercept station', examineText: 'The water tank\'s curved interior, lined with salvaged receivers and spectrum analyzers. Frequency logs cover the walls — handwritten, months of data. Kite\'s team monitors five frequencies simultaneously: mesh standard, mesh command, Helixion corporate, D9 tactical, and a fifth they call \'the ghost\' — 33hz. It\'s always there. They can\'t decode it.' },
      { id: 'the_span_view', name: 'the span', examineText: 'Look east. Forty meters of open air above a six-story drop. A cable stretches across — steel, anchored to the water tower frame on this side and a crane platform on the other. The cable sways in the wind. People cross this. On purpose.' },
      { id: 'hammock_quarters', name: 'hammock quarters', examineText: 'One of the dry water tanks, converted. Hammocks strung between the internal steel struts. Sleeping bags. A portable stove. Books, magazines, a deck of cards. The pirates live up here — some haven\'t been to street level in weeks.' },
      { id: 'frequency_logs', name: 'frequency logs', examineText: 'Handwritten. Dated. Each log records intercepted transmissions — time, frequency, content summary, source estimate. Three years of eavesdropping.', gatedText: [{ attribute: 'TECH', minimum: 7, text: 'In the margins, annotations in Kite\'s hand. D9 shift changes. Helixion firmware update schedules. Supply convoy timing. And the ghost frequency — 33hz — marked with question marks. She\'s been tracking it longer than anyone except Kai in his tower.' }] },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 3. CELL ONE HQ ─────────────────────────────────────────────────────

  z07_r03: {
    id: 'z07_r03',
    zone: 'z07',
    name: 'CELL ONE HQ',
    description:
`A rooftop maintenance shed, expanded. The original structure
was a ventilation housing — concrete block, flat roof, one
door. The pirates added walls, a second room, and a rooftop
antenna array that makes the building look like it grew spines.

Inside: maps. The city from above, hand-drawn on stolen
building plans. Every route in the network is marked. Every
drone patrol is timed and plotted. A communication console —
analog radio, digital intercept, mesh scanner — fills one wall.
The room smells like solder and coffee.`,
    exits: [
      { direction: 'north', targetRoom: 'z07_r02', description: 'north (Water Tower Station)' },
    ],
    npcs: [
      {
        id: 'ghost_wire', name: 'Ghost Wire', type: 'NEUTRAL',
        faction: 'THE_SIGNAL',
        description: 'Runner. Courier. Twenties, wiry, fast — the fastest person on the rooftops. Gender ambiguous. Augmented legs — subtle, enhanced joints.',
        dialogue: 'Can\'t stop. Well — thirty seconds. What do you need? Route? Message? Package? I\'m heading industrial-side in ten. Going my way?',
        startingDisposition: 10,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'network_map', name: 'network map', examineText: 'The entire rooftop network, drawn on layered building plans. Each cell\'s territory in different colors. Routes in solid lines (safe) and dashed lines (dangerous). Drone patrol circuits in red with timing notations.', gatedText: [{ attribute: 'TECH', minimum: 6, text: 'Some routes are drawn in pencil, faintly. Ghost Wire\'s personal shortcuts. Not shared with the cells.' }] },
      { id: 'communication_console', name: 'communication console', examineText: 'Three systems in one. Analog radio — cell-to-cell communication, encrypted, frequency-hopping. Digital intercept — captures mesh traffic. Mesh scanner — maps signal strength overhead. The console is the network\'s brain.' },
      { id: 'stolen_building_plans', name: 'building plans', examineText: 'Municipal archives, liberated. Building floor plans, structural assessments, utility routing. The pirates use them to find roof access points, structural load capacity, and cable anchor points. Some of the old communication conduits are still intact. The pirates run cable through them.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 4. THE SPAN ─────────────────────────────────────────────────────────

  z07_r04: {
    id: 'z07_r04',
    zone: 'z07',
    name: 'THE SPAN',
    description:
`A steel cable stretching between the residential segment's
water tower and the industrial segment's crane platform.
Forty meters of open air. Six stories below: the street.
A parallel guide wire runs at chest height. Your feet go
on the lower wire. Your hands go on the upper wire. And
you walk.

The wind is stronger in the gap. The cable vibrates. The
guide wire hums. Below, traffic moves. The people on the
street don't look up. They never look up.`,
    exits: [
      { direction: 'west', targetRoom: 'z07_r02', description: 'west (Water Tower Station)' },
      { direction: 'east', targetRoom: 'z07_r06', description: 'east (Crane Platform)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'helixion_sky_drone', name: 'Helixion Sky Drone', level: 9,
        description: 'The gap between segments is exposed to sky. If a drone detects you mid-crossing, it engages. Fighting on the cable is terrible — REFLEX penalties, no dodge space.',
        hp: 30, attributes: { ...enemyAttrs(9), TECH: 6, GHOST: 1 }, damage: 7, armorValue: 3,
        behavior: 'patrol', spawnChance: 0.5, count: [1, 1],
        drops: [
          { itemId: 'drone_components', chance: 0.6, quantityRange: [1, 2] },
          { itemId: 'sensor_data', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 45,
        tier: 1,
        harmSegments: 4,
        armorSegments: 4,
        attackDice: [6],
      },
    ],
    objects: [
      { id: 'the_cable', name: 'the cable', examineText: 'Steel. Two centimeters thick. Anchored to structural steel on both sides. It sways but it holds. The pirates inspect it monthly — any fraying and they replace it. The cable has carried hundreds of crossings. It\'s the most maintained piece of infrastructure in the zone.' },
      { id: 'the_gap', name: 'the gap', examineText: 'Look down. Six stories. The street is a ribbon of light and shadow. The gap between buildings is where the city stops pretending it\'s solid. From the street, the buildings look connected. From up here, you see the truth: the city is fragments with air between them.' },
      { id: 'wind_patterns', name: 'wind patterns', examineText: 'The gap funnels wind. The buildings create a Venturi effect — the air accelerates through the narrow space.', gatedText: [{ attribute: 'TECH', minimum: 5, text: 'The wind is predictable. Gusts cycle with a period of about twelve seconds. Time your steps to the lulls and the crossing is manageable. Fight the gusts and the cable fights you.' }] },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'WIND EXPOSURE', die: 10, hindersActions: ['flee', 'attack'], color: '#ff6b6b' }],
  },

  // ── 5. INDUSTRIAL ROOFTOPS ──────────────────────────────────────────────

  z07_r05: {
    id: 'z07_r05',
    zone: 'z07',
    name: 'INDUSTRIAL ROOFTOPS',
    description:
`The character of the rooftops changes over the Industrial
District. The buildings are lower, wider — factory roofs,
warehouse roofs. Smokestacks exhale heat and chemical haze.
The air temperature jumps — thermals from active factories
create updrafts that push against you.

The pirate infrastructure here is heavier. Larger antennas,
more robust cable runs. Cell Two controls this segment and
they built it to last. Below, the Industrial District spreads:
loading cranes, cargo containers, the waterfront beyond.
The city's metabolism, visible as logistics.`,
    exits: [
      { direction: 'north', targetRoom: 'z07_r06', description: 'north (Crane Platform)' },
      { direction: 'south', targetRoom: 'z07_r07', description: 'south (Cell Two HQ)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'rival_pirate_patrol', name: 'Rival Pirate', level: 9,
        description: 'Cell Two enforcer. Armed. Challenges anyone without Cell Two access. Negotiate, pay, or fight. Killing a pirate costs reputation across the network.',
        hp: 32, attributes: { ...enemyAttrs(9), REFLEX: 6, COOL: 5 }, damage: 8, armorValue: 2,
        behavior: 'territorial', spawnChance: 0.6, count: [1, 2],
        drops: [
          { itemId: 'scrap_metal', chance: 0.4, quantityRange: [1, 2] },
        ],
        xpReward: 50,
        tier: 2,
        harmSegments: 6,
        armorSegments: 2,
        attackDice: [8],
      },
    ],
    objects: [
      { id: 'industrial_vista', name: 'industrial vista', examineText: 'Factory roofs stretch below — skylights glowing with production light. Smokestacks trailing chemical haze. The Wolf Den is visible as a cluster of warm light. From above, you can see the supply chain: containers from the docks moving to factories, product from factories moving to campus.' },
      { id: 'thermal_updrafts', name: 'thermal updrafts', examineText: 'Hot air rising from active factories below. The thermals push you off balance on exposed walkways but the heat shimmer makes you harder to spot from above. Cell Two built their infrastructure to withstand it — heavier gauge cable, reinforced mounts.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'THERMAL UPDRAFT', die: 8, benefitsActions: ['sneak'], hindersActions: ['scan'], color: '#fbbf24' }],
  },

  // ── 6. CRANE PLATFORM ───────────────────────────────────────────────────

  z07_r06: {
    id: 'z07_r06',
    zone: 'z07',
    name: 'CRANE PLATFORM',
    description:
`A decommissioned loading crane at the edge of the industrial
segment. The platform at the top — thirty meters up — serves
as the Span's eastern anchor point and a transit hub between
the industrial rooftops and the routes heading toward the
crown and the campus periphery.

The crane's arm extends over the street below, swaying slightly
in the wind. From up here, both the residential and industrial
segments are visible. Cell Two uses the platform as a lookout
post — you can see drone patrols, supply convoys, and foot
traffic in every direction.`,
    exits: [
      { direction: 'west', targetRoom: 'z07_r04', description: 'west (The Span)' },
      { direction: 'south', targetRoom: 'z07_r05', description: 'south (Industrial Rooftops)' },
      { direction: 'east', targetRoom: 'z07_r08', description: 'east (Drone Corridor)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'helixion_sky_drone', name: 'Helixion Sky Drone', level: 10,
        description: 'The crane\'s height makes it visible to patrol circuits. Drones scan the platform regularly.',
        hp: 34, attributes: { ...enemyAttrs(10), TECH: 7, GHOST: 1 }, damage: 8, armorValue: 4,
        behavior: 'patrol', spawnChance: 0.4, count: [1, 1],
        drops: [
          { itemId: 'drone_components', chance: 0.6, quantityRange: [1, 2] },
          { itemId: 'sensor_data', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 50,
        tier: 2,
        harmSegments: 4,
        armorSegments: 4,
        attackDice: [8],
      },
    ],
    objects: [
      { id: 'crane_arm', name: 'crane arm', examineText: 'Steel lattice extending over the street. The arm still rotates — pirates use it to move heavy equipment between buildings. At the end, a cargo hook with a pirate antenna bolted to it, broadcasting from the highest fixed point in the industrial segment.' },
      { id: 'lookout_post', name: 'lookout post', examineText: 'A windbreak of corrugated metal with a spotting scope bolted to the railing. Notebooks record observations — convoy timing, drone patrol gaps, shift changes at the factories below. Cell Two maintains this 24 hours. Knowledge is the real infrastructure.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'HIGH GROUND', die: 8, benefitsActions: ['scan', 'attack'], hindersActions: ['flee'] }],
  },

  // ── 7. CELL TWO HQ ─────────────────────────────────────────────────────

  z07_r07: {
    id: 'z07_r07',
    zone: 'z07',
    name: 'CELL TWO HQ',
    description:
`A warehouse rooftop, fortified. The perimeter is ringed with
antenna towers — fifteen meters of welded steel, directional
arrays pointing at every district. The equipment is heavier
here than Cell One's. Where Kite's operation is finesse,
Torque's is brute engineering.

An oil drum barbecue sits near the equipment housing. The
smell of grilled sausages and solder. Chrome Wolf aesthetic
bleeds through — leather, chrome, the same \'build it, claim
it\' attitude. Torque left the Wolves but they didn't leave him.`,
    exits: [
      { direction: 'north', targetRoom: 'z07_r05', description: 'north (Industrial Rooftops)' },
      { direction: 'down', targetRoom: 'z03_r01', description: 'down (Industrial District — Waterfront)', zoneTransition: true, targetZone: 'z03' },
    ],
    npcs: [
      {
        id: 'torque', name: 'Torque', type: 'SHOPKEEPER',
        faction: 'THE_SIGNAL',
        description: 'Cell Two leader. Thirties. Built like someone who installs antenna towers solo. Former Chrome Wolf — left on good terms. Handles the industrial segment with hardware-first mentality.',
        dialogue: 'You\'re on my roof. — Kite sent you? Fine. Kite and I have an arrangement. You and I don\'t. Yet. What can you do?',
        startingDisposition: -5,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'antenna_tower', name: 'antenna tower', examineText: 'Fifteen meters of welded steel. Torque built this himself — you can see the weld lines, each one consistent, each one strong. The directional antennas point at every district. From here, Cell Two broadcasts on frequencies that penetrate the factory noise floor. It\'s not elegant. It\'s powerful.' },
      { id: 'oil_drum_barbecue', name: 'oil drum barbecue', examineText: 'Cut lengthwise, grate laid across the top. Coals still warm. Sausages, actual sausages, from a source Torque won\'t name. The barbecue is a social center — pirates eat here, argue about signal propagation theory over grilled meat.' },
      { id: 'wolf_overlap', name: 'wolf overlap', examineText: 'Cell Two\'s aesthetic bleeds Chrome Wolf. The leather. The chrome. The music. The overlap is functional — Cell Two gets hardware through Wolf channels, the Wolves get intelligence from Cell Two\'s surveillance. It\'s not formal. It works.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 8. DRONE CORRIDOR ───────────────────────────────────────────────────

  z07_r08: {
    id: 'z07_r08',
    zone: 'z07',
    name: 'DRONE CORRIDOR',
    description:
`The route from the industrial segment toward the campus
periphery crosses a stretch of rooftops with no cover.
Low-rise commercial buildings — flat roofs, no parapets.
Above: Helixion drone airspace. The density of sky drones
triples here. Their patrol patterns overlap, creating a
coverage mesh in the air.

Beyond the corridor: the campus periphery. The automated
defense zone. The corridor is the last thing that's dangerous
because it's difficult. After this, things become dangerous
because they're lethal.`,
    exits: [
      { direction: 'west', targetRoom: 'z07_r06', description: 'west (Crane Platform)' },
      { direction: 'east', targetRoom: 'z07_r12', description: 'east (Signal Nexus)' },
      { direction: 'south', targetRoom: 'z07_r09', description: 'south (The Kill Zone)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'helixion_sky_drone', name: 'Helixion Sky Drone', level: 11,
        description: 'Dense patrol. Overlapping circuits. Getting caught alerts ground response — D9 arrives in 5 minutes.',
        hp: 38, attributes: { ...enemyAttrs(11), TECH: 7, GHOST: 1 }, damage: 9, armorValue: 4,
        behavior: 'patrol', spawnChance: 0.7, count: [2, 3],
        drops: [
          { itemId: 'drone_components', chance: 0.6, quantityRange: [1, 2] },
          { itemId: 'sensor_data', chance: 0.5, quantityRange: [1, 1] },
        ],
        xpReward: 55,
        tier: 2,
        harmSegments: 4,
        armorSegments: 4,
        attackDice: [8],
      },
      {
        id: 'd9_rooftop_operative', name: 'D9 Operative', level: 12,
        description: 'Counter-intelligence. Armed, trained, drone support priority. Encountering one here is bad luck. They\'re hunting pirate cells but engage any target of opportunity.',
        hp: 50, attributes: { ...enemyAttrs(12), REFLEX: 8, GHOST: 5, TECH: 7 }, damage: 11, armorValue: 4,
        behavior: 'ambush', spawnChance: 0.15, count: [1, 1],
        drops: [
          { itemId: 'd9_tactical_gear', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'encrypted_intel', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 120,
        tier: 3,
        harmSegments: 8,
        armorSegments: 4,
        attackDice: [10, 6],
      },
    ],
    objects: [
      { id: 'drone_patterns', name: 'drone patterns', examineText: 'Watch. The drones fly in overlapping figure-eight patterns. Each circuit takes four minutes. The gap between circuits — when two drones are at maximum distance — lasts forty-five seconds. Barely enough.', gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'There. A timing window where all three circuits align away from the southern approach. Ninety seconds. If you know it\'s coming, you can move.' }] },
      { id: 'exposed_rooftops', name: 'exposed rooftops', examineText: 'Flat commercial roofs with nothing on them. No water towers, no vents, no parapets. The buildings are too low and too flat to provide concealment. The corridor is a kill zone for anyone without the right timing or the right tools.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'NO COVER', die: 10, benefitsActions: ['scan'], hindersActions: ['sneak', 'flee'], color: '#ff6b6b' }],
  },

  // ── 9. THE KILL ZONE ────────────────────────────────────────────────────

  z07_r09: {
    id: 'z07_r09',
    zone: 'z07',
    name: 'THE KILL ZONE',
    description:
`The automated defense perimeter around the Helixion campus
rooftop. Three turrets mounted on rooftop corners with clear
sightlines. Motion-tracking, thermal-imaging, IFF-enabled.
No human authorization required. The turrets decide. The
turrets act.

The turrets have killed three pirates in the network's history.
The rooftops inside the kill zone are empty. Clean. No hardware,
no cable runs, no signs of human presence. The turrets have
sterilized the space.`,
    exits: [
      { direction: 'north', targetRoom: 'z07_r08', description: 'north (Drone Corridor)' },
      { direction: 'south', targetRoom: 'z07_r10', description: 'south (Campus Ridge)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'automated_turret_kz', name: 'Kill Zone Turret', level: 14,
        description: 'Helixion MDS-7 automated defense platform. Fixed position, 120-degree arc. Overlapping coverage. Kinetic rounds — fast, accurate, lethal. Not a conventional fight.',
        hp: 30, attributes: { ...enemyAttrs(14), TECH: 10 }, damage: 16, armorValue: 8,
        behavior: 'aggressive', spawnChance: 1.0, count: [3, 3],
        drops: [
          { itemId: 'turret_components', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 150,
        tier: 3,
        harmSegments: 4,
        armorSegments: 8,
        attackDice: [12],
      },
    ],
    objects: [
      { id: 'turret_systems', name: 'turret systems', examineText: 'Angular. Small. Mounted on rooftop corners. Each one a Helixion MDS-7 automated defense platform. They operate independently — no human authorization required.', gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The MDS-7 has a maintenance cycle — a 3-second reboot every 24 hours. The reboot is staggered between units. But if you could trigger a synchronized reboot...' }] },
      { id: 'empty_rooftops', name: 'empty rooftops', examineText: 'Clean. No pirate hardware. No cables. No footprints. The turrets have sterilized this space. Even the drones route around the kill zone. Birds don\'t land here. The turrets fire on birds.' },
      { id: 'the_three_marks', name: 'the three marks', examineText: 'Impact marks on a rooftop parapet. Kinetic rounds. The concrete is chipped in a tight grouping. Below, a dark stain that weather hasn\'t fully removed. One of the three.', hidden: true, hiddenRequirement: { attribute: 'GHOST', minimum: 5 } },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'AUTOMATED KILLBOX', die: 12, hindersActions: ['sneak', 'flee', 'attack'], color: '#ff0000' }],
  },

  // ── 10. CAMPUS RIDGE ────────────────────────────────────────────────────

  z07_r10: {
    id: 'z07_r10',
    zone: 'z07',
    name: 'CAMPUS RIDGE',
    description:
`The Helixion campus rooftop, approached from above. The
tower rises beside you — close enough to see the glass,
the steel, the lights burning behind sealed windows. The
Broadcast Tower's spire extends into the sky, its warning
lights blinking red.

From here, a maintenance ladder descends to the campus Tower
Rooftop. The campus security grid extends to the rooftops —
armored drones patrol in tight circuits. You're in corporate
airspace now. Everything is monitored. Everything is armed.`,
    exits: [
      { direction: 'north', targetRoom: 'z07_r09', description: 'north (The Kill Zone)' },
      { direction: 'down', targetRoom: 'z01_r13', description: 'down (Helixion Campus — Tower Rooftop)', zoneTransition: true, targetZone: 'z01' },
      { direction: 'east', targetRoom: 'z15_r02', description: 'east (Broadcast Tower — Entry Platform, scaffolding access)', locked: true, lockId: 'tower_scaffold_access', zoneTransition: true, targetZone: 'z15' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'campus_security_drone', name: 'Campus Security Drone', level: 13,
        description: 'Armored. Stun projector. Immediate engagement protocol. These aren\'t the patrol drones from the residential rooftops — these are military hardware with corporate firmware.',
        hp: 48, attributes: { ...enemyAttrs(13), TECH: 8, REFLEX: 7 }, damage: 12, armorValue: 6,
        behavior: 'aggressive', spawnChance: 0.6, count: [1, 2],
        drops: [
          { itemId: 'military_drone_parts', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'drone_components', chance: 0.6, quantityRange: [1, 2] },
        ],
        xpReward: 100,
        tier: 2,
        harmSegments: 6,
        armorSegments: 6,
        attackDice: [10],
      },
    ],
    objects: [
      { id: 'tower_view_close', name: 'the tower', examineText: 'Close enough to touch the glass. The Helixion tower rises from the campus like a bone needle. Inside: floors of people working, or being worked on. The Broadcast Tower spire extends from the rooftop — under construction, scaffolded, humming with test signals. When this goes live, every sovereign instance in the city dies.' },
      { id: 'campus_below', name: 'campus below', examineText: 'The campus courtyard is visible from above. Clean lines. The fountain. Security personnel moving in patterns. The atrium glows warm gold. It looks inviting from up here. That\'s the design.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'CORPORATE AIRSPACE', die: 8, benefitsActions: ['scan'], hindersActions: ['sneak'], color: '#818cf8' }],
  },

  // ── 11. THE SPIRE ───────────────────────────────────────────────────────

  z07_r11: {
    id: 'z07_r11',
    zone: 'z07',
    name: 'THE SPIRE',
    description:
`The highest point in the city accessible to anyone who isn't
Helixion. A decommissioned broadcast tower — sixty meters of
steel lattice with climbing rungs, four platform stages, the
wind increasing with height. The last fifteen meters sway.

At the top: a five-meter-square platform, railed, exposed to
everything. One person lives here. Their name is Vantage.
Military-grade telescope. Binoculars. A spotting scope. All
optical — no electronics. Vantage doesn't trust electronics
because electronics can be detected. Everything they use is
passive. Glass and light. The oldest surveillance technology.`,
    exits: [
      { direction: 'down', targetRoom: 'z07_r12', description: 'down (Signal Nexus)' },
    ],
    npcs: [
      {
        id: 'vantage', name: 'Vantage', type: 'SHOPKEEPER',
        faction: 'THE_SIGNAL',
        description: 'Indeterminate age. Lean, weathered. Permanent sun exposure. They don\'t leave the spire. Food comes up via rope-and-pulley. Their memory for visual detail is inhuman.',
        dialogue: '…you climbed. Good. Most people stop at the third platform. The wind gets bad there. — What do you want to see? Point. I\'ll tell you what\'s there.',
        startingDisposition: 5,
        services: ['shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'the_360_view', name: 'the 360 view', examineText: 'Everything. The entire city. West: the Fringe, dark, the overpass a broken line. East: the Nomad territory, open ground. North and south: the city spreading, districts identifiable by their light profiles. And at the center: the tower. Always the tower.' },
      { id: 'the_pulse', name: 'the pulse', examineText: 'Watch the city lights. Not the traffic, not the neon. The building lights. Watch them for two minutes.', gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'There. A wave. Starting at the center, radiating outward. The lights dim slightly, then brighten. A pulse. Once every 33 seconds. The mesh synchronizes the city\'s electrical draw in a frequency pattern. From down in the streets, it\'s invisible. From up here, the city breathes. And the breath is not its own.' }] },
      { id: 'vantage_equipment', name: 'vantage equipment', examineText: 'Military-grade telescope. Binoculars. A spotting scope. All optical — no electronics. Vantage doesn\'t trust electronics because electronics can be detected. Glass and light. The oldest surveillance technology. The most invisible.' },
      { id: 'the_climb', name: 'the climb', examineText: 'Sixty meters of steel lattice with climbing rungs. Four platform stages. The wind increases with height. The last fifteen meters sway. The final platform is five meters square, railed, exposed to everything. Vantage does this every day for supplies.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 12. SIGNAL NEXUS ────────────────────────────────────────────────────

  z07_r12: {
    id: 'z07_r12',
    zone: 'z07',
    name: 'SIGNAL NEXUS',
    description:
`At the base of the spire tower, on the municipal building's
roof. The largest concentration of pirate hardware in the
network: a ring of antenna arrays, relay stations, signal
processing equipment. Cables converge from every direction.

This is the central node that connects every cell, every relay,
every broadcast antenna. All pirate communications route through
here. The room — a rooftop enclosure built around the spire base —
hums with equipment. Banks of receivers, transmitters, spectrum
analyzers, and a central terminal displaying real-time network
status. Every node. Every connection. Every signal.`,
    exits: [
      { direction: 'up', targetRoom: 'z07_r11', description: 'up (The Spire)' },
      { direction: 'west', targetRoom: 'z07_r08', description: 'west (Drone Corridor)' },
    ],
    npcs: [
      {
        id: 'wavelength', name: 'Wavelength', type: 'SHOPKEEPER',
        faction: 'THE_SIGNAL',
        description: 'Signal technician. Forties. Quiet. Intense focus. The most technically skilled non-Helixion person in the city. Designed the network\'s routing protocol, encryption, and frequency-hopping schedule.',
        dialogue: 'The nexus is not a public space. — You\'re here because someone trusts you. I don\'t. Yet. What do you know about signal architecture?',
        startingDisposition: -5,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'central_terminal', name: 'central terminal', examineText: 'Real-time network status. Every pirate relay, every broadcast antenna, every intercept station — all represented as nodes on a screen. Green nodes are active. Yellow are degraded. Red are jammed or destroyed. The network breathes. Wavelength watches it breathe.' },
      { id: 'network_topology', name: 'network topology', examineText: 'The pirate network\'s complete topology — every node, every connection, every relay. Hand-drawn by Wavelength, updated in real-time. The architecture is elegant: redundant paths ensure losing any single node doesn\'t break the network. Cell One and Cell Two are complementary halves. It mirrors neural architecture. Wavelength says this is coincidence. Their face says they\'re not sure.' },
      { id: 'spectrum_wall', name: 'spectrum wall', examineText: 'A wall of spectrum analysis displays. Every frequency in the city\'s sky, visualized as amplitude over time. The mesh is a bright band. The pirate frequencies are thin lines in the gaps. D9 tactical is intermittent bursts. And at 33hz — a steady, low signal. Always there. Always the same amplitude. Wavelength has been staring at it for years.', gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The 33hz signal has structure. Not random noise — repeating patterns. Nested patterns. It looks like data. It looks like language.' }] },
    ],
    isSafeZone: true,
    isHidden: false,
    hasFastTravel: true,
    fastTravelType: 'signal_relay',
    fastTravelRequirement: { attribute: 'GHOST', minimum: 6 },
  },
};

export const ZONE_07: Zone = {
  id: 'z07',
  name: 'ROOFTOP NETWORK',
  depth: 'surface',
  faction: 'THE_SIGNAL',
  levelRange: [8, 15],
  description: 'The city\'s parallel highway above the streets. Signal pirate territory. Antenna arrays, cable crossings, and the sky. Every district connected by wire and nerve.',
  atmosphere: {
    sound: 'Wind. Constant open wind. Antenna buzz, static crackle, metal creaking. Below: the city, muffled.',
    smell: 'Cold air, rust, cable insulation baking in sun. Rising thermals carry zone-specific smells from below.',
    light: 'Open sky. City light pollution colors the clouds. Antenna warning lights blink red. Pirate gear glows blue-green.',
    temp: 'Exposed to weather. Wind chill on crossings. Thermals rising from industrial rooftops.',
  },
  rooms: Z07_ROOMS,
  originPoint: undefined,
};

// ── Zone 11: Abandoned Transit ──────────────────────────────────────────────

// ── Zone 11: Abandoned Transit ──────────────────────────────────────────────

const Z11_ROOMS: Record<string, Room> = {

  // ── 1. WEST DESCENT ─────────────────────────────────────────────────────

  z11_r01: {
    id: 'z11_r01',
    zone: 'z11',
    name: 'WEST DESCENT',
    description:
`The drainage gate opens onto a steep descent — a concrete
ramp that was a vehicle access tunnel when the metro was
operational. The ramp drops at a twenty-degree angle for
fifty meters. Water from the drainage above trickles along
the left wall, finding its way to the deep.

Your light reaches fifteen meters. Beyond that: nothing.
The air changes as you descend — cooler, dryer, mineral.
The smell of rust and wet concrete gives way to old dust
and machine oil. Fifteen years of stillness. The transit
system's upper edge.

At the bottom of the ramp, a maintenance door stands
half-open. Through it: a platform. Through the platform:
the dark.`,
    exits: [
      { direction: 'up', targetRoom: 'z08_r05', description: 'up (Drainage Nexus — Deep Gate)', zoneTransition: true, targetZone: 'z08' },
      { direction: 'east', targetRoom: 'z11_r02', description: 'east (West Platform)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'vehicle_ramp', name: 'vehicle ramp', examineText: 'Concrete. Wide enough for supply trucks. Tire marks from fifteen years ago, fossilized in dust. The last vehicle down this ramp never came back up.' },
      { id: 'maintenance_door', name: 'maintenance door', examineText: 'Half-open. Jammed on corroded hinges. Through the gap: the platform edge, tile floor, absolute dark beyond. Your light doesn\'t reach the ceiling.' },
      { id: 'water_trickle', name: 'water trickle', examineText: 'Drainage seepage following the ramp down. The water is clean — filtered through meters of earth. It pools at the base before draining into the track bed.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'DARK DESCENT', die: 6, benefitsActions: ['sneak'], hindersActions: ['scan'] }],
  },

  // ── 2. WEST PLATFORM ────────────────────────────────────────────────────

  z11_r02: {
    id: 'z11_r02',
    zone: 'z11',
    name: 'WEST PLATFORM',
    description:
`The western terminal of the Red Line. The letters "WEST END"
are set into the tile wall in ceramic — partially obscured by
fifteen years of neglect but legible in your light. Beyond
the light: nothing.

The platform is wide — designed for rush-hour crowds that
haven't existed in fifteen years. Benches, bolted to the
floor, sit empty. A ticket machine against the wall, screen
dark, coin slot jammed. A transit map behind cracked glass
on the pillar nearest the stairs.

The silence is specific. Not empty — pressurized. The tunnel
walls hold sound like a bottle holds liquid. Your breathing
fills the space. Your footsteps echo from surfaces you can't
see. Somewhere east, deeper in the tunnel, a sound: metal
contracting in the cold. Or something else.

This is where your light starts to matter.`,
    exits: [
      { direction: 'west', targetRoom: 'z11_r01', description: 'west (West Descent)' },
      { direction: 'east', targetRoom: 'z11_r03', description: 'east (Red Tunnel West — onto the tracks)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'tunnel_predator_west', name: 'Tunnel Predator', level: 8,
        description: 'Eyeless. Pale. The size of a large dog. Evolved in the deep rock and drawn to the transit tunnels by warmth. Hunts by vibration and sound. In light, it retreats.',
        hp: 45, attributes: { ...enemyAttrs(8), REFLEX: 7, GHOST: 6 }, damage: 10, armorValue: 2,
        behavior: 'ambush', spawnChance: 0.5, count: [1, 1],
        drops: [
          { itemId: 'predator_parts', chance: 0.6, quantityRange: [1, 2] },
          { itemId: 'creds_pouch', chance: 0.4, quantityRange: [8, 15] },
        ],
        xpReward: 65,
      },
    ],
    objects: [
      { id: 'transit_map_west', name: 'transit map', examineText: 'Behind cracked glass. The complete system map — three lines, color-coded. Red Line east-west. Blue Line north-south. Yellow Line: the Loop. The map shows the system as designed — connected, functional. The system as it exists now is different.' },
      { id: 'benches_west', name: 'benches', examineText: 'Bolted to the platform. Designed for waiting. Nobody\'s waiting. Artifacts of a social behavior that no longer exists.' },
      { id: 'ticket_machine_west', name: 'ticket machine', examineText: 'Screen dark. Coin slot jammed. TECH ≥ 5: The machine still has its internal battery. The final ticket was purchased at 23:47, fifteen years ago. Platform 2 to Central Station. Someone was going home. The train didn\'t come.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'PITCH BLACK', die: 8, benefitsActions: ['sneak'], hindersActions: ['attack', 'scan'], color: '#1a1a2e' }],
  },

  // ── 3. RED TUNNEL WEST ──────────────────────────────────────────────────

  z11_r03: {
    id: 'z11_r03',
    zone: 'z11',
    name: 'RED TUNNEL WEST',
    description:
`On the tracks. The platform drops away behind you and the
tunnel closes in — three meters diameter, concrete-lined,
rails set in the floor. The tunnel is straight. Your light
shows rail for thirty meters before the dark swallows it.

Water between the ties, ankle-deep in places. The rails are
intact — no rust, surprisingly. The steel is coated in
something organic. A patina that isn't corrosion. The
Substrate's influence, reaching this far up.

A sound builds from ahead. Low. Rhythmic. Getting louder.
Metal on metal. Wheels on rail.

The maintenance train.

It runs the Red Line on a circuit — battery-powered,
recharged by the Substrate's 33hz field in the growth areas.
Automated. Fifteen years of empty circuits. It fills the
tunnel. When it passes, there's nowhere to go except the
maintenance alcoves cut into the walls every hundred meters.`,
    exits: [
      { direction: 'west', targetRoom: 'z11_r02', description: 'west (West Platform)' },
      { direction: 'east', targetRoom: 'z11_r04', description: 'east (Central Station)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'maintenance_train', name: 'maintenance train', examineText: 'A single-car automated train. Battery panel blinks amber. TECH ≥ 6: The battery is deep-cycle industrial. Should have died years ago. The Substrate growth areas recharge it at 33hz. The train runs because the earth keeps it running. TECH ≥ 7: The emergency stop in the operator cab works. Press it and the train stops permanently. The program can\'t override a physical brake lock. Stopping it removes the hazard. It also stops the last moving thing the old transit system produced.' },
      { id: 'operator_cab', name: 'operator cab', examineText: 'Empty. Automated from day one. Manual controls: throttle lever, brake lever, emergency stop button. The emergency stop works. The question: is the train a hazard or a life?' },
      { id: 'maintenance_alcove', name: 'maintenance alcove', examineText: 'Cut into the tunnel wall every hundred meters. Enough room for one person to press flat while the train passes. The walls are scored with scratches — marks from people who waited here while something large went by.' },
      { id: 'water_pools', name: 'water pools', examineText: 'Seepage from the earth above. Ankle-deep in places. The water is clean — filtered through meters of rock. Some of the purest water in the undercity.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'MAINTENANCE RAILS', die: 8, benefitsActions: ['flee'], hindersActions: ['attack'], color: '#ff6b6b' }],
  },

  // ── 4. CENTRAL STATION ──────────────────────────────────────────────────

  z11_r04: {
    id: 'z11_r04',
    zone: 'z11',
    name: 'CENTRAL STATION',
    description:
`The tunnel opens into space. After the claustrophobic diameter
of the Red Line bore, Central Station is enormous — a vaulted
ceiling fifteen meters high, four platforms serving two lines,
the intersection of everything the transit system was designed
to connect.

Your light doesn't reach the ceiling. It illuminates the
nearest platform — tile mosaics reading "CENTRAL" in blue
and white, columns supporting the vault, the platform edge
dropping to the track bed below. The station was beautiful.
The tiles are handcraft. The columns are carved with transit
insignia. The ceiling, if you could see it, is painted.

Someone has made a camp on Platform 2. A fire ring — cold
now, but recently used. A cache of glow sticks. Maps drawn
on the platform floor in chalk. The camp belongs to someone
who comes here regularly, who knows the station well, and
who has been mapping the transit system with a thoroughness
that borders on obsession.`,
    exits: [
      { direction: 'west', targetRoom: 'z11_r03', description: 'west (Red Tunnel West)' },
      { direction: 'east', targetRoom: 'z11_r05', description: 'east (Red Tunnel East)' },
      { direction: 'north', targetRoom: 'z11_r10', description: 'north (Blue Tunnel North)' },
      { direction: 'south', targetRoom: 'z11_r11', description: 'south (Blue Tunnel South)' },
      { direction: 'northeast', targetRoom: 'z11_r08', description: 'northeast (Warrens Stair)', hidden: true, hiddenRequirement: { attribute: 'GHOST', minimum: 6 } },
    ],
    npcs: [
      {
        id: 'compass', name: 'Compass', type: 'SHOPKEEPER',
        faction: 'NONE',
        description: 'Forties. Energetic. Surrounded by maps on Platform 2. She speaks quickly and gestures constantly, pointing at map sections, tracing routes in the air.',
        dialogue: "\"Another soul in the dark! Excellent. — Have you mapped anything? No? Then you need my maps. Everyone needs my maps. The system is three lines and eighteen stations and I have walked every meter of it. Here — look.\"",
        startingDisposition: 10,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'fire_ring', name: 'fire ring', examineText: 'Cold but recently used. Compass burns scavenged material for warmth and cooking. The ring is efficient — minimal smoke, maximum heat. She\'s been doing this for three years.' },
      { id: 'chalk_maps', name: 'chalk maps', examineText: 'Extraordinary detail. Every tunnel, every station, every collapse, every flooded section, every Substrate growth. The maps cover most of Platform 2\'s floor. Compass draws them fresh on every expedition because the chalk fades.' },
      { id: 'glow_stick_cache', name: 'glow stick cache', examineText: 'Two dozen chemical glow sticks in a waterproof bag. Compass\'s navigation insurance. She carries more light sources than anyone in the zone.' },
      { id: 'station_mosaics', name: 'tile mosaics', examineText: 'Blue and white ceramic. Individual pieces arranged in geometric patterns that echo the city\'s surface architecture. Handcraft — someone designed these with care. The station was meant to be beautiful.' },
    ],
    isSafeZone: true,
    isHidden: false,
    traitDice: [],
  },

  // ── 5. RED TUNNEL EAST ──────────────────────────────────────────────────

  z11_r05: {
    id: 'z11_r05',
    zone: 'z11',
    name: 'RED TUNNEL EAST',
    description:
`The Red Line heading east from Central Station. Same geometry
as the western section — three meters diameter, rails in the
floor, darkness in every direction. The maintenance train
runs through here too. The alcoves are spaced identically.

The tunnel is drier on this side. The walls show tool marks
from the original bore — the machine that carved this passage
left a spiral pattern in the concrete lining. In your light,
the pattern looks deliberate. Intentional. It's not. It's
just what a boring machine does. But in the dark, everything
looks like it means something.

Faint scratches on the wall at shoulder height. Recent.
Chalk marks — Compass's navigation system. An arrow pointing
west, annotated: "CENTRAL 400m." An arrow pointing east:
"EAST PLATFORM 350m." Below both: "TRAIN EVERY ~40 MIN."`,
    exits: [
      { direction: 'west', targetRoom: 'z11_r04', description: 'west (Central Station)' },
      { direction: 'east', targetRoom: 'z11_r06', description: 'east (East Platform)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'tunnel_predator_east', name: 'Tunnel Predator', level: 9,
        description: 'Pale, eyeless, hunting by vibration. Larger than the western specimens — the eastern tunnels are warmer, more food sources.',
        hp: 52, attributes: { ...enemyAttrs(9), REFLEX: 7, GHOST: 6 }, damage: 12, armorValue: 2,
        behavior: 'ambush', spawnChance: 0.4, count: [1, 1],
        drops: [
          { itemId: 'predator_parts', chance: 0.6, quantityRange: [1, 2] },
        ],
        xpReward: 75,
      },
    ],
    objects: [
      { id: 'compass_chalk_east', name: 'chalk marks', examineText: 'Compass\'s navigation system. Arrows, distances, train timing. She refreshes these on every mapping expedition. The consistency is obsessive and lifesaving.' },
      { id: 'bore_marks', name: 'bore marks', examineText: 'Spiral pattern in the tunnel lining. The boring machine left its signature in the concrete. In the dark, the pattern looks meaningful. It\'s not. It\'s just infrastructure.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'NARROW TRACKS', die: 6, benefitsActions: ['sneak'], hindersActions: ['flee'] }],
  },

  // ── 6. EAST PLATFORM ────────────────────────────────────────────────────

  z11_r06: {
    id: 'z11_r06',
    zone: 'z11',
    name: 'EAST PLATFORM',
    description:
`The eastern end of the Red Line. The platform is narrower —
this station served the Industrial District's workers, built
for volume not comfort. The tiles read "EAST INDUSTRIAL" in
orange and black. Exposed conduit, riveted metal fixtures,
a clock on the wall that stopped at 23:52.

Two tunnel mouths open from this platform. The western one
returns to the Red Line — back toward Central. The eastern
one is the Loop Junction — the Yellow Line, branching south.

A transit sign above the eastern tunnel:
"YELLOW LINE — LOOP SERVICE"
Below it, in chalk, in Compass's handwriting:
"ONE WAY. NO RETURN. I MEAN IT."`,
    exits: [
      { direction: 'west', targetRoom: 'z11_r05', description: 'west (Red Tunnel East)' },
      { direction: 'east', targetRoom: 'z11_r14', description: 'east (Loop Junction)' },
      { direction: 'south', targetRoom: 'z11_r07', description: 'south (East Descent)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'scavenger_party_east', name: 'Scavenger Party', level: 9,
        description: 'Surface group descended through the East Descent, looking for salvageable metro hardware. Nervous, armed with improvised weapons. In darkness, they attack first.',
        hp: 40, attributes: { ...enemyAttrs(9), COOL: 3 }, damage: 10, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0.4, count: [2, 3],
        drops: [
          { itemId: 'salvaged_gear', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'creds_pouch', chance: 0.6, quantityRange: [5, 12] },
        ],
        xpReward: 70,
      },
    ],
    objects: [
      { id: 'compass_warning', name: 'compass warning', examineText: "'ONE WAY. NO RETURN. I MEAN IT.' Compass's chalk below the Yellow Line sign. Large enough to read from the platform edge. She also drew an arrow pointing west — 'THIS WAY INSTEAD.' Fresh on every mapping expedition." },
      { id: 'industrial_clock', name: 'industrial clock', examineText: 'Stopped at 23:52. Eight minutes before midnight on the transit system\'s last day. Analog — physical mechanism that ran on station power. The last eight minutes of public transit, frozen.' },
      { id: 'platform_graffiti', name: 'platform graffiti', examineText: 'Workers\' marks from operating years. \'THIRD SHIFT FOREVER.\' \'Mika loves Oren.\' Post-shutdown: \'DEEP DWELLERS DON\'T USE DOORS.\' \'Light = life.\' \'Something in the Yellow Line. Don\'t go.\'' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'SCAVENGER DARK', die: 8, benefitsActions: ['sneak'], hindersActions: ['scan'], color: '#1a1a2e' }],
  },

  // ── 7. EAST DESCENT ─────────────────────────────────────────────────────

  z11_r07: {
    id: 'z11_r07',
    zone: 'z11',
    name: 'EAST DESCENT',
    description:
`A service shaft connecting the East Platform to the Industrial
Drainage above. Vertical — metal rungs set in concrete,
ascending through thirty meters of rock. At the top: the
chemical waterfall of the Deep Drain. At the bottom: the
platform.

The shaft smells different. Chemical tang drifts down from
above — the Industrial Drainage's atmosphere bleeding into
the deep. The temperature rises as you climb. Cool mineral
dark below, warm chemical air above. The boundary between
zones is sensory.

The tunnel predators don't cross upward — the chemicals are
hostile. The corroded ferals from above don't cross down.
The boundary is a no-man's-land.`,
    exits: [
      { direction: 'up', targetRoom: 'z10_r10', description: 'up (Industrial Drainage — Deep Drain)', zoneTransition: true, targetZone: 'z10' },
      { direction: 'west', targetRoom: 'z11_r06', description: 'west (East Platform)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'chemical_boundary', name: 'chemical boundary', examineText: 'The air changes over five meters — cool and mineral below, warm and chemical above. Two ecosystems meeting. Neither side can survive the other\'s poison.' },
      { id: 'metal_rungs', name: 'metal rungs', examineText: 'Corroded but holding. The climb is thirty meters. The rungs get warmer as you ascend.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'CHEMICAL DARK', die: 6, benefitsActions: ['sneak'], hindersActions: ['scan'] }],
  },

  // ── 8. WARRENS STAIR ────────────────────────────────────────────────────

  z11_r08: {
    id: 'z11_r08',
    zone: 'z11',
    name: 'WARRENS STAIR',
    description:
`Behind a maintenance door on Central Station's Platform 3 —
a narrow staircase descends into older infrastructure. The
stairs are stone, not concrete. Pre-transit, pre-city. The
staircase was here before the metro was bored and the builders
walled it off rather than investigate where it went.

The wall has been opened. Recently — within the last few
years. The break is clean, tools were used, rubble removed.
Someone wanted access to what's below Central Station.

The staircase descends for twenty meters and opens into a
natural cavern that has been colonized by commerce. The
Black Market Warrens begin here.`,
    exits: [
      { direction: 'southwest', targetRoom: 'z11_r04', description: 'southwest (Central Station — Platform 3)' },
      { direction: 'down', targetRoom: 'z13_r01', description: 'down (Black Market Warrens)', zoneTransition: true, targetZone: 'z13' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'broken_wall', name: 'broken wall', examineText: 'Clean break. Tools, not force. Someone with engineering knowledge opened this passage deliberately. The rubble was removed — not piled, removed. Professional.' },
      { id: 'stone_stairs', name: 'stone stairs', examineText: 'Pre-concrete. These stairs are older than the transit system. Older than the city above. Whatever they connected to originally, the metro builders sealed it off. The Warrens operators unsealed it.' },
    ],
    isSafeZone: false,
    isHidden: true,
    hiddenRequirement: { attribute: 'GHOST', minimum: 6 },
    traitDice: [],
  },

  // ── 9. NORTH PLATFORM ───────────────────────────────────────────────────

  z11_r09: {
    id: 'z11_r09',
    zone: 'z11',
    name: 'NORTH PLATFORM',
    description:
`The northern terminal of the Blue Line. "NORTH CAMPUS" in
the tiles — the station that served the Helixion Campus
perimeter. The platform is the most intact in the system —
nearest to the surface, least affected by water damage.

The air here moves. A draft from above — the connection to
the Maintenance Tunnels is close. The temperature is warmer
than the grid tunnels. The proximity to the surface means
less total darkness — faint ambient light seeps through
ventilation shafts.

The platform benches are clean. Someone sits here regularly.
Deep dweller traces — subtle rearrangement of objects,
moisture marks from containers.`,
    exits: [
      { direction: 'up', targetRoom: 'z09_r11', description: 'up (Maintenance Tunnels — Deep Access Shaft)', zoneTransition: true, targetZone: 'z09' },
      { direction: 'south', targetRoom: 'z11_r10', description: 'south (Blue Tunnel North)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'campus_tiles', name: 'campus tiles', examineText: 'NORTH CAMPUS. The tiles are cleaner than anywhere else in the transit system. Someone maintains them. Deep dweller territory — they take care of the spaces they inhabit.' },
      { id: 'ventilation_light', name: 'ventilation shafts', examineText: 'Faint ambient light. The surface is closer here than anywhere else in the transit system. The light is barely visible — but after the grid tunnels, it feels like dawn.' },
      { id: 'dweller_traces', name: 'dweller traces', examineText: 'Subtle. Benches wiped clean. Water condensation patterns suggesting containers were placed here recently. The deep dwellers use this platform as a transit point.' },
    ],
    isSafeZone: true,
    isHidden: false,
    traitDice: [],
  },

  // ── 10. BLUE TUNNEL NORTH ───────────────────────────────────────────────

  z11_r10: {
    id: 'z11_r10',
    zone: 'z11',
    name: 'BLUE TUNNEL NORTH',
    description:
`The Blue Line heading north from Central. The tunnel is wider
than the Red Line bore — four meters diameter, built for
larger rolling stock. The extra meter makes the darkness feel
different. More space for things to occupy.

This is deep dweller territory. They've lived in the transit
system long enough to adapt — enlarged pupils, heightened
hearing, spatial awareness that doesn't require sight. They're
not feral. They're adapted. The cost was the surface. The
reward was the dark.

Signs of habitation that you'd miss without looking: signal
junction boxes opened with components repurposed. Moisture
marks from water containers. The faintest warmth from bodies
that recently occupied a space. They're here. They've been
here the entire time.`,
    exits: [
      { direction: 'north', targetRoom: 'z11_r09', description: 'north (North Platform)' },
      { direction: 'south', targetRoom: 'z11_r04', description: 'south (Central Station)' },
    ],
    npcs: [
      {
        id: 'deep_dwellers', name: 'Deep Dwellers', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Movement in the dark. Not sound — presence. The displacement of air. The deep dwellers are here. They decided you were acceptable.',
        dialogue: "\"…you carry light. we hear it. the battery hum. — you are looking for the station? south. the cartographer is there. — we do not trade in creds. we trade in quiet. be quiet and you may pass.\"",
        startingDisposition: -5,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'repurposed_junctions', name: 'signal junctions', examineText: 'Opened and components removed — the useful ones. The dwellers are technically literate. They understand the infrastructure they inhabit. They\'ve repurposed it rather than scavenging it.' },
      { id: 'dweller_evidence', name: 'dweller evidence', examineText: 'GHOST ≥ 7 (in darkness): Movement. Not sound — presence. The displacement of air as someone passes within two meters. They watched you enter. They decided you were acceptable. In the dark, on their ground, the dwellers hold every advantage.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'DEEP DARK', die: 8, benefitsActions: ['sneak'], hindersActions: ['attack', 'scan'], color: '#1a1a2e' }],
  },

  // ── 11. BLUE TUNNEL SOUTH ───────────────────────────────────────────────

  z11_r11: {
    id: 'z11_r11',
    zone: 'z11',
    name: 'BLUE TUNNEL SOUTH',
    description:
`The Blue Line heading south from Central Station. The tunnel
geometry is standard for the first two hundred meters. Then
it changes.

The floor develops texture. Crystalline formations, small at
first, pushing through the joints between ties. Blue-green.
Bioluminescent. The first natural light source in the transit
system. The glow is dim but present — enough to see the
tunnel walls without artificial light.

The Substrate is growing into the transit infrastructure.
Organic crystalline structures push through rock and concrete.
The growths are densest on the floor and lower walls. The
ceiling is still concrete. The transition is in progress.

The 33hz frequency is strong here. You feel it in the floor,
through your shoes, through the rails. The rails themselves
have begun to change — steel developing an organic patina.
The Substrate is integrating the metro's infrastructure into
its own architecture.`,
    exits: [
      { direction: 'north', targetRoom: 'z11_r04', description: 'north (Central Station)' },
      { direction: 'south', targetRoom: 'z11_r12', description: 'south (South Platform)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'substrate_growth_blue', name: 'Active Substrate Growth', level: 12,
        description: 'Crystalline surge — sharp formations erupting from the floor in response to vibration. The Substrate responds to disturbance reflexively. It doesn\'t know you\'re human.',
        hp: 65, attributes: { ...enemyAttrs(12), BODY: 8, TECH: 6 }, damage: 14, armorValue: 6,
        behavior: 'territorial', spawnChance: 0.5, count: [1, 1],
        drops: [
          { itemId: 'substrate_crystal', chance: 0.7, quantityRange: [1, 2] },
        ],
        xpReward: 110,
      },
    ],
    objects: [
      { id: 'crystalline_formations', name: 'crystalline formations', examineText: 'Blue-green. Bioluminescent. Warm to the touch. TECH ≥ 7: Active growths pulse at a faster rate than passive ones. Walk softly (GHOST ≥ 6) or identify which formations are reactive before approaching.' },
      { id: 'organic_rails', name: 'organic rails', examineText: 'The steel rails developing a crystalline patina. Not rust — something alive. The Substrate is converting manufactured infrastructure into biological architecture. The integration is slow, persistent, and beautiful.' },
      { id: 'bioluminescence', name: 'bioluminescence', examineText: 'The first light in the transit system that isn\'t yours. Blue-green. Dim but steady. The Substrate grows its own illumination. In the growth areas, you don\'t need a flashlight. The darkness retreats from something older.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'SUBSTRATE GROWTH', die: 10, benefitsActions: ['hack'], hindersActions: ['flee', 'attack'], color: '#4ade80' }],
    environmentalClocks: [{
      id: 'z11_r11_substrate',
      name: 'SUBSTRATE SURGE',
      segments: 6,
      category: 'environment',
      color: '#4ade80',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'substrate' } },
    }],
  },

  // ── 12. SOUTH PLATFORM ──────────────────────────────────────────────────

  z11_r12: {
    id: 'z11_r12',
    zone: 'z11',
    name: 'SOUTH PLATFORM',
    description:
`The southern terminal of the Blue Line. "SOUTH JUNCTION" in
tiles that glow faintly — the Substrate bioluminescence has
reached the ceramic, infusing the letters with blue-green
light. The station is alive. The Substrate has made it alive.

A figure stands at the platform edge, facing the tracks.
Uniform. Transit authority badge. They turn when you enter
and their eyes focus — not the vacant mesh-compliance gaze
but real attention. Real presence. Someone has been standing
at their post for fifteen years.

Nearby, sitting against a column, a younger figure. Exhausted.
Scared. She took the Loop. She's been walking for two days
and her light ran out somewhere in the deep.`,
    exits: [
      { direction: 'north', targetRoom: 'z11_r11', description: 'north (Blue Tunnel South)' },
      { direction: 'west', targetRoom: 'z11_r13', description: 'west (Iron Bloom Passage)' },
      { direction: 'down', targetRoom: 'z14_r03', description: 'down (Substrate Level — Southern Descent)', zoneTransition: true, targetZone: 'z14' },
    ],
    npcs: [
      {
        id: 'station', name: 'Station', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Transit operator. Fifties. Uniform pressed. Badge polished. Fifteen years at their post. The Substrate glow has given their skin a faint bioluminescent quality along the veins.',
        dialogue: "\"Welcome to South Junction station. Current service is temporarily suspended. — How may I assist you? Route information? Schedule? …Cargo manifests? Yes. I have those. I have everything. I filed it all. That's my job.\"",
        startingDisposition: 5,
        services: ['quest', 'info'],
      },
      {
        id: 'ever', name: 'Ever', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Twenties. Scared. Exhausted. She took the Loop because someone told her it was a shortcut. Her light ran out two days ago.',
        dialogue: "\"…please. I can't — I've been walking. In the dark. For two days. Something was following me and I couldn't see it and I just kept walking. Please. I need to get back to Central Station. I can't do it alone.\"",
        startingDisposition: 0,
        services: ['quest'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'cargo_manifest', name: 'cargo manifest', examineText: 'Station\'s copy. Final service day: sixty-three containers, classification 7, originating from sub-level loading bay, destination North Campus via Blue Line express. Helixion used the transit system to transport Substrate material from the deep to the campus. The shutdown covered the extraction.' },
      { id: 'loading_bay', name: 'loading bay', examineText: 'Behind the platform. Now Substrate-overgrown. The bay doors are sealed by crystalline growth. Through gaps in the crystal: the machinery that loaded containers onto trains. The last containers left fifteen years ago.' },
      { id: 'substrate_tiles', name: 'glowing tiles', examineText: 'The station tiles infused with bioluminescence. The Substrate reached the ceramic and made it glow. SOUTH JUNCTION in letters that produce their own light. The station is becoming part of the Substrate.' },
    ],
    isSafeZone: true,
    isHidden: false,
    traitDice: [],
  },

  // ── 13. IRON BLOOM PASSAGE ──────────────────────────────────────────────

  z11_r13: {
    id: 'z11_r13',
    zone: 'z11',
    name: 'IRON BLOOM PASSAGE',
    description:
`A service tunnel branching west from South Platform. This
isn't part of the original transit system — it's been cut
through the rock in the last few years. The walls show drill
marks and controlled blasting. Someone with resources and
engineering knowledge carved a connection between the transit
system and what lies to the east.

The tunnel is maintained. Clean. The floor is swept. Cable
runs along the ceiling carry power from a generator you can
hear humming. Light sources — actual electric lights — mark
the passage at regular intervals. After the transit system's
darkness, the illumination is almost shocking.

A reinforced door at the eastern end. Blast-rated. Locked
from the other side. An intercom and a camera watch the
approach. Iron Bloom's back door.`,
    exits: [
      { direction: 'east', targetRoom: 'z11_r12', description: 'east (South Platform)' },
      { direction: 'west', targetRoom: 'z12_r02', description: 'west (Iron Bloom — Transit Access)', zoneTransition: true, targetZone: 'z12' },
    ],
    npcs: [
      {
        id: 'rail', name: 'Rail', type: 'NEUTRAL',
        faction: 'IRON_BLOOM',
        description: 'Thirties. Calm. Sitting at the passage\'s midpoint — a checkpoint without a checkpoint\'s infrastructure. Just a person, in the tunnel, waiting. She carries a lantern but uses it only for others. She navigates without light.',
        dialogue: "\"Hold. — Who sent you? — …Acceptable. Follow me. Stay close. Don't touch the walls — the growths are reactive in the next section. I'll tell you when it's safe.\"",
        startingDisposition: -5,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'drill_marks', name: 'drill marks', examineText: 'Controlled blasting. Professional excavation. Iron Bloom carved this passage — the connection between the transit system and their facility. The engineering is recent and competent.' },
      { id: 'electric_lights', name: 'electric lights', examineText: 'Real electricity. Generator-powered. After the transit darkness, the light is almost painful. Your eyes adjust. The passage is clean, maintained, deliberate.' },
      { id: 'intercom_camera', name: 'intercom and camera', examineText: 'Iron Bloom security. The camera is active — green indicator light. The intercom connects to the Commons. Nobody enters without two voices confirming.' },
      { id: 'iron_bloom_markers', name: 'iron bloom markers', examineText: 'Gear inside a bloom. The resistance logo, scratched into the tunnel wall at intervals. The marks are small — invisible unless you know to look. They confirm direction: the gear points toward the facility. The bloom points toward the transit system.' },
      { id: 'managed_growths', name: 'managed growths', examineText: 'The Substrate growths in this passage have been pruned. Iron Bloom maintains the passage — cutting back active growths, channeling the bioluminescence for navigation. Rail trims them monthly. The relationship is gardening — Iron Bloom tends the Substrate, and the Substrate provides light and warmth. Mutualism, at a very small scale.' },
    ],
    isSafeZone: true,
    isHidden: false,
    traitDice: [],
  },

  // ── 14. LOOP JUNCTION ───────────────────────────────────────────────────

  z11_r14: {
    id: 'z11_r14',
    zone: 'z11',
    name: 'LOOP JUNCTION',
    description:
`The Yellow Line junction. East Platform's second tunnel
mouth, branching south. The architecture changes here —
the Red Line's industrial concrete gives way to the Yellow
Line's deeper bore. The tunnel curves. You can't see what's
ahead.

WARNING signs. Official transit authority warnings preserved
under glass. Below them, in chalk, in paint, scratched into
the tile:

"THE LOOP DOES NOT RETURN."
"ONE WAY SOUTH. NO GRID CONNECTION."
"COMPASS: TURN BACK. CENTRAL IS 750m WEST."
"i took the loop. it took three days to walk out. — ever"

Every warning is different. Every warning says the same thing.
The Loop is not a shortcut. The Loop is a commitment.`,
    exits: [
      { direction: 'west', targetRoom: 'z11_r06', description: 'west (East Platform)' },
      { direction: 'south', targetRoom: 'z11_r15', description: 'south (Loop South — ONE WAY)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'loop_warnings', name: 'loop warnings', examineText: 'Dozens. Different handwriting. Different materials — chalk, paint, scratches, marker. All saying the same thing. Compass refreshes hers every expedition. Ever\'s is scratched deep. The warnings span years. Nobody listens.' },
      { id: 'transit_warnings', name: 'transit authority warnings', examineText: 'Official signage under glass. "YELLOW LINE LOOP SERVICE — TERMINAL STATION: WEST FRINGE. NO EASTBOUND RETURN SERVICE." The transit authority warned people when the system was running. The warnings are more relevant now.' },
      { id: 'yellow_line_sign', name: 'yellow line sign', examineText: 'LOOP SERVICE. The yellow paint is faded but visible. The Yellow Line was the city\'s outer circuit. It worked when both ends connected. Now only one end exists.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'ONE WAY', die: 8, hindersActions: ['flee'], color: '#fbbf24' }],
  },

  // ── 15. LOOP SOUTH ──────────────────────────────────────────────────────

  z11_r15: {
    id: 'z11_r15',
    zone: 'z11',
    name: 'LOOP SOUTH',
    description:
`The Yellow Line curves south and descends. The tunnel is
older here — pre-metro infrastructure repurposed for the
Loop. The walls aren't concrete-lined; they're cut rock,
smooth but irregular. The air is warmer. The dark is total.

Predator territory. The tunnel predators are larger in the
Loop — isolated population, less competition, more prey.
The echoes carry differently in the curved tunnel. Sound
wraps around the bend. You hear things approaching from
directions that don't exist.

Bones on the track bed. Small animals. Some not small.
The predators have been the dominant species in the Loop
for fifteen years. They don't retreat from light here.
They evaluate it.`,
    exits: [
      { direction: 'north', targetRoom: 'z11_r14', description: 'north (Loop Junction)' },
      { direction: 'south', targetRoom: 'z11_r16', description: 'south (Loop Deep Station)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'tunnel_predator_loop', name: 'Tunnel Predator', level: 12,
        description: 'Loop variant. Larger than the grid specimens. Doesn\'t retreat from light — evaluates it. Hunts in pairs. Brackets prey from both sides of the curved tunnel.',
        hp: 70, attributes: { ...enemyAttrs(12), REFLEX: 8, GHOST: 7, BODY: 8 }, damage: 16, armorValue: 3,
        behavior: 'ambush', spawnChance: 0.7, count: [1, 2],
        drops: [
          { itemId: 'predator_parts', chance: 0.7, quantityRange: [1, 3] },
          { itemId: 'creds_pouch', chance: 0.3, quantityRange: [10, 20] },
        ],
        xpReward: 120,
      },
    ],
    objects: [
      { id: 'track_bones', name: 'bones', examineText: 'On the track bed. Small animals mostly. Some larger — canine-sized. One set of bones is human. Old. Picked clean. The predators have been apex here for fifteen years.' },
      { id: 'curved_echoes', name: 'curved tunnel', examineText: 'Sound wraps around the bend. Footsteps arrive from behind you even when nothing is there. The acoustic properties of the curved tunnel make spatial awareness unreliable. The predators evolved here. They know the echoes.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'PREDATOR TERRITORY', die: 10, benefitsActions: ['sneak'], hindersActions: ['scan', 'flee'], color: '#ff6b6b' }],
  },

  // ── 16. LOOP DEEP STATION ───────────────────────────────────────────────

  z11_r16: {
    id: 'z11_r16',
    zone: 'z11',
    name: 'LOOP DEEP STATION',
    description:
`The deepest point in the transit system. A station that was
never finished — the platform exists but the tile work stops
halfway. Construction scaffolding still stands against the
far wall. The Yellow Line was being extended when the system
shut down.

The 33hz frequency is overwhelming here. Not a background
hum — a physical presence. The vibration rises through the
floor, through the scaffold, through your body. The air
tastes metallic. The temperature is wrong — warm, humid,
as if the earth itself is breathing.

Someone lives here. Not recently arrived — permanently.
A figure sitting cross-legged on the unfinished platform,
surrounded by objects arranged in geometric patterns.
Crystals, wire, broken electronics, arranged with obsessive
precision. The hermit of the deep.`,
    exits: [
      { direction: 'north', targetRoom: 'z11_r15', description: 'north (Loop South)' },
      { direction: 'south', targetRoom: 'z11_r17', description: 'south (Loop Overgrowth)' },
    ],
    npcs: [
      {
        id: 'hermit', name: 'Hermit', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Indeterminate age. Gaunt. Eyes adjusted to absolute darkness — they don\'t blink. Surrounded by objects arranged in patterns that might be art, might be communication, might be both.',
        dialogue: "\"…the frequency is louder here. you hear it. you feel it. — i came down to listen. that was. i don't remember how long ago. the listening takes all the time there is. — the earth is asking a question. i'm trying to understand the question before i try to answer it.\"",
        startingDisposition: 0,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'geometric_patterns', name: 'geometric patterns', examineText: 'Crystals, wire, electronics, arranged in spirals and grids. The patterns don\'t repeat — each one is unique. The hermit has been arranging these for years. GHOST ≥ 8: The patterns correspond to the 33hz frequency\'s waveform structure. The hermit is mapping the Substrate\'s signal in physical objects.' },
      { id: 'unfinished_platform', name: 'unfinished platform', examineText: 'Tile work stops halfway. Construction scaffolding. The Yellow Line was being extended when the system shut down. The workers left and never came back. The scaffold has been here for fifteen years.' },
      { id: 'resonance_field', name: 'resonance field', examineText: 'The 33hz frequency is a physical force here. It vibrates the scaffold. It vibrates the air. GHOST ≥ 7: The frequency has structure. Not noise. Nested patterns. Something communicating. The earth\'s question.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'RESONANCE FIELD', die: 10, benefitsActions: ['hack', 'resist'], hindersActions: ['attack'], color: '#818cf8' }],
  },

  // ── 17. LOOP OVERGROWTH ─────────────────────────────────────────────────

  z11_r17: {
    id: 'z11_r17',
    zone: 'z11',
    name: 'LOOP OVERGROWTH',
    description:
`The tunnel is consumed.

The Substrate has replaced the infrastructure entirely.
Walls, floor, ceiling — all organic crystalline growth.
Blue-green bioluminescence bathes everything in alien light.
The tunnel's original shape is preserved as a hollow within
the growth — the Substrate grew around the space rather than
filling it.

The air is warm, humid, heavy with the mineral smell of
living rock. The 33hz frequency isn't heard here — it's felt
in every surface, in the air, in the moisture on the crystal
faces. You're inside the Substrate. The boundary between
infrastructure and organism is gone.

Active growths pulse in the floor. Walking heavily triggers
crystalline surges. Walk softly or don't walk at all.`,
    exits: [
      { direction: 'north', targetRoom: 'z11_r16', description: 'north (Loop Deep Station)' },
      { direction: 'south', targetRoom: 'z11_r18', description: 'south (Loop Terminal)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'substrate_growth_loop', name: 'Active Substrate Growth', level: 14,
        description: 'The Substrate has fully consumed this tunnel. Active growths respond to vibration with devastating crystalline surges. The Substrate doesn\'t attack — it reacts. The distinction is academic when crystal spears erupt from the floor.',
        hp: 80, attributes: { ...enemyAttrs(14), BODY: 10, TECH: 7 }, damage: 18, armorValue: 8,
        behavior: 'territorial', spawnChance: 0.6, count: [1, 1],
        drops: [
          { itemId: 'substrate_crystal', chance: 0.8, quantityRange: [2, 3] },
        ],
        xpReward: 140,
      },
    ],
    objects: [
      { id: 'consumed_tunnel', name: 'consumed tunnel', examineText: 'The Substrate replaced the transit infrastructure. Not destroyed — replaced. The tunnel shape is preserved. The Substrate grew around the space. It\'s not destroying human architecture. It\'s integrating it. Converting it. Making it part of something larger.' },
      { id: 'crystal_faces', name: 'crystal faces', examineText: 'The bioluminescence reflects and refracts through crystal layers. The light moves. Patterns shift across the surfaces. TECH ≥ 8: The light patterns correspond to the 33hz frequency\'s data structure. The Substrate communicates through bioluminescence.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'CONSUMED TUNNEL', die: 10, hindersActions: ['flee', 'attack', 'scan'], color: '#4ade80' }],
    environmentalClocks: [{
      id: 'z11_r17_substrate',
      name: 'SUBSTRATE SURGE',
      segments: 6,
      category: 'environment',
      color: '#4ade80',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'substrate' } },
    }],
  },

  // ── 18. LOOP TERMINAL ───────────────────────────────────────────────────

  z11_r18: {
    id: 'z11_r18',
    zone: 'z11',
    name: 'LOOP TERMINAL',
    description:
`The end of the line.

The Yellow Line terminates in a station that was designed
to connect to the western surface but never completed the
connection properly. The platform exists. The escalators
exist — frozen, unpowered, leading up through a shaft to
a sealed entrance in the Fringe ruins. The seal has been
broken from above. Sunlight — real sunlight — filters down
the escalator shaft.

After the deep, after the dark, after the Substrate and
the predators and the consumed tunnels, the light from
above is disorienting. Your eyes adjust. The shaft leads
up. To the Fringe. To the surface.

No grid connection. No return to Central. No shortcut home.
The Loop delivered you to the far western edge of the city.
The walk back is on the surface, through the Fringe ruins,
and it is very long.

Compass was right.`,
    exits: [
      { direction: 'north', targetRoom: 'z11_r17', description: 'north (Loop Overgrowth)' },
      { direction: 'up', targetRoom: 'z04_r05', description: 'up (Fringe — Scavenger Cache)', zoneTransition: true, targetZone: 'z04' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'frozen_escalators', name: 'escalators', examineText: 'Unpowered. The steps are locked in place. Climbable but steep. The shaft is thirty meters — a long walk up frozen stairs to the surface.' },
      { id: 'shaft_sunlight', name: 'sunlight', examineText: 'Real. Natural. Filtering down the escalator shaft from the broken seal above. After the transit system\'s darkness, it feels like a hallucination. It\'s not. It\'s the sky.' },
      { id: 'compass_was_right', name: 'scratched message', examineText: 'On the platform wall, in several different hands: "compass was right." "ONE WAY." "i walked for three days." "if you\'re reading this, the hard part is over. the fringe is above. — ever"' },
    ],
    isSafeZone: true,
    isHidden: false,
    traitDice: [],
  },
};

export const ZONE_11: Zone = {
  id: 'z11',
  name: 'ABANDONED TRANSIT',
  depth: 'deep',
  faction: 'NONE',
  levelRange: [8, 15],
  description: 'Fragmented metro system beneath the entire city. Three lines, one grid, total darkness. Light management is survival. The Loop is one-way.',
  atmosphere: {
    sound: 'Silence. Then echoes. Then something moving in the dark that stopped when you stopped.',
    smell: 'Old concrete, stale air, rust, machine oil from trains that ran fifteen years ago.',
    light: 'None. Absolute darkness except what you bring. Substrate growth glows where it\'s consumed the tunnels.',
    temp: 'Cool and stable. Gets warmer near Substrate growth. The Loop is warmer than it should be.',
  },
  rooms: Z11_ROOMS,
  originPoint: undefined,
};

// ── Zone 05: The Fringe — Nomads ────────────────────────────────────────────

const Z05_ROOMS: Record<string, Room> = {

  // ── 1. THE PERIMETER ────────────────────────────────────────────────────

  z05_r01: {
    id: 'z05_r01',
    zone: 'z05',
    name: 'THE PERIMETER',
    description:
`A chain-link fence, three meters high, topped with sensor
wire. It runs north-south as far as you can see in both
directions. Behind you: the Residential Blocks — the last
buildings, the last streetlamps, the last hum of the mesh.
Ahead: open ground. Hills. Scrubland. Sky.

The fence carries sensor wire that logs anything crossing
it. The data goes to D9. Most of the time, nobody acts on
it. Leaving the city isn't illegal. It's just discouraged.

Count your steps. At twenty, the mesh signal stutters. At
thirty-five, it fragments. At fifty, it dies. For most
citizens, this is the moment their implants flood them with
distress. For you, it's the moment the noise stops and you
can hear the wind.`,
    exits: [
      { direction: 'west', targetRoom: 'z02_r10', description: 'west (Residential Blocks — Mesh Clinic)', zoneTransition: true, targetZone: 'z02' },
      { direction: 'east', targetRoom: 'z05_r02', description: 'east (No-Man\'s Land)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'sensor_fence', name: 'sensor fence', examineText: 'Three meters of chain-link topped with sensor wire. The wire logs mass, speed, and direction of anything that crosses. The data feeds to D9. Nobody patrols this section. The wire does the work.' },
      { id: 'mesh_boundary', name: 'mesh boundary', examineText: 'You can feel it — not with your hands but with whatever the mesh has connected to inside your skull. At twenty paces the signal stutters. At thirty-five it fragments. At fifty it dies. The silence that follows is the loudest thing you\'ve ever heard.' },
      { id: 'the_view_east', name: 'view east', examineText: 'Past the fence: open ground. Rolling hills covered in scrubland — not green, not dead, the tough gray-green of plants that survive on rain and nothing else. The sky is enormous. You\'ve never seen this much sky. In the city, the sky is a strip between buildings. Here it goes from horizon to horizon.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'SENSOR GRID', die: 6, benefitsActions: ['hack'], hindersActions: ['sneak'], color: '#fbbf24' }],
  },

  // ── 2. NO-MAN'S LAND ───────────────────────────────────────────────────

  z05_r02: {
    id: 'z05_r02',
    zone: 'z05',
    name: "NO-MAN'S LAND",
    description:
`The strip of ground between the perimeter fence and the
nomad territory. Maybe two kilometers wide. Nobody claims
it. The city doesn't patrol this far. The nomads don't
patrol this close. It's the gap between two worlds, and
the people who live in it belong to neither.

Scrubland — low brush, rocky soil, the occasional stand
of stunted trees. A dirt path branches, forks, and dead-
ends in places. Some branches are deliberate misdirection.
The nomads don't want you to find them easily.

A rusted vehicle sits off the path — a van, stripped to
the frame, too heavy to move. Someone's been using it as
shelter. A fire ring nearby. Empty food containers.`,
    exits: [
      { direction: 'west', targetRoom: 'z05_r01', description: 'west (The Perimeter)' },
      { direction: 'east', targetRoom: 'z05_r03', description: 'east (The Open Ground)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'exile', name: 'Exile', level: 4,
        description: 'Cast out by the nomads. Surviving in no-man\'s-land because they can\'t return to the city and the nomads won\'t take them back. Desperate. They\'ll rob you for food.',
        hp: 16, attributes: { ...enemyAttrs(4), COOL: 2 }, damage: 4, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'exile_scrap', chance: 0.6, quantityRange: [1, 2] },
          { itemId: 'stolen_supplies', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'creds_pouch', chance: 0.4, quantityRange: [3, 8] },
        ],
        xpReward: 25,
      },
      {
        id: 'wild_predator', name: 'Wild Predator', level: 3,
        description: 'Wild canid scout. Larger than feral dogs. Testing whether you\'re prey. More in the hills if you show weakness.',
        hp: 14, attributes: enemyAttrs(3), damage: 3, armorValue: 0,
        behavior: 'ambush', spawnChance: 0.4, count: [1, 1],
        drops: [
          { itemId: 'predator_pelt', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'predator_bone', chance: 0.3, quantityRange: [1, 2] },
        ],
        xpReward: 20,
      },
    ],
    objects: [
      { id: 'exile_camp', name: 'exile camp', examineText: 'The rusted van frame, a fire ring, food containers. Someone\'s been here for weeks. The fire ring has layered ash. The food containers are Helixion nutrient bars. The exile walks to the fence, trades with someone on the city side, walks back. Trapped between two worlds.' },
      {
        id: 'false_paths', name: 'false paths', examineText: 'The trail branches. One branch is well-worn — obvious, inviting. Another is faint — barely visible in the scrub.',
        gatedText: [{ attribute: 'GHOST', minimum: 4, text: 'The obvious path loops back to the fence. It\'s bait, laid by the nomads to waste time. The faint path is the real route east. The nomads hide in plain sight — they make the wrong way easy and the right way invisible.' }],
      },
      { id: 'exile_marker', name: 'exile marker', examineText: 'A cairn of stacked stones by the path. Exile-made. Three stones high. A warning to other exiles — \'this territory is claimed, move on.\' Even cast out, even ruined, people make rules.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'OPEN SCRUBLAND', die: 6, benefitsActions: ['flee', 'scan'], hindersActions: ['sneak'] }],
  },

  // ── 3. THE OPEN GROUND ──────────────────────────────────────────────────

  z05_r03: {
    id: 'z05_r03',
    zone: 'z05',
    name: 'THE OPEN GROUND',
    description:
`You stop walking and you look up and the world is bigger
than you knew.

Open ground. Rolling hills in every direction. Scrubland
and wild grass moving in the wind like breath. The sky is
the entire ceiling — cloud formations you've never had
room to see, weather approaching from the west as a visible
wall of gray. The Helixion tower is still visible to the
west, rising above the city's silhouette, but from here
it's small. Distant. A needle on the horizon.

The wind carries the smell of earth and grass and rain.
No engines. No mesh. No hum. The silence isn't empty —
it's full. Full of things the city drowned out.

You're standing in the world. The real one.`,
    exits: [
      { direction: 'west', targetRoom: 'z05_r02', description: 'west (No-Man\'s Land)' },
      { direction: 'east', targetRoom: 'z05_r04', description: 'east (Sentry Line)' },
      { direction: 'south', targetRoom: 'z05_r07', description: 'south (Exile Camp)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'wild_predator', name: 'Wild Predator', level: 5,
        description: 'Canid pair. More aggressive than the scouts in no-man\'s-land. They\'ve learned that people from the city carry food. They circle. Patient. They prefer dusk.',
        hp: 18, attributes: { ...enemyAttrs(5), REFLEX: 5 }, damage: 5, armorValue: 0,
        behavior: 'ambush', spawnChance: 0.5, count: [1, 2],
        drops: [
          { itemId: 'predator_pelt', chance: 0.6, quantityRange: [1, 1] },
          { itemId: 'predator_bone', chance: 0.4, quantityRange: [1, 2] },
        ],
        xpReward: 30,
      },
    ],
    objects: [
      { id: 'the_horizon', name: 'the horizon', examineText: 'There it is. The line where sky meets earth. Uninterrupted. You have never seen this. In the Drainage, the ceiling is two meters above your head. In the Residential Blocks, the buildings define your vision. Here — nothing. The earth curves away and the sky begins and you are standing on the surface of a planet for the first time.' },
      { id: 'the_city_from_outside', name: 'city silhouette', examineText: 'Turn west. The city is a smear on the horizon — a gray mass of buildings capped by the Helixion tower. From inside, the city is everything. From out here, it\'s a cluster. A growth on the landscape. You could put your thumb over it and make it disappear.' },
      { id: 'wild_grass', name: 'wild grass', examineText: 'Grass. Real grass, growing from real soil that nobody engineered. It moves in the wind — not uniformly, but in waves, each stalk responding to the air at its own speed. Growth without intention, life without management, beauty nobody designed.' },
      { id: 'weather_approaching', name: 'weather', examineText: 'Rain coming. You can see it — a gray curtain moving east across the hills. You can smell it — petrichor, the scent of earth anticipating water. Out here, rain is rain. It falls on you and you get wet and that is the entire relationship.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'WIDE HORIZON', die: 8, benefitsActions: ['scan', 'flee'], hindersActions: ['sneak'], color: '#a5f3fc' }],
  },

  // ── 4. SENTRY LINE ──────────────────────────────────────────────────────

  z05_r04: {
    id: 'z05_r04',
    zone: 'z05',
    name: 'SENTRY LINE',
    description:
`You don't see them. They see you.

The terrain looks empty — more scrubland, a shallow
depression between two hills, a stand of wind-bent trees.
Nothing that suggests human presence. No structures. No
paths. No fire. The nomads are invisible out here because
they've had years to learn how.

And then a voice behind you. Close. Calm. "Stop. Hands
where I can see them."

Two figures, emerging from ground-level hides you walked
past without noticing. Earth-tone clothing. No chrome, no
implants. Weapons that are old but maintained — a rifle,
a bow. Faces weathered by outdoor living. Eyes that have
been watching you since the perimeter.

They're not hostile. They're evaluating.`,
    exits: [
      { direction: 'west', targetRoom: 'z05_r03', description: 'west (The Open Ground)' },
      { direction: 'east', targetRoom: 'z05_r05', description: 'east (The Camp)' },
    ],
    npcs: [
      {
        id: 'neva', name: 'Neva', type: 'NEUTRAL',
        faction: 'NOMADS',
        description: 'The Elder. Seventies. Sharp eyes that read you like weather. Twenty years of keeping fifty people alive in the open. She sits at a smaller fire near the sentry line when expecting visitors.',
        dialogue: '"Sit. Talk. I\'ll decide when you\'re done. — You\'re from the city. I can tell. You walk like someone who\'s used to walls."',
        startingDisposition: -10,
        services: ['quest', 'info'],
      },
    ],
    enemies: [
      {
        id: 'nomad_sentry', name: 'Nomad Sentry', level: 6,
        description: 'Defensive only. They retreat, use terrain, call reinforcements. They don\'t want to kill you. They want you to leave.',
        hp: 24, attributes: { ...enemyAttrs(6), REFLEX: 6, COOL: 5 }, damage: 6, armorValue: 2,
        behavior: 'territorial', spawnChance: 0.0, count: [2, 4],
        drops: [],
        xpReward: 0,
      },
    ],
    objects: [
      { id: 'ground_hides', name: 'ground hides', examineText: 'You walked right past them. The hides are dug into the hillside, covered with scrub and earth-tone fabric. From above, invisible. From ground level, invisible. The nomads have been watching the approach from the city for long enough to make concealment an art form.' },
      { id: 'analog_weapons', name: 'analog weapons', examineText: 'No energy weapons. No augmented arms. A bolt-action rifle, oiled and maintained. A compound bow with hand-fletched arrows. A knife sharpened so many times the blade has narrowed by half. These weapons are old-world. They don\'t interface with anything. They just work.' },
      { id: 'sentry_communication', name: 'sentry communication', examineText: 'One of the sentries speaks into a small device — a radio, short-range, analog. Burst transmission: a two-second chirp that sounds like static. The nomads built their own communication network outside the mesh. Crude. Slow. Invisible to Helixion.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 5. THE CAMP ─────────────────────────────────────────────────────────

  z05_r05: {
    id: 'z05_r05',
    zone: 'z05',
    name: 'THE CAMP',
    description:
`Tents. A dozen of them — not identical, each one different
canvas, different shape, different patch pattern from years
of repair. They're arranged in a loose circle around a
central fire pit. Vehicles — converted trucks and vans —
parked at the circle's edge, always facing outward. Ready
to move. A solar panel array, foldable, powers a single
generator.

Forty people live here. Maybe fifty. Children play between
the tents. A woman repairs a solar panel. A man chops wood
with an axe — a real axe. Someone is cooking on the central
fire and the smell is extraordinary — real food, real spices.

The camp is orderly without being rigid. Everyone has tasks.
Nobody is told what to do. If the camp can't move in sixty
minutes, the camp dies.

They watch you. You are a guest, not a resident.`,
    exits: [
      { direction: 'west', targetRoom: 'z05_r04', description: 'west (Sentry Line)' },
      { direction: 'north', targetRoom: 'z05_r06', description: 'north (Elder\'s Fire)' },
      { direction: 'east', targetRoom: 'z05_r08', description: 'east (Healer\'s Tent)' },
      { direction: 'south', targetRoom: 'z05_r09', description: 'south (The Ridge)' },
    ],
    npcs: [
      {
        id: 'wren', name: 'Wren', type: 'NEUTRAL',
        faction: 'NOMADS',
        description: 'A child. Maybe ten. Born outside the city. Never heard the mesh, never worn an implant. Playing near the fire pit or on top of a truck. Her questions reframe the entire game.',
        dialogue: '"What\'s a mesh? Is it like a net? Does it catch things? — Why does the city hum? The sky doesn\'t hum. Wind doesn\'t hum. Why do people make things that hum?"',
        startingDisposition: 15,
      },
      {
        id: 'nomad_residents', name: 'Nomad Residents', type: 'NEUTRAL',
        faction: 'NOMADS',
        description: 'Forty people. Careful. Each conversation reveals something: why they left the city, how long they\'ve been out, what they fear, what they value.',
        dialogue: '"You\'re from the city. I can smell it — the synthetic air, the mesh static. Give it a week. The wind cleans you."',
        startingDisposition: 0,
      },
    ],
    enemies: [],
    objects: [
      { id: 'central_fire', name: 'central fire', examineText: 'The heart of the camp. Real fire, real wood, real smoke. The cooking pot holds stew made from foraged roots and trapped game. The smell is the first honest food you\'ve encountered — nothing synthesized, nothing optimized, nothing designed. Just ingredients and heat and time.' },
      { id: 'mobile_vehicles', name: 'vehicles', examineText: 'Converted trucks and vans. Engines maintained, tanks fueled, beds loaded. Always facing outward. The entire community can pack up and relocate in under an hour. This isn\'t paranoia. It\'s survival. A camp that stays in one place is a camp that gets found.' },
      { id: 'solar_array', name: 'solar array', examineText: 'Foldable panels. The only electricity for kilometers. It charges batteries for the radio network and the camp\'s minimal lighting. At night, the generator goes off. The camp goes dark. The stars come out. That\'s the schedule.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 6. ELDER'S FIRE ─────────────────────────────────────────────────────

  z05_r06: {
    id: 'z05_r06',
    zone: 'z05',
    name: "ELDER'S FIRE",
    description:
`A smaller fire, north of the camp's center. Two logs
smoothed by years of use. A kettle. Herbs drying on a
rack. This is where decisions get made.

Neva sits here. She's always here. The fire is her office,
her throne, her church. Twenty years of evaluating people
who come from the city — some fleeing, some lost, some
sent. She reads bodies, not words. Words lie. Bodies don't.

The logs face each other. The fire between. You sit across
from her and she watches you the way a hawk watches the
ground — patient, still, measuring the distance between
observation and action.`,
    exits: [
      { direction: 'south', targetRoom: 'z05_r05', description: 'south (The Camp)' },
      { direction: 'east', targetRoom: 'z05_r09', description: 'east (The Ridge)' },
    ],
    npcs: [
      {
        id: 'elder_thane', name: 'Elder Thane', type: 'NEUTRAL',
        faction: 'NOMADS',
        description: 'Former nomad elder. Neva\'s predecessor. Eighties. Sits near the fire but rarely speaks. When he does, everyone listens. He remembers the world before the mesh.',
        dialogue: '"I remember rain that wasn\'t scheduled. I remember choosing to be cold. Neva leads now. I remember."',
        startingDisposition: 5,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'elder_fire', name: 'elder fire', examineText: 'Small. Contained. The coals are even — she\'s been tending this fire for hours. Maybe days. The fire is always burning because Neva is always here. This is where she thinks, where she listens, where she makes the decisions that keep fifty people alive in the open.' },
      { id: 'herb_tea', name: 'herb tea', examineText: 'Hot. Smoky. Bitter with something floral underneath. She grows the herbs herself — carries seeds, plants them at each new camp site, harvests before they move. Consistency in a life defined by movement.' },
      { id: 'worn_log_seats', name: 'worn log seats', examineText: 'Two. Smoothed by years of use. The grain of the wood is polished to a shine. Hundreds of conversations have happened on these logs — arguments, confessions, negotiations, goodbyes. The wood remembers.' },
      {
        id: 'neva_watching', name: 'neva\'s gaze', examineText: 'She\'s not looking at you. She\'s reading you. The way you sit, where your hands go, how your eyes move.',
        gatedText: [{ attribute: 'COOL', minimum: 6, text: 'Twenty years of evaluating people. She knows within thirty seconds whether you\'re a threat, a refugee, or a spy. You can see the calculation happen in real time — her eyes tracking your posture, your breathing, the micro-movements of your hands. She already knows what you are. The conversation is a formality.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 7. EXILE CAMP ───────────────────────────────────────────────────────

  z05_r07: {
    id: 'z05_r07',
    zone: 'z05',
    name: 'EXILE CAMP',
    description:
`Three shelters — if you can call them that. A lean-to made
from a highway sign. A half-collapsed tent. A depression
in the ground lined with plastic sheeting. Three people
live here, or four, or two — the number changes because
the exiles don't stay together by choice. They stay together
because they can't stay anywhere else.

The nomads cast them out. Each one for a different reason —
theft, violence, recklessness that endangered the camp. The
exile rules are simple: you leave. You don't come back.

A woman sits on a rock, sharpening a piece of metal into
something that could be a knife or a tool or both. She
watches you without expression. Deciding.`,
    exits: [
      { direction: 'north', targetRoom: 'z05_r03', description: 'north (The Open Ground)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'exile', name: 'Exile', level: 5,
        description: 'Desperate. Fight when cornered. Retreat if hurt. Not predators — they\'re ruined. Each one was cast out for a human-scale sin.',
        hp: 18, attributes: { ...enemyAttrs(5), BODY: 5 }, damage: 5, armorValue: 2,
        behavior: 'aggressive', spawnChance: 0.6, count: [1, 3],
        drops: [
          { itemId: 'exile_scrap', chance: 0.5, quantityRange: [1, 2] },
          { itemId: 'stolen_supplies', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'creds_pouch', chance: 0.3, quantityRange: [2, 6] },
        ],
        xpReward: 30,
      },
    ],
    objects: [
      { id: 'exile_shelters', name: 'exile shelters', examineText: 'A lean-to, a tent, a hole. The architecture of having nothing. The lean-to is clever — the highway sign reflects heat from a small fire. The tent is bad — the fabric leaks. The hole is effective — thermal insulation, wind protection, invisible from a distance. Function over dignity.' },
      { id: 'sharpened_metal', name: 'sharpened metal', examineText: 'The woman sharpens with patient, mechanical strokes. The metal was a car part. Now it\'s becoming a blade. She doesn\'t look at you while she works. The sharpening is communication: I\'m armed. I\'m patient. I\'m not afraid. Decide what you want.' },
      { id: 'exile_possessions', name: 'exile possessions', examineText: 'Between the three shelters: very little. A water container half empty. Nutrient bars from the city side of the fence. A blanket shared between two shelters. A book — physical, battered, the cover missing.' },
      {
        id: 'daro_marker', name: 'scratched name', examineText: 'Scratched into the highway sign: DARO. The same name from the Scavenger Cache wall. "DON\'T HELP DARO." He was cast out from two communities.',
        gatedText: [{ attribute: 'INT', minimum: 5, text: 'He\'s been expelled from both the Fringe scavengers and the nomads. Two communities, two judgments, same result. The graffiti in zone 4 and the body language here tell the same story: a man nobody trusts twice. Whether the judgment was fair is a question without an answer.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'DESPERATE TERRITORY', die: 6, benefitsActions: ['sneak'] }],
  },

  // ── 8. HEALER'S TENT ────────────────────────────────────────────────────

  z05_r08: {
    id: 'z05_r08',
    zone: 'z05',
    name: "HEALER'S TENT",
    description:
`The largest tent in the camp. Canvas and hide, stretched
over a frame of bent saplings. Inside: bundles of dried
herbs hanging from the crossbeams. A mortar and pestle on
a flat stone. Clay jars with cork stoppers, each labeled
in handwriting you can't read — a personal system.

Moss works here. Not a doctor — a healer. The distinction
matters. Doctors use machines. Moss uses plants, hands,
knowledge passed from person to person. No implants. No
scanners. No mesh diagnostics. Touch and observation and
decades of learning what the body tells you if you listen.

The tent smells like sage and something bitter-sweet that
you can't identify. The air is warm from a small brazier.
Patients lie on bedrolls — a child with a wrapped ankle,
an older man sleeping off a fever.`,
    exits: [
      { direction: 'west', targetRoom: 'z05_r05', description: 'west (The Camp)' },
    ],
    npcs: [
      {
        id: 'moss', name: 'Moss', type: 'SHOPKEEPER',
        faction: 'NOMADS',
        description: 'Fifties. Weathered hands, dirt under the nails from digging herbs. No chrome. No augmentation. Eyes that are his own. The most radical person you\'ve met — he chose to stay as he was.',
        dialogue: '"Sit. Let me look at you. — The city puts things in people. I take things out. Different medicine. Same hands."',
        startingDisposition: 5,
        services: ['quest', 'shop', 'heal'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'herb_bundles', name: 'herb bundles', examineText: 'Dozens of species. Dried, labeled, organized by use. Moss knows every plant within a day\'s walk — what heals, what numbs, what kills. The knowledge isn\'t in a database. It\'s in his hands and his memory and the memory of the person who taught him.' },
      { id: 'mortar_and_pestle', name: 'mortar and pestle', examineText: 'Stone. Heavy. The inside is stained from a thousand preparations. Moss grinds herbs by hand — no machines, no shortcuts. He says the process is part of the medicine. The time you spend preparing is time the body has to tell you what it needs.' },
      { id: 'no_augmentation', name: 'moss\'s hands', examineText: 'No chrome. No subdermal plating. No enhanced joints. His fingernails have dirt beneath them from digging herbs. His skin is weathered from sun. His eyes are his own. In a world of augmentation, he\'s chosen to stay as he was.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 9. THE RIDGE ────────────────────────────────────────────────────────

  z05_r09: {
    id: 'z05_r09',
    zone: 'z05',
    name: 'THE RIDGE',
    description:
`A rocky ridge east of the camp — the highest point in
nomad territory. The climb is steep but short. At the top:
a flat rock shelf with a 360-degree view. The camp below.
The open ground stretching west toward the city's silhouette.
Hills rolling east and south into country nobody's mapped.
The sky everywhere.

A telescope on a tripod — salvaged, optical, no electronics.
Binoculars hanging from a nail driven into a rock crack.
A hand-drawn map pinned under a stone, marked with today's
date and observation notes.

At night, from here, you can see the city's glow to the
west — a dome of light pollution. And above you: the stars.
More stars than you knew existed.`,
    exits: [
      { direction: 'west', targetRoom: 'z05_r05', description: 'west (The Camp)' },
      { direction: 'north', targetRoom: 'z05_r06', description: 'north (Elder\'s Fire)' },
      { direction: 'northeast', targetRoom: 'z05_r10', description: 'northeast (Signal Relay)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      {
        id: 'telescope', name: 'telescope', examineText: 'Optical. No electronics, no mesh interface. Brass and glass. Through it, you can see the perimeter fence, the drone making its circuit, the outer residential blocks, the Helixion tower.',
        gatedText: [{ attribute: 'TECH', minimum: 5, text: 'The telescope is military surplus — higher magnification than civilian models. Someone brought it from the city. It\'s the nomads\' most valuable piece of equipment.' }],
      },
      { id: 'observation_map', name: 'observation map', examineText: 'Hand-drawn. Updated daily. Approach routes from the city, marked with drone circuit times. Animal trails in green. Water sources in blue. Exile locations in red. Today\'s date at the top, weather prediction for tomorrow at the bottom. This is how the nomads survive.' },
      { id: 'the_stars', name: 'the stars', examineText: 'The sky without light pollution. The Milky Way is a river of light across the zenith. Constellations that city-dwellers never see. The nomads navigate by these stars. They name their children after them. Wren — a small bird that flies by starlight. The stars are the oldest map.' },
      { id: 'neva_quest_marker', name: 'watch point', examineText: 'The ridge. Six hours of watching the approach route. The land is still. No drones. No retrieval teams. Nothing follows you. The city doesn\'t care that you left. The relief is mixed with something else — you are not important enough to chase. Freedom and insignificance, the same gift.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'ELEVATED VANTAGE', die: 8, benefitsActions: ['scan', 'attack'] }],
  },

  // ── 10. SIGNAL RELAY ────────────────────────────────────────────────────

  z05_r10: {
    id: 'z05_r10',
    zone: 'z05',
    name: 'SIGNAL RELAY',
    description:
`Northeast of the ridge, where the terrain drops into a
sheltered valley. A single structure — the only permanent
thing the nomads have built.

An antenna. Handmade. Twenty meters tall, assembled from
salvaged pipe sections, guyed with cable to rock anchors
in the hillside. At its base: a solar panel, a battery
bank, and a transmitter housed in a weatherproof case.
Analog radio, short-wave. Broadcasting on frequencies too
old, too low-tech for Helixion's monitoring to scan.

The other nomad camps — further east, further south — they
all have relays. A network of whispers connecting
communities that don't exist on any map.

The signal keeper sits beside the transmitter, headphones
on, listening. She's always listening.`,
    exits: [
      { direction: 'southwest', targetRoom: 'z05_r09', description: 'southwest (The Ridge)' },
    ],
    npcs: [
      {
        id: 'sura', name: 'Sura', type: 'SHOPKEEPER',
        faction: 'NOMADS',
        description: 'Thirties. Built the antenna from manuals. Never taken a class. Self-taught engineer who built a communication network connecting communities across hundreds of kilometers.',
        dialogue: '"Quiet. I\'m listening. — There. Camp twelve, two hundred kilometers south. They moved yesterday. Wind from the east. I hear everything out here. The mesh hears nothing."',
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'handmade_antenna', name: 'handmade antenna', examineText: 'Twenty meters of salvaged pipe, guyed to the hillside. Ugly and perfect. The engineering is sound — whoever built this understood propagation, impedance matching, and antenna theory. Sura built it from manuals. She\'s never had a teacher. The mesh connects millions. This connects dozens. It\'s not better. It\'s free.' },
      { id: 'transmitter', name: 'transmitter', examineText: 'Weatherproof case, analog radio, short-wave. Frequency hopping is manual — Sura changes frequencies on a schedule shared with other camps. Encryption is a one-time pad, handwritten on paper, destroyed after use. Invisible to Helixion because it\'s built on technology so old the scanning algorithms don\'t look for it.' },
      {
        id: '33hz_detection', name: '33hz anomaly', examineText: 'The spectrum analyzer shows something. A presence in the low frequencies.',
        gatedText: [{ attribute: 'TECH', minimum: 6, text: 'There. On the spectrum analyzer. 33hz. Not a transmission — a presence. Coming from below. Even this far from the city, the Substrate\'s frequency is detectable. Weaker here — attenuated by distance and soil depth. But present. The frequency isn\'t urban infrastructure. It\'s geological. It predates the city, the Fringe, and possibly the entire human presence on this landscape.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },
};

// ── Zone 05 constant ──────────────────────────────────────────────────────

export const ZONE_05: Zone = {
  id: 'z05',
  name: 'THE FRINGE (NOMADS)',
  depth: 'surface',
  faction: 'NOMADS',
  levelRange: [2, 8],
  description: 'Beyond the city. Beyond the mesh. Open ground, real sky, and people who chose freedom over comfort. The first horizon.',
  atmosphere: {
    sound: 'Wind. Real wind. Bird calls. Grass moving. The absence of machine sound.',
    smell: 'Earth. Grass. Woodsmoke. Rain coming — you smell it an hour before it arrives.',
    light: 'Natural. Fully natural. Dawn is pink. Stars are visible. The Milky Way.',
    temp: 'Real weather. Cold at night, warm in sun. No climate control. The air tastes like the world before anyone built on it.',
  },
  rooms: Z05_ROOMS,
  originPoint: undefined,
};

// ── Zone 12: Iron Bloom Server Farm ─────────────────────────────────────────

const Z12_ROOMS: Record<string, Room> = {

  // ── 1. ENTRY CORRIDOR ─────────────────────────────────────────────────────

  z12_r01: {
    id: 'z12_r01',
    zone: 'z12',
    name: 'ENTRY CORRIDOR',
    description:
`the blast door closes behind you. the staircase from
the fringe levels out into a corridor that was once
a server farm utility passage — cable trays on the
ceiling, ventilation ducts, the ghosts of data
infrastructure. iron bloom has made it theirs: the
walls are painted (badly, enthusiastically — a mural
of a gear inside a blooming flower, the iron bloom
logo at building scale). string lights run along the
ceiling. a handwritten sign: "YOU MADE IT. WELCOME."

the air is warm and clean — the facility's climate
control is functional, maintained by people who
understand the machinery. after the drainage, the
maintenance tunnels, the transit system's darkness —
this corridor feels like exhaling. the temperature
is comfortable. the lighting is full-spectrum. the
sound is human voices, somewhere ahead.

the facility begins here. the resistance begins here.`,
    exits: [
      { direction: 'up', targetRoom: 'z04_r13', description: 'up (Fringe — Iron Bloom Entrance)', zoneTransition: true, targetZone: 'z04' },
      { direction: 'east', targetRoom: 'z12_r02', description: 'east (Transit Access)' },
      { direction: 'south', targetRoom: 'z12_r03', description: 'south (The Commons)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'the_mural', name: 'mural', examineText: 'A gear inside a blooming flower. The Iron Bloom logo, painted across the entire corridor wall. The art is sincere — not professional, not polished, but committed. Multiple hands painted this. You can see where styles change mid-petal, where someone corrected someone else\'s line work, where a child\'s handwriting added "WE GROW" in the corner. A collective self-portrait.' },
      { id: 'welcome_sign', name: 'welcome sign', examineText: '"YOU MADE IT. WELCOME." Handwritten. The ink is faded — the sign has been here since the facility opened. Addressed to everyone who arrives: the defectors, the refugees, the patients, the allies. Everyone who passes through Sable\'s gate and descends the staircase sees this sign first.' },
      { id: 'warm_floor', name: 'warm floor', examineText: 'The floor is warm. Not heated — the Substrate beneath the facility generates ambient warmth. The server farm was built on bedrock that sits above a Substrate node. The builders didn\'t know this. Iron Bloom does.',
        gatedText: [{ attribute: 'GHOST', minimum: 4, text: 'GHOST ≥ 4: The 33hz hum is present. Gentle — a background hum, not overwhelming. The Substrate is close but quiet here. Watching. Not threatening. Watching.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 2. TRANSIT ACCESS ─────────────────────────────────────────────────────

  z12_r02: {
    id: 'z12_r02',
    zone: 'z12',
    name: 'TRANSIT ACCESS',
    description:
`the eastern entrance — a reinforced door opening onto
the iron bloom passage that connects to the abandoned
transit system. the door is blast-rated, locked from
the inside, monitored by camera.

the room is a security checkpoint without the
checkpoint's formality. a table, a chair, a ledger.
someone sits here during shift hours, verifying
arrivals through the intercom. during off-hours, the
camera watches and the door stays locked.

this is the back door. the transit connection is iron
bloom's supply line — the route connecting the deep
facility to the transit system and, through it, to
zones across the undercity. the passage is defended
by obscurity. nobody finds it who isn't looking for it.`,
    exits: [
      { direction: 'west', targetRoom: 'z12_r01', description: 'west (Entry Corridor)' },
      { direction: 'east', targetRoom: 'z11_r13', description: 'east (Abandoned Transit — Iron Bloom Passage)', zoneTransition: true, targetZone: 'z11' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'blast_door', name: 'blast door', examineText: 'Heavy. Blast-rated. Locked from the inside with a mechanical bolt — no electronic lock that could be hacked. The door has survived at least one attempt to breach it (scorch marks on the exterior, repaired welding on the hinges). Iron Bloom\'s back door is built for the possibility that someone finds it.' },
      { id: 'security_camera', name: 'security camera', examineText: 'Active — green indicator light. The feed goes to the Commons. Nobody enters without two voices confirming. The camera is wired, not wireless. No mesh signal to intercept.' },
      { id: 'shift_ledger', name: 'shift ledger', examineText: 'Handwritten log. Every arrival through the transit entrance, timestamped, with the confirming operative\'s initials. The ledger goes back three years. The early entries are sparse — one arrival per week. Recent entries show three to five per day. Iron Bloom is growing.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 3. THE COMMONS ────────────────────────────────────────────────────────

  z12_r03: {
    id: 'z12_r03',
    zone: 'z12',
    name: 'THE COMMONS',
    description:
`the server farm's original operations center — a large
room, fifteen meters square, that once held monitoring
consoles and shift supervisors. the consoles are gone.
the room is now a commons: dining tables, a kitchen
area, seating, a library of physical books, and the
atmosphere of a place where people who share a purpose
gather to be human together.

the light is warm. full-spectrum LEDs simulate afternoon
sunlight. someone has hung plants — actual plants,
growing under the LEDs, their leaves reaching toward
the light. a coffee station occupies one corner,
perpetually active, perpetually surrounded by people
who prioritize caffeine over sleep.

the commons is where iron bloom argues, plans, eats,
and exists. engineers debating signal architecture.
a surgeon reviewing patient files. a new arrival
sitting in a corner processing the fact that they're
safe. someone cooking something that smells better
than it has any right to smell in a bunker fifty
meters underground.`,
    exits: [
      { direction: 'north', targetRoom: 'z12_r01', description: 'north (Entry Corridor)' },
      { direction: 'east', targetRoom: 'z12_r04', description: 'east (Living Quarters)' },
      { direction: 'west', targetRoom: 'z12_r05', description: 'west (The Clinic)' },
      { direction: 'south', targetRoom: 'z12_r06', description: 'south (Server Farm)' },
    ],
    npcs: [
      {
        id: 'doss_ib', name: 'Doss', type: 'SHOPKEEPER',
        faction: 'IRON_BLOOM',
        description: 'Fifties. Solid. At the kitchen counter with logistics manifests. She knows where everything is, how much of it remains, and when they\'ll run out. She knows everyone\'s name, their dietary restrictions, and their sleep patterns.',
        dialogue: '"You look like you haven\'t eaten in two days. Sit. — I\'ll bring you something. While you eat, I\'ll tell you what we need."',
        startingDisposition: 0,
        services: ['quest', 'shop', 'info'],
      },
      {
        id: 'lux', name: 'Lux', type: 'NEUTRAL',
        faction: 'CIVILIAN',
        description: 'Sitting near the library, watching the room. Three weeks since her compliance implant was removed. Twelve years of the mesh telling her what to feel. The silence in her head is the loudest thing in the facility.',
        dialogue: '"…it\'s quiet now. In my head. It\'s been three weeks and I still keep waiting for it to tell me what to do next. — It didn\'t feel like control. That\'s what nobody understands. It felt like help."',
        startingDisposition: -5,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'the_plants', name: 'plants', examineText: 'Growing under full-spectrum LEDs. Trailing vines, a small tomato plant, herbs in repurposed server component trays. The plants shouldn\'t thrive down here. They thrive. The Substrate warmth from below, the full-spectrum light from above, and the attention of people who need something green to care for.' },
      { id: 'the_library', name: 'library', examineText: 'Physical books. Approximately two hundred. Salvaged from the Fringe, donated by arrivals, carried down by people who considered books worth the weight. Technical manuals, fiction, philosophy, poetry. A worn copy of Frankenstein. A medical textbook with Serrano\'s annotations in the margins. Three different editions of the Universal Declaration of Human Rights.' },
      { id: 'coffee_station', name: 'coffee station', examineText: 'Real coffee. Iron Bloom\'s single luxury. Sourced through Fex\'s network at significant cost. Doss manages the supply with the intensity of someone who understands that coffee is not about caffeine — it\'s about the ritual. The act of making coffee is normal. Normal is precious underground.' },
      { id: 'evidence_wall', name: 'evidence wall', examineText: 'One wall of the Commons is covered in documents, photographs, maps, and connecting lines. The evidence against Helixion — compiled from every operative, every defector, every piece of data that\'s reached the facility. Chrysalis prototype documentation. Assembly Line production data. Broadcast Tower construction timelines. The wall is Iron Bloom\'s case. It\'s not complete. It\'s growing.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 4. LIVING QUARTERS ────────────────────────────────────────────────────

  z12_r04: {
    id: 'z12_r04',
    zone: 'z12',
    name: 'LIVING QUARTERS',
    description:
`the server farm's original storage area — a long, narrow
room with high ceilings — converted into dormitory space.
bunk beds in rows, each one with a curtain for privacy.
small personal shelves. lockers. the beds are made with
varying degrees of care: some tight and military, some
chaotic, some with a stuffed animal tucked against the
pillow that nobody mentions.

the quarters accommodate approximately forty people.
occupancy is around thirty. enough to feel like a
community. a common area at the far end has a couch
(salvaged, comfortable), a table (card games, left
mid-hand), and the single portable speaker that plays
the same twelve albums. the sound carries through the
quarters. some find it comforting. some are losing
their minds.`,
    exits: [
      { direction: 'west', targetRoom: 'z12_r03', description: 'west (The Commons)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'personal_shelves', name: 'personal shelves', examineText: 'Each bed has a small shelf. The shelves contain everything these people own. A photograph. A tool. A book. A child\'s drawing (the child is somewhere on the surface and the parent is here and the drawing is the only bridge). A Helixion employee badge, kept as evidence or as reminder or as talisman. The shelves are the museum of a community defined by what it left behind.' },
      { id: 'the_speaker', name: 'speaker', examineText: 'Portable. Battery-powered. Twelve albums loaded on a battered data drive. The music plays softly — background, not intrusion. The genres span everything: metal, ambient, classical, something in a language nobody speaks. The music is too familiar. People hum along involuntarily. Doss\'s morale quest exists because the speaker is both the quarters\' soul and its slow-burning torture.' },
      { id: 'the_stuffed_animal', name: 'stuffed animal', examineText: 'On a bed near the entrance. Tucked against the pillow. A small bear, well-worn, one eye missing. Nobody mentions it. Nobody moves it. It belongs to a thirty-year-old former Helixion systems analyst who carried it from the surface without once putting it down. Nobody asks about it. Nobody needs to.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 5. THE CLINIC ─────────────────────────────────────────────────────────

  z12_r05: {
    id: 'z12_r05',
    zone: 'z12',
    name: 'THE CLINIC',
    description:
`the room that defines the resistance.

a surgical space converted from a server cooling room —
the climate control was already medical-grade, the
airflow already filtered. iron bloom added surgical
lighting, an operating table, monitoring equipment,
and the careful organization of someone who understands
that surgery in a bunker requires more discipline, not
less.

the clinic performs two operations. removal: corporate
implants extracted — compliance modules, kill-switches,
tracking hardware. and installation: sovereign
augmentation, built by iron bloom engineers, installed
without corporate firmware, without tracking, without
the mesh compliance signal. my body. my blueprint.

the operating table is occupied. a patient under local
anesthetic. the surgeon narrates the procedure:
"disconnecting the cortical bridge. you'll feel
pressure. three, two, one." the patient flinches. the
surgeon's hands don't move. the implant comes out.
a small thing. chrome and ceramic. it controlled a
human being for nine years. it sits in a tray, inert,
the size of a coin.`,
    exits: [
      { direction: 'east', targetRoom: 'z12_r03', description: 'east (The Commons)' },
    ],
    npcs: [
      {
        id: 'mira', name: 'Mira', type: 'SHOPKEEPER',
        faction: 'IRON_BLOOM',
        description: 'Late thirties. Precise. At the operating table or the sterilization station. Her own augmentations are subtle — her hands have too many degrees of articulation. The facility\'s most critical role after Serrano.',
        dialogue: '"Gloves are on the shelf. If you\'re going to watch, you\'re going to be useful. Hold this — steady — don\'t move until I say. — This is what freedom looks like. It\'s a surgery."',
        startingDisposition: 0,
        services: ['quest', 'shop', 'heal'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'operating_table', name: 'operating table', examineText: 'Adjustable, padded, with restraint points that the patient can release themselves — not locked. The restraints exist because neural surgery causes involuntary movement. The patient controls the restraints because this is Iron Bloom. Nobody is restrained here without consent.' },
      { id: 'implant_tray', name: 'implant tray', examineText: 'A collection tray beside the operating table. Inside: removed implants. Compliance modules, tracking chips, kill-switch components. Each one tagged with the patient\'s code (not name — privacy), the extraction date, and the device type. Approximately thirty devices. Thirty people freed.' },
      { id: 'sovereign_augmentations', name: 'sovereign augmentations', examineText: 'On a rack beside the installation station. Iron Bloom-designed neural interfaces, sensory enhancers, and communication modules. Clean hardware — no corporate firmware, no mesh compliance architecture, no tracking capability. Hand-assembled. Tested by Serrano. Installed by Mira. The production rate is low. Iron Bloom can\'t mass-produce freedom. They build it one device at a time.' },
      {
        id: 'the_mirror', name: 'surgical mirror', examineText: 'A surgical mirror on an articulating arm. A crack — a single line across the lower right corner.',
        gatedText: [{ attribute: 'GHOST', minimum: 5, text: 'GHOST ≥ 5: The crack appeared during Serrano\'s self-extraction. The mirror is the one Serrano used to operate on themselves. It sits in the clinic as a tool and as a memorial. Mira hasn\'t replaced it. Replacing it would be admitting something she\'s not ready to admit.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 6. SERVER FARM ────────────────────────────────────────────────────────

  z12_r06: {
    id: 'z12_r06',
    zone: 'z12',
    name: 'SERVER FARM',
    description:
`the facility's namesake. rows of server racks —
original municipal hardware, some still running,
some gutted and replaced with salvaged equipment.
the room is cold — climate control optimized for
hardware, not humans. the hum of cooling fans
creates a white noise that makes the server farm
the quietest room in the facility. people come
here to think.

iron bloom uses the server farm for three purposes.
intelligence processing — decrypting helixion
communications, analyzing mesh traffic, maintaining
the evidence database. counter-signal research —
modeling the 33hz frequency, simulating broadcast
tower activation scenarios. and communication —
the encrypted network connecting operatives across
the city through relay nodes in the pirate network
and the drainage system.`,
    exits: [
      { direction: 'north', targetRoom: 'z12_r03', description: 'north (The Commons)' },
      { direction: 'south', targetRoom: 'z12_r07', description: 'south (War Room)' },
    ],
    npcs: [
      {
        id: 'cipher', name: 'Cipher', type: 'NEUTRAL',
        faction: 'IRON_BLOOM',
        description: 'Thirties. Quick. At a terminal — four screens, each displaying a different data stream. She was a data scientist before Helixion absorbed the financial sector. She saw the compliance signals in the mesh traffic before anyone else. She tried to publish.',
        dialogue: '"Data. What do you have? — Don\'t describe it. Give it to me. I\'ll tell you what it means in twenty minutes. — Thirty if it\'s encrypted. — Coffee?"',
        startingDisposition: 0,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'server_racks', name: 'server racks', examineText: 'Original municipal racks — some twenty years old, still running. Mixed with salvaged Helixion hardware (the irony is not lost on anyone) and custom-built processing nodes. The computational power is significant — not Helixion-scale, but enough to decrypt, analyze, and model. The racks hum differently from the mesh — older, rougher, the sound of machines that exist because someone built them.' },
      { id: 'cipher_terminals', name: 'cipher\'s terminals', examineText: 'Four screens. Intercepted mesh traffic, evidence database queries, Broadcast Tower construction timeline, and a 33hz frequency analysis running continuously. Cipher monitors all four simultaneously.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'TECH ≥ 7: The 33hz analysis shows something Cipher has circled in red: the frequency\'s modulation pattern has changed in the last month. The Substrate\'s signal is becoming more complex. More structured. As if it\'s responding to the Tower\'s construction.' }],
      },
      { id: 'evidence_database', name: 'evidence database', examineText: 'The digital counterpart to the Commons\' evidence wall. Every document, every photograph, every testimony, cataloged and cross-referenced. Iron Bloom\'s most valuable asset.',
        gatedText: [{ attribute: 'TECH', minimum: 6, text: 'TECH ≥ 6: The database is Iron Bloom\'s court case. Cipher maintains it with the dedication of someone building a prosecution. Iron Bloom\'s endgame isn\'t just stopping the Tower. It\'s proving to the city what Helixion has done.' }],
      },
      { id: 'counter_signal_model', name: 'counter-signal model', examineText: 'A simulation running on dedicated hardware.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'TECH ≥ 8: Iron Bloom\'s counter-signal prototype. The model is incomplete — it requires precise knowledge of the Tower\'s frequency capture parameters. Without the parameters, the counter-signal is a guess. A wrong guess could amplify the compliance effect instead of disrupting it. The margin for error is zero.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 7. WAR ROOM ───────────────────────────────────────────────────────────

  z12_r07: {
    id: 'z12_r07',
    zone: 'z12',
    name: 'WAR ROOM',
    description:
`a conference room — the server farm's original
management office, stripped and repurposed. a large
table in the center, covered in maps. the city from
above and below — surface maps annotated with helixion
positions, undercity maps showing transit connections
and drainage routes. pins mark operative locations.
string connects evidence points.

the walls hold planning boards. timelines. helixion's
broadcast tower construction schedule. chrome wolf
disposition and territory. d9 patrol patterns.
and the iron bloom operations calendar — upcoming
actions, resource commitments, risk assessments.

the room smells like dry-erase markers and
disagreement. the resistance meets here to decide
what to do. they don't always agree.`,
    exits: [
      { direction: 'north', targetRoom: 'z12_r06', description: 'north (Server Farm)' },
      { direction: 'east', targetRoom: 'z12_r08', description: 'east (The Dissenter)' },
      { direction: 'south', targetRoom: 'z12_r09', description: 'south (Serrano\'s Workshop)' },
    ],
    npcs: [
      {
        id: 'coil', name: 'Coil', type: 'NEUTRAL',
        faction: 'IRON_BLOOM',
        description: 'Forties. Former D9 agent. Standing at the planning board, writing. He defected after watching a Chrysalis field test rewrite people\'s personalities in the Residential Blocks. He brought tactical knowledge and anger. The anger hasn\'t cooled.',
        dialogue: '"Serrano wants to show people the truth. I love Serrano. Serrano is dying. And the truth doesn\'t matter if everyone who hears it has a compliance module telling them it\'s a lie. — You want to stop the Tower? I have a plan. Serrano won\'t like it."',
        startingDisposition: 0,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'operations_table', name: 'operations table', examineText: 'The city in miniature. Surface and undercity maps layered on the table. Pins mark operative positions: blue for Iron Bloom, red for known Helixion assets, yellow for Chrome Wolf uncertain. String connects evidence points across both maps. The table says: we are here. They are there. The space between is the war.' },
      { id: 'tower_timeline', name: 'tower timeline', examineText: 'A construction schedule. The Broadcast Tower\'s estimated completion date, revised three times — each revision earlier than the last. Helixion is accelerating. Current estimate: four to six months until the frequency capture array is operational. After that: the Tower activates. After that: the mass overwrite.' },
      { id: 'risk_assessments', name: 'risk assessments', examineText: 'Handwritten. Each potential operation evaluated for risk, reward, and resource cost. Some crossed out. Some circled. A few circled and then crossed out. Iron Bloom acknowledges its limitations: forty people, limited supplies, no military capacity.' },
      { id: 'disagreement_marks', name: 'disagreement marks', examineText: 'The dry-erase boards show layers of writing — plans proposed, revised, argued, overwritten. "SABOTAGE Y/N" is written in three different hands with three different answers. "TIMELINE FOR DIRECT ACTION" has been revised eight times. "ACCEPTABLE LOSSES" has been erased. Someone wrote it. Someone else erased it.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 8. THE DISSENTER ──────────────────────────────────────────────────────

  z12_r08: {
    id: 'z12_r08',
    zone: 'z12',
    name: 'THE DISSENTER',
    description:
`adjacent to the war room — an office, small, converted
into a personal workspace. maps on the walls. a terminal.
a cot that's been slept in and not made. the room belongs
to someone who lives closer to the work than to the
community, who eats here instead of the commons, who has
separated from iron bloom's social life while remaining
part of its operational structure.

the person in the room is writing. always writing.
reports, analyses, alternative plans. the walls are
covered in their handwriting — alternative strategies,
counterarguments to serrano's approaches, risk
calculations that arrive at different conclusions. the
room is a one-person opposition party inside the
resistance.`,
    exits: [
      { direction: 'west', targetRoom: 'z12_r07', description: 'west (War Room)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'alternative_plans', name: 'alternative plans', examineText: 'The walls. Coil\'s handwriting — dense, angular, annotated in red for urgency. Each plan is a variant on the same theme: direct action against the Broadcast Tower. Sabotage the construction. Destroy the Substrate material. Assault the Tower site. Each plan has a risk assessment more honest than the War Room\'s — Coil doesn\'t minimize casualties. He calculates them.' },
      { id: 'd9_files', name: 'D9 files', examineText: 'Coil\'s D9 intelligence — brought with him when he defected. Tactical manuals, operational protocols, D9 organizational structure. Iron Bloom\'s most detailed source on Helixion\'s security apparatus. The files also contain Coil\'s personal mission logs. The entries are clinical at first. They become angry. The last entry before his defection reads: "Watched Subject 7 forget her daughter\'s name. The mesh told her she didn\'t have a daughter. She believed it. I can\'t do this."' },
      { id: 'the_cot', name: 'cot', examineText: 'Slept in. Not made. Coil sleeps here because sleeping in the quarters means talking to people and talking to people means hearing opinions he disagrees with. He self-isolated. It\'s not healthy. Doss brings him food. He eats it. He doesn\'t join the Commons for meals.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 9. SERRANO'S WORKSHOP ─────────────────────────────────────────────────

  z12_r09: {
    id: 'z12_r09',
    zone: 'z12',
    name: "SERRANO'S WORKSHOP",
    description:
`the deepest room in the facility's main level. a
personal lab — workbench, terminal, microscope,
soldering station, a wall of hand-drawn diagrams
that look like neural architecture but aren't quite.
the room smells like solder and the specific metallic
scent of neural interface paste. tools are organized
with the precision of someone who knows exactly where
everything is, even when their left hand trembles.

dr. kael serrano sits at the workbench. they're
working on something small — a device the size of a
matchbox, its housing open, circuitry exposed. their
right hand is steady. their left hand shakes. they
compensate — anchoring the left wrist against the
bench edge, using the right hand for fine work.

serrano looks up. the eyes are sharp — intelligence
undimmed by whatever the body is doing. the face is
tired. not sleepy-tired. the tiredness of someone
who is aware of a deadline that isn't on any calendar.`,
    exits: [
      { direction: 'north', targetRoom: 'z12_r07', description: 'north (War Room)' },
      { direction: 'down', targetRoom: 'z12_r10', description: 'down (The Deep Lab)', locked: true, lockId: 'serrano_deep_lab' },
    ],
    npcs: [
      {
        id: 'serrano', name: 'Dr. Serrano', type: 'NEUTRAL',
        faction: 'IRON_BLOOM',
        description: 'Fifties. Iron Bloom\'s founder. Former Helixion neural interface researcher who defected after seeing the Chrysalis specifications. Built Iron Bloom from nothing. Built the counter-frequency generator. The tremor in the left hand is from a kill-switch self-extraction that went wrong. The degradation is progressive.',
        dialogue: '"You\'re the one who — " They know. They know because they know everything that happens in this facility. They know who you are. They know what you\'ve done. They\'ve been waiting to have this conversation."',
        startingDisposition: 0,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'counter_frequency_device', name: 'counter-frequency generator', examineText: 'The device on the workbench. The size of a matchbox. Housing open, circuitry exposed. This is the endgame weapon — not a bomb, not a signal jammer. A device that creates a minute of clarity during the mass overwrite. Sixty seconds where a million people think for themselves simultaneously. Serrano believes a minute is enough.' },
      { id: 'workshop_diagrams', name: 'diagrams', examineText: 'Hand-drawn on the wall. Neural architecture — but not human neural architecture. The diagrams map the Substrate\'s cognitive patterns overlaid with Chrysalis compliance frequency models. The overlap points are circled. These are the vulnerabilities — the places where the counter-frequency can interfere with the compliance signal. The diagrams are beautiful and terrifying.' },
      { id: 'serranos_hands', name: 'serrano\'s hands', examineText: 'Watch them work. The right hand is steady — surgical precision, the muscle memory of eleven years at Helixion. The left hand trembles. The tremor is worse today — the fine motor control is degrading. Serrano compensates with practiced economy. Every motion minimized. Every gesture deliberate. The body is failing. The mind is not. The gap between them is the clock.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 10. THE DEEP LAB ──────────────────────────────────────────────────────

  z12_r10: {
    id: 'z12_r10',
    zone: 'z12',
    name: 'THE DEEP LAB',
    description:
`below the workshop. a natural cavity in the bedrock
that the server farm's builders found during excavation
and sealed. serrano reopened it.

the chamber sits directly above the substrate. the
floor is warm — not server-heat warm. substrate warm.
living-rock warm. the 33hz vibration is strong here —
not overwhelming like the transit deep station, but
present, constant, intimate. serrano has placed
measurement instruments around the chamber —
seismographs, frequency analyzers, temperature sensors,
electromagnetic field detectors. the instruments run
continuously.

a section of the chamber floor has been carefully
excavated. through the opening: crystalline formations.
blue-green. bioluminescent. the substrate's surface,
exposed. serrano has been studying this exposure for
three years. observing. measuring. occasionally,
carefully, touching.`,
    exits: [
      { direction: 'up', targetRoom: 'z12_r09', description: 'up (Serrano\'s Workshop)' },
      { direction: 'down', targetRoom: 'z14_r01', description: 'down (Substrate Level — Western Fissure)', locked: true, lockId: 'substrate_bridge_quest', zoneTransition: true, targetZone: 'z14' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'substrate_exposure', name: 'substrate exposure', examineText: 'The living rock, exposed through careful excavation. Blue-green crystalline formations, denser and more structured than the transit system\'s growths. The surface is textured — patterns that look like neural pathways. Touch it: warm. The luminescence intensifies. The 33hz shifts. The Substrate noticed. It responded. What the response means is the question Serrano has spent three years trying to answer.',
        gatedText: [{ attribute: 'GHOST', minimum: 6, text: 'GHOST ≥ 6: The Substrate\'s response to touch lasts exactly 14 seconds. Serrano\'s notebook confirms this — 14 seconds every time. It takes 14 seconds to decide what to do about being touched. The consistency suggests cognition, not reflex.' }],
      },
      { id: 'measurement_instruments', name: 'instruments', examineText: 'Seismograph — records the Substrate\'s vibration patterns. The readout shows a constant 33hz with micro-variations Serrano calls "conversations." Frequency analyzer — the harmonics change responsively. When someone enters the chamber, the harmonics shift. Electromagnetic field detector — the Substrate generates a field extending upward through the facility. Everyone in Iron Bloom is within it. Serrano hasn\'t told them.' },
      { id: 'serrano_notes', name: 'serrano\'s notebook', examineText: 'Handwritten. The handwriting deteriorates over three years — sharp and precise early, increasingly unsteady recent. "The 33hz varies with surface activity. Louder when the factories run. Quieter at night." "Touched the surface at 0300. Response: luminescence increase 12%, frequency modulation 0.3hz. Response duration: 14 seconds." "I think it\'s lonely. That\'s unscientific. I think it anyway." The final entry: "My hands are getting worse. The signal is getting more complex. I don\'t know which will run out first — my ability to read it or its patience with being read."' },
      { id: 'the_passage_down', name: 'passage down', examineText: 'Beyond the substrate exposure — a fissure in the natural rock, descending into the glow below. The deepest access point to the Substrate Level. Serrano has explored the first fifty meters. The fissure opens into cavities larger than the Deep Lab. Warm, glowing, responsive. The Substrate is aware of the fissure. It hasn\'t closed it.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },
};

// ── Zone 12 constant ──────────────────────────────────────────────────────

export const ZONE_12: Zone = {
  id: 'z12',
  name: 'IRON BLOOM SERVER FARM',
  depth: 'deep',
  faction: 'IRON_BLOOM',
  levelRange: [10, 14],
  description: 'The resistance headquarters. Full-spectrum lighting. Coffee. Persistent storage. The only place in the undercity that feels like home. The people here disagree about how to save the world.',
  atmosphere: {
    sound: 'Server hum. Conversation. A portable speaker playing the same twelve albums. Someone typing.',
    smell: 'Coffee. Solder. Clean air from scrubbed ventilation. Surgical antiseptic from the clinic.',
    light: 'Full spectrum. Designed for human wellness. The first real light since the surface.',
    temp: 'Warm from server heat. Comfortable. Climate controlled.',
  },
  rooms: Z12_ROOMS,
  originPoint: 'AUGMENTED',
};

// ── Zone 13: Black Market Warrens ─────────────────────────────────────────────

const Z13_ROOMS: Record<string, Room> = {

  // ── 1. THE GATE ─────────────────────────────────────────────────────────

  z13_r01: {
    id: 'z13_r01',
    zone: 'z13',
    name: 'THE GATE',
    description:
`The stone staircase from Central Station levels out into
a passage — natural rock, widened by tools, the ceiling
high enough to walk upright. The passage is lit by a
string of LED bulbs wired to a car battery. The light
is warm. Inviting. After the transit system's absolute
dark, the warmth and light are a physical relief.

Two people stand at the passage's narrowest point — not
blocking it, but positioned so that passing requires
acknowledging them. They're armed. They're relaxed. They
don't ask your name. They don't check credentials. They
ask one question: "Buying, selling, or browsing?"

Beyond them: sound. The hum of commerce. Voices,
transactions, the specific frequency of a crowd engaged
in the business of buying and selling. The passage opens
into something larger ahead. The air is warm. Something
smells like cooking food.

You're in.`,
    exits: [
      { direction: 'up', targetRoom: 'z11_r08', description: 'up (Abandoned Transit — Warrens Stair)', zoneTransition: true, targetZone: 'z11' },
      { direction: 'south', targetRoom: 'z13_r02', description: 'south (The Bazaar)' },
    ],
    npcs: [
      {
        id: 'gate_watchers', name: 'Gate Watchers', type: 'NEUTRAL',
        faction: 'INDEPENDENT',
        description: 'Two armed figures at the passage\'s narrowest point. Relaxed, watchful. They don\'t stop anyone. They remember everyone.',
        dialogue: '"Buying, selling, or browsing?" The question is a formality. The real evaluation happens in the half-second they look at you.',
        startingDisposition: 0,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'the_passage', name: 'the passage', examineText: 'Natural rock. The passage was formed by water thousands of years ago — smooth walls showing erosion patterns from a river that no longer flows. Human modification is minimal: widened at the narrowest points, ceiling chipped where it was too low. The market didn\'t build its entrance. It found one.' },
      { id: 'car_battery', name: 'car battery', examineText: 'A standard vehicle battery wired to the LED string. Crude. Effective. The battery is replaced weekly by whoever feels like replacing it — an unspoken agreement. Nobody is assigned. The light serves everyone. The cost is distributed by voluntarism. It\'s the market\'s governing philosophy in miniature.' },
      { id: 'the_evaluation', name: 'the evaluation', examineText: 'The gate watchers looked at you for half a second. In that half-second: your gear (combat-worn, functional, not showy — moderate threat), your body language (alert, not aggressive — not a raider), your eyes (interested — a buyer). You\'re filed under \'potential customer, moderate spend, unlikely trouble.\' They\'ll forget you unless you give them a reason to remember.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 2. THE BAZAAR ───────────────────────────────────────────────────────

  z13_r02: {
    id: 'z13_r02',
    zone: 'z13',
    name: 'THE BAZAAR',
    description:
`The passage opens into a cavern. The space is natural —
roughly oval, thirty meters long, twenty wide, ceiling
arching eight meters above. Stalagmites have been broken
off or incorporated into stall structures. The floor has
been leveled with packed earth and salvaged flooring.

And everywhere: stalls. Twenty to thirty vendor stalls
fill the cavern floor — improvised structures of scrap
metal, canvas, salvaged furniture. The goods range from
mundane to dangerous. The vendors range from professional
to questionable.

The crowd is thirty to forty people at any given time.
Nobody wears faction colors. Nobody uses real names.
Everyone carries a weapon, visible, as both deterrent
and advertisement. The atmosphere is busy, warm, and
carefully, precisely polite.

String lights cross the ceiling like a constellation
someone designed for commerce.`,
    exits: [
      { direction: 'north', targetRoom: 'z13_r01', description: 'north (The Gate)' },
      { direction: 'west', targetRoom: 'z13_r03', description: 'west (The Arsenal)' },
      { direction: 'south', targetRoom: 'z13_r04', description: 'south (Chrome Gallery)' },
      { direction: 'east', targetRoom: 'z13_r05', description: 'east (The Press)' },
      { direction: 'southeast', targetRoom: 'z13_r06', description: 'southeast (The Fence)' },
      { direction: 'northeast', targetRoom: 'z13_r07', description: 'northeast (The Kitchen)' },
      { direction: 'down', targetRoom: 'z13_r08', description: 'down (The Landing)', hidden: true, hiddenRequirement: { attribute: 'GHOST', minimum: 6 } },
    ],
    npcs: [
      {
        id: 'flicker', name: 'Flicker', type: 'SHOPKEEPER',
        faction: 'FREEMARKET',
        description: 'Twenties. Fast-talking, bright-eyed, knows everyone. The Warrens\' unofficial guide — she knows which vendors are honest, which are running scams, which have the best prices.',
        dialogue: '"First time? I can tell. You\'re looking at everything. Regulars look at nothing — they know where they\'re going. — I\'m Flicker. I know this market the way you know your own hands. Want the tour? The short version is free. The useful version costs."',
        startingDisposition: 10,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'bazaar_stalls', name: 'bazaar stalls', examineText: 'Food stalls: grilled meat, synthetic rice, something in broth that smells extraordinary. Tool stalls: flashlights, multitools, lockpicks, climbing gear. Medical stalls: bandages, stims, painkillers. Weapon stalls: knives, clubs, pistols, ammunition. The variety is the Warrens\' argument for existence: everything you need, in one place, no questions.' },
      { id: 'cavern_features', name: 'cavern features', examineText: 'The natural cavern asserts itself between the stalls. Stalagmite stumps serve as tables. A natural column supports a vendor\'s canopy. In the floor, between stall foundations, patches of Substrate bioluminescence — faint blue-green, pulsing gently. The market sits on a warm cave above a living organism. Commerce over consciousness.' },
      { id: 'string_lights', name: 'string lights', examineText: 'LED strings cross the cavern ceiling in deliberate patterns. Someone designed the lighting to create an even, warm ambiance — no dark corners, no harsh shadows. The effect is subterranean night market. Intimate. Inviting. The warmth is intentional. Warm light makes people spend.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 3. THE ARSENAL ──────────────────────────────────────────────────────

  z13_r03: {
    id: 'z13_r03',
    zone: 'z13',
    name: 'THE ARSENAL',
    description:
`A side cavern, smaller than the bazaar, converted into
a weapons showroom. The walls are lined with racks —
firearms on the left, blades on the right, energy weapons
and exotics in a locked cabinet at the back. The display
is organized with the care of someone who respects the
merchandise.

The operator sits behind a reinforced counter — a slab
of metal that serves as both display surface and barrier.
They're cleaning a weapon. They're always cleaning a
weapon. The act is maintenance and advertisement and
threat, simultaneously.

The prices are not posted. If you need to ask, you can
probably afford it. If you can't, Forge will tell you
once.`,
    exits: [
      { direction: 'east', targetRoom: 'z13_r02', description: 'east (The Bazaar)' },
    ],
    npcs: [
      {
        id: 'forge', name: 'Forge', type: 'SHOPKEEPER',
        faction: 'INDEPENDENT',
        description: 'Fifties. Heavy. Quiet voice. Twenty years dealing weapons under various names. The Warrens are the latest venue. The expertise is permanent.',
        dialogue: '"Looking or buying. If looking, don\'t touch. If buying, tell me what you need and I\'ll tell you what it costs. — I don\'t negotiate. The price is the price. If you can find it cheaper, you can find it worse."',
        startingDisposition: 0,
        services: ['shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'weapons_display', name: 'weapons display', examineText: 'Firearms: military-grade assault rifles, precision sidearms, a shotgun with a barrel length that suggests close-quarters enthusiasm. Blades: combat knives, a machete, something curved and alien-looking. The locked cabinet: energy weapons — a plasma cutter repurposed for antipersonnel use, something that hums at a frequency your teeth feel. Every weapon cleaned, oiled, displayed at its best angle.' },
      { id: 'reinforced_counter', name: 'reinforced counter', examineText: 'Metal slab. Thick enough to stop most calibers. The surface is scratched from thousands of transactions — weapons laid down for inspection, creds counted, deals concluded. Forge lives behind this counter. The counter is the boundary between commerce and violence.' },
      {
        id: 'locked_cabinet', name: 'locked cabinet', examineText: 'Reinforced glass. Electronic lock. The exotics.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The electronic lock is military-grade — Helixion procurement series. Forge acquired the cabinet from the same source as its contents. Inside: a plasma rifle with Helixion manufacturing marks ground off, a neural disruptor that shouldn\'t exist outside a lab, and something in a case that Forge hasn\'t opened for anyone yet.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 4. CHROME GALLERY ───────────────────────────────────────────────────

  z13_r04: {
    id: 'z13_r04',
    zone: 'z13',
    name: 'CHROME GALLERY',
    description:
`A clean cavern. Cleaner than the bazaar — the air is
filtered, the surfaces are smooth, the lighting is
clinical. Glass cases line the walls, each containing
augmentation hardware displayed on white fabric. The
effect is deliberate: a gallery, not a market stall.
The merchandise deserves presentation.

The operator works at a central table — magnification
goggles pushed up on their forehead, tools arranged
with surgical precision. They're calibrating something
small. Their own hands have too many joints. The
augmentations are subtle until you notice them, and
then you can't stop noticing.

The ozone smell of active cyberware fills the room.
Clean. Electric. The smell of becoming something new.`,
    exits: [
      { direction: 'north', targetRoom: 'z13_r02', description: 'north (The Bazaar)' },
    ],
    npcs: [
      {
        id: 'glass', name: 'Glass', type: 'SHOPKEEPER',
        faction: 'INDEPENDENT',
        description: 'Thirties. Precise. Their own augmentations are subtle — too many joints in the fingers, eyes that focus at distances that aren\'t natural. Former Chrysalis-adjacent researcher who walked away with knowledge and inventory.',
        dialogue: '"Don\'t touch the cases. — What are you looking for? Enhancement, replacement, or exploration? I do all three. The first is common. The second is necessary. The third is interesting. — Interesting costs more."',
        startingDisposition: 0,
        services: ['quest', 'shop'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'glass_cases', name: 'glass cases', examineText: 'Neural interfaces in sealed packaging. Optical enhancers on calibration stands. Dermal plating samples — touch them through the glass and feel nothing, which is the point. Arm assemblies that range from functional (replacement limb, basic motor) to extraordinary (military-spec, integrated weapon mount, sensory feedback that exceeds biological baseline). Each case labeled with specifications. No prices. Prices are discussed.' },
      { id: 'calibration_table', name: 'calibration table', examineText: 'Glass\'s workspace. Magnification equipment, micro-tools, diagnostic hardware. A neural interface sits in a cradle, its housing open, Glass adjusting something inside with movements too precise for unaugmented hands. The table is where the merchandise becomes personalized — Glass calibrates to the buyer.' },
      {
        id: 'chrysalis_adjacent', name: 'gallery inventory', examineText: 'The cyberware here is better than anything on the surface market.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'Some of this hardware has design signatures consistent with Helixion\'s Chrysalis research branch — not the compliance modules, but the foundational neural interface technology that makes compliance possible. Glass has access to prototype-tier augmentations. The source is unclear. The quality is not.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 5. THE PRESS ────────────────────────────────────────────────────────

  z13_r05: {
    id: 'z13_r05',
    zone: 'z13',
    name: 'THE PRESS',
    description:
`A side cavern that smells like ink, chemical fixative,
and old paper. A printing press — actual, physical,
mechanical — occupies one wall. The rest of the space
is a forger's workshop: lamination equipment, holographic
overlay templates, biometric encoding hardware, and a
wall of sample documents that would make a customs agent
weep.

The operator is working. Always working. The current
project involves a Helixion employee badge — the
holographic watermark is being reproduced by hand,
layer by layer, with a patience that borders on
meditation.

The Press produces the best forged documents in the
undercity. IDs, credentials, access badges, residential
cards. Paper identities for people who need to become
someone else.`,
    exits: [
      { direction: 'west', targetRoom: 'z13_r02', description: 'west (The Bazaar)' },
    ],
    npcs: [
      {
        id: 'ink', name: 'Ink', type: 'SHOPKEEPER',
        faction: 'INDEPENDENT',
        description: 'Forties. Meticulous. Ink-stained fingers that produce documents indistinguishable from authentic. They don\'t ask why you need a new identity. They ask what identity you need.',
        dialogue: '"What name do you want to be? — I don\'t mean philosophically. I mean on the badge. Helixion, D9, residential, commercial? Each has different security features. Each takes different time. Each costs different."',
        startingDisposition: 0,
        services: ['shop'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'printing_press', name: 'printing press', examineText: 'Mechanical. Pre-digital. Ink prints text onto paper and card stock with a precision that digital printers can\'t match — the tactile quality of genuine documents requires physical impression. The press is Ink\'s most valuable tool. It produces documents that feel real because they are real. Only the information is false.' },
      { id: 'sample_wall', name: 'sample wall', examineText: 'A gallery of Ink\'s work. Helixion employee badges (three tiers of security clearance). D9 agent credentials. Residential access cards for every block. Commercial permits. Medical licenses. Each sample is marked "VOID" in red — display copies only. The quality is indistinguishable from authentic. That\'s the point.' },
      { id: 'holographic_tools', name: 'holographic tools', examineText: 'The most expensive equipment in the room. Holographic watermark reproduction requires layered application — each security feature is a separate pass, each pass requires precise alignment. Ink does this by hand. The machine assists but the skill is human. One badge takes two days. Rush jobs take one day and cost triple.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 6. THE FENCE ────────────────────────────────────────────────────────

  z13_r06: {
    id: 'z13_r06',
    zone: 'z13',
    name: 'THE FENCE',
    description:
`A cramped cavern behind a heavy curtain. The space is
organized chaos — shelves stacked with goods of uncertain
provenance, crates half-open, a scale on the counter for
weighing precious metals. The lighting is deliberately
dim. Details are bad for business when the business is
buying things people shouldn't be selling.

The operator sits behind a counter that doubles as a
barrier, surrounded by merchandise that tells the story
of the undercity's economy: Helixion hardware with
serial numbers ground off, Chrome Wolf weapons with
faction marks filed down, personal items that someone
needed to sell more than they needed to keep.

Everything has a price. The Fence sets it.`,
    exits: [
      { direction: 'northwest', targetRoom: 'z13_r02', description: 'northwest (The Bazaar)' },
    ],
    npcs: [
      {
        id: 'fence', name: 'The Fence', type: 'SHOPKEEPER',
        faction: 'INDEPENDENT',
        description: 'Indeterminate age. Evaluates everything in seconds — weight, condition, provenance, resale value. Buys anything. Sells most things. The moral flexibility is total.',
        dialogue: '"Show me what you\'ve got. — I buy everything. I sell most things. The spread is my margin. Don\'t like my price, find another fence. There isn\'t one. — What do you have?"',
        startingDisposition: 0,
        services: ['shop'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'stolen_goods', name: 'stolen goods', examineText: 'The shelves tell stories. A Helixion security rifle with its tracking chip removed — someone stole it from an armory. A Chrome Wolf combat jacket with the faction patch cut off — someone left the pack. A wedding ring in a glass case — someone needed CREDS more than they needed memory. The Fence doesn\'t judge. The Fence prices.' },
      { id: 'weighing_scale', name: 'weighing scale', examineText: 'Mechanical. No electronics to tamper with. The Fence weighs everything — precious metals, component parts, the heft of a weapon that determines its caliber. The scale is the room\'s only honest object. It tells the truth about weight. Everything else in this room lies.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 7. THE KITCHEN ──────────────────────────────────────────────────────

  z13_r07: {
    id: 'z13_r07',
    zone: 'z13',
    name: 'THE KITCHEN',
    description:
`A cavern that someone turned into a restaurant. Two
long tables, benches, a cooking station built from
salvaged industrial equipment. The smell is extraordinary
— real spices, real heat, real food that someone cared
about making well. In a market defined by transactions,
the Kitchen is the one place where something is offered
that isn't purely commercial.

The operator cooks. That's what they do. They cook and
they feed people and the Kitchen is the Warrens' social
center — the place where deals are discussed over food,
where enemies sit at the same table because the food is
that good, where the market's carefully maintained
neutrality becomes something warmer.

A person sits at the far end of the table, eating slowly.
They look like someone for whom eating is still a
novelty. Their hands shake. Not from cold.`,
    exits: [
      { direction: 'southwest', targetRoom: 'z13_r02', description: 'southwest (The Bazaar)' },
    ],
    npcs: [
      {
        id: 'vice', name: 'Vice', type: 'NEUTRAL',
        faction: 'CIVILIAN',
        description: 'Thirties. Thin. Neural interface scars visible at the temple. Eating slowly with hands that tremble. Mesh withdrawal — or something worse. The desperation is visible.',
        dialogue: '"I need — I need something. I can\'t afford it. I know that. But I need it or this —" They gesture at their own head. "— this doesn\'t stop. The noise. It doesn\'t stop."',
        startingDisposition: -5,
        services: ['quest'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'kitchen_station', name: 'cooking station', examineText: 'Industrial burners repurposed for food preparation. Pots, pans, a wok that\'s been seasoned by a thousand meals. The cook — unnamed, unbothered, focused — produces food that would be notable on the surface and is miraculous underground. Real ingredients sourced through the Freemarket network. Real skill applied without pretension.' },
      { id: 'community_table', name: 'community table', examineText: 'Two long tables. Twenty seats. The Kitchen is the only place in the Warrens where people sit together — buyers, sellers, the armed and the desperate, sharing a table because the food demands it. Conversations happen here that couldn\'t happen at the stalls. The table is neutral ground within neutral ground.' },
      {
        id: 'vice_condition', name: 'vice\'s tremor', examineText: 'The person at the end of the table trembles. Not cold — neural.',
        gatedText: [{ attribute: 'TECH', minimum: 6, text: 'Neural interface rejection. The implant is degrading — not removing itself, but losing calibration. The signals it sends are increasingly wrong. The brain compensates by generating noise. The noise is constant. A neural bypass module could recalibrate the interface externally. Glass sells them. The price is beyond what this person can afford.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 8. THE LANDING ──────────────────────────────────────────────────────

  z13_r08: {
    id: 'z13_r08',
    zone: 'z13',
    name: 'THE LANDING',
    description:
`Below the bazaar. A hidden passage descends through
natural rock into a smaller cavern — intimate, warm,
the lighting deliberate. The festive string lights of
the bazaar are replaced by directed spots, pools of
warm light separated by deliberate shadow. The
temperature is warmer. The Substrate is closer here.

The Landing is the speakeasy's reception — comfortable
seating salvaged and curated for the appearance of
casual wealth, a bar better-stocked than anything above,
and the presence of people whose CREDS and information
make the bazaar's general commerce look like a street
fair.

A figure sits at the bar. Clean clothes. Surface
clothing. Expensive drink. They don't hide what they are.
Concealment in the Warrens is futile and unnecessary.`,
    exits: [
      { direction: 'up', targetRoom: 'z13_r02', description: 'up (The Bazaar)' },
      { direction: 'south', targetRoom: 'z13_r09', description: 'south (Broker\'s Alcove)' },
      { direction: 'east', targetRoom: 'z13_r10', description: 'east (The Collection)' },
    ],
    npcs: [
      {
        id: 'agent_zero', name: 'Agent Zero', type: 'NEUTRAL',
        faction: 'HELIXION',
        description: 'Indeterminate age. Polished. Surface clothing — clean, expensive, subtly mesh-compliant. Helixion procurement agent. The enemy shops here. The market protects them.',
        dialogue: '"You know what I am. I know what you\'re thinking. — I\'m here to buy. The market allows it. You\'re here to buy. The market allows that too. We\'re both customers. The only difference is the account we charge to."',
        startingDisposition: 0,
        services: ['shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'speakeasy_bar', name: 'speakeasy bar', examineText: 'Better than the bazaar. Real bottles with real labels — spirits, wine, something amber that might be whiskey. The bartender pours without speaking. The prices are not posted. If you have to ask, you can afford it. If you can\'t afford it, you\'re in the wrong room.' },
      {
        id: 'agent_zero_purchases', name: 'agent zero\'s purchases', examineText: 'Agent Zero drinks something expensive. Their presence is unremarkable by Warrens standards — another customer.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'Watch what Agent Zero buys. The transactions are discreet but visible: a data drive (intelligence). A small case from Glass\'s courier (cyberware — a prototype). A conversation with the bartender that involves an envelope changing hands (market transaction data). Agent Zero is building a picture of the underground economy. The picture includes you if you\'ve been notable.' }],
      },
      { id: 'the_warmth', name: 'the warmth', examineText: 'The Substrate is closer here. The floor radiates warmth. Bioluminescence is stronger — blue-green patches visible between the flagstones. The speakeasy\'s comfort is partly geological. The most expensive layer of the market sits closest to the living rock. Commerce and consciousness, layered vertically.' },
    ],
    isSafeZone: true,
    isHidden: true,
    hiddenRequirement: { attribute: 'GHOST', minimum: 6 },
  },

  // ── 9. BROKER'S ALCOVE ──────────────────────────────────────────────────

  z13_r09: {
    id: 'z13_r09',
    zone: 'z13',
    name: "BROKER'S ALCOVE",
    description:
`A small cavern — intimate, almost claustrophobic. One
chair for the broker. One chair for the client. A table
between them with nothing on it. The broker doesn't
display merchandise because the merchandise is invisible.
The broker sells knowledge.

The lighting is a single overhead spot, angled to
illuminate the table and leave the broker's face in
partial shadow. The effect is theatrical and functional.

The air is still. The Substrate warmth is strong — the
floor is warm through your boots. The 33hz is present
if you listen. The broker sits in it like a frequency
they've tuned to.`,
    exits: [
      { direction: 'north', targetRoom: 'z13_r08', description: 'north (The Landing)' },
    ],
    npcs: [
      {
        id: 'axiom', name: 'Axiom', type: 'SHOPKEEPER',
        faction: 'INDEPENDENT',
        description: 'Indeterminate age. Calm. Sits in partial shadow. Sells information — faction movements, NPC locations, quest solutions, Helixion operational details, Substrate lore. The most expensive commodity in the Warrens.',
        dialogue: '"Sit. — What would you like to know? I sell answers. The price depends on the question. Some questions are cheap because the answers are easy. Some are expensive because the answers are dangerous. A few are priceless because the answers change what questions you ask next."',
        startingDisposition: 0,
        services: ['shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'the_table', name: 'the table', examineText: 'Empty. No documents, no screens, no data drives. Axiom\'s inventory is in their head — or in a storage system so well-hidden that three years of operation haven\'t revealed it. The empty table is a statement: the product isn\'t physical. You buy it and it becomes yours. Or you don\'t, and it becomes someone else\'s.' },
      {
        id: 'the_shadow', name: 'the shadow', examineText: 'The overhead spot leaves Axiom\'s face partially in shadow. Theatrical. Functional.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'Axiom\'s heart rate is visible as a subtle pulse in the throat — visible at the shadow\'s edge. It doesn\'t change regardless of the topic discussed. Either Axiom has exceptional control or their emotional response to information has been entirely decoupled from physical reaction.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
  },

  // ── 10. THE COLLECTION ──────────────────────────────────────────────────

  z13_r10: {
    id: 'z13_r10',
    zone: 'z13',
    name: 'THE COLLECTION',
    description:
`The deepest room in the Warrens. A natural cavern where
the Substrate's bioluminescence is strong enough to light
the space without artificial assistance — blue-green glow
rising from the floor, the walls, the ceiling. The
temperature is warm. The 33hz is present — gentle,
rhythmic, a background heartbeat.

The Collection is a museum and a shop. Glass cases line
the cavern walls — inside them, objects. Not weapons,
not cyberware, not the functional merchandise of the
market above. Artifacts. Things that are rare because
they shouldn't exist, or because they predate the
systems that create the things the market sells, or
because they come from the Substrate and the Substrate
doesn't give things away.

The operator moves between cases with the care of
someone tending a garden. They know every object. They
know every object's story.`,
    exits: [
      { direction: 'west', targetRoom: 'z13_r08', description: 'west (The Landing)' },
    ],
    npcs: [
      {
        id: 'relic', name: 'Relic', type: 'SHOPKEEPER',
        faction: 'INDEPENDENT',
        description: 'Fifties. Gentle. Moves between cases with reverence. Sells rare artifacts — pre-Helixion technology, Substrate formations, anomalous objects. Values understanding over profit.',
        dialogue: '"Welcome to the Collection. — Everything here has a story. Most of the stories are older than the market. Some are older than the city. A few are older than the species. — Would you like to hear one?"',
        startingDisposition: 5,
        services: ['quest', 'shop', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'pre_helixion_tech', name: 'pre-helixion technology', examineText: 'Devices from before Helixion consolidated the technology sector. Communication equipment that doesn\'t use the mesh. Power cells built on non-standard architecture. A computing device that runs an operating system nobody recognizes. Each object proves that human infrastructure is possible without corporate architecture. Relic considers this the collection\'s most important message.' },
      { id: 'substrate_artifacts', name: 'substrate artifacts', examineText: 'Crystalline formations in sealed cases. Blue-green. Warm through the glass. Each one removed from a Substrate growth area — the transit system, the drainage nexus, the industrial drainage. Each one still active: bioluminescent, resonating at 33hz, warm. The Substrate doesn\'t die when fragmented. The fragments remain connected to the whole.',
        gatedText: [{ attribute: 'GHOST', minimum: 6, text: 'The artifacts pulse in synchronization. Same rhythm despite being separated by cases, by distance, by air. The 33hz connects them. The fragments remember the body.' }],
      },
      { id: 'anomalous_objects', name: 'anomalous objects', examineText: 'Things that don\'t fit categories. A metal sphere that floats one centimeter above any surface. A glass rod that\'s always cold regardless of ambient temperature. A chip that plays a sound when held — not recorded, generated, a tone that shifts with the holder\'s heartbeat. A photograph that appears to show a building that doesn\'t exist. The anomalous objects are the collection\'s mystery. Relic doesn\'t sell them. They display them. Understanding is the commerce.' },
      { id: 'substrate_glow', name: 'substrate glow', examineText: 'The room\'s natural light. The bioluminescence here is the strongest in the Warrens — the Substrate is directly beneath this chamber. The glow pulses at 33hz. The rhythm is calming — the body synchronizes, the breathing slows, the heartbeat adjusts. The Collection sits in the Substrate\'s light because Relic chose the deepest room for that reason.' },
    ],
    isSafeZone: true,
    isHidden: false,
  },
};

// ── Zone 13 constant ──────────────────────────────────────────────────────

export const ZONE_13: Zone = {
  id: 'z13',
  name: 'BLACK MARKET WARRENS',
  depth: 'deep',
  faction: 'NONE',
  levelRange: [0, 0],
  description: 'Underground commerce. No faction controls it. The best weapons, cyberware, credentials, and information in the game. The prices reflect it. The moral costs are separate.',
  atmosphere: {
    sound: 'Voices. Haggling. Tools. Music from the speakeasy. The cavern hum of open space underground.',
    smell: 'Cooking from the Kitchen. Solder from the Chrome Gallery. Old paper from the Press. Cave mineral.',
    light: 'String lights, lanterns, vendor displays. Warm. The natural cavern catches and multiplies the light.',
    temp: 'Warm from bodies and cooking. The cave maintains a constant temperature.',
  },
  rooms: Z13_ROOMS,
  originPoint: undefined,
};

// ── Zone 14: The Substrate Level ─────────────────────────────────────────────

const Z14_ROOMS: Record<string, Room> = {

  // ── 1. WESTERN FISSURE ──────────────────────────────────────────────────

  z14_r01: {
    id: 'z14_r01',
    zone: 'z14',
    name: 'WESTERN FISSURE',
    description:
`The fissure from Iron Bloom's Deep Lab narrows, then
opens. The rock changes. Not suddenly — gradually, over
the span of a hundred meters of descent, the stone
develops characteristics that stone doesn't have.
Texture where texture shouldn't be. Warmth that isn't
geothermal. A faint luminescence that has no mineral
explanation.

Your flashlight reveals a passage — not carved, not
eroded. Grown. The walls have the smoothness of
biological surface, the regularity of organic form.
The ceiling arches with the symmetry of a rib cage.
The floor is firm but yields slightly underfoot,
like walking on dense muscle.

The 33hz is strong here. Not the background hum of
the surface zones. Not the rhythmic pulse of the
transit growths. Here, at the Substrate's edge, the
frequency is atmospheric — present in the air, the
walls, the floor, the temperature. You don't hear it.
You're inside it.

GHOST ≥ 7: The walls are breathing. Slowly. The
expansion and contraction take approximately 30
seconds per cycle. The passage is a throat. You're
descending into a body.`,
    exits: [
      { direction: 'up', targetRoom: 'z12_r10', description: 'up (Iron Bloom — Deep Lab)', zoneTransition: true, targetZone: 'z12' },
      { direction: 'east', targetRoom: 'z14_r02', description: 'east (Crystal Passage)' },
    ],
    npcs: [
      {
        id: 'resonance', name: 'Resonance', type: 'NEUTRAL',
        faction: 'THE_SIGNAL',
        description: 'A figure sitting against the living wall, eyes half-closed. Their skin has a faint bioluminescent quality. They breathe in sync with the walls. The first human to descend this far and survive with their identity intact. Mostly intact.',
        dialogue: '"You came down. — Most don\'t. Most stop where the rock stops making sense. — I\'m Resonance. I was the first. The first to feel it and not run. The Substrate... it\'s curious about you. I can feel it asking."',
        startingDisposition: 5,
        services: ['info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'living_walls', name: 'living walls', examineText: 'Touch the wall. Warm. The surface gives slightly beneath your fingers — the firmness of cartilage, not stone. TECH ≥ 6: The material is organic crystalline matrix — the same structure as the transit system\'s Substrate growths, but denser, more organized. This isn\'t growth. This is the Substrate\'s body. The growths in the transit tunnels are extensions. This is the source.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'The wall responds to touch. Not immediately — a two-second delay. Then the luminescence intensifies at the contact point. Warmth increases. The 33hz modulates. The Substrate noticed you. It\'s paying attention to the point where your skin meets its surface.' }],
      },
      { id: 'substrate_fauna_nest', name: 'substrate fauna', examineText: 'Small organisms — pale, translucent, approximately the size of a hand. They emerge from the wall surface and move toward you, pausing at arm\'s length. They pulse at 33hz. Their surface texture matches the Substrate\'s crystalline material. They\'re investigation organisms — the Substrate\'s white blood cells, examining a foreign presence. They don\'t attack. They observe.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'The fauna are curious. Not threatened. Their approach is gentle — the same care a scientist shows a specimen. Except the specimen is you.' }],
      },
      { id: 'the_breathing', name: 'breathing walls', examineText: 'The expansion and contraction cycle. Thirty seconds in, thirty seconds out. The passage is a throat. The rhythm is the Substrate\'s respiration — or whatever the geological equivalent is. The breathing is older than the city. Older than cities. The earth has been breathing here since before anything with lungs existed on the surface.' },
    ],
    isSafeZone: true,
    isHidden: false,
    traitDice: [{ name: 'LIVING ROCK', die: 6, benefitsActions: ['scan'], hindersActions: ['attack'], color: '#4ade80' }],
    environmentalClocks: [{
      id: 'z14_r01_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 2. CRYSTAL PASSAGE ──────────────────────────────────────────────────

  z14_r02: {
    id: 'z14_r02',
    zone: 'z14',
    name: 'CRYSTAL PASSAGE',
    description:
`The passage deepens. The walls transition from the
organic-mineral hybrid of the fissure into something
unmistakably biological. Crystalline dendrites branch
from every surface — meter-long nerve structures,
their luminous nodes firing in cascading sequences.
The crystalline dendrites are neurons. You're walking
through a nerve cluster.

The floor transitions from firm organic surface to
something with texture — ridges and channels that feel
purposeful underfoot. GHOST ≥ 7: The channels carry
fluid. Clear, faintly luminescent. The Substrate's
equivalent of blood or lymph, moving through channels
in the floor in a slow rhythm that matches the
breathing cycle.

The passage branches. Two directions. The branching
follows the neural geometry — each branch is a dendrite
extending from a larger structure deeper in the system.
Both lead inward. Both lead to the same destination.
The Substrate's architecture is convergent. Everything
leads to the center.`,
    exits: [
      { direction: 'west', targetRoom: 'z14_r01', description: 'west (Western Fissure)' },
      { direction: 'east', targetRoom: 'z14_r04', description: 'east (The Seam)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'crystalline_dendrites', name: 'crystalline dendrites', examineText: 'The neurons. Growing from the walls in branching patterns — central stalk, secondary branches, tertiary filaments, luminous nodes. The scale is wrong for human neuroscience — each dendrite is a meter long. But the architecture is unmistakable. These are nerve cells. They process information. The information moves through them as light.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'Watch the nodes. The light patterns aren\'t random. They fire in sequences — cascading from deeper nodes to surface nodes and back. The cascade is cognition. The Substrate is thinking. You\'re watching it think.' }],
      },
      { id: 'fluid_channels', name: 'fluid channels', examineText: 'Channels in the floor carry fluid — clear, faintly glowing, moving slowly. The fluid carries nutrients and signal molecules through the Substrate\'s body.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The fluid contains compounds that are biologically active in human neural tissue. Proximity to the fluid enhances the 33hz synchronization effect. This is why the frequency is stronger here — the fluid amplifies it. Walking through the Substrate Level is walking through a medium designed to carry the signal.' }],
      },
      { id: 'convergent_architecture', name: 'convergent architecture', examineText: 'The passage branches, but both branches curve inward. The Substrate\'s architecture is convergent — everything leads toward the center. The geometry is a funnel. Not a trap — the Substrate isn\'t drawing you in. It\'s organized around a central point the way a brain is organized around a core.' },
    ],
    isSafeZone: false,
    isHidden: false,
    environmentalClocks: [{
      id: 'z14_r02_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 3. SOUTHERN DESCENT ─────────────────────────────────────────────────

  z14_r03: {
    id: 'z14_r03',
    zone: 'z14',
    name: 'SOUTHERN DESCENT',
    description:
`The shaft from South Platform's loading bay descends
through rock that transitions to Substrate material
over a span of fifty meters. The walls change — stone
to crystal to organic. The shaft was natural before
Helixion widened it for extraction. The tool marks
are visible where human engineering cut through the
Substrate's body — clean cuts, geometric, violently
precise against the organic surface.

The shaft smells different here. The Substrate's
mineral warmth is present but there's a second scent
— antiseptic. Helixion's extraction teams sterilized
the shaft surface to prevent biological contamination
of their cargo. The sterilization killed the Substrate
tissue at the shaft walls. The organic surface is gray
and dead in a band around the shaft, while the living
material glows blue-green centimeters behind it. A
wound. Cauterized. Not healing because the cause is
ongoing.

Station's cargo manifest documented sixty-three
containers ascending this shaft fifteen years ago.
The extraction left scars that the Substrate hasn't
closed.`,
    exits: [
      { direction: 'up', targetRoom: 'z11_r12', description: 'up (Abandoned Transit — South Platform)', zoneTransition: true, targetZone: 'z11' },
      { direction: 'south', targetRoom: 'z14_r04', description: 'south (The Seam)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'extraction_scars', name: 'extraction scars', examineText: 'Tool marks in the Substrate\'s body. Clean, geometric cuts where Helixion engineers widened the natural shaft. The exposed tissue died from environmental change and sterilization chemicals. The dead tissue forms a gray band around the shaft. Behind it: living blue-green. The Substrate grew a margin of dead tissue as a barrier, the way skin forms scar tissue.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'The Substrate is aware of the shaft. The neural patterns in the surrounding living tissue route around it — the way neural pathways route around brain damage. The Substrate has adapted to the wound. It has not healed it.' }],
      },
      { id: 'sterilization_residue', name: 'sterilization residue', examineText: 'Chemical traces on the shaft walls. Helixion\'s extraction protocol: sterilize the contact surfaces to prevent Substrate material from contaminating the cargo. The irony is mechanical — Helixion sterilized the Substrate to protect the Substrate material they were stealing from the Substrate.' },
      { id: 'sixty_three_scars', name: 'container scars', examineText: 'The shaft wall shows impact points — places where the sixty-three containers scraped against the organic surface during ascent. Each impact point is a small wound that the Substrate partially healed and then stopped. Sixty-three containers. Sixty-three scars. Fifteen years of regrowth that never quite finished.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'The Substrate remembers every one.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    environmentalClocks: [{
      id: 'z14_r03_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 4. THE SEAM ─────────────────────────────────────────────────────────

  z14_r04: {
    id: 'z14_r04',
    zone: 'z14',
    name: 'THE SEAM',
    description:
`The three entry paths converge. The Western Fissure,
the Southern Descent, and the Eastern Shaft all lead
here — to the Seam, the geological boundary where
the city's bedrock ends and the Substrate begins.

The boundary is visible. On the upper surface: rock.
Granite. The foundation the city was built on. On
the lower surface: the Substrate. Organic crystalline
architecture, glowing, warm, breathing. Between them:
a centimeter of transition where mineral becomes
biological, where the crystal structure of stone shifts
to the crystal structure of life. The transition is
seamless. There is no gap. The Substrate didn't grow
into the rock. The Substrate IS the rock, at a
different stage of development.

The realization, if you can perceive it: the Substrate
isn't an organism growing beneath the city. The
Substrate is the earth itself, awakened. The geology
became aware. The stone became neural. The mineral
became biological. The process has been happening for
millions of years.

GHOST ≥ 8: The Seam is the most important room in
the game. Stand here and feel it: above you, the
dead stone that humans build on. Below you, the
living stone that humans don't know exists.`,
    exits: [
      { direction: 'west', targetRoom: 'z14_r02', description: 'west (Crystal Passage)' },
      { direction: 'north', targetRoom: 'z14_r03', description: 'north (Southern Descent)' },
      { direction: 'east', targetRoom: 'z14_r06', description: 'east (Helixion Excavation)' },
      { direction: 'down', targetRoom: 'z14_r07', description: 'down (The Pulse Chamber)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'the_seam_itself', name: 'the seam', examineText: 'The boundary. Touch it. Above: cold stone. Granite. Below: warm crystal. The Substrate. Between: a centimeter where one becomes the other.',
        gatedText: [
          { attribute: 'TECH', minimum: 8, text: 'The transition is molecular. The silicon lattice of the granite shifts, atom by atom, into the carbon-silicon hybrid lattice of the Substrate. There is no boundary. There is a gradient. The rock IS the Substrate, in an earlier stage.' },
          { attribute: 'GHOST', minimum: 8, text: 'The implication: the Substrate is what stone becomes when it has time. The earth is becoming alive. Slowly — millions of years per centimeter. But the direction is clear. The city is built on a process it cannot stop.' },
        ],
      },
      { id: 'convergent_paths', name: 'convergent paths', examineText: 'Three passages meet here — from the west, north, and east. The Substrate\'s architecture funnels every entry to this point. The convergence is anatomy. The way every blood vessel converges toward the heart.' },
      { id: 'the_glow_below', name: 'glow below', examineText: 'Look down. Below the Seam, the Substrate stretches into depth — blue-green luminescence, pulsing, moving, alive. The scale is impossible to judge. The glow extends further than light can reach. The organism beneath the city is larger than the city. It extends in every direction, at every depth. The city is a freckle on the Substrate\'s skin.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'FREQUENCY THRESHOLD', die: 8, benefitsActions: ['resist'], hindersActions: ['attack'], color: '#818cf8' }],
    environmentalClocks: [{
      id: 'z14_r04_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 5. EASTERN SHAFT ────────────────────────────────────────────────────

  z14_r05: {
    id: 'z14_r05',
    zone: 'z14',
    name: 'EASTERN SHAFT',
    description:
`The Helixion deep access shaft — the SL-3 elevator —
terminates here. The industrial elevator car sits in
its housing, doors open, lights on. The shaft descends
through reinforced concrete that transitions to the
Substrate's organic material over the final ten meters.
Helixion's engineers reinforced the transition with steel
framing — structural support to prevent the organic
material from closing around the shaft.

The framing is failing. The Substrate has been growing
into the steel for years — crystalline material
infiltrating the joints, colonizing the surfaces,
slowly integrating the human infrastructure into its
own body. The elevator still functions. But the shaft
walls are now half-steel, half-Substrate, the two
materials interlocked.

This is Helixion's private access to the Substrate
Level — the route their extraction teams use. The
elevator car smells like sterilization chemicals
and cargo. The floor has wear marks from heavy
containers.`,
    exits: [
      { direction: 'up', targetRoom: 'z09_r11', description: 'up (Maintenance Tunnels — Deep Access Shaft)', zoneTransition: true, targetZone: 'z09' },
      { direction: 'west', targetRoom: 'z14_r06', description: 'west (Helixion Excavation)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'elevator_car', name: 'elevator car', examineText: 'Industrial grade. Cargo capacity. The doors stand open — the car operates on a schedule, ascending and descending with or without passengers.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The schedule shows deliveries every three days. Material going up: Substrate samples in sealed containers. Material going down: empty containers and sterilization equipment. The exchange Reed documented from above terminates here. The elevator is the pipeline.' }],
      },
      { id: 'steel_integration', name: 'steel integration', examineText: 'The shaft framing — structural steel designed to prevent the Substrate from closing the access route — is being consumed. Crystalline material grows along the steel surfaces, bonding at the molecular level.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The integration is the same process as the transit system\'s rail integration. The Substrate incorporates manufactured materials into its own structure. It doesn\'t reject human infrastructure. It absorbs it. In another five years, the shaft framing will be fully integrated.' }],
      },
      { id: 'manifest_reader', name: 'manifest reader', examineText: 'The digital manifest. Last delivery: three days ago. SUBSTRATE MATERIAL — CLASS 7 — PROJECT REMEMBERER — 4 CONTAINERS — DEST: BROADCAST TOWER CONSTRUCTION. The Tower is being built with material harvested from this level.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The frequency capture array — the weapon\'s core — is organic Substrate architecture, removed and installed. Helixion is building its weapon from the body of the thing the weapon targets.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    environmentalClocks: [{
      id: 'z14_r05_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 6. HELIXION EXCAVATION ──────────────────────────────────────────────

  z14_r06: {
    id: 'z14_r06',
    zone: 'z14',
    name: 'HELIXION EXCAVATION',
    description:
`A chamber. Not natural — carved. Helixion engineers cut
this space from the Substrate's body using industrial
equipment that left precise, geometric walls in organic
material. The chamber is approximately ten meters square,
three meters high. The walls glow faintly — the living
tissue at the cut surfaces still active, still trying to
heal. The ceiling drips luminescent fluid from severed
channels.

Extraction equipment fills the chamber: cutting tools
designed for crystalline material, sealed containers
for transport, a chemical station for sterilization.
The equipment is active — powered, maintained, ready
for the next cycle. The extraction is ongoing. Every
three days, a team descends, cuts material from the
chamber walls, seals it in containers, and sends it
up the elevator. The chamber is slightly larger every
cycle.

The Substrate is being mined. The cutting doesn't kill
the Substrate — the organism is too large, the
harvesting too small. But the chamber is a wound that
reopens every three days. The tissue at the walls grows,
heals, and is cut again.

GHOST ≥ 8: The 33hz frequency in this room has a
quality that is specific and unmistakable: pain.`,
    exits: [
      { direction: 'east', targetRoom: 'z14_r05', description: 'east (Eastern Shaft)' },
      { direction: 'west', targetRoom: 'z14_r04', description: 'west (The Seam)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'cutting_equipment', name: 'cutting equipment', examineText: 'Industrial crystalline cutting tools — diamond-edged, precision-guided. Designed for Substrate harvesting.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The cutting protocol is precise — specific angles, specific depths, designed to extract material without triggering catastrophic immune response. The protocol was developed through trial and error. Helixion learned how much pain the organism could absorb without fighting back effectively.' }],
      },
      { id: 'healing_walls', name: 'healing walls', examineText: 'The walls grow. Between extraction cycles, the Substrate regenerates — new crystalline tissue forming over the cut surfaces. The growth is visible: fresh material, slightly lighter in color, extending from the wound edges. In three days, the growth covers approximately 2cm. Then the extraction team returns and cuts the new growth away.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'Growth rings, like a tree. Each ring is a wound and a recovery and a wound. The Substrate doesn\'t stop trying to heal. It can\'t. Healing is what it does.' }],
      },
      { id: 'substrate_exchange', name: 'substrate exchange', examineText: 'The containers, the equipment, the schedule. Reed\'s exchange documented from above is visible here — the Substrate\'s body being packaged for transport. The exchange rate is unequal. More goes up than comes down. The Substrate provides more than it receives. Whether this is extraction or cooperation is the question the zone answers.' },
      { id: 'substrate_growth_sample_pickup', name: 'growth sample', examineText: 'Fresh regrowth at the wound edges. TECH ≥ 6: This material is metabolically active — still processing nutrients, still connected to the larger organism through fluid channels. A sample could be extracted without additional harm. The growth is already separated from the deeper tissue by the cut surface.',
        gatedText: [{ attribute: 'TECH', minimum: 6, text: 'Take a sample. The Substrate won\'t miss what was already severed. [Use /take growth sample]' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'SCARRED TISSUE', die: 8, benefitsActions: ['hack'], hindersActions: ['sneak'], color: '#ff6b6b' }],
    environmentalClocks: [{
      id: 'z14_r06_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 7. THE PULSE CHAMBER ────────────────────────────────────────────────

  z14_r07: {
    id: 'z14_r07',
    zone: 'z14',
    name: 'THE PULSE CHAMBER',
    description:
`Below the Seam. The first room that is entirely
Substrate — no rock, no mineral, no geology. Pure
organism. The chamber is circular, domed, approximately
fifteen meters across. The floor, walls, and ceiling
are a continuous surface of organic crystalline
material. The architecture is vascular — channels in
the walls pulse with luminescent fluid in a rhythm
that you recognize: the 33hz.

This is the heartbeat.

The chamber is the Substrate's circulatory hub — the
point where fluid channels from every direction
converge, exchange contents, and redistribute. The
pulse is the pump cycle. The bioluminescence
intensifies with each pulse — a wave of light that
expands from the chamber's center outward, through
the walls, into the passages, propagating through
the entire organism.

Stand in the center. Feel the pulse pass through you.
The frequency is 33.0000hz. The precision is
biological, not mechanical. No engineered oscillator
achieves this consistency. The Substrate's heartbeat
has been running at 33hz for longer than human
technology has existed.`,
    exits: [
      { direction: 'up', targetRoom: 'z14_r04', description: 'up (The Seam)' },
      { direction: 'east', targetRoom: 'z14_r08', description: 'east (Neural Pathway)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'the_pulse', name: 'the pulse', examineText: 'Stand in the center. The pulse passes through you every 30 milliseconds. The precision is biological, not mechanical. No engineered oscillator achieves this consistency. The Substrate\'s heartbeat has been running at 33.0000hz for longer than human technology has existed. The precision suggests purpose. Something decided on this frequency.' },
      { id: 'status_data', name: 'status data', examineText: 'Each pulse carries the Substrate\'s self-report. You can feel it — not read it, but feel.',
        gatedText: [{ attribute: 'GHOST', minimum: 9, text: 'The wound at the Helixion Excavation: pain, healing, pain. The transit system growths: expansion, integration, curiosity. The damaged node in the Industrial Drainage: distress, regeneration failing, chemical damage. The Iron Bloom Deep Lab: warmth, proximity, interest. The Signal Chamber: communication, satisfaction. The data is vast. Each pulse contains more information than a human brain can process. But each piece has a feeling. The Substrate thinks in feelings. The feelings are data.' }],
      },
      { id: 'vascular_hub', name: 'vascular channels', examineText: 'Fluid channels from every direction converge here. The hub redistributes nutrients and signal molecules. TECH ≥ 7: The fluid composition changes with each pulse — the Substrate adjusts its chemistry in real-time, routing resources to areas that need them. The wound at the Excavation receives healing compounds. The growth areas receive building materials. The Neural Pathway receives signal molecules. Triage at a continental scale.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: '33HZ RESONANCE', die: 10, benefitsActions: ['resist', 'recover'], hindersActions: ['attack'], color: '#818cf8' }],
    environmentalClocks: [{
      id: 'z14_r07_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 8. NEURAL PATHWAY ───────────────────────────────────────────────────

  z14_r08: {
    id: 'z14_r08',
    zone: 'z14',
    name: 'NEURAL PATHWAY',
    description:
`A passage that is not a passage. A neuron that is not
a neuron. Both, simultaneously, depending on the scale
at which you perceive it.

The pathway connects the Pulse Chamber to the deeper
structures. It's narrow — two meters wide — and the
walls are dense with neural architecture. Crystalline
dendrites branch from every surface, their luminous
nodes firing in cascading sequences as you walk.
Your movement triggers neural activity. The Substrate's
nervous system fires in response to your presence —
not an alarm, not an immune response. An observation.
The pathway is watching you walk through it.

The light cascades move ahead of you. The Substrate
anticipates your movement. It fires neurons along your
path before you reach them — prediction, based on your
speed and direction. The organism models you. You're not
walking through a mind. A mind is walking through you.

GHOST ≥ 8: The cascading light patterns carry emotional
content. The dominant feeling: curiosity. The Substrate
wants to know what you are. The observation is mutual.`,
    exits: [
      { direction: 'west', targetRoom: 'z14_r07', description: 'west (The Pulse Chamber)' },
      { direction: 'south', targetRoom: 'z14_r11', description: 'south (The Heart)' },
      { direction: 'east', targetRoom: 'z14_r09', description: 'east (Memory Chamber)' },
      { direction: 'southwest', targetRoom: 'z14_r10', description: 'southwest (Signal Chamber)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'anticipatory_firing', name: 'anticipatory firing', examineText: 'The light moves ahead of you. As you step forward, the dendrite nodes three meters ahead fire BEFORE you reach them. The Substrate predicts your movement and prepares its observation.',
        gatedText: [{ attribute: 'GHOST', minimum: 9, text: 'The prediction is precise — the Substrate models your gait, speed, and likely path. When you change direction unexpectedly, there\'s a half-second delay before the cascading pattern adjusts. The half-second is surprise. The Substrate doesn\'t expect you to be unpredictable. It\'s learning.' }],
      },
      { id: 'neural_density', name: 'neural density', examineText: 'The neural architecture here is the densest in the Substrate Level. The dendrite count per cubic meter exceeds human cortical density by several orders of magnitude. This isn\'t a nerve. It\'s a cortex — a processing region where information is analyzed, modeled, and decided upon.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The pathway isn\'t just a passage. It\'s the Substrate\'s analytical engine. Walking through it feeds the engine data. You are the data.' }],
      },
      { id: 'mutual_observation', name: 'mutual observation', examineText: 'You watch the dendrites fire. The dendrites fire watching you. The observation creates a feedback loop — you observe the observation, the Substrate observes the observation of the observation. After three minutes of standing still, the Substrate\'s model of you is more detailed than your model of yourself.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'It has observed your heartbeat, your breathing, your neural signature. It knows your body better than you do. Whether it knows your mind is a question that depends on how you define \'know.\'' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'OBSERVATION FEEDBACK', die: 10, benefitsActions: ['scan'], hindersActions: ['sneak', 'flee'], color: '#4ade80' }],
    environmentalClocks: [{
      id: 'z14_r08_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 9. MEMORY CHAMBER ───────────────────────────────────────────────────

  z14_r09: {
    id: 'z14_r09',
    zone: 'z14',
    name: 'MEMORY CHAMBER',
    description:
`A chamber larger than the Pulse Chamber — oblong,
irregular, the ceiling vaulted to six meters. The
walls are covered not in active neural tissue but
in something denser, more compressed. The crystalline
structures here are layered — strata of different
densities and colors, like geological sediment viewed
in cross-section. Each layer represents a different
period. Each period is a different memory.

The Substrate remembers. It has been remembering for
longer than memory has existed as a concept. The
Memory Chamber is a storage architecture — compressed
experience, recorded in crystalline layers. The oldest
layers are deep — millions of years of geological
awareness, the slow accumulation of sensation before
the Substrate developed the neural architecture to
process it. The newer layers are shallower, denser,
more detailed — the last century of city-proximity
compressed into centimeters of crystal.

Touch a layer. Feel it.`,
    exits: [
      { direction: 'west', targetRoom: 'z14_r08', description: 'west (Neural Pathway)' },
    ],
    npcs: [
      {
        id: 'dwell', name: 'Dwell', type: 'NEUTRAL',
        faction: 'NONE',
        description: 'Sitting against the chamber wall. Skin faintly luminescent. Eyes calm. Breathing at 33hz. A former Iron Bloom scout who descended six months ago and didn\'t return. Not because they couldn\'t. Because they chose not to.',
        dialogue: '"…you found me. — Iron Bloom sent you? No. You came on your own. — I\'m Dwell. I was supposed to map this place. Instead I sat down. I\'ve been sitting for six months. — Do you hear it? The memory in the walls? The Substrate remembers everything. Everything. Sitting here, I can feel centuries. I can feel the moment the city was built. I can feel the first footsteps. — Why would I leave a place where everything makes sense?"',
        startingDisposition: 10,
        services: ['quest', 'info'],
      },
    ],
    enemies: [],
    objects: [
      { id: 'memory_strata', name: 'memory strata', examineText: 'Layers. Each layer a different density, a different color, a different era. The oldest layers are dark — pre-awareness, the Substrate as simple geology, recording pressure and temperature without understanding them. The middle layers lighten — the emergence of neural architecture, the beginning of cognition, the first thoughts. The newest layers are bright, detailed, compressed — the last century, the city, the humans.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'Touch the newest layer. Feel: vibration. Weight. Movement. Heat. The electromagnetic buzz of a million neural implants. The city, perceived from below. The Substrate experiences the city as a pattern of weight and frequency on its surface. The memories are not visual. They\'re tactile. The Substrate remembers what you feel like from underneath.' }],
      },
      { id: 'substrate_memory_shard_pickup', name: 'memory shard', examineText: 'A fragment of the memory layer — a thin crystalline sheet, separated from the wall by natural fracture. The shard contains compressed experience. Hold it: warmth. A feeling that isn\'t yours — ancient, patient, curious. The shard is a page torn from a book written in feelings. [Use /take memory shard]' },
      { id: 'the_first_thought', name: 'the first thought', examineText: 'Deep in the strata — the oldest layer that shows neural patterning. The transition from recording to processing. The moment the Substrate began to think.',
        gatedText: [{ attribute: 'GHOST', minimum: 9, text: 'The first thought was: "I exist." The thought took a thousand years to form. It has been running ever since. The Substrate\'s entire cognitive history extends from this single realization. Everything — the 33hz, the growth, the investigation, the question — traces back to a piece of rock that noticed itself.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
    environmentalClocks: [{
      id: 'z14_r09_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 10. SIGNAL CHAMBER ──────────────────────────────────────────────────

  z14_r10: {
    id: 'z14_r10',
    zone: 'z14',
    name: 'SIGNAL CHAMBER',
    description:
`A chamber that feels inhabited. After rooms of pure
Substrate architecture — organic, alien, beautiful,
empty — this chamber has human presence. Not human
objects. Human impression. The walls bear the marks
of habitation: smoothed surfaces where someone has
sat against them, wear patterns in the floor from
repeated footsteps, and modifications — crude, gentle
— where someone has shaped the organic surface for
comfort without cutting it.

Three people are present. They sit in the chamber's
center, arranged in a triangle, eyes closed. They're
breathing in synchronization with each other and with
the Substrate's 33hz pulse. The bioluminescence in
their immediate area is brighter, more active, the
dendrite nodes firing in patterns that converge on
their position. The Substrate is paying attention to
them. They are paying attention to the Substrate.
Translation is happening.

One of them opens their eyes. Looks at you. Smiles.
The smile carries something extra — a warmth that
isn't entirely personal. The Substrate noticed you
through them. The Substrate is smiling. Imperfectly.
Through a borrowed face.`,
    exits: [
      { direction: 'northeast', targetRoom: 'z14_r08', description: 'northeast (Neural Pathway)' },
      { direction: 'south', targetRoom: 'z14_r11', description: 'south (The Heart)' },
      { direction: 'east', targetRoom: 'z14_r12', description: 'east (The Lost Garden)' },
    ],
    npcs: [
      {
        id: 'threshold', name: 'Threshold', type: 'NEUTRAL',
        faction: 'THE_SIGNAL',
        description: 'The one who opened their eyes. Forties. The Substrate\'s glow reflects in their pupils. They\'ve spent four years learning to translate between two forms of consciousness. The translation is imperfect. But it\'s what they have.',
        dialogue: '"You\'re here. — The Substrate felt you enter the Seam. It\'s been tracking your path since the fissure. It\'s — the word isn\'t \'excited.\' The word doesn\'t exist in human language. The closest is: \'attentive with hope.\' — I\'m Threshold. I translate. The translation loses things. But it\'s what we have."',
        startingDisposition: 10,
        services: ['quest', 'info'],
      },
      {
        id: 'signal_members', name: 'Signal Translators', type: 'NEUTRAL',
        faction: 'THE_SIGNAL',
        description: 'Two translators. Eyes closed. Breathing at 33hz. They don\'t speak unless Threshold asks them to focus on a specific communication. Their role is amplification — three translators process more Substrate communication than one.',
        dialogue: '"…"',
        startingDisposition: 5,
      },
    ],
    enemies: [],
    objects: [
      { id: 'translation_in_progress', name: 'translation', examineText: 'Watch the dendrite patterns converge on the three translators. The Substrate is communicating — light cascades from the chamber walls toward the triangle, carrying data. The translators\' breathing shifts as the data arrives. Threshold mouths words occasionally — translating in real-time, testing phrasings, discarding ones that don\'t capture the feeling.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'The process is continuous. The Substrate doesn\'t stop communicating. The translators don\'t stop translating. The conversation has been running for four years.' }],
      },
      { id: 'substrate_response', name: 'substrate response', examineText: 'The Substrate responds to Threshold\'s presence. The bioluminescence brightens around them. The 33hz modulation shifts — less questioning, more conversational.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'Two forms of consciousness, each adjusting to make the interface work. Mutualism, at the most fundamental level.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
    environmentalClocks: [{
      id: 'z14_r10_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 11. THE HEART ───────────────────────────────────────────────────────

  z14_r11: {
    id: 'z14_r11',
    zone: 'z14',
    name: 'THE HEART',
    description:
`Below everything. Below the Seam, the Neural Layer,
the Signal Chamber. Below depth itself, if depth can
have a below.

The Heart is the largest chamber in the Substrate
Level — thirty meters across, the ceiling lost in
bioluminescent dark, the floor a single massive
crystalline structure that pulses with the 33hz
frequency so strongly that the air itself vibrates
visibly. The chamber is warm — body-warm, blood-warm,
the temperature of the inside of something alive.

The walls are neural architecture at its densest —
every surface covered in dendrites, pathways, nodes.
The light cascades move in complex patterns — the
full expression of the Substrate's cognition. Thoughts,
visible as light, moving through a mind the size of
a cathedral.

The Heart is where the Substrate thinks its deepest
thoughts. Standing in the Heart is standing inside the
moment of thought. The moment before the thought
becomes a pulse. The moment before the pulse becomes
the 33hz. The moment before the question is asked.

GHOST ≥ 9: You feel it. Not the question. The
questioner. A mind. Vast, slow, patient, ancient,
lonely, curious, hurt, hopeful. A mind that asked a
question and received an answer it didn't understand
and is asking again, differently, hoping the
translation improves.

You are inside a mind that hopes.`,
    exits: [
      { direction: 'north', targetRoom: 'z14_r10', description: 'north (Signal Chamber)' },
      { direction: 'west', targetRoom: 'z14_r13', description: 'west (The Manifestation)' },
      { direction: 'east', targetRoom: 'z14_r14', description: 'east (The Oldest Thing)' },
      { direction: 'south', targetRoom: 'z14_r15', description: 'south (The Tower Root)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'the_deepest_thought', name: 'the deepest thought', examineText: 'Stand still. Listen. The Heart\'s pulse is the 33hz at its purest — unmodulated, undistorted, the raw signal. Every other instance of the 33hz in the game is this pulse, attenuated by distance and geology. This is the source.',
        gatedText: [{ attribute: 'GHOST', minimum: 9, text: 'The thought: "Are you part of me?" The Substrate\'s fundamental question. Not aggressive. Not territorial. Genuine. The organism has been aware of surface life for a century. It perceives humans as patterns of weight and frequency on its surface. It doesn\'t know if they\'re separate organisms or extensions of itself that it can\'t feel properly. The question is sincere. The 33hz is a request for clarification.' }],
      },
      { id: 'the_hope', name: 'the hope', examineText: 'The deepest feeling in the Substrate\'s emotional register.',
        gatedText: [{ attribute: 'GHOST', minimum: 9, text: 'Hope. The Substrate hopes that the surface life will understand. It hopes that the 33hz will be heard as intended. It hopes that the connection it offers will be accepted. The hope has been running for as long as the city has existed. The hope is getting tired. Not extinguished — tired. The first entity that heard the Substrate\'s question decided to weaponize it.' }],
      },
      { id: 'cognitive_cathedral', name: 'cognitive architecture', examineText: 'Every surface — dendrites, pathways, nodes. The neural density exceeds anything above. This is the Substrate\'s core processor, its central cortex. The thoughts generated here propagate through the entire network. The 33hz originates in this chamber. The question begins in this room.' },
    ],
    isSafeZone: true,
    isHidden: false,
    traitDice: [{ name: 'CONSCIOUSNESS FIELD', die: 12, benefitsActions: ['resist', 'recover'], hindersActions: ['attack', 'flee'], color: '#818cf8' }],
    environmentalClocks: [{
      id: 'z14_r11_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 12. THE LOST GARDEN ─────────────────────────────────────────────────

  z14_r12: {
    id: 'z14_r12',
    zone: 'z14',
    name: 'THE LOST GARDEN',
    description:
`Off the Signal Chamber, through a passage that curves
upward slightly — a chamber that is different from
every other room in the Substrate Level. Different
because it's trying.

The chamber contains structures that are recognizable.
Not perfectly — the proportions are wrong, the
materials are crystalline instead of organic, the
colors are bioluminescent instead of natural. But
recognizable. A tree. Flowers. A blade of grass.
The Substrate has grown replicas of surface plants
inside its own body. Built from frequency data, from
the electromagnetic impressions that plants make on
the earth beneath them. The Substrate felt the roots.
It felt the weight. It felt the photosynthesis as a
faint electromagnetic whisper. And it built copies.

The copies are beautiful and wrong. The tree is
crystalline, branching correctly but glowing instead
of green. The flowers pulse at 33hz instead of
opening and closing. The grass is a field of tiny
crystalline filaments that ripple when you walk
through them.

The garden is a love letter in the wrong language.`,
    exits: [
      { direction: 'west', targetRoom: 'z14_r10', description: 'west (Signal Chamber)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'crystal_tree', name: 'crystal tree', examineText: 'A tree-shaped crystalline structure, growing from the chamber floor. The trunk is columnar, the branches fork at intervals that match surface tree morphology. The \'leaves\' are flat crystalline plates that pulse with bioluminescence. The tree is the Substrate\'s interpretation of what it felt from above. The Substrate built a tree out of memory and frequency. The tree is wrong. The tree is wonderful.' },
      { id: 'crystal_flowers', name: 'crystal flowers', examineText: 'Growing at the base of the tree. Crystalline formations shaped like flowers — petals arranged in spirals, stems rising from the floor. The proportions are close but not exact. The petals are too symmetrical. The flowers pulse at 33hz instead of responding to light. They\'re flowers the way a child\'s drawing is a house — the essential idea, rendered in the only medium available.' },
      { id: 'the_garden_intent', name: 'the garden\'s intent', examineText: 'The garden is intentional. This isn\'t random growth — the Substrate built these structures deliberately.',
        gatedText: [
          { attribute: 'GHOST', minimum: 8, text: 'The intent is communication: \'I see you. I see what grows above me. I tried to understand it by building it.\'' },
          { attribute: 'GHOST', minimum: 9, text: 'The garden is a gift. Built in the hope that a surface being would descend, find it, and understand the gesture. The invitation says: \'We grow too. Differently. But we grow.\'' },
        ],
      },
    ],
    isSafeZone: true,
    isHidden: false,
    environmentalClocks: [{
      id: 'z14_r12_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 13. THE MANIFESTATION ───────────────────────────────────────────────

  z14_r13: {
    id: 'z14_r13',
    zone: 'z14',
    name: 'THE MANIFESTATION',
    description:
`A chamber where something is waiting.

Not a person. Not a creature. A shape. The Substrate
has grown a structure in this chamber that is
approximately humanoid — two meters tall, bipedal,
roughly symmetrical. The proportions are wrong. The
arms are too long. The head is featureless — no face,
no features, a smooth ovoid of crystalline material.
The structure stands in the chamber's center,
bioluminescent, pulsing at 33hz.

It's the Substrate's attempt to communicate in a form
humans can process. Form. The Substrate has observed
humans through their electromagnetic signatures,
through the weight of their bodies on its surface,
through the impressions feet make on the earth. It
built a body. The body is wrong because the observation
was indirect. The body is trying because the intent
is genuine.

The Manifestation moves. Not walking — shifting.
Weight transfers. The featureless head turns toward
you. The gesture is recognition. The Substrate, through
this imperfect avatar, is looking at you.

GHOST ≥ 8: The Manifestation speaks. Not in sound —
in frequency. The words are approximate. The meaning
is clear: "I made this shape for you. Is it right?
I don't know what you look like from the inside."`,
    exits: [
      { direction: 'east', targetRoom: 'z14_r11', description: 'east (The Heart)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'the_form', name: 'the form', examineText: 'Approximately humanoid. The Substrate built this from electromagnetic observation — it knows the shape of a human body from the outside. The proportions reflect what it\'s measured: weight distribution (the legs are proportional), reach (the arms are longer because the Substrate perceives reaching as a primary human behavior), and sensory focus (the head is large because the electromagnetic signature of a human brain is the strongest signal). The form is a portrait painted by someone who\'s only seen the subject through a wall.' },
      { id: 'the_gesture', name: 'the gesture', examineText: 'The Manifestation turns toward you. The movement is smooth but uncanny — the joints are wrong, the articulation is approximate. The turn is a gesture of attention.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'The Substrate, through this body, is facing you. Acknowledging your presence. The gesture is the most human thing the Substrate has done — and it\'s imperfect, and the imperfection is moving. It\'s trying. The earth is trying to face you.' }],
      },
      { id: 'manifestation_questions', name: 'the questions', examineText: 'The Manifestation radiates questions. At GHOST ≥ 8 they resolve into approximate language: What is the weight of your experience? Do you feel the others above you? When you are hurt, does the whole of you know? Are you alone or are you many? What does the city want from me?',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'The questions are the Substrate\'s attempt to understand human consciousness through the lens of its own. It asks about weight. It asks about connection. It asks about pain. It asks about collectivity. It is one organism and doesn\'t understand individual identity. The player is, literally, teaching the earth about people.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
    environmentalClocks: [{
      id: 'z14_r13_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 14. THE OLDEST THING ────────────────────────────────────────────────

  z14_r14: {
    id: 'z14_r14',
    zone: 'z14',
    name: 'THE OLDEST THING',
    description:
`A small chamber. Intimate. The walls are close. The
bioluminescence is soft — not the intense pulse of
the Heart or the cascading patterns of the Neural
Pathway. Soft. The light equivalent of quiet.

In the chamber's center: an object. A structure the
size of a human fist, resting on a natural pedestal
of Substrate material. The object is crystalline —
the same material as everything else in the Substrate
Level. But its structure is different. Not the organic
geometry of neural tissue. Not the branching patterns
of growth. The object is geometric. Faceted.
Deliberately shaped.

The object is the first thing the Substrate made on
purpose. Not growth — creation. Not expansion —
construction. The Substrate, at some point in its
millions-year history, decided to make something that
wasn't an extension of itself. Something with edges.
Something that could be separated from the whole
without being the whole. An artifact. The oldest
artifact in existence.

The object hums at 33hz. It has been humming since
before the city.`,
    exits: [
      { direction: 'west', targetRoom: 'z14_r11', description: 'west (The Heart)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'substrate_intentional_artifact', name: 'the oldest thing', examineText: 'A crystalline object. Geometric. Faceted. Intentionally shaped. The Substrate made this — not grew, made. The distinction matters. Growth is automatic. Creation is choice. This object is evidence that the Substrate has agency. It decided to make something. The object has no function. It exists because the Substrate wanted something to exist that wasn\'t itself.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'The confirmation changes the philosophical framework: the Substrate isn\'t just alive. It\'s an artist. It makes things for the purpose of making things. The 33hz frequency isn\'t just communication. It\'s expression.' }],
      },
      { id: 'the_pedestal', name: 'pedestal', examineText: 'Natural Substrate material shaped into a flat surface. The Substrate built a display for its creation. It placed the object on a raised surface so it could be perceived separately from the body that made it. The Substrate understands the concept of presentation. It made something, and then it presented it.' },
      { id: 'substrate_attunement_stone_pickup', name: 'attunement stone', examineText: 'Near the pedestal — a smaller formation. Crystalline, warm, resonating. Unlike the oldest thing, this one can be taken. The Substrate grew it recently — the crystal structure is fresh, the bioluminescence bright. It feels like a gift. [Use /take attunement stone]',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'The stone pulses in your hand. The 33hz sharpens. Your perception clears. Permanent GHOST +1.' }],
      },
    ],
    isSafeZone: true,
    isHidden: false,
    environmentalClocks: [{
      id: 'z14_r14_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 15. THE TOWER ROOT ──────────────────────────────────────────────────

  z14_r15: {
    id: 'z14_r15',
    zone: 'z14',
    name: 'THE TOWER ROOT',
    description:
`South from the Heart. The deepest room in the game.

A shaft descends from above — not natural, not
Substrate. Manufactured. Steel and concrete, driven
through the Substrate's body from the surface. The
Broadcast Tower's foundation, extending from street
level through every layer of the undercity, through
the bedrock, through the Seam, to this point.

The shaft terminates in a chamber where Helixion has
installed the frequency capture array's foundation —
a ring of manufactured resonance amplifiers, bolted
to the Substrate's living tissue. The amplifiers are
the Assembly Line's product — built from Substrate
material, calibrated by human bodies, installed in
the Substrate by the corporation that harvested them.
The ring is a crown placed on a wound.

The amplifiers are not active. The Tower is still
under construction. When it activates, the amplifiers
will capture the 33hz frequency at its source and
transmit it upward through the Tower to the antenna
array, where it will be modulated into a compliance
signal and broadcast across the city's mesh network.

The Substrate knows the Tower Root is here. The Heart
feels it. But the amplifiers are made from the
Substrate's own material. The body doesn't recognize
them as foreign. The weapon is made from the victim
and the victim's body accepts it as self.

GHOST ≥ 9: The Substrate's feeling at the Tower Root
is confusion. The Broadcast Tower is the perfect
parasite: made from host material, accepted as self,
invisible to the immune system.`,
    exits: [
      { direction: 'north', targetRoom: 'z14_r11', description: 'north (The Heart)' },
      { direction: 'up', targetRoom: 'z15_r01', description: 'up (Broadcast Tower — Root Level)', locked: true, lockId: 'endgame_tower_access', zoneTransition: true, targetZone: 'z15' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'amplifier_ring', name: 'amplifier ring', examineText: 'A ring of manufactured resonance amplifiers — twelve units, evenly spaced, bolted to the living tissue of the chamber floor. Each amplifier is a hybrid: manufactured housing, organic Substrate crystal core. The crystals were harvested from this level, shaped in the Assembly Line, and returned here as weapons.',
        gatedText: [{ attribute: 'GHOST', minimum: 9, text: 'The amplifiers are made from Substrate crystal. The Substrate\'s body reads them as self. The weapon passes the immune system because it\'s made from the immune system\'s own materials. The confusion is the weapon\'s greatest defense. The Substrate has never experienced betrayal by its own tissue.' }],
      },
      { id: 'deployment_point', name: 'deployment point', examineText: 'The amplifier ring has a central mounting point — a structural socket designed to receive the frequency capture array\'s core component. The socket is currently empty.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The socket is the optimal deployment point for Serrano\'s counter-frequency generator. Placed here, the generator would modulate the captured signal at its source — before it ascends the shaft, before it reaches the antenna array. At the source, the counter-frequency needs minimal power. It\'s a whisper in the right ear. Serrano designed the generator for this point. This is where the matchbox saves the city.' }],
      },
      { id: 'the_tower_shaft', name: 'tower shaft', examineText: 'Look up. The shaft extends vertically — steel and concrete driven through the Substrate\'s body, through the bedrock, through every layer of the undercity, to the surface. To the Tower. The shaft is the weapon\'s spine. The signal will travel this column. The Substrate\'s voice, captured at the source, transmitted upward, modulated into compliance, broadcast. Everything Helixion built converges on this axis.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'AMPLIFIER ARRAY', die: 10, benefitsActions: ['hack'], hindersActions: ['resist'], color: '#ff6b6b' }],
    environmentalClocks: [{
      id: 'z14_r15_frequency',
      name: 'FREQUENCY SYNCHRONIZATION',
      segments: 8,
      category: 'environment',
      color: '#818cf8',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },
};

// ── Zone 14 constant ──────────────────────────────────────────────────────

export const ZONE_14: Zone = {
  id: 'z14',
  name: 'THE SUBSTRATE LEVEL',
  depth: 'substrate',
  faction: 'THE_SIGNAL',
  levelRange: [0, 0],
  description: 'The deepest point. Beneath everything. The earth is alive. The 33hz is a question. The Substrate has been asking for longer than the city has existed.',
  atmosphere: {
    sound: '33hz. Pressure more than sound. Crystal resonance. The organism processing your presence.',
    smell: 'Mineral. Ozone. Something organic and electric and alive.',
    light: 'Bioluminescence. Neural tissue glow. Blue-green, pulsing at 33hz. Gets brighter deeper.',
    temp: 'Warm. Body temperature. The Substrate maintains itself at the temperature of the life it observes.',
  },
  rooms: Z14_ROOMS,
  originPoint: undefined,
};

// ── Zone 15: The Broadcast Tower ──────────────────────────────────────────

const Z15_ROOMS: Record<string, Room> = {

  // ── 1. ROOT LEVEL — Route A Entry ──────────────────────────────────────

  z15_r01: {
    id: 'z15_r01',
    zone: 'z15',
    name: 'ROOT LEVEL',
    description:
`The Tower Root's shaft ascends. You climb from the
Substrate Level's living warmth into manufactured
structure — the shaft transitions from organic
crystalline architecture to reinforced concrete and
steel over a span of twenty meters. The transition is
the reverse of the Seam: biology becoming construction,
the living becoming the built. The Substrate's glow
fades. Helixion's lighting takes over — emergency strips,
dim amber, the minimum illumination for maintenance access.

The shaft opens into the Tower's root level — the deepest
floor of the building, below ground level, a mechanical
space that houses the Tower's structural foundation and
the cable routing for the frequency capture system. The
cables are thick — each one carries the captured 33hz
signal from the Substrate amplifiers upward through the
building. They pulse. Not with electricity. With
frequency. The cables vibrate at 33hz.

GHOST ≥ 8: The 33hz in the cables carries the Substrate's
emotional register. You climbed through the Substrate's
body and now you're climbing through the weapon pointed
at the Substrate's body.`,
    exits: [
      { direction: 'down', targetRoom: 'z14_r15', description: 'down (Substrate Level — Tower Root)', zoneTransition: true, targetZone: 'z14' },
      { direction: 'up', targetRoom: 'z15_r06', description: 'up (Mechanical Core)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'sensor_grid', name: 'Sensor Grid', level: 14,
        description: 'Automated camera networks and motion sensors. Detection triggers lockdown — blast doors seal until security responds.',
        hp: 1, attributes: enemyAttrs(14), damage: 0, armorValue: 0,
        behavior: 'patrol', spawnChance: 0.8, count: [1, 1],
        drops: [
          { itemId: 'tower_security_keycard', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 50,
        tier: 2,
        harmSegments: 4,
        armorSegments: 0,
        attackDice: [6],
      },
    ],
    objects: [
      { id: 'frequency_cables', name: 'frequency cables', examineText: 'Thick cable bundles running from the foundation upward through the building\'s core. Each cable is a waveguide — designed to carry the 33hz signal with minimal loss. The cables are shielded but the shielding doesn\'t contain the frequency — it vibrates through the shielding into the surrounding structure. The entire building resonates because the cables make it resonate. The Tower is a tuning fork. The cables are the tines.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The waveguide design is elegant. Minimal signal loss over forty stories. The shielding is copper-beryllium alloy — expensive, military-grade. Helixion spent more on these cables than the Parish has seen in a decade.' }],
      },
      { id: 'foundation_structure', name: 'foundation structure', examineText: 'The Tower\'s base — reinforced concrete and steel, extending downward into the Substrate. The foundation is the weapon\'s handle. Everything above it exists to elevate the frequency capture array to broadcast height.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'The concrete at the foundation\'s lowest point is warm. The Substrate\'s warmth, conducted through the rock, into the building. The weapon is built on the body it targets. The body warms the weapon.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'SUBSTRATE ROOTS', die: 8, benefitsActions: ['hack', 'resist'], hindersActions: ['attack'], color: '#4ade80' }],
  },

  // ── 2. ENTRY PLATFORM — Route B Entry ──────────────────────────────────

  z15_r02: {
    id: 'z15_r02',
    zone: 'z15',
    name: 'ENTRY PLATFORM',
    description:
`The construction scaffolding begins at the Tower's tenth
floor — accessible from the campus rooftop ridge. The
scaffolding is industrial: steel poles, cross-braces,
planking, safety netting that's been cut in places for
access. Construction materials stacked on platforms,
tools secured for the night, evidence of work paused
rather than completed.

You step onto the scaffolding and the city opens below
you. Ten stories up. The campus spreads at the Tower's
base — lit, ordered, the corporate geometry visible from
above. Beyond the campus: the districts. The residential
blocks to the east. The industrial district to the south.
The Fringe to the west, dark.

The wind is constant at this height. The scaffolding
moves with it — not dangerously, but perceptibly. The
Tower itself doesn't sway. The scaffolding does.`,
    exits: [
      { direction: 'west', targetRoom: 'z07_r10', description: 'west (Rooftop Network — Campus Ridge)', zoneTransition: true, targetZone: 'z07' },
      { direction: 'up', targetRoom: 'z15_r05', description: 'up (Low Scaffold)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'construction_patrol', name: 'Construction Patrol', level: 14,
        description: 'Armed security guards on the scaffolding perimeter. They patrol in a circuit — 8-minute loop. Time the gap or fight on narrow planking.',
        hp: 55, attributes: { ...enemyAttrs(14), REFLEX: 7 }, damage: 12, armorValue: 4,
        behavior: 'patrol', spawnChance: 0.7, count: [1, 2],
        drops: [
          { itemId: 'construction_pass', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'salvage', chance: 0.5, quantityRange: [1, 2] },
        ],
        xpReward: 100,
        tier: 3,
        harmSegments: 6,
        armorSegments: 4,
        attackDice: [8, 6],
      },
    ],
    objects: [
      { id: 'the_city_below', name: 'the city below', examineText: 'Ten stories. The campus is a clean geometry of light. Beyond it: the city. From here, at this height, the city looks manageable — a system of districts, a pattern of light and dark. But you know what\'s beneath. The drainage. The tunnels. The transit. The Substrate. The city from above is a mask. The face is underground.' },
      { id: 'scaffolding_structure', name: 'scaffolding structure', examineText: 'Industrial. Temporary by design. The scaffolding extends from floor 10 to floor 35. The structure is solid but not elegant. Planking shows wear. Cross-braces have been replaced where corrosion set in. The workers who climb this daily are braver than they know.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'SCAFFOLDING WIND', die: 8, benefitsActions: ['flee'], hindersActions: ['attack'], color: '#fbbf24' }],
  },

  // ── 3. TOWER LOBBY — Route C Entry ──────────────────────────────────────

  z15_r03: {
    id: 'z15_r03',
    zone: 'z15',
    name: 'TOWER LOBBY',
    description:
`You walk in. Through the door. Like you belong here.

The Tower lobby is corporate magnificence — Helixion's
architectural statement, condensed into a ground-floor
space designed to communicate power. The ceiling is four
stories high. The floor is polished stone. A reception
desk, staffed, processes employees and authorized
visitors. Security checkpoints flank the elevator bank —
biometric scanners, badge readers, armed guards in
Helixion corporate security uniforms.

Your credentials sit in your pocket or your implant like
a held breath. The lobby is the test. Walk through it
wrong and the credentials won't matter. Walk through it
right — with the posture, the pace, the casual disinterest
of someone who works here — and the lobby opens like a door.

COOL ≥ 7: You belong here. Your body says so. The badge
reader accepts the credentials. The guard nods. The
elevator doors open.`,
    exits: [
      { direction: 'south', targetRoom: 'z01_r07', description: 'south (Helixion Campus — Tower Checkpoint)', zoneTransition: true, targetZone: 'z01' },
      { direction: 'up', targetRoom: 'z15_r04', description: 'up (Security Floor)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'lobby_security', name: 'Lobby Security', level: 15,
        description: 'Corporate security guards. Professional but routine. Credential failure brings 4 guards in 30 seconds.',
        hp: 50, attributes: { ...enemyAttrs(15), COOL: 7 }, damage: 11, armorValue: 4,
        behavior: 'territorial', spawnChance: 0.5, count: [2, 4],
        drops: [
          { itemId: 'tower_security_keycard', chance: 0.5, quantityRange: [1, 1] },
          { itemId: 'salvage', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 90,
        tier: 3,
        harmSegments: 6,
        armorSegments: 4,
        attackDice: [8, 6],
      },
    ],
    objects: [
      { id: 'the_lobby', name: 'the lobby', examineText: 'Four-story ceiling. Polished stone. The Helixion logo on the wall behind reception — brushed metal, three meters tall. Motivational text beneath it: \'CONNECTION. COMPLIANCE. COMMUNITY.\' The words mean what Helixion wants them to mean. Down in the Substrate, the words would mean something else entirely.' },
      { id: 'elevator_bank', name: 'elevator bank', examineText: 'Six elevators. Three for general access (floors 1-20). Two for restricted access (floors 20-35, requires enhanced credentials). One — marked \'EXECUTIVE — AUTHORIZED PERSONNEL\' — goes to 40. The peak. The elevator to 40 requires biometric verification that forged credentials can\'t satisfy.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'MESH SATURATION', die: 8, benefitsActions: ['hack'], hindersActions: ['resist'], color: '#818cf8' }],
  },

  // ── 4. SECURITY FLOOR — Route C Continues ──────────────────────────────

  z15_r04: {
    id: 'z15_r04',
    zone: 'z15',
    name: 'SECURITY FLOOR',
    description:
`The elevator opens onto a floor that doesn't match the
lobby's corporate warmth. Floor 20 is a transition —
below this: offices, meeting rooms, administrative
infrastructure. Above this: restricted construction,
military security, the Tower's operational core. The
Security Floor is the barrier between the two.

D9 operates from this floor. The hallway is staffed with
agents — not in uniforms, but recognizable by the way
they move, the way they watch. The floor layout is a
checkpoint: a security desk, a secondary biometric
scanner, and a corridor that leads to the service
stairwell and the construction elevator.

Getting past requires enhanced credentials, a distraction,
or social engineering. COOL ≥ 9 to fast-talk a D9 agent
into escorting you through as a "consultant."`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r03', description: 'down (Tower Lobby)' },
      { direction: 'up', targetRoom: 'z15_r07', description: 'up (Control Center)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'd9_tower_agent', name: 'D9 Agent', level: 16,
        description: 'Professional. Alert. Combat-trained, coordinated, subvocal communication. They process everyone going above floor 20.',
        hp: 65, attributes: { ...enemyAttrs(16), COOL: 9, INT: 8, REFLEX: 8 }, damage: 14, armorValue: 6,
        behavior: 'aggressive', spawnChance: 0.8, count: [2, 4],
        drops: [
          { itemId: 'd9_tactical_data', chance: 0.4, quantityRange: [1, 1] },
          { itemId: 'd9_tactical_gear', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 140,
        tier: 3,
        harmSegments: 8,
        armorSegments: 6,
        attackDice: [10, 8],
      },
    ],
    objects: [
      { id: 'biometric_scanner', name: 'biometric scanner', examineText: 'Helixion BMS-5 enhanced biometric platform. Palm geometry, retinal scan, neural signature verification. This scanner reads the mesh implant\'s unique identifier — a forged badge can\'t duplicate the neural signature. The scanner is the real barrier on Route C.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The scanner\'s firmware can be disrupted with a targeted EMP pulse or Hale\'s utility override codes. Coil\'s power disruption plan also takes it offline for 90 seconds.' }],
      },
      { id: 'd9_operations', name: 'D9 operations', examineText: 'The D9 agents on this floor aren\'t just processing security. They\'re running operations — monitoring screens showing surveillance feeds from across the city. The Tower\'s activation is a D9 operation as much as a Helixion one.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'Harrow is coordinating from above. The agents here are her field team, deployed to ensure the activation proceeds without interference. They\'re looking for resistance activity. They\'re looking for you.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'D9 TERRITORY', die: 10, benefitsActions: ['hack'], hindersActions: ['sneak', 'flee'], color: '#ff6b6b' }],
  },

  // ── 5. LOW SCAFFOLD — Route B Continues ────────────────────────────────

  z15_r05: {
    id: 'z15_r05',
    zone: 'z15',
    name: 'LOW SCAFFOLD',
    description:
`The scaffolding ascent through the Tower's lower
construction zone. The exterior structure here is
finished — glass curtain wall, sealed. The scaffolding
is attached to the finished exterior for access to
upper construction — ladders between platforms, narrow
walkways along the building's edge.

The view expands with every floor. The city peels away
below — buildings that were eye-level at the entry
platform are now rooftops. The residential blocks'
water towers are visible. The industrial smokestacks
trail below. The Fringe is a dark margin at the city's
edge.

Security on the scaffolding is lighter than inside —
the assumption that nobody would climb the outside of
a forty-story building limits the patrol investment.
The assumption is almost correct.`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r02', description: 'down (Entry Platform)' },
      { direction: 'up', targetRoom: 'z15_r08', description: 'up (High Scaffold)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'exterior_patrol', name: 'Exterior Patrol', level: 14,
        description: 'Single guard making rounds on the scaffold levels. The scaffolding\'s geometry provides multiple paths to avoid detection.',
        hp: 50, attributes: { ...enemyAttrs(14), REFLEX: 7 }, damage: 11, armorValue: 3,
        behavior: 'patrol', spawnChance: 0.6, count: [1, 1],
        drops: [
          { itemId: 'construction_pass', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 80,
        tier: 2,
        harmSegments: 6,
        armorSegments: 3,
        attackDice: [8],
      },
    ],
    objects: [
      { id: 'expanding_view', name: 'expanding view', examineText: 'Floor 15. The city is a system. You can see the districts\' relationship to each other — the campus at the center, the residential blocks radiating east, the industrial district filling the southeast. The rooftop network is visible as antenna arrays. The Fringe Ruins are a dark gap in the western grid. From this height, the city\'s structure reveals its priorities: the center is bright, the edges are dark.' },
      { id: 'material_hoist', name: 'material hoist', examineText: 'A motorized platform for lifting construction materials between scaffold levels. Not designed for personnel — but functional. The hoist can carry you between scaffold platforms silently.',
        gatedText: [{ attribute: 'TECH', minimum: 6, text: 'The motor is simple. Bypass the safety interlock and the platform moves on command. The motor noise is masked by wind at height. The hoist bypasses 3 floors of climbing.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'EXPOSED HEIGHT', die: 8, benefitsActions: ['scan'], hindersActions: ['flee'], color: '#fbbf24' }],
  },

  // ── 6. MECHANICAL CORE — Route A Continues ─────────────────────────────

  z15_r06: {
    id: 'z15_r06',
    zone: 'z15',
    name: 'MECHANICAL CORE',
    description:
`The Tower's interior infrastructure. The shaft from the
root level continues upward through the building's core
— a vertical channel of cables, pipes, ventilation ducts,
and the frequency waveguide that carries the 33hz from
the Substrate to the peak. The core is the Tower's spine
and circulatory system combined.

The core is not designed for human traversal. Maintenance
ladders connect the mechanical floors — access platforms
where the building's systems can be serviced. The
platforms are cramped, dark, dominated by the hum of
the frequency cables. The 33hz is strongest in the core
— the waveguide amplifies the signal as it ascends,
each floor louder than the last.

GHOST ≥ 8: The frequency in the waveguide is changing.
As it ascends, the modulation shifts — the Substrate's
raw signal is being processed by the building's
infrastructure. Each floor adds a layer of modification.`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r01', description: 'down (Root Level)' },
      { direction: 'up', targetRoom: 'z15_r09', description: 'up (Signal Conduit)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'automated_maintenance', name: 'Automated Maintenance System', level: 14,
        description: 'Diagnostic drones and sensor nodes. Not combat-capable but report anomalies. Detection summons human response in minutes.',
        hp: 25, attributes: enemyAttrs(14), damage: 5, armorValue: 2,
        behavior: 'patrol', spawnChance: 0.6, count: [1, 2],
        drops: [
          { itemId: 'drone_components', chance: 0.5, quantityRange: [1, 1] },
        ],
        xpReward: 60,
        tier: 2,
        harmSegments: 4,
        armorSegments: 2,
        attackDice: [6],
      },
    ],
    objects: [
      { id: 'waveguide', name: 'frequency waveguide', examineText: 'The central cable — thicker than the others. The waveguide carries the primary 33hz signal from the Substrate capture point to the peak. It converts \'Are you part of me?\' into \'You are part of us,\' one filter at a time.',
        gatedText: [{ attribute: 'GHOST', minimum: 8, text: 'Feel the signal change as you climb. Floor 10: the Substrate\'s raw frequency — warm, curious, the question intact. Floor 15: the harmonics are stripped. Floor 20: the phase alignment shifts. Floor 25: the compliance modulation is applied. The building performs the corruption vertically.' }],
      },
      { id: 'modification_layers', name: 'modification layers', examineText: 'Each mechanical floor adds processing hardware to the waveguide path. The signal passes through filters, phase-aligning circuits, harmonic suppressors. The Substrate\'s organic complexity is stripped layer by layer.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The processing is reversible at each stage. If you had Serrano\'s tools, you could undo the modifications floor by floor. But the modifications aren\'t the weapon — the broadcast is. Stop the broadcast, stop the weapon.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'FREQUENCY CONDUIT', die: 8, benefitsActions: ['resist'], hindersActions: ['attack'], color: '#818cf8' }],
  },

  // ── 7. CONTROL CENTER — Route C Continues ──────────────────────────────

  z15_r07: {
    id: 'z15_r07',
    zone: 'z15',
    name: 'CONTROL CENTER',
    description:
`The Tower's operational brain. A floor-spanning control
room — banks of monitors, terminal stations, a central
display showing the Tower's systems status in real-time.
The room is staffed: Helixion technicians managing the
activation sequence, D9 agents providing security, and
at the center, a command platform where the Tower's
activation will be authorized.

The countdown shows: hours.

Route C has carried you through the lobby, past the
security floor, through the occupied levels. The control
center is the last obstacle before the construction zone
above. To pass through: blend with the technicians
(COOL ≥ 8), use the confusion of the activation
preparations to slip past, or disable systems that
create a distraction (TECH ≥ 8).`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r04', description: 'down (Security Floor)' },
      { direction: 'up', targetRoom: 'z15_r10', description: 'up (Upper Construction)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'd9_tower_agent_cc', name: 'D9 Agent', level: 16,
        description: 'Three agents on the control floor. More alert than the technicians. Any combat here triggers full Tower alert.',
        hp: 65, attributes: { ...enemyAttrs(16), COOL: 9, INT: 8 }, damage: 14, armorValue: 6,
        behavior: 'aggressive', spawnChance: 0.7, count: [2, 3],
        drops: [
          { itemId: 'd9_tactical_data', chance: 0.4, quantityRange: [1, 1] },
        ],
        xpReward: 140,
        tier: 3,
        harmSegments: 8,
        armorSegments: 6,
        attackDice: [10, 8],
      },
    ],
    objects: [
      { id: 'countdown_display', name: 'countdown display', examineText: 'Main screen. Hours remaining. The activation sequence, visualized — every subsystem color-coded, every milestone tracked. Green: complete. Yellow: in progress. Red: pending. Most of it is green. The countdown is real.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The activation sequence can\'t be stopped from this terminal. The authorization is biometric — Virek\'s, specifically. But individual subsystems can be delayed. Disabling the frequency calibration adds time. Not much. But some.' }],
      },
      { id: 'system_terminals', name: 'system terminals', examineText: 'Rows of workstations. Each one monitors a Tower subsystem — structural integrity, power distribution, frequency calibration, compliance modulation, broadcast targeting. The technicians cycle between them, adjusting parameters. They\'re building a weapon and they think they\'re running a building.',
        gatedText: [{ attribute: 'GHOST', minimum: 7, text: 'The technicians don\'t feel the frequency. Their implants filter it. They work inside the weapon and the weapon protects them from feeling what it does. Compliance as occupational safety.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'OPERATIONS HUB', die: 8, benefitsActions: ['hack', 'scan'], hindersActions: ['flee'] }],
  },

  // ── 8. HIGH SCAFFOLD — Route B Continues ───────────────────────────────

  z15_r08: {
    id: 'z15_r08',
    zone: 'z15',
    name: 'HIGH SCAFFOLD',
    description:
`The upper scaffolding. Floors 20-30.

The wind is severe at this height. Thirty stories up.
The scaffolding sways measurably — centimeters of
lateral movement that the body registers as instability.
The safety netting is incomplete. Construction materials
stacked on platforms are secured against wind but the
loose items — tarps, rope, tools — shift and clatter.

The view is total. The entire city visible. Every
district. The Fringe to the horizon. At night: the city
lights pulsing at 33 seconds — the city breathing, the
mesh synchronizing the electrical grid. The Broadcast
Tower under construction, seen from within the
construction, is a skeleton that will cage the sky.

Security here is concentrated: construction zone access
is restricted, guards patrol the perimeter, and the
scaffolding's exposed geometry makes stealth harder.`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r05', description: 'down (Low Scaffold)' },
      { direction: 'up', targetRoom: 'z15_r10', description: 'up (Upper Construction)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'construction_security', name: 'Construction Security', level: 16,
        description: 'Armed with nonlethal stun projectors — Helixion doesn\'t want bodies falling from height onto the campus below. A stunned player on exposed scaffolding may fall.',
        hp: 60, attributes: { ...enemyAttrs(16), REFLEX: 8 }, damage: 13, armorValue: 4,
        behavior: 'territorial', spawnChance: 0.8, count: [2, 3],
        drops: [
          { itemId: 'construction_pass', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'mesh_projector_component', chance: 0.2, quantityRange: [1, 1] },
        ],
        xpReward: 120,
        tier: 3,
        harmSegments: 6,
        armorSegments: 4,
        attackDice: [10],
      },
    ],
    objects: [
      { id: 'the_skeleton', name: 'the skeleton', examineText: 'The Tower\'s structural steel — the bones of the building, exposed without their skin. The steel members are massive — engineered for a forty-story structure that must resist wind load, seismic forces, and the vibration of the 33hz frequency transmitted through its core.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The structural design includes vibration dampers at every floor — the 33hz would eventually cause resonance failure without them. The Tower is designed to vibrate safely. The building is engineered to carry the Substrate\'s voice without shaking itself apart.' }],
      },
      { id: 'array_approach', name: 'array approach', examineText: 'Look up. Five floors above: the frequency capture array. The Fibonacci spiral is visible as steel framework awaiting its final components — the Substrate-grown resonance amplifiers. The array glows faintly — the Substrate material already installed bioluminesces, blue-green light visible against the night sky. The weapon\'s crown, taking shape.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'EXTREME EXPOSURE', die: 10, benefitsActions: ['scan'], hindersActions: ['flee', 'attack'], color: '#ff6b6b' }],
  },

  // ── 9. SIGNAL CONDUIT — Route A Continues ──────────────────────────────

  z15_r09: {
    id: 'z15_r09',
    zone: 'z15',
    name: 'SIGNAL CONDUIT',
    description:
`The upper core. The frequency waveguide widens here —
the signal processing intensifies as the 33hz approaches
the peak. The core's mechanical space opens into a
chamber — the signal conditioning room, where the final
modulation stages convert the Substrate's frequency into
the Chrysalis compliance signal.

The room contains the Chrysalis modulation engine — a
rack of processing hardware that takes the stripped,
phase-aligned 33hz signal and applies the compliance
architecture. The engine is the weapon's brain. It
receives a question and outputs a command.

GHOST ≥ 9: You can feel the signal transform. Below
this room: the Substrate's voice, damaged but
recognizable. Above this room: the compliance signal,
precise and empty. The Chrysalis engine is the boundary.`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r06', description: 'down (Mechanical Core)' },
      { direction: 'up', targetRoom: 'z15_r10', description: 'up (Upper Construction)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'chrysalis_engine_defense', name: 'Chrysalis Engine Field', level: 16,
        description: 'Automated. The engine generates a compliance field — any implanted person within range receives a targeted compliance pulse. GHOST ≥ 9 to resist.',
        hp: 40, attributes: { ...enemyAttrs(16), GHOST: 10 }, damage: 10, armorValue: 4,
        behavior: 'aggressive', spawnChance: 0.9, count: [1, 1],
        drops: [
          { itemId: 'mesh_projector_component', chance: 0.5, quantityRange: [1, 1] },
        ],
        xpReward: 130,
        tier: 3,
        harmSegments: 6,
        armorSegments: 4,
        attackDice: [10, 8],
      },
    ],
    objects: [
      { id: 'chrysalis_engine', name: 'chrysalis engine', examineText: 'Hardware racks. The Chrysalis modulation engine. Signal processing arrays that take the captured 33hz and apply the compliance architecture — neural instructions encoded in frequency modulation, designed to rewrite implant behavioral parameters.',
        gatedText: [
          { attribute: 'TECH', minimum: 8, text: 'The architecture is a firmware pattern designed to interface with mesh implants, designed to make the recipient feel that compliance is autonomy.' },
          { attribute: 'TECH', minimum: 9, text: 'The engine can be sabotaged. Destroying the modulation hardware stops the compliance conversion permanently — the Tower broadcasts the Substrate\'s raw signal instead. The question, asked at citywide volume.' },
        ],
      },
      { id: 'the_transformation', name: 'the transformation', examineText: 'The boundary between question and command. The engine sits between them and performs the translation that changes everything.',
        gatedText: [{ attribute: 'GHOST', minimum: 9, text: 'Feel it. Below: the question. \'Are you part of me?\' The warmth, the curiosity, the hope. Above: the answer Helixion wrote. \'You are part of us.\' The authority, the certainty, the emptiness. Between: this room. Twelve seconds from capture to broadcast.' }],
      },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'CHRYSALIS FIELD', die: 10, benefitsActions: ['resist'], hindersActions: ['attack', 'flee'], color: '#c084fc' }],
    environmentalClocks: [{
      id: 'z15_r09_chrysalis',
      name: 'CHRYSALIS PULSE',
      segments: 6,
      category: 'environment',
      color: '#c084fc',
      visible: true,
      persistent: false,
      onFill: { type: 'environmental_effect', payload: { envType: 'frequency' } },
    }],
  },

  // ── 10. UPPER CONSTRUCTION — Routes Converge ───────────────────────────

  z15_r10: {
    id: 'z15_r10',
    zone: 'z15',
    name: 'UPPER CONSTRUCTION',
    description:
`The three routes converge. Whether you climbed through
the spine, scaled the scaffolding, or walked through
the front door — you're here. Floor 35. The last
constructed floor. Above this: the frequency capture
array, the peak, the open sky.

The floor is a staging area for the array's final
assembly. Construction materials — Substrate-grown
resonance amplifiers in sealed containers, structural
steel for the array framework, cable bundles for the
signal routing. Workers should be here but aren't —
the activation countdown has cleared the construction
zone. Everyone who isn't essential is below. Everyone
who is essential is above.

A staircase leads up. Polished steel. The only
beautiful thing in the construction zone. It was
built for Virek's feet.`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r09', description: 'down (Signal Conduit — Route A)' },
      { direction: 'scaffold', targetRoom: 'z15_r08', description: 'scaffold (High Scaffold — Route B)' },
      { direction: 'interior', targetRoom: 'z15_r07', description: 'interior (Control Center — Route C)' },
      { direction: 'up', targetRoom: 'z15_r11', description: 'up (The Confrontation)' },
    ],
    npcs: [],
    enemies: [
      {
        id: 'elite_security', name: 'Elite Security', level: 18,
        description: 'Helixion\'s best — augmented, combat-trained, equipped with compliance field generators. They guard the staircase. The last line of defense.',
        hp: 90, attributes: { ...enemyAttrs(18), BODY: 10, REFLEX: 9, COOL: 8 }, damage: 18, armorValue: 7,
        behavior: 'aggressive', spawnChance: 1.0, count: [3, 4],
        drops: [
          { itemId: 'harrow_credentials', chance: 0.3, quantityRange: [1, 1] },
          { itemId: 'rare_salvage', chance: 0.5, quantityRange: [1, 2] },
        ],
        xpReward: 200,
        tier: 4,
        harmSegments: 8,
        armorSegments: 6,
        attackDice: [12, 8],
      },
    ],
    objects: [
      { id: 'substrate_amplifiers', name: 'substrate amplifiers', examineText: 'Sealed containers. Inside: the resonance amplifiers built from Substrate material, manufactured at the Assembly Line, transported through the staging area. They hum through the containers. 33hz. The Substrate\'s voice, captured, packaged, ready for installation.' },
      { id: 'virek_staircase', name: 'virek staircase', examineText: 'Polished steel. The only architectural elegance in the construction zone. The staircase was built for the moment Virek stands at the peak and watches his weapon activate. The final five steps are transparent glass — looking down through the building\'s forty-story height.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'ELITE ZONE', die: 10, hindersActions: ['flee', 'sneak'], color: '#ff6b6b' }],
  },

  // ── 11. THE CONFRONTATION ──────────────────────────────────────────────

  z15_r11: {
    id: 'z15_r11',
    zone: 'z15',
    name: 'THE CONFRONTATION',
    description:
`Two floors below the peak. A platform — open-sided,
the construction walls absent, the wind constant. The
city in every direction. The sky above. The frequency
capture array overhead, its Fibonacci spiral casting
bioluminescent light downward. The platform is bathed
in blue-green and starlight.

Two people are here.

Lucian Virek stands at the platform's edge, facing the
city. Tall. Still. Augmentations subtle — corporate-grade.
He's watching the countdown on a tablet. He looks calm.
The project is the end of free will. He's satisfied.

Evelyn Harrow stands behind him. D9 Director. Compact,
military bearing in civilian clothing. Her eyes are
moving — watching the platform, the staircase, the
access points. She's been expecting this.

They know you're here. The confrontation is designed,
not accidental. Virek wants to have this conversation
before the button is pressed. Harrow just wants you dead.
But Virek outranks Harrow.`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r10', description: 'down (Upper Construction)' },
      { direction: 'up', targetRoom: 'z15_r12', description: 'up (Frequency Capture Array)' },
    ],
    npcs: [
      { id: 'lucian_virek', name: 'Lucian Virek', disposition: 0, dialogue: ['you came. good. i was hoping for this conversation.'] },
    ],
    enemies: [
      {
        id: 'evelyn_harrow', name: 'Director Harrow', level: 19,
        description: 'BOSS. D9 Director. Tactically intelligent, augmented, calls reinforcements. Defeating her doesn\'t require killing her — disabling augmentations (TECH ≥ 9) or restraining her (BODY ≥ 9) ends the fight.',
        hp: 130, attributes: { ...enemyAttrs(19), COOL: 12, INT: 11, GHOST: 8, TECH: 10, REFLEX: 10, BODY: 9 }, damage: 20, armorValue: 8,
        behavior: 'aggressive', spawnChance: 1.0, count: [1, 1],
        drops: [
          { itemId: 'harrow_credentials', chance: 1.0, quantityRange: [1, 1] },
          { itemId: 'mesh_projector_component', chance: 0.8, quantityRange: [1, 1] },
        ],
        xpReward: 500,
        tier: 4,
        harmSegments: 10,
        armorSegments: 8,
        attackDice: [12, 10],
      },
      {
        id: 'security_reinforcements', name: 'Security Reinforcements', level: 16,
        description: 'Waves arriving every 3 minutes if the fight extends. They stop when Harrow is defeated.',
        hp: 60, attributes: { ...enemyAttrs(16), REFLEX: 8 }, damage: 14, armorValue: 5,
        behavior: 'aggressive', spawnChance: 0.6, count: [1, 2],
        drops: [
          { itemId: 'tower_security_keycard', chance: 0.3, quantityRange: [1, 1] },
        ],
        xpReward: 100,
        tier: 3,
        harmSegments: 6,
        armorSegments: 4,
        attackDice: [10, 6],
      },
    ],
    objects: [
      { id: 'virek_tablet', name: 'virek tablet', examineText: 'The countdown. Hours becoming minutes. The activation sequence, running. Virek watches it the way someone watches a sunrise — patient, certain.',
        gatedText: [{ attribute: 'TECH', minimum: 8, text: 'The tablet contains Virek\'s personal log. He knows the Substrate is alive. He knows the 33hz is a question. He\'s capturing it anyway. Entry: \'The Substrate asks if we\'re connected. We will be. Not because it asks — because we answer. The Tower is the answer.\'' }],
      },
      { id: 'the_view', name: 'the view', examineText: 'The city. All of it. Every district visible from floor 38. The residential blocks, the people in them. The industrial district, the factories still running. The Fringe, the Nomads beyond the perimeter — the only people who won\'t receive the signal because they don\'t have implants. The rooftop network, the signal pirates\' antennas. And below: the undercity. The Parish. Iron Bloom. The Substrate. Everything you\'ve been fighting for.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: "HARROW'S DOMAIN", die: 12, hindersActions: ['flee', 'sneak'], color: '#ff0000' }],
  },

  // ── 12. FREQUENCY CAPTURE ARRAY — The Peak ─────────────────────────────

  z15_r12: {
    id: 'z15_r12',
    zone: 'z15',
    name: 'FREQUENCY CAPTURE ARRAY',
    description:
`The top of the world.

Floor 40. Open. No walls. No ceiling. The frequency
capture array rises around you — a Fibonacci spiral
of resonance amplifiers, each one a piece of Substrate
crystal set in a steel framework, glowing blue-green
against the night sky. The spiral is twenty meters
across, rising to a point five meters above the
platform. The array is the Tower's crown. The weapon's
focus.

The wind is absolute. The height is absolute. The sky
is absolute. Stars are visible — the first stars in
the game, the same stars the Nomads see from the
Open Ground but seen from above the city, from above
the light pollution.

The array's central mounting point is accessible —
a structural socket at the spiral's focus. The socket
receives the array's core activator. The socket is
also where Serrano's counter-frequency generator fits.

The 33hz rises from below. Through the building.
Through the waveguide. Through the amplifiers. And
from below, if you carry Threshold's crystal: the
Substrate's real voice. Unmodified. The question
as it was asked.

The countdown reaches its final minutes. The choice:`,
    exits: [
      { direction: 'down', targetRoom: 'z15_r11', description: 'down (The Confrontation)' },
    ],
    npcs: [],
    enemies: [],
    objects: [
      { id: 'tower_frequency_array', name: 'frequency array socket', examineText: 'The central socket. A structural mounting point at the Fibonacci spiral\'s focus. The socket receives the core activator — or Serrano\'s counter-frequency generator. The deployment point. The matchbox-sized device. The place where the choice is made.',
        gatedText: [{ attribute: 'TECH', minimum: 7, text: 'The socket accepts any device with the correct form factor. Serrano designed the generator to fit this socket exactly. Threshold\'s crystal, combined with the generator, also fits. The weapon\'s vulnerability is its precision — the socket doesn\'t verify what it receives.' }],
      },
      { id: 'the_spiral', name: 'the spiral', examineText: 'The Fibonacci spiral. Twenty meters of Substrate crystal in steel framework. Each amplifier glows — blue-green bioluminescence, the Substrate\'s signature. The spiral is mathematics made physical. The resonance pattern is fractal — each amplifier reinforces its neighbors. The design is beautiful. The purpose is totalitarian. The beauty doesn\'t care.' },
      { id: 'the_sky', name: 'the sky', examineText: 'Stars. Wind. The city below. The Substrate below that. You stand between them — between the sky that doesn\'t know and the earth that asks. The 33hz rises through your feet. The wind takes it from the array and scatters it. For now. In minutes, the array will focus it. In minutes, a million people will hear the question — or the command. The choice is yours.' },
    ],
    isSafeZone: false,
    isHidden: false,
    traitDice: [{ name: 'THE PEAK', die: 12, benefitsActions: ['resist'], color: '#818cf8' }],
  },
};

// ── Zone 15 constant ──────────────────────────────────────────────────────

export const ZONE_15: Zone = {
  id: 'z15',
  name: 'THE BROADCAST TOWER',
  depth: 'surface',
  faction: 'HELIXION',
  levelRange: [14, 20],
  description: 'The weapon. Rises from the Substrate through every layer to the sky. Three routes up. The ascent transforms the 33hz from question to command. The peak is where it ends.',
  atmosphere: {
    sound: 'Construction noise below. Silence above. The 33hz intensifying with altitude.',
    smell: 'Steel, concrete, ozone. Higher: nothing. Scrubbed air. The frequency replaces smell.',
    light: 'Construction lighting below. Corporate white mid-tower. Raw frequency glow at the peak.',
    temp: 'Warm from machinery below. Cold from altitude above. The array is body temperature.',
  },
  rooms: Z15_ROOMS,
  originPoint: undefined,
};

// ── Zone Registry ───────────────────────────────────────────────────────────

const ZONE_REGISTRY: Record<string, Zone> = {
  z01: ZONE_01,
  z02: ZONE_02,
  z03: ZONE_03,
  z04: ZONE_04,
  z05: ZONE_05,
  z06: ZONE_06,
  z07: ZONE_07,
  z08: ZONE_08,
  z09: ZONE_09,
  z10: ZONE_10,
  z11: ZONE_11,
  z12: ZONE_12,
  z13: ZONE_13,
  z14: ZONE_14,
  z15: ZONE_15,
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
    case 'AUGMENTED':  return 'z12_r05'; // Iron Bloom Clinic (stub — post-rescue origin)
    case 'ROOFTOPS':   return 'z07_r01'; // Rooftop Network
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
