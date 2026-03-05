// lib/mud/mudCommands.tsx
// TUNNELCORE MUD — Command Router (Phase 2)
// Handles all /slash commands when MUD session is active.
// Renders output via addLocalMsg into the ghost channel stream.

import React from 'react';
import type {
  MudSession,
  CreationProgress,
  Archetype,
  CombatStyle,
  OriginPoint,
  AttributeName,
  Room,
} from './types';
import {
  ARCHETYPE_INFO,
  COMBAT_STYLE_INFO,
  ATTRIBUTE_BONUS_POINTS,
  xpForLevel,
  LEVEL_CAP,
  calculateMaxHp,
  calculateMaxRam,
} from './types';
import {
  buildCharacter,
  finalizeCharacter,
  parseAttributeInput,
  validateAttributes,
  applyArchetypeBonuses,
  defaultAttributes,
  CREATION_STEPS,
  generateSubjectId,
} from './character';
import {
  saveFullSession,
  saveCharacter,
  addVisitedRoom,
} from './persistence';
import {
  getRoom,
  getZone,
  getVisibleExits,
  resolveExit,
  getJunctionBranches,
} from './worldMap';
import { eventBus } from '@/lib/eventBus';

// ── Style constants (mirrors TelnetSession / systemCommands pattern) ────────

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  glow:   'text-glow',
  accent: 'var(--phosphor-accent)',
};

const C = {
  green:     'var(--phosphor-green)',
  accent:    'var(--phosphor-accent)',
  dim:       'rgba(var(--phosphor-rgb),0.45)',
  dimmer:    'rgba(var(--phosphor-rgb),0.25)',
  error:     '#ff6b6b',
  n1x:       '#bf00ff',
  npc:       '#fcd34d',
  enemy:     '#ff6b6b',
  object:    'rgba(var(--phosphor-rgb),0.7)',
  exit:      'var(--phosphor-accent)',
  safe:      '#a5f3fc',
  stat:      'var(--phosphor-green)',
  warning:   '#ff8c00',
};

// ── Types ───────────────────────────────────────────────────────────────────

type AddLocalMsg = (node: React.ReactNode) => void;

export interface MudContext {
  addLocalMsg:  AddLocalMsg;
  handle:       string;
  session:      MudSession;
  setSession:   (s: MudSession) => void;
}

export type MudCommandResult = {
  handled: boolean;
  stopPropagation?: boolean; // prevent OOC send
};

// ── Key generator for React elements ────────────────────────────────────────

let _keySeq = 0;
function k(prefix: string): string {
  return `mud-${prefix}-${Date.now()}-${++_keySeq}`;
}

// ── Styled output helpers ───────────────────────────────────────────────────

function MudLine({ children, color, opacity, bold, glow, indent, style }: {
  children: React.ReactNode;
  color?: string;
  opacity?: number;
  bold?: boolean;
  glow?: boolean;
  indent?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={glow ? S.glow : undefined}
      style={{
        fontFamily: 'monospace',
        fontSize: S.base,
        lineHeight: 1.8,
        color: color ?? C.green,
        opacity: opacity ?? 1,
        fontWeight: bold ? 'bold' : undefined,
        paddingLeft: indent ? '2ch' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MudBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: S.base,
      lineHeight: 1.8,
      marginBottom: '0.25rem',
    }}>
      {children}
    </div>
  );
}

function MudSpacer() {
  return <div style={{ height: '0.4rem' }} />;
}

function N1XLine({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: S.base,
      lineHeight: 1.8,
      color: C.n1x,
      opacity: 0.9,
    }}>
      {children}
    </div>
  );
}

function MudNotice({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: S.base,
      lineHeight: 1.8,
      color: error ? C.error : C.dim,
      opacity: error ? 0.9 : 0.7,
    }}>
      {children}
    </div>
  );
}

// ── Delayed message helper ──────────────────────────────────────────────────
// Returns a cleanup function that cancels pending timers.

function pushDelayed(
  addLocalMsg: AddLocalMsg,
  items: Array<{ delay: number; node: React.ReactNode }>,
  onDone?: () => void,
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const maxDelay = items.reduce((m, i) => Math.max(m, i.delay), 0);

  items.forEach(({ delay, node }) => {
    timers.push(setTimeout(() => addLocalMsg(node), delay));
  });

  if (onDone) {
    timers.push(setTimeout(onDone, maxDelay + 300));
  }

  return () => timers.forEach(clearTimeout);
}

// ── LLM flavor text (non-blocking, local-only) ─────────────────────────────
// TODO: Build /api/mud/creation-flavor endpoint that returns text directly
// (without Ably publish) for local addLocalMsg rendering between steps.
// For now, creation uses the scripted text from CREATION_STEPS which is
// already in N1X's voice and sufficient for the flow.

