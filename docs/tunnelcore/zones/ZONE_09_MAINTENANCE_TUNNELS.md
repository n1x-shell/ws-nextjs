# ZONE 9: MAINTENANCE TUNNELS

> Depth: Shallow undercity
> Location: Beneath the Residential Blocks and Helixion Campus
> Faction: None (Helixion controls the eastern half; the western half belongs to nobody)
> Rooms: 11
> Level Range: 4–14 (sharp gradient — west 4-6, east 10-14)
> Origin Point: None

-----

## OVERVIEW

The maintenance tunnels are the city's plumbing. Not water — information. Cable runs carrying mesh signal to every building. Ventilation ducts processing air for hundreds of thousands of people. Power conduits. Fiber optic bundles. The infrastructure that makes the surface world function, running through corridors beneath it that nobody sees and nobody thinks about.

The tunnels split into two halves, and the split is absolute.

The western half runs beneath the Residential Blocks. This side is neglected. The infrastructure still functions — cables still carry signal, vents still move air — but nobody maintains it. Nobody patrols it. The corridors are dusty, the lighting is emergency-only, and the only things that move down here are rats, insects, and people who don't want to be found. The residential side of the maintenance tunnels is the city's unconscious — the part that works without anyone watching.

The eastern half runs beneath the Helixion Campus. This side is locked. Surveillance cameras on every junction. Sensor grids across every approach. D9 agents using the tunnels as covert movement corridors. Maintenance drones that repair infrastructure and report anomalies simultaneously. The Helixion side is a fortress beneath a fortress — the campus's security extends underground, and the tunnels are as defended as the tower above.

Between the two halves: the dividing line. A security bulkhead installed by Helixion when the campus was built — a physical and electronic barrier separating their maintained infrastructure from the neglected residential tunnels. Crossing that line is the zone's central challenge. Everything on the neglected side is accessible. Everything on the Helixion side requires stealth, preparation, or both.

The maintenance tunnels connect to everything. Up to the Residential Blocks. Up to the Helixion Campus. West to the Drainage Nexus. South to the Industrial Drainage. And down — through access shafts and forgotten passages — toward the deep undercity. This zone is the hinge between the surface world and the darkness below.

-----

## ATMOSPHERE

```
Sound:    West (residential side) — electrical hum from cable
          bundles. Ventilation fans running on automatic, cycling
          air through buildings that don't know the tunnels exist.
          Dripping from condensation on cold pipes. Rats
          scratching in the walls. Occasional footsteps from
          above — residents walking in their apartments, the
          sound traveling through the floor into the ceiling
          below. Living above the dead.

          East (Helixion side) — the hum is louder, cleaner.
          Climate-controlled air circulation. The periodic
          chirp of sensor systems confirming all-clear. The
          whisper of maintenance drone servos. Footsteps —
          measured, deliberate, D9 patrol boots on clean
          corridor floor. Silence between the footsteps that
          feels like it's listening.

Light:    West — emergency lighting only. Dim strips along the
          floor that cast everything in flat amber. Some
          sections are completely dark — the emergency system
          failed and nobody replaced it. Flashlights matter.

          East — bright. Clinical white. Uniform. No shadows.
          The Helixion side is lit the way the campus above is
          lit — as if darkness itself were a security threat.
          Which, to them, it is.

Smell:    West — dust. Old air. The metallic tang of copper
          from exposed cable runs. Mold in sections where
          condensation pools. Faintly, from below, the
          chemical trace of the drainage system.

          East — recycled air. Antiseptic. The same sterile
          nothing as the campus above. The tunnel air is
          scrubbed. Even the smell is controlled.
```

-----

## ROOM MAP

```
    FROM DRAINAGE NEXUS
    (zone 8) East Passage
              │
              │ west
       ┌──────┴──────┐
       │ WEST        │
       │ JUNCTION    │
       │ (1)         │
       └──────┬──────┘
              │
       ┌──────┴──────┐   ┌───────────┐
       │ CABLE       │   │ FORGOTTEN │
       │ GALLERY     ├───┤ SERVER    │
       │ (2)         │   │ ROOM (5)  │
       └──────┬──────┘   └───────────┘
              │
       ┌──────┴──────┐
       │ VENTILATION │
       │ HUB         │
       │ (3)         │
       └──────┬──────┘
              │ up                     
         TO RESIDENTIAL               
         BLOCKS (zone 2)              
         Squatter Floors              
              │                        
       ┌──────┴──────┐                
       │ SMUGGLER'S  │                
       │ CORRIDOR    │                
       │ (4)         │                
       └──────┬──────┘                
              │ east                   
    ══════════╪═══════════ THE DIVIDING LINE
              │
       ┌──────┴──────┐
       │ THE         │
       │ BULKHEAD    │
       │ (6)         │
       └──────┬──────┘
              │ east
       ┌──────┴──────┐   ┌───────────┐
       │ SENSOR      │   │ THE GAP   │
       │ CORRIDOR    ├───┤ (8)       │
       │ (7)         │   │ (hidden)  │
       └──────┬──────┘   └───────────┘
              │
       ┌──────┴──────┐
       │ HELIXION    │
       │ SERVICE     │
       │ CORRIDOR (9)│
       └──────┬──────┘
              │
       ┌──────┴──────┐   ┌───────────┐
       │ STAGING     │   │ DEEP      │
       │ AREA        ├───┤ ACCESS    │
       │ (10)        │   │ SHAFT (11)│
       └──────┬──────┘   └───────────┘
              │ up
         TO HELIXION CAMPUS
         (zone 1) Service Sublevel
```

-----

## ROOMS

### 1. WEST JUNCTION
**Where the neglected tunnels begin. The city's unconscious.**

```
> MAINTENANCE TUNNELS — WEST JUNCTION

A concrete junction where three tunnel corridors meet. The
ceiling is low — two and a half meters — and lined with
cable bundles, pipe runs, and ventilation ducts. Everything
is functional. Nothing is maintained. Dust has settled on
the horizontal surfaces in layers thick enough to record
footprints. Emergency lighting casts the junction in flat
amber. Some of the strips have failed, leaving pockets
of darkness between the pools of dim light.

The junction was designed as a service hub — routing point
for the cable and utility infrastructure serving the
western residential blocks. Access panels line the walls,
most closed, some hanging open. Behind them: cable
termination points, valve manifolds, electrical
switchgear. The infrastructure still works because it was
built to work without attention. But the dust says nobody
has attended to it in years.

Footprints in the dust. Not yours. Multiple sets, different
sizes, going different directions. You're not the first
person to find these tunnels. You're not alone down here.
```

- **Exits:** east (Drainage Nexus — East Passage, zone 8 r12), south (Cable Gallery), down (connects to Industrial Drainage zone 10 via utility shaft — cramped, one-way traversal)
- **NPCs:** None
- **Enemies:**
  - `tunnel_rats` × 3-4 — Level 4. Large, adapted to the electrical environment. Their fur is thin and their eyes are enlarged for low-light conditions. Not aggressive unless cornered or protecting a nest. They scatter from light and sound. More nuisance than threat, but they reveal something: life adapts to the tunnels. Even the rats have learned to live in the city's walls.
