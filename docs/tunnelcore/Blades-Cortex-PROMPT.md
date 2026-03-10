# TUNNELCORE — CLOCK ENGINE IMPLEMENTATION SPEC

## Forged in the Dark × Cortex Prime Hybrid System

### Drop-in replacement for the d20 combat engine

-----

## CONTEXT

You are implementing a complete replacement for the combat and resolution system in TUNNELCORE, a cyberpunk text-based MUD running inside a Next.js terminal web application (N1X.sh).

The current system is a traditional d20 + attribute vs defense threshold with flat HP, armor subtraction, and action points. You are replacing it with a **clock-based resolution system** inspired by Blades in the Dark and Cortex Prime dice mechanics. This is not a patch — it is a full replacement of the mechanical spine, while preserving the narrative content, UI shell, HUD framework, event bus architecture, and persistence layer.

**Hard rules:**

- Never refactor existing architecture outside the combat/resolution scope — extend everything else
- Always output complete files, not diffs or partials
- Preserve all existing commands and their names (`/attack`, `/hack`, `/flee`, `/scan`, `/use`, `/rest`, `/stats`, `/skills`)
- Preserve the `MudSession` interface shape (phase, character, world, npcState, combat, creation)
- Preserve the `eventBus.emit/on` pattern for cross-component communication
- Preserve persistence via localStorage (`persistence.ts` read/write pattern)
- Preserve the `MudCommandResult` return shape: `{ output: ReactNode, error?: boolean, updateSession?: Partial<MudSession> }`
- All JSX uses inline styles with CSS variables (`var(--phosphor-green)`, `var(--text-base)`, etc.)
- Font: IBM VGA8. Aesthetic: phosphor CRT terminal.

**Lore constants (never change):**

- uid: `784988` | ghost frequency: `33hz` | commit hash: `7073435a8fa30`
- root password: `tunnelcore` | n1x password: `ghost33`

-----

## PART 1 — CORE CLOCK ENGINE

### File: `lib/mud/clockEngine.ts`

This is the new foundational module. Pure functions. Zero UI. Zero side effects.

### 1.1 — Clock Data Structure

```typescript
export interface Clock {
  id: string;                    // unique ID: 'combat_harm_player', 'env_toxic_z08_r03', 'heat_directorate'
  name: string;                  // display name: 'WOUNDS', 'TOXIC EXPOSURE', 'DIRECTORATE HEAT'
  segments: number;              // total segments (typically 4, 6, or 8)
  filled: number;                // current filled segments (0 to segments)
  category: ClockCategory;
  color?: string;                // hex color for HUD rendering
  visible: boolean;              // whether clock shows in HUD
  persistent: boolean;           // survives combat end (heat, faction, environmental)
  linkedClocks?: LinkedClock[];  // clocks this clock pushes when filled
  onFill?: ClockTrigger;         // what happens when all segments fill
  decayRate?: number;            // segments to remove per rest/downtime cycle (0 = no decay)
  owner?: string;                // 'player' | enemy combatant ID | 'environment' | 'world'
}

export type ClockCategory =
  | 'harm'           // player/enemy damage clocks
  | 'armor'          // damage absorption clocks
  | 'progress'       // quest/objective advancement
  | 'danger'         // reinforcements, alarms, collapse
  | 'environment'    // toxic, fire, radiation, mesh exposure
  | 'heat'           // faction attention / wanted level
  | 'countdown'      // time pressure (X rounds until event)
  | 'boss_phase'     // boss behavior transitions
  | 'status';        // bleed, stun, burning, jammed

export interface LinkedClock {
  targetClockId: string;          // ID of the clock to push
  ticksOnFill: number;            // how many segments to fill on the target when THIS clock fills
  ticksOnTick?: number;           // optional: push target by N each time THIS clock ticks (for cog-like behavior)
  condition?: string;             // optional: only trigger if condition met
}

export interface ClockTrigger {
  type: 'cascade'                 // fill triggers linked clocks
    | 'spawn_clock'               // creates a new clock
    | 'end_combat'                // combat ends (victory or defeat)
    | 'phase_shift'               // boss changes behavior
    | 'narrative_event'           // fires an event for LLM narration
    | 'damage_cascade'            // harm clock full → critical harm
    | 'faction_entanglement'      // heat clock triggers faction response
    | 'environmental_effect'      // room becomes dangerous
    | 'flee_forced'               // player forced to flee
    | 'permadeath';               // character death
  payload?: Record<string, unknown>;
}
```

### 1.2 — Clock Operations (Pure Functions)

```typescript
/** Tick a clock by N segments. Returns overflow (segments beyond max). */
export function tickClock(clock: Clock, ticks: number): { clock: Clock; overflow: number; filled: boolean }

/** Drain a clock by N segments (healing, repair, decay). Minimum 0. */
export function drainClock(clock: Clock, ticks: number): Clock

/** Reset a clock to 0 filled. */
export function resetClock(clock: Clock): Clock

/** Check if a clock is full. */
export function isClockFull(clock: Clock): boolean

/** Process all linked clocks when a clock fills. Returns array of all clocks that triggered. */
export function processTriggers(filledClock: Clock, allClocks: Clock[]): { updatedClocks: Clock[]; triggered: ClockTrigger[] }

/** Create a clock from a template. */
export function createClock(template: ClockTemplate): Clock

/** Get a visual representation of a clock for terminal display. */
export function renderClockText(clock: Clock): string
// Example output: "WOUNDS ██░░░░ [2/6]" or "ARMOR ████ [4/4] FULL"

/** Get all clocks matching a category or owner. */
export function filterClocks(clocks: Clock[], filter: { category?: ClockCategory; owner?: string }): Clock[]
```

