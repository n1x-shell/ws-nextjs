# ZONE 4: THE FRINGE (RUINS)

> Depth: Surface (west)
> Location: West of Residential Blocks, west of Helixion Campus — the old city
> Faction: None (true no-man's-land)
> Rooms: 13
> Level Range: 2–8 (Acts 1–2)
> Origin Point: THE DISCONNECTED

-----

## OVERVIEW

The Fringe is the old city. The part that was here before Helixion. Before the mesh. Before the campus rose at the center and everything oriented itself toward it like iron filings around a magnet. The Fringe didn't orient. It stayed where it was. And the city moved on without it.

Nobody destroyed these buildings. Nobody bombed them or burned them. The city just stopped maintaining them. Stopped sending repair crews. Stopped running the power grid past a certain block. Stopped collecting garbage. Stopped, eventually, acknowledging that anyone still lived here. The buildings are standing but dying — roofs sagging, facades crumbling, floors that hold your weight or don't with no way to tell which. Frozen decay. The slow-motion collapse of a place that was abandoned by everything except time and the people too stubborn or too broken to leave.

There's no faction here. No control. No territory. Scavengers pick the bones of the old city and fight each other over the best carcasses. Feral dogs run in packs. Rats have adapted to the chemical residue in the groundwater and grown bold. And in the deeper ruins, where the buildings lean against each other like drunks and the daylight doesn't reach the ground floors — the stalkers. People who've been here too long. Who stopped being people somewhere along the way.

The Fringe is the DISCONNECTED archetype's origin point. You wake up here with nothing — no implants, no mesh, no memory of how you got here. Just a body in a dead building and a stranger who found you before something else did. The zone teaches survival the hard way: no tutorial, no safety net. You learn to scavenge, to avoid, to fight when cornered. The Fringe doesn't care about you. That's what makes it free.

-----

## ATMOSPHERE

```
Sound:    Wind through empty buildings. Creaking structures.
          Distant collapse — a wall giving up somewhere you
          can't see. Bird calls (there are still birds here —
          the only place in the city). Dogs barking, far away
          or too close. Silence between sounds that goes on
          too long.
Light:    Gray daylight. No artificial light anywhere — the
          power grid doesn't reach this far. Overcast sky
          filtered through haze. Interior spaces are dark
          unless you have a light source or the ceiling is
          missing. At night (if implemented), total darkness
          except starlight and fires.
Smell:    Concrete dust. Mold. Wet plaster. Rain (it rains
          here more than the inner city because there's no
          climate management). Vegetation — something growing
          in the cracks. And underneath it, faintly, the
          chemical tang from the drainage below. The ground
          remembers what's under it.
```

-----

## ROOM MAP

```
    TO RESIDENTIAL BLOCKS
    (zone 2) Outer Blocks
              │
              │ east
       ┌──────┴──────┐
       │ THE BORDER  │
       │ (1)         │
       └──────┬──────┘
              │ west
       ┌──────┴──────┐                   ┌──────────────┐
       │ RUBBLE      │                   │ THE CLINIC   │
       │ STREETS     ├───────────────────┤ (old hosptl) │
       │ (2)         │                   │ (8)          │
       └──────┬──────┘                   └──────────────┘
              │ west
       ┌──────┴──────┐   ┌───────────┐
       │ COLLAPSED   │   │ UNDER-    │
       │ OVERPASS    ├───┤ PASS      │
       │ (3)         │   │ (4)       │
       └──────┬──────┘   └─────┬─────┘
              │                │
              │           ┌────┴──────┐
              │           │ SCAVENGER │
              │           │ CACHE     │
              │           │ (5)       │
              │           └───────────┘
              │ south
       ┌──────┴──────┐
       │ THE WAKING  │  ← DISCONNECTED ORIGIN POINT
       │ ROOM        │
       │ (6)         │
       └──────┬──────┘
              │
       ┌──────┴──────┐   ┌───────────┐
       │ DEEP RUINS  │   │ STALKER   │
       │ (9)         ├───┤ TERRITORY │
       └──────┬──────┘   │ (10)      │
              │           └───────────┘
              │ south
       ┌──────┴──────┐
       │ DRAINAGE    │
       │ ACCESS      │
       │ (7)         │
       └──────┬──────┘
              │ down
         TO DRAINAGE
         NEXUS (zone 8)
         South Entry

    DEEP SOUTH:
       ┌──────────────┐
       │ THE HERMIT'S │ ← from Deep Ruins (9), hidden path
       │ TOWER        │
       │ (11)         │
       └──────────────┘
       ┌──────────────┐
       │ OVERGROWN    │ ← from Deep Ruins (9), south
       │ COURTYARD    │
       │ (12)         │
       └──────┬───────┘
              │ south
       ┌──────┴───────┐
       │ IRON BLOOM   │
       │ ENTRANCE     │
       │ (13)         │
       └──────┬───────┘
              │ down
         TO IRON BLOOM
         (zone 12)
         [QUEST-GATED]
```

-----

## ROOMS

### 1. THE BORDER
**Where the maintained city ends and the forgotten city begins.**

```
> THE FRINGE — THE BORDER

You can see the exact line. On one side — the Residential
Blocks. Streetlamps that work. Pavement that's whole.
People with somewhere to be. On the other side — the Fringe.
The streetlamps stop. The pavement cracks and doesn't get
repaired. The buildings still stand but nobody maintains
them and nobody pretends to.

The border isn't a wall. It doesn't need to be. The mesh
thins here — coverage drops, signal degrades. For most
citizens, walking past this point triggers a low-grade
anxiety response from their implants. A gentle suggestion
to turn around. To go somewhere nicer. Somewhere monitored.

For you, it's just a street. One side alive, the other
side dying. You cross it and the city lets you go.
```

- **Exits:** east (Residential Blocks — Outer Blocks, zone 2), west (Rubble Streets)
- **NPCs:**
  - `border_loiterers` — Neutral. 2-3 present. People who exist in the gap — not fully committed to the ruins, not welcome in the residential blocks. They panhandle, they watch, they survive on the margins of both worlds. One of them can tell you about the Fringe if asked: "Don't go deep. Don't go at night. Don't take anything that isn't nailed down. Actually — take the nailed down stuff too. Nobody's coming back for it."
- **Enemies:** None (too close to the residential border — scavengers don't operate this visibly)
- **Objects:**
  - `the_line` — Examine: "You can literally see it. The last maintained streetlamp — still lit, still clean — and then darkness. The pavement changes from smooth composite to cracked asphalt within three meters. On the residential side, a Helixion utility box hums with mesh relay equipment. On the Fringe side, the same model of utility box sits dead, its panel missing, the wiring stripped years ago."
  - `dead_utility_box` — Examine: "Helixion infrastructure, gutted. The mesh relay was the first thing scavengers took — the components are valuable. Without it, this block dropped off the mesh coverage map. Nobody filed a repair order. Nobody filed anything. The system stopped looking and never started again."
  - `mesh_thinning` — Examine: "GHOST ≥ 3: You can feel it. The mesh signal attenuating. Each step west drops the signal strength. For someone with standard implants, this would feel like unease — a manufactured reluctance, the system gently discouraging them from going further. For you, it feels like a hand letting go."
- **Notes:** The Border is the conceptual threshold. Residential players crossing into the Fringe feel the mesh drop. DISCONNECTED players coming from the ruins feel the mesh thicken. The transition should feel significant either way — leaving the monitored world or entering it.

-----

### 2. RUBBLE STREETS
**The outer ruins. Still navigable. Barely.**

```
> THE FRINGE — RUBBLE STREETS

The streets are still streets — you can see where the lanes
were, where the sidewalks ran, where the intersections
aligned. But everything is broken. Potholes deep enough to
break an ankle. Sections where the road has buckled upward
from root systems or subsidence. Cars abandoned so long ago
they've become part of the landscape — rusted to the color
of the buildings, windows gone, interiors colonized by moss
and small animals.

The buildings on either side are five to eight stories.
Standing, but sagging. Facades missing chunks where the
rendering has fallen away, exposing the structural bone
beneath. Some apartments still have curtains in the windows.
The curtains don't move. Nobody's home. Nobody's been home
for a long time.

A dog watches you from a doorway. It's thin and alert and
not afraid of you. It's deciding if you're food or
competition.
```

- **Exits:** east (The Border), west (Collapsed Overpass), south (The Waking Room), north (The Clinic)
- **NPCs:**
  - **OSKA** — Ruin Cartographer (SHOPKEEPER / INFORMANT)
    - Location: Sitting on the hood of an abandoned car, a hand-drawn map spread across the windshield.
    - Faction: None
    - Disposition: Starts Neutral (0). Friendly if you buy something. She lives on information — cartography is how she survives without fighting.
    - Personality: Thirties. Quick eyes, steady hands. She's mapped every block of the Fringe over the past four years — safe routes, collapsed sections, scavenger territories, stalker zones. She draws physical maps because there's no power for data tablets and no mesh to upload to. She sells copies, drawn on whatever paper she can find. They're beautiful. Precise. Annotated with warnings.
    - Sells: Zone maps (reveals room connections and enemy density), safe passage routes (reduces ambush chance on specific paths), building surveys (which interiors are safe to enter), and stalker territory warnings (marks rooms where stalkers spawn).
    - Quests:
      - **"Dead Zones"** (Tier 1): Oska's maps have gaps — three areas she hasn't been able to survey because of danger. She needs the player to scout them and report back. The areas are: the Underpass, Stalker Territory, and the deepest room of the Clinic. Reward: Complete Fringe map (reveals all rooms including hidden paths), and Oska marks the Iron Bloom entrance on the map (quest prerequisite for access).
    - Dialogue hook: "I draw what's real. The city forgot this place exists but I haven't. You want to know where you're going, or you want to learn by falling through a floor?"
- **Enemies:**
  - `feral_dogs` × 2-3 — Level 2-3. Pack animals. Won't attack alone. If you face the pack, they circle. Fight one and the others engage. Drop nothing useful. They're just hungry.
  - `scavenger` — Level 2-4. 1, solo. Won't attack unless you're visibly carrying valuable salvage. Flight-first — they run if they're losing.
- **Objects:**
  - `abandoned_cars` — Examine: "Rusted beyond recognition. Some are sedans, some are vans. One has a child's car seat in the back, straps still buckled. The cars were left here when the power grid died and the roads became impassable. Nobody drove out. They just... stopped."
  - `sagging_buildings` — Examine: "Five stories. Pre-Helixion residential. The structural steel is visible where the façade has fallen — orange with rust, but holding. For now. The buildings lean slightly, each one resting against the next like exhausted soldiers. Enter at your own risk."
  - `curtained_windows` — Examine: "Curtains. Still hanging. Faded by years of sun but still there. Someone chose those curtains. Someone hung them with care and adjusted the pleats and stood back and thought 'that looks right.' That someone left or died and the curtains stayed. The Fringe is full of choices people made that outlasted the people who made them."
  - `feral_dog` — Examine: "Mixed breed. Thin but not starving — it's surviving. The pack is three or four, moving between buildings. They've learned that people sometimes have food and are not always dangerous. They've also learned that some people are always dangerous. The dog is deciding which kind you are."

-----

### 3. COLLAPSED OVERPASS
**The landmark. Visible from everywhere.**

```
> THE FRINGE — COLLAPSED OVERPASS

The highway overpass that once carried traffic over the
western district has partially collapsed. The eastern half
still stands — a concrete ribbon fifty meters above the
ground, its guardrails rusted, its surface cracked, weeds
growing from the joints. The western half fell. A massive
section of highway deck lies across two buildings, crushing
their upper floors, creating a bridge of rubble and rebar
between them.

The collapse created a natural landmark — the overpass is
visible from almost anywhere in the Fringe, a broken line
against the gray sky. It's also created a physical divide.
The underpass beneath the standing section is the main
passage deeper into the ruins. The fallen section blocks
direct routes and forces movement through the spaces it
created.

Someone has spray-painted on the standing support pillar:
"THE CITY FELL AND WE'RE STILL HERE."
```

- **Exits:** east (Rubble Streets), south (The Waking Room area — long way around), through (Underpass — beneath the standing section)
- **NPCs:** None
- **Enemies:**
  - `scavenger` × 2 — Level 3-4. Working the rubble at the collapse site. Territorial about their salvage claim. Will warn you off first ("This section's claimed. Move on."). Attack only if you take salvage from their pile.
- **Objects:**
  - `overpass_standing` — Examine: "The eastern half still stands. Fifty meters up. The road surface is visible — lane markings faded but readable. Cars are still up there, frozen in the commute they never finished. From below, it looks like a shelf holding the sky. The concrete is sound. The rebar inside it is not. Every year it holds is a year borrowed."
  - `overpass_collapse` — Examine: "The western section fell in a single piece — structural failure at the support pillars. The deck crashed across two residential buildings, crushing everything above the third floor. The impact zone is a canyon of twisted rebar and shattered concrete. Dust still rises from it when the wind blows. The collapse happened seven years ago. Nobody cleaned it up. Nobody will."
  - `graffiti_pillar` — Examine: "'THE CITY FELL AND WE'RE STILL HERE.' Sprayed in white paint on the support pillar. The letters are large and steady — someone took their time. Beneath it, in smaller text, a list of names. Not scratched like the Memorial Alcove — painted, deliberately. People who survived the collapse. People who are still here."
  - `collapse_rubble` — Examine: "The fallen highway section created new geography. Passages run through the rubble — some intentional (cleared by scavengers), some accidental (gaps in the wreckage). The rubble is structurally unpredictable. Some sections are compacted solid. Others shift when you breathe on them."
- **Notes:** The Collapsed Overpass is the zone's visual anchor — the way the Helixion tower is for the city center. It orients the player geographically. The graffiti and the list of names establish the theme: this place was abandoned, but people refused to leave.

-----

### 4. UNDERPASS
**Beneath the standing overpass. The main passage deeper.**

```
> THE FRINGE — UNDERPASS

Beneath the standing section of the overpass, the world
narrows. The highway deck above blocks the sky. Support
pillars create a colonnade of stained concrete — each one
ten meters apart, each one tagged with graffiti, each one
holding the weight of a road nobody drives anymore.

The underpass is the main passage from the outer ruins to
the deep interior. Everyone who goes deeper comes through
here. That makes it valuable territory, which is why it's
the only place in the Fringe that approaches organization
— scavengers leave markers here. Warnings, directions,
trade offers scratched into the pillars. An informal
economy of information, conducted in concrete dust.

The light is dim — the overpass blocks direct sun, and the
buildings on either side cast long shadows. The ground is
damp. Water collects here from the overpass drainage that
no longer routes anywhere useful.

Something deeper in the underpass is watching you. You can
feel it before you see it.
```

- **Exits:** north (Collapsed Overpass), south (Scavenger Cache)
- **NPCs:** None (the underpass is transient — people pass through, nobody stays)
- **Enemies:**
  - `ruin_stalker` — Level 5-6. 1. Lurks in the deeper shadows between pillars. The first stalker encounter in the zone. Doesn't attack immediately — it follows, staying at the edge of visibility, closing distance when you're not looking. Patient. Wrong.
- **Objects:**
  - `pillar_markings` — Examine: "Scavenger shorthand scratched into the concrete. Arrows with dates — passage reports. 'SOUTH CLEAR 3/12.' 'DOGS EAST.' 'STALKER — AVOID AFTER DARK.' A crude trade board: 'HAVE: COPPER WIRE. NEED: FOOD. LEAVE AT PILLAR 6.' The Fringe has no mesh, no network, no communication infrastructure. So they write on walls. The oldest technology."
  - `pooled_water` — Examine: "Rainwater collects here — the overpass drainage system broke years ago and now it all flows down the support pillars and pools beneath. The water is clearer than the drainage below but not clean. TECH ≥ 4: Trace compounds from the overpass surface — vehicle fluid residue, concrete mineral leach. Drinkable if desperate. Not recommended."
  - `the_watcher` — Examine: (GHOST ≥ 3 to detect before combat) "Something in the shadows between pillars seven and eight. Not moving. Not standing the way a person stands. The silhouette is wrong — too still, limbs at angles that suggest patience, not rest. GHOST ≥ 3 reveals it before it closes distance. Otherwise, it finds you first."
- **Notes:** The Underpass introduces ruin stalkers — the zone's scariest enemy type. The first encounter should be tense. The stalker doesn't charge — it follows. The pillar markings establish the Fringe's analog information network.

-----

### 5. SCAVENGER CACHE
**Beneath the overpass, south. Where things get traded.**

```
> THE FRINGE — SCAVENGER CACHE

A sheltered space beneath the overpass where the standing
section meets the rubble of the collapse. The gap between
highway and wreckage creates a natural alcove — roofed,
walled on three sides, defensible. Someone has improved it
over years of use: a tarp sealing the fourth side, salvaged
shelving made from car parts, a fire pit blackened from
hundreds of uses.

This is the closest thing the Fringe has to a marketplace.
Not permanent — nobody claims it. Scavengers leave goods
here and take what they need. An honor system that works
only because everyone in the Fringe knows that the cache
is more valuable than anything in it. Steal from the cache
and nobody trades with you. Nobody warns you about the
stalkers. Nobody shares water. You become alone in a place
where alone means dead.

Today, the shelves hold: canned food, copper wire, a
working flashlight, three bottles of water (sealed), and
a hand-drawn map with "SEE OSKA — RUBBLE STREETS" written
on it.
```

- **Exits:** north (Underpass)
- **NPCs:** None (the cache is unattended — the honor system is its only guardian)
- **Enemies:** None (attacking here or stealing would be a reputation mechanic — the Fringe scavenger community turns hostile)
- **Objects:**
  - `cache_shelves` — Examine: "Car-part shelving, stable, organized. Not by one person — by dozens over years. Items are grouped by type: food, water, materials, tools, medical. Some have prices scratched on paper tags. Some are marked 'TAKE IF NEED.' The economy is trust and everyone knows the penalty for breaking it."
  - `cache_goods` — Functional: Low-tier supplies available for CREDS or barter. Food (minor HP restore), water (minor HP restore), salvage materials, basic tools. Prices are lower than anywhere else in the game — but the selection is limited and changes every time you visit.
  - `fire_pit` — Examine: "Blackened stone ring. Ash from a hundred fires. The scorch marks on the overpass concrete above are deep — this pit has been used for years. It's warm. Someone was here recently. The Fringe is empty but the cache fire is always warm. That says something about the people who live here."
  - `honor_system_note` — Examine: "Scratched into the wall above the shelves: 'TAKE WHAT YOU NEED. LEAVE WHAT YOU CAN. STEAL AND YOU'RE ON YOUR OWN.' The handwriting changes every few lines — multiple authors over time. Below it, in a different hand: 'THE CACHE KEEPS US ALIVE. RESPECT IT.' Below that: 'DARO STOLE FOOD 8/3. DON'T HELP DARO.'"
- **Notes:** The Scavenger Cache is the zone's safe commercial space — the Fringe's version of the Junction or the Block Market. But it's unattended, honor-based, and vulnerable. The "Don't help Daro" note is worldbuilding through consequence.

-----

### 6. THE WAKING ROOM
**DISCONNECTED origin point. Where you begin.**

```
> THE FRINGE — THE WAKING ROOM

You open your eyes.

Ceiling. Stained plaster, cracked in patterns that look
like river systems. Daylight through a broken window.
Dust floating in the light, slow, like it has nowhere to
be. Your body is on a mattress on the floor. The mattress
is old. The floor is concrete.

You don't know where you are. You don't know how you got
here. Your hands go to your temples — instinct — and find
nothing. No implants. No neural interface port. No mesh
connection. Your head is bare skin and bone and silence.

In the silence, you hear your own heartbeat. You haven't
heard your own heartbeat in years. Maybe ever.

A woman sits on a chair across the room. She's been
watching you. Waiting for you to wake up. She has a bottle
of water and a look on her face that is equal parts relief
and exhaustion. She's done this before.

"Easy. You're safe. Drink this. I'll explain what I can."
```

- **Exits:** north (Rubble Streets / Collapsed Overpass area), south (Deep Ruins)
- **NPCs:**
  - **LIRA** — The First Face (QUESTGIVER / TUTORIAL / LORE)
    - Location: Sitting in a chair across from the mattress. Only appears during the DISCONNECTED origin sequence and remains in the Waking Room afterward.
    - Faction: None (independent, but knows about the Parish and Iron Bloom)
    - Disposition: Starts Friendly (+25). She found you. She saved you. She has no reason to help except that someone did the same for her.
    - Personality: Thirties. Lean, strong, tired. She lives in the Fringe because the mesh doesn't work on her — she's one of the rare natural rejectors, people whose neurology doesn't interface with Helixion's implants. She wasn't disconnected. She was never connected. That makes her invisible to the system and invaluable to anyone who needs to disappear.
    - She finds people. Specifically — she finds subjects who've been dumped in the Fringe after failed procedures, decommissioned test subjects, runaways whose implants have been removed or destroyed. She brings them here, gives them water, gives them context, and lets them decide what to do next. She's not resistance. She's triage.
    - Information: Lira explains the basics — where you are (the Fringe), what it is (the old city), why you're here (she found you unconscious, no implants, no ID, dumped). She doesn't know your specific story. She's seen enough people in your condition to know the pattern. She can direct you to the Drainage Nexus (down), the Residential Blocks (east), or the Scavenger Cache (supplies). She warns about the stalkers.
    - Quests:
      - **"First Steps"** (Tier 1, Origin Quest): Lira needs you to do three things to survive: find a weapon (the Scavenger Cache or the Rubble Streets have options), find food (cache or scavenging), and find information (talk to Oska the cartographer). Completing all three proves you can survive and unlocks Lira's trust — she tells you about the way down to the Drainage Nexus and mentions that people like you sometimes find their way to a group called the Parish.
      - **"The Name"** (Tier 2): Lira has been finding more dumped subjects recently — one per week for the last month. She wants to know why. She needs the player to investigate — the trail leads through the Deep Ruins to a dumping site with Helixion markings. Reward: evidence of increased Chrysalis testing, Lira reveals the Iron Bloom entrance location.
    - Dialogue hook: "Easy. You're safe. That's step one. Step two is you drink this water. Step three is I tell you everything I know, which isn't enough, but it's more than you have."
- **Enemies:** None (Lira keeps this building clear. It's a safe zone.)
- **Objects:**
  - `the_mattress` — Examine: "Old. Stained. But someone put a clean blanket on it — folded, placed. Lira prepared for you. Or for whoever was next. There's a bottle of water and a nutrient bar on the floor beside it. This mattress has saved lives. It doesn't look like much. It doesn't have to."
  - `broken_window` — Examine: "The glass is gone. The frame is intact. Through it: the Fringe. Gray buildings against gray sky. No movement. No sound except wind. It's the first thing you see when you wake up and it tells you everything you need to know — you're somewhere the world stopped looking."
  - `your_temples` — Examine: "You touch the skin where implants should be. It's smooth. Scarred — faintly, healed over, someone removed hardware with skill but not kindness. The mesh would connect here. It doesn't. You are unplugged in a city that runs on being plugged in. The silence in your skull is deafening and it is yours."
  - `lira_chair` — Examine: "A plastic chair, cracked, taped together. She's sat in it many times. The floor around it has water bottles and nutrient bar wrappers — the remains of other mornings like this one, other people like you. You're not the first. That should be comforting. It isn't."
- **Notes:** The Waking Room is the most important narrative room in the game for DISCONNECTED players. It needs to feel quiet, intimate, and disorienting. The player wakes with nothing. Lira gives them context without giving them answers. The silence where the mesh should be is the defining sensory experience — players who started in the Drainage had the mesh muted by the tunnels. DISCONNECTED players never had it. The absence is the identity.

-----

### 7. DRAINAGE ACCESS
**The way down. Surface to undercity.**

```
> THE FRINGE — DRAINAGE ACCESS

A service hatch in the basement of a partially collapsed
residential building. The building's ground floor is
accessible — the upper floors are not (stairwell collapsed
at the second landing). The basement is reached by a
concrete stairway that descends into darkness and the
smell of water.

The service hatch is set into the basement floor — heavy
steel, municipal markings faded. It's been pried open so
many times the locking mechanism is stripped. Below: a
vertical shaft with maintenance rungs leading down into
the drainage system. You can hear water. You can smell
rust and chemical traces. The air coming up from below is
cooler and damp.

Glow-strips have been placed on the shaft walls — Parish
markers. They're telling you the way down is safe. That
someone is waiting at the bottom.
```

- **Exits:** north (Deep Ruins), down (Drainage Nexus — South Entry, zone 8)
- **NPCs:** None
- **Enemies:**
  - `feral_dogs` × 2 — Level 2-3. In the collapsed building's ground floor. They've denned here. Not aggressive unless cornered — the stairway down gives them space to avoid you.
- **Objects:**
  - `service_hatch` — Examine: "Municipal infrastructure. The markings read 'DRAINAGE ACCESS — AUTHORIZED PERSONNEL ONLY.' The lock has been defeated so many times it's decorative. The hinges are greased — someone maintains this access point. Below: maintenance rungs, descending into darkness and the sound of water."
  - `parish_glow_strips` — Examine: "Bioluminescent strips — the same kind used in the Drainage Nexus. Green-cyan glow, faint but visible in the shaft's darkness. They mark the safe path down. The Parish maintains this route as a lifeline to the surface. If you see the glow-strips, you're going the right way."
  - `collapsed_stairwell` — Examine: "The building's internal stairway collapsed at the second floor. Concrete and rebar blocking passage upward. Below the collapse, the stairs continue down to the basement. The building failed upward and held downward. Sometimes the way up is closed and the way down is all that's left."
  - `shaft_sounds` — Examine: "Listen. Water flowing — not a trickle, a channel. Echoes that suggest large spaces. The metallic groan of old pipes expanding and contracting with temperature. And beneath all of it, if you're quiet, if you focus — a hum. GHOST ≥ 3: 33hz. Coming from deep below. The frequency rises through the drainage system like heat through a chimney."

-----

### 8. THE CLINIC
**An old hospital. What it meant before. What it means now.**

```
> THE FRINGE — THE CLINIC

St. Agatha's Community Hospital. The sign is still mounted
above the entrance, letters faded, one hinge broken so it
hangs at an angle. The building is three stories — the only
structure in the outer Fringe designed for public use rather
than residential. Built forty years ago. Abandoned fifteen.

The ground floor is a gutted emergency department. Stretcher
frames without mattresses. Curtain tracks on the ceiling
with no curtains. Examination lights that haven't powered
on in over a decade. Tiles on the floor, white once, now
the color of old bone.

Someone has been using this space recently. Not as a hospital
— as a shelter. A sleeping bag in an examination bay.
Canned food on a medical cart. And in the corner, a man
sitting on the floor with his back against the wall, his
right arm chrome from the shoulder down, his eyes open
but focused on something that isn't in the room.
```

- **Exits:** south (Rubble Streets)
- **NPCs:**
  - **ECHO** — The Feral Augment Who Can Still Talk (LORE / TRAGIC)
    - Location: Ground floor examination bay. Sitting on the floor.
    - Faction: None (former Helixion subject)
    - Disposition: Starts Wary (-10). Not hostile — frightened. Speaking to him requires patience. He drifts in and out of coherence. Mesh modulators from Pee Okoro stabilize him temporarily (like Tomas Wren, but worse).
    - Personality: Indeterminate age — could be thirty, could be fifty. The augmentation damage makes it hard to tell. His right arm is chrome — full replacement, Helixion standard issue. His neural interface was removed but the secondary systems are still active, running corrupted firmware without a mesh connection. He hears static. He sees overlays that aren't there. He's trapped between the person he was and the machine Helixion tried to make him.
    - He remembers fragments. Not his name — he calls himself Echo because it's the only word that fits. "I hear myself but late. Like an echo. I say something and then I hear it again and it's not me saying it."
    - Information: Echo was a Helixion test subject — early cohort, before the MNEMOS program was refined. His compliance interface was installed incorrectly. Instead of suppressing his identity, it duplicated it — he has two sets of memories, the real ones and the implanted ones, and they interfere with each other. He can describe the early testing process, the medical procedures, the holding facility. His information is fragmented but authentic.
    - With mesh modulator: Echo stabilizes. His eyes focus. For a few minutes he can tell you about the cohort he was part of — eight subjects, all neural replacement candidates. He's the only one who wasn't fully overwritten. He ran. The chrome arm is the only part of himself he kept. Everything else they tried to replace.
    - Quest: None (Echo doesn't want anything from you. He wants to be left alone. But talking to him, listening to him, bringing him food — this raises disposition. At Friendly, he tells you something nobody else knows: the early cohorts were tested in a facility beneath the Fringe. Not the Drainage. Somewhere else. Deeper. This points toward the Substrate Level.)
    - Dialogue hook: "I'm— wait. I said that. Did I say that? I'm— echo. That's my name. I think. I hear it twice. Everything twice. Are you real? You look real. The other ones didn't look real."
  - **No other NPCs.** The hospital is a solitary space. Echo is alone here because he can't handle crowds, noise, or the proximity of other people's neural emissions.
- **Enemies:** None (the hospital is too open and empty for ambush — and something about it keeps the stalkers away. Maybe Echo. Maybe what he broadcasts.)
- **Objects:**
  - `hospital_sign` — Examine: "'ST. AGATHA'S COMMUNITY HOSPITAL.' Forty years old. This was built to serve the neighborhood — before Helixion, before the mesh, before healthcare meant compliance updates. The sign hangs at an angle, one hinge gone. It hasn't fallen yet. It's holding on."
  - `examination_bays` — Examine: "Curtain tracks with no curtains. Stretcher frames with no mattresses. Medical cabinets — open, mostly empty. Someone took the useful supplies years ago. What's left: tongue depressors, cotton swabs, a blood pressure cuff. The tools of a medicine that touched people instead of programming them."
  - `echos_arm` — Examine: (requires interacting with Echo first) "Chrome. Shoulder to fingertip. Helixion standard neural-linked prosthetic, model NL-7. The chrome is scratched, dented, but functional. He moves it naturally — the neural link still works. The arm is the only piece of his augmentation that does what it's supposed to. Everything else in his head is broken. The arm works perfectly. He hates it."
  - `sleeping_bag` — Examine: "Military surplus. Old but maintained. This is Echo's home. He chose a hospital — maybe because something in his broken memory associates hospitals with healing. Or maybe because it's big and empty and the echoes in the tile corridors sound almost like company."
- **Notes:** Echo is the zone's emotional NPC — like Jonas in the Residential Blocks, but instead of truth delivered as ranting, Echo delivers truth delivered as fragments. His dual-memory condition (real + implanted) is unique in the game and foreshadows the Chrysalis program's goals. The hospital setting — a place built to heal people, now sheltering someone broken by the thing that replaced healing — is the irony.

-----

### 9. DEEP RUINS
**Past the overpass. Where the buildings lean.**

```
> THE FRINGE — DEEP RUINS

Deeper into the Fringe, the buildings close in. The streets
narrow where walls have partially collapsed into them. The
sky is visible but reduced — a strip of gray between leaning
facades that almost touch overhead. The daylight that reaches
the ground is secondhand, reflected off walls and filtered
through dust.

The buildings here are older than the outer ruins. Pre-war
construction — heavy stone and mortar, not the concrete
and steel of the residential era. Ornamental details survive
on some facades: carved lintels, art deco metalwork, a stone
face above a doorway with moss growing from its eyes.

The ground is uneven — subsidence has tilted entire blocks.
Doors hang at wrong angles. Windows that were once level
are now parallelograms. The geometry is off. Everything
leans. Walking through the deep ruins feels like walking
through a building that's falling down very, very slowly.

You are not alone here.
```

- **Exits:** north (The Waking Room / Collapsed Overpass area), south (Drainage Access / Overgrown Courtyard), east (Stalker Territory), west (The Hermit's Tower — hidden path)
- **NPCs:** None
- **Enemies:**
  - `ruin_stalker` × 2 — Level 5-7. The deep ruins are stalker territory. They move through the leaning buildings, using the shifted geometry to approach from angles that shouldn't exist. They don't speak. They don't make sound until they're close.
  - `feral_dogs` × 2 — Level 3-4. Pack. The deep ruins pack is larger and more aggressive than the rubble streets pack. They've learned to avoid the stalkers, which means they're smart enough to be dangerous.
- **Objects:**
  - `leaning_facades` — Examine: "The buildings have tilted on their foundations. Subsidence — the ground beneath is hollow. Drainage tunnels, old infrastructure, maybe the Substrate itself. The weight of the buildings is slowly pulling them down. In fifty years, they'll meet in the middle and the street will become a tunnel. The Fringe is sinking into the undercity. Or the undercity is rising."
  - `art_deco_details` — Examine: "Carved stone, metal scrollwork, a face above a doorway. Pre-war craftsmanship. Someone built this with pride — with the belief that buildings should be beautiful, not just functional. The moss growing from the stone face's eyes looks like tears. It probably isn't intentional. It's effective anyway."
  - `tilted_geometry` — Examine: "Every angle is wrong. Door frames are parallelograms. Window sills slope. The floor inside visible ground-floor apartments tilts at three degrees — not enough to prevent walking, enough to make your brain insist something is fundamentally wrong. The deep ruins are disorienting by architecture, not design."
  - `subsidence_cracks` — Examine: "Cracks in the street surface. Deep — you can't see the bottom. Air rises from them, warm and humid. GHOST ≥ 4: The 33hz hum is stronger here than anywhere else on the surface. The Substrate is close. The Fringe is thin. The boundary between surface and deep is failing."

-----

### 10. STALKER TERRITORY
**East of the Deep Ruins. Where something used to be human.**

```
> THE FRINGE — STALKER TERRITORY

The buildings here have been modified. Not repaired —
modified. Doorways widened by force. Walls broken through
to create passages that don't follow the original floor
plans. Furniture dragged into piles that serve as barriers
or nests or things you don't have a word for. The geometry
of the space has been reshaped by something that thinks
differently than a person.

The stalkers live here. Three, maybe four of them — it's
hard to count because they move through the walls, through
the holes they've made, appearing and disappearing. They
were people. The evidence is there: clothes, reduced to
rags. Shoes, worn to nothing. Hands that once held tools.
But the eyes are wrong. The movement is wrong. They've
adapted to the ruins so completely that the ruins are part
of them now. They don't forage. They don't trade. They
don't speak. They just persist, in the dark, in the
leaning geometry, patient as stone.

You shouldn't be here. They know you are.
```

- **Exits:** west (Deep Ruins)
- **NPCs:** None
- **Enemies:**
  - `ruin_stalker` × 3-4 — Level 6-8. This is their home ground. They fight differently here — using the modified passages to flank, appearing from holes in walls, retreating into spaces too small or too unstable for the player to follow. The highest-level enemies in the zone. Combat is avoidable with GHOST ≥ 5 (stealth through), REFLEX ≥ 6 (outrun them), or COOL ≥ 6 (they hesitate — some feral instinct responding to body language that reads as non-threatening).
- **Objects:**
  - `modified_walls` — Examine: "Broken through with force — not tools. Bare hands, augmented or not. The edges of the holes are smoothed from repeated passage. These aren't escape routes. They're pathways. The stalkers have rebuilt the interior space of these buildings into a three-dimensional network of passages that ignores floors, walls, and the concept of rooms. They live in the space between spaces."
  - `nest_piles` — Examine: "Furniture, clothing, debris — dragged into mounds. Not random. The materials are sorted: soft things in the center, hard things on the outside. They sleep here. Or rest. Or do whatever it is they do instead of sleeping. The shapes of the nests are human-sized hollows. They still curl up. They still seek warmth. They still need a place that's theirs."
  - `stalker_evidence` — Examine: "Shoes. Worn to nothing but still worn. A shirt, reduced to threads but not discarded. A belt buckle with initials — 'R.M.' Someone was R.M. Someone wore these shoes to work and this belt to dinner and this shirt on a Saturday. The stalkers don't speak but they still dress. They still carry the shape of who they were. The ruin ate their minds. It didn't eat their habits."
  - `stalker_watching` — Examine: (GHOST ≥ 5 to notice without being detected) "In the wall. A hole, shoulder-width. And in the hole — eyes. Reflecting what little light there is. Watching. Patient. It could attack. It hasn't. You are in its home and it's deciding what you are. Not predator or prey. Something simpler. Part of the ruin, or not part of the ruin. If you're not part of the ruin, you don't belong. If you don't belong, you're removed."
- **Notes:** Stalker Territory is the zone's danger room. It's optional — players don't have to come here — but it's one of Oska's "Dead Zone" survey targets and it contains some of the best loot in the zone (stalkers hoard salvage in their nests). The stalkers themselves are the zone's horror. They're not monsters. They're what happens when people have nothing — no mesh, no community, no purpose — for too long. They're what the DISCONNECTED player could become.

-----

### 11. THE HERMIT'S TOWER
**Deep ruins, hidden. Someone who chose this.**

```
> THE FRINGE — THE HERMIT'S TOWER

A narrow tower — eight stories, standalone, the only building
in the deep ruins that stands perfectly vertical. Not leaning.
Not crumbling. Someone has been maintaining it. The ground
floor entrance is concealed behind a collapsed wall that
looks impassable but has a gap you wouldn't see unless you
knew where to look. Or unless someone told you.

Inside, the stairwell is intact. Clean. Every other step
has a small glow-stick wedged into the concrete — a trail
of breadcrumbs leading up. The tower smells like wood smoke
and tea and something dried — herbs, maybe. Books.

The top floor is one room. A 360-degree view of the Fringe
through windows that have been cleaned, repaired with polymer
sheeting where the glass broke, and fitted with shutters
made from salvaged doors. A wood-burning stove. A bed.
Shelves of books — physical books, hundreds of them. A chair
by the window facing east, toward the city.

A man lives here. He's been here longer than anyone else
in the Fringe.
```

- **Exits:** down (Deep Ruins — hidden path, revealed by Oska's map or GHOST ≥ 5)
- **NPCs:**
  - **KAI** — The Hermit (SHOPKEEPER / INFORMANT / LORE)
    - Location: Top floor. Chair by the window.
    - Faction: None (pre-faction — he was here before factions existed)
    - Disposition: Starts Neutral (0). He's not hostile or friendly. He's been alone a long time. Conversation is unfamiliar. Bringing him something he needs (tea, candles, a specific book — small fetch quests) warms him up.
    - Personality: Sixties. Lean but not frail. Gray hair, long, tied back. Hands that have done physical labor for decades. He speaks slowly, precisely, like someone who hasn't spoken aloud in weeks and is remembering how. He's not a scavenger. He's not a refugee. He's a man who chose to be alone in the ruins because the alternative — the mesh, the city, the entire system — was something he couldn't accept.
    - He was a city planner. He designed parts of the infrastructure that Helixion later absorbed. When the mesh was mandated, he walked out. Came to the Fringe. Found the tower. Stayed.
    - Information: Kai knows the old city. The city before Helixion. He knows what these buildings were, who lived here, what the neighborhood was called. He knows the infrastructure — where the drainage routes run, where the transit tunnels connect, where the deep foundations go. He knows the Fringe is sinking because he designed the drainage system that, without maintenance, is eroding the substrate beneath the foundations.
    - At high disposition, Kai reveals the most significant thing: he's felt the 33hz frequency for twenty years. Since before Helixion discovered it. He didn't know what it was. He built his tower on this spot because the vibration in the floor felt like a heartbeat and it was the only company he wanted.
    - Sells: Books (lore items — each one teaches something about the old city, the infrastructure, the history). Herbal remedies (minor HP restore, crafted from things he grows on the roof). Hand-drawn infrastructure maps (reveals connections between zones that aren't obvious from the surface).
    - Quests:
      - **"The Old Plans"** (Tier 2): Kai had a copy of the original drainage system blueprints. He lost them — or they were taken — from his tower months ago. He suspects scavengers. The plans are somewhere in the Fringe. Finding them (in the Scavenger Cache, traded to another scavenger) reveals the full tunnel network beneath the zone and marks an alternate route to the Substrate Level that bypasses the Abandoned Transit.
    - Dialogue hook: "...you're here. That's unusual. Sit, if you want. I have tea. The books aren't for borrowing but I'll tell you what's in them if you ask."
- **Enemies:** None (the tower is hidden and Kai has maintained its concealment for years)
- **Objects:**
  - `book_shelves` — Examine: "Hundreds of books. Physical. Paper. He carried them here one at a time over twenty years. History, engineering, philosophy, fiction. A shelf labeled 'BEFORE' contains books about the city's founding. A shelf labeled 'DURING' contains technical manuals for the infrastructure he built. A shelf labeled 'AFTER' has one book on it, handwritten, with no title. It's his."
  - `window_view` — Examine: "The Fringe spread below. From this height, the pattern of decay is visible — the outer ruins still recognizable as a city, the deep ruins where the buildings lean and the streets disappear. The overpass, broken against the sky. And to the east, beyond the residential blocks, the Helixion tower. Kai has been watching it for twenty years. He says it gets taller every year."
  - `handwritten_book` — Examine: "The single book on the 'AFTER' shelf. Handwritten, bound in salvaged leather. No title. The first line: 'The city I helped build is killing the people who live in it. This is my record of how.' It's a journal. Twenty years of observation. The Fringe's decay documented by the man who designed what the Fringe was built on."
  - `floor_vibration` — Examine: "The tower floor vibrates. Faintly. Constantly. GHOST ≥ 3: 33hz. The tower sits directly above a Substrate conduit. Kai built his home on a pulse point — not because he understood the frequency, but because it felt alive. He's been listening to the Substrate's heartbeat for two decades without knowing its name."

-----

### 12. OVERGROWN COURTYARD
**Deep south. Nature winning.**

```
> THE FRINGE — OVERGROWN COURTYARD

An apartment courtyard that nature reclaimed. The buildings
surrounding it still stand — four sides, five stories each
— but the courtyard itself has become a garden. Not cultivated
like Mae's rooftop. Wild. Uncurated. Trees have pushed
through the paving stones. Ivy covers the south-facing walls.
Grass grows knee-high where the playground used to be.

The playground equipment is still here — a swing set, a
climbing frame, a slide. Rusted, overgrown, but standing.
A tree has grown through the climbing frame, its trunk
threading between the bars. The swing chains are wrapped
in vine. The slide is a waterfall when it rains.

This is the most beautiful place in the Fringe. It's also
the quietest. Nothing hunts here. The dogs don't come. The
stalkers don't come. The scavengers pass through and don't
linger. Something about this courtyard discourages intrusion.
Something that isn't the mesh. Something older.

The 33hz hum is strong here. You feel it in the ground
through the soles of your shoes.
```

- **Exits:** north (Deep Ruins), south (Iron Bloom Entrance)
- **NPCs:** None (the courtyard is empty. The emptiness is the point.)
- **Enemies:** None (nothing hunts here — see notes)
- **Objects:**
  - `playground_equipment` — Examine: "The swing set creaks in the wind. The chains are intact — rusted but holding. If you push the swing, it moves. It's been waiting to be pushed for fifteen years. The climbing frame has a tree growing through it, trunk and metal merged. The tree didn't avoid the obstacle. It incorporated it. There's a lesson there."
  - `wild_garden` — Examine: "This isn't gardening. This is absence. Nobody planted these trees. Nobody cultivated the ivy. Nobody seeded the grass. The courtyard was abandoned and nature returned. In a city managed by Helixion — every tree curated, every park designed — this is the only place where plants grow without permission."
  - `ground_vibration` — Examine: "Stronger than the hermit's tower. Stronger than anywhere on the surface. The 33hz frequency pulses through the earth here like a heartbeat. The trees grow faster here — the rings, visible where a trunk split, are wider than they should be. The Substrate is close to the surface. The frequency accelerates growth. Life responds to it."
  - `the_silence` — Examine: "Listen. No dogs. No stalkers. No wind. The courtyard is a pocket of stillness. GHOST ≥ 4: The frequency creates a standing wave here — a zone of constructive interference that living things can feel. The dogs avoid it because it's too strong for their instincts. The stalkers avoid it because something in their broken minds still recognizes a threshold. You stand in it and feel calm for the first time since you woke up."
- **Notes:** The Overgrown Courtyard is the Fringe's sacred space — the Memorial Alcove, the rooftop garden, the Automata Floor. But instead of human memory or human persistence, it's nature's persistence. The 33hz frequency is strongest here because the Substrate is close to the surface. The courtyard is a natural sanctuary created by the frequency's influence on growth. Nothing hunts here because the frequency says no.

-----

### 13. IRON BLOOM ENTRANCE
**The way to the resistance. If you've earned it.**

```
> THE FRINGE — IRON BLOOM ENTRANCE

A basement. Beneath the southernmost building in the Fringe
— a squat concrete structure that might have been a utility
substation. The entrance is a storm cellar door, heavy steel,
hidden under debris that looks natural until you realize the
debris is arranged.

Below the door: a stairway down to a reinforced room. Bare
concrete walls. A single light — battery-powered, warm. A
table. Two chairs. A woman standing against the wall with
her arms crossed, evaluating you before you've said a word.

This is the surface vetting point for Iron Bloom. The
resistance doesn't advertise. They don't recruit. You find
them because someone trusted you enough to tell you where
to look — Lira, or Oska, or the Parish. If you found this
place without a referral, the woman at the wall has questions.
If you can't answer them, you leave. If you answer wrong,
you don't.
```

- **Exits:** north (Overgrown Courtyard), down (Iron Bloom Server Farm — zone 12, quest-gated)
- **NPCs:**
  - **SABLE** — Iron Bloom Contact (GATEKEEPER / QUESTGIVER)
    - Location: Standing against the wall. Always standing.
    - Faction: Iron Bloom (surface operative)
    - Disposition: Starts Unfriendly (-20). She doesn't trust anyone until they prove they should be trusted. Referral from Lira, Oska, or a Parish NPC shifts to Neutral. Completing her verification quest shifts to Friendly, which grants passage to Iron Bloom below.
    - Personality: Thirties. Still. She doesn't fidget. Doesn't waste words. Former Helixion security — she knows how the system works because she enforced it until she couldn't anymore. She vets every person who comes through this entrance. Her job is to keep Iron Bloom safe, and she takes it seriously enough to kill for it if necessary.
    - Quests:
      - **"Verification"** (Tier 2, Gatekeeper Quest): Sable needs proof of who you are and what you want. She gives the player three options: bring evidence of Helixion wrongdoing (Brenn's production records, Asha's broadcast data, Vasik's research files — anything from other zones), bring a verified referral (complete a quest chain that ends with a named NPC giving you a token or password), or demonstrate resistance capability (complete a combat trial she sets — clear a stalker nest in the Deep Ruins and bring back proof). Any of the three unlocks passage. Reward: access to Iron Bloom Server Farm (zone 12).
    - Dialogue hook: "Name. Who sent you. Why you're here. You get one chance to answer. I suggest you make it count."
- **Enemies:** None (Sable IS the security)
- **Objects:**
  - `storm_cellar_door` — Examine: "Heavy steel. The debris arrangement above it is meticulous — looks like natural collapse, functions as camouflage. TECH ≥ 5: The door has a sensor — pressure plate in the stairway. Sable knows you're coming before you reach the bottom step."
  - `reinforced_room` — Examine: "Bare. No decoration. No comfort. Two chairs, one table, one light. This room is designed for one purpose: evaluation. The concrete walls are thick enough to contain sound. The single exit is behind Sable. Everything about this space says 'you are not in control here.'"
  - `the_passage_down` — Examine: "Behind the room, past a locked blast door: a stairway descending. Deeper than a normal basement. The walls change from poured concrete to cut stone to something older. The temperature drops. The air gets drier. GHOST ≥ 4: The 33hz hum is present. You're descending toward the deep infrastructure. Iron Bloom built their headquarters in the bones of the old city."
  - `sable_evaluation` — Examine: (examining Sable directly) "She hasn't moved. She's been standing in the same position since you entered. Her eyes tracked you down the stairs. Her weight is on her back foot — ready. Her hands are empty but her jacket sits wrong on the left side. She's armed. She's always armed. She was Helixion security. She knows what she's protecting and what she's protecting it from."

-----

## ZONE EXITS SUMMARY

| From | Direction | To | Zone | Requirement |
|------|-----------|-----|------|------------|
| The Border | east | Residential Blocks — Outer Blocks | 2 | None |
| Drainage Access | down | Drainage Nexus — South Entry | 8 | None |
| Iron Bloom Entrance | down | Iron Bloom Server Farm | 12 | Verification quest |

-----

## QUEST SUMMARY

| Quest | Giver | Tier | Type | Summary |
|-------|-------|------|------|---------|
| First Steps | Lira | 1 | TUTORIAL | Find weapon, food, information. Proves you can survive. Unlocks Drainage direction. |
| The Name | Lira | 2 | INVESTIGATE | Track increased subject dumping in the Fringe. Trail leads to Helixion evidence. |
| Dead Zones | Oska | 1 | EXPLORE | Survey three dangerous areas. Completes Fringe map + reveals Iron Bloom entrance. |
| The Old Plans | Kai | 2 | FETCH | Recover stolen drainage blueprints. Reveals full tunnel network + alt Substrate route. |
| Verification | Sable | 2 | GATEKEEPER | Prove you belong. Three options: evidence, referral, or combat trial. Unlocks Iron Bloom. |

-----

## ENEMY SUMMARY

| Enemy | Level | Location | Behavior | Drops |
|-------|-------|----------|----------|-------|
| Feral Dogs | 2-4 | Rubble Streets, Drainage Access, Deep Ruins | Pack hunters, won't attack alone, circle prey | Nothing useful |
| Scavenger | 2-5 | Rubble Streets, Collapsed Overpass | Territorial, flight-first, fight over salvage | Scrap salvage, basic tools, food |
| Ruin Stalker | 5-8 | Underpass, Deep Ruins, Stalker Territory | Follows from shadows, flanks, uses modified walls | Hoarded salvage, rare components, lore scraps |

-----

## DESIGN NOTES

**The Fringe is the game's quietest zone.** No music. No ambient hum from the mesh. No curated anything. Just wind, architecture, and the sounds things make when nobody maintains them. This silence is the zone's defining sensory feature — after the Drainage's echoing water or the Industrial District's machine noise, the Fringe should feel empty in a way that's both peaceful and unsettling.

**No artificial light.** The power grid doesn't reach here. Daylight is the only illumination in exterior rooms. Interior spaces are dark. The glow-strips at the Drainage Access are the only light that someone placed deliberately, and they're Parish markers from below, not Fringe infrastructure. If the player has a flashlight or light source, it matters here. If they don't, navigating interior spaces should feel dangerous.

**The gradient is geographic and narrative.** The Border (east) is safe and low-level. Rubble Streets is the outer Fringe — scavengers, dogs, salvage. The Collapsed Overpass is the midpoint. Past it, the Deep Ruins get serious — stalkers, subsidence, the buildings leaning. The southern rooms (Courtyard, Iron Bloom Entrance) are the deepest both physically and in terms of game progression. The zone teaches escalation through geography.

**Three emotional rooms:**
1. **The Waking Room** — the DISCONNECTED player's first moment. Silence where the mesh should be. A stranger who saved you. The start of everything.
2. **The Clinic / Echo** — a man trapped between himself and the machine Helixion tried to replace him with. He hears everything twice. The hospital built for healing, sheltering someone healing couldn't save.
3. **The Overgrown Courtyard** — nature reclaiming a playground. The swing set waiting to be pushed. The 33hz frequency accelerating growth. The most beautiful place in the game, and the quietest.

**Lira is the DISCONNECTED player's Doss.** She's the first face, the first voice, the first person who helps without being asked. But unlike Doss (who's building a community), Lira is a one-person operation. She finds people and gives them a start. What they do with it is theirs. She's not a leader. She's a lifeline.

**Kai is the game's historian.** Jonas knows the frequency. Kai knows the city. He designed the infrastructure Helixion absorbed. He's watched from his tower for twenty years. His handwritten book is the Fringe's entire history documented by someone who helped build what came before it.

**The stalkers are the zone's moral horror.** They're not monsters. They're what happens when people are abandoned completely — no mesh, no community, no purpose, nothing except the ruins and time. They still wear clothes. They still make nests. They still curl up when they sleep. They're a warning about what the DISCONNECTED player could become. The ruins don't just kill you. They absorb you.

**The Overgrown Courtyard's peace is the frequency's doing.** The standing wave of 33hz constructive interference creates a zone where predators don't enter. The trees grow faster. The calm is real. This is the Substrate protecting a space — not consciously, but the way a heartbeat sustains a body. The frequency creates pockets of sanctuary without intending to. The courtyard proves the Substrate isn't just beneath the city. It IS the city. It just forgot.

> 13 rooms. 5 named NPCs. 3 enemy types. 3 exits to other zones.
> The old city. The forgotten side. Where you wake up with nothing and decide what to become.
