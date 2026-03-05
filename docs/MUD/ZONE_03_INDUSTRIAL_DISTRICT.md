# ZONE 3: INDUSTRIAL DISTRICT

> Depth: Surface (southeast)
> Location: Southeast of Helixion Campus, south of Residential Blocks, waterfront east
> Faction: Chrome Wolves (streets) / Helixion (active factories) — contested
> Rooms: 15
> Level Range: 4–12 (Acts 1–2)
> Origin Point: None

-----

## OVERVIEW

The Industrial District is where the city makes things and throws things away. Southeast of the campus, stretching from the residential border down to the waterfront, it's a patchwork of active Helixion-contracted factories and dead industrial shells the Chrome Wolves have claimed for their own purposes. The two powers coexist through mutual contempt and practical necessity — Helixion needs the district's infrastructure, the Wolves need the district's anonymity, and neither wants a war that would destroy what makes the area useful.

The zone runs on a gradient. The waterfront and docks on the eastern edge are low-level — scavengers, dock labor, the edge of the city where cargo comes and goes. Move west and inland, deeper into the factory sprawl, and the Chrome Wolves thicken. Their territory is a converted industrial complex — chop-shops, a ripperdoc clinic, their Den. The active Helixion factories sit behind fenced perimeters with private military security that doesn't leave the fence line. Between all of it: abandoned factory buildings where automata still run their last program and feral augments cluster in the ruins.

The aesthetic is rust and heat. Smoke stacks that still exhale. Loading cranes frozen mid-swing. The smell of machine oil, sulfur, and chemical runoff that drains through grates into the tunnel system below — feeding the Industrial Drainage (zone 10) and eventually the Drainage Nexus where the Parish lives. What Helixion builds here poisons the people who live beneath it. That's not a metaphor. It's hydrology.

-----

## ATMOSPHERE

```
Sound:    Docks — water against concrete, gulls, cargo machinery,
          the groan of ships at berth.
          Factory strip — pneumatic hammers from active factories,
          silence from dead ones. The contrast is jarring.
          Wolf territory — engines, metal music from workshops,
          shouted conversations, the whine of surgical tools.
          Abandoned zones — wind through broken windows, automata
          servos cycling, dripping coolant.
Light:    Docks — open sky, gray water, fog that rolls in from
          the waterfront and doesn't leave until noon.
          Factory strip — industrial floods at active sites,
          darkness at dead ones. Orange sodium vapor where
          streetlamps still work.
          Wolf territory — welding sparks, neon, work lights
          rigged to building facades.
Smell:    Machine oil everywhere. Sulfur near the active factories.
          Chemical runoff near the drainage grates — acrid,
          metallic, the taste of it sits in your throat for hours.
          Wolf territory adds ozone (from cyberware work) and
          grilled meat (they eat well).
```

-----

## ROOM MAP

```
    TO RESIDENTIAL BLOCKS                    TO FIGHT PITS
    (zone 2) Transit Station                 (zone 6)
              │                                  │
              │ north                            │ west
       ┌──────┴──────┐                   ┌──────┴──────┐
       │ FACTORY     │                   │ DISTRICT    │
       │ ROW         │                   │ BORDER      │
       │ (5)         │                   │ (15)        │
       └──────┬──────┘                   └──────┬──────┘
              │                                 │
              │ south                           │
       ┌──────┴──────┐   ┌───────────┐   ┌─────┴───────┐
       │ ACTIVE      │   │ DEAD      │   │ THE WOLF    │
       │ FACTORY     ├───┤ FACTORY   ├───┤ DEN         │
       │ (6)         │   │ (7)       │   │ (10)        │
       └─────────────┘   └─────┬─────┘   └──────┬──────┘
                               │                 │
                          ┌────┴─────┐    ┌──────┴──────┐
                          │ AUTOMATA │    │ RIPPERDOC   │
                          │ FLOOR    │    │ CLINIC      │
                          │ (8)      │    │ (11)        │
                          └──────────┘    └─────────────┘

       ┌──────────┐   ┌───────────┐   ┌───────────┐
       │ CARGO    │   │ THE       │   │ WOLF      │
       │ DOCKS    ├───┤ WATERFRONT├───┤ GARAGE    │
       │ (2)      │   │ (1)       │   │ (9)       │
       └──────┬───┘   └─────┬─────┘   └───────────┘
              │             │
       ┌──────┴───┐   ┌────┴──────┐
       │ SALVAGE  │   │ RUNOFF    │
       │ YARD     │   │ CHANNEL   │
       │ (3)      │   │ (4)       │
       └──────────┘   └─────┬─────┘
                            │ down
                       TO INDUSTRIAL
                       DRAINAGE (zone 10)

    INTERIOR SPACES:
    ┌───────────┐
    │ FOREMAN'S │ ← inside Active Factory (6)
    │ OFFICE    │
    │ (12)      │
    └───────────┘
    ┌───────────┐
    │ ASSEMBLY  │ ← inside Active Factory (6), restricted
    │ LINE      │
    │ (13)      │
    └───────────┘
    ┌───────────┐
    │ DOCK      │ ← inside Cargo Docks (2), office level
    │ BOSS      │
    │ OFFICE(14)│
    └───────────┘
```

-----

## ROOMS

### 1. THE WATERFRONT
**The eastern edge. Where the city meets the water.**

```
> INDUSTRIAL DISTRICT — THE WATERFRONT

The city ends here. A broad concrete embankment runs along
the waterline — cracked, stained with chemical residue,
studded with rusted bollards and mooring hooks. The water
is the color of spent coolant: gray-green, opaque, with
an oily film that catches the light in sick rainbows.

Fog rolls in from the water most mornings and hangs between
the warehouse buildings until the factories heat up enough
to burn it off. The air tastes like salt and sulfur.

To the north, cargo cranes stand against the sky like skeletal
fingers. To the west, the factory sprawl begins — smoke
stacks, chain-link, floodlights. South along the embankment,
the runoff channels drain factory waste into the water in
streams of yellow and orange.

A few dock workers sit on the embankment, eating lunch from
tin containers. One of them watches you with the professional
disinterest of a man who's learned not to notice things.
```

- **Exits:** north (Cargo Docks), west (Wolf Garage), south (Runoff Channel)
- **NPCs:**
  - `dock_workers` — Neutral. Ambient. 3-4 present. Manual laborers — mesh-compliant but too busy and too tired to care about anything except the next shift. They'll talk about the docks, the cargo schedules, and the fact that certain containers never get manifested. They won't talk about the Wolves.
- **Enemies:**
  - `dock_scavenger` × 2 — Level 4-5. Desperate. Armed with improvised weapons. They work the waterfront at night, picking through what washes up or falls off cargo loads. During the day they're skittish — won't attack unless outnumbered or if the player looks wounded.
