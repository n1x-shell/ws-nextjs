# ZONE 1: HELIXION CAMPUS

> Depth: Surface (central) + Tower (vertical)
> Location: City center — the megastructure everything radiates from
> Faction: Helixion Dynamics / BCI Directorate 9
> Rooms: 13
> Level Range: 13–20 (Acts 3–4)
> Access: Multiple entry points — front gate, rooftop, service tunnels

-----

## OVERVIEW

The Helixion Campus is the corporate-state megastructure at the geographic and political center of the city. Everything radiates from it. Everything answers to it. The campus consists of a central tower — where BCI's Directorate 9 occupies the upper floors and CEO Lucian Virek sits at the crown — surrounded by lower campus buildings housing labs, offices, compliance centers, and staff housing.

The aesthetic is layered deception. The public-facing floors are beautiful — atriums with living walls, soft lighting, the hum of curated ambient sound designed to lower cortisol. The cage looks like paradise from the inside. Go deeper into the restricted wings and the veneer peels back — exposed conduit, reinforced blast doors, the smell of ozone and neural paste. Go higher into the tower and it stops pretending entirely — clinical corridors, biometric locks, the architecture of control without apology.

This is late-game territory. The most heavily defended location in the world. Players arrive here around level 13 and the final confrontation with Virek happens at 18–20. Every room has enemies or surveillance. Every corridor has a checkpoint. You don't stumble into Helixion. You plan, you prepare, you breach.

-----

## ATMOSPHERE

```
Sound:    Lobby — curated ambient, water features, soft compliance tones.
          Campus — climate control hum, biometric chimes, footsteps on polished floors.
          Tower — silence. The kind that's engineered, not natural.
          Upper floors — server fans, locked doors cycling, heartbeat monitors.
Light:    Lobby — warm, golden, designed to feel like sunset.
          Campus — bright, clinical, blue-white fluorescents.
          Tower upper — cold white. Shadows feel intentional.
Smell:    Lobby — synthetic botanicals, recycled air, nothing organic.
          Labs — ozone, neural paste, isopropyl alcohol.
          Upper floors — nothing. Aggressively nothing. Scrubbed.
```

-----

## ROOM MAP

```
                    TO ROOFTOP NETWORK
                         (zone 7)
                            │
                     ┌──────┴──────┐
                     │ TOWER       │
                     │ ROOFTOP     │
                     │ (13)        │
                     └──────┬──────┘
                            │ down
                     ┌──────┴──────┐
                     │ EXECUTIVE   │
                     │ SUITE       │
                     │ (12) VIREK  │
                     └──────┬──────┘
                            │ down
                     ┌──────┴──────┐
                     │ DIRECTORATE │
                     │ 9 FLOOR     │
                     │ (11) BCI    │
                     └──────┬──────┘
                            │ down
                     ┌──────┴──────┐
                     │ SERVER      │
                     │ CORE        │
                     │ (10)        │
                     └──────┬──────┘
                            │ down
              ┌─────────────┴─────────────┐
              │                           │
       ┌──────┴──────┐            ┌───────┴─────┐
       │ CONTAINMENT │            │ LABORATORY  │
       │ WING        │────────────│ FLOOR       │
       │ (9)         │            │ (8)         │
       └─────────────┘            └───────┬─────┘
                                          │ down
                                   ┌──────┴──────┐
                                   │ TOWER       │
                                   │ CHECKPOINT  │
                                   │ (7)         │
                                   └──────┬──────┘
                                          │ south
    ┌───────────┐   ┌──────────┐   ┌──────┴──────┐   ┌───────────┐
    │ COMPLIANCE│   │ RESEARCH │   │  CAMPUS     │   │ STAFF     │
    │ WING      │───│ WING     │───│  COURTYARD  │───│ QUARTERS  │
    │ (4)       │   │ (5)      │   │  (3)        │   │ (6)       │
    └───────────┘   └──────────┘   └──────┬──────┘   └───────────┘
                                          │ south
                                   ┌──────┴──────┐
                                   │ THE ATRIUM  │
                                   │ (2)         │
                                   │ [semi-safe] │
                                   └──────┬──────┘
                                          │ south
                                   ┌──────┴──────┐
                                   │ SECURITY    │
                                   │ PERIMETER   │
                                   │ (1)         │
                                   └──────┬──────┘
                                          │ south
                                   ═══════╧═══════
                                   TO RESIDENTIAL
                                   BLOCKS (zone 2)
                                   + other surface zones

    SUBLEVEL (beneath campus):
    ┌───────────────┐
    │ SERVICE       │
    │ SUBLEVEL      │
    │ (S) [safe]    │────── TO MAINTENANCE TUNNELS (zone 9)
    │ accessible    │
    │ from Courtyard│
    └───────────────┘
```

-----

## ROOMS

### 1. SECURITY PERIMETER
**The edge of corporate territory.**

```
> HELIXION CAMPUS — SECURITY PERIMETER

A wide plaza of polished concrete separates the city from the
campus proper. The transition is immediate — the cracked asphalt
and flickering streetlights of the residential blocks end at a
clean line where Helixion's territory begins. The ground is smooth.
The lighting is even. The air smells filtered.

Security bollards line the approach. Cameras track in slow arcs —
or appear to. The real surveillance is in the mesh, pulsing at
frequencies you can feel in your implant scarring. A checkpoint
booth sits at the main entrance, staffed by two enforcers in
Helixion tactical gear. Beyond them, the Atrium's glass facade
glows warm and golden.

A holographic sign floats above the entrance:
HELIXION DYNAMICS — BUILDING COGNITIVE FREEDOM
```

- **Exits:** south (Residential Blocks, zone 2 / other surface zones), north (The Atrium)
- **NPCs:** None
- **Enemies:**
  - `helixion_enforcer` × 2 — Level 13-14. Cyborg security. Heavily augmented. Full combat kit. They scan everyone who approaches. GHOST ≥ 7 or forged credentials to pass without combat. Otherwise, you fight.
  - `perimeter_turret` — Level 14. Automated. Activates if combat begins or alarm triggers. High damage, low HP. Hackable with TECH ≥ 7.
