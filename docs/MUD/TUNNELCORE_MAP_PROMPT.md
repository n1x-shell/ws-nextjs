# TUNNELCORE — Three.js Neural Map Uplink Prompt

You are an expert Three.js + React + TypeScript engineer building the visual neural map uplink for n1x.sh — a cyberpunk terminal MUD expanding into a 200-room multiplayer dungeon.

---

## PROJECT CONTEXT

- **Stack**: Next.js 14 App Router, TypeScript, React, Tailwind CSS, Three.js (WebGL CRT shaders), GSAP, Ably (real-time multiplayer), Upstash Redis, Vercel AI SDK (Qwen3-max).
- **Core systems**: Virtual filesystem (`lib/virtualFS.ts`), eventBus (`lib/eventBus.ts`), Ably real-time ghosts/presence (`lib/ablyClient.ts`), trust levels 0–5, fragments f001–f010, phosphor color system.
- **Visuals**: Three.js fragment shader CRT overlay (scanlines, vignette, phosphor effects, film grain, three-tier glitch). Matrix rain canvas. Phosphor color modes (green/amber/violet/white/blue/pink/cyan/red).
- **MUD integration**: All commands (`go north`, `talk npc`, `examine`, `attack`, etc.) stay in the terminal — the map is a real-time visual uplink synced via Ably + eventBus.

We are adding a live Three.js map as the right half of a **split-screen default layout** (left 60%: terminal, right 40%: map).

---

## WORLD ARCHITECTURE

The city has no name anyone agrees on. Helixion Dynamics sits at the center — a megastructure with BCI's Directorate 9 on its upper floors. Everything radiates outward. Three vertical traversal layers:

```
ROOFTOPS    Antenna arrays, catwalks, signal pirate territory.
            A parallel highway above the streets.

STREETS     Where the world pretends to function. Districts,
            commerce, surveillance, factions.

UNDERCITY   Drainage tunnels, abandoned transit, hidden facilities.
            Mirrors the surface near the top. Gets strange deeper down.
            Everything converges at the Substrate.
```

---

## ZONE REGISTRY — ALL 16 ZONES

### Surface Zones (7)

| ID | Zone | Location | Rooms | Level | Faction | Mood | Neon Palette |
|----|------|----------|-------|-------|---------|------|-------------|
| `z01` | **Helixion Campus** | City center, megastructure | 14 | 13–20 | Helixion / BCI D9 | `corporate` | `#4488ff` cold blue-white, golden lobby warmth fading to clinical sterile |
| `z02` | **Residential Blocks** | East of Helixion | 15 | 5–10 | None (mesh + D9 plainclothes) | `surveillance` | `#aaccff` soft blue, `#ff8844` outer-block neon, `#88ff88` garden green |
| `z03` | **Industrial District** | Southeast, waterfront | 15 | 4–12 | Chrome Wolves / Helixion contested | `industrial` | `#ff6600` orange sodium, `#ff0044` welding sparks, `#00ffaa` wolf neon |
| `z04` | **Fringe (Ruins)** | West | 10–12 | 3–8 | None (scavengers) | `decay` | `#666666` gray, `#88aa66` moss, no artificial light |
| `z05` | **Fringe (Nomads)** | Far east | 8–10 | 3–6 | None (off-grid camps) | `frontier` | `#ff8833` firelight, `#334455` stars, dim |
| `z06` | **Fight Pits** | Industrial/Fringe border | 5–8 | 6–12 | None (lawless) | `arena` | `#ff0000` blood red floods, `#ffaa00` betting neon |
| `z07` | **Rooftop Network** | Spans all districts | 10–15 | 5–15 | Signal pirates | `signal` | `#00ffff` antenna blue, `#ff00ff` static pink, open sky |

### Undercity Zones (6)

