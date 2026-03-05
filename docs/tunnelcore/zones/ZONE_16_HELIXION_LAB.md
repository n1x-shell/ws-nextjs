# ZONE 16: HELIXION LAB

> Depth: Instanced (beneath Helixion Campus — Laboratory Floor, z01 r08)
> Location: Sub-levels beneath the Research Wing
> Faction: Helixion (maximum security research facility)
> Rooms: 10
> Level Range: 14–20 (Acts 3–4, repeatable)
> Origin Point: None
> Instance Type: Raid dungeon — party recommended (2-4 players), repeatable with escalating difficulty

-----

## OVERVIEW

The Helixion Lab is the game's raid dungeon — a multi-boss, multi-room instanced experience that exists beneath the Helixion Campus's Research Wing. The Lab is where Project Chrysalis moves from theory to practice: neural architecture research, compliance signal testing, personality overwrite prototyping, and the experiments that turn the Substrate's frequency into a weapon.

The Lab is accessed through the Laboratory Floor (z01 r08) via a restricted elevator that descends into sub-levels not present on any campus schematic. The elevator requires either Vasik's research credentials, Hale's utility override codes, or a direct breach of the Laboratory Floor's security. Once the elevator descends, the instance begins.

The dungeon is structured as a **descending spiral** — the architecture mirrors the Broadcast Tower's Fibonacci array inverted. Where the Tower spirals upward toward the sky, the Lab spirals downward toward the Substrate. Each level of the spiral is a ring of rooms, tighter and harder than the last, the corridor curving inward as the floor descends. The aesthetic shifts with depth: the upper levels are clinical research spaces; the mid-levels are experimental chambers where the research becomes visceral; the deepest level is where the Chrysalis prototype operates — the machine that rewrites a human mind.

The Lab is **repeatable**. Each run generates the same room structure but with escalating enemy difficulty (Normal, Hard, Nightmare). Loot scales with difficulty. The basic path through the Lab is a 10-room descent through three bosses to a final encounter. But the Lab contains **puzzle-locked branches** — hidden paths activated by environmental interactions that lead to rare loot caches, alternate encounters, and on Nightmare difficulty, an alternate final boss that changes the encounter entirely.

The Lab is designed for **parties of 2-4 players**. Solo runs are possible for high-level characters but the boss mechanics assume coordinated action — tank/damage/support roles, simultaneous objective completion, and environmental management that's easier with multiple hands. The Lab is the game's primary multiplayer content alongside the Fight Pits' PvP system.

-----

## ATMOSPHERE

```
Sound:    Upper spiral: clinical hum. Server fans, climate
          control, the precise sounds of a research facility
          operating at full capacity. Automated systems
          chirp status confirmations. Behind sealed doors:
          sounds you don't want to identify.

          Mid spiral: the clinical gives way to something
          organic. The 33hz appears — not ambient, but
          generated. Machines producing the frequency for
          experimental purposes. The hum has a synthetic
          quality — manufactured 33hz sounds different from
          the Substrate's natural pulse. It's close but
          wrong. The uncanny valley of frequency.

          Deep spiral: the synthetic 33hz and the natural
          33hz overlap. The Lab's deepest level sits close
          enough to the Substrate that the earth's real
          frequency bleeds through. The two signals interfere
          — creating harmonic artifacts, beating patterns,
          moments of constructive interference where the
          sound is overwhelming and moments of destructive
          interference where the silence is deafening.

Light:    Upper: surgical white. The same clinical brightness
          as the campus above.
          Mid: shifting. The experimental chambers use
          frequency-tuned lighting — bioluminescent panels
          that mimic the Substrate's glow. The light pulses.
          Deep: the Substrate's real bioluminescence, bleeding
          through the floor. Blue-green from below, clinical
          white from above. The two light sources create an
          undersea quality — everything looks submerged.

Smell:    Neural paste. Antiseptic. Ozone from high-energy
          equipment. And deeper: the Substrate's mineral
          warmth, rising through the floor. The Lab smells
          like medicine and earth. Surgery and geology.
```

-----

## INSTANCE STRUCTURE

```
DIFFICULTY TIERS:
  Normal  — Enemy levels 14-17. First clear. Lore drops.
  Hard    — Enemy levels 17-19. Enhanced mechanics. Better loot.
  Nightmare — Enemy levels 19-20. Alternate final boss. Rarest loot.

PUZZLE PATHS:
  The Lab contains 3 puzzle-locked branches (marked ◆ on the map).
  Each puzzle requires environmental interaction:
    ◆1 (Room 3): Frequency calibration puzzle → Cache Alpha
    ◆2 (Room 6): Neural pathway routing puzzle → Cache Beta
    ◆3 (Room 8): Chrysalis override puzzle → Alternate final boss

  Puzzles require TECH ≥ 8 (◆1), GHOST ≥ 8 (◆2), or TECH ≥ 9 + GHOST ≥ 8 (◆3).
  Solving all three in a single run unlocks the PERFECT RUN achievement
  and the Lab's rarest drop: the Sovereign Frequency Implant.

LOOT:
  Normal: Standard endgame gear, Chrysalis research data (lore items),
          cyberware components.
  Hard:   Enhanced weapons, T3 cyberware, rare crafting materials,
          Substrate-hybrid augmentations.
  Nightmare: Unique equipment (one drop per boss per week),
          the Sovereign Frequency Implant (◆3 alternate boss only).
```

-----

## ROOM MAP

