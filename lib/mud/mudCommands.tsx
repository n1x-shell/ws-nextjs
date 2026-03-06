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
  RoomExit,
  RoomObject,
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
  addXP,
} from './character';
import {
  saveFullSession,
  saveCharacter,
  addVisitedRoom,
  saveCombat,
  clearCombat,
  loadWorld,
} from './persistence';
import {
  getRoom,
  getZone,
  getVisibleExits,
  resolveExit,
  getJunctionBranches,
  rollRoomEnemies,
} from './worldMap';
import { eventBus } from '@/lib/eventBus';
import {
  initCombat, resolvePlayerAttack, resolveQuickhack, useItemInCombat,
  scanEnemy, attemptFlee, processEnemyTurn, advanceTurn, checkCombatEnd,
  syncCombatToCharacter, isPlayersTurn, getEnemyById,
  getAllLivingEnemies, getPlayerCombatant, getAvailableHacks,
  QUICKHACKS,
  type AttackResult, type HackResult, type ScanResult, type FleeResult,
} from './combat';
import {
  routeDialogue, buildDialogueRequest, recordInteraction,
  nudgeDisposition, getNPCColor, isNPCQuestGiver, detectsJobIntent,
  setLastEmote,
} from './npcEngine';
import {
  getFormattedShop, getShopkeeperName, buyItem, sellItem,
} from './shopSystem';
import {
  getAvailableQuests, getActiveQuests, startQuest, trackObjective,
  getQuestObjectiveProgress, QUEST_REGISTRY,
} from './questEngine';
import {
  playSegments, parseVoiceSegments,
  replayAudio, stopAllAndReset, getActiveAudioId,
  formatNPCDialogue,
} from './mudAudio';

// ── ActionGlyph — tappable command button for entity panels ─────────────────

interface ActionGlyphProps {
  label: string;
  command: string;
  variant?: 'combat' | 'social' | 'info';
  ariaLabel?: string;
}

function ActionGlyph({ label, command, variant = 'info', ariaLabel }: ActionGlyphProps) {
  const borderColors = {
    combat: 'rgba(255,107,107,0.5)',
    social: 'rgba(252,211,77,0.5)',
    info: 'rgba(var(--phosphor-rgb),0.35)',
  };
  const textColors = {
    combat: '#ff6b6b',
    social: '#fcd34d',
    info: 'rgba(var(--phosphor-rgb),0.7)',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        eventBus.emit('mud:execute-command', { command });
      }}
      aria-label={ariaLabel ?? `${label.toLowerCase()}`}
      style={{
        fontFamily: 'monospace',
        fontSize: '0.75em',
        lineHeight: 1,
        padding: '0.25rem 0.5rem',
        minHeight: 28,
        minWidth: 28,
        background: 'transparent',
        border: `1px solid ${borderColors[variant]}`,
        color: textColors[variant],
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        transition: 'background 0.12s, box-shadow 0.12s',
        touchAction: 'manipulation',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.background =
          variant === 'combat' ? 'rgba(255,68,68,0.1)' : 'rgba(var(--phosphor-rgb),0.08)';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.background = 'transparent';
      }}
    >
      {label}
    </button>
  );
}

// ── TouchableEntity — expandable room element with action panel ─────────────
// Uses window-level state for cross-instance coordination since these render
// inside addLocalMsg and don't share React tree context.

let _expandedEntityId: string | null = null;

function emitPanelState(id: string | null): void {
  _expandedEntityId = id;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mud:panel-state', { detail: { expandedId: id } }));
  }
}

// Collapse all panels (called on new input)
export function collapseMudPanels(): void {
  emitPanelState(null);
}

interface EntityPanelContent {
  title: string;
  description: string;
  titleColor: string;
  borderColor: string;
  bgColor: string;
  glyphs: ActionGlyphProps[];
  hpBar?: React.ReactNode;
  playGlyph?: React.ReactNode;
}

function TouchableEntity({
  entityId,
  children,
  panelContent,
  inline = false,
}: {
  entityId: string;
  children: React.ReactNode;
  panelContent: EntityPanelContent;
  inline?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setExpanded(detail?.expandedId === entityId);
    };
    window.addEventListener('mud:panel-state', handler);
    return () => window.removeEventListener('mud:panel-state', handler);
  }, [entityId]);

  const toggle = () => {
    if (_expandedEntityId === entityId) {
      emitPanelState(null);
    } else {
      emitPanelState(entityId);
    }
  };

  const Wrapper = inline ? 'span' : 'div';

  return (
    <Wrapper style={inline ? { display: 'inline' } : undefined}>
      <Wrapper
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
        aria-expanded={expanded}
        style={{ cursor: 'pointer', userSelect: 'none', ...(inline ? { display: 'inline' } : {}) }}
      >
        {children}
      </Wrapper>
      {expanded && (
        <div style={{
          padding: '0.35rem 0.5rem 0.25rem 2ch',
          marginTop: '0.1rem',
          marginBottom: '0.2rem',
          borderLeft: `2px solid ${panelContent.borderColor}`,
          background: panelContent.bgColor,
          animation: 'panel-expand 150ms ease-out',
        }}>
          <div style={{
            fontFamily: 'monospace',
            fontSize: S.base,
            color: panelContent.titleColor,
            fontWeight: 'bold',
            marginBottom: '0.15rem',
          }}>
            {panelContent.title}
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.85em',
            color: 'rgba(var(--phosphor-rgb),0.65)',
            lineHeight: 1.6,
            marginBottom: '0.3rem',
          }}>
            {panelContent.description}
          </div>
          {panelContent.hpBar}
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            paddingTop: '0.15rem',
          }}>
            {panelContent.glyphs.map(g => (
              <ActionGlyph key={g.label} {...g} />
            ))}
            {panelContent.playGlyph}
          </div>
        </div>
      )}
      <style>{`
        @keyframes panel-expand {
          from { opacity: 0; max-height: 0; transform: translateX(-8px); }
          to { opacity: 1; max-height: 300px; transform: translateX(0); }
        }
      `}</style>
    </Wrapper>
  );
}

// ── TypeWriter — reveals text character by character ────────────────────────
// Mounts with full text hidden, reveals at ~25ms per char.
// Faster than real typing but gives the impression of live generation.

function TypeWriter({
  segments,
  npcColor,
  speed = 20,
}: {
  segments: Array<{ segType?: string; displayText: string }>;
  npcColor: string;
  speed?: number;
}) {
  const fullText = segments.map(s => s.displayText).join(' ');
  const [revealed, setRevealed] = React.useState(0);

  React.useEffect(() => {
    if (revealed >= fullText.length) return;
    const timer = setTimeout(() => setRevealed(r => r + 1), speed);
    return () => clearTimeout(timer);
  }, [revealed, fullText.length, speed]);

  // Map revealed character count back to segments
  let charCount = 0;
  return (
    <>
      {segments.map((seg, si) => {
        const segText = seg.displayText + (si < segments.length - 1 ? ' ' : '');
        const segStart = charCount;
        charCount += segText.length;

        if (segStart >= revealed) return null; // not revealed yet

        const visibleChars = Math.min(segText.length, revealed - segStart);
        const visible = segText.slice(0, visibleChars);
        const isNarration = seg.segType === 'narration';

        return (
          <span key={si} style={{
            color: isNarration ? '#d4d4d4' : npcColor,
            ...(isNarration ? { fontStyle: 'italic' as const } : {}),
          }}>
            {visible}
            {visibleChars < segText.length && visibleChars === revealed - segStart && (
              <span style={{
                display: 'inline-block',
                width: '0.5ch',
                height: '1em',
                background: npcColor,
                verticalAlign: 'text-bottom',
                opacity: 0.8,
                animation: 'cursor-blink 0.6s step-end infinite',
              }} />
            )}
          </span>
        );
      })}
      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}

// ── TappableExit — clickable exit that fires /go directly ───────────────────

function TappableExit({ exit }: { exit: RoomExit }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (exit.locked) {
      // Show inline locked message instead of moving
      eventBus.emit('mud:execute-command', { command: `/examine ${exit.direction}` });
    } else {
      eventBus.emit('mud:execute-command', { command: `/go ${exit.direction}` });
      eventBus.emit('crt:glitch-tier', { tier: 1, duration: 150 });
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(e as unknown as React.MouseEvent); }}
      style={{
        cursor: 'pointer',
        paddingLeft: '2ch',
        fontFamily: 'monospace',
        fontSize: S.base,
        lineHeight: 1.8,
        display: 'flex',
        alignItems: 'baseline',
        touchAction: 'manipulation',
      }}
    >
      <span style={{
        fontWeight: 'bold',
        minWidth: '8ch',
        display: 'inline-block',
        color: C.exit,
        textDecoration: 'none',
        borderBottom: '1px solid transparent',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.borderBottomColor = C.exit; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.borderBottomColor = 'transparent'; }}
      >
        {exit.direction}
      </span>
      <span style={{ opacity: 0.8, color: C.dim }}>
        {exit.description.replace(/^[a-z]+ \(/, '(').replace(/\)$/, ')')}
        {exit.locked ? ' [LOCKED]' : ''}
        {exit.zoneTransition ? ' [ZONE]' : ''}
      </span>
    </div>
  );
}