- **Objects:**
  - `dust_footprints` — Examine: "Multiple sets. Some old — dust partially refilled the tracks. Some recent — sharp edges, clear tread patterns. At least three different people have been through here in the past month. GHOST ≥ 4: One set of prints leads south with purpose — regular stride, familiar with the route. Another set wanders — exploring, hesitant. The third set is barefoot. Barefoot in maintenance tunnels. Someone who lives here."
  - `access_panels` — Examine: "Cable termination points, electrical switchgear, valve manifolds. The infrastructure of the residential blocks, accessible from below. TECH ≥ 5: Some of these panels control building systems — power routing, ventilation management, mesh signal distribution. The residential blocks' infrastructure is controlled from corridors that nobody monitors. You could shut down the power to an entire apartment building from here. Nobody would know why."
  - `emergency_lighting` — Examine: "Amber strips along the floor — emergency system, battery-backed, designed to function independently of the main grid. Some have failed. The batteries have a twenty-year lifespan. These have been running for fifteen. In five more years, the western tunnels will be completely dark. Nobody will replace them. Nobody knows they need replacing."
  - `cable_bundles` — Examine: "Fiber optic and copper, bundled and secured to the ceiling with cable trays. The fiber carries mesh signal to every building above. The copper carries power. TECH ≥ 6: The mesh signal passes through this junction. You could tap it — intercept the residential mesh traffic, read the data, even modify it before it reaches the apartments above. Kite's pirate network does this from the rooftops. Down here, you could do it from the source."

-----

### 2. CABLE GALLERY
**The spine of the residential infrastructure. Beautiful and forgotten.**

```
> MAINTENANCE TUNNELS — CABLE GALLERY

A long corridor — fifty meters, straight, wide enough for
a maintenance cart that hasn't been here in a decade. The
walls are cable. Not decorated with cable — made of cable.
Thousands of runs, bundled and secured, covering every
surface from floor to ceiling. Fiber optic bundles glow
faintly — the light of data moving through glass. Copper
runs are oxidized green in places where condensation has
pooled. The overall effect is organic — the cables look
like veins, like the inside of something alive.

The gallery hums. Every cable carries current or signal
and the combined vibration creates a sound that's felt as
much as heard — a low, constant resonance that sits in
your chest. It's not 33hz. It's the city's own frequency.
The sound of information moving through infrastructure.
The difference between this hum and the Substrate's
frequency is the difference between a machine and a
heartbeat.

At the gallery's midpoint, a side passage leads to
something that shouldn't exist.
```