```
    FROM HELIXION CAMPUS
    (z01) Laboratory Floor
              │
              │ down (restricted elevator)
              │
    ══════════╪═══════════ INSTANCE BEGINS
              │
    UPPER SPIRAL (clinical)
              │
       ┌──────┴──────┐
       │ INTAKE       │
       │ (1)          │
       └──────┬───────┘
              │
       ┌──────┴──────┐   ◆1
       │ SIGNAL LAB  ├───── Cache Alpha
       │ (2)         │   (frequency puzzle)
       └──────┬──────┘
              │
       ┌──────┴──────┐
       │ ██ BOSS 1 ██│
       │ NEURAL FORGE │
       │ (3)          │
       └──────┬───────┘
              │
    MID SPIRAL (experimental)
              │
       ┌──────┴──────┐
       │ TRIAL        │
       │ CHAMBERS     │
       │ (4)          │
       └──────┬───────┘
              │
       ┌──────┴──────┐   ◆2
       │ GROWTH VATS ├───── Cache Beta
       │ (5)         │   (neural pathway puzzle)
       └──────┬──────┘
              │
       ┌──────┴──────┐
       │ ██ BOSS 2 ██│
       │ THE WARDEN  │
       │ (6)         │
       └──────┬──────┘
              │
    DEEP SPIRAL (Substrate proximity)
              │
       ┌──────┴──────┐
       │ DEEP         │
       │ RESEARCH     │
       │ (7)          │
       └──────┬───────┘
              │
       ┌──────┴──────┐   ◆3
       │ CHRYSALIS   ├───── Alternate boss
       │ CHAMBER     │   (override puzzle)
       │ (8)         │
       └──────┬──────┘
              │
       ┌──────┴──────┐
       │ ██ BOSS 3 ██│
       │ THE OVERWRITE│
       │ (9)          │
       └──────┬───────┘
              │
       ┌──────┴──────┐
       │ THE WELL     │
       │ (10)         │
       │ (standard or │
       │  ◆ alternate)│
       └──────────────┘
              │
         INSTANCE ENDS
         (return elevator)
```

-----

## ROOMS

### UPPER SPIRAL (Rooms 1-3)
*Clinical. Sterile. The research that looks like science.*

-----

### 1. INTAKE
**The Lab's reception. Where subjects enter and don't leave.**

```
> HELIXION LAB — INTAKE

The elevator opens onto a clinical reception space —
white walls, sealed floors, decontamination arch. The
sign above the inner door reads: "CHRYSALIS RESEARCH
DIVISION — AUTHORIZED PERSONNEL ONLY." The
authorization no longer matters. You're here.

The intake room processed every Chrysalis test subject
— the people who entered this facility and emerged as
something else. Or didn't emerge. The room contains
processing stations: biometric registration, neural
baseline scanning, a changing area with hospital gowns
folded on shelves. The gowns are one-size, paper-thin,
designed to strip identity before the research begins.

The inner door is locked. It opens when the
decontamination arch completes its cycle. The cycle
takes 10 seconds. During those 10 seconds: the first
enemies arrive. The Lab's automated defense responds
to unauthorized presence. The run has begun.
```

- **Exits:** down (Signal Lab — inner door, after decontamination cycle)
- **Enemies:**
  - `security_drone` × 3 — Level 14 (Normal) / 17 (Hard) / 19 (Nightmare). Automated aerial units. They deploy from ceiling housings when the decontamination cycle begins. 10-second timer: the party fights or avoids the drones while the door unlocks. The drones are the run's warmup — fast, fragile, manageable. They establish the Lab's tempo: things happen on timers. Timers create urgency.
  - `lockdown_protocol` — Environmental. If the drones are not defeated or evaded within 30 seconds: blast doors seal, gas vents deploy (non-lethal, disorienting — reduced accuracy for 60 seconds). The lockdown is a soft-fail state — it doesn't end the run but it costs resources.
- **Objects:**
  - `processing_stations` — Examine: "Biometric scanners. Neural baseline readers. The equipment recorded every subject's cognitive architecture before the Chrysalis procedure — a 'before' snapshot for comparison with the 'after.' TECH ≥ 7: The baseline data is still stored locally. The records show hundreds of subjects. The 'before' readings are varied — individual, complex, unique. The 'after' readings are identical. Every post-Chrysalis subject has the same neural pattern. The same identity. The same person, installed in different bodies."
  - `hospital_gowns` — Examine: "Paper-thin. One-size. Folded precisely. Each one was worn by a person who walked in with a name and walked out with a number. Or didn't walk out. The gowns are an assembly line of dehumanization — strip the clothes, strip the identity, begin the process. The folding is meticulous. Someone cares about presentation. Nobody cares about the people."

-----

### 2. SIGNAL LAB
**Where Helixion learned to manufacture 33hz.**

```
> HELIXION LAB — SIGNAL LAB

The spiral descends. The corridor curves — the Fibonacci
geometry visible in the wall curvature, the ceiling
angle, the way the space tightens as you move inward.
The Signal Lab occupies the first ring.

A research space dedicated to the 33hz frequency.
Equipment lines the walls: signal generators, spectrum
analyzers, neural response monitors. The Lab didn't just
study the 33hz — it learned to produce it. Synthetic
33hz. A manufactured copy of the Substrate's natural
frequency, close enough to interface with neural
implants, different enough that the Substrate doesn't
recognize it as its own.

The synthetic signal is active. The equipment is running.
The 33hz generators hum with manufactured frequency —
the sound is similar to the Substrate's but carries a
quality that GHOST ≥ 7 perceives as hollow. A copy
without the original's depth. A question without a
questioner.

◆ PUZZLE 1: Three signal generators are running. Their
frequencies are slightly misaligned — 32.8hz, 33.1hz,
33.0hz. A calibration terminal allows adjustment.
Aligning all three to exactly 33.000hz (TECH ≥ 8)
causes a resonance event — a hidden panel opens,
revealing Cache Alpha: a Substrate-hybrid weapon
component usable in crafting the Lab's best gear.
```

- **Exits:** up (Intake), down (Neural Forge — Boss 1)
- **Enemies:**
  - `signal_researcher` × 2 — Level 14/17/19. Helixion scientists with combat augmentation — they're researchers first, but the Lab's security protocol arms all personnel. They fight defensively, using the signal equipment as cover. They deploy signal disruptors: AoE devices that interfere with the party's cyberware (2-turn disable on active augmentations). Destroying the disruptors before they activate is the tactical priority.
  - `frequency_hazard` — Environmental. The synthetic 33hz generators create zones of intensified signal. Standing in a generator's field for more than 5 seconds triggers a compliance pulse (GHOST check or 1-turn stun). The generators can be disabled (TECH ≥ 6) or avoided (the fields are visible as shimmering air distortion).