### 1.3 — Clock Templates

Define reusable templates for common clock patterns:

```typescript
export interface ClockTemplate {
  id: string;
  name: string;
  segments: number;
  category: ClockCategory;
  color?: string;
  visible: boolean;
  persistent: boolean;
  decayRate?: number;
  linkedClocks?: LinkedClock[];
  onFill?: ClockTrigger;
}

// ── Standard Templates ──
export const PLAYER_HARM_CLOCK: ClockTemplate       // 6 segments. On fill → cascade to CRITICAL
export const PLAYER_CRITICAL_CLOCK: ClockTemplate    // 4 segments. On fill → DOWNED state
export const PLAYER_DOWNED_CLOCK: ClockTemplate      // 3 segments (bleedout). On fill → permadeath
export const ARMOR_CLOCK: (segments: number) => ClockTemplate  // variable segments based on armor item
export const ENEMY_HARM_CLOCK: (name: string, segments: number) => ClockTemplate
export const REINFORCEMENT_CLOCK: ClockTemplate      // 6 segments. On fill → spawn new enemies
export const ALARM_CLOCK: ClockTemplate              // 4 segments. On fill → alert state, changes enemy behavior
export const ENVIRONMENTAL_CLOCK: (type: string, segments: number) => ClockTemplate
export const HEAT_CLOCK: (factionId: string) => ClockTemplate  // 8 segments. persistent. decayRate: 1 per rest
```

-----

## PART 2 — DICE POOL SYSTEM (CORTEX PRIME)

### File: `lib/mud/dicePool.ts`

Replaces the d20 single-roll resolution. Attributes become die sizes. Skills and gear add dice to the pool.

### 2.1 — Die Sizes and Attribute Mapping

```typescript
export type DieSize = 4 | 6 | 8 | 10 | 12;

// Attribute values (3-15) map to die sizes:
// 3-4  → d4
// 5-6  → d6
// 7-8  → d8
// 9-10 → d10
// 11+  → d12
export function attributeToDie(value: number): DieSize

// Roll a single die. Uses crypto.getRandomValues.
export function rollDie(size: DieSize): number

// A pool entry — one die with a label and source.
export interface PoolDie {
  label: string;       // 'BODY', 'CHROME', 'Mantis Blades', 'Iron Skin'
  size: DieSize;
  source: 'attribute' | 'skill' | 'gear' | 'augment' | 'environment' | 'status';
  value?: number;      // filled after rolling
}
```

### 2.2 — Pool Assembly

The pool is assembled from context — what the player has, what they’re doing, and what’s happening around them.

```typescript
export interface PoolContext {
  character: MudCharacter;
  action: ActionType;           // see 2.4
  approach: ApproachType;       // how they're doing it
  targetClockId?: string;       // what clock they're trying to advance
  environmentalFactors?: string[];
}

export type ActionType = 'attack' | 'hack' | 'defend' | 'flee' | 'scan' | 'sneak' | 'resist' | 'recover';
export type ApproachType = 'aggressive' | 'measured' | 'desperate' | 'cautious';

export function assemblePool(context: PoolContext): PoolDie[]
```

**Pool assembly rules:**

1. **Primary attribute die** — determined by action type:
- `attack` melee: BODY
- `attack` ranged: REFLEX
- `hack`: TECH
- `defend`: highest of BODY or REFLEX
- `flee`: REFLEX
- `scan`: INT
- `sneak`: COOL
- `resist` (mesh/hack): GHOST
- `recover`: BODY
1. **Combat style die** — if the action aligns with their combat style, add a die:
- CHROME + melee attack → add CHROME skill die (starts d6, steps up with tree investment)
- SYNAPSE + hack → add SYNAPSE skill die
- BALLISTIC + ranged → add BALLISTIC skill die
- GHOST_STYLE + sneak/stealth → add GHOST skill die
1. **Gear die** — equipped weapon or relevant gear item contributes a die:
- Weapon die size determined by item tier: SCRAP=d4, COMMON=d6, MIL_SPEC=d8, HELIXION=d10, PROTOTYPE=d12
- Armor contributes a die on defend actions
1. **Augment die** — installed cyberware that’s relevant to the action adds a die:
- Each augment slot (neural, chassis, limbs) has a die size based on the cyberware installed
1. **Skill node dice** — unlocked skill tree nodes can add dice or step up existing dice:
- Tier 1 nodes: add a d6 asset die
- Tier 2 nodes: step up an existing die by one size (d6→d8)
- Tier 3 nodes: add a d8 asset die OR grant a special effect
- Tier 4 nodes: add a d10 asset die OR grant a unique mechanic
1. **Complication dice** — negative dice from status clocks, environmental hazards:
- Each active status clock (bleed, burning, jammed) adds a complication d6-d8
- Environmental clocks above 50% filled add a complication die
- Complications: if a complication die rolls higher than your effect die, it ticks a danger clock

### 2.3 — Pool Resolution

```typescript
export interface RollResult {
  pool: PoolDie[];               // all dice with rolled values
  effectDie: number;             // highest single die result (determines clock ticks)
  secondDie: number;             // second highest (added to effect for total)
  total: number;                 // effectDie + secondDie
  complications: PoolDie[];      // complication dice that fired
  heroicOpportunity: boolean;    // any die rolled its max value (can spend for bonus)
  botch: boolean;                // effectDie is 1 (bad outcome regardless)
}

export function rollPool(pool: PoolDie[]): RollResult
```

**Resolution table (maps total to outcome):**