- **Exits:** north (West Junction), south (Ventilation Hub), east (Forgotten Server Room — hidden passage)
- **NPCs:**
  - **MOTH** — Tunnel Dweller (INFORMANT / GUIDE / SHOPKEEPER)
    - Location: Midway along the gallery. Sitting against the cable wall, eating from a can.
    - Faction: None (entirely off-grid — no faction knows she's here)
    - Disposition: Starts Wary (-10). She's survived down here by being invisible. A stranger finding her is a threat by definition.
    - Personality: Fifties. Small. She moves through the tunnels the way the rats do — quick, quiet, staying close to the walls. She's lived in the maintenance tunnels for eight years. She left the surface when her apartment building was scheduled for Helixion mesh-compliance renovation — new hardware, mandatory implant updates, the building's infrastructure absorbed into the corporate system. She couldn't leave the city (no resources). She couldn't stay in the building (the renovations would flag her non-compliance). So she went down. Into the walls. Into the space nobody looks.
    - She knows every centimeter of the neglected western tunnels. Every passage, every junction, every dead end. She knows which panels control which buildings. She knows where the rats nest, where the water pools, where the air moves and where it doesn't. She doesn't know the Helixion side — she's never crossed the bulkhead. She's never wanted to.
    - Services:
      - **Guide**: For food or trade goods (she doesn't use CREDS — nothing to spend them on), Moth leads the player through the western tunnels, revealing hidden passages and shortcuts. Her routes bypass hazards and reduce traversal time.
      - **Tunnel knowledge**: She knows the infrastructure intimately. Need to find a specific cable run? She knows. Need to access a building's utility systems from below? She knows. Need to find the passage that connects to the deep access shaft? She knows.
      - **Salvage trade**: She collects usable components from the tunnel infrastructure — wire, connectors, circuit boards, tools left behind by maintenance workers years ago. She trades these for food, water, medical supplies, and light sources (her most precious commodity).
    - Quest:
      - **"The Renovation"** (Tier 2): Moth's old apartment building — the one she fled — is undergoing the next phase of mesh-compliance renovation. The new hardware will extend Helixion monitoring into the tunnel infrastructure beneath the building, exposing her living space. She needs the player to sabotage the renovation from below — disable the new cable runs before they go active. TECH ≥ 6 required. The sabotage buys Moth time but reveals the tunnel access to the renovation workers, creating a ticking clock for a follow-up quest.
    - Dialogue hook: "...don't scream. I'm not going to hurt you. I just need to know if you're alone. — You are. Good. I'm Moth. I live here. I know that sounds wrong. It's not. Let me show you."
- **Enemies:** None (the Cable Gallery is Moth's territory — the vermin avoid the hum)
- **Objects:**
  - `cable_walls` — Examine: "Thousands of runs. Fiber, copper, coaxial, some cable types you don't recognize. The cables are organized by layer — power at the bottom, mesh signal in the middle, legacy systems at the top. The legacy layer is dead — analog telephone, cable television, pre-mesh internet. The cables are still there. Nobody removed them. They're ghost infrastructure. The nervous system of a city that doesn't exist anymore."
  - `fiber_glow` — Examine: "The fiber optic bundles glow. Faintly, visible only where the emergency lighting is dim. The glow is data — light pulses carrying mesh traffic. Millions of transmissions per second, visible as a shimmer in the glass. It's beautiful. It's the residential blocks' entire digital life, flowing through this corridor, accessible, readable, and completely unprotected because nobody expected anyone to be down here."
  - `the_hum` — Examine: "The gallery resonates. Cable vibration, power hum, the acoustic effect of thousands of current-carrying conductors in an enclosed space. The sound sits in your chest at approximately 60hz — mains frequency. It's NOT the 33hz Substrate pulse. It's the city's own frequency. Infrastructure, not biology. Machine, not organism. The two frequencies coexist in the tunnels but they're different things. Learning to tell them apart matters."
  - `hidden_passage` — Examine: (GHOST ≥ 5 or Moth's guidance) "Behind a loose access panel, a narrow passage branches east. The panel has been opened and closed many times — the dust pattern shows regular use, but the panel is repositioned carefully each time. Moth doesn't go this way. She says the passage leads to a room that 'hums wrong.' She means the 33hz. Something in there resonates at the Substrate's frequency, not the city's."

-----

### 3. VENTILATION HUB
**The lungs of the city. Vast. Mechanical. Deafening.**

```
> MAINTENANCE TUNNELS — VENTILATION HUB

The corridor opens into a space that shouldn't exist beneath
apartment buildings. A chamber — twenty meters across,
fifteen meters high — dominated by industrial ventilation
machinery. Four massive air handling units, each one the
size of a shipping container, connected to ductwork that
branches in every direction. The units run on automatic,
cycling air through the residential blocks above. They've
been running unattended for years. The noise is constant
and enormous — a mechanical roar that swallows every other
sound.

The chamber is the city's lungs. The air you breathe in
every residential apartment passes through these machines.
Filters, temperature control, humidity management. The
units also contain mesh signal repeaters — the air ducts
double as signal waveguides, carrying the mesh frequency
into every room in every building. You breathe the mesh.
It's in the air. Literally.

The maintenance catwalks above the units provide access
to the upper sections of the machinery. Below, drainage
grates show the level beneath — utility shafts that
descend into the deeper infrastructure.
```

- **Exits:** north (Cable Gallery), south (Smuggler's Corridor), up (Residential Blocks — Squatter Floors, zone 2 r07, via maintenance ladder)
- **NPCs:** None (the noise makes habitation impossible)
- **Enemies:**
  - `tunnel_vermin_swarm` — Level 5. The warm air and vibration attract insects — large, adapted cockroaches that nest in the ventilation housing. They swarm when disturbed. Low damage but persistent and unsettling. The swarm is more atmosphere than threat.
- **Objects:**
  - `air_handling_units` — Examine: "Industrial. Enormous. Each unit processes air for approximately fifty apartment buildings. The filters are clogged — years of operation without replacement. The output air is still breathable but the efficiency has dropped. The residential blocks' air quality has been slowly degrading. Nobody above has noticed because the degradation is gradual and the mesh doesn't flag infrastructure issues in neglected zones. The lungs of the city are failing and the city doesn't know."
  - `mesh_repeaters` — Examine: "TECH ≥ 6: Embedded in the air handling units. The mesh signal is modulated onto a carrier wave that propagates through the ductwork — the ducts act as waveguides, distributing the signal into every room in every building connected to this hub. The mesh isn't just transmitted from towers and repeaters. It's carried in the air ducts. You breathe mesh-frequency air. The signal enters your home through the vents. TECH ≥ 8: The repeaters can be disabled. Doing so would drop mesh coverage in approximately fifty buildings. The residents would feel the absence as anxiety, confusion — withdrawal symptoms. The mesh is a dependency. Removing it isn't liberation. It's surgery."
  - `the_noise` — Examine: "The ventilation machinery generates a constant 85-decibel roar. Conversation is impossible without shouting. GHOST checks are easier here — the noise covers movement, footsteps, even combat sounds. But it also covers approaching threats. The hub is acoustically dangerous: you can't hear what's coming and nothing can hear you. Both are useful. Both are terrifying."
  - `drainage_grates` — Examine: "Below the catwalks: grated floor sections showing utility shafts descending into darkness. The shafts are narrow — too small for comfortable passage, large enough if you're desperate. They connect to the deeper infrastructure beneath the maintenance tunnels — the transition zone between shallow undercity and the deep levels. GHOST ≥ 5: Warm air rises from below. Not machine warmth — organic warmth. The temperature differential suggests biological activity in the deep shafts. Something alive. Something large enough to generate heat."

-----

### 4. SMUGGLER'S CORRIDOR
**The passage between worlds. Contraband highway.**

```
> MAINTENANCE TUNNELS — SMUGGLER'S CORRIDOR

A long utility corridor running south from the Ventilation
Hub, parallel to the residential blocks above. The corridor
was designed for cable maintenance — every twenty meters,
an access panel opens onto the cable infrastructure serving
a different building. The panels are numbered. Some of the
numbers have been scratched out and replaced with symbols
— a system of marks that means nothing to you and everything
to someone.

The symbols are smuggler marks. This corridor is a
contraband highway — goods move through here between the
residential blocks and the deeper undercity. Medical
supplies, stims, unregistered cyberware, physical media,
food that didn't come through Helixion supply chains. The
smuggler marks indicate drop points, safe sections, timing
windows when the corridor is clear.

The corridor is cleaner than the rest of the western
tunnels. Someone sweeps it. Someone maintains the lighting.
Someone cares about this passage because this passage
makes them money.
```

- **Exits:** north (Ventilation Hub), east (The Bulkhead — approaching the dividing line)
- **NPCs:**
  - **FEX** — Smuggler (SHOPKEEPER / QUESTGIVER / SERVICES)
    - Location: Midway along the corridor, leaning against a panel. Waiting for a delivery or a customer — it's always one or the other.
    - Faction: Freemarket (logistics — the smuggling operation is a Freemarket franchise)
    - Disposition: Starts Neutral (0). Transactional. Fex likes customers. Fex likes people who don't ask where things come from.
    - Personality: Thirties. Quick, lean, perpetually amused. She moves through the tunnels like she owns them — which, in the sections she operates, she functionally does. She's a Freemarket operator specializing in the residential blocks' underground supply chain. Everything that enters the blocks without going through Helixion's commercial channels comes through Fex or someone like her.
    - She knows the tunnels well enough to operate but she doesn't live here — she has a surface life, an apartment, a mesh identity that reads as a mid-level logistics coordinator (which isn't entirely false). The tunnels are her office, not her home.
    - Services:
      - **Black market goods**: Stims, medical supplies, unregistered cyberware components, food, tools, communication equipment. Better selection than the Scavenger Cache, worse than the Black Market Warrens. Prices are fair. Quality is reliable. Fex's reputation depends on repeat customers.
      - **Contraband transport**: For CREDS, Fex moves items between zones through the tunnel network. She can deliver goods to NPCs in the Residential Blocks, the Drainage Nexus, or the Industrial Drainage without the player making the trip.
      - **Tunnel access information**: Fex knows the smuggler marks, the timing windows, and which sections of the tunnels are safe at which times. She sells this as route intelligence.
    - Quests:
      - **"The Shipment"** (Tier 2): Fex has a large delivery coming through — medical supplies bound for the Parish in the Drainage Nexus. The delivery is stuck. Her courier was intercepted by D9 in the sensor corridor on the Helixion side. The courier escaped but the supplies didn't. The cargo is in a D9 seizure cache on the Helixion side of the bulkhead. She needs the player to recover it. This requires crossing the dividing line — the zone's central challenge — to retrieve supplies from D9-controlled territory. Reward: CREDS + Fex's permanent service discount + a relationship with the Freemarket smuggling network.
      - **"Supply Line"** (Tier 2): Fex wants to establish a permanent supply corridor from the maintenance tunnels to the Iron Bloom server farm. The route exists but it passes through the deep access shaft (room 11) which has been blocked by collapse. She needs someone to clear the passage. Reward: Opens a smuggling route that enables NPC supply transactions between the Residential Blocks and Iron Bloom.
    - Dialogue hook: "Looking for something? I probably have it. Don't have it? I can get it. Can't get it? It doesn't exist. — What's your budget?"
- **Enemies:** None (the smuggler's corridor is safe — Fex's presence and the Freemarket's reputation protect it)
- **Objects:**
  - `smuggler_marks` — Examine: "Scratched into the walls beside access panels. A language of symbols: circles (drop points), arrows (direction of safe travel), crosses (avoid), stars (timing — how many points indicates which hour window is clear). GHOST ≥ 4: The marks are standardized Freemarket smuggler notation — used across the city's underground passages. Learning the system reveals an invisible layer of navigation data."
  - `access_panel_drops` — Examine: "Some panels have been modified — hinges oiled, latches replaced, interiors cleaned. These are active drop points. Goods are left in the cable space behind the panel, collected by the next courier on the route. The system is low-tech and highly effective — the drops are invisible to anyone who doesn't know the marks."
  - `maintained_lighting` — Examine: "The emergency lighting in this section works. All of it. Someone has replaced the failed strips. The floor has been swept. The difference between this corridor and the rest of the western tunnels is maintenance — someone cares about this passage. Investment implies value. Value implies traffic. The corridor's cleanliness is an advertisement."

-----

### 5. FORGOTTEN SERVER ROOM
**Behind the hidden passage. Data Helixion thought was erased.**

```
> MAINTENANCE TUNNELS — FORGOTTEN SERVER ROOM

Behind the loose panel in the Cable Gallery, through a
narrow passage that smells like old air and hot metal,
a room that time forgot.

It's a server room. Pre-Helixion. The racks are old — beige
metal housings, fans that still spin on dying bearings, LED
indicators blinking in patterns that mean nothing to modern
systems. The servers were installed when the residential
blocks were built, decades ago. They managed the buildings'
original systems — climate, security, utilities. When
Helixion absorbed the infrastructure, they migrated
everything to their own servers and decommissioned these.

They did not erase them. They disconnected them from the
network and forgot they existed. The servers have been
running on local power — a dedicated circuit that nobody
thought to cut — for fifteen years. The data on them is
intact. Building management logs, resident records,
communication archives. Fifteen years of a neighborhood's
digital life, preserved in machines nobody remembers.

The room hums. Not the 60hz city frequency. 33hz.
Something in the server hardware resonates at the
Substrate's frequency. The machines are old enough to have
been built before Helixion's electromagnetic standards.
Their oscillators drift. They've drifted to 33hz. Or
they've been pulled.
```

- **Exits:** west (Cable Gallery — hidden passage)
- **NPCs:** None
- **Enemies:** None (the room is sealed and hidden — nothing has found it)
- **Objects:**
  - `pre_helixion_servers` — Examine: "Beige racks. Old fans. Blinking LEDs. These servers predate the mesh by twenty years. They run on hardware that Helixion would consider archaeological. The data formats are legacy — readable, but you need to know the old systems. TECH ≥ 7: The servers contain intact building management databases for the western residential blocks. Resident records. Maintenance logs. Communication archives — emails, messages, voice recordings. Fifteen years of a community's life, frozen at the moment Helixion disconnected the machines."
  - `resident_records` — Examine: (TECH ≥ 7 to access) "Names. Addresses. Employment records. Medical data — pre-mesh medical data, from when doctors examined patients instead of querying implants. The records show who lived here before. Some names match current residents — people who've been in the same apartment for decades. Some names don't appear in any current database. People who were here and then weren't. GHOST ≥ 6: Cross-referencing the disappeared residents with Helixion program timelines reveals overlaps. People vanished from these buildings during MNEMOS recruitment phases. The residential blocks weren't just compliant housing. They were a recruitment pool."
  - `communication_archives` — Examine: (TECH ≥ 8 to access) "Messages. Thousands of them. The last two years of communication before Helixion absorbed the infrastructure. People talking to each other — about work, about family, about the changes happening around them. The tone shifts over the archive period. Early messages are normal — complaints about weather, plans for dinner. Late messages are anxious. 'Have you noticed the new equipment on the roof?' 'Did you get the mandatory health screening notice?' 'My neighbor hasn't been home in a week.' The archive ends mid-conversation. Someone was typing 'I think something is wrong with—' and then Helixion pulled the plug."
  - `33hz_resonance` — Examine: "The servers hum. The old oscillators have drifted from their designed frequency — 50hz mains — to 33hz. Every clock crystal, every timing circuit, every oscillating component has migrated to the Substrate's frequency over fifteen years of unattended operation. TECH ≥ 8: The drift isn't random. The oscillators converged. Different components, different starting frequencies, all arriving at the same destination. The Substrate's frequency doesn't just broadcast. It attracts. It pulls other oscillations toward itself. The servers didn't drift. They were tuned."

-----

### 6. THE BULKHEAD
**The dividing line. Where the neglected world ends and the locked world begins.**

```
> MAINTENANCE TUNNELS — THE BULKHEAD

A wall of steel. Floor to ceiling, wall to wall. A
security bulkhead installed when the Helixion campus was
constructed — sealing the campus infrastructure from the
residential infrastructure, separating maintained from
neglected, controlled from forgotten.

The bulkhead is heavy-gauge steel with a single access
door — biometric lock, magnetic seal, camera above the
frame. On this side: dust, dim lighting, the hum of
neglected cables. On the other side (visible through a
reinforced window): bright clinical white, clean corridors,
the Helixion logo stenciled on the wall.

The door has never been opened from this side. The lock
doesn't accept residential credentials. The camera feeds
to a D9 monitoring station. Approaching the door is a
statement. Opening it is an act of war.

But the bulkhead was installed by humans who think in
straight lines. And the tunnels were built by engineers
who thought in systems.
```

- **Exits:** west (Smuggler's Corridor), east (Sensor Corridor — if the bulkhead is bypassed)
- **NPCs:** None
- **Enemies:**
  - `bulkhead_camera` — Not an enemy. A sensor. The camera above the door records continuously. Approaching within five meters triggers a D9 alert. TECH ≥ 6 can loop the camera feed. GHOST ≥ 6 can avoid the camera's field of view (it has a blind spot at floor level, left side — designed for standing humans, not crawling ones).
- **Objects:**
  - `the_bulkhead` — Examine: "Steel. Heavy-gauge. The kind of barrier that says 'this is ours and that is not.' Installed during campus construction — the residential side of the tunnel network was sealed off as a security measure. The bulkhead is effective against direct approach. It is not effective against people who understand infrastructure. The tunnels are systems. Systems have redundancies. Redundancies have access points. The bulkhead sealed the door. It didn't seal every duct, every cable chase, every utility conduit that crosses from one side to the other."
  - `biometric_lock` — Examine: "TECH ≥ 7: The lock reads palm geometry and neural signature — the mesh implant's unique identifier. Campus security credentials open it. D9 credentials open it. Stolen credentials from Yara, Gus, or Vasik open it. Hacking the lock directly requires TECH ≥ 10 — the encryption is campus-grade. But the lock is installed in a steel frame that's bolted to concrete walls built before Helixion existed. The frame is strong. The wall might not be."
  - `bypass_options` — Examine: (TECH ≥ 6 or GHOST ≥ 7) "Three ways past the bulkhead without opening the door:
    1. The ventilation duct above the bulkhead — connects to the Helixion-side climate system. Narrow. Requires removing a grate (TECH ≥ 6, noise risk).
    2. A cable chase running beneath the floor — the fiber optic trunk that connects both sides' infrastructure. Barely passable. Requires removing floor panels (TECH ≥ 7, no noise).
    3. An older access tunnel, pre-bulkhead construction, that runs parallel to the main corridor ten meters to the south. Sealed with a brick wall that predates the steel bulkhead by decades. The brick is mortar and time. It breaks. (FORCE ≥ 5 or tools, noise risk, creates permanent passage)."
  - `reinforced_window` — Examine: "Look through. The Helixion side. Bright. Clean. The corridor is clinical white — floor, walls, ceiling. The Helixion logo on the wall. A camera pointing at the door from the other side. The contrast is absolute — you're standing in dust and darkness, looking into a world of sterile light. The bulkhead isn't just a barrier. It's a mirror. It shows you what the city looks like when someone is paying attention."

-----

### 7. SENSOR CORRIDOR
**The Helixion side. Every step is watched.**

```
> MAINTENANCE TUNNELS — SENSOR CORRIDOR

You're past the bulkhead. The world changed.

The corridor is bright — white LED strips running the
ceiling's full length. The floor is clean. The walls are
clean. The air is different — processed, temperature-
controlled, carrying the antiseptic nothing of the campus
above. Cable runs are enclosed in sealed conduit. Utility
panels are locked. Everything is neat and maintained and
watched.

Sensor modules at every junction. Small boxes mounted at
knee height, chest height, and ceiling level. Motion
detectors. Thermal sensors. The tunnel equivalent of the
campus's biometric monitoring — anything that moves
through here is tracked, logged, and evaluated. The
sensors don't trigger alarms. They trigger analysis. D9
reviews the data. If something doesn't match the expected
pattern, people come.

Moving through the sensor corridor is a puzzle. The
sensors have coverage patterns. The patterns have gaps.
The gaps are small and they move.
```

- **Exits:** west (The Bulkhead), south (Helixion Service Corridor), east (The Gap — hidden)
- **NPCs:** None (the sensor corridor is automated surveillance — nobody patrols here because the sensors replace people)
- **Enemies:**
  - `sensor_grid` — Environmental hazard. Not a combat enemy — a detection system. Three types of sensors in layered coverage:
    - **Motion detectors** (knee/chest level): Detect movement within 3m. GHOST ≥ 7 to move slowly enough to avoid triggering. Or TECH ≥ 8 to temporarily disable.
    - **Thermal sensors** (ceiling): Detect body heat. GHOST ≥ 8 with thermal dampener (available from Fex or Needle) to pass undetected. Or TECH ≥ 7 to cycle the sensor into calibration mode (30-second window).
    - **Pressure plates** (floor, random sections): Weight-triggered. REFLEX ≥ 6 to step between them (the plates are visible to careful observation). Or TECH ≥ 6 to map them with a scanner.
  - Detection consequence: Triggering any sensor starts a 5-minute countdown. If the player doesn't clear the corridor or hide in the Gap before the countdown expires, a D9 patrol arrives.
  - `d9_tunnel_patrol` — Level 12-13. 2 agents. Arrive only if sensors are triggered. Professional. Combat-trained. They work in pairs, cover angles, and communicate via subvocal mesh. Fighting them is possible but loud — noise carries on the Helixion side and reinforcements arrive in 10 minutes. Escaping is better. The Gap (room 8) is the escape route.
- **Objects:**
  - `sensor_modules` — Examine: "Small, angular, mounted at three heights. TECH ≥ 6: Helixion MPS-3 Multi-Spectrum Sensor Platform. Motion, thermal, and pressure in a single package. Military-grade detection system deployed in a maintenance corridor. The overkill says something — whatever Helixion is protecting down here, they're protecting it seriously. The sensors' maintenance schedule is automated. They self-calibrate every 18 hours. During calibration: a 30-second gap in thermal coverage."
  - `clean_corridor` — Examine: "Spotless. The floor has been cleaned recently — no dust, no debris, no footprints. The walls are freshly painted — Helixion white. The cable conduits are sealed and locked. Everything about this corridor says 'this space is observed, maintained, and controlled.' The neglected western tunnels are thirty meters behind you. The contrast is violent."
  - `the_gap_entrance` — Examine: (GHOST ≥ 6 to notice) "Between two sensor modules — a section of wall that doesn't match. The paint is the same Helixion white but the surface beneath is different. Not poured concrete. Brick. Old brick, from before the Helixion construction. The sensor coverage skips this section — a gap of approximately one meter where neither module's field reaches. The wall here is thinner. TECH ≥ 5: Behind the brick — a space. A cavity between the old construction and the new. Big enough for a person."

-----

### 8. THE GAP
**Between the two halves. Where someone was forgotten.**

```
> MAINTENANCE TUNNELS — THE GAP

A cavity between walls. Old construction on one side —
brick, mortar, the original tunnel structure from decades
before Helixion. New construction on the other — poured
concrete, the Helixion bulkhead extension that sealed the
campus infrastructure. Between them: a space roughly two
meters wide and ten meters long. The ceiling is a tangle
of old pipes and new conduit running parallel, neither
system acknowledging the other.

Someone lives here.

A sleeping pad. A water container. Food — Helixion
nutrient bars, the wrappers precisely folded and stacked.
A light — a single LED strip, battery-powered, casting the
space in cold blue. Books. Hand-tools. A journal, open to
a page covered in small, precise handwriting.

And a person, sitting against the old wall, watching you
with the expression of someone who has been alone for so
long that another face is both miracle and threat.
```

- **Exits:** west (Sensor Corridor — hidden entrance)
- **NPCs:**
  - **LUMEN** — The Ghost in the Gap (LORE / INFORMANT)
    - Location: The Gap. Always. Has been for years.
    - Faction: None (erased — no faction, no identity, no record)
    - Disposition: Starts Wary (-10). Speaking to another person is overwhelming. She hasn't had a conversation in fourteen months. She's forgotten how to modulate her voice — she whispers or speaks too loud, nothing in between.
    - Personality: Indeterminate age. Could be thirty, could be fifty. She was a Helixion infrastructure engineer. She built parts of the sensor corridor she now hides from. She discovered something during the campus construction — a subsection of the tunnel plans that didn't match the official blueprints. A room that existed in the pre-construction survey but was sealed and omitted from the final plans. She asked questions. The questions were noted. She was scheduled for a "security review." She didn't attend. She went into the tunnels she'd helped build, found the gap between old and new construction, and stayed.
    - Helixion declared her a security risk. D9 searched the tunnels. They didn't find her because they searched the corridors — the maintained spaces, the clean rooms, the proper infrastructure. They didn't check between the walls. Nobody checks between the walls. She exists in the space that neither half of the tunnel system claims. She is the gap.
    - Information: Lumen knows the Helixion-side tunnel layout intimately — she built it. She knows the sensor coverage patterns because she designed them. She knows the D9 patrol schedules because she's been watching them through cracks in the wall for years. She also knows what she found before she disappeared: the sealed room. The staging area. The thing Helixion built beneath the campus that isn't on any blueprint.
    - She won't tell you about the staging area immediately. Trust first. She needs to know you're not D9. She needs to know you're not going to reveal the Gap. She needs to know that someone knowing she's alive is safe.
    - At Friendly disposition: Lumen draws the staging area's location from memory. Every detail. She designed the corridor that leads to it. She knows where the access is. She's been listening to sounds through the wall — machinery, vehicles, something being transported. She doesn't know what Helixion is doing in there. She knows they don't want anyone to find out.
    - Quest: None. Lumen doesn't want things. She wants to not be found. But her information — the sensor grid patterns, the patrol schedules, the staging area location — is the most valuable intelligence on the Helixion side of the tunnels. She gives it because for the first time in years, someone is here, and the information is too heavy to carry alone.
    - Dialogue hook: "...you can see me? You— you're here. You're real. I'm— I haven't. In a long time. Talked. I haven't talked. — Please sit down. Please don't leave. Not yet."
- **Enemies:** None (the Gap is invisible — the sensor grid doesn't cover it, the D9 patrols don't know it exists)
- **Objects:**
  - `lumen_journal` — Examine: "Small, precise handwriting. Dated entries spanning three years. The early entries are engineering notes — observations about the sensor grid, D9 patrol timing, tunnel acoustics. The middle entries become personal — reflections on solitude, on identity, on what it means to exist without being known. The late entries are fragments: 'Day 1,127. Heard something through the east wall. Machinery. Not maintenance. Larger. Moving.' 'Day 1,142. The sound again. Continuous. 16 hours.' 'Day 1,203. I think they're building something down here.'"
  - `folded_wrappers` — Examine: "Helixion nutrient bar wrappers, precisely folded into squares and stacked. Hundreds of them. Each one represents a meal. Each meal was taken from the Helixion service corridor — Lumen knows the supply delivery schedule and takes what she needs during the 30-second sensor calibration window. She's been surviving on the infrastructure of the system that erased her."
  - `the_old_wall` — Examine: "Brick. Mortar. Hand-laid, decades ago. The original tunnel construction. This wall was here before Helixion. Before the campus. Before the mesh. The bricks are warm — the Substrate's heat, rising from deep below. Lumen sleeps against this wall. She says it breathes. She means the warmth cycles. But the word she chose was 'breathes.' Three years alone between two walls, and the old one feels more alive."
  - `sensor_grid_map` — Examine: (given by Lumen at Friendly) "Hand-drawn on the back of blueprint paper. The sensor corridor's complete coverage map — every sensor's field, every gap, every timing window. The patrol schedule plotted over a 72-hour cycle. The calibration windows marked in red. This map turns the sensor corridor from impossible to difficult. It's the product of three years of observation through cracks in the wall. It's perfect."

-----

### 9. HELIXION SERVICE CORRIDOR
**The campus's spine. Below the tower.**

```
> MAINTENANCE TUNNELS — HELIXION SERVICE CORRIDOR

The main service corridor beneath the Helixion campus.
Wider than the sensor corridor — wide enough for vehicles.
The floor is marked with guidance lines: yellow for
maintenance traffic, red for security, blue for logistics.
The ceiling is high enough for the automated carts that
move supplies between campus buildings without going
through the public spaces above.

The corridor runs the full length of the campus underground.
Access doors branch off to campus buildings — each one
biometric-locked, each one leading to a service elevator
that connects to the building above. From here, you could
reach any building on the campus without passing through a
single public space. The architect designed these corridors
for convenience. D9 redesigned them for concealment.

D9 agents walk this corridor. Not patrolling — moving.
Using the service infrastructure as a covert transit
system. An agent enters a service elevator beneath the
Compliance Wing and exits beneath the Research Wing
without anyone on the surface seeing them move. The
tunnels are D9's circulatory system. They flow through
the campus underground, invisible, omnipresent.
```

- **Exits:** north (Sensor Corridor), south (Staging Area)
- **NPCs:**
  - **HALE** — Helixion Maintenance Worker (INFORMANT / ALLY / QUEST)
    - Location: At a maintenance console along the service corridor. Working. Trying to look like he's only working.
    - Faction: Helixion (employee — unwilling, unbelieving, looking for a way out)
    - Disposition: Starts Unfriendly (-15). He's terrified. Talking to an unauthorized person in the service corridor is a termination offense. Termination at Helixion doesn't mean fired.
    - Personality: Forties. Tired. Maintenance worker — he keeps the campus infrastructure running. Electrical, plumbing, HVAC. He's been down here for twelve years. He knows every conduit, every junction box, every service panel. He also knows that the corridor's traffic patterns changed two years ago — more D9 movement, more restricted sections, supply deliveries to a part of the tunnels that isn't on his maintenance schedule.
    - He's not resistance. He's not brave. He's a man who noticed something wrong and can't stop noticing. The knowledge is eating him alive. He needs to tell someone, and he can't tell anyone on the campus because everyone on the campus is watched.
    - Information: Hale knows the service corridor layout, the access door codes (not biometric — utility codes that bypass for maintenance emergencies), and the D9 movement patterns. He also knows the staging area exists — he's been rerouted around it, told the section is "under renovation." Renovation doesn't explain the vehicle traffic or the 24-hour security.
    - Quests:
      - **"Maintenance Override"** (Tier 3): Hale can give the player utility override codes — not for doors, but for systems. Power. Ventilation. Lighting. From the service corridor, these overrides can disable infrastructure in specific campus buildings. Hale gives the codes on one condition: the player uses them to create a distraction that lets him access the staging area and see what's inside. He needs to know. The not-knowing is worse than the danger. Reward: Campus utility override codes (enable system manipulation in z01) + access to the Staging Area + Hale's permanent assistance (he becomes a mole inside Helixion infrastructure).
    - Dialogue hook: "Don't— don't talk to me. Keep walking. — Wait. Come back. But don't look at me. Look at the console. Pretend you're reading the maintenance log. — Something's wrong down here. I need to tell someone. I think that someone might be you."
- **Enemies:**
  - `d9_tunnel_patrol` — Level 12-13. 2 agents. Active patrols through the service corridor on a schedule. GHOST ≥ 8 or Lumen's schedule map to avoid. They move purposefully — if you're in their path, they engage. If you're in a side room or access niche, they pass.
  - `automated_service_cart` — Not an enemy. Automated supply vehicles on guidance tracks. They don't detect intruders — but they do have cameras. Blocking a cart triggers a maintenance alert. The carts can be used as cover — walk behind one, matching its speed, hidden from camera angles.
- **Objects:**
  - `guidance_lines` — Examine: "Yellow, red, blue. Maintenance, security, logistics. The lines organize traffic that happens beneath the campus without the campus knowing. The yellow line leads to maintenance access points. The red line leads to security positions. The blue line leads to supply depots. And then there's a fourth line — gray, barely visible against the floor. GHOST ≥ 6: The gray line leads south. Toward the section Hale was rerouted around. The line doesn't appear on any maintenance schematic."
  - `service_elevators` — Examine: "Access doors every thirty meters. Each one labeled with the building it serves: 'COMPLIANCE WING — SL ACCESS,' 'RESEARCH WING — SL ACCESS,' 'STAFF QUARTERS — SL ACCESS.' Biometric locks with utility override keypads. TECH ≥ 7 or Hale's codes: the utility overrides bypass biometrics during maintenance windows. Each elevator rises directly into the campus building above. The tunnels are a subway system for people who don't want to be seen."
  - `d9_traffic` — Examine: "Watch the corridor for ten minutes. Two agents pass — walking, not patrolling. Briefcases. No uniforms. They enter from a service elevator marked 'D9 FLOOR' and exit through one marked 'COMPLIANCE WING.' They're commuting. The service corridor is D9's highway — they move between operations without surfacing. GHOST ≥ 7: The agent in front has a communication device clipped to his belt, active, displaying a patrol roster. Photograph it and Lumen's schedule map becomes complete."

-----

### 10. STAGING AREA
**What Helixion is doing beneath the campus that nobody knows about.**

```
> MAINTENANCE TUNNELS — STAGING AREA

Past the gray line on the floor. Past the door that isn't
on any maintenance schematic. Into a section of the tunnels
that has been converted into something else entirely.

The corridor widens into a loading bay. Concrete. High
ceiling. Vehicle access — a ramp leading up to the surface,
gated, large enough for trucks. The bay is active:
palletized cargo, some wrapped in opaque plastic, some in
matte gray containers marked with Helixion codes. An
automated forklift moves between the pallets, sorting.
The logistics are professional. The security is intense —
two cameras, a sensor package, and a locked access door
deeper into the facility.

The cargo containers are the same specification as the
HX-7C containers at the Industrial District docks. Same
matte gray. Same satellite tracking. But these aren't
coming from the docks. These are coming from below. From
the deep access shaft adjacent to the staging area. The
supply chain runs the wrong direction. The containers
aren't arriving from outside the city. They're arriving
from beneath it.

Whatever Helixion is building in the Broadcast Tower, the
components don't all come from the factories. Some come
from underground. From the Substrate Level. From something
that was already there.
```

- **Exits:** north (Helixion Service Corridor), east (Deep Access Shaft)
- **NPCs:** None (the staging area is automated and secured — personnel access is restricted to scheduled deliveries)
- **Enemies:**
  - `staging_security` — Level 13-14. 2 guards on rotation. Armed. Alert. They guard the deep access shaft entrance and the cargo bay. They can be avoided (GHOST ≥ 9), distracted (Hale's maintenance override — trigger a false alarm in the service corridor), or fought (they call D9 backup in 5 minutes).
  - `security_cameras` × 2 — Surveillance. TECH ≥ 8 to loop. Coverage gaps during automated forklift cycles (the machine blocks camera 2's field for 15 seconds every 3 minutes).
- **Objects:**
  - `hx7c_containers` — Examine: "Matte gray. Satellite-tracked. The same container specification used at the Cargo Docks in the Industrial District (z03 r02). But the tracking data on these containers is different — TECH ≥ 8: The origin codes indicate subterranean retrieval. Not manufactured. Retrieved. These containers hold material brought up from the deep infrastructure. From the Substrate Level. The containers at the docks hold factory-manufactured Broadcast Tower components going up. These containers hold Substrate-sourced material going up. The Tower is being built from two directions."
  - `cargo_manifest` — Examine: (TECH ≥ 9 to access the logistics terminal) "Digital manifest. Contents listed as 'SUBSTRATE MATERIAL — CLASS 7 — PROJECT REMEMBERER.' The manifest shows delivery frequency: weekly. Volume: increasing. Destination: Broadcast Tower construction site, upper array section. TECH ≥ 10: Cross-referencing with Brenn's production manifest from the Assembly Line (z03 r13): the factory-built resonance amplifiers are designed to interface with Substrate material. The Tower's antenna array is a hybrid — manufactured technology wrapped around organic Substrate architecture. The Tower doesn't just capture 33hz. It's grown from it."
  - `the_ramp` — Examine: "Vehicle access to the surface. Gated, large enough for trucks. The ramp leads up to a service entrance on the campus perimeter — disguised as a utility access point. GHOST ≥ 6: Truck tracks on the ramp. Heavy loads, frequently. The ramp is used at night. 0200-0400, when campus surface activity is minimal. The staging area is a secret that operates in plain sight during the hours nobody watches."
  - `deep_shaft_entrance` — Examine: "Adjacent to the staging area. A heavy door opens onto a vertical shaft — service elevator, industrial grade, descending into darkness. The shaft goes deep. Deeper than the maintenance tunnels. Deeper than the drainage system. The elevator controls show three levels below this one. The lowest level is labeled 'SL-3.' TECH ≥ 7: SL-3 corresponds to the Substrate Level's depth estimate. This shaft connects directly from the campus infrastructure to the deepest point in the city. Helixion has a private elevator to the Substrate."

-----

### 11. DEEP ACCESS SHAFT
**The way down. Where the shallow undercity ends and the deep begins.**

```
> MAINTENANCE TUNNELS — DEEP ACCESS SHAFT

The service elevator. Industrial grade. The car is large —
designed for cargo, not people. The walls are reinforced
steel. The controls are simple: three levels below, one
level above. The shaft descends through rock — not
concrete, not construction. Rock. The tunnel infrastructure
ends and the earth begins.

The elevator descends. The temperature drops, then rises.
The walls of the shaft change — from cut stone to something
less regular, less geometric. The rock is warm. The air
is humid. And the 33hz frequency, present as a faint hum
in the maintenance tunnels above, becomes a physical
presence. You feel it in the elevator car. You feel it in
your teeth.

The first level below is Abandoned Transit — the deep
infrastructure, the broken metro system.

The second level is deeper. Unfinished. The elevator doors
open onto raw tunnel — construction that was started and
abandoned.

The third level — SL-3 — is locked. Helixion credentials
required. The elevator panel shows it as active. Whatever
is at the bottom, the elevator visits it regularly.
```

- **Exits:** west (Staging Area), down to Abandoned Transit (zone 11 — first stop), down to Substrate Level (zone 14 — SL-3, Helixion credentials required / quest-gated)
- **NPCs:**
  - **REED** — Iron Bloom Operative (QUESTGIVER / FACTION / INFORMANT)
    - Location: In the elevator shaft's maintenance alcove — a small space at the first sub-level, between floors, accessible from the shaft's service ladder. Not the elevator car. The ladder.
    - Faction: Iron Bloom (deep operative — stationed here to monitor Helixion's vertical logistics)
    - Disposition: Starts Wary (-5). Iron Bloom operatives in the field are cautious by training. A referral from Sable (z04 r13) or any Iron Bloom NPC shifts to Neutral. Proof of anti-Helixion action shifts to Friendly.
    - Personality: Thirties. Controlled. She speaks quietly because sound carries in the shaft. She's been running intelligence operations from this alcove for four months — monitoring the elevator traffic, cataloging what goes up and what comes down, timing the guard rotations. She's the reason Iron Bloom knows about the staging area.
    - She's tired. Four months in a maintenance alcove in an elevator shaft. The isolation is different from Lumen's — Reed chose this. She volunteered. But the 33hz frequency in the shaft is getting into her sleep. She dreams about the Substrate. She dreams in frequencies.
    - Information: Reed knows the elevator schedule, the cargo types, the guard rotations. She knows that Substrate material goes up and Helixion technology goes down — a two-way exchange between the surface and the deepest level. She suspects Helixion isn't just mining the Substrate. They're trading with it. She can't prove this. The idea frightens her.
    - Services:
      - **Iron Bloom intelligence**: Reed shares what she knows about the deep infrastructure — elevator timing, guard rotations, cargo manifests she's photographed. This intelligence feeds into Iron Bloom quest chains in zone 12.
      - **Deep transit access**: Reed knows the service ladder connects to the Abandoned Transit level. She can guide the player to the transit entrance, bypassing the elevator's Helixion lock.
    - Quests:
      - **"The Exchange"** (Tier 3): Reed has observed something she can't explain. Every third delivery, the elevator goes down with Helixion cargo and comes back with more Substrate material than went down in Helixion components. The exchange rate is unequal. More comes up than goes down. Either Helixion is extracting Substrate material independently of the exchange, or the Substrate is giving more than it receives. Reed needs the player to ride the elevator to SL-3 and document what happens at the bottom. This quest connects directly to the Substrate Level (zone 14). Reward: Iron Bloom deep access clearance + evidence that reshapes the understanding of Helixion's relationship with the Substrate.
    - Dialogue hook: "Don't use the elevator. — I heard you coming. Shaft acoustics. You hear everything. — I'm Reed. Iron Bloom. I've been here for four months listening to what goes up and what comes down. The numbers don't add up. Something's wrong at the bottom."
- **Enemies:** None (the shaft's maintenance alcove is hidden between floors — the elevator passes it without stopping)
- **Objects:**
  - `elevator_shaft` — Examine: "Vertical. Deep. The shaft walls transition from poured concrete (campus level) to cut stone (first sub-level) to something that might be natural rock formation (deeper). The transition tells a geological story: the campus was built on bedrock. The bedrock sits on older stone. The older stone sits on something that isn't exactly stone. The further down you go, the warmer the walls get, and the stronger the 33hz becomes."
  - `reed_alcove` — Examine: "A maintenance space between elevator stops — designed for technicians servicing the shaft mechanisms. Reed has made it livable: sleeping bag, water, nutrient bars, a tablet with Iron Bloom encryption running a monitoring program. Photographs pinned to the wall: cargo manifests, guard faces, time-stamped shots of the elevator car at different levels. Four months of intelligence, collected one frame at a time."
  - `cargo_logs` — Examine: (Reed's intelligence) "Photographed manifests showing the two-way traffic. Going down: Helixion technology — sensor arrays, frequency modulators, neural interface hardware. Coming up: Substrate material — classified as 'organic crystalline substrate' in Helixion's coding. The volume going up is 1.4× the volume going down. The discrepancy is consistent across every logged exchange. Reed has highlighted this ratio in red. She's circled it. She's underlined it. The Substrate is giving more than it receives."
  - `shaft_frequency` — Examine: "The 33hz is strong here. The shaft acts as a resonant column — the frequency from below is amplified by the vertical structure, like sound in an organ pipe. The vibration is physical. The elevator car rattles slightly when stationary. Reed says the frequency changes at night — intensifies. She says it pulses. She says it sounds like breathing. She says she's probably imagining that. She says she's not sleeping well. She says the dreams are getting specific."

-----

## ZONE EXITS SUMMARY

| From | Direction | To | Zone | Requirement |
|------|-----------|-----|------|------------|
| West Junction | west | Drainage Nexus — East Passage | 8 | None |
| West Junction | down | Industrial Drainage (utility shaft) | 10 | Cramped, one-way |
| Ventilation Hub | up | Residential Blocks — Squatter Floors | 2 | None |
| Staging Area / Deep Shaft | up | Helixion Campus — Service Sublevel | 1 | Helixion credentials |
| Deep Access Shaft | down (L1) | Abandoned Transit | 11 | Reed's guidance or service ladder |
| Deep Access Shaft | down (L3) | Substrate Level | 14 | Helixion credentials / quest-gated |

-----

## QUEST SUMMARY

| Quest | Giver | Tier | Type | Summary |
|-------|-------|------|------|---------|
| The Renovation | Moth | 2 | SABOTAGE | Disable new Helixion cable runs threatening Moth's living space. TECH ≥ 6. |
| The Shipment | Fex | 2 | RETRIEVAL | Recover intercepted medical supplies from D9 seizure cache on Helixion side. |
| Supply Line | Fex | 2 | CLEARANCE | Clear collapsed passage in deep access shaft to open smuggling route to Iron Bloom. |
| Maintenance Override | Hale | 3 | INFILTRATION | Use utility codes to create distraction. Access staging area. Reveal Helixion's underground operation. |
| The Exchange | Reed | 3 | INVESTIGATION | Ride elevator to SL-3. Document the Substrate exchange. Discover the ratio discrepancy. |

-----

## ENEMY SUMMARY

| Enemy | Level | Location | Behavior | Drops |
|-------|-------|----------|----------|-------|
| Tunnel Vermin (rats) | 4 | West Junction | Scatter from light, nest defense | Nothing useful |
| Tunnel Vermin (swarm) | 5 | Ventilation Hub | Swarm when disturbed, persistent | Nothing useful |
| Sensor Grid | N/A | Sensor Corridor | Environmental — detection triggers D9 | N/A |
| D9 Tunnel Patrol | 12-13 | Sensor Corridor, Service Corridor | Professional pairs, cover angles, call reinforcement | D9 tactical gear, encrypted intel |
| Staging Security | 13-14 | Staging Area | Armed guards, 5-min backup timer | Security keycards, Helixion intel |

-----

## DESIGN NOTES

**The maintenance tunnels are the game's hinge zone.** They connect the Residential surface to the Helixion underground, the Drainage Nexus to the deep infrastructure, and the known to the unknown. Every major discovery down here connects to something in another zone: the Forgotten Server Room connects to Residential lore, the Staging Area connects to the Industrial District's Assembly Line, the Deep Access Shaft connects to the Substrate Level. The tunnels don't have their own isolated story. They reveal the connections between everyone else's stories.

**The two-half structure is the zone's thesis.** Neglected west / controlled east. The bulkhead is physical but the divide is philosophical — the same city, the same infrastructure, two completely different relationships to it. The residential side works because nobody watches. The Helixion side works because everyone watches. The player experiences both and draws their own conclusions about which approach is healthier. (Neither is.)

**Lumen is the zone's emotional center.** A woman who exists between two walls, forgotten by both sides, surviving on nutrient bars stolen during 30-second sensor calibration windows. She built the corridor she hides from. She designed the sensors that hunt for her. She lives in the gap between what she created and what it became. Her journal entries — engineering notes becoming personal reflection becoming fragments — track the psychological cost of three years of absolute solitude. She's not broken like Echo. She's not chosen like Kai. She's trapped.

**The Forgotten Server Room is a lore bomb.** Pre-Helixion data. Resident records showing people who disappeared during MNEMOS recruitment phases. Communication archives ending mid-sentence. And the servers themselves, their oscillators drifted to 33hz — not randomly, but pulled. Attracted. The Substrate's frequency tunes other oscillations toward itself. This mechanical detail has enormous implications: the 33hz isn't just a broadcast. It's a gravitational frequency. Everything in its range converges toward it.

**The Staging Area is the zone's major revelation.** Substrate material comes UP. Helixion technology goes DOWN. The exchange rate favors the surface — more comes up than goes down. The Broadcast Tower is being built from manufactured components AND organic Substrate architecture. This means the Tower isn't just a weapon pointed at the population. It's a hybrid — part machine, part organism. The implications connect to the Assembly Line workers (their bodies calibrate the manufactured components) and the Substrate Level (the organism provides the organic components). The Tower is built from exploitation in both directions.

**Reed's question — "Is Helixion trading with the Substrate?" — is the zone's deepest provocation.** If the exchange rate is unequal and the Substrate is providing more than it receives, either Helixion is extracting by force, or the Substrate is cooperating. If cooperating, why? What does the Substrate want from the arrangement? This question doesn't get answered in the maintenance tunnels. It gets answered in zone 14.

**The sensor corridor is the game's stealth test.** Three overlapping detection systems (motion, thermal, pressure), each with different bypass requirements. The puzzle rewards preparation — Lumen's grid map, Fex's thermal dampener, TECH for hacking, GHOST for movement. Players who invest in stealth skills find the corridor challenging but navigable. Players who didn't invest find it nearly impossible without help. The zone teaches that the Helixion side of the world requires different tools than the combat-heavy surface zones.

> 11 rooms. 5 named NPCs. 5 enemy types. 6 zone exits (the most connected zone in the game).
> The city's plumbing. The seam between neglected and controlled. The gap where someone was forgotten.