- **Objects:**
  - `waterline` — Examine: "The water shouldn't be this color. Chemical runoff from twenty years of industrial processing. Nothing lives in it. Nothing has lived in it for a decade. The dock workers don't touch it without gloves. The fog that comes off it in the morning carries trace compounds that make your eyes sting."
  - `mooring_hooks` — Examine: "Rusted solid. Some of these berths haven't held a ship in years. The active berths are further north at the Cargo Docks. Down here, the embankment is just concrete meeting water and nothing in between but history."
  - `lunch_tins` — Examine: "Synth-protein and rice. The dock workers eat fast, mechanically. One of them has a real tomato — stands out like a gemstone against the gray. He eats it slowly, savoring it. He probably got it from the Block Market. Or Mae's garden. Real food is currency out here."
- **Notes:** Entry-level area. The waterfront establishes the district's tone — industrial waste, physical labor, the edge of the city where things get dirty. Low-level enemies, ambient NPCs, and the first hint that cargo at the docks isn't all legitimate.

-----

### 2. CARGO DOCKS
**The working waterfront. Containers, cranes, questions.**

```
> INDUSTRIAL DISTRICT — CARGO DOCKS

The active section of the waterfront. Cargo cranes tower
overhead, automated arms swinging containers from ship to
shore with mechanical precision. Stacks of shipping containers
form corridors and canyons — metal walls in faded colors,
labels in languages from places you've never been.

A workforce of fifty moves through the yard in high-vis
vests, guided by mesh-integrated logistics. Every container
has a destination. Every worker has a route. The system is
efficient. The system doesn't ask what's inside the containers
marked with Helixion's logo and a classification code that
doesn't appear in any public manifest.

A supervisor's office sits elevated on a gantry, overlooking
the yard. Lights on. Someone's watching the operation from above.
```

- **Exits:** south (The Waterfront), west (Factory Row), up (Dock Boss Office)
- **NPCs:**
  - `dock_laborers` — Neutral. Ambient. 5-8 present. Busier than the waterfront workers — they're on the clock. Won't stop to talk unless it's between shifts. They know the cargo schedules, which containers are "restricted," and that asking questions about Helixion shipments is a good way to lose your job.
- **Enemies:**
  - `dock_scavenger` × 3 — Level 4-6. Night spawn only. The scavengers hit the cargo yard after dark, trying to crack containers before the security patrols loop back.
  - `helixion_security` — Level 7-8. 1 guard patrols the Helixion container section. Corporate private military — not full enforcers, but armed and armored. They protect the containers, not the workers.
- **Objects:**
  - `helixion_containers` — Examine: "Matte gray, Helixion logo, classification code HX-7C. The manifest system doesn't list contents for these — just 'PRIORITY INFRASTRUCTURE COMPONENTS.' TECH ≥ 6: The containers' electronic locks communicate with a dedicated satellite uplink. Whatever's inside, Helixion tracks it from orbit. INT ≥ 7: The delivery schedule matches the Broadcast Tower construction timeline. They're shipping tower components through the docks."
  - `cargo_cranes` — Examine: "Automated. The arms swing on pre-programmed routes. Each container weighs tons and the cranes move them like playing cards. TECH ≥ 5: The automation algorithm is Helixion-designed. The cranes prioritize HX-coded containers. Everything else waits."
  - `manifest_terminal` — Examine: (TECH ≥ 6 to access) "Shipping records. Most containers are mundane — raw materials, consumer goods, food supplies. The HX-7C containers have arrival dates but no origin ports listed. They come from nowhere, apparently. Fifteen have arrived in the last month. The frequency is increasing."
- **Notes:** The Cargo Docks introduce the Broadcast Tower supply chain. Players who investigate the Helixion containers can connect this to the tower construction — the endgame weapon is being built with components shipped through an ordinary dock yard. The dock workers don't know. The Dock Boss does.

-----

### 3. SALVAGE YARD
**South docks. Where dead things get picked apart.**

```
> INDUSTRIAL DISTRICT — SALVAGE YARD

South of the main docks, where the embankment curves into
a shallow bay, the water deposits everything the current
carries. Wreckage, industrial waste, things that fell off
ships and were never claimed. Over the years, the deposit
has been formalized into a salvage operation — a fenced
acre of sorted metal, electronics, machine parts, and
unidentifiable debris.

The yard is technically legal. The dock authority tolerates
it because the scavengers keep the waterline clear. In
practice, it's a marketplace for anything too stolen, too
broken, or too questionable to sell through normal channels.

A man with a cutting torch is dismantling something that
used to be a security drone. The Helixion logo on its
chassis has been partially ground off. He doesn't look up.
```

- **Exits:** north (Cargo Docks / The Waterfront)
- **NPCs:**
  - `salvage_workers` — Neutral. 2-3 present. Independent operators. They buy, sell, and trade salvage. Low-tier gear at low prices — damaged weapons, scrap armor, electronics components.
- **Enemies:**
  - `dock_scavenger` × 2-3 — Level 5-6. Territorial over prime salvage spots. Will fight if the player starts taking high-value scrap without buying.
  - `feral_augment` — Level 5-6. 1 occasionally wanders into the yard from the southern ruins. Attracted by the metal and the noise.
- **Objects:**
  - `drone_chassis` — Examine: "Helixion security drone. Pulled from the water or shot down — hard to tell. The man with the torch is stripping its targeting array. Those sell well. The flight motor is already gone. The Helixion logo is ground smooth but the serial number is still readable. TECH ≥ 5: The serial links to campus perimeter inventory. This drone was active three weeks ago."
  - `salvage_piles` — Examine: "Metal sorted by type: ferrous in one pile, aluminum in another, copper carefully coiled. Electronics sorted by condition: working, repairable, components-only. A bin labeled 'WEIRD' contains items nobody can identify — crystalline structures, a tube of viscous black fluid that's warm to the touch, a chip that hums when you hold it."
  - `weird_bin` — Examine: "The black fluid is warm. Not body-warm — fever-warm. It moves when you tilt the tube, slower than liquid should. GHOST ≥ 5: The chip in the bin hums at 33hz. It's a fragment of a neural lattice. Not Helixion's — older. Someone dredged this from the deep water."
- **Notes:** The Salvage Yard is a low-level shopping and lore location. The "weird" bin contains substrate fragments — pieces of the 33hz infrastructure that predate Helixion, washed up from wherever the deep water connects to the Substrate. Players won't understand what they're finding here until much later.

-----

### 4. RUNOFF CHANNEL
**Where the factories drain. Connects below.**

