// lib/mud/mudHUD.tsx
// TUNNELCORE MUD — Persistent HUD Panel System (v4)
// Self-contained flex container that owns its own scroll region.
// Layout: room header → 2-col grid → [chat scrolls] → action bar → [stats + compass].
// No position:sticky — the container fills the viewport and manages internal scroll.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
  MudSession,
  Direction,
  Item,
  NPCType,
  AttributeName,
  Archetype,
  Attributes,
  NPCModalPayload,
} from './types';
import {
  xpForLevel,
  LEVEL_CAP,
  getDispositionLabel,
  ATTRIBUTE_MAX,
} from './types';
import {
  getRoom,
  getZone,
  getVisibleExits,
  getAccessibleBranches,
} from './worldMap';
import {
  getAllLivingEnemies,
  getPlayerCombatant,
  isPlayersTurn,
  getEnemyClocks,
  getPlayerHarmClock,
  getPlayerArmorClock,
  getPlayerRamClock,
} from './combat';
import { getFormattedShop, type ShopListing, buyItem, getBuyPrice, getShopkeeperName } from './shopSystem';
import { getNPCRelation, saveCharacter, loadWorld } from './persistence';
import { sellItem } from './shopSystem';
import {
  getActiveQuests, getAvailableQuests, getQuestObjectiveProgress,
  getDeclinedQuests, getNPCQuests,
  startQuest, declineQuest, undeclineQuest,
  QUEST_REGISTRY,
} from './questEngine';
import { isNPCQuestGiver } from './npcEngine';
import { eventBus } from '@/lib/eventBus';
import { getItemTemplate } from './items';
import { MapPanel, generateMapData, SY, GY } from './mudMap';
import { processLevelUp, type LevelUpResult } from './character';
import {
  getAvailableTrees, getTreeDisplay, getPointsInTree,
  TREE_LABELS, STYLE_TO_TREE, unlockSkill,
  type SkillTreeId,
} from './skillTree';
import type { CombatStyle } from './types';
import SubstrateBackground from './substrateBackground';
import { TransientMessageOverlay } from './transientMessage';
import { RestModal, type RestModalData } from './restModal';
import { SellModal, type SellModalData, type SellModalResult } from './sellModal';
import { useCombatFX, CombatFXStyles } from './combatFX';
import { CreationOverlay } from './creationOverlay';
import { NofogMap } from './nofogMap';
import { FogMap } from './fogMap';
import type { CyberwareItem, AugmentSlotType } from './cyberwareDB';
import { cyberwareQualityColor, tierColor, getSlotCandidates } from './cyberwareDB';

// ── Style constants ─────────────────────────────────────────────────────────

const S = {
  base:   'var(--text-base)',
  glow:   'text-glow',
};

const C = {
  accent:    'var(--phosphor-accent)',
  dim:       'rgba(var(--phosphor-rgb),0.75)',
  dimmer:    'rgba(var(--phosphor-rgb),0.55)',
  faint:     'rgba(160,165,175,0.7)',
  npc:       '#fcd34d',
  enemy:     '#ff6b6b',
  object:    'rgba(var(--phosphor-rgb),0.85)',
  safe:      '#a5f3fc',
  combat:    '#ff4444',
  heal:      '#4ade80',
  hack:      '#d8b4fe',
  quest:     '#fbbf24',
  shop:      '#fcd34d',
  label:     'rgba(var(--phosphor-rgb),0.8)',
  xp:        '#ff69b4',
};

const BG_PANEL = 'rgba(10,10,10,0.75)';
const BG_COMBAT = 'rgba(13,8,8,0.75)';
const BORDER = 'rgba(var(--phosphor-rgb),0.15)';
const BORDER_COMBAT = 'rgba(255,68,68,0.25)';

// Per-attribute phosphor colors — matches character creation
const STAT_COLOR: Record<string, string> = {
  BODY:   '#ff6b6b',
  REFLEX: '#fcd34d',
  TECH:   '#d8b4fe',
  COOL:   '#93c5fd',
  INT:    '#67e8f9',
  GHOST:  '#cc44ff',
};
// ── HUD FX Keyframes ────────────────────────────────────────────────────────

function HUDFXStyles() {
  return (
    <style>{`
      @keyframes mud-pulse-red {
        0%, 100% { border-left-color: rgba(255,68,68,0.5); box-shadow: inset 2px 0 8px rgba(255,30,30,0.05); }
        50% { border-left-color: rgba(255,68,68,0.85); box-shadow: inset 2px 0 12px rgba(255,30,30,0.12); }
      }
      @keyframes mud-pulse-green {
        0%, 100% { border-left-color: var(--phosphor-green); box-shadow: inset 2px 0 8px rgba(var(--phosphor-rgb),0.05); }
        50% { border-left-color: var(--phosphor-accent); box-shadow: inset 2px 0 14px rgba(var(--phosphor-rgb),0.12); }
      }
      @keyframes mud-slide-in {
        from { opacity: 0; transform: translateX(-6px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes mud-fade-in {
        from { opacity: 0; transform: translateY(2px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes mud-header-pulse {
        0%, 100% { text-shadow: 0 0 6px rgba(255,68,68,0.4); }
        50% { text-shadow: 0 0 14px rgba(255,68,68,0.7), 0 0 3px rgba(255,68,68,0.3); }
      }
      @keyframes mud-turn-glow {
        0%, 100% { text-shadow: 0 0 5px var(--phosphor-accent); }
        50% { text-shadow: 0 0 12px var(--phosphor-accent), 0 0 20px rgba(var(--phosphor-rgb),0.3); }
      }
      @keyframes mud-pulse-amber {
        0%, 100% { background: rgba(251,191,36,0.06); box-shadow: none; }
        50% { background: rgba(251,191,36,0.12); box-shadow: inset 0 0 8px rgba(251,191,36,0.08); }
      }
      @keyframes mud-pulse-phosphor-btn {
        0%, 100% { background: rgba(var(--phosphor-rgb),0.06); box-shadow: none; }
        50% { background: rgba(var(--phosphor-rgb),0.14); box-shadow: inset 0 0 8px rgba(var(--phosphor-rgb),0.1); }
      }
      .mud-btn {
        transition: all 0.15s ease !important;
      }
      .mud-btn:hover {
        transform: scale(1.06) !important;
        filter: brightness(1.15) !important;
      }
      .mud-btn:active {
        transform: scale(0.95) !important;
        filter: brightness(0.9) !important;
      }
      .mud-card-slide {
        animation: mud-slide-in 0.25s ease-out both;
      }
      .mud-compass-btn {
        transition: all 0.15s ease !important;
      }
      .mud-compass-btn:hover:not(:disabled) {
        transform: scale(1.12) !important;
        filter: brightness(1.3) !important;
      }
      .mud-compass-btn:active:not(:disabled) {
        transform: scale(0.9) !important;
      }
      .mud-action-btn {
        transition: all 0.15s ease !important;
      }
      .mud-action-btn:hover {
        background: rgba(var(--phosphor-rgb),0.1) !important;
        color: var(--phosphor-accent) !important;
      }
      .mud-action-btn:active {
        transform: scale(0.94) !important;
        filter: brightness(0.85) !important;
      }
      .mud-npc-card {
        animation: mud-fade-in 0.2s ease-out both;
        transition: background 0.15s ease;
      }
      .mud-npc-card:hover {
        background: rgba(var(--phosphor-rgb),0.04);
      }
      .mud-obj-row {
        transition: all 0.12s ease;
      }
      .mud-obj-row:hover {
        padding-left: 0.2rem;
        background: rgba(var(--phosphor-rgb),0.04);
      }
      .mud-shop-row {
        transition: all 0.12s ease;
      }
      .mud-shop-row:hover {
        background: rgba(var(--phosphor-rgb),0.04);
      }
      @keyframes mud-god-pulse {
        0%, 100% { opacity: 1; text-shadow: 0 0 6px rgba(255,204,0,0.4); }
        50% { opacity: 0.7; text-shadow: 0 0 12px rgba(255,204,0,0.7); }
      }
    `}</style>
  );
}


// ── Panel mode type ─────────────────────────────────────────────────────────

export type PanelMode = 'default' | 'inventory' | 'shop' | 'map' | 'salvage';

// ── Panel data extraction ───────────────────────────────────────────────────

interface PanelNPC {
  id: string;
  name: string;
  type: NPCType;
  services: string[];
  disposition: string;
  isQuestGiver: boolean;
  hasShop: boolean;
}

interface PanelEnemy {
  id: string;
  name: string;
  level: number;
  hp?: number;
  maxHp?: number;
  effects?: string[];
  complications?: Array<{ name: string; die: number }>;
  // Clock data
  harmFilled?: number;
  harmSegments?: number;
  armorFilled?: number;
  armorSegments?: number;
  tier?: number;
  behavior?: string;
}

interface PanelObject {
  id: string;
  name: string;
  lootable: boolean;
}

interface PanelExit {
  direction: Direction;
  label: string;
  locked: boolean;
  zoneTransition: boolean;
}

interface PanelData {
  roomName: string;
  zoneName: string;
  zoneId: string;
  isSafeZone: boolean;
  npcs: PanelNPC[];
  enemies: PanelEnemy[];
  objects: PanelObject[];
  exits: PanelExit[];
  inCombat: boolean;
  isPlayerTurn: boolean;
  shopkeeper: string | null;
  shopItems: ShopListing[];
  playerRam: number;
  playerMaxRam: number;
  playerAP: number;
  combatRound: number;
  consumables: Item[];
  activeQuestCount: number;
  hp: number;
  maxHp: number;
  xp: number;
  xpNext: number;
  level: number;
  creds: number;
  scrip: number;
  subjectId: string;
  combatStyle: string;
  handle: string;
  currentRoomId: string;
  inventory: Item[];
  gear: Array<{ slot: string; item: Item }>;
  salvageEnemies: string[];
  salvageDrops: Array<{ itemId: string; name: string; taken: boolean }>;
  pendingLevelUps: number;
  unspentAttributePoints: number;
  skillPointsAvailable: number;
  archetype: Archetype;
  attributes: Attributes;
  unlockedSkills: string[];
  combatStyleRaw: CombatStyle;
  ram: number;
  maxRam: number;
  branches: Array<{ id: string; name: string }>;
  godMode: boolean;
  // ── Clock system fields ──
  harmFilled: number;
  harmSegments: number;
  criticalFilled: number;
  criticalSegments: number;
  armorFilled: number;
  armorMaxSegments: number;
  ramFilled: number;
  ramMaxSegments: number;
  styleDie: number;
  combatPosition?: string;
  // ── Blades/Cortex mechanics ──
  stress: number;
  maxStress: number;
  traumas: string[];
  surge: number;
  roomTraits: import('./types').RoomTrait[];
  complications: import('./types').Complication[];
}

export function getMudPanelData(session: MudSession): PanelData | null {
  const char = session.character;
  if (!char) return null;

  const room = getRoom(char.currentRoom);
  if (!room) return null;

  const zone = getZone(room.zone);
  const visibleExits = getVisibleExits(char.currentRoom, char);
  const inCombat = session.phase === 'combat' && !!session.combat;

  const npcs: PanelNPC[] = room.npcs.map(npc => {
    const rel = getNPCRelation(char.handle, npc.id);
    const disp = rel ? getDispositionLabel(rel.disposition) : 'NEUTRAL';
    return {
      id: npc.id, name: npc.name, type: npc.type,
      services: npc.services ?? [],
      disposition: disp,
      isQuestGiver: isNPCQuestGiver(npc.id),
      hasShop: npc.services?.includes('shop') ?? false,
    };
  });

  const livingCombatants = inCombat && session.combat
    ? getAllLivingEnemies(session.combat) : [];

  const enemies: PanelEnemy[] = inCombat && session.combat
    ? livingCombatants.map(c => {
        const clocks = getEnemyClocks(session.combat!, c.id);
        const harmFilled = clocks.harm?.filled ?? 0;
        const harmSegs = clocks.harm?.segments ?? 3;
        // Convert clock state to HP-like percentage for existing Bar component
        const hpPct = harmSegs > 0 ? Math.round(((harmSegs - harmFilled) / harmSegs) * 100) : 100;
        // Gather complications owned by this enemy
        const enemyComps = (session.combat!.complications ?? [])
          .filter(comp => comp.owner === c.id && comp.duration !== 0)
          .map(comp => ({ name: comp.name, die: comp.die }));
        return {
          id: c.id, name: c.name, level: 0,
          hp: harmSegs - harmFilled, maxHp: harmSegs,
          harmFilled, harmSegments: harmSegs,
          armorFilled: clocks.armor?.filled ?? 0,
          armorSegments: clocks.armor?.segments ?? 0,
          tier: c.tier,
          behavior: c.behavior.type,
          effects: clocks.status.map(s => s.name),
          complications: enemyComps,
        };
      })
    : room.enemies.map(e => ({
        id: e.id, name: e.name, level: e.level,
      }));

  const objects: PanelObject[] = room.objects
    .filter(o =>
      !o.hidden || (o.hiddenRequirement && char.attributes[o.hiddenRequirement.attribute] >= o.hiddenRequirement.minimum)
    )
    .map(o => ({ id: o.id, name: o.name, lootable: o.lootable ?? false }));

  const exits: PanelExit[] = visibleExits.map(e => ({
    direction: e.direction,
    label: e.description.replace(/^[a-z]+ \(/, '(').replace(/\)$/, ')'),
    locked: e.locked ?? false,
    zoneTransition: e.zoneTransition ?? false,
  }));

  // Branch rooms: side passages accessible by name but not by cardinal exit
  const branchRooms = getAccessibleBranches(char.currentRoom, char);
  const branches = branchRooms.map(r => ({ id: r.id, name: r.name }));

  const shopNPC = npcs.find(n => n.hasShop);
  const shopItems = shopNPC && !inCombat
    ? (getFormattedShop(shopNPC.id, char) ?? []) : [];

  let playerAP = 0;
  let combatRound = 0;
  let isPlayerTurn = false;
  if (session.combat) {
    combatRound = session.combat.round;
    isPlayerTurn = isPlayersTurn(session.combat);
    const player = getPlayerCombatant(session.combat);
    if (player) playerAP = player.ap;
  }

  const consumables = char.inventory.filter(
    i => i.category === 'consumable' && i.quantity > 0
  );
  const world = session.world;
  const activeQuestCount = world ? getActiveQuests(world).length : 0;
  const nextXP = char.level < LEVEL_CAP ? xpForLevel(char.level + 1) : char.xp;

  const gearEntries = Object.entries(char.gear)
    .filter(([_, item]) => item != null)
    .map(([slot, item]) => ({ slot, item: item! }));

  return {
    roomName: room.name, zoneName: zone?.name ?? 'UNKNOWN', zoneId: room.zone, isSafeZone: room.isSafeZone,
    npcs, enemies, objects, exits,
    inCombat, isPlayerTurn,
    shopkeeper: shopNPC?.id ?? null, shopItems,
    playerRam: char.ram, playerMaxRam: char.maxRam,
    playerAP, combatRound, consumables, activeQuestCount,
    hp: char.hp, maxHp: char.maxHp,
    xp: char.xp, xpNext: nextXP,
    level: char.level,
    creds: char.currency.creds, scrip: char.currency.scrip,
    subjectId: char.subjectId,
    combatStyle: char.combatStyle === 'GHOST_STYLE' ? 'GHOST' : char.combatStyle,
    handle: char.handle,
    currentRoomId: char.currentRoom,
    inventory: char.inventory,
    gear: gearEntries,
    salvageEnemies: char.pendingSalvage?.enemies.map(e => e.name) ?? [],
    salvageDrops: char.pendingSalvage?.enemies.flatMap(e => e.drops) ?? [],
    pendingLevelUps: char.pendingLevelUps ?? 0,
    unspentAttributePoints: char.unspentAttributePoints ?? 0,
    skillPointsAvailable: char.skillPoints,
    archetype: char.archetype,
    attributes: { ...char.attributes },
    unlockedSkills: [...char.unlockedSkills],
    combatStyleRaw: char.combatStyle,
    ram: char.ram,
    maxRam: char.maxRam,
    branches,
    godMode: !!char.godMode,
    // Clock data
    harmFilled: inCombat && session.combat ? (getPlayerHarmClock(session.combat)?.filled ?? 0) : 0,
    harmSegments: char.harmSegments || 6,
    criticalFilled: inCombat && session.combat ? (session.combat.clocks.find(c => c.id === 'player_critical')?.filled ?? 0) : 0,
    criticalSegments: char.criticalSegments || 4,
    armorFilled: inCombat && session.combat ? (getPlayerArmorClock(session.combat)?.filled ?? 0) : 0,
    armorMaxSegments: char.armorSegments || 0,
    ramFilled: inCombat && session.combat ? (getPlayerRamClock(session.combat)?.filled ?? 0) : 0,
    ramMaxSegments: char.ramSegments || char.maxRam,
    styleDie: char.styleDie || 6,
    combatPosition: inCombat && session.combat?.currentApproach
      ? (session.combat.currentApproach === 'aggressive' ? 'risky'
        : session.combat.currentApproach === 'desperate' ? 'desperate'
        : 'controlled')
      : undefined,
    stress: char.stress ?? 0,
    maxStress: char.maxStress ?? 8,
    traumas: char.traumas ?? [],
    surge: inCombat && session.combat ? (session.combat.surge ?? 0) : 0,
    roomTraits: room.traitDice ?? [],
    complications: inCombat && session.combat ? (session.combat.complications ?? []) : [],
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── UI Atoms ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function Btn({ label, command, color, borderColor, small }: {
  label: string; command: string; color: string; borderColor: string; small?: boolean;
}) {
  return (
    <button
      className="mud-btn"
      onClick={(e) => { e.stopPropagation(); eventBus.emit('mud:execute-command', { command }); }}
      style={{
        fontFamily: 'monospace', fontSize: 'var(--text-base)', lineHeight: 1,
        padding: small ? '0.2rem 0.45rem' : '0.3rem 0.6rem',
        minHeight: small ? 26 : 30, background: 'transparent',
        border: `1px solid ${borderColor}`, color, cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        touchAction: 'manipulation', whiteSpace: 'nowrap',
        boxShadow: `0 0 4px ${borderColor}`,
      }}
      onMouseEnter={(e) => {
        const el = e.target as HTMLElement;
        el.style.background = 'rgba(var(--phosphor-rgb),0.1)';
        el.style.boxShadow = `0 0 10px ${borderColor}, inset 0 0 6px ${borderColor}`;
      }}
      onMouseLeave={(e) => {
        const el = e.target as HTMLElement;
        el.style.background = 'transparent';
        el.style.boxShadow = `0 0 4px ${borderColor}`;
      }}
    >
      {label}
    </button>
  );
}

function Bar({ pct, color, gradient, width = '100%', height = 5 }: {
  pct: number; color: string; gradient?: string; width?: string; height?: number;
}) {
  const bg = gradient ?? color;
  const shadow = gradient ? 'none' : `0 0 6px ${color}, 0 0 2px ${color}`;
  return (
    <div style={{
      width, height, background: 'rgba(var(--phosphor-rgb),0.06)',
      borderRadius: 1, overflow: 'hidden', flexShrink: 0,
      border: '1px solid rgba(var(--phosphor-rgb),0.06)',
    }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
        background: bg,
        boxShadow: shadow,
        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </div>
  );
}


// ── Segmented Clock Bar ────────────────────────────────────────────────────
// Renders clocks as segmented blocks: HARM ██░░░░ 2/6

function ClockBar({ filled, segments, color, label, inverted, compact }: {
  filled: number; segments: number; color: string; label: string;
  inverted?: boolean; // armor/RAM: filled=consumed, empty=remaining
  compact?: boolean;
}) {
  if (segments <= 0) return null;

  const pct = segments > 0 ? (filled / segments) * 100 : 0;

  // Color logic: harm clocks shift red as they fill; inverted clocks shift red as they drain
  const barColor = !inverted
    ? (pct > 66 ? '#ff4444' : pct > 33 ? '#fbbf24' : color)
    : (pct > 66 ? '#ff4444' : color);

  // For the counter text: inverted shows remaining, normal shows filled
  const countText = inverted ? `${segments - filled}/${segments}` : `${filled}/${segments}`;

  const segSize = compact ? 6 : 8;
  const gap = compact ? 2 : 2;
  const fontSize = compact ? '10px' : 'var(--text-base)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.6ch',
      fontFamily: 'monospace', fontSize,
      lineHeight: 1,
    }}>
      <span style={{
        color: C.faint, flexShrink: 0,
        whiteSpace: 'nowrap',
        fontSize,
        letterSpacing: '0.04em',
      }}>
        {label}
      </span>
      <div style={{
        display: 'flex', gap: `${gap}px`, alignItems: 'center', flexShrink: 0,
      }}>
        {Array.from({ length: segments }).map((_, i) => {
          const active = inverted ? (i < segments - filled) : (i < filled);
          return (
            <div key={i} style={{
              width: segSize, height: segSize,
              borderRadius: 1,
              background: active
                ? barColor
                : 'rgba(var(--phosphor-rgb),0.1)',
              boxShadow: active
                ? `0 0 4px ${barColor}, inset 0 0 1px rgba(255,255,255,0.15)`
                : 'inset 0 0 1px rgba(var(--phosphor-rgb),0.08)',
              border: active
                ? `1px solid ${barColor}`
                : '1px solid rgba(var(--phosphor-rgb),0.06)',
              transition: 'all 0.3s ease',
            }} />
          );
        })}
      </div>
      <span style={{
        color: barColor, flexShrink: 0,
        textAlign: 'right', opacity: 0.85,
        whiteSpace: 'nowrap',
      }}>
        {countText}
      </span>
    </div>
  );
}