// ── TappableObject — individual object name that expands to action panel ────

function TappableObject({ obj, entityId }: { obj: RoomObject; entityId: string }) {
  const glyphs: ActionGlyphProps[] = [
    { label: 'EXAMINE', command: `/examine ${obj.name}`, variant: 'info', ariaLabel: `examine ${obj.name}` },
  ];
  if (obj.lootable) {
    glyphs.push({ label: 'TAKE', command: `/take ${obj.name}`, variant: 'info', ariaLabel: `take ${obj.name}` });
  }
  if (obj.interactable) {
    glyphs.push({ label: 'USE', command: `/use ${obj.name}`, variant: 'info', ariaLabel: `use ${obj.name}` });
  }

  return (
    <TouchableEntity
      entityId={entityId}
      inline
      panelContent={{
        title: obj.name.toUpperCase(),
        description: obj.examineText.split('.')[0] + '.',
        titleColor: C.object,
        borderColor: 'rgba(var(--phosphor-rgb),0.15)',
        bgColor: 'rgba(var(--phosphor-rgb),0.03)',
        glyphs,
      }}
    >
      <span style={{
        color: C.object,
        cursor: 'pointer',
        borderBottom: '1px dotted rgba(var(--phosphor-rgb),0.3)',
        transition: 'border-color 0.15s',
      }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.borderBottomColor = C.object; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.borderBottomColor = 'rgba(var(--phosphor-rgb),0.3)'; }}
      >
        {obj.name}
      </span>
    </TouchableEntity>
  );
}

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  glow:   'text-glow',
  accent: 'var(--phosphor-accent)',
};

// ── PlayGlyph — floating play/stop control for voiced text ──────────────────
// Attaches to playable text blocks (room descriptions, NPC dialogue).
// Listens for audio state via CustomEvent on window.

interface PlayGlyphProps {
  audioId: string;
  ttsText: string;
  voiceKey: string;
}