```
> INDUSTRIAL DISTRICT — RUNOFF CHANNEL

A concrete channel running from the factory district to the
waterfront, carrying the effluent of Helixion's manufacturing
process. The liquid is the wrong color — yellow-orange,
viscous, steaming faintly in the cooler air. The smell is
sharp enough to make your eyes water from ten meters away.

The channel is three meters wide and two deep. Metal grating
bridges it at intervals. At the base of the channel, the
runoff feeds into a larger drainage pipe that descends
underground — the connection to the Industrial Drainage
system (zone 10) and eventually the tunnels where the
Parish lives.

The concrete walls of the channel are stained permanently.
Chemical etchings that almost look like writing. Almost.

A dead feral augment lies at the channel's edge. It tried
to drink the water. That was a mistake.
```

- **Exits:** north (The Waterfront), down (Industrial Drainage, zone 10)
- **NPCs:** None
- **Enemies:**
  - `feral_augment` × 2 — Level 5-7. Drawn to the chemical warmth of the runoff. Aggressive, disoriented by the fumes.
- **Objects:**
  - `runoff_liquid` — Examine: "Don't touch it. The chemical composition is actively corrosive — TECH ≥ 4 confirms cadmium, chromium compounds, and something synthetic that doesn't match any known industrial byproduct. This is what Helixion's factories produce as waste. This is what filters down to the Parish."
  - `chemical_etchings` — Examine: "The runoff has carved patterns into the concrete over years of flow. The patterns are almost regular — branching, fractal, like river deltas or neural pathways. GHOST ≥ 6: They're not random. The chemical reactions are following the same substrate patterns that run beneath the city. The runoff is toxic — but the stone underneath remembers what it used to be."
  - `dead_augment` — Examine: "Face-down at the channel's edge. The skin on their hands is blistered where they touched the liquid. Their implants are corroded — the augmented arm has gone from chrome to green. Whatever they were before Helixion, whatever they were after, they ended here, thirsty enough to drink poison."
  - `drainage_pipe` — Examine: "The channel narrows into a large pipe that descends at a steep angle. You can hear the liquid echoing below — falling for a long time. This feeds the Industrial Drainage system. Everything Helixion pours out up here ends up in the tunnels where people live. The Parish coughs because of this pipe."
- **Notes:** The connection point between surface industry and underground suffering. The drainage pipe physically links Helixion's factories to the Parish's water supply. The chemical etchings following substrate patterns are a subtle lore touch — the 33hz infrastructure is everywhere, even in the damage pattern of toxic runoff.

-----

### 5. FACTORY ROW
**The main artery. Active and dead side by side.**

```
> INDUSTRIAL DISTRICT — FACTORY ROW

A wide industrial boulevard lined with factory buildings on
both sides. The road surface is heavy-duty composite, scarred
by years of cargo vehicles. To the east, the active factories
hum — lit, guarded, smoke rising from stacks, the sound of
production muffled behind insulated walls. To the west, the
dead factories stand dark — windows broken, gates chained,
the machinery inside visible through gaps in the walls like
bones through skin.

The contrast is the district in miniature. Helixion keeps
half the infrastructure alive because it needs it. The other
half rots because it doesn't. The Chrome Wolves live in the
gap between the two.

A Wolf patrol — three augmented figures on modified
motorcycles — rolls down the boulevard at walking speed.
They're not looking for trouble. They're showing the flag.
Everyone they pass nods or looks away. Nobody challenges.
```

- **Exits:** north (Residential Blocks — Transit Station, zone 2), south (Cargo Docks), east (Active Factory), west (Dead Factory)
- **NPCs:**
  - `factory_workers` — Neutral. Ambient. 3-4 present. Shift workers heading to or from the active factories. Mesh-compliant, tired, carrying lunch pails. They coexist with the Wolves through a simple arrangement: don't look, don't talk, don't be interesting.
- **Enemies:**
  - `chrome_wolves_patrol` × 3 — Level 7-8. On motorcycles. They're not hostile by default — they patrol and observe. Attacking them triggers Wolf hostility across the zone. If the player's Chrome Wolves disposition is Neutral or better, they nod and pass. If Hostile, they engage.
- **Objects:**
  - `active_factories` — Examine: "Lit up. Running. The nearest one has HELIXION MANUFACTURING — DIVISION 7 on the gate. Behind the fence: loading bays, smokestacks, the hum of heavy machinery. Corporate security patrols the perimeter. Whatever's being built inside, it's not for public consumption."
  - `dead_factories` — Examine: "Dark. Chained gates, broken windows, graffiti. The Chrome Wolves' territory starts where the chain-link ends. Some buildings have been converted — you can see welding light through windows, hear music, smell cooking. Others are truly dead, machinery frozen mid-operation, the power cut years ago."
  - `wolf_motorcycles` — Examine: "Modified. Heavy frames, augmented engines. The riders' augmentations match their bikes — chrome arms, enhanced optics, the kind of body modification that says 'I chose this.' The Wolves don't hide their chrome. They display it. Augmentation is identity, not compromise."
  - `road_scars` — Examine: "The composite road surface is gouged by years of heavy vehicles. Some scars are fresh — cargo trucks heading to the active factories. Some are old — tracks from machines that no longer exist, leading to factories that no longer run. The road remembers everything the district used to be."

-----

### 6. ACTIVE FACTORY
**Helixion manufacturing. Behind the fence.**

```
> INDUSTRIAL DISTRICT — ACTIVE FACTORY

HELIXION MANUFACTURING — DIVISION 7. The fence is three
meters of reinforced chain-link topped with sensor wire.
The gate is manned by corporate security in tactical gear
— not campus enforcers, but private military contractors.
Cheaper. Less augmented. Still armed enough to kill you.

Inside the fence: a loading bay, a parking lot for worker
vehicles, and the factory building itself — a massive
concrete structure with no windows on the ground floor.
The upper level has narrow observation windows that glow
with blue-white light. Smokestacks on the roof exhale a
thin stream of gray-white vapor. The air near the building
tastes metallic.

Workers enter through a turnstile with biometric scanners.
They don't exit during shift. Eight-hour rotations. What
they do inside, they don't discuss — not because they're
loyal, but because the mesh doesn't let them form the words.
```

