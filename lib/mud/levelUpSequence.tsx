// lib/mud/levelUpSequence.tsx
// TUNNELCORE MUD — Level-Up Interactive Sequence
// The level-up is not a popup. It's a conversation with yourself —
// or with whatever the implant is becoming.

import React from 'react';
import type { MudCharacter, Archetype, AttributeName } from './types';
import {
  xpForLevel, LEVEL_CAP, calculateMaxHp, calculateMaxRam,
} from './types';
import { saveCharacter } from './persistence';
import { calculateHarmSegments } from './clockEngine';
import { getStyleDieSize } from './dicePool';
import { eventBus } from '@/lib/eventBus';
import {
  ATTRIBUTE_LEVEL_FLAVOR,
  getAvailableTrees, TREE_LABELS,
  STYLE_TO_TREE,
} from './skillTree';
import { checkNewSynergies } from './synergies';

// ── Inline styles (matching mudCommands.tsx patterns) ───────────────────────

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  glow:   'text-glow',
};

const C = {
  accent:    'var(--phosphor-accent)',
  dim:       'rgba(var(--phosphor-rgb),0.75)',
  stat:      'var(--phosphor-green)',
  n1x:       '#cc44ff',
  error:     '#ff6b6b',
  heal:      '#4ade80',
  warning:   '#ff8c00',
};

