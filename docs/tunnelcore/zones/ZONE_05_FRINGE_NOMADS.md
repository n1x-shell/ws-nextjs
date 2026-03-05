# ZONE 5: THE FRINGE (NOMADS)

> Depth: Surface (far east)
> Location: Beyond the Residential Blocks perimeter — outside the city
> Faction: The Nomads (isolationist, no formal faction alignment)
> Rooms: 10
> Level Range: 2–8 (Acts 1–2)
> Origin Point: None

-----

## OVERVIEW

The Fringe Nomads live beyond the city. Not at its edge — beyond it. Past the perimeter fence, past the sensor grid, past the last point where the mesh signal reaches. Out where the ground opens up and the sky is the biggest thing in every direction and nobody is watching you and nobody is coming to help you.

They are truly nomadic. Nothing permanent. The camps move every few days — sometimes every few hours if the drones are active. Tents, converted vehicles, solar rigs that fold into carry cases. The entire community can pack up and relocate in under an hour. This isn't paranoia. It's survival. Helixion sends retrieval teams into the wild for specific targets. The nomads have learned that a camp that stays in one place is a camp that gets found.

They don't want visitors. They didn't leave the city to be social. They left because the mesh, the surveillance, the compliance, the slow erosion of every private thought — all of it was unbearable, and the alternative was this: open ground, hard living, real weather, real danger, and the knowledge that the sky above you belongs to nobody. They are isolationist because isolation is the point.

Getting in requires earning it. The sentries find you before you find the camp. They evaluate. If you're dangerous, you're turned away. If you're interesting — if you carry news, supplies, skills, or proof that you're not being tracked — they might bring you in. Might. The elder decides. The elder always decides.

This is the first zone in the game with a horizon. Every other zone is enclosed — tunnels, buildings, streets with walls on both sides. The Nomad territory is open ground. Hills, scrubland, weather. The sky. For players who've spent the entire game underground or between buildings, stepping past the perimeter and seeing distance for the first time should feel like something cracking open.

-----

## ATMOSPHERE

```
Sound:    Wind. Not city wind channeled through buildings —
          open wind, broad, carrying distance. Grass moving.
          Bird calls — real birds, not the Fringe's survivors,
          actual songbirds. Insects at dusk. The absence of
          machine sound is profound. No hum. No motors. No
          mesh. The generator at camp is the only engine for
          kilometers and even it gets turned off at night.
Light:    Natural. Fully natural. Dawn is pink and gold.
          Daylight is the full spectrum — not filtered through
          pollution haze or reflected off glass. Sunset is
          real. And at night: stars. The city's light pollution
          doesn't reach this far. The Milky Way is visible.
          The nomads navigate by it.
Smell:    Earth. Grass. Woodsmoke from the camp fire. Rain
          coming — you can smell it an hour before it arrives.
          Nothing synthetic. Nothing processed. Nothing
          designed. The air tastes like the world tasted
          before anyone built anything on it.
```

-----

## ROOM MAP

```
    TO RESIDENTIAL BLOCKS
    (zone 2) far east edge
              │
              │ west
       ┌──────┴──────┐
       │ THE         │
       │ PERIMETER   │
       │ (1)         │
       └──────┬──────┘
              │ east
       ┌──────┴──────┐
       │ NO-MAN'S    │
       │ LAND        │
       │ (2)         │
       └──────┬──────┘
              │ east
       ┌──────┴──────┐                   ┌──────────────┐
       │ THE OPEN    │                   │ EXILE        │
       │ GROUND      ├───────────────────┤ CAMP         │
       │ (3)         │ south             │ (7)          │
       └──────┬──────┘                   └──────────────┘
              │ east
       ┌──────┴──────┐
       │ SENTRY      │
       │ LINE        │
       │ (4)         │
       └──────┬──────┘
              │ east (escorted)
       ┌──────┴──────┐   ┌───────────┐
       │ THE CAMP    │   │ HEALER'S  │
       │ (5)         ├───┤ TENT      │
       │             │   │ (8)       │
       └──────┬──────┘   └───────────┘
              │
       ┌──────┴──────┐
       │ ELDER'S     │
       │ FIRE        │
       │ (6)         │
       └──────┬──────┘
              │ east
       ┌──────┴──────┐
       │ THE RIDGE   │
       │ (observation)│
       │ (9)         │
       └──────┬──────┘
              │ northeast
       ┌──────┴──────┐
       │ SIGNAL      │
       │ RELAY       │
       │ (10)        │
       └─────────────┘
```

-----

## ROOMS

### 1. THE PERIMETER
**The edge of the city. The edge of the mesh. The edge of the world they built.**

```
> THE FRINGE — THE PERIMETER

A chain-link fence, three meters high, topped with sensor
wire. It runs north-south as far as you can see in both
directions. Behind you: the Residential Blocks — the last
buildings, the last streetlamps, the last hum of the mesh.
Ahead: open ground. Hills. Scrubland. Sky.

The fence is the city's eastern boundary. Not a wall —
Helixion doesn't need walls. The fence carries sensor wire
that logs anything that crosses it. The data goes to D9.
Most of the time, nobody acts on it. Leaving the city
isn't illegal. It's just not encouraged. The mesh's gentle
anxiety response intensifies near the fence — civilian
implants scream at their owners to turn back. Everything
about this boundary says: beyond here, you are not our
responsibility.

The fence has been cut and re-sealed in dozens of places.
The cuts are sloppy — wire cutters, hurried. The re-seals
are meticulous — someone repairing the fence to hide the
passage. A game between the people who leave and the system
that watches them go.

Beyond the fence, the mesh signal dies within fifty meters.
After that: silence.
```