- **Exits:** west (Factory Row), inside (Foreman's Office — requires keycard or escort), deeper (Assembly Line — restricted)
- **NPCs:**
  - `factory_shift_workers` — Neutral. 2-3 exiting or entering. Their mesh compliance is higher than residential workers — factory-grade suppression. They can talk about their commute, their lunch, the weather. They cannot talk about their work. Watch their faces when they try — the sentence starts and then... they change the subject. They don't notice they've done it.
- **Enemies:**
  - `corporate_security` × 2 — Level 8-9. Patrol the fence perimeter. Armed. Will engage if the player enters without authorization. Won't chase beyond the fence line — their contract covers the factory, not the street.
- **Objects:**
  - `biometric_turnstile` — Examine: "Full scan — retinal, neural signature, mesh compliance check. Workers pass through without slowing. The system processes them in less than a second. TECH ≥ 7: The scanner also performs a real-time memory audit. If a worker has formed specific memories about the production process since their last scan, those memories are flagged for mesh suppression. They forget what they built before they get home."
  - `smokestacks` — Examine: "The vapor is thin, almost transparent. Not traditional combustion exhaust — something cleaner. TECH ≥ 6: The chemical signature includes aerosolized neural paste byproducts. This factory processes the same base compounds used in Helixion's implant manufacturing. Whatever they're building, it interfaces with human neurology."
  - `observation_windows` — Examine: "Narrow slits in the upper level. Blue-white light — the same frequency as the Helixion tower's clinical floors. You can't see inside from this angle. But you can hear something through the walls — not machinery. A hum. Low, steady, rhythmic. GHOST ≥ 5: 33hz. The factory is resonating. The production process uses the frequency."

-----

### 7. DEAD FACTORY
**The abandoned half. Chrome Wolf frontier.**

```
> INDUSTRIAL DISTRICT — DEAD FACTORY

One of a dozen factories that stopped running when Helixion
consolidated manufacturing into fewer, more automated
facilities. The gate is open — chain cut years ago. The
loading bay doors hang at angles. Inside: a cavernous floor
of silent machinery, conveyor belts frozen mid-transport,
control panels dark.

The Chrome Wolves have claimed the perimeter but not the
interior. The interior belongs to whatever's still moving
inside — factory automata that were never deactivated,
still running their last program on emergency battery,
performing tasks on empty lines. The sound of their servos
echoing in the dark is the loneliest noise in the district.

Tools and salvage are scattered near the entrance — Wolf
scouts strip what they can from the accessible areas. The
deeper sections haven't been cleared. Nobody volunteers
for that.
```

- **Exits:** east (Factory Row), west (The Wolf Den), inside (Automata Floor)
- **NPCs:** None
- **Enemies:**
  - `chrome_wolves_scout` × 2 — Level 7-8. Working the perimeter, stripping salvage. Not hostile if Wolf disposition is Neutral or better. If Hostile, they engage — and they're tougher than street thugs.
  - `feral_augment` — Level 6-7. 1, lurking in the deeper sections near the automata.
- **Objects:**
  - `frozen_machinery` — Examine: "Assembly equipment for — checking the old signage — consumer electronics. Helixion-branded home devices. Before the company pivoted entirely to neural technology, this factory made things that plugged into walls, not brains. The production line is a fossil of a time when Helixion's products were optional."
  - `wolf_salvage` — Examine: "The Wolves strip copper, circuit boards, servo motors, anything that can be repurposed. Their work is efficient and organized — labeled containers, sorted materials. They run their operation like a business. Because it is one."
  - `automata_sounds` — Examine: "Listen. Deeper in the building — the click-whir of robotic arms cycling through assembly motions. The hiss of pneumatic grippers closing on nothing. They're building ghosts. Products that will never exist, on a line that will never run again. Emergency batteries have kept them going for years. Nobody turned them off because nobody knows how."

-----

### 8. AUTOMATA FLOOR
**Inside the dead factory. The machines that didn't stop.**

```
> INDUSTRIAL DISTRICT — AUTOMATA FLOOR

The deep interior of the dead factory. Emergency lighting
casts everything in red. The production line stretches the
length of the building — and every station is active.

Robotic arms swing and grip and place and weld, performing
the exact sequence they were doing when the power was cut
years ago. Emergency batteries keep the servos alive. The
arms assemble nothing — their grippers close on empty air,
their welders fire at bare conveyor belt, their quality
scanners check products that don't exist.

Some of the automata have degraded. Their movements are
jerky, off-axis, wrong. A welding arm fires its torch at
the ceiling. A gripper arm opens and closes spasmodically.
One unit has torn itself from its mounting and drags itself
along the floor by one arm, still trying to reach its
station.

They're not dangerous because they're hostile. They're
dangerous because they don't know you're here and they
don't care. You're an obstacle between them and a task
they'll never complete.
```

- **Exits:** out (Dead Factory)
- **NPCs:** None
- **Enemies:**
  - `industrial_automaton` × 3-4 — Level 6-8. Not hostile in the traditional sense — they're running programs. They attack because the player enters their operational radius, not because they choose to. Predictable patterns. High damage (industrial equipment). TECH ≥ 6 can deactivate individual units. TECH ≥ 9 can shut down the entire floor from the control panel.
- **Objects:**
  - `control_panel` — Examine: "The master control for the production line. Dark — main power is cut. But the emergency override is still active. TECH ≥ 9: You can interface and send a shutdown command to all units. The floor goes quiet for the first time in years. The silence is louder than the machines."
  - `dragging_automaton` — Examine: "It tore itself free from its mounting. The base plate is still attached to the floor, bolts sheared. It drags itself with one arm, the other hanging useless, trailing sparks. It's trying to reach station 14. It will never reach station 14. It will try until its battery dies. GHOST ≥ 4: You feel something. Not the frequency. Something simpler. Sympathy."
  - `emergency_batteries` — Examine: "Industrial-grade power cells. They've been running for years on reserve. Each one is worth significant CREDS if salvaged — the Wolves would pay well. Removing them kills the automata. The factory finally stops. Is that mercy or murder? They're machines. It shouldn't matter. It does."
  - `loot_cache` — Examine: (behind station 14, where the dragging automaton is trying to reach) "A worker's locker, preserved behind the machinery. Inside: personal effects — a photograph, a data chip with a goodbye message to someone named 'Eli,' and a high-quality toolkit worth significant CREDS. The last worker on this line left their things behind when the factory closed. The automaton is trying to deliver them to a station that nobody will ever staff again."
- **Notes:** The Automata Floor is the zone's emotional room — Block 17 for the Industrial District. The dragging automaton trying to reach station 14 is the image that stays. The choice to salvage the batteries or let the machines run is a quiet moral beat with no quest reward, no reputation change. Just a choice about what you do to things that can't fight back.

-----

### 9. WOLF GARAGE
**Chrome Wolf territory begins. The mechanical heart.**

```
> INDUSTRIAL DISTRICT — WOLF GARAGE

A converted warehouse where the Chrome Wolves maintain their
vehicles and do their first-line augmentation work. Roll-up
doors open onto the waterfront side. Inside: motorcycles in
various states of assembly, welding stations, a hydraulic
lift with a truck on it, and the constant sound of metal
being shaped by people who love metal.

The Wolves here are mechanics first. Fighters second. Their
chrome isn't just combat augmentation — it's art. Modified
arms with custom engraving. Optical implants with aesthetic
irises. Legs built for power or speed, chosen like someone
choosing shoes. They modify themselves the way they modify
their machines: constantly, deliberately, with pride.

The air smells like motor oil, hot metal, and the ozone
signature of active cyberware. Music plays from a speaker
someone bolted to the ceiling — heavy, rhythmic, the bass
shaking the tools on the workbenches.
```

- **Exits:** east (The Waterfront), north (Dead Factory / The Wolf Den)
- **NPCs:**
  - `wolf_mechanics` — Chrome Wolves faction. Neutral if disposition is ≥ 0. 3-4 present. They'll talk about machines, augmentation, and Wolf philosophy: the body is a platform, chrome is self-expression, Helixion took augmentation and turned it into control — the Wolves took it back and made it identity. If disposition is Friendly, they'll do basic repairs (weapon and armor maintenance) for CREDS.
- **Enemies:** None (Wolf territory — attacking here turns the entire faction hostile)
- **Objects:**
  - `motorcycle_line` — Examine: "Eight machines in various stages. The closest is stripped to the frame — engine out, being rebuilt with salvaged Helixion power cells. The furthest is complete: matte black, low-slung, the engine housing engraved with a wolf skull. Every machine is unique. Mass production is what Helixion does. The Wolves make things by hand."
  - `hydraulic_lift` — Examine: "A cargo truck on the lift. The undercarriage has been modified — a concealed compartment large enough for four people, lined with mesh-dampening material. A smuggling vehicle. The Wolves move people and goods through the district without Helixion's logistics system knowing."
  - `custom_chrome` — Examine: "A workbench covered in augmentation components — fingers, wrist joints, optical lenses. Each one is hand-finished. Some are polished mirror-chrome. Some are matte black. One forearm assembly has been engraved with a phrase: 'MY BODY, MY BLUEPRINT.' The Wolves' creed."
  - `music_speaker` — Examine: "Bolted to a ceiling beam. The bass is physical — you feel it in your chest. The Wolves work to music the way other people work to silence. The rhythm matches their hammer strikes. The garage runs on beat."

-----

### 10. THE WOLF DEN
**Chrome Wolves HQ. Converted factory. Home.**

```
> INDUSTRIAL DISTRICT — THE WOLF DEN

The largest of the dead factories, fully converted. The
exterior is reinforced — welded steel plates over the
original walls, firing positions cut into the upper level,
the Helixion logo on the smokestack replaced with a spray-
painted wolf skull the size of a car.

Inside: a community. The factory floor has been divided into
zones — a common area with tables and cooking stations, a
workshop wing, sleeping quarters in the old offices, and a
raised platform at the far end where the pack's leadership
holds court. Everything is industrial-aesthetic by choice,
not poverty. The Wolves could make this place comfortable.
They choose to make it strong.

Fifty to sixty Chrome Wolves live and operate from the Den.
The air smells like grilled meat, engine grease, and ozone.
Someone is always working. Someone is always eating. Someone
is always sparring in the corner. The Den never sleeps.
```

- **Exits:** east (Dead Factory), south (Wolf Garage), north (Ripperdoc Clinic), west (District Border)
- **NPCs:**
  - `chrome_wolves_members` — Faction. 6-8 present. The ambient population is active — sparring, cooking, repairing gear, playing cards. They acknowledge players with Neutral or better disposition. They're loud, physical, and direct. No subtlety. No mesh-mediated politeness. If a Wolf doesn't like you, they say so. If they do, they hand you a beer.
  - **VOSS** — Chrome Wolf Lieutenant (QUESTGIVER / FACTION LEADER)
    - Location: Raised platform. The command seat — a welded throne made from motorcycle frames.
    - Faction: Chrome Wolves (second-in-command; the Alpha is off-site, referenced but never seen in this zone)
    - Disposition: Starts Neutral (0). Respects action over words. Disposition increases through combat prowess, completing jobs, and demonstrating that you're not Helixion or Iron Bloom. Decreases if you're caught spying, lying, or showing weakness.
    - Personality: Late thirties. Massive augmentation — both arms chrome past the shoulders, one eye replaced with a targeting optic, subdermal armor plating visible at the collarbone. She speaks in short sentences and means every word. She leads the Den while the Alpha handles inter-faction politics. Voss handles the ground. She's good at it.
    - Philosophy: The Wolves believe augmentation is personal sovereignty. Helixion uses it for control. Iron Bloom rejects it as tainted. The Wolves embrace it as identity. "Your body. Your blueprint." She doesn't trust anyone who doesn't have chrome — and she doesn't trust anyone whose chrome was installed by Helixion.
    - Quests:
      - **"Prove It"** (Tier 2): Before Voss gives you anything, you prove you're useful. She sends you to clear the Automata Floor in the Dead Factory — the machines are interfering with Wolf expansion. Return with proof (an automaton's servo core). Reward: Wolf disposition boost, access to Ripperdoc Clinic, Voss begins offering real jobs.
      - **"Fence Line"** (Tier 3): The corporate security at the Active Factory has been expanding their patrol range — probing into Wolf territory. Voss wants a message sent. Options: destroy a security checkpoint (combat), hack their comms to make them think the perimeter is breached (TECH ≥ 8), or confront the security captain directly (COOL ≥ 8 — a tense negotiation). Each approach has different consequences for the Wolf-Helixion balance.
      - **"The Shipment"** (Tier 3): Voss has intel that a Helixion cargo shipment at the docks contains military-grade cyberware — confiscated augmentations taken from "decommissioned" subjects. She wants them liberated. The job involves infiltrating the Cargo Docks, cracking an HX-7C container, and extracting the contents before Helixion security responds. Reward: major CREDS, Wolf reputation, and the recovered cyberware includes pieces that belonged to known subjects — names the Parish remembers.
    - Dialogue hook: "Talk is cheap. Chrome isn't. Show me what you're made of — literally — and we'll see if there's a conversation worth having."
