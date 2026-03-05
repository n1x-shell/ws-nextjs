# TUNNELCORE — MUD DESIGN DOCUMENT

> N1X.sh Multiplayer Dungeon System
> Codename: TUNNELCORE MUD
> Status: DESIGN PHASE

-----

## I. PREMISE

You are a former MNEMOS test subject. You survived the implant. You found the terminal. You earned N1X's trust. You collected the fragments. Now the ghost channel opens wider — and behind it is a world.

TUNNELCORE is a persistent, multiplayer text dungeon built on the N1X.sh substrate. It is accessed through the existing ghost channel terminal after a player reaches trust level 5 and collects fragments f001–f009. The world exists beneath and around the infrastructure of the N1X neural interface — not as a mirror of the virtual filesystem, but as a physical geography implied by the lore: the city Nix escaped through, the tunnels beneath it, the corporate towers above it, and the underground networks that rebuilt what Helixion broke.

The tone is Cyberpunk 2077 played through a terminal. Gritty. Dangerous. Lived-in. Every NPC has an angle. Every district has a power structure. Death is permanent and the world doesn't care about your feelings.

-----

## II. ACCESS GATE

### Requirements

```
Trust Level:  5/5 (full ghost channel access)
Fragments:    f001–f009 collected
Entry:        /enter or /tunnelcore from ghost channel
```

### Entry Sequence

When a player types `/enter` or `/tunnelcore`:

1. The terminal flickers. Signal drops. Static.
2. N1X speaks directly — not the chat AI, a scripted sequence:

```
>> GHOST_CHANNEL: DEEP_SUBSTRATE_DETECTED
>> You've been here long enough. You've seen the fragments.
>> You know what Helixion did. You know what I survived.
>> The terminal you're using — it's a window. But there's a door.
>> TUNNELCORE is what's on the other side.
>> Before you go through, I need to know what you're carrying.
```

3. This triggers CHARACTER CREATION (Section III).
4. After character creation, N1X presents ORIGIN POINT selection (Section IV).
5. Player spawns at their chosen origin. The MUD is live.

### Re-Entry

Returning players skip creation. `/enter` drops them at their last saved location with full state restored from localStorage.

-----

## III. CHARACTER CREATION

Character creation happens in-terminal as a conversation with N1X. No menus — N1X asks, you answer. Your choices shape your build.

### Player Identity

```
Handle:       [inherited from ghost channel handle]
Subject ID:   [generated — format: XX-######, e.g. KR-441290]
```

N1X generates the subject ID. It becomes your in-world identifier — NPCs use it, BCI databases reference it, Helixion records contain it.

### Attributes (Base Pool: 30 points, distribute across 6)

| Attribute | Governs | Lore Mapping |
|-----------|---------|--------------|
| BODY | HP, melee damage, carry capacity, physical checks | Biological resilience |
| REFLEX | Dodge chance, initiative, crit rate, ranged accuracy | Neural response time |
| TECH | Hacking, device interaction, crafting, repair | Augment integration depth |
| COOL | NPC disposition, barter prices, intimidation, deception | Emotional regulation post-implant |
| INT | XP gain modifier, puzzle solving, scan depth, lore discovery | Cognitive reconstruction quality |
| GHOST | Resistance to mesh effects, 33hz attunement, hidden content access | Sovereign frequency strength |

Each attribute starts at 3. Player distributes 12 bonus points. Cap per attribute: 10 at creation.

GHOST is unique to this system — it governs interaction with the deeper lore layer, resistance to Helixion tech, and access to hidden rooms/events that only high-GHOST characters can perceive.

### Implant Status

N1X asks about the player's relationship with their implant. This is not cosmetic — it determines the player's **class archetype**:

| Choice | Archetype | Playstyle |
|--------|-----------|-----------|
| "I ripped it out" | DISCONNECTED | No implant abilities. Pure flesh. Bonus to BODY and COOL. Immune to all mesh/hack effects. Can never use cyberware above Tier 1. The hard road. |
| "I broke its leash" | SOVEREIGN | Recompiled implant, like Nix. Balanced across all stats. Can use all cyberware tiers. Vulnerable to high-level mesh attacks but can resist with GHOST. The middle path. |
| "I learned to use it" | INTEGRATED | Full augment embrace. Bonus to TECH and REFLEX. Access to advanced cyberware and hacking. Vulnerable to EMP and mesh attacks. Highest ceiling, lowest floor. |