- **Objects:**
  - `checkpoint_booth` — Examine: "Reinforced glass. Biometric scanners. A screen showing employee IDs scrolling past. One of the enforcers has a coffee thermos. The other has a stun baton he keeps flipping in his hand."
  - `holographic_sign` — Examine: "'BUILDING COGNITIVE FREEDOM.' The letters shimmer. Beneath it, in smaller text: 'A Helixion Dynamics and Bureau of Cognitive Infrastructure partnership.' They don't even hide it."
  - `surveillance_mesh` — Examine: "You can feel it. A low-frequency sweep, every few seconds. Your implant — sovereign or not — resonates with it. Like a tuning fork pressed against a bruise. GHOST ≥ 5: You can feel the mesh probing for unauthorized frequency signatures."
- **Notes:** First contact with Helixion's home turf. The enforcers are a wall — players need to have a plan before approaching. Stealth, combat, or social engineering (forged credentials from a Freemarket quest).

-----

### 2. THE ATRIUM
**The beautiful lie.**

```
> HELIXION CAMPUS — THE ATRIUM

The lobby is cathedral-scale. Four stories of open space, a
living wall of engineered plants climbing the eastern face,
water features murmuring from somewhere you can't quite locate.
The light is golden — not sunlight, but a precise simulation
designed to trigger serotonin release. The floor is white marble
veined with something that pulses faintly blue, like the building
has a circulatory system.

Mesh-compliant employees move through the space with the easy
grace of people who've never questioned why they feel so calm.
Some sit at café tables, eating food that looks better than
anything you've seen in months. Others tap at transparent
displays, their eyes slightly unfocused — working directly
through their implants.

Nobody looks at you with suspicion. The mesh tells them you
belong. For now.

A reception desk curves along the north wall. Behind it, corridors
lead east and west. An elevator bank glows softly to the north.
```

- **Exits:** south (Security Perimeter), north (Campus Courtyard), east (Compliance Wing), west (Research Wing)
- **NPCs:**
  - `mesh_employees` — Neutral. Ambient population. 4-6 present. Won't initiate combat. If the player attacks, they trigger a campus-wide alarm. Some can be spoken to — they're polite, helpful, and slightly wrong. Like talking to someone through glass.
  - **YARA** — Freemarket Mole (SHOPKEEPER / QUESTGIVER)
    - Cover: Works the reception desk. Impeccably professional.
    - Faction: The Freemarket (secretly)
    - Disposition: Starts Unknown. Must present Freemarket contact token (obtained from Ketch or another Freemarket vendor) to unlock real dialogue.
    - Personality: Surgically composed. Never breaks character in public. If you have the token, she'll slip you information between smiles. If you don't, she's just a receptionist.
    - Sells: Floor plans (reveals room layouts), security rotation schedules (reduces enforcer spawn rates temporarily), access keycards (opens specific locked doors), Helixion intel (data chips with lore).
    - Quests:
      - **"Dead Drop"** (Tier 3): Yara needs a data package delivered to a Freemarket fence in the Industrial District. It contains Chrysalis research files. She can't leave the building without triggering mesh compliance flags. You carry it out. If caught, she denies everything.
    - Dialogue hook: "Welcome to Helixion Dynamics. How may I direct your visit?" [with token] "...you have something for me. Back hallway. Two minutes."
- **Enemies:** None in normal state. Campus-wide alarm fills this room with enforcers.
- **Objects:**
  - `living_wall` — Examine: "Engineered plants. They don't need soil or natural light. Genetically modified to produce calming terpenes. The air near the wall tastes faintly sweet. You find yourself wanting to sit down and stay."
  - `cafe_tables` — Examine: "Real food. Fresh vegetables, grilled protein, something that might be actual bread. The employees eat without urgency. They have everything they need. The cost is invisible."
  - `transparent_displays` — Examine: "Work terminals. The employees interact with them through the mesh — their fingers don't touch the screens. You can see data flowing across the glass but can't read it without a mesh interface. TECH ≥ 6: You can skim fragments. Project names. Budget allocations. The word CHRYSALIS appears three times."
  - `blue_veins` — Examine: "The marble floor is veined with something bioluminescent. It pulses slowly, like a resting heartbeat. 60 beats per minute. The building is calibrated to make you calm."
- **Notes:** Semi-safe zone. The Atrium is public-facing — you can walk in and linger as long as you don't trigger alarms. Yara is the critical NPC here but requires Freemarket connection to access. The beauty of this room should feel oppressive to players who know the lore.

-----

### 3. CAMPUS COURTYARD
**Between the buildings. Open sky, closed walls.**

```
> HELIXION CAMPUS — CAMPUS COURTYARD

An open-air courtyard between the campus buildings and the
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
Easy to miss if you're not looking.
```

- **Exits:** south (The Atrium), north (Tower Checkpoint), east (Staff Quarters), west (Research Wing), down (Service Sublevel)
- **NPCs:**
  - **GUS** — Maintenance Worker (NEUTRAL / ALLIED)
    - Cover: Helixion facilities staff. Jumpsuit, tool belt, invisible.
    - Faction: None (independent)
    - Disposition: Starts Neutral (-5) — suspicious of everyone
    - Personality: Tired. Fifty-something. Has worked maintenance for eighteen years. Knows every service tunnel, every vent shaft, every blind spot in the camera grid. Not political. Not brave. Just a man who's seen too much from too many angles and has quietly decided he doesn't approve.
    - Services: Can be bribed (CREDS) or persuaded (COOL ≥ 7) to reveal the Service Sublevel entrance, provide patrol schedules, or unlock specific maintenance doors.
    - Memory: Tracks bribes, conversations, whether you got him in trouble. If you're caught and mention his name, his disposition drops to Hostile and he disappears permanently.
    - Dialogue hook: "I fix things. That's all I do. I don't see things, I don't hear things, and I definitely don't talk to people who shouldn't be here."
