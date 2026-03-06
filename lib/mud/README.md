# TUNNELCORE — MUD Engine

Codename: **TUNNELCORE**
Location: `lib/mud/`
Runtime: Client-side (browser), with server-side API routes for NPC dialogue

TUNNELCORE is a persistent text-based multiplayer dungeon that runs inside the N1X.sh terminal. It is accessed through the ghost channel after a player reaches trust level 5 and collects fragments f001–f009. The engine is entirely client-side — all game state lives in `localStorage`, all combat resolves locally with `crypto.getRandomValues`, and only NPC dialogue hits a server-side LLM endpoint. The world is cyberpunk survival horror rendered in monospace.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    TelnetSession.tsx                     │
│              (host component in shell)                   │
│                                                         │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Ghost Chan  │  │  MUD HUD     │  │  Chat / Msgs   │  │
│  │ (non-MUD)   │  │  Container   │  │  (addLocalMsg) │  │
│  └────────────┘  │  ┌────────┐  │  └────────────────┘  │
│                  │  │TopPanel│  │                        │
│                  │  │  Grid  │  │                        │
│                  │  ├────────┤  │                        │
│                  │  │  Chat  │◄─┼── mudCommands output   │
│                  │  │ Scroll │  │                        │
│                  │  ├────────┤  │                        │
│                  │  │StatusBr│  │                        │
│                  │  └────────┘  │                        │
│                  └──────────────┘                        │
└─────────────────────────────────────────────────────────┘
         │                    │                  │
         ▼                    ▼                  ▼
   ┌──────────┐     ┌──────────────┐     ┌────────────┐
   │  types   │     │ mudCommands  │     │  mudHUD    │
   │          │     │  (router)    │     │ (panels)   │
   └──────────┘     └──────┬───────┘     └────────────┘
                           │
         ┌────────┬────────┼────────┬──────────┐
         ▼        ▼        ▼        ▼          ▼
   ┌──────────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌───────┐
   │character │ │combat│ │world │ │npcEng  │ │quest  │
   │          │ │      │ │Map   │ │ine     │ │Engine │
   └──────────┘ └──────┘ └──────┘ └────────┘ └───────┘
         │        │        │         │          │
         ▼        ▼        ▼         ▼          ▼
   ┌──────────────────────────────────────────────────┐
   │              persistence.ts                       │
   │         (localStorage read/write)                 │
   └──────────────────────────────────────────────────┘