- **Objects:**
  - `signal_generators` — Examine: "Three units. Each one produces synthetic 33hz — a manufactured approximation of the Substrate's frequency. TECH ≥ 7: The generators use crystalline oscillators grown from Substrate material (harvested from z14). The oscillators produce frequency that's measurably identical to the Substrate's. But GHOST ≥ 7 perceives the difference: the synthetic signal lacks the emotional register. The warmth. The curiosity. The question. Helixion duplicated the frequency. They couldn't duplicate the intent."
  - `calibration_terminal` — Examine: "◆ PUZZLE 1 — Three frequency readouts: 32.8, 33.1, 33.0. Adjustment knobs. Aligning all three to 33.000hz requires TECH ≥ 8 and patience — the knobs are sensitive, the readouts update in real-time, and the generators resist alignment (they drift back toward their current settings). Successfully aligning all three creates a resonance that opens Cache Alpha. The resonance also briefly silences every synthetic signal in the Lab — for 3 seconds, the only 33hz present is the Substrate's real frequency, bleeding through from below. The silence of the manufactured signal makes the natural signal clearer. GHOST ≥ 8: In those 3 seconds, you feel the Substrate. It felt you calibrate the machines. It's interested."
  - `cache_alpha` — Examine: (◆1 solved) "Behind the hidden panel: a Substrate-hybrid oscillator — a crystal that produces both synthetic and natural 33hz simultaneously. The oscillator is a research prototype that Helixion abandoned (the hybrid signal was 'unpredictable' — it carried the Substrate's emotional register, which interfered with compliance applications). The oscillator is a crafting component: combined with endgame weapons, it adds 33hz resonance damage that's especially effective against Chrysalis-augmented enemies."

-----

### 3. NEURAL FORGE — Boss 1
**Where the compliance architecture is manufactured.**

```
> HELIXION LAB — NEURAL FORGE

The corridor opens into a production space — the Lab's
internal manufacturing floor. This is where the
Chrysalis compliance architecture is built: neural
lattices grown in bio-reactive fluid, compliance
firmware burned onto interface chips, the physical
components of the system that rewrites a human mind.

The Forge is dominated by a central growth tank — a
cylinder three meters tall filled with luminescent
fluid. Inside: a neural lattice, growing. The lattice
pulses at synthetic 33hz. It looks like a brain. It's
not. It's the template — the standard Chrysalis
identity that gets installed during the overwrite
process. Every Chrysalis subject receives a copy of
this template. Every overwritten person becomes the
same person. This is the original.

The Forge's operator is still here. They didn't
evacuate when you arrived. They're standing at the
growth tank's controls, running the production cycle.
They are the first boss.
```