|Total|Outcome |Clock Ticks (player target)|Clock Ticks (danger/enemy)        |
|-----|--------|---------------------------|----------------------------------|
|1-4  |FAILURE |0 ticks on target          |2 ticks on danger clock           |
|5-9  |PARTIAL |1 tick on target           |1 tick on danger clock            |
|10-14|SUCCESS |2 ticks on target          |0 ticks on danger clock           |
|15-19|STRONG  |3 ticks on target          |0, and drain 1 from a danger clock|
|20+  |CRITICAL|3 ticks + bonus effect     |0, and drain 1 from a danger clock|

### 2.4 — Position and Effect

Before rolling, the engine determines **position** (how dangerous) and **effect** (how impactful).

```typescript
export type Position = 'controlled' | 'risky' | 'desperate';
export type EffectLevel = 'limited' | 'standard' | 'great';

export interface ActionContext {
  position: Position;
  effect: EffectLevel;
  reason: string;        // human-readable explanation for terminal display
}

export function assessAction(
  character: MudCharacter,
  action: ActionType,
  approach: ApproachType,
  combatClocks: Clock[],
  enemyTier: number,
): ActionContext
```

**Position modifies danger clock ticks on failure/partial:**

- `controlled`: 0 danger ticks on partial, 1 on failure
- `risky`: 1 danger tick on partial, 2 on failure (default)
- `desperate`: 2 danger ticks on partial, 3 on failure — but +1 effect die size

**Effect modifies target clock ticks:**

- `limited`: -1 tick from result
- `standard`: no modifier (default)
- `great`: +1 tick to result

**Position is determined by:**

- Player HP clock state (more filled = more desperate)
- Number of enemies vs player
- Environmental hazard clocks
- Player approach choice (aggressive pushes toward desperate, cautious toward controlled)

**Effect is determined by:**

- Gear tier vs enemy tier
- Relevant skill nodes unlocked
- Environmental advantages (high ground, cover, darkness for stealth)
- GHOST attribute for mesh-related actions

-----

## PART 3 — COMBAT STATE (REPLACES `CombatState`)

### Changes to: `lib/mud/types.ts`

Replace the existing `CombatState` and `Combatant` interfaces.

```typescript
// ── NEW: Clock-Based Combat State ──────────────────────────────────────────

export interface ClockCombatState {
  active: boolean;
  round: number;
  clocks: Clock[];                    // ALL active clocks in this combat
  enemies: ClockCombatant[];          // enemy definitions with clock references
  playerClocks: {                     // quick-reference IDs for player clocks
    harm: string;                     // clock ID for player harm
    critical: string;                 // clock ID for player critical harm
    armor: string | null;             // clock ID for player armor (null if no armor)
    downed: string | null;            // clock ID for bleedout (created when critical fills)
  };
  turnPhase: TurnPhase;
  approachChosen: boolean;            // has player chosen their approach this turn?
  currentApproach?: ApproachType;
  currentAction?: ActionType;
  log: CombatLogEntry[];
  sourceEnemies: RoomEnemy[];         // original enemy definitions (for loot/XP)
  environmentClocks: string[];        // IDs of clocks from room environment
  narrativeContext: string;           // rolling context string for LLM narration
}

export type TurnPhase =
  | 'player_choose'     // player picks action + approach
  | 'player_resolve'    // dice roll and clock updates
  | 'enemy_action'      // enemies take actions
  | 'environment_tick'  // environmental clocks advance
  | 'end_check';        // check for combat end conditions

export interface ClockCombatant {
  id: string;
  name: string;
  tier: number;                       // enemy power tier (1-5), affects position/effect calc
  harmClockId: string;                // reference to their harm clock in the clocks array
  armorClockId: string | null;        // reference to their armor clock (if armored)
  behavior: EnemyBehavior;
  attackDice: DieSize[];              // the dice the enemy rolls (e.g. [d8, d6] for a mid-tier enemy)
  dangerClockId?: string;             // clock this enemy advances (reinforcements, alarm, etc.)
  statusClocks: string[];             // IDs of any status clocks on this enemy
  defeated: boolean;
  xpReward: number;
  drops: LootEntry[];
}

export interface EnemyBehavior {
  type: 'aggressive' | 'defensive' | 'swarm' | 'sniper' | 'hacker' | 'boss';
  targetPriority: 'harm' | 'danger' | 'status';  // which type of clock the enemy prefers to advance
  retreatThreshold?: number;          // if harm clock reaches this %, attempt to flee
  specialAction?: string;             // ID of a special action to use periodically
}

export interface CombatLogEntry {
  round: number;
  actor: string;                      // 'player' or enemy name
  action: string;                     // description of what happened
  clockChanges: { clockId: string; name: string; from: number; to: number; segments: number }[];
  rollResult?: RollResult;            // included for player actions
  narrative?: string;                 // LLM-generated narrative text (filled async)
}
```

### Character Type Changes

In `MudCharacter`, the following fields change meaning:

```typescript
// REMOVE these fields from MudCharacter:
//   hp: number          → replaced by harm clock state
//   maxHp: number       → replaced by harm clock segments
//   ram: number          → replaced by a RAM clock (SYNAPSE resource)
//   maxRam: number       → replaced by RAM clock segments

// ADD these fields to MudCharacter:
  harmSegments: number;       // total harm clock size (base 6, modified by BODY and archetype)
  criticalSegments: number;   // total critical clock size (base 4, modified by archetype)
  armorSegments: number;      // current armor clock size (from equipped armor item)
  ramSegments: number;        // RAM clock size for SYNAPSE (TECH × 2, as before)
  styleDie: DieSize;          // current die size for their combat style skill (starts d6, grows)
```

### HP Removal and Harm Clock Mapping

The old system: `HP = BODY × 10 + archetype bonus + level bonus`

The new system:

- **Harm clock segments** = 4 + floor(BODY / 3) + archetype modifier
  - DISCONNECTED: +2 segments (tougher flesh)
  - SOVEREIGN: +1 segment
  - INTEGRATED: +0 segments
  - Typical range: 5-8 segments
- **Critical clock** = 4 segments (universal)
- **Downed clock** = 3 segments (bleedout timer — same as before, ticks per round)
- **Armor clock** = segments from equipped armor item:
  - SCRAP armor: 2 segments
  - COMMON armor: 3 segments
  - MIL_SPEC armor: 4 segments
  - HELIXION armor: 5 segments
  - PROTOTYPE armor: 6 segments

**Damage flow:** incoming harm ticks armor clock first. When armor fills, it’s destroyed (or degraded — reset to 0 but loses 1 max segment). Overflow ticks harm clock. When harm fills, cascade to critical. When critical fills, DOWNED state begins. Downed clock ticks each round. When downed fills, permadeath.

This gives an effective “hit point” range of 9-17 clock segments through all layers — creating fights that last 3-6 rounds, which is more tense than the old 80+ HP pool.

-----

## PART 4 — COMBAT FLOW (REPLACES `combat.ts` FUNCTIONS)

### File: `lib/mud/combat.ts` (complete rewrite)

### 4.1 — Combat Initialization

```typescript
export function initClockCombat(character: MudCharacter, enemies: RoomEnemy[], roomClocks?: Clock[]): ClockCombatState
```

Creates:

1. Player harm clock, critical clock, armor clock (from gear)
1. Enemy harm clocks (segments based on enemy tier: T1=3, T2=4, T3=5, T4=6, T5=8)
1. Enemy armor clocks (if enemy has armor)
1. Any environmental clocks from the room definition
1. Sets turn phase to `player_choose`

### 4.2 — Player Action Resolution

The player’s turn is a two-step process:

**Step 1: Choose action and approach**

```typescript
export function setPlayerAction(
  combat: ClockCombatState,
  action: ActionType,
  approach: ApproachType,
  targetId?: string,
): { combat: ClockCombatState; context: ActionContext; pool: PoolDie[]; error?: string }
```

This does NOT roll dice. It:

1. Validates the action is possible
1. Assesses position and effect
1. Assembles the dice pool
1. Returns everything for display — the player sees their pool before rolling
1. Sets `turnPhase: 'player_resolve'`

**Step 2: Resolve (roll dice, tick clocks)**

```typescript
export function resolvePlayerAction(
  combat: ClockCombatState,
  character: MudCharacter,
): {
  combat: ClockCombatState;
  result: RollResult;
  outcome: ActionOutcome;
  clockChanges: ClockChange[];
  triggered: ClockTrigger[];
  narrativePrompt: string;         // context string for LLM to narrate
}
```

```typescript
export interface ActionOutcome {
  tier: 'failure' | 'partial' | 'success' | 'strong' | 'critical';
  targetTicks: number;             // segments filled on target clock
  dangerTicks: number;             // segments filled on danger/harm clocks
  bonusEffect?: string;            // special effect from critical or skill
  description: string;             // mechanical summary for log
}

export interface ClockChange {
  clockId: string;
  clockName: string;
  from: number;
  to: number;
  segments: number;
  filled: boolean;
  triggerFired?: ClockTrigger;
}
```

### 4.3 — Enemy Actions

```typescript
export function processEnemyActions(
  combat: ClockCombatState,
  godMode?: boolean,
): {
  combat: ClockCombatState;
  actions: EnemyActionResult[];
  clockChanges: ClockChange[];
  narrativePrompt: string;
}
```

Each living enemy:

1. Rolls their `attackDice` pool
1. Based on result, ticks player’s harm clock (through armor first) or advances a danger clock
1. Behavior type determines target priority:
- `aggressive`: always targets player harm
- `defensive`: advances danger/reinforcement clocks
- `swarm`: each additional enemy of same type adds a d6 to the pool
- `sniper`: rolls fewer dice but with +1 effect level
- `hacker`: targets player status clocks (jam, blind, etc.)
- `boss`: follows phase behavior based on their own harm clock state

### 4.4 — Environmental Tick

```typescript
export function tickEnvironment(combat: ClockCombatState): {
  combat: ClockCombatState;
  clockChanges: ClockChange[];
}
```

Each round, environmental clocks tick by 1 (or by their defined rate). Toxic rooms, structural damage, mesh detection — all automatic.

### 4.5 — Combat End Check

```typescript
export function checkClockCombatEnd(combat: ClockCombatState): ClockCombatEnd

export type ClockCombatEnd =
  | { over: false }
  | { over: true; victory: boolean; xpGained: number; drops: string[]; survivingClocks: Clock[] }
```

Combat ends when:

- **Victory**: all enemy harm clocks are full
- **Defeat**: player downed clock fills (permadeath)
- **Fled**: player successfully flees (flee action with controlled/risky position)
- **Narrative end**: a trigger fires `end_combat` (e.g., reinforcement clock fills and enemies overwhelm)

**Surviving clocks**: persistent clocks (heat, environmental) survive combat end and transfer back to world state. This is how combat has lasting consequences.

### 4.6 — Flee

```typescript
export function attemptFlee(
  combat: ClockCombatState,
  character: MudCharacter,
): {
  pool: PoolDie[];
  result: RollResult;
  escaped: boolean;
  harmTicks: number;         // ticks taken from enemy free action if failed
  clockChanges: ClockChange[];
}
```

Flee rolls REFLEX die + any speed-related gear/skills. On partial success, player escapes but takes harm ticks. On failure, stuck and takes harm ticks. On success, clean escape.

### 4.7 — Quickhack (SYNAPSE)

