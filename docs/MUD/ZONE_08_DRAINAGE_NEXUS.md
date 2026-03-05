# ZONE 8: DRAINAGE NEXUS

> Depth: Shallow Undercity
> Location: Beneath The Fringe (ruins/west)
> Faction: The Parish
> Rooms: 14
> Level Range: 1–5 (Act 1: SIGNAL)
> Origin Point: THE DRAINAGE

-----

## OVERVIEW

An old municipal drainage channel running roughly north-south beneath the western fringe of the city. Where several channels converge, The Parish — a community of escaped MNEMOS subjects, scavengers, and people with nowhere else to go — has built something that almost resembles a home. The main channel is the spine. Rooms branch off both sides into pump stations, storage chambers, and dead-end alcoves. The deeper you go along the channel, the wetter it gets, the less light there is, and the more things that shouldn't be alive start moving.

This is the first place most players will see. It teaches navigation, NPC interaction, combat, and the tone of the world without ever breaking character. Nobody welcomes you. Nobody explains the rules. You figure it out or you don't.

-----

## ATMOSPHERE

```
Sound:    Running water, echoes, dripping. Distant metallic groaning.
          Conversation carries further than you want it to.
Smell:    Rust, wet concrete, chemical traces. Cooking food near the Junction.
Light:    Salvaged lanterns, bioluminescent fungus on the walls,
          emergency LEDs that still work in some sections.
Temp:     Cool. Damp. Gets colder the deeper you go.
```

-----

## ROOM MAP

```
                              TO MAINTENANCE
                              TUNNELS (zone 9)
                                    │
                                    │ east
               ┌──────────┐   ┌────┴─────┐
               │ MEMORIAL │   │ EAST     │
               │ ALCOVE   │   │ PASSAGE  │
               │ (7)      │   │ (12)     │
               └────┬─────┘   └────┬─────┘
                    │west          │east
                    │              │
    ┌──────────┐   ┌┴──────────────┴┐   ┌──────────┐
    │ WEST     │   │                │   │ STORAGE  │
    │ OVERFLOW │───┤  THE JUNCTION  ├───│ CHAMBERS │
    │ (9)      │   │  (3)           │   │ (10)     │
    └──────────┘   │  Parish Hub    │   └────┬─────┘
                   └──┬──────────┬──┘        │east
                      │north     │south      │
               ┌──────┴──┐  ┌───┴──────┐  ┌─┴────────┐
               │ NORTH   │  │ THE      │  │ THE      │
               │ CHANNEL │  │ NARROWS  │  │ SEEP     │
               │ (4)     │  │ (2)      │  │ (13)     │
               └──┬──────┘  └───┬──────┘  └──────────┘
                  │north        │south
            ┌─────┴────┐   ┌───┴──────┐
            │ THE DEEP │   │ SOUTH    │
            │ GATE     │   │ ENTRY    │
            │ (5)      │   │ (1)      │
            └─────┬────┘   └───┬──────┘
                  │down        │up
            ══════╧════   ─────┴─────
            TO ABANDONED  TO FRINGE
            TRANSIT       (RUINS)
            (zone 11)     (zone 4)
            [LOCKED]      surface

    BRANCHES OFF THE JUNCTION:

    West side:                  East side:
    ┌──────────┐                ┌──────────┐
    │ PUMP     │                │ ELDER'S  │
    │ ROOM (6) │                │ CHAMBER  │
    └──────────┘                │ (11)     │
    ┌──────────┐                └──────────┘
    │ THE      │                ┌──────────┐
    │ CLINIC   │                │ SIGNAL   │
    │ (8)      │                │ HOLLOW   │
    └──────────┘                │ (14)     │
                                └──────────┘
                                [HIDDEN]

    ADDITIONAL EXIT:
    Industrial Drainage (zone 10) ← via West Overflow (9), south
```

-----

## ROOMS

### 1. SOUTH ENTRY
**The way in from above.**