- **Enemies:** None (safe zone for allied players. Attacking triggers the entire Den — 10+ Wolves, Level 7-10. You will die.)
- **Objects:**
  - `welded_throne` — Examine: "Motorcycle frames welded into a seat. Not comfortable — that's the point. The command position in the Wolf pack isn't a reward. It's a station. Voss sits in it like she was built for it. She probably was."
  - `sparring_corner` — Examine: "Two Wolves fighting bare-knuckle with augmented arms. The impacts sound like car crashes. They're grinning. One lands a hit that cracks a wall tile and they both laugh. This is how the Wolves calibrate — they test their chrome against each other, constantly, because chrome that doesn't get tested becomes chrome that fails."
  - `wolf_banner` — Examine: "A flag hung above the platform: matte black, wolf skull in chrome paint, the words 'MY BODY, MY BLUEPRINT' beneath it. The same phrase is tattooed, engraved, or painted on nearly every Wolf in the Den. It's not a motto. It's an oath."
  - `cooking_stations` — Examine: "Real meat on a grill made from a factory press. The Wolves eat well — they control enough territory to source actual food. Vegetables from somewhere, real bread, and meat that definitely came from an animal and not a synthesizer. They cook in the open and share without asking. You're either pack or you're not. If you are, you eat."

-----

### 11. RIPPERDOC CLINIC
**Wolf territory. Real surgery. Real chrome.**