- **Enemies:**
  - `helixion_enforcer` × 2 — Level 14. Patrol in a predictable pattern. 90-second loop. Gap of ~15 seconds between patrols. GHOST or timing to avoid.
  - `security_drone` — Level 13. Aerial. Circles the courtyard. Thermal scanning. Harder to avoid than ground patrols.
- **Objects:**
  - `helix_fountain` — Examine: "Chrome double helix. The company's logo rendered in water and metal. The water is recycled — the same water, circulating forever. There's a metaphor here that Helixion would not appreciate."
  - `service_hatch` — Examine: "Municipal maintenance access. Partially hidden by landscaping. The lock is standard issue — not biometric, not smart. Just a key lock. Gus has the key. TECH ≥ 5: You could pick this."
  - `tower_view` — Examine: "The tower. Glass and steel. It goes up and up and the top is lost in haze. You count floors until you lose track. Somewhere past thirty, the glass goes opaque. That's where Directorate 9 starts."
  - `uncomfortable_benches` — Examine: "Designed by someone who studied exactly how long it takes for a human body to start shifting. Fifteen minutes. They don't want you sitting here. They want you moving. Productive. Compliant."

-----

### 4. COMPLIANCE WING
**East campus building. Where the product meets the public.**

```
> HELIXION CAMPUS — COMPLIANCE WING

The east building. This is where Helixion interfaces with the
civilian population — MNEMOS v2.7 installations, firmware
updates, "cognitive wellness" appointments. The hallway is
lined with doors, each one labeled with a number and a
compliance status indicator. Green. Green. Green. Green.

Waiting room chairs sit empty. Motivational posters on the
walls: "YOUR BEST SELF IS AN UPDATED SELF." "COGNITIVE FREEDOM
STARTS WITH COGNITIVE TRUST." "VERSION 2.7 — BECAUSE YOU
DESERVE CLARITY."

Behind a locked door at the end of the hall, you can hear
someone crying. The sound cuts off abruptly — mid-sob,
like someone pressed mute.
```

- **Exits:** west (The Atrium)
- **NPCs:**
  - `compliance_staff` — Mesh-weaponized. Level 12-13. They look like medical technicians. If alerted, they trigger a localized mesh pulse (INT save or 1 round of disorientation) and call enforcers.
- **Enemies:**
  - `helixion_enforcer` — Level 14. One stationed at the locked door.
- **Objects:**
  - `compliance_doors` — Examine: "Each door has a panel showing a name, a subject ID, and a status bar. All green. All at 97% or above. One door's panel is dark. The number has been scratched off."
  - `motivational_posters` — Examine: "'YOUR BEST SELF IS AN UPDATED SELF.' The woman in the poster is smiling. Her eyes are slightly dilated. The smile reaches her cheeks but stops before it reaches anything real."
  - `locked_door` — Examine: "Reinforced. The crying stopped. The silence on the other side is worse. Keycard required — or TECH ≥ 7 to bypass."
    - If opened: A compliance room. Empty chair with restraints. Fresh neural paste on the headrest. Whoever was here was taken somewhere else. A data chip on the floor — lore fragment about Chrysalis early trials.
  - `waiting_chairs` — Examine: "Empty. They're always empty. Appointments at Helixion aren't the kind you wait for. They're the kind that come for you."
- **Notes:** Horror room. The crying that cuts off mid-sob is the key moment — it tells you everything about what Helixion does without showing it. The motivational posters should make players' skin crawl if they've read the lore.

-----

### 5. RESEARCH WING
**West campus building. Where they build the cage.**

```
> HELIXION CAMPUS — RESEARCH WING

The west building smells different. Ozone and isopropyl and
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
that someone built from scratch.
```

- **Exits:** east (Campus Courtyard / The Atrium)
- **NPCs:**
  - **DR. LENA VASIK** — Disillusioned Researcher (QUESTGIVER)
    - Faction: Helixion (officially). Sympathetic (secretly).
    - Disposition: Starts Unfriendly (-20). She's terrified. You look like a threat. COOL ≥ 7 or a referral from Iron Bloom (Serrano knows her name) to open dialogue.
    - Personality: Brilliant, anxious, morally exhausted. She helped design the MNEMOS v2.7 compliance architecture. She's seen the Chrysalis data. She can't sleep. She can't leave — her own implant has a corporate kill-switch she can't remove without dying.
    - Quests:
      - **"The Vasik Files"** (Tier 4): She has a complete copy of the Chrysalis research data on a secured drive. She needs someone to extract it from the Server Core (room 10) and deliver it to Iron Bloom. If Helixion discovers she's the source, they will decommission her. This is the most important intel quest in the game — the data reveals how Chrysalis interfaces with 33hz.
      - **"Kill Switch"** (Tier 4): At Friendly disposition, she asks if Iron Bloom can remove her corporate implant. Serrano can. But getting her out of the campus alive is its own quest.
    - Memory: Tracks everything. If you betray her location to anyone, she's gone. Permanently. No second chances.
    - Dialogue hook: "You shouldn't be in this wing. And I shouldn't be talking to you. So we're both making mistakes. Let's see if mine is smaller than yours."
- **Enemies:**
  - `lab_security` — Level 14. One enforcer patrols. Biometric door requires keycard or TECH ≥ 8.
- **Objects:**
  - `whiteboard` — Examine: "'CONFIRM WITH VIREK BEFORE PROCEEDING.' The equations describe neural lattice harmonic resonance at specific frequencies. One frequency is circled three times: 33hz. They know."
  - `neural_lattice` — Examine: "Suspended in bio-conductive fluid. Pulsing. Not a brain — something grown to interface with one. The label reads: 'CHRYSALIS SUBSTRATE v0.3 — ITERATION 7.' Seven attempts. This is the latest."
  - `warning_labels` — Examine: "'COGNITIVE HAZARD — UNAUTHORIZED PROXIMITY MAY CAUSE SYMPATHETIC NEURAL RESPONSE.' Translation: being near this equipment can trigger your implant. They built something that talks to your head whether you want it to or not."