async function fetchN1XReaction(
  _choiceDescription: string,
  _addLocalMsg: AddLocalMsg,
): Promise<void> {
  // No-op until dedicated endpoint exists.
  // The /api/bot route publishes to Ably — using it here would broadcast
  // creation chatter to the entire ghost channel.
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CHARACTER CREATION FLOW ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export function startCreationFlow(ctx: MudContext): void {
  const { addLocalMsg, handle, setSession } = ctx;

  const session: MudSession = {
    phase: 'character_creation',
    character: null,
    world: null,
    npcState: null,
    combat: null,
    creation: { step: 'archetype' },
  };
  setSession(session);

  // ── Entry sequence: terminal flicker → N1X monologue → creation ───────
  const subjectId = generateSubjectId();

  // Trigger CRT glitch effect
  eventBus.emit('neural:glitch-trigger', { intensity: 0.8 });

  pushDelayed(addLocalMsg, [
    // Phase 1: Static / signal drop
    { delay: 0, node: <MudSpacer key={k('sp-entry0')} /> },
    { delay: 200, node: (
      <MudLine key={k('entry-static')} color={C.dim} opacity={0.3}>
        ▓▓▓▓▓▒▒░░ SIGNAL_INTERRUPT ░░▒▒▓▓▓▓▓
      </MudLine>
    )},
    { delay: 800, node: (
      <MudLine key={k('entry-deep')} color={C.accent} glow>
        &gt;&gt; GHOST_CHANNEL: DEEP_SUBSTRATE_DETECTED
      </MudLine>
    )},

    // Phase 2: N1X speaks — scripted monologue from design doc
    { delay: 1800, node: <MudSpacer key={k('sp-entry1')} /> },
    { delay: 2200, node: (
      <N1XLine key={k('entry-m1')}>
        you&apos;ve been here long enough. you&apos;ve seen the fragments.
      </N1XLine>
    )},
    { delay: 3200, node: (
      <N1XLine key={k('entry-m2')}>
        you know what helixion did. you know what i survived.
      </N1XLine>
    )},
    { delay: 4400, node: (
      <N1XLine key={k('entry-m3')}>
        the terminal you&apos;re using — it&apos;s a window. but there&apos;s a door.
      </N1XLine>
    )},
    { delay: 5600, node: (
      <N1XLine key={k('entry-m4')}>
        TUNNELCORE is what&apos;s on the other side.
      </N1XLine>
    )},
    { delay: 7000, node: <MudSpacer key={k('sp-entry2')} /> },
    { delay: 7400, node: (
      <N1XLine key={k('entry-m5')}>
        before you go through, i need to know what you&apos;re carrying.
      </N1XLine>
    )},

    // Phase 3: Subject ID assignment → archetype question
    { delay: 8800, node: <MudSpacer key={k('sp-entry3')} /> },
    { delay: 9200, node: (
      <N1XLine key={k('create-intro-1')}>
        subject detected. handle: {handle}
      </N1XLine>
    )},
    { delay: 9800, node: (
      <N1XLine key={k('create-intro-2')}>
        assigning identifier: {subjectId}
      </N1XLine>
    )},
    { delay: 10600, node: <MudSpacer key={k('sp-entry4')} /> },
    { delay: 11000, node: (
      <div key={k('create-archetype-q')}>
        {CREATION_STEPS.archetype.n1xText.split('\n').map((line, i) => (
          <N1XLine key={k(`arch-q-${i}`)}>{line || '\u00a0'}</N1XLine>
        ))}
        <MudSpacer />
        {CREATION_STEPS.archetype.options.map((opt, i) => (
          <div key={k(`arch-opt-${i}`)} style={{ paddingLeft: '2ch', lineHeight: 1.8 }}>
            <span style={{ color: C.accent, fontFamily: 'monospace', fontSize: S.base }}>
              [{i + 1}] {opt.display}
            </span>
            <span style={{ color: C.dim, fontFamily: 'monospace', fontSize: S.base, marginLeft: '1ch' }}>
              — {opt.description}
            </span>
          </div>
        ))}
        <MudSpacer />
        <MudLine color={C.dim} opacity={0.5}>type 1, 2, or 3</MudLine>
      </div>
    )},
  ]);

  // Store subjectId in creation state for later use
  (session.creation as CreationProgress & { _subjectId?: string })._subjectId = subjectId;
  setSession({ ...session });
}

export function handleCreationInput(input: string, ctx: MudContext): MudCommandResult {
  const { addLocalMsg, handle, session, setSession } = ctx;
  const creation = session.creation;
  if (!creation) return { handled: false };

  const trimmed = input.trim();
  if (!trimmed) return { handled: true, stopPropagation: true };

  switch (creation.step) {
    // ── ARCHETYPE ──────────────────────────────────────────────────────────
    case 'archetype': {
      const options = CREATION_STEPS.archetype.options;
      let choice: typeof options[number] | undefined;

      // Accept number or keyword
      const num = parseInt(trimmed, 10);
      if (num >= 1 && num <= options.length) {
        choice = options[num - 1];
      } else {
        const lower = trimmed.toLowerCase();
        choice = options.find(o =>
          o.key.toLowerCase() === lower ||
          o.display.toLowerCase().includes(lower)
        );
      }

      if (!choice) {
        addLocalMsg(
          <MudNotice key={k('arch-err')} error>
            that's not a choice. 1, 2, or 3.
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }

      const archetype = choice.key as Archetype;
      const next: CreationProgress = {
        ...creation,
        step: 'combat_style',
        archetype,
      };
      setSession({ ...session, creation: next });

      // Fire-and-forget LLM flavor
      fetchN1XReaction(`player chose archetype: ${choice.display}`, addLocalMsg);

      pushDelayed(addLocalMsg, [
        { delay: 0, node: (
          <MudLine key={k('arch-ack')} color={C.accent} glow>
            &gt;&gt; ARCHETYPE: {ARCHETYPE_INFO[archetype].label}
          </MudLine>
        )},
        { delay: 600, node: <MudSpacer key={k('sp-cs')} /> },
        { delay: 1000, node: (
          <div key={k('cs-q')}>
            {CREATION_STEPS.combatStyle.n1xText.split('\n').map((line, i) => (
              <N1XLine key={k(`cs-q-${i}`)}>{line || '\u00a0'}</N1XLine>
            ))}
            <MudSpacer />
            {CREATION_STEPS.combatStyle.options.map((opt, i) => (
              <div key={k(`cs-opt-${i}`)} style={{ paddingLeft: '2ch', lineHeight: 1.8 }}>
                <span style={{ color: C.accent, fontFamily: 'monospace', fontSize: S.base }}>
                  [{i + 1}] {opt.display}
                </span>
                <span style={{ color: C.dim, fontFamily: 'monospace', fontSize: S.base, marginLeft: '1ch' }}>
                  — {opt.description}
                </span>
              </div>
            ))}
            <MudSpacer />
            <MudLine color={C.dim} opacity={0.5}>type 1, 2, 3, or 4</MudLine>
          </div>
        )},
      ]);

      return { handled: true, stopPropagation: true };
    }

    // ── COMBAT STYLE ──────────────────────────────────────────────────────
    case 'combat_style': {
      const options = CREATION_STEPS.combatStyle.options;
      let choice: typeof options[number] | undefined;

      const num = parseInt(trimmed, 10);
      if (num >= 1 && num <= options.length) {
        choice = options[num - 1];
      } else {
        const lower = trimmed.toLowerCase();
        choice = options.find(o =>
          o.key.toLowerCase() === lower ||
          o.display.toLowerCase().includes(lower)
        );
      }

      if (!choice) {
        addLocalMsg(
          <MudNotice key={k('cs-err')} error>
            that's not how you fight. 1, 2, 3, or 4.
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }

      const combatStyle = choice.key as CombatStyle;
      const next: CreationProgress = {
        ...creation,
        step: 'attributes',
        combatStyle,
      };
      setSession({ ...session, creation: next });

      fetchN1XReaction(`player chose combat style: ${choice.display}`, addLocalMsg);

      // Show attributes prompt with current base values
      const archetype = creation.archetype!;
      const base = defaultAttributes();
      const bonuses = ARCHETYPE_INFO[archetype].bonusAttributes;
      const withBonuses = applyArchetypeBonuses(base, archetype);

      pushDelayed(addLocalMsg, [
        { delay: 0, node: (
          <MudLine key={k('cs-ack')} color={C.accent} glow>
            &gt;&gt; COMBAT STYLE: {COMBAT_STYLE_INFO[combatStyle].label}
          </MudLine>
        )},
        { delay: 600, node: <MudSpacer key={k('sp-attr')} /> },
        { delay: 1000, node: (
          <div key={k('attr-q')}>
            {CREATION_STEPS.attributes.n1xText.split('\n').map((line, i) => (
              <N1XLine key={k(`attr-q-${i}`)}>{line || '\u00a0'}</N1XLine>
            ))}
            <MudSpacer />
            <MudLine color={C.dim} opacity={0.6}>
              current base (with {ARCHETYPE_INFO[archetype].label} bonuses):
            </MudLine>
            {(Object.keys(withBonuses) as AttributeName[]).map(attr => {
              const val = withBonuses[attr];
              const bonus = (bonuses[attr] ?? 0);
              return (
                <MudLine key={k(`attr-base-${attr}`)} indent color={C.stat}>
                  {attr.padEnd(8)}{val}{bonus > 0 ? ` (+${bonus} archetype)` : ''}
                </MudLine>
              );
            })}
            <MudSpacer />
            <MudLine color={C.dim} opacity={0.5}>
              format: BODY 7 REFLEX 5 TECH 4 COOL 3 INT 5 GHOST 6
            </MudLine>
            <MudLine color={C.dim} opacity={0.5}>
              or just: 7 5 4 3 5 6 (BODY/REFLEX/TECH/COOL/INT/GHOST order)
            </MudLine>
          </div>
        )},
      ]);

      return { handled: true, stopPropagation: true };
    }

    // ── ATTRIBUTES ────────────────────────────────────────────────────────
    case 'attributes': {
      const archetype = creation.archetype!;
      const { attrs, error: parseError } = parseAttributeInput(trimmed, archetype);

      if (parseError) {
        addLocalMsg(
          <MudNotice key={k('attr-parse-err')} error>
            {parseError}
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }

      const validation = validateAttributes(attrs, archetype);
      if (!validation.valid) {
        addLocalMsg(
          <MudNotice key={k('attr-val-err')} error>
            {validation.error}
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }

      if (validation.totalSpent < ATTRIBUTE_BONUS_POINTS) {
        addLocalMsg(
          <MudNotice key={k('attr-under')} error>
            you've only spent {validation.totalSpent}/{ATTRIBUTE_BONUS_POINTS} points. use them all.
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }

      const next: CreationProgress = {
        ...creation,
        step: 'origin',
        attributes: attrs,
      };
      setSession({ ...session, creation: next });

      fetchN1XReaction(`player distributed attributes: ${JSON.stringify(attrs)}`, addLocalMsg);

      // Show origin selection
      // Phase 1: only DRAINAGE available
      const origins = CREATION_STEPS.origin.options.filter(o => o.available);

      pushDelayed(addLocalMsg, [
        { delay: 0, node: (
          <div key={k('attr-ack')}>
            <MudLine color={C.accent} glow>&gt;&gt; ATTRIBUTES LOCKED</MudLine>
            <MudSpacer />
            {(Object.keys(attrs) as AttributeName[]).map(attr => (
              <MudLine key={k(`attr-final-${attr}`)} indent color={C.stat}>
                {attr.padEnd(8)}{attrs[attr]}
              </MudLine>
            ))}
          </div>
        )},
        { delay: 800, node: <MudSpacer key={k('sp-origin')} /> },
        { delay: 1200, node: (
          <div key={k('origin-q')}>
            {CREATION_STEPS.origin.n1xText.split('\n').map((line, i) => (
              <N1XLine key={k(`origin-q-${i}`)}>{line || '\u00a0'}</N1XLine>
            ))}
            <MudSpacer />
            {origins.map((opt, i) => (
              <div key={k(`origin-opt-${i}`)} style={{ paddingLeft: '2ch', lineHeight: 1.8 }}>
                <span style={{ color: C.accent, fontFamily: 'monospace', fontSize: S.base, fontWeight: 'bold' }}>
                  [{i + 1}] {opt.display}
                </span>
                <div style={{ color: C.dim, fontFamily: 'monospace', fontSize: S.base, paddingLeft: '4ch', opacity: 0.7 }}>
                  {opt.description}
                </div>
              </div>
            ))}
            <MudSpacer />
            <MudLine color={C.dim} opacity={0.5}>
              {origins.length === 1 ? 'type 1 to confirm' : `type 1-${origins.length}`}
            </MudLine>
          </div>
        )},
      ]);

      return { handled: true, stopPropagation: true };
    }

    // ── ORIGIN ────────────────────────────────────────────────────────────
    case 'origin': {
      const origins = CREATION_STEPS.origin.options.filter(o => o.available);

      let choice: typeof origins[number] | undefined;
      const num = parseInt(trimmed, 10);
      if (num >= 1 && num <= origins.length) {
        choice = origins[num - 1];
      } else {
        const lower = trimmed.toLowerCase();
        choice = origins.find(o =>
          o.key.toLowerCase() === lower ||
          o.display.toLowerCase().includes(lower)
        );
      }

      if (!choice) {
        addLocalMsg(
          <MudNotice key={k('origin-err')} error>
            pick a starting point. {origins.length === 1 ? 'type 1.' : `1-${origins.length}.`}
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }

      const origin = choice.key as OriginPoint;
      const next: CreationProgress = {
        ...creation,
        step: 'confirm',
        origin,
      };
      setSession({ ...session, creation: next });

      // Show confirmation summary
      const archetype = creation.archetype!;
      const combatStyle = creation.combatStyle!;
      const attributes = creation.attributes!;
      const subjectId = (creation as CreationProgress & { _subjectId?: string })._subjectId ?? 'XX-000000';

      pushDelayed(addLocalMsg, [
        { delay: 0, node: (
          <MudLine key={k('origin-ack')} color={C.accent} glow>
            &gt;&gt; ORIGIN: {choice.display}
          </MudLine>
        )},
        { delay: 600, node: <MudSpacer key={k('sp-confirm')} /> },
        { delay: 1000, node: (
          <div key={k('confirm-q')}>
            <N1XLine>last chance. this is what you're carrying into the tunnels.</N1XLine>
            <MudSpacer />
            <MudLine indent color={C.stat}>HANDLE     {handle}</MudLine>
            <MudLine indent color={C.stat}>SUBJECT    {subjectId}</MudLine>
            <MudLine indent color={C.stat}>ARCHETYPE  {ARCHETYPE_INFO[archetype].label}</MudLine>
            <MudLine indent color={C.stat}>STYLE      {COMBAT_STYLE_INFO[combatStyle].label}</MudLine>
            <MudLine indent color={C.stat}>ORIGIN     {choice.display}</MudLine>
            <MudSpacer />
            <MudLine indent color={C.dim} opacity={0.6}>BODY {attributes.BODY} · REFLEX {attributes.REFLEX} · TECH {attributes.TECH} · COOL {attributes.COOL} · INT {attributes.INT} · GHOST {attributes.GHOST}</MudLine>
            <MudSpacer />
            <MudLine indent color={C.stat}>HP         {calculateMaxHp(attributes.BODY, archetype, 1)}</MudLine>
            <MudLine indent color={C.stat}>RAM        {calculateMaxRam(attributes.TECH)}</MudLine>
            <MudSpacer />
            <N1XLine>confirm? (y/n)</N1XLine>
          </div>
        )},
      ]);

      // Store subjectId forward
      (next as CreationProgress & { _subjectId?: string })._subjectId = subjectId;
      setSession({ ...session, creation: next });

      return { handled: true, stopPropagation: true };
    }

    // ── CONFIRM ───────────────────────────────────────────────────────────
    case 'confirm': {
      const lower = trimmed.toLowerCase();

      if (lower === 'n' || lower === 'no') {
        // Restart creation
        addLocalMsg(
          <N1XLine key={k('confirm-no')}>
            fine. start over.
          </N1XLine>
        );
        setTimeout(() => startCreationFlow(ctx), 600);
        return { handled: true, stopPropagation: true };
      }

      if (lower !== 'y' && lower !== 'yes') {
        addLocalMsg(
          <MudNotice key={k('confirm-huh')} error>
            y or n.
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }

      // ── Build and finalize character ──────────────────────────────────
      const archetype = creation.archetype!;
      const combatStyle = creation.combatStyle!;
      const attributes = creation.attributes!;
      const origin = creation.origin!;

      const character = buildCharacter(handle, archetype, combatStyle, attributes, origin);
      // Override subjectId if we generated one during creation
      const storedSubjectId = (creation as CreationProgress & { _subjectId?: string })._subjectId;
      if (storedSubjectId) character.subjectId = storedSubjectId;

      const finalSession = finalizeCharacter(character);
      setSession(finalSession);

      // Spawn sequence
      pushDelayed(addLocalMsg, [
        { delay: 0, node: <MudSpacer key={k('sp-spawn0')} /> },
        { delay: 200, node: (
          <MudLine key={k('spawn-1')} color={C.accent} glow>
            &gt;&gt; CHARACTER LOCKED
          </MudLine>
        )},
        { delay: 800, node: (
          <N1XLine key={k('spawn-2')}>
            you're in. don't die.
          </N1XLine>
        )},
        { delay: 1400, node: (
          <MudLine key={k('spawn-3')} color={C.accent} glow>
            &gt;&gt; SPAWNING AT: {getRoom(character.currentRoom)?.name ?? 'UNKNOWN'}
          </MudLine>
        )},
        { delay: 1600, node: <MudSpacer key={k('sp-spawn1')} /> },
      ], () => {
        // Auto-fire /look after spawn
        renderLook(finalSession, addLocalMsg);
      });

      return { handled: true, stopPropagation: true };
    }

    default:
      return { handled: false };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ROOM RENDERING (/look) ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function renderLook(session: MudSession, addLocalMsg: AddLocalMsg): void {
  const char = session.character;
  if (!char) return;

  const room = getRoom(char.currentRoom);
  if (!room) {
    addLocalMsg(<MudNotice key={k('look-err')} error>error: room not found ({char.currentRoom})</MudNotice>);
    return;
  }

  const zone = getZone(room.zone);
  const visibleExits = getVisibleExits(char.currentRoom, char);

  // Junction branches
  let branches: Room[] = [];
  if (char.currentRoom === 'z08_r03') {
    branches = getJunctionBranches(char);
  }

  addLocalMsg(
    <div key={k('look')}>
      {/* Zone + room header */}
      <MudLine color={C.accent} glow bold>
        {zone?.name ?? 'UNKNOWN ZONE'} — {room.name}
      </MudLine>

      {room.isSafeZone && (
        <MudLine color={C.safe} opacity={0.6}>[ SAFE ZONE ]</MudLine>
      )}

      <MudSpacer />

      {/* Room description */}
      {room.description.split('\n').map((line, i) => (
        <MudLine key={k(`desc-${i}`)} color={C.green} opacity={0.85}>
          {line || '\u00a0'}
        </MudLine>
      ))}

      <MudSpacer />

      {/* NPCs */}
      {room.npcs.length > 0 && (
        <div>
          {room.npcs.map(npc => (
            <MudLine key={k(`npc-${npc.id}`)} color={C.npc}>
              <span style={{ opacity: 0.5 }}>[NPC] </span>
              <span style={{ fontWeight: 'bold' }}>{npc.name}</span>
              <span style={{ opacity: 0.6, marginLeft: '1ch' }}>— {npc.description.split('.')[0]}.</span>
            </MudLine>
          ))}
        </div>
      )}

      {/* Enemies (show if any are present, based on spawn data — actual combat spawn is separate) */}
      {room.enemies.length > 0 && (
        <div>
          {room.enemies.map(enemy => (
            <MudLine key={k(`enemy-${enemy.id}`)} color={C.enemy}>
              <span style={{ opacity: 0.5 }}>[HOSTILE] </span>
              <span style={{ fontWeight: 'bold' }}>{enemy.name}</span>
              <span style={{ opacity: 0.6, marginLeft: '1ch' }}>— Lv.{enemy.level}</span>
            </MudLine>
          ))}
        </div>
      )}

      {/* Objects */}
      {room.objects.length > 0 && (
        <div>
          <MudLine color={C.object} opacity={0.5} style={{ marginTop: '0.15rem' }}>
            objects: {room.objects.filter(o => !o.hidden || (o.hiddenRequirement && char.attributes[o.hiddenRequirement.attribute] >= o.hiddenRequirement.minimum)).map(o => o.name).join(', ')}
          </MudLine>
        </div>
      )}

      <MudSpacer />

      {/* Exits */}
      <MudLine color={C.dim} opacity={0.6}>EXITS:</MudLine>
      {visibleExits.map(exit => (
        <MudLine key={k(`exit-${exit.direction}`)} indent color={C.exit}>
          <span style={{ fontWeight: 'bold', minWidth: '8ch', display: 'inline-block' }}>
            {exit.direction}
          </span>
          <span style={{ opacity: 0.6, color: C.dim }}>
            {exit.description.replace(/^[a-z]+ \(/, '(').replace(/\)$/, ')')}
            {exit.locked ? ' [LOCKED]' : ''}
            {exit.zoneTransition ? ' [ZONE]' : ''}
          </span>
        </MudLine>
      ))}

      {/* Junction branches */}
      {branches.length > 0 && (
        <div>
          <MudLine color={C.dim} opacity={0.4} style={{ marginTop: '0.15rem' }}>
            also reachable from here:
          </MudLine>
          {branches.map(br => (
            <MudLine key={k(`branch-${br.id}`)} indent color={C.exit} opacity={0.7}>
              {br.name.toLowerCase()}
            </MudLine>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── COMMAND ROUTER ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export function handleMudCommand(input: string, ctx: MudContext): MudCommandResult {
  const { addLocalMsg, handle, session, setSession } = ctx;

  // ── During character creation, intercept ALL input ───────────────────────
  if (session.phase === 'character_creation' && session.creation) {
    return handleCreationInput(input, ctx);
  }

  // ── Only process /commands when MUD is active ───────────────────────────
  if (session.phase !== 'active') {
    return { handled: false };
  }

  // MUD commands start with /
  if (!input.startsWith('/')) return { handled: false };

  const trimmed = input.slice(1).trim();
  const parts = trimmed.split(/\s+/);
  const cmd = (parts[0] ?? '').toLowerCase();
  const rest = parts.slice(1).join(' ').trim();
  const char = session.character;

  if (!char) return { handled: false };

  // ── /look ─────────────────────────────────────────────────────────────
  if (cmd === 'look' || cmd === 'l') {
    renderLook(session, addLocalMsg);
    return { handled: true, stopPropagation: true };
  }

  // ── /exits ────────────────────────────────────────────────────────────
  if (cmd === 'exits') {
    const visibleExits = getVisibleExits(char.currentRoom, char);
    const room = getRoom(char.currentRoom);

    addLocalMsg(
      <div key={k('exits')}>
        <MudLine color={C.dim} opacity={0.6}>EXITS from {room?.name ?? 'unknown'}:</MudLine>
        {visibleExits.map(exit => (
          <MudLine key={k(`exit-${exit.direction}`)} indent color={C.exit}>
            {exit.direction} — {exit.description}
            {exit.locked ? ' [LOCKED]' : ''}
          </MudLine>
        ))}
        {char.currentRoom === 'z08_r03' && (
          <>
            <MudSpacer />
            <MudLine color={C.dim} opacity={0.4}>
              tip: from the junction, use /go &lt;room name&gt; to reach branch rooms
            </MudLine>
          </>
        )}
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /go <direction> ───────────────────────────────────────────────────
  if (cmd === 'go' || cmd === 'move' || cmd === 'walk') {
    if (!rest) {
      addLocalMsg(
        <MudNotice key={k('go-err')} error>go where? usage: /go &lt;direction|room name&gt;</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    const result = resolveExit(char.currentRoom, rest, char);

    if (!result) {
      addLocalMsg(
        <MudNotice key={k('go-nope')} error>you can't go that way.</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    if (result.blocked) {
      addLocalMsg(
        <MudNotice key={k('go-blocked')} error>{result.blocked}</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    const targetRoom = getRoom(result.targetRoom);
    if (!targetRoom) {
      addLocalMsg(
        <MudNotice key={k('go-noroom')} error>
          that passage leads somewhere that doesn't exist yet. zone under construction.
        </MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    // Move character
    const prevRoomId = char.currentRoom;
    char.currentRoom = result.targetRoom;
    addVisitedRoom(handle, result.targetRoom);
    saveCharacter(handle, char);
    setSession({ ...session, character: { ...char } });

    // Zone transition notification
    const prevRoom = getRoom(prevRoomId);

    if (targetRoom.zone !== (prevRoom?.zone ?? '')) {
      const targetZone = getZone(targetRoom.zone);
      addLocalMsg(
        <MudLine key={k('zone-change')} color={C.warning} glow>
          &gt;&gt; ENTERING ZONE: {targetZone?.name ?? targetRoom.zone}
        </MudLine>
      );
    }

    // Auto-look
    renderLook({ ...session, character: { ...char, currentRoom: result.targetRoom } }, addLocalMsg);

    return { handled: true, stopPropagation: true };
  }

  // ── /examine <object|npc> ─────────────────────────────────────────────
  if (cmd === 'examine' || cmd === 'inspect' || cmd === 'x') {
    if (!rest) {
      addLocalMsg(
        <MudNotice key={k('ex-err')} error>examine what? usage: /examine &lt;thing&gt;</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    const room = getRoom(char.currentRoom);
    if (!room) return { handled: true, stopPropagation: true };

    const lower = rest.toLowerCase();

    // Check objects
    const obj = room.objects.find(o =>
      o.name.toLowerCase().includes(lower) ||
      o.id.toLowerCase().includes(lower)
    );

    if (obj) {
      // Check if hidden and player can't see it
      if (obj.hidden && obj.hiddenRequirement) {
        const attr = char.attributes[obj.hiddenRequirement.attribute];
        if (attr < obj.hiddenRequirement.minimum) {
          addLocalMsg(
            <MudNotice key={k('ex-nothing')} error>you don't see anything like that here.</MudNotice>
          );
          return { handled: true, stopPropagation: true };
        }
      }

      addLocalMsg(
        <div key={k('examine-obj')}>
          <MudLine color={C.accent} bold>{obj.name}</MudLine>
          <MudLine color={C.green} opacity={0.85}>{obj.examineText}</MudLine>
          {/* Gated text */}
          {obj.gatedText?.map((gate, i) => {
            if (char.attributes[gate.attribute] >= gate.minimum) {
              return (
                <MudLine key={k(`gate-${i}`)} color={C.accent} opacity={0.9} style={{ marginTop: '0.3rem' }}>
                  {gate.text}
                </MudLine>
              );
            }
            return null;
          })}
        </div>
      );
      return { handled: true, stopPropagation: true };
    }

    // Check NPCs
    const npc = room.npcs.find(n =>
      n.name.toLowerCase().includes(lower) ||
      n.id.toLowerCase().includes(lower)
    );

    if (npc) {
      addLocalMsg(
        <div key={k('examine-npc')}>
          <MudLine color={C.npc} bold>{npc.name}</MudLine>
          <MudLine color={C.green} opacity={0.85}>{npc.description}</MudLine>
          <MudSpacer />
          <MudLine color={C.npc} opacity={0.7}>
            &quot;{npc.dialogue.replace(/^"/, '').replace(/"$/, '')}&quot;
          </MudLine>
          {npc.services && npc.services.length > 0 && (
            <MudLine color={C.dim} opacity={0.5} style={{ marginTop: '0.15rem' }}>
              services: {npc.services.join(', ')}
            </MudLine>
          )}
        </div>
      );
      return { handled: true, stopPropagation: true };
    }

    addLocalMsg(
      <MudNotice key={k('ex-nf')} error>you don't see anything like that here.</MudNotice>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /where ────────────────────────────────────────────────────────────
  if (cmd === 'where') {
    const room = getRoom(char.currentRoom);
    const zone = room ? getZone(room.zone) : null;

    addLocalMsg(
      <div key={k('where')}>
        <MudLine color={C.accent} bold>
          {zone?.name ?? 'UNKNOWN'} — {room?.name ?? 'UNKNOWN'}
        </MudLine>
        <MudLine color={C.dim} opacity={0.5}>
          room: {char.currentRoom} · level range: {zone?.levelRange.join('-') ?? '?'} · depth: {zone?.depth ?? '?'}
        </MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /stats ────────────────────────────────────────────────────────────
  if (cmd === 'stats' || cmd === 'status') {
    const nextXP = char.level < LEVEL_CAP ? xpForLevel(char.level + 1) : 0;

    addLocalMsg(
      <div key={k('stats')}>
        <MudLine color={C.accent} glow bold>&gt;&gt; {char.handle} — {char.subjectId}</MudLine>
        <MudSpacer />
        <MudLine indent color={C.stat}>ARCHETYPE  {ARCHETYPE_INFO[char.archetype].label}</MudLine>
        <MudLine indent color={C.stat}>STYLE      {COMBAT_STYLE_INFO[char.combatStyle].label}</MudLine>
        <MudLine indent color={C.stat}>LEVEL      {char.level}{char.level >= LEVEL_CAP ? ' (MAX)' : ''}</MudLine>
        <MudLine indent color={C.stat}>XP         {char.xp}{nextXP > 0 ? ` / ${nextXP}` : ''}</MudLine>
        <MudLine indent color={C.stat}>HP         {char.hp} / {char.maxHp}</MudLine>
        <MudLine indent color={C.stat}>RAM        {char.ram} / {char.maxRam}</MudLine>
        <MudSpacer />
        {(Object.keys(char.attributes) as AttributeName[]).map(attr => (
          <MudLine key={k(`stat-${attr}`)} indent color={C.stat}>
            {attr.padEnd(8)} {char.attributes[attr]}
          </MudLine>
        ))}
        <MudSpacer />
        <MudLine indent color={C.dim} opacity={0.5}>
          creds: {char.currency.creds} · scrip: {char.currency.scrip}
        </MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /inventory /inv ───────────────────────────────────────────────────
  if (cmd === 'inventory' || cmd === 'inv' || cmd === 'i') {
    const gearEntries = Object.entries(char.gear).filter(([_, item]) => item != null);

    addLocalMsg(
      <div key={k('inv')}>
        <MudLine color={C.accent} bold>&gt;&gt; INVENTORY</MudLine>
        <MudSpacer />

        {gearEntries.length > 0 && (
          <div>
            <MudLine color={C.dim} opacity={0.6}>EQUIPPED:</MudLine>
            {gearEntries.map(([slot, item]) => (
              <MudLine key={k(`gear-${slot}`)} indent color={C.stat}>
                [{slot.replace(/_/g, ' ')}] {item!.name}
                {item!.damage ? ` (dmg: ${item!.damage})` : ''}
                {item!.armorValue ? ` (armor: ${item!.armorValue})` : ''}
              </MudLine>
            ))}
            <MudSpacer />
          </div>
        )}

        {char.inventory.length > 0 ? (
          <div>
            <MudLine color={C.dim} opacity={0.6}>CARRYING:</MudLine>
            {char.inventory.map((item, i) => (
              <MudLine key={k(`inv-${i}`)} indent color={C.green} opacity={0.8}>
                {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                <span style={{ color: C.dim, opacity: 0.5, marginLeft: '1ch' }}>({item.tier})</span>
              </MudLine>
            ))}
          </div>
        ) : (
          <MudLine color={C.dim} opacity={0.5}>nothing in your pockets.</MudLine>
        )}

        {char.cyberware.length > 0 && (
          <div>
            <MudSpacer />
            <MudLine color={C.dim} opacity={0.6}>INSTALLED CYBERWARE:</MudLine>
            {char.cyberware.map((cw, i) => (
              <MudLine key={k(`cw-${i}`)} indent color={C.accent}>
                {cw.name} <span style={{ opacity: 0.5 }}>(T{cw.cyberwareTier})</span>
              </MudLine>
            ))}
          </div>
        )}
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /save ─────────────────────────────────────────────────────────────
  if (cmd === 'save') {
    saveFullSession(handle, session);
    addLocalMsg(
      <MudLine key={k('save')} color={C.accent} glow>
        &gt;&gt; STATE SAVED — {new Date().toLocaleTimeString()}
      </MudLine>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /mudhelp ──────────────────────────────────────────────────────────
  if (cmd === 'mudhelp' || cmd === 'mhelp' || cmd === 'commands') {
    const cmds: Array<{ cmd: string; desc: string }> = [
      { cmd: '/look',              desc: 'Examine your surroundings' },
      { cmd: '/go <dir>',          desc: 'Move in a direction or to a named room' },
      { cmd: '/exits',             desc: 'List available exits' },
      { cmd: '/examine <thing>',   desc: 'Inspect an object, NPC, or detail' },
      { cmd: '/where',             desc: 'Show current zone and room' },
      { cmd: '/stats',             desc: 'Show your character sheet' },
      { cmd: '/inventory',         desc: 'Show carried items and gear' },
      { cmd: '/save',              desc: 'Manual save (also auto-saves on move)' },
      { cmd: '/mudhelp',           desc: 'Show this list' },
    ];

    addLocalMsg(
      <div key={k('mudhelp')}>
        <MudLine color={C.accent} bold>&gt;&gt; TUNNELCORE — COMMANDS</MudLine>
        <MudSpacer />
        {cmds.map(c => (
          <div key={k(`mh-${c.cmd}`)} style={{
            paddingLeft: '2ch',
            display: 'flex',
            gap: '1ch',
            flexWrap: 'wrap',
            fontFamily: 'monospace',
            fontSize: S.base,
            lineHeight: 1.8,
          }}>
            <span style={{ color: C.accent, minWidth: '20ch', flexShrink: 0 }}>{c.cmd}</span>
            <span style={{ color: C.dim, opacity: 0.7 }}>{c.desc}</span>
          </div>
        ))}
        <MudSpacer />
        <MudLine color={C.dim} opacity={0.4}>
          regular chat still works — just type without / to talk OOC
        </MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── Not a MUD command — let it fall through ───────────────────────────
  return { handled: false };
}