```
> INDUSTRIAL DISTRICT — RIPPERDOC CLINIC

A converted factory office suite, three rooms deep. The
front room is a waiting area — metal chairs, a table with
old magazines nobody reads, a sign that says "NO REFUNDS"
in three languages. The middle room is prep — sterilization
equipment, a wall of cyberware components in labeled drawers,
diagnostic equipment older than the building but maintained
like sacred objects.

The back room is the operating theater. A surgical chair
under industrial work lights. A full suite of cybernetic
installation tools — nerve threaders, bone anchors, neural
sync calibrators. The chair has restraint straps. Not for
control. For when the pain reflex kicks and the patient
tries to leave mid-procedure.

A woman in surgical scrubs and a leather apron is cleaning
tools. Her own augmentations are subtle — you'd miss them
if you weren't looking. Her left hand has too many degrees
of articulation. Her eyes focus at distances a human eye
shouldn't resolve. The work is in the details.
```

- **Exits:** south (The Wolf Den)
- **NPCs:**
  - **DR. RIN COSTA** — Ripperdoc (SHOPKEEPER / SERVICES)
    - Faction: Chrome Wolves (affiliated, not a member — she's independent but operates under Wolf protection)
    - Disposition: Starts Neutral (+5). Professional. She cares about the work, not the politics.
    - Personality: Forties. Precise. Speaks softly. Former Helixion biomedical engineer (like Cole in the Parish, but she stayed in the corporate world longer). Left when the MNEMOS program started using her techniques for compliance rather than healing. The Wolves offered protection. She offers them chrome. The arrangement works because both sides respect competence.
    - Services:
      - **Cyberware Installation**: The real thing. T1 cyberware for all archetypes. T2 for SOVEREIGN and INTEGRATED. Costs CREDS + components. Installation takes time — the player is "out" for a period after surgery.
      - **Cyberware Repair**: Full repair of damaged augmentations. Better than Pee's patches — permanent fix.
      - **Cyberware Removal**: Can remove unwanted implants. The only person in the district who can do this safely.
      - **Diagnosis**: Can examine the player's implants and identify their original purpose, condition, and any hidden functionality (quest-relevant for some storylines).
    - Memory: Tracks surgeries performed. Repeat customers get faster recovery times. At high disposition, she offers experimental procedures — cutting-edge cyberware not available anywhere else, sourced from the Wolves' salvage operations.
    - Dialogue hook: "Sit down. Shirt off. Let me see what they did to you before I decide what I can do for you."
- **Enemies:** None (Wolf-protected)
- **Objects:**
  - `cyberware_drawers` — Examine: "Labeled, organized, temperature-controlled where necessary. Fingers, eyes, subdermal plating, reflex enhancers, neural bridges. Each component is catalogued with source notes — some are Wolf salvage, some are Freemarket imports, some are... Helixion. The labels have serial numbers that match campus inventory. Stolen. Every piece of chrome in this drawer used to be inside someone Helixion owned."
  - `surgical_chair` — Examine: "Industrial. The leather is worn smooth. The restraint straps are adjustable — she calibrates them to the patient. The headrest has a neural contact array — she monitors brain activity during installation. The pain management system is basic: a local anesthetic injector and a bite guard. She apologizes for the bite guard. It's necessary."
  - `dr_costa_augments` — Examine: (visible only with TECH ≥ 7 or GHOST ≥ 5) "Her hands. The articulation is wrong — too many joints, too precise. She can rotate her fingers independently on axes that human fingers don't have. Surgical augmentation designed for surgical augmentation. She modified herself to be better at modifying others. The recursion is very Chrome Wolf."
  - `no_refunds_sign` — Examine: "'NO REFUNDS.' Three languages. She means it. The sign is old — she's been doing this for a long time. Beneath it, someone scratched: 'But she's never needed to offer one.'"

-----

### 12. FOREMAN'S OFFICE
**Inside the Active Factory. The man caught in the middle.**

```
> INDUSTRIAL DISTRICT — FOREMAN'S OFFICE

Ground floor, past the turnstile, through a corridor of
industrial gray. The foreman's office is glass-walled,
overlooking the factory floor through observation windows
with blinds that are always half-closed. Inside: a desk
buried in production schedules, a coffee machine that's
been running since morning, and a man who looks like he
hasn't slept properly in months.

The view through the observation window shows the factory
floor — automated assembly arms, conveyor systems, workers
in clean-room suits performing tasks that the glass muffles
into pantomime. What they're assembling is visible but not
immediately identifiable. Components. Modular. Designed to
connect to each other in sequences that look biological.
```

- **Exits:** out (Active Factory)
- **NPCs:**
  - **KARL BRENN** — Factory Foreman (QUESTGIVER / INFORMANT)
    - Faction: Helixion (employee). Unwilling.
    - Disposition: Starts Unfriendly (-15). Scared. He's seen the assembly line. He knows what they're building. He can't talk about it because the mesh won't let him — but if you bring him a mesh modulator (from Pee Okoro or the Wolf ripperdoc), the suppression lifts for thirty minutes and he'll talk.
    - Personality: Fifties. Big hands, quiet voice. Spent twenty years in industrial management before Helixion absorbed his employer. He runs the factory because the alternative is unemployment in a city where unemployment means losing your mesh stipend, your apartment, your healthcare. He's not brave. He's trapped. But he's decent, and decency in this building is a form of resistance.
    - Information (with mesh modulator): The factory is manufacturing Broadcast Tower components. Specifically — the neural resonance amplifiers that will convert 33hz from a passive frequency into an active compliance broadcast. Each amplifier is modular. There are hundreds. When assembled in the tower's spire, they create a lattice that covers the entire city. This is how Helixion plans to weaponize the frequency.
    - Quests:
      - **"Production Records"** (Tier 3): Brenn wants someone to extract the factory's production manifest from the secured terminal on the Assembly Line floor. The manifest proves what the factory is building. If delivered to Iron Bloom or Asha Osei, it becomes evidence for the resistance. Reward: major XP, faction reputation, and Brenn begins feeding intel periodically.
      - **"The Foreman's Exit"** (Tier 3): At Friendly disposition, Brenn asks for help getting out. He wants to defect — but his mesh has a corporate geofence. If he crosses the district boundary, Helixion flags him. He needs Iron Bloom to remove the geofence. Reward: Brenn relocates to Iron Bloom, becomes a permanent technical advisor (unlocks Broadcast Tower technical lore).
    - Dialogue hook: "I can't— the words don't— give me a minute." [with mesh modulator] "Oh god. Oh god, I can think. Okay. Listen. I have thirty minutes and you need to hear what we're building in there."

-----

### 13. ASSEMBLY LINE
**Inside the Active Factory. Where the weapon is made.**

```
> INDUSTRIAL DISTRICT — ASSEMBLY LINE

The factory floor. Clean-room environment — filtered air,
controlled humidity, the hum of precision equipment. Workers
in sealed suits perform tasks at stations along a conveyor
system. Automated arms handle the heavy assembly. The
workers do the fine work — connecting neural-grade circuitry
that machines aren't delicate enough to handle.

On the conveyor: components. Each one is a curved panel,
roughly a meter long, covered in neural resonance
amplification circuitry. They look like scales. Or feathers.
Or the segments of a spine. Hundreds of them, moving down
the line, each one tested, calibrated, and packed into
the same matte-gray containers you saw at the Cargo Docks.

HX-7C.

This is what's inside the containers. This is what the
Broadcast Tower is made of.
```

- **Exits:** out (Foreman's Office)
- **NPCs:** None (workers are in clean-room suits, mesh-suppressed, unable to interact)
- **Enemies:**
  - `corporate_security` × 2 — Level 9-10. Interior guards. Better equipped than perimeter security. If the player is here without authorization, they engage immediately and trigger a factory lockdown.
  - `automated_defense` — Level 9. Factory security system. Activates on lockdown. Ceiling-mounted suppressant dispensers (chemical — 1d4 damage per turn, INT save to resist disorientation).
- **Objects:**
  - `resonance_amplifiers` — Examine: "Each panel is a neural resonance amplifier. The circuitry is designed to receive a frequency input and amplify it across a specific range. The input frequency is calibrated to 33hz. Hundreds of these, assembled into the Broadcast Tower's spire, would turn a natural phenomenon into a city-wide neural broadcast. This is how Helixion turns the sovereign frequency into a weapon."
  - `production_terminal` — Examine: (TECH ≥ 8 to access, triggers alarm if failed) "The production manifest. Component specifications. Delivery schedules. Assembly instructions for the Broadcast Tower's resonance array. The math is elegant — the amplifiers are arranged in a Fibonacci spiral, each one reinforcing the next. The design is beautiful. It's also a machine for ending human autonomy. The manifest is the quest objective for Brenn's 'Production Records' quest."
  - `worker_stations` — Examine: "The workers' hands move with mechanical precision — not because they're machines, but because the mesh is guiding their motor functions. They're not assembling the components. The mesh is assembling the components through their hands. They might as well not be here. They are here because the final connections require human neural proximity — the circuitry calibrates to living tissue during assembly. The workers are part of the manufacturing process. Their bodies are tools."

-----

### 14. DOCK BOSS OFFICE
**Above the Cargo Docks. The man who sees everything.**

```
> INDUSTRIAL DISTRICT — DOCK BOSS OFFICE

An elevated office on a gantry above the cargo yard, accessible
by a metal staircase. The windows are floor-to-ceiling,
overlooking the dock operation below. From up here, you can
see every crane, every container, every worker, and the
water beyond.

The office is functional — a desk, three monitors showing
dock manifests and security feeds, a filing cabinet that
looks like it hasn't been opened digitally because the man
behind the desk doesn't trust digital. An ashtray with a
cigarette burning. A bottle of something amber. Two glasses,
one clean.

He was expecting you. Or someone like you. Sooner or later,
everyone with questions about the Helixion shipments ends
up in this office. He's been here long enough to know which
questions are dangerous and which are just expensive.
```

- **Exits:** down (Cargo Docks)
- **NPCs:**
  - **OYUNN** — Dock Boss (SHOPKEEPER / INFORMANT / QUESTGIVER)
    - Faction: Freemarket (deeply embedded — the docks ARE Freemarket logistics)
    - Disposition: Starts Neutral (0). Transactional. Everything is a deal. But he's fair, and he remembers fair dealing.
    - Personality: Fifties. Heavy. Patient. Speaks with the certainty of a man who has sat in the same chair for fifteen years and watched the city change around him without moving. He controls the dock operation — worker schedules, cargo routing, berth assignments. Helixion needs the docks and Oyunn runs the docks, which gives him leverage. He uses it carefully.
    - Information: Oyunn knows the HX-7C shipments are Broadcast Tower components. He knows the delivery frequency is accelerating. He knows the Wolves want to intercept them. He plays all sides — not out of malice, but because the docks survive by being useful to everyone and threatening to no one.
    - Sells: Cargo manifests (reveals HX-7C schedules), dock worker contacts (access to restricted areas), shipping routes (for smuggling goods in or out of the city), and silence (for CREDS, he'll ensure your activity at the docks goes unrecorded).
    - Quests:
      - **"Manifest Discrepancy"** (Tier 2): Oyunn has noticed a discrepancy — more HX-7C containers are arriving than the Broadcast Tower construction should require. Where are the extras going? He wants the player to track a specific container from dock to destination. The trail leads to the Maintenance Tunnels (zone 9) — Helixion is stockpiling components underground. Reward: CREDS, Freemarket reputation, and the location of Helixion's underground staging area.
      - **"Clean Harbor"** (Tier 2): The dock scavengers are getting bolder — they've started breaking into active containers. Oyunn needs them cleared from the waterfront for a high-value shipment arriving tonight. He doesn't care how — fight them, buy them off, or relocate them. Reward: CREDS + standing invitation to Oyunn's office (permanent discount on information).
    - Dialogue hook: "The second glass is for you. Sit down. I hear things, and you want things, and the dock runs on making those two facts meet in the middle."

-----

### 15. DISTRICT BORDER
**The western edge. Where the pit calls.**

```
> INDUSTRIAL DISTRICT — DISTRICT BORDER

The Chrome Wolf territory thins at the western edge of the
district, where the factories give way to waste ground —
rubble, rusted fencing, dead lots. The air smells different
here: less machine oil, more dust and something else.
Sweat. Blood. The copper tang of violence conducted as
entertainment.

A path of beaten dirt leads through a gap in the fencing
toward a structure that used to be a water treatment plant.
The concrete basin has been repurposed. Lights blaze from
within. You can hear the crowd before you see them — cheering,
jeering, the impact sounds of bodies hitting bodies with
modifications that make the impacts louder than they should be.

The Fight Pits. The lawless zone between the Industrial
District and the Fringe where the city's rules stop and
something older starts.

A man sits at a folding table near the entrance, taking
bets. He looks at you like a butcher looks at a cut of meat.
Evaluating.
```

- **Exits:** east (The Wolf Den), west (Fight Pits, zone 6)
- **NPCs:**
  - **RADE** — Fight Pit Operator (SHOPKEEPER / QUESTGIVER)
    - Faction: Independent (operates in the lawless zone between Wolf and Fringe territory)
    - Disposition: Starts Neutral (0). Respects fighters. Disrespects complainers.
    - Personality: Indeterminate age. Lean. Missing his left ear — replaced with a low-grade audio implant that he didn't bother disguising. He runs the pits because violence needs management and he's good at managing. Not cruel — practical. The pits exist because people need to fight and other people need to watch. He provides the venue and takes a percentage.
    - Services: Access to the Fight Pits (zone 6). Bet placement. Fighter registration.
    - Quests:
      - **"Fresh Meat"** (Tier 2): Rade wants the player to fight in the pit. Three rounds, escalating difficulty. Win all three and Rade offers the player a permanent Fight Pit invitation — access to high-stakes matches with better rewards. Reward: CREDS, combat XP, and reputation across all factions (everyone watches the pits).
    - Dialogue hook: "Fighter or spectator? Fighters go left. Spectators go right. Spectators pay at the door. Fighters pay with what's under their skin."
- **Enemies:**
  - `feral_augment` × 2 — Level 7-8. The waste ground between the districts attracts them. Tougher than the waterfront variety — these have been feeding.
- **Objects:**
  - `fight_pit_entrance` — Examine: "The old water treatment basin, repurposed as an arena. You can see the lights from here — industrial floods angled down into the basin. The concrete walls are stained with things you don't want to identify. The crowd noise is rhythmic. They chant. They bet. They watch people break each other in a place where the mesh can't see."
  - `betting_table` — Examine: "Rade's operation. Handwritten odds on a whiteboard. Tonight's card lists fighters by nickname — Chrome Jaw, Deadswitch, Moth, The Silencer. The odds on Moth are long. Rade crosses out names that don't come back and he doesn't erase them. The whiteboard is a history of damage."
  - `waste_ground` — Examine: "The no-man's-land between Industrial and Fringe. No faction claims it. No faction maintains it. The rubble and fencing create a natural boundary — a demilitarized zone of neglect. Things live in the gaps: feral augments, scavengers, and the occasional Chrome Wolf deserter who couldn't hack the pack."

-----

## ZONE EXITS SUMMARY

| From | Direction | To | Zone | Requirement |
|------|-----------|-----|------|------------|
| Factory Row | north | Residential Blocks — Transit Station | 2 | None |
| Runoff Channel | down | Industrial Drainage | 10 | None |
| District Border | west | Fight Pits | 6 | None |
| Rooftop access via factories | — | Rooftop Network | 7 | Building traverse |

-----

## QUEST SUMMARY

| Quest | Giver | Tier | Type | Summary |
|-------|-------|------|------|---------|
| Prove It | Voss | 2 | COMBAT | Clear the Automata Floor. Bring back a servo core. Gate to Wolf services. |
| Fence Line | Voss | 3 | MULTI | Push back Helixion security patrols — fight, hack, or negotiate. |
| The Shipment | Voss | 3 | HEIST | Raid HX-7C container at docks. Recover confiscated cyberware. |
| Production Records | Brenn | 3 | SABOTAGE | Extract factory manifest from Assembly Line. Prove what Helixion is building. |
| The Foreman's Exit | Brenn | 3 | ESCORT | Help Brenn defect. Remove his mesh geofence via Iron Bloom. |
| Manifest Discrepancy | Oyunn | 2 | INVESTIGATE | Track an extra HX-7C container to its hidden destination underground. |
| Clean Harbor | Oyunn | 2 | COMBAT/SOCIAL | Clear dock scavengers for a high-value shipment. |
| Fresh Meat | Rade | 2 | COMBAT | Fight three rounds in the pit. Win to earn a standing invitation. |

-----

## ENEMY SUMMARY

| Enemy | Level | Location | Behavior | Drops |
|-------|-------|----------|----------|-------|
| Dock Scavenger | 4-6 | Waterfront, Cargo Docks, Salvage Yard | Desperate, attack wounded/outnumbered, flee | Scrap, improvised weapons, salvage |
| Feral Augment | 5-8 | Salvage Yard, Runoff Channel, Dead Factory, District Border | Aggressive, disoriented, territorial | Damaged implants, scrap cyberware |
| Chrome Wolves Patrol | 7-8 | Factory Row | Observe, engage only if disposition Hostile | Wolf gear, chrome components, CREDS |
| Chrome Wolves Scout | 7-8 | Dead Factory | Salvage work, fight if provoked or Hostile | Salvage, Wolf tokens |
| Corporate Security | 7-10 | Active Factory, Assembly Line, Cargo Docks | Perimeter patrol, don't leave fence line | Mil-spec weapons, keycards, tactical gear |
| Industrial Automaton | 6-8 | Automata Floor | Program-driven, attack on proximity, predictable | Servo cores, power cells, components |
| Automated Defense | 9 | Assembly Line | Lockdown trigger, chemical suppression | Security components |

-----

## FREEMARKET PRESENCE

**OYUNN** at the Cargo Docks is the Freemarket's logistics backbone. The docks are how the Freemarket moves goods into and out of the city — Oyunn's control of the dock operation is the physical infrastructure behind every Freemarket vendor's inventory. He's not flashy like Devi or careful like Ketch. He's the supply chain.

**DEVI** (from Residential Blocks) sources some of her inventory through Oyunn's dock connections. Players who've built relationships with both can leverage the Freemarket network for better prices and rarer goods.

-----

## DESIGN NOTES

**The Industrial District is the game's mechanical hub.** The Ripperdoc Clinic provides the cyberware system. The Fight Pits provide combat challenge content. The Cargo Docks provide the Broadcast Tower supply chain. The Wolf Den provides a faction base. More systems are available here than any other zone.

**The Chrome Wolves are the district's moral complexity.** They're not good. They're not evil. They're a community built around body autonomy and self-modification in a world where those things have been weaponized. Their philosophy — "My Body, My Blueprint" — is a direct challenge to both Helixion's control and Iron Bloom's suspicion of augmentation. Players have to decide what they think about people who solve problems with chrome and violence.

**The Active Factory reveals the endgame weapon.** The Broadcast Tower components — neural resonance amplifiers — are being manufactured in an ordinary factory by workers who can't remember what they build. The horror is industrial: the system produces the tool of its own totalitarianism through the same supply chain that makes everything else. The workers are part of the manufacturing process because the circuitry needs living neural proximity to calibrate. Their bodies are literally used as tools.

**The Automata Floor is the emotional anchor.** The dragging robot trying to reach station 14. The battery salvage choice. The worker's goodbye message to Eli. In a district defined by metal and force, the quietest room is the one that hits hardest.

**The two-faction tension creates dynamic gameplay.** Chrome Wolves and Helixion security coexist through contempt, not peace. Quests from both sides (Voss's "Fence Line" and Brenn's quests) push the player to choose — or play both sides. The district's political balance is something the player can shift.

**Factory waste → Parish suffering.** The Runoff Channel physically connects Helixion's manufacturing to the tunnels where the Parish lives. The chemical etchings following substrate patterns in the drainage walls tie this to the deeper lore. Even the damage the city does follows the frequency's architecture.

> 15 rooms. 5 named NPCs + dock workers and Wolf members. 7 enemy types. 4 exits to other zones.
> Where the city makes things, breaks things, and the people in between decide what they're made of.
