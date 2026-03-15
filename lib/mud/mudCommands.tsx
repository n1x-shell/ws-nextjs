// lib/mud/mudCommands.tsx
// TUNNELCORE MUD — Command Router (Phase 2)
// Handles all /slash commands when MUD session is active.
// Renders output via addLocalMsg into the ghost channel stream.

import React from 'react';
import type {
  MudSession,
  MudCharacter,
  CreationProgress,
  Archetype,
  CombatStyle,
  OriginPoint,
  AttributeName,
  Room,
  RoomExit,
  RoomObject,
  NPCModalPayload,
  Item,
  ItemSlot,
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
  getNPCRelation,
} from './persistence';
import {
  getRoom,
  getZone,
  getVisibleExits,
  resolveExit,
  getJunctionBranches,
  getAccessibleBranches,
  rollRoomEnemies,
} from './worldMap';
import { eventBus } from '@/lib/eventBus';
import {
  initClockCombat, setPlayerAction, resolvePlayerAction,
  resolveQuickhack, useItemInCombat,
  scanEnemy, attemptFleeAction, processEnemyActions, tickEnvironment,
  checkClockCombatEnd, syncClockCombatToCharacter,
  isPlayersTurn, getEnemyById,
  getAllLivingEnemies, getPlayerCombatant, getAvailableHacks,
  QUICKHACKS,
  getPlayerHarmClock, getPlayerArmorClock, getPlayerRamClock,
  getEnemyClocks,
  applyPlayerHarm,
  type PlayerResolveResult, type HackResult, type ScanResult, type FleeResult,
} from './combat';
import { renderClockText, findClock, isClockFull, clockPercent, createClock as createClockFromTemplate } from './clockEngine';
import { formatPoolCompact, formatRolledDie, getOutcomeTier, attributeToDie, rollResistance } from './dicePool';
import type { ApproachType } from './dicePool';
import {
  routeDialogue, buildDialogueRequest, recordInteraction,
  nudgeDisposition, getNPCColor, isNPCQuestGiver, detectsJobIntent,
  setLastEmote,
} from './npcEngine';
import {
  getFormattedShop, getShopkeeperName, buyItem, sellItem,
} from './shopSystem';
import { getItemTemplate, createItem } from './items';
import type { CyberwareItem, AugmentSlotType } from './cyberwareDB';
import { canEquipCyberware } from './cyberwareDB';
import {
  getAvailableQuests, getActiveQuests, startQuest, trackObjective,
  getQuestObjectiveProgress, QUEST_REGISTRY,
} from './questEngine';
import {
  playSegments, parseVoiceSegments,
  replayAudio, stopAllAndReset, getActiveAudioId,
  formatNPCDialogue,
} from './mudAudio';
import {
  isSafeHaven, getSafeHaven, executeRest, findNearestHavens,
} from './safeHaven';
import {
  getSkillNode, getTreeNodes, getTreeDisplay, getAvailableTrees,
  unlockSkill, canUnlockSkill, TREE_LABELS, STYLE_TO_TREE,
  ALL_SKILLS, getPointsInTree, hasFrequencyTreeAccess, hasCrossClassAccess,
  ATTRIBUTE_LEVEL_FLAVOR, type SkillTreeId,
} from './skillTree';
import { getDiscoveredSynergies, checkNewSynergies } from './synergies';
import { rollCombatLoot } from './lootEngine';
import { emitPlayerHit, emitPlayerDamage, emitEnemyDeath } from './combatFX';
import { emitCommerceTransient, emitCombatTransient } from './transientMessage';

// ── Helper: build NPCModalPayload from a RoomNPC ───────────────────────────

function buildNPCModalPayload(
  npc: import('./types').RoomNPC,
  handle: string,
  defaultTab?: string,
): NPCModalPayload {
  const relation = getNPCRelation(handle, npc.id);
  const disposition = relation?.disposition ?? npc.startingDisposition ?? 0;
  return {
    npcId: npc.id,
    npcName: npc.name,
    npcType: npc.type,
    description: npc.description,
    dialogue: npc.dialogue,
    services: (npc.services ?? []) as NPCModalPayload['services'],
    faction: npc.faction,
    disposition,
    defaultTab,
    infoEntries: npc.infoEntries,
  };
}

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
  n1x:       '#cc44ff',
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

// Per-attribute phosphor colors for character creation displays
const STAT_COLOR: Record<string, string> = {
  BODY:   '#ff6b6b',  // red — physical
  REFLEX: '#fcd34d',  // yellow — speed
  TECH:   '#d8b4fe',  // purple — augment
  COOL:   '#93c5fd',  // blue — social
  INT:    '#67e8f9',  // cyan — mental
  GHOST:  '#cc44ff',  // violet — frequency
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

// ── TypedN1XLine — typewriter reveal for creation flow ─────────────────────
// Renders purple N1X text that types itself out character by character.
// Emits shell:request-scroll as text reveals to keep viewport pinned.

function TypedN1XLine({ children, speed = 22, onComplete }: { children: React.ReactNode; speed?: number; onComplete?: () => void }) {
  // Flatten children to a plain string for typing
  const text = React.useMemo(() => {
    const flatten = (node: React.ReactNode): string => {
      if (node == null || typeof node === 'boolean') return '';
      if (typeof node === 'string' || typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(flatten).join('');
      return '';
    };
    return flatten(children);
  }, [children]);

  const [revealed, setRevealed] = React.useState(0);
  const completeFiredRef = React.useRef(false);

  React.useEffect(() => {
    if (revealed >= text.length) {
      if (onComplete && !completeFiredRef.current) {
        completeFiredRef.current = true;
        onComplete();
      }
      return;
    }
    const timer = setTimeout(() => {
      setRevealed(prev => Math.min(prev + 1, text.length));
      eventBus.emit('shell:request-scroll');
    }, speed);
    return () => clearTimeout(timer);
  }, [revealed, text, speed, onComplete]);

  React.useEffect(() => {
    setRevealed(0);
    completeFiredRef.current = false;
  }, [text]);

  // Tap-to-skip: reveal all text instantly on click/tap
  const handleSkip = React.useCallback(() => {
    if (revealed < text.length) {
      setRevealed(text.length);
    }
  }, [revealed, text.length]);

  // Render revealed text, converting \n to <br/>
  const visibleText = text.slice(0, revealed);
  const parts = visibleText.split('\n');

  return (
    <div
      onClick={handleSkip}
      style={{
        fontFamily: 'monospace',
        fontSize: S.base,
        lineHeight: 1.8,
        color: C.n1x,
        opacity: 0.9,
        minHeight: '1.8em',
        cursor: revealed < text.length ? 'pointer' : undefined,
      }}
    >
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {part}
        </React.Fragment>
      ))}
      {revealed < text.length && (
        <span style={{ opacity: 0.6, animation: 'mud-cursor-blink 0.6s step-end infinite' }}>{'\u2588'}</span>
      )}
      <style>{`@keyframes mud-cursor-blink { 0%,100% { opacity:0.6; } 50% { opacity:0; } }`}</style>
    </div>
  );
}

// ── CreationQuestionBlock — types question, then reveals children with glitch ──
// Used in character creation. Types the N1X question text first, then after
// typing completes, reveals each child element one by one with CRT glitch FX.
function CreationQuestionBlock({ questionText, children, typingSpeed = 22 }: {
  questionText: string;
  children: React.ReactNode;
  typingSpeed?: number;
}) {
  const [typingDone, setTypingDone] = React.useState(false);
  const [revealed, setRevealed] = React.useState(0);
  const items = React.useMemo(() => React.Children.toArray(children), [children]);

  React.useEffect(() => {
    if (!typingDone) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setRevealed(prev => prev + 1);
        eventBus.emit('crt:glitch-tier', { tier: 1, duration: 120 });
        eventBus.emit('shell:request-scroll');
      }, 400 + i * 350));
    });
    return () => timers.forEach(clearTimeout);
  }, [typingDone, items]);

  // Tap-to-skip: if typing done but children still revealing, show all
  const handleSkip = React.useCallback(() => {
    if (typingDone && revealed < items.length) {
      setRevealed(items.length);
      eventBus.emit('shell:request-scroll');
    }
  }, [typingDone, revealed, items.length]);

  return (
    <div onClick={handleSkip} style={{ cursor: (typingDone && revealed < items.length) ? 'pointer' : undefined }}>
      <TypedN1XLine speed={typingSpeed} onComplete={() => setTypingDone(true)}>
        {questionText}
      </TypedN1XLine>
      {typingDone && <MudSpacer />}
      {items.slice(0, revealed)}
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
    timers.push(setTimeout(() => {
      addLocalMsg(node);
      // Post-commit scroll kick — addLocalMsg fires shell:request-scroll
      // before React commits DOM. This second emit catches the committed state.
      timers.push(setTimeout(() => eventBus.emit('shell:request-scroll'), 50));
    }, delay));
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
  const { setSession } = ctx;

  // Just set the session state — CreationOverlay in mudHUD handles all UI
  const session: MudSession = {
    phase: 'character_creation',
    character: null,
    world: null,
    npcState: null,
    combat: null,
    creation: { step: 'archetype' },
  };
  setSession(session);

  // Trigger CRT glitch effect on entry
  eventBus.emit('neural:glitch-trigger', { intensity: 0.8 });
}

