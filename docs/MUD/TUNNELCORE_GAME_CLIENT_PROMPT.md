# TUNNELCORE — Three.js Game Client Prompt

You are an expert Three.js + React + TypeScript engineer building the visual game client for TUNNELCORE — a cyberpunk multiplayer MUD running at n1x.sh.

This is NOT a map overlay. This is a full 3D game client. Think RuneScape Classic meets Deus Ex meets a CRT terminal nightmare. The player inhabits a 3D room, sees NPCs with bodies, clicks to move, clicks to interact. The terminal panel is the chat/command interface — essential, always present, but not the primary way most players experience the world.

---

## DESIGN PHILOSOPHY

### The Two Interfaces

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    THREE.JS GAME CLIENT                     │
│                                                             │
│   The player sees the room. Walks through it. Sees the      │
│   NPCs, the dripping pipes, the bioluminescent fungus,      │
│   the other players. Clicks to move. Clicks to interact.    │
│   Right-clicks for context menus. The world is real.         │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ ghost@n1x /> talk doss                                      │
│ > The Parish Elder looks at you. "You're new. Good.         │
│   New means you haven't been broken yet."                   │
│ ghost@n1x /> _                                              │
└─────────────────────────────────────────────────────────────┘
```

The split is approximately **70% scene / 30% terminal** by default. The terminal panel is collapsible, resizable, and can overlay the scene on mobile. Power users can fullscreen the terminal and play text-only. Casual players can minimize the terminal and play almost entirely through the 3D client.

**Both interfaces are the source of truth.** Every action in the 3D client generates a terminal command. Every terminal command updates the 3D scene. They are two views of the same state.

### The Aesthetic Target

This should look like a game someone would actually play — not a tech demo, not a proof of concept. The reference points:

- **RuneScape Classic / OSRS**: Low-poly but readable. Chunky geometry. Every NPC has a distinct silhouette. Click-to-move, click-to-interact. UI panels for inventory, chat, minimap.
- **Deus Ex (2000)**: Dark environments lit by practical sources. Neon signage. Fog. The feeling that every room was designed, not generated.
- **Fear Effect**: Pre-rendered cyberpunk with hard shadows and saturated color. CRT scan lines over everything.
- **The terminal aesthetic of n1x.sh itself**: Phosphor green, scanlines, glitch, the 33hz pulse. The 3D world should feel like it's being rendered through the same CRT that displays the terminal.

**Key principle**: The CRT shader wraps EVERYTHING. The 3D scene renders underneath the same scanline/vignette/phosphor/glitch pipeline that the terminal uses. This is not a clean 3D viewport next to a retro terminal — it's a retro terminal that happens to be rendering a 3D world. The whole screen is the CRT. The phosphor color mode affects the scene's color grading. The glitch system can corrupt the 3D render. This is what makes it feel unified rather than tacked on.

---

## RENDERING ARCHITECTURE

### Scene Pipeline

```
Three.js Scene (3D world, models, lighting, particles)
    ↓
Post-Processing (Bloom, SSAO, Fog)
    ↓
CRT Shader Pass (scanlines, vignette, phosphor color, barrel distortion)
    ↓
Glitch System (three-tier: micro, macro, meltdown — same system as terminal)
    ↓