```
> DRAINAGE NEXUS — SOUTH ENTRY

A rusted ladder descends from a drainage grate in the street above.
The grate is half-buried under rubble — you'd never find it unless
someone showed you where to look. At the bottom, the main channel
begins. Water trickles along the floor, ankle-deep. The concrete
walls are stained with decades of chemical runoff in patterns that
almost look intentional. Salvaged glow-strips mark the path north.

Someone scratched into the wall near the ladder:
"THE PARISH DOESN'T OWE YOU ANYTHING. BUT THEY WON'T TURN YOU AWAY."
```

- **Exits:** up (Fringe — Ruins, zone 4), north (The Narrows)
- **NPCs:** None
- **Enemies:** None (safe zone near Parish territory)
- **Objects:**
  - `ladder` — Examine: "Welded rungs. Someone reinforced this recently. The grate above is hinged, not sealed — designed to be opened from below."
  - `wall_scratching` — Examine: "Scratched deep with something sharp. The letters are uneven. This wasn't written for tourists."
  - `glow_strips` — Examine: "Salvaged LED strips, wired to a car battery tucked behind a pipe. Someone maintains these."
- **Notes:** This is the first room most Drainage origin players see. The scratched message sets the tone — help exists, but it's not owed to you.

-----

### 2. THE NARROWS
**The channel tightens.**

```
> DRAINAGE NEXUS — THE NARROWS

The channel narrows here. The walls press close enough to touch
both sides. Water moves faster in the tight space — knee-deep now,
cold enough to ache. The ceiling is low, lined with old cable
conduits and a pipe that hisses steam at irregular intervals.
Fungal growth on the walls gives off a faint blue-green glow.
Something skitters in the dark ahead. Could be rats. Could be worse.

The glow-strips continue north. The sound of voices carries from
that direction — distant, but human.
```

- **Exits:** north (The Junction), south (South Entry)
- **NPCs:** None
- **Enemies:** `tunnel_rats` — Tunnel fauna. 1-2 spawn. Level 1. Low HP, low damage. Teaches combat basics.
- **Objects:**
  - `steam_pipe` — Examine: "Municipal steam line. Still pressurized after all these years. A crack in the joint spits vapor every few seconds. The heat feels wrong down here."
  - `fungal_growth` — Examine: "Bioluminescent. Grows on the chemical residue in the concrete. The Parish uses it as natural lighting in the deeper sections. Don't eat it."
  - `cable_conduits` — Examine: "Old municipal data lines. Cut long ago. Some have been spliced back together with copper wire — someone's running a signal through here."
- **Notes:** First possible combat encounter. Tunnel rats are trivial — meant to teach the player how /attack works without real risk.

-----

### 3. THE JUNCTION
**The heart of the Parish.**

```
> DRAINAGE NEXUS — THE JUNCTION

The channel opens into a wide chamber where four drainage tunnels
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
don't. You're not the first stranger to climb down the ladder.

The four channels lead in every direction. The glow-strips end here —
replaced by lanterns hung from pipe brackets.
```