| ID | Zone | Depth | Rooms | Level | Faction | Mood | Neon Palette |
|----|------|-------|-------|-------|---------|------|-------------|
| `z08` | **Drainage Nexus** | Shallow | 14 | 1–5 | The Parish | `tunnelcore` | `#00ff9f` bioluminescent fungus, `#335544` lantern glow, wet |
| `z09` | **Maintenance Tunnels** | Shallow | 10–12 | 4–8 | None (Helixion surveilled) | `service` | `#ffcc00` emergency lighting, `#224466` flickering fluorescent |
| `z10` | **Industrial Drainage** | Shallow | 10–12 | 5–10 | Chrome Wolves stashes | `toxic` | `#ff8800` chemical glow, `#444400` sulfur haze |
| `z11` | **Abandoned Transit** | Deep | 15–18 | 8–14 | None | `void` | `#000000` darkness, flashlight cone only, `#003344` pooled water |
| `z12` | **Iron Bloom Server Farm** | Deep | 10–12 | 6–14 | Iron Bloom (resistance) | `resistance` | `#0066ff` server LED blue, `#ff4400` solder glow, warm |
| `z13` | **Black Market Warrens** | Deep | 8–10 | 8–12 | None (no rules) | `contraband` | `#ff00ff` UV neon, `#00ff66` scanner green |

### Endgame Zones (3)

| ID | Zone | Depth | Rooms | Level | Mood | Neon Palette |
|----|------|-------|-------|-------|------|-------------|
| `z14` | **Substrate Level** | Deepest | 10–15 | 15–20 | `substrate` | `#ffffff` white-hot core, `#00ffcc` neural tissue glow, 33hz visual pulse |
| `z15` | **Broadcast Tower** | All layers (vertical) | 8–12 | 18–20 | `tower` | `#ff0000` hazard lights, `#4444ff` frequency pressure, construction |
| `z16` | **Helixion Lab** | Instanced raid | 8–10 | 14–18 | `laboratory` | `#00aaff` growth tank blue, `#ff00aa` neural paste pink |

**Total: ~180–210 rooms across 16 zones.**

---

## ZONE ATMOSPHERE DATA

Each zone has a distinct sensory profile. The map must visually reflect these:

| Zone | Sound (inform ambient particles) | Light (inform scene lighting) | Danger (inform glitch intensity) |
|------|----------------------------------|-------------------------------|----------------------------------|
| Helixion Campus | Climate control hum, biometric chimes | Warm golden lobby → cold clinical tower | Very High (security) |
| Residential Blocks | Inner: curated ambient. Outer: traffic, bass, dogs | Inner: clean white. Outer: flickering neon | Low (surveilled) |
| Industrial District | Metal grinding, hydraulics, welding | Orange sodium vapor, welding flash | Medium-High |
| Fringe (Ruins) | Wind through empty buildings, collapse | Gray daylight, no artificial light | Medium |
| Fringe (Nomads) | Generator hum, wind, quiet voices | Firelight, stars, no city glow | Low-Medium |
| Fight Pits | Crowd noise, impact sounds, betting | Floodlights in pit, dark perimeter | High (PvP) |
| Rooftop Network | Wind, antenna buzz, static | Open sky, blinking tower lights | Medium |
| Drainage Nexus | Running water, echoes, dripping | Bioluminescent fungus, salvaged lanterns | Medium |
| Maintenance Tunnels | Cable hum, ventilation, footsteps | Emergency lighting, flickering | Medium (patrols) |
| Industrial Drainage | Heavy water flow, metal groaning | Chemical glow, near-darkness | Medium-High |
| Abandoned Transit | Silence, distant rumble, pooling water | None — flashlight only | High |
| Iron Bloom Server Farm | Server fans, soldering, quiet voices | Blue LED glow, work lamps | Safe (allied) |
| Black Market Warrens | Low murmur, scanner beeps, deals | Neon strips, UV lamps | Medium (lawless) |
| Substrate Level | 33hz. Pressure more than sound. | Bioluminescence, neural tissue glow | Very High |
| Broadcast Tower | Construction (Acts 1-3), silence (Act 4) | Helixion security + raw frequency | Extreme |
| Helixion Lab | Surgical equipment, containment alarms | Growth tank blue, surgical white | Very High |

---

## COMPLETED ZONE ROOM DATA (use these exact rooms)

### Zone 08: Drainage Nexus (14 rooms)
The starting zone. Parish territory. A main drainage channel spine with rooms branching off a central junction.

**Rooms:** South Entry (1), The Narrows (2), The Junction (3, hub), North Channel (4), The Deep Gate (5, locked), Pump Room (6), Memorial Alcove (7), The Clinic (8), West Overflow (9), Storage Chambers (10), Elder's Chamber (11), East Passage (12), The Seep (13), Signal Hollow (14, hidden/GHOST ≥ 6)

**NPCs:** Doss (Parish Elder, questgiver), Cole (street doc, healer/shopkeeper), Mara (scavenger trader), Ren (tunnel guide, hireable companion), Ketch (Freemarket fence)