```typescript
export function resolveQuickhack(
  combat: ClockCombatState,
  character: MudCharacter,
  hackId: string,
  targetId: string,
): { /* same shape as resolvePlayerAction */ }
```

Quickhacks are special actions that:

1. Consume segments from the player’s RAM clock (instead of ticking it up — RAM is a “reserve” clock that drains)
1. Can target enemy status clocks (create a JAMMED clock, a BLINDED clock, etc.)
1. Can target environmental clocks (hack a terminal to stop an alarm clock)
1. The SYNAPSE combat style die is always included in hack pools

RAM clock: starts full (TECH × 2 segments). Hacks drain it. Regenerates 1 segment per round. Fully restores out of combat. This replaces the integer RAM system.

### 4.8 — Scan

```typescript
export function scanTarget(
  combat: ClockCombatState,
  character: MudCharacter,
  targetId: string,
): {
  success: boolean;
  revealedClocks: Clock[];       // show enemy's hidden clocks (harm, armor, status)
  weaknesses: string[];          // narrative hints
  behaviorHint: string;          // what the enemy is likely to do
}
```

Scan rolls INT die. On success, reveals enemy clock states and behavioral hints. On strong success, also reveals linked clocks and triggers.

-----

## PART 5 — COMMAND INTERFACE CHANGES

### Changes to: `lib/mud/mudCommands.tsx`

The command names stay the same. The flow changes.

### `/attack [target]`

**Old flow:** roll d20, compare to defense, deal damage, advance turn.

**New flow (two-step):**

1. Player types `/attack [target]`
1. Engine displays approach choice:
   
   ```
   ┌─ ENGAGE: Drainage Crawler ──────────────────────────┐
   │                                                       │
   │  Choose your approach:                                │
   │                                                       │
   │  [A] AGGRESSIVE — risky/standard. push hard.          │
   │  [M] MEASURED   — controlled/limited. play it safe.   │
   │  [D] DESPERATE  — desperate/great. all or nothing.    │
   │                                                       │
   │  Your pool: BODY d8 · CHROME d6 · Mantis Blades d8   │
   │  Position: RISKY  Effect: STANDARD                    │
   │                                                       │
   └───────────────────────────────────────────────────────┘
   ```
1. Player types `a`, `m`, or `d` (or the full word) as their next input
1. Engine rolls the pool, resolves clocks, displays result:
   
   ```
   ── ROLL ─────────────────────────────
   BODY d8 → [6]  CHROME d6 → [4]  Mantis Blades d8 → [7]
   Effect: 7  Total: 7 + 6 = 13
   
   ── SUCCESS ──────────────────────────
   CRAWLER HARM    ██████░░ [3/4] (+2)
   your ARMOR      ████░░░░ [2/4] (held)
   
   [LLM narrative appears here as transient message]
   ```
1. Enemy turn processes automatically after a short delay

**Implementation:** The approach selection uses the existing `requestInput` callback pattern from `MudCommandContext`. When `/attack` is issued, it returns the approach prompt as output and sets `turnPhase: 'player_choose'`. The next input resolves the action.

**Alternative: single-step mode.** If the player types `/attack crawler aggressive` (or `/attack crawler a`), skip the approach prompt and resolve immediately. This is the power-user fast path.

### `/hack [quickhack] [target]`

Same two-step flow but assembles TECH + SYNAPSE pool. Drains RAM clock segments. Displays available hacks based on RAM clock state (not integer comparison).

### `/flee`

Single action. Assembles REFLEX pool. Resolve immediately. No approach choice — flee is always risky.

### `/scan [target]`

Single action. Assembles INT pool. Reveals clock states on success.

### `/use [item]`

Single action. Consumables either drain segments from harm clocks (healing) or add segments to armor clocks (repair) or create temporary asset dice. No roll required.

**Healing items:**

- Small medkit: drain 2 segments from harm clock
- Large medkit: drain 4 segments from harm clock
- Trauma kit: drain 2 segments from critical clock
- Repair kit: restore 2 segments to armor clock

### `/rest` (at safe havens)

- Drain ALL segments from harm and critical clocks (full heal)
- Restore armor clock to max segments
- Restore RAM clock to full
- Decay heat clocks by their decay rate
- Process level-up if pending
- Each rest ticks a hidden “time passes” clock — the world doesn’t wait

### `/stats`

Display character sheet with clock states instead of HP:

```
┌─ HANDLE ─ SOVEREIGN ─ CHROME ─ Level 4 ──────────────────┐
│                                                            │
│  BODY 7 (d8)  REFLEX 5 (d6)  TECH 4 (d4)                │
│  COOL 6 (d6)  INT 5 (d6)    GHOST 3 (d4)                │
│                                                            │
│  HARM      ░░░░░░ [0/6]                                   │
│  CRITICAL  ░░░░ [0/4]                                     │
│  ARMOR     ████░░ [4/6] MIL-SPEC PLATE                   │
│  RAM       ████████ [8/8]                                  │
│                                                            │
│  Style: CHROME d8    XP: 450/600                          │
│  Creds: 1200         Scrip: 45                            │
│                                                            │
│  HEAT:                                                     │
│  DIRECTORATE ██░░░░░░ [2/8]                               │
│  IRON BLOOM  ░░░░░░░░ [0/8]                               │
└────────────────────────────────────────────────────────────┘
```

-----

## PART 6 — LLM NARRATIVE INTEGRATION

### New API Route: `app/api/mud/combat-narrate/route.ts`

This is the novel piece. The LLM doesn’t decide mechanics — it narrates them.