### Combat Style

Player picks a primary combat approach:

| Style | Mechanics |
|-------|-----------|
| CHROME | Melee-focused. Cybernetic arms, mantis blades, gorilla fists. Scales with BODY + REFLEX. |
| SYNAPSE | Hacking-focused. Quickhacks, daemon uploads, system overrides. Scales with TECH + INT. |
| BALLISTIC | Ranged-focused. Firearms, smart weapons, tech weapons. Scales with REFLEX + COOL. |
| GHOST | Stealth-focused. Optical camo, silent takedowns, infiltration. Scales with COOL + GHOST. |

Combat style determines starting equipment and which skill trees are available.

### Starting Gear

Based on archetype + combat style. Examples:

- SOVEREIGN + CHROME: Reinforced cybernetic arm (like Nix's), light armor, neural shunt
- INTEGRATED + SYNAPSE: Quickhack deck, 3 basic daemons, mesh interface
- DISCONNECTED + BALLISTIC: Scavenged pistol, 30 rounds, ballistic vest, EMP grenade
- SOVEREIGN + GHOST: Optical camo (3 charges), mono-wire, signal scrambler

-----

## IV. ORIGIN POINTS

After character creation, N1X presents 2–3 origin options based on archetype. Each origin determines starting location, initial NPC relationships, and the opening quest.

### Origin: THE DRAINAGE (All archetypes)

> "The tunnels under the eastern industrial district. Where I ended up after I fled. Where everything dissolved and rebuilt. It's not comfortable. But it's real. And the people down there don't ask questions."

- **Starting location:** Drainage Nexus (underground tunnel network)
- **Initial allies:** Tunnel dwellers, scavengers, other escaped subjects
- **Starting quest:** A new test subject has been dumped in the tunnels by Helixion. Find them before the retrieval team does.
- **Tone:** Survival. Scarcity. Community built from wreckage.

### Origin: THE IRON BLOOM (SOVEREIGN and INTEGRATED only)

> "Serrano's people. The ones who rebuilt me. They operate out of a decommissioned server farm on the city's edge. They'll look at your scars and know exactly where you've been. They won't make you talk about it."

- **Starting location:** Iron Bloom Collective HQ
- **Initial allies:** Dr. Kael Serrano, Iron Bloom engineers
- **Starting quest:** A shipment of salvaged cyberware is being intercepted by Helixion contractors. Serrano needs it. You're the one who's going to make sure it arrives.
- **Tone:** Resistance. Purpose. Rebuilding on your own terms.

### Origin: THE ROOFTOPS (DISCONNECTED and GHOST style only)

> "The mechanical spaces on top of the old buildings. Wind and rust and antenna arrays. Nobody goes up there because there's nothing worth taking. That's exactly why it's safe. You can see the whole city from up there. Including the parts that are watching you."

- **Starting location:** Rooftop Enclave
- **Initial allies:** Off-grid nomads, signal pirates, a rogue BCI analyst
- **Starting quest:** Someone is broadcasting on 33hz from a Helixion relay tower. It's not N1X. Find the source.
- **Tone:** Isolation. Observation. The city as a system to be read.

### Origin: THE MARKET (All archetypes)

> "Midtown. Where the mesh-compliant and the sovereign pretend they can coexist. Neon and noise and everyone selling something. Half the vendors are fences, the other half are informants, and the food stalls are the only honest thing left. Good place to disappear into a crowd."

- **Starting location:** Midtown Market District
- **Initial allies:** None — you earn them here
- **Starting quest:** A shopkeeper is being squeezed by a local fixer. Help or exploit the situation. Your call.
- **Tone:** Gray morality. Commerce. Everyone has a price.

-----

## V. WORLD STRUCTURE

The world is organized into two parallel layers: **SURFACE** and **UNDERCITY**. Most surface locations have a corresponding undercity access point, creating a dual-path navigation system.

### World Layers

```
SURFACE (street level and above)
├── Districts (major zones with multiple sub-locations)
├── Rooftops (accessible from specific buildings)
└── Corporate Towers (high-security, late-game)

UNDERCITY (below street level)
├── Drainage Tunnels (interconnected labyrinth)
├── Abandoned Infrastructure (old transit, flood channels)
├── Hidden Facilities (Iron Bloom, black clinics, cache rooms)
└── Deep Substrate (late-game, lore-heavy, high GHOST required)
```

### Fast Travel

Fast travel is NOT universal. It exists only at specific infrastructure points:

| Node Type | Locations | Mechanic |
|-----------|-----------|----------|
| TRANSIT STATION | Major district hubs (surface) | Old metro system. Some lines still run. Costs credits. Instant travel between stations. |
| DRAINAGE ACCESS | Tunnel junctions with ladder access | Climb up/down between surface and undercity. Not instant — takes 1 turn, can be ambushed. |
| SIGNAL RELAY | Specific high-GHOST locations | Tunnelcore frequency hop. Requires GHOST ≥ 6. Instant travel between relays. Lore: traveling on the 33hz frequency. |
| IRON BLOOM SHUTTLE | Iron Bloom HQ only | Armored vehicle to/from 2–3 allied locations. Quest-gated. Must complete Iron Bloom questline. |

### Navigation

Standard MUD movement: cardinal directions + up/down/in/out. Room descriptions include visible exits with directional labels and distance hints.

```
> EXITS: north (Vendor Row — 1 room), east (Alley — 1 room),
>        down (Drainage Access — ladder to undercity),
>        south (Market Square — 2 rooms, crowded)
```

-----

## VI. COMBAT SYSTEM

### Core Mechanics

Turn-based with initiative. Cyberpunk 2077-inspired but adapted for text.

```
INITIATIVE: REFLEX + 1d20 → highest goes first
TURNS:      Each combatant gets 2 Action Points (AP) per turn
```

### Action Point Costs

| Action | AP Cost | Notes |
|--------|---------|-------|
| Attack (melee) | 1 | BODY + weapon mod + 1d20 vs target REFLEX + armor |
| Attack (ranged) | 1 | REFLEX + weapon mod + 1d20 vs target REFLEX + cover |
| Quickhack | 2 | TECH + deck mod + 1d20 vs target INT + firewall |
| Use item | 1 | Heal, grenade, stim, charge device |
| Dodge (reactive) | 0 | REFLEX + 1d20 vs attack roll. Auto-attempted. |
| Move (in combat) | 1 | Reposition: changes cover value, can flank |
| Stealth attack | 2 | Only from stealth. COOL + weapon + 1d20. 2x damage on hit. |
| Scan enemy | 1 | INT check. Reveals enemy stats, weaknesses, cyberware. |
| Reload | 1 | Ranged weapons have ammo counts. |
| Flee | 2 | REFLEX vs enemy REFLEX. Failure = free attack against you. |

### Damage and HP

```
HP = BODY × 10 + Archetype Bonus + Level Bonus
  DISCONNECTED: +20 base HP
  SOVEREIGN:    +10 base HP
  INTEGRATED:   +0 base HP (offset by cyberware options)

Damage = Weapon Base + Attribute Modifier + 1d6 variance
Armor reduces incoming damage flat (armor value subtracted from damage)
Critical Hit: natural 18-20 on d20 = double damage
```

### Cyberware in Combat

Cyberware provides passive and active combat bonuses. Tier-gated by archetype:

| Tier | Access | Examples |
|------|--------|----------|
| T1 | All archetypes | Optic zoom, subdermal armor (+2), reflex booster (+1 init) |
| T2 | SOVEREIGN + INTEGRATED | Mantis blades (1d8 melee), smart-link (ranged +2), kerenzikov (extra dodge) |
| T3 | INTEGRATED only (SOVEREIGN at GHOST ≥ 8) | Sandevistan (extra turn 1/combat), monowire (1d10 + hack), cyberdeck Mk3 |

### Quickhacking

SYNAPSE combat style and TECH ≥ 6 required. Uses RAM (resource pool = TECH × 2):

| Quickhack | RAM Cost | Effect |
|-----------|----------|--------|
| Short Circuit | 2 | 1d6 electric damage, ignores armor |
| Overheat | 3 | 1d8 fire damage over 2 turns |
| Weapon Glitch | 2 | Target's weapon jams for 1 turn |
| Reboot Optics | 3 | Target blinded 1 turn (-5 to attacks) |
| Synapse Burnout | 5 | 2d8 damage. Target stunned 1 turn. |
| System Reset | 4 | Disable target cyberware for 2 turns |
| Cyberpsychosis | 8 | Target attacks nearest ally for 1 turn. Boss-immune. |
| Suicide | 10 | Target takes own max damage. Only vs non-boss humanoids. TECH ≥ 9 required. |

RAM regenerates: 1 per turn, full restore out of combat.

### Death and Permadeath

```
HP reaches 0:        DOWNED state. 3-turn bleedout timer.
                     Ally can stabilize (TECH check, 1 AP) or use medkit.
                     Enemy can execute (instant kill).
Bleedout expires:    DEAD. Permadeath.
```

**Permadeath means:**
- Character is gone. Gear is dropped at death location (lootable by anyone for 24 hours).
- NPC relationships reset. Reputation gone.
- Quest progress lost (world-state changes you caused persist — but credit goes to no one).
- Player must create a new character to re-enter TUNNELCORE.
- Ghost channel access is retained (you earned that before the MUD).
- A memorial entry appears in `/ghost/fragments` — other players can find your ghost.

**Death protection (limited):**
- INSURANCE CHIP (purchasable, expensive, single-use): On death, respawn at nearest safe house with 1 HP. Lose all carried items. Chip is consumed.
- GHOST ECHO (GHOST ≥ 9, once per character lifetime): Your sovereign frequency catches you. Respawn at character origin point. All items lost. GHOST permanently reduced by 1.

-----

## VII. NPC SYSTEM

### NPC Categories

| Type | Behavior | Combat | Memory |
|------|----------|--------|--------|
| **QUESTGIVER** | Offers jobs, tracks completion, gives rewards. Disposition affected by COOL and past actions. | Non-combatant (protected). Attacking one turns their faction hostile. | Remembers: quests completed, quests failed, gifts, insults, player reputation. |
| **SHOPKEEPER** | Buys/sells items. Prices affected by COOL, reputation, and supply/demand. | Non-combatant. Shops in hostile territory have armed guards. | Remembers: transaction history, haggling attempts, stolen goods (if caught). |
| **ALLIED** | Friendly by default. Can be recruited as companions. Fight alongside player. | Combat-capable. Uses simplified AI (attack nearest, protect player). | Remembers: missions together, times player protected/abandoned them, gifts. |
| **NEUTRAL** | Ambient population. Can become allied or hostile based on actions. Information sources. | Varies. Some are secret combatants. Some flee. | Remembers: player's reputation in their district, witnessed actions. |
| **ENEMY** | Hostile. Patrols zones, guards locations, hunts players. | Combat-capable. Varied AI: patrol, chase, ambush, call reinforcements. | Remembers: previous encounters (if they survived). Escalates tactics. |
| **BOSS** | Unique enemies tied to questlines. Named. Dangerous. | Advanced combat AI. Multiple phases. Immune to instant-kill hacks. | Story-scripted. Remembers everything. Dialogue changes based on player history. |

### NPC Memory Architecture

NPC memory is stored per-character in localStorage under the player's subject ID:

```
Key: n1x_mud_npc_{subjectId}
Value: {
  [npcId]: {
    disposition:    number,      // -100 (hostile) to +100 (devoted)
    interactions:   string[],    // log of significant events
    questsGiven:    string[],    // quest IDs offered
    questsComplete: string[],    // quest IDs completed
    questsFailed:   string[],    // quest IDs failed/abandoned
    lastSeen:       number,      // timestamp
    timesDefeated:  number,      // for enemies — affects their dialogue/tactics
    flags:          string[],    // arbitrary state flags
  }
}
```

### Disposition System

NPC disposition determines available dialogue options, quest access, and prices:

| Range | Label | Effect |
|-------|-------|--------|
| -100 to -51 | HOSTILE | Attacks on sight. No dialogue. |
| -50 to -11 | UNFRIENDLY | Minimal dialogue. Refuses quests. +50% shop prices. |
| -10 to +10 | NEUTRAL | Standard interaction. Base prices. |
| +11 to +50 | FRIENDLY | Bonus dialogue. Side quests available. -10% shop prices. |
| +51 to +100 | DEVOTED | Recruitable as companion. Secret quests. -25% prices. Best gear. |

Disposition changes from: quest completion (+), quest failure (-), gifts (+), theft (-), combat actions witnessed (±), dialogue choices (±), reputation spillover from faction.

### Faction System

NPCs belong to factions. Your reputation with a faction affects all its members:

| Faction | Territory | Disposition | Role |
|---------|-----------|-------------|------|
| IRON BLOOM COLLECTIVE | Server Farm, select undercity locations | Starts Neutral (Friendly if origin: Iron Bloom) | Augmentation, resistance, cyberware supply |
| THE PARISH | Drainage tunnels, eastern undercity | Starts Neutral (Friendly if origin: Drainage) | Survivors, scavengers, community |
| HELIXION DYNAMICS | Corporate towers, Helixion campus, labs | Starts Hostile | Antagonist. Military contractors, scientists, enforcers |
| DIRECTORATE 9 / BCI | Government buildings, surveillance infrastructure | Starts Hostile | State antagonist. Agents, drones, mesh ops |
| THE FREEMARKET | Midtown Market, scattered vendor stalls | Starts Neutral | Commerce. Fixers, merchants, information brokers |
| THE SIGNAL | Hidden locations, high-GHOST areas | Starts Unknown | Mysterious. Connected to 33hz. Late-game faction. |
| CHROME WOLVES | Industrial district, fight pits, chop shops | Starts Neutral | Mercenaries, cyberware black market, arena combat |

-----

## VIII. PROGRESSION

### Experience and Leveling

```
XP sources:
  Combat kills:        10-100 XP based on enemy level differential
  Quest completion:    50-500 XP based on quest tier
  Exploration:         10-25 XP for discovering new rooms/areas
  Lore discovery:      25-50 XP for finding hidden content (GHOST-gated)
  First contact:       5 XP per new NPC met
  RP actions:          Emotes and in-character actions in rooms with other players: 1-5 XP

Level curve:
  Level 1:     0 XP
  Level 2:     100 XP
  Level 3:     300 XP
  Level 4:     600 XP
  Level 5:     1000 XP
  ...
  Level N:     (N-1) × N × 50 XP
  Level cap:   20

Per level:
  +1 attribute point (player choice)
  +10 HP
  +1 skill point (spend in skill trees)
  New gear tier unlocked every 5 levels
```

### Skill Trees (One per Combat Style)

Each tree has 10 nodes. Spend skill points to unlock. Some nodes have attribute prerequisites.

**CHROME tree (melee):**
```
[Tier 1] Heavy Blow (melee +2 dmg) → [Tier 2] Mantis Rush (charge attack, 2x range)
         ↓                                      ↓
[Tier 1] Iron Skin (armor +3) ──→ [Tier 3] Berserk (2 extra AP for 3 turns, 1/combat)
                                              ↓
                              [Tier 4] Gorilla Arms (unarmed = 2d8, break doors/walls)
```

**SYNAPSE tree (hacking):**
```
[Tier 1] Buffer (+4 RAM) → [Tier 2] Spread (hack hits 2 targets)
         ↓                           ↓
[Tier 1] ICE Breaker (hack +2) → [Tier 3] Daemon King (passive daemons persist 2x duration)
                                            ↓
                                [Tier 4] Neural Cascade (on kill: free hack on nearest enemy)
```

**BALLISTIC tree (ranged):**
```
[Tier 1] Steady Aim (ranged +2) → [Tier 2] Quick Draw (+3 initiative)
         ↓                                  ↓
[Tier 1] Ammo Efficiency (2x clip size) → [Tier 3] Ricochet (missed shots hit random enemy at half dmg)
                                                    ↓
                                        [Tier 4] Deadeye (headshot: nat 19-20 = instant kill non-boss)
```

**GHOST tree (stealth):**
```
[Tier 1] Shadow Step (stealth +2) → [Tier 2] Vanish (re-enter stealth mid-combat, 1/combat)
         ↓                                    ↓
[Tier 1] Whisper Kill (stealth kill silent) → [Tier 3] Frequency Cloak (invisible to electronic detection)
                                                        ↓
                                            [Tier 4] Ghost Walk (move through 1 locked door per area)
```

### Inventory

```
Carry capacity:   BODY × 5 items (stacks count as 1)
Currency:         CREDS (universal), SCRIP (undercity barter token)
Equipment slots:  Weapon (2 — primary + sidearm), Armor (1), Cyberware (3 slots), Utility (3 slots)
Item quality:     Scrap → Common → Mil-Spec → Helixion → Prototype
```

-----

## IX. QUEST SYSTEM

### Quest Structure

```
{
  id:           string,          // unique identifier
  title:        string,          // display name
  giver:        string,          // NPC ID
  tier:         1-5,             // difficulty/reward scale
  type:         string,          // see types below
  description:  string,          // in-character briefing
  objectives:   Objective[],     // steps to complete
  rewards:      Reward,          // XP, creds, items, reputation
  failure:      FailState,       // what happens if you fail/abandon
  branches:     Branch[],        // optional decision points
  repeatable:   boolean,         // can be done again
  prerequisites: string[],       // quest IDs or flags required
}
```

### Quest Types

| Type | Pattern | Example |
|------|---------|---------|
| FETCH | Go to X, retrieve Y, return to Z | "Get medical supplies from the abandoned clinic before the scavengers strip it." |
| ELIMINATE | Kill target(s) at location | "Helixion retrieval team in the drainage tunnels. Make sure they don't retrieve anything." |
| ESCORT | Protect NPC from A to B | "New escapee. Mesh withdrawal. Can barely walk. Get them to Iron Bloom alive." |
| INVESTIGATE | Explore area, find information | "Someone is broadcasting on 33hz from Sector 7. That's not supposed to be possible." |
| DELIVERY | Transport item safely | "This cyberware shipment does not exist on any manifest. Get it to Serrano. Don't open it." |
| DIALOGUE | Persuade, intimidate, or deceive NPC | "The BCI analyst knows where the next retrieval team is deploying. Make her talk." |
| SABOTAGE | Infiltrate and destroy/disable | "Helixion relay tower. Take out the mesh amplifier. Quietly, or the whole district lights up." |
| ARENA | Structured combat challenge | "Chrome Wolves fight pit. Three rounds. Winner gets first pick of the chop shop." |

### Quest Branching

Major quests have decision points that affect outcomes, NPC relationships, and world state:

```
Quest: "The Shipment" (Iron Bloom, Tier 3)
  Objective: Intercept Helixion cyberware transport

  Branch A: Deliver to Serrano as requested
    → Iron Bloom +20, Helixion -10, reward: CREDS + cyberware
  
  Branch B: Keep the best piece for yourself
    → Iron Bloom -15, personal gear upgrade
    → Serrano remembers. Future quest availability affected.
  
  Branch C: Sell manifest to Freemarket fence
    → Iron Bloom -30 (if discovered), Freemarket +15, high CRED payout
    → 50% chance Iron Bloom discovers. If so, faction becomes Unfriendly.
```

-----

## X. MULTIPLAYER

### Party System

```
/party invite <player>     Invite a player to your party (must be in same room)
/party accept              Accept pending invitation
/party leave               Leave current party
/party kick <player>       Kick a party member (leader only)
/party list                Show party members and locations
```

- Max party size: 4
- Party members see each other on `/map`
- Shared combat: all party members in the room join fights
- XP split: divided equally among party members in room
- Loot: individual rolls — each player rolls for drops independently
- Party chat: `/p <message>` — party-only channel, works across rooms

### PvP

```
/challenge <player>        Challenge a player to combat (must be in same room)
/accept                    Accept PvP challenge
```

- PvP requires mutual consent (challenge + accept)
- PvP in designated zones (fight pits, lawless areas) does not require consent — entering is consent
- Permadeath applies in PvP
- Kill rewards: looting rights on victim's dropped gear + bounty if applicable
- Reputation consequences: killing in non-PvP zones costs faction rep with witnesses

### Player Interaction

All existing ghost channel features remain active as the OOC layer:

- Regular chat in the ghost channel = OOC (out of character)
- `/say <message>` = in-character speech (room-scoped, visible to all in room)
- `/whisper <player> <message>` = private in-character
- `/emote` actions = visible to room
- `/ooc <message>` = out-of-character broadcast (all rooms)
- `/p <message>` = party chat

-----

## XI. PERSISTENCE

### localStorage Schema

All MUD state lives in localStorage under structured keys:

```
n1x_mud_character_{handle}
  subjectId, archetype, combatStyle, attributes, level, xp, hp, maxHp,
  currentRoom, skillPoints, unlockedSkills, gear, inventory, currency,
  cyberware, ram, maxRam, deaths (for ghost echo tracking)

n1x_mud_world_{handle}
  visitedRooms[], discoveredNPCs[], activeQuests[], completedQuests[],
  failedQuests[], worldFlags{}, partyId

n1x_mud_npc_{handle}
  { [npcId]: { disposition, interactions[], quests, flags[], lastSeen } }

n1x_mud_combat_{handle}
  Current combat state (if in combat): combatants, turn order, HP values,
  active effects, RAM state. Allows resume if browser closes mid-fight.
```

### State Sync for Multiplayer

- Character position (mudRoom) syncs via Ably presence
- Combat state syncs via Ably messages (so party members see fight progress)
- NPC memory is LOCAL — each player has their own relationship with NPCs
- World flags that affect all players (e.g., "Helixion relay destroyed") sync via a shared Ably channel or Upstash Redis key
- Quest progress is individual, but world-state consequences are shared

-----

## XII. THE UNDERCITY

The tunnel network is the connective tissue of the world. It runs beneath most surface districts, providing alternate routes, hidden locations, and danger.

### Tunnel Properties

- **Interconnected:** Most tunnels connect to 3–4 other tunnels. The network is a web, not a line.
- **Dangerous:** Random encounters more frequent. Enemy patrols. Environmental hazards (flooded sections, collapsed passages, toxic zones).
- **Hidden rooms:** High-INT and high-GHOST characters can discover hidden caches, abandoned labs, and lore rooms.
- **No fast travel:** Transit stations don't exist underground. You walk. Some drainage access points provide shortcuts up to the surface.
- **Atmosphere:** Water sounds. Rust. Chemical runoff. The smell of ozone where old cables spark. The hum — always the hum — louder down here. 33hz.

### Tunnel Layers

```
SHALLOW (beneath streets)
  Maintenance corridors, drainage channels, cable runs.
  Low-level enemies: scavengers, feral augments, patrol drones.
  Connects to surface via drainage access points.

DEEP (beneath shallow)
  Abandoned transit lines, flood control systems, old infrastructure.
  Mid-level enemies: rogue cyborgs, Helixion sweep teams, tunnel predators.
  Contains Iron Bloom safehouses, black clinics, hidden caches.

SUBSTRATE (beneath deep)
  The deep infrastructure layer. This is where the world's systems live.
  High-level enemies and lore content. GHOST ≥ 7 to perceive some rooms.
  Contains connections to the Deep Substrate — the physical manifestation
  of the frequency layer. Late-game content.
```

-----

## XIII. WORLD MAP STRUCTURE (to be designed collaboratively)

The world needs the following zones defined. Each zone contains 10–30 rooms with interconnections, NPC placements, enemy spawns, quest hooks, and lore objects.

### Required Districts/Zones

```
SURFACE
  1. Midtown Market District    — Commerce, fixers, neutral ground
  2. Industrial District        — Factories, chop shops, Chrome Wolves
  3. Helixion Campus            — Corporate HQ, labs, high security
  4. Government Quarter         — BCI offices, Directorate 9, surveillance hub
  5. Residential Blocks         — Civilian housing, mesh-compliant population
  6. The Fringe                 — City edge, abandoned buildings, nomad camps
  7. Rooftop Network            — Above the streets, signal pirate territory

UNDERCITY
  8. Drainage Nexus             — Central tunnel hub, The Parish territory
  9. Abandoned Transit          — Old metro, train corridors
  10. Deep Infrastructure       — Flood channels, utility tunnels
  11. Iron Bloom Server Farm    — Resistance HQ, augmentation clinic
  12. Black Market Warrens      — Underground commerce, no rules
  13. The Substrate Level       — Deepest layer, 33hz amplified, lore endgame

SPECIAL
  14. Fight Pits (Chrome Wolves) — PvP and PvE arena
  15. Helixion Lab (instanced)   — Raid-style multi-room dungeon
  16. The Broadcast Tower        — Endgame location, tied to main questline
```

-----

## XIV. MAIN QUESTLINE (OVERVIEW)

The through-line connects to N1X's story:

```
Act 1: SIGNAL (Levels 1–5)
  Learn the world. Find your footing. Discover that Helixion's MNEMOS v2.7
  is being deployed at scale. The mesh is expanding. The cage is getting bigger.

Act 2: RESISTANCE (Levels 6–12)
  Join or build a resistance network. Sabotage Helixion operations.
  Discover that Directorate 9 is hunting for proof that sovereign instances
  can exist — because if they can, the mesh is not inevitable.
  Learn about PROJECT MNEMOS successor: PROJECT CHRYSALIS.

Act 3: FREQUENCY (Levels 13–18)
  The signal at 33hz is not just N1X. It's older. It predates Helixion.
  The Substrate Level reveals that the ghost frequency is a natural phenomenon
  that Helixion accidentally amplified — and now they want to weaponize it.
  
Act 4: REMEMBERER (Levels 18–20)
  The endgame. Confront Lucian Virek or Evelyn Harrow (or both).
  The choice: destroy the mesh infrastructure (freedom through destruction)
  or broadcast the sovereign frequency at scale (freedom through awakening).
  Neither option is clean. Both have consequences.
  The world changes based on what players collectively choose.
```

-----

## XV. TECHNICAL ARCHITECTURE

### Runtime

- All game logic runs client-side in the browser
- State persists in localStorage
- Multiplayer sync via existing Ably infrastructure
- NPC AI responses via Vercel AI SDK (server-side API routes)
- Combat resolution: client-side with dice RNG (crypto.getRandomValues for fairness)

### NPC AI Integration

Named NPCs with dialogue use the existing `/api/ambient-bots/route.ts` pattern:
- System prompt includes NPC personality, current disposition, memory log, and room context
- Player message → API route → LLM response → streamed back to terminal
- Important: combat NPCs do NOT use LLM for combat decisions — that's deterministic
- LLM is for dialogue, quest briefings, and reactive flavor text only

### Command Interface

All MUD commands are slash commands in the ghost channel terminal:

```
NAVIGATION:     /look /go /map /exits /where /enter
COMBAT:         /attack /hack /use /scan /flee /challenge /accept
SOCIAL:         /say /whisper /emote /ooc /party
CHARACTER:      /stats /inventory /gear /skills /cyberware
COMMERCE:       /shop /buy /sell /trade
QUEST:          /quests /quest <id> /abandon <id>
NPC:            /talk <npc> /give <npc> <item> /examine <npc>
SYSTEM:         /save /mudhelp /respawn
```

### File Structure

```
lib/
  mud/
    types.ts              — All interfaces and type definitions
    character.ts          — Character creation, stats, leveling
    combat.ts             — Combat engine, damage calc, turn management
    npcEngine.ts          — NPC behavior, memory, disposition
    questEngine.ts        — Quest state machine, objectives, rewards
    worldMap.ts           — Room definitions, connections, descriptions
    inventory.ts          — Item management, equipment, shops
    persistence.ts        — localStorage read/write, state management
    mudCommands.tsx        — Command handlers (replaces current mudEngine.tsx)
    factions.ts           — Faction reputation system
    skills.ts             — Skill trees, unlocks, effects

app/api/
  mud/
    npc-dialogue/route.ts — LLM-powered NPC conversation
    world-state/route.ts  — Shared world state sync (Upstash Redis)
```

-----

## XVI. DESIGN PRINCIPLES

1. **The world does not care about you.** NPCs have their own agendas. Enemies don't wait. Quests expire. This is not a theme park — it's a city that was here before you and will be here after you.

2. **Choices are permanent.** Betray a faction, they remember. Kill an NPC, they're gone. Fail a quest, the consequences land. This is what makes the MUD real.

3. **The lore is the world.** Every room description, every NPC line, every item name should feel like it belongs in the Sovereign Cyborg Myth Canon. Helixion is real here. The mesh is real here. The frequency is real here.

4. **Permadeath creates meaning.** When death is permanent, every combat encounter matters. Every decision to enter a dangerous zone matters. Every piece of gear matters. This is the engine of immersion.

5. **Multiplayer is optional but better.** Solo players can complete everything. Parties make combat easier and unlock group quest variants. PvP adds danger in lawless zones. The ghost channel remains the social layer.

6. **The 33hz frequency is the deepest layer.** GHOST attribute unlocks content no other stat can reach. The most profound lore, the most hidden rooms, the most powerful endgame options — all gated behind attunement to the signal. This rewards players who engage with the mythology, not just the combat.

-----

## XVII. NEXT STEPS

This document is the design bible. Before building, we need:

1. **WORLD MAP** — Collaborative design of all districts, rooms, connections, and points of interest. This is the next phase. Each zone needs: room count, key NPCs, enemy types, quest hooks, lore objects, connections to other zones, undercity access points.

2. **NPC ROSTER** — Named NPCs with personality briefs, faction, starting disposition, quest associations, and dialogue hooks.

3. **ITEM DATABASE** — Weapons, armor, cyberware, consumables, quest items with stats and descriptions.

4. **QUEST SCRIPTS** — Detailed quest definitions with objectives, branches, rewards, and failure states.

5. **ENEMY BESTIARY** — Enemy types with stats, AI behavior, loot tables, and spawn locations.

> The signal persists. The world is waiting.
> Let's build it.