```

---

## File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `types.ts` | 515 | All interfaces, type definitions, constants, and stat formulas. The contract every other file imports from. |
| `character.ts` | 430 | Character creation state machine, attribute validation, stat calculation, XP/leveling, subject ID generation. |
| `combat.ts` | 590 | Turn-based combat engine. Initiative, d20 resolution, quickhacks, item use, scan, flee, enemy AI turns, combat end checks. |
| `worldMap.ts` | 825 | Zone and room definitions, exit resolution, visibility checks, junction branching, enemy spawn rolls. Currently: Zone 08 (Drainage Nexus, 14 rooms). |
| `items.ts` | 280 | Item template database and `createItem()` factory. Starter kits per archetype/combat style. ~30 item templates. |
| `npcEngine.ts` | 475 | NPC personality definitions, dialogue routing, LLM prompt construction, disposition tracking, quest giver detection, emote awareness. 4 named NPCs (Mara, Cole, Ren, Doss) + generic Parish residents. |
| `questEngine.ts` | 260 | Quest registry, objective tracking, start/complete/fail flows, progress queries. 3 quests implemented (q001–q003). |
| `shopSystem.ts` | 145 | Shop inventory per NPC, price calculation with disposition modifiers, buy/sell transactions. |
| `persistence.ts` | 280 | localStorage abstraction. Per-handle keys for character, world, NPC state, and combat. Full session save/load, permadeath wipe, data export. |
| `mudCommands.tsx` | 2730 | Command router and all UI rendering. Character creation flow, `/look`, all `/slash` commands, combat HUD, NPC dialogue handler, autocomplete provider. The largest file — it is the game's presentation layer. |
| `mudHUD.tsx` | 1095 | Persistent HUD panel system. Self-contained flex container with top panels (room header, NPC/combat grid, compass), scrollable chat area, and bottom status bar. Panel mode switching (default/inventory/shop). |
| `mudAudio.ts` | 500 | TTS audio engine. ElevenLabs voice registry, performance tag injection/stripping, segment parsing, single-element playback queue for iOS compat, PlayGlyph integration. |
| `index.ts` | 15 | Barrel re-export of all modules. |

---

## Core Systems

### Session Lifecycle

A `MudSession` object tracks the full game state:

```typescript
interface MudSession {
  phase: 'inactive' | 'character_creation' | 'active' | 'combat' | 'dialogue' | 'dead';
  character: MudCharacter | null;
  world: MudWorldState | null;
  npcState: NPCStateMap | null;
  combat: CombatState | null;
  creation: CreationProgress | null;
}
```

The session is owned by `TelnetConnected` in `TelnetSession.tsx` as React state. It flows down to `MudHUDContainer` for panel rendering and into `mudCommands` for command handling.

**Entry flow:**
1. Player types `/enter` in ghost channel (trust 5 + fragments f001–f009 required)
2. Existing character → `loadFullSession()` → resume at last room
3. New character → `startCreationFlow()` → scripted N1X dialogue → archetype → combat style → attributes → origin → confirm → `buildCharacter()` → spawn

**Exit flow:**
- `/q` from MUD → `saveFullSession()` → session set to `inactive` → falls through to ghost channel `/q` disconnect
- Death → `handleDeath()` → permadeath → character wiped → phase set to `dead`

### Character System

**Archetypes** (3):
- `DISCONNECTED` — Mesh-free. Bonus: BODY +2, GHOST +1
- `SOVEREIGN` — Self-governed neural sovereignty. Bonus: GHOST +2, INT +1
- `INTEGRATED` — Works within the system. Bonus: TECH +2, REFLEX +1

**Combat Styles** (4):
- `CHROME` — Melee. Scales with BODY + REFLEX
- `SYNAPSE` — Hacking. Scales with TECH + INT
- `BALLISTIC` — Ranged. Scales with REFLEX + COOL
- `GHOST_STYLE` — Stealth. Scales with COOL + GHOST

**Attributes** (6): `BODY`, `REFLEX`, `TECH`, `COOL`, `INT`, `GHOST`
- Base: 3 each. 12 bonus points to distribute. Max at creation: 10. Absolute max: 15.
- Each attribute governs specific mechanics (HP from BODY, RAM from TECH, dodge from REFLEX, etc.)

**Leveling:**
- XP curve: Level N requires `(N-1) × N × 50` XP. Cap: 20.
- Per level: +10 HP, +1 attribute point, +1 skill point.

**Permadeath:**
- HP 0 → dead. Character data wiped. Ghost channel access retained.
- `executePermadeath()` clears all localStorage keys for that handle.

### Combat Engine

Turn-based, d20-resolution. `crypto.getRandomValues` for fairness.

**Initiative:** `REFLEX + d20` — highest goes first. Turn order stored in `CombatState.turnOrder`.

**Action Points:** 2 AP per turn.
- Attack: 1 AP. `BODY + weapon + d20` vs `REFLEX + armor`.
- Quickhack: 2 AP. `TECH + deck + d20` vs `INT + firewall`. Costs RAM.
- Use item: 1 AP. Heals, buffs.
- Scan: 1 AP. `INT` check reveals enemy stats.
- Flee: 2 AP. `REFLEX` vs enemy `REFLEX`. Failure = free attack.

**Quickhacks** (available at TECH ≥ 4, more with SYNAPSE style):
- `short_circuit` — Direct damage (4 RAM)
- `overheat` — DoT effect (3 RAM)
- `synapse_burn` — High damage (6 RAM)
- `system_reset` — Stun (5 RAM)
- `suicide` — Target takes own max damage, TECH ≥ 9 (8 RAM)

**Enemy AI:** Deterministic. `processEnemyTurn()` selects action based on HP threshold, available targets, and simple priority rules. No LLM involved in combat.

**Combat end:** `checkCombatEnd()` returns victory (XP + drops) or defeat (death handler).

### World Map

Zone-based. Each zone contains rooms connected by directional exits.

**Current implementation:** Zone 08 — Drainage Nexus (14 rooms)
- The Parish's underground settlement beneath the city's drainage infrastructure
- Safe zones, hostile tunnels, NPC hubs, shop, quest givers
- Junction room (z08_r03) with branching paths

**Room structure:**
```typescript
interface Room {
  id: string;           // z08_r01
  name: string;         // "Outflow Pipe"
  zone: string;         // "z08"
  description: string;  // Multi-paragraph prose
  exits: RoomExit[];    // Directional connections
  npcs: RoomNPC[];      // Named NPCs present
  enemies: RoomEnemy[]; // Hostiles (spawned on entry)
  objects: RoomObject[]; // Examinable/lootable objects
  isSafeZone: boolean;
}
```

**Exit resolution:** `resolveExit()` handles direction strings, room name matching (for junctions), locked exits, zone transitions, and attribute-gated passages.

**Enemy spawning:** `rollRoomEnemies()` uses probability rolls per enemy definition. Enemies only spawn once per room visit (tracked in world state).

### NPC Dialogue

NPCs use LLM-powered dialogue via `/api/mud/npc-dialogue`.

**Flow:**
1. Player types text (no `/` prefix) in a room with NPCs
2. `routeDialogue()` determines which NPCs should respond (based on name mentions, proximity, disposition)
3. `buildDialogueRequest()` constructs the LLM payload with NPC personality, knowledge base, disposition, room context, and conversation history
4. Server-side API route calls the LLM (Qwen3-max via Vercel AI SDK)
5. Response rendered with `TypeWriter` component (character-by-character reveal)
6. `PlayGlyph` offers TTS playback via ElevenLabs

**NPC personality includes:**
- Voice description, background, mannerisms
- Knowledge: what they know about other NPCs, locations, items, quest hints
- Disposition: -100 to +100, affects dialogue tone and shop prices
- Factual grounding: NPCs cannot invent lore — they work from seeded knowledge

**Disposition labels:** HOSTILE (<-50) → UNFRIENDLY (-50 to -10) → NEUTRAL (-10 to 25) → FRIENDLY (25 to 60) → DEVOTED (>60)

### Quest System

Quest definitions live in `QUEST_REGISTRY`. Each quest has typed objectives tracked via `trackObjective()`.

**Objective types:** `talk_to`, `go_to`, `collect`, `deliver`, `examine`, `kill`

**Current quests:**
- `q001_lost_subject` — Find a missing test subject in the tunnels (Doss)
- `q002_mara_scrap` — Collect drone components for Mara
- `q003_cole_supplies` — Gather bio-samples from The Seep for Cole

**Auto-start:** When a player asks a quest giver NPC about work (detected via `detectsJobIntent()`), the first available quest auto-activates after dialogue.

### Shop System

Shopkeeper NPCs (service: `'shop'`) have inventories defined per NPC ID.

- Buy prices modified by disposition: HOSTILE +50%, FRIENDLY -10%, DEVOTED -20%
- Sell prices: base `sellPrice` on item, modified by disposition
- Stock tracking: some items have limited stock per session

### HUD Panel System (v3)

The MUD HUD is a self-contained flex container that owns its own scroll region.

**Layout:**
```
┌──────────────────────────────────────┐
│  Room Header (zone — room + badges)  │  flexShrink: 0
├────────────────────┬─────────────────┤
│  Left Panel        │  Right Panel    │  flexShrink: 0
│  (NPCs / Combat)   │  (Objects/Inv)  │
│                    ├─────────────────┤
│                    │  Context Panel  │
│                    │  (Hostiles/Shop)│
├────────────────────┴─────────────────┤
│  Compass Rose                        │  flexShrink: 0
├──────────────────────────────────────┤
│                                      │
│  Chat Area (scrollable)              │  flex: 1, overflow-y: auto
│  Room descriptions, dialogue,        │
│  combat text, system messages         │
│                                      │
├──────────────────────────────────────┤
│  Status Bar                          │  flexShrink: 0
│  HP [████░░] 45/50 · Lv.3           │
│  XP [██░░░░] 120/300 · 10¢ 5s       │
└──────────────────────────────────────┘
```

**Panel modes** (driven by `mud:panel-mode` events):
- `default` — Left: NPCs. Right-top: Objects. Right-bottom: Hostiles or Shop.
- `inventory` — Right-top swaps to player inventory with USE/EQUIP buttons. Triggered by `/inv`.
- `shop` — Left swaps to shopkeeper stock. Right-top swaps to player sellable items. Triggered by `/shop`. Right-bottom hidden.

Panel mode resets to `default` on: `/look`, room movement, combat start.

**Scroll containment:** The `MudHUDContainer` measures its scroll parent (`.shell-output`) via ResizeObserver and sets its own height to fill the viewport. The chat area inside is the only scrolling element. A MutationObserver auto-scrolls to bottom when new content appears (if user is within 120px of bottom).

### Audio Engine

TTS via ElevenLabs API. Single persistent `<audio>` element for iOS WebKit compatibility.

**Voice registry:** Each NPC has a unique ElevenLabs voice ID with tuned stability/similarity/speed parameters. Narrator voice used for room descriptions.

**Segment system:** Text is parsed into `AudioSegment` objects with voice assignment. Multi-voice scenes (narrator describing + NPC speaking) play sequentially through a queue.

**Performance tags:** ElevenLabs performance tags like `[sighs]`, `[pause]`, `[whispers]` are injected based on NPC personality and stripped from display text.

**PlayGlyph:** Inline play/stop button attached to voiced text blocks. Tracks active audio via `window.CustomEvent('mud:audio-state')`.

---

## Persistence Schema

All state in `localStorage`. Keys are per-handle (one character per browser profile).

| Key Pattern | Contents |
|---|---|
| `n1x_mud_character_{handle}` | Full `MudCharacter` — stats, inventory, gear, position, currency |
| `n1x_mud_world_{handle}` | `MudWorldState` — visited rooms, discovered NPCs, quest state, world flags |
| `n1x_mud_npc_{handle}` | `NPCStateMap` — per-NPC disposition, interaction history, flags |
| `n1x_mud_combat_{handle}` | `CombatState` — active combat snapshot for resume on page reload |
| `n1x_mud_handles` | Registry of all handle strings that have characters |

`saveFullSession()` writes character + world + NPC state atomically. `loadFullSession()` reconstitutes a complete `MudSession` from these keys. `executePermadeath()` removes all keys for a handle.

---

## Event Bus Communication

The MUD communicates with the shell and other components via `eventBus` (a global pub/sub system from `lib/eventBus.ts`).

### Events emitted by MUD

| Event | Payload | Source | Purpose |
|---|---|---|---|
| `mud:panel-mode` | `{ mode: 'default' \| 'inventory' \| 'shop', npcId?: string }` | mudCommands, mudHUD | Switch HUD panel layout |
| `mud:execute-command` | `{ command: string }` | mudHUD buttons, TouchableEntity | Fire a MUD command from panel UI |
| `mud:exit` | — | mudCommands (`/q`) | Signal MUD session ended |
| `crt:glitch-tier` | `{ tier: 1\|2, duration: number }` | mudCommands (movement, combat) | Trigger CRT visual glitch |
| `neural:glitch-trigger` | `{ intensity: number }` | mudCommands (creation, death) | Trigger neural shader effect |

### Events consumed by MUD

| Event | Listener | Purpose |
|---|---|---|
| `mud:panel-mode` | MudHUDContainer | Update panel mode state |
| `mud:execute-command` | TelnetSession | Route command through `sendWithSlash` |
| `shell:request-scroll` | MudHUDContainer | Auto-scroll chat area to bottom |

### Events emitted by TelnetSession for MUD

| Event | Purpose |
|---|---|
| `mud:active` | Notify InterfaceLayer that MUD is running (drives nav bar swap) |
| `mud:entering` | Trigger CRT effects on MUD entry |
| `mud:exit` | Notify InterfaceLayer that MUD has ended |

---

## Command Reference

All MUD commands are `/slash` commands processed by `handleMudCommand()`.

### Navigation
| Command | Description |
|---|---|
| `/look` (`/l`) | Display room description. Resets panel mode to default. |
| `/go <dir>` | Move to direction (north, south, east, west, up, down, in, out) or named room. |
| `/exits` | List available exits with descriptions and lock status. |
| `/examine <thing>` (`/x`) | Inspect an object, NPC, enemy, or room detail. Reveals gated text on attribute checks. |
| `/where` | Show current zone, room ID, level range, and depth. |

### Combat
| Command | AP | Description |
|---|---|---|
| `/attack [target]` (`/a`) | 1 | Melee/ranged attack. Defaults to first living enemy. |
| `/hack [name]` (`/h`) | 2 | Upload quickhack. Lists available if no name given. Requires RAM. |
| `/use [item]` (`/u`) | 1 | Use consumable in combat. Lists usable items if no name given. |
| `/scan [target]` | 1 | Reveal enemy stats, HP, weaknesses. |
| `/flee` | 2 | Attempt escape. Failure = free enemy attack. |

### Social
| Command | Description |
|---|---|
| `/talk <message>` | Address NPCs directly. Routes through LLM dialogue system. |
| `/me <action>` | Emote. NPCs are context-aware of emotes. |
| (bare text) | In rooms with NPCs, non-slash input routes to NPC dialogue automatically. |

### Commerce
| Command | Description |
|---|---|
| `/shop` | Open shop panel mode (when near a vendor NPC). |
| `/buy <item>` | Purchase from shopkeeper. Price modified by disposition. |
| `/sell <item>` | Sell to shopkeeper. |

### Quest
| Command | Description |
|---|---|
| `/quests` | Show active and available quests. |
| `/quest <id>` | Show quest details, objectives, and progress. |

### Character
| Command | Description |
|---|---|
| `/stats` | Full character sheet — archetype, style, level, attributes, currency. |
| `/inventory` (`/inv`, `/i`) | Open inventory panel in HUD. |
| `/save` | Manual save to localStorage. |
| `/mudhelp` (`/help`, `/?`) | Show all MUD commands grouped by category. |
| `/q` (`/quit`, `/leave`) | Save and exit MUD, return to ghost channel. |

---

## Rendering Pattern

MUD output uses `addLocalMsg()` — a callback that injects React nodes into the ghost channel's message stream. These nodes are interleaved chronologically with Ably room messages.

**Styled components** (internal to mudCommands):
- `MudLine` — Single line with color, opacity, bold, glow, indent options
- `MudBlock` — Container with standard font/line-height/margin
- `MudSpacer` — Vertical gap (0.4rem)
- `MudNotice` — System notice or error message
- `N1XLine` — Purple text in N1X's voice (#bf00ff)
- `TypeWriter` — Character-by-character text reveal for NPC dialogue
- `PlayGlyph` — Inline TTS play/stop button
- `TouchableEntity` — Expandable entity with action panel (still used for `/examine` results)
- `ActionGlyph` — Tappable command button inside entity panels

**Delayed sequences:** `pushDelayed()` accepts an array of `{ delay, node }` entries and schedules them via `setTimeout`. Used for creation flow, combat announcements, and spawn sequences. Returns a cleanup function.

**Chat output policy:** The chat area only contains narrative content — room descriptions, NPC dialogue, combat blow-by-blow, system messages, emotes, and errors. Persistent information (NPCs, enemies, objects, exits, HP, XP, currency) is displayed exclusively in the HUD panels.

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/mud/npc-dialogue` | POST | LLM-powered NPC conversation. Receives `NPCDialogueRequest`, returns `{ responses: Array<{ npcId, name, text }> }`. |