```typescript
// POST body:
interface NarrateRequest {
  action: string;              // what the player did
  outcome: string;             // 'failure' | 'partial' | 'success' | 'strong' | 'critical'
  clockChanges: {
    name: string;
    from: number;
    to: number;
    segments: number;
    filled: boolean;
  }[];
  enemyNames: string[];
  roomName: string;
  roomDescription: string;     // first 100 chars for atmosphere
  playerHandle: string;
  playerStyle: string;         // CHROME, SYNAPSE, etc.
  roundNumber: number;
  previousNarrative?: string;  // last narration for continuity
}

// Response: { narrative: string } — 1-3 sentences of fiction
```

**System prompt for the narration LLM:**

```
You are the narrator for TUNNELCORE, a cyberpunk text MUD set in an underground city.
You narrate combat actions in terse, visceral, second-person prose.
You are given mechanical results (dice outcomes, clock changes) and must describe what physically happens.

Rules:
- Maximum 2-3 sentences. Never exceed 40 words.
- Second person present tense. "you" not "they."
- Use the clock states to convey urgency. If harm clock is filling, the prose gets more desperate.
- If a clock fills, that's a dramatic turning point. Mark it.
- Never mention game mechanics by name. No "dice," "clocks," "segments," "rolls."
- The world is dark, wet, industrial. Metal, rust, phosphor light, humming frequencies.
- On critical success: transcendent, almost supernatural competence.
- On botch/failure: brutal, physical, consequential.
- Reference the room atmosphere and enemy behavior, not just the hit.
- Keep continuity with the previous narration if provided.
```

**Integration point:** After `resolvePlayerAction` returns, the client fires an async fetch to `/api/mud/combat-narrate`. The mechanical result displays immediately (clock bars, dice values). The narrative text appears as a transient message 300-500ms later, below the mechanical readout. This prevents the LLM from blocking the game loop.

The narration is **additive, not blocking**. If the API call fails or times out, combat continues without narrative text. The clocks ARE the game. The words are the atmosphere.

-----

## PART 7 — SKILL TREE ADAPTATION

### Changes to: `lib/mud/skillTree.ts`

Skill nodes no longer give flat numerical bonuses. They give **dice** and **clock modifiers**.

**New effect categories:**

|Old Effect                |New Effect                                      |
|--------------------------|------------------------------------------------|
|`+2 melee damage`         |Add a d6 asset die to melee pools               |
|`+3 armor`                |+1 segment to armor clock max                   |
|`Double damage on stealth`|+1 effect level on stealth attacks              |
|`+4 RAM`                  |+2 segments to RAM clock max                    |
|`Weapon jams 1 turn`      |Create a 2-segment JAMMED status clock on target|
|`2 extra AP for 3 turns`  |Add d8 asset die to all pools for 3 rounds      |
|`On kill: heal 15% HP`    |On clock fill: drain 1 segment from harm clock  |
|`Quickhack damage +2`     |Step up SYNAPSE skill die by one size           |

**Each skill node gets a new field:**

```typescript
export interface SkillNode {
  // ... existing fields ...
  clockEffect?: {
    type: 'add_die' | 'step_up_die' | 'add_clock_segments' | 'drain_on_trigger'
         | 'effect_level_bonus' | 'create_status_clock' | 'complication_immunity';
    dieSize?: DieSize;
    dieLabel?: string;
    segments?: number;
    targetClock?: string;
    condition?: string;
  };
}
```

**The STYLE_TO_TREE mapping stays identical.** The unlock logic stays identical. Only the effects change.

-----

## PART 8 — ENEMY DEFINITION CHANGES

### Changes to: `RoomEnemy` in `types.ts` and enemy data in `worldMap.ts`

```typescript
export interface RoomEnemy {
  id: string;
  name: string;
  level: number;                 // kept for display
  tier: number;                  // 1-5, determines harm clock size and dice pool
  description: string;
  harmSegments: number;          // how many segments in their harm clock
  armorSegments: number;         // 0 if unarmored
  attackDice: DieSize[];         // their dice pool: e.g. [8, 6] for a d8 + d6 enemy
  behavior: EnemyBehavior;
  spawnChance: number;
  count: [number, number];
  drops: LootEntry[];
  xpReward: number;
  dangerClockContribution?: {    // optional: this enemy contributes to a shared danger clock
    clockTemplate: ClockTemplate;
    ticksPerRound: number;
  };
  statusAbilities?: {            // optional: enemy can inflict status clocks
    clockTemplate: ClockTemplate;
    chance: number;              // 0-1, chance per attack to create status clock
  }[];
}
```

**Example enemy migration:**

```typescript
// OLD:
{
  id: 'drainage_crawler', name: 'Drainage Crawler', level: 1,
  hp: 8, attributes: enemyAttrs(1), damage: 2, armorValue: 0,
  behavior: 'aggressive', spawnChance: 0.7, count: [1, 2],
  drops: [...], xpReward: 15,
}

// NEW:
{
  id: 'drainage_crawler', name: 'Drainage Crawler', level: 1,
  tier: 1, description: 'bio-luminescent vermin, all teeth and corrosive spit',
  harmSegments: 3, armorSegments: 0,
  attackDice: [6],                        // single d6 — weak enemy
  behavior: { type: 'aggressive', targetPriority: 'harm' },
  spawnChance: 0.7, count: [1, 2],
  drops: [...], xpReward: 15,
  statusAbilities: [{
    clockTemplate: { id: 'toxic_spit', name: 'TOXIC SPIT', segments: 3,
      category: 'status', visible: true, persistent: false,
      onFill: { type: 'narrative_event', payload: { effect: 'corrosion' } } },
    chance: 0.3,
  }],
}
```

-----

## PART 9 — HUD DISPLAY CHANGES

### Changes to: `lib/mud/mudHUD.tsx`

The status bar and combat panels switch from HP bars to clock displays.

