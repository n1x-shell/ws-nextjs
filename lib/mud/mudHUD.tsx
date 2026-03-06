// lib/mud/mudHUD.tsx
// TUNNELCORE MUD — Persistent HUD Panel System
// Replaces scroll-based room info with persistent, data-driven panels.
// Layout: 2-column panel grid (2/3 + 1/3) → compass rose → chat → status bar.
// Contextual swaps: combat mode, shop mode, empty states.

import React from 'react';
import type {
  MudSession,
  MudCharacter,
  RoomNPC,
  RoomEnemy,
  RoomObject,
  RoomExit,
  Direction,
  CombatState,
  Combatant,
  Item,
  NPCType,
} from './types';
import {
  xpForLevel,
  LEVEL_CAP,
  getDispositionLabel,
} from './types';
import {
  getRoom,
  getZone,
  getVisibleExits,
} from './worldMap';
import {
  getAllLivingEnemies,
  getPlayerCombatant,
  isPlayersTurn,
  getAvailableHacks,
} from './combat';
import { getFormattedShop, type ShopListing } from './shopSystem';
import { getNPCRelation } from './persistence';
import { getActiveQuests } from './questEngine';
import { isNPCQuestGiver } from './npcEngine';
import { eventBus } from '@/lib/eventBus';

// ── Style constants (mirror mudCommands.tsx) ────────────────────────────────

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  glow:   'text-glow',
  accent: 'var(--phosphor-accent)',
};

const C = {
  green:     '#d4d4d4',
  accent:    'var(--phosphor-accent)',
  dim:       'rgba(var(--phosphor-rgb),0.75)',
  dimmer:    'rgba(var(--phosphor-rgb),0.55)',
  error:     '#ff6b6b',
  n1x:       '#bf00ff',
  npc:       '#fcd34d',
  enemy:     '#ff6b6b',
  object:    'rgba(var(--phosphor-rgb),0.85)',
  exit:      'var(--phosphor-accent)',
  safe:      '#a5f3fc',
  stat:      'var(--phosphor-green)',
  combat:    '#ff4444',
  combatHud: '#ff6b6b',
  heal:      '#4ade80',
  hack:      '#c084fc',
  quest:     '#fbbf24',
  shop:      '#fcd34d',
  label:     'rgba(var(--phosphor-rgb),0.8)',
  hint:      'rgba(var(--phosphor-rgb),0.65)',
};

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
  description: string;
  // Combat state (only available during combat)
  hp?: number;
  maxHp?: number;
  effects?: string[];
}

interface PanelObject {
  id: string;
  name: string;
  examineSnippet: string;
  lootable: boolean;
  interactable: boolean;
}

interface PanelExit {
  direction: Direction;
  label: string;
  locked: boolean;
  zoneTransition: boolean;
}

interface PanelData {
  // Room
  roomName: string;
  zoneName: string;
  isSafeZone: boolean;
  // Entities
  npcs: PanelNPC[];
  enemies: PanelEnemy[];
  objects: PanelObject[];
  exits: PanelExit[];
  // State
  inCombat: boolean;
  isPlayerTurn: boolean;
  shopkeeper: string | null; // NPC id if a shopkeeper is in this room
  shopItems: ShopListing[];
  // Combat details
  playerHp: number;
  playerMaxHp: number;
  playerRam: number;
  playerMaxRam: number;
  playerAP: number;
  combatRound: number;
  // Consumables (for combat use panel)
  consumables: Item[];
  // Quest indicators
  activeQuestCount: number;
  // Player stats (for status bar)
  hp: number;
  maxHp: number;
  ram: number;
  maxRam: number;
  xp: number;
  xpNext: number;
  level: number;
  creds: number;
  scrip: number;
  subjectId: string;
  isDead: boolean;
}