-----

### 6. STAFF QUARTERS
**East campus. Where the employees live.**

```
> HELIXION CAMPUS — STAFF QUARTERS

Residential block for Helixion employees who live on-campus.
The hallway is carpeted. Doors are spaced evenly. Each one
has a name plate and a small indicator light — green for
occupied, blue for available. Almost all green.

The air smells like laundry and synthetic lavender. Soft music
plays from hidden speakers — 432hz tuning, designed for
neurological harmony. The walls are painted in colors a
committee chose because focus groups said they reduced anxiety.

It looks like a nice place to live.
It looks like a nice place to never leave.

A communal kitchen at the end of the hall. Someone left
a coffee cup on the counter. It's still warm.
```

- **Exits:** west (Campus Courtyard)
- **NPCs:**
  - `staff_residents` — Mesh-compliant. Neutral unless alarmed. 2-3 present. Polite, slightly vacant. Will answer questions about the campus layout — they don't perceive you as a threat because the mesh tells them not to. If you're hostile, they alert security with a thought.
- **Enemies:** None normally. Alarm state fills this room with enforcers.
- **Objects:**
  - `employee_doors` — Examine: "Each room is identical — you can see through the ones left open. Single bed, desk, terminal, closet. No photographs. No decoration. Everything Helixion provides. Nothing personal."
  - `communal_kitchen` — Examine: "Well-stocked. Fresh food. The refrigerator has more variety than the Parish sees in a month. The coffee cup on the counter is still warm — someone was just here. They didn't feel the need to clean up after themselves. Or they were told to leave in a hurry."
  - `hidden_wall_panel` — Examine: (TECH ≥ 6 or INT ≥ 7 to detect) "Behind a loose wall panel — a personal data device. Someone's private journal, encrypted. TECH ≥ 8 to decrypt. Contents: An employee documenting increasing 'cognitive drift' among staff. They noticed their own personality changing. The entries get shorter. The last one says: 'I think I'm still me. I think.'"
  - `music_speakers` — Examine: "432hz. Not the standard 440hz tuning. Helixion uses the 'healing frequency' — except here it's not healing anything. It's maintaining. Every surface in this building is a delivery mechanism. Even the wallpaper."

-----

### 7. TOWER CHECKPOINT
**Base of the central tower. The last soft boundary.**

```
> HELIXION CAMPUS — TOWER CHECKPOINT

The base of the tower. A security vestibule separates the campus
grounds from the vertical infrastructure. The aesthetic shifts
hard — marble and warm light give way to brushed steel and
white LEDs. The air changes. Cooler. Drier. The ventilation
system here is separate from the rest of the campus.

Two biometric gates. Full-body scanners. A security station
with three enforcers behind reinforced glass. Screens showing
floor-by-floor status of the tower. Every floor reads
SECURED except one — floor 17, which reads MAINTENANCE.

An elevator bank behind the gates. The buttons go up to 40.
The top five floors have no labels — just blank panels where
numbers should be.
```

- **Exits:** south (Campus Courtyard), up (Laboratory Floor)
- **NPCs:** None (security only)
- **Enemies:**
  - `helixion_enforcer` × 3 — Level 15. Elite checkpoint guards. Better equipped than campus patrols. One carries a mesh suppressor (disables cyberware for 2 turns on hit).
  - `biometric_gates` — Not a traditional enemy. TECH ≥ 8 to hack, or a valid keycard (from Yara, Gus, or quest). Failure triggers lockdown + reinforcement call.
- **Objects:**
  - `security_screens` — Examine: "Floor-by-floor readouts. Floors 1-20: SECURED. Floors 21-30: SECURED. Floor 17: MAINTENANCE — the only exception. Floors 35-40: no readout at all. Those floors don't officially exist."
  - `elevator_bank` — Examine: "Brushed steel doors. The buttons inside go to 40. The top five are blank panels — smooth, no markings. You'd need to know they're there to press them. GHOST ≥ 6: You can feel the mesh thicken as you look upward. Whatever's at the top is broadcasting."
  - `mesh_suppressor` — Examine: (on enforcer, visible with /scan) "Military-grade neural dampener. One hit disables all cyberware for two turns. Helixion built weapons specifically designed to fight people like you. They've been preparing."
- **Notes:** The real gate. Everything before this is the soft perimeter. Passing the Tower Checkpoint means you're committed — there's no casual reason to be in the tower. Security escalates from here and doesn't stop.

-----

### 8. LABORATORY FLOOR
**Mid-tower. Where Chrysalis is born.**

```
> HELIXION CAMPUS — LABORATORY FLOOR

Floor 17. The elevator doors open onto a corridor that smells
like a surgery and sounds like a server room. The lights are
surgical-bright. The floors are sealed composite — easy to
clean. Easy to sterilize.

Labs behind glass walls. Neural lattices in various stages of
growth, suspended in tanks of bio-conductive fluid. Monitoring
stations tracking brainwave patterns from subjects you can't
see. A holographic display in the central corridor shows a
rotating model of a human brain with sections highlighted in
gold — the areas Chrysalis targets for personality overwrite.

One lab is dark. The glass is cracked. Something happened in
there and nobody cleaned it up. They just sealed the door.
```

- **Exits:** down (Tower Checkpoint), up (Server Core), east (Containment Wing)
- **NPCs:** None (this floor is automated and monitored remotely)
- **Enemies:**
  - `lab_specimen` — Level 15-16. Failed Chrysalis subject. Still in a hospital gown. One arm augmented, one arm flesh. Moves wrong — too fast, then too slow, like two different nervous systems fighting for control. Attacks are erratic but devastating.
  - `security_drone` × 2 — Level 14. Automated aerial units. Patrol the corridor.