### 9.1 — Clock Bar Component

```tsx
function ClockBar({ clock }: { clock: Clock }) {
  const filled = '█'.repeat(clock.filled);
  const empty = '░'.repeat(clock.segments - clock.filled);
  const pct = clock.segments > 0 ? (clock.filled / clock.segments) * 100 : 0;
  const color = clock.category === 'harm' ? (pct > 60 ? '#ff4444' : pct > 30 ? '#fbbf24' : 'var(--phosphor-green)')
    : clock.color ?? 'var(--phosphor-green)';

  return (
    <div style={{ display: 'flex', gap: '0.5ch', alignItems: 'center', fontFamily: 'inherit' }}>
      <span style={{ color: C.dim, fontSize: 'var(--text-base)', minWidth: '12ch' }}>{clock.name}</span>
      <span style={{ color, fontFamily: 'monospace', letterSpacing: '1px' }}>{filled}{empty}</span>
      <span style={{ color: C.faint, fontSize: 'var(--text-base)' }}>[{clock.filled}/{clock.segments}]</span>
    </div>
  );
}
```

### 9.2 — Status Bar

Replace HP bar with harm/armor clock display. Replace RAM integer with RAM clock bar.

The status bar shows:

- Harm clock (inverted color — empty is green, full is red)
- Armor clock (if equipped)
- RAM clock (SYNAPSE only)
- Active heat clocks (abbreviated)
- Level and XP (unchanged)
- Currency (unchanged)

### 9.3 — Combat Panel (Right Side)

During combat, the right panel shows:

- All enemy clocks (harm + armor)
- Environmental/danger clocks
- Player status clocks (if any)

Each enemy gets a compact card:

```
┌─ Drainage Crawler ────────────┐
│ HARM  ████░░ [2/3]            │
│ TOXIC ██░░░ [1/3]   (status)  │
│ behavior: AGGRESSIVE          │
└───────────────────────────────┘
```

### 9.4 — Combat Mode Header

```
⚔ COMBAT — Round 3 — RISKY POSITION
```

Replaces the old `⚔ COMBAT — Round 3` with position indicator.

### 9.5 — Dice Pool Display

Before the roll, show the assembled pool as a compact line:

```
POOL: BODY d8 · CHROME d6 · Mantis Blades d8 │ ⚠ TOXIC d6
```

After the roll, show results:

```
ROLL: [6] · [4] · [7] │ ⚠ [2]    TOTAL: 13 → SUCCESS
```

-----

## PART 10 — WORLD STATE INTEGRATION

### Changes to: `MudWorldState` in `types.ts`

```typescript
export interface MudWorldState {
  // ... existing fields ...
  activeClocks: Clock[];           // persistent clocks (heat, environmental, quest progress)
  clockHistory: {                  // log of significant clock events
    clockId: string;
    event: 'filled' | 'drained' | 'created' | 'destroyed';
    timestamp: number;
    context: string;
  }[];
}
```

### Heat System

Each faction has a heat clock (8 segments, persistent, decayRate: 1 per rest).

Heat ticks from:

- Killing faction-aligned enemies: +1-2 ticks
- Hacking faction infrastructure: +2-3 ticks
- Completing quests against a faction: +2-4 ticks
- Being seen in restricted areas: +1 tick per room entry

When a heat clock fills:

- Trigger a faction entanglement event during next rest
- Entanglements: patrols spawn in adjacent zones, bounty hunters appear, vendor prices increase, NPC dispositions shift
- Heat clock resets to 4/8 (not 0 — the faction doesn’t forget)

### Environmental Clocks (Room-Level)

Some rooms have persistent environmental clocks:

- Toxic rooms: CONTAMINATION clock ticks each visit
- Mesh-heavy rooms: DETECTION clock ticks for non-GHOST characters
- Structural damage: COLLAPSE clock from combat in fragile rooms

These persist in `worldState.activeClocks` and tick on room entry, not just during combat.

-----

## PART 11 — PERSISTENCE MIGRATION

### Changes to: `lib/mud/persistence.ts`

Add a migration function that runs on session load:

```typescript
export function migrateToClockSystem(character: MudCharacter): MudCharacter {
  // If character still has hp/maxHp fields, migrate:
  if ('hp' in character && !('harmSegments' in character)) {
    const harmSegs = 4 + Math.floor(character.attributes.BODY / 3)
      + (character.archetype === 'DISCONNECTED' ? 2 : character.archetype === 'SOVEREIGN' ? 1 : 0);
    const critSegs = 4;

    // Calculate current harm from old HP
    const hpPct = character.hp / character.maxHp;
    const currentHarm = Math.round((1 - hpPct) * harmSegs);

    return {
      ...character,
      harmSegments: harmSegs,
      criticalSegments: critSegs,
      armorSegments: getArmorSegments(character.gear),
      ramSegments: character.attributes.TECH * 2,
      styleDie: getStyleDie(character),
      // Remove old fields on next save
    };
  }
  return character;
}
```

Combat state in localStorage also needs migration — simplest approach is to clear any active combat state on version change. Existing characters keep their progress, stats, inventory, quests. Only the resolution system changes.

-----

## PART 12 — FILES TO CREATE / MODIFY

### New Files:

1. `lib/mud/clockEngine.ts` — Clock data structures, pure clock operations, templates
1. `lib/mud/dicePool.ts` — Die sizes, pool assembly, pool resolution, position/effect
1. `app/api/mud/combat-narrate/route.ts` — LLM narration endpoint

### Full Rewrites (output complete files):

1. `lib/mud/combat.ts` — New clock-based combat initialization, resolution, enemy AI, flee, scan, use item
1. `lib/mud/types.ts` — Updated interfaces (ClockCombatState, ClockCombatant, MudCharacter changes, remove old CombatState/Combatant)