function PlayGlyph({ audioId, ttsText, voiceKey }: PlayGlyphProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsPlaying(detail?.audioId === audioId);
    };
    window.addEventListener('mud:audio-state', handler);
    // Check if already playing on mount
    setIsPlaying(getActiveAudioId() === audioId);
    return () => window.removeEventListener('mud:audio-state', handler);
  }, [audioId]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopAllAndReset();
    } else {
      replayAudio(audioId, ttsText, voiceKey);
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.15rem 0.3rem',
        marginTop: '0.2rem',
        fontFamily: 'monospace',
        fontSize: '0.75em',
        lineHeight: 1,
        color: isPlaying ? '#ff69b4' : 'rgba(var(--phosphor-rgb),0.4)',
        textShadow: isPlaying ? '0 0 8px #ff69b4, 0 0 16px rgba(255,105,180,0.4)' : 'none',
        transition: 'color 0.2s, text-shadow 0.3s',
        animation: isPlaying ? 'glyph-pulse 1.5s ease-in-out infinite' : 'none',
      }}
      title={isPlaying ? 'stop' : 'play'}
    >
      {isPlaying ? '■ STOP' : '▶ PLAY'}
      <style>{`
        @keyframes glyph-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </button>
  );
}

const C = {
  green:     '#d4d4d4',           // room text — light grey for readability
  accent:    'var(--phosphor-accent)',
  dim:       'rgba(var(--phosphor-rgb),0.75)',   // was 0.45 — readable now
  dimmer:    'rgba(var(--phosphor-rgb),0.55)',   // was 0.25
  error:     '#ff6b6b',
  n1x:       '#bf00ff',
  npc:       '#fcd34d',
  enemy:     '#ff6b6b',
  object:    'rgba(var(--phosphor-rgb),0.85)',   // was 0.7
  exit:      'var(--phosphor-accent)',
  safe:      '#a5f3fc',
  stat:      'var(--phosphor-green)',
  warning:   '#ff8c00',
  combat:    '#ff4444',
  combatHud: '#ff6b6b',
  heal:      '#4ade80',
  hack:      '#c084fc',
  quest:     '#fbbf24',
  questDone: '#4ade80',
  shop:      '#fcd34d',
  // Semantic aliases for inline use — never go below 0.6 effective
  hint:      'rgba(var(--phosphor-rgb),0.65)',   // hints, tips, secondary info
  label:     'rgba(var(--phosphor-rgb),0.8)',    // section headers, labels
};

// ── Types ───────────────────────────────────────────────────────────────────

type AddLocalMsg = (node: React.ReactNode) => void;

export interface MudContext {
  addLocalMsg:  AddLocalMsg;
  handle:       string;
  session:      MudSession;
  setSession:   (s: MudSession) => void;
}

export type MudRouteResult = {
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
      opacity: error ? 0.9 : 0.85,
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
      <MudLine key={k('entry-static')} color={C.dim}>
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
        <MudLine color={C.dim}>type 1, 2, or 3</MudLine>
      </div>
    )},
  ]);

  // Store subjectId in creation state for later use
  (session.creation as CreationProgress & { _subjectId?: string })._subjectId = subjectId;
  setSession({ ...session });
}

export function handleCreationInput(input: string, ctx: MudContext): MudRouteResult {
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
            <MudLine color={C.dim}>type 1, 2, 3, or 4</MudLine>
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
            <MudLine color={C.dim}>
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
            <MudLine color={C.dim}>
              format: BODY 7 REFLEX 5 TECH 4 COOL 3 INT 5 GHOST 6
            </MudLine>
            <MudLine color={C.dim}>
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
                <div style={{ color: C.dim, fontFamily: 'monospace', fontSize: S.base, paddingLeft: '4ch', }}>
                  {opt.description}
                </div>
              </div>
            ))}
            <MudSpacer />
            <MudLine color={C.dim}>
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
            <MudLine indent color={C.dim}>BODY {attributes.BODY} · REFLEX {attributes.REFLEX} · TECH {attributes.TECH} · COOL {attributes.COOL} · INT {attributes.INT} · GHOST {attributes.GHOST}</MudLine>
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

  // Reset panel mode to default on /look (exits inventory/shop view)
  eventBus.emit('mud:panel-mode', { mode: 'default' });

  // Narrative-only output — NPCs, enemies, objects, exits are in the HUD panels
  addLocalMsg(
    <div key={k('look')}>
      {/* Zone + room header */}
      <MudLine color={C.accent} glow bold>
        {zone?.name ?? 'UNKNOWN ZONE'} — {room.name}
      </MudLine>

      {room.isSafeZone && (
        <MudLine color={C.safe} opacity={0.8}>[ SAFE ZONE ]</MudLine>
      )}

      <MudSpacer />

      {/* Room description — flowing paragraphs */}
      {room.description.split('\n\n').map((para, pi) => (
        <div key={k(`desc-p-${pi}`)} style={{
          fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8,
          color: C.green, opacity: 0.85,
          marginBottom: '0.4rem',
        }}>
          {para.replace(/\n/g, ' ')}
        </div>
      ))}
      <PlayGlyph audioId={`room:${char.currentRoom}`} ttsText={room.description} voiceKey="narrator" />
    </div>
  );

  // Narrator voice — read room description (fire-and-forget, non-blocking)
  const hasNPCs = room.npcs.length > 0;
  const primaryNPC = hasNPCs ? room.npcs[0].id : 'narrator';
  const segments = parseVoiceSegments(room.description, primaryNPC);
  playSegments(segments, `room:${char.currentRoom}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── COMBAT HUD ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// renderCombatHUD — REMOVED (v3)
// The MudHUDContainer panels now display all combat state persistently:
// - Left panel: YOUR TURN / COMBAT with action buttons, RAM bar, consumables
// - Right panel: HOSTILES with HP bars, ATK/SCAN buttons, effects
// - Status bar: HP, XP, level, currency, combat round indicator
// No need to dump a text snapshot into chat after every action.
function renderCombatHUD(_session: MudSession, _addLocalMsg: AddLocalMsg): void {
  // no-op — kept as function to avoid dead call site errors during transition
}

// Process all enemy turns after player ends turn
function processAllEnemyTurns(session: MudSession, addLocalMsg: AddLocalMsg): void {
  const combat = session.combat;
  const char = session.character;
  if (!combat || !char) return;

  // Advance past player's turn
  let next = advanceTurn(combat);

  // Process each enemy turn until it's the player's turn again
  while (next.nextId !== 'player') {
    const enemy = getEnemyById(combat, next.nextId) ?? getAllLivingEnemies(combat).find(e => e.id === next.nextId);
    if (!enemy || enemy.hp <= 0) {
      next = advanceTurn(combat);
      continue;
    }

    const action = processEnemyTurn(combat, next.nextId);
    if (action.flavorText) {
      addLocalMsg(
        <div key={k(`enemy-act-${action.attackerId}`)} style={{ marginBottom: '0.3rem' }}>
          <MudLine color={action.hit === false ? C.dim : C.enemy}>
            {action.flavorText}
            {action.crit ? <span style={{ color: '#ff4444', fontWeight: 'bold' }}> CRITICAL!</span> : ''}
          </MudLine>
        </div>
      );
    }

    // Check if player died
    const player = getPlayerCombatant(combat);
    if (player && player.hp <= 0) {
      syncCombatToCharacter(combat, char);
      return; // Player death handled by caller
    }

    next = advanceTurn(combat);
    if (next.newRound) break; // New round = back to player
  }

  syncCombatToCharacter(combat, char);

  // Round divider — visual breath between rounds
  addLocalMsg(
    <div key={k('round-div')} style={{
      fontFamily: 'monospace', fontSize: 'var(--text-base)',
      color: 'rgba(var(--phosphor-rgb),0.2)',
      margin: '0.3rem 0',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    }}>
      {'\u2500'.repeat(40)}
    </div>
  );
}

// Enter combat from room enemies
function triggerCombat(session: MudSession, addLocalMsg: AddLocalMsg, setSession: (s: MudSession) => void): void {
  const char = session.character;
  if (!char) return;

  const room = getRoom(char.currentRoom);
  if (!room || room.enemies.length === 0 || room.isSafeZone) return;

  const spawned = rollRoomEnemies(char.currentRoom);
  if (spawned.length === 0) return;

  const combat = initCombat(char, spawned);
  const updated = { ...session, phase: 'combat' as const, combat };
  setSession(updated);
  saveCombat(char.handle, combat);

  // Reset panel mode on combat start
  eventBus.emit('mud:panel-mode', { mode: 'default' });

  // Entry announcement
  eventBus.emit('crt:glitch-tier', { tier: 2, duration: 350 });
  const names = spawned.map(e => `${e.name} (Lv.${e.level})`).join(', ');
  addLocalMsg(
    <div key={k('combat-start')}>
      <MudSpacer />
      <MudLine color={C.combat} glow bold>
        &gt;&gt; COMBAT INITIATED
      </MudLine>
      <MudLine color={C.enemy}>
        hostile{spawned.length > 1 ? 's' : ''}: {names}
      </MudLine>
    </div>
  );

  // Show initiative order
  const first = combat.turnOrder[0];
  if (first === 'player') {
    addLocalMsg(
      <MudLine key={k('init-player')} color={C.stat} opacity={0.7}>
        you act first.
      </MudLine>
    );
  } else {
    addLocalMsg(
      <MudLine key={k('init-enemy')} color={C.enemy} opacity={0.7}>
        they act first.
      </MudLine>
    );
    // Process enemy turns immediately
    processAllEnemyTurns(updated, addLocalMsg);
    setSession({ ...updated });
  }
}

// Handle player death
function handleDeath(session: MudSession, addLocalMsg: AddLocalMsg, setSession: (s: MudSession) => void): void {
  const char = session.character;
  if (!char) return;

  char.isDead = true;
  char.deaths += 1;
  saveCharacter(char.handle, char);
  clearCombat(char.handle);

  const updated: MudSession = { ...session, phase: 'dead', combat: null };
  setSession(updated);

  addLocalMsg(
    <div key={k('death')}>
      <MudSpacer />
      <MudLine color={C.combat} glow bold>
        &gt;&gt; FLATLINE
      </MudLine>
      <MudLine color={C.dim}>
        hp reached zero. the tunnels claim another.
      </MudLine>
      <MudLine color={C.dim}>
        your gear lies where you fell. permadeath is permanent.
      </MudLine>
      <MudSpacer />
      <MudLine color={C.dim}>
        ghost channel access retained. /enter to create a new character.
      </MudLine>
    </div>
  );

  eventBus.emit('neural:glitch-trigger', { intensity: 1.0 });
}

// ══════════════════════════════════════════════════════════════════════════════
// ── COMMAND ROUTER ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export function handleMudCommand(input: string, ctx: MudContext): MudRouteResult {
  const { addLocalMsg, handle, session, setSession } = ctx;

  // ── During character creation, intercept ALL input ───────────────────────
  if (session.phase === 'character_creation' && session.creation) {
    return handleCreationInput(input, ctx);
  }

  // ── Dead phase — character is gone ──────────────────────────────────────
  if (session.phase === 'dead') {
    addLocalMsg(
      <MudNotice key={k('dead-cmd')} error>
        you are dead. your character is gone. /enter to start over.
      </MudNotice>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── Only process /commands when MUD is active or in combat ────────────
  if (session.phase !== 'active' && session.phase !== 'combat') {
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

  // ══════════════════════════════════════════════════════════════════════
  // ── COMBAT COMMANDS (only during combat phase) ───────────────────────
  // ══════════════════════════════════════════════════════════════════════

  if (session.phase === 'combat' && session.combat) {
    const combat = session.combat;
    const COMBAT_CMDS = ['attack', 'a', 'hack', 'h', 'use', 'u', 'scan', 'flee', 'run', 'stats', 'inventory', 'inv', 'i', 'save', 'mudhelp', 'mhelp', 'commands', 'help', '?'];

    if (!COMBAT_CMDS.includes(cmd)) {
      addLocalMsg(
        <MudNotice key={k('combat-block')} error>
          you're in combat. /attack · /hack · /use · /scan · /flee
        </MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    if (!isPlayersTurn(combat)) {
      addLocalMsg(
        <MudNotice key={k('not-turn')} error>not your turn.</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    // ── /attack [target] ────────────────────────────────────────────────
    if (cmd === 'attack' || cmd === 'a') {
      const enemies = getAllLivingEnemies(combat);
      if (enemies.length === 0) {
        addLocalMsg(<MudNotice key={k('atk-none')} error>no enemies to attack.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      // Target selection: by name or default first enemy
      let target = enemies[0];
      if (rest) {
        const match = enemies.find(e => e.name.toLowerCase().includes(rest.toLowerCase()) || e.id.includes(rest));
        if (match) target = match;
      }

      const result = resolvePlayerAttack(combat, target.id, char);
      if ('error' in result) {
        addLocalMsg(<MudNotice key={k('atk-err')} error>{result.error}</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      const r = result as AttackResult;
      addLocalMsg(
        <div key={k('atk-result')} style={{ marginBottom: '0.4rem' }}>
          <MudLine color={r.hit ? C.stat : C.dim}>
            you strike at {r.targetName} —
            roll: {r.roll} + mods = {r.attackTotal} vs {r.defenseTotal}
          </MudLine>
          {r.hit ? (
            <MudLine color={r.crit ? C.combat : C.stat} bold={r.crit}>
              &gt;&gt; {r.crit ? 'CRITICAL HIT' : 'HIT'} — {r.damage} damage.
              {r.killed ? ` ${r.targetName} goes down.` : ''}
            </MudLine>
          ) : (
            <MudLine color={C.dim}>
              &gt;&gt; MISS — {r.flavorMiss}
            </MudLine>
          )}
        </div>
      );

      syncCombatToCharacter(combat, char);
      saveCombat(char.handle, combat);

      // Check combat end
      const endCheck = checkCombatEnd(combat, []);
      if (endCheck.over) {
        if (endCheck.victory) {
          clearCombat(char.handle);
          const xpResult = addXP(char, endCheck.xpGained);
          saveCharacter(char.handle, char);
          setSession({ ...session, phase: 'active', combat: null });
          addLocalMsg(
            <div key={k('combat-win')}>
              <MudSpacer />
              <MudLine color={C.stat} glow bold>&gt;&gt; COMBAT RESOLVED</MudLine>
              <MudLine indent color={C.stat}>+{endCheck.xpGained} XP{xpResult.leveled ? ` · LEVEL UP → ${xpResult.newLevel}` : ''}</MudLine>
              {endCheck.drops.length > 0 && (
                <MudLine indent color={C.dim}>
                  drops: {endCheck.drops.join(', ')}
                </MudLine>
              )}
            </div>
          );
          // Track kills for quests
          trackObjective(char.handle, 'kill', 'any', 1);
        } else {
          handleDeath(session, addLocalMsg, setSession);
        }
        return { handled: true, stopPropagation: true };
      }

      // If player has AP left, refresh HUD panels
      const player = getPlayerCombatant(combat);
      if (player && player.ap > 0) {
        setSession({ ...session });
      } else {
        // End of player turn — process enemy turns
        addLocalMsg(<MudLine key={k('turn-end')} color={C.dim}>— end of your turn —</MudLine>);
        processAllEnemyTurns(session, addLocalMsg);
        // Check death after enemy turns
        if (char.hp <= 0) {
          handleDeath(session, addLocalMsg, setSession);
          return { handled: true, stopPropagation: true };
        }
        saveCombat(char.handle, combat);
        setSession({ ...session });
      }

      return { handled: true, stopPropagation: true };
    }

    // ── /hack [target] [hackname] ───────────────────────────────────────
    if (cmd === 'hack' || cmd === 'h') {
      const hacks = getAvailableHacks(char.attributes.TECH, char.combatStyle);
      if (hacks.length === 0) {
        addLocalMsg(
          <MudNotice key={k('hack-none')} error>
            {char.combatStyle !== 'SYNAPSE' ? 'quickhacking requires SYNAPSE combat style or TECH ≥ 6.' : 'no hacks available at your TECH level.'}
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }

      const args = rest.split(/\s+/);
      if (!rest || args.length === 0) {
        // Show available hacks
        addLocalMsg(
          <div key={k('hack-list')}>
            <MudLine color={C.hack} bold>QUICKHACKS (RAM: {char.ram}/{char.maxRam})</MudLine>
            {hacks.map(h => (
              <MudLine key={k(`hack-${h.id}`)} indent color={h.ramCost <= (char.ram ?? 0) ? C.hack : C.dim}>
                /hack {h.id.replace(/_/g, ' ')} — {h.description} (RAM: {h.ramCost})
              </MudLine>
            ))}
          </div>
        );
        return { handled: true, stopPropagation: true };
      }

      // Parse hack name from args
      const hackName = args.join('_').toLowerCase().replace(/ /g, '_');
      const hack = hacks.find(h => h.id.includes(hackName) || h.name.toLowerCase().includes(args.join(' ').toLowerCase()));
      if (!hack) {
        addLocalMsg(<MudNotice key={k('hack-nf')} error>unknown hack. type /hack to see available.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      const enemies = getAllLivingEnemies(combat);
      const target = enemies[0];
      if (!target) {
        addLocalMsg(<MudNotice key={k('hack-notarget')} error>no targets.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      const result = resolveQuickhack(combat, target.id, hack.id, char);
      if ('error' in result) {
        addLocalMsg(<MudNotice key={k('hack-err')} error>{result.error}</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      const hr = result as HackResult;
      char.ram = getPlayerCombatant(combat)?.ram ?? char.ram;

      addLocalMsg(
        <div key={k('hack-result')} style={{ marginBottom: '0.4rem' }}>
          <MudLine color={C.hack}>
            uploading {hr.hackName} → {hr.targetName}
            — roll: {hr.roll} + TECH = {hr.attackTotal} vs {hr.defenseTotal}
          </MudLine>
          {hr.hit ? (
            <MudLine color={C.hack} bold>
              &gt;&gt; BREACH — {hr.damage > 0 ? `${hr.damage} damage` : ''}{hr.effect ? ` · ${hr.effect}` : ''}
              {hr.killed ? ` · ${hr.targetName} flatlines.` : ''} (RAM: {char.ram}/{char.maxRam})
            </MudLine>
          ) : (
            <MudLine color={C.dim}>
              &gt;&gt; BLOCKED — firewall held. RAM spent: {hr.ramSpent}
            </MudLine>
          )}
        </div>
      );

      syncCombatToCharacter(combat, char);
      saveCombat(char.handle, combat);

      // Check end / continue
      const endCheck = checkCombatEnd(combat, []);
      if (endCheck.over) {
        if (endCheck.victory) {
          clearCombat(char.handle);
          const xpResult = addXP(char, endCheck.xpGained);
          saveCharacter(char.handle, char);
          setSession({ ...session, phase: 'active', combat: null });
          addLocalMsg(
            <MudLine key={k('combat-win-h')} color={C.stat} glow bold>
              &gt;&gt; COMBAT RESOLVED · +{endCheck.xpGained} XP{xpResult.leveled ? ` · LEVEL ${xpResult.newLevel}` : ''}
            </MudLine>
          );
        } else {
          handleDeath(session, addLocalMsg, setSession);
        }
        return { handled: true, stopPropagation: true };
      }

      const player = getPlayerCombatant(combat);
      if (player && player.ap > 0) {
        setSession({ ...session });
      } else {
        addLocalMsg(<MudLine key={k('turn-end-h')} color={C.dim}>— end of your turn —</MudLine>);
        processAllEnemyTurns(session, addLocalMsg);
        if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
        saveCombat(char.handle, combat);
        setSession({ ...session });
      }

      return { handled: true, stopPropagation: true };
    }

    // ── /use [item] in combat ───────────────────────────────────────────
    if (cmd === 'use' || cmd === 'u') {
      if (!rest) {
        const healables = char.inventory.filter(i => i.healAmount).map((i, idx) => `${idx}: ${i.name} (+${i.healAmount} HP)`);
        if (healables.length === 0) {
          addLocalMsg(<MudNotice key={k('use-none')} error>no usable items.</MudNotice>);
        } else {
          addLocalMsg(
            <div key={k('use-list')}>
              <MudLine color={C.heal}>usable items:</MudLine>
              {healables.map((h, i) => <MudLine key={k(`use-${i}`)} indent color={C.heal}>{h}</MudLine>)}
              <MudLine color={C.dim}>/use &lt;name or index&gt;</MudLine>
            </div>
          );
        }
        return { handled: true, stopPropagation: true };
      }

      // Find item by name or index
      let idx = parseInt(rest, 10);
      if (isNaN(idx)) {
        idx = char.inventory.findIndex(i => i.name.toLowerCase().includes(rest.toLowerCase()) && i.healAmount);
      }

      const result = useItemInCombat(combat, char, idx);
      if (result.error) {
        addLocalMsg(<MudNotice key={k('use-err')} error>{result.error}</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      addLocalMsg(
        <MudLine key={k('use-ok')} color={C.heal}>
          used {result.itemName} — restored {result.healed} HP ({char.hp}/{char.maxHp})
        </MudLine>
      );

      syncCombatToCharacter(combat, char);
      saveCombat(char.handle, combat);

      const player = getPlayerCombatant(combat);
      if (player && player.ap > 0) {
        setSession({ ...session });
      } else {
        processAllEnemyTurns(session, addLocalMsg);
        if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
        saveCombat(char.handle, combat);
        setSession({ ...session });
      }

      return { handled: true, stopPropagation: true };
    }

    // ── /scan [target] ──────────────────────────────────────────────────
    if (cmd === 'scan') {
      const enemies = getAllLivingEnemies(combat);
      const target = rest ? enemies.find(e => e.name.toLowerCase().includes(rest.toLowerCase())) : enemies[0];
      if (!target) {
        addLocalMsg(<MudNotice key={k('scan-none')} error>no target to scan.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      const result = scanEnemy(combat, target.id, char);
      if ('error' in result) {
        addLocalMsg(<MudNotice key={k('scan-err')} error>{result.error}</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      const sr = result as ScanResult;
      if (!sr.success) {
        addLocalMsg(<MudLine key={k('scan-fail')} color={C.dim}>scan failed — insufficient data on {sr.targetName}.</MudLine>);
      } else {
        // Compact scan: name + HP, attributes on one line, weaknesses on one line
        const attrLine = sr.attributes
          ? (Object.keys(sr.attributes) as AttributeName[]).map(a => `${a} ${sr.attributes![a]}`).join(' \u00b7 ')
          : '';
        addLocalMsg(
          <div key={k('scan-ok')} style={{ marginBottom: '0.4rem' }}>
            <MudLine color={C.accent} bold>
              SCAN: {sr.targetName} {'\u2014'} HP {sr.hp}/{sr.maxHp}
            </MudLine>
            {attrLine && (
              <MudLine indent color={C.dim}>{attrLine}</MudLine>
            )}
            {sr.weaknesses && sr.weaknesses.length > 0 && (
              <MudLine indent color={C.warning}>
                weak: {sr.weaknesses.join('; ')}
              </MudLine>
            )}
          </div>
        );
      }

      saveCombat(char.handle, combat);
      const player = getPlayerCombatant(combat);
      if (player && player.ap > 0) setSession({ ...session });
      else {
        processAllEnemyTurns(session, addLocalMsg);
        if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
        saveCombat(char.handle, combat);
        setSession({ ...session });
      }

      return { handled: true, stopPropagation: true };
    }

    // ── /flee ───────────────────────────────────────────────────────────
    if (cmd === 'flee' || cmd === 'run') {
      const result = attemptFlee(combat, char);
      if ('error' in result) {
        addLocalMsg(<MudNotice key={k('flee-err')} error>{result.error}</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      const fr = result as FleeResult;
      addLocalMsg(
        <MudLine key={k('flee-result')} color={fr.success ? C.stat : C.enemy}>
          {fr.flavorText}
          {fr.damageTaken ? ` (${fr.damageTaken} damage)` : ''}
        </MudLine>
      );

      syncCombatToCharacter(combat, char);

      if (fr.success) {
        clearCombat(char.handle);
        saveCharacter(char.handle, char);
        setSession({ ...session, phase: 'active', combat: null });
        addLocalMsg(
          <MudLine key={k('flee-ok')} color={C.dim}>
            combat ended. you escaped.
          </MudLine>
        );
      } else {
        if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
        saveCombat(char.handle, combat);
        processAllEnemyTurns(session, addLocalMsg);
        if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
        setSession({ ...session });
      }

      return { handled: true, stopPropagation: true };
    }

    // Fall through to stats/inv/save/mudhelp below
  }

  // ── Block non-combat navigation during combat ─────────────────────────
  if (session.phase === 'combat') {
    const allowedInCombat = ['stats', 'status', 'inventory', 'inv', 'i', 'save', 'mudhelp', 'mhelp', 'commands'];
    if (!allowedInCombat.includes(cmd)) {
      addLocalMsg(
        <MudNotice key={k('combat-only')} error>
          finish the fight first. /attack · /hack · /flee
        </MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }
  }

  // ── /help /? — redirect to mudhelp when in MUD ─────────────────────────
  if (cmd === 'help' || cmd === '?') {
    // Re-route to mudhelp handler
    return handleMudCommand('/mudhelp', ctx);
  }

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
        <MudLine color={C.dim}>EXITS from {room?.name ?? 'unknown'}:</MudLine>
        {visibleExits.map(exit => (
          <MudLine key={k(`exit-${exit.direction}`)} indent color={C.exit}>
            {exit.direction} — {exit.description}
            {exit.locked ? ' [LOCKED]' : ''}
          </MudLine>
        ))}
        {char.currentRoom === 'z08_r03' && (
          <>
            <MudSpacer />
            <MudLine color={C.dim}>
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

    // Reset panel mode on room change (exit inventory/shop view)
    eventBus.emit('mud:panel-mode', { mode: 'default' });

    // Zone transition notification
    const prevRoom = getRoom(prevRoomId);

    // CRT transition effect
    const isZoneChange = targetRoom.zone !== (prevRoom?.zone ?? '');
    eventBus.emit('crt:glitch-tier', { tier: isZoneChange ? 2 : 1, duration: isZoneChange ? 300 : 180 });

    if (isZoneChange) {
      const targetZone = getZone(targetRoom.zone);
      addLocalMsg(
        <MudLine key={k('zone-change')} color={C.warning} glow>
          &gt;&gt; ENTERING ZONE: {targetZone?.name ?? targetRoom.zone}
        </MudLine>
      );
    }

    // Auto-look
    const movedSession = { ...session, character: { ...char, currentRoom: result.targetRoom } };
    renderLook(movedSession, addLocalMsg);

    // Track room visit for quests
    trackObjective(handle, 'go_to', result.targetRoom);

    // Trigger enemy encounter if room has hostiles
    if (targetRoom.enemies.length > 0 && !targetRoom.isSafeZone) {
      setTimeout(() => triggerCombat(movedSession, addLocalMsg, setSession), 400);
    }

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
            <MudLine color={C.dim} style={{ marginTop: '0.15rem' }}>
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
        <MudLine color={C.dim}>
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
        <MudLine indent color={C.dim}>
          creds: {char.currency.creds} · scrip: {char.currency.scrip}
        </MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /inventory /inv ───────────────────────────────────────────────────
  if (cmd === 'inventory' || cmd === 'inv' || cmd === 'i') {
    // Switch right-top panel to inventory view
    eventBus.emit('mud:panel-mode', { mode: 'inventory' });
    addLocalMsg(
      <MudLine key={k('inv-ack')} color={C.dim} opacity={0.6}>
        inventory panel open.
      </MudLine>
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
    const sections: Array<{ title: string; cmds: Array<{ cmd: string; desc: string }> }> = [
      { title: 'NAVIGATION', cmds: [
        { cmd: '/look',              desc: 'Examine your surroundings' },
        { cmd: '/go <dir>',          desc: 'Move to a direction or named room' },
        { cmd: '/exits',             desc: 'List available exits' },
        { cmd: '/examine <thing>',   desc: 'Inspect an object, NPC, or detail' },
        { cmd: '/where',             desc: 'Show current zone and room' },
      ]},
      { title: 'COMBAT', cmds: [
        { cmd: '/attack [target]',   desc: 'Melee/ranged attack (1 AP)' },
        { cmd: '/hack [name]',       desc: 'Upload quickhack (2 AP, needs RAM)' },
        { cmd: '/use [item]',        desc: 'Use item in combat (1 AP)' },
        { cmd: '/scan [target]',     desc: 'Analyze enemy stats (1 AP)' },
        { cmd: '/flee',              desc: 'Attempt escape (2 AP)' },
      ]},
      { title: 'SOCIAL', cmds: [
        { cmd: '/talk <npc>',        desc: 'Address an NPC directly' },
        { cmd: '/me <action>',       desc: 'Perform an emote (NPCs notice)' },
        { cmd: '/shop',              desc: 'Browse shop (when near vendor)' },
        { cmd: '/buy <item>',        desc: 'Purchase from shop' },
        { cmd: '/sell <item>',       desc: 'Sell to vendor' },
      ]},
      { title: 'QUEST', cmds: [
        { cmd: '/quests',            desc: 'Show active and available quests' },
        { cmd: '/quest <id>',        desc: 'Show quest details and progress' },
      ]},
      { title: 'CHARACTER', cmds: [
        { cmd: '/stats',             desc: 'Show your character sheet' },
        { cmd: '/inventory',         desc: 'Show carried items and gear' },
        { cmd: '/save',              desc: 'Manual save' },
      ]},
    ];

    addLocalMsg(
      <div key={k('mudhelp')}>
        <MudLine color={C.accent} bold>&gt;&gt; TUNNELCORE — COMMANDS</MudLine>
        {sections.map(s => (
          <div key={k(`mh-${s.title}`)}>
            <MudLine color={C.dim} style={{ marginTop: '0.3rem' }}>{s.title}</MudLine>
            {s.cmds.map(c => (
              <div key={k(`mh-${c.cmd}`)} style={{
                paddingLeft: '2ch', display: 'flex', gap: '1ch', flexWrap: 'wrap',
                fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8,
              }}>
                <span style={{ color: C.accent, minWidth: '20ch', flexShrink: 0 }}>{c.cmd}</span>
                <span style={{ color: C.dim, }}>{c.desc}</span>
              </div>
            ))}
          </div>
        ))}
        <MudSpacer />
        <MudLine color={C.dim}>
          talk to NPCs by typing without / — they'll respond if they're in the room
        </MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /talk <npc> ───────────────────────────────────────────────────────
  if (cmd === 'talk' || cmd === 'say') {
    if (!rest) {
      addLocalMsg(<MudNotice key={k('talk-err')} error>say what? /talk &lt;message&gt; or just type without /</MudNotice>);
      return { handled: true, stopPropagation: true };
    }
    // Route through the NPC dialogue system
    handleNPCDialogue(rest, { addLocalMsg, handle, session, setSession });
    return { handled: true, stopPropagation: true };
  }

  // ── /shop ─────────────────────────────────────────────────────────────
  if (cmd === 'shop') {
    const room = getRoom(char.currentRoom);
    if (!room) return { handled: true, stopPropagation: true };

    const shopkeeper = room.npcs.find(n => n.services?.includes('shop'));
    if (!shopkeeper) {
      addLocalMsg(<MudNotice key={k('shop-none')} error>no vendor here.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    const listings = getFormattedShop(shopkeeper.id, char);
    if (!listings) {
      addLocalMsg(<MudNotice key={k('shop-empty')} error>this vendor has nothing to sell.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    // Switch to shop panel mode — left shows stock, right-top shows player items
    eventBus.emit('mud:panel-mode', { mode: 'shop', npcId: shopkeeper.id });
    addLocalMsg(
      <MudLine key={k('shop-ack')} color={C.shop}>
        browsing {getShopkeeperName(shopkeeper.id)}&apos;s shop. /buy &lt;item&gt; · /sell &lt;item&gt; · /look to close.
      </MudLine>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /buy <item> ───────────────────────────────────────────────────────
  if (cmd === 'buy') {
    if (!rest) {
      addLocalMsg(<MudNotice key={k('buy-err')} error>buy what? /buy &lt;item name&gt;</MudNotice>);
      return { handled: true, stopPropagation: true };
    }
    const room = getRoom(char.currentRoom);
    const shopkeeper = room?.npcs.find(n => n.services?.includes('shop'));
    if (!shopkeeper) {
      addLocalMsg(<MudNotice key={k('buy-no-shop')} error>no vendor here.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    const listings = getFormattedShop(shopkeeper.id, char);
    const match = listings?.find(l => l.name.toLowerCase().includes(rest.toLowerCase()));
    if (!match) {
      addLocalMsg(<MudNotice key={k('buy-nf')} error>they don't sell that.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    const result = buyItem(char, shopkeeper.id, match.templateId);
    if (!result.success) {
      addLocalMsg(<MudNotice key={k('buy-fail')} error>{result.error}</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    saveCharacter(handle, char);
    addLocalMsg(
      <MudLine key={k('buy-ok')} color={C.shop}>
        purchased {result.item!.name} for {result.price}c. remaining: {char.currency.creds}c
      </MudLine>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /sell <item> ──────────────────────────────────────────────────────
  if (cmd === 'sell') {
    if (!rest) {
      addLocalMsg(<MudNotice key={k('sell-err')} error>sell what? /sell &lt;item name&gt;</MudNotice>);
      return { handled: true, stopPropagation: true };
    }
    const room = getRoom(char.currentRoom);
    const shopkeeper = room?.npcs.find(n => n.services?.includes('shop'));
    if (!shopkeeper) {
      addLocalMsg(<MudNotice key={k('sell-no-shop')} error>no vendor here.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    const idx = char.inventory.findIndex(i => i.name.toLowerCase().includes(rest.toLowerCase()));
    if (idx < 0) {
      addLocalMsg(<MudNotice key={k('sell-nf')} error>you don't have that.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    const result = sellItem(char, shopkeeper.id, idx);
    if (!result.success) {
      addLocalMsg(<MudNotice key={k('sell-fail')} error>{result.error}</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    saveCharacter(handle, char);
    addLocalMsg(
      <MudLine key={k('sell-ok')} color={C.shop}>
        sold {result.itemName} for {result.price}c. total: {char.currency.creds}c
      </MudLine>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /quests ───────────────────────────────────────────────────────────
  if (cmd === 'quests') {
    const world = loadWorld(handle);
    const active = getActiveQuests(world);
    const available = getAvailableQuests(char, world);

    addLocalMsg(
      <div key={k('quests')}>
        <MudLine color={C.quest} bold>&gt;&gt; QUEST LOG</MudLine>
        <MudSpacer />
        {active.length > 0 ? (
          <div>
            <MudLine color={C.quest} opacity={0.7}>ACTIVE:</MudLine>
            {active.map(q => {
              const progress = getQuestObjectiveProgress(handle, q.id);
              const done = progress?.objectives.filter(o => o.done).length ?? 0;
              const total = progress?.objectives.length ?? 0;
              return (
                <MudLine key={k(`aq-${q.id}`)} indent color={C.quest}>
                  {q.title} [{done}/{total}] — /quest {q.id}
                </MudLine>
              );
            })}
          </div>
        ) : (
          <MudLine color={C.dim}>no active quests.</MudLine>
        )}
        {available.length > 0 && (
          <div>
            <MudSpacer />
            <MudLine color={C.dim}>AVAILABLE (talk to quest giver):</MudLine>
            {available.map(q => (
              <MudLine key={k(`avq-${q.id}`)} indent color={C.dim}>
                {q.title} (from {q.giver}, Tier {q.tier})
              </MudLine>
            ))}
          </div>
        )}
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /quest <id> ───────────────────────────────────────────────────────
  if (cmd === 'quest') {
    if (!rest) {
      addLocalMsg(<MudNotice key={k('quest-err')} error>which quest? /quest &lt;id&gt;</MudNotice>);
      return { handled: true, stopPropagation: true };
    }
    const quest = QUEST_REGISTRY[rest] ?? Object.values(QUEST_REGISTRY).find(q => q.title.toLowerCase().includes(rest.toLowerCase()));
    if (!quest) {
      addLocalMsg(<MudNotice key={k('quest-nf')} error>quest not found.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }
    const progress = getQuestObjectiveProgress(handle, quest.id);
    const world = loadWorld(handle);
    const isActive = world.activeQuests.includes(quest.id);

    addLocalMsg(
      <div key={k('quest-detail')}>
        <MudLine color={C.quest} bold>{quest.title}</MudLine>
        <MudLine color={C.dim} indent>from: {quest.giver} · tier: {quest.tier} · type: {quest.type}</MudLine>
        <MudSpacer />
        <MudLine color={C.green} opacity={0.85}>{quest.description}</MudLine>
        {isActive && progress && (
          <div>
            <MudSpacer />
            <MudLine color={C.quest} opacity={0.7}>OBJECTIVES:</MudLine>
            {progress.objectives.map(o => (
              <MudLine key={k(`qobj-${o.id}`)} indent color={o.done ? C.questDone : C.dim}>
                {o.done ? '✓' : '○'} {o.description} ({o.current}/{o.required})
              </MudLine>
            ))}
          </div>
        )}
        {!isActive && (
          <MudLine color={C.dim} style={{ marginTop: '0.3rem' }}>
            talk to {quest.giver} to start this quest.
          </MudLine>
        )}
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /me <action> — player emote ─────────────────────────────────────────
  if (cmd === 'me' || cmd === 'emote') {
    if (!rest) {
      addLocalMsg(<MudNotice key={k('me-err')} error>/me &lt;action&gt; — describe what you do</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    addLocalMsg(
      <div key={k('emote')} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8 }}>
        <span style={{ color: C.accent }}>*</span>
        <span style={{ color: C.accent, fontWeight: 'bold' }}> {handle}</span>
        <span style={{ color: '#d4d4d4', fontStyle: 'italic' }}> {rest}</span>
      </div>
    );

    // Store emote for NPC context awareness
    setLastEmote(handle, rest);

    return { handled: true, stopPropagation: true };
  }

  // ── /q /quit /leave — exit MUD, save state, return to ghost channel ────
  if (cmd === 'q' || cmd === 'quit' || cmd === 'leave') {
    if (session.character) {
      saveFullSession(handle, session);
    }
    // Clear MUD session
    setSession({ phase: 'inactive', character: null, world: null, npcState: null, combat: null, creation: null } as MudSession);
    eventBus.emit('mud:exit');
    addLocalMsg(
      <div key={k('mud-exit')} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8 }}>
        <MudSpacer />
        <MudLine color={C.accent} glow>
          &gt;&gt; TUNNELCORE SESSION SUSPENDED
        </MudLine>
        <MudLine color={C.dim}>
          state saved. /enter to resume.
        </MudLine>
        <MudSpacer />
      </div>
    );
    // Let the ghost channel /q handler also disconnect
    return { handled: false };
  }

  // ── Block all non-MUD commands ────────────────────────────────────────
  // Don't let ghost channel commands (/who, /trust, /fragments, /me, etc.)
  // work during MUD. Everything is routed through MUD commands.
  addLocalMsg(
    <MudNotice key={k('unknown-mud')} error>
      unknown command: /{cmd} — type /help for available commands
    </MudNotice>
  );
  return { handled: true, stopPropagation: true };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── NPC DIALOGUE HANDLER (for non-/ input in rooms with NPCs) ───────────────
// ══════════════════════════════════════════════════════════════════════════════

export async function handleNPCDialogue(
  message: string,
  ctx: MudContext,
): Promise<void> {
  const { addLocalMsg, handle, session } = ctx;
  const char = session.character;
  if (!char) return;

  const room = getRoom(char.currentRoom);
  if (!room || room.npcs.length === 0) return;

  const targets = routeDialogue(message, char.currentRoom, char);
  if (targets.length === 0) return;

  const request = buildDialogueRequest(targets, message, room.name, char);

  // Show player's speech first
  addLocalMsg(
    <MudLine key={k('player-say')} color={C.green} opacity={0.9}>
      <span style={{ opacity: 0.75 }}>[you]</span> {message}
    </MudLine>
  );

  // Fire LLM request
  try {
    const res = await fetch('/api/mud/npc-dialogue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) throw new Error('npc-dialogue failed');
    const data = await res.json();
    const responses: Array<{ npcId: string; name: string; text: string }> = data.responses ?? [];

    // Stagger NPC responses for natural feel
    responses.forEach((resp, i) => {
      const npcAudioId = `npc:${resp.npcId}:${Date.now()}-${i}`;
      setTimeout(() => {
        const color = getNPCColor(resp.npcId);
        const formatted = formatNPCDialogue(resp.text, resp.name, resp.npcId);

        addLocalMsg(
          <div key={k(`npc-say-${resp.npcId}-${i}`)}>
            {/* NPC name attribution */}
            <span style={{ color, opacity: 0.5, fontSize: '0.8em', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {resp.name}
            </span>
            {/* Typewriter dialogue: narration in grey, speech in NPC color */}
            <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8 }}>
              <TypeWriter segments={formatted.segments} npcColor={color} speed={20} />
            </div>
            <PlayGlyph audioId={npcAudioId} ttsText={formatted.fullTTS} voiceKey={resp.npcId} />
          </div>
        );

        // Play voice segments (narrator + NPC switching)
        playSegments(formatted.segments, npcAudioId);

        // Record interaction + small disposition bump for talking
        recordInteraction(handle, resp.npcId, `player said: "${message.slice(0, 50)}" — ${resp.name} responded`);
        nudgeDisposition(handle, resp.npcId, 1);

        // Track talk_to for quests
        trackObjective(handle, 'talk_to', resp.npcId);
      }, (i + 1) * 600);
    });

    // ── Auto-start quest from QUESTGIVER NPCs ──────────────────────────
    // After all dialogue renders, check if a quest giver responded and
    // the player expressed job intent — auto-activate their first available quest
    const questGiverResps = responses.filter(r => isNPCQuestGiver(r.npcId));
    const isJobAsk = detectsJobIntent(message);

    if (isJobAsk && questGiverResps.length > 0 && char) {
      const world = loadWorld(handle);
      const afterDialogueDelay = (responses.length + 1) * 600 + 300;

      for (const qgResp of questGiverResps) {
        const available = getAvailableQuests(char, world).filter(q => q.giver === qgResp.npcId);
        if (available.length === 0) continue;

        const quest = available[0];
        const startResult = startQuest(handle, quest.id);
        if (!startResult.success) continue;

        setTimeout(() => {
          addLocalMsg(
            <div key={k(`quest-start-${quest.id}`)}>
              <MudSpacer />
              <MudLine color={C.quest} glow bold>
                &gt;&gt; QUEST ACTIVATED: {quest.title}
              </MudLine>
              <MudLine color={C.green} opacity={0.85} indent>
                {quest.description}
              </MudLine>
              <MudSpacer />
              <MudLine color={C.quest} opacity={0.7}>OBJECTIVES:</MudLine>
              {quest.objectives.map(obj => (
                <MudLine key={k(`qobj-${obj.id}`)} indent color={C.dim}>
                  ○ {obj.description}
                </MudLine>
              ))}
              <MudSpacer />
              <MudLine color={C.dim}>
                /quests to track progress · /quest {quest.id} for details
              </MudLine>
            </div>
          );
        }, afterDialogueDelay);

        break; // Only auto-start one quest per dialogue
      }
    }

    if (responses.length === 0) {
      // No NPC chose to respond
      setTimeout(() => {
        addLocalMsg(
          <MudLine key={k('npc-silent')} color={C.dim}>
            no response.
          </MudLine>
        );
      }, 400);
    }
  } catch {
    // LLM failed — use fallback dialogue from NPC definition
    targets.forEach((t, i) => {
      const fbAudioId = `npc-fb:${t.npcId}:${Date.now()}-${i}`;
      setTimeout(() => {
        const color = getNPCColor(t.npcId);
        const fallback = t.npc.dialogue.replace(/^"|"$/g, '');
        const formatted = formatNPCDialogue(fallback, t.personality.name, t.npcId);
        addLocalMsg(
          <div key={k(`npc-fb-${t.npcId}`)}>
            <span style={{ color, opacity: 0.5, fontSize: '0.8em', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t.personality.name}
            </span>
            <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8 }}>
              <TypeWriter segments={formatted.segments} npcColor={color} speed={20} />
            </div>
            <PlayGlyph audioId={fbAudioId} ttsText={formatted.fullTTS} voiceKey={t.npcId} />
          </div>
        );
        playSegments(formatted.segments, fbAudioId);
      }, (i + 1) * 400);
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MUD AUTOCOMPLETE SUGGESTIONS ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const MUD_COMMANDS = [
  '/look', '/go', '/exits', '/examine', '/where', '/stats', '/inventory',
  '/save', '/help', '/attack', '/hack', '/use', '/scan', '/flee',
  '/talk', '/shop', '/buy', '/sell', '/quests', '/quest', '/me', '/mudhelp', '/q',
];

export function getMudSuggestions(partial: string, session: MudSession): string[] {
  if (!partial) return [];
  const lower = partial.toLowerCase();

  // Command completion: /lo → /look
  if (lower.startsWith('/')) {
    const cmdPart = lower;
    const parts = cmdPart.split(/\s+/);

    if (parts.length === 1) {
      // Still typing command name
      return MUD_COMMANDS.filter(c => c.startsWith(cmdPart));
    }

    // Argument completion based on command
    const cmd = parts[0];
    const argPartial = parts.slice(1).join(' ').toLowerCase();
    const char = session.character;
    if (!char) return [];

    const room = getRoom(char.currentRoom);
    if (!room) return [];

    // /go → exit directions + room names
    if (cmd === '/go') {
      const exits: string[] = getVisibleExits(char.currentRoom, char).map(e => e.direction);
      // Add junction branch names
      if (char.currentRoom === 'z08_r03') {
        const branches = getJunctionBranches(char);
        exits.push(...branches.map(b => b.name.toLowerCase()));
      }
      return exits.filter(e => e.startsWith(argPartial)).map(e => `/go ${e}`);
    }

    // /examine → objects + NPCs in room
    if (cmd === '/examine' || cmd === '/x') {
      const things = [
        ...room.objects.filter(o => {
          if (!o.hidden) return true;
          if (!o.hiddenRequirement) return false;
          return char.attributes[o.hiddenRequirement.attribute] >= o.hiddenRequirement.minimum;
        }).map(o => o.name.toLowerCase()),
        ...room.npcs.map(n => n.name.toLowerCase()),
      ];
      return things.filter(t => t.includes(argPartial)).map(t => `/examine ${t}`);
    }

    // /attack → enemy names
    if (cmd === '/attack' || cmd === '/a') {
      if (session.combat) {
        const enemies = getAllLivingEnemies(session.combat);
        return enemies.map(e => e.name.toLowerCase()).filter(n => n.includes(argPartial)).map(n => `/attack ${n}`);
      }
    }

    // /hack → quickhack names
    if (cmd === '/hack' || cmd === '/h') {
      const hacks = getAvailableHacks(char.attributes.TECH, char.combatStyle);
      return hacks.map(h => h.name.toLowerCase()).filter(n => n.includes(argPartial)).map(n => `/hack ${n}`);
    }

    // /use → usable items
    if (cmd === '/use' || cmd === '/u') {
      const items = char.inventory.filter(i => i.healAmount).map(i => i.name.toLowerCase());
      return items.filter(n => n.includes(argPartial)).map(n => `/use ${n}`);
    }

    // /buy → shop items
    if (cmd === '/buy') {
      const shopkeeper = room.npcs.find(n => n.services?.includes('shop'));
      if (shopkeeper) {
        const listings = getFormattedShop(shopkeeper.id, char);
        if (listings) {
          return listings.map(l => l.name.toLowerCase()).filter(n => n.includes(argPartial)).map(n => `/buy ${n}`);
        }
      }
    }

    // /sell → inventory items
    if (cmd === '/sell') {
      const items = char.inventory.filter(i => !i.questItem).map(i => i.name.toLowerCase());
      return items.filter(n => n.includes(argPartial)).map(n => `/sell ${n}`);
    }

    // /talk → NPC names
    if (cmd === '/talk') {
      const npcs = room.npcs.map(n => n.name.toLowerCase());
      return npcs.filter(n => n.includes(argPartial)).map(n => `/talk ${n}`);
    }

    // /quest → quest IDs
    if (cmd === '/quest') {
      const ids = Object.keys(QUEST_REGISTRY);
      return ids.filter(id => id.includes(argPartial)).map(id => `/quest ${id}`);
    }

    // /scan → enemies
    if (cmd === '/scan' && session.combat) {
      const enemies = getAllLivingEnemies(session.combat);
      return enemies.map(e => e.name.toLowerCase()).filter(n => n.includes(argPartial)).map(n => `/scan ${n}`);
    }
  }

  return [];
}

// ── MUD HUD data for bottom bar ─────────────────────────────────────────────

export interface MudHUDData {
  hp: number;
  maxHp: number;
  xp: number;
  xpNext: number;
  level: number;
  creds: number;
  scrip: number;
  inCombat: boolean;
  ram: number;
  maxRam: number;
  subjectId: string;
  archetype: string;
  combatStyle: string;
  roomName: string;
  zoneName: string;
  isSafeZone: boolean;
  combatRound: number;
  combatAP: number;
  isDead: boolean;
}

export function getMudHUDData(session: MudSession): MudHUDData | null {
  const char = session.character;
  if (!char) return null;

  const nextXP = char.level < LEVEL_CAP ? xpForLevel(char.level + 1) : char.xp;
  const room = getRoom(char.currentRoom);
  const zone = room ? getZone(room.zone) : null;

  let combatAP = 0;
  let combatRound = 0;
  if (session.combat) {
    combatRound = session.combat.round;
    const player = session.combat.combatants.find(c => c.type === 'player');
    if (player) combatAP = player.ap;
  }

  return {
    hp: char.hp,
    maxHp: char.maxHp,
    xp: char.xp,
    xpNext: nextXP,
    level: char.level,
    creds: char.currency.creds,
    scrip: char.currency.scrip,
    inCombat: session.phase === 'combat',
    ram: char.ram,
    maxRam: char.maxRam,
    subjectId: char.subjectId,
    archetype: char.archetype,
    combatStyle: char.combatStyle === 'GHOST_STYLE' ? 'GHOST' : char.combatStyle,
    roomName: room?.name ?? 'UNKNOWN',
    zoneName: zone?.name ?? 'UNKNOWN',
    isSafeZone: room?.isSafeZone ?? false,
    combatRound,
    combatAP,
    isDead: char.isDead,
  };
}