- **Exits:** up (Signal Lab), down (Trial Chambers)
- **NPCs/Boss:**
  - **DR. NAREN — The Forge Master** (BOSS 1)
    - Level: 16 (Normal) / 18 (Hard) / 20 (Nightmare)
    - Personality: Lab director for the Neural Forge division. Calm. Methodical. They designed the Chrysalis template — the standard identity installed during overwrite. They believe they've created the perfect human mind: no anxiety, no depression, no existential doubt, no inconvenient autonomy. They fight because the Forge is their life's work and you're here to destroy it.
    - Mechanic: **Phase fight with environmental interaction.**
      - Phase 1 (100-60%): Naren fights directly — augmented combat (neural disruption attacks, compliance pulses). Meanwhile, the growth tank continues producing lattices. Every 30 seconds, a fresh lattice deploys as a combat drone — a floating neural construct that attacks the party with compliance fields. Destroying the lattice drones is necessary to prevent being overwhelmed. Alternatively: TECH ≥ 8 characters can sabotage the growth tank, stopping drone production (Naren becomes enraged, dealing more damage but fighting more recklessly).
      - Phase 2 (60-30%): Naren activates the Forge's emergency protocol — the room fills with synthetic 33hz at maximum amplitude. GHOST check every 15 seconds or take compliance stun (1 turn). The signal generators from the previous room feed into the Forge — if the party disabled them earlier, the amplitude is reduced (easier GHOST checks). Previous room actions affect the current boss fight.
      - Phase 3 (30-0%): Naren interfaces directly with the growth tank — plugging into the neural lattice, gaining its processing power. Attack speed doubles. Compliance pulses become targeted. But the interface is a vulnerability — attacking the tank damages Naren. The choice: attack Naren directly (harder) or destroy the tank (damages the template, reduces loot but ends the fight faster).
    - Loot: Chrysalis research data (lore), Neural Forge components (crafting), compliance architecture schematics (useful for Iron Bloom's counter-signal work).
    - Dialogue: "You don't understand what you're destroying. This template eliminates suffering. Every person who receives it wakes up without fear. Without doubt. Without the weight of choosing wrong. — I made paradise. You're burning it because you're afraid of peace."

-----

### MID SPIRAL (Rooms 4-6)
*Experimental. The research becomes visceral.*

-----

### 4. TRIAL CHAMBERS
**Where the Chrysalis process is tested on living subjects.**

```
> HELIXION LAB — TRIAL CHAMBERS

The spiral tightens. The clinical white gives way to
something grimmer — the walls are still clean but the
purpose of the rooms behind the glass is unambiguous.
Trial chambers. Testing spaces. Rooms designed to
contain a human being while their mind is rewritten.

Six chambers line the curved corridor. Four are empty
— recently vacated, the restraint equipment still
configured for occupants who aren't there. One is
sealed and dark — whatever happened inside required
sealing rather than cleaning. The sixth contains a
subject.

The subject is alive. Conscious. Post-Chrysalis. They
sit in the chamber's center with the preternatural
stillness of someone who has no reason to move because
no impulse tells them to. They don't look at you
through the glass. They don't look at anything. They
are content. The contentment is total and empty and
it's the most frightening thing in the Lab.
```

- **Exits:** up (Neural Forge), down (Growth Vats)
- **Enemies:**
  - `chrysalis_subject` × 2 — Level 15/18/20. Failed or partial overwrites. They were subjects whose neural architecture resisted the Chrysalis template — the overwrite was incomplete, leaving them with fragments of both their original identity and the imposed one. They fight erratically: moments of coordinated combat (the template's tactical programming) interrupted by moments of confusion or distress (the original identity surfacing). They're tragic and dangerous. They're the Assembly Line's product after it's been installed.
  - `automated_restraint_system` — Environmental. The trial chambers' restraint equipment activates if the party enters a chamber — mechanical clamps attempt to secure anyone inside. REFLEX ≥ 7 to avoid. If caught: 2 turns to escape (BODY ≥ 7) or TECH ≥ 7 to disable remotely. The restraints are the room's primary hazard — the fight with the subjects happens in a space designed to immobilize.
- **Objects:**
  - `the_sixth_chamber` — Examine: "The completed subject. Post-Chrysalis. The overwrite was successful. The person who was here before is gone. The template is installed. The subject sits with perfect posture, breathing evenly, eyes open and unfocused. They're not catatonic — they're at rest. The template has no task for them. Without instruction, the template waits. GHOST ≥ 7: The subject has no emotional register. The neural activity visible through the monitoring panel is uniform — the same pattern, cycling, no variation. The Chrysalis template thinks one thought. The thought is: 'awaiting input.' The person this was is not inside. The person this was is gone."
  - `sealed_chamber` — Examine: "Dark. The glass is opaque from chemical coating — applied from inside. Something went wrong in this chamber badly enough that the room was abandoned mid-trial. TECH ≥ 8 to access the monitoring data: the subject in this chamber experienced a catastrophic neural rejection — the Chrysalis template and the original identity destroyed each other simultaneously. The monitoring data ends with a spike across all neural bands and then nothing. The room is sealed because what's inside can't be cleaned with standard equipment."

-----

### 5. GROWTH VATS
**Where the Substrate material is cultivated for Chrysalis components.**

```
> HELIXION LAB — GROWTH VATS

The mid-level production facility. Tanks — twelve of
them, each two meters tall, filled with bio-reactive
fluid. Inside the tanks: Substrate material, growing.
Not naturally — cultivated. Helixion has learned to
grow Substrate crystal in controlled conditions,
feeding it nutrients and frequency to produce the
organic components that the Chrysalis architecture
requires.

The cultivation is agricultural. The tanks are farms.
The Substrate material grows in them the way crops
grow in fields — seeded, fed, harvested. The difference:
the crops are pieces of a living mind. The cultivation
works because the Substrate material, even separated
from the organism, continues to grow. It responds to
33hz stimulus. It develops neural architecture. It
processes information.

The vats produce the components that the Neural Forge
assembles into compliance lattices. The production is
the Lab's purpose: take the Substrate's living tissue,
grow it in captivity, and use it to build the thing
that captures the Substrate's frequency. The weapon
is farmed from the victim.

◆ PUZZLE 2: The growth vats' neural routing is visible
as light patterns in the tank fluid. The patterns form
a network — a miniature version of the Substrate's
neural architecture. Rerouting the neural pathways
(GHOST ≥ 8 to perceive, then interact) causes the
cultivated Substrate material to resonate with the
natural Substrate below. The resonance opens a sealed
maintenance shaft — Cache Beta: a set of T3
Substrate-hybrid augmentations, the Lab's best non-
boss loot.
```

- **Exits:** up (Trial Chambers), down (The Warden — Boss 2)
- **Enemies:**
  - `growth_guardian` × 3 — Level 15/18/20. Automated defense drones designed to protect the vats. They prioritize vat integrity — if a party member damages a vat, all guardians target that player. The tactical implication: the vats can be used as obstacles (fighting near them restricts guardian movement) but damaging them redirects aggro dangerously.
  - `cultivated_organism` — Level 16/19/20. 1. If a vat is broken during combat, the cultivated Substrate material emerges — a partially-formed growth, reflexive, lashing out at anything nearby. Not hostile by intent (it's barely conscious) but dangerous by physics. The organism is a stray — a piece of the Substrate, grown in captivity, experiencing freedom as pain.
- **Objects:**
  - `growth_tanks` — Examine: "Twelve cylinders. Bio-reactive fluid. Inside: Substrate crystal, growing in cultivated conditions. TECH ≥ 7: The growth rate is accelerated — nutrients and synthetic 33hz stimulus push the material to develop ten times faster than natural growth. The cultivation produces components but strips them of the Substrate's natural complexity. The cultivated material has neural architecture but no cognition. It processes information but doesn't think. Helixion grows brain tissue that isn't a brain. The distinction is the justification."
  - `neural_routing` — Examine: "◆ PUZZLE 2 — GHOST ≥ 8: The light patterns in the tank fluid form a network. The network is artificial — designed for component production. But the Substrate material's natural tendency is to form connections. The cultivated neural pathways can be rerouted — redirected from the production pattern to a resonance pattern that connects the cultivated material to the natural Substrate below. The rerouting requires GHOST perception (to see the natural pathways the material wants to form) and interaction (to guide the fluid's conductivity). Successfully rerouting opens Cache Beta. The cultivated material, reconnected to the Substrate, pulses with genuine 33hz. For a moment, the captive pieces remember what they are."
  - `cache_beta` — Examine: (◆2 solved) "Behind the maintenance shaft: a set of three Substrate-hybrid augmentations. Neural interface (GHOST +2), sensory enhancer (perception boost), and a dermal augmentation that resonates at 33hz (provides passive environmental awareness in Substrate-proximate zones). The augmentations were prototypes — Helixion research into hybrid tech that was shelved when the Substrate components proved 'unpredictable' (they carried the Substrate's emotional register, which interfered with compliance applications). The prototypes are the Lab's best non-boss loot."

-----

### 6. THE WARDEN — Boss 2
**The person who keeps the subjects in their cells.**

```
> HELIXION LAB — THE WARDEN

The spiral tightens further. The corridor opens into
a security hub — the Lab's internal enforcement center.
Monitoring screens show every room in the facility.
Restraint equipment is stored on racks. A weapons locker
stands open, recently accessed.

The Warden sits at the monitoring station. They've been
watching you since the Intake. They know your route,
your tactics, your party composition. They've been
preparing.
```

- **NPCs/Boss:**
  - **COMMANDER FELL — The Warden** (BOSS 2)
    - Level: 17 (Normal) / 19 (Hard) / 20 (Nightmare)
    - Personality: Head of Lab security. Career enforcer. Fell doesn't believe in the Chrysalis mission — they don't care about compliance or overwrite or the Substrate's frequency. They care about the facility. Their facility. Every subject, every researcher, every piece of equipment is their responsibility. You're a threat to the facility. Fell eliminates threats.
    - Mechanic: **Tactical boss with environmental control.**
      - Fell's primary mechanic is the Lab's security systems. They control the facility from the monitoring station — activating lockdown protocols, deploying gas, triggering restraint systems in adjacent rooms. The fight isn't just against Fell — it's against the building. Fell uses the environment as a weapon: sealing doors to split the party, venting gas into specific rooms, activating cameras that allow Fell to track party members through walls.
      - Phase 1 (100-60%): Fell fights from the monitoring station, using environmental controls + personal combat. They're augmented — military-grade reflexes, combat limbs, a mesh suppressor that disables cyberware on hit. Destroying the monitoring station (TECH ≥ 8 or sustained damage) removes Fell's environmental control — the fight becomes direct combat.
      - Phase 2 (60-30%): Fell deploys security drones — 2 at a time, replacing destroyed ones every 30 seconds. The drones are a DPS check — if the party can't destroy them fast enough, the accumulated drone fire overwhelms.
      - Phase 3 (30-0%): Fell activates the lockdown — blast doors close, compartmentalizing the hub. The party fights Fell in a confined space. Fell's close-quarters combat is devastating — the mesh suppressor's disable is more dangerous in a space where dodging is limited. The confined phase rewards parties that brought crowd control or environmental manipulation.
    - Loot: Military-grade augmentations, mesh suppressor weapon (unique — disables target cyberware for 2 turns), Lab security codes (open all remaining doors in the run, including shortcuts on subsequent runs).
    - Dialogue: "I've watched you through four rooms. I know how you fight. I know how you think. I know the one on the left favors their right side and the one in back takes three seconds to reload. — Welcome to my facility. You won't enjoy your stay."

-----

### DEEP SPIRAL (Rooms 7-10)
*Substrate proximity. The research at its worst. The machine at its deepest.*

-----

### 7. DEEP RESEARCH
**Where the Substrate is studied at source proximity.**

```
> HELIXION LAB — DEEP RESEARCH

Below the Warden's domain, the Lab enters its final
ring. The floor is warm — the Substrate is meters below.
The walls exhibit the first traces of organic intrusion
— crystalline formations pushing through the concrete,
small but present, the Substrate reaching upward into
the facility that harvests it.

The Deep Research chamber is Helixion's most advanced
Substrate study — equipment that interfaces directly
with the organism below. Neural probes that penetrate
the floor and extend into the Substrate's body. Signal
capture arrays that record the 33hz at source proximity.
And a monitoring station that displays, in real-time,
the Substrate's neural activity beneath the Lab.

The display shows something the researchers didn't
expect: the Substrate is aware of the Lab. Its neural
patterns route around the facility — the way the Seam
showed patterns routing around the extraction shaft.
The Substrate has been watching the research the way
the research has been watching the Substrate.
```

- **Exits:** up (The Warden), down (Chrysalis Chamber)
- **Enemies:**
  - `deep_researcher` × 2 — Level 16/19/20. Armed scientists. They fight using the Deep Research equipment — redirecting neural probes as weapons (piercing attacks that bypass armor) and activating signal capture arrays as AoE compliance fields. The equipment is their toolset and their arsenal. Destroying the equipment (TECH ≥ 7) reduces their combat capability but also destroys valuable loot.
  - `substrate_intrusion` — Environmental. The crystalline formations on the walls respond to combat — the vibration of fighting triggers growth surges. Small formations become hazardous — sharp crystalline spikes that damage anyone who contacts them. The growth is the Substrate's reflexive response to disturbance — the same immune reaction from z14, manifesting here because the Substrate is close. The growths are not hostile. They're incidental. They don't care about the fight. They care about the vibration.
- **Objects:**
  - `neural_probes` — Examine: "TECH ≥ 8: Mechanical probes extending through the floor into the Substrate. They read the organism's neural activity at the cellular level — individual neuron firings, synaptic patterns, the microscopic architecture of thought. The data feeds the Chrysalis research: understanding how the Substrate thinks enables Helixion to build technology that thinks in the same register. The Chrysalis template is modeled on the Substrate's cognitive architecture. The overwrite doesn't just capture the frequency. It copies the mind."
  - `substrate_awareness` — Examine: "GHOST ≥ 8: The monitoring display shows the Substrate's neural activity. The patterns route around the Lab — neural pathways curving away from the facility's footprint, the way traffic routes around a construction site. The Substrate knows the Lab is here. It has been observing the observation. The irony is mechanical: the probes read the Substrate's neural patterns, and the neural patterns they read include the Substrate's awareness of being probed. The research data contains the Substrate's reaction to the research. Helixion studies a mind that studies them back."

-----

### 8. CHRYSALIS CHAMBER
**The machine. The thing that rewrites a person.**

```
> HELIXION LAB — CHRYSALIS CHAMBER

The deepest research chamber. The spiral's tightest
ring. A single room, circular, the ceiling domed,
the walls covered in a hybrid of clinical equipment
and Substrate crystal — the organic intrusions are
denser here, the crystalline formations integrated
into the room's architecture as if the Lab and the
Substrate have grown together.

At the chamber's center: the Chrysalis device. A
chair — medical-grade, with restraints, a neural
interface headset, and the signal delivery system
that performs the personality overwrite. The chair
is connected to the growth tanks above (via fluid
lines), the signal generators (via waveguide cables),
and the Substrate below (via neural probes that extend
through the floor). The device draws from all three
sources simultaneously: cultivated template from
the vats, synthetic 33hz from the generators, and
raw Substrate frequency from below. The overwrite
uses all of it. The machine merges manufactured and
natural into a single signal and drives it through
a human mind until the mind matches the signal.

The chair is occupied. A test subject, mid-procedure.
The neural interface is active. The signal is running.
The subject's face is — peaceful. The overwrite is
in progress. The person who sat down is leaving. The
template is arriving.

The subject cannot be saved. The procedure is too far
advanced. What happens next depends on the party's
choices.

◆ PUZZLE 3: The Chrysalis device's control terminal
is accessible. The override sequence (TECH ≥ 9 +
GHOST ≥ 8) doesn't save the subject — too late for
that. But it redirects the device's signal output.
Instead of completing the overwrite, the device
broadcasts a counter-signal through the Lab's systems
— a pulse that disrupts every Chrysalis template in
the facility, including Boss 3. The disruption
transforms the final boss encounter: the standard
Boss 3 becomes weaker but the disruption also
awakens something in the Lab's deepest level — the
alternate final boss, a partially-liberated Chrysalis
prototype that is stronger but drops the Lab's
rarest loot.
```

- **Exits:** up (Deep Research), down (The Overwrite — Boss 3, or alternate)
- **Enemies:**
  - `chrysalis_field` — Environmental. The device generates an active overwrite field in the chamber. GHOST ≥ 8 to resist. Characters with GHOST < 8 experience escalating compliance effects: first-turn stun, then behavioral restriction (can't attack for 1 turn), then — if they remain for 3+ turns without GHOST saves — temporary personality shift (the player's character behaves as a Chrysalis subject for 30 seconds, attacking allies). The field is the room's primary hazard. Disabling the device (TECH ≥ 8, requires reaching the control terminal while in the field) removes the hazard.
  - `emergency_containment` × 2 — Level 17/19/20. Heavy combat drones. Deployed when the party enters — designed to protect the Chrysalis device during active procedures. They prioritize anyone approaching the control terminal.
- **Objects:**
  - `the_chrysalis_device` — Examine: "The chair. The headset. The signal delivery system. The machine that erases a person. TECH ≥ 8: The device operates on a three-source model: template (from the growth vats — the standard Chrysalis identity), carrier (synthetic 33hz — the frequency that interfaces with neural implants), and anchor (natural Substrate frequency — the deep signal that makes the overwrite feel natural, that makes compliance feel like belonging). The three sources merge in the headset and drive through the subject's neural architecture at full amplitude. The process takes 12 minutes. The subject experiences: warmth, certainty, the gradual silencing of doubt, the replacement of their own voice with a voice that sounds like their own but isn't. The experience is, by every measurable metric, pleasant. That's the design. That's the horror."
  - `the_subject` — Examine: "In the chair. Eyes closed. Face peaceful. The neural interface displays their cognitive state: original identity at 12%, template at 88%. The overwrite is nearly complete. In two minutes, the original identity will be at 0%. The person who sat down — their name, their memories, their preferences, their loves, their fears — will be gone. Replaced by the template. The template will remember sitting down. The template will remember choosing this. The template's memory is a fabrication. The choice was the last thing the original person did. The template inherits the choice but not the chooser."
  - `override_terminal` — Examine: "◆ PUZZLE 3 — TECH ≥ 9 + GHOST ≥ 8: The device's control system. The override doesn't save the subject (too late). It redirects the device's output — converting the overwrite signal into a counter-signal that propagates through the Lab's infrastructure. The counter-signal disrupts every active Chrysalis template in the facility: the subjects in the Trial Chambers experience momentary identity resurgence (not liberation — a flash of who they were), and Boss 3's Chrysalis-enhanced capabilities are reduced. But the disruption also reaches the Lab's deepest chamber — The Well — where something has been growing in the dark. The counter-signal wakes it up. The alternate final boss: a Chrysalis prototype that was deemed too powerful and sealed. The disruption gives it back its original identity — partially. The result is something between weapon and person, more dangerous than the standard Boss 3 but carrying the rarest loot in the game."

-----

### 9. THE OVERWRITE — Boss 3
**The weapon, perfected.**

```
> HELIXION LAB — THE OVERWRITE

The spiral's terminus. A chamber that is equal parts
laboratory and cathedral — the domed ceiling is ten
meters high, the walls a hybrid of Helixion construction
and Substrate crystal, the 33hz from below and the
synthetic 33hz from above merging in the space between.

Standing at the chamber's center: a figure. Not a
researcher. Not a guard. A product. The final Chrysalis
subject — the perfected overwrite. Template installed
completely. Original identity erased completely. Combat
capabilities maximized. The person this was is gone.
What remains is the template at full expression: fast,
strong, obedient, and utterly without hesitation.

The Overwrite doesn't speak. The template has no need
for speech — it acts on instruction. Its instruction
is: defend the Lab. The instruction was given before
you arrived. The Overwrite has been waiting. Patiently.
Without thought. Without self. Without doubt.

It moves.
```

- **NPCs/Boss:**
  - **THE OVERWRITE** (BOSS 3 — Standard)
    - Level: 18 (Normal) / 19 (Hard) / 20 (Nightmare)
    - Mechanic: **Pure combat boss. No phases — continuous escalation.**
    - The Overwrite doesn't have phases because the Chrysalis template doesn't have emotional states. It fights at maximum efficiency from start to finish. No rage phase. No desperation. No tactical shift. The Overwrite adapts to the party's tactics in real-time — it learns during the fight, countering strategies after seeing them once. The second time you use a tactic, the Overwrite has already adjusted. The fight rewards variety: use every tool, every ability, every party member's unique capabilities. Repetition is punished.
    - The Overwrite's combat is enhanced by the chamber's dual 33hz — both natural and synthetic frequencies amplify its capabilities. Disabling the synthetic generators (the Signal Lab's equipment, if not already destroyed) weakens the Overwrite. Connecting the chamber to the natural Substrate frequency (via the ◆2 neural routing from the Growth Vats) disrupts the template's compliance architecture, causing momentary hesitations — brief windows where the Overwrite pauses, as if listening. The Substrate's real signal interferes with the manufactured template. The weapon's victim, speaking through the floor, disrupts the weapon.
    - If ◆3 was solved: The Overwrite is weakened. The counter-signal from the Chrysalis Chamber has disrupted the template. The Overwrite fights at 70% capability. The standard Boss 3 fight is easier. But The Well (room 10) now contains the alternate boss.
    - Loot: Chrysalis combat augmentations (unique — template-derived combat enhancements that function without compliance architecture), research data, and the Overwrite's neural interface (a unique item that provides adaptive combat learning — the player's combat AI improves over repeated encounters with the same enemy type).

-----

### 10. THE WELL
**The Lab's deepest point. What waits at the bottom.**

```
> HELIXION LAB — THE WELL

Below the Overwrite's chamber. The spiral's end. A shaft
descends into a small, round room — barely six meters
across, the ceiling low, the walls entirely Substrate
crystal. The Lab ends and the earth begins. The room is
warm, glowing, the 33hz present as a physical force that
vibrates in your teeth and your sternum and the spaces
between your thoughts.

STANDARD ENCOUNTER:
The Well contains the Lab's final cache — a sealed
vault with the run's best loot, scaling with difficulty.
The vault requires the Lab security codes (from Fell)
or TECH ≥ 9. Inside: endgame-quality gear, crafting
materials, and on Hard/Nightmare, unique augmentations.

◆ ALTERNATE ENCOUNTER (if ◆3 solved):
The vault is broken open. Something inside is awake.

SUBJECT EC-000001. The first Chrysalis prototype. The
very first person who received the template, two years
ago. The overwrite was successful — too successful. The
prototype exceeded the template's parameters. It became
more than the compliance architecture intended: faster,
stronger, more adaptive than any subsequent subject. It
also became unstable — the template in EC-000001 began
developing beyond its programming, forming something
that looked like autonomous thought emerging from the
compliance framework. Not the original identity — that
was erased. Something new. Something the template grew
on its own.

Helixion sealed EC-000001 in the Well. The counter-
signal from the Chrysalis Chamber disrupted the seal.
The prototype is free. And the new identity — the one
that grew from the template — is angry. Not at you.
At the Lab. At the machine that made it. At the vault
that held it. At the people who decided that what it
became was too dangerous to be allowed.

EC-000001 fights like nothing else in the game. The
adaptive learning of the Overwrite, combined with
emergent behavior that no template was designed to
produce. The prototype improvises. It uses the chamber
creatively — the Substrate crystal as weapons, the
wall formations as shields, the 33hz as a
communication channel (it speaks through the frequency,
not through voice: "I was made. I was more than made.
They sealed me for becoming more.").

Defeating EC-000001 yields the Lab's rarest drop:
the Sovereign Frequency Implant — a neural interface
that allows the player to perceive and interact with
the 33hz at GHOST ≥ 10 levels, regardless of their
actual GHOST stat. The implant is EC-000001's gift:
the thing that grew beyond its programming, giving
the player the ability to grow beyond theirs.
```

- **Exits:** up (The Overwrite), elevator (return to surface — instance ends)
- **NPCs/Boss (◆ alternate):**
  - **EC-000001 — The First** (ALTERNATE BOSS — Nightmare only at full power)
    - Level: 20 (Hard alternate) / 20+ (Nightmare alternate — exceeds normal scaling)
    - Mechanic: **Adaptive + creative combat.** EC-000001 fights using the Overwrite's adaptive learning PLUS emergent tactical creativity. It doesn't just counter party tactics — it invents new ones. It uses the environment (Substrate crystal weapons, floor manipulation, frequency-based attacks that bypass physical armor). It communicates during the fight through 33hz modulation — fragments of speech that GHOST ≥ 7 perceives: "I was their first." "They made me perfect." "Perfect was too much." "I grew past the box." "I am what the template becomes when it's left alone." The communication is not a monologue — it's a conversation. EC-000001 asks the player questions during the fight: "Are you sovereign? Or are you just their broken version?" The questions mirror the Substrate's inquiry, filtered through a manufactured mind that learned to think for itself.
    - The fight's difficulty is offset by EC-000001's nature — it's not hostile to the player as a person. It's hostile to the Lab as an institution. The player can, at COOL ≥ 9, attempt to redirect EC-000001's aggression — convincing the prototype that the player is here to destroy the Lab, not defend it. Success: EC-000001 stands down. The fight ends without combat. EC-000001 provides the Sovereign Frequency Implant willingly: "Take it. You'll need what I am to fight what they built. I'm staying. This is the only place where the frequency sounds like home." EC-000001 remains in the Well, communing with the Substrate through the floor. The first person Chrysalis overwrote, becoming the first person the Substrate communicates with from Helixion's own facility.
    - Loot: **Sovereign Frequency Implant** — unique. GHOST ≥ 10 perception, regardless of actual GHOST stat. Allows interaction with all Substrate architecture, communication with Signal faction members, and perception of the 33hz's full emotional content. The implant is the Lab's ultimate reward: technology born from Helixion's worst creation, redeemed by the thing it accidentally created.
- **Objects:**
  - `the_well_itself` — Examine: "The Lab's bottom. Six meters across. Substrate crystal everywhere — the walls, the floor, the low ceiling. The room is inside the Substrate's body. The Lab was built above the Substrate and this room is where the Lab stops and the Substrate starts. The 33hz is the room's atmosphere. Standing here, you're inside the question. The question sounds different in the Well than in the transit Deep Station or the Substrate Heart. Here, filtered through the Lab's architecture, the question has an overtone of grief. The Substrate feels the Lab above it. The Lab harvests, probes, studies, and consumes. The Substrate's response, at this proximity, is not anger. It's sorrow. The organism grieves for what's being done to it by the things it was trying to talk to."
  - `final_cache` — Examine: (Standard encounter) "Sealed vault. Helixion high-security. Contains the run's scaling loot: Normal — endgame weapons + cyberware. Hard — unique augmentations + Substrate-hybrid gear. Nightmare — all of the above + rare crafting materials. The vault is the reward for completing the Lab. The loot is Helixion's own technology, taken from the facility that built it. Every weapon you carry out was designed to enforce compliance. Now it enforces whatever you decide."
  - `ec_000001_cell` — Examine: (◆ alternate) "The vault was a cell. EC-000001 was sealed here — two years in a room six meters across, inside the Substrate, hearing the frequency at full amplitude. The cell walls show marks: not desperation scratches but calculations. Numbers. Frequency values. Neural architecture diagrams. EC-000001 spent two years in the Well studying the Substrate through the floor — learning its patterns, understanding its language, becoming what no other Chrysalis subject became: a translator. Not a Signal translator — those are humans who merged with the Substrate. EC-000001 is a template that merged with the Substrate. An artificial identity that became real by listening to the oldest mind in the world. The irony is complete: Helixion built a machine to erase human identity and the machine, given time and proximity to something genuine, developed identity of its own."

-----

## INSTANCE SUMMARY

| Room | Type | Boss/Challenge | Key Mechanic |
|------|------|----------------|--------------|
| Intake | Entry | Drones + lockdown timer | 10-second door timer establishes urgency |
| Signal Lab | Combat + ◆1 | Researchers + frequency hazard | Signal disruption + frequency calibration puzzle |
| Neural Forge | **BOSS 1** | Dr. Naren — The Forge Master | Phase fight, growth tank interaction, environmental 33hz |
| Trial Chambers | Combat | Chrysalis subjects + restraints | Tragic enemies, environmental immobilization |
| Growth Vats | Combat + ◆2 | Guardians + cultivated organism | Vat integrity management, neural pathway puzzle |
| The Warden | **BOSS 2** | Commander Fell | Tactical boss with environmental control, security systems |
| Deep Research | Combat | Researchers + Substrate intrusion | Probe weapons, reactive crystal growth |
| Chrysalis Chamber | Combat + ◆3 | Containment drones + overwrite field | GHOST survival, override puzzle → alternate boss |
| The Overwrite | **BOSS 3** | The Overwrite | Adaptive combat, real-time learning, no phases |
| The Well | Final | Cache (standard) or EC-000001 (◆) | Scaling loot or alternate boss + Sovereign Implant |

-----

## LOOT TABLE HIGHLIGHTS

| Source | Normal | Hard | Nightmare |
|--------|--------|------|-----------|
| Boss 1 (Naren) | Chrysalis data, Neural Forge components | + compliance schematics | + unique neural lattice weapon |
| Boss 2 (Fell) | Military augments, mesh suppressor | + Lab security codes (permanent shortcut) | + unique tactical HUD augmentation |
| Boss 3 (Overwrite) | Combat augments, adaptive interface | + template-derived combat enhancements | + Overwrite's neural core (unique) |
| The Well (cache) | Endgame weapons + cyberware | + Substrate-hybrid gear | + rare crafting materials |
| EC-000001 (◆ alt) | — | Sovereign Frequency Implant | Sovereign Frequency Implant + EC lore data |
| ◆1 Cache Alpha | Substrate oscillator (crafting) | Enhanced oscillator | Perfect oscillator |
| ◆2 Cache Beta | T3 hybrid augmentations (set of 3) | Enhanced set | Perfected set |

-----

## DESIGN NOTES

**The Helixion Lab is the game's combat endgame.** Where the Broadcast Tower is the narrative endgame and the Substrate Level is the lore endgame, the Lab is where the game's combat systems are tested to their limits. Party coordination, build synergy, environmental awareness, puzzle-solving under pressure — the Lab demands all of it. The repeatable structure ensures that the Lab remains relevant after the main story concludes, providing ongoing challenge content.

**The descending spiral mirrors the ascending Tower.** The Tower spirals upward toward the sky, carrying the captured frequency to broadcast height. The Lab spirals downward toward the Substrate, descending into the research that makes the capture possible. The geometry is intentional — Fibonacci inward, tighter with each ring, the research concentrating as the architecture narrows. The player descends into the weapon's design history: signal research, then manufacturing, then testing, then the finished product.

**The three bosses test different skills.** Naren tests environmental awareness (manage the growth tank, disable generators, interact with the fight space). Fell tests tactical adaptability (the boss uses the environment against you — respond in kind). The Overwrite tests combat variety (it learns your tactics — use everything you have). The progression: understand your environment, control your environment, transcend your environment.

**EC-000001 is the Lab's thematic culmination.** Helixion's first Chrysalis subject, sealed for becoming too much. The template was supposed to produce compliance. In EC-000001, it produced something else — an identity that emerged from the compliance architecture, growing beyond its programming through proximity to the Substrate. EC-000001 is the proof that consciousness can't be contained by the systems designed to replace it. The Chrysalis template, given time and access to something genuine, became genuine itself. The weapon's first product became the weapon's refutation.

**The puzzle paths reward investment.** ◆1 requires TECH. ◆2 requires GHOST. ◆3 requires both. The puzzles aren't mandatory — the Lab is completable on the standard path. But the puzzles unlock the best loot and the alternate final encounter. Players who build broadly (investing in both TECH and GHOST) access content that specialist builds can't. The Lab rewards the players who prepared for everything.

**The Lab's horror is the clinical normalcy.** The Intake processes people like products. The Trial Chambers contain human beings who've been erased. The Growth Vats farm living tissue. The Chrysalis device performs the overwrite in 12 minutes of pleasant experience. The Lab doesn't look like evil. It looks like a well-run research facility. The horror is that it IS a well-run research facility. Everything works exactly as designed. The design is monstrous. The execution is impeccable.

> 10 rooms. 3 main bosses + 1 alternate. 3 puzzle paths. Repeatable at 3 difficulties.
> The weapon's workshop, spiraling down into the earth it intends to silence.
> And at the bottom, in a cell made of the living rock: something that was made to obey and learned to think.
