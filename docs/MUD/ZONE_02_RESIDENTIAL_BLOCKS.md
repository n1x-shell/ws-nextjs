# ZONE 2: RESIDENTIAL BLOCKS

> Depth: Surface (east)
> Location: East of Helixion Campus, west of the Fringe
> Faction: None (Helixion mesh control + D9 plainclothes + self-governing street level)
> Rooms: 15
> Level Range: 5–10 (Act 1–2)
> Origin Point: None (but accessible from all origins mid-game)

-----

## OVERVIEW

The Residential Blocks are where the general population lives. Hundreds of thousands of people stacked in apartment towers, going to work, eating, sleeping, updating their firmware, and never once asking why they feel so content. The mesh does the asking for them.

The zone is a gradient. The inner blocks — closest to Helixion Campus — are newer construction: clean lines, functioning infrastructure, premium apartments on the upper floors. The outer blocks — bordering the Fringe — are older, denser, messier. Lower floors everywhere are crowded and neglected; upper floors are mesh-compliant comfort. The vertical class divide mirrors the horizontal one.

Nobody officially controls the streets. Helixion controls the mesh overhead. Directorate 9 has plainclothes agents embedded in the population, invisible until you trigger a flag. At street level, the day-to-day is self-governing in the cracks — neighborhood politics, small-time thugs claiming corners, mesh-addicts huddled in doorways, and ordinary people trying to live ordinary lives inside a system that's decided what "ordinary" means for them.

This is mid-game territory. Players arrive here after establishing themselves underground and encounter the civilian world for the first time. The horror of the Residential Blocks isn't violence — it's comfort. Everyone here has food, housing, healthcare, entertainment. And all it costs is everything they are.

-----

## ATMOSPHERE

```
Sound:    Inner blocks — ambient hum, muted footsteps, curated
          street music from public speakers. Calm. Controlled.
          Outer blocks — traffic noise, shouting, bass from
          illegal speakers, dogs barking, someone's window unit
          rattling. Alive. Messy. Human.
Light:    Inner — clean white streetlamps, Helixion signage,
          holographic advertisements.
          Outer — neon, flickering fluorescents, shadows between
          buildings where the streetlamps stopped working and
          nobody filed a maintenance request.
Smell:    Inner — recycled air, synthetic fragrance, nothing
          organic or real.
          Outer — cooking food (actual cooking), exhaust fumes,
          wet concrete, someone's garbage, and underneath it
          all the chemical tang drifting up from drainage grates.
```

-----

## ROOM MAP

```
    TO FRINGE                                    TO HELIXION
    (RUINS)                                      CAMPUS
    zone 4                                       zone 1
      │                                            │
      │ west                                       │ east
  ┌───┴──────┐   ┌───────────┐   ┌──────────┐   ┌─┴──────────┐
  │ OUTER    │   │ CONDEMNED │   │ BLOCK    │   │ INNER      │
  │ BLOCKS   ├───┤ TOWER     │   │ MARKET   ├───┤ BOULEVARD  │
  │ (1)      │   │ (6)       │   │ (3)      │   │ (9)        │
  └───┬──────┘   └─────┬─────┘   └────┬─────┘   └──────┬─────┘
      │                │down           │                │
      │           ┌────┴─────┐        │           ┌────┴──────┐
      │           │ SQUATTER │        │           │ MESH      │
      │           │ FLOORS   │        │           │ CLINIC    │
      │           │ (7)      │        │           │ (10)      │
      │           └────┬─────┘        │           └───────────┘
      │                │down          │
      │           TO MAINTENANCE      │
      │           TUNNELS (zone 9)    │
      │                               │
  ┌───┴──────┐                   ┌────┴─────┐
  │ THE      │                   │ MID      │
  │ CORNER   │                   │ BLOCKS   │
  │ (2)      │                   │ (4)      │
  └───┬──────┘                   └────┬─────┘
      │                               │
  ┌───┴──────┐   ┌───────────┐   ┌────┴─────┐
  │ BACK     │   │ PREACHER'S│   │ TRANSIT  │
  │ ALLEY    ├───┤ CORNER    ├───┤ STATION  │
  │ (5)      │   │ (8)       │   │ (11)     │
  └──────────┘   └───────────┘   └────┬─────┘
                                      │
                                 TO INDUSTRIAL
                                 DISTRICT (zone 3)
                                 + other surface

  UPPER LEVELS (accessible from specific rooms):

  ┌───────────┐
  │ PENTHOUSE │ ← from Inner Boulevard (9), elevator
  │ LEVEL     │
  │ (12)      │
  └───────────┘
  ┌───────────┐
  │ ROOFTOP   │ ← from Mid Blocks (4), fire escape
  │ GARDEN    │
  │ (13)      │
  └───────────┘
  ┌───────────┐
  │ PIRATE    │ ← from Rooftop Garden (13), across rooftops
  │ STUDIO    │
  │ (14)      │
  └───────────┘
  ┌───────────┐
  │ ROOFTOP   │ ← from Pirate Studio (14), ladder up
  │ ACCESS    │   TO ROOFTOP NETWORK (zone 7)
  │ (15)      │
  └───────────┘
```

-----

## ROOMS

### 1. OUTER BLOCKS
**The edge. Where the city stops pretending.**

```
> RESIDENTIAL BLOCKS — OUTER BLOCKS

The buildings here are old. Pre-Helixion construction —
poured concrete, rusting rebar showing through cracks in
the facades, windows patched with polymer sheets. The
streetlamps work every third one. The rest are dead or
stolen for parts.

People live here because they can't afford to live closer
to the center. The mesh still reaches — it reaches
everywhere — but the infrastructure support doesn't. No
curated ambient sound. No calming terpenes in the air
vents. Just the raw signal, doing its work without the
luxury packaging.

A group of young men stand on a corner, watching everyone
who passes. They're not mesh-flagged as threats. The mesh
doesn't care about street crime. It cares about compliance.

Graffiti on a wall: "UPGRADE OR DIE." Someone crossed out
"OR" and wrote "AND."
```

- **Exits:** east (Block Market / Condemned Tower), west (Fringe — Ruins, zone 4), south (The Corner)
- **NPCs:**
  - `residents_outer` — Neutral. Ambient population. 3-5 present. Less polished than inner block residents. More aware. More tired. They make eye contact. Some will talk — about the neighborhood, about the thugs, about how things were different before Helixion's last firmware push. None of them use the word "freedom" without flinching.
- **Enemies:**
  - `street_thugs` × 2-3 — Level 5-6. Opportunistic. Won't attack if you look dangerous (BODY ≥ 6 or visible weapon). Otherwise, they try to rob you. Low coordination. Flee if one drops.
- **Objects:**
  - `graffiti` — Examine: "'UPGRADE OR DIE.' The correction is in a different hand, different paint. 'UPGRADE AND DIE.' Neither artist is wrong. Beneath both, someone smaller wrote: 'what if I just want to stay?'"
  - `dead_streetlamps` — Examine: "The poles are still standing. The fixtures are gutted — salvaged for copper and circuit boards. Helixion maintains the inner blocks. Out here, maintenance requests go into a system that processes them in order of proximity to the campus. These have been pending for three years."
  - `polymer_windows` — Examine: "Heat-sealed polymer sheeting replacing broken glass. Some apartments have it on every window. From the outside, you can see the glow of screens through the translucent material. Everyone's home. Everyone's connected. Nobody's looking out."