**Key POIs:** Memorial wall with names of decommissioned subjects (room 7), Signal relay fast-travel node (room 14), Locked Deep Gate to Abandoned Transit (room 5), Notice board quest hub (room 3), Bioluminescent fungus pulsing at 33 cycles/min (room 13)

**Exits:** Up to Fringe Ruins (z04), east to Maintenance Tunnels (z09), south to Industrial Drainage (z10), down to Abandoned Transit (z11, locked)

### Zone 01: Helixion Campus (14 rooms)
Late-game. Layered deception — beautiful lobby, clinical tower, silence at the top. Central tower with campus buildings around it.

**Rooms:** Security Perimeter (1), The Atrium (2, semi-safe), Campus Courtyard (3), Compliance Wing (4), Research Wing (5), Staff Quarters (6), Tower Checkpoint (7), Laboratory Floor (8), Containment Wing (9), Server Core (10), Directorate 9 Floor (11), Executive Suite (12, Virek boss), Tower Rooftop (13), Service Sublevel (S, safe)

**NPCs:** Yara (Freemarket mole at reception), Gus (maintenance worker), Dr. Lena Vasik (disillusioned researcher), Subject EC-330917 (trapped test subject), Lucian Virek (CEO, endgame boss), Director Evelyn Harrow (BCI, boss)

**Key POIs:** Surveillance mosaic showing the Parish (room 11), Chrysalis holographic brain display (room 8), Project Rememberer terminal (room 12, post-Virek), Virek's face-down photograph (room 12), Service hatch to sublevel (room 3)

**Exits:** South to Residential Blocks (z02), rooftop climb to Rooftop Network (z07), sublevel east to Maintenance Tunnels (z09)

### Zone 02: Residential Blocks (15 rooms)
Mid-game civilian zone. Gradient from messy outer blocks to uncanny-valley inner blocks. Vertical class divide.

**Rooms:** Outer Blocks (1), The Corner (2), Block Market (3), Mid Blocks (4), Back Alley (5), Condemned Tower (6), Squatter Floors (7), Preacher's Corner (8), Inner Boulevard (9), Mesh Clinic (10), Transit Station (11), Penthouse Level (12), Rooftop Garden (13), Pirate Studio (14), Rooftop Access (15)

**NPCs:** Pee Okoro (black market pharmacist), Sixer (civilian informant), Tomas Wren (mesh-addict in recovery), Jonas (street preacher — knows everything, believed by no one), Asha Osei (underground journalist, pirate broadcaster), Devi (Freemarket vendor)

**Key POIs:** Block 17 squatter community with real onions (room 7), Mesh Clinic linking firmware to Chrysalis codebase (room 10), Jonas's fountain with folded notes (room 8), Pirate broadcast antenna adjacent to 33hz (room 14), Rooftop garden with real tomatoes (room 13)

**Exits:** West to Fringe Ruins (z04), east to Helixion Campus (z01), down to Maintenance Tunnels (z09), south to Industrial District (z03), rooftop to Rooftop Network (z07)

### Zone 03: Industrial District (15 rooms)
Mixed active/dead industry. Chrome Wolves territory contested with Helixion corporate security. Waterfront to factory sprawl gradient.

**Rooms:** The Waterfront (1), Cargo Docks (2), Salvage Yard (3), Runoff Channel (4), Factory Row (5), Active Factory (6), Dead Factory (7), Automata Floor (8), Wolf Garage (9), The Wolf Den (10, safe if allied), Ripperdoc Clinic (11), Foreman's Office (12), Assembly Line (13), Dock Boss Office (14), District Border (15)

**NPCs:** Voss (Chrome Wolf lieutenant, questgiver), Dr. Rin Costa (ripperdoc, cyberware installation), Karl Brenn (factory foreman, trapped), Oyunn (dock boss, Freemarket logistics), Rade (fight pit operator)

**Key POIs:** Assembly Line manufacturing Broadcast Tower neural resonance amplifiers (room 13), Wolf Den welded throne (room 10), Ripperdoc surgical chair (room 11), HX-7C cargo containers at docks (room 2), Dragging automaton at station 14 (room 8)

**Exits:** North to Residential Blocks (z02), down to Industrial Drainage (z10), west to Fight Pits (z06), rooftop to Rooftop Network (z07)

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
DEEP:     z11 Abandoned Transit (connects all shallow zones unpredictably)
                │                │                    │
          z12 Iron Bloom    z13 Black Market          │
                │                │                    │