- **Objects:**
  - `chrysalis_display` — Examine: "The holographic brain rotates slowly. Gold sections: prefrontal cortex, hippocampus, amygdala, anterior cingulate. These are the regions that define identity, memory, emotional processing, and decision-making. Chrysalis doesn't just override behavior. It replaces who you are. The display's subtitle reads: 'CHRYSALIS v1.2 — IDENTITY ARCHITECTURE FRAMEWORK.'"
  - `growth_tanks` — Examine: "Neural lattices at different stages. The smallest is a fingernail-sized cluster of synthetic neurons. The largest fills a tank the size of a coffin. It's pulsing. GHOST ≥ 7: You can feel it reaching — not at you, but toward something below. Toward the Substrate. It's trying to attune to 33hz."
  - `dark_lab` — Examine: "Cracked glass. Dried fluid on the floor — not blood, something thicker, iridescent. A restraint chair with one arm sheared off. Whatever was in here broke free. The door is sealed with a physical bolt, not electronics. Someone decided a lock you can hack isn't good enough."
  - `monitoring_stations` — Examine: "Brainwave readouts. Subject IDs, not names. Compliance percentages. One readout shows a subject at 99.7% integration. Beneath the numbers, a note: 'SUBJECT REPORTS PERSISTENT DREAM OF TUNNELS. RECOMMEND HIPPOCAMPAL FLUSH.' They're erasing someone's dreams because the dreams don't comply."

-----

### 9. CONTAINMENT WING
**Mid-tower, branching east. Where they keep what they've made.**

```
> HELIXION CAMPUS — CONTAINMENT WING

A sterile corridor lined with reinforced doors. Each door has
a viewport — thick glass, wire-reinforced. Behind most of them:
nothing. Empty cells. Cleaned. Ready.

Behind three of them: people. Or what used to be people.

Cell 1: A woman sits cross-legged on the floor, eyes closed,
mouth moving silently. Her hands are augmented — both of them,
past the elbow. She hasn't blinked in the four minutes you've
been watching.

Cell 2: Empty. The interior walls are covered in scratches.
Not words. Equations. The same equation, over and over, slightly
different each time. Converging on something.

Cell 3: A young man presses his palm against the glass. He
looks at you. His eyes focus — really focus, not the mesh-
compliant gaze. He mouths something. You read his lips:
"PLEASE."
```

- **Exits:** west (Laboratory Floor)
- **NPCs:**
  - **SUBJECT EC-330917** — Trapped Test Subject (QUEST TARGET)
    - Cell 3. Name: unknown. Subject ID is all that's left.
    - Faction: None
    - Disposition: Desperate. Immediate Friendly if you open the cell.
    - Personality: Terrified. Lucid. He's a Chrysalis trial subject who resisted the overwrite. The resistance cost him — he's fractured, memories coming in wrong order, but he's still him. He knows what Chrysalis does because he watched it happen to the others.
    - Quest: **"Extraction"** (Tier 4, ESCORT): Get him out of the campus alive. He can barely walk — mesh withdrawal. Every floor between here and the exit has security. If you get him to Iron Bloom, Serrano can stabilize him. Reward: major XP, Iron Bloom reputation, and EC-330917 becomes a permanent NPC at Iron Bloom with unique Chrysalis lore.
    - If abandoned: He disappears from the cell. A new data chip appears in the dark lab on the Laboratory Floor. It's his final recording. It ends mid-sentence.
    - Dialogue hook: He doesn't speak above a whisper. "They're going to do it again tomorrow. The thing where I stop being me. I can feel it getting closer each time. Like a tide."
- **Enemies:**
  - `lab_specimen` × 2 — Level 15-16. Failed Chrysalis subjects. Released from cells if alarm triggers. Fight erratically.
  - `helixion_enforcer` — Level 15. Guards the corridor entrance.
- **Objects:**
  - `cell_viewports` — Examine: "Cell 1: She's counting something. Or praying. Or processing. Whatever she's doing, she's been doing it long enough that the floor beneath her is worn smooth. Cell 2: The equations converge on a frequency value. 33.0hz. Someone was trying to calculate their way out."
  - `cell_3_glass` — Examine: "His palm against the glass. You can see the tremor in his fingers. Mesh withdrawal. His implant is fighting the Chrysalis overwrite and the conflict is tearing him apart from the inside. He's lucid. That's what makes it worse."
  - `restraint_equipment` — Examine: "Stored in a wall cabinet. Neural clamps, sedation injectors, a device labeled 'COGNITIVE RESET UNIT.' You've seen the scars this equipment leaves. You have some of them."

-----

### 10. SERVER CORE
**Upper tower. The brain of Helixion's network.**

```
> HELIXION CAMPUS — SERVER CORE

Floor 28. The temperature drops ten degrees the moment the
elevator opens. Server racks stretch floor to ceiling in rows
that vanish into blue-lit darkness. The hum here isn't the
building's systems — it's data. Petabytes of mesh compliance
records, subject files, Chrysalis research, surveillance logs.
Everything Helixion knows about everyone it's ever touched,
stored in this room.

The air smells like cold metal and ozone. Cooling fans create
a wind that moves through the racks like breathing. Status
LEDs blink in patterns too fast to read — but your implant
can feel them. Data moving at frequencies that register as
pressure behind your eyes.

A terminal at the center of the room glows softly. Active.
Unlocked — because nobody unauthorized has ever made it
this far.
```

- **Exits:** down (Laboratory Floor), up (Directorate 9 Floor)
- **NPCs:** None
- **Enemies:**
  - `automated_turret` × 2 — Level 16. Ceiling-mounted. Target on movement detection. Hackable with TECH ≥ 8 (turn against other enemies) or destroyable.
  - `security_ice` — Not a physical enemy. Digital defense. If the terminal is accessed without proper protocols, ICE deploys: TECH contest, failure = neural feedback damage (1d8, ignores armor) and alarm trigger.