export function getMudPanelData(session: MudSession): PanelData | null {
  const char = session.character;
  if (!char) return null;

  const room = getRoom(char.currentRoom);
  if (!room) return null;

  const zone = getZone(room.zone);
  const visibleExits = getVisibleExits(char.currentRoom, char);
  const inCombat = session.phase === 'combat' && !!session.combat;

  // NPCs
  const npcs: PanelNPC[] = room.npcs.map(npc => {
    const rel = getNPCRelation(char.handle, npc.id);
    const disp = rel ? getDispositionLabel(rel.disposition) : 'NEUTRAL';
    return {
      id: npc.id,
      name: npc.name,
      type: npc.type,
      services: npc.services ?? [],
      disposition: disp,
      isQuestGiver: isNPCQuestGiver(npc.id),
      hasShop: npc.services?.includes('shop') ?? false,
    };
  });

  // Enemies (merge room data with combat state)
  const livingCombatants = inCombat && session.combat
    ? getAllLivingEnemies(session.combat)
    : [];

  const enemies: PanelEnemy[] = inCombat
    ? livingCombatants.map(c => ({
        id: c.id,
        name: c.name,
        level: 0, // combat doesn't track level directly
        description: '',
        hp: c.hp,
        maxHp: c.maxHp,
        effects: c.effects.map(e => e.name),
      }))
    : room.enemies.map(e => ({
        id: e.id,
        name: e.name,
        level: e.level,
        description: e.description.split('.')[0] + '.',
      }));

  // Objects (filter hidden)
  const objects: PanelObject[] = room.objects
    .filter(o =>
      !o.hidden || (o.hiddenRequirement && char.attributes[o.hiddenRequirement.attribute] >= o.hiddenRequirement.minimum)
    )
    .map(o => ({
      id: o.id,
      name: o.name,
      examineSnippet: o.examineText.split('.')[0] + '.',
      lootable: o.lootable ?? false,
      interactable: o.interactable ?? false,
    }));

  // Exits
  const exits: PanelExit[] = visibleExits.map(e => ({
    direction: e.direction,
    label: e.description.replace(/^[a-z]+ \(/, '(').replace(/\)$/, ')'),
    locked: e.locked ?? false,
    zoneTransition: e.zoneTransition ?? false,
  }));

  // Shop detection
  const shopNPC = npcs.find(n => n.hasShop);
  const shopItems = shopNPC && !inCombat
    ? (getFormattedShop(shopNPC.id, char) ?? [])
    : [];

  // Combat player state
  let playerAP = 0;
  let combatRound = 0;
  let isPlayerTurn = false;
  if (session.combat) {
    combatRound = session.combat.round;
    isPlayerTurn = isPlayersTurn(session.combat);
    const player = getPlayerCombatant(session.combat);
    if (player) playerAP = player.ap;
  }

  // Consumables from inventory
  const consumables = char.inventory.filter(
    i => i.category === 'consumable' && i.quantity > 0
  );

  // Quest count
  const world = session.world;
  const activeQuestCount = world ? getActiveQuests(world).length : 0;

  const nextXP = char.level < LEVEL_CAP ? xpForLevel(char.level + 1) : char.xp;

  return {
    roomName: room.name,
    zoneName: zone?.name ?? 'UNKNOWN',
    isSafeZone: room.isSafeZone,
    npcs,
    enemies,
    objects,
    exits,
    inCombat,
    isPlayerTurn,
    shopkeeper: shopNPC?.id ?? null,
    shopItems,
    playerHp: char.hp,
    playerMaxHp: char.maxHp,
    playerRam: char.ram,
    playerMaxRam: char.maxRam,
    playerAP,
    combatRound,
    consumables,
    activeQuestCount,
    hp: char.hp,
    maxHp: char.maxHp,
    ram: char.ram,
    maxRam: char.maxRam,
    xp: char.xp,
    xpNext: nextXP,
    level: char.level,
    creds: char.currency.creds,
    scrip: char.currency.scrip,
    subjectId: char.subjectId,
    isDead: char.isDead,
  };
}

// ── Shared UI atoms ─────────────────────────────────────────────────────────

function PanelBtn({ label, command, color, borderColor, small }: {
  label: string;
  command: string;
  color: string;
  borderColor: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        eventBus.emit('mud:execute-command', { command });
      }}
      style={{
        fontFamily: 'monospace',
        fontSize: small ? '0.65em' : '0.7em',
        lineHeight: 1,
        padding: small ? '0.15rem 0.3rem' : '0.2rem 0.4rem',
        minHeight: small ? 22 : 26,
        background: 'transparent',
        border: `1px solid ${borderColor}`,
        color,
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        transition: 'background 0.12s',
        touchAction: 'manipulation',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(var(--phosphor-rgb),0.08)'; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
    >
      {label}
    </button>
  );
}