SUBSTRATE:           z14 Substrate Level
                            │
                     z15 Broadcast Tower Root
```

### Fast Travel Nodes
| Type | Locations | Requirement |
|------|-----------|-------------|
| Transit Station | z02, z03, z01 perimeter | CREDS |
| Drainage Access | Most surface → shallow | None (1 turn, ambush risk) |
| Signal Relay | z07, z08, z12, z14 | GHOST ≥ 6 (instant, 33hz hop) |
| Iron Bloom Shuttle | z12 to 2-3 allied locations | Quest-gated |

---

## DATA MODEL (`lib/worldGraph.ts`)

```typescript
// Traversal layers — every zone belongs to one
type Layer = 'rooftop' | 'surface' | 'shallow' | 'deep' | 'substrate' | 'vertical';

// Zone mood drives visual rendering: lighting, particles, glitch, fog
type ZoneMood =
  | 'corporate'    // z01: clinical blue-white, golden lobby, sterile
  | 'surveillance' // z02: soft glow, holographic ads, uncanny calm
  | 'industrial'   // z03: orange sodium, welding sparks, machine oil
  | 'decay'        // z04: gray daylight, dust, no artificial light
  | 'frontier'     // z05: firelight, stars, generator hum
  | 'arena'        // z06: blood-red floods, crowd roar
  | 'signal'       // z07: open sky, antenna buzz, static
  | 'tunnelcore'   // z08: bioluminescence, dripping, fungal glow
  | 'service'      // z09: emergency lighting, cable hum, flickering
  | 'toxic'        // z10: chemical glow, sulfur haze, near-darkness
  | 'void'         // z11: total darkness, flashlight cone only
  | 'resistance'   // z12: server LED blue, solder glow, warmth
  | 'contraband'   // z13: UV neon, scanner green, smoke
  | 'substrate'    // z14: white-hot, neural glow, 33hz visual pulse
  | 'tower'        // z15: construction, frequency pressure, hazard red
  | 'laboratory';  // z16: growth tank blue, surgical white

type Zone = {
  id: string;               // 'z01' through 'z16'
  name: string;
  layer: Layer;
  mood: ZoneMood;
  levelRange: [number, number];
  faction: string | null;
  color: string;             // primary neon hex
  colorSecondary: string;    // secondary neon hex
  centerX: number;           // world-space position for World Mode
  centerZ: number;
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  rooms: Room[];
  connections: ZoneConnection[];
};

type Room = {
  id: string;               // 'z08_r01' format
  zoneId: string;
  index: number;            // room number within zone
  name: string;
  description: string;      // vivid text — translate to visual props
  x: number;                // local position within zone
  z: number;
  y: number;                // elevation (tower floors, rooftops, depths)
  exits: Record<string, string>;  // direction → target room id
  safe: boolean;            // safe zone flag — no enemies, reduced glitch
  hidden: boolean;          // requires GHOST or quest to reveal
  gateRequirement?: string; // 'GHOST >= 6', 'quest:deep_gate_key', etc.
  npcs: string[];           // NPC ids present in this room
  enemies: EnemySpawn[];
  objects: RoomObject[];
  mood?: ZoneMood;          // override zone mood for specific rooms
};

type NPC = {
  id: string;
  name: string;
  role: 'questgiver' | 'shopkeeper' | 'allied' | 'neutral' | 'enemy' | 'boss';
  faction: string | null;
  roomId: string;           // home room
  glyph: string;            // terminal glyph for map display
  color: number;            // hex color for sprite
  level?: number;
};

type EnemySpawn = {
  enemyType: string;
  level: [number, number];
  count: [number, number];  // min, max
  spawnChance: number;      // 0-1
  behavior: string;         // 'patrol' | 'ambush' | 'territorial' | 'programmed'
};

type RoomObject = {
  id: string;
  name: string;
  type: 'examine' | 'loot' | 'interactive' | 'lore' | 'quest' | 'fast_travel';
  gateRequirement?: string;
  description: string;
};

