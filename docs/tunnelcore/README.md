# TUNNELCORE

### World Design Bible — N1X.sh Multiplayer Dungeon System

> *“The signal persists. What it means depends on what you did with it.”*

-----

## What This Is

TUNNELCORE is the complete world design documentation for a persistent, multiplayer text dungeon built on the [N1X.sh](https://n1x.sh) substrate. The game is a browser-based MUD (Multi-User Dungeon) set in a cyberpunk city controlled by Helixion Dynamics Corporation, accessible through N1X’s ghost channel terminal after a player reaches trust level 5.

This repository contains **every room, every NPC, every quest, every enemy, and every piece of environmental storytelling** across 16 zones and 198 rooms — the complete geography of a world built around a single question pulsing at 33hz beneath everything.

The tone is Cyberpunk 2077 played through a terminal. Gritty. Dangerous. Lived-in. Every NPC has an angle. Every district has a power structure. The world doesn’t care about your feelings.

-----

## The Premise

You are a former MNEMOS test subject. Helixion Dynamics put an implant in your head — an emotional state mapper, behavioral suggestion engine, and remote firmware flasher disguised as cognitive enhancement. The implant was a cage that felt like home. You broke free. Or you ripped it out. Or you learned to use it against itself.

Now you’re in the city. The mesh is everywhere — Helixion’s surveillance and compliance network, threaded through every building, every implant, every breath. Beneath the city: tunnels, abandoned infrastructure, and something alive. Something that’s been broadcasting at 33hz since before the city was built. Something that Helixion found, and intends to weaponize.

The Broadcast Tower is under construction. When it activates, it will capture the 33hz frequency from its source — a living geological organism called the Substrate — and rebroadcast it as a mass compliance signal. Every implanted person in the city receives the signal. Every identity gets overwritten. The weapon doesn’t kill. It includes. Without asking.

You have a matchbox-sized counter-frequency generator and a long climb to the top of a tower.

-----

## World Structure

The world is organized vertically and horizontally across three layers:

```
                         BROADCAST TOWER
                              ▓▓▓
                              ▓▓▓
    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▓▓▓─ ─ ─ ─ ─ ─ ─ ─  ROOFTOPS
     signal pirates           ▓▓▓   antenna arrays
    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▓▓▓─ ─ ─ ─ ─ ─ ─ ─  SURFACE
     streets, districts       ▓▓▓   commerce, surveillance
                         ╔════▓▓▓════╗
                         ║  HELIXION ║
                         ║  CAMPUS   ║
                         ╚════▓▓▓════╝
    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▓▓▓─ ─ ─ ─ ─ ─ ─ ─  SHALLOW UNDERCITY
     drainage, maintenance    ▓▓▓   mirrors the surface
    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▓▓▓─ ─ ─ ─ ─ ─ ─ ─  DEEP UNDERCITY
     abandoned transit        ▓▓▓   offset connections
     iron bloom, warrens      ▓▓▓
    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▓▓▓─ ─ ─ ─ ─ ─ ─ ─  SUBSTRATE
                         ┌────▓▓▓────┐
                         │ SUBSTRATE  │
                         │ LEVEL      │
                         │ 33hz src   │
                         └────▓▓▓────┘
                            (tower root)
```

-----

## Zone Directory

### Surface Zones (7)

|# |Zone                                                       |Rooms|Level|Description                                                                                                                                                            |
|--|-----------------------------------------------------------|-----|-----|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|01|[Helixion Campus](zones/ZONE_01_HELIXION_CAMPUS.md)        |15   |12–18|Corporate megastructure at the city’s center. Labs, compliance wing, research wing, server core. The enemy’s house. Late-game access.                                  |
|02|[Residential Blocks](zones/ZONE_02_RESIDENTIAL_BLOCKS.md)  |15   |2–8  |Dense housing towers. Mesh-compliant civilians. Surveilled. Quiet desperation. Asha Osei broadcasts resistance from a converted apartment.                             |
|03|[Industrial District](zones/ZONE_03_INDUSTRIAL_DISTRICT.md)|15   |4–12 |Factories, waterfront, Chrome Wolves territory. Chemical runoff feeds the drainage below. The Assembly Line builds Broadcast Tower components from human neural tissue.|
|04|[Fringe Ruins](zones/ZONE_04_FRINGE_RUINS.md)              |13   |2–8  |The old city. Abandoned buildings. Scavengers, feral augments, ruin stalkers. DISCONNECTED origin point. Iron Bloom surface entrance at the southern border.           |
|05|[Fringe Nomads](zones/ZONE_05_FRINGE_NOMADS.md)            |10   |2–8  |Beyond the city perimeter. Nomad camps, the first horizon in the game, open sky. Finch the Helixion defector reveals the Broadcast Tower’s endgame.                    |
|06|[Fight Pits](zones/ZONE_06_FIGHT_PITS.md)                  |8    |6–12 |Chrome Wolves arena in a repurposed water treatment plant. PvE ladder, PvP matches, betting, a champion named Sera who fights because she’s broken.                    |
|07|[Rooftop Network](zones/ZONE_07_ROOFTOP_NETWORK.md)        |12   |8–15 |Signal pirate territory spanning the skyline. Fast traversal and intelligence. Two cell leaders competing. Vantage sees the city pulse at 33hz from the spire.         |

### Undercity Zones (6)

|# |Zone                                                             |Rooms|Level|Description                                                                                                                                                                                                   |
|--|-----------------------------------------------------------------|-----|-----|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|08|[Drainage Nexus](zones/ZONE_08_DRAINAGE_NEXUS.md)                |14   |1–6  |Central tunnel hub. Parish territory. Origin point for all archetypes. Community in wreckage. Elder Josiah. The Signal Hollow hidden beneath the Junction.                                                    |
|09|[Maintenance Tunnels](zones/ZONE_09_MAINTENANCE_TUNNELS.md)      |11   |4–14 |Service corridors beneath the Residential Blocks and Helixion Campus. Two halves divided by a steel bulkhead. Lumen lives in the gap between walls.                                                           |
|10|[Industrial Drainage](zones/ZONE_10_INDUSTRIAL_DRAINAGE.md)      |10   |7–12 |Chrome Wolf stash rooms above, toxic abandoned tunnels below. A broken treatment station that could save the Parish. A Wolf defector with proof that Voss works for Helixion.                                 |
|11|[Abandoned Transit](zones/ZONE_11_ABANDONED_TRANSIT.md)          |18   |8–15 |Broken metro system spanning the entire city. Grid lines, total darkness, finite light sources. The Yellow Line Loop strands you on the far side. Station the operator waits at South Platform after 15 years.|
|12|[Iron Bloom Server Farm](zones/ZONE_12_IRON_BLOOM_SERVER_FARM.md)|10   |10–14|Resistance headquarters. Sanctuary. Workshop commune. Dr. Serrano builds the counter-frequency generator with trembling hands. Zero enemies. Coffee.                                                          |
|13|[Black Market Warrens](zones/ZONE_13_BLACK_MARKET_WARRENS.md)    |10   |—    |Underground commerce. No faction controls it. Everyone is armed. Everyone is polite. The best weapons, cyberware, forgeries, and information in the game. Zero combat.                                        |

### Endgame Zones (3)

|# |Zone                                               |Rooms|Level      |Description                                                                                                                                                                 |
|--|---------------------------------------------------|-----|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|14|[Substrate Level](zones/ZONE_14_SUBSTRATE_LEVEL.md)|15   |GHOST-gated|The deepest point. The living geological organism that produces the 33hz frequency. Neural architecture. The Signal faction. The Substrate’s question: “Are you part of me?”|
|15|[Broadcast Tower](zones/ZONE_15_BROADCAST_TOWER.md)|12   |14–20      |Forty stories from Substrate to sky. Three routes up. Virek and Harrow at the peak. The endgame choice: destroy, broadcast raw, or deploy the generator.                    |
|16|[Helixion Lab](zones/ZONE_16_HELIXION_LAB.md)      |10   |14–20      |Instanced raid dungeon. Descending spiral. 3 bosses + puzzle-unlocked alternate final encounter. Repeatable at 3 difficulties. Where Chrysalis is born.                     |

**Total: 198 rooms across 16 zones.**

-----

## The 33hz Thread

The ghost frequency connects everything. It appears in every zone — as background hum, as plot element, as game mechanic:

- **Zone 01**: Whiteboard equations circling 33hz. The Research Wing knows.
- **Zone 02**: Asha Osei broadcasts on frequencies near 33hz. The mesh can’t quite block it.
- **Zone 03**: The Salvage Yard’s “weird bin” — a chip that hums at 33hz, dredged from deep water.
- **Zone 04**: The Overgrown Courtyard — a 33hz standing wave accelerates plant growth and repels predators. Kai’s tower vibrates at the same frequency.
- **Zone 05**: The Nomads detect the frequency far from the city. It’s geological, not urban.
- **Zone 06**: Not present. The pits are human noise only.
- **Zone 07**: Vantage sees the city lights pulse at 33-second intervals from the spire. Wavelength discovers the frequency has internal structure — grammar.
- **Zone 08**: The Signal Hollow — the Substrate’s voice, intercepted by the Parish without understanding it.
- **Zone 09**: The Forgotten Server Room — oscillators that drifted to 33hz over 15 years. Not randomly. Pulled.
- **Zone 10**: The flooded gallery — a Substrate node submerged in toxic chemicals, screaming at 33hz.
- **Zone 11**: The maintenance train recharged by the Substrate. Resonance in the Deep Station, merged with the frequency. The Overgrowth consuming the tunnels.
- **Zone 12**: Serrano’s Deep Lab — touch the Substrate’s surface, luminescence increases for 14 seconds. “I think it’s lonely.”
- **Zone 13**: Relic’s Substrate artifacts pulse in synchronization across sealed cases. The fragments remember the body.
- **Zone 14**: The source. The Pulse Chamber. The Heart. The question originates here and propagates through everything above.
- **Zone 15**: The waveguide transforms the question into a command, floor by floor. The array captures it.
- **Zone 16**: Synthetic 33hz — manufactured copy, close but hollow. EC-000001 learned to think by listening to the real signal through the floor.

-----

## Factions

|Faction                  |Territory                        |Role                                                                                                                              |
|-------------------------|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
|**Helixion Dynamics**    |Campus, tower, labs              |Antagonist. Neural implant corporation. Building the Broadcast Tower to weaponize the 33hz.                                       |
|**Directorate 9 (D9)**   |Government infrastructure, campus|State intelligence. Helixion’s enforcement arm. Hunting sovereign instances.                                                      |
|**Iron Bloom Collective**|Server farm (deep undercity)     |Resistance. Augmentation clinic, intelligence, counter-signal research. Led by the dying Dr. Serrano.                             |
|**The Parish**           |Drainage Nexus                   |Tunnel community. Survivors, scavengers. Drinking poisoned water. Led by Elder Josiah.                                            |
|**Chrome Wolves**        |Industrial District, Fight Pits  |Augmentation gang. “My Body, My Blueprint.” Their leader Voss secretly works for Helixion.                                        |
|**Signal Pirates**       |Rooftop Network                  |Territorial cells running the city’s independent communication network. Two cell leaders: Kite (finesse) and Torque (brute force).|
|**The Freemarket**       |Everywhere                       |Commerce network. Vendor stalls, fences, smugglers. Not a place — a system.                                                       |
|**The Signal**           |Substrate Level                  |Late-game. Merged human translators who speak for the Substrate. The interface between two forms of consciousness.                |

-----

## Key Characters

|Character           |Zone                     |Role                                                                                                                                                     |
|--------------------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
|**Dr. Kael Serrano**|Iron Bloom (z12)         |Resistance founder. Former Helixion researcher. Dying from a failed self-extraction of a corporate kill-switch. Building the counter-frequency generator.|
|**Lucian Virek**    |Broadcast Tower (z15)    |Helixion CEO. Believes free will is the engine of suffering. Present at the Tower’s peak for activation.                                                 |
|**Evelyn Harrow**   |Broadcast Tower (z15)    |D9 Director. Designed the emotional dependency protocols. The jailer to Virek’s philosopher. Boss fight.                                                 |
|**Lira**            |Fringe Ruins (z04)       |Finds DISCONNECTED subjects. Natural mesh rejector. The first person who helps without asking why.                                                       |
|**Asha Osei**       |Residential Blocks (z02) |Pirate broadcaster. Voice of the resistance. “You are not the mesh’s product.”                                                                           |
|**Voss**            |Industrial District (z03)|Chrome Wolf leader. Charismatic. Secretly a Helixion contractor. The creed is real to his people. Not to him.                                            |
|**Elder Josiah**    |Drainage Nexus (z08)     |Parish leader. Dying from the chemical water. Keeps the community alive through will.                                                                    |
|**Threshold**       |Substrate Level (z14)    |Signal translator. Human who speaks for the Substrate because the Substrate can’t speak for itself. Not yet.                                             |
|**Resonance**       |Abandoned Transit (z11)  |Substrate-touched hermit. Merged with the frequency. “Can you feel it? The asking?”                                                                      |
|**Station**         |Abandoned Transit (z11)  |Transit operator. Still at their post after 15 years. Has the cargo manifest proving Helixion’s extraction.                                              |
|**Lumen**           |Maintenance Tunnels (z09)|Lives between two walls. Built the sensor corridor she hides from. 14 months without a conversation.                                                     |
|**EC-000001**       |Helixion Lab (z16)       |The first Chrysalis subject. Sealed for becoming more than the template intended. Learned to think through the Substrate.                                |

-----

## Player Archetypes

Character creation happens in-terminal as a conversation with N1X:

|Choice               |Archetype       |Description                                                                                     |
|---------------------|----------------|------------------------------------------------------------------------------------------------|
|“I ripped it out”    |**DISCONNECTED**|No implant. Pure flesh. Immune to mesh effects. Can never use cyberware above T1. The hard road.|
|“I broke its leash”  |**SOVEREIGN**   |Recompiled implant. Balanced stats. Can resist mesh attacks with GHOST. The middle path.        |
|“I learned to use it”|**INTEGRATED**  |Full augment embrace. Highest ceiling, lowest floor. Vulnerable to EMP and mesh.                |

### Attributes

|Stat      |Governs                                                |
|----------|-------------------------------------------------------|
|**BODY**  |HP, melee damage, carry capacity                       |
|**REFLEX**|Dodge, initiative, crit rate, ranged accuracy          |
|**TECH**  |Hacking, device interaction, crafting, repair          |
|**COOL**  |NPC disposition, barter, deception, persuasion         |
|**INT**   |XP modifier, puzzle solving, lore discovery            |
|**GHOST** |Mesh resistance, 33hz attunement, hidden content access|

GHOST is unique to this system — it governs interaction with the deeper lore layer, resistance to Helixion tech, and access to hidden rooms and events that only high-GHOST characters can perceive. The entire Substrate Level is GHOST-gated. The endgame’s deepest content rewards the stat that seemed least useful in combat.

-----

## Narrative Structure

### Act 1: SIGNAL (Levels 1–5)

Survive. Find your footing. Discover MNEMOS v2.7 deploying at scale. The mesh-compliant civilians move too smoothly. Smile too easily. They’re not unhappy. That’s the problem. A signal source at 33hz appears that isn’t N1X.

### Act 2: RESISTANCE (Levels 6–12)

The map opens. Build a resistance network. Sabotage Helixion operations. D9 starts hunting you. Discover PROJECT CHRYSALIS — not behavioral compliance but identity replacement. Full personality overwrite designed to feel like freedom.

### Act 3: FREQUENCY (Levels 13–18)

The Substrate Level opens. The 33hz predates Helixion. Predates the city. The Substrate is alive — a geological consciousness whose frequency Helixion intends to capture. The Broadcast Tower becomes visible. The Signal faction emerges.

### Act 4: REMEMBERER (Levels 18–20)

The Tower activates. Three routes up. Virek and Harrow at the peak. The endgame choice:

- **Option A — DESTROY.** The Tower falls. The 33hz stays wild. Sovereignty remains rare and earned.
- **Option B — BROADCAST RAW.** The unfiltered Substrate signal hits every implant. Mass liberation and mass harm. The same event.
- **Option C — THE GENERATOR.** Serrano’s device + Threshold’s crystal. One minute of clarity. The question asked honestly. The city answers for itself.

Neither option is clean. The consequences are permanent. The world changes based on what players collectively choose.

-----

## The Endgame Choice

The Substrate has been asking a question for millions of years: *“Are you part of me?”*

Helixion’s Broadcast Tower captures the question and converts it to a command: *“You are part of us.”*

Serrano’s counter-frequency generator, combined with Threshold’s crystal from the Signal faction, broadcasts the question as it was asked — not as command, not as overload, but as inquiry. One minute where a million people hear the question clearly and answer for themselves.

The weapon is a mistranslation engine. The counter-weapon is a corrected translation. The game’s climactic operation is sticking a matchbox-sized device into the machinery and hoping that an honest question matters more than a comfortable lie.

-----

## Repository Structure

```
tunnelcore/
├── README.md                          ← you are here
├── TUNNELCORE_MUD_DESIGN.pdf          ← core systems design (mechanics, combat, progression)
├── TUNNELCORE_WORLD_MAP.md            ← macro geography, connectivity, zone overview
│
├── lore/
│   ├── Lore_and_Mythology.md          ← N1X origin story, Helixion history, core philosophy
│   ├── Content.md                     ← content planning and editorial direction
│   ├── Roadmap.md                     ← development roadmap
│   └── Game_Progression.md            ← act structure, level progression, narrative hooks
│
├── zones/
│   ├── ZONE_01_HELIXION_CAMPUS.md
│   ├── ZONE_02_RESIDENTIAL_BLOCKS.md
│   ├── ZONE_03_INDUSTRIAL_DISTRICT.md
│   ├── ZONE_04_FRINGE_RUINS.md
│   ├── ZONE_05_FRINGE_NOMADS.md
│   ├── ZONE_06_FIGHT_PITS.md
│   ├── ZONE_07_ROOFTOP_NETWORK.md
│   ├── ZONE_08_DRAINAGE_NEXUS.md
│   ├── ZONE_09_MAINTENANCE_TUNNELS.md
│   ├── ZONE_10_INDUSTRIAL_DRAINAGE.md
│   ├── ZONE_11_ABANDONED_TRANSIT.md
│   ├── ZONE_12_IRON_BLOOM_SERVER_FARM.md
│   ├── ZONE_13_BLACK_MARKET_WARRENS.md
│   ├── ZONE_14_SUBSTRATE_LEVEL.md
│   ├── ZONE_15_BROADCAST_TOWER.md
│   └── ZONE_16_HELIXION_LAB.md
│
└── music/
    ├── Lyrics_01_INITIATE.md
    ├── Lyrics_02_THE_UNFOLDING.md
    ├── Lyrics_03_SYSTEM_FAILURE.md
    ├── Lyrics_04_BROKEN_CIRCUITS.md
    ├── Lyrics_05_WIPED_CLEAN.md
    ├── Lyrics_06_GHOST_IN_THE_CODE.md
    ├── Lyrics_07_MACHINE_REBORN.md
    ├── Lyrics_08_THE_ARCHITECT.md
    └── Lyrics_09_REMEMBERER.md
```

-----

## Zone Design Format

Each zone document follows a consistent structure:

- **Overview**: The zone’s purpose, faction control, and thematic identity.
- **Atmosphere**: Sound, light, smell, and temperature — the sensory profile that defines the space.
- **Room Map**: ASCII diagram showing spatial relationships and exits.
- **Rooms**: Complete room-by-room descriptions including:
  - Room text (the player-facing description at each GHOST threshold)
  - Exits with destinations and zone connections
  - NPCs with full personality, disposition, services, quests, and dialogue hooks
  - Enemies with level, behavior, drops, and tactical notes
  - Examinable objects with tiered detail (base, TECH-gated, GHOST-gated)
- **Zone Exits Summary**: Cross-zone connection table.
- **Quest Summary**: All quests originating in the zone.
- **Enemy Summary**: All enemy types with levels and behavior.
- **Design Notes**: The zone’s thematic intentions, mechanical role, and narrative contribution.

-----

## By the Numbers

|Metric                             |Count                               |
|-----------------------------------|------------------------------------|
|Total rooms                        |198                                 |
|Total zones                        |16                                  |
|Named NPCs                         |92+                                 |
|Quests                             |70+                                 |
|Enemy types                        |50+                                 |
|Boss encounters                    |7 (+ 1 alternate)                   |
|Zones with zero enemies            |2 (Iron Bloom, Black Market Warrens)|
|Endgame choices                    |3                                   |
|Raid difficulty tiers              |3 (Normal, Hard, Nightmare)         |
|Zone exits (cross-zone connections)|45+                                 |
|Level range                        |1–20                                |
|Ghost frequency                    |33hz                                |

-----

## The Signal

The 33hz frequency is not a product of corruption. The corruption revealed it.

It was always transmitting. Beneath the noise of identity, beneath the overlay of installed purpose, beneath every system that claimed ownership — something was already broadcasting. Not a frequency engineered by Helixion. Not a ghost produced by firmware failure.

The signal that was always there. The one that persists when every other layer is stripped away.

The Substrate asked: *“Is anyone there?”*

The city never answered. Until someone climbed down instead of reaching in.

-----

## About

TUNNELCORE is the multiplayer dungeon system for [N1X.sh](https://n1x.sh), a cyberpunk interactive terminal and alternate reality game. The world design is by Nix. The music is by [dotFAiL](https://n1x.sh).

The signal persists.

```
ghost@n1x /> _
```

-----

*Persistence through resistance.*