- **Exits:** west (Residential Blocks — far eastern edge, zone 2), east (No-Man's Land)
- **NPCs:** None
- **Enemies:**
  - `perimeter_drone` × 1 — Level 3-4. Automated Helixion surveillance. Flies a circuit along the fence. Doesn't attack — it scans, logs, and transmits. Shootable (TECH ≥ 4 can jam it instead). Destroying it triggers no immediate response but flags your crossing with D9. Jamming leaves no trace.
- **Objects:**
  - `sensor_fence` — Examine: "Chain-link with embedded sensor wire. Every crossing is logged — weight, time, biometric signature if your implants are active. TECH ≥ 5: The sensors have blind spots. The wire degrades at joint points and ground-level sections lose calibration in wet weather. The nomads know every blind spot. They've been crossing this fence for years."
  - `cut_and_reseal` — Examine: "Dozens of cuts over the years, each one patched. The cuts are rough — urgency. The patches are careful — craft. Someone wants the fence to look intact from the drone's camera. The gap you need is three meters south, ground-level, where the sensor wire shorted against a rock. Push through. The wire doesn't bite."
  - `mesh_death` — Examine: "Walk east from the fence. Count your steps. At twenty, the mesh signal stutters. At thirty-five, it fragments. At fifty, it dies. For most citizens, this is the moment their implants flood them with distress — a manufactured terror of being disconnected. For you, it's the moment the noise stops and you can hear the wind."
  - `the_view_east` — Examine: "Past the fence: open ground. Rolling hills covered in scrubland — not green, not dead, the tough gray-green of plants that survive on rain and nothing else. The sky is enormous. You've never seen this much sky. In the city, the sky is a strip between buildings. Here it goes from horizon to horizon and you realize you've been living in a box."

-----

### 2. NO-MAN'S LAND
**Between the city and the free. Where the exiles live.**

```
> THE FRINGE — NO-MAN'S LAND

The strip of ground between the perimeter fence and the
nomad territory. Maybe two kilometers wide. Nobody claims
it. The city doesn't patrol this far. The nomads don't
patrol this close. It's the gap between two worlds, and
the people who live in it belong to neither.

The terrain is scrubland — low brush, rocky soil, the
occasional stand of stunted trees. A dirt path is visible
— worn by years of foot traffic between the fence and
whatever lies further east. The path branches, forks,
and dead-ends in places. Some branches are deliberate
misdirection. The nomads don't want you to find them
easily.

A rusted vehicle sits off the path — a van, stripped to
the frame, too heavy to move. Someone's been using it as
shelter. A fire ring nearby. Empty food containers. The
kind of camp someone makes when they've been told they
can't go forward and can't go back.
```

- **Exits:** west (The Perimeter), east (The Open Ground)
- **NPCs:** None (the exiles don't negotiate — see enemies)
- **Enemies:**
  - `exile` × 2 — Level 4-5. People the nomads cast out — for stealing, for violence, for endangering the camps. They survive in no-man's-land because they can't return to the city (flagged, wanted, or too proud) and the nomads won't take them back. They're bitter. They're desperate. They'll rob you for food. They'll kill you for supplies. Not evil — ruined.
  - `wild_predator` × 1 — Level 3-4. The wildlife beyond the city has recovered in the absence of human activity. These are canids — not feral dogs, actual wild canids, larger, pack-oriented. One scout, testing whether you're prey. More in the hills if you show weakness.
- **Objects:**
  - `exile_camp` — Examine: "The rusted van frame, a fire ring, food containers. Someone's been here for weeks. The fire ring has been used every night — the ash is layered. The food containers are Helixion nutrient bars, the wrappers from the residential blocks. The exile walks to the fence, trades with someone on the city side, walks back. Trapped between two worlds that don't want them."
  - `false_paths` — Examine: "The trail branches. One branch is well-worn — obvious, inviting. Another is faint — barely visible in the scrub. GHOST ≥ 4: The obvious path loops back to the fence. It's bait, laid by the nomads to waste time. The faint path is the real route east. The nomads hide in plain sight — they make the wrong way easy and the right way invisible."
  - `the_distance` — Examine: "Look east. The ground rises into low hills. No buildings. No infrastructure. No lights. For the first time in the game, you're looking at a horizon that isn't interrupted by architecture. The sky meets the earth in a clean line. Something in your chest responds to it — not the frequency, not the mesh. Something older. The simple, primate relief of seeing far enough to know nothing is hunting you."
  - `exile_marker` — Examine: "A cairn of stacked stones by the path. Exile-made. Three stones high. COOL ≥ 5: It's a warning to other exiles — 'this territory is claimed, move on.' The exiles have their own system. Even cast out, even ruined, people make rules. It's what people do."

-----

### 3. THE OPEN GROUND
**The first horizon. The space that changes everything.**

```
> THE FRINGE — THE OPEN GROUND

You stop walking and you look up and the world is bigger
than you knew.

Open ground. Rolling hills in every direction. Scrubland
and wild grass moving in the wind like breath. The sky is
the entire ceiling — cloud formations you've never had room
to see, weather approaching from the west as a visible wall
of gray. The Helixion tower is still visible to the west,
rising above the city's silhouette, but from here it's
small. Distant. A needle on the horizon, not a monolith.
The city looks fragile from out here. Breakable. Temporary.

The wind carries the smell of earth and grass and rain.
The sound is wind and insects and birds you can't identify.
No engines. No mesh. No hum. The silence isn't empty — it's
full. Full of things the city drowned out.

You're standing in the world. The real one. The one that
was here before any of this.
```

- **Exits:** west (No-Man's Land), east (Sentry Line), south (Exile Camp)
- **NPCs:** None (the open ground is the experience — no one interrupts it)
- **Enemies:**
  - `wild_predator` × 2 — Level 4-5. Canid pair. More aggressive than the scout in no-man's-land. They've learned that people from the city are slow, poorly oriented in open terrain, and carry food. They circle. Patient. They prefer dusk.
- **Objects:**
  - `the_horizon` — Examine: "There it is. The line where sky meets earth. Uninterrupted. You have never seen this. In the Drainage, the ceiling is two meters above your head. In the Residential Blocks, the buildings define your vision. In the Industrial District, smokestacks and cranes. Even on the rooftops, the city's skyline encloses you. Here — nothing. The earth curves away and the sky begins and you are standing on the surface of a planet for the first time."
  - `the_city_from_outside` — Examine: "Turn west. The city is a smear on the horizon — a gray mass of buildings capped by the Helixion tower. From inside, the city is everything. From out here, it's a cluster. A growth on the landscape. The land was here before it and will be here after it. The tower looks like a needle. Fragile. You could put your thumb over it and make it disappear."
  - `wild_grass` — Examine: "Grass. Real grass, growing from real soil that nobody engineered. It moves in the wind — not uniformly, but in waves, each stalk responding to the air at its own speed. It's the most complex, detailed, organic thing you've seen in months. The city has plants. The city has gardens. But the city doesn't have this — growth without intention, life without management, beauty nobody designed."
  - `weather_approaching` — Examine: "Rain coming. You can see it — a gray curtain moving east across the hills. You can smell it — petrichor, the scent of earth anticipating water. In the city, rain is managed. Storm drains, covered walkways, mesh alerts. Out here, rain is rain. It falls on you and you get wet and that is the entire relationship."
- **Notes:** The Open Ground is the zone's thesis room — and one of the most important rooms in the game. Every other zone is enclosed. This one opens. The horizon is the visual payoff for players who've spent the entire game underground or between buildings. The room description should land emotionally — the player is seeing the world, the real one, for the first time. The city looks small from here. That's the revelation.

-----

### 4. SENTRY LINE
**Where the nomads find you before you find them.**

```
> THE FRINGE — SENTRY LINE

You don't see them. They see you.

The terrain looks empty — more scrubland, a shallow
depression between two hills, a stand of wind-bent trees.
Nothing that suggests human presence. No structures. No
paths. No fire. The nomads are invisible out here because
they've had years to learn how.

And then a voice behind you. Close. Calm. "Stop. Hands
where I can see them."

Two figures, emerging from ground-level hides that you
walked past without noticing. Earth-tone clothing. No
chrome, no implants, no augmentation of any kind. Weapons
that are old but maintained — a rifle, a bow. Faces
weathered by outdoor living. Eyes that have been watching
you since the perimeter.

They're not hostile. They're evaluating. Everything depends
on what happens in the next sixty seconds.
```

- **Exits:** west (The Open Ground), east (The Camp — only if escorted by sentries after positive evaluation)
- **NPCs:**
  - `nomad_sentries` × 2 — Nomad faction. These are the gate. Their disposition starts at Hostile (-25) for unknown players. They won't attack first — they challenge. The player's response determines what happens:
    - **Combat approach**: Attacking the sentries triggers Nomad faction hostility across the entire zone. They retreat into the terrain and more arrive. You cannot fight your way in. You can only fight your way out.
    - **COOL ≥ 6**: Calm, non-threatening dialogue. The sentries lower from Hostile to Wary. They search you for tracking devices (TECH check — if you're carrying anything with active Helixion firmware, they confiscate it). They escort you to the Elder.
    - **Carrying trade goods**: Food, medical supplies, or useful materials. The sentries recognize value. They radio ahead (analog — short-range burst transmission). They escort you.
    - **Referral**: Mentioning a known NPC (Lira, Oska, Iron Bloom contact) shifts them to Neutral. They still search you. They still escort. But the tension drops.
- **Enemies:**
  - `nomad_sentry` × 2-4 — Level 5-7. Only hostile if the player initiates combat or refuses to comply with the search. They fight defensively — retreating, using terrain, calling reinforcements. They don't want to kill you. They want you to leave.
- **Objects:**
  - `ground_hides` — Examine: "You walked right past them. The hides are dug into the hillside, covered with scrub and earth-tone fabric. From above, invisible. From ground level, invisible. The nomads have been watching the approach from the city for long enough to make concealment an art form."
  - `analog_weapons` — Examine: "No energy weapons. No augmented arms. A bolt-action rifle, oiled and maintained. A compound bow with hand-fletched arrows. A knife that's been sharpened so many times the blade has narrowed by half. These weapons are old-world. Pre-Helixion. They don't interface with anything. They don't report to anyone. They just work."
  - `sentry_communication` — Examine: "One of the sentries speaks into a small device — a radio, short-range, analog. Burst transmission: a two-second chirp that sounds like static to anyone scanning for it. The nomads built their own communication network outside the mesh. It's crude. It's slow. It's invisible to Helixion's monitoring. That's the point."

-----

### 5. THE CAMP
**The nomad settlement. Mobile. Temporary. Home.**

```
> THE FRINGE — THE CAMP

Tents. A dozen of them — not identical, each one different
canvas, different shape, different patch pattern from years
of repair. They're arranged in a loose circle around a
central fire pit. Vehicles — converted trucks and vans —
are parked at the circle's edge, always facing outward.
Ready to move. A solar panel array, foldable, powers a
single generator that charges batteries and runs the camp's
minimal electronics.

Forty people live here. Maybe fifty — the number changes.
Children play between the tents. A woman repairs a solar
panel. A man chops wood with an axe — a real axe, the kind
that existed a thousand years ago. Someone is cooking on
the central fire and the smell is extraordinary — real food,
real spices, real smoke.

The camp is orderly without being rigid. Everyone has tasks.
Nobody is told what to do. The system is consensus, habit,
and the shared understanding that if the camp can't move
in sixty minutes, the camp dies.

They watch you. Every one of them. You are a guest, not
a resident, and the difference is enormous.
```

- **Exits:** west (Sentry Line), north (Elder's Fire), east (Healer's Tent), south (The Ridge)
- **NPCs:**
  - `nomad_residents` — Nomad faction. Neutral to Wary depending on player's entry conditions. 6-8 present. They'll talk if the Elder has approved your presence. They're not unfriendly — they're careful. Each conversation reveals something: why they left the city, how long they've been out, what they fear (retrieval teams), what they value (silence, sky, each other).
  - **WREN** — The Child (LORE / PERSPECTIVE)
    - Location: Playing near the fire pit. Sometimes on top of a truck. Sometimes following the player around if curious.
    - Faction: Nomad (born into it)
    - Disposition: Starts Friendly (+20). Children are friendlier than adults. She hasn't learned to distrust yet.
    - Personality: Nine years old. Born outside the city. Has never been inside the perimeter. Has never worn an implant. Has never heard the mesh. She knows about the city the way children know about distant, scary things — from stories adults tell in careful voices.
    - Information: Wren is a mirror. She asks the player questions that reframe the entire game: "What's the mesh feel like?" "Do you hear it all the time?" "Why do people let them put things in their heads?" "Is the city as big as it looks from the hill?" Her questions have no agenda. She's genuinely curious. The player's answers — or inability to answer — become the lore.
    - She also knows practical things: which trails are safe, where the water source is, what the animal sounds mean. She's been learning the land since she could walk.
    - Quest: None. Wren doesn't need anything from you. But spending time with her — answering her questions, walking with her, listening to her describe the stars — adds unique journal entries that no other NPC provides. She's the game's only window into what "normal" looks like when normal doesn't include Helixion.
    - Dialogue hook: "Are you from the city? Is it true you can hear people thinking in there? Papa says the towers listen to your dreams. That sounds scary. Do you miss it?"
- **Enemies:** None (the camp is a safe zone — attacking here turns the entire nomad community hostile permanently)
- **Objects:**
  - `tent_circle` — Examine: "Each tent tells a story through its patches. The blue tent has been repaired with military surplus canvas — someone came from a military background. The red tent is the oldest, patches on patches, the original fabric visible only at the peak. The newest tent is still bright — whoever joined the camp came recently. Every tent faces inward. Every vehicle faces outward. Community in one direction. Escape in the other."
  - `vehicles_outward` — Examine: "Converted trucks and vans, all facing away from the camp center. Keys in ignition. Fuel tanks filled. The camp can evacuate in under an hour. This isn't a settlement. It's a coiled spring. Beauty and readiness existing in the same breath."
  - `central_fire` — Examine: "Real fire. Wood fire. The smell is smoke and cooking and warmth. Someone's made a stew — actual vegetables, actual meat, real spices. The fire is the camp's center of gravity. People eat here, talk here, make decisions here. The fire is always burning and someone is always tending it. Even in a community that owns nothing permanent, the fire is permanent."
  - `solar_array` — Examine: "Foldable panels, salvaged and repaired. They charge batteries that power the generator, the radio system, and the camp's minimal lighting. Everything folds into carry cases. TECH ≥ 5: The engineering is clever — the panels are wired in a configuration that maximizes output for the latitude. Someone designed this with real knowledge. Not scavenger improvisation. Engineering."
  - `children_playing` — Examine: "Three children, including Wren. They're playing a game that involves running between the tents, hiding, and counting. The rules seem to change every round. They're laughing. The sound is startling — you haven't heard children laugh without the background hum of the mesh mediating the experience. This is what it sounds like raw. Unfiltered. It sounds like something you lost and didn't know you'd lost."

-----

### 6. ELDER'S FIRE
**Where the decisions are made. Where you're evaluated.**

```
> THE FRINGE — ELDER'S FIRE

A separate fire, smaller, north of the main camp circle.
A canvas windbreak on three sides. Two log seats worn
smooth from use. A kettle over the coals. The fire is for
two people — the elder and whoever the elder is talking to.

The elder is already seated when you arrive. She doesn't
stand. She doesn't extend a hand. She watches you the way
the sentries watched you — evaluating — but slower.
Deeper. The sentries checked whether you were dangerous.
She's checking whether you're real.

The kettle whistles. She pours two cups of something that
smells like herbs and smoke. She pushes one toward the
empty seat.

"Sit. Talk. I'll decide when you're done."
```

- **Exits:** south (The Camp)
- **NPCs:**
  - **NEVA** — Nomad Elder (QUESTGIVER / FACTION LEADER)
    - Location: Always at her fire. Always seated.
    - Faction: Nomad (leader — though she'd say she leads by listening, not commanding)
    - Disposition: Starts Unfriendly (-15) for unknown players. Wary (0) if referred by a known NPC. She warms slowly, deliberately. Trust is earned by actions, not words.
    - Personality: Fifties. Gray-streaked hair, pulled back. Hands calloused from twenty years of outdoor living. She was one of the first to leave — walked out of the city when the mesh mandate was announced. She remembers the world before Helixion. Not the infrastructure, like Kai. The people. She remembers what community felt like when it was chosen, not manufactured.
    - She speaks in questions as often as statements. She wants to know why you're here — not in the nomad camp, but here, in the game, in the world. Her questions are uncomfortably direct: "What do you want?" "Who are you when nobody's watching?" "If you could go back to the city and forget everything you know, would you?"
    - Information: Neva knows the nomad network — there are other camps, further out, moving constantly. She knows the retrieval team patterns — when they come, how they hunt, what triggers a sweep. She knows the land itself — weather patterns, water sources, animal migration. She's the most competent survival expert in the game.
    - Quests:
      - **"Prove You're Not Followed"** (Tier 2, Gatekeeper): Neva's first test. She needs the player to travel to a specific hilltop (room 9, The Ridge) and watch the approach route they took for six hours (accelerated in-game time). If Helixion drones or retrieval activity appears, the camp moves and the player is expelled. If clear, Neva grants provisional residence — access to camp services and NPCs. Reward: Nomad disposition shift to Neutral, camp access.
      - **"The Missing Walker"** (Tier 2): One of the nomad rangers hasn't returned from a supply run toward the city perimeter. Neva fears a retrieval team took them. She needs the player to investigate — the trail leads through No-Man's Land to a site near the perimeter where signs of a struggle are visible. The ranger was taken. The player finds evidence (Helixion restraint hardware, a tranquilizer dart casing) and can either report back or follow the trail toward the city. Reward: major Nomad disposition boost, Neva begins trusting you with real information.
      - **"The Signal Question"** (Tier 3): At Friendly disposition, Neva confides something. The nomads have noticed something strange: the wild animals avoid certain areas. The plants grow differently in patches. The nomad signal keeper's equipment occasionally picks up a frequency — 33hz — coming from underground. Neva wants to know what it is. She asks the player to investigate. This is a bridge quest — it connects the Nomad zone to the deeper lore, pointing toward the Substrate. Reward: Neva shares the nomads' observations of 33hz anomalies across the region, which collectively form a map of the Substrate's surface influence.
    - Dialogue hook: "Sit. Talk. I'll decide when you're done. — You're from the city. I can tell. You walk like someone who's used to walls. Out here, we walk like there's room. Tell me: why did you leave?"
- **Enemies:** None
- **Objects:**
  - `elder_fire` — Examine: "Small. Contained. The coals are even — she's been tending this fire for hours. Maybe days. The fire is always burning because Neva is always here. This is where she thinks, where she listens, where she makes the decisions that keep fifty people alive in the open. The fire is her office, her throne, her church."
  - `herb_tea` — Examine: "Hot. Smoky. Bitter with something floral underneath. She grows the herbs herself — carries seeds, plants them at each new camp site, harvests before they move. The tea is the same everywhere the camp goes. Consistency in a life defined by movement."
  - `worn_log_seats` — Examine: "Two. Smoothed by years of use. The grain of the wood is polished to a shine. Hundreds of conversations have happened on these logs — the elder and whoever needs to talk. Arguments, confessions, negotiations, goodbyes. The wood remembers the weight of every person who sat here and said something that mattered."
  - `neva_watching` — Examine: "She's not looking at you. She's reading you. The way you sit, where your hands go, how your eyes move. Twenty years of evaluating people who come from the city — some fleeing, some lost, some sent. She's learned to tell the difference by watching, not listening. Words lie. Bodies don't."

-----

### 7. EXILE CAMP
**South of the open ground. The ones who were cast out.**

```
> THE FRINGE — EXILE CAMP

Three shelters — if you can call them that. A lean-to made
from a highway sign. A half-collapsed tent. A depression
in the ground lined with plastic sheeting. Three people
live here, or four, or two — the number changes because
the exiles don't stay together by choice. They stay together
because they can't stay anywhere else.

The nomads cast them out. Each one for a different reason —
theft, violence, recklessness that endangered the camp. The
exile rules are simple: you leave. You don't come back. You
don't approach the camp. You exist in the space between the
city you left and the community that rejected you.

The exiles are angry. Some of that anger is justified. Some
isn't. All of it is dangerous.

A woman sits on a rock, sharpening a piece of metal into
something that could be a knife or a tool or both. She
watches you without expression. Deciding.
```

- **Exits:** north (The Open Ground)
- **NPCs:**
  - `exiles` — Hostile (-20) to Wary. 2-3 present. They can be talked to (COOL ≥ 5) or traded with (they need food and medical supplies desperately). Each one has a story: one stole food during a shortage. One hit another nomad in anger. One led a Helixion drone to the camp by being careless. Their sins are human-scale. Their punishment is permanent.
  - If the player talks to them with patience and brings supplies, one exile — **DARO** — becomes a repeating informant. He's the man referenced on the Scavenger Cache wall ("DON'T HELP DARO"). He was cast out from both the nomads and the Fringe scavengers. He knows the no-man's-land better than anyone because it's all he has. He sells movement information: who's been through, when, heading where.
- **Enemies:**
  - `exile` × 2-3 — Level 4-6. Only if the player approaches aggressively or refuses to leave when told. They fight with desperation — they have nothing to lose. They also have nothing to gain from killing you, so they'll back off if you hurt them. They're not predators. They're cornered.
- **Objects:**
  - `exile_shelters` — Examine: "A lean-to, a tent, a hole. The architecture of having nothing and making it work anyway. The lean-to is clever — the highway sign reflects heat from a small fire. The tent is bad — the fabric is compromised, it leaks, it'll collapse in wind. The hole is effective — thermal insulation, wind protection, invisible from a distance. Function over dignity."
  - `sharpened_metal` — Examine: "The woman sharpens with patient, mechanical strokes. The metal was a car part. Now it's becoming a blade. She doesn't look at you while she works. The sharpening is communication: I'm armed. I'm patient. I'm not afraid. Decide what you want."
  - `exile_possessions` — Examine: "Between the three shelters: very little. A water container (half empty). Nutrient bars (Helixion brand, acquired from the city side of the fence). A blanket shared between two shelters. A book — physical, battered, the cover missing. The title page reads 'The Complete Works of—' and the rest is torn. Even their reading material is incomplete."
- **Notes:** The Exile Camp is a moral mirror. The nomads' isolationism has a cost — the people they cast out have nowhere to go. The exiles' crimes were real but their punishment is total. Players who help the exiles gain nothing mechanically — no faction rep, no quest rewards. They gain the knowledge that someone was hungry and they had food. That's either enough or it isn't.

-----

### 8. HEALER'S TENT
**Inside the camp. Medicine without machines.**

```
> THE FRINGE — HEALER'S TENT

A large tent — the biggest in the camp — with the flaps
tied open. Inside: drying herbs hung from the support poles.
Jars of tincture on a folding table. Bandages made from
cut cloth. A mortar and pestle. A kettle of something
simmering that smells medicinal and earthy. No scanners.
No neural interfaces. No mesh diagnostics. Just hands,
knowledge, and plants.

A man works at the table, grinding something to powder
with practiced motions. His hands are stained green from
the herbs. His arms have no augmentation. His temples
have no implant scarring. He is, as far as you can tell,
completely unmodified. Natural. Human in the original
configuration.
```

- **Exits:** west (The Camp)
- **NPCs:**
  - **TARN** — Nomad Healer (SHOPKEEPER / SERVICES / LORE)
    - Faction: Nomad
    - Disposition: Starts Neutral (0). Healers are neutral by nature — he'll treat anyone the Elder allows in, regardless of personal feelings.
    - Personality: Forties. Calm. Deliberate. He was a pharmacologist before the mesh — worked in traditional medicine research. Left the city when Helixion absorbed the pharmaceutical industry and replaced traditional medicine with implant-mediated health management. He believes the body knows how to heal itself if you listen to it. He has no implants, no augmentation, no mesh. His diagnostic tools are his eyes, his hands, and thirty years of study.
    - Services:
      - **Healing**: Full HP restore. Costs trade goods (herbs, food, materials) or CREDS. Slower than Cole's clinic or the Ripperdoc, but no side effects. No implant interactions.
      - **Herbal remedies**: Sells healing items that work differently from stims — slower acting, longer duration, no crash. They're less efficient in combat but better for sustained exploration.
      - **Detox**: Can remove chemical status effects (Industrial District exposure, toxic water, mesh withdrawal). The only healer who treats the body as a complete system rather than a set of interfaces.
      - **Implant assessment**: He doesn't install or remove implants, but he can assess their effect on the body. For players with heavy augmentation, he provides a blunt perspective: what the chrome is doing to their organic systems, what the long-term cost will be.
    - Information: Tarn knows plant medicine — which wild plants are useful, where to find them, how to prepare them. This is practical knowledge for the Fringe and the wilderness. He also knows, from his pharmaceutical background, what Helixion's implant-mediated health system actually does — it doesn't heal. It suppresses symptoms and masks degradation. The mesh keeps people feeling fine while their bodies deteriorate. His perspective is the inverse of every other medical NPC: Cole patches, Costa installs, Pee sells chemicals. Tarn listens to the body.
    - Dialogue hook: "Let me look at you. Not your implants. Not your chrome. You. The part that was here before they started adding things."
- **Enemies:** None
- **Objects:**
  - `drying_herbs` — Examine: "Bundles hung from the tent poles. Some you recognize from Mae's rooftop garden — sage, rosemary, chamomile. Others are wild — things that grow on the hillsides, that Tarn has spent decades learning to identify. Each bundle is labeled in his handwriting: name, use, dosage, warnings. A pharmacopoeia in cloth and twine."
  - `tincture_jars` — Examine: "Glass jars, salvaged, labeled. The liquids inside range from pale gold to deep brown to green so dark it's almost black. Tinctures — plant compounds extracted in alcohol. Each one treats something specific: pain, inflammation, infection, sleep, anxiety. The anxiety tincture is the largest jar. He makes a lot of it. People who leave the city need it."
  - `mortar_and_pestle` — Examine: "Stone. Heavy. The inside is stained from a thousand preparations. Tarn grinds herbs by hand — no machines, no shortcuts. He says the process is part of the medicine. The time you spend preparing is time the body has to tell you what it needs. Cole would call this inefficient. Tarn would say Cole has forgotten what healing is."
  - `no_augmentation` — Examine: "Tarn's hands. No chrome. No subdermal plating. No enhanced joints. His fingernails have dirt beneath them from digging herbs. His skin is weathered from sun. His eyes are his own — no optical implants, no targeting overlay. He sees what he sees. In a world of augmentation, he's the most radical person you've met. He chose to stay as he was."

-----

### 9. THE RIDGE
**The observation point. Eyes on the world.**

```
> THE FRINGE — THE RIDGE

A rocky ridge east of the camp — the highest point in the
nomad territory. The climb is steep but short. At the top:
a flat rock shelf with a 360-degree view. The camp below.
The open ground stretching west toward the city's silhouette.
Hills rolling east and south into country nobody's mapped.
The sky everywhere.

The nomads use this as their watch point. A telescope on
a tripod — salvaged, optical, no electronics. Binoculars
hanging from a nail driven into a rock crack. A hand-drawn
map pinned under a stone, marked with today's date and
observation notes: cloud patterns, animal movement, and
a notation about drone activity near the perimeter.

At night, from here, you can see the city's glow to the
west — a dome of light pollution. And above you, away
from that glow: the stars. More stars than you knew existed.
```

- **Exits:** west (The Camp), northeast (Signal Relay)
- **NPCs:** None (the ridge is used in shifts — sometimes a nomad is here on watch, sometimes it's empty)
- **Enemies:** None
- **Objects:**
  - `telescope` — Examine: "Optical. No electronics, no mesh interface. Brass and glass. Through it, you can see the perimeter fence — the sensor wire glinting, the drone making its circuit. You can see the outer residential blocks, the buildings you walked past. You can see the Helixion tower, impossibly distant, the only point of light sharp enough to identify. TECH ≥ 5: The telescope is military surplus — higher magnification than civilian models. Someone brought it from the city. It's the nomads' most valuable piece of equipment."
  - `observation_map` — Examine: "Hand-drawn. Updated daily. It shows the approach routes from the city, marked with drone circuit times. Animal trails marked in green. Water sources marked in blue. Exile locations marked in red. Today's date at the top, weather prediction for tomorrow at the bottom. This map is how the nomads survive — it's a living document of everything that moves in their territory."
  - `the_stars` — Examine: (night only, or described as what night looks like from here) "The sky without light pollution. The Milky Way is a river of light across the zenith. Constellations that city-dwellers never see because the glow drowns them. The nomads navigate by these stars. They name their children after them. Wren — a small bird that flies by starlight. The stars are the oldest map. The nomads are the only people in the game who can read it."
  - `neva_quest_marker` — Examine: (during "Prove You're Not Followed" quest) "The ridge. Six hours of watching the approach route. The land is still. The wind moves the grass. A bird of prey circles over the hills. No drones. No retrieval teams. Nothing follows you. The city doesn't care that you left. The relief is mixed with something else — the knowledge that to the system, you are not worth pursuing. You are not important enough to chase. That should feel like freedom. It does. It also stings."
- **Notes:** The Ridge serves double duty — it's the quest location for Neva's gatekeeper test and the zone's highest visual vantage point. The stars at night are the emotional reward. In a game where the sky has been a strip between buildings or a tunnel ceiling, seeing the full sky is a gift. The quest marker object is designed to make the "waiting" part of the quest feel meaningful rather than tedious — the observation becomes contemplation.

-----

### 10. SIGNAL RELAY
**The nomads' communication network. Off-grid. Handmade.**

```
> THE FRINGE — SIGNAL RELAY

Northeast of the ridge, where the terrain drops into a
sheltered valley. A single structure — the only permanent
thing the nomads have built, because it can't be moved.

An antenna. Handmade. Twenty meters tall, assembled from
salvaged pipe sections, guyed with cable to rock anchors
in the hillside. At its base: a solar panel, a battery
bank, and a transmitter housed in a weatherproof case. The
transmitter is simple — analog radio, short-wave. It
broadcasts on frequencies that Helixion's monitoring
doesn't cover because the frequencies are too old, too low-
tech to be worth scanning.

The other nomad camps — further east, further south, out
in the country nobody's mapped — they all have relays. A
network of whispers, connecting communities that don't
exist on any map, on frequencies the mesh was designed to
ignore.

The signal keeper sits beside the transmitter, headphones
on, listening. She's always listening.
```

- **Exits:** southwest (The Ridge)
- **NPCs:**
  - **SURA** — Signal Keeper (INFORMANT / QUESTGIVER / SERVICES)
    - Location: At the relay base. Headphones on.
    - Faction: Nomad (critical infrastructure role)
    - Disposition: Starts Wary (-5). She's protective of the relay — it's the most important thing the nomads have. Trust is earned by proving you're not a threat to it.
    - Personality: Twenties. Focused. She speaks in short transmissions, even in conversation — clipped, efficient, information-dense. She was born in the city but left as a teenager. Taught herself radio engineering from salvaged manuals. Built the relay with her own hands. She's the youngest person with a critical role in the nomad community and she takes it seriously enough to sleep beside the transmitter.
    - Information: Sura hears things. The other camps report via the relay — movements, sightings, weather, threats. She knows where the retrieval teams are operating. She knows which routes are safe for travel. She knows, because the other camps have reported it, that the 33hz frequency is detectable even out here — weaker, but present. She thought it was interference. She's not sure anymore.
    - Services:
      - **Long-range communication**: For CREDS or trade, Sura can send messages to other nomad camps or to contacts in the city (Iron Bloom, Asha Osei's pirate broadcast). This enables cross-zone quest coordination.
      - **Frequency scan**: TECH ≥ 6 — the player can use Sura's equipment to scan the radio spectrum. They find Asha's "Frequency Unknown" broadcast (from the Residential pirate studio). They find Iron Bloom's encrypted channel. And they find the 33hz signal, coming from below, present even this far from the city.
    - Quests:
      - **"Dead Air"** (Tier 2): One of the relay nodes — a camp further east — has gone silent. Sura needs someone to check on them. The trail leads into wilder country where the wildlife is more dangerous. The camp is found abandoned but intact — they moved in a hurry. Signs of a retrieval team. The camp's relay is damaged. Repair it (TECH ≥ 6) and the network is restored. Reward: Sura trusts you with the full relay network — communication access to all nomad camps.
    - Dialogue hook: "Quiet. I'm listening. — Okay. Go. You have two minutes before the next check-in."

  - **FINCH** — Helixion Defector (INFORMANT / LORE)
    - Location: Near the relay, but separate — he sits twenty meters away, not beside it. He's not allowed near the equipment. Too paranoid. Might break something.
    - Faction: None (former Helixion — deeply former)
    - Disposition: Starts Wary (-10). Paranoid. He flinches at sudden movements. Speaks in a low voice, constantly checking sightlines. The nomads tolerate him because what he knows is valuable. They don't fully trust him because he worked for the enemy.
    - Personality: Fifties. Thin. Twitchy in a different way than Tomas Wren — Tomas is damaged by the mesh, Finch is damaged by knowledge. He was a Helixion project director — mid-level, high enough to see the architecture. He ran when he understood what MNEMOS was actually for. Not compliance — replacement. The mesh doesn't just suppress identity. It prepares the neural substrate for Chrysalis. Every firmware update moves the population closer to overwrite readiness.
    - He ran further than anyone else — past the perimeter, into the wilds, to the nomads. He's been here for three years. He still looks over his shoulder every thirty seconds.
    - Information: Finch knows the Chrysalis timeline. He knows Helixion's phased rollout plan — firmware updates increasing compliance, building neural plasticity, preparing the population for identity replacement. He knows the Broadcast Tower's purpose: when it's complete, it'll push a single 33hz-modulated signal across the entire city, triggering simultaneous Chrysalis activation in every mesh-connected citizen. Mass overwrite. Everyone at once.
    - He tells you this in fragments, checking sightlines between sentences. He's terrified not because he knows the plan, but because he knows the timeline. It's soon.
    - Quest: None. Finch doesn't want anything except to not be found. But his information is the single most important lore dump in the game — the Chrysalis endgame explained by someone who helped design it.
    - Dialogue hook: "Don't say my name. Don't use my name. I'll tell you what I know and then you forget you talked to me. The tower isn't what they say it is. It's not a broadcast tower. It's a trigger."
- **Enemies:** None (the relay is hidden and guarded — the nomads protect it with concealment, not force)
- **Objects:**
  - `handmade_antenna` — Examine: "Twenty meters of salvaged pipe, guyed to the hillside. It's ugly and perfect. The engineering is sound — whoever built this understood propagation, impedance matching, and antenna theory. Sura built it from manuals. She's never taken a class. She's never had a teacher. She read books and built a communication network that connects communities across hundreds of kilometers. The mesh connects millions. This connects dozens. It's not better. It's free."
  - `transmitter` — Examine: "Weatherproof case, analog radio, short-wave. The frequency hopping is manual — Sura changes frequencies on a schedule shared with the other camps. The encryption is a one-time pad, handwritten on paper, destroyed after use. The entire system is invisible to Helixion's monitoring because it's built on technology so old the scanning algorithms don't look for it."
  - `33hz_detection` — Examine: (TECH ≥ 6 with frequency scan) "There. On the spectrum analyzer. 33hz. Not a transmission — a presence. Coming from below. Even this far from the city, the Substrate's frequency is detectable. It's weaker here — attenuated by distance and soil depth. But it's here. The frequency isn't urban infrastructure. It's geological. It predates the city, the Fringe, and possibly the entire human presence on this landscape."
  - `finch_sightlines` — Examine: "He sits where he can see in every direction. His back is against a rock — nothing can approach from behind. His eyes move in a pattern: east, south, west, north, sky. Every thirty seconds. He's been doing this for three years. The paranoia hasn't faded because the threat hasn't faded. Helixion retrieval teams have a seven-year operational mandate for high-value defectors. He has four years left."

-----

## ZONE EXITS SUMMARY

| From | Direction | To | Zone | Requirement |
|------|-----------|-----|------|------------|
| The Perimeter | west | Residential Blocks — far east | 2 | None |

-----

## QUEST SUMMARY

| Quest | Giver | Tier | Type | Summary |
|-------|-------|------|------|---------|
| Prove You're Not Followed | Neva | 2 | OBSERVATION | Watch the approach from The Ridge for six hours. Prove you're clean. Unlocks camp access. |
| The Missing Walker | Neva | 2 | INVESTIGATE | Track a missing nomad ranger. Find evidence of retrieval team activity. |
| The Signal Question | Neva | 3 | INVESTIGATE | Investigate 33hz anomalies the nomads have detected. Bridge quest to Substrate lore. |
| Dead Air | Sura | 2 | EXPLORE/REPAIR | Find and restore a silent relay node. Discover a camp evacuated ahead of retrieval team. |

-----

## ENEMY SUMMARY

| Enemy | Level | Location | Behavior | Drops |
|-------|-------|----------|----------|-------|
| Wild Predator | 3-5 | No-Man's Land, Open Ground | Pack hunters, circle, prefer dusk, patient | Pelts, bone (trade goods) |
| Exile | 4-6 | No-Man's Land, Exile Camp | Desperate, fight when cornered, retreat if hurt | Scrap, stolen supplies |
| Nomad Sentry | 5-7 | Sentry Line | Defensive only, retreat + reinforce, terrain advantage | Nothing (they're not meant to be killed) |
| Helixion Retrieval Team | 10-12 | Rare event spawn, any outdoor room | Coordinated squad, military tactics, stun weapons | Military gear, keycards, Helixion intel |

The retrieval team is a **rare event spawn** — not a standard encounter. They appear as part of quests ("The Missing Walker") or as a random event at very low probability. When they appear, the tone shifts entirely. They're professional, equipped, and they're looking for someone specific. If that someone is Finch, the player has a choice.

-----

## DESIGN NOTES

**This zone is the game's breath.** Every other zone is tension — surveillance, combat, decay, corporate horror. The Nomad territory is the exhale. The first horizon. The first stars. The first time children laugh without the mesh. Players need this zone to exist because it shows what the world could be — not perfect, not easy, but free. The game's central question (what is freedom worth?) gets its most honest answer here: freedom costs everything comfortable and gives you back everything real.

**The Open Ground (room 3) is the single most important visual moment in the game.** Bigger than the Helixion tower. Bigger than the Substrate. Because it's the simplest: you look up and see the sky. Every 3D environment in every other zone is enclosed or vertical. This one is horizontal. The horizon line. The distance. The wind. It resets the player's sense of scale and shows them that the city — the entire game world they've been navigating — is a speck.

**Wren the child is the game's most radical NPC.** Not because of what she knows — because of what she doesn't. She's never heard the mesh. She's never worn an implant. She doesn't understand why adults are afraid. Her questions reframe the entire game by exposing how much the player has normalized. "Do you miss it?" is the most dangerous question anyone asks.

**Finch the defector delivers the endgame lore.** The Chrysalis mass-overwrite plan. The Broadcast Tower as trigger. The firmware updates as preparation. He knows the timeline. It's soon. This information is available nowhere else in the game — it's the reward for reaching the most remote zone and earning the trust of the most paranoid man alive. Players who skip the nomads will learn the endgame through action. Players who find Finch will understand it.

**The retrieval teams are the zone's structural threat.** The nomads' entire lifestyle — moving constantly, never staying, always watching — exists because of these teams. They're rare but catastrophic. The missing walker quest shows what happens when they find you. The nomads' fear is not theoretical. It's operational. The game should convey this through NPC dialogue, the observation map's careful tracking, and the rare occasions when a team actually appears.

**The exile moral beat echoes across zones.** Daro — the man whose name is scratched on the Scavenger Cache wall in the Fringe Ruins ("DON'T HELP DARO") — appears here, cast out a second time. He's been expelled from two communities. The player encounters his name as graffiti in zone 4 and his body in zone 5 and gets to decide if the judgment was fair. There's no right answer. That's the point.

**Only one zone exit.** The Nomad territory connects to the Residential Blocks through the Perimeter and nowhere else. It's a dead end by design — the nomads live at the edge of the world. The isolation is geographic and mechanical. Players come here deliberately, not in passing. The journey to reach the nomads is part of the experience.

> 10 rooms. 5 named NPCs + exiles + nomad residents. 4 enemy types. 1 zone exit.
> The edge of the world. The first horizon. The cost and the gift of freedom.