export function handleCreationInput(input: string, ctx: MudContext): MudRouteResult {
  // CreationOverlay in mudHUD handles all creation UI via modals.
  // This function just silently consumes any input that leaks through.
  void input; void ctx;
  return { handled: true, stopPropagation: true };
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

  // Reset panel mode
  eventBus.emit('mud:panel-mode-reset-non-map');

  // ── Room description (room name shown in header strip — not duplicated here) ──
  addLocalMsg(
    <div key={k('look')} data-room-entry="true">
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

  // ── Inline NPC cards ──
  if (room.npcs.length > 0) {
    addLocalMsg(
      <div key={k('look-npcs')} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
        {room.npcs.map(npc => {
          const hasShop = npc.services?.includes('shop');
          const hasQuest = npc.services?.includes('quest');
          const canHeal = npc.services?.includes('heal');
          const color = npc.type === 'SHOPKEEPER' ? '#fcd34d'
            : npc.type === 'QUESTGIVER' ? '#fbbf24'
            : npc.type === 'ALLIED' ? '#4ade80'
            : npc.type === 'ENEMY' ? '#ff6b6b'
            : 'rgba(var(--phosphor-rgb),0.6)';

          return (
            <div
              key={k(`npc-${npc.id}`)}
              role="button" tabIndex={0}
              onClick={() => {
                // Open NPC interaction modal with full tabbed UI
                eventBus.emit('mud:open-npc-modal', buildNPCModalPayload(npc, char.handle));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  eventBus.emit('mud:execute-command', { command: `/examine ${npc.name}` });
                }
              }}
              style={{
                fontFamily: 'monospace', fontSize: S.base,
                border: `1px solid ${color}33`,
                borderLeft: `3px solid ${color}`,
                background: `${color}08`,
                padding: '0.4rem 0.6rem',
                borderRadius: '0 3px 3px 0',
                cursor: 'pointer', touchAction: 'manipulation',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                <span style={{ color, fontWeight: 'bold', letterSpacing: '0.04em' }}>{npc.name}</span>
                <span style={{ color: C.dimmer, fontSize: '9px' }}>
                  {npc.type}{canHeal ? ' · HEAL' : ''}{hasShop ? ' · SHOP' : ''}{hasQuest ? ' · QUEST' : ''}
                </span>
              </div>
              <div style={{ color: C.dim, opacity: 0.8, fontStyle: 'italic' }}>
                {npc.dialogue.length > 80 ? npc.dialogue.slice(0, 77) + '...' : npc.dialogue}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Inline object cards (left-border accent, matches NPC card pattern) ──
  const visibleObjects = room.objects.filter(o =>
    !o.hidden || (o.hiddenRequirement && char.attributes[o.hiddenRequirement.attribute] >= o.hiddenRequirement.minimum)
  );
  if (visibleObjects.length > 0) {
    addLocalMsg(
      <div key={k('look-objects')} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
        {visibleObjects.map(obj => {
          const color = obj.lootable ? '#fbbf24' : 'rgba(var(--phosphor-rgb),0.5)';
          return (
            <div
              key={k(`obj-${obj.id}`)}
              role="button" tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` }); }}
              style={{
                fontFamily: 'monospace', fontSize: S.base,
                borderLeft: `3px solid ${color}`,
                background: `${color}08`,
                padding: '0.25rem 0.6rem',
                borderRadius: '0 3px 3px 0',
                cursor: 'pointer', touchAction: 'manipulation',
                display: 'flex', alignItems: 'center', gap: '0.6ch',
              }}
              className="mud-obj-row"
            >
              <span style={{ color, opacity: 0.9 }}>{obj.lootable ? '\u2726' : '\u25B8'}</span>
              <span style={{ color: obj.lootable ? '#fbbf24' : C.dim }}>{obj.name}</span>
              {obj.lootable && <span style={{ color: '#fbbf24', opacity: 0.5, fontSize: '9px' }}>LOOT</span>}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Inline enemy cards (NPC-card pattern with left border) ──
  if (room.enemies.length > 0 && !room.isSafeZone) {
    addLocalMsg(
      <div key={k('look-enemies')} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
        {room.enemies.map((e, i) => (
          <div
            key={k(`enemy-warn-${i}`)}
            role="button" tabIndex={0}
            onClick={() => eventBus.emit('mud:execute-command', { command: `/examine ${e.name}` })}
            onKeyDown={(ev) => { if (ev.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/examine ${e.name}` }); }}
            style={{
              fontFamily: 'monospace', fontSize: S.base,
              borderLeft: '3px solid #ff6b6b',
              background: 'rgba(255,107,107,0.06)',
              padding: '0.3rem 0.6rem',
              borderRadius: '0 3px 3px 0',
              cursor: 'pointer', touchAction: 'manipulation',
            }}
            className="mud-npc-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#ff6b6b', fontWeight: 'bold', letterSpacing: '0.04em' }}>
                {'\u26A0'} {e.name}
              </span>
              <span style={{ color: C.dimmer, fontSize: '9px' }}>
                Lv.{e.level} {'\u00b7'} {Math.round(e.spawnChance * 100)}% spawn
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Inline exit tags (named destinations only — compass handles cardinal) ──
  const visibleExits = getVisibleExits(char.currentRoom, char);
  const CARDINAL_SET = new Set(['north','south','east','west','northeast','northwest','southeast','southwest','up','down']);
  // Only show exits that are zone transitions, locked, or non-cardinal (named/special)
  const namedExits = visibleExits.filter(exit => exit.zoneTransition || exit.locked || !CARDINAL_SET.has(exit.direction));
  const branches = getAccessibleBranches(char.currentRoom, char);
  if (namedExits.length > 0 || branches.length > 0) {
    addLocalMsg(
      <div key={k('look-exits')} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
        {namedExits.map(exit => (
          <span
            key={k(`exit-${exit.direction}`)}
            role="button" tabIndex={0}
            onClick={() => eventBus.emit('mud:execute-command', { command: `/go ${exit.direction}` })}
            onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/go ${exit.direction}` }); }}
            style={{
              fontFamily: 'monospace', fontSize: S.base,
              color: exit.locked ? '#ff6b6b' : exit.zoneTransition ? '#a78bfa' : C.exit,
              border: `1px solid ${exit.locked ? 'rgba(255,107,107,0.25)' : exit.zoneTransition ? 'rgba(167,139,250,0.25)' : 'rgba(var(--phosphor-rgb),0.15)'}`,
              padding: '0.2rem 0.5rem',
              borderRadius: 2,
              cursor: exit.locked ? 'default' : 'pointer',
              touchAction: 'manipulation',
              background: 'rgba(var(--phosphor-rgb),0.03)',
              opacity: exit.locked ? 0.5 : 1,
            }}
          >
            [{exit.direction.toUpperCase().slice(0, 2)}] {exit.description.replace(/^[a-z]+ \(/, '').replace(/\)$/, '')}
            {exit.locked ? ' 🔒' : ''}
          </span>
        ))}
        {branches.map(br => (
          <span
            key={k(`branch-${br.id}`)}
            role="button" tabIndex={0}
            onClick={() => eventBus.emit('mud:execute-command', { command: `/go ${br.name.toLowerCase()}` })}
            onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/go ${br.name.toLowerCase()}` }); }}
            style={{
              fontFamily: 'monospace', fontSize: S.base,
              color: '#a78bfa',
              border: '1px solid rgba(167,139,250,0.25)',
              padding: '0.2rem 0.5rem',
              borderRadius: 2,
              cursor: 'pointer', touchAction: 'manipulation',
              background: 'rgba(var(--phosphor-rgb),0.03)',
            }}
          >
            {'\u25B8'} {br.name}
          </span>
        ))}
      </div>
    );
  }

  // Narrator voice
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

// Process all enemy turns + environment tick after player acts
function processAllEnemyTurns(session: MudSession, addLocalMsg: AddLocalMsg): void {
  const combat = session.combat;
  const char = session.character;
  if (!combat || !char) return;

  // ── Enemy actions (defer harm so player can resist) ──
  const enemyResult = processEnemyActions(combat, char.godMode, true);
  session.combat = enemyResult.combat;

  for (const action of enemyResult.actions) {
    if (action.action === 'stunned') {
      addLocalMsg(
        <MudLine key={k(`enemy-stun-${action.enemyId}`)} color={C.dim}>
          {action.enemyName} is stunned — turn lost.
        </MudLine>
      );
    } else if (action.hitPlayer) {
      const ticks = action.harmTicks ?? 0;
      addLocalMsg(
        <div key={k(`enemy-act-${action.enemyId}`)} style={{ marginBottom: '0.5rem' }}>
          <MudLine color={C.enemy}>
            {action.enemyName} strikes — {ticks > 0 ? `${ticks} harm incoming` : 'blocked'}
          </MudLine>
          {action.complicationCreated && (
            <MudLine color="#c084fc" indent>
              {'⚠'} {action.complicationCreated}
            </MudLine>
          )}
        </div>
      );
      emitPlayerDamage(ticks >= 3);
    } else if (action.action === 'miss') {
      addLocalMsg(
        <MudLine key={k(`enemy-miss-${action.enemyId}`)} color={C.dim}>
          {action.enemyName} attacks — misses.
        </MudLine>
      );
    }
  }

  // ── Check for pending harm → set resist window ──
  const totalPending = enemyResult.totalPendingHarm;
  if (totalPending > 0 && !char.godMode) {
    // Determine best attribute for resist (highest of BODY or REFLEX)
    const resistAttr: AttributeName = char.attributes.BODY >= char.attributes.REFLEX ? 'BODY' : 'REFLEX';
    const hitSources = enemyResult.actions.filter(a => a.hitPlayer).map(a => a.enemyName).join(', ');

    session.combat = {
      ...session.combat!,
      pendingResist: {
        harmTicks: totalPending,
        attribute: resistAttr,
        source: hitSources,
      },
      // Don't advance to environment_tick yet — wait for resist resolution
      turnPhase: 'player_choose',
    };

    addLocalMsg(
      <div key={k('resist-prompt')} style={{
        margin: '0.4rem 0', padding: '0.4rem 0.6rem',
        border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: 3,
        background: 'rgba(251,191,36,0.05)',
      }}>
        <MudLine color="#fbbf24" bold>
          RESIST? type /resist or press [{'⏎'}] to accept {totalPending} harm
        </MudLine>
        <MudLine color={C.dim} indent>
          costs 0-2 stress · rolls {resistAttr} d{attributeToDie(char.attributes[resistAttr])}
          {(combat.surge ?? 0) > 0 && ' · or /resist free (1 surge)'}
        </MudLine>
      </div>
    );
    return; // Don't tick environment yet — wait for resist resolution
  }

  // ── No harm to resist — proceed normally ──
  finishEnemyPhase(session, addLocalMsg);
}

/** Complete environment tick + sync + round divider after enemy harm is resolved. */
function finishEnemyPhase(session: MudSession, addLocalMsg: AddLocalMsg): void {
  const char = session.character;
  if (!char || !session.combat) return;

  // ── Environment tick ──
  const envResult = tickEnvironment(session.combat);
  session.combat = envResult.combat;

  for (const cc of envResult.clockChanges) {
    if (cc.clockName === 'BLEEDOUT') {
      addLocalMsg(
        <MudLine key={k('bleedout-tick')} color={C.combat} bold>
          BLEEDOUT {'█'.repeat(cc.to)}{'░'.repeat(cc.segments - cc.to)} [{cc.to}/{cc.segments}]
        </MudLine>
      );
    }
  }

  syncClockCombatToCharacter(session.combat, char);

  // Set phase back to player_choose for next round
  if (session.combat) {
    session.combat = { ...session.combat, turnPhase: 'player_choose' };
  }

  // Round divider
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

// Async LLM narration — non-blocking, additive
function fetchCombatNarrative(res: PlayerResolveResult, char: MudCharacter, targetName: string): void {
  const room = getRoom(char.currentRoom);
  fetch('/api/mud/combat-narrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: res.combat.log[res.combat.log.length - 1]?.action ?? 'attack',
      outcome: res.outcome.tier,
      clockChanges: res.clockChanges.map(cc => ({
        name: cc.clockName, from: cc.from, to: cc.to, segments: cc.segments, filled: cc.filled,
      })),
      enemyNames: res.combat.enemies.filter(e => !e.defeated).map(e => e.name),
      roomName: room?.name ?? 'unknown',
      roomDescription: (room?.description ?? '').slice(0, 100),
      playerHandle: char.handle,
      playerStyle: char.combatStyle === 'GHOST_STYLE' ? 'GHOST' : char.combatStyle,
      roundNumber: res.combat.round,
    }),
  }).then(r => r.json()).then(data => {
    if (data.narrative) {
      eventBus.emit('mud:transient-message', { text: data.narrative, duration: 4000, type: 'combat' });
    }
  }).catch(() => { /* narration is non-blocking */ });
}

// Enter combat from room enemies
function triggerCombat(session: MudSession, addLocalMsg: AddLocalMsg, setSession: (s: MudSession) => void): void {
  const char = session.character;
  if (!char) return;

  const room = getRoom(char.currentRoom);
  if (!room || room.enemies.length === 0 || room.isSafeZone) return;

  const spawned = rollRoomEnemies(char.currentRoom);
  if (spawned.length === 0) return;

  const combat = initClockCombat(char, spawned, room.environmentalClocks?.map(ct => createClockFromTemplate(ct)) ?? undefined);
  // Copy room trait dice into combat state
  if (room.traitDice) combat.roomTraits = room.traitDice;
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
      <MudSpacer />
      <MudLine color={C.combat} glow bold>
        &gt;&gt; COMBAT INITIATED
      </MudLine>
      <MudSpacer />
      <MudLine color={C.enemy}>
        hostile{spawned.length > 1 ? 's' : ''}: {names}
      </MudLine>
    </div>
  );

  // Clock combat always starts on player turn
  addLocalMsg(
    <MudLine key={k('init-player')} color={C.stat} opacity={0.7}>
      you act first. /attack · /hack · /scan · /flee
    </MudLine>
  );
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

  // Emit flatline event — modal handles the death screen
  eventBus.emit('mud:flatline', {
    handle: char.handle,
    subjectId: char.subjectId,
    level: char.level,
    room: char.currentRoom,
  });

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
        signal lost. this character is gone.
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
    let combat = session.combat;

    // ── Resolve pending resist before ANY command ─────────────────────
    if (combat.pendingResist) {
      const pending = combat.pendingResist;
      if (cmd === 'resist') {
        // Roll resistance — spend stress to reduce harm
        const useSurge = rest === 'free' && (combat.surge ?? 0) > 0;
        const attrValue = char.attributes[pending.attribute] ?? char.attributes.BODY;
        const resistResult = rollResistance(attrValue, pending.harmTicks);

        if (useSurge) {
          // Free resist via surge — no stress cost
          session.combat = { ...combat, surge: combat.surge - 1, pendingResist: undefined };
          const actualHarm = resistResult.totalAfterResist;
          // Apply reduced harm
          if (actualHarm > 0) {
            const pc = { ...session.combat.playerClocks };
            const clocks = [...session.combat.clocks];
            const changes: import('./types').ClockChange[] = [];
            applyPlayerHarm(pc, clocks, actualHarm, changes, []);
            session.combat = { ...session.combat, clocks, playerClocks: pc };
          }
          addLocalMsg(
            <div key={k('resist-surge')}>
              <MudLine color="#fcd34d" glow>
                {'★'} FREE RESIST: {pending.attribute} d{resistResult.die} {'→'} [{resistResult.roll}] — {resistResult.ticksNegated} harm negated
              </MudLine>
              {resistResult.totalAfterResist > 0 && (
                <MudLine indent color={C.enemy}>{resistResult.totalAfterResist} harm applied</MudLine>
              )}
            </div>
          );
        } else {
          // Standard resist — costs stress
          const stressAfter = char.stress + resistResult.stressCost;
          char.stress = Math.min(char.maxStress, stressAfter);
          const actualHarm = resistResult.totalAfterResist;
          session.combat = { ...combat, pendingResist: undefined };
          // Apply reduced harm
          if (actualHarm > 0) {
            const pc = { ...session.combat.playerClocks };
            const clocks = [...session.combat.clocks];
            const changes: import('./types').ClockChange[] = [];
            applyPlayerHarm(pc, clocks, actualHarm, changes, []);
            session.combat = { ...session.combat, clocks, playerClocks: pc };
          }
          addLocalMsg(
            <div key={k('resist-roll')}>
              <MudLine color="#fbbf24" glow>
                RESIST: {pending.attribute} d{resistResult.die} {'→'} [{resistResult.roll}] — {resistResult.stressCost === 0 ? '0 stress' : `${resistResult.stressCost} stress`}. {resistResult.ticksNegated >= pending.harmTicks ? 'harm negated.' : `${resistResult.ticksNegated} negated.`}
              </MudLine>
              {resistResult.totalAfterResist > 0 && (
                <MudLine indent color={C.enemy}>{resistResult.totalAfterResist} harm applied</MudLine>
              )}
              <MudLine indent color={C.dim}>stress: [{char.stress}/{char.maxStress}]</MudLine>
            </div>
          );
          // Check trauma trigger
          if (char.stress >= char.maxStress) {
            eventBus.emit('mud:open-trauma', { payload: { character: char } });
          }
        }
        syncClockCombatToCharacter(session.combat, char);
        finishEnemyPhase(session, addLocalMsg);
        saveCombat(char.handle, session.combat);
        saveCharacter(char.handle, char);
        setSession({ ...session });
        // Check combat end after harm applied
        const endCheck = checkClockCombatEnd(session.combat);
        if (endCheck.over && !endCheck.victory) {
          handleDeath(session, addLocalMsg, setSession);
        }
        return { handled: true, stopPropagation: true };
      } else {
        // Player chose NOT to resist — accept full harm
        const pc = { ...combat.playerClocks };
        const clocks = [...combat.clocks];
        const changes: import('./types').ClockChange[] = [];
        applyPlayerHarm(pc, clocks, pending.harmTicks, changes, []);
        session.combat = { ...combat, clocks, playerClocks: pc, pendingResist: undefined };
        addLocalMsg(
          <div key={k('resist-skip')}>
            <MudLine color={C.dim}>
              {pending.harmTicks} harm accepted.
            </MudLine>
            {changes.map((cc, i) => (
              <MudLine key={k(`rcc-${i}`)} indent color={C.dim}>
                {cc.clockName} {'█'.repeat(cc.to)}{'░'.repeat(cc.segments - cc.to)} [{cc.to}/{cc.segments}]
              </MudLine>
            ))}
          </div>
        );
        syncClockCombatToCharacter(session.combat, char);
        finishEnemyPhase(session, addLocalMsg);
        saveCombat(char.handle, session.combat);
        // Check combat end after harm applied
        const endCheck = checkClockCombatEnd(session.combat);
        if (endCheck.over && !endCheck.victory) {
          handleDeath(session, addLocalMsg, setSession);
          return { handled: true, stopPropagation: true };
        }
        // Fall through to process the actual command below
      }
    }

    // Re-read combat state after potential resist resolution
    combat = session.combat!;

    const COMBAT_CMDS = ['attack', 'a', 'hack', 'h', 'use', 'u', 'scan', 'flee', 'run', 'push', 'asset', 'resist', 'stats', 'inventory', 'inv', 'i', 'save', 'mudhelp', 'mhelp', 'commands', 'help', '?', 'skills', 'skillinfo', 'sinfo', 'loot'];

    if (!COMBAT_CMDS.includes(cmd)) {
      addLocalMsg(
        <MudNotice key={k('combat-block')} error>
          you're in combat. /attack · /hack · /use · /scan · /flee
        </MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    if (!isPlayersTurn(combat)) {
      // Silently swallow — PlayerCard already shows turn state ("COMBAT" vs "⚔ YOUR TURN")
      return { handled: true, stopPropagation: true };
    }

    // ── /attack [target] [approach] ────────────────────────────────────
    if (cmd === 'attack' || cmd === 'a') {
      const enemies = getAllLivingEnemies(combat);
      if (enemies.length === 0) {
        addLocalMsg(<MudNotice key={k('atk-none')} error>no enemies to attack.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      // Parse target and approach from args
      // /attack crawler aggressive OR /attack aggressive OR /attack
      const args = rest.split(/\s+/).filter(Boolean);
      let targetName = '';
      let approach: ApproachType = 'measured';
      const approaches: Record<string, ApproachType> = {
        a: 'aggressive', aggressive: 'aggressive',
        m: 'measured', measured: 'measured',
        d: 'desperate', desperate: 'desperate',
      };

      for (const arg of args) {
        const lower = arg.toLowerCase();
        if (approaches[lower]) {
          approach = approaches[lower];
        } else {
          targetName += (targetName ? ' ' : '') + arg;
        }
      }

      let target = enemies[0];
      if (targetName) {
        const match = enemies.find(e =>
          e.name.toLowerCase().includes(targetName.toLowerCase()) ||
          e.id.includes(targetName),
        );
        if (match) target = match;
      }

      // Set up action (assembles pool, assesses position/effect)
      const setup = setPlayerAction(combat, char, 'attack', approach, target.id);
      if (setup.error) {
        addLocalMsg(<MudNotice key={k('atk-err')} error>{setup.error}</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      // Display pool before roll
      addLocalMsg(
        <div key={k('atk-pool')} style={{ marginTop: '0.3rem' }}>
          <MudLine color={C.dim}>
            POOL: {formatPoolCompact(setup.pool)}
          </MudLine>
          <MudLine color={C.dim}>
            position: {setup.context.position.toUpperCase()} · effect: {setup.context.effect.toUpperCase()}
            {setup.context.reason ? ` (${setup.context.reason})` : ''}
          </MudLine>
        </div>
      );

      // Resolve (roll dice, tick clocks)
      const res = resolvePlayerAction(setup.combat, char);
      session.combat = res.combat;

      // Display roll results
      const tier = res.outcome.tier.toUpperCase();
      const tierColor = res.outcome.tier === 'failure' ? C.enemy
        : res.outcome.tier === 'partial' ? '#fbbf24'
        : res.outcome.tier === 'critical' ? C.accent : C.stat;

      addLocalMsg(
        <div key={k('atk-result')} style={{ marginBottom: '0.6rem' }}>
          <MudLine color={C.dim}>
            ROLL: {res.result.pool.filter(d => !d.isComplication).map(d => `[${d.value}]`).join(' · ')}
            {res.result.complications.length > 0 ? ` │ ⚠ ${res.result.complications.map(d => `[${d.value}]`).join(' · ')}` : ''}
            {'  '}TOTAL: {res.result.total}
          </MudLine>
          <MudLine color={tierColor} bold={res.outcome.tier !== 'failure'}>
            &gt;&gt; {tier}
            {res.outcome.targetTicks > 0 ? ` — ${res.outcome.targetTicks} ticks on ${target.name}` : ''}
            {res.outcome.dangerTicks > 0 ? ` · ${res.outcome.dangerTicks} harm taken` : ''}
            {res.outcome.dangerTicks < 0 ? ` · healed ${Math.abs(res.outcome.dangerTicks)}` : ''}
          </MudLine>
          {res.clockChanges.map((cc, i) => (
            <MudLine key={k(`cc-${i}`)} indent color={C.dim}>
              {cc.clockName} {'█'.repeat(cc.to)}{'░'.repeat(cc.segments - cc.to)} [{cc.to}/{cc.segments}]{cc.filled ? ' FULL' : ''}
            </MudLine>
          ))}
          {res.result.heroicOpportunity && (
            <MudLine color="#fcd34d" glow>{'★'} SURGE earned — max roll [{res.combat.surge ?? 0}/3]</MudLine>
          )}
        </div>
      );

      // CRT feedback
      if (res.outcome.tier !== 'failure') {
        emitPlayerHit(res.outcome.tier === 'critical');
      }
      const targetEnemy = res.combat.enemies.find(e => e.id === target.id);
      if (targetEnemy?.defeated) {
        emitEnemyDeath();
      }

      // Fetch LLM narrative async (non-blocking)
      fetchCombatNarrative(res, char, target.name);

      syncClockCombatToCharacter(res.combat, char);
      saveCombat(char.handle, res.combat);

      // Check combat end
      const endCheck = checkClockCombatEnd(res.combat);
      if (endCheck.over) {
        if (endCheck.victory) {
          clearCombat(char.handle);
          const xpResult = addXP(char, endCheck.xpGained);

          const enemyNames = (combat.sourceEnemies ?? []).map(e => e.name);
          // Merge fixed drops with loot table rolls
          const lootResult = rollCombatLoot(
            (combat.sourceEnemies ?? []).map(e => ({ id: e.id, level: e.level })),
            char,
          );
          const allDropIds = [...endCheck.drops, ...lootResult.items.map(i => i.id)];
          const salvageDrops = allDropIds.map(dropId => {
            const template = getItemTemplate(dropId);
            return { itemId: dropId, name: template?.name ?? dropId, taken: false };
          });
          if (salvageDrops.length > 0) {
            char.pendingSalvage = {
              enemies: enemyNames.length > 0
                ? [{ name: enemyNames.join(', '), drops: salvageDrops }]
                : [{ name: 'remains', drops: salvageDrops }],
            };
          }
          char.lastCombatLoot = allDropIds;

          saveCharacter(char.handle, char);
          setSession({ ...session, phase: 'active', combat: null });
          eventBus.emit('crt:glitch-tier', { tier: 2, duration: 300 });
          if (salvageDrops.length > 0) {
            eventBus.emit('mud:panel-mode', { mode: 'salvage' });
          }

          const nextXP = xpForLevel(char.level + 1 + (char.pendingLevelUps ?? 0));
          addLocalMsg(
            <div key={k('combat-win')}>
              <MudSpacer />
              <MudLine color={C.stat} glow bold>&gt;&gt; COMBAT RESOLVED</MudLine>
              <MudLine indent color={C.stat}>+{xpResult.xpGained} XP [{char.xp} / {nextXP}]</MudLine>
              {xpResult.pendingLevels > 0 && (
                <div>
                  <MudLine indent color={C.accent} glow bold>&gt;&gt; LEVEL THRESHOLD REACHED</MudLine>
                  <MudLine indent color={C.accent}>level {char.level} {'\u2192'} {char.level + xpResult.pendingLevels} available</MudLine>
                  <MudLine indent color={C.dim}>find a safe haven and /rest to integrate.</MudLine>
                </div>
              )}
              {salvageDrops.length > 0 && (
                <MudLine indent color={C.dim}>
                  {salvageDrops.length} item{salvageDrops.length > 1 ? 's' : ''} to salvage. check the panel or /take all
                </MudLine>
              )}
            </div>
          );
          trackObjective(char.handle, 'kill', 'any', 1);
        } else {
          handleDeath(session, addLocalMsg, setSession);
        }
        return { handled: true, stopPropagation: true };
      }

      // Enemy turn
      processAllEnemyTurns(session, addLocalMsg);

      // Check death after enemy turns
      const harmClock = getPlayerHarmClock(session.combat!);
      const critClock = session.combat ? findClock(session.combat.clocks, session.combat.playerClocks.critical) : null;
      if ((harmClock && isClockFull(harmClock) && critClock && isClockFull(critClock)) || char.hp <= 0) {
        handleDeath(session, addLocalMsg, setSession);
        return { handled: true, stopPropagation: true };
      }
      // Check end again after enemy turns
      const endCheck2 = checkClockCombatEnd(session.combat!);
      if (endCheck2.over && !endCheck2.victory) {
        handleDeath(session, addLocalMsg, setSession);
        return { handled: true, stopPropagation: true };
      }

      saveCombat(char.handle, session.combat!);
      setSession({ ...session });
      return { handled: true, stopPropagation: true };
    }

    // ── /hack [hackname] [target] ──────────────────────────────────────
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

      const ramClock = getPlayerRamClock(combat);
      const availRam = ramClock ? (ramClock.segments - ramClock.filled) : 0;

      const args = rest.split(/\s+/);
      if (!rest || args.length === 0) {
        addLocalMsg(
          <div key={k('hack-list')}>
            <MudLine color={C.hack} bold>QUICKHACKS (RAM: {availRam}/{ramClock?.segments ?? 0})</MudLine>
            {hacks.map(h => (
              <MudLine key={k(`hack-${h.id}`)} indent color={h.ramDrain <= availRam ? C.hack : C.dim}>
                /hack {h.id.replace(/_/g, ' ')} — {h.description} (RAM: {h.ramDrain})
              </MudLine>
            ))}
          </div>
        );
        return { handled: true, stopPropagation: true };
      }

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

      const hr = resolveQuickhack(combat, char, hack.id, target.id);
      if (hr.error) {
        addLocalMsg(<MudNotice key={k('hack-err')} error>{hr.error}</MudNotice>);
        setSession({ ...session });
        return { handled: true, stopPropagation: true };
      }

      session.combat = hr.combat;
      syncClockCombatToCharacter(hr.combat, char);

      const tierColor = hr.outcome.tier === 'failure' ? C.dim : C.hack;
      addLocalMsg(
        <div key={k('hack-result')} style={{ marginBottom: '0.6rem', marginTop: '0.3rem' }}>
          <MudLine color={C.hack}>
            uploading {hack.name} → {target.name} (RAM: -{hr.ramDrained})
          </MudLine>
          <MudLine color={tierColor} bold={hr.outcome.tier !== 'failure'}>
            &gt;&gt; {hr.outcome.tier.toUpperCase()}
            {hr.outcome.targetTicks > 0 ? ` — ${hr.outcome.targetTicks + (hack.hackDamage ?? 0)} harm ticks` : ''}
            {hr.statusCreated ? ` · ${hr.statusCreated} applied` : ''}
          </MudLine>
          {hr.clockChanges.map((cc, i) => (
            <MudLine key={k(`hcc-${i}`)} indent color={C.dim}>
              {cc.clockName} {'█'.repeat(cc.to)}{'░'.repeat(cc.segments - cc.to)} [{cc.to}/{cc.segments}]{cc.filled ? ' FULL' : ''}
            </MudLine>
          ))}
        </div>
      );

      if (hr.outcome.tier !== 'failure') {
        const defeated = hr.combat.enemies.find(e => e.id === target.id)?.defeated;
        eventBus.emit('crt:glitch-tier', { tier: defeated ? 2 : 1, duration: 180 });
      }

      saveCombat(char.handle, hr.combat);

      const endCheck = checkClockCombatEnd(hr.combat);
      if (endCheck.over) {
        if (endCheck.victory) {
          clearCombat(char.handle);
          const xpResult = addXP(char, endCheck.xpGained);
          const lootResult = rollCombatLoot(
            (combat.sourceEnemies ?? []).map(e => ({ id: e.id, level: e.level })),
            char,
          );
          const allDropIds = [...endCheck.drops, ...lootResult.items.map(i => i.id)];
          const salvageDrops = allDropIds.map(dropId => {
            const template = getItemTemplate(dropId);
            return { itemId: dropId, name: template?.name ?? dropId, taken: false };
          });
          if (salvageDrops.length > 0) {
            char.pendingSalvage = { enemies: [{ name: combat.sourceEnemies.map(e => e.name).join(', ') || 'remains', drops: salvageDrops }] };
          }
          char.lastCombatLoot = allDropIds;
          saveCharacter(char.handle, char);
          setSession({ ...session, phase: 'active', combat: null });
          if (salvageDrops.length > 0) eventBus.emit('mud:panel-mode', { mode: 'salvage' });
          const nextXP = xpForLevel(char.level + 1 + (char.pendingLevelUps ?? 0));
          addLocalMsg(
            <div key={k('combat-win-h')}>
              <MudLine color={C.stat} glow bold>&gt;&gt; COMBAT RESOLVED · +{xpResult.xpGained} XP [{char.xp} / {nextXP}]</MudLine>
              {xpResult.pendingLevels > 0 && <MudLine color={C.accent} glow>&gt;&gt; LEVEL THRESHOLD REACHED — /rest at a safe haven</MudLine>}
              {salvageDrops.length > 0 && <MudLine color={C.dim}>{salvageDrops.length} item{salvageDrops.length > 1 ? 's' : ''} to salvage.</MudLine>}
            </div>
          );
        } else { handleDeath(session, addLocalMsg, setSession); }
        return { handled: true, stopPropagation: true };
      }

      processAllEnemyTurns(session, addLocalMsg);
      if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
      saveCombat(char.handle, session.combat!);
      setSession({ ...session });
      return { handled: true, stopPropagation: true };
    }

    // ── /use [item] in combat ───────────────────────────────────────────
    if (cmd === 'use' || cmd === 'u') {
      if (!rest) {
        const healables = char.inventory.filter(i => i.healAmount).map((i, idx) => `${idx}: ${i.name} (drain ${Math.max(1, Math.ceil((i.healAmount ?? 0) / 10))} harm)`);
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

      let idx = parseInt(rest, 10);
      if (isNaN(idx)) {
        idx = char.inventory.findIndex(i => i.name.toLowerCase().includes(rest.toLowerCase()) && i.healAmount);
      }
      if (idx < 0 || idx >= char.inventory.length || !char.inventory[idx]?.healAmount) {
        addLocalMsg(<MudNotice key={k('use-err')} error>item not found or not usable.</MudNotice>);
        setSession({ ...session });
        return { handled: true, stopPropagation: true };
      }

      const item = char.inventory[idx];
      const result = useItemInCombat(combat, char, item);
      session.combat = result.combat;

      // Remove consumed item
      char.inventory[idx].quantity -= 1;
      if (char.inventory[idx].quantity <= 0) char.inventory.splice(idx, 1);

      syncClockCombatToCharacter(result.combat, char);

      addLocalMsg(
        <div key={k('use-ok')}>
          <MudLine color={C.heal}>used {item.name} — {result.message}</MudLine>
          {result.clockChanges.map((cc, i) => (
            <MudLine key={k(`ucc-${i}`)} indent color={C.dim}>
              {cc.clockName} {'█'.repeat(cc.to)}{'░'.repeat(cc.segments - cc.to)} [{cc.to}/{cc.segments}]
            </MudLine>
          ))}
        </div>
      );

      saveCombat(char.handle, result.combat);
      processAllEnemyTurns(session, addLocalMsg);
      if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
      saveCombat(char.handle, session.combat!);
      setSession({ ...session });
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

      const sr = scanEnemy(combat, char, target.id);
      if (!sr.success) {
        addLocalMsg(<MudLine key={k('scan-fail')} color={C.dim}>scan failed — insufficient data on {target.name}.</MudLine>);
      } else {
        addLocalMsg(
          <div key={k('scan-ok')} style={{ marginBottom: '0.4rem' }}>
            <MudLine color={C.accent} bold>SCAN: {target.name} — tier {target.tier}</MudLine>
            {sr.revealedClocks.map((clock, i) => (
              <MudLine key={k(`sc-${i}`)} indent color={C.dim}>
                {clock.name} {'█'.repeat(clock.filled)}{'░'.repeat(clock.segments - clock.filled)} [{clock.filled}/{clock.segments}]
              </MudLine>
            ))}
            {sr.weaknesses.length > 0 && (
              <MudLine indent color={C.warning}>weak: {sr.weaknesses.join('; ')}</MudLine>
            )}
            <MudLine indent color={C.dim}>behavior: {sr.behaviorHint}</MudLine>
          </div>
        );
      }

      saveCombat(char.handle, combat);
      setSession({ ...session });
      return { handled: true, stopPropagation: true };
    }

    // ── /flee ───────────────────────────────────────────────────────────
    if (cmd === 'flee' || cmd === 'run') {
      const { combat: updatedCombat, flee } = attemptFleeAction(combat, char);
      session.combat = updatedCombat;

      addLocalMsg(
        <MudLine key={k('flee-result')} color={flee.escaped ? C.stat : C.enemy}>
          {flee.flavorText}
          {flee.harmTicks > 0 ? ` (${flee.harmTicks} harm taken)` : ''}
        </MudLine>
      );
      if (flee.clockChanges.length > 0) {
        flee.clockChanges.forEach((cc, i) => {
          addLocalMsg(
            <MudLine key={k(`fcc-${i}`)} indent color={C.dim}>
              {cc.clockName} {'█'.repeat(cc.to)}{'░'.repeat(cc.segments - cc.to)} [{cc.to}/{cc.segments}]
            </MudLine>
          );
        });
      }

      syncClockCombatToCharacter(updatedCombat, char);

      if (flee.escaped) {
        clearCombat(char.handle);
        saveCharacter(char.handle, char);
        setSession({ ...session, phase: 'active', combat: null });
        addLocalMsg(<MudLine key={k('flee-ok')} color={C.dim}>combat ended. you escaped.</MudLine>);
      } else {
        if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
        saveCombat(char.handle, updatedCombat);
        processAllEnemyTurns(session, addLocalMsg);
        if (char.hp <= 0) { handleDeath(session, addLocalMsg, setSession); return { handled: true, stopPropagation: true }; }
        setSession({ ...session });
      }

      return { handled: true, stopPropagation: true };
    }

    // ── /push (spend 1 surge for +1d6 on next roll) ──────────────────
    if (cmd === 'push') {
      if ((combat.surge ?? 0) < 1) {
        addLocalMsg(<MudNotice key={k('push-none')} error>no surge points. earn them by rolling max values.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }
      // Set a flag that the next attack/hack uses +1d6 push die
      session.combat = { ...combat, surge: combat.surge - 1 };
      addLocalMsg(
        <MudLine key={k('push-ok')} color="#fcd34d" glow>
          {'★'} SURGE spent — +1d6 PUSH die on your next action. [{combat.surge - 1}/3]
        </MudLine>
      );
      saveCombat(char.handle, session.combat);
      setSession({ ...session });
      return { handled: true, stopPropagation: true };
    }

    // ── /asset (spend 1 surge to create temporary d6 asset) ─────────
    if (cmd === 'asset') {
      if ((combat.surge ?? 0) < 1) {
        addLocalMsg(<MudNotice key={k('asset-none')} error>no surge points.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }
      const assetName = rest || 'MOMENTUM';
      session.combat = {
        ...combat,
        surge: combat.surge - 1,
        complications: [
          ...(combat.complications ?? []),
          {
            id: `asset_${Date.now()}`,
            name: assetName.toUpperCase(),
            die: 6 as const,
            owner: 'player_asset',
            source: 'surge',
            duration: 3,
          },
        ],
      };
      addLocalMsg(
        <MudLine key={k('asset-ok')} color="#fcd34d" glow>
          {'★'} SURGE spent — created {assetName.toUpperCase()} d6 asset (3 rounds). [{combat.surge - 1}/3]
        </MudLine>
      );
      saveCombat(char.handle, session.combat);
      setSession({ ...session });
      return { handled: true, stopPropagation: true };
    }

    // ── /resist (spend stress or surge to reduce incoming harm) ──────
    if (cmd === 'resist') {
      // Resist is only useful when there's a pendingResist (handled above)
      // If we get here, there's no pending resist
      addLocalMsg(
        <MudNotice key={k('resist-usage')}>
          /resist is used when harm is incoming. wait for the RESIST? prompt.
          {(combat.surge ?? 0) > 0 && <span> use /resist free to spend {'★'} surge instead of stress.</span>}
        </MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    // Fall through to stats/inv/save/mudhelp below
  }

  // ── Block non-combat navigation during combat ─────────────────────────
  if (session.phase === 'combat') {
    const allowedInCombat = ['stats', 'status', 'inventory', 'inv', 'i', 'save', 'mudhelp', 'mhelp', 'commands', 'skills', 'skillinfo', 'sinfo', 'loot', 'cyberware', 'augments', 'cw'];
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
    const branches = getAccessibleBranches(char.currentRoom, char);

    addLocalMsg(
      <div key={k('exits')}>
        <MudLine color={C.dim}>EXITS from {room?.name ?? 'unknown'}:</MudLine>
        {visibleExits.map(exit => (
          <MudLine key={k(`exit-${exit.direction}`)} indent color={C.exit}>
            {exit.direction} — {exit.description}
            {exit.locked ? ' [LOCKED]' : ''}
          </MudLine>
        ))}
        {branches.length > 0 && (
          <>
            <MudSpacer />
            <MudLine color={C.dim}>PASSAGES:</MudLine>
            {branches.map(br => (
              <div
                key={k(`branch-${br.id}`)}
                role="button" tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  eventBus.emit('mud:execute-command', { command: `/go ${br.name.toLowerCase()}` });
                  eventBus.emit('crt:glitch-tier', { tier: 1, duration: 150 });
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/go ${br.name.toLowerCase()}` }); }}
                style={{
                  cursor: 'pointer', paddingLeft: '2ch',
                  fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8,
                  color: C.exit, touchAction: 'manipulation',
                }}
              >
                {'\u25B8'} {br.name.toLowerCase()}
              </div>
            ))}
          </>
        )}
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /map ────────────────────────────────────────────────────────────
  if (cmd === 'map') {
    eventBus.emit('mud:open-map');
    eventBus.emit('crt:glitch-tier', { tier: 1, duration: 100 });
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
    // Clear any pending salvage — you walked away from the remains
    if (char.pendingSalvage) {
      delete char.pendingSalvage;
    }
    const prevRoomId = char.currentRoom;
    char.currentRoom = result.targetRoom;
    addVisitedRoom(handle, result.targetRoom);
    saveCharacter(handle, char);
    setSession({ ...session, character: { ...char } });

    // Reset panel mode on room change (exit inventory/shop view, but keep map open)
    eventBus.emit('mud:panel-mode-reset-non-map');

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
      if (obj.hidden && obj.hiddenRequirement) {
        const attr = char.attributes[obj.hiddenRequirement.attribute];
        if (attr < obj.hiddenRequirement.minimum) {
          addLocalMsg(
            <MudNotice key={k('ex-nothing')} error>you don't see anything like that here.</MudNotice>
          );
          return { handled: true, stopPropagation: true };
        }
      }

      const extra: Array<{ text: string; color: string }> = [];
      obj.gatedText?.forEach(gate => {
        if (char.attributes[gate.attribute] >= gate.minimum) {
          extra.push({ text: gate.text, color: 'var(--phosphor-accent)' });
        }
      });

      const actions: Array<{ label: string; color: string; command?: string; inlineResult?: string }> = [];
      if (obj.lootable) {
        // Build loot result text from loot table
        const lootItems = obj.lootTable?.map(entry => {
          const template = getItemTemplate(entry.itemId);
          return template?.name ?? entry.itemId;
        }).join(', ') ?? 'nothing useful';
        actions.push({ label: 'SEARCH', color: '#fbbf24', inlineResult: `you search the ${obj.name.toLowerCase()}. found: ${lootItems}` });
      }
      if (obj.interactable) {
        actions.push({ label: 'USE', color: 'var(--phosphor-accent)', command: `/use ${obj.name}` });
      }

      eventBus.emit('mud:open-examine', {
        title: obj.name,
        color: 'rgba(var(--phosphor-rgb),0.85)',
        body: obj.examineText,
        extra: extra.length > 0 ? extra : undefined,
        actions: actions.length > 0 ? actions : undefined,
      });
      return { handled: true, stopPropagation: true };
    }

    // Check NPCs
    const npc = room.npcs.find(n =>
      n.name.toLowerCase().includes(lower) ||
      n.id.toLowerCase().includes(lower)
    );

    if (npc) {
      // Open NPC interaction modal instead of ExamineModal for NPCs
      eventBus.emit('mud:open-npc-modal', buildNPCModalPayload(npc, handle));
      return { handled: true, stopPropagation: true };
    }

    // Check enemies
    const enemy = room.enemies.find(e =>
      e.name.toLowerCase().includes(lower) ||
      e.id.toLowerCase().includes(lower)
    );

    if (enemy) {
      const behaviorStr = typeof enemy.behavior === 'string' ? enemy.behavior : enemy.behavior?.type ?? 'unknown';
      const dropNames = enemy.drops
        .map(d => { const t = getItemTemplate(d.itemId); return t ? `${t.name} (${Math.round(d.chance * 100)}%)` : null; })
        .filter(Boolean)
        .join(', ');

      const extra: Array<{ text: string; color: string }> = [
        { text: `Lv.${enemy.level} · T${enemy.tier ?? '?'} · ${behaviorStr}`, color: C.dimmer },
      ];
      if (enemy.harmSegments) {
        extra.push({ text: `HARM ${enemy.harmSegments} segments · ARMOR ${enemy.armorSegments ?? 0} segments`, color: C.dimmer });
      }
      if (dropNames) {
        extra.push({ text: `drops: ${dropNames}`, color: '#fbbf24' });
      }
      extra.push({ text: `spawn: ${Math.round(enemy.spawnChance * 100)}% · count: ${enemy.count[0]}–${enemy.count[1]} · ${enemy.xpReward}xp`, color: C.dimmer });

      eventBus.emit('mud:open-examine', {
        title: enemy.name,
        color: '#ff6b6b',
        body: enemy.description ?? 'No data available.',
        extra,
      });
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
    const nextXP = char.level < LEVEL_CAP ? xpForLevel(char.level + 1 + (char.pendingLevelUps ?? 0)) : 0;
    const pending = char.pendingLevelUps ?? 0;

    addLocalMsg(
      <div key={k('stats')}>
        <MudLine color={C.accent} glow bold>
          &gt;&gt; {'\u2550'.repeat(39)}
        </MudLine>
        <MudLine color={C.accent} glow bold>
          &gt;&gt; {char.handle} — {char.subjectId} — LEVEL {char.level}
        </MudLine>
        <MudLine indent color={C.stat}>
          ARCHETYPE  {ARCHETYPE_INFO[char.archetype].label} | STYLE  {COMBAT_STYLE_INFO[char.combatStyle].label}
        </MudLine>
        <MudLine indent color={C.stat}>
          XP         {char.xp}{nextXP > 0 ? ` / ${nextXP}` : ''}{char.level >= LEVEL_CAP ? ' (MAX)' : ''}
        </MudLine>
        <MudLine indent color={C.stat}>
          HARM       {'░'.repeat(char.harmSegments)} [0/{char.harmSegments}]
        </MudLine>
        <MudLine indent color={C.stat}>
          CRITICAL   {'░'.repeat(char.criticalSegments ?? 4)} [0/{char.criticalSegments ?? 4}]
        </MudLine>
        <MudLine indent color={C.stat}>
          ARMOR      {char.armorSegments > 0
            ? `${'█'.repeat(char.armorSegments)} [${char.armorSegments}/${char.armorSegments}]`
            : 'none'}
        </MudLine>
        <MudLine indent color={C.stat}>
          RAM        {char.ramSegments > 0
            ? `${'█'.repeat(char.ramSegments)} [${char.ramSegments}/${char.ramSegments}]`
            : 'none'}
        </MudLine>
        <MudLine indent color={C.stat}>
          STYLE DIE  d{char.styleDie ?? 6}
        </MudLine>
        <MudLine indent color={char.stress > 0 ? '#fbbf24' : C.stat}>
          STRESS     {'█'.repeat(char.stress ?? 0)}{'░'.repeat((char.maxStress ?? 8) - (char.stress ?? 0))} [{char.stress ?? 0}/{char.maxStress ?? 8}]
        </MudLine>
        {(char.traumas ?? []).length > 0 && (
          <MudLine indent color="#ff6b6b">
            TRAUMAS    {(char.traumas ?? []).join(' · ')}
          </MudLine>
        )}
        <MudSpacer />
        {(Object.keys(char.attributes) as AttributeName[]).map(attr => {
          const val = char.attributes[attr];
          const die = val <= 4 ? 4 : val <= 6 ? 6 : val <= 8 ? 8 : val <= 10 ? 10 : 12;
          return (
            <MudLine key={k(`stat-${attr}`)} indent color={C.stat}>
              {attr.padEnd(8)} {String(val).padStart(2)} (d{die})
            </MudLine>
          );
        })}
        <MudSpacer />
        <MudLine indent color={C.dim}>
          creds: {char.currency.creds} {'\u00b7'} scrip: {char.currency.scrip}
        </MudLine>
        {(char.skillPoints > 0 || pending > 0) && (
          <div>
            <MudSpacer />
            {pending > 0 && (
              <MudLine indent color={C.accent} glow>
                PENDING LEVEL-UPS: {pending} — /rest at a safe haven to integrate
              </MudLine>
            )}
            {char.skillPoints > 0 && (
              <MudLine indent color={C.warning}>
                SKILL POINTS: {char.skillPoints} — /skills to view, /spend to unlock
              </MudLine>
            )}
          </div>
        )}
        <MudLine color={C.accent} glow bold>
          &gt;&gt; {'\u2550'.repeat(39)}
        </MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /inventory /inv ───────────────────────────────────────────────────
  if (cmd === 'inventory' || cmd === 'inv' || cmd === 'i') {
    // Open full inventory modal
    eventBus.emit('mud:open-inventory');
    return { handled: true, stopPropagation: true };
  }

  // ── /equip <cyberware name OR gear name> ─────────────────────────────
  if (cmd === 'equip') {
    if (!rest) {
      addLocalMsg(<MudNotice key={k('eq-noarg')}>usage: /equip {'<item name>'}. check /inventory.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    const searchTerm = rest.toLowerCase();

    // ── 1) Try augment inventory first ──
    const augInv: CyberwareItem[] = char.augmentInventory ?? [];
    const sealed: AugmentSlotType[] = char.sealedSlots ?? (char.archetype === 'DISCONNECTED' ? ['neural'] : []);
    const augMatch = augInv.find(i => i.name.toLowerCase().includes(searchTerm));
    if (augMatch) {
      const check = canEquipCyberware(augMatch, char.archetype, char.attributes as unknown as Record<string, number>, sealed);
      if (!check.allowed) {
        addLocalMsg(<MudNotice key={k('eq-locked')} error>{check.reason}</MudNotice>);
        return { handled: true, stopPropagation: true };
      }

      const slots = char.augmentSlots ?? { neural: null, chassis: null, limbs: null };
      const oldItem = slots[augMatch.slotType];

      slots[augMatch.slotType] = { ...augMatch };
      char.augmentInventory = augInv.filter(i => i.id !== augMatch.id);
      if (oldItem && oldItem.removable) {
        char.augmentInventory.push({ ...oldItem });
      }
      char.augmentSlots = { ...slots };
      saveCharacter(char.handle, char);

      addLocalMsg(
        <div key={k('eq-done')}>
          <MudLine color="#d8b4fe" bold>{'>'} {augMatch.slotType} interface updated. {augMatch.name} online.</MudLine>
          {oldItem && <MudLine color={C.dim}>{oldItem.name} {oldItem.removable ? 'returned to inventory.' : 'removed (non-removable).'}</MudLine>}
        </div>
      );
      return { handled: true, stopPropagation: true };
    }

    // ── 2) Try gear items in inventory (weapons, armor, utilities) ──
    const gearMatch = char.inventory.find(i => i.slot && i.name.toLowerCase().includes(searchTerm));
    if (gearMatch && gearMatch.slot) {
      const targetSlot: ItemSlot = gearMatch.slot;
      const gear = char.gear ?? {};
      const oldGear = gear[targetSlot] ?? null;

      // Equip: move from inventory to gear slot
      gear[targetSlot] = { ...gearMatch };
      char.inventory = char.inventory.filter(i => i !== gearMatch);
      if (oldGear) {
        char.inventory.push({ ...oldGear });
      }
      char.gear = { ...gear };
      saveCharacter(char.handle, char);

      const slotLabel = targetSlot.replace(/_/g, ' ').toUpperCase();
      addLocalMsg(
        <div key={k('eq-gear-done')}>
          <MudLine color="#60a5fa" bold>{'>'} {slotLabel} equipped. {gearMatch.name} online.</MudLine>
          {oldGear && <MudLine color={C.dim}>{oldGear.name} returned to backpack.</MudLine>}
        </div>
      );
      return { handled: true, stopPropagation: true };
    }

    addLocalMsg(<MudNotice key={k('eq-notfound')} error>no equippable item matching "{rest}" in inventory.</MudNotice>);
    return { handled: true, stopPropagation: true };
  }

  // ── /unequip <slot OR item name> ───────────────────────────────────
  if (cmd === 'unequip') {
    if (!rest) {
      addLocalMsg(<MudNotice key={k('uneq-noarg')}>usage: /unequip {'<slot>'} or /unequip {'<item name>'}</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    const searchTerm = rest.toLowerCase();

    // ── Augment slot keywords ──
    const augSlotNames: Record<string, AugmentSlotType> = {
      neural: 'neural', chassis: 'chassis', limbs: 'limbs',
      head: 'neural', torso: 'chassis', arms: 'limbs', legs: 'limbs',
    };
    const augSlotType = augSlotNames[searchTerm] ?? null;

    if (augSlotType) {
      const slots = char.augmentSlots ?? { neural: null, chassis: null, limbs: null };
      const item = slots[augSlotType];
      if (!item) {
        addLocalMsg(<MudNotice key={k('uneq-empty')} error>{augSlotType} slot is vacant.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }
      if (!item.removable) {
        addLocalMsg(<MudNotice key={k('uneq-perm')} error>{item.name} is permanently installed. cannot remove.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }
      slots[augSlotType] = null;
      char.augmentInventory = [...(char.augmentInventory ?? []), { ...item }];
      char.augmentSlots = { ...slots };
      saveCharacter(char.handle, char);
      addLocalMsg(<MudLine key={k('uneq-ok')} color={C.dim}>{'>'} {item.name} removed from {augSlotType}. returned to inventory.</MudLine>);
      return { handled: true, stopPropagation: true };
    }

    // ── Gear slot keywords ──
    const gearSlotNames: Record<string, ItemSlot> = {
      weapon: 'weapon_primary', primary: 'weapon_primary',
      sidearm: 'weapon_sidearm', secondary: 'weapon_sidearm',
      armor: 'armor', armour: 'armor',
      utility1: 'utility_1', utility2: 'utility_2', utility3: 'utility_3',
    };
    const gearSlotType = gearSlotNames[searchTerm] ?? null;

    if (gearSlotType) {
      const gear = char.gear ?? {};
      const item = gear[gearSlotType] ?? null;
      if (!item) {
        const slotLabel = gearSlotType.replace(/_/g, ' ');
        addLocalMsg(<MudNotice key={k('uneq-gempty')} error>{slotLabel} slot is empty.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }
      delete gear[gearSlotType];
      char.inventory.push({ ...item });
      char.gear = { ...gear };
      saveCharacter(char.handle, char);
      addLocalMsg(<MudLine key={k('uneq-gok')} color={C.dim}>{'>'} {item.name} unequipped. returned to backpack.</MudLine>);
      return { handled: true, stopPropagation: true };
    }

    // ── Try matching by item name in augment slots ──
    const augSlots = char.augmentSlots ?? { neural: null, chassis: null, limbs: null };
    const augFound = (['neural', 'chassis', 'limbs'] as AugmentSlotType[]).find(s => {
      const item = augSlots[s];
      return item && item.name.toLowerCase().includes(searchTerm);
    });
    if (augFound) {
      const item = augSlots[augFound]!;
      if (!item.removable) {
        addLocalMsg(<MudNotice key={k('uneq-perm')} error>{item.name} is permanently installed. cannot remove.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }
      augSlots[augFound] = null;
      char.augmentInventory = [...(char.augmentInventory ?? []), { ...item }];
      char.augmentSlots = { ...augSlots };
      saveCharacter(char.handle, char);
      addLocalMsg(<MudLine key={k('uneq-ok')} color={C.dim}>{'>'} {item.name} removed. returned to inventory.</MudLine>);
      return { handled: true, stopPropagation: true };
    }

    // ── Try matching by item name in gear slots ──
    const gear = char.gear ?? {};
    const gearFound = (Object.keys(gear) as ItemSlot[]).find(s => {
      const item = gear[s];
      return item && item.name.toLowerCase().includes(searchTerm);
    });
    if (gearFound) {
      const item = gear[gearFound]!;
      delete gear[gearFound];
      char.inventory.push({ ...item });
      char.gear = { ...gear };
      saveCharacter(char.handle, char);
      addLocalMsg(<MudLine key={k('uneq-gok')} color={C.dim}>{'>'} {item.name} unequipped. returned to backpack.</MudLine>);
      return { handled: true, stopPropagation: true };
    }

    addLocalMsg(<MudNotice key={k('uneq-nf')} error>nothing equipped matching "{rest}".</MudNotice>);
    return { handled: true, stopPropagation: true };
  }

  // ── /cyberware /augments — quick view ─────────────────────────────────
  if (cmd === 'cyberware' || cmd === 'augments' || cmd === 'cw') {
    const slots = char.augmentSlots ?? { neural: null, chassis: null, limbs: null };
    const sealed: AugmentSlotType[] = char.sealedSlots ?? (char.archetype === 'DISCONNECTED' ? ['neural'] : []);
    const slotOrder: AugmentSlotType[] = ['neural', 'chassis', 'limbs'];

    addLocalMsg(
      <div key={k('cw-view')}>
        <MudLine bold color={C.label}>{'>'} AUGMENTATION STATUS</MudLine>
        {slotOrder.map(s => {
          const item = slots[s];
          if (sealed.includes(s)) {
            return <MudLine key={s} color="rgba(255,80,80,0.5)">  {s.toUpperCase().padEnd(8)} [SEALED]</MudLine>;
          }
          if (!item) {
            return <MudLine key={s} color={C.hint}>  {s.toUpperCase().padEnd(8)} vacant</MudLine>;
          }
          return (
            <MudLine key={s} color="#d8b4fe">
              {'  '}{s.toUpperCase().padEnd(8)} {item.name} T{item.tier}
              {' '}({Object.entries(item.statBonuses).filter(([,v]) => v).map(([a,v]) => `+${v} ${a}`).join(', ')})
            </MudLine>
          );
        })}
        <MudLine color={C.hint} opacity={0.6}>  use /inventory {'>'} AUGMENTS tab to manage slots.</MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ══════════════════════════════════════════════════════════════════════
  // ── PROGRESSION COMMANDS ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════

  // ── /heal ───────────────────────────────────────────────────────────────
  if (cmd === 'heal') {
    const room = getRoom(char.currentRoom);
    if (!room) return { handled: true, stopPropagation: true };

    const medic = room.npcs.find(n => n.services?.includes('heal'));
    if (!medic) {
      addLocalMsg(<MudNotice key={k('heal-no-npc')} error>no one here can patch you up.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    const missing = char.maxHp - char.hp;
    const stressHeld = char.stress ?? 0;
    if (missing <= 0 && stressHeld <= 0) {
      addLocalMsg(
        <MudLine key={k('heal-full')} color={C.dim}>
          {medic.name} looks you over. &quot;you&apos;re fine. stop wasting my time.&quot;
        </MudLine>
      );
      return { handled: true, stopPropagation: true };
    }

    // Cost: 5 creds per 10 HP missing (min 5), +5 if stress > 0
    const hpCost = missing > 0 ? Math.max(5, Math.ceil(missing / 10) * 5) : 0;
    const stressCost = stressHeld > 0 ? 5 : 0;
    const totalCost = hpCost + stressCost;

    if (char.currency.creds < totalCost) {
      addLocalMsg(
        <div key={k('heal-broke')}>
          <MudLine color={C.dim}>
            {medic.name}: &quot;{totalCost} creds. you have {char.currency.creds}. come back when you can pay.&quot;
          </MudLine>
        </div>
      );
      return { handled: true, stopPropagation: true };
    }

    // Apply healing
    const hpBefore = char.hp;
    char.hp = char.maxHp;
    const hpRestored = char.hp - hpBefore;
    const stressBefore = char.stress;
    if (stressHeld > 0) {
      char.stress = Math.max(0, char.stress - 2);
    }
    const stressDrained = stressBefore - char.stress;
    char.currency.creds -= totalCost;

    saveCharacter(handle, char);
    setSession({ ...session });

    addLocalMsg(
      <div key={k('heal-ok')}>
        <MudLine color="#4ade80">
          {medic.name} works in silence. steady hands. no wasted motion.
        </MudLine>
        {hpRestored > 0 && (
          <MudLine indent color="#4ade80">
            HP restored: +{hpRestored} [{char.hp}/{char.maxHp}]
          </MudLine>
        )}
        {stressDrained > 0 && (
          <MudLine indent color="#fbbf24">
            stress eased: -{stressDrained} [{char.stress}/{char.maxStress}]
          </MudLine>
        )}
        <MudLine indent color={C.dim}>
          cost: {totalCost}c — remaining: {char.currency.creds}c
        </MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /rest ──────────────────────────────────────────────────────────────
  if (cmd === 'rest') {
    const result = executeRest(session);

    if (!result.success) {
      if (result.reason === 'not in a safe haven') {
        addLocalMsg(
          <div key={k('rest-fail')}>
            <MudLine color={C.dim}>
              &gt; you can't rest here. the walls have ears and the dark has teeth.
            </MudLine>
            <MudLine color={C.dim}>
              &gt; find a safe haven. somewhere the world stops for a minute.
            </MudLine>
            {result.nearestHavens && result.nearestHavens.length > 0 && (
              <div>
                <MudSpacer />
                <MudLine color={C.dim}>&gt; nearest known havens:</MudLine>
                {result.nearestHavens.map((nh, i) => (
                  <MudLine key={k(`haven-${i}`)} indent color={C.accent}>
                    {nh.haven.name} ({nh.distance})
                  </MudLine>
                ))}
              </div>
            )}
          </div>
        );
      } else {
        addLocalMsg(
          <MudNotice key={k('rest-err')} error>{result.reason}</MudNotice>
        );
      }
      return { handled: true, stopPropagation: true };
    }

    // Success — open rest modal with clock data
    const pending = result.pendingLevels ?? 0;
    // Calculate pre-rest harm from HP state (harm = segments × (1 - hp/maxHp))
    const harmSegs = char.harmSegments || 6;
    const preRestHarm = Math.round(harmSegs * (1 - ((char.hp - (result.hpRestored ?? 0)) / char.maxHp)));
    const armorSegs = char.armorSegments || 0;
    const ramSegs = char.ramSegments || char.maxRam;
    const preRestRamUsed = Math.round(ramSegs * (1 - ((char.ram - (result.ramRestored ?? 0)) / Math.max(1, char.maxRam))));

    eventBus.emit('mud:open-rest', {
      location: getSafeHaven(char.currentRoom)?.name ?? 'SAFE HAVEN',
      flavorText: result.flavorText ?? 'you rest.',
      harmBefore: Math.max(0, preRestHarm),
      harmSegments: harmSegs,
      armorBefore: 0, // armor resets to full
      armorSegments: armorSegs,
      ramBefore: Math.max(0, preRestRamUsed),
      ramSegments: ramSegs,
      stressBefore: char.stress + (result.stressDrained ?? 0),
      stressAfter: char.stress,
      maxStress: char.maxStress ?? 8,
      pendingLevelUps: pending,
      level: char.level,
    });
    setSession({ ...session });
    return { handled: true, stopPropagation: true };
  }

  // ── /levelup ───────────────────────────────────────────────────────────
  if (cmd === 'levelup' || cmd === 'lvlup' || cmd === 'level' || cmd === 'upgrade') {
    const pending = char.pendingLevelUps ?? 0;
    if (pending <= 0) {
      addLocalMsg(
        <MudNotice key={k('lvl-none')}>
          no pending level-ups. earn more XP and reach the threshold.
        </MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    // Must be in a safe haven
    if (!isSafeHaven(char.currentRoom)) {
      addLocalMsg(
        <MudNotice key={k('lvl-nosafe')} error>
          you need to /rest at a safe haven before leveling up.
        </MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    // Open the level-up modal
    eventBus.emit('mud:open-levelup');
    return { handled: true, stopPropagation: true };
  }

  // ── /skills ────────────────────────────────────────────────────────────
  if (cmd === 'skills') {
    const totalSpent = char.unlockedSkills.length;
    const trees = getAvailableTrees(char);

    addLocalMsg(
      <div key={k('skills')}>
        <MudLine color={C.accent} glow bold>
          &gt;&gt; {'\u2550'.repeat(39)}
        </MudLine>
        <MudLine color={C.accent} glow bold>
          &gt;&gt; SKILL TREES — {totalSpent}/20 points spent
        </MudLine>
        <MudLine color={C.accent} glow bold>
          &gt;&gt; {'\u2550'.repeat(39)}
        </MudLine>
        {trees.map(treeId => {
          const display = getTreeDisplay(treeId, char, false);
          const pointsIn = getPointsInTree(treeId, char);
          const total = display.length;
          const label = TREE_LABELS[treeId];
          const isPrimary = treeId === STYLE_TO_TREE[char.combatStyle];

          return (
            <div key={k(`tree-${treeId}`)}>
              <MudSpacer />
              <MudLine color={C.stat} bold>
                {label} TREE{isPrimary ? ' (primary)' : ''} — {pointsIn}/{total} nodes
              </MudLine>
              {display.map(d => (
                <MudLine key={k(`sk-${d.node.id}`)} indent color={d.unlocked ? C.heal : C.dim}>
                  [{d.unlocked ? '\u25a0' : ' '}] {d.node.name}
                  {d.node.tier === 4 ? ' (capstone)' : ''}
                </MudLine>
              ))}
            </div>
          );
        })}
        {hasCrossClassAccess(char) && (
          <div>
            <MudSpacer />
            <MudLine color={C.warning}>
              CROSS-CLASS (unlocked) — 2x cost, tier 1-2 only
            </MudLine>
            <MudLine indent color={C.dim}>
              /crosstree &lt;style&gt; to view secondary trees
            </MudLine>
          </div>
        )}
        {char.discoveredSynergies && char.discoveredSynergies.length > 0 && (
          <div>
            <MudSpacer />
            <MudLine color={C.warning} bold>ACTIVE SYNERGIES: {char.discoveredSynergies.length}</MudLine>
            {getDiscoveredSynergies(char).map(syn => (
              <MudLine key={k(`syn-${syn.id}`)} indent color={C.warning}>
                {syn.name}
              </MudLine>
            ))}
          </div>
        )}
        <MudSpacer />
        <MudLine color={C.dim}>/skillinfo &lt;name&gt; for details</MudLine>
        <MudLine color={C.dim}>/skilltree for visual tree</MudLine>
        <MudLine color={C.accent} glow bold>
          &gt;&gt; {'\u2550'.repeat(39)}
        </MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /skilltree ─────────────────────────────────────────────────────────
  if (cmd === 'skilltree' || cmd === 'stree') {
    const primaryTreeId = STYLE_TO_TREE[char.combatStyle];
    const display = getTreeDisplay(primaryTreeId, char, false);
    const label = TREE_LABELS[primaryTreeId];

    // Build ASCII tree
    const tiers = [1, 2, 3, 4] as const;
    const tierLabels = ['TIER 1', 'TIER 2', 'TIER 3', 'TIER 4'];

    addLocalMsg(
      <div key={k('skilltree')}>
        <MudLine color={C.accent} glow bold>
          &gt;&gt; {label} TREE
        </MudLine>
        <MudSpacer />
        <div style={{
          fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5ch',
        }}>
          {tiers.map((tier, ti) => {
            const nodesInTier = display.filter(d => d.node.tier === tier);
            const branchA = nodesInTier.find(d => d.node.branch === 'a');
            const branchB = nodesInTier.find(d => d.node.branch === 'b');

            return (
              <div key={k(`tier-${tier}`)} style={{ minWidth: 0 }}>
                <div style={{ color: C.dim, fontSize: '0.7em', marginBottom: '0.2rem' }}>{tierLabels[ti]}</div>
                {branchA && (
                  <div style={{
                    color: branchA.unlocked ? C.heal : branchA.available ? C.accent : C.dim,
                    fontSize: '0.85em',
                    marginBottom: '0.3rem',
                  }}>
                    [{branchA.unlocked ? '\u25a0' : branchA.available ? '\u25cb' : ' '}] {branchA.node.name}
                  </div>
                )}
                {branchB && (
                  <div style={{
                    color: branchB.unlocked ? C.heal : branchB.available ? C.accent : C.dim,
                    fontSize: '0.85em',
                  }}>
                    [{branchB.unlocked ? '\u25a0' : branchB.available ? '\u25cb' : ' '}] {branchB.node.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <MudSpacer />
        <MudLine color={C.dim}>
          [{'\u25a0'}]=unlocked [{'\u25cb'}]=available [ ]=locked
        </MudLine>
        <MudLine color={C.dim}>/skillinfo &lt;name&gt; for details · /spend &lt;name&gt; to unlock</MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /skillinfo <name> ──────────────────────────────────────────────────
  if (cmd === 'skillinfo' || cmd === 'sinfo') {
    if (!rest) {
      addLocalMsg(
        <MudNotice key={k('si-err')}>usage: /skillinfo &lt;skill name&gt;</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }
    const search = rest.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const node = ALL_SKILLS.find(s =>
      s.name.toLowerCase() === search ||
      s.id.toLowerCase() === search ||
      s.name.toLowerCase().includes(search)
    );

    if (!node) {
      addLocalMsg(
        <MudNotice key={k('si-notfound')} error>skill not found: "{rest}"</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    const isUnlocked = char.unlockedSkills.includes(node.id);
    const check = canUnlockSkill(node.id, char, false);
    const prereqNames = node.prereqSkills.map(id => {
      const n = getSkillNode(id);
      return n ? n.name : id;
    });

    addLocalMsg(
      <div key={k('skillinfo')}>
        <MudLine color={C.accent} bold>
          {node.name} — {TREE_LABELS[node.tree]} TREE, TIER {node.tier}
        </MudLine>
        <MudLine color={C.dim}>{'\u2500'.repeat(37)}</MudLine>
        {prereqNames.length > 0 && (
          <MudLine indent color={C.stat}>prereqs: {prereqNames.join(', ')}</MudLine>
        )}
        {node.prereqAttribute && (
          <MudLine indent color={C.stat}>
            requires: {node.prereqAttribute.attribute} {'\u2265'} {node.prereqAttribute.minimum}
          </MudLine>
        )}
        <MudLine indent color={C.stat}>cost: {node.cost} skill point{node.cost > 1 ? 's' : ''}</MudLine>
        <MudLine indent color={isUnlocked ? C.heal : check.canUnlock ? C.accent : C.dim}>
          status: {isUnlocked ? 'UNLOCKED' : check.canUnlock ? 'AVAILABLE' : `LOCKED (${check.reason})`}
        </MudLine>
        <MudSpacer />
        <MudLine color={C.stat}>{node.description}</MudLine>
        <MudSpacer />
        <MudLine color={C.n1x} style={{ opacity: 0.85 }}>
          "{node.flavorText}"
        </MudLine>
        <MudLine color={C.dim}>{'\u2500'.repeat(37)}</MudLine>
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /spend <skill_name> ────────────────────────────────────────────────
  if (cmd === 'spend' || cmd === 'unlock') {
    if (!rest) {
      addLocalMsg(
        <MudNotice key={k('sp-err')}>usage: /spend &lt;skill name&gt;</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    if (char.skillPoints <= 0) {
      addLocalMsg(
        <MudNotice key={k('sp-nopts')} error>no skill points available.</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    const search = rest.toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const node = ALL_SKILLS.find(s =>
      s.name.toLowerCase() === search ||
      s.id.toLowerCase() === search ||
      s.name.toLowerCase().includes(search)
    );

    if (!node) {
      addLocalMsg(
        <MudNotice key={k('sp-notfound')} error>skill not found: "{rest}"</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    // Check if this is a cross-class skill
    const primaryTree = STYLE_TO_TREE[char.combatStyle];
    const isCrossClass = node.tree !== primaryTree
      && node.tree !== 'universal'
      && node.tree !== 'frequency'
      && ['chrome', 'synapse', 'ballistic', 'ghost'].includes(node.tree);

    const result = unlockSkill(char, node.id, isCrossClass);
    if (!result.success) {
      addLocalMsg(
        <MudNotice key={k('sp-fail')} error>{result.error}</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    saveCharacter(char.handle, char);
    eventBus.emit('crt:glitch-tier', { tier: node.tier >= 3 ? 2 : 1, duration: node.tier >= 3 ? 250 : 120 });

    // Check for new synergies
    const newSynergies = checkNewSynergies(char);

    addLocalMsg(
      <div key={k('sp-ok')}>
        <MudLine color={C.heal} glow bold>
          &gt;&gt; SKILL UNLOCKED: {node.name}
        </MudLine>
        <MudLine indent color={C.stat}>{node.description}</MudLine>
        <MudLine indent color={C.dim}>
          skill points remaining: {char.skillPoints}
        </MudLine>
        {newSynergies.length > 0 && newSynergies.map(syn => (
          <div key={k(`nsyn-${syn.id}`)}>
            <MudSpacer />
            <MudLine color={C.warning} glow bold>&gt;&gt; SYNERGY ACTIVATED: {syn.name}</MudLine>
            <MudLine indent color={C.n1x} style={{ opacity: 0.85 }}>{syn.effectDescription}</MudLine>
          </div>
        ))}
      </div>
    );
    setSession({ ...session });
    return { handled: true, stopPropagation: true };
  }

  // ── /loot ──────────────────────────────────────────────────────────────
  if (cmd === 'loot') {
    const lastLoot = char.lastCombatLoot;
    if (!lastLoot || lastLoot.length === 0) {
      addLocalMsg(
        <MudNotice key={k('loot-none')}>no recent combat drops.</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    addLocalMsg(
      <div key={k('loot')}>
        <MudLine color={C.accent} bold>&gt;&gt; LAST COMBAT DROPS</MudLine>
        {lastLoot.map((itemId, i) => {
          const template = getItemTemplate(itemId);
          return (
            <MudLine key={k(`loot-${i}`)} indent color={C.stat}>
              {template?.name ?? itemId}
            </MudLine>
          );
        })}
      </div>
    );
    return { handled: true, stopPropagation: true };
  }

  // ── /take [item|all] ───────────────────────────────────────────────────
  if (cmd === 'take' || cmd === 'takeall' || cmd === 'salvage') {
    const salvage = char.pendingSalvage;
    if (!salvage || salvage.enemies.length === 0) {
      addLocalMsg(
        <MudNotice key={k('take-none')}>nothing to salvage.</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    const allDrops = salvage.enemies.flatMap(e => e.drops);
    const untaken = allDrops.filter(d => !d.taken);

    if (untaken.length === 0) {
      addLocalMsg(
        <MudNotice key={k('take-empty')}>nothing left. you picked it clean.</MudNotice>
      );
      delete char.pendingSalvage;
      saveCharacter(char.handle, char);
      eventBus.emit('mud:panel-mode', { mode: 'default' });
      setSession({ ...session });
      return { handled: true, stopPropagation: true };
    }

    const takeAll = cmd === 'takeall' || cmd === 'salvage' || rest.toLowerCase() === 'all';
    const collectedNames: string[] = [];

    if (takeAll) {
      // Take everything
      for (const drop of untaken) {
        const item = createItem(drop.itemId);
        if (item) {
          const existing = char.inventory.find(i => i.id === drop.itemId && i.stackable);
          if (existing) { existing.quantity += item.quantity; }
          else { char.inventory.push(item); }
          collectedNames.push(item.name);
          drop.taken = true;
        }
      }
    } else if (rest) {
      // Take specific item by name
      const search = rest.toLowerCase();
      const match = untaken.find(d => d.name.toLowerCase().includes(search));
      if (!match) {
        addLocalMsg(
          <MudNotice key={k('take-notfound')} error>
            no "{rest}" in the salvage.
          </MudNotice>
        );
        return { handled: true, stopPropagation: true };
      }
      const item = createItem(match.itemId);
      if (item) {
        const existing = char.inventory.find(i => i.id === match.itemId && i.stackable);
        if (existing) { existing.quantity += item.quantity; }
        else { char.inventory.push(item); }
        collectedNames.push(item.name);
        match.taken = true;
      }
    } else {
      addLocalMsg(
        <MudNotice key={k('take-usage')}>usage: /take &lt;item name&gt; or /take all</MudNotice>
      );
      return { handled: true, stopPropagation: true };
    }

    // Check if all taken
    const remaining = allDrops.filter(d => !d.taken);
    if (remaining.length === 0) {
      delete char.pendingSalvage;
      eventBus.emit('mud:panel-mode', { mode: 'default' });
    }

    saveCharacter(char.handle, char);
    setSession({ ...session });

    addLocalMsg(
      <div key={k('take-ok')}>
        {collectedNames.map((name, i) => (
          <MudLine key={k(`took-${i}`)} color={C.heal} indent>
            + {name}
          </MudLine>
        ))}
        {remaining.length > 0 && (
          <MudLine color={C.dim}>
            {remaining.length} item{remaining.length > 1 ? 's' : ''} remaining.
          </MudLine>
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
    eventBus.emit('mud:open-help');
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

    // Open NPC modal on SHOP tab
    eventBus.emit('mud:open-npc-modal', buildNPCModalPayload(shopkeeper, handle, 'SHOP'));
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
    emitCommerceTransient(`purchased ${result.item!.name} for ${result.price}c. remaining: ${char.currency.creds}c`);
    setSession({ ...session });
    return { handled: true, stopPropagation: true };
  }

  // ── /sell <item> ──────────────────────────────────────────────────────
  if (cmd === 'sell') {
    const room = getRoom(char.currentRoom);
    const shopkeeper = room?.npcs.find(n => n.services?.includes('shop'));
    if (!shopkeeper) {
      addLocalMsg(<MudNotice key={k('sell-no-shop')} error>no vendor here.</MudNotice>);
      return { handled: true, stopPropagation: true };
    }

    // /sell with no args or /sell all → open batch sell modal
    if (!rest || rest.toLowerCase() === 'all') {
      const sellable = char.inventory.filter(i => !i.questItem && !i.loreItem && (i.sellPrice ?? 0) > 0);
      if (sellable.length === 0) {
        addLocalMsg(<MudNotice key={k('sell-nothing')} error>nothing to sell.</MudNotice>);
        return { handled: true, stopPropagation: true };
      }
      eventBus.emit('mud:open-sell', {
        inventory: char.inventory,
        shopkeeperId: shopkeeper.id,
        shopkeeperName: getShopkeeperName(shopkeeper.id),
        currentCreds: char.currency.creds,
      });
      return { handled: true, stopPropagation: true };
    }

    // Single item sell
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
    emitCommerceTransient(`sold ${result.itemName} for ${result.price}c. total: ${char.currency.creds}c`);
    setSession({ ...session });
    return { handled: true, stopPropagation: true };
  }

  // ── /jobs (alias: /quests) ────────────────────────────────────────────
  if (cmd === 'jobs' || cmd === 'quests') {
    eventBus.emit('mud:open-quests');
    return { handled: true, stopPropagation: true };
  }

  // ── /job <id> (alias: /quest) ──────────────────────────────────────────
  if (cmd === 'job' || cmd === 'quest') {
    eventBus.emit('mud:open-quests');
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

  // ── Hidden debug commands (not in /help or MUD_COMMANDS) ─────────────

  if (cmd === 'nofog') {
    eventBus.emit('mud:open-nofog');
    return { handled: true, stopPropagation: true };
  }

  if (cmd === 'fogon') {
    eventBus.emit('mud:close-nofog');
    return { handled: true, stopPropagation: true };
  }

  if (cmd === 'godmode') {
    char.godMode = !char.godMode;
    char.hp = char.maxHp;
    // Sync combat HP if in combat
    if (session.combat) {
      // In clock combat, godMode is checked during resolution — no direct HP sync needed
    }
    saveCharacter(char.handle, char);
    addLocalMsg(
      <div key={k('godmode')} style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8 }}>
        <MudLine color={char.godMode ? '#ffcc00' : C.dim} bold>
          {'>> GOD MODE: '}{char.godMode ? 'ON' : 'OFF'}
        </MudLine>
        <MudLine color={C.dim}>
          {char.godMode ? 'invincible. hp locked at maximum.' : 'mortality restored.'}
        </MudLine>
      </div>
    );
    setSession({ ...session });
    return { handled: true, stopPropagation: true };
  }

  if (cmd === 'kill') {
    char.hp = 0;
    handleDeath(session, addLocalMsg, setSession);
    return { handled: true, stopPropagation: true };
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
                &gt;&gt; JOB ACCEPTED: {quest.title}
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
                /jobs to track progress · /job {quest.id} for details
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
  '/talk', '/shop', '/buy', '/sell', '/jobs', '/job', '/quests', '/quest', '/me', '/mudhelp', '/q',
  '/rest', '/levelup', '/upgrade', '/skills', '/skilltree', '/skillinfo', '/spend', '/loot',
  '/take', '/salvage', '/equip', '/unequip', '/cyberware', '/augments',
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
      // Add branch room names accessible from current room
      const branches = getAccessibleBranches(char.currentRoom, char);
      exits.push(...branches.map(b => b.name.toLowerCase()));
      return exits.filter(e => e.startsWith(argPartial)).map(e => `/go ${e}`);
    }

    // /examine → objects + NPCs + enemies in room
    if (cmd === '/examine' || cmd === '/x') {
      const things = [
        ...room.objects.filter(o => {
          if (!o.hidden) return true;
          if (!o.hiddenRequirement) return false;
          return char.attributes[o.hiddenRequirement.attribute] >= o.hiddenRequirement.minimum;
        }).map(o => o.name.toLowerCase()),
        ...room.npcs.map(n => n.name.toLowerCase()),
        ...room.enemies.map(e => e.name.toLowerCase()),
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
      const options = ['all', ...items];
      return options.filter(n => n.includes(argPartial)).map(n => `/sell ${n}`);
    }

    // /talk → NPC names
    if (cmd === '/talk') {
      const npcs = room.npcs.map(n => n.name.toLowerCase());
      return npcs.filter(n => n.includes(argPartial)).map(n => `/talk ${n}`);
    }

    // /job or /quest → quest IDs
    if (cmd === '/job' || cmd === '/quest') {
      const ids = Object.keys(QUEST_REGISTRY);
      return ids.filter(id => id.includes(argPartial)).map(id => `/job ${id}`);
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
    // In clock combat, AP concept is replaced by turnPhase
    combatAP = isPlayersTurn(session.combat) ? 2 : 0;
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