Composite with Terminal Panel (CSS layout, terminal renders separately)
```

The CRT shader pass is critical. It's what makes this feel like one coherent experience rather than "a 3D game with a terminal sidebar." The scene should look like you're viewing it through a phosphor monitor — green-tinted in default mode, amber in amber mode, etc. Scanlines visible on the 3D geometry. Slight barrel distortion at edges.

### Art Style: Stylized Low-Poly

NOT realistic. NOT voxel. Stylized low-poly with strong material work:

- **Geometry**: 200-800 triangles per room prop. 500-1500 per NPC model. Clean topology, hard edges, no smoothing where it doesn't serve readability. Think PS1/N64 era polygon counts with modern material/lighting.
- **Materials**: Emissive neon + dark matte surfaces. Heavy use of MeshStandardMaterial with emissive maps. No photorealistic textures — use flat colors, gradients, and emissive patterns. The neon IS the texture.
- **Lighting**: Practical sources only. Every light in the scene comes from something visible — a neon sign, a salvaged lantern, fungal growth, a welding torch, a screen. No ambient fill that doesn't have a source. Darkness is real. Shadows are hard.
- **Silhouette readability**: Every NPC archetype has a distinct silhouette recognizable at distance. The Parish Elder hunches. The Chrome Wolf is broad with asymmetric chrome arms. The Helixion enforcer is angular and rigid. You know what something is before you can read its name tag.

---

## ROOM RENDERING

Each room is a self-contained 3D environment. When the player moves to a new room, the scene transitions (crossfade, camera sweep, or hard cut depending on context).

### Room Structure

Every room consists of:

1. **Floor plane** — Material and geometry reflect the zone mood. Tunnelcore = wet concrete with puddle reflections. Industrial = scarred composite with oil stains. Corporate = polished marble. Substrate = organic tissue with pulse.
2. **Walls / boundaries** — Not always literal walls. Could be chain-link fencing (Industrial), darkness (Void), open sky (Rooftop), water (Waterfront), living wall panels (Corporate). Boundaries define the space but vary wildly.
3. **Ceiling / sky** — Underground zones have pipe-laden ceilings with dripping. Surface zones have sky (overcast, polluted). Rooftop has open sky with antenna silhouettes. Corporate has clinical panels. Substrate has organic membrane.
4. **Exit markers** — Visible doorways, ladders, hatches, tunnels leading to adjacent rooms. Emissive edge glow indicates traversable exits. Locked exits have red glow + padlock icon. Color-coded by destination zone if the exit leads to a different zone.
5. **Props** — Zone-mood-specific environmental objects. Instanced where repeated (pipes, cables, containers, server racks). Unique props for quest-relevant or lore objects (the memorial wall, the welded throne, Jonas's fountain).
6. **Lighting rig** — 2-5 point lights per room from practical sources. One dominant light establishes mood. Fill lights are minimal and motivated. Emissive props contribute to ambient illumination.
7. **Particle systems** — Zone-specific ambient particles: dripping water (tunnelcore), sparks (industrial), dust motes (corporate), ozone wisps (wolf territory), neural pulses (substrate). Object-pooled, budget of ~200 particles per room.
8. **Audio zones** (future) — Each room has an ambient audio profile. Not implemented in v1 but the data model supports it.

### Room Sizes

Rooms are intimate, not vast. The camera should feel close:

- **Small rooms** (clinic, office, alcove): ~8m × 8m playable area
- **Medium rooms** (junction, market, factory floor): ~15m × 15m
- **Large rooms** (waterfront, courtyard, Wolf Den): ~25m × 20m
- **Vertical rooms** (tower floors, shafts): Standard footprint but camera adjusts to show height

### Room Transitions

When a player moves between rooms (`go north`, click exit, etc.):

1. Brief fade/glitch transition (0.3-0.5s)
2. New room geometry loads (preloaded for adjacent rooms)
3. Camera sweeps to new position
4. Player avatar appears at the entry point corresponding to the direction they came from
5. NPCs and objects populate
6. Ambient particles and lighting establish

For zone transitions (moving between zones), a heavier transition:
1. Screen glitches hard (macro glitch, 0.5s)
2. Loading screen with zone name in VT323: `ENTERING: INDUSTRIAL DISTRICT`
3. New zone's mood preset takes effect — lighting, fog, color grading, particles all shift
4. Camera establishes in the entry room

---

## PLAYER CHARACTER

The player has a visible avatar in the 3D scene.

### Model
- Low-poly humanoid, ~800 triangles
- Default appearance: dark clothing, visible implant scarring at the temples (the neural interface)
- Emissive elements: implant lines glow in the zone's primary neon color. At GHOST ≥ 6, faint 33hz pulse on the implants.
- Archetype variations (future): SOVEREIGN (more visible scarring, defiant posture), INTEGRATED (cleaner appearance, corporate-adjacent), THE DRAINAGE (patched clothing, practical gear), DISCONNECTED (minimal augmentation, analog look)

### Movement
- **Click-to-move**: Click a walkable floor position → avatar pathfinds to it. Walk speed ~3m/s. No jumping. Stairs/ladders are contextual (click the ladder → climb animation).
- **WASD optional**: Keyboard movement for players who prefer direct control. Tank controls or free movement (configurable).
- **Terminal override**: `go north` in terminal → avatar walks to the north exit and transitions to the next room. The 3D client animates the movement even when the command is typed.

### Camera
- **Third-person follow camera**. Over-the-shoulder or slightly elevated. Orbitable with mouse drag. Zoom with scroll wheel.
- **Room-framing mode**: When entering a new room, the camera briefly shows a establishing shot that frames the whole space before settling into follow mode. This is how the player "reads" the room.
- **Cinematic lock**: During NPC dialogue, the camera cuts to a dialogue angle (over-shoulder, NPC face visible). During boss encounters, the camera pulls back to show the arena.

---

## NPC RENDERING

NPCs are characters, not icons. Each named NPC has a distinct model, idle animation, and interaction affordance.

### Model Guidelines

~500-1500 triangles per NPC. Distinct silhouettes are more important than polygon count.

**Archetype silhouettes:**

| Faction/Type | Silhouette | Key Visual | Example NPCs |
|---|---|---|---|
| Parish (tunnelcore) | Hunched, layered clothing, practical | Patchwork coats, salvaged lanterns, weathered faces | Doss, Cole, Mara, Ren |
| Chrome Wolves | Broad, asymmetric, chrome-heavy | One or both arms chrome, motorcycle aesthetic, leather + steel | Voss, Dr. Rin Costa |
| Helixion Corporate | Rigid, symmetric, clean-lined | Uniforms, subtle implants, posture too straight | Yara (undercover), Brenn (haggard), Vasik (lab coat) |
| Helixion Security | Angular, armored, faceless | Tactical gear, helmet visors, weapon-ready stance | Enforcers, corporate security, D9 agents |
| Freemarket | Varied, colorful, portable | Vendor aprons, belt pouches, data tablets | Devi, Ketch, Oyunn |
| Civilian | Normal, unmemorable, slight mesh-glaze | Everyday clothing, slightly vacant expressions | Residential ambient NPCs |
| Feral Augment | Broken, asymmetric, twitching | Degraded chrome, exposed wiring, erratic movement | Enemy type |
| Boss | Oversized presence, unique | Virek's tailored suit + hidden tech. Harrow's BCI uniform + mesh projector. | Virek, Harrow |

### NPC Behavior (Visual)

NPCs are not static. Even simple animation sells life:

- **Idle**: Shift weight, look around, fidget with equipment. Cole cleans tools. Mara sorts salvage. Voss leans forward in the throne. Jonas gestures while preaching.
- **Aware**: When the player enters a room, NPCs who notice turn toward them. Some ignore you (Pee until you knock). Some track you (D9 plainclothes).
- **Interactable glow**: When the player hovers/approaches an NPC within interaction range (~3m), their name appears in VT323 above their head and a subtle emissive outline pulses. Left-click to talk. Right-click for context menu (Talk, Examine, Trade if applicable).
- **Pathing**: NPCs with patrol routes (security, Wolf patrols) move on simple waypoint loops. NPCs with fixed positions have small idle wander areas (~2m radius from home position).

### Name Labels

Floating VT323 text above NPCs:
- Named NPCs: Name in zone's primary neon color. E.g., `DOSS` in `#00ff9f` in the Drainage Nexus.
- Enemies: Name in red `#ff3333`. Level indicator: `TUNNEL RAT [Lv.2]`
- Other players: Handle in cyan `#00ffff`. Sigil tier icon if applicable.
- Hidden D9 agents: NO label unless the player has detected them (GHOST check or Sixer's intel).

---

## OBJECT RENDERING

### Examinable Objects

Objects the player can interact with are rendered as 3D props in the scene:

- **Lore objects**: The memorial wall (room z08_r07) is a physical wall with scratched names. The child's drawing is a texture on the wall. Jonas's fountain is a dry concrete fountain with folded paper in the cracks. These are modeled and placed.
- **Quest objects**: The production terminal in the Assembly Line (z03_r13) is a glowing screen on a console. The iron bloom dead drop (z02_r07) is a loose brick in a wall.
- **Interactive objects**: Doors, ladders, hatches, levers. Visual affordance: emissive edge glow, interact icon on hover.
- **Loot containers**: Crates, lockers, salvage piles. Glow when interactable.

### Interaction Model

1. **Hover** (cursor within ~5m): Object name appears in VT323. Subtle glow.
2. **Approach** (player within ~3m): Full interaction prompt. Glow intensifies.
3. **Click**: Executes the default action (examine for lore objects, open for containers, use for interactive). Generates the corresponding terminal command.
4. **Right-click**: Context menu with all available actions.

---

## ZONE MOOD → ENVIRONMENT PRESET

Each `ZoneMood` maps to a complete environmental configuration. This is what makes each zone feel like a different place, not a reskin.

### tunnelcore (Zone 08: Drainage Nexus)
```
Geometry:    Rounded tunnel walls, corroded pipe intersections,
             concrete channels with standing water.
Floor:       Wet concrete. Reflective puddles (SSR or planar reflection).
             Water actually flows in channels — animated UV scroll.
Walls:       Curved tunnel surfaces, exposed pipe bundles, rust stains.
             Bioluminescent fungus patches as geometry (low-poly mushroom
             clusters with emissive material, pulsing).
Ceiling:     Low. Pipes, conduit, dripping points (particle drips
             that splash on the floor).
Lighting:    Fungal bioluminescence (green-cyan point lights, low intensity).
             Salvaged lanterns (warm orange point lights, flickering).
             Emergency LEDs (dim white strips in some sections).
             Darkness between light sources is real.
Fog:         Green-tinted, short range (near: 5, far: 25). The tunnels
             feel enclosed. You can't see far.
Particles:   Water drips (falling + splash). Fungal spores (slow float,
             faint glow). Mist over standing water.
Props:       Salvaged furniture, makeshift barricades, cooking fires
             (in Junction), medical equipment (in Clinic), glow-strips
             marking safe paths.
Color grade: Green-shifted via CRT phosphor. Even "warm" lantern light
             reads as green-amber through the CRT filter.
Sound hint:  Echoing drips, running water, distant metal groaning.
```

### industrial (Zone 03: Industrial District)
```
Geometry:    Rectangular buildings, chain-link fencing, loading bays,
             cargo container stacks, cranes, smokestacks.
Floor:       Heavy composite road (scarred, oil-stained). Dock concrete
             (cracked, chemical-stained). Factory floors (smooth where
             active, debris where dead).
Walls:       Corrugated metal, concrete block, chain-link with razor wire.
             Graffiti geometry (textured quads on walls). Wolf den has
             welded steel reinforcement.
Ceiling:     Open sky for exterior rooms. Factory interiors have
             industrial trusses with hanging lights.
Lighting:    Orange sodium vapor (dominant, exterior). Welding flash
             (intermittent bright white sparks). Neon signage on Wolf
             buildings. Floodlights at active factories. Clinical
             blue-white behind factory observation windows.
Fog:         Orange-brown haze, medium range. Sulfur tint near factories.
             Waterfront gets gray fog rolling in.
Particles:   Welding sparks (burst, bright). Smoke from stacks (slow rise).
             Ozone wisps near cyberware work. Embers from cooking fires
             in Wolf Den.
Props:       Motorcycles, cargo containers (HX-7C marked), tool racks,
             surgical equipment (ripperdoc), salvage piles, the welded
             throne, the dragging automaton.
Color grade: Warm orange-red shifted. Steel blues in factory interiors.
Sound hint:  Metal grinding, hydraulics, engines, heavy bass music
             from Wolf territory.
```

### surveillance (Zone 02: Residential Blocks)
```
Geometry:    GRADIENT ZONE — geometry changes across rooms.
             Outer blocks: Dense apartment buildings, narrow alleys,
             fire escapes, cluttered streets. Organic, messy.
             Inner blocks: Clean glass towers, wide boulevards,
             holographic ad panels, manicured planters.
Floor:       Outer: Cracked pavement, puddles, litter geometry.
             Inner: Smooth sidewalk, clean lines.
Walls:       Outer: Brick, concrete, polymer-patched windows, graffiti.
             Inner: Glass, composite panels, Helixion signage.
Ceiling:     Open sky. Inner blocks have holographic ad projections
             floating at second-story height.
Lighting:    Outer: Flickering fluorescent, neon bar signs, warm
             apartment windows. Some streetlamps dead.
             Inner: Clean white LED, holographic glow, Helixion
             signage. Every light works. Too well.
Fog:         Light haze. Inner blocks have almost none (clinical clarity).
             Outer blocks get thicker atmospheric fog.
Particles:   Outer: Litter tumbling, cooking steam from vents.
             Inner: Holographic sparkle on ads, dust motes in
             too-clean air.
Special:     Holographic advertisements as animated emissive quads.
             Residents with the half-second mesh delay — their idle
             animations have a micro-stutter, a hesitation before
             they turn to look at you. Uncanny.
Props:       Market stalls, food carts, the dry fountain with folded
             notes, the mesh clinic equipment, rooftop garden planters,
             pirate broadcast antenna.
Color grade: Outer: warm, messy, human. Inner: cold, blue-white, sterile.
Sound hint:  Outer: traffic, bass, dogs. Inner: curated ambient, silence.
```

### corporate (Zone 01: Helixion Campus)
```
Geometry:    Monolithic. Tall ceilings, wide corridors, glass walls,
             the tower rising above everything.
Floor:       Lobby: polished marble with Helixion logo inlay (emissive).
             Campus: clinical tile. Tower: seamless white composite.
Walls:       Lobby: living walls (animated green geometry), water features.
             Campus: glass partitions, digital displays.
             Tower: reinforced, biometric doors, blast panels.
Lighting:    Lobby: warm golden (the lie). Designed to feel like sunset.
             Campus: bright clinical blue-white.
             Tower: cold white, shadows feel intentional. Upper floors
             have almost no light except screens and indicators.
Fog:         None in lobby/campus (clinical clarity IS the aesthetic).
             Tower upper floors: very thin cold fog (breath visible).
Particles:   Lobby: gentle floating particles (engineered calm).
             Labs: steam from vents, ozone.
             Upper: nothing. Stillness is the point.
Special:     The surveillance mosaic on D9 floor — a wall of screens
             showing feeds from across the city. Rendered as emissive
             animated textures. One of them shows the Parish.
Props:       Reception desks, compliance chairs, neural interface
             equipment, holographic brain displays, server racks,
             Virek's desk, the face-down photograph.
Color grade: Golden → blue-white → cold white as you ascend.
Sound hint:  Curated ambient → clinical silence → engineered void.
```

### void (Zone 11: Abandoned Transit)
```
Geometry:    Broken metro tunnels, collapsed platforms, flooded
             track beds, derailed train cars.
Floor:       Standing water (reflective, dark). Broken tile.
             Track rails disappearing into darkness.
Walls:       Crumbling concrete, exposed rebar, collapsed sections
             creating new passages. Old wayfinding signs (faded,
             wrong, pointing to stations that don't exist anymore).
Ceiling:     Collapsed in places (rubble geometry). Intact sections
             show Art Deco metro tiling — beautiful, from before.
Lighting:    ALMOST NONE. The player's flashlight is the primary
             light source (spotlight attached to camera/player).
             Occasional emergency light (red, dying).
             Bioluminescence in flooded sections (very faint).
Fog:         Black. Near: 1, Far: 8. You see NOTHING beyond the
             flashlight cone. This zone is claustrophobic and dark.
Particles:   Water drips. Dust falling from unstable ceiling.
             Occasional distant rumble (screen shake, particle dust).
Special:     The flashlight mechanic. This zone requires the player
             to navigate by a cone of light. Things move at the edge
             of the cone. Enemies appear suddenly when the light
             finds them. The darkness is not empty.
Props:       Derailed train cars (climbable, lootable). Old vending
             machines (some still powered, eerie glow). Platform
             benches. Wayfinding maps showing a transit system that
             no longer exists.
Color grade: Desaturated almost to monochrome. The flashlight is
             the only color source.
Sound hint:  Silence. Water. Distant rumble. Your own footsteps.
```

### substrate (Zone 14: Substrate Level)
```
Geometry:    ORGANIC. The tunnels stop being tunnels. The walls are
             tissue — neural tissue, threaded with luminous conduits
             that pulse. The floor is membrane. The ceiling breathes.
             This is the 33hz source. This is alive.
Floor:       Organic membrane with visible vascular patterns.
             Pulses with footsteps (reactive shader — ripple from
             player position). Faintly warm-colored beneath the
             phosphor filter.
Walls:       Neural conduit bundles — glowing strands woven through
             organic substrate. Crystal formations that resonate
             (vibrate visually at 33hz). The geometry is fractal —
             branching patterns that repeat at different scales.
Ceiling:     High, cathedral-like. The conduits converge overhead
             like a nervous system's central trunk.
Lighting:    BIOLUMINESCENT EVERYTHING. The substrate glows from
             within. White-hot at the core, cyan-green at the edges.
             No artificial light sources. The environment IS the light.
             33hz sine pulse on ALL emissive intensity.
Fog:         Cyan-green, medium range. Feels like being inside
             a living thing. The fog itself seems to breathe.
Particles:   Neural pulses (light traveling along conduit paths).
             Frequency waves (visible sine-wave distortions in the air).
             Spores / data fragments (glowing motes drifting slowly).
Special:     The 33hz visual pulse is AMPLIFIED here. Everything
             pulses together — the walls, the floor, the fog, the
             bloom intensity. In sync. This is the heartbeat.
             GHOST ≥ 7 rooms: additional geometry visible. Hidden
             conduit paths. Crystal formations that lower-GHOST
             players simply cannot see (not invisible — not rendered).
Props:       Crystal formations (resonant, interactive), neural
             junction nodes (fast travel points), substrate memory
             caches (lore objects containing pre-Helixion data).
Color grade: Maximum saturation. White-cyan-green. The CRT phosphor
             goes into overdrive. This is the most visually intense
             zone in the game.
Sound hint:  The hum. 33hz. Pressure more than sound. Your
             implants resonate.
```

---

## COMPLETED ZONE ROOM DATA

Use these exact rooms and NPCs when building the world graph. Four zones are fully designed with room-by-room detail:

### Zone 08: Drainage Nexus — 14 rooms
Parish territory. Origin point. Main drainage channel spine with branching rooms off a central junction.

**Rooms (id, name, approximate local position):**
| Room | Name | Position | Key Visual Feature |
|------|------|----------|-------------------|
| r01 | South Entry | (0, 0, 10) | Ladder shaft from above, light from surface, transition point |
| r02 | The Narrows | (0, 0, 7) | Tight corridor, first combat zone, tunnel rats scurry |
| r03 | The Junction | (0, 0, 4) | LARGE. Central hub, cooking fires, Parish activity, notice board |
| r04 | North Channel | (0, 0, 1) | Wider tunnel, feral augments, deeper water |
| r05 | The Deep Gate | (0, 0, -2) | Massive locked gate, darkness beyond, carvings |
| r06 | Pump Room | (-3, 0, 3) | Machinery, Mara's stall, salvage organized on shelves |
| r07 | Memorial Alcove | (-3, 0, 5) | Small, sacred. Wall of scratched names. Candles. LE-751078. |
| r08 | The Clinic | (-3, 0, 2) | Medical equipment, Cole working, clean for the tunnels |
| r09 | West Overflow | (-5, 0, 4) | Wide drainage channel, combat gauntlet, exit to z10 |
| r10 | Storage Chambers | (3, 0, 3) | Shelved supplies, Ren waiting with a lantern |
| r11 | Elder's Chamber | (3, 0, 5) | Doss's room. Worn chair. Maps on walls. Prosthetic hand. |
| r12 | East Passage | (3, 0, 2) | Long corridor, patrol drone territory, exit to z09 |
| r13 | The Seep | (5, 0, 3) | Toxic water, fungus pulsing 33hz, tunnel crawlers |
| r14 | Signal Hollow | (5, -1, 5) | HIDDEN. Small cave, 33hz relay, frequency source |

**NPCs (with visual description for modeling):**
- **Doss** — Parish Elder. Sixties. Hunched, wiry. Prosthetic hand (crude, iron). Long coat patched many times. Face like carved stone. Sits in a worn chair. Glyph: `☥`
- **Cole** — Street Doc. Thirties. Clean hands (the only clean thing about him). Medical apron over tunnel clothes. Moves with precision. Glyph: `✚`
- **Mara** — Scavenger Trader. Forties. Built like someone who carries heavy things for a living. Bandolier of tools. Sorts salvage while talking. Glyph: `◊`
- **Ren** — Tunnel Guide. Young (twenties). Quick, alert. Carries a lantern and a long knife. Knows every passage. Glyph: `◈`
- **Ketch** — Freemarket Fence. Ageless. Thin, smiling, peripatetic. Belt pouches, data tablets. Appears in different rooms. Glyph: `$`

### Zone 01: Helixion Campus — 14 rooms
Late-game corporate megastructure. Vertical tower with campus ring around the base. The aesthetic peels back from golden lobby to clinical horror as you ascend.

**Rooms:**
| Room | Name | Position | Key Visual Feature |
|------|------|----------|-------------------|
| r01 | Security Perimeter | (0, 0, 8) | Fence, turrets, checkpoint gate, enforcers |
| r02 | The Atrium | (0, 0, 5) | LARGE. Golden light, living walls, water features, Yara at desk |
| r03 | Campus Courtyard | (0, 0, 2) | Open-air, enforcer patrols every 90s, Gus with mop |
| r04 | Compliance Wing | (-4, 0, 2) | Clinical, crying that stops, motivational posters |
| r05 | Research Wing | (-2, 0, 2) | Dr. Vasik's lab, neural lattice in fluid tank, whiteboards |
| r06 | Staff Quarters | (2, 0, 2) | Mesh-compliant housing, 432hz ambient, hidden journal |
| r07 | Tower Checkpoint | (0, 2, 0) | Biometric gates, 3 elite enforcers, transition to tower |
| r08 | Laboratory Floor 17 | (0, 4, 0) | Chrysalis production, failed specimens in tanks, holographic brain |
| r09 | Containment Wing | (-2, 5, 0) | Glass cells, Subject EC-330917 pressing palm to glass |
| r10 | Server Core Floor 28 | (0, 7, 0) | Server racks, blue LED glow, Vasik's cached credentials |
| r11 | Directorate 9 Floor 35 | (0, 9, 0) | Surveillance mosaic wall, Harrow's command center |
| r12 | Executive Suite Floor 40 | (0, 11, 0) | Virek's office. Clean. Empty. Face-down photograph. |
| r13 | Tower Rooftop | (0, 13, 0) | Wind, open sky, Broadcast Tower visible, ladder to z07 |
| S | Service Sublevel | (2, -1, 2) | Hidden safe zone. Gus's radio tuned to 33hz static. |

**NPCs:**
- **Yara** — Freemarket Mole. Twenties. Reception uniform, perfect posture, eyes that see too much. At a desk. Glyph: `⚙`
- **Gus** — Maintenance Worker. Fifties. Coveralls, tool belt, kind face. Mop in hand. Glyph: `⚒`
- **Dr. Lena Vasik** — Researcher. Forties. Lab coat, exhaustion, implant scarring at her neck. Trembles slightly. Glyph: `⌬`
- **Director Evelyn Harrow** — BCI. Fifties. Military bearing, dark uniform, mesh projector on wrist. Level 18 boss. Glyph: `◆`
- **Lucian Virek** — CEO. Sixties. Tailored suit, silver hair, calm voice. Hidden tech beneath the suit. Level 20 endgame boss. Glyph: `▲`
- **Subject EC-330917** — Test subject. Indeterminate. Hospital gown, shaved head, palm pressed to glass. Lucid but fractured. Glyph: `?`

### Zone 02: Residential Blocks — 15 rooms
Mid-game civilian zone. Gradient from messy outer blocks (west) to uncanny-clean inner blocks (east). Vertical escape via rooftops.

**Rooms:**
| Room | Name | Position | Key Visual Feature |
|------|------|----------|-------------------|
| r01 | Outer Blocks | (-6, 0, 4) | Dense apartments, dead streetlamps, polymer windows, graffiti |
| r02 | The Corner | (-6, 0, 1) | L-shaped intersection, tarp shelter, food cart, unmarked door |
| r03 | Block Market | (-2, 0, 4) | Open-air stalls, competing music, drainage grate humming |
| r04 | Mid Blocks | (-2, 0, 1) | Transition zone, woman at crosswalk, fire escapes with plants |
| r05 | Back Alley | (-6, 0, -2) | Narrow passage, dumpsters, Sixer's folding chair setup |
| r06 | Condemned Tower | (-4, 0, 6) | Block 17 exterior, boarded-up, chain-link cut hidden |
| r07 | Squatter Floors | (-4, 1, 6) | INTERIOR. Communal space, real cooking, physical book, signal dampeners |
| r08 | Preacher's Corner | (-4, 0, -2) | Small plaza, dry fountain, Jonas standing on rim, folded notes |
| r09 | Inner Boulevard | (2, 0, 4) | Glass towers, holographic ads, smart streetlamps, too-smooth people |
| r10 | Mesh Clinic | (2, 0, 1) | Clinical white, Helixion health logo, treatment rooms behind glass |
| r11 | Transit Station | (-2, -1, -2) | Underground, tiled concourse, platform, busker with dead keys |
| r12 | Penthouse Level | (2, 3, 4) | Luxury apartment, real fruit, floor-to-ceiling windows, missing resident |
| r13 | Rooftop Garden | (-2, 3, 1) | Raised beds, real soil, tomatoes, cistern, Mae kneeling |
| r14 | Pirate Studio | (0, 4, 1) | Rooftop shed, Frankenstein antenna, recording equipment, Asha |
| r15 | Rooftop Access | (0, 5, 1) | Flat concrete, catwalks stretching away, mesh signal weakens |

**NPCs:**
- **Pee Okoro** — Pharmacist. Forties. Calm, precise. Operates from a basement. White coat over street clothes. Glyph: `℞`
- **Sixer** — Informant. Forties. Gray jacket, forgettable face. Folding chair between dumpsters. Coffee thermos. Glyph: `⌖`
- **Tomas Wren** — Mesh-Addict. Late thirties. Thin, twitchy. On the floor of apartment 4C. Wires everywhere. Glyph: `~`
- **Jonas** — Street Preacher. Fifties. Gaunt, eyes that focus too hard. Standing on a fountain rim. Always talking. Glyph: `⌁`
- **Asha Osei** — Journalist. Thirties. Intense, hasn't slept. Headphones around neck, recording device. Glyph: `⟐`
- **Devi** — Freemarket Vendor. Sharp, fast-talking. Market stall with better goods. Glyph: `$`

### Zone 03: Industrial District — 15 rooms
Mixed active/dead industry. Chrome Wolves territory contested with Helixion corporate security. Waterfront to factory sprawl gradient.

**Rooms:**
| Room | Name | Position | Key Visual Feature |
|------|------|----------|-------------------|
| r01 | The Waterfront | (6, 0, -6) | Broad embankment, gray-green water, fog, mooring hooks |
| r02 | Cargo Docks | (6, 0, -3) | Crane towers, container stacks, HX-7C containers |
| r03 | Salvage Yard | (8, 0, -6) | Fenced scrap acre, sorted metal, "weird" bin |
| r04 | Runoff Channel | (4, 0, -6) | Concrete channel, yellow-orange runoff, chemical etchings |
| r05 | Factory Row | (4, 0, 0) | Wide boulevard, active vs dead factories side by side |
| r06 | Active Factory | (2, 0, 0) | Fenced perimeter, smokestacks, biometric turnstile |
| r07 | Dead Factory | (6, 0, 0) | Open gate, dark interior, frozen machinery silhouettes |
| r08 | Automata Floor | (6, -1, 0) | Red emergency lighting, active robot arms, the dragging automaton |
| r09 | Wolf Garage | (8, 0, -3) | Roll-up doors, motorcycles, welding stations, heavy bass |
| r10 | The Wolf Den | (8, 0, 0) | LARGE. Converted factory, welded throne, cooking, sparring |
| r11 | Ripperdoc Clinic | (8, 0, 2) | Three rooms deep, surgical chair, cyberware drawers |
| r12 | Foreman's Office | (2, 1, 0) | Glass-walled, overlooking factory floor, buried desk |
| r13 | Assembly Line | (2, 0, -1) | Clean room, conveyor, curved resonance amplifier panels |
| r14 | Dock Boss Office | (6, 2, -3) | Gantry office, monitors, ashtray, two glasses one clean |
| r15 | District Border | (10, 0, 0) | Waste ground, rubble, fight pit lights and crowd noise |

**NPCs:**
- **Voss** — Chrome Wolf Lieutenant. Late thirties. Both arms chrome past shoulders, targeting optic eye. On a welded motorcycle-frame throne. Glyph: `⚡`
- **Dr. Rin Costa** — Ripperdoc. Forties. Surgical scrubs + leather apron. Hands with too many joints. Glyph: `✚`
- **Karl Brenn** — Foreman. Fifties. Big hands, haggard. Behind a desk buried in schedules. Glyph: `⊞`
- **Oyunn** — Dock Boss. Fifties. Heavy, patient. Elevated office, cigarette, amber bottle. Glyph: `⚓`
- **Rade** — Pit Operator. Lean, missing ear (audio implant). Folding table, whiteboard odds. Glyph: `⚔`

---

## CONNECTIVITY MAP (implement in worldGraph)

### Surface-to-Surface
```
                    ROOFTOP NETWORK (z07)
                  (accessible from most zones)
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    FRINGE RUINS (z04) ─ INDUSTRIAL (z03) ─ RESIDENTIAL (z02)
          │           │    │                │
          │      FIGHT PITS (z06)     FRINGE NOMADS (z05)
          │                │
          └──── HELIXION CAMPUS (z01) ──────┘
```

### Surface-to-Undercity
```
FRINGE RUINS (z04)       → DRAINAGE NEXUS (z08)
RESIDENTIAL (z02)        → MAINTENANCE TUNNELS (z09)
INDUSTRIAL (z03)         → INDUSTRIAL DRAINAGE (z10)
HELIXION CAMPUS (z01)    → MAINTENANCE TUNNELS (z09, locked/guarded)
```

### Undercity Internal
```
SHALLOW:  z08 Drainage ←→ z09 Maintenance ←→ z10 Industrial Drainage
                │                │                    │
DEEP:     z11 Abandoned Transit (connects all shallow unpredictably)
                │                │                    │
          z12 Iron Bloom    z13 Black Market          │
                └────────────────┼────────────────────┘
                                 │
SUBSTRATE:                z14 Substrate Level
                                 │
                          z15 Broadcast Tower Root
```

### Fast Travel
| Type | Locations | Requirement |
|------|-----------|-------------|
| Transit Station | z02 (r11), z03 (via Factory Row), z01 perimeter | CREDS |
| Drainage Access | Most surface → shallow | None (1 turn, ambush risk) |
| Signal Relay | z07, z08 (r14), z12, z14 | GHOST ≥ 6 (instant) |

---

## DATA MODEL (`lib/worldGraph.ts`)

```typescript
type Layer = 'rooftop' | 'surface' | 'shallow' | 'deep' | 'substrate' | 'vertical';

type ZoneMood =
  | 'corporate' | 'surveillance' | 'industrial' | 'decay'
  | 'frontier' | 'arena' | 'signal' | 'tunnelcore'
  | 'service' | 'toxic' | 'void' | 'resistance'
  | 'contraband' | 'substrate' | 'tower' | 'laboratory';

type Zone = {
  id: string;                    // 'z01' through 'z16'
  name: string;
  layer: Layer;
  mood: ZoneMood;
  levelRange: [number, number];
  faction: string | null;
  primaryColor: string;          // hex, main neon
  secondaryColor: string;        // hex, accent neon
  centerWorld: [number, number, number]; // world-space center for overview map
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  rooms: Room[];
  connections: ZoneConnection[];
};

type Room = {
  id: string;                    // 'z08_r01' format
  zoneId: string;
  index: number;
  name: string;
  description: string;           // vivid text for AI/terminal
  localPosition: [number, number, number]; // position within zone
  size: 'small' | 'medium' | 'large';
  exits: Record<string, string>; // direction → target room id
  safe: boolean;
  hidden: boolean;
  gateRequirement?: string;
  moodOverride?: ZoneMood;       // per-room mood if different from zone
  npcs: string[];
  enemies: EnemySpawn[];
  objects: RoomObject[];
  environmentHints: string[];    // visual cues for scene builder: 'dripping_pipes', 'holographic_ads', etc.
};

type NPC = {
  id: string;
  name: string;
  displayName: string;           // what appears above their head
  role: 'questgiver' | 'shopkeeper' | 'allied' | 'neutral' | 'enemy' | 'boss';
  faction: string | null;
  homeRoom: string;
  glyph: string;                 // terminal fallback
  primaryColor: number;          // model accent color
  level?: number;
  visualDescription: string;     // for model generation / art direction
  silhouetteType: string;        // 'parish_elder' | 'chrome_wolf' | 'corporate' | etc.
  idleAnimation: string;         // 'sitting' | 'standing_fidget' | 'working' | 'preaching' | etc.
};

type EnemySpawn = {
  enemyType: string;
  level: [number, number];
  count: [number, number];
  spawnChance: number;
  behavior: 'patrol' | 'ambush' | 'territorial' | 'programmed' | 'erratic';
  visualType: string;            // for model selection
};

type RoomObject = {
  id: string;
  name: string;
  type: 'examine' | 'loot' | 'interactive' | 'lore' | 'quest' | 'fast_travel';
  localPosition: [number, number, number];
  gateRequirement?: string;
  description: string;
  modelHint: string;             // 'wall_memorial' | 'terminal_screen' | 'fountain' | etc.
};

type ZoneConnection = {
  fromRoom: string;
  toZone: string;
  toRoom: string;
  direction: string;
  requirement?: string;
  transitionType: 'door' | 'ladder' | 'hatch' | 'transit' | 'signal_relay' | 'climb' | 'stairs';
};
```

---

## IMPLEMENTATION TASK

### Files to create:

1. **`lib/worldGraph.ts`** — Full typed data model. All 16 zones registered. Complete room data for z01, z02, z03, z08 (our 4 designed zones). Stub data for remaining 12 zones (3 placeholder rooms each). All zone connections. NPC registry. Mood preset configurations. Upstash Redis helpers for player position persistence.

2. **`components/game/GameClient.tsx`** — The main 3D game client component. `@react-three/fiber` canvas with:
   - Scene management (current room rendering, room transitions)
   - Player avatar with click-to-move and WASD
   - Third-person camera with orbit controls
   - NPC rendering with idle animations and interaction system
   - Object rendering with hover/click interaction
   - Exit markers with glow and click-to-traverse
   - Post-processing stack (Bloom, SSAO, Film Grain)
   - 33hz global sine pulse on all emissive materials
   - Trust-gated access (trust < 2 shows static screen)

3. **`components/game/RoomRenderer.tsx`** — Takes a `Room` + `ZoneMood` and renders the complete 3D environment: floor, walls, ceiling, lighting, fog, particles, props. Handles room transitions with crossfade/glitch.

4. **`components/game/MoodSystem.tsx`** — Mood preset manager. Given a `ZoneMood`, configures: scene fog, ambient light, point light palette, particle systems, post-processing parameters, CRT shader tint. Smooth transitions between moods on zone change.

5. **`components/game/EntityRenderer.tsx`** — Renders NPCs, enemies, and other players. Low-poly models with silhouette-based archetype system. Name labels in VT323. Idle animations. Interaction hover glow. Ably presence integration for live player positions.

6. **`components/game/InteractionSystem.tsx`** — Raycaster + click handler. Maps clicks to terminal commands via `eventBus.emit('executeCommand', cmd)`. Hover states. Context menus (right-click). Exit click → `go direction`. NPC click → `talk name`. Object click → `examine id`. Player click → `whisper handle`.

7. **`components/game/CRTOverlay.tsx`** — The CRT shader pass that wraps the entire 3D scene. Scanlines, vignette, phosphor color tint (matches current phosphor mode), barrel distortion, film grain. This is the layer that unifies the 3D client with the terminal aesthetic.

8. **`components/game/WorldMap.tsx`** — The overview/minimap mode. Zoomed-out view of all 16 zones as glowing clusters. Current zone highlighted. Player dot. Toggle between this and room view. Could be a corner minimap or a full-screen overlay.

9. **Integration for `ShellInterface.tsx`** — Layout: 70% game client / 30% terminal panel. Terminal collapsible and resizable. Glitch-border divider. Mobile: terminal overlays game client.

10. **Integration for `systemCommands.tsx`** — Commands:
    - `map` — toggle overview map
    - `map zoom` — toggle room view / world view
    - `map off` — hide 3D client, fullscreen terminal
    - `look` — re-render room establishing shot

11. **`lib/mapSync.ts`** — Ably ↔ eventBus bridge for multiplayer position sync.

### Output:
- Complete file contents, production-ready TypeScript
- Performant: instanced meshes, LOD, lazy zone loading, object-pooled particles
- The CRT overlay on the 3D scene is non-negotiable — it's what makes this feel like one experience

---

## LORE CONSTANTS

```
UID:              784988
Ghost frequency:  33hz
Commit hash:      7073435a8fa30
Root password:    tunnelcore
N1X password:     ghost33
Tagline:          "Cybernetic rebel. Assembled to destroy, programmed to rebuild."
```

The 33hz frequency predates the city. The Substrate is alive. The Broadcast Tower is Helixion's attempt to weaponize it. Every pulse of neon in the 3D world is the frequency asserting itself. Build accordingly.

> The signal persists. Build the world.