### Surgical Edits (preserve everything else, change only combat integration):

1. `lib/mud/mudCommands.tsx` — Replace combat command handlers with new two-step flow. Preserve ALL non-combat commands unchanged.
1. `lib/mud/mudHUD.tsx` — Replace HP bars with clock bars. Replace combat card layout. Preserve all non-combat panels.
1. `lib/mud/character.ts` — Update `buildCharacter` and `processLevelUp` for clock-based stats. Preserve creation flow.
1. `lib/mud/skillTree.ts` — Add `clockEffect` to all skill nodes. Preserve tree structure and unlock logic.
1. `lib/mud/worldMap.ts` — Migrate all enemy definitions to new `RoomEnemy` shape. Preserve all room content.
1. `lib/mud/items.ts` — Add armor segment values to armor items. Add die size to weapons. Preserve all item definitions.
1. `lib/mud/persistence.ts` — Add migration function. Update save/load for new combat state shape.
1. `lib/mud/combatFX.tsx` — Update emitters for clock-based severity. Preserve shake/glitch system.
1. `lib/mud/safeHaven.ts` — Update rest to drain clocks instead of setting HP. Preserve haven definitions.
1. `lib/mud/lootEngine.ts` — Adapt to ClockCombatState for post-combat loot. Preserve loot tables.
1. `lib/mud/synergies.ts` — Update synergy effects to clock/die terminology. Preserve synergy detection.
1. `lib/mud/levelUpSequence.tsx` — Update level-up display for clock stats. Preserve modal pattern.

-----

## PART 13 — IMPLEMENTATION ORDER

**Phase 1 — Foundation (no UI changes):**

1. `clockEngine.ts` — pure clock operations
1. `dicePool.ts` — pure dice operations
1. `types.ts` — new type definitions (keep old ones temporarily for compat)

**Phase 2 — Combat Core (replaces combat.ts):**
4. `combat.ts` — new initialization, resolution, enemy AI
5. `persistence.ts` — migration function + updated save/load

**Phase 3 — Command Integration:**
6. `mudCommands.tsx` — combat command handlers
7. `mudHUD.tsx` — clock displays in status bar and combat panels
8. `combatFX.tsx` — updated severity mapping

**Phase 4 — Data Migration:**
9. `worldMap.ts` — enemy definitions
10. `items.ts` — armor segments, weapon dice
11. `skillTree.ts` — clock effects
12. `character.ts` — clock-based character building
13. `safeHaven.ts` — clock-based rest
14. `lootEngine.ts`, `synergies.ts`, `levelUpSequence.tsx`

**Phase 5 — LLM Narrative:**
15. `app/api/mud/combat-narrate/route.ts`
16. Wire async narrative into combat flow in `mudCommands.tsx`

-----

## PART 14 — WHAT STAYS UNTOUCHED

These files/systems are NOT modified:

- `ShellInterface.tsx` — the terminal shell
- `commandRegistry.ts` — command parsing
- `eventBus.ts` — event system
- `mudMap.tsx` / `nofogMap.tsx` — map rendering
- `npcEngine.ts` — NPC dialogue, disposition, memory
- `questEngine.ts` — quest state machine (clocks *add* to this but don’t replace it)
- `creationOverlay.tsx` — character creation overlay
- `mudAudio.ts` — audio system
- `restModal.tsx`, `sellModal.tsx` — modal shells (content updates, shell stays)
- `substrateBackground.tsx` — background renderer
- `transientMessage.tsx` — transient message system
- `cyberwareDB.ts` — cyberware definitions (add die sizes to items, don’t restructure)
- `shopSystem.ts` — shop logic (prices stay, item effects updated)
- All non-MUD systems (shell commands, ARG, multiplayer, boot sequence)
- All room descriptions, NPC definitions, quest content, lore objects
- All API routes except the new narration route

-----

## PART 15 — DESIGN PRINCIPLES

1. **Clocks are visible tension.** Every clock on screen is a countdown to something. Players should feel the pressure of multiple clocks advancing simultaneously. The HUD should make this visceral.
1. **Every roll has multiple consequences.** A partial success ticks your target AND a danger clock. Players are never just “attacking” — they’re managing a web of advancing pressures.
1. **The narrative is emergent.** The LLM doesn’t decide what happens — the clocks do. The LLM describes what the clocks mean in fiction. This is the division of labor: engine for truth, LLM for beauty.
1. **Approach matters more than build.** The same character can play cautiously or desperately. The approach choice IS the gameplay, more than the attribute spread. This rewards tactical thinking over optimization.
1. **Death is a clock, not a number.** Watching your harm clock fill segment by segment, then your critical clock start ticking, then your bleedout clock counting down — that’s three distinct warnings before permadeath. Each one is a chance to change course. Death in this system is always a choice you made.
1. **Clocks connect everything.** Combat clocks cascade to world clocks. Heat clocks from combat affect downtime. Environmental clocks from exploration affect combat. The systems talk to each other through clock triggers. This is the Blades innovation: everything is the same mechanic.
1. **The pool is the character sheet.** When a player sees “BODY d8 · CHROME d6 · Mantis Blades d8” — that IS their character. Not a list of numbers, but a collection of dice they’ve earned. Each new skill, each better weapon, each augment adds to the pool. Progression is tangible in every roll.
1. **Complications create story.** When a complication die fires, it doesn’t just deal damage — it creates a new clock. Your weapon jams (2-segment JAMMED clock). The floor gives way (3-segment FALL clock). The mesh detects your hack (4-segment TRACE clock). Every complication is a new problem that the player must now manage alongside the original fight.
