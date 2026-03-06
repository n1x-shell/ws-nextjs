// lib/mud/mudHUD.tsx
// TUNNELCORE MUD — Persistent HUD Panel System (v2)
// Sticky panels that pin to scroll viewport edges.
// Layout: room header → 2-col grid (2/3 + 1/3) → compass → [chat scrolls here] → status bar.
// Panels use opaque backgrounds so chat content scrolls behind them.

import React from 'react';
import type {
  MudSession,
  Direction,
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
} from './combat';
import { getFormattedShop, type ShopListing } from './shopSystem';
import { getNPCRelation } from './persistence';
import { getActiveQuests } from './questEngine';
import { isNPCQuestGiver } from './npcEngine';
import { eventBus } from '@/lib/eventBus';

// ── Style constants ─────────────────────────────────────────────────────────

const S = {
  base:   'var(--text-base)',
  glow:   'text-glow',
};

const C = {
  accent:    'var(--phosphor-accent)',
  dim:       'rgba(var(--phosphor-rgb),0.75)',
  dimmer:    'rgba(var(--phosphor-rgb),0.55)',
  faint:     'rgba(var(--phosphor-rgb),0.35)',
  npc:       '#fcd34d',
  enemy:     '#ff6b6b',
  object:    'rgba(var(--phosphor-rgb),0.85)',
  safe:      '#a5f3fc',
  combat:    '#ff4444',
  heal:      '#4ade80',
  hack:      '#c084fc',
  quest:     '#fbbf24',
  shop:      '#fcd34d',
  label:     'rgba(var(--phosphor-rgb),0.8)',
};