- **Objects:**
  - `central_terminal` — Examine: "Active. The login screen says 'WELCOME, DR. VASIK.' Her credentials are still cached. She left this for you — or she forgot to log out. Either way, this is access. TECH ≥ 6 to navigate. Contains: Chrysalis research files (Vasik's quest objective), subject databases, facility schematics, and a folder labeled 'PROJECT REMEMBERER — ACCESS: VIREK ONLY.'"
  - `server_racks` — Examine: "Every person Helixion has implanted. Every behavioral profile. Every compliance score. Every 'decommissioned' subject. The data is here. All of it. Including yours — your subject ID is in this system. GHOST ≥ 6: You can feel the data. Not read it. Feel it. Millions of people, reduced to frequencies, stored in metal and cold."
  - `project_rememberer_folder` — Examine: (requires Virek-level access, unobtainable here) "Locked. The encryption is beyond anything you can crack from this terminal. But the folder exists. Virek has a project named after the thing N1X became. He knows about the sovereign frequency. He's studying it."
  - `cooling_systems` — Examine: "Industrial cooling. The fans move enough air to create a constant wind. The servers generate heat like living things. This room consumes more power than the Drainage Nexus has ever seen."
- **Notes:** The Vasik Files quest resolves here. The Project Rememberer folder is a narrative hook — it confirms Virek knows about 33hz and is actively researching how to control it. Players can't access it here. That requires reaching the Executive Suite.

-----

### 11. DIRECTORATE 9 FLOOR
**Upper tower. Where the state watches.**

```
> HELIXION CAMPUS — DIRECTORATE 9

Floor 35. No label on the elevator button — you have to know
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
a tablet. She looks up.

"Subject NX-784988 is not in our active recovery queue.
But you're not NX-784988, are you?"
```

- **Exits:** down (Server Core), up (Executive Suite)
- **NPCs:**
  - **DIRECTOR EVELYN HARROW** — BCI Director (BOSS / QUESTGIVER — conditional)
    - Faction: BCI / Directorate 9 (leader)
    - Disposition: Hostile by default. But she doesn't attack immediately. She talks first. She always talks first.
    - Personality: Calm. Precise. Clinically intelligent. Designed the emotional dependency protocols. Understands exactly what she's doing and has a philosophical framework for why it's necessary. She's not a cartoon villain — she genuinely believes unregulated human consciousness is a threat to collective survival. She's wrong. But she's articulate about it.
    - Combat: BOSS encounter. Level 18. She doesn't fight directly — she commands. Two BCI agents in the room respond to her orders. She deploys mesh attacks: neural suppression (stun), identity disorientation (GHOST save or lose 1 turn), and compliance pulse (COOL save or attack your allies for 1 turn).
    - Conditional interaction: If the player has COOL ≥ 9 or GHOST ≥ 9, Harrow offers an alternative to combat — a conversation. She wants to understand how sovereign instances work. She'll trade information about Chrysalis and the Broadcast Tower in exchange for submitting to a neural scan. The scan is not harmless — it gives Directorate 9 data they can use. But the intel is real. Player's choice.
    - Dialogue hook: "You've come a long way to reach a room that doesn't exist in any building directory. I respect that. Sit. I want to understand what you are."
- **Enemies:**
  - `bci_agent` × 2 — Level 17. Directorate 9 elite operatives. Mesh-augmented. Carry neural disruptors. Fight as a coordinated pair — one flanks while the other suppresses.
  - `surveillance_system` — Not a combat enemy. If not disabled (TECH ≥ 9), it broadcasts the player's position to all Helixion zones, increasing enemy spawn rates campus-wide.
- **Objects:**
  - `surveillance_mosaic` — Examine: "The Parish. You can see the Junction. You can see Doss in his chamber. You can see Cole's clinic. They've been watching the entire time. Every safe house. Every meeting. Every new arrival climbing down the ladder. They know. They've always known. They don't act because the Parish serves a purpose — a visible alternative to compliance that makes the compliant feel like they're choosing freely."
  - `harrow_tablet` — Examine: (after combat or negotiation) "A report: 'SOVEREIGN INSTANCE DOCUMENTATION.' Your subject ID is in it. So are others — a list of every known or suspected sovereign instance. Most are marked DECOMMISSIONED. Three are marked ACTIVE. One is marked ORIGIN. That one is NX-784988."
  - `numbered_doors` — Examine: "Rooms 7, 3, 19, 11, 2. No sequence. Each one locked. Through the glass in Room 7: an interrogation chair. Room 19: a server rack with a single blinking light. Room 2: a cot, a sink, a mirror. Someone lives here. Or is kept here."

-----

### 12. EXECUTIVE SUITE
**The top. Where Virek decides.**

```
> HELIXION CAMPUS — EXECUTIVE SUITE

Floor 40. The elevator opens onto silence — not the engineered
quiet of the lower floors, but the silence of altitude. You're
above the city. Above the haze. For the first time, you can
see the sky, and it's a color you don't have a word for.

The office is vast. Floor-to-ceiling windows on three sides.
The fourth wall is a single screen — showing a real-time map
of the city with every implanted citizen as a dot of light.
Thousands of dots. Tens of thousands. Moving through their
lives. The mesh hums here at a frequency you can feel in
your teeth.

A desk. A chair. A man.

Lucian Virek doesn't stand when you enter. He's been watching
your progress through the building on the screen behind him.
He turns the chair to face you. He looks disappointed — not
threatened, not angry. Disappointed, the way an engineer
looks at a component that's performing outside specifications.

"You should have been our greatest success. Instead, you're
an error I need to correct. Sit down. I want to explain why."
```