function TitleBar({ children, color, borderColor, rightSlot }: {
  children: React.ReactNode; color: string; borderColor: string; rightSlot?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.25rem 0.5rem',
      background: 'rgba(var(--phosphor-rgb),0.04)',
      borderBottom: `1px solid ${borderColor}`,
    }}>
      <span style={{
        fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
        color, letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
        {children}
      </span>
      {rightSlot}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint,
      fontStyle: 'italic', padding: '0.25rem 0.5rem',
    }}>
      {text}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Left Panel: NPCs (explore) / Combat Actions (combat) ────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function LeftPanel({ npcs, inCombat, consumables, playerRam, playerMaxRam, isPlayerTurn }: {
  npcs: PanelNPC[]; inCombat: boolean; consumables: Item[];
  playerRam: number; playerMaxRam: number; isPlayerTurn: boolean;
}) {
  if (inCombat) {
    const hasRam = playerMaxRam > 0;
    return (
      <div>
        <TitleBar color={C.combat} borderColor={BORDER_COMBAT}>
          {isPlayerTurn ? '\u2694 YOUR TURN' : '\u2694 COMBAT'}
        </TitleBar>
        <div style={{ padding: '0.4rem 0.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.35rem' }}>
            <Btn label="ATTACK" command="/attack" color={C.enemy} borderColor="rgba(255,107,107,0.5)" />
            {hasRam && <Btn label="HACK" command="/hack" color={C.hack} borderColor="rgba(192,132,252,0.5)" />}
            <Btn label="SCAN" command="/scan" color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.35)" />
            <Btn label="FLEE" command="/flee" color={C.dimmer} borderColor="rgba(var(--phosphor-rgb),0.25)" />
          </div>
          {hasRam && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4ch', marginBottom: '0.15rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.hack, flexShrink: 0 }}>RAM</span>
              <Bar pct={(playerRam / playerMaxRam) * 100} color={C.hack} />
              <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.hack, flexShrink: 0 }}>
                {playerRam}/{playerMaxRam}
              </span>
            </div>
          )}
          {consumables.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
              {consumables.map(item => (
                <Btn key={item.id}
                  label={`${item.name}${item.quantity > 1 ? ' \u00d7' + item.quantity : ''}`}
                  command={`/use ${item.name}`}
                  color={C.heal} borderColor="rgba(74,222,128,0.4)" small />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <TitleBar color={C.npc} borderColor={BORDER}>
        CONTACTS {npcs.length > 0 && <span style={{ opacity: 0.5, fontWeight: 'normal' }}>({npcs.length})</span>}
      </TitleBar>
      {npcs.length === 0 ? (
        <Empty text="no one here" />
      ) : (
        <div style={{ padding: '0.3rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {npcs.map((npc, _npcIdx) => {
            const icon = npc.type === 'QUESTGIVER' ? '?' : npc.type === 'SHOPKEEPER' ? '$' : npc.type === 'ALLIED' ? '+' : '\u00b7';
            const iconColor = npc.type === 'QUESTGIVER' ? C.quest : npc.type === 'SHOPKEEPER' ? C.shop : C.npc;
            return (
              <div key={npc.id} className="mud-npc-card" style={{
                padding: '0.2rem 0.3rem',
                borderLeft: '2px solid rgba(252,211,77,0.25)',
                borderRadius: '0 2px 2px 0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch', fontFamily: 'monospace', fontSize: 'var(--text-base)' }}>
                  <span style={{ color: iconColor, fontWeight: 'bold', width: '1.2ch', textAlign: 'center' }}>{icon}</span>
                  <span style={{ color: C.npc, fontWeight: 'bold' }}>{npc.name}</span>
                  {npc.disposition !== 'NEUTRAL' && (
                    <span style={{ color: C.faint, fontSize: '9px' }}>[{npc.disposition}]</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', paddingLeft: '1.6ch', marginTop: '0.3rem', paddingBottom: '0.1rem', flexWrap: 'wrap' }}>
                  <Btn label="TALK" command="/talk hello" color={C.npc} borderColor="rgba(252,211,77,0.3)" small />
                  {npc.hasShop && <Btn label="SHOP" command="/shop" color={C.shop} borderColor="rgba(252,211,77,0.3)" small />}
                  {npc.isQuestGiver && (
                    <button className="mud-btn" onClick={(e) => {
                      e.stopPropagation();
                      eventBus.emit('mud:open-npc-quest', { npcId: npc.id, npcName: npc.name });
                    }} style={{
                      fontFamily: 'monospace', fontSize: 'var(--text-base)', lineHeight: 1,
                      padding: '0.2rem 0.45rem', minHeight: 26, background: 'transparent',
                      border: '1px solid rgba(251,191,36,0.3)', color: C.quest, cursor: 'pointer',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      borderRadius: 2, touchAction: 'manipulation',
                    }}>JOB</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Left Panel: Shop Mode — Shopkeeper Stock ────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ShopStockPanel({ shopItems, shopkeeperName, creds }: {
  shopItems: ShopListing[]; shopkeeperName: string; creds: number;
}) {
  return (
    <div>
      <TitleBar color={C.shop} borderColor={BORDER} rightSlot={
        <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#fcd34d' }}>{creds}{'\u00a2'}</span>
      }>
        {shopkeeperName.toUpperCase()}&apos;S STOCK
      </TitleBar>
      {shopItems.length === 0 ? (
        <Empty text="nothing for sale" />
      ) : (
        <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {shopItems.map(item => (
            <div key={item.templateId} style={{
              display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 'var(--text-base)',
            }}>
              <span
                role="button" tabIndex={0}
                onClick={() => eventBus.emit('mud:execute-command', { command: `/buy ${item.name.toLowerCase()}` })}
                onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/buy ${item.name.toLowerCase()}` }); }}
                style={{
                  color: creds >= (item.price ?? 0) ? C.shop : C.faint,
                  cursor: 'pointer', touchAction: 'manipulation',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '68%',
                }}
              >
                {item.name}
              </span>
              <span style={{ color: C.faint, flexShrink: 0 }}>
                {item.price !== null ? `${item.price}\u00a2` : '\u2014'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Right-Top: Objects (default mode) ───────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ObjectsPanel({ objects }: { objects: PanelObject[] }) {
  return (
    <div>
      <TitleBar color={C.object} borderColor={BORDER}>OBJECTS</TitleBar>
      {objects.length === 0 ? (
        <Empty text="nothing notable" />
      ) : (
        <div style={{ padding: '0.25rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {objects.map(obj => (
            <div key={obj.id}
              className="mud-obj-row"
              role="button" tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` }); }}
              style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.object,
                cursor: 'pointer', touchAction: 'manipulation',
                padding: '0.1rem 0.2rem', borderRadius: 2,
              }}
            >
              {obj.name}
              {obj.lootable && <span style={{ color: C.quest, marginLeft: '0.3ch' }}>{'\u2b21'}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Right-Top: Inventory Panel ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function InventoryPanel({ inventory, gear }: {
  inventory: Item[]; gear: Array<{ slot: string; item: Item }>;
}) {
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0) + gear.length;

  return (
    <div>
      <TitleBar color={C.accent} borderColor={BORDER}>
        INVENTORY <span style={{ opacity: 0.5, fontWeight: 'normal' }}>({totalItems})</span>
      </TitleBar>
      <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', maxHeight: '30vh', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {gear.length > 0 && gear.map(({ slot, item }) => (
          <div key={slot} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
          }}>
            <span style={{ color: C.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
              {item.name}
            </span>
            <span style={{ color: C.faint, fontSize: '9px', flexShrink: 0 }}>EQP</span>
          </div>
        ))}
        {inventory.length === 0 && gear.length === 0 ? (
          <Empty text="empty" />
        ) : (
          inventory.map(item => {
            const isConsumable = item.category === 'consumable';
            const isEquipment = item.slot !== undefined;
            const isQuest = item.questItem;
            return (
              <div key={item.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
              }}>
                <span
                  role="button" tabIndex={0}
                  onClick={() => eventBus.emit('mud:execute-command', { command: `/examine ${item.name}` })}
                  onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/examine ${item.name}` }); }}
                  style={{
                    color: isQuest ? C.quest : 'rgba(var(--phosphor-rgb),0.8)',
                    cursor: 'pointer', touchAction: 'manipulation',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%',
                  }}
                >
                  {item.name}{item.quantity > 1 ? ` \u00d7${item.quantity}` : ''}
                </span>
                <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                  {isQuest && <span style={{ color: C.quest, fontSize: '9px' }}>JOB</span>}
                  {isConsumable && (
                    <Btn label="USE" command={`/use ${item.name}`}
                      color={C.heal} borderColor="rgba(74,222,128,0.3)" small />
                  )}
                  {isEquipment && !isQuest && (
                    <Btn label="EQUIP" command={`/equip ${item.name}`}
                      color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.3)" small />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Right-Top: Player Items (shop mode — sellable inventory) ────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ShopPlayerPanel({ inventory }: { inventory: Item[] }) {
  const sellable = inventory.filter(i => !i.questItem && !i.loreItem);

  return (
    <div>
      <TitleBar color={C.accent} borderColor={BORDER}>YOUR ITEMS</TitleBar>
      {sellable.length === 0 ? (
        <Empty text="nothing to sell" />
      ) : (
        <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {sellable.map(item => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 'var(--text-base)',
            }}>
              <span
                role="button" tabIndex={0}
                onClick={() => eventBus.emit('mud:execute-command', { command: `/sell ${item.name.toLowerCase()}` })}
                onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/sell ${item.name.toLowerCase()}` }); }}
                style={{
                  color: 'rgba(var(--phosphor-rgb),0.8)',
                  cursor: 'pointer', touchAction: 'manipulation',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '68%',
                }}
              >
                {item.name}{item.quantity > 1 ? ` \u00d7${item.quantity}` : ''}
              </span>
              <span style={{ color: C.faint, flexShrink: 0 }}>
                {item.sellPrice ? `${item.sellPrice}\u00a2` : '\u2014'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Salvage Panel — Left panel replacement for post-combat looting ─────────
// ══════════════════════════════════════════════════════════════════════════════

const C_SALVAGE = 'rgba(var(--phosphor-rgb),0.65)';
const C_SALVAGE_ACCENT = 'rgba(var(--phosphor-rgb),0.9)';

function SalvageDropsPanel({ drops }: {
  drops: Array<{ itemId: string; name: string; taken: boolean }>;
}) {
  const untaken = drops.filter(d => !d.taken);

  return (
    <div>
      <TitleBar color={C_SALVAGE_ACCENT} borderColor={BORDER} rightSlot={
        untaken.length > 0 ? (
          <span
            role="button" tabIndex={0}
            onClick={() => eventBus.emit('mud:execute-command', { command: '/take all' })}
            onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: '/take all' }); }}
            style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.heal, cursor: 'pointer', touchAction: 'manipulation',
              border: '1px solid rgba(74,222,128,0.35)', padding: '0.05rem 0.35rem',
              borderRadius: 2,
            }}
          >
            TAKE ALL
          </span>
        ) : undefined
      }>
        SALVAGE
      </TitleBar>
      {untaken.length === 0 ? (
        <Empty text="picked clean" />
      ) : (
        <div style={{ padding: '0.3rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {drops.map((drop, i) => (
            <div key={`salvage-${drop.itemId}-${i}`} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              opacity: drop.taken ? 0.35 : 1,
              padding: '0.15rem 0.2rem',
              borderLeft: `2px solid ${drop.taken ? 'rgba(var(--phosphor-rgb),0.1)' : 'rgba(74,222,128,0.3)'}`,
              borderRadius: '0 2px 2px 0',
            }}>
              <span style={{
                color: drop.taken ? C.faint : C_SALVAGE_ACCENT,
                textDecoration: drop.taken ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                maxWidth: '70%',
              }}>
                {drop.name}
              </span>
              {!drop.taken && (
                <span
                  role="button" tabIndex={0}
                  className="mud-btn"
                  onClick={() => eventBus.emit('mud:execute-command', { command: `/take ${drop.name.toLowerCase()}` })}
                  onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/take ${drop.name.toLowerCase()}` }); }}
                  style={{
                    color: C.heal, cursor: 'pointer', touchAction: 'manipulation',
                    border: '1px solid rgba(74,222,128,0.3)',
                    padding: '0.05rem 0.3rem', borderRadius: 2,
                    fontSize: 'var(--text-base)', flexShrink: 0,
                  }}
                >
                  TAKE
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SalvageContextPanel({ enemyNames }: { enemyNames: string[] }) {
  return (
    <div>
      <TitleBar color={C.dimmer} borderColor={BORDER}>REMAINS</TitleBar>
      <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
        {enemyNames.map((name, i) => (
          <div key={`dead-${i}`} style={{
            display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 'var(--text-base)',
          }}>
            <span style={{ color: C.dimmer }}>{name}</span>
            <span style={{ color: C.faint, fontSize: '9px' }}>{'\u2620'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Right-Bottom: Hostiles / Shop / Combat Enemies ──────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ContextPanel({ enemies, shopItems, shopkeeper, inCombat, creds }: {
  enemies: PanelEnemy[]; shopItems: ShopListing[];
  shopkeeper: string | null; inCombat: boolean; creds: number;
}) {
  if (inCombat && enemies.length > 0) {
    return (
      <div>
        <TitleBar color={C.enemy} borderColor={BORDER_COMBAT}>HOSTILES</TitleBar>
        <div style={{ padding: '0.2rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {enemies.map(e => (
            <div key={e.id}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 'var(--text-base)',
                marginBottom: '0.15rem',
              }}>
                <span style={{ color: C.enemy, fontWeight: 'bold' }}>{e.name}</span>
                <span style={{ color: C.faint, fontSize: '9px' }}>{e.tier ? `T${e.tier}` : ''}</span>
              </div>
              <ClockBar filled={e.harmFilled ?? 0} segments={e.harmSegments ?? (e.maxHp ?? 4)} color="#ff6b6b" label="HARM" compact />
              {(e.armorSegments ?? 0) > 0 && (
                <ClockBar filled={e.armorFilled ?? 0} segments={e.armorSegments!} color="#60a5fa" label="ARMOR" inverted compact />
              )}
              {e.effects && e.effects.length > 0 && (
                <div style={{ fontFamily: 'monospace', fontSize: '9px', color: C.hack, marginTop: '0.1rem' }}>
                  [{e.effects.join(', ')}]
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.15rem' }}>
                <Btn label="ATK" command={`/attack ${e.name}`} color={C.enemy} borderColor="rgba(255,107,107,0.4)" small />
                <Btn label="SCAN" command={`/scan ${e.name}`} color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.3)" small />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (shopkeeper && shopItems.length > 0 && !inCombat) {
    return (
      <div>
        <TitleBar color={C.shop} borderColor={BORDER} rightSlot={
          <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#fcd34d' }}>{creds}{'\u00a2'}</span>
        }>
          SHOP
        </TitleBar>
        <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {shopItems.slice(0, 5).map(item => (
            <div key={item.templateId} style={{
              display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 'var(--text-base)',
            }}>
              <span
                role="button" tabIndex={0}
                onClick={() => eventBus.emit('mud:execute-command', { command: `/buy ${item.name.toLowerCase()}` })}
                onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/buy ${item.name.toLowerCase()}` }); }}
                style={{
                  color: creds >= (item.price ?? 0) ? C.shop : C.faint,
                  cursor: 'pointer', touchAction: 'manipulation',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '68%',
                }}
              >
                {item.name}
              </span>
              <span style={{ color: C.faint, flexShrink: 0 }}>
                {item.price !== null ? `${item.price}\u00a2` : '\u2014'}
              </span>
            </div>
          ))}
          {shopItems.length > 5 && (
            <div role="button" tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: '/shop' })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: '/shop' }); }}
              style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint, cursor: 'pointer', fontStyle: 'italic' }}
            >
              +{shopItems.length - 5} more...
            </div>
          )}
        </div>
      </div>
    );
  }

  if (enemies.length > 0) {
    return (
      <div>
        <TitleBar color={C.enemy} borderColor={BORDER}>HOSTILES</TitleBar>
        <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {enemies.map(e => (
            <div key={e.id} style={{
              display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 'var(--text-base)',
            }}>
              <span style={{ color: C.enemy }}>{e.name}</span>
              <span style={{ color: C.faint }}>Lv.{e.level}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Combat Cards — Full-width card layout for combat mode ───────────────────
// ══════════════════════════════════════════════════════════════════════════════

function EnemyCard({ enemy, hasRam, compact }: { enemy: PanelEnemy; hasRam: boolean; compact?: boolean }) {
  const harmFilled = enemy.harmFilled ?? 0;
  const harmSegs = enemy.harmSegments ?? (enemy.maxHp ?? 4);
  const harmPct = harmSegs > 0 ? (harmFilled / harmSegs) * 100 : 0;
  const isLow = harmPct > 70;

  const armorFilled = enemy.armorFilled ?? 0;
  const armorSegs = enemy.armorSegments ?? 0;
  const hasArmor = armorSegs > 0;

  return (
    <div className="mud-card-slide" style={{
      border: '1px solid rgba(255,68,68,0.15)',
      borderLeft: '3px solid rgba(255,68,68,0.5)',
      background: isLow ? 'rgba(255,30,30,0.08)' : 'rgba(255,30,30,0.03)',
      padding: compact ? '0.5rem 0.6rem' : '0.6rem 0.75rem',
      borderRadius: '0 3px 3px 0',
      animation: 'mud-pulse-red 3s ease-in-out infinite, mud-slide-in 0.25s ease-out both',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'monospace', fontSize: 'var(--text-base)',
        marginBottom: '0.35rem', paddingBottom: '0.25rem',
        borderBottom: '1px solid rgba(255,68,68,0.1)',
      }}>
        <span style={{ color: C.enemy, fontWeight: 'bold', letterSpacing: '0.06em',
          textShadow: isLow ? '0 0 8px rgba(255,68,68,0.5)' : 'none',
        }}>
          {enemy.name}
        </span>
        <span style={{ color: C.faint, fontSize: compact ? '0.8em' : 'var(--text-base)' }}>
          {enemy.tier ? `T${enemy.tier}` : enemy.level > 0 ? `Lv.${enemy.level}` : ''}
        </span>
      </div>

      {/* HARM clock */}
      <ClockBar filled={harmFilled} segments={harmSegs} color="#ff6b6b" label="HARM" compact={compact} />

      {/* ARMOR clock */}
      {hasArmor && (
        <ClockBar filled={armorFilled} segments={armorSegs} color="#60a5fa" label="ARMOR" inverted compact={compact} />
      )}

      {/* Complications (Cortex stepping dice) */}
      {enemy.complications && enemy.complications.length > 0 && (
        <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#c084fc', marginTop: '0.25rem', display: 'flex', gap: '0.4ch', flexWrap: 'wrap' }}>
          {enemy.complications.map((comp, i) => {
            const step = comp.die === 4 ? 0 : comp.die === 6 ? 1 : comp.die === 8 ? 2 : comp.die === 10 ? 3 : 4;
            const isMax = comp.die >= 12;
            return (
              <span key={i} style={{
                padding: '0.1rem 0.3rem',
                border: `1px solid ${isMax ? 'rgba(255,68,68,0.5)' : 'rgba(192,132,252,0.25)'}`,
                borderRadius: 2,
                background: isMax ? 'rgba(255,30,30,0.12)' : 'rgba(192,132,252,0.06)',
                animation: isMax ? 'mud-pulse-red 1.5s ease-in-out infinite' : 'none',
              }}>
                {comp.name} d{comp.die} {'\u25B2'.repeat(step)}
              </span>
            );
          })}
        </div>
      )}

      {/* Status effects (legacy clock system) */}
      {enemy.effects && enemy.effects.length > 0 && (
        <div style={{ fontFamily: 'monospace', fontSize: '9px', color: C.hack, marginTop: '0.25rem', display: 'flex', gap: '0.4ch', flexWrap: 'wrap' }}>
          {enemy.effects.map((eff, i) => (
            <span key={i} style={{ padding: '0.1rem 0.3rem', border: '1px solid rgba(192,132,252,0.25)', borderRadius: 2, background: 'rgba(192,132,252,0.06)' }}>
              {eff.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {/* Behavior hint */}
      {enemy.behavior && (
        <div style={{ fontFamily: 'monospace', fontSize: '8px', color: C.faint, marginTop: '0.2rem', opacity: 0.7 }}>
          {enemy.behavior}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
        <Btn label="ATK" command={`/attack ${enemy.name}`} color={C.enemy} borderColor="rgba(255,107,107,0.5)" small />
        {hasRam && <Btn label="HACK" command={`/hack short_circuit`} color={C.hack} borderColor="rgba(192,132,252,0.5)" small />}
        <Btn label="SCAN" command={`/scan ${enemy.name}`} color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.35)" small />
      </div>
    </div>
  );
}

function PlayerCard({ data }: { data: PanelData }) {
  const hasRam = data.ramMaxSegments > 0;

  return (
    <div style={{
      border: '1px solid rgba(var(--phosphor-rgb),0.15)',
      borderLeft: data.isPlayerTurn ? '3px solid var(--phosphor-green)' : '3px solid rgba(var(--phosphor-rgb),0.25)',
      background: data.isPlayerTurn ? 'rgba(var(--phosphor-rgb),0.04)' : 'rgba(var(--phosphor-rgb),0.02)',
      padding: '0.4rem 0.6rem',
      borderRadius: '0 3px 3px 0',
      animation: data.isPlayerTurn ? 'mud-pulse-green 2.5s ease-in-out infinite' : 'none',
    }}>
      {/* Header: name + level */}
      <div style={{
        fontFamily: 'monospace', fontSize: 'var(--text-base)',
        fontWeight: 'bold', marginBottom: '0.3rem', paddingBottom: '0.2rem',
        borderBottom: `1px solid ${data.isPlayerTurn ? 'rgba(var(--phosphor-rgb),0.15)' : 'rgba(var(--phosphor-rgb),0.08)'}`,
        color: data.isPlayerTurn ? 'var(--phosphor-accent)' : C.dim,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        animation: data.isPlayerTurn ? 'mud-turn-glow 2s ease-in-out infinite' : 'none',
      }} className={data.isPlayerTurn ? S.glow : undefined}>
        <span>{data.isPlayerTurn ? '\u2694 YOUR TURN' : 'COMBAT'} {'\u2014'} {data.handle}</span>
        <div style={{ display: 'flex', gap: '0.3ch', alignItems: 'center' }}>
          {data.surge > 0 && (
            <span style={{
              color: '#fcd34d', fontWeight: 'bold',
              border: '1px solid rgba(252,211,77,0.4)', padding: '0.05rem 0.3rem',
              borderRadius: 2, fontSize: 'var(--text-base)',
              textShadow: '0 0 6px rgba(252,211,77,0.4)',
              animation: 'mud-god-pulse 2s ease-in-out infinite',
            }}>{'\u2605'} {data.surge}</span>
          )}
          <span style={{
            color: 'var(--phosphor-accent)', fontWeight: 'bold',
            border: '1px solid rgba(var(--phosphor-rgb),0.3)', padding: '0.05rem 0.3rem',
            borderRadius: 2, fontSize: 'var(--text-base)',
          }}>Lv.{data.level}</span>
          {data.godMode && (
            <span style={{
              color: '#ffcc00', fontWeight: 'bold', fontSize: '8px',
              border: '1px solid rgba(255,204,0,0.4)', padding: '0 3px',
              borderRadius: 2, textShadow: '0 0 6px rgba(255,204,0,0.4)',
            }}>GOD</span>
          )}
        </div>
      </div>

      {/* Paired clock bars — 2 per row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.15rem 1ch', marginBottom: '0.25rem' }}>
        <ClockBar filled={data.harmFilled} segments={data.harmSegments} color="#4ade80" label="HARM" compact />
        {data.armorMaxSegments > 0 ? (
          <ClockBar filled={data.armorFilled} segments={data.armorMaxSegments} color="#60a5fa" label="ARMOR" inverted compact />
        ) : <div />}
        <ClockBar filled={data.stress} segments={data.maxStress} color="#fbbf24" label="STRSS" compact />
        {hasRam ? (
          <ClockBar filled={data.ramFilled} segments={data.ramMaxSegments} color="#c084fc" label="RAM" inverted compact />
        ) : <div />}
        {data.criticalFilled > 0 && (
          <ClockBar filled={data.criticalFilled} segments={data.criticalSegments} color="#ff2222" label="CRIT" compact />
        )}
        {data.traumas.length > 0 && (
          <div style={{ fontFamily: 'monospace', fontSize: '8px', color: '#ff6b6b', gridColumn: '1 / -1', opacity: 0.8 }}>
            TRAUMA: {data.traumas.join(' · ')}
          </div>
        )}
      </div>

      {/* Action row: surge actions + currency + flee + consumables */}
      <div style={{
        borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
        paddingTop: '0.25rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.3rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {data.surge > 0 && (
            <>
              <Btn label={`\u2605PUSH`} command="/push" color="#fcd34d" borderColor="rgba(252,211,77,0.4)" small />
              <Btn label={`\u2605ASSET`} command="/asset" color="#fcd34d" borderColor="rgba(252,211,77,0.4)" small />
            </>
          )}
          {data.consumables.map(item => (
            <Btn key={item.id}
              label={`${item.name}${item.quantity > 1 ? '\u00d7' + item.quantity : ''}`}
              command={`/use ${item.name}`}
              color={C.heal} borderColor="rgba(74,222,128,0.4)" small />
          ))}
          <Btn label="FLEE" command="/flee" color={C.dimmer} borderColor="rgba(var(--phosphor-rgb),0.25)" small />
        </div>
      </div>
    </div>
  );
}

function CombatPanels({ data }: { data: PanelData }) {
  const hasRam = data.playerMaxRam > 0;
  const useGrid = data.enemies.length >= 4;

  return (
    <div style={{
      flexShrink: 0,
      /* bg on outer wrapper */
      borderBottom: `1px solid ${BORDER_COMBAT}`,
      touchAction: 'none',
    }}>
      <div style={{
        padding: '0.4rem 0.6rem',
        borderBottom: `1px solid ${BORDER_COMBAT}`,
        background: 'rgba(255,20,20,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
          color: C.combat, letterSpacing: '0.08em',
          animation: 'mud-header-pulse 2.5s ease-in-out infinite',
        }} className={S.glow}>
          {'\u2694'} COMBAT {'\u2014'} Round {data.combatRound}{data.combatPosition ? ` \u2014 ${data.combatPosition.toUpperCase()}` : ''}
        </span>
        <span style={{
          fontFamily: 'monospace', fontSize: 'var(--text-base)',
          color: data.isPlayerTurn ? 'var(--phosphor-accent)' : C.faint,
          letterSpacing: '0.04em',
          animation: data.isPlayerTurn ? 'mud-turn-glow 2s ease-in-out infinite' : 'none',
        }}>
          {data.isPlayerTurn ? 'YOUR MOVE' : 'WAITING...'}
        </span>
      </div>

      <div style={{
        padding: '0.5rem 0.5rem',
        ...(useGrid ? {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
        } : {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '0.6rem',
        }),
      }}>
        {data.enemies.map(enemy => (
          <EnemyCard key={enemy.id} enemy={enemy} hasRam={hasRam} compact={useGrid} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Compass Rose ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const DIR_LABELS: Record<Direction, string> = {
  north: 'N', south: 'S', east: 'E', west: 'W',
  northeast: 'NE', northwest: 'NW', southeast: 'SE', southwest: 'SW',
  up: 'UP', down: 'DN', in: 'IN', out: 'OUT',
};

function CompassRose({ exits }: { exits: PanelExit[] }) {
  const exitSet = new Set(exits.map(e => e.direction));
  const hasVertical = exitSet.has('up') || exitSet.has('down');
  const hasInOut = exitSet.has('in') || exitSet.has('out');
  const hasIntercardinal = exitSet.has('northeast') || exitSet.has('northwest') || exitSet.has('southeast') || exitSet.has('southwest');

  const SZ = 26;

  function ExitBtn({ dir, small }: { dir: Direction; small?: boolean }) {
    const available = exitSet.has(dir);
    const exitData = exits.find(e => e.direction === dir);
    const locked = exitData?.locked ?? false;
    const btnSz = small ? SZ - 4 : SZ;

    return (
      <button
        className="mud-compass-btn"
        disabled={!available}
        onClick={() => {
          if (!available) return;
          if (locked) {
            eventBus.emit('mud:execute-command', { command: `/examine ${dir}` });
          } else {
            eventBus.emit('mud:execute-command', { command: `/go ${dir}` });
            eventBus.emit('crt:glitch-tier', { tier: 1, duration: 150 });
          }
        }}
        title={exitData ? `${dir}: ${exitData.label}${locked ? ' [LOCKED]' : ''}` : dir}
        style={{
          fontFamily: 'monospace', fontSize: small ? '0.6em' : 'var(--text-base)', fontWeight: 'bold', lineHeight: 1,
          width: (dir === 'up' || dir === 'down' || dir === 'in' || dir === 'out') ? btnSz + 6 : btnSz,
          height: btnSz, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: available
            ? locked ? 'rgba(255,107,107,0.08)' : 'rgba(var(--phosphor-rgb),0.06)'
            : 'transparent',
          border: available
            ? `1px solid ${locked ? 'rgba(255,107,107,0.4)' : 'rgba(var(--phosphor-rgb),0.25)'}`
            : '1px solid rgba(var(--phosphor-rgb),0.06)',
          color: available
            ? locked ? '#ff6b6b' : 'var(--phosphor-accent)'
            : 'rgba(var(--phosphor-rgb),0.12)',
          cursor: available ? 'pointer' : 'default',
          touchAction: 'manipulation', borderRadius: 2, padding: 0,
          boxShadow: available ? `0 0 3px ${locked ? 'rgba(255,107,107,0.2)' : 'rgba(var(--phosphor-rgb),0.1)'}` : 'none',
        }}
      >
        {locked ? '\ud83d\udd12' : DIR_LABELS[dir]}
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.4rem', padding: '0.3rem',
    }}>
      {/* 5x5 grid for 8-direction compass */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(5, ${SZ}px)`,
        gridTemplateRows: `repeat(5, ${SZ}px)`,
        gap: 1, justifyItems: 'center', alignItems: 'center',
      }}>
        {/* Row 1: . NW . N . NE . */}
        <div />
        {hasIntercardinal ? <ExitBtn dir="northwest" small /> : <div />}
        <div />
        {hasIntercardinal ? <ExitBtn dir="northeast" small /> : <div />}
        <div />

        {/* Row 2: . . N . . */}
        <div />
        <div />
        <ExitBtn dir="north" />
        <div />
        <div />

        {/* Row 3: W . ◆ . E */}
        <ExitBtn dir="west" />
        <div />
        <div style={{
          width: SZ, height: SZ, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontSize: '8px', color: 'rgba(var(--phosphor-rgb),0.15)',
        }}>{'\u25c6'}</div>
        <div />
        <ExitBtn dir="east" />

        {/* Row 4: . . S . . */}
        <div />
        <div />
        <ExitBtn dir="south" />
        <div />
        <div />

        {/* Row 5: . SW . SE . */}
        <div />
        {hasIntercardinal ? <ExitBtn dir="southwest" small /> : <div />}
        <div />
        {hasIntercardinal ? <ExitBtn dir="southeast" small /> : <div />}
        <div />
      </div>

      {/* Special exits: UP/DOWN/IN/OUT */}
      {(hasVertical || hasInOut) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {exitSet.has('up') && <ExitBtn dir="up" />}
          {exitSet.has('down') && <ExitBtn dir="down" />}
          {exitSet.has('in') && <ExitBtn dir="in" />}
          {exitSet.has('out') && <ExitBtn dir="out" />}
        </div>
      )}
    </div>
  );
}

// ── Passages bar — clickable branch destinations ────────────────────────────
// Shows side passages accessible from the current room that aren't compass
// directions. Renders as a row of small tappable buttons.

function PassagesBar({ branches }: { branches: Array<{ id: string; name: string }> }) {
  if (branches.length === 0) return null;

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '0.25rem',
      padding: '0.3rem 0.5rem',
      borderTop: `1px solid rgba(var(--phosphor-rgb),0.1)`,
      background: 'rgba(var(--phosphor-rgb),0.02)',
    }}>
      <span style={{
        fontFamily: 'monospace', fontSize: 'var(--text-base)',
        color: 'rgba(var(--phosphor-rgb),0.35)',
        letterSpacing: '0.04em', flexShrink: 0,
        lineHeight: '22px',
      }}>PASSAGES</span>
      {branches.map(b => (
        <button
          key={b.id}
          className="mud-compass-btn"
          onClick={() => {
            eventBus.emit('mud:execute-command', { command: `/go ${b.name.toLowerCase()}` });
            eventBus.emit('crt:glitch-tier', { tier: 1, duration: 150 });
          }}
          title={b.name}
          style={{
            fontFamily: 'monospace', fontSize: '0.65em', fontWeight: 'bold',
            lineHeight: 1, padding: '0.2rem 0.4rem', minHeight: 20,
            background: 'rgba(var(--phosphor-rgb),0.06)',
            border: '1px solid rgba(var(--phosphor-rgb),0.25)',
            color: 'var(--phosphor-accent)',
            cursor: 'pointer', touchAction: 'manipulation',
            borderRadius: 2, letterSpacing: '0.04em',
            boxShadow: '0 0 3px rgba(var(--phosphor-rgb),0.1)',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}
        >
          {b.name}
        </button>
      ))}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// ── Action Bar — LOOK · INVENTORY · JOBS · MAP · HELP ─────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const ACTION_BUTTONS = [
  { label: 'INVENTORY', command: '_modal' },
  { label: 'SKILLS',    command: '_modal' },
  { label: 'JOBS',    command: '_modal' },
  { label: 'MAP',       command: '_toggle' },
  { label: 'HELP',      command: '_modal' },
];

// ══════════════════════════════════════════════════════════════════════════════
// ── Skills Modal ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function SkillsModal({ session, onClose }: {
  session: MudSession; onClose: () => void;
}) {
  const char = session.character;
  if (!char) return null;

  const trees = getAvailableTrees(char);
  const primaryTree = STYLE_TO_TREE[char.combatStyle];
  const [activeTree, setActiveTree] = useState<SkillTreeId>(primaryTree);
  const [confirmNode, setConfirmNode] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const display = getTreeDisplay(activeTree, char, false);
  const tiers = [1, 2, 3, 4] as const;

  const handleUnlock = (nodeId: string) => {
    const isCross = !trees.includes(activeTree);
    const result = unlockSkill(char, nodeId, isCross);
    if (result.success) {
      setConfirmNode(null);
      setFlashId(nodeId);
      setTimeout(() => setFlashId(null), 500);
      saveCharacter(char.handle, char);
      eventBus.emit('crt:glitch-tier', { tier: 2, duration: 200 });
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 440, maxHeight: '85vh',
        background: 'rgba(10,10,10,0.75)',
        border: '1px solid rgba(var(--phosphor-rgb),0.25)',
        borderRadius: 4, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 30px rgba(var(--phosphor-rgb),0.08)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: 'var(--phosphor-accent)', letterSpacing: '0.06em',
          }} className={S.glow}>SKILL TREES</span>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: char.skillPoints > 0 ? '#fbbf24' : C.dim,
          }}>
            {char.skillPoints} pt{char.skillPoints !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Tree tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(var(--phosphor-rgb),0.1)',
          overflowX: 'auto', flexShrink: 0,
        }}>
          {trees.map(treeId => {
            const active = treeId === activeTree;
            const pts = getPointsInTree(treeId, char);
            return (
              <button key={treeId}
                onClick={() => { setActiveTree(treeId); setConfirmNode(null); }}
                style={{
                  flex: 1, minWidth: 0, padding: '0.35rem 0.3rem',
                  fontFamily: 'monospace', fontSize: '0.7em',
                  color: active ? 'var(--phosphor-accent)' : C.dim,
                  background: active ? 'rgba(var(--phosphor-rgb),0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--phosphor-accent)' : '2px solid transparent',
                  cursor: 'pointer', touchAction: 'manipulation', whiteSpace: 'nowrap',
                }}>
                {TREE_LABELS[treeId]}{pts > 0 ? ` (${pts})` : ''}
              </button>
            );
          })}
        </div>

        {/* Nodes */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem' }}>
          {tiers.map(tier => {
            const nodesInTier = display.filter(d => d.node.tier === tier);
            if (nodesInTier.length === 0) return null;
            return (
              <div key={tier} style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  fontFamily: 'monospace', fontSize: '0.65em',
                  color: C.faint, marginBottom: '0.2rem', letterSpacing: '0.1em',
                }}>TIER {tier}{tier === 4 ? ' \u2014 CAPSTONE' : ''}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                  {nodesInTier.map(d => {
                    const isFlash = flashId === d.node.id;
                    const isConfirming = confirmNode === d.node.id;
                    const borderColor = d.unlocked ? 'rgba(74,222,128,0.4)' : d.available ? 'rgba(251,191,36,0.4)' : 'rgba(var(--phosphor-rgb),0.1)';
                    const bgColor = isFlash ? 'rgba(74,222,128,0.15)' : isConfirming ? 'rgba(251,191,36,0.08)' : d.unlocked ? 'rgba(74,222,128,0.05)' : 'transparent';
                    return (
                      <div key={d.node.id}
                        role={d.available ? 'button' : undefined}
                        tabIndex={d.available ? 0 : undefined}
                        onClick={() => {
                          if (d.available && !d.unlocked) {
                            if (isConfirming) handleUnlock(d.node.id);
                            else setConfirmNode(d.node.id);
                          }
                        }}
                        style={{
                          padding: '0.35rem 0.4rem', border: `1px solid ${borderColor}`,
                          borderRadius: 3, background: bgColor,
                          cursor: d.available ? 'pointer' : 'default',
                          touchAction: 'manipulation', transition: 'all 0.2s',
                        }}>
                        <div style={{
                          fontFamily: 'monospace', fontSize: 'var(--text-base)', fontWeight: 'bold',
                          color: d.unlocked ? C.heal : d.available ? '#fbbf24' : C.dimmer,
                        }}>
                          {d.unlocked ? '\u25a0 ' : d.available ? '\u25cb ' : '\u25ab '}{d.node.name}
                        </div>
                        <div style={{
                          fontFamily: 'monospace', fontSize: '0.7em', color: C.faint,
                          marginTop: '0.15rem', lineHeight: 1.4,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                        }}>{d.node.description}</div>
                        {isConfirming && (
                          <div style={{
                            fontFamily: 'monospace', fontSize: 'var(--text-base)',
                            color: '#fbbf24', marginTop: '0.25rem', fontWeight: 'bold',
                            animation: 'mud-fade-in 0.2s ease-out',
                          }}>tap again to unlock</div>
                        )}
                        {!d.unlocked && !d.available && d.reason && (
                          <div style={{ fontFamily: 'monospace', fontSize: '0.6em', color: C.faint, marginTop: '0.1rem', fontStyle: 'italic' }}>{d.reason}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close */}
        <div style={{
          padding: '0.4rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
          display: 'flex', justifyContent: 'center',
        }}>
          <button className="mud-btn" onClick={onClose} style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, background: 'transparent',
            border: '1px solid rgba(var(--phosphor-rgb),0.2)', padding: '0.3rem 1.5rem',
            cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
          }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Stats Modal ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function StatsModal({ data, onClose }: { data: PanelData; onClose: () => void }) {
  const xpPct = data.xpNext > 0 ? (data.xp / data.xpNext) * 100 : 100;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'rgba(10,10,10,0.75)',
        border: '1px solid rgba(var(--phosphor-rgb),0.25)',
        borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 0 30px rgba(var(--phosphor-rgb),0.08)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          padding: '0.6rem 0.8rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: 'var(--phosphor-accent)', letterSpacing: '0.06em',
          }} className={S.glow}>{data.handle} {'\u2014'} {data.subjectId}</div>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, marginTop: '0.2rem',
          }}>{data.archetype} {'\u00b7'} {data.combatStyle} {'\u00b7'} Level {data.level}</div>
        </div>

        {/* Clock Bars */}
        <div style={{ padding: '0.5rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <ClockBar filled={data.harmFilled} segments={data.harmSegments} color="#4ade80" label="HARM" />
          {data.armorMaxSegments > 0 && (
            <ClockBar filled={data.armorFilled} segments={data.armorMaxSegments} color="#60a5fa" label="ARMOR" inverted />
          )}
          {data.ramMaxSegments > 0 && (
            <ClockBar filled={data.ramFilled} segments={data.ramMaxSegments} color="#c084fc" label="RAM" inverted />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, flexShrink: 0, whiteSpace: 'nowrap' }}>XP</span>
            <div style={{ flex: 1 }}><Bar pct={xpPct} color={C.xp} height={7} /></div>
            <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.xp }}>{data.xp}/{data.xpNext}</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, marginTop: '0.1rem' }}>
            style die: d{data.styleDie}
          </div>
          <ClockBar filled={data.stress} segments={data.maxStress} color="#fbbf24" label="STRESS" />
          {data.traumas.length > 0 && (
            <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#ff6b6b', marginTop: '0.1rem' }}>
              TRAUMAS: {data.traumas.join(' · ')}
            </div>
          )}
        </div>

        {/* Attributes */}
        <div style={{ padding: '0.4rem 0.8rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)' }}>
          {ATTR_ORDER.map(attr => {
            const val = data.attributes[attr];
            const die = val <= 4 ? 4 : val <= 6 ? 6 : val <= 8 ? 8 : val <= 10 ? 10 : 12;
            return (
              <div key={attr} style={{
                display: 'grid', gridTemplateColumns: '5.5ch 2ch 3.5ch', gap: '0.4ch', alignItems: 'center',
                fontFamily: 'monospace', fontSize: 'var(--text-base)', padding: '0.1rem 0',
              }}>
                <span style={{ color: STAT_COLOR[attr] ?? 'var(--phosphor-green)', fontWeight: 'bold' }}>{attr}</span>
                <span style={{ color: C.dim, textAlign: 'right' }}>{val}</span>
                <span style={{ color: 'var(--phosphor-accent)', fontSize: '0.85em', opacity: 0.8 }}>(d{die})</span>
              </div>
            );
          })}
        </div>

        {/* Currency */}
        <div style={{
          padding: '0.4rem 0.8rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
          display: 'flex', gap: '1.5ch', fontFamily: 'monospace', fontSize: 'var(--text-base)',
        }}>
          <span><span style={{ color: '#fcd34d', fontWeight: 'bold' }}>CREDS</span> <span style={{ color: '#fff' }}>{data.creds}</span></span>
          <span><span style={{ color: '#a78bfa', fontWeight: 'bold' }}>SCRIP</span> <span style={{ color: '#fff' }}>{data.scrip}</span></span>
        </div>

        {(data.skillPointsAvailable > 0) && (
          <div style={{ padding: '0.3rem 0.8rem', fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#fbbf24' }}>
            {data.skillPointsAvailable > 0 && <div>{data.skillPointsAvailable} skill pt{data.skillPointsAvailable > 1 ? 's' : ''} available</div>}
          </div>
        )}

        <div style={{
          padding: '0.4rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
          display: 'flex', justifyContent: 'center',
        }}>
          <button className="mud-btn" onClick={onClose} style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, background: 'transparent',
            border: '1px solid rgba(var(--phosphor-rgb),0.2)', padding: '0.3rem 1.5rem',
            cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
          }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Level-Up Modal ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const ATTR_LABELS: Record<AttributeName, string> = {
  BODY: 'harm clock, melee die, carry',
  REFLEX: 'ranged die, flee pool',
  TECH: 'hack die, RAM segments',
  INT: 'XP mod, scan die',
  COOL: 'NPC, stealth die, barter',
  GHOST: 'mesh resist, 33hz, hidden',
};

const ATTR_ORDER: AttributeName[] = ['BODY', 'REFLEX', 'TECH', 'INT', 'COOL', 'GHOST'];

const INTEGRATION_LINES: Record<Archetype, string> = {
  SOVEREIGN: 'the implant pulses. neural pathways fork. the signal strengthens.',
  DISCONNECTED: 'your muscles ache in a new way. not damage \u2014 growth. you\'re harder now.',
  INTEGRATED: 'the augments recalibrate. firmware updates itself. autonomic. precise.',
};

function LevelUpModal({ session, onClose }: {
  session: MudSession;
  onClose: () => void;
}) {
  const char = session.character;
  if (!char) return null;

  const [result, setResult] = useState<LevelUpResult | null>(null);
  const [attrs, setAttrs] = useState<Attributes>({ ...char.attributes });
  const [phase, setPhase] = useState<'narrative' | 'summary' | 'done'>('narrative');

  // Process level-up on mount
  useEffect(() => {
    const r = processLevelUp(char);
    setResult(r);
    setAttrs({ ...char.attributes });
    // Brief narrative then transition to summary
    const timer = setTimeout(() => {
      setPhase('summary');
      eventBus.emit('crt:glitch-tier', { tier: 2, duration: 250 });
    }, 2200);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIntegrate = () => {
    setPhase('done');
    saveCharacter(char.handle, char);
    eventBus.emit('crt:glitch-tier', { tier: 2, duration: 300 });

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const narrativeLine = INTEGRATION_LINES[char.archetype] ?? INTEGRATION_LINES.SOVEREIGN;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(10,10,10,0.75)',
        border: '1px solid rgba(var(--phosphor-rgb),0.25)',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(var(--phosphor-rgb),0.08), 0 0 60px rgba(0,0,0,0.5)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          padding: '0.6rem 0.8rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: 'var(--phosphor-accent)', letterSpacing: '0.08em',
          }} className={S.glow}>
            {phase === 'done' ? 'INTEGRATION COMPLETE' : 'INTEGRATION'}
          </div>
          {result && phase !== 'narrative' && (
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.dim, marginTop: '0.2rem',
            }}>
              level {result.oldLevel} {'\u2192'} {result.newLevel}
              {' \u00b7 '}{result.skillPoints} skill pt{result.skillPoints > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Narrative phase */}
        {phase === 'narrative' && (
          <div style={{ padding: '1.2rem 0.8rem', textAlign: 'center' }}>
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: '#cc44ff', opacity: 0.9, lineHeight: 1.8,
              animation: 'mud-fade-in 0.5s ease-out',
            }}>
              {narrativeLine}
            </div>
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.dim, marginTop: '1rem',
            }}>
              integrating...
            </div>
          </div>
        )}

        {/* Summary phase — show attributes with die sizes */}
        {phase === 'summary' && (
          <div style={{ padding: '0.5rem 0.6rem' }}>
            {/* Attribute summary with die sizes */}
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.dim, textAlign: 'center', padding: '0.3rem 0', marginBottom: '0.3rem',
              borderBottom: '1px solid rgba(var(--phosphor-rgb),0.1)',
            }}>
              CURRENT ATTRIBUTES
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {ATTR_ORDER.map(attr => {
                const val = attrs[attr];
                const die = val <= 4 ? 4 : val <= 6 ? 6 : val <= 8 ? 8 : val <= 10 ? 10 : 12;

                return (
                  <div
                    key={attr}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '5.5ch 2ch 3.5ch 1fr',
                      gap: '0.4ch',
                      alignItems: 'center',
                      fontFamily: 'monospace', fontSize: 'var(--text-base)',
                      padding: '0.25rem 0.4rem',
                    }}
                  >
                    <span style={{ color: STAT_COLOR[attr] ?? 'var(--phosphor-green)', fontWeight: 'bold' }}>
                      {attr}
                    </span>
                    <span style={{ color: C.dim, textAlign: 'right' }}>
                      {val}
                    </span>
                    <span style={{
                      color: 'var(--phosphor-accent)',
                      fontSize: '0.85em',
                      opacity: 0.8,
                    }}>
                      (d{die})
                    </span>
                    <span style={{
                      color: 'rgba(var(--phosphor-rgb),0.25)',
                      fontSize: '0.75em',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}>
                      {ATTR_LABELS[attr]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.faint, textAlign: 'center',
              padding: '0.4rem 0', marginTop: '0.2rem',
              borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
              fontStyle: 'italic',
            }}>
              attributes grow through milestones — quests, zones, encounters
            </div>

            {/* Skill point notice */}
            {char.skillPoints > 0 && (
              <div style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: '#fbbf24', textAlign: 'center',
                padding: '0.4rem 0', marginTop: '0.2rem',
                borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
              }}>
                {char.skillPoints} skill point{char.skillPoints > 1 ? 's' : ''} available {'\u00b7'} use /skills
              </div>
            )}

            {/* Integrate button */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0 0.3rem' }}>
              <button
                className="mud-btn"
                onClick={handleIntegrate}
                style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  fontWeight: 'bold', letterSpacing: '0.1em',
                  color: '#0a0a0a',
                  background: 'var(--phosphor-accent)',
                  border: '1px solid var(--phosphor-accent)',
                  padding: '0.45rem 1.5rem',
                  cursor: 'pointer', touchAction: 'manipulation',
                  borderRadius: 2,
                  boxShadow: '0 0 12px rgba(var(--phosphor-rgb),0.3)',
                }}
              >
                INTEGRATE
              </button>
            </div>
          </div>
        )}

        {/* Done phase */}
        {phase === 'done' && (
          <div style={{
            padding: '1.2rem 0.8rem', textAlign: 'center',
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: '#cc44ff', lineHeight: 1.8,
          }}>
            the world didn't change. you did.
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Help Modal ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const HELP_SECTIONS = [
  { title: 'NAVIGATION', cmds: [
    { cmd: '/look',            desc: 'Examine your surroundings' },
    { cmd: '/go <dir>',        desc: 'Move to a direction or room' },
    { cmd: '/exits',           desc: 'List available exits' },
    { cmd: '/examine <thing>', desc: 'Inspect an object or NPC' },
    { cmd: '/where',           desc: 'Show current zone and room' },
  ]},
  { title: 'COMBAT', cmds: [
    { cmd: '/attack [target]', desc: 'Melee/ranged attack (1 AP)' },
    { cmd: '/hack [name]',     desc: 'Upload quickhack (2 AP)' },
    { cmd: '/scan [target]',   desc: 'Analyze enemy stats (1 AP)' },
    { cmd: '/flee',            desc: 'Attempt escape (2 AP)' },
  ]},
  { title: 'SOCIAL', cmds: [
    { cmd: '/talk <npc>',      desc: 'Address an NPC' },
    { cmd: '/shop',            desc: 'Browse shop' },
    { cmd: '/buy / /sell',     desc: 'Trade items' },
  ]},
  { title: 'PROGRESSION', cmds: [
    { cmd: '/rest',            desc: 'Rest at a safe haven' },
    { cmd: '/take <item|all>', desc: 'Salvage from the dead' },
    { cmd: '/save',            desc: 'Manual save' },
  ]},
  { title: 'GENERAL', cmds: [
    { cmd: '(no slash)',       desc: 'Talk to NPCs in the room' },
    { cmd: 'tap map rooms',    desc: 'Move by tapping rooms on map' },
    { cmd: 'tap NPC buttons',  desc: 'Quick actions for NPCs' },
    { cmd: 'tap stat bars',    desc: 'Open full stats modal' },
  ]},
];

type HelpTab = typeof HELP_SECTIONS[number]['title'];

function HelpModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<HelpTab>(HELP_SECTIONS[0].title);
  const activeSection = HELP_SECTIONS.find(s => s.title === activeTab)!;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 440, maxHeight: '85vh',
        background: 'rgba(10,10,10,0.75)',
        border: '1px solid rgba(var(--phosphor-rgb),0.25)',
        borderRadius: 4, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 30px rgba(var(--phosphor-rgb),0.08)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: 'var(--phosphor-accent)', letterSpacing: '0.06em',
          }} className={S.glow}>TUNNELCORE {'\u2014'} COMMANDS</span>
        </div>

        {/* Tab row */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(var(--phosphor-rgb),0.1)',
          overflowX: 'auto', flexShrink: 0,
        }}>
          {HELP_SECTIONS.map(s => {
            const active = s.title === activeTab;
            return (
              <button key={s.title}
                onClick={() => setActiveTab(s.title)}
                style={{
                  flex: 1, minWidth: 0, padding: '0.35rem 0.3rem',
                  fontFamily: 'monospace', fontSize: '0.65em',
                  color: active ? 'var(--phosphor-accent)' : C.faint,
                  background: active ? 'rgba(var(--phosphor-rgb),0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--phosphor-accent)' : '2px solid transparent',
                  cursor: 'pointer', touchAction: 'manipulation', whiteSpace: 'nowrap',
                  letterSpacing: '0.06em',
                }}>
                {s.title}
              </button>
            );
          })}
        </div>

        {/* Active tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.6rem' }}>
          {activeSection.cmds.map(c => (
            <div key={c.cmd} style={{
              display: 'grid', gridTemplateColumns: '13ch 1fr', gap: '0.5ch',
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              padding: '0.15rem 0.2rem',
            }}>
              <span style={{ color: 'var(--phosphor-accent)' }}>{c.cmd}</span>
              <span style={{ color: C.dim }}>{c.desc}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.4rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)', display: 'flex', justifyContent: 'center' }}>
          <button className="mud-btn" onClick={onClose} style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, background: 'transparent',
            border: '1px solid rgba(var(--phosphor-rgb),0.2)', padding: '0.3rem 1.5rem',
            cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
          }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Inventory Modal — GEAR / BACKPACK / AUGMENTS / STATS ────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const GEAR_SLOT_META: Array<{
  slot: import('./types').ItemSlot;
  label: string;
  group: 'LOADOUT' | 'AUGMENTS' | 'UTILITIES';
}> = [
  { slot: 'weapon_primary',  label: 'WEAPON',   group: 'LOADOUT' },
  { slot: 'weapon_sidearm',  label: 'SIDEARM',  group: 'LOADOUT' },
  { slot: 'armor',           label: 'ARMOR',    group: 'LOADOUT' },
  { slot: 'cyberware_1',     label: 'NEURAL',   group: 'AUGMENTS' },
  { slot: 'cyberware_2',     label: 'CHASSIS',  group: 'AUGMENTS' },
  { slot: 'cyberware_3',     label: 'LIMBS',    group: 'AUGMENTS' },
  { slot: 'utility_1',       label: 'UTIL 1',   group: 'UTILITIES' },
  { slot: 'utility_2',       label: 'UTIL 2',   group: 'UTILITIES' },
  { slot: 'utility_3',       label: 'UTIL 3',   group: 'UTILITIES' },
];

const ITEM_CAT_COLORS: Record<string, string> = {
  weapon_melee: '#ff6b6b',
  weapon_ranged: '#ff6b6b',
  armor: '#60a5fa',
  cyberware: '#d8b4fe',
  consumable: '#4ade80',
  material: 'rgba(var(--phosphor-rgb),0.55)',
  quest: '#fbbf24',
  lore: 'rgba(var(--phosphor-rgb),0.35)',
  utility: 'rgba(var(--phosphor-rgb),0.75)',
};

type InvTab = 'GEAR' | 'BACKPACK' | 'AUGMENTS' | 'STATS';

function InventoryModal({ session, data, onClose }: {
  session: MudSession; data: PanelData; onClose: () => void;
}) {
  const char = session.character;
  if (!char) return null;

  const [activeTab, setActiveTab] = useState<InvTab>('GEAR');
  // Augment equip overlay state
  const augOverlayState = useState<AugmentSlotType | null>(null);
  const augSelectedState = useState<string | null>(null);

  const equippedIds = new Set(
    Object.values(char.gear).filter(Boolean).map((item) => (item as Item).id)
  );
  const unequipped = char.inventory.filter(i => !equippedIds.has(i.id));

  // ── Tab content renderers ──────────────────────────────────────────────

  const renderGear = () => {
    const groups = ['LOADOUT', 'AUGMENTS', 'UTILITIES'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {groups.map(group => {
          const slots = GEAR_SLOT_META.filter(s => s.group === group);
          // Skip utilities group if nothing equipped and no utility items
          if (group === 'UTILITIES' && slots.every(s => !char.gear[s.slot])) return null;
          return (
            <div key={group}>
              <div style={{
                fontFamily: 'monospace', fontSize: '0.65em',
                color: C.faint, letterSpacing: '0.1em', marginBottom: '0.2rem',
              }}>{group}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {slots.map(({ slot, label }) => {
                  const item = char.gear[slot] ?? null;
                  return (
                    <div key={slot} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.3rem 0.4rem', minHeight: 30,
                      border: item
                        ? '1px solid rgba(var(--phosphor-rgb),0.15)'
                        : '1px dashed rgba(var(--phosphor-rgb),0.1)',
                      borderRadius: 3,
                      background: item ? 'rgba(var(--phosphor-rgb),0.03)' : 'transparent',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8ch', overflow: 'hidden' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.65em',
                          color: C.faint, textTransform: 'uppercase',
                          width: '6ch', flexShrink: 0,
                        }}>{label}</span>
                        {item ? (
                          <span style={{
                            fontFamily: 'monospace', fontSize: 'var(--text-base)',
                            color: ITEM_CAT_COLORS[item.category] ?? C.dim,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {item.name}
                            {item.damage ? ` [d${item.tier === 'SCRAP' ? 4 : item.tier === 'COMMON' ? 6 : item.tier === 'MIL_SPEC' ? 8 : item.tier === 'HELIXION' ? 10 : 12}]` : ''}
                            {item.armorValue ? ` [${item.tier === 'SCRAP' ? 2 : item.tier === 'COMMON' ? 3 : item.tier === 'MIL_SPEC' ? 4 : item.tier === 'HELIXION' ? 5 : 6} seg]` : ''}
                          </span>
                        ) : (
                          <span style={{
                            fontFamily: 'monospace', fontSize: 'var(--text-base)',
                            color: C.faint, fontStyle: 'italic',
                          }}>{'\u2014'} empty {'\u2014'}</span>
                        )}
                      </div>
                      {item && (
                        <button className="mud-btn" onClick={() => {
                          eventBus.emit('mud:execute-command', { command: `/unequip ${item.name}` });
                          onClose();
                        }} style={{
                          fontFamily: 'monospace', fontSize: '0.7em', color: C.dimmer,
                          background: 'transparent',
                          border: '1px solid rgba(var(--phosphor-rgb),0.15)',
                          padding: '0.15rem 0.4rem', cursor: 'pointer',
                          borderRadius: 2, touchAction: 'manipulation', flexShrink: 0,
                        }}>UNEQUIP</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBackpack = () => {
    if (unequipped.length === 0) {
      return <div style={{
        fontFamily: 'monospace', fontSize: 'var(--text-base)',
        color: C.faint, textAlign: 'center', padding: '1.5rem 0',
      }}>backpack empty.</div>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {unequipped.map(item => {
          const isConsumable = item.category === 'consumable';
          const isEquipment = item.slot !== undefined;
          const isQuest = item.questItem;
          const isLore = item.loreItem;
          const isMaterial = item.category === 'material';
          const catColor = ITEM_CAT_COLORS[item.category] ?? C.dim;

          return (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.25rem 0.4rem', minHeight: 30,
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              borderBottom: '1px solid rgba(var(--phosphor-rgb),0.05)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6ch',
                overflow: 'hidden', flex: 1, minWidth: 0,
              }}>
                <span style={{
                  color: catColor,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item.name}
                  {item.quantity > 1 ? ` \u00d7${item.quantity}` : ''}
                </span>
                {isMaterial && item.quantity > 1 && (
                  <span style={{
                    fontSize: '0.7em', color: C.faint,
                    border: '1px solid rgba(var(--phosphor-rgb),0.1)',
                    padding: '0 0.25rem', borderRadius: 2,
                  }}>MAT</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0, alignItems: 'center' }}>
                {isQuest && <span style={{
                  fontSize: '0.7em', color: C.quest, fontWeight: 'bold',
                  border: '1px solid rgba(251,191,36,0.25)', padding: '0 0.3rem', borderRadius: 2,
                }}>JOB</span>}
                {isLore && !isQuest && <span style={{
                  fontSize: '0.7em', color: C.faint,
                  border: '1px solid rgba(var(--phosphor-rgb),0.1)', padding: '0 0.3rem', borderRadius: 2,
                }}>LORE</span>}
                {isConsumable && !isQuest && !isLore && (
                  <button className="mud-btn" onClick={() => {
                    eventBus.emit('mud:execute-command', { command: `/use ${item.name}` });
                    onClose();
                  }} style={{
                    fontFamily: 'monospace', fontSize: '0.7em', color: C.heal,
                    background: 'transparent',
                    border: '1px solid rgba(74,222,128,0.3)',
                    padding: '0.15rem 0.4rem', cursor: 'pointer',
                    borderRadius: 2, touchAction: 'manipulation',
                  }}>USE</button>
                )}
                {isEquipment && !isQuest && !isLore && (
                  <button className="mud-btn" onClick={() => {
                    eventBus.emit('mud:execute-command', { command: `/equip ${item.name}` });
                    onClose();
                  }} style={{
                    fontFamily: 'monospace', fontSize: '0.7em', color: C.accent,
                    background: 'transparent',
                    border: '1px solid rgba(var(--phosphor-rgb),0.2)',
                    padding: '0.15rem 0.4rem', cursor: 'pointer',
                    borderRadius: 2, touchAction: 'manipulation',
                  }}>EQUIP</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAugments = () => {
    // ── New augment slot system from cyberwareDB ──────────────────────
    const augSlots = char.augmentSlots ?? { neural: null, chassis: null, limbs: null };
    const augInv: CyberwareItem[] = char.augmentInventory ?? [];
    const sealed: AugmentSlotType[] = char.sealedSlots ?? (char.archetype === 'DISCONNECTED' ? ['neural'] : []);

    const SLOT_LABELS: Record<AugmentSlotType, string> = { neural: 'NEURAL', chassis: 'CHASSIS', limbs: 'LIMBS' };
    const SLOT_ORDER: AugmentSlotType[] = ['neural', 'chassis', 'limbs'];

    // Augment equip overlay state — managed via a ref to avoid re-render of entire InventoryModal
    const [augOverlay, setAugOverlay] = augOverlayState;
    const [selectedCw, setSelectedCw] = augSelectedState;

    // Get candidates for an open overlay
    const overlayCandidates = augOverlay
      ? getSlotCandidates(augOverlay, augInv, char.archetype, char.attributes as unknown as Record<string, number>, sealed)
      : [];

    const handleAugEquip = (slot: AugmentSlotType, item: CyberwareItem) => {
      const oldItem = augSlots[slot];
      // Move new item from augmentInventory into slot
      augSlots[slot] = { ...item };
      char.augmentInventory = augInv.filter(i => i.id !== item.id);
      // Move old item back to inventory (if removable)
      if (oldItem && oldItem.removable) {
        char.augmentInventory.push({ ...oldItem });
      }
      char.augmentSlots = { ...augSlots };
      saveCharacter(char.handle, char);
      setAugOverlay(null);
      setSelectedCw(null);
    };

    const handleAugUnequip = (slot: AugmentSlotType) => {
      const oldItem = augSlots[slot];
      if (oldItem && oldItem.removable) {
        char.augmentInventory = [...(char.augmentInventory ?? []), { ...oldItem }];
      }
      augSlots[slot] = null;
      char.augmentSlots = { ...augSlots };
      saveCharacter(char.handle, char);
      setAugOverlay(null);
      setSelectedCw(null);
    };

    // Active implants = everything currently slotted
    const activeImplants = SLOT_ORDER.map(s => augSlots[s]).filter(Boolean) as CyberwareItem[];

    // ── Main augments view ──────────────────────────────────────────────
    if (!augOverlay) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {/* Archetype / tier info */}
          <div style={{
            fontFamily: 'monospace', fontSize: '0.65em',
            color: C.faint, letterSpacing: '0.1em', marginBottom: '0.1rem',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>{char.archetype}</span>
            <span>max tier {char.archetype === 'DISCONNECTED' ? '1' : char.archetype === 'SOVEREIGN' ? '2*' : '3'}</span>
          </div>

          {/* Augment slots */}
          {SLOT_ORDER.map(slotType => {
            const isSealed = sealed.includes(slotType);
            const installed = augSlots[slotType];

            if (isSealed) {
              return (
                <div key={slotType} style={{
                  border: '1px solid rgba(255,50,50,0.2)', padding: '0.35rem 0.4rem',
                  display: 'flex', alignItems: 'center', gap: '0.8ch', opacity: 0.5,
                }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: '0.65em',
                    color: 'rgba(255,80,80,0.6)', textTransform: 'uppercase',
                    width: '6ch', flexShrink: 0, letterSpacing: '0.1em',
                  }}>{SLOT_LABELS[slotType]}</span>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 'var(--text-base)',
                    color: 'rgba(255,80,80,0.4)', fontStyle: 'italic',
                  }}>[SEALED]</span>
                </div>
              );
            }

            return (
              <div key={slotType}
                onClick={() => { setAugOverlay(slotType); setSelectedCw(null); }}
                style={{
                  border: '1px solid rgba(216,180,254,0.15)',
                  padding: '0.35rem 0.4rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.8ch',
                  position: 'relative',
                  transition: 'border-color 0.15s',
                }}>
                <span style={{
                  fontFamily: 'monospace', fontSize: '0.65em',
                  color: C.faint, textTransform: 'uppercase',
                  width: '6ch', flexShrink: 0, letterSpacing: '0.1em',
                }}>{SLOT_LABELS[slotType]}</span>

                {installed ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6ch', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 'var(--text-base)',
                        color: cyberwareQualityColor(installed.quality), fontWeight: 'bold',
                      }}>{installed.name}</span>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '0.6em',
                        padding: '0 0.3em', border: `1px solid ${tierColor(installed.tier)}`,
                        color: tierColor(installed.tier),
                      }}>T{installed.tier}</span>
                    </div>
                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.6em',
                      color: C.faint, letterSpacing: '0.05em',
                    }}>
                      {Object.entries(installed.statBonuses).filter(([,v]) => v).map(([a,v]) => `+${v} ${a}`).join('  \u00b7  ')}
                      {installed.armorBonus ? `  \u00b7  +${installed.armorBonus} armor` : ''}
                    </span>
                  </div>
                ) : (
                  <span style={{
                    fontFamily: 'monospace', fontSize: 'var(--text-base)',
                    color: C.faint, fontStyle: 'italic',
                  }}>vacant</span>
                )}

                {/* Hint */}
                <span style={{
                  fontFamily: 'monospace', fontSize: '0.6em', color: C.faint,
                  position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)',
                }}>{installed ? '\u25b8' : '\u25b8'}</span>
              </div>
            );
          })}

          {/* Active Implants summary */}
          <div style={{ borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)', paddingTop: '0.3rem', marginTop: '0.1rem' }}>
            <div style={{
              fontFamily: 'monospace', fontSize: '0.65em',
              color: C.faint, letterSpacing: '0.1em', marginBottom: '0.2rem',
            }}>ACTIVE IMPLANTS</div>
            {activeImplants.length > 0 ? activeImplants.map(cw => (
              <div key={cw.id} style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: cyberwareQualityColor(cw.quality), padding: '0.1rem 0.4rem',
                display: 'flex', alignItems: 'center', gap: '0.6ch',
              }}>
                {cw.name}
                {cw.activeAbility && (
                  <span style={{
                    fontSize: '0.6em', padding: '0 0.3em',
                    border: '1px solid rgba(204,153,255,0.3)', color: 'rgba(204,153,255,0.7)',
                  }}>{'\u25c6'} {cw.activeAbility.name}</span>
                )}
              </div>
            )) : (
              <div style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: C.faint, fontStyle: 'italic', padding: '0.1rem 0.4rem',
              }}>
                {sealed.includes('neural') ? 'flesh only. no augmentation.' : 'no augments installed.'}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── Equip overlay (when a slot is tapped) ───────────────────────────
    const currentSlotItem = augSlots[augOverlay];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {/* Overlay header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '0.2rem', paddingBottom: '0.2rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: '0.7em', fontWeight: 'bold',
            color: C.quest, textTransform: 'uppercase', letterSpacing: '0.15em',
          }}>{SLOT_LABELS[augOverlay]} — compatible</span>
          <button className="mud-btn" onClick={() => { setAugOverlay(null); setSelectedCw(null); }} style={{
            fontFamily: 'monospace', fontSize: '0.7em', color: C.dim,
            background: 'transparent', border: '1px solid rgba(var(--phosphor-rgb),0.2)',
            padding: '0.1rem 0.4rem', cursor: 'pointer', borderRadius: 2,
            touchAction: 'manipulation',
          }}>{'\u2715'}</button>
        </div>

        {/* Currently equipped (if any) */}
        {currentSlotItem && (
          <div style={{
            border: '1px solid rgba(216,180,254,0.3)', padding: '0.35rem 0.4rem',
            marginBottom: '0.15rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6ch', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: cyberwareQualityColor(currentSlotItem.quality), fontWeight: 'bold',
              }}>{currentSlotItem.name}</span>
              <span style={{
                fontFamily: 'monospace', fontSize: '0.6em', padding: '0 0.3em',
                border: `1px solid ${tierColor(currentSlotItem.tier)}`, color: tierColor(currentSlotItem.tier),
              }}>T{currentSlotItem.tier}</span>
              <span style={{
                fontFamily: 'monospace', fontSize: '0.55em', padding: '0 0.3em',
                border: '1px solid rgba(var(--phosphor-rgb),0.3)', color: C.dim,
                background: 'rgba(var(--phosphor-rgb),0.05)',
              }}>EQUIPPED</span>
            </div>
            <div style={{
              fontFamily: 'monospace', fontSize: '0.6em', color: C.faint,
              marginTop: '0.2rem', lineHeight: 1.4,
            }}>{currentSlotItem.description}</div>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.5ch', marginTop: '0.2rem',
            }}>
              {Object.entries(currentSlotItem.statBonuses).filter(([,v]) => v).map(([attr, val]) => (
                <span key={attr} style={{ fontFamily: 'monospace', fontSize: '0.6em', color: STAT_COLOR[attr] ?? 'var(--phosphor-green)' }}>+{val} {attr}</span>
              ))}
            </div>
          </div>
        )}

        {/* Inventory candidates */}
        {overlayCandidates.length === 0 ? (
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: C.faint, fontStyle: 'italic', padding: '0.2rem 0',
          }}>no compatible augments in inventory.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '45vh', overflowY: 'auto' }}>
            {overlayCandidates.map(({ item, check }) => (
              <div key={item.id}
                onClick={() => { if (check.allowed) setSelectedCw(selectedCw === item.id ? null : item.id); }}
                style={{
                  border: `1px solid ${selectedCw === item.id ? 'rgba(216,180,254,0.5)' : check.allowed ? 'rgba(216,180,254,0.12)' : 'rgba(255,50,50,0.12)'}`,
                  padding: '0.35rem 0.4rem',
                  cursor: check.allowed ? 'pointer' : 'not-allowed',
                  opacity: check.allowed ? 1 : 0.45,
                  background: selectedCw === item.id ? 'rgba(216,180,254,0.05)' : 'transparent',
                  transition: 'border-color 0.12s, background 0.12s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6ch', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 'var(--text-base)',
                    color: check.allowed ? cyberwareQualityColor(item.quality) : C.faint, fontWeight: 'bold',
                  }}>{item.name}</span>
                  <span style={{
                    fontFamily: 'monospace', fontSize: '0.6em', padding: '0 0.3em',
                    border: `1px solid ${tierColor(item.tier)}`, color: tierColor(item.tier),
                  }}>T{item.tier}</span>
                  {!item.removable && check.allowed && (
                    <span style={{
                      fontFamily: 'monospace', fontSize: '0.55em', padding: '0 0.3em',
                      color: 'rgba(255,153,0,0.6)', border: '1px solid rgba(255,153,0,0.25)',
                    }}>PERMANENT</span>
                  )}
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: '0.6em', color: C.faint,
                  marginTop: '0.15rem', lineHeight: 1.4,
                }}>{item.description}</div>
                {check.allowed ? (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5ch', marginTop: '0.15rem' }}>
                      {Object.entries(item.statBonuses).filter(([,v]) => v).map(([attr, val]) => (
                        <span key={attr} style={{ fontFamily: 'monospace', fontSize: '0.6em', color: STAT_COLOR[attr] ?? 'var(--phosphor-green)' }}>+{val} {attr}</span>
                      ))}
                      {item.armorBonus ? <span style={{ fontFamily: 'monospace', fontSize: '0.6em', color: 'var(--phosphor-green)' }}>+{item.armorBonus} armor</span> : null}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3ch', marginTop: '0.15rem' }}>
                      {item.passiveEffects.map(eff => (
                        <span key={eff} style={{
                          fontFamily: 'monospace', fontSize: '0.55em', padding: '0 0.2em',
                          border: '1px solid rgba(var(--phosphor-rgb),0.12)', color: C.faint,
                        }}>{eff.replace(/_/g, ' ')}</span>
                      ))}
                      {item.activeAbility && (
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.55em', padding: '0 0.2em',
                          border: '1px solid rgba(204,153,255,0.3)', color: 'rgba(204,153,255,0.7)',
                        }}>{'\u25c6'} {item.activeAbility.name}{item.activeAbility.ramCost ? ` (${item.activeAbility.ramCost} RAM)` : ''}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{
                    fontFamily: 'monospace', fontSize: '0.6em', color: 'rgba(255,80,80,0.6)',
                    marginTop: '0.15rem', fontStyle: 'italic',
                  }}>{'\u2715'} {check.reason}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{
          display: 'flex', gap: '0.4rem', marginTop: '0.2rem', paddingTop: '0.2rem',
          borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
        }}>
          {selectedCw && overlayCandidates.find(c => c.item.id === selectedCw)?.check.allowed && (
            <button className="mud-btn" onClick={() => {
              const found = overlayCandidates.find(c => c.item.id === selectedCw);
              if (found) handleAugEquip(augOverlay, found.item);
            }} style={{
              fontFamily: 'monospace', fontSize: '0.7em', fontWeight: 'bold',
              color: '#d8b4fe', background: 'rgba(216,180,254,0.08)',
              border: '1px solid rgba(216,180,254,0.35)',
              padding: '0.25rem 0.6rem', cursor: 'pointer', borderRadius: 2,
              flex: 1, touchAction: 'manipulation',
            }}>{currentSlotItem ? 'SWAP' : 'INSTALL'}</button>
          )}
          {currentSlotItem && currentSlotItem.removable && (
            <button className="mud-btn" onClick={() => handleAugUnequip(augOverlay)} style={{
              fontFamily: 'monospace', fontSize: '0.7em',
              color: 'rgba(255,100,100,0.7)', background: 'transparent',
              border: '1px solid rgba(255,100,100,0.2)',
              padding: '0.25rem 0.6rem', cursor: 'pointer', borderRadius: 2,
              touchAction: 'manipulation',
            }}>REMOVE</button>
          )}
          <button className="mud-btn" onClick={() => { setAugOverlay(null); setSelectedCw(null); }} style={{
            fontFamily: 'monospace', fontSize: '0.7em',
            color: C.dim, background: 'transparent',
            border: '1px solid rgba(var(--phosphor-rgb),0.15)',
            padding: '0.25rem 0.6rem', cursor: 'pointer', borderRadius: 2,
            touchAction: 'manipulation',
          }}>CANCEL</button>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const xpPct = data.xpNext > 0 ? (data.xp / data.xpNext) * 100 : 100;

    return (
      <div>
        {/* Identity */}
        <div style={{
          fontFamily: 'monospace', fontSize: 'var(--text-base)',
          color: C.dim, marginBottom: '0.4rem',
        }}>
          {data.archetype} {'\u00b7'} {data.combatStyle} {'\u00b7'} Level {data.level}
        </div>

        {/* Clock Bars */}
        <div style={{ marginBottom: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <ClockBar filled={data.harmFilled} segments={data.harmSegments} color="#4ade80" label="HARM" />
          {data.armorMaxSegments > 0 && (
            <ClockBar filled={data.armorFilled} segments={data.armorMaxSegments} color="#60a5fa" label="ARMOR" inverted />
          )}
          {data.ramMaxSegments > 0 && (
            <ClockBar filled={data.ramFilled} segments={data.ramMaxSegments} color="#c084fc" label="RAM" inverted />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, flexShrink: 0, whiteSpace: 'nowrap' }}>XP</span>
            <div style={{ flex: 1 }}><Bar pct={xpPct} color={C.xp} height={7} /></div>
            <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.xp }}>{data.xp}/{data.xpNext}</span>
          </div>
        </div>

        {/* Attributes */}
        <div style={{ borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)', paddingTop: '0.4rem', marginBottom: '0.4rem' }}>
          {ATTR_ORDER.map(attr => {
            const val = data.attributes[attr];
            const die = val <= 4 ? 4 : val <= 6 ? 6 : val <= 8 ? 8 : val <= 10 ? 10 : 12;
            return (
              <div key={attr} style={{
                display: 'grid', gridTemplateColumns: '5.5ch 2ch 3.5ch', gap: '0.4ch', alignItems: 'center',
                fontFamily: 'monospace', fontSize: 'var(--text-base)', padding: '0.1rem 0',
              }}>
                <span style={{ color: STAT_COLOR[attr] ?? 'var(--phosphor-green)', fontWeight: 'bold' }}>{attr}</span>
                <span style={{ color: C.dim, textAlign: 'right' }}>{val}</span>
                <span style={{ color: 'var(--phosphor-accent)', fontSize: '0.85em', opacity: 0.8 }}>(d{die})</span>
              </div>
            );
          })}
        </div>

        {/* Currency */}
        <div style={{
          borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)', paddingTop: '0.4rem',
          display: 'flex', gap: '1.5ch', fontFamily: 'monospace', fontSize: 'var(--text-base)',
        }}>
          <span><span style={{ color: '#fcd34d', fontWeight: 'bold' }}>CREDS</span> <span style={{ color: '#fff' }}>{data.creds}</span></span>
          <span><span style={{ color: '#a78bfa', fontWeight: 'bold' }}>SCRIP</span> <span style={{ color: '#fff' }}>{data.scrip}</span></span>
        </div>

        {(data.skillPointsAvailable > 0) && (
          <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#fbbf24', marginTop: '0.3rem' }}>
            {data.skillPointsAvailable > 0 && <div>{data.skillPointsAvailable} skill pt{data.skillPointsAvailable > 1 ? 's' : ''} available</div>}
          </div>
        )}
      </div>
    );
  };

  const TABS: InvTab[] = ['GEAR', 'BACKPACK', 'AUGMENTS', 'STATS'];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 440, maxHeight: '85vh',
        background: 'rgba(10,10,10,0.75)',
        border: '1px solid rgba(var(--phosphor-rgb),0.25)',
        borderRadius: 4, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 30px rgba(var(--phosphor-rgb),0.08)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: 'var(--phosphor-accent)', letterSpacing: '0.06em',
          }} className={S.glow}>INVENTORY</span>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim,
          }}>
            {char.inventory.length + Object.values(char.gear).filter(Boolean).length} items
          </span>
        </div>

        {/* Tab row */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(var(--phosphor-rgb),0.1)',
          overflowX: 'auto', flexShrink: 0,
        }}>
          {TABS.map(tab => {
            const active = tab === activeTab;
            return (
              <button key={tab}
                onClick={() => { setActiveTab(tab); augOverlayState[1](null); augSelectedState[1](null); }}
                style={{
                  flex: 1, minWidth: 0, padding: '0.35rem 0.3rem',
                  fontFamily: 'monospace', fontSize: '0.7em',
                  color: active ? 'var(--phosphor-accent)' : C.faint,
                  background: active ? 'rgba(var(--phosphor-rgb),0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--phosphor-accent)' : '2px solid transparent',
                  cursor: 'pointer', touchAction: 'manipulation', whiteSpace: 'nowrap',
                  letterSpacing: '0.06em',
                }}>
                {tab}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem 0.5rem' }}>
          {activeTab === 'GEAR' && renderGear()}
          {activeTab === 'BACKPACK' && renderBackpack()}
          {activeTab === 'AUGMENTS' && renderAugments()}
          {activeTab === 'STATS' && renderStats()}
        </div>

        {/* Close */}
        <div style={{
          padding: '0.4rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
          display: 'flex', justifyContent: 'center',
        }}>
          <button className="mud-btn" onClick={onClose} style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, background: 'transparent',
            border: '1px solid rgba(var(--phosphor-rgb),0.2)', padding: '0.3rem 1.5rem',
            cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
          }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── NPC Quest Modal — focused on a single NPC's available quest ─────────────
// ══════════════════════════════════════════════════════════════════════════════

function NPCQuestModal({ session, npcId, npcName, onClose }: {
  session: MudSession; npcId: string; npcName: string; onClose: () => void;
}) {
  const char = session.character;
  if (!char) return null;

  // Read fresh world state from persistence (not stale session.world)
  const [tick, setTick] = useState(0);
  const world = useMemo(() => loadWorld(char.handle), [char.handle, tick]);

  const quests = getNPCQuests(npcId, char, world);
  const quest = quests.length > 0 ? quests[0] : null;

  // Check if this NPC has an active quest already
  const activeNPCQuest = getActiveQuests(world).find(q => q.giver === npcId);

  const handleAccept = () => {
    if (!quest) return;
    const result = startQuest(char.handle, quest.id);
    if (result.success) {
      eventBus.emit('crt:glitch-tier', { tier: 2, duration: 200 });
      onClose();
      // Push quest accepted message to chat
      eventBus.emit('shell:push-output', {
        output: (
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8, color: '#fbbf24', fontWeight: 'bold', textShadow: '0 0 8px rgba(251,191,36,0.3)' }}>
              {'>> JOB ACCEPTED: '}{quest.title}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: S.base, lineHeight: 1.8, color: C.dim, opacity: 0.85, paddingLeft: '2ch' }}>
              {quest.description}
            </div>
          </div>
        ),
      });
    }
  };

  const handleDecline = () => {
    if (!quest) return;
    declineQuest(char.handle, quest.id);
    eventBus.emit('crt:glitch-tier', { tier: 1, duration: 100 });
    setTick(t => t + 1);
    onClose();
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 380, maxHeight: '70vh',
        background: 'rgba(10,10,10,0.75)',
        border: '1px solid rgba(251,191,36,0.25)',
        borderRadius: 4, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 30px rgba(251,191,36,0.08)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderBottom: '1px solid rgba(251,191,36,0.15)',
          background: 'rgba(251,191,36,0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: '#fbbf24', letterSpacing: '0.06em',
          }} className={S.glow}>{npcName.toUpperCase()}</span>
          <span style={{
            fontFamily: 'monospace', fontSize: '0.7em',
            color: C.faint, letterSpacing: '0.08em',
          }}>JOB OFFER</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.8rem' }}>
          {activeNPCQuest ? (
            // NPC already has an active quest
            <div>
              <div style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: '#fbbf24', fontWeight: 'bold', marginBottom: '0.3rem',
              }}>{activeNPCQuest.title}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: C.dim, lineHeight: 1.6, marginBottom: '0.5rem',
              }}>already tracking this job. check /jobs for progress.</div>
            </div>
          ) : quest ? (
            // Show quest details
            <div>
              <div style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: '#fbbf24', fontWeight: 'bold', marginBottom: '0.15rem',
              }}>{quest.title}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: '0.75em',
                color: C.faint, marginBottom: '0.4rem',
              }}>tier {quest.tier} {'\u00b7'} {quest.type}</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: C.dim, lineHeight: 1.7, marginBottom: '0.5rem',
              }}>{quest.description}</div>

              {/* Objectives preview */}
              <div style={{
                fontFamily: 'monospace', fontSize: '0.75em',
                color: C.faint, letterSpacing: '0.08em', marginBottom: '0.2rem',
              }}>OBJECTIVES</div>
              {quest.objectives.map(o => (
                <div key={o.id} style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  color: C.dim, padding: '0.1rem 0', paddingLeft: '1ch',
                }}>{'\u25cb'} {o.description}</div>
              ))}

              {/* Rewards preview */}
              <div style={{
                fontFamily: 'monospace', fontSize: '0.75em',
                color: C.faint, letterSpacing: '0.08em', marginTop: '0.5rem', marginBottom: '0.2rem',
              }}>REWARDS</div>
              <div style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: C.dim, paddingLeft: '1ch',
              }}>
                {quest.rewards.xp && <span style={{ color: C.xp }}>{quest.rewards.xp} XP</span>}
                {quest.rewards.creds && <>{' '}{'\u00b7'}{' '}<span style={{ color: '#fcd34d' }}>{quest.rewards.creds} creds</span></>}
                {quest.rewards.items && quest.rewards.items.length > 0 && <>{' '}{'\u00b7'}{' '}<span style={{ color: 'var(--phosphor-accent)' }}>{quest.rewards.items.length} item{quest.rewards.items.length > 1 ? 's' : ''}</span></>}
              </div>
            </div>
          ) : (
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.faint, textAlign: 'center', padding: '1.5rem 0',
            }}>no work available from {npcName.toLowerCase()} right now.</div>
          )}
        </div>

        {/* Buttons */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
          display: 'flex', justifyContent: quest && !activeNPCQuest ? 'space-between' : 'center', gap: '0.5rem',
        }}>
          {quest && !activeNPCQuest ? (
            <>
              <button className="mud-btn" onClick={handleDecline} style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)', color: 'rgba(255,100,100,0.7)', background: 'transparent',
                border: '1px solid rgba(255,100,100,0.25)', padding: '0.3rem 1.2rem',
                cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation', letterSpacing: '0.04em',
              }}>DECLINE</button>
              <button className="mud-btn" onClick={handleAccept} style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#fbbf24', background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.4)', padding: '0.3rem 1.2rem',
                cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation', fontWeight: 'bold', letterSpacing: '0.04em',
                boxShadow: '0 0 6px rgba(251,191,36,0.15)',
              }}>ACCEPT</button>
            </>
          ) : (
            <button className="mud-btn" onClick={onClose} style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, background: 'transparent',
              border: '1px solid rgba(var(--phosphor-rgb),0.2)', padding: '0.3rem 1.5rem',
              cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
            }}>CLOSE</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Quests Modal — Active / Declined tabs ─────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function QuestsModal({ session, onClose }: { session: MudSession; onClose: () => void }) {
  const char = session.character;
  if (!char) return null;

  // Read fresh world state from persistence (not stale session.world)
  const [tick, setTick] = useState(0);
  const world = useMemo(() => loadWorld(char.handle), [char.handle, tick]);

  const active = getActiveQuests(world);
  const declined = getDeclinedQuests(world);
  const [tab, setTab] = useState<'active' | 'declined'>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAcceptDeclined = (questId: string) => {
    undeclineQuest(char.handle, questId);
    const result = startQuest(char.handle, questId);
    if (result.success) {
      eventBus.emit('crt:glitch-tier', { tier: 2, duration: 200 });
      setExpandedId(null);
      setTab('active');
      setTick(t => t + 1);
    }
  };

  const handleDeclineActive = (questId: string) => {
    declineQuest(char.handle, questId);
    eventBus.emit('crt:glitch-tier', { tier: 1, duration: 100 });
    setExpandedId(null);
    setTick(t => t + 1);
  };

  const quests = tab === 'active' ? active : declined;
  const emptyMsg = tab === 'active' ? 'no active jobs. talk to NPCs for work.' : 'no declined jobs.';

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 420, maxHeight: '85vh',
        background: 'rgba(10,10,10,0.75)',
        border: '1px solid rgba(var(--phosphor-rgb),0.25)',
        borderRadius: 4, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 30px rgba(var(--phosphor-rgb),0.08)',
        position: 'relative', zIndex: 1,
      }}>
        {/* Header with tabs */}
        <div style={{
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
        }}>
          <div style={{
            padding: '0.5rem 0.8rem 0',
            display: 'flex', gap: '0.8rem', alignItems: 'flex-end',
          }}>
            {(['active', 'declined'] as const).map(t => {
              const isActive = tab === t;
              const count = t === 'active' ? active.length : declined.length;
              return (
                <button key={t} className="mud-btn" onClick={() => { setTab(t); setExpandedId(null); }} style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)', fontWeight: isActive ? 'bold' : 'normal',
                  color: isActive ? (t === 'active' ? '#fbbf24' : 'rgba(255,100,100,0.7)') : C.faint,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '0.3rem 0.1rem 0.4rem',
                  borderBottom: isActive ? `2px solid ${t === 'active' ? '#fbbf24' : 'rgba(255,100,100,0.5)'}` : '2px solid transparent',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  touchAction: 'manipulation',
                }}>
                  {t} {count > 0 && <span style={{ fontSize: '0.8em', opacity: 0.7 }}>({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quest list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem 0.5rem' }}>
          {quests.length === 0 ? (
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.faint, textAlign: 'center', padding: '1.5rem 0',
            }}>{emptyMsg}</div>
          ) : (
            quests.map(q => {
              const isExpanded = expandedId === q.id;
              const progress = tab === 'active' ? getQuestObjectiveProgress(char.handle, q.id) : null;
              const done = progress?.objectives.filter(o => o.done).length ?? 0;
              const total = progress?.objectives.length ?? q.objectives.length;
              const borderColor = tab === 'active' ? 'rgba(251,191,36,0.3)' : 'rgba(255,100,100,0.2)';
              const borderColorActive = tab === 'active' ? '#fbbf24' : 'rgba(255,100,100,0.5)';

              return (
                <div key={q.id} style={{
                  marginBottom: '0.3rem',
                  borderLeft: `2px solid ${isExpanded ? borderColorActive : borderColor}`,
                  borderRadius: '0 3px 3px 0',
                  background: isExpanded ? `rgba(${tab === 'active' ? '251,191,36' : '255,100,100'},0.06)` : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  {/* Quest title row — clickable */}
                  <div
                    role="button" tabIndex={0}
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setExpandedId(isExpanded ? null : q.id); }}
                    style={{
                      padding: '0.35rem 0.4rem',
                      cursor: 'pointer', touchAction: 'manipulation',
                      fontFamily: 'monospace', fontSize: 'var(--text-base)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                    <span style={{
                      color: tab === 'active' ? '#fbbf24' : 'rgba(255,100,100,0.7)',
                      fontWeight: 'bold',
                    }}>{q.title}</span>
                    {tab === 'active' && progress && (
                      <span style={{ color: C.dim, fontSize: '0.85em', flexShrink: 0 }}>[{done}/{total}]</span>
                    )}
                    {tab === 'declined' && (
                      <span style={{ color: C.faint, fontSize: '0.8em' }}>T{q.tier}</span>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{
                      padding: '0.2rem 0.4rem 0.5rem',
                      animation: 'mud-fade-in 0.2s ease-out',
                    }}>
                      <div style={{
                        fontFamily: 'monospace', fontSize: '0.75em',
                        color: C.faint, marginBottom: '0.3rem',
                      }}>from: {q.giver} {'\u00b7'} tier {q.tier} {'\u00b7'} {q.type}</div>
                      <div style={{
                        fontFamily: 'monospace', fontSize: 'var(--text-base)',
                        color: C.dim, lineHeight: 1.6, marginBottom: '0.4rem',
                      }}>{q.description}</div>

                      {/* Objectives */}
                      {tab === 'active' && progress && (
                        <div style={{ marginBottom: '0.4rem' }}>
                          {progress.objectives.map(o => (
                            <div key={o.id} style={{
                              fontFamily: 'monospace', fontSize: 'var(--text-base)',
                              color: o.done ? C.heal : C.dim,
                              padding: '0.1rem 0',
                            }}>
                              {o.done ? '\u2713' : '\u25cb'} {o.description} ({o.current}/{o.required})
                            </div>
                          ))}
                        </div>
                      )}
                      {tab === 'declined' && (
                        <div style={{ marginBottom: '0.4rem' }}>
                          {q.objectives.map(o => (
                            <div key={o.id} style={{
                              fontFamily: 'monospace', fontSize: 'var(--text-base)',
                              color: C.faint, padding: '0.1rem 0',
                            }}>{'\u25cb'} {o.description}</div>
                          ))}
                        </div>
                      )}

                      {/* Action button — only visible in expanded state */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                        {tab === 'active' && (
                          <button className="mud-btn" onClick={(e) => { e.stopPropagation(); handleDeclineActive(q.id); }} style={{
                            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: 'rgba(255,100,100,0.7)', background: 'transparent',
                            border: '1px solid rgba(255,100,100,0.25)', padding: '0.25rem 0.8rem',
                            cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation', letterSpacing: '0.04em',
                          }}>ABANDON</button>
                        )}
                        {tab === 'declined' && (
                          <button className="mud-btn" onClick={(e) => { e.stopPropagation(); handleAcceptDeclined(q.id); }} style={{
                            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#fbbf24', background: 'rgba(251,191,36,0.08)',
                            border: '1px solid rgba(251,191,36,0.4)', padding: '0.25rem 0.8rem',
                            cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation', fontWeight: 'bold', letterSpacing: '0.04em',
                            boxShadow: '0 0 4px rgba(251,191,36,0.1)',
                          }}>ACCEPT</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.4rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)', display: 'flex', justifyContent: 'center' }}>
          <button className="mud-btn" onClick={onClose} style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, background: 'transparent',
            border: '1px solid rgba(var(--phosphor-rgb),0.2)', padding: '0.3rem 1.5rem',
            cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
          }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── NPC Interaction Modal — Tabbed vendor/quest/dialogue UI ─────────────────
// ══════════════════════════════════════════════════════════════════════════════

const NPC_TAB_COLORS: Record<string, string> = {
  TALK:  '#fcd34d',
  SHOP:  '#4ade80',
  JOBS:  '#fbbf24',
  HEAL:  '#67e8f9',
  INFO:  'var(--phosphor-accent)',
  HIRE:  '#a78bfa',
};

const NPC_TIER_COLORS: Record<string, string> = {
  SCRAP: 'rgba(var(--phosphor-rgb),0.45)',
  COMMON: '#d4d4d4',
  MIL_SPEC: '#60a5fa',
  HELIXION: '#a78bfa',
  PROTOTYPE: '#fbbf24',
};

const NPC_QUEST_TYPE_COLORS: Record<string, string> = {
  FETCH: '#4ade80',
  ELIMINATE: '#ff6b6b',
  ESCORT: '#67e8f9',
  INVESTIGATE: '#c084fc',
  DELIVERY: '#fbbf24',
  DIALOGUE: '#fcd34d',
  SABOTAGE: '#f87171',
  ARENA: '#fb923c',
  MULTI: '#d4d4d4',
};

function npcDispColor(d: number): string {
  if (d <= -51) return '#ff4444';
  if (d <= -11) return '#ff6b6b';
  if (d <= 10)  return '#d4d4d4';
  if (d <= 50)  return '#4ade80';
  return '#67e8f9';
}

function npcDispWord(d: number): string {
  if (d <= -51) return 'HOSTILE';
  if (d <= -11) return 'UNFRIENDLY';
  if (d <= 10)  return 'NEUTRAL';
  if (d <= 50)  return 'FRIENDLY';
  return 'DEVOTED';
}

function NPCModal({ session, data, npc, onClose }: {
  session: MudSession;
  data: PanelData;
  npc: NPCModalPayload;
  onClose: () => void;
}) {
  const char = session.character;
  if (!char) return null;

  const defaultTab = npc.defaultTab ?? 'TALK';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [tick, setTick] = useState(0);

  // Fresh world state for quest data
  const world = useMemo(() => loadWorld(char.handle), [char.handle, tick]);

  // Build tab list based on NPC services
  const tabs = useMemo(() => {
    const result: Array<{ id: string; label: string; color: string }> = [];
    result.push({ id: 'TALK', label: 'TALK', color: NPC_TAB_COLORS.TALK });
    if (npc.services.includes('shop')) result.push({ id: 'SHOP', label: 'SHOP', color: NPC_TAB_COLORS.SHOP });
    if (npc.services.includes('quest') || isNPCQuestGiver(npc.npcId)) result.push({ id: 'JOBS', label: 'JOBS', color: NPC_TAB_COLORS.JOBS });
    if (npc.services.includes('heal')) result.push({ id: 'HEAL', label: 'HEAL', color: NPC_TAB_COLORS.HEAL });
    if (npc.services.includes('info')) result.push({ id: 'INFO', label: 'INFO', color: NPC_TAB_COLORS.INFO });
    if (npc.services.includes('hire')) result.push({ id: 'HIRE', label: 'HIRE', color: NPC_TAB_COLORS.HIRE });
    return result;
  }, [npc.services, npc.npcId]);

  // Disposition data
  const disposition = npc.disposition ?? 0;
  const dispClr = npcDispColor(disposition);
  const dispWrd = npcDispWord(disposition);

  // NPC type color
  const headerColor = npc.npcType === 'SHOPKEEPER' ? '#fcd34d'
    : npc.npcType === 'QUESTGIVER' ? '#fbbf24'
    : npc.npcType === 'ALLIED' ? '#4ade80'
    : npc.npcType === 'ENEMY' ? '#ff6b6b'
    : 'var(--phosphor-accent)';

  const activeTabColor = tabs.find(t => t.id === activeTab)?.color ?? headerColor;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 440, maxHeight: '85vh',
        background: 'rgba(10,10,10,0.75)',
        border: `1px solid ${activeTabColor}33`,
        borderRadius: 4, overflow: 'hidden',
        boxShadow: `0 0 30px ${activeTabColor}15`,
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderBottom: `1px solid ${headerColor}33`,
          background: `${headerColor}0a`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6ch' }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
                color: headerColor, letterSpacing: '0.06em',
                textShadow: `0 0 8px ${headerColor}40`,
              }}>{npc.npcName.toUpperCase()}</span>
              <span style={{
                fontFamily: 'monospace', fontSize: '9px',
                color: C.faint, letterSpacing: '0.08em',
                border: `1px solid ${C.faint}`,
                padding: '0 0.3rem', borderRadius: 2,
              }}>{npc.npcType}</span>
            </div>
            <span style={{
              fontFamily: 'monospace', fontSize: '9px',
              color: dispClr, letterSpacing: '0.06em', fontWeight: 'bold',
            }}>{dispWrd}</span>
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: '#fcd34d', fontStyle: 'italic', opacity: 0.8, marginTop: '0.2rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            &ldquo;{npc.dialogue.replace(/^"/, '').replace(/"$/, '').slice(0, 60)}{npc.dialogue.length > 60 ? '...' : ''}&rdquo;
          </div>
        </div>

        {/* Tab row */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid rgba(var(--phosphor-rgb),0.15)`,
          background: 'rgba(var(--phosphor-rgb),0.02)',
          flexShrink: 0,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: activeTab === tab.id ? tab.color : 'rgba(var(--phosphor-rgb),0.4)',
                background: activeTab === tab.id ? `${tab.color}0a` : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                padding: '0.4rem 0.3rem', cursor: 'pointer', touchAction: 'manipulation',
                letterSpacing: '0.06em',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{
          flex: 1, overflowY: 'auto', overscrollBehavior: 'contain',
          padding: '0.5rem 0.6rem', minHeight: 0,
        }}>
          {activeTab === 'TALK' && <NPCTalkTab npc={npc} disposition={disposition} dispColor={dispClr} dispWord={dispWrd} onClose={onClose} />}
          {activeTab === 'SHOP' && <NPCShopTab npcId={npc.npcId} char={char} tick={tick} setTick={setTick} />}
          {activeTab === 'JOBS' && <NPCJobsTab npcId={npc.npcId} npcName={npc.npcName} char={char} world={world} tick={tick} setTick={setTick} />}
          {activeTab === 'HEAL' && <NPCHealTab npcId={npc.npcId} npcName={npc.npcName} char={char} data={data} tick={tick} setTick={setTick} />}
          {activeTab === 'INFO' && <NPCInfoTab npc={npc} char={char} />}
          {activeTab === 'HIRE' && <NPCHireTab />}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.4rem 0.8rem',
          borderTop: `1px solid rgba(var(--phosphor-rgb),0.1)`,
          display: 'flex', justifyContent: 'center', flexShrink: 0,
        }}>
          <button className="mud-btn" onClick={onClose} style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim,
            background: 'transparent', border: '1px solid rgba(var(--phosphor-rgb),0.2)',
            padding: '0.3rem 1.5rem', cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
          }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ── TALK Tab ────────────────────────────────────────────────────────────────

function NPCTalkTab({ npc, disposition, dispColor, dispWord, onClose }: {
  npc: NPCModalPayload; disposition: number; dispColor: string; dispWord: string; onClose: () => void;
}) {
  const dispPct = Math.max(0, Math.min(100, (disposition + 100) / 200 * 100));

  return (
    <div>
      <div style={{
        fontFamily: 'monospace', fontSize: 'var(--text-base)',
        color: '#d4d4d4', lineHeight: 1.7, marginBottom: '0.6rem',
      }}>{npc.description}</div>

      <div style={{
        fontFamily: 'monospace', fontSize: 'var(--text-base)',
        color: '#fcd34d', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '0.8rem',
        paddingLeft: '0.5rem', borderLeft: '2px solid rgba(252,211,77,0.3)',
      }}>
        &ldquo;{npc.dialogue.replace(/^"/, '').replace(/"$/, '')}&rdquo;
      </div>

      {/* Disposition bar */}
      <div style={{
        border: `1px solid ${dispColor}33`, borderRadius: 3,
        padding: '0.4rem 0.6rem', background: `${dispColor}06`, marginBottom: '0.6rem',
      }}>
        <div style={{
          fontFamily: 'monospace', fontSize: '9px',
          color: C.faint, letterSpacing: '0.08em', marginBottom: '0.2rem',
        }}>DISPOSITION</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5ch',
          fontFamily: 'monospace', fontSize: 'var(--text-base)',
        }}>
          <div style={{
            flex: 1, height: 6, background: 'rgba(var(--phosphor-rgb),0.08)', borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              width: `${dispPct}%`, height: '100%', background: dispColor,
              borderRadius: 3, transition: 'width 0.3s',
            }} />
          </div>
          <span style={{
            color: dispColor, fontWeight: 'bold', whiteSpace: 'nowrap',
            minWidth: '10ch', textAlign: 'right',
          }}>{dispWord} ({disposition > 0 ? '+' : ''}{disposition})</span>
        </div>
        {npc.faction && (
          <div style={{
            fontFamily: 'monospace', fontSize: '9px', color: C.faint, marginTop: '0.3rem',
          }}>Faction: {npc.faction.replace(/_/g, ' ')}</div>
        )}
      </div>

      {npc.services.length > 0 && (
        <div style={{
          fontFamily: 'monospace', fontSize: 'var(--text-base)',
          color: C.dimmer, marginBottom: '0.6rem',
        }}>
          Services: {npc.services.map((s, i) => (
            <span key={s}>
              <span style={{ color: NPC_TAB_COLORS[s.toUpperCase()] ?? C.dim }}>{s}</span>
              {i < npc.services.length - 1 ? ' \u00b7 ' : ''}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button className="mud-btn" onClick={() => {
          eventBus.emit('mud:execute-command', { command: '/talk hello' });
          eventBus.emit('crt:glitch-tier', { tier: 1, duration: 100 });
          onClose();
        }} style={{
          fontFamily: 'monospace', fontSize: 'var(--text-base)',
          fontWeight: 'bold', letterSpacing: '0.06em',
          color: '#fcd34d', background: 'rgba(252,211,77,0.08)',
          border: '1px solid rgba(252,211,77,0.35)',
          padding: '0.35rem 0.8rem', cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
        }}>SAY SOMETHING</button>
      </div>
    </div>
  );
}

// ── SHOP Tab ────────────────────────────────────────────────────────────────

function NPCShopTab({ npcId, char, tick, setTick }: {
  npcId: string; char: import('./types').MudCharacter; tick: number;
  setTick: (fn: (t: number) => number) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const listings = useMemo(() => getFormattedShop(npcId, char), [npcId, char, tick]);

  const handleBuy = (templateId: string, price: number | null) => {
    if (price === null) return;
    if (confirmId === templateId) {
      const result = buyItem(char, npcId, templateId);
      if (result.success) {
        saveCharacter(char.handle, char);
        setTick(t => t + 1);
        eventBus.emit('mud:transient-message', {
          text: `purchased ${result.item!.name} for ${result.price}c. remaining: ${char.currency.creds}c`,
          type: 'commerce',
        });
        eventBus.emit('crt:glitch-tier', { tier: 1, duration: 100 });
      } else {
        setErrorId(templateId);
        setTimeout(() => setErrorId(null), 2000);
      }
      setConfirmId(null);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    } else {
      setConfirmId(templateId);
      setErrorId(null);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmId(null), 2500);
    }
  };

  if (!listings || listings.length === 0) {
    return <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint, textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>this vendor has nothing to sell.</div>;
  }

  return (
    <div>
      {/* Balance bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'monospace', fontSize: 'var(--text-base)', marginBottom: '0.5rem',
        padding: '0.3rem 0.4rem', background: 'rgba(var(--phosphor-rgb),0.03)',
        borderRadius: 3, border: '1px solid rgba(var(--phosphor-rgb),0.08)',
      }}>
        <span>
          <span style={{ color: C.faint, letterSpacing: '0.06em' }}>CREDS: </span>
          <span style={{ color: '#fcd34d', fontWeight: 'bold' }}>{char.currency.creds}{'\u00a2'}</span>
        </span>
        <button className="mud-btn" onClick={() => {
          eventBus.emit('mud:open-sell', {
            inventory: char.inventory, shopkeeperId: npcId,
            shopkeeperName: getShopkeeperName(npcId), currentCreds: char.currency.creds,
          });
        }} style={{
          fontFamily: 'monospace', fontSize: '9px', color: '#fcd34d',
          background: 'rgba(252,211,77,0.06)', border: '1px solid rgba(252,211,77,0.25)',
          padding: '0.15rem 0.5rem', cursor: 'pointer', borderRadius: 2,
          touchAction: 'manipulation', letterSpacing: '0.06em',
        }}>SELL ALL</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {listings.map(item => {
          const template = getItemTemplate(item.templateId);
          const tierColor = NPC_TIER_COLORS[template?.tier ?? 'COMMON'] ?? C.dim;
          const canAfford = item.price !== null && char.currency.creds >= item.price;
          const isConfirming = confirmId === item.templateId;
          const hasError = errorId === item.templateId;

          return (
            <div key={item.templateId} style={{
              border: `1px solid ${tierColor}22`, borderLeft: `3px solid ${tierColor}`,
              borderRadius: '0 3px 3px 0', padding: '0.35rem 0.5rem',
              background: isConfirming ? `${tierColor}0a` : 'rgba(var(--phosphor-rgb),0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: tierColor, fontWeight: 'bold', letterSpacing: '0.04em' }}>{item.name}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: canAfford ? '#4ade80' : '#ff6b6b', fontWeight: 'bold' }}>
                  {item.price !== null ? `${item.price}\u00a2` : 'N/A'}
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: C.dim, lineHeight: 1.5, marginBottom: '0.2rem' }}>{item.description}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '9px', color: tierColor, opacity: 0.7 }}>{template?.tier ?? 'COMMON'}</span>
                <button className="mud-btn" disabled={!canAfford && !isConfirming} onClick={() => handleBuy(item.templateId, item.price)} style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)', fontWeight: 'bold', letterSpacing: '0.06em',
                  color: hasError ? '#ff6b6b' : isConfirming ? '#0a0a0a' : canAfford ? '#4ade80' : C.faint,
                  background: hasError ? 'rgba(255,107,107,0.12)' : isConfirming ? '#4ade80' : canAfford ? 'rgba(74,222,128,0.08)' : 'transparent',
                  border: `1px solid ${hasError ? 'rgba(255,107,107,0.4)' : isConfirming ? '#4ade80' : canAfford ? 'rgba(74,222,128,0.3)' : 'rgba(var(--phosphor-rgb),0.1)'}`,
                  padding: '0.2rem 0.6rem', cursor: canAfford ? 'pointer' : 'default',
                  borderRadius: 2, touchAction: 'manipulation', minWidth: '7ch', textAlign: 'center',
                  boxShadow: isConfirming ? '0 0 8px rgba(74,222,128,0.3)' : 'none',
                }}>{hasError ? 'CANT AFFORD' : isConfirming ? `CONFIRM ${item.price}\u00a2` : 'BUY'}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── JOBS Tab ────────────────────────────────────────────────────────────────

function NPCJobsTab({ npcId, npcName, char, world, tick, setTick }: {
  npcId: string; npcName: string; char: import('./types').MudCharacter;
  world: import('./types').MudWorldState; tick: number;
  setTick: (fn: (t: number) => number) => void;
}) {
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);
  const available = useMemo(() => getNPCQuests(npcId, char, world), [npcId, char, world]);
  const activeFromNPC = useMemo(() => getActiveQuests(world).filter(q => q.giver === npcId), [world, npcId]);

  const handleAccept = (questId: string) => {
    const result = startQuest(char.handle, questId);
    if (result.success) {
      eventBus.emit('crt:glitch-tier', { tier: 2, duration: 200 });
      eventBus.emit('mud:transient-message', { text: `job accepted: ${result.quest?.title ?? questId}`, type: 'quest' });
      setTick(t => t + 1);
    }
  };

  const handleDecline = (questId: string) => {
    declineQuest(char.handle, questId);
    eventBus.emit('crt:glitch-tier', { tier: 1, duration: 100 });
    eventBus.emit('mud:transient-message', { text: 'job declined.', type: 'quest' });
    setTick(t => t + 1);
  };

  return (
    <div>
      <div style={{ fontFamily: 'monospace', fontSize: '9px', color: C.faint, letterSpacing: '0.08em', marginBottom: '0.3rem' }}>AVAILABLE JOBS</div>
      {available.length === 0 ? (
        <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint, fontStyle: 'italic', padding: '0.5rem 0' }}>
          no work available from {npcName.toLowerCase()} right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.6rem' }}>
          {available.map(quest => {
            const typeColor = NPC_QUEST_TYPE_COLORS[quest.type] ?? C.dim;
            return (
              <div key={quest.id} style={{
                border: '1px solid rgba(251,191,36,0.15)', borderLeft: `3px solid ${typeColor}`,
                borderRadius: '0 3px 3px 0', padding: '0.4rem 0.5rem',
                background: 'rgba(var(--phosphor-rgb),0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#fbbf24', fontWeight: 'bold' }}>{quest.title}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '9px', color: typeColor, letterSpacing: '0.06em' }}>T{quest.tier} {'\u00b7'} {quest.type}</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: C.dim, lineHeight: 1.6, marginBottom: '0.3rem' }}>{quest.description}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '9px', color: C.dimmer, marginBottom: '0.3rem' }}>
                  Reward:{' '}
                  {quest.rewards.xp && <span style={{ color: C.xp }}>{quest.rewards.xp} XP</span>}
                  {quest.rewards.creds && <>{' \u00b7 '}<span style={{ color: '#fcd34d' }}>{quest.rewards.creds}{'\u00a2'}</span></>}
                  {quest.rewards.items && quest.rewards.items.length > 0 && <>{' \u00b7 '}<span style={{ color: 'var(--phosphor-accent)' }}>{quest.rewards.items.length} item{quest.rewards.items.length > 1 ? 's' : ''}</span></>}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <button className="mud-btn" onClick={() => handleDecline(quest.id)} style={{
                    fontFamily: 'monospace', fontSize: 'var(--text-base)', color: 'rgba(255,100,100,0.7)',
                    background: 'transparent', border: '1px solid rgba(255,100,100,0.25)',
                    padding: '0.25rem 0.8rem', cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
                  }}>DECLINE</button>
                  <button className="mud-btn" onClick={() => handleAccept(quest.id)} style={{
                    fontFamily: 'monospace', fontSize: 'var(--text-base)', fontWeight: 'bold',
                    color: '#fbbf24', background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.4)', padding: '0.25rem 0.8rem',
                    cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
                    boxShadow: '0 0 6px rgba(251,191,36,0.15)',
                  }}>ACCEPT</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeFromNPC.length > 0 && (
        <>
          <div style={{
            fontFamily: 'monospace', fontSize: '9px', color: C.faint, letterSpacing: '0.08em',
            marginBottom: '0.3rem', marginTop: '0.3rem', paddingTop: '0.3rem',
            borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
          }}>ACTIVE JOBS FROM THIS NPC</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {activeFromNPC.map(quest => {
              const typeColor = NPC_QUEST_TYPE_COLORS[quest.type] ?? C.dim;
              const progress = getQuestObjectiveProgress(char.handle, quest.id);
              const isExpanded = expandedQuest === quest.id;
              return (
                <div key={quest.id} style={{
                  border: '1px solid rgba(var(--phosphor-rgb),0.12)', borderLeft: `3px solid ${typeColor}`,
                  borderRadius: '0 3px 3px 0', padding: '0.35rem 0.5rem',
                  background: 'rgba(var(--phosphor-rgb),0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#fbbf24', fontWeight: 'bold' }}>{quest.title}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '9px', color: typeColor }}>T{quest.tier} {'\u00b7'} {quest.type}</span>
                  </div>
                  {progress?.objectives.map(obj => (
                    <div key={obj.id} style={{
                      fontFamily: 'monospace', fontSize: '10px',
                      color: obj.done ? '#4ade80' : C.dim, paddingLeft: '1ch',
                    }}>{obj.done ? '\u25cf' : '\u25b8'} {obj.description} [{obj.current}/{obj.required}]</div>
                  ))}
                  <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#67e8f9', marginTop: '0.2rem' }}>Status: IN PROGRESS</div>
                  <button className="mud-btn" onClick={() => setExpandedQuest(isExpanded ? null : quest.id)} style={{
                    fontFamily: 'monospace', fontSize: '9px', color: C.dimmer, background: 'transparent',
                    border: '1px solid rgba(var(--phosphor-rgb),0.12)', padding: '0.15rem 0.5rem',
                    marginTop: '0.2rem', cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
                  }}>{isExpanded ? 'COLLAPSE' : 'DETAILS'}</button>
                  {isExpanded && (
                    <div style={{
                      fontFamily: 'monospace', fontSize: '10px', color: C.dim, lineHeight: 1.6,
                      marginTop: '0.3rem', paddingTop: '0.3rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.08)',
                    }}>{quest.description}</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── HEAL Tab ────────────────────────────────────────────────────────────────

function NPCHealTab({ npcId, npcName, char, data, tick, setTick }: {
  npcId: string; npcName: string; char: import('./types').MudCharacter;
  data: PanelData; tick: number; setTick: (fn: (t: number) => number) => void;
}) {
  const [healed, setHealed] = useState(false);
  const missing = char.maxHp - char.hp;
  const stressHeld = char.stress ?? 0;
  const needsHealing = missing > 0 || stressHeld > 0;
  const hpCost = missing > 0 ? Math.max(5, Math.ceil(missing / 10) * 5) : 0;
  const stressCost = stressHeld > 0 ? 5 : 0;
  const totalCost = hpCost + stressCost;
  const canAfford = char.currency.creds >= totalCost;

  const handleHeal = () => {
    if (!needsHealing || !canAfford) return;
    char.hp = char.maxHp;
    if (stressHeld > 0) char.stress = Math.max(0, char.stress - 2);
    char.currency.creds -= totalCost;
    saveCharacter(char.handle, char);
    setHealed(true);
    setTick(t => t + 1);
    eventBus.emit('crt:glitch-tier', { tier: 1, duration: 150 });
    eventBus.emit('mud:transient-message', { text: `healed by ${npcName}. cost: ${totalCost}c. hp: ${char.hp}/${char.maxHp}`, type: 'heal' });
  };

  const flavor = ['"No anesthesia. Sit still."', '"Hold still. This stings."', '"You look like hell."', '"Payment first."'][npcName.length % 4];

  return (
    <div>
      <div style={{ fontFamily: 'monospace', fontSize: '9px', color: C.faint, letterSpacing: '0.08em', marginBottom: '0.3rem' }}>CURRENT STATUS</div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr', gap: '0.2rem', marginBottom: '0.6rem',
        padding: '0.4rem', border: '1px solid rgba(var(--phosphor-rgb),0.08)', borderRadius: 3,
        background: 'rgba(var(--phosphor-rgb),0.02)',
      }}>
        <ClockBar filled={data.harmFilled} segments={data.harmSegments} color="#4ade80" label="HARM" compact />
        <ClockBar filled={data.stress} segments={data.maxStress} color="#fbbf24" label="STRSS" compact />
        {data.ramMaxSegments > 0 && <ClockBar filled={data.ramFilled} segments={data.ramMaxSegments} color="#c084fc" label="RAM" inverted compact />}
      </div>

      <div style={{
        border: `1px solid ${needsHealing ? 'rgba(103,232,249,0.2)' : 'rgba(var(--phosphor-rgb),0.08)'}`,
        borderRadius: 3, padding: '0.5rem 0.6rem',
        background: needsHealing ? 'rgba(103,232,249,0.03)' : 'transparent', marginBottom: '0.6rem',
      }}>
        {needsHealing ? (
          <>
            <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#67e8f9', fontWeight: 'bold', marginBottom: '0.2rem' }}>HEAL COST: {totalCost}{'\u00a2'}</div>
            <div style={{ fontFamily: 'monospace', fontSize: '10px', color: C.dim, lineHeight: 1.6 }}>
              {missing > 0 && <>Restores all harm ({missing} HP). </>}
              {stressHeld > 0 && <>Reduces stress by 2. </>}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dimmer, marginTop: '0.3rem' }}>
              Balance: <span style={{ color: '#fcd34d' }}>{char.currency.creds}{'\u00a2'}</span>
            </div>
          </>
        ) : (
          <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#4ade80', textAlign: 'center', padding: '0.5rem 0' }}>You&apos;re in good shape. No healing needed.</div>
        )}
      </div>

      {needsHealing && !healed && (
        <button className="mud-btn" disabled={!canAfford} onClick={handleHeal} style={{
          display: 'block', width: '100%', fontFamily: 'monospace', fontSize: 'var(--text-header)',
          fontWeight: 'bold', letterSpacing: '0.06em',
          color: canAfford ? '#0a0a0a' : '#ff6b6b',
          background: canAfford ? '#67e8f9' : 'transparent',
          border: `1px solid ${canAfford ? '#67e8f9' : 'rgba(255,107,107,0.3)'}`,
          padding: '0.5rem 1rem', cursor: canAfford ? 'pointer' : 'default',
          borderRadius: 3, touchAction: 'manipulation', marginBottom: '0.5rem',
          boxShadow: canAfford ? '0 0 12px rgba(103,232,249,0.3)' : 'none',
        }}>{canAfford ? `HEAL \u2014 ${totalCost}\u00a2` : `NEED ${totalCost}\u00a2`}</button>
      )}
      {healed && (
        <div style={{
          fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#4ade80', textAlign: 'center',
          padding: '0.5rem 0', fontWeight: 'bold', textShadow: '0 0 8px rgba(74,222,128,0.3)',
          animation: 'mud-fade-in 0.3s ease-out',
        }}>{'\u2713'} PATCHED UP</div>
      )}
      <div style={{
        fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#67e8f9',
        fontStyle: 'italic', opacity: 0.6, textAlign: 'center', marginTop: '0.3rem',
      }}>{flavor}</div>
    </div>
  );
}

// ── INFO Tab ────────────────────────────────────────────────────────────────

function NPCInfoTab({ npc, char }: { npc: NPCModalPayload; char: import('./types').MudCharacter }) {
  const entries = npc.infoEntries;
  if (!entries || entries.length === 0) {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, lineHeight: 1.7 }}>
        <div style={{ marginBottom: '0.5rem' }}>{npc.description}</div>
        <div style={{ color: C.faint, fontStyle: 'italic' }}>{npc.npcName} has nothing more to share right now.</div>
      </div>
    );
  }

  return (
    <div>
      {entries.map((entry, i) => {
        if (entry.gated) {
          const val = char.attributes[entry.gated.attribute];
          if (val < entry.gated.minimum) {
            return <div key={i} style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint, marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.5 }}>
              [{entry.gated.attribute} {'\u2265'} {entry.gated.minimum}] [LOCKED]
            </div>;
          }
          return <div key={i} style={{
            color: 'var(--phosphor-accent)', borderLeft: '2px solid var(--phosphor-accent)',
            paddingLeft: '0.6rem', marginTop: '0.5rem', fontFamily: 'monospace',
            fontSize: 'var(--text-base)', lineHeight: 1.7,
          }}>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>[{entry.gated.attribute} {'\u2265'} {entry.gated.minimum}]</span>
            {' '}{entry.text}
          </div>;
        }
        return <div key={i} style={{
          fontFamily: 'monospace', fontSize: 'var(--text-base)', color: '#d4d4d4',
          lineHeight: 1.7, marginTop: i > 0 ? '0.4rem' : 0,
        }}>{entry.text}</div>;
      })}
    </div>
  );
}

// ── HIRE Tab ────────────────────────────────────────────────────────────────

function NPCHireTab() {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint, textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>
      companion recruitment coming soon.
      <div style={{ fontSize: '9px', marginTop: '0.5rem', color: C.dimmer }}>[SYSTEM NOT YET ACTIVE]</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Examine Modal ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

interface ExamineAction {
  label: string;
  color: string;
  command?: string;     // emit via mud:execute-command (closes modal)
  inlineResult?: string; // show this text inline on click (stays open)
  event?: { type: string; payload?: any }; // fire arbitrary eventBus event (closes modal)
}

interface ExamineData {
  title: string;
  color: string;
  body: string;
  extra?: Array<{ text: string; color: string }>;
  footer?: string;
  actions?: ExamineAction[];
}

function ExamineModal({ data: initialData, onClose }: { data: ExamineData; onClose: () => void }) {
  const [results, setResults] = useState<Array<{ text: string; color: string }>>([]);
  const [usedActions, setUsedActions] = useState<Set<string>>(new Set());

  const handleAction = (action: ExamineAction) => {
    if (action.command) {
      // Execute command and close modal
      eventBus.emit('mud:execute-command', { command: action.command });
      eventBus.emit('crt:glitch-tier', { tier: 1, duration: 100 });
      onClose();
      return;
    }
    if (action.event) {
      // Fire arbitrary event and close modal
      eventBus.emit(action.event.type, action.event.payload);
      eventBus.emit('crt:glitch-tier', { tier: 1, duration: 100 });
      onClose();
      return;
    }
    if (action.inlineResult) {
      // Show result inline, mark action as used
      setResults(prev => [...prev, { text: action.inlineResult!, color: action.color }]);
      setUsedActions(prev => new Set(prev).add(action.label));
      eventBus.emit('crt:glitch-tier', { tier: 1, duration: 80 });
    }
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(2,3,8,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0.5rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SubstrateBackground opacity={0.35} />
      <div style={{
        width: '100%', maxWidth: 400, maxHeight: '80vh',
        background: 'rgba(10,10,10,0.75)',
        border: `1px solid ${initialData.color}33`,
        borderRadius: 4, overflow: 'hidden',
        boxShadow: `0 0 30px ${initialData.color}15`,
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '0.6rem 0.8rem',
          borderBottom: `1px solid ${initialData.color}33`,
          background: `${initialData.color}0a`,
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: initialData.color, letterSpacing: '0.06em',
          }}>{initialData.title}</span>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem 0.8rem' }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: '#d4d4d4', lineHeight: 1.7,
          }}>{initialData.body}</div>
          {initialData.extra?.map((ex, i) => (
            <div key={i} style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: ex.color, marginTop: '0.4rem', lineHeight: 1.6,
            }}>{ex.text}</div>
          ))}
          {initialData.footer && (
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: C.faint, marginTop: '0.4rem', fontStyle: 'italic',
            }}>{initialData.footer}</div>
          )}

          {/* Inline results from actions */}
          {results.map((r, i) => (
            <div key={`result-${i}`} style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: r.color, marginTop: '0.5rem', paddingTop: '0.4rem',
              borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
              animation: 'mud-fade-in 0.3s ease-out',
              lineHeight: 1.6,
            }}>{r.text}</div>
          ))}
        </div>

        {/* Actions + Close */}
        <div style={{
          padding: '0.5rem 0.8rem',
          borderTop: `1px solid ${initialData.color}1a`,
          display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
          justifyContent: 'center', flexShrink: 0,
        }}>
          {initialData.actions?.map(action => {
            const used = usedActions.has(action.label);
            return (
              <button
                key={action.label}
                className="mud-btn"
                disabled={used}
                onClick={() => !used && handleAction(action)}
                style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  fontWeight: 'bold', letterSpacing: '0.06em',
                  color: used ? C.faint : action.color,
                  background: used ? 'transparent' : `${action.color}12`,
                  border: `1px solid ${used ? 'rgba(var(--phosphor-rgb),0.1)' : action.color + '40'}`,
                  padding: '0.3rem 0.8rem',
                  cursor: used ? 'default' : 'pointer',
                  borderRadius: 2, touchAction: 'manipulation',
                  opacity: used ? 0.4 : 1,
                }}
              >
                {used ? `\u2713 ${action.label}` : action.label}
              </button>
            );
          })}
          <button className="mud-btn" onClick={onClose} style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, background: 'transparent',
            border: '1px solid rgba(var(--phosphor-rgb),0.2)', padding: '0.3rem 1rem',
            cursor: 'pointer', borderRadius: 2, touchAction: 'manipulation',
          }}>CLOSE</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Action Bar ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ActionBar({ inCombat, panelMode, showUpgrade, onUpgrade, onSkills, onQuests, onHelp, onInventory, onMap }: {
  inCombat: boolean; panelMode: PanelMode;
  showUpgrade: boolean; onUpgrade: () => void; onSkills: () => void;
  onQuests: () => void; onHelp: () => void; onInventory: () => void; onMap: () => void;
}) {
  if (inCombat) return null;

  return (
    <div style={{
      display: 'flex', justifyContent: 'stretch',
      borderTop: `1px solid ${BORDER}`,
      background: 'rgba(var(--phosphor-rgb),0.02)',
      flexShrink: 0,
      touchAction: 'none',
    }}>
      {ACTION_BUTTONS.map((btn) => {
        const isMapBtn = btn.label === 'MAP';
        const isSkillsBtn = btn.label === 'SKILLS';
        const isJobsBtn = btn.label === 'JOBS';
        const isHelpBtn = btn.label === 'HELP';
        const isInventoryBtn = btn.label === 'INVENTORY';
        const isActive = isMapBtn && panelMode === 'map';

        return (
          <button
            key={btn.label}
            className="mud-action-btn"
            onClick={() => {
              if (isMapBtn) {
                onMap();
              } else if (isInventoryBtn) {
                onInventory();
              } else if (isSkillsBtn) {
                onSkills();
              } else if (isJobsBtn) {
                onQuests();
              } else if (isHelpBtn) {
                onHelp();
              } else {
                eventBus.emit('mud:execute-command', { command: btn.command });
              }
              eventBus.emit('crt:glitch-tier', { tier: 1, duration: 80 });
            }}
            style={{
              flex: 1,
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: isActive ? 'var(--phosphor-accent)' : C.dim,
              background: isActive ? 'rgba(var(--phosphor-rgb),0.08)' : 'transparent',
              border: 'none',
              borderRight: `1px solid ${BORDER}`,
              borderBottom: isActive ? '2px solid var(--phosphor-accent)' : '2px solid transparent',
              padding: '0.4rem 0.2rem',
              cursor: 'pointer', touchAction: 'manipulation',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontWeight: isActive ? 'bold' : 'normal',
              animation: isActive ? 'mud-pulse-phosphor-btn 2s ease-in-out infinite' : 'none',
              textShadow: isActive ? '0 0 8px rgba(var(--phosphor-rgb),0.5)' : 'none',
            }}
          >
            {btn.label}
          </button>
        );
      })}
      {showUpgrade && (
        <button
          className="mud-btn"
          onClick={() => {
            onUpgrade();
            eventBus.emit('crt:glitch-tier', { tier: 2, duration: 200 });
          }}
          style={{
            flex: 1,
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            fontWeight: 'bold', letterSpacing: '0.06em',
            color: '#fbbf24',
            background: 'rgba(251,191,36,0.08)',
            border: 'none',
            borderBottom: '2px solid rgba(251,191,36,0.5)',
            padding: '0.4rem 0.2rem',
            cursor: 'pointer', touchAction: 'manipulation',
            animation: 'mud-pulse-amber 2s ease-in-out infinite',
          }}
        >
          UPGRADE
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Bottom Bar — [Identity · HP · XP · Stats | Compass] ─────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function BottomBar({ data, onStatsClick }: { data: PanelData; onStatsClick: () => void }) {
  const xpPct = data.xpNext > 0 ? (data.xp / data.xpNext) * 100 : 100;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderTop: `1px solid ${BORDER}`,
      background: BG_PANEL,
      flexShrink: 0,
      position: 'relative',
      touchAction: 'none',
      padding: '0.25rem 0.5rem 0.15rem',
    }}>
      {/* Row 1: Identity + level */}
      <div
        role="button" tabIndex={0}
        onClick={onStatsClick}
        onKeyDown={(e) => { if (e.key === 'Enter') onStatsClick(); }}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'monospace', fontSize: S.base,
          cursor: 'pointer', touchAction: 'manipulation',
          marginBottom: '0.2rem',
        }}
      >
        <span style={{
          color: 'var(--phosphor-accent)', fontWeight: 'bold',
          letterSpacing: '0.06em',
          textShadow: '0 0 6px rgba(var(--phosphor-rgb),0.3)',
        }} className={S.glow}>
          {data.handle} {'\u2014'} {data.subjectId}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch' }}>
          {data.activeQuestCount > 0 && (
            <span
              role="button" tabIndex={0}
              onClick={(e) => { e.stopPropagation(); eventBus.emit('mud:execute-command', { command: '/jobs' }); }}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: '/jobs' }); }}
              style={{
                fontSize: 'var(--text-base)', color: '#fbbf24',
                border: '1px solid rgba(251,191,36,0.3)', padding: '0 0.3rem',
                borderRadius: 2, cursor: 'pointer',
              }}
            >{data.activeQuestCount}J</span>
          )}
          <span style={{
            color: 'var(--phosphor-accent)', fontWeight: 'bold',
            border: '1px solid rgba(var(--phosphor-rgb),0.3)', padding: '0.05rem 0.35rem',
            borderRadius: 2, textShadow: '0 0 6px rgba(var(--phosphor-rgb),0.4)',
          }}>
            Lv.{data.level}
          </span>
          {data.godMode && (
            <span style={{
              color: '#ffcc00', fontWeight: 'bold', fontSize: '8px',
              border: '1px solid rgba(255,204,0,0.4)', padding: '0 3px',
              borderRadius: 2, textShadow: '0 0 6px rgba(255,204,0,0.4)',
            }}>GOD</span>
          )}
        </div>
      </div>

      {/* Row 2-3: Stats + Compass side by side */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.15rem' }}>
        {/* Left: clock bars */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.15rem 1ch', minWidth: 0 }}>
          <ClockBar filled={data.harmFilled} segments={data.harmSegments} color="#4ade80" label="HARM" compact />
          {data.armorMaxSegments > 0 ? (
            <ClockBar filled={data.armorFilled} segments={data.armorMaxSegments} color="#60a5fa" label="ARMOR" inverted compact />
          ) : <div />}
          <ClockBar filled={data.stress} segments={data.maxStress} color="#fbbf24" label="STRSS" compact />
          {data.ramMaxSegments > 0 ? (
            <ClockBar filled={data.ramFilled} segments={data.ramMaxSegments} color="#c084fc" label="RAM" inverted compact />
          ) : <div />}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch' }}>
            <span style={{ color: '#67e8f9', flexShrink: 0, fontWeight: 'bold', opacity: 0.7, fontSize: '10px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>XP</span>
            <div style={{ flex: 1 }}><Bar pct={xpPct} color="#67e8f9" gradient="linear-gradient(90deg, #67e8f9, #e879f9)" height={5} /></div>
            <span style={{ color: '#e879f9', flexShrink: 0, opacity: 0.7, fontSize: '10px', fontFamily: 'monospace' }}>{data.xp}/{data.xpNext}</span>
          </div>
          {data.traumas.length > 0 && (
            <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#ff6b6b', gridColumn: '1 / -1' }}>
              TRAUMA: {data.traumas.join(' · ')}
            </div>
          )}
        </div>
        {/* Right: compass rose */}
        <div style={{ flexShrink: 0 }}>
          <CompassRose exits={data.exits} />
        </div>
      </div>

      {/* Passages bar below compass area */}
      <PassagesBar branches={data.branches} />

      {/* Row 4: Attributes + currency */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'monospace', fontSize: '10px',
        borderTop: '1px solid rgba(var(--phosphor-rgb),0.06)',
        paddingTop: '0.15rem',
      }}>
        <div style={{ display: 'flex', gap: '0.4ch', flexWrap: 'wrap' }}>
          {(['BODY', 'REFLEX', 'TECH', 'INT', 'COOL', 'GHOST'] as const).map((attr, i) => {
            const val = data.attributes[attr];
            const die = val <= 4 ? 4 : val <= 6 ? 6 : val <= 8 ? 8 : val <= 10 ? 10 : 12;
            return (
              <span key={attr} style={{ whiteSpace: 'nowrap' }}>
                <span style={{ color: STAT_COLOR[attr], fontWeight: 'bold' }}>{attr.slice(0, 3)}</span>
                <span style={{ color: C.faint, marginLeft: '1px' }}>{val}</span>
                <span style={{ color: 'var(--phosphor-accent)', opacity: 0.6, marginLeft: '1px' }}>d{die}</span>
                {i < 5 && <span style={{ color: C.faint, margin: '0 1px' }}>{'\u00b7'}</span>}
              </span>
            );
          })}
        </div>
        <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ color: '#fcd34d', fontWeight: 'bold' }}>{data.creds}</span>
          <span style={{ color: C.faint }}>{'\u00a2'}</span>
          <span style={{ color: C.faint, margin: '0 2px' }}>{'\u00b7'}</span>
          <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>{data.scrip}</span>
          <span style={{ color: C.faint }}>s</span>
        </span>
      </div>

      {/* Unspent skill points notification */}
      {data.skillPointsAvailable > 0 && (
        <div style={{
          fontFamily: 'monospace', fontSize: '9px', color: '#fbbf24',
          textAlign: 'center', paddingTop: '0.1rem',
        }}>
          {data.skillPointsAvailable} skill pt{data.skillPointsAvailable > 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// ── Top Panels (room header + grid) ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function TopPanels({ data, panelMode }: { data: PanelData; panelMode: PanelMode }) {
  // Combat mode — compact enemy strips
  if (data.inCombat) return <CombatHeader data={data} />;

  // Explore mode — thin room header only (NPCs/objects/exits are inline in chat now)
  return <RoomHeader data={data} />;
}

// ── Room Header (explore mode) — 1-line room strip ──────────────────────────

function RoomHeader({ data }: { data: PanelData }) {
  return (
    <div style={{
      flexShrink: 0,
      background: BG_PANEL,
      borderBottom: `1px solid ${BORDER}`,
      padding: '0.3rem 0.6rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6ch', fontFamily: 'monospace', overflow: 'hidden' }}>
        <span style={{
          fontSize: 'var(--text-header)', fontWeight: 'bold',
          color: data.isSafeZone ? '#a5f3fc' : 'var(--phosphor-accent)',
          letterSpacing: '0.06em', whiteSpace: 'nowrap',
          textShadow: data.isSafeZone ? '0 0 6px rgba(165,243,252,0.3)' : '0 0 6px rgba(var(--phosphor-rgb),0.3)',
        }}>
          {data.isSafeZone ? '\u2723 ' : '\u2550 '}{data.roomName}
        </span>
        <span style={{
          fontSize: 'var(--text-base)', color: C.faint,
          whiteSpace: 'nowrap',
        }}>
          {data.zoneName}
        </span>
      </div>
      {/* Room trait dice badges + enemy count */}
      <div style={{ display: 'flex', gap: '0.4ch', flexShrink: 0, alignItems: 'center' }}>
        {data.roomTraits.map((trait, i) => (
          <span key={i} style={{
            fontFamily: 'monospace', fontSize: '9px',
            color: trait.color ?? '#fbbf24',
            border: `1px solid ${(trait.color ?? '#fbbf24')}44`,
            padding: '0 0.3rem', borderRadius: 2,
            background: `${(trait.color ?? '#fbbf24')}0a`,
            whiteSpace: 'nowrap',
          }}>
            {trait.name} d{trait.die}
          </span>
        ))}
        {data.enemies.length > 0 && !data.inCombat && (
          <span style={{
            fontFamily: 'monospace', fontSize: '9px',
            color: '#ff6b6b', opacity: 0.7,
            border: '1px solid rgba(255,107,107,0.2)',
            padding: '0 0.3rem', borderRadius: 2,
          }}>
            {'\u26A0'} {data.enemies.length}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Combat Header — enemy strips + round indicator ──────────────────────────

function CombatHeader({ data }: { data: PanelData }) {
  return (
    <div style={{
      flexShrink: 0,
      background: BG_COMBAT,
      borderBottom: `1px solid ${BORDER_COMBAT}`,
    }}>
      {/* Round bar */}
      <div style={{
        padding: '0.25rem 0.6rem',
        borderBottom: `1px solid ${BORDER_COMBAT}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
          color: C.combat, letterSpacing: '0.08em',
          animation: 'mud-header-pulse 2.5s ease-in-out infinite',
        }} className={S.glow}>
          {'\u2694'} COMBAT {'\u2014'} Round {data.combatRound}
        </span>
        <span style={{
          fontFamily: 'monospace', fontSize: 'var(--text-base)',
          color: data.isPlayerTurn ? 'var(--phosphor-accent)' : C.faint,
          animation: data.isPlayerTurn ? 'mud-turn-glow 2s ease-in-out infinite' : 'none',
        }}>
          {data.isPlayerTurn ? 'YOUR MOVE' : 'WAITING...'}
        </span>
      </div>

      {/* Room traits in combat */}
      {data.roomTraits.length > 0 && (
        <div style={{
          padding: '0.15rem 0.6rem',
          borderBottom: `1px solid ${BORDER_COMBAT}`,
          display: 'flex', gap: '0.4ch',
        }}>
          {data.roomTraits.map((trait, i) => (
            <span key={i} style={{
              fontFamily: 'monospace', fontSize: '9px',
              color: trait.color ?? '#fbbf24',
              border: `1px solid ${(trait.color ?? '#fbbf24')}33`,
              padding: '0 0.3rem', borderRadius: 2,
            }}>
              {trait.name} d{trait.die}
            </span>
          ))}
        </div>
      )}

      {/* Enemy strips — 2 lines per enemy */}
      <div style={{ padding: '0.3rem 0.5rem' }}>
        {data.enemies.map((enemy, i) => {
          const harmPct = (enemy.harmSegments ?? 4) > 0 ? ((enemy.harmFilled ?? 0) / (enemy.harmSegments ?? 4)) * 100 : 0;
          const isLow = harmPct > 70;
          return (
            <div key={enemy.id} style={{
              borderBottom: i < data.enemies.length - 1 ? `1px solid rgba(255,68,68,0.08)` : 'none',
              padding: '0.25rem 0',
            }}>
              {/* Line 1: name + tier + behavior + action buttons */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
              }}>
                <div
                  role="button" tabIndex={0}
                  onClick={() => eventBus.emit('mud:execute-command', { command: `/attack ${enemy.name}` })}
                  style={{ cursor: 'pointer', touchAction: 'manipulation', display: 'flex', alignItems: 'center', gap: '0.5ch' }}
                >
                  <span style={{
                    color: isLow ? '#ff4444' : C.enemy, fontWeight: 'bold',
                    textShadow: isLow ? '0 0 6px rgba(255,68,68,0.4)' : 'none',
                  }}>
                    {enemy.name}
                  </span>
                  <span style={{ color: C.faint, fontSize: '9px' }}>T{enemy.tier ?? '?'}</span>
                  {enemy.behavior && (
                    <span style={{ color: C.faint, fontSize: '9px', opacity: 0.6 }}>{enemy.behavior}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <Btn label="ATK" command={`/attack ${enemy.name}`} color={C.enemy} borderColor="rgba(255,107,107,0.4)" small />
                  <Btn label="SCAN" command={`/scan ${enemy.name}`} color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.3)" small />
                </div>
              </div>
              {/* Line 2: clock bars inline */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1ch',
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                paddingLeft: '0.3rem',
              }}>
                <ClockBar filled={enemy.harmFilled ?? 0} segments={enemy.harmSegments ?? 4} color="#ff6b6b" label="HARM" compact />
                {(enemy.armorSegments ?? 0) > 0 && (
                  <ClockBar filled={enemy.armorFilled ?? 0} segments={enemy.armorSegments!} color="#60a5fa" label="ARMOR" inverted compact />
                )}
                {enemy.effects && enemy.effects.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3ch' }}>
                    {enemy.effects.map((eff, j) => (
                      <span key={j} style={{
                        fontSize: '8px', color: '#c084fc',
                        border: '1px solid rgba(192,132,252,0.25)',
                        padding: '0 0.25rem', borderRadius: 1,
                      }}>
                        {eff}
                      </span>
                    ))}
                  </div>
                )}
                {enemy.complications && enemy.complications.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3ch' }}>
                    {enemy.complications.map((comp, j) => {
                      const step = comp.die === 4 ? 0 : comp.die === 6 ? 1 : comp.die === 8 ? 2 : comp.die === 10 ? 3 : 4;
                      const isMax = comp.die >= 12;
                      return (
                        <span key={`comp-${j}`} style={{
                          fontSize: '8px', color: isMax ? '#ff4444' : '#c084fc',
                          border: `1px solid ${isMax ? 'rgba(255,68,68,0.5)' : 'rgba(192,132,252,0.25)'}`,
                          padding: '0 0.25rem', borderRadius: 1,
                          animation: isMax ? 'mud-pulse-red 1.5s ease-in-out infinite' : 'none',
                        }}>
                          {comp.name} d{comp.die} {'\u25B2'.repeat(step)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── TraumaModal — Stress overflow trauma selection ────────────────────────────
// Displayed when char.stress >= char.maxStress. Player picks a permanent trauma.
// ══════════════════════════════════════════════════════════════════════════════

const TRAUMA_OPTIONS: Array<{
  id: string;
  label: string;
  description: string;
  opposes: string;
}> = [
  { id: 'PARANOID', label: 'PARANOID', description: 'd6 complication on all scan/social pools', opposes: 'scan, social' },
  { id: 'RECKLESS', label: 'RECKLESS', description: 'd6 complication on all defend/flee pools', opposes: 'defend, flee' },
  { id: 'COLD', label: 'COLD', description: 'd6 complication on all NPC interaction (COOL) pools', opposes: 'COOL-based' },
  { id: 'OBSESSED', label: 'OBSESSED', description: 'd6 complication on all non-primary-style pools', opposes: 'off-style' },
];

function TraumaModal({ onSelect, existingTraumas }: {
  onSelect: (traumaId: string) => void;
  existingTraumas: string[];
}) {
  const available = TRAUMA_OPTIONS.filter(t => !existingTraumas.includes(t.id));

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 110,
        background: 'rgba(2,3,8,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'mud-fade-in 0.4s ease-out',
      }}
    >
      <SubstrateBackground opacity={0.3} />
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(10,10,10,0.8)',
        border: '2px solid rgba(255,68,68,0.4)',
        borderRadius: 4,
        position: 'relative', zIndex: 1,
        boxShadow: '0 0 40px rgba(255,30,30,0.15), 0 0 80px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          padding: '0.7rem 0.8rem',
          borderBottom: '1px solid rgba(255,68,68,0.2)',
          background: 'rgba(255,30,30,0.06)',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: '#ff4444', letterSpacing: '0.1em',
            textShadow: '0 0 10px rgba(255,68,68,0.5)',
          }}>
            STRESS OVERFLOW
          </div>
        </div>

        {/* Narrative */}
        <div style={{
          padding: '0.8rem',
          borderBottom: '1px solid rgba(255,68,68,0.1)',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: 'rgba(var(--phosphor-rgb),0.55)', lineHeight: 1.8,
            fontStyle: 'italic',
          }}>
            your signal fractures. something breaks that won{'\u2019'}t heal.
            <br />
            the pressure was too much. a piece of you rewrites itself
            <br />
            to survive. choose what you become.
          </div>
        </div>

        {/* Trauma options */}
        <div style={{ padding: '0.6rem' }}>
          {available.map(trauma => (
            <button
              key={trauma.id}
              onClick={() => onSelect(trauma.id)}
              style={{
                display: 'block', width: '100%',
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: '#ff6b6b', textAlign: 'left',
                background: 'rgba(255,30,30,0.03)',
                border: '1px solid rgba(255,68,68,0.2)',
                borderRadius: 3, padding: '0.5rem 0.7rem',
                marginBottom: '0.4rem', cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255,30,30,0.1)';
                (e.target as HTMLElement).style.borderColor = 'rgba(255,68,68,0.5)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255,30,30,0.03)';
                (e.target as HTMLElement).style.borderColor = 'rgba(255,68,68,0.2)';
              }}
            >
              <div style={{ fontWeight: 'bold', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
                {trauma.label}
              </div>
              <div style={{ color: 'rgba(var(--phosphor-rgb),0.45)', fontSize: '0.9em' }}>
                {trauma.description}
              </div>
            </button>
          ))}
          {available.length === 0 && (
            <div style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              color: '#ff4444', textAlign: 'center', padding: '1rem',
            }}>
              all traumas acquired. there{'\u2019'}s nothing left to break.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── FlatlineModal — Permadeath overlay ──────────────────────────────────────
// Displayed when HP reaches 0. Character is gone. REASSEMBLE to start over.
// ══════════════════════════════════════════════════════════════════════════════

interface FlatlineData {
  handle: string;
  subjectId: string;
  level: number;
  room: string;
}

function FlatlineModal({ data, onReassemble, onGhost }: {
  data: FlatlineData;
  onReassemble: () => void;
  onGhost: () => void;
}) {
  const [phase, setPhase] = useState(0);

  // Staggered reveal: 0=title, 1=body, 2=memorial, 3=button
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem',
    }}>
      {/* Vignette edges */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        boxShadow: 'inset 0 0 120px 40px rgba(255,20,20,0.08)',
      }} />
      <div style={{
        width: '100%', maxWidth: 380,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '1.2rem', position: 'relative', zIndex: 1,
        textAlign: 'center',
      }}>
        {/* FLATLINE title */}
        <div style={{
          fontFamily: 'monospace', fontWeight: 'bold',
          fontSize: 'clamp(1.6rem, 6vw, 2.2rem)',
          color: '#ff2222',
          letterSpacing: '0.15em',
          textShadow: '0 0 20px rgba(255,34,34,0.6), 0 0 60px rgba(255,34,34,0.3)',
          animation: 'flatline-pulse 2s ease-in-out infinite',
        }}>
          {'>>'} FLATLINE
        </div>

        {/* Body text */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
          }}>
            hp reached zero. the tunnels claim another.
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
          }}>
            your gear lies where you fell. permadeath is permanent.
          </div>
        </div>

        {/* Memorial line */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          fontFamily: 'monospace', fontSize: '0.7em',
          color: 'rgba(var(--phosphor-rgb),0.35)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0.6rem 0',
          width: '100%',
          letterSpacing: '0.04em',
        }}>
          {data.subjectId} {'\u2014'} LVL {data.level} {'\u2014'} signal lost at {data.room.replace(/_/g, ' ')}
        </div>

        {/* Ghost channel retained */}
        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 0.6s ease',
          fontFamily: 'monospace', fontSize: 'var(--text-base)',
          color: 'rgba(var(--phosphor-rgb),0.5)',
        }}>
          ghost channel access retained.
        </div>

        {/* Action buttons */}
        <div style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          marginTop: '0.5rem',
          display: 'flex', gap: '0.75rem',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          <button
            onClick={onGhost}
            style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              fontWeight: 'bold', letterSpacing: '0.1em',
              color: 'rgba(var(--phosphor-rgb),0.6)',
              background: 'rgba(var(--phosphor-rgb),0.03)',
              border: '1px solid rgba(var(--phosphor-rgb),0.15)',
              borderRadius: 3,
              padding: '0.55rem 1.4rem',
              cursor: 'pointer',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
            }}
            onPointerEnter={e => {
              e.currentTarget.style.background = 'rgba(var(--phosphor-rgb),0.08)';
              e.currentTarget.style.borderColor = 'rgba(var(--phosphor-rgb),0.3)';
              e.currentTarget.style.color = 'rgba(var(--phosphor-rgb),0.8)';
            }}
            onPointerLeave={e => {
              e.currentTarget.style.background = 'rgba(var(--phosphor-rgb),0.03)';
              e.currentTarget.style.borderColor = 'rgba(var(--phosphor-rgb),0.15)';
              e.currentTarget.style.color = 'rgba(var(--phosphor-rgb),0.6)';
            }}
          >
            [ GHOST CHANNEL ]
          </button>
          <button
            onClick={onReassemble}
            style={{
              fontFamily: 'monospace', fontSize: 'var(--text-header)',
              fontWeight: 'bold', letterSpacing: '0.12em',
              color: 'var(--phosphor-accent)',
              background: 'rgba(var(--phosphor-rgb),0.06)',
              border: '1px solid rgba(var(--phosphor-rgb),0.3)',
              borderRadius: 3,
              padding: '0.7rem 2rem',
              cursor: 'pointer',
              touchAction: 'manipulation',
              textShadow: '0 0 8px rgba(var(--phosphor-rgb),0.4)',
              boxShadow: '0 0 20px rgba(var(--phosphor-rgb),0.08)',
              transition: 'all 0.2s ease',
            }}
            onPointerEnter={e => {
              e.currentTarget.style.background = 'rgba(var(--phosphor-rgb),0.12)';
              e.currentTarget.style.borderColor = 'rgba(var(--phosphor-rgb),0.5)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(var(--phosphor-rgb),0.15)';
            }}
            onPointerLeave={e => {
              e.currentTarget.style.background = 'rgba(var(--phosphor-rgb),0.06)';
              e.currentTarget.style.borderColor = 'rgba(var(--phosphor-rgb),0.3)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(var(--phosphor-rgb),0.08)';
            }}
          >
            [ REASSEMBLE ]
          </button>
        </div>

        <style>{`
          @keyframes flatline-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MudHUDContainer — Self-contained scroll region ──────────────────────────
// Measures scroll parent to fill available viewport. Chat area scrolls
// independently; panels and status bar are fixed in place.
// ══════════════════════════════════════════════════════════════════════════════

export function MudHUDContainer({ session, children, handle, onSessionUpdate, addLocalMsg }: {
  session: MudSession;
  children: React.ReactNode;
  handle?: string;
  onSessionUpdate?: (s: MudSession) => void;
  addLocalMsg?: (node: React.ReactNode) => void;
}) {
  const data = getMudPanelData(session);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number>(0);
  const [panelMode, setPanelMode] = useState<PanelMode>('map');
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [npcQuestData, setNpcQuestData] = useState<{ npcId: string; npcName: string } | null>(null);
  const [examineData, setExamineData] = useState<ExamineData | null>(null);
  const [npcModalData, setNpcModalData] = useState<NPCModalPayload | null>(null);
  const [restModalData, setRestModalData] = useState<RestModalData | null>(null);
  const [sellModalData, setSellModalData] = useState<SellModalData | null>(null);
  const [flatlineData, setFlatlineData] = useState<FlatlineData | null>(null);
  const [traumaModalOpen, setTraumaModalOpen] = useState(false);
  const [showNofogMap, setShowNofogMap] = useState(false);
  const [showFogMap, setShowFogMap] = useState(false);
  const mapWasActiveRef = useRef(false);

  // Combat FX hook — shake + glitch on hits
  useCombatFX(containerRef);

  // Measure scroll parent to fill viewport + lock its scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollParent = el.closest('.shell-output') as HTMLElement;
    if (!scrollParent) return;

    // Lock the scroll parent — HUD owns the viewport now.
    // Chat area inside the HUD has its own overflow:auto.
    const prevOverflow = scrollParent.style.overflowY;
    const prevPadding = scrollParent.style.padding;
    scrollParent.style.overflowY = 'hidden';
    scrollParent.style.padding = '0';

    const measure = () => setAvailableHeight(scrollParent.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scrollParent);
    return () => {
      ro.disconnect();
      scrollParent.style.overflowY = prevOverflow;
      scrollParent.style.padding = prevPadding;
    };
  }, []);

  // Listen for panel mode changes from mudCommands
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (event: any) => {
      const mode = event?.payload?.mode as PanelMode | undefined;
      if (mode) setPanelMode(mode);
    };
    // Reset non-map modes on room change (shop/inventory close, map stays)
    const resetHandler = () => {
      setPanelMode(prev => prev === 'map' ? 'map' : 'default');
    };
    eventBus.on('mud:panel-mode', handler);
    eventBus.on('mud:panel-mode-reset-non-map', resetHandler);
    return () => {
      eventBus.off('mud:panel-mode', handler);
      eventBus.off('mud:panel-mode-reset-non-map', resetHandler);
    };
  }, []);

  // Listen for level-up modal trigger from /levelup command
  useEffect(() => {
    const handler = () => setShowLevelUpModal(true);
    eventBus.on('mud:open-levelup', handler);
    return () => { eventBus.off('mud:open-levelup', handler); };
  }, []);

  // Listen for help/quests/examine/rest/sell modal triggers
  useEffect(() => {
    const helpHandler = () => setShowHelpModal(true);
    const questsHandler = () => setShowQuestsModal(true);
    const inventoryHandler = () => setShowInventoryModal(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const npcQuestHandler = (event: any) => {
      const d = event?.payload as { npcId: string; npcName: string } | undefined;
      if (d?.npcId) setNpcQuestData({ npcId: d.npcId, npcName: d.npcName ?? d.npcId });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const examineHandler = (event: any) => {
      const d = event?.payload as ExamineData | undefined;
      if (d) setExamineData(d);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const npcModalHandler = (event: any) => {
      const d = event?.payload as NPCModalPayload | undefined;
      if (d) setNpcModalData(d);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const restHandler = (event: any) => {
      const d = event?.payload as RestModalData | undefined;
      if (d) setRestModalData(d);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sellHandler = (event: any) => {
      const d = event?.payload as SellModalData | undefined;
      if (d) setSellModalData(d);
    };
    eventBus.on('mud:open-help', helpHandler);
    eventBus.on('mud:open-quests', questsHandler);
    eventBus.on('mud:open-inventory', inventoryHandler);
    eventBus.on('mud:open-npc-quest', npcQuestHandler);
    eventBus.on('mud:open-examine', examineHandler);
    eventBus.on('mud:open-npc-modal', npcModalHandler);
    eventBus.on('mud:open-rest', restHandler);
    eventBus.on('mud:open-sell', sellHandler);
    return () => {
      eventBus.off('mud:open-help', helpHandler);
      eventBus.off('mud:open-quests', questsHandler);
      eventBus.off('mud:open-inventory', inventoryHandler);
      eventBus.off('mud:open-npc-quest', npcQuestHandler);
      eventBus.off('mud:open-examine', examineHandler);
      eventBus.off('mud:open-npc-modal', npcModalHandler);
      eventBus.off('mud:open-rest', restHandler);
      eventBus.off('mud:open-sell', sellHandler);
    };
  }, []);

  // Listen for flatline (player death) event
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (event: any) => {
      const d = event?.payload as FlatlineData | undefined;
      if (d) setFlatlineData(d);
    };
    const traumaHandler = () => setTraumaModalOpen(true);
    eventBus.on('mud:flatline', handler);
    eventBus.on('mud:open-trauma', traumaHandler);
    return () => {
      eventBus.off('mud:flatline', handler);
      eventBus.off('mud:open-trauma', traumaHandler);
    };
  }, []);

  // Listen for nofog map overlay events
  useEffect(() => {
    const openHandler = () => setShowNofogMap(true);
    const closeHandler = () => setShowNofogMap(false);
    const mapHandler = () => setShowFogMap(true);
    eventBus.on('mud:open-nofog', openHandler);
    eventBus.on('mud:close-nofog', closeHandler);
    eventBus.on('mud:open-map', mapHandler);
    return () => {
      eventBus.off('mud:open-nofog', openHandler);
      eventBus.off('mud:close-nofog', closeHandler);
      eventBus.off('mud:open-map', mapHandler);
    };
  }, []);

  // Save map state on combat start, restore on combat end
  const prevPhaseRef = useRef(session.phase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = session.phase;

    if (session.phase === 'combat' && prev !== 'combat') {
      // Entering combat — save map state
      mapWasActiveRef.current = panelMode === 'map';
      setPanelMode('default');
    } else if (prev === 'combat' && session.phase !== 'combat') {
      // Leaving combat — restore map if it was active
      if (mapWasActiveRef.current) {
        setPanelMode('map');
      }
    }
  }, [session.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll chat area to bottom
  const scrollChatToBottom = useCallback(() => {
    const el = chatRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  // Scroll chat so latest room entry is at top of chat panel (not page)
  const scrollChatToRoomEntry = useCallback(() => {
    const el = chatRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const entries = el.querySelectorAll('[data-room-entry]');
      if (entries.length > 0) {
        const last = entries[entries.length - 1] as HTMLElement;
        // Use getBoundingClientRect for precise relative offset
        const containerRect = el.getBoundingClientRect();
        const entryRect = last.getBoundingClientRect();
        el.scrollTop += entryRect.top - containerRect.top;
      }
    });
  }, []);

  // Track room changes — scroll to latest room entry
  const prevRoomRef = useRef(data?.currentRoomId);
  useEffect(() => {
    if (!data) return;
    if (prevRoomRef.current && prevRoomRef.current !== data.currentRoomId) {
      // Small delay to let the room output render first
      setTimeout(scrollChatToRoomEntry, 80);
    }
    prevRoomRef.current = data.currentRoomId;
  }, [data?.currentRoomId, scrollChatToRoomEntry]); // eslint-disable-line react-hooks/exhaustive-deps

  // MutationObserver for auto-scroll
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (isNearBottom) {
        scrollChatToBottom();
      }
    });

    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [scrollChatToBottom]);

  // Listen for shell:request-scroll events
  useEffect(() => {
    const handler = () => scrollChatToBottom();
    eventBus.on('shell:request-scroll', handler);
    return () => eventBus.off('shell:request-scroll', handler);
  }, [scrollChatToBottom]);

  // Scroll HUD into view on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // During character creation, render a minimal container with just the overlay
  if (!data && session.phase === 'character_creation') {
    return (
      <div
        ref={containerRef}
        style={{
          display: 'flex', flexDirection: 'column',
          height: availableHeight ? availableHeight - 10 : 'calc(100dvh - 10px)',
          overflow: 'hidden', background: '#020308',
          position: 'relative', marginTop: 10,
        }}
      >
        <SubstrateBackground opacity={0.4} config={{ tendrilCount: 56, sporeCount: 800, growFromEdges: true }} />
        {handle && onSessionUpdate && addLocalMsg && (
          <CreationOverlay
            session={session}
            setSession={onSessionUpdate}
            handle={handle}
            addLocalMsg={addLocalMsg}
          />
        )}
      </div>
    );
  }

  if (!data) return <>{children}</>;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: availableHeight ? availableHeight - 10 : 'calc(100dvh - 10px)',
        overflow: 'hidden',
        background: '#020308',
        position: 'relative',
        marginTop: 10,
      }}
    >
      <SubstrateBackground
        opacity={0.4}
        config={{ tendrilCount: 56, sporeCount: 800, growFromEdges: true }}
      />
      <HUDFXStyles />
      <CombatFXStyles />
      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <TopPanels data={data} panelMode={panelMode} />
      </div>

      <div
        ref={chatRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          padding: '0.35rem 0.5rem',
          position: 'relative', zIndex: 1,
        }}
      >
        {children}
        {/* Transient messages float above chat bottom */}
        <TransientMessageOverlay />
      </div>

      {/* Bottom section */}
      {data.inCombat ? (
        <div style={{
          flexShrink: 0,
          borderTop: `1px solid ${BORDER_COMBAT}`,
          background: BG_COMBAT,
          padding: '0.4rem 0.5rem',
          touchAction: 'none',
          position: 'relative', zIndex: 1,
        }}>
          <PlayerCard data={data} />
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <ActionBar
            inCombat={data.inCombat}
            panelMode={panelMode}
            showUpgrade={data.pendingLevelUps > 0 && data.isSafeZone}
            onUpgrade={() => setShowLevelUpModal(true)}
            onSkills={() => setShowSkillsModal(true)}
            onQuests={() => setShowQuestsModal(true)}
            onHelp={() => setShowHelpModal(true)}
            onInventory={() => setShowInventoryModal(true)}
            onMap={() => setShowFogMap(true)}
          />
          <BottomBar data={data} onStatsClick={() => setShowStatsModal(true)} />
        </div>
      )}

      {/* Level-up modal overlay */}
      {showLevelUpModal && session.character && (
        <LevelUpModal
          session={session}
          onClose={() => {
            setShowLevelUpModal(false);
            setTimeout(() => {
              eventBus.emit('mud:execute-command', { command: '/save' });
            }, 100);
          }}
        />
      )}

      {/* Skills modal */}
      {showSkillsModal && session.character && data && (
        <SkillsModal
          session={session}
          onClose={() => {
            setShowSkillsModal(false);
            // Trigger save to persist any skill purchases
            eventBus.emit('mud:execute-command', { command: '/save' });
          }}
        />
      )}

      {/* Stats modal */}
      {showStatsModal && data && (
        <StatsModal data={data} onClose={() => setShowStatsModal(false)} />
      )}

      {/* Help modal */}
      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}

      {/* Inventory modal */}
      {showInventoryModal && session.character && data && (
        <InventoryModal session={session} data={data} onClose={() => setShowInventoryModal(false)} />
      )}

      {/* Quests modal */}
      {showQuestsModal && session.character && (
        <QuestsModal session={session} onClose={() => setShowQuestsModal(false)} />
      )}

      {/* NPC Quest offer modal */}
      {npcQuestData && session.character && (
        <NPCQuestModal
          session={session}
          npcId={npcQuestData.npcId}
          npcName={npcQuestData.npcName}
          onClose={() => setNpcQuestData(null)}
        />
      )}

      {/* Examine modal */}
      {examineData && (
        <ExamineModal data={examineData} onClose={() => setExamineData(null)} />
      )}

      {/* NPC Interaction modal */}
      {npcModalData && session.character && data && (
        <NPCModal
          session={session}
          data={data}
          npc={npcModalData}
          onClose={() => setNpcModalData(null)}
        />
      )}

      {/* Rest modal */}
      {restModalData && (
        <RestModal
          data={restModalData}
          onClose={() => setRestModalData(null)}
        />
      )}

      {/* Sell modal */}
      {sellModalData && session.character && (
        <SellModal
          data={sellModalData}
          onClose={() => setSellModalData(null)}
          onConfirm={(result) => {
            const char = session.character!;
            let totalSold = 0;
            let totalValue = 0;
            // Sell items in reverse order to avoid index shifting
            for (const { item, qty } of result.items) {
              for (let i = 0; i < qty; i++) {
                const idx = char.inventory.findIndex(inv => inv.id === item.id);
                if (idx >= 0) {
                  const r = sellItem(char, sellModalData.shopkeeperId, idx);
                  if (r.success) {
                    totalSold++;
                    totalValue += r.price ?? 0;
                  }
                }
              }
            }
            saveCharacter(char.handle, char);
            setSellModalData(null);
            // Transient summary
            if (totalSold > 0) {
              eventBus.emit('mud:transient-message', {
                text: `sold ${totalSold} item${totalSold > 1 ? 's' : ''} for ${totalValue}c. balance: ${char.currency.creds}c`,
                type: 'commerce',
              });
            }
            eventBus.emit('crt:glitch-tier', { tier: 1, duration: 120 });
          }}
        />
      )}

      {/* Fog-of-war map modal (MAP button) */}
      {showFogMap && session.character && session.world && (
        <FogMap
          session={session}
          onClose={() => setShowFogMap(false)}
        />
      )}

      {/* Nofog world map overlay (debug) */}
      {showNofogMap && session.character && session.world && (
        <NofogMap
          session={session}
          onClose={() => setShowNofogMap(false)}
        />
      )}

      {/* Trauma selection modal */}
      {traumaModalOpen && session.character && (
        <TraumaModal
          existingTraumas={session.character.traumas ?? []}
          onSelect={(traumaId) => {
            const char = session.character!;
            char.traumas = [...(char.traumas ?? []), traumaId];
            char.stress = 0; // Reset stress after trauma
            saveCharacter(char.handle, char);
            setTraumaModalOpen(false);
            // Check for retirement (3rd trauma)
            if (char.traumas.length >= 3) {
              eventBus.emit('mud:flatline', {
                handle: char.handle,
                subjectId: char.subjectId,
                level: char.level,
                room: char.currentRoom,
              });
            }
          }}
        />
      )}

      {/* Flatline (death) modal */}
      {flatlineData && (
        <FlatlineModal
          data={flatlineData}
          onGhost={() => {
            setFlatlineData(null);
            // Exit MUD, return to ghost channel
            setTimeout(() => {
              eventBus.emit('mud:force-exit');
            }, 150);
          }}
          onReassemble={() => {
            setFlatlineData(null);
            // Directly start new character creation, bypassing trust/fragment gate
            setTimeout(() => {
              eventBus.emit('mud:reassemble');
            }, 150);
          }}
        />
      )}

      {/* Character creation overlay */}
      {session.phase === 'character_creation' && session.creation && handle && onSessionUpdate && addLocalMsg && (
        <CreationOverlay
          session={session}
          setSession={onSessionUpdate}
          handle={handle}
          addLocalMsg={addLocalMsg}
        />
      )}
    </div>
  );
}

// ── Legacy exports (kept for import compat — now no-ops) ────────────────────

export function MudPanelSystem({ session }: { session: MudSession }) {
  void session;
  return null;
}

export function MudStatusBar({ session }: { session: MudSession }) {
  void session;
  return null;
}