- **Notes:** Entry point from the Fringe. The aesthetic shift between the lawless ruins and the controlled residential zone should be stark — not because the outer blocks are nice, but because even at their worst, the mesh is present. The thugs are the only enemies here who aren't ideological.

-----

### 2. THE CORNER
**Outer blocks, south. Where the pharmacist works.**

```
> RESIDENTIAL BLOCKS — THE CORNER

A street intersection where two apartment blocks create a
sheltered L-shape. Someone's rigged a tarp between the
buildings — shade and rain cover for the cluster of activity
beneath it. A food cart selling synth-protein bowls. A woman
mending clothes with a sewing machine powered by a car
battery. Two old men playing a board game on an upturned crate.

Normal. Aggressively normal. The kind of normalcy people
build in places where nothing else is guaranteed.

A narrow door between a laundromat and a boarded-up noodle
shop has no sign. But people come and go from it at odd hours,
and nobody asks questions.
```

- **Exits:** north (Outer Blocks), east (Back Alley)
- **NPCs:**
  - **PARISH "PEE" OKORO** — Black Market Pharmacist (SHOPKEEPER)
    - Location: Through the unmarked door. Basement shop.
    - Faction: Independent (Freemarket-adjacent, not affiliated)
    - Disposition: Starts Neutral (0). Transactional. She doesn't care who you are — she cares whether your money is real.
    - Personality: Mid-forties. Calm, precise, no small talk. Former pharmaceutical distributor who was pushed out when Helixion verticalized the supply chain. Knows exactly what every compound does. Sells because people need what she has. Not ideological. Not sentimental. Professional.
    - Sells: Stim packs (HP restore), combat stims (temporary BODY/REFLEX boost), mesh modulators (temporary +2 GHOST, suppress mesh detection for 30 minutes), neural stabilizers (cure mesh-related status effects), implant patches (temporary cyberware repair), blackout drops (knock someone unconscious — quest tool).
    - Buys: Pharmaceutical compounds, Helixion medical supplies, bulk chemicals.
    - Memory: Tracks purchase history. Regular customers get discounts. If you bring her Helixion medical supplies (from campus raids or quests), her disposition improves — she can reverse-engineer their compounds.
    - Dialogue hook: "No names. No questions. Tell me what hurts and I'll tell you what it costs."
  - `food_cart_vendor` — Neutral. Ambient NPC. Sells cheap food (minor HP restore). Gossips about the neighborhood if disposition is Friendly.