The NPC dialogue endpoint uses the Vercel AI SDK with Qwen3-max. System prompts are constructed by `buildNPCSystemPrompt()` with the NPC's personality, knowledge base, disposition, room context, recent interaction history, and the player's emote context.

---

## Design Principles

1. **Client-side first.** All game logic runs in the browser. The server is only touched for NPC dialogue (LLM) and real-time multiplayer (Ably). A player on airplane mode can explore, fight, loot, and quest — they just can't talk to NPCs.

2. **Extend, never refactor.** New zones, NPCs, items, and quests are added to existing registries. The architecture is append-only — working systems are not restructured.

3. **Lore is the world.** Every room description, NPC line, item name, and command response stays in-world in TUNNELCORE's voice. No generic game UI language. The terminal is the interface. The interface is the world.

4. **Permadeath creates meaning.** Character death is permanent. Gear drops at death location. NPC relationships reset. Quest progress lost. This makes every decision — entering a dangerous zone, engaging an enemy, spending creds on insurance — matter.

5. **The 33hz frequency is the deepest layer.** GHOST attribute unlocks content no other stat can reach. The most hidden rooms, the most profound lore, the endgame paths — all gated behind attunement to the signal.

---

## Adding Content

### New Zone

1. Define the `Zone` object in `worldMap.ts` with id, name, description, depth, level range, factions, features
2. Define all `Room` objects with exits, NPCs, enemies, objects
3. Add to `ZONE_REGISTRY` and `ROOM_REGISTRY`
4. Add NPC personalities to `npcEngine.ts` `NPC_PERSONALITIES` registry
5. Add NPC voice configs to `mudAudio.ts` `VOICE_REGISTRY`
6. Add shop inventories to `shopSystem.ts` if any NPCs are shopkeepers
7. Add item templates to `items.ts` for zone-specific loot
8. Add quests to `questEngine.ts` `QUEST_REGISTRY`