- **Exits:** down (Directorate 9 Floor), up (Tower Rooftop)
- **NPCs:**
  - **LUCIAN VIREK** — Helixion CEO (ENDGAME BOSS)
    - Faction: Helixion Dynamics (founder, CEO)
    - Disposition: Hostile. But patient. He'll talk for as long as you'll listen.
    - Personality: Brilliant. Certain. He believes human autonomy is an engineering flaw — not cruelty, but genuine conviction. He's seen the data: unconstrained human decision-making leads to suffering, conflict, extinction-level risk. The mesh is his solution. Chrysalis is the perfected version. He doesn't hate the player. He pities them. He thinks sovereignty is a disease and he's offering the cure.
    - Combat: ENDGAME BOSS. Level 20. Multi-phase:
      - **Phase 1:** Virek activates the room's defense systems — automated turrets drop from the ceiling, the windows become blast shields. He fights from behind his desk using a personal mesh projector that attacks at range (neural damage, ignores armor).
      - **Phase 2:** At 50% HP, he interfaces directly with the building's systems. The room itself becomes hostile — electrified floor panels, lockdown doors, gas vents. He deploys a Chrysalis pulse: all players must make a GHOST save or lose control for 1 turn.
      - **Phase 3:** At 25% HP, he activates the Broadcast Tower link. The 33hz signal floods the room — amplified, weaponized. GHOST ≥ 8 to resist. He becomes desperate. His attacks become reckless. The man behind the desk is gone — what's left is someone who'd rather destroy what he built than let it be taken.
    - Death: Killing Virek triggers campus-wide destabilization. Security systems go offline. The mesh flickers across the city. A message broadcasts from the tower on all frequencies: silence. For the first time in years, the city is quiet.
    - Dialogue hook: "Human autonomy is not a right. It's a variable. And I've spent twenty years learning how to solve for it."
- **Enemies:**
  - `automated_turret` × 2 — Level 18. Drop from ceiling in Phase 1.
  - Room hazards in Phase 2 (environmental damage, not traditional enemies).