function MiniBar({ pct, color, width = '100%' }: {
  pct: number; color: string; width?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{
      width, height: 4, background: 'rgba(var(--phosphor-rgb),0.08)',
      borderRadius: 1, overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        width: `${clamped}%`, height: '100%', background: color,
        boxShadow: `0 0 4px ${color}`, transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

function PanelHeader({ children, color, rightSlot }: {
  children: React.ReactNode;
  color: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '0.2rem', paddingBottom: '0.15rem',
      borderBottom: `1px solid rgba(var(--phosphor-rgb),0.1)`,
    }}>
      <span style={{
        fontFamily: 'monospace', fontSize: '0.7em', fontWeight: 'bold',
        color, letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        {children}
      </span>
      {rightSlot}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: 'monospace', fontSize: '0.7em', color: C.dimmer,
      fontStyle: 'italic', padding: '0.2rem 0',
    }}>
      {text}
    </div>
  );
}

// ── NPC Panel (left, 2/3 width) ─────────────────────────────────────────────

function NPCPanel({ npcs, inCombat, consumables, playerRam, playerMaxRam, isPlayerTurn, combatStyle }: {
  npcs: PanelNPC[];
  inCombat: boolean;
  consumables: Item[];
  playerRam: number;
  playerMaxRam: number;
  isPlayerTurn: boolean;
  combatStyle: string;
}) {
  // ── Combat mode: show combat actions + consumables ──
  if (inCombat) {
    const hasRam = playerMaxRam > 0;
    return (
      <div style={panelBoxStyle(true)}>
        <PanelHeader color={C.combat}>
          {isPlayerTurn ? '⚔ YOUR TURN' : '⚔ COMBAT'}
        </PanelHeader>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.3rem' }}>
          <PanelBtn label="ATTACK" command="/attack" color={C.enemy} borderColor="rgba(255,107,107,0.5)" />
          {hasRam && (
            <PanelBtn label="HACK" command="/hack" color={C.hack} borderColor="rgba(192,132,252,0.5)" />
          )}
          <PanelBtn label="SCAN" command="/scan" color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.35)" />
          <PanelBtn label="FLEE" command="/flee" color={C.dimmer} borderColor="rgba(var(--phosphor-rgb),0.25)" />
        </div>

        {/* RAM bar */}
        {hasRam && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4ch', marginBottom: '0.2rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.65em', color: C.hack, flexShrink: 0 }}>RAM</span>
            <MiniBar pct={(playerRam / playerMaxRam) * 100} color={C.hack} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.65em', color: C.hack, flexShrink: 0 }}>
              {playerRam}/{playerMaxRam}
            </span>
          </div>
        )}

        {/* Consumables */}
        {consumables.length > 0 && (
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.6em', color: C.label, marginTop: '0.15rem', marginBottom: '0.1rem' }}>
              ITEMS:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {consumables.map(item => (
                <PanelBtn
                  key={item.id}
                  label={`${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`}
                  command={`/use ${item.name}`}
                  color={C.heal}
                  borderColor="rgba(74,222,128,0.4)"
                  small
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Explore mode: NPC list ──
  return (
    <div style={panelBoxStyle(false)}>
      <PanelHeader color={C.npc}>
        NPCs
        {npcs.length > 0 && (
          <span style={{ fontWeight: 'normal', fontSize: '0.9em', opacity: 0.6 }}> ({npcs.length})</span>
        )}
      </PanelHeader>

      {npcs.length === 0 ? (
        <EmptyState text="no one here" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {npcs.map(npc => (
            <NPCEntry key={npc.id} npc={npc} />
          ))}
        </div>
      )}
    </div>
  );
}

function NPCEntry({ npc }: { npc: PanelNPC }) {
  const typeLabel = npc.type === 'QUESTGIVER' ? '?' : npc.type === 'SHOPKEEPER' ? '$' : npc.type === 'ALLIED' ? '+' : '·';
  const typeColor = npc.type === 'QUESTGIVER' ? C.quest : npc.type === 'SHOPKEEPER' ? C.shop : C.npc;

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4ch',
        fontFamily: 'monospace', fontSize: '0.75em',
      }}>
        <span style={{ color: typeColor, fontWeight: 'bold', width: '1.2ch', textAlign: 'center', flexShrink: 0 }}>
          {typeLabel}
        </span>
        <span style={{ color: C.npc, fontWeight: 'bold' }}>{npc.name}</span>
        <span style={{ color: C.dimmer, fontSize: '0.85em' }}>
          {npc.disposition !== 'NEUTRAL' ? ` [${npc.disposition}]` : ''}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '0.25rem', paddingLeft: '1.6ch', marginTop: '0.1rem', flexWrap: 'wrap' }}>
        <PanelBtn label="TALK" command="/talk hello" color={C.npc} borderColor="rgba(252,211,77,0.35)" small />
        {npc.hasShop && (
          <PanelBtn label="SHOP" command="/shop" color={C.shop} borderColor="rgba(252,211,77,0.35)" small />
        )}
        {npc.isQuestGiver && (
          <PanelBtn label="QUEST" command="/quests" color={C.quest} borderColor="rgba(251,191,36,0.35)" small />
        )}
      </div>
    </div>
  );
}

// ── Objects Panel (right top) ───────────────────────────────────────────────

function ObjectsPanel({ objects, inCombat }: {
  objects: PanelObject[];
  inCombat: boolean;
}) {
  // During combat: hide objects panel (not interactive)
  if (inCombat) return null;

  return (
    <div style={panelBoxStyle(false)}>
      <PanelHeader color={C.object}>OBJECTS</PanelHeader>
      {objects.length === 0 ? (
        <EmptyState text="nothing notable" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {objects.map(obj => (
            <div
              key={obj.id}
              role="button"
              tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` }); }}
              style={{
                fontFamily: 'monospace', fontSize: '0.7em', color: C.object,
                cursor: 'pointer', touchAction: 'manipulation',
                borderBottom: '1px dotted rgba(var(--phosphor-rgb),0.12)',
                paddingBottom: '0.1rem',
                transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--phosphor-green)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.object; }}
            >
              {obj.name}
              {obj.lootable && <span style={{ color: C.quest, marginLeft: '0.3ch' }}>⬡</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hostiles / Shop / Combat Enemy Panel (right bottom) ─────────────────────

function ContextPanel({ enemies, shopItems, shopkeeper, inCombat, creds }: {
  enemies: PanelEnemy[];
  shopItems: ShopListing[];
  shopkeeper: string | null;
  inCombat: boolean;
  creds: number;
}) {
  // ── Combat: enemy HP bars ──
  if (inCombat && enemies.length > 0) {
    return (
      <div style={panelBoxStyle(true)}>
        <PanelHeader color={C.enemy}>HOSTILES</PanelHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {enemies.map(e => {
            const hpPct = e.maxHp && e.maxHp > 0 ? (e.hp! / e.maxHp) * 100 : 100;
            return (
              <div key={e.id}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: 'monospace', fontSize: '0.7em',
                }}>
                  <span style={{ color: C.enemy, fontWeight: 'bold' }}>{e.name}</span>
                  <span style={{ color: C.enemy, fontSize: '0.85em' }}>
                    {e.hp !== undefined ? `${e.hp}/${e.maxHp}` : '???'}
                  </span>
                </div>
                <MiniBar pct={hpPct} color="#ff4444" />
                {e.effects && e.effects.length > 0 && (
                  <div style={{ fontFamily: 'monospace', fontSize: '0.6em', color: C.hack, marginTop: '0.05rem' }}>
                    [{e.effects.join(', ')}]
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                  <PanelBtn label="ATK" command={`/attack ${e.name}`} color={C.enemy} borderColor="rgba(255,107,107,0.4)" small />
                  <PanelBtn label="SCAN" command={`/scan ${e.name}`} color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.3)" small />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Shop mode: shopkeeper present, no combat ──
  if (shopkeeper && shopItems.length > 0 && !inCombat) {
    return (
      <div style={panelBoxStyle(false)}>
        <PanelHeader color={C.shop} rightSlot={
          <span style={{ fontFamily: 'monospace', fontSize: '0.65em', color: '#fcd34d' }}>
            {creds}¢
          </span>
        }>
          SHOP
        </PanelHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {shopItems.slice(0, 5).map(item => (
            <div key={item.templateId} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: 'monospace', fontSize: '0.65em',
            }}>
              <span
                role="button"
                tabIndex={0}
                onClick={() => eventBus.emit('mud:execute-command', { command: `/buy ${item.name.toLowerCase()}` })}
                onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/buy ${item.name.toLowerCase()}` }); }}
                style={{
                  color: creds >= (item.price ?? 0) ? C.shop : C.dimmer,
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70%',
                }}
              >
                {item.name}
              </span>
              <span style={{ color: C.dimmer, flexShrink: 0 }}>
                {item.price !== null ? `${item.price}¢` : '—'}
              </span>
            </div>
          ))}
          {shopItems.length > 5 && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: '/shop' })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: '/shop' }); }}
              style={{ fontFamily: 'monospace', fontSize: '0.6em', color: C.dimmer, cursor: 'pointer', fontStyle: 'italic' }}
            >
              +{shopItems.length - 5} more...
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Explore: hostile presence ──
  if (enemies.length > 0 && !inCombat) {
    return (
      <div style={panelBoxStyle(false)}>
        <PanelHeader color={C.enemy}>HOSTILES</PanelHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
          {enemies.map(e => (
            <div key={e.id} style={{
              fontFamily: 'monospace', fontSize: '0.7em',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ color: C.enemy }}>{e.name}</span>
              <span style={{ color: C.dimmer }}>Lv.{e.level}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──
  return null;
}

// ── Compass Rose ────────────────────────────────────────────────────────────

const DIR_LABELS: Record<Direction, string> = {
  north: 'N', south: 'S', east: 'E', west: 'W',
  up: 'UP', down: 'DN', in: 'IN', out: 'OUT',
};

function CompassRose({ exits, inCombat }: { exits: PanelExit[]; inCombat: boolean }) {
  if (inCombat) return null; // can't move during combat

  const exitSet = new Set(exits.map(e => e.direction));
  const hasVertical = exitSet.has('up') || exitSet.has('down');
  const hasInOut = exitSet.has('in') || exitSet.has('out');

  function ExitBtn({ dir }: { dir: Direction }) {
    const available = exitSet.has(dir);
    const exitData = exits.find(e => e.direction === dir);
    const locked = exitData?.locked ?? false;

    return (
      <button
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
        title={exitData ? `${dir}: ${exitData.label}${locked ? ' [LOCKED]' : ''}${exitData.zoneTransition ? ' [ZONE]' : ''}` : dir}
        style={{
          fontFamily: 'monospace',
          fontSize: '0.65em',
          fontWeight: 'bold',
          lineHeight: 1,
          width: dir === 'up' || dir === 'down' || dir === 'in' || dir === 'out' ? 28 : 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: available
            ? locked ? 'rgba(255,107,107,0.08)' : 'rgba(var(--phosphor-rgb),0.06)'
            : 'transparent',
          border: available
            ? `1px solid ${locked ? 'rgba(255,107,107,0.4)' : 'rgba(var(--phosphor-rgb),0.25)'}`
            : '1px solid rgba(var(--phosphor-rgb),0.08)',
          color: available
            ? locked ? '#ff6b6b' : 'var(--phosphor-accent)'
            : 'rgba(var(--phosphor-rgb),0.15)',
          cursor: available ? 'pointer' : 'default',
          touchAction: 'manipulation',
          transition: 'background 0.12s, box-shadow 0.15s',
          borderRadius: 2,
          padding: 0,
        }}
        onMouseEnter={(e) => {
          if (available) (e.target as HTMLElement).style.background = 'rgba(var(--phosphor-rgb),0.12)';
        }}
        onMouseLeave={(e) => {
          if (available) (e.target as HTMLElement).style.background = locked ? 'rgba(255,107,107,0.08)' : 'rgba(var(--phosphor-rgb),0.06)';
        }}
      >
        {locked ? '🔒' : DIR_LABELS[dir]}
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.6rem',
      padding: '0.3rem 0',
      borderTop: '1px solid rgba(var(--phosphor-rgb),0.08)',
      borderBottom: '1px solid rgba(var(--phosphor-rgb),0.08)',
      background: 'rgba(0,0,0,0.15)',
    }}>
      {/* Compass grid: 3x3 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 24px)',
        gridTemplateRows: 'repeat(3, 24px)',
        gap: 2,
        justifyItems: 'center',
        alignItems: 'center',
      }}>
        {/* Row 1 */}
        <div />{/* top-left empty */}
        <ExitBtn dir="north" />
        <div />{/* top-right empty */}
        {/* Row 2 */}
        <ExitBtn dir="west" />
        <div style={{
          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontSize: '0.55em', color: 'rgba(var(--phosphor-rgb),0.2)',
        }}>
          ◆
        </div>
        <ExitBtn dir="east" />
        {/* Row 3 */}
        <div />{/* bottom-left empty */}
        <ExitBtn dir="south" />
        <div />{/* bottom-right empty */}
      </div>

      {/* Vertical + in/out (side stack) */}
      {(hasVertical || hasInOut) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {exitSet.has('up') && <ExitBtn dir="up" />}
          {exitSet.has('down') && <ExitBtn dir="down" />}
          {exitSet.has('in') && <ExitBtn dir="in" />}
          {exitSet.has('out') && <ExitBtn dir="out" />}
        </div>
      )}

      {/* Room label (right of compass) */}
      <div style={{
        fontFamily: 'monospace', fontSize: '0.6em', color: C.dimmer,
        maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {exits.filter(e => !e.locked).length} exit{exits.filter(e => !e.locked).length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ── Status Bar (compact, bottom) ────────────────────────────────────────────

function StatusBar({ data }: { data: PanelData }) {
  const hpPct = data.maxHp > 0 ? (data.hp / data.maxHp) * 100 : 0;
  const xpPct = data.xpNext > 0 ? (data.xp / data.xpNext) * 100 : 100;

  const hpColor = hpPct > 60 ? 'var(--phosphor-green)' : hpPct > 25 ? '#fbbf24' : '#ff4444';
  const borderColor = data.inCombat ? 'rgba(255,68,68,0.35)' : 'rgba(var(--phosphor-rgb),0.12)';

  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: S.base,
      padding: '0.3rem 0.5rem',
      borderTop: `1px solid ${borderColor}`,
      background: data.inCombat ? 'rgba(255,20,20,0.04)' : 'rgba(0,0,0,0.2)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(var(--phosphor-rgb),1) 1px, rgba(var(--phosphor-rgb),1) 2px)',
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>

        {/* Row 1: HP bar + level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch' }}>
          <span style={{ color: C.dim, fontSize: '0.75em', width: '2ch', flexShrink: 0, textAlign: 'right' }}>HP</span>
          <div style={{ flex: 1 }}>
            <MiniBar pct={hpPct} color={hpColor} />
          </div>
          <span style={{ color: hpColor, fontSize: '0.75em', flexShrink: 0, minWidth: '5ch', textAlign: 'right' }}>
            {data.hp}/{data.maxHp}
          </span>
          <span style={{ color: C.dim, fontSize: '0.7em', marginLeft: '0.3ch' }}>·</span>
          <span style={{ color: 'var(--phosphor-accent)', fontSize: '0.75em', fontWeight: 'bold', flexShrink: 0 }}>
            Lv.{data.level}
          </span>
        </div>

        {/* Row 2: Location · Currency · Combat state */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4ch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4ch', overflow: 'hidden' }}>
            <span style={{ color: C.dimmer, fontSize: '0.7em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {data.zoneName} — {data.roomName}
            </span>
            {data.isSafeZone && (
              <span style={{
                color: C.safe, fontSize: '0.6em',
                border: '1px solid rgba(165,243,252,0.3)', padding: '0 0.25em',
                borderRadius: 2, lineHeight: 1.3, flexShrink: 0,
              }}>SAFE</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.6ch', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fcd34d', fontSize: '0.75em' }}>{data.creds}¢</span>
            {data.scrip > 0 && <span style={{ color: '#a78bfa', fontSize: '0.75em' }}>{data.scrip}s</span>}
            {data.inCombat && (
              <span style={{
                color: '#ff4444', fontWeight: 'bold', fontSize: '0.75em',
                textShadow: '0 0 6px rgba(255,68,68,0.5)',
              }}>
                ⚔ R{data.combatRound}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Panel box style helper ──────────────────────────────────────────────────

function panelBoxStyle(combatTint: boolean): React.CSSProperties {
  return {
    padding: '0.3rem 0.4rem',
    background: combatTint ? 'rgba(255,20,20,0.03)' : 'rgba(var(--phosphor-rgb),0.02)',
    borderRadius: 2,
    overflow: 'hidden',
    minHeight: 0,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Main Panel System Component ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export function MudPanelSystem({ session }: { session: MudSession }) {
  const data = getMudPanelData(session);
  if (!data) return null;

  const char = session.character;
  const combatStyle = char?.combatStyle ?? 'CHROME';

  // Right column: objects on top, context panel on bottom.
  // During combat, objects panel is hidden → context panel takes full height.
  const showObjects = !data.inCombat && data.objects.length > 0;
  const showContext = data.inCombat || data.enemies.length > 0 || (data.shopkeeper && data.shopItems.length > 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      fontFamily: 'monospace',
      fontSize: S.base,
      flexShrink: 0,
    }}>

      {/* ── Room header ── */}
      <div style={{
        padding: '0.2rem 0.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(var(--phosphor-rgb),0.1)',
        background: data.inCombat ? 'rgba(255,20,20,0.04)' : 'rgba(0,0,0,0.15)',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '0.75em', fontWeight: 'bold',
          color: data.inCombat ? C.combat : 'var(--phosphor-accent)',
          letterSpacing: '0.04em',
        }}
          className={S.glow}
        >
          {data.zoneName} — {data.roomName}
        </span>
        {data.activeQuestCount > 0 && (
          <span
            role="button"
            tabIndex={0}
            onClick={() => eventBus.emit('mud:execute-command', { command: '/quests' })}
            onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: '/quests' }); }}
            style={{
              fontFamily: 'monospace', fontSize: '0.6em', color: C.quest,
              border: '1px solid rgba(251,191,36,0.35)', padding: '0 0.3em',
              borderRadius: 2, cursor: 'pointer', touchAction: 'manipulation',
            }}
          >
            {data.activeQuestCount} QUEST{data.activeQuestCount > 1 ? 'S' : ''}
          </span>
        )}
      </div>

      {/* ── Panel grid (2/3 + 1/3) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showContext || showObjects ? '2fr 1fr' : '1fr',
        gap: '1px',
        background: 'rgba(var(--phosphor-rgb),0.06)',
        maxHeight: '35vh',
        overflow: 'auto',
      }}>
        {/* Left: NPCs or Combat Actions */}
        <NPCPanel
          npcs={data.npcs}
          inCombat={data.inCombat}
          consumables={data.consumables}
          playerRam={data.playerRam}
          playerMaxRam={data.playerMaxRam}
          isPlayerTurn={data.isPlayerTurn}
          combatStyle={combatStyle}
        />

        {/* Right column */}
        {(showContext || showObjects) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {showObjects && (
              <ObjectsPanel objects={data.objects} inCombat={data.inCombat} />
            )}
            {showContext && (
              <ContextPanel
                enemies={data.enemies}
                shopItems={data.shopItems}
                shopkeeper={data.shopkeeper}
                inCombat={data.inCombat}
                creds={data.creds}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Compass Rose ── */}
      <CompassRose exits={data.exits} inCombat={data.inCombat} />

      {/* ── Status Bar rendered separately below chat area ── */}
    </div>
  );
}

// Export StatusBar separately — it renders below the chat scroll
export function MudStatusBar({ session }: { session: MudSession }) {
  const data = getMudPanelData(session);
  if (!data) return null;
  return <StatusBar data={data} />;
}