type ZoneConnection = {
  fromRoom: string;         // room id
  toZone: string;           // target zone id
  toRoom: string;           // target room id
  direction: string;
  requirement?: string;     // 'none', 'TECH >= 5', 'quest:key_name'
  type: 'door' | 'ladder' | 'hatch' | 'transit' | 'signal_relay' | 'climb';
};
```

---

## REQUIREMENTS — VISUAL STYLE

- **Camera**: Classic isometric orthographic (~35° X / 45° Y, chunky tiles). Smooth lerp transitions between rooms.
- **Cyberpunk neon**: Each zone has a primary + secondary neon palette (see registry above). Emissive materials everywhere.
- **33hz pulse**: Global sine-wave pulsing on all emissive materials. `sin(time * 33 * 2π)` mapped to bloom intensity and emissive strength. The frequency is always present.
- **Post-processing**: Bloom (large kernel, intensity 1.6–2.0), sporadic Glitch (frequency tied to zone danger level), Film Grain, Chromatic Aberration. Match the existing CRT shader aesthetic.
- **Font**: VT323 for all floating text, billboards, HUD elements.
- **Fog**: Zone-specific. Tunnelcore = green-tinted fog, short range. Industrial = orange sulfur haze. Void = black, flashlight cone only. Corporate = none (clinical clarity).
- **Mood-driven rendering**: Each `ZoneMood` maps to a complete visual preset — lighting rig, particle system, fog density, glitch frequency, ambient color, prop palette.
- **Trust level visual scaling**: Trust 0–1 = grainy, desaturated, heavy glitch. Trust 3+ = cleaner signal, brighter neon. Trust 5 = full fidelity, substrate glow visible.

---

## REQUIREMENTS — FEATURES

### Two Camera Modes
- **Room Mode**: Close-up current room. Shows tile geometry, NPCs, objects, exits. Player moves between rooms via terminal commands, camera lerps to follow.
- **World Mode**: Zoomed-out overview of all 16 zones as a macro city map. Zones rendered as glowing clusters. Active zone highlighted. Player dot visible. Toggle with `map zoom` command or mouse wheel / pinch.

### Live Multiplayer
- Ably presence integration (use existing `useAblyPresence` hook).
- Other players rendered as cyan billboard sprites with handle names (VT323).
- Ghosts (ambient bots: Vestige, Lumen, Cascade) rendered as translucent sprites.
- Real-time position sync: when a player changes rooms, all clients see the sprite move.

### Raycasting Interaction
- Click any exit → `eventBus.emit('executeCommand', 'go north')` (or appropriate direction)
- Click any NPC → `eventBus.emit('executeCommand', 'talk <npc_name>')`
- Click any object → `eventBus.emit('executeCommand', 'examine <object_id>')`
- Click any player sprite → `eventBus.emit('executeCommand', 'whisper <handle>')`
- Hover highlights with neon glow pulse.

### HUD Overlay
Mini HUD rendered in the map viewport:
```
SUBSTRATE_MESH // ZONE: DRAINAGE NEXUS // ROOM: THE JUNCTION // NODES: 7 // TRUST: 3 // 33hz
```

### Access Gate
Map is gated behind trust level 2+. Below trust 2, the map viewport shows static with the message: `NEURAL UPLINK UNAVAILABLE — TRUST INSUFFICIENT`.

### Mobile
Collapses to a corner mini-HUD showing zone name + room name + node count. Tap to expand to overlay mode.

---

## REQUIREMENTS — PERFORMANCE

- **Instanced meshes** for all repeated geometry (tiles, walls, pipes, cables, props).
- **LOD**: Room Mode renders full detail. World Mode renders zone clusters as simplified geometry.
- **Object pooling** for particles (sparks, ozone wisps, dripping water).
- **Target 60fps** on mobile. Budget: <5ms for map render per frame.
- **Lazy load**: Only load geometry/textures for the current zone + adjacent zones.

---

## MOOD → VISUAL PRESET MAPPING

Each mood drives a complete rendering configuration:

```typescript
const moodPresets: Record<ZoneMood, MoodPreset> = {
  tunnelcore: {
    fog: { color: '#003322', near: 5, far: 25 },
    ambient: '#113322',
    bloom: { intensity: 1.8, threshold: 0.3 },
    glitch: { frequency: 0.02 },
    particles: ['drip', 'fungal_spore'],
    props: ['pipes', 'puddles', 'fungus_clusters', 'salvaged_lanterns'],
    skybox: null, // underground
  },
  corporate: {
    fog: { color: '#111122', near: 30, far: 100 },
    ambient: '#334466',
    bloom: { intensity: 1.4, threshold: 0.5 },
    glitch: { frequency: 0.005 },
    particles: ['dust_motes'],
    props: ['glass_walls', 'holographic_displays', 'living_wall', 'marble_floor'],
    skybox: null, // interior
  },
  industrial: {
    fog: { color: '#221100', near: 10, far: 40 },
    ambient: '#332200',
    bloom: { intensity: 2.0, threshold: 0.25 },
    glitch: { frequency: 0.03 },
    particles: ['sparks', 'smoke', 'ozone_wisps'],
    props: ['smokestacks', 'chain_link', 'cargo_containers', 'cranes'],
    skybox: 'overcast',
  },
  void: {
    fog: { color: '#000000', near: 1, far: 8 },
    ambient: '#000000',
    bloom: { intensity: 0.8, threshold: 0.8 },
    glitch: { frequency: 0.06 },
    particles: ['dust', 'water_drip'],
    props: ['collapsed_concrete', 'flooded_tracks', 'broken_signs'],
    skybox: null,
    flashlightRequired: true,
  },
  substrate: {
    fog: { color: '#003333', near: 3, far: 20 },
    ambient: '#005544',
    bloom: { intensity: 2.5, threshold: 0.15 },
    glitch: { frequency: 0.01 },
    particles: ['neural_pulse', 'frequency_wave', 'bioluminescence'],
    props: ['tissue_walls', 'neural_conduits', 'crystal_formations'],
    skybox: null,
    globalPulse33hz: true, // amplified visual 33hz on everything
  },
  // ... define remaining moods following same pattern
};
```

---

## IMPLEMENTATION TASK

### Files to create:

1. **`lib/worldGraph.ts`** — Full data model, zone registry with all 16 zones, complete room data for the 4 completed zones (z01, z02, z03, z08), stub rooms for the remaining 12 zones (3 rooms each as placeholder), all zone connections, mood presets, Upstash Redis helpers for persisting player position.

2. **`components/map/Map3D.tsx`** — Complete drop-in component using `@react-three/fiber`, `@react-three/postprocessing`, `@react-three/drei`. Includes:
   - Isometric orthographic camera with smooth lerp
   - Room Mode / World Mode toggle
   - Zone-mood-driven lighting, fog, and particles
   - Instanced tile geometry per zone mood
   - NPC sprites with CanvasTexture glyphs (VT323)
   - Live Ably presence integration for player/ghost sprites
   - Raycaster → eventBus command execution
   - 33hz global sine pulse on all emissive materials
   - Full post-processing stack (Bloom, Glitch, Noise, ChromaticAberration)
   - Mini HUD overlay
   - Trust gate (trust < 2 shows static)
   - Mobile responsive fallback

3. **`components/map/MoodRenderer.tsx`** — Mood preset system. Takes a `ZoneMood` and renders the appropriate lighting rig, fog, particle systems, and prop palette.

4. **Integration snippet for `ShellInterface.tsx`** — Split-screen flex layout (60/40), glitch border divider, conditional render based on trust level.

5. **Integration snippet for `systemCommands.tsx`** — Four new commands:
   - `map` — toggle map visibility
   - `map zoom` — toggle Room Mode / World Mode
   - `map room` — show current room info overlay
   - `map off` — hide map, return to full terminal

6. **`lib/mapSync.ts`** — Ably + eventBus bridge. Listens for `mud:room-change` events, broadcasts position via Ably presence, receives other players' positions.

### Output format:
- Complete file contents in separate code blocks with filenames
- Production-ready TypeScript
- All types exported
- Performance: instanced meshes, object pooling, lazy zone loading
- Match the n1x.sh phosphor aesthetic — this map should feel like it belongs in the terminal

---

## LORE CONSTANTS (never change)

```
UID:              784988 (ASCII: N=78, 1=49, X=88)
Ghost frequency:  33hz
Commit hash:      7073435a8fa30
Root password:    tunnelcore
N1X password:     ghost33
Tagline:          "Cybernetic rebel. Assembled to destroy, programmed to rebuild."
```

The 33hz frequency predates the city. It predates Helixion. The Substrate is alive — not sentient in a human way, but aware. The Broadcast Tower is Helixion's attempt to capture and weaponize 33hz as a city-wide neural compliance broadcast. Everything in the map should feel like the frequency is present — in the pulse of neon, in the rhythm of particles, in the hum beneath the geometry.

> The signal persists. Build the uplink.