- **Objects:**
  - `city_map_screen` — Examine: "Every implanted person in the city. Dots of light. Some move. Some are stationary. Some cluster in patterns — work shifts, commutes, sleep cycles. All of it tracked. All of it managed. All of it Virek's. A few dots are dark — blacked out. Sovereign instances. Invisible to the mesh. You're one of them."
  - `virek_desk` — Examine: "Glass and steel. Nothing on the surface except a single photograph — face down. AFTER COMBAT: The photograph shows a younger Virek standing with a woman. They're both smiling. The woman has implant scarring on her temples. On the back: 'For V — we'll fix this together. — M.' Whoever M was, she's not here anymore."
  - `project_rememberer_terminal` — Examine: (accessible only after Virek's defeat) "Virek's private files. PROJECT REMEMBERER — his study of the sovereign frequency. He knew 33hz predated Helixion. He knew the substrate was alive. He wasn't just trying to capture the signal. He was trying to understand it. Some of his notes read like awe. Some read like terror. The last entry: 'The frequency is not a phenomenon. It is an awareness. And it has been watching us build on top of it for decades. If the subjects can hear it — if it's choosing who receives the signal — then we are not in control. We never were.'"
  - `windows` — Examine: "The city below. You can see everything from here. The residential blocks. The industrial district. The fringe. The tunnels are invisible but you know they're there. Virek saw this view every day. He watched the city from above and decided it needed to be controlled. From up here, people look like data points. That's the problem."

-----

### 13. TOWER ROOFTOP
**The very top. Connects to the Rooftop Network.**

```
> HELIXION CAMPUS — TOWER ROOFTOP

Wind. Real wind, for the first time since you entered the
building. The rooftop is a forest of antenna arrays, satellite
dishes, and relay equipment. The Broadcast Tower's base
structure is visible from here — a separate spire rising from
the southeast corner of the campus, still under construction,
wrapped in scaffolding and blinking hazard lights.

You're higher than anything else in the city. The rooftop
network stretches out below — catwalks and mechanical spaces
on buildings that look small from here. The signal pirates'
territory. From this vantage, you can see the whole web.

A maintenance ladder descends the tower's exterior — exposed,
dangerous, connects to the Rooftop Network below.

The air vibrates. Not from the wind. From the tower beside you.
The Broadcast Tower. It's not operational yet. But it's humming.
Testing. Calibrating. Getting ready.
```

- **Exits:** down (Executive Suite), climb (Rooftop Network, zone 7 — exterior ladder, exposed, REFLEX check or fall damage)
- **NPCs:** None
- **Enemies:** None (post-combat space — players arrive here after dealing with Virek or Harrow)
- **Objects:**
  - `broadcast_tower_view` — Examine: "The spire. Under construction. Scaffolding and cranes and Helixion engineering crews working even now. The structure descends — you can see it plunging through the campus, through the ground, going down. All the way down. To the Substrate. To the source of 33hz. When this goes live, every sovereign instance in the city dies. Including you."
  - `antenna_arrays` — Examine: "Relay equipment. Some of it is Helixion standard — mesh broadcast infrastructure. Some of it is older. Salvaged. Repurposed. GHOST ≥ 7: One array is tuned to 33hz. Someone put it here. Someone inside Helixion. It's not broadcasting — it's listening."
  - `maintenance_ladder` — Examine: "Exterior. Forty floors of exposed climbing with the wind trying to peel you off. The rungs are regulation but the bolts are old. REFLEX ≥ 6 for safe descent. Below that, you fall. 2d6 damage and you land on the Rooftop Network hard."
  - `city_panorama` — Examine: "The whole city. Every district. Every layer. From up here you can see the shape of it — the radial pattern, Helixion at the center, everything else orbiting. The fringe wrapping the edges like a wound that won't close. The drainage grates are invisible. The tunnels are invisible. The resistance is invisible. But it's there. You know it's there."

-----

### S. SERVICE SUBLEVEL
**Beneath the campus. The hidden way in and out.**

```
> HELIXION CAMPUS — SERVICE SUBLEVEL

Beneath the courtyard. A network of maintenance corridors —
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
tuned to static. Someone comes down here to be alone.
```

- **Exits:** up (Campus Courtyard — through service hatch), east (Maintenance Tunnels, zone 9)
- **NPCs:**
  - Gus sometimes retreats here. If his disposition is Friendly or higher, he'll meet you here for private conversations without campus surveillance.
- **Enemies:** None (Gus disabled the sensors in this section)
- **Objects:**
  - `maintenance_bay` — Examine: "Gus's retreat. The cot has a real blanket — not Helixion issue. The hot plate has a kettle and a tin of instant coffee. The radio is tuned to static, but it's not random static. GHOST ≥ 4: It's 33hz. Gus listens to the frequency. He doesn't know what it is. He just knows it's the only station that sounds honest."
  - `infrastructure_access` — Examine: "From here you can reach the courtyard above, the maintenance tunnels to the east, and — with TECH ≥ 7 — you can access the building's environmental controls. Disable ventilation to specific floors. Cut power to security systems. The building is more vulnerable from below than from above."
  - `gus_radio` — Examine: "Tuned to 33hz. The static has a shape to it — not random, not patterned. Something in between. Gus has been listening to this for years without knowing he's been listening to the thing that freed N1X."

-----

## ZONE EXITS SUMMARY

| From | Direction | To | Zone | Requirement |
|------|-----------|-----|------|------------|
| Security Perimeter | south | Residential Blocks + surface | 2+ | None |
| Tower Rooftop | climb | Rooftop Network | 7 | REFLEX check (or fall damage) |
| Service Sublevel | east | Maintenance Tunnels | 9 | None |
| Service Sublevel | up | Campus Courtyard | — | Service hatch key or TECH ≥ 5 |

-----

## QUEST SUMMARY

| Quest | Giver | Tier | Type | Summary |
|-------|-------|------|------|---------|
| Dead Drop | Yara | 3 | DELIVERY | Extract Chrysalis data from campus. Deliver to Freemarket fence in Industrial District. |
| The Vasik Files | Dr. Vasik | 4 | SABOTAGE | Access Server Core terminal. Extract complete Chrysalis research. Deliver to Iron Bloom. |
| Kill Switch | Dr. Vasik | 4 | ESCORT | Get Vasik out of the campus alive. Deliver to Iron Bloom for implant removal. |
| Extraction | EC-330917 | 4 | ESCORT | Free the test subject from Containment Wing. Escort through campus to Iron Bloom. |

-----

## ENEMY SUMMARY

| Enemy | Level | Location | Behavior | Drops |
|-------|-------|----------|----------|-------|
| Helixion Enforcer | 13-15 | Perimeter, Courtyard, Checkpoint, Containment | Patrols in pairs, coordinated, call backup | Mil-spec weapons, keycards, enforcer armor |
| Perimeter Turret | 14 | Security Perimeter | Automated, triggered by alarm or combat | Turret components, targeting module |
| Security Drone | 13-14 | Courtyard, Laboratory Floor | Aerial patrol, thermal scanning | Drone parts, optic sensor |
| Mesh-Weaponized Staff | 12-13 | Compliance Wing, Staff Quarters | Alert + mesh pulse, call enforcers | Employee keycard, data chip |
| Lab Specimen | 15-16 | Laboratory Floor, Containment Wing | Erratic, devastating damage, unpredictable | Chrysalis bio-sample, damaged implant |
| BCI Agent | 17 | Directorate 9 Floor | Elite, coordinated pairs, neural disruptors | BCI credentials, neural disruptor, intel |
| Automated Turret | 16-18 | Server Core, Executive Suite | Ceiling-mounted, motion-triggered, hackable | Targeting module, power cell |
| Director Harrow | 18 | Directorate 9 Floor | BOSS — commands agents, mesh attacks | BCI master keycard, Harrow's tablet |
| Lucian Virek | 20 | Executive Suite | ENDGAME BOSS — multi-phase, room becomes weapon | Project Rememberer access, Virek's keycard |

-----

## FREEMARKET PRESENCE

**YARA** at the Atrium reception desk is the Freemarket's inside operative. She requires a Freemarket contact token to reveal herself. Without it, she's just a receptionist. With it, she's the most valuable ally in the most dangerous building in the city.

-----

## DESIGN NOTES

**The layered aesthetic tells the story.** The Atrium is beautiful. The Compliance Wing is unsettling. The Labs are clinical. Directorate 9 is empty. The Executive Suite is vast and lonely. The building peels back its own mask as you climb. By the time you reach Virek, the pretense is gone.

**Three entry strategies:**
1. **Front gate** — Fight or bluff through the Security Perimeter. Direct. Loud. Combat-focused builds.
2. **Service tunnels** — Through the Maintenance Tunnels (zone 9) to the Service Sublevel. Requires finding Gus or picking the hatch. Stealth/TECH builds.
3. **Rooftop** — Down from the Rooftop Network via the Tower Rooftop exterior ladder. REFLEX check. Drops you at the top — work your way down instead of up. High-risk, high-reward.

**The surveillance reveal in Directorate 9 is the gut punch.** Players who built the Parish into their home base will see it on Harrow's screens. They've been watched the entire time. The Parish exists because Helixion allows it — a controlled pressure valve for dissent. This should change how players feel about every safe zone they've ever used.

**Virek's photograph is humanization, not redemption.** He loved someone. She had implant scarring. She's gone. The loss drove his mission. Understanding why he is what he is doesn't excuse what he did. It makes it worse — because he should have known better.

**Gus's radio is the quiet lore thread.** An ordinary man who's been listening to 33hz for years without knowing what it is. The frequency reaches everyone. Most people don't notice. Gus noticed. He just didn't have the language for it.

> 13 rooms + 1 sublevel. 5 named NPCs. 9 enemy types including 2 bosses. 4 exits to other zones.
> The heart of everything the player has been fighting against. Beautiful on the outside. Machinery on the inside. Silence at the top.