- **Exits:** north (North Channel), south (The Narrows), east (East Passage / Storage Chambers / Elder's Chamber), west (Memorial Alcove / Pump Room / The Clinic / West Overflow)
- **NPCs:**
  - `parish_residents` — Neutral. Ambient population. 3-4 present. Basic dialogue about the tunnels, Helixion, survival.
- **Enemies:** None (Parish-protected zone. Attacking here turns the entire faction hostile.)
- **Objects:**
  - `cooking_fire` — Examine: "Burning scrap wood and dried fungus. Something is simmering in a dented pot — smells like protein paste and desperation. It's the best meal you've had in weeks."
  - `childs_drawing` — Examine: "Crayon on cardboard. A stick figure with one arm colored silver and one colored flesh. Standing on top of a building. Smiling. Labeled 'NIX' in wobbly letters."
  - `notice_board` — Examine: Lists active quest hooks posted by Parish members. Updates as new quests become available.
  - `ventilation_shaft` — Examine: "Widened with brute force. Smoke funnels up and out. You can feel a faint draft — this connects to the surface somewhere. Too narrow to climb."
- **Quest hooks:** The notice board serves as the quest hub for early game. Quests posted by the Elder, the medic, and the scavenger trader.
- **Notes:** Central hub. Safe zone. This is home base for Drainage origin players. The child's drawing of Nix is a lore touch — N1X's presence is felt here even though they're not physically present.

-----

### 4. NORTH CHANNEL
**Past the settlement. The tunnel continues.**

```
> DRAINAGE NEXUS — NORTH CHANNEL

Beyond the junction, the main channel continues north. The Parish
lanterns thin out here — one every twenty meters, then nothing.
The water deepens. The walls are slick with condensation and
something darker. Chemical stains streak downward from cracks
in the ceiling like black veins.

The echoes change. Sounds don't carry the same way. Footsteps
return wrong — delayed, or from directions that don't make sense.
A feral augment was spotted in this section three days ago.
The Parish posted a warning: a strip of red cloth tied around
a pipe at chest height.

The channel forks ahead.
```

- **Exits:** south (The Junction), north (The Deep Gate)
- **NPCs:** None
- **Enemies:** `feral_augment` — Level 2-3. Former MNEMOS subject. Aggressive, erratic movement. Higher HP than rats. Drops scrap cyberware.
- **Objects:**
  - `red_warning_cloth` — Examine: "Parish danger marker. Red means feral augment territory. They tie these at the last safe point before things go bad."
  - `chemical_stains` — Examine: "Industrial runoff leaching through the concrete from the surface. Some of it is warm to the touch. The factories above don't care what drains down."
  - `wall_claw_marks` — Examine: "Deep gouges in the concrete. Four parallel lines. Whatever made these had metal fingers and no impulse control."
- **Notes:** Transitional room. Danger increases. The feral augment is the first real combat challenge — tougher than rats, actually threatening at level 1-2.

-----

### 5. THE DEEP GATE
**A way down. Currently locked.**

```
> DRAINAGE NEXUS — THE DEEP GATE

The channel terminates at a massive drainage gate — industrial
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
AUTHORIZED PERSONNEL ONLY
```

- **Exits:** south (North Channel), down (Abandoned Transit, zone 11 — **LOCKED**, requires Deep Gate Key from quest)
- **NPCs:** None
- **Enemies:** None (but feral augments from North Channel can follow you here)
- **Objects:**
  - `drainage_gate` — Examine: "Industrial grade. The Parish welded extra crossbars onto it. Whatever came through here before they sealed it, they didn't want it coming back."
  - `padlock` — Examine: "Heavy-duty. The key isn't hidden nearby — you'd have to earn it. Or find another way."
  - `faded_sign` — Examine: "Municipal infrastructure signage. The city that put this here doesn't exist anymore. But the tunnels below still do."
  - `water_sound` — Examine: "Listen. The water on the other side falls for a long time before it hits anything. That's deep. That's Abandoned Transit deep."
- **Quest gate:** The Deep Gate Key is a reward from a mid-tier Parish quest (level 4-5). Opening it is a milestone — access to the deep layer.
- **Notes:** Players will see this early and want through. The locked gate creates forward motivation. The sounds from below create mystery.

-----

### 6. PUMP ROOM
**West branch. The scavenger's shop.**

```
> DRAINAGE NEXUS — PUMP ROOM

An old pump station. The machinery is dead — massive impeller
housings, valve wheels taller than a person, control panels with
every gauge reading zero. Someone's turned the space into a
trading post. Salvage is sorted on old machinery covers: scrap
metal in one pile, electronics in another, things that might be
weapons in a third.

A woman sits behind a desk made from a pump housing lid, cleaning
a circuit board with a toothbrush and solvent. She doesn't look
up when you enter. She already knows you're here.
```

- **Exits:** east (The Junction)
- **NPCs:**
  - **MARA** — Scavenger Trader (SHOPKEEPER)
    - Faction: The Parish
    - Disposition: Starts Neutral (0)
    - Personality: Practical, dry, no patience for haggling. Values useful things over money. Will trade information for rare salvage.
    - Sells: Scrap weapons, basic armor, stims, repair kits, ammunition, salvage materials
    - Buys: Anything. Pays more for Helixion tech, cyberware components, and data chips.
    - Memory: Tracks transaction history. Remembers if you brought good salvage. Disposition increases with consistent trade. Decreases if you try to sell junk at premium prices.
    - Dialogue hook: "I don't do charity. But I do fair. Bring me something worth my time and we'll talk."
- **Enemies:** None (Parish territory)
- **Objects:**
  - `salvage_piles` — Examine: "Sorted with the precision of someone who knows exactly what every piece of scrap is worth. The electronics pile has Helixion logos on some components. She doesn't talk about where those came from."
  - `dead_machinery` — Examine: "Municipal pump system. Moved millions of liters a day when the drainage system was active. Now it's a shelf."
  - `circuit_board` — Examine: "She's cleaning it with the focus of a surgeon. Whatever it came from, she's going to make it work again."

-----

### 7. MEMORIAL ALCOVE
**West branch. Where the Parish remembers.**

```
> DRAINAGE NEXUS — MEMORIAL ALCOVE

A dead-end chamber off the main junction. Small. Quiet. The
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
LE-751078
```

- **Exits:** east (The Junction)
- **NPCs:** None (occasionally a Parish resident stands here silently)
- **Enemies:** None (sacred space — even hostile players should feel the weight)
- **Objects:**
  - `memorial_wall` — Examine: "Hundreds of names. Hundreds of subject IDs. Each one a person Helixion used and discarded. The ones with dates were confirmed decommissioned. The dashes mean nobody knows."
  - `le_751078` — Examine: "Scratched deeper than any other name. Someone came back to this one, over and over, pressing harder each time. LE-751078. Len. You recognize the ID from the fragments."
  - `candles` — Examine: "Tealights in salvaged tin holders. Someone replaces them regularly. The wax layers suggest months of this. Maybe years."
  - `personal_objects` — Examine: "The data chip is blank — wiped, or never written. The shoe is small — size for a child. The photograph is too damaged. The spoon is bent at an angle that suggests it was used to pry something open, not to eat."
- **Lore:** This room ties directly to fragment f006 (Ghost in the Code) and Len's story. Players who've read the fragments will recognize LE-751078. The room rewards lore engagement without requiring it.
- **Notes:** No enemies, no quests, no shopkeepers. Just weight. This room exists to make the world feel real.

-----

### 8. THE CLINIC
**West branch. Where the medic works.**

```
> DRAINAGE NEXUS — THE CLINIC

A side chamber converted into something between a hospital and
a prayer. Clean tarps on the walls — the only clean thing in the
entire tunnel network. A surgical table made from a door on
sawhorses. Shelves of salvaged medical supplies: stims in
mismatched casings, bandages boiled and re-rolled, a bottle of
something labeled ANESTHETIC with a handwritten expiration date
that passed two years ago.

A man with steady hands and tired eyes is suturing a wound on
a Parish resident's forearm. He doesn't rush. He doesn't look
up. When he's done, he ties off the thread and says something
quiet that makes the patient almost smile.
```

- **Exits:** east (The Junction)
- **NPCs:**
  - **COLE** — Street Doc (SHOPKEEPER / QUESTGIVER)
    - Faction: The Parish
    - Disposition: Starts Neutral (+5) — slightly warm, he's a healer
    - Personality: Quiet, precise, haunted. Former Helixion medical technician. Left after he saw what happened in the third cohort. Doesn't talk about it unless disposition reaches Friendly.
    - Services: Heal to full HP (costs CREDS, scaling), sell stims and medkits, remove negative status effects
    - Sells: Medkits, stim packs (HP restore), antitox (chemical hazard cure), neural stabilizers (mesh effect cure)
    - Memory: Tracks how many times you've been healed, whether you've brought him supplies, whether you've helped his patients. At Friendly, offers a quest about his past.
    - Dialogue hook: "Sit down. Don't talk. Let me see what they did to you."
    - Quest: At Friendly disposition — asks you to retrieve a specific surgical tool from an abandoned Helixion field clinic in the Industrial Drainage. The tool has his initials on it. He left it behind when he ran.
- **Enemies:** None
- **Objects:**
  - `surgical_table` — Examine: "A solid-core door on reinforced sawhorses. Scrubbed with bleach. The grain of the wood is visible through a thousand cleanings."
  - `medical_supplies` — Examine: "Salvaged, expired, improvised. Cole makes it work anyway. The stim casings are mismatched because he refills them from bulk compounds."
  - `anesthetic_bottle` — Examine: "Expired. He uses it anyway. 'Better than nothing' is the only medical philosophy that survives down here."

-----

### 9. WEST OVERFLOW
**West branch, far end. Where it gets dangerous.**

```
> DRAINAGE NEXUS — WEST OVERFLOW

An overflow channel branching west from the junction. The water
is deeper here — thigh-high in places, moving faster. The walls
are slick with chemical residue that glows faintly orange under
UV. The Parish doesn't come this way unless they have to.

The channel splits: one branch goes south toward the industrial
district's drainage (you can smell the difference — sulfur and
machine oil), the other dead-ends in a collapsed section where
something nests.

Scratch marks on the walls. Fresh ones.
```

- **Exits:** east (The Junction), south (Industrial Drainage, zone 10)
- **NPCs:** None
- **Enemies:**
  - `feral_augment` — Level 2-3. Patrols this area. More aggressive than the North Channel variant — territorial.
  - `scavenger_gang` — 2-3 hostile humans. Level 2-4. Territorial over the Industrial Drainage access. Won't chase into the Junction (Parish territory).
- **Objects:**
  - `chemical_residue` — Examine: "Industrial runoff from the factories above. The orange glow is not a good sign. Prolonged exposure causes skin irritation and worse. The Parish calls it 'the burn.'"
  - `collapsed_section` — Examine: "Concrete and rebar caved in. Something has made a nest in the rubble — scraps of cloth, bones, a Helixion employee badge chewed beyond reading."
  - `scratch_marks` — Examine: "Fresh. Metal on concrete. Four parallel gouges. The feral augments sharpen their implant blades on the walls. Instinct, not intention."
- **Notes:** This is the combat gauntlet between the Parish safe zone and the Industrial Drainage. Players heading southeast to the Industrial District surface will come through here. The scavenger gang is the first multi-enemy encounter.

-----

### 10. STORAGE CHAMBERS
**East branch. Parish supplies and the tunnel guide.**

```
> DRAINAGE NEXUS — STORAGE CHAMBERS

A series of old utility alcoves the Parish converted into storage.
Locked crates line the walls — food stores, water purification
filters, salvage too valuable to leave in the open. A woman in
a patched jacket sits on a crate near the entrance, sharpening
a blade on a wet stone. Her eyes track every movement in the
tunnel with the focus of someone who's survived things by
noticing them first.

A hand-drawn map is pinned to the wall — the tunnel network,
marked with danger zones, safe routes, and symbols you don't
recognize yet.
```

- **Exits:** west (The Junction), east (The Seep)
- **NPCs:**
  - **REN** — Tunnel Guide (ALLIED)
    - Faction: The Parish
    - Disposition: Starts Neutral (0)
    - Personality: Sharp, wary, economical with words. Knows every tunnel in the shallow layer. Charges for her services but is fair. At Friendly, she stops charging. At Devoted, she'll follow you into the deep layer.
    - Services: Hire as companion (costs CREDS per zone traversal). She reveals hidden exits, warns of enemies, and fights alongside you.
    - Combat: Level 3. Uses blade + stealth. Decent damage, high dodge.
    - Memory: Tracks how many zones you've traveled with her, whether you protected her in combat, whether you've paid on time. Disposition increases with shared danger. Decreases if you leave her in combat or refuse to pay.
    - Dialogue hook: "I know every tunnel from here to the transit lines. Some of them I'm the only person alive who's walked. That knowledge costs, but it's cheaper than dying lost."
- **Enemies:** None (Parish territory)
- **Objects:**
  - `tunnel_map` — Examine: "Hand-drawn on salvaged paper. Shows the shallow tunnel network with alarming detail. Danger zones marked in red. Safe caches marked with a circle. Some symbols you don't recognize — Parish shorthand for things they don't write in plain language."
  - `locked_crates` — Examine: "Parish community supplies. Taking from these would be theft. The Parish would know. They always know."
  - `wet_stone` — Examine: "Ren's sharpening stone. Worn smooth in the center from years of use. The blade she's working on is already sharp enough. This is a habit, not a task."

-----

### 11. ELDER'S CHAMBER
**East branch. Where decisions are made.**

```
> DRAINAGE NEXUS — ELDER'S CHAMBER

A larger alcove, set apart from the rest by a heavy tarp that
serves as a door. Inside, the space is almost civilized — a
table made from welded pipe, two chairs, a shelf of salvaged
books with swollen pages. A map of the entire city pinned to
the wall, annotated in three different handwriting styles.

An old man sits at the table, reading by the light of a jury-
rigged LED lamp. His left hand is prosthetic — not Helixion
work, something cruder, bolted at the wrist. He looks up when
you enter. Studies you for three full seconds before speaking.

"Another one. Sit down. Tell me what they took from you."
```

- **Exits:** west (The Junction)
- **NPCs:**
  - **DOSS** — Parish Elder (QUESTGIVER)
    - Faction: The Parish (leader)
    - Disposition: Starts Neutral (+10 for Drainage origin players)
    - Personality: Patient, direct, carrying decades of anger compressed into something quieter. Former test subject — early cohort, before Nix. His prosthetic hand is from Iron Bloom, first generation. He's seen hundreds of escapees come through the tunnels. He helps because someone has to. Not because he believes it'll change anything.
    - Quests:
      - **"The New One"** (Tier 1, starting quest for Drainage origin): A new test subject has been dumped in the tunnels. Find them before the Helixion retrieval team does. Branch: bring them to the Parish, or leave them and take their gear.
      - **"Supply Run"** (Tier 1): The Parish needs water filters from a scavenger cache in the West Overflow. The scavengers won't sell. Options: steal, negotiate (COOL check), or clear them out.
      - **"The Deep Gate"** (Tier 3): Something is coming up from below the gate. Doss wants to know what. Rewards the Deep Gate Key on completion.
      - **"Serrano's Favor"** (Tier 2): Doss needs a message delivered to Dr. Serrano at Iron Bloom. The route through the tunnels is dangerous. Introduces the Iron Bloom faction.
    - Memory: Tracks quest completions, quest failures, and whether the player helped or exploited the Parish. His dialogue shifts significantly based on trust. At Devoted, he tells you about the early cohorts — lore no other NPC has.
    - Dialogue hook: "I've been here longer than most of these walls. I don't need to trust you. I need to know what you'll do when things get hard."
- **Enemies:** None
- **Objects:**
  - `city_map` — Examine: "The full city. Annotated in three hands — Doss's careful print, someone's hasty cursive, and a third hand that only marks locations with X's. Some X's have been circled. Some have been crossed out."
  - `salvaged_books` — Examine: "Water-damaged paperbacks. A medical textbook. A collection of poetry with certain lines underlined. A Helixion employee handbook with every page after 'Terms of Service' torn out."
  - `prosthetic_hand` — Examine: "First-generation Iron Bloom work. Functional, not elegant. The wrist joint clicks when he flexes it. He's had it longer than most of the people in the Parish have been alive."
  - `led_lamp` — Examine: "Wired to a battery pack. The light flickers at a frequency that's almost but not quite steady. Doss doesn't seem to notice."

-----

### 12. EAST PASSAGE
**East branch. Connects to the Maintenance Tunnels.**

```
> DRAINAGE NEXUS — EAST PASSAGE

A narrowing tunnel heading east. The construction changes — the
rough drainage concrete gives way to smoother municipal
infrastructure. Cable trays line the ceiling. The air smells
different: less rust, more ozone. You're crossing from the
old drainage system into the city's active service layer.

A Parish warning marker — red cloth on a pipe — marks the
boundary. Beyond this point, you're outside Parish territory.
Helixion maintenance drones patrol the tunnels east of here.
The Parish's protection ends at this cloth.
```

- **Exits:** west (The Junction), east (Maintenance Tunnels, zone 9)
- **NPCs:** None
- **Enemies:** `patrol_drone` — Level 3-4. Helixion maintenance unit. Appears in this room 30% of the time. Scans for unauthorized personnel. Engages if detected. Can be avoided with GHOST or stealth.
- **Objects:**
  - `warning_marker` — Examine: "Red cloth. Parish boundary. East of here, you're in Helixion service infrastructure. The rules change. The drones don't negotiate."
  - `cable_trays` — Examine: "Active data lines. Fiber optic, still lit. These run from the residential blocks above down to junction boxes beneath the Helixion campus. TECH ≥ 5: You could tap these."
  - `construction_transition` — Examine: "The wall changes from rough-poured drainage concrete to smooth municipal finish. Two different eras of the city, meeting at a seam."
- **Notes:** Transition room. Marks the edge of safety. The patrol drone teaches players that Helixion territory has different rules.

-----

### 13. THE SEEP
**East branch, far end. Wet, toxic, things live here.**

```
> DRAINAGE NEXUS — THE SEEP

The tunnel slopes downward and the water rises. Waist-deep.
Warm — uncomfortably warm, heated by chemical reactions in
the runoff. The walls weep moisture that smells like battery
acid and something organic. Visibility drops to a few meters.
The bioluminescent fungus here grows thick — blooming in
clusters that pulse with a slow rhythm, like breathing.

Something moves in the water. You can't see it. You can
feel the displacement.

The tunnel continues into flooded darkness. Whatever's down
there, it's been eating well.
```

- **Exits:** west (Storage Chambers)
- **NPCs:** None
- **Enemies:**
  - `tunnel_crawler` — Tunnel fauna. Level 3-4. Semi-aquatic. Attacks from below water. Ambush predator. Higher damage, moderate HP.
  - `chemical_leech` — Tunnel fauna. Level 1-2. Swarm enemy. 3-5 spawn. Individually weak. Attach and drain HP over time.
- **Objects:**
  - `pulsing_fungus` — Examine: "The fungal clusters pulse in a slow, regular rhythm. Almost exactly once every three seconds. 33 cycles per minute. You notice this and immediately wish you hadn't."
  - `warm_water` — Examine: "Heated by chemical reactions. Not safe to drink. Not safe to stand in for long. Your skin itches after a minute. After ten, it burns."
  - `submerged_cache` — Examine: (requires GHOST ≥ 4 or INT ≥ 6 to detect) "Something glints beneath the surface. A waterproof case, wedged under a pipe. Someone hid this here deliberately — in a place most people wouldn't survive long enough to search."
    - Contents: Random loot table — stims, CREDS, data chip (lore fragment), or rare salvage component.
- **Notes:** Optional danger room. Reward for exploration. The fungus pulsing at 33 cycles per minute is a GHOST/lore touch — the frequency is everywhere, even in the biology.

-----

### 14. SIGNAL HOLLOW
**Hidden room. East side, below the Elder's Chamber.**

```
> DRAINAGE NEXUS — SIGNAL HOLLOW

[Room is only visible to players with GHOST ≥ 6]

A crack in the tunnel wall, barely wide enough to squeeze through.
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
in small letters: "THE SIGNAL WAS HERE BEFORE US."
```

- **Exits:** (back through crack to near Elder's Chamber / The Junction)
- **NPCs:** None (but The Signal faction leaves messages here — discovered later in Act 3)
- **Enemies:** None (the frequency keeps hostile entities away)
- **Objects:**
  - `antenna_array` — Examine: "Pointed straight down. Through the rock, through the deep tunnels, through the Abandoned Transit, all the way to the Substrate. Someone built this to listen. To what?"
  - `signal_relay` — **FAST TRAVEL NODE.** Requires GHOST ≥ 6 to use. Connects to other Signal Relay points in the network (Iron Bloom, Rooftop Network, Substrate Level). Lore: frequency hop on 33hz.
  - `parish_symbol` — Examine: "A circle with a line. You've seen it elsewhere in the tunnels — scratched into walls, painted on crates. The Parish uses it to mark places where the frequency is strong. They don't worship it. They just acknowledge it's there."
  - `carved_text` — Examine: "'THE SIGNAL WAS HERE BEFORE US.' Below that, in different handwriting: 'Before the city. Before the concrete. Before Helixion. It was always here.'"
- **Notes:** Hidden room. Endgame significance. This is one of the earliest touchpoints with The Signal faction, though players won't know that until Act 3. The fast travel node rewards GHOST investment with a concrete mechanical benefit.

-----

## ZONE EXITS SUMMARY

| From | Direction | To | Zone | Requirement |
|------|-----------|-----|------|------------|
| South Entry | up | Fringe (Ruins) | 4 | None |
| East Passage | east | Maintenance Tunnels | 9 | None (but drones patrol) |
| West Overflow | south | Industrial Drainage | 10 | None (but enemies) |
| The Deep Gate | down | Abandoned Transit | 11 | Deep Gate Key (quest reward) |
| Signal Hollow | relay | Various | — | GHOST ≥ 6 |

-----

## QUEST SUMMARY

| Quest | Giver | Tier | Type | Summary |
|-------|-------|------|------|---------|
| The New One | Doss | 1 | ESCORT | Find the dumped test subject before Helixion retrieval. Branch: save or exploit. |
| Supply Run | Doss | 1 | FETCH | Get water filters from scavenger cache in West Overflow. Negotiate, steal, or fight. |
| Serrano's Favor | Doss | 2 | DELIVERY | Carry a message to Dr. Serrano at Iron Bloom through dangerous tunnels. |
| The Deep Gate | Doss | 3 | INVESTIGATE | Something's coming through the gate. Find out what. Rewards Deep Gate Key. |
| Cole's Instruments | Cole | 2 | FETCH | Retrieve Cole's surgical tool from an abandoned Helixion clinic. Unlocks his backstory. |

-----

## ENEMY SUMMARY

| Enemy | Level | Location | Behavior | Drops |
|-------|-------|----------|----------|-------|
| Tunnel Rats | 1 | The Narrows | Passive until provoked, flee at low HP | Scrap, rat hide |
| Feral Augment | 2-3 | North Channel, West Overflow | Aggressive, patrols, erratic | Scrap cyberware, damaged implant |
| Scavenger Gang (2-3) | 2-4 | West Overflow | Territorial, won't enter Parish territory | CREDS, scrap weapons, salvage |
| Patrol Drone | 3-4 | East Passage | Scans, engages if detected, can be avoided | Drone components, data chip |
| Tunnel Crawler | 3-4 | The Seep | Ambush from water, high damage | Crawler hide, bio-sample |
| Chemical Leech (swarm) | 1-2 | The Seep | Attach and drain, swarm in 3-5 | Nothing (nuisance enemy) |

-----

## FREEMARKET PRESENCE

One Freemarket vendor stall operates in the Junction, near Mara's pump room:

- **KETCH** — Freemarket Fence
  - Sells: Information (NPC locations, quest hints, tunnel maps for other zones), luxury items (better food, clean water, stimulants), and occasionally weapons above what Mara stocks.
  - Buys: Data chips, Helixion intel, stolen goods.
  - Personality: Cheerful in a way that's clearly performance. Everything has a price. Knows things he shouldn't.
  - Disposition: Starts Neutral. Improves with purchases. The Freemarket remembers good customers.

-----

> 14 rooms. 4 named NPCs + 1 Freemarket vendor. 6 enemy types. 5 exits to other zones.
> The Drainage Nexus teaches you everything: navigation, combat, NPCs, shops, lore, danger, and the frequency — if you're paying attention.