function Line({ children, color, bold, glow, indent, style }: {
  children: React.ReactNode;
  color?: string;
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
        color: color ?? C.stat,
        fontWeight: bold ? 'bold' : undefined,
        paddingLeft: indent ? '2ch' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Spacer() {
  return <div style={{ height: '0.4rem' }} />;
}

let _keySeq = 0;
function k(prefix: string): string {
  return `lvl-${prefix}-${Date.now()}-${++_keySeq}`;
}

// ── Archetype-Specific Integration Narratives ──────────────────────────────

const INTEGRATION_NARRATIVE: Record<Archetype, string[]> = {
  SOVEREIGN: [
    'the implant pulses. not pain — recognition. it\'s learning',
    'what you learned. every fight, every conversation, every',
    'moment you chose to keep going instead of stopping. the',
    'neural pathways fork. the signal strengthens.',
  ],
  DISCONNECTED: [
    'your muscles ache in a new way. not damage — growth.',
    'the body remembers what the mind processes. every',
    'impact absorbed, every weight carried, every moment',
    'your flesh did what chrome couldn\'t. you\'re harder now.',
    'not armored. hardened. there\'s a difference.',
  ],
  INTEGRATED: [
    'the augments recalibrate. somewhere behind your eyes,',
    'firmware updates itself. you didn\'t authorize this —',
    'it\'s autonomic now, the chrome rewriting its own',
    'parameters based on combat data, environmental telemetry,',
    'the thousand small decisions that separate alive from dead.',
  ],
};

const INTEGRATION_LABEL: Record<Archetype, string> = {
  SOVEREIGN: 'MNEMOS v0.9 integration',
  DISCONNECTED: 'biological adaptation',
  INTEGRATED: 'augment recalibration',
};

// ── Progress Bar Component ─────────────────────────────────────────────────

function ProgressBar({ label, onComplete }: { label: string; onComplete: () => void }) {
  const [progress, setProgress] = React.useState(0);
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    if (progress >= 100) {
      if (!completedRef.current) {
        completedRef.current = true;
        setTimeout(onComplete, 400);
      }
      return;
    }
    const increment = progress < 78 ? Math.floor(Math.random() * 12) + 5 : Math.floor(Math.random() * 8) + 3;
    const delay = progress < 78 ? 120 : 200;
    const timer = setTimeout(() => {
      setProgress(prev => Math.min(100, prev + increment));
      eventBus.emit('shell:request-scroll');
    }, delay);
    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  const filled = Math.floor(progress / 4);
  const empty = 25 - filled;
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);

  return (
    <Line color={C.dim}>
      {label} in progress...{'\n'}
      {bar} {progress}%
    </Line>
  );
}

// ── Integration Narrative Component ────────────────────────────────────────

function IntegrationNarrative({
  archetype,
  onComplete,
}: {
  archetype: Archetype;
  onComplete: () => void;
}) {
  const lines = INTEGRATION_NARRATIVE[archetype];
  const label = INTEGRATION_LABEL[archetype];
  const [revealed, setRevealed] = React.useState(0);
  const [showProgress, setShowProgress] = React.useState(false);

  React.useEffect(() => {
    if (revealed >= lines.length) {
      const timer = setTimeout(() => setShowProgress(true), 600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setRevealed(prev => prev + 1);
      eventBus.emit('crt:glitch-tier', { tier: 1, duration: 80 });
      eventBus.emit('shell:request-scroll');
    }, 500 + revealed * 400);
    return () => clearTimeout(timer);
  }, [revealed, lines.length]);

  return (
    <div>
      {lines.slice(0, revealed).map((line, i) => (
        <Line key={k(`nar-${i}`)} color={C.n1x} style={{ opacity: 0.9 }}>
          &gt; {line}
        </Line>
      ))}
      {showProgress && (
        <>
          <Spacer />
          <ProgressBar label={label} onComplete={onComplete} />
        </>
      )}
    </div>
  );
}

// ── Attribute Allocation Component ─────────────────────────────────────────

function AttributeBar({ value, max = 15 }: { value: number; max?: number }) {
  const filled = Math.min(value, max);
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(max - filled);
  return <span>{bar}</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MAIN LEVEL-UP FLOW ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
// Called from mudCommands.tsx /levelup handler.
// Uses addLocalMsg + pushDelayed pattern to stream output.

type AddLocalMsg = (node: React.ReactNode) => void;

export function executeLevelUp(
  character: MudCharacter,
  addLocalMsg: AddLocalMsg,
  requestInput: (prompt: string) => Promise<string>,
  onComplete: (character: MudCharacter) => void,
): void {
  // Calculate how many levels to process
  const pendingLevels = character.pendingLevelUps ?? 0;
  if (pendingLevels <= 0) return;

  const startLevel = character.level;
  const endLevel = startLevel + pendingLevels;
  const isMulti = pendingLevels > 1;

  // Phase 1: Integration Narrative (rendered as component)
  addLocalMsg(
    <div key={k('integration')}>
      <Spacer />
      <IntegrationNarrative
        archetype={character.archetype}
        onComplete={() => {
          // Phase 1 complete — show complete message
          addLocalMsg(
            <Line key={k('int-done')} color={C.n1x} style={{ opacity: 0.9 }}>
              &gt;{'\n'}&gt; integration complete. you are more than you were.
            </Line>
          );

          // Phase 2: Core stat gains
          setTimeout(() => {
            eventBus.emit('crt:glitch-tier', { tier: 2, duration: 250 });
            showStatGains(character, startLevel, endLevel, isMulti, addLocalMsg, requestInput, onComplete);
          }, 800);
        }}
      />
    </div>
  );
}

function showStatGains(
  character: MudCharacter,
  startLevel: number,
  endLevel: number,
  isMulti: boolean,
  addLocalMsg: AddLocalMsg,
  requestInput: (prompt: string) => Promise<string>,
  onComplete: (character: MudCharacter) => void,
): void {
  const levels = endLevel - startLevel;
  const oldHarmSegs = character.harmSegments || 6;

  // Apply the actual level changes
  character.level = endLevel;
  character.pendingLevelUps = 0;

  // Recalculate HP (legacy compat)
  const newMaxHp = calculateMaxHp(character.attributes.BODY, character.archetype, character.level);
  character.maxHp = newMaxHp;
  character.hp = newMaxHp;
  character.maxRam = calculateMaxRam(character.attributes.TECH);
  character.ram = character.maxRam;

  // Recalculate clock segments
  character.harmSegments = calculateHarmSegments(character.attributes.BODY, character.archetype);
  character.criticalSegments = 4;
  character.ramSegments = character.maxRam;
  character.styleDie = getStyleDieSize(character);

  const harmGain = character.harmSegments - oldHarmSegs;

  // Grant skill points only — attributes grow via milestones
  const skillPoints = levels;
  character.skillPoints += skillPoints;

  const title = isMulti
    ? `MULTI-LEVEL INTEGRATION: ${startLevel} \u2192 ${endLevel} (${levels} levels)`
    : `LEVEL ${endLevel} ACHIEVED`;

  addLocalMsg(
    <div key={k('stat-gains')}>
      <Spacer />
      <Line color={C.accent} glow bold>&gt;&gt; {title}</Line>
      <Spacer />
      <Line color={C.stat} bold>&gt;&gt; BASE GAINS:</Line>
      {harmGain > 0 && <Line indent color={C.stat}>harm clock: +{harmGain} segments ({oldHarmSegs} \u2192 {character.harmSegments})</Line>}
      <Line indent color={C.stat}>skill points: +{skillPoints} ({character.skillPoints} available)</Line>
      <Line indent color={C.dim}>all clocks restored. style die: d{character.styleDie}</Line>
    </div>
  );

  // Skip attribute allocation — go straight to skill notice
  setTimeout(() => {
    showSkillPointNotice(character, addLocalMsg, onComplete);
  }, 1200);
}

function showSkillPointNotice(
  character: MudCharacter,
  addLocalMsg: AddLocalMsg,
  onComplete: (character: MudCharacter) => void,
): void {
  const primaryTree = TREE_LABELS[STYLE_TO_TREE[character.combatStyle]];
  const trees = getAvailableTrees(character);

  addLocalMsg(
    <div key={k('skill-notice')}>
      <Spacer />
      <Line color={C.accent} bold>&gt;&gt; SKILL ALLOCATION — {character.skillPoints} point{character.skillPoints > 1 ? 's' : ''} available</Line>
      <Line indent color={C.stat}>primary tree: {primaryTree}</Line>
      <Line indent color={C.dim}>available trees: {trees.map(t => TREE_LABELS[t]).join(', ')}</Line>
      {character.level >= 10 && (
        <Line indent color={C.warning}>cross-class available (2x cost, tier 1-2 only)</Line>
      )}
      <Spacer />
      <Line color={C.dim}>&gt;&gt; use /skilltree to view your tree</Line>
      <Line color={C.dim}>&gt;&gt; use /spend &lt;skill_name&gt; to unlock a skill</Line>
      <Line color={C.dim}>&gt;&gt; use /skillinfo &lt;skill_name&gt; for details</Line>
      <Line color={C.dim}>&gt;&gt; skill points persist — spend them now or later</Line>
    </div>
  );

  // Phase 5: Completion
  setTimeout(() => {
    finishLevelUp(character, addLocalMsg, onComplete);
  }, 800);
}

function finishLevelUp(
  character: MudCharacter,
  addLocalMsg: AddLocalMsg,
  onComplete: (character: MudCharacter) => void,
): void {
  // Check for new synergies
  const newSynergies = checkNewSynergies(character);

  // Determine what's newly unlocked
  const unlocks: string[] = [];
  if (character.level === 5) unlocks.push('gear tier 2 available at shops');
  if (character.level === 10) unlocks.push('cross-class skill trees unlocked');
  if (character.level === 15) unlocks.push('gear tier 3 available at shops');
  if (character.attributes.GHOST >= 6 && !character.unlockedSkills.some(s => s.startsWith('freq_'))) {
    unlocks.push('FREQUENCY TREE unlocked');
  }

  addLocalMsg(
    <div key={k('lvlup-done')}>
      <Spacer />
      <Line color={C.accent} glow bold>&gt;&gt; LEVEL-UP COMPLETE</Line>
      <Line color={C.stat}>&gt;&gt; you are level {character.level}.</Line>
      {unlocks.length > 0 && (
        <>
          <Spacer />
          <Line color={C.stat} bold>&gt;&gt; new content unlocked:</Line>
          {unlocks.map((u, i) => (
            <Line key={k(`unlock-${i}`)} indent color={C.heal}>- {u}</Line>
          ))}
        </>
      )}
      {newSynergies.length > 0 && (
        <>
          <Spacer />
          <Line color={C.warning} glow bold>&gt;&gt; SYNERGY ACTIVATED</Line>
          {newSynergies.map(syn => (
            <div key={k(`syn-${syn.id}`)}>
              <Line indent color={C.warning}>{syn.name}</Line>
              <Line indent color={C.n1x} style={{ opacity: 0.85 }}>{syn.effectDescription}</Line>
            </div>
          ))}
        </>
      )}
      <Spacer />
      <Line color={C.n1x} style={{ opacity: 0.9 }}>
        the world didn't change. you did.
      </Line>
      <Line color={C.dim}>/stats to review. /skills to review unlocks.</Line>
    </div>
  );

  eventBus.emit('crt:glitch-tier', { tier: 2, duration: 300 });

  // Save and notify parent
  saveCharacter(character.handle, character);
  onComplete(character);
}