// Opaque backgrounds — critical for sticky positioning.
// Content scrolls behind these; transparency would show chat text bleeding through.
const BG_PANEL = '#0a0a0a';
const BG_COMBAT = '#0d0808';
const BORDER = 'rgba(var(--phosphor-rgb),0.15)';
const BORDER_COMBAT = 'rgba(255,68,68,0.25)';

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

  const enemies: PanelEnemy[] = inCombat
    ? livingCombatants.map(c => ({
        id: c.id, name: c.name, level: 0,
        hp: c.hp, maxHp: c.maxHp,
        effects: c.effects.map(e => e.name),
      }))
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

  return {
    roomName: room.name, zoneName: zone?.name ?? 'UNKNOWN', isSafeZone: room.isSafeZone,
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
      onClick={(e) => { e.stopPropagation(); eventBus.emit('mud:execute-command', { command }); }}
      style={{
        fontFamily: 'monospace', fontSize: small ? '0.6em' : '0.65em', lineHeight: 1,
        padding: small ? '0.12rem 0.25rem' : '0.18rem 0.35rem',
        minHeight: small ? 20 : 24, background: 'transparent',
        border: `1px solid ${borderColor}`, color, cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: '0.04em',
        transition: 'background 0.12s', touchAction: 'manipulation', whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(var(--phosphor-rgb),0.08)'; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
    >
      {label}
    </button>
  );
}

function Bar({ pct, color, width = '100%', height = 3 }: {
  pct: number; color: string; width?: string; height?: number;
}) {
  return (
    <div style={{
      width, height, background: 'rgba(var(--phosphor-rgb),0.08)',
      borderRadius: 1, overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{
        width: `${Math.max(0, Math.min(100, pct))}%`, height: '100%',
        background: color, boxShadow: `0 0 4px ${color}`,
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}

// Panel title bar — clear bordered header for each panel section
function TitleBar({ children, color, borderColor, rightSlot }: {
  children: React.ReactNode; color: string; borderColor: string; rightSlot?: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.15rem 0.35rem',
      background: 'rgba(var(--phosphor-rgb),0.04)',
      borderBottom: `1px solid ${borderColor}`,
    }}>
      <span style={{
        fontFamily: 'monospace', fontSize: '0.6em', fontWeight: 'bold',
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
      fontFamily: 'monospace', fontSize: '0.65em', color: C.faint,
      fontStyle: 'italic', padding: '0.15rem 0.35rem',
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
        <div style={{ padding: '0.25rem 0.35rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.2rem' }}>
            <Btn label="ATTACK" command="/attack" color={C.enemy} borderColor="rgba(255,107,107,0.5)" />
            {hasRam && <Btn label="HACK" command="/hack" color={C.hack} borderColor="rgba(192,132,252,0.5)" />}
            <Btn label="SCAN" command="/scan" color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.35)" />
            <Btn label="FLEE" command="/flee" color={C.dimmer} borderColor="rgba(var(--phosphor-rgb),0.25)" />
          </div>
          {hasRam && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4ch', marginBottom: '0.15rem' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.6em', color: C.hack, flexShrink: 0 }}>RAM</span>
              <Bar pct={(playerRam / playerMaxRam) * 100} color={C.hack} />
              <span style={{ fontFamily: 'monospace', fontSize: '0.6em', color: C.hack, flexShrink: 0 }}>
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
        NPCs {npcs.length > 0 && <span style={{ opacity: 0.5, fontWeight: 'normal' }}>({npcs.length})</span>}
      </TitleBar>
      {npcs.length === 0 ? (
        <Empty text="no one here" />
      ) : (
        <div style={{ padding: '0.2rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {npcs.map(npc => {
            const icon = npc.type === 'QUESTGIVER' ? '?' : npc.type === 'SHOPKEEPER' ? '$' : npc.type === 'ALLIED' ? '+' : '\u00b7';
            const iconColor = npc.type === 'QUESTGIVER' ? C.quest : npc.type === 'SHOPKEEPER' ? C.shop : C.npc;
            return (
              <div key={npc.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4ch', fontFamily: 'monospace', fontSize: '0.7em' }}>
                  <span style={{ color: iconColor, fontWeight: 'bold', width: '1.2ch', textAlign: 'center' }}>{icon}</span>
                  <span style={{ color: C.npc, fontWeight: 'bold' }}>{npc.name}</span>
                  {npc.disposition !== 'NEUTRAL' && (
                    <span style={{ color: C.faint, fontSize: '0.85em' }}>[{npc.disposition}]</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.2rem', paddingLeft: '1.6ch', marginTop: '0.05rem', flexWrap: 'wrap' }}>
                  <Btn label="TALK" command="/talk hello" color={C.npc} borderColor="rgba(252,211,77,0.3)" small />
                  {npc.hasShop && <Btn label="SHOP" command="/shop" color={C.shop} borderColor="rgba(252,211,77,0.3)" small />}
                  {npc.isQuestGiver && <Btn label="QUEST" command="/quests" color={C.quest} borderColor="rgba(251,191,36,0.3)" small />}
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
// ── Right-Top: Objects ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ObjectsPanel({ objects }: { objects: PanelObject[] }) {
  return (
    <div>
      <TitleBar color={C.object} borderColor={BORDER}>OBJECTS</TitleBar>
      {objects.length === 0 ? (
        <Empty text="nothing notable" />
      ) : (
        <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {objects.map(obj => (
            <div key={obj.id}
              role="button" tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` }); }}
              style={{
                fontFamily: 'monospace', fontSize: '0.65em', color: C.object,
                cursor: 'pointer', touchAction: 'manipulation',
                padding: '0.05rem 0', transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--phosphor-green)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.object; }}
            >
              {obj.name}
              {obj.lootable && <span style={{ color: C.quest, marginLeft: '0.3ch', fontSize: '0.9em' }}>{'\u2b21'}</span>}
            </div>
          ))}
        </div>
      )}
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
  // Combat: enemy HP bars
  if (inCombat && enemies.length > 0) {
    return (
      <div>
        <TitleBar color={C.enemy} borderColor={BORDER_COMBAT}>HOSTILES</TitleBar>
        <div style={{ padding: '0.2rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {enemies.map(e => {
            const hpPct = e.maxHp && e.maxHp > 0 ? ((e.hp ?? 0) / e.maxHp) * 100 : 100;
            return (
              <div key={e.id}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.65em',
                }}>
                  <span style={{ color: C.enemy, fontWeight: 'bold' }}>{e.name}</span>
                  <span style={{ color: C.enemy, fontSize: '0.9em' }}>
                    {e.hp !== undefined ? `${e.hp}/${e.maxHp}` : '???'}
                  </span>
                </div>
                <Bar pct={hpPct} color="#ff4444" />
                {e.effects && e.effects.length > 0 && (
                  <div style={{ fontFamily: 'monospace', fontSize: '0.55em', color: C.hack }}>
                    [{e.effects.join(', ')}]
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.1rem' }}>
                  <Btn label="ATK" command={`/attack ${e.name}`} color={C.enemy} borderColor="rgba(255,107,107,0.4)" small />
                  <Btn label="SCAN" command={`/scan ${e.name}`} color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.3)" small />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Shop mode
  if (shopkeeper && shopItems.length > 0 && !inCombat) {
    return (
      <div>
        <TitleBar color={C.shop} borderColor={BORDER} rightSlot={
          <span style={{ fontFamily: 'monospace', fontSize: '0.55em', color: '#fcd34d' }}>{creds}{'\u00a2'}</span>
        }>
          SHOP
        </TitleBar>
        <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {shopItems.slice(0, 5).map(item => (
            <div key={item.templateId} style={{
              display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.6em',
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
              style={{ fontFamily: 'monospace', fontSize: '0.55em', color: C.faint, cursor: 'pointer', fontStyle: 'italic' }}
            >
              +{shopItems.length - 5} more...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Explore: hostile presence
  if (enemies.length > 0) {
    return (
      <div>
        <TitleBar color={C.enemy} borderColor={BORDER}>HOSTILES</TitleBar>
        <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {enemies.map(e => (
            <div key={e.id} style={{
              display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.65em',
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
// ── Compass Rose ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const DIR_LABELS: Record<Direction, string> = {
  north: 'N', south: 'S', east: 'E', west: 'W',
  up: 'UP', down: 'DN', in: 'IN', out: 'OUT',
};

function CompassRose({ exits, inCombat }: { exits: PanelExit[]; inCombat: boolean }) {
  if (inCombat) return null;

  const exitSet = new Set(exits.map(e => e.direction));
  const hasVertical = exitSet.has('up') || exitSet.has('down');
  const hasInOut = exitSet.has('in') || exitSet.has('out');

  const SZ = 22;

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
        title={exitData ? `${dir}: ${exitData.label}${locked ? ' [LOCKED]' : ''}` : dir}
        style={{
          fontFamily: 'monospace', fontSize: '0.55em', fontWeight: 'bold', lineHeight: 1,
          width: (dir === 'up' || dir === 'down' || dir === 'in' || dir === 'out') ? SZ + 6 : SZ,
          height: SZ, display: 'flex', alignItems: 'center', justifyContent: 'center',
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
          touchAction: 'manipulation', transition: 'background 0.12s', borderRadius: 2, padding: 0,
        }}
        onMouseEnter={(e) => { if (available) (e.target as HTMLElement).style.background = 'rgba(var(--phosphor-rgb),0.12)'; }}
        onMouseLeave={(e) => { if (available) (e.target as HTMLElement).style.background = locked ? 'rgba(255,107,107,0.08)' : 'rgba(var(--phosphor-rgb),0.06)'; }}
      >
        {locked ? '\ud83d\udd12' : DIR_LABELS[dir]}
      </button>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.5rem', padding: '0.2rem 0',
      borderTop: `1px solid ${BORDER}`,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${SZ}px)`,
        gridTemplateRows: `repeat(3, ${SZ}px)`,
        gap: 2, justifyItems: 'center', alignItems: 'center',
      }}>
        <div />
        <ExitBtn dir="north" />
        <div />
        <ExitBtn dir="west" />
        <div style={{
          width: SZ, height: SZ, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontSize: '0.5em', color: 'rgba(var(--phosphor-rgb),0.15)',
        }}>{'\u25c6'}</div>
        <ExitBtn dir="east" />
        <div />
        <ExitBtn dir="south" />
        <div />
      </div>

      {(hasVertical || hasInOut) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {exitSet.has('up') && <ExitBtn dir="up" />}
          {exitSet.has('down') && <ExitBtn dir="down" />}
          {exitSet.has('in') && <ExitBtn dir="in" />}
          {exitSet.has('out') && <ExitBtn dir="out" />}
        </div>
      )}

      <div style={{
        fontFamily: 'monospace', fontSize: '0.55em', color: C.faint,
        maxWidth: '35%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {exits.filter(e => !e.locked).length} exit{exits.filter(e => !e.locked).length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Status Bar (sticky bottom) ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function StatusBar({ data }: { data: PanelData }) {
  const hpPct = data.maxHp > 0 ? (data.hp / data.maxHp) * 100 : 0;
  const hpColor = hpPct > 60 ? 'var(--phosphor-green)' : hpPct > 25 ? '#fbbf24' : '#ff4444';

  return (
    <div style={{
      fontFamily: 'monospace', fontSize: S.base,
      padding: '0.2rem 0.5rem',
      borderTop: `1px solid ${data.inCombat ? BORDER_COMBAT : BORDER}`,
      background: data.inCombat ? BG_COMBAT : BG_PANEL,
      position: 'relative',
    }}>
      {/* Scanline */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(var(--phosphor-rgb),1) 1px, rgba(var(--phosphor-rgb),1) 2px)',
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {/* Row 1: HP + level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch' }}>
          <span style={{ color: C.dim, fontSize: '0.7em', width: '2ch', flexShrink: 0, textAlign: 'right' }}>HP</span>
          <div style={{ flex: 1 }}><Bar pct={hpPct} color={hpColor} height={4} /></div>
          <span style={{ color: hpColor, fontSize: '0.7em', flexShrink: 0, minWidth: '5ch', textAlign: 'right' }}>
            {data.hp}/{data.maxHp}
          </span>
          <span style={{ color: C.faint, fontSize: '0.65em' }}>{'\u00b7'}</span>
          <span style={{ color: 'var(--phosphor-accent)', fontSize: '0.7em', fontWeight: 'bold', flexShrink: 0 }}>
            Lv.{data.level}
          </span>
        </div>

        {/* Row 2: Location + Currency */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.3ch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4ch', overflow: 'hidden' }}>
            <span style={{ color: C.faint, fontSize: '0.65em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {data.zoneName} {'\u2014'} {data.roomName}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5ch', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fcd34d', fontSize: '0.7em' }}>{data.creds}{'\u00a2'}</span>
            {data.scrip > 0 && <span style={{ color: '#a78bfa', fontSize: '0.7em' }}>{data.scrip}s</span>}
            {data.inCombat && (
              <span style={{
                color: '#ff4444', fontWeight: 'bold', fontSize: '0.7em',
                textShadow: '0 0 6px rgba(255,68,68,0.5)',
              }}>{'\u2694'} R{data.combatRound}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Exports ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export function MudPanelSystem({ session }: { session: MudSession }) {
  const data = getMudPanelData(session);
  if (!data) return null;

  const showRightTop = !data.inCombat;
  const showRightBottom = data.inCombat || data.enemies.length > 0 || (data.shopkeeper !== null && data.shopItems.length > 0);
  const showRight = showRightTop || showRightBottom;

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: data.inCombat ? BG_COMBAT : BG_PANEL,
      borderBottom: `1px solid ${data.inCombat ? BORDER_COMBAT : BORDER}`,
      flexShrink: 0,
    }}>
      {/* ── Room header ── */}
      <div style={{
        padding: '0.15rem 0.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${data.inCombat ? BORDER_COMBAT : BORDER}`,
        background: data.inCombat ? 'rgba(255,20,20,0.06)' : 'rgba(var(--phosphor-rgb),0.03)',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: '0.7em', fontWeight: 'bold',
          color: data.inCombat ? C.combat : 'var(--phosphor-accent)',
          letterSpacing: '0.04em',
        }} className={S.glow}>
          {data.zoneName} {'\u2014'} {data.roomName}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {data.isSafeZone && (
            <span style={{
              fontFamily: 'monospace', fontSize: '0.55em', color: C.safe,
              border: '1px solid rgba(165,243,252,0.3)', padding: '0 0.25em',
              borderRadius: 2, lineHeight: 1.3,
            }}>SAFE</span>
          )}
          {data.activeQuestCount > 0 && (
            <span role="button" tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: '/quests' })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: '/quests' }); }}
              style={{
                fontFamily: 'monospace', fontSize: '0.55em', color: C.quest,
                border: '1px solid rgba(251,191,36,0.35)', padding: '0 0.25em',
                borderRadius: 2, cursor: 'pointer', touchAction: 'manipulation',
              }}
            >
              {data.activeQuestCount}Q
            </span>
          )}
        </div>
      </div>

      {/* ── Panel grid (2fr + 1fr) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showRight ? '2fr 1fr' : '1fr',
        background: data.inCombat ? BG_COMBAT : BG_PANEL,
      }}>
        {/* Left */}
        <LeftPanel
          npcs={data.npcs} inCombat={data.inCombat}
          consumables={data.consumables}
          playerRam={data.playerRam} playerMaxRam={data.playerMaxRam}
          isPlayerTurn={data.isPlayerTurn}
        />

        {/* Right column */}
        {showRight && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            borderLeft: `1px solid ${data.inCombat ? BORDER_COMBAT : BORDER}`,
          }}>
            {showRightTop && <ObjectsPanel objects={data.objects} />}
            {showRightTop && showRightBottom && (
              <div style={{ borderTop: `1px solid ${BORDER}` }} />
            )}
            {showRightBottom && (
              <ContextPanel
                enemies={data.enemies} shopItems={data.shopItems}
                shopkeeper={data.shopkeeper} inCombat={data.inCombat}
                creds={data.creds}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Compass Rose ── */}
      <CompassRose exits={data.exits} inCombat={data.inCombat} />
    </div>
  );
}

export function MudStatusBar({ session }: { session: MudSession }) {
  const data = getMudPanelData(session);
  if (!data) return null;
  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
    }}>
      <StatusBar data={data} />
    </div>
  );
}