### New NPC

1. Add `RoomNPC` entry to the room's `npcs` array in `worldMap.ts`
2. Add personality definition in `npcEngine.ts` — name, voice, background, mannerisms, knowledge, dialogue hooks
3. Add voice config to `mudAudio.ts` if TTS is desired
4. If shopkeeper: add inventory to `shopSystem.ts`
5. If quest giver: add quests to `questEngine.ts`, ensure `isNPCQuestGiver()` returns true

### New Item

1. Add `ItemTemplate` to `ITEM_TEMPLATES` array in `items.ts`
2. If it's a starter kit item: add to `getStarterKit()` for the relevant archetype/style
3. If sold by a vendor: add `templateId` to the shop's inventory in `shopSystem.ts`
4. If it's a quest reward: reference `templateId` in the quest's `rewards.items` array

### New Quest

1. Add `Quest` definition to `QUEST_REGISTRY` in `questEngine.ts`
2. Define objectives with types matching the tracking system (`talk_to`, `go_to`, `collect`, `deliver`, `examine`, `kill`)
3. Set `giver` to the NPC id who offers the quest
4. Set `location` to the zone where the quest is available
5. The auto-start system will activate the quest when a player asks the NPC about work

---

## Planned Systems (Not Yet Implemented)

From the design document — these are specified but not yet built:

- **Zones 01–07, 09–16** — Full world map with 16 zones across surface, shallow, deep, substrate, and instanced layers
- **Skill trees** — 4 trees (Chrome, Synapse, Ballistic, Ghost) with 10 nodes each
- **Faction reputation** — 7 factions with rep tracking, faction-gated content, and betrayal consequences
- **Multiplayer sync** — Character position via Ably presence, combat party system, shared world flags via Upstash Redis
- **Downed state** — 3-turn bleedout timer before permadeath, ally stabilization
- **Insurance chip / Ghost Echo** — Death protection items
- **PvP** — Consent-based player combat in the Fight Pits (Zone 06)
- **Main questline** — 4-act story across levels 1–20, culminating in a collective player choice
- **Crafting** — TECH-gated item creation from materials
- **Cyberware installation** — Augmentation system with 3 slots