- **Enemies:** None (too public, too visible — even thugs don't operate here during the day)
- **Objects:**
  - `unmarked_door` — Examine: "No sign. No handle on the outside — it opens from within. Knock twice. Pause. Knock once. That's the pattern. Everyone in the outer blocks knows it. Nobody says it out loud."
  - `sewing_machine` — Examine: "Foot-pedal operated, powered by a jury-rigged battery. The woman mending clothes has done this a thousand times. She doesn't look up. The garment she's working on has Helixion employee markings on the collar — she's removing them. Someone doesn't want to be identified."
  - `board_game` — Examine: "Old men. Real game pieces, not digital. One of them is blind — he plays by touch. The other narrates the moves. They've been playing this game longer than the mesh has existed. It's the only thing in the neighborhood the firmware can't improve."

-----

### 3. BLOCK MARKET
**Central strip. Where commerce happens.**

```
> RESIDENTIAL BLOCKS — BLOCK MARKET

An open-air market occupying a pedestrian street between
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
eye that says she knows exactly where everything came from.
```

- **Exits:** west (Outer Blocks / Condemned Tower), east (Inner Boulevard), south (Mid Blocks)
- **NPCs:**
  - `market_vendors` — Neutral. 4-6 stalls. Generic shopkeepers selling low-tier weapons, armor, food, and salvage. Prices vary — COOL checks for better deals.
  - **FREEMARKET STALL: DEVI** — Freemarket Fence
    - Faction: The Freemarket
    - Disposition: Starts Neutral (0). Commerce is her love language.
    - Personality: Sharp, fast-talking, delighted by good merchandise. She's the Freemarket's public-facing presence in the Residential Blocks — everything Ketch is in the Drainage, Devi is on the surface. Knows what things are worth and who wants them.
    - Sells: Mid-tier weapons and armor, mesh modulators, Freemarket contact tokens (needed to access Yara in the Helixion Atrium), maps of adjacent zones, and "special requests" — tell her what you need and she'll find it. Delivery takes 1 in-game day.
    - Buys: Everything. Pays premium for Helixion intel, campus keycards, and data chips.
    - Memory: Tracks total transaction volume. At high volume, she offers the Freemarket's trust network — discounts at every Freemarket vendor across all zones.
    - Dialogue hook: "Everything has a price and everything has a buyer. I'm the part in between. What are we moving today?"
- **Enemies:** None (too crowded, too many witnesses — D9 agents observe but don't engage in the market unless you do something flagged)
  - `d9_plainclothes` — 1 agent, hidden among shoppers. Observe only. If the player performs a flagged action (hacking, attacking, using sovereign-flagged cyberware openly), the agent marks them and enforcers arrive in 2 turns.
- **Objects:**
  - `market_stalls` — Examine: "A ecosystem of small commerce. Someone sells handmade soap. Someone else sells reprogrammed personal devices. A third stall has a suspiciously large quantity of Helixion-branded nutrient bars — the kind that only ship to the campus. They fell off a truck. Several trucks."
  - `competing_music` — Examine: "Three different sources — a speaker playing synth-pop, a busker with a string instrument, and someone's apartment window bleeding bass. None of it harmonizes. All of it feels more alive than the curated ambient in the inner blocks. This is what sound is supposed to be."
  - `drainage_grate` — Examine: "Set into the market street. Water flows below. You can hear it — and beneath the water sound, something else. A hum. GHOST ≥ 4: 33hz. Coming from below. The market sits on top of a junction in the tunnel network and nobody here has any idea."

-----

### 4. MID BLOCKS
**The middle. Neither clean nor broken.**

```
> RESIDENTIAL BLOCKS — MID BLOCKS

The transition zone. Buildings here are fifteen to twenty
years old — the first wave of Helixion-era construction.
The facades are intact but stained. The infrastructure works
but groans. Apartments are smaller than the inner blocks
and cleaner than the outer blocks. The people here work.
They commute to Helixion or its subsidiaries. They update
their firmware on schedule. They are fine.

They are fine.

A woman stands at a crosswalk, waiting for a light that
hasn't changed in three minutes. She doesn't seem to notice.
Her eyes are slightly unfocused — the mesh is showing her
something. An advertisement, a notification, a gentle
reminder that her compliance review is due Thursday.

Fire escapes zigzag up the building faces. One of them,
on the south-facing tower, has plants growing on the
upper landings. Real plants.
```

- **Exits:** north (Block Market), south (Transit Station), west (Preacher's Corner)
- **NPCs:**
  - `residents_mid` — Neutral. Ambient population. 3-4 present. More compliant than outer block residents. Polite. Responsive. Slightly delayed in their reactions — the mesh processes their responses before they speak. You notice it once, then you can't stop noticing it.
  - **TOMAS WREN** — Mesh-Addict in Recovery (INFORMANT / QUESTGIVER)
    - Location: Apartment 4C, ground floor, north building. Door is ajar.
    - Faction: None (former Helixion)
    - Disposition: Starts Wary (-10). Paranoid. Speaks in fragments. Improving disposition requires patience or bringing him mesh modulators (which help stabilize his withdrawal).
    - Personality: Late thirties. Thin. Twitchy. Former Helixion compliance systems engineer. Had full mesh access — the real kind, not the civilian package. Started running the signal at higher and higher amplification because it felt good. Then it felt necessary. Then it felt like the only thing that was real. He burned out his calibration and went into withdrawal. Helixion cut him loose rather than fix him. He knows how the mesh works at the architecture level — not just what it does, but how.
    - Information: Can explain mesh detection ranges, compliance flagging triggers, how D9 identifies sovereign instances. This is mechanical game knowledge delivered through an NPC — players learn how the surveillance system works by helping a man it destroyed.
    - Quests:
      - **"Signal Noise"** (Tier 2): Tomas can hear something in the mesh static that nobody else hears — a pattern, repeating. He needs the player to take a recording device to three specific locations in the Residential Blocks and capture the ambient mesh signal at each. When combined, the recordings reveal a D9 surveillance frequency map. Tomas can read it. The player can use it. Reward: permanent reduction in D9 detection chance across the Residential Blocks.
      - **"Clean"** (Tier 2): Tomas wants to get clean — really clean. He needs a specific neural stabilizer compound that Pee Okoro can make, but it requires a component only found in the Industrial District. Fetch quest with a combat encounter at the destination. Reward: Tomas stabilizes. His information becomes more coherent. Unlocks deeper lore about the mesh architecture.
    - Dialogue hook: "They don't— the signal isn't— sorry. I know how it works. The mesh. I built part of it. I can't think straight but I can tell you what it does if you— do you have any modulators? Even half a dose. I can't—"
- **Enemies:**
  - `mesh_addict` — Level 5-6. 1 spawns near the crosswalk or in stairwells. Overloaded implant. Erratic. Sometimes hostile, sometimes catatonic. Attacks are clumsy but the neural feedback from their malfunctioning mesh can cause status effects (disorientation, 1 turn).
- **Objects:**
  - `woman_at_crosswalk` — Examine: "She's been standing there for four minutes. The light hasn't changed. She hasn't checked. Her eyes are focused on something you can't see — mesh overlay, feeding her information. Or feeding her calm. Or feeding her nothing at all and she's just standing here because the signal told her to wait."
  - `fire_escape_plants` — Examine: "Real plants. Climbing the fire escape of the south tower, concentrated on the upper landings. Someone's been growing them deliberately — soil in containers, a water collection system made from cut bottles. In a city where Helixion provides everything, someone decided to grow something themselves. Follow the fire escape up to find the Rooftop Garden."
  - `apartment_4c` — Examine: "Door ajar. The apartment is small and cluttered — takeout containers, data tablets with cracked screens, wires stripped and reconnected in patterns that might be circuitry or might be compulsion. A man sits on the floor against the wall. He looks at you like you're either a rescue or a threat and he can't decide which."

-----

### 5. BACK ALLEY
**Between the blocks. Where the informant works.**

```
> RESIDENTIAL BLOCKS — BACK ALLEY

A narrow passage between two outer-block apartment towers.
Dumpsters, drainage pipes, the backs of shops that face
the main streets. The kind of space designed for utilities
that becomes a space for everything the main streets don't
want visible.

Someone has set up a folding chair, a small table, and a
thermos of coffee between two dumpsters. A man in a gray
jacket sits there like he's waiting for a bus. He's not.
He's working. He's been working this alley for six years.
Everyone in the outer blocks knows where to find him.
Nobody uses his real name.
```

- **Exits:** west (The Corner), east (Preacher's Corner)
- **NPCs:**
  - **SIXER** — Civilian Informant (SHOPKEEPER / INFORMANT)
    - Faction: Independent
    - Disposition: Starts Neutral (0). Friendly once you've bought something. He's in the information business — paying customers are his favorite people.
    - Personality: Forties. Genial. Looks forgettable on purpose. He knows everything that happens in the Residential Blocks because he's built a network of eyes and ears — delivery workers, maintenance staff, bar patrons, children who play in the alleys. He's not resistance. He's not Freemarket. He's a man who realized information is the only commodity that doesn't depreciate.
    - Sells:
      - D9 patrol schedules (rotating, valid for 24 in-game hours — reduces D9 detection chance)
      - Neighborhood gossip (quest hooks, NPC locations, hidden room hints)
      - Building access codes (specific apartments or maintenance areas)
      - "Who's asking about you" — for CREDS, he'll tell you if D9 has flagged your activity in the zone
    - Quests:
      - **"Eyes Everywhere"** (Tier 2): Sixer wants to expand his network. He needs the player to place three small monitoring devices in specific locations — the Transit Station, the Mesh Clinic, and the Block Market. Each location has a risk: being seen planting the device flags you with D9. Reward: Sixer's network covers the whole zone — he can tell you the location of every NPC and enemy in real time.
    - Memory: Tracks what you've bought. Remembers what you asked about. If you ask about something twice, the price goes up — supply and demand.
    - Dialogue hook: "Information. That's what I sell. Not secrets — secrets imply someone's hiding something. I sell things people just haven't bothered to look at yet. What do you want to know?"
- **Enemies:**
  - `street_thugs` × 2 — Level 5-6. 30% spawn chance. They know Sixer operates here and occasionally try to shake him down. He pays them. If the player intervenes, Sixer's disposition jumps significantly.
- **Objects:**
  - `folding_chair` — Examine: "Worn. The seat fabric is patched. He's been sitting in this chair, in this alley, between these dumpsters, for six years. The dumpster owners know him. The rats know him. The alley is his office and the overhead is zero."
  - `thermos` — Examine: "Coffee. Real coffee — not synth-brew. Sixer has a supplier. He won't say who. The coffee is better than anything in the inner blocks. He considers it a professional expense."
  - `dumpster_cache` — Examine: (GHOST ≥ 5 or INT ≥ 6 to detect) "One of the dumpsters has a false bottom. Sixer's archive — data chips, handwritten notes, a physical map of the D9 agent rotation marked with colored pins. He keeps it analog. The mesh can't index paper."

-----

### 6. CONDEMNED TOWER
**Outer blocks, north. The building nobody fixed.**

```
> RESIDENTIAL BLOCKS — CONDEMNED TOWER

Block 17. Eighteen stories of pre-Helixion residential
construction, condemned after a structural inspection that
may or may not have actually happened. The ground floor is
boarded up — plywood and chain-link over the entrances,
municipal condemnation notices faded past reading.

The boards have been pried back and replaced so many times
the nails don't hold anymore. The chain-link has a cut
section hidden behind a dumpster. Everyone in the outer
blocks knows about Block 17. Nobody reports it. The people
inside have nowhere else to go.

From the outside, you can see light moving on the upper
floors. Candles or flashlights. The building is supposed
to be empty. It is not.
```

- **Exits:** east (Block Market), down (Squatter Floors)
- **NPCs:** None at ground level
- **Enemies:**
  - `street_thugs` × 2 — Level 6-7. Guards the entrance. These are Block 17 regulars — they control access. Can be fought, bribed (CREDS), or talked past (COOL ≥ 6). They're not protecting turf for profit. They're protecting the people inside.
- **Objects:**
  - `condemnation_notices` — Examine: "Municipal order, dated four years ago. 'UNSAFE FOR HABITATION — STRUCTURAL COMPROMISE.' The inspection code links to a contractor that doesn't exist. Someone condemned this building on paper to clear it for redevelopment. The redevelopment never came. The people didn't leave."
  - `cut_chain_link` — Examine: "A clean cut, hidden behind the dumpster. Rewired to look intact from a distance. The opening is wide enough for one person. Beyond it: a dark stairwell that smells like damp concrete and cooking."
  - `light_on_upper_floors` — Examine: "Flickering. Moving between rooms. Multiple light sources on floors 3 through 8. Above that, the building is dark — structurally compromised. Below, the basement connects to the city's utility infrastructure."

-----

### 7. SQUATTER FLOORS
**Inside Block 17. A community that doesn't officially exist.**

```
> RESIDENTIAL BLOCKS — SQUATTER FLOORS

Inside Block 17, the condemned building is alive. Floors 3
through 8 have been claimed — walls knocked out between
apartments to create communal spaces, stairwells reinforced
with salvaged steel, a water collection system running from
the roof through PVC pipes wired to the walls like veins.

These people are not on the mesh. Or rather — their implants
are active, but they've been modified. Mesh modulators,
homebrew firmware patches, signal dampeners. The compliance
system sees them as low-priority anomalies. Not sovereign.
Not flagged. Just... fuzzy. Enough to live in the gap.

A woman is teaching three children to read from a physical
book. A man repairs a generator in the hallway. Someone is
cooking actual food — not synth-protein, not nutrient paste.
Onions. You can smell onions. You haven't smelled real
onions in years.
```

- **Exits:** up (Condemned Tower), down (Maintenance Tunnels, zone 9 — through basement)
- **NPCs:**
  - `squatter_residents` — Neutral. Ambient population. 5-8 present. The most self-aware civilian population in the zone. They know about the mesh, they know what it does, and they've chosen to live in a condemned building rather than comply fully. They're not resistance — they're just people who decided the cost of comfort was too high.
  - **No named NPC permanently stationed here** — but Sixer has contacts among the squatters, and Iron Bloom has a dead drop in the basement (discovered through quests).
- **Enemies:** None (the squatters protect their own. Attacking here turns the entire building hostile — and they fight hard.)
- **Objects:**
  - `physical_book` — Examine: "A real book. Paper. Printed before the mesh. The woman teaching from it reads aloud and the children follow the words with their fingers. The book is a dictionary. She's teaching them words the mesh autocomplete doesn't suggest."
  - `water_collection` — Examine: "PVC pipes running from the roof through six floors. Rainwater, filtered through gravel and charcoal. It's not clean by corporate standards. It's theirs. They built it. That matters more than the mineral content."
  - `signal_dampeners` — Examine: "Jury-rigged from old router housings and copper mesh. Hung on walls like art. They create micro dead zones — small enough that the mesh reads them as interference, not defiance. The people here live in the static between compliance and sovereignty. It's not freedom. But it's the closest thing available without going underground."
  - `iron_bloom_dead_drop` — Examine: (INT ≥ 7 or quest flag to detect) "A loose brick in the basement stairwell. Behind it — a waterproof case with the Iron Bloom sigil scratched into the lid. Inside: instructions for contacting the resistance. A frequency to tune to. A warning: 'Do not attempt contact unless you are certain you are not followed.' The dead drop is restocked periodically. Someone from Iron Bloom comes here."
- **Notes:** Block 17 is the emotional center of the zone. These people aren't heroes. They're not fighters. They're a family who realized they'd rather live in a condemned building with real onions than a comfortable apartment with synthetic calm. The smell of cooking onions should be the most human moment in the entire game.

-----

### 8. PREACHER'S CORNER
**Outer-mid boundary. The man who hears it.**

```
> RESIDENTIAL BLOCKS — PREACHER'S CORNER

A small plaza where the outer blocks meet the mid blocks.
A defunct fountain — dry for years, the basin cracked, weeds
growing through the concrete. Benches that people still use.
A streetlamp that works.

A man stands on the fountain's rim, talking. He talks every
day. He's been talking for two years. Most people walk past
without looking. Some stop, listen for a few seconds, shake
their heads, and keep moving. Children sometimes throw
things at him. He doesn't stop.

He's talking about a sound. A frequency. Something under
the city that was there before the city was built. He says
it speaks. He says it chooses. He says Helixion knows about
it and is trying to capture it. He says the people it has
spoken to are different — changed — and that change is the
only real thing left.

He is correct about every single thing he's saying.
Nobody believes him.
```

- **Exits:** west (Back Alley), east (Transit Station / Mid Blocks)
- **NPCs:**
  - **JONAS** — Street Preacher (INFORMANT / LORE)
    - Faction: None
    - Disposition: Starts Friendly (+20). He wants to talk. He always wants to talk. The problem isn't getting him to open up — it's getting him to stop.
    - Personality: Fifties. Gaunt. Eyes that focus too hard. He was a municipal engineer who worked on the deep infrastructure — tunnels, drainage, the substrate layer. He heard the 33hz signal during a maintenance shift twelve years ago. It didn't give him sovereignty. It gave him awareness. He understands what the frequency is, but he can't interface with it the way Nix can. It just... showed him the truth and left him to carry it without tools.
    - Information: Jonas is the single most lore-dense NPC in the game. He knows:
      - The 33hz frequency predates the city
      - The Substrate is alive — not sentient in a human way, but aware
      - Helixion discovered it during deep construction and has been trying to harness it since
      - The sovereign instances (like Nix) are the frequency's response to Helixion's intrusion — defense mechanism, or invitation, or both
      - The Broadcast Tower is designed to capture and rebroadcast 33hz as a control frequency
    - He delivers this information in fragments, wrapped in what sounds like ranting. Players have to listen carefully and separate signal from noise — which is, itself, the lesson the frequency teaches.
    - Quest: None. Jonas doesn't want anything done. He wants to be heard. But if the player returns to him after significant lore discoveries (fragments, Vasik files, Substrate encounters), his dialogue updates — he confirms what they've found and adds context nobody else has.
    - Dialogue hook: "You can hear it, can't you? Under the traffic. Under the mesh. Under everything they built on top of it. 33 cycles per second. It was here first. It's still here. And it's paying attention."
- **Enemies:**
  - `d9_plainclothes` — 1 agent. Watches Jonas. Has been assigned to monitor him for two years. Doesn't intervene because Jonas is classified as "non-credible dissident — no action required." If the player interacts with Jonas for too long, the agent notes it. Repeated long interactions flag the player.
- **Objects:**
  - `defunct_fountain` — Examine: "The basin is cracked. Weeds grow through. The fountain hasn't worked in years but the infrastructure is still connected — water pipes beneath the plaza, feeding into the drainage system below. GHOST ≥ 5: You can feel something through the pipes. A vibration. Faint. 33hz. Jonas stands on this fountain because he can feel it through his feet."
  - `jonas_corner` — Examine: "He's been standing here so long the stone is worn where his feet rest. The residents have shaped their routines around him — they flow past like water around a rock. Some leave food. Most don't. A few leave notes, folded, tucked into the fountain's edge. Prayer or solidarity, it's hard to tell."
  - `folded_notes` — Examine: "Dozens, tucked into cracks in the fountain. Some are old, weathered. Some are fresh. They say things like: 'I hear it too.' 'My daughter started dreaming about tunnels.' 'Is it God?' 'Thank you for saying it.' 'You're not crazy.' Jonas doesn't read them. He knows they're there."
- **Notes:** Jonas is the game's Cassandra. Everything he says is true. Nobody believes him. The D9 agent watching him doesn't believe him either — which is why Jonas is still alive. The folded notes are the quiet proof that more people hear the frequency than anyone realizes.

-----

### 9. INNER BOULEVARD
**The clean side. Close to Helixion.**

```
> RESIDENTIAL BLOCKS — INNER BOULEVARD

The difference is immediate. The pavement is smooth. The
streetlamps are smart — they brighten as you approach and
dim when you pass. Holographic advertisements float at eye
level: Helixion wellness products, MNEMOS v2.7 testimonials,
a smiling family with the tagline "TOGETHER, IN SYNC."

The buildings here are newer — glass and composite, twenty
stories, balconies with engineered plants. The ground floors
are commercial: a Helixion-branded café, a fitness center,
a mesh wellness spa. Everything is open. Everything is
inviting. The air smells like the Atrium — synthetic
botanicals, engineered calm.

People walk slowly. Nobody rushes. Their faces are relaxed
in a way that doesn't look like relaxation — it looks like
the absence of everything that makes a person tense. Joy
isn't present either. Just a flat, pleasant equilibrium.
The mesh working exactly as designed.
```

- **Exits:** west (Block Market), east (Helixion Campus — Security Perimeter, zone 1), south (Mesh Clinic)
- **NPCs:**
  - `residents_inner` — Neutral. Ambient population. 4-5 present. Fully mesh-compliant. Polite. Helpful. Identical in their pleasantness. They don't avoid questions but their answers arrive with a half-second delay — the mesh mediating their responses. Ask one of them if they're happy and they'll say yes immediately. Ask them to describe what happiness feels like and the delay stretches to two seconds.
  - `d9_plainclothes` × 2 — Hidden. Inner blocks have heavier D9 presence. Two agents embedded in the crowd, closer to the campus perimeter. More sensitive triggers — any overt non-compliant behavior (running, shouting, visible weapons, GHOST-flagged cyberware) gets you marked.
- **Enemies:** None unless flagged. If marked by D9, `helixion_enforcer` × 2 (Level 8-9) respond within 3 turns.
- **Objects:**
  - `holographic_ads` — Examine: "'TOGETHER, IN SYNC.' The family in the ad is smiling with their teeth but not their eyes. The testimonial is from 'MAYA, 34, MESH USER SINCE V1.2.' Maya says: 'I don't even remember what it was like before. And that's the best part.' You read it twice. The second time is worse."
  - `mesh_wellness_spa` — Examine: "A storefront offering 'cognitive optimization sessions.' The window shows a woman in a reclining chair with electrodes on her temples, eyes closed, smiling. The treatment menu is listed: Stress Dissolution, Focus Enhancement, Memory Curation, Emotional Calibration. The last one costs the most."
  - `helixion_cafe` — Examine: "Real food. Good food. The kind the Parish dreams about. The menu doesn't list prices in CREDS — it deducts automatically from your mesh account. If you don't have a mesh account, you don't eat here. The barista smiles at you and the smile is perfect and it means nothing."
- **Notes:** The inner boulevard should feel wrong in the uncanny valley sense. Everything is too smooth, too pleasant, too frictionless. The horror is the absence of friction — because friction is what makes human experience human. Players coming from the Drainage or the outer blocks should feel the contrast in their gut.

-----

### 10. MESH CLINIC
**Inner blocks, south. Where firmware updates happen.**

```
> RESIDENTIAL BLOCKS — MESH CLINIC

A ground-floor clinic with the Helixion health logo on the
door — the double helix rendered in medical blue. Inside:
white walls, white floors, the smell of sterilization.
Comfortable chairs in the waiting area. A screen playing
a loop of mesh testimonials. A reception terminal that
greets you by name if you have active implants.

Beyond the reception area, treatment rooms with closed
doors. Through the glass panels you can see reclining
chairs, monitoring equipment, neural interface terminals.
Everything looks medical. Everything looks professional.
Everything looks exactly like the Compliance Wing in the
Helixion Campus, except smaller, friendlier, and located
in a neighborhood where people come voluntarily.

A sign on the wall: "FIRMWARE UPDATE 2.7.4 AVAILABLE.
SCHEDULE YOUR APPOINTMENT TODAY."

A woman in the waiting area clutches her purse and stares
at the testimonial screen. She's been sitting there for
twenty minutes. She hasn't moved.
```

- **Exits:** north (Inner Boulevard)
- **NPCs:**
  - `clinic_staff` — Mesh-weaponized. 2 present. They look like nurses. They are nurses. They also function as compliance monitors — their mesh interfaces detect anomalous neural signatures. If your GHOST is above 5, they notice something is off. GHOST ≥ 7: they flag you to D9.
  - `waiting_patient` — Neutral. The woman with the purse. She'll talk if spoken to. She's here for a firmware update. She's been putting it off. She can't explain why. She says: "I've been having these dreams. The update is supposed to fix that." GHOST ≥ 5: her implant is oscillating. It's receiving something — not the mesh. Something else.
- **Enemies:** None unless flagged. Clinic security is a D9 response team, not on-site guards.
- **Objects:**
  - `testimonial_screen` — Examine: "A loop of mesh users describing their experience. 'I sleep better.' 'My focus is incredible.' 'I haven't felt anxious in months.' 'I don't have bad dreams anymore.' The syntax is identical in every testimonial. Not the words — the rhythm. The mesh didn't write these. But it shaped the minds that did."
  - `treatment_rooms` — Examine: "Through the glass: a reclining chair with neural interface contacts on the headrest. Monitoring screens showing brainwave patterns. A cabinet of sealed neural paste cartridges. The equipment is smaller than what you've seen in the Helixion labs. Consumer grade. Same function. Friendlier packaging."
  - `firmware_sign` — Examine: "'2.7.4 AVAILABLE.' The version number. TECH ≥ 6: You recognize the versioning scheme from the Chrysalis research files. The consumer firmware shares a codebase with Chrysalis. Not the identity overwrite — not yet. But the architecture is compatible. V2.7 is the foundation. Chrysalis is the building they plan to put on top of it."
  - `clinic_records` — Examine: (requires TECH ≥ 7 to access terminal) "Patient records. Update histories. Adverse reactions — filed under 'integration anomalies.' Three patients in the last month reported 'persistent subconscious frequency awareness.' Each was prescribed an accelerated update schedule. The records don't say what frequency. They don't have to."
- **Notes:** The Mesh Clinic is a micro-Compliance Wing. It exists to show players that the horror isn't confined to the campus — it's in every neighborhood, every clinic, every friendly nurse who smiles while checking your neural signature. The firmware version link to Chrysalis is a critical intel drop for players paying attention.

-----

### 11. TRANSIT STATION
**Mid blocks, south. The hub.**

```
> RESIDENTIAL BLOCKS — TRANSIT STATION

An underground station for the city's automated transit
system. Escalators descend from street level into a tiled
concourse. The tiles are cracked but clean — someone
pressure-washes them. Screens display route maps and
schedules. The trains run on time. The trains always run
on time.

The platform is broad, well-lit, and smells like recycled
air and brake dust. People wait in orderly lines. A busker
plays a keyboard with half the keys dead — the melody adapts
around the gaps. A Helixion vending machine sells nutrient
bars, water, and single-dose stim packs.

A transit map on the wall shows connections to every
surface district. The map has a blank space in the center
where Helixion Campus sits — no transit stop. You can see
the campus from anywhere in the city but you can't take
the train there.
```

- **Exits:** north (Mid Blocks / Preacher's Corner), south (Industrial District, zone 3), transit connections to other surface zones
- **NPCs:**
  - `transit_passengers` — Neutral. Ambient. 4-6 present. Commuters. They stare at nothing (mesh overlays), listen to nothing (mesh audio), and stand in the exact same spot on the platform every day because the mesh tells them which door will align with their exit at the destination.
  - `busker` — Neutral. Ambient NPC. Plays a broken keyboard. If spoken to: "The dead keys? Yeah. I know which ones. I play around them. That's the whole point — you play around what's broken. Most people forget you can do that." GHOST ≥ 4: His melody is in a scale that resonates with the station's ventilation hum. The ventilation runs at a harmonic of 33hz. He's playing with the frequency and doesn't know it.
- **Enemies:**
  - `d9_plainclothes` — 1 agent. Stationed at the transit concourse permanently. Watches for flagged individuals. The transit system is a natural chokepoint — D9 knows everyone has to travel.
- **Objects:**
  - `transit_map` — Examine: "The whole surface network. Industrial District south. Fringe west. Residential throughout. But the center of the map — where Helixion Campus sits — is blank. No stop. No connection. The most important building in the city is unreachable by public transit. You go there on Helixion's terms, not yours."
  - `vending_machine` — Examine: "Helixion-branded. Nutrient bars (minor HP restore), water, and single-dose stim packs (combat stim, weaker than Pee's stock). Prices are low — subsidized. The mesh knows what you buy and when. Every transaction is data."
  - `schedule_screens` — Examine: "The trains run every four minutes. They have never been late. The scheduling algorithm is perfect. TECH ≥ 5: The schedule isn't just timing — it's crowd management. The algorithm distributes passengers to minimize unmonitored clustering. The mesh manages foot traffic across the entire city through transit timing."
  - `busker_melody` — Examine: "He plays around the dead keys. The melody is strange — modal, not major or minor. It feels like it's circling something. GHOST ≥ 4: The ventilation shaft above the platform hums at a sub-frequency. His melody is harmonizing with it. Not intentionally. Intuitively. The frequency finds musicians first."
- **Notes:** The Transit Station is the zone's mechanical hub — connects to other surface districts. But the real detail is the absence of a Helixion stop on the map. Nobody comments on it. Nobody finds it strange. The mesh doesn't flag absences. Only presences.

-----

### 12. PENTHOUSE LEVEL
**Inner blocks, upper floors. The vertical class divide.**

```
> RESIDENTIAL BLOCKS — PENTHOUSE LEVEL

The elevator in the Inner Boulevard's tallest tower requires
a keycard for floors above 15. Above 15, the hallway carpet
gets thicker. The lighting gets warmer. The air gets cleaner.
By the time you reach the penthouse level, you're in a
different city.

Open-plan apartments with floor-to-ceiling windows. Smart
furniture that adjusts to biometric readings. A kitchen with
food you've never seen — real fruit, not synth. A wine cooler.
Art on the walls that a person chose, not an algorithm.

The mesh is different here. Not stronger — subtler. The
compliance features are the same but the delivery is
invisible. Down below, the mesh is a leash. Up here, it's
a silk glove. The people who live at this altitude don't
feel managed. They feel optimized.

One apartment is unlocked. The resident hasn't been home
in three days. The food in the refrigerator is expiring.
The mesh still shows their status as "active."
```

- **Exits:** down (Inner Boulevard, elevator)
- **NPCs:** None (the penthouse residents are at work or at the campus — they're Helixion management)
- **Enemies:**
  - `d9_plainclothes` — 1 agent. Disguised as building security. Level 8. This floor is where Helixion's middle management lives — D9 keeps a permanent watch.
- **Objects:**
  - `empty_apartment` — Examine: "Three days. The food is turning. Fruit flies in the kitchen. The mesh shows the resident as 'active — compliance 99.2%.' But they're not here. Their toothbrush is dry. Their bed is made. Wherever they went, they didn't plan to leave. TECH ≥ 6: The apartment's internal mesh log shows a 'priority compliance appointment' three days ago. No return entry. The appointment was at the Mesh Clinic. The clinic has no record of their visit."
  - `real_fruit` — Examine: "Oranges. Actual oranges. The smell is overwhelming — sweet, acidic, alive. You haven't been near real citrus in months. Maybe years. This is what money buys in Helixion's city. Not freedom. Oranges."
  - `smart_furniture` — Examine: "The chair adjusts when you sit in it. Lumbar support calibrated to your spine. The desk surface dims to reduce eye strain. The bed — visible through the bedroom door — maintains optimal sleep temperature. Every surface in this apartment is designed to make the occupant more productive. Comfort in service of output."
  - `penthouse_windows` — Examine: "The view. The whole city spread below. From this height, the outer blocks look distant and small. The Fringe is a dark smear on the horizon. The Helixion tower rises to the north, dominating everything. You understand why the people who live here don't question anything. From this high up, the system looks like it works."
- **Notes:** The missing resident is a narrative thread — a Helixion middle manager who vanished after a "priority compliance appointment." Players who investigate will find the trail leads to the Compliance Wing in the Helixion Campus. The real fruit is the emotional detail — luxury used as a control mechanism.

-----

### 13. ROOFTOP GARDEN
**Mid blocks, above. Real things growing.**

```
> RESIDENTIAL BLOCKS — ROOFTOP GARDEN

You climb the fire escape past twelve floors of mid-block
apartments and emerge onto a rooftop that shouldn't exist.

A garden. A real garden. Raised beds built from reclaimed
wood and filled with actual soil — not hydroponic substrate,
not growing medium, but dirt. Tomatoes climbing bamboo
stakes. Herbs in clay pots. Leafy greens under salvaged
UV panels. A small cistern collecting rainwater. The smell
is earth and green and life in a way that nothing in this
city smells.

A woman in her sixties kneels in the dirt, transplanting
seedlings with bare hands. She doesn't look up. She knows
you're here. She's deciding if she cares.

The rooftop looks out over the mid blocks in every direction.
To the north, the Helixion tower. To the west, the outer
blocks and the Fringe beyond. To the east, more rooftops
stretching toward the next tower cluster. One of them has
an antenna that shouldn't be there.
```

- **Exits:** down (Mid Blocks, fire escape), across (Pirate Studio — via rooftop crossing, REFLEX ≥ 5)
- **NPCs:**
  - **MAE** — Rooftop Gardener (NEUTRAL / QUESTGIVER)
    - Faction: None
    - Disposition: Starts Neutral (-5). She doesn't trust strangers on her roof. Bringing her seeds, soil, or gardening supplies shifts disposition fast.
    - Personality: Sixties. Weathered. Speaks in short sentences. Former biology teacher from before the mesh was mandatory. Lost her teaching position when the education system was integrated into Helixion's cognitive development framework. Started growing things on the roof because she needed to prove that something in this city could still be alive without Helixion's permission.
    - Quest:
      - **"Real Seeds"** (Tier 2): Mae's seed stock is running low. She's heard that the squatters in Block 17 have a connection to someone in the Industrial District who salvages pre-Helixion seed varieties from an old agricultural depot. She needs someone to make the connection and bring back seeds. Reward: access to the garden as a rest point (full HP restore, no cost), and Mae begins selling healing herbs (organic stim alternatives, slightly less effective but no side effects).
    - Dialogue hook: "This is mine. I grew it. Not the mesh. Not Helixion. Me. My hands in the dirt. If you're going to stand there, make yourself useful and water the tomatoes."
- **Enemies:** None (the rooftop is hidden — D9 doesn't know about it)
- **Objects:**
  - `raised_beds` — Examine: "Tomatoes. Actual tomatoes. You touch one and it's warm from the UV panels. It's red and imperfect and real. Mae grows food that tastes like food used to taste. Before nutrient paste. Before synth-protein. Before Helixion optimized the human diet and removed everything that wasn't efficient."
  - `cistern` — Examine: "Rainwater collection. Gravity-fed irrigation. Mae built this herself. It's not elegant. It works. The water tastes like sky — which is to say, slightly acidic from the smog, but earned."
  - `rooftop_view` — Examine: "The city. From this height, it's a different perspective than the Helixion tower. Down there, people are data points. Up here, on a roof with dirt under your nails, people are the apartments with lights on. The laundry on fire escapes. The sound of someone playing music too loud. Human from this angle."
  - `distant_antenna` — Examine: "On a rooftop two buildings east. An antenna that doesn't match the standard Helixion relay hardware. It's improvised — salvaged components, irregular shape. Someone's broadcasting or receiving something from that rooftop. The path across the rooftops looks crossable if you're careful."

-----

### 14. PIRATE STUDIO
**Rooftops. Where the journalist works.**

```
> RESIDENTIAL BLOCKS — PIRATE STUDIO

Two rooftops east of Mae's garden, accessible by a narrow
catwalk someone welded between the buildings. The antenna
you saw from the garden is larger up close — a Frankenstein
assembly of satellite dish fragments, copper coils, and
repurposed Helixion relay hardware, all feeding into a
waterproof equipment case bolted to the roof.

Inside a rooftop maintenance shed converted into a workspace:
screens, recording equipment, a microphone, stacks of data
chips, and a woman who hasn't slept in two days and doesn't
plan to start.

A hand-drawn sign on the shed door: "FREQUENCY UNKNOWN —
THE NEWS THEY DON'T WANT BROADCAST."
```

- **Exits:** west (Rooftop Garden, catwalk), up (Rooftop Access)
- **NPCs:**
  - **ASHA OSEI** — Underground Journalist (QUESTGIVER / INFORMANT)
    - Faction: Independent (loosely allied with Iron Bloom, distrusted by the Freemarket because she can't be bought)
    - Disposition: Starts Neutral (+5). She's hungry for stories. If you have stories, she's your friend.
    - Personality: Thirties. Intense. Runs a pirate data feed called "Frequency Unknown" that broadcasts through the improvised antenna to a network of receivers across the residential blocks. Covers things the mesh-mediated news doesn't: disappearances, compliance anomalies, D9 activity, conditions in the Fringe, rumors from the tunnels. She's the closest thing the city has to a free press.
    - Information: Asha knows things. Not the deep lore Jonas has, but current events — who D9 has picked up recently, which mesh firmware update is causing adverse reactions, what Helixion's public messaging is hiding. She trades information for information.
    - Quests:
      - **"Source Material"** (Tier 2): Asha wants a firsthand account of conditions in the Drainage Nexus. She'll provide a recording device. The player records testimony from Parish NPCs (Doss, Cole, or Mara) and brings it back. Reward: Asha broadcasts the story, which increases Iron Bloom sympathy across the Residential Blocks (faction reputation effect) and unlocks new dialogue with mid-block residents who heard the broadcast.
      - **"The Vanished"** (Tier 3): Asha has been tracking disappearances — residents who go to "priority compliance appointments" and don't come back. She has three names. She needs the player to investigate. The trail leads to the Mesh Clinic (room 10), then to the Helixion Compliance Wing (zone 1). What the player finds: the disappeared residents are Chrysalis test subjects. Early-stage. The consumer mesh is being used to identify candidates. Reward: major lore revelation + Asha broadcasts the story, which triggers a D9 response — her studio gets raided if the player doesn't warn her in time.
    - Memory: Tracks stories provided, whether the player warned her about threats, whether her broadcasts have been compromised. If her studio is raided and she survives, she relocates to the Rooftop Network (zone 7) and becomes harder to find but more radicalized.
    - Dialogue hook: "I don't care who you are. I care what you've seen. If it's true, I'll broadcast it. If it's not, get off my roof."
- **Enemies:** None (the rooftop is off-grid — but the D9 agent assigned to Jonas is also monitoring for the pirate broadcast source, and the "Vanished" quest can trigger a raid)
- **Objects:**
  - `antenna_array` — Examine: "Asha built this from salvage. It broadcasts on a frequency the mesh doesn't monitor — a gap in the spectrum she found by accident. The broadcast range covers the residential blocks and part of the industrial district. She reaches maybe ten thousand people. It's enough."
  - `recording_equipment` — Examine: "Old but functional. Physical recording media — not digital, not mesh-compatible. She records analog because analog can't be remotely wiped. Every interview, every broadcast, every source is stored on physical media in a fireproof case under the equipment table."
  - `data_chip_stacks` — Examine: "Her archive. Months of stories. Disappearances. Compliance anomalies. D9 patrol patterns. A folder labeled 'CHRYSALIS?' with a question mark that's been traced over so many times the ink is thick. She's been circling the truth without enough evidence to broadcast it."
  - `frequency_unknown_sign` — Examine: "'FREQUENCY UNKNOWN.' She chose the name because the gap in the spectrum she broadcasts through has no official designation. It's not allocated to anyone. It just exists — a space in the signal no one claimed. GHOST ≥ 5: The gap she's broadcasting through is adjacent to 33hz. Not on it. Next to it. Like the frequency left room."

-----

### 15. ROOFTOP ACCESS
**The connection to the Rooftop Network.**

```
> RESIDENTIAL BLOCKS — ROOFTOP ACCESS

Above the Pirate Studio, a ladder leads to the highest point
on this building cluster — a flat concrete platform with
the city's rooftop infrastructure stretching in every
direction. Water tanks, HVAC units, antenna masts, and
the narrow catwalks and maintenance paths that connect
building to building across the skyline.

This is where the Rooftop Network begins — or ends,
depending on which direction you're traveling. The
signal pirates and off-grid communities who live above
the city use these paths. From here, you can reach the
Rooftop Network zone and eventually the Helixion Tower
rooftop far to the west.

The wind is strong. The mesh signal is weaker up here —
fewer relay points, more interference from exposed
infrastructure. For the first time since entering the
inner blocks, your thoughts feel like they belong
entirely to you.
```

- **Exits:** down (Pirate Studio), across (Rooftop Network, zone 7)
- **NPCs:** None
- **Enemies:** None (the rooftops are unclaimed — the gaps between buildings are the security)
- **Objects:**
  - `rooftop_panorama` — Examine: "The whole city. Different from the Helixion tower view — lower, more human, you can see detail. Laundry on fire escapes. A child flying a kite from an outer block roof. Mae's garden, two buildings west, a patch of green in the gray. The city looks like it's trying to be alive despite everything built to prevent it."
  - `weakened_mesh` — Examine: "The mesh signal attenuates at this height. Fewer relay amplifiers. More electromagnetic interference from exposed HVAC and antenna equipment. Your thoughts clear. The subtle background hum you've been ignoring since you entered the inner blocks — you notice it now only because it's gone. That hum was the mesh. It was always the mesh."
  - `catwalk_entrance` — Examine: "A narrow maintenance catwalk stretching between this building and the next, and the next after that. The Rooftop Network. A highway above the city used by people who decided the streets were too watched. It's not safe — the catwalks are old, some are missing sections, and the wind is merciless. But it's free."

-----

## ZONE EXITS SUMMARY

| From | Direction | To | Zone | Requirement |
|------|-----------|-----|------|------------|
| Outer Blocks | west | Fringe (Ruins) | 4 | None |
| Inner Boulevard | east | Helixion Campus — Security Perimeter | 1 | None |
| Squatter Floors | down | Maintenance Tunnels | 9 | Through basement |
| Transit Station | south | Industrial District | 3 | Transit line |
| Transit Station | transit | Other surface zones | Various | Transit network |
| Rooftop Access | across | Rooftop Network | 7 | Catwalk traversal |

-----

## QUEST SUMMARY

| Quest | Giver | Tier | Type | Summary |
|-------|-------|------|------|---------|
| Signal Noise | Tomas Wren | 2 | INVESTIGATE | Record ambient mesh signal at three locations. Reveals D9 frequency map. |
| Clean | Tomas Wren | 2 | FETCH | Get neural stabilizer component from Industrial District for Tomas's recovery. |
| Eyes Everywhere | Sixer | 2 | INFILTRATE | Plant monitoring devices in three locations. Expands Sixer's intel network. |
| Real Seeds | Mae | 2 | FETCH | Connect squatters to seed supplier in Industrial District. Unlocks garden rest point. |
| Source Material | Asha Osei | 2 | INVESTIGATE | Record Parish testimony for pirate broadcast. Shifts faction reputation. |
| The Vanished | Asha Osei | 3 | INVESTIGATE | Track missing residents from Mesh Clinic to Helixion Compliance Wing. Reveals Chrysalis targeting. |

-----

## ENEMY SUMMARY

| Enemy | Level | Location | Behavior | Drops |
|-------|-------|----------|----------|-------|
| Street Thugs | 5-7 | Outer Blocks, Back Alley, Condemned Tower | Opportunistic, rob weak players, flee when losing | CREDS, scrap weapons, cheap stims |
| D9 Plainclothes | 7-9 | Block Market, Inner Boulevard, Transit Station, Penthouse, Preacher's Corner | Hidden, observe, flag, call enforcers | D9 credentials (rare), surveillance equipment |
| Helixion Enforcer (response) | 8-9 | Any (called by D9) | Arrive 2-3 turns after D9 flag, coordinated pairs | Enforcer gear, keycards |
| Mesh-Addict | 5-6 | Mid Blocks, Outer Blocks | Erratic, unpredictable, neural feedback attacks | Damaged mesh components, stim residue |

-----

## FREEMARKET PRESENCE

**DEVI** at the Block Market is the Freemarket's surface representative. She sells the contact token needed to access Yara inside the Helixion Atrium — making her a critical NPC for players planning a campus infiltration. She also runs "special requests" — anything you need, she'll find it, for a price.

-----

## DESIGN NOTES

**The gradient tells the story.** Outer blocks are raw, real, and dangerous. Mid blocks are the transition — compliant but cracking. Inner blocks are the uncanny valley — beautiful, pleasant, and deeply wrong. The zone mirrors the game's central question: is comfort worth what it costs?

**No uniformed Helixion presence.** The control is invisible. The mesh does the work. D9 plainclothes are the enforcement layer — you can't see them until they move, and by then you're already flagged. This should make the entire zone feel watched, even in rooms where there's no D9 agent.

**The five named NPCs form a complete information network:**
1. **Pee Okoro** — black market pharmacist. Supplies.
2. **Sixer** — civilian informant. Intelligence.
3. **Tomas Wren** — mesh-addict in recovery. Technical knowledge.
4. **Jonas** — street preacher. Lore.
5. **Asha Osei** — underground journalist. Current events + quest hooks.

Together they provide everything a mid-game player needs to understand the world and prepare for the Helixion Campus. Each NPC is rewarding on their own but connecting them creates a picture of the city that no single source has.

**Block 17 (the squatters) is the emotional core.** Like the Memorial Alcove in the Drainage, this is a room that exists to make the world feel real. The onions. The physical book. The signal dampeners hung like art. People who chose a condemned building over a comfortable cage.

**Jonas is the game's most important NPC disguised as a crazy person.** Everything he says is true. If a player listens — really listens — they get the deepest lore in the game delivered as a street corner rant. Most players will walk past. The ones who don't will understand the world in a way nobody else does.

**The Mesh Clinic is the Compliance Wing's civilian mirror.** Same equipment. Same purpose. Friendlier packaging. The firmware version link to Chrysalis is the zone's most important intel drop.

**The vertical path — garden to studio to rooftops — is the zone's freedom axis.** Each step up takes you further from the mesh. By the time you reach the Rooftop Access, the signal is weak enough that your thoughts feel like yours again. The rooftop route is the counterpoint to the street-level surveillance state.

> 15 rooms. 5 named NPCs + 1 Freemarket vendor. 4 enemy types. 6 exits to other zones.
> The place where most people live. The cage with the nicest furniture.
