// lib/mud/mudHUD.tsx
// TUNNELCORE MUD — Persistent HUD Panel System (v3)
// Self-contained flex container that owns its own scroll region.
// Layout: room header → 2-col grid (2/3 + 1/3) → compass → [chat scrolls here] → status bar.
// No position:sticky — the container fills the viewport and manages internal scroll.

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  hack:      '#d8b4fe',
  quest:     '#fbbf24',
  shop:      '#fcd34d',
  label:     'rgba(var(--phosphor-rgb),0.8)',
  xp:        '#ff69b4',
};

const BG_PANEL = '#0a0a0a';
const BG_COMBAT = '#0d0808';
const BORDER = 'rgba(var(--phosphor-rgb),0.15)';
const BORDER_COMBAT = 'rgba(255,68,68,0.25)';

// ── Panel mode type ─────────────────────────────────────────────────────────

export type PanelMode = 'default' | 'inventory' | 'shop';

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
  handle: string;
  inventory: Item[];
  gear: Array<{ slot: string; item: Item }>;
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

  const gearEntries = Object.entries(char.gear)
    .filter(([_, item]) => item != null)
    .map(([slot, item]) => ({ slot, item: item! }));

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
    handle: char.handle,
    inventory: char.inventory,
    gear: gearEntries,
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
        fontFamily: 'monospace', fontSize: 'var(--text-base)', lineHeight: 1,
        padding: small ? '0.15rem 0.3rem' : '0.2rem 0.4rem',
        minHeight: small ? 24 : 28, background: 'transparent',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4ch', fontFamily: 'monospace', fontSize: 'var(--text-base)' }}>
                  <span style={{ color: iconColor, fontWeight: 'bold', width: '1.2ch', textAlign: 'center' }}>{icon}</span>
                  <span style={{ color: C.npc, fontWeight: 'bold' }}>{npc.name}</span>
                  {npc.disposition !== 'NEUTRAL' && (
                    <span style={{ color: C.faint, fontSize: '9px' }}>[{npc.disposition}]</span>
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
        <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
          {objects.map(obj => (
            <div key={obj.id}
              role="button" tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: `/examine ${obj.name}` }); }}
              style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.object,
                cursor: 'pointer', touchAction: 'manipulation',
                padding: '0.05rem 0', transition: 'color 0.12s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--phosphor-green)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.object; }}
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
      <div style={{ padding: '0.15rem 0.35rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', maxHeight: '30vh', overflowY: 'auto' }}>
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
                  {isQuest && <span style={{ color: C.quest, fontSize: '9px' }}>QUEST</span>}
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
          {enemies.map(e => {
            const hpPct = e.maxHp && e.maxHp > 0 ? ((e.hp ?? 0) / e.maxHp) * 100 : 100;
            return (
              <div key={e.id}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 'var(--text-base)',
                }}>
                  <span style={{ color: C.enemy, fontWeight: 'bold' }}>{e.name}</span>
                  <span style={{ color: C.enemy, fontSize: 'var(--text-base)' }}>
                    {e.hp !== undefined ? `${e.hp}/${e.maxHp}` : '???'}
                  </span>
                </div>
                <Bar pct={hpPct} color="#ff4444" />
                {e.effects && e.effects.length > 0 && (
                  <div style={{ fontFamily: 'monospace', fontSize: '9px', color: C.hack }}>
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
  const hpKnown = enemy.hp !== undefined && enemy.maxHp !== undefined;
  const hpPct = hpKnown && enemy.maxHp! > 0 ? ((enemy.hp ?? 0) / enemy.maxHp!) * 100 : 0;

  return (
    <div style={{
      borderLeft: '2px solid rgba(255,68,68,0.35)',
      background: 'rgba(255,30,30,0.05)',
      padding: compact ? '0.25rem 0.4rem' : '0.35rem 0.5rem',
      borderRadius: '0 2px 2px 0',
    }}>
      {/* Title: name + level */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'monospace', fontSize: 'var(--text-base)',
        marginBottom: '0.1rem',
      }}>
        <span style={{ color: C.enemy, fontWeight: 'bold', letterSpacing: '0.04em' }}>
          {enemy.name}
        </span>
        <span style={{ color: C.faint, fontSize: compact ? '0.8em' : 'var(--text-base)' }}>
          {enemy.level > 0 ? `Lv.${enemy.level}` : ''}
        </span>
      </div>

      {/* HP bar or ??? */}
      {hpKnown ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch', marginBottom: '0.15rem' }}>
          <span style={{ color: C.faint, fontSize: 'var(--text-base)', width: '2ch', flexShrink: 0, textAlign: 'right' }}>HP</span>
          <div style={{ flex: 1 }}><Bar pct={hpPct} color="#ff4444" height={4} /></div>
          <span style={{ color: C.enemy, fontSize: 'var(--text-base)', flexShrink: 0, minWidth: '5ch', textAlign: 'right' }}>
            {enemy.hp}/{enemy.maxHp}
          </span>
        </div>
      ) : (
        <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint, marginBottom: '0.15rem' }}>
          HP ???
        </div>
      )}

      {/* Effects */}
      {enemy.effects && enemy.effects.length > 0 && (
        <div style={{ fontFamily: 'monospace', fontSize: '9px', color: C.hack, marginBottom: '0.15rem' }}>
          {enemy.effects.map(eff => `[${eff.toUpperCase()}]`).join(' ')}
        </div>
      )}

      {/* Per-enemy action buttons */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        <Btn label="ATK" command={`/attack ${enemy.name}`} color={C.enemy} borderColor="rgba(255,107,107,0.5)" small />
        {hasRam && <Btn label="HACK" command={`/hack short_circuit`} color={C.hack} borderColor="rgba(192,132,252,0.5)" small />}
        <Btn label="SCAN" command={`/scan ${enemy.name}`} color={C.accent} borderColor="rgba(var(--phosphor-rgb),0.35)" small />
      </div>
    </div>
  );
}

function PlayerCard({ data }: { data: PanelData }) {
  const hpPct = data.maxHp > 0 ? (data.hp / data.maxHp) * 100 : 0;
  const hpColor = hpPct > 60 ? 'var(--phosphor-green)' : hpPct > 25 ? '#fbbf24' : '#ff4444';
  const xpPct = data.xpNext > 0 ? (data.xp / data.xpNext) * 100 : 100;
  const hasRam = data.playerMaxRam > 0;
  const ramPct = hasRam ? (data.playerRam / data.playerMaxRam) * 100 : 0;

  return (
    <div style={{
      borderLeft: '2px solid rgba(var(--phosphor-rgb),0.3)',
      background: 'rgba(var(--phosphor-rgb),0.03)',
      padding: '0.3rem 0.5rem',
    }}>
      {/* Title: turn indicator + identity */}
      <div style={{
        fontFamily: 'monospace', fontSize: 'var(--text-base)',
        fontWeight: 'bold', marginBottom: '0.2rem',
        color: data.isPlayerTurn ? 'var(--phosphor-accent)' : C.dim,
        textShadow: data.isPlayerTurn ? '0 0 6px var(--phosphor-accent)' : 'none',
        letterSpacing: '0.04em',
      }} className={data.isPlayerTurn ? S.glow : undefined}>
        {data.isPlayerTurn ? '\u2694 YOUR TURN' : 'COMBAT'} {'\u2014'} {data.handle} ({data.subjectId})
      </div>

      {/* HP bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch', marginBottom: '0.15rem' }}>
        <span style={{ color: C.dim, fontSize: 'var(--text-base)', width: '2ch', flexShrink: 0, textAlign: 'right' }}>HP</span>
        <div style={{ flex: 1 }}><Bar pct={hpPct} color={hpColor} height={4} /></div>
        <span style={{ color: hpColor, fontSize: 'var(--text-base)', flexShrink: 0, minWidth: '5ch', textAlign: 'right' }}>
          {data.hp}/{data.maxHp}
        </span>
        <span style={{ color: C.faint, fontSize: 'var(--text-base)' }}>{'\u00b7'}</span>
        <span style={{ color: 'var(--phosphor-accent)', fontSize: 'var(--text-base)', fontWeight: 'bold', flexShrink: 0 }}>
          Lv.{data.level}
        </span>
      </div>

      {/* XP bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch', marginBottom: '0.15rem' }}>
        <span style={{ color: C.dim, fontSize: 'var(--text-base)', width: '2ch', flexShrink: 0, textAlign: 'right' }}>XP</span>
        <div style={{ flex: 1 }}><Bar pct={xpPct} color={C.xp} height={3} /></div>
        <span style={{ color: C.xp, fontSize: 'var(--text-base)', flexShrink: 0, minWidth: '5ch', textAlign: 'right' }}>
          {data.xp}/{data.xpNext}
        </span>
      </div>

      {/* RAM bar (only if has RAM) */}
      {hasRam && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch', marginBottom: '0.15rem' }}>
          <span style={{ color: C.dim, fontSize: 'var(--text-base)', width: '2ch', flexShrink: 0, textAlign: 'right' }}>RM</span>
          <div style={{ flex: 1 }}><Bar pct={ramPct} color={C.hack} height={3} /></div>
          <span style={{ color: C.hack, fontSize: 'var(--text-base)', flexShrink: 0, minWidth: '5ch', textAlign: 'right' }}>
            {data.playerRam}/{data.playerMaxRam}
          </span>
        </div>
      )}

      {/* Bottom row: currency + FLEE */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: '0.15rem', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.5ch', alignItems: 'center', fontFamily: 'monospace', fontSize: 'var(--text-base)' }}>
          <span style={{ color: '#fcd34d' }}>{data.creds}{'\u00a2'}</span>
          {data.scrip > 0 && <span style={{ color: '#a78bfa' }}>{data.scrip}s</span>}
        </div>
        <Btn label="FLEE" command="/flee" color={C.dimmer} borderColor="rgba(var(--phosphor-rgb),0.25)" small />
      </div>

      {/* Consumables */}
      {data.consumables.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.2rem' }}>
          {data.consumables.map(item => (
            <Btn key={item.id}
              label={`${item.name}${item.quantity > 1 ? ' \u00d7' + item.quantity : ''}`}
              command={`/use ${item.name}`}
              color={C.heal} borderColor="rgba(74,222,128,0.4)" small />
          ))}
        </div>
      )}
    </div>
  );
}

function CombatPanels({ data }: { data: PanelData }) {
  const hasRam = data.playerMaxRam > 0;
  const useGrid = data.enemies.length >= 4;

  return (
    <div style={{
      flexShrink: 0,
      background: BG_COMBAT,
      borderBottom: `1px solid ${BORDER_COMBAT}`,
    }}>
      {/* Combat header */}
      <div style={{
        padding: '0.2rem 0.5rem',
        borderBottom: `1px solid ${BORDER_COMBAT}`,
        background: 'rgba(255,20,20,0.06)',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
          color: C.combat, letterSpacing: '0.06em',
          textShadow: '0 0 8px rgba(255,68,68,0.4)',
        }} className={S.glow}>
          {'\u2694'} COMBAT {'\u2014'} Round {data.combatRound}
        </span>
      </div>

      {/* Enemy cards — stacked or 2-col grid for 4+ */}
      <div style={{
        padding: '0.3rem 0.4rem',
        ...(useGrid ? {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.25rem',
        } : {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '0.25rem',
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
  up: 'UP', down: 'DN', in: 'IN', out: 'OUT',
};

function CompassRose({ exits, inCombat }: { exits: PanelExit[]; inCombat: boolean }) {
  if (inCombat) return null;

  const exitSet = new Set(exits.map(e => e.direction));
  const hasVertical = exitSet.has('up') || exitSet.has('down');
  const hasInOut = exitSet.has('in') || exitSet.has('out');

  const SZ = 28;

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
          fontFamily: 'monospace', fontSize: 'var(--text-base)', fontWeight: 'bold', lineHeight: 1,
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
          fontFamily: 'monospace', fontSize: '8px', color: 'rgba(var(--phosphor-rgb),0.15)',
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
        fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint,
        maxWidth: '35%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {exits.filter(e => !e.locked).length} exit{exits.filter(e => !e.locked).length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Status Bar ──────────────────────────────────────────────────────────────
// Row 1: HP [bar] val · Lv.N
// Row 2: XP [bar] val · creds scrip · combat
// ══════════════════════════════════════════════════════════════════════════════

function StatusBar({ data }: { data: PanelData }) {
  const hpPct = data.maxHp > 0 ? (data.hp / data.maxHp) * 100 : 0;
  const hpColor = hpPct > 60 ? 'var(--phosphor-green)' : hpPct > 25 ? '#fbbf24' : '#ff4444';
  const xpPct = data.xpNext > 0 ? (data.xp / data.xpNext) * 100 : 100;

  return (
    <div style={{
      fontFamily: 'monospace', fontSize: S.base,
      padding: '0.2rem 0.5rem',
      borderTop: `1px solid ${data.inCombat ? BORDER_COMBAT : BORDER}`,
      background: data.inCombat ? BG_COMBAT : BG_PANEL,
      position: 'relative',
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(var(--phosphor-rgb),1) 1px, rgba(var(--phosphor-rgb),1) 2px)',
      }} />

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {/* Row 1: HP + level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch' }}>
          <span style={{ color: C.dim, fontSize: 'var(--text-base)', width: '2ch', flexShrink: 0, textAlign: 'right' }}>HP</span>
          <div style={{ flex: 1 }}><Bar pct={hpPct} color={hpColor} height={4} /></div>
          <span style={{ color: hpColor, fontSize: 'var(--text-base)', flexShrink: 0, minWidth: '5ch', textAlign: 'right' }}>
            {data.hp}/{data.maxHp}
          </span>
          <span style={{ color: C.faint, fontSize: 'var(--text-base)' }}>{'\u00b7'}</span>
          <span style={{ color: 'var(--phosphor-accent)', fontSize: 'var(--text-base)', fontWeight: 'bold', flexShrink: 0 }}>
            Lv.{data.level}
          </span>
        </div>

        {/* Row 2: XP + Currency + Combat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5ch' }}>
          <span style={{ color: C.dim, fontSize: 'var(--text-base)', width: '2ch', flexShrink: 0, textAlign: 'right' }}>XP</span>
          <div style={{ flex: 1 }}><Bar pct={xpPct} color={C.xp} height={4} /></div>
          <span style={{ color: C.xp, fontSize: 'var(--text-base)', flexShrink: 0, minWidth: '5ch', textAlign: 'right' }}>
            {data.xp}/{data.xpNext}
          </span>
          <span style={{ color: C.faint, fontSize: 'var(--text-base)' }}>{'\u00b7'}</span>
          <span style={{ color: '#fcd34d', fontSize: 'var(--text-base)', flexShrink: 0 }}>{data.creds}{'\u00a2'}</span>
          {data.scrip > 0 && <span style={{ color: '#a78bfa', fontSize: 'var(--text-base)', flexShrink: 0 }}>{data.scrip}s</span>}
          {data.inCombat && (
            <span style={{
              color: '#ff4444', fontWeight: 'bold', fontSize: 'var(--text-base)',
              textShadow: '0 0 6px rgba(255,68,68,0.5)',
            }}>{'\u2694'} R{data.combatRound}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Top Panels (room header + grid + compass) ───────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function TopPanels({ data, panelMode }: { data: PanelData; panelMode: PanelMode }) {
  // Combat mode — completely different layout
  if (data.inCombat) return <CombatPanels data={data} />;

  const isShopMode = panelMode === 'shop' && !data.inCombat;
  const isInvMode = panelMode === 'inventory' && !data.inCombat;

  const showRightTop = !data.inCombat;
  const showRightBottom = !isShopMode && (
    data.inCombat || data.enemies.length > 0 ||
    (data.shopkeeper !== null && data.shopItems.length > 0 && panelMode === 'default')
  );
  const showRight = showRightTop || showRightBottom;

  return (
    <div style={{
      flexShrink: 0,
      background: data.inCombat ? BG_COMBAT : BG_PANEL,
      borderBottom: `1px solid ${data.inCombat ? BORDER_COMBAT : BORDER}`,
    }}>
      {/* Room header */}
      <div style={{
        padding: '0.15rem 0.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${data.inCombat ? BORDER_COMBAT : BORDER}`,
        background: data.inCombat ? 'rgba(255,20,20,0.06)' : 'rgba(var(--phosphor-rgb),0.03)',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
          color: data.inCombat ? C.combat : 'var(--phosphor-accent)',
          letterSpacing: '0.04em',
        }} className={S.glow}>
          {data.zoneName} {'\u2014'} {data.roomName}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {data.isSafeZone && (
            <span style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.safe,
              border: '1px solid rgba(165,243,252,0.3)', padding: '0 0.25em',
              borderRadius: 2, lineHeight: 1.3,
            }}>SAFE</span>
          )}
          {data.activeQuestCount > 0 && (
            <span role="button" tabIndex={0}
              onClick={() => eventBus.emit('mud:execute-command', { command: '/quests' })}
              onKeyDown={(e) => { if (e.key === 'Enter') eventBus.emit('mud:execute-command', { command: '/quests' }); }}
              style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.quest,
                border: '1px solid rgba(251,191,36,0.35)', padding: '0 0.25em',
                borderRadius: 2, cursor: 'pointer', touchAction: 'manipulation',
              }}
            >
              {data.activeQuestCount}Q
            </span>
          )}
        </div>
      </div>

      {/* Panel grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showRight ? '2fr 1fr' : '1fr',
        background: data.inCombat ? BG_COMBAT : BG_PANEL,
      }}>
        {isShopMode ? (
          <ShopStockPanel
            shopItems={data.shopItems}
            shopkeeperName={data.npcs.find(n => n.hasShop)?.name ?? 'VENDOR'}
            creds={data.creds}
          />
        ) : (
          <LeftPanel
            npcs={data.npcs} inCombat={data.inCombat}
            consumables={data.consumables}
            playerRam={data.playerRam} playerMaxRam={data.playerMaxRam}
            isPlayerTurn={data.isPlayerTurn}
          />
        )}

        {showRight && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            borderLeft: `1px solid ${data.inCombat ? BORDER_COMBAT : BORDER}`,
          }}>
            {showRightTop && (
              isInvMode ? (
                <InventoryPanel inventory={data.inventory} gear={data.gear} />
              ) : isShopMode ? (
                <ShopPlayerPanel inventory={data.inventory} />
              ) : (
                <ObjectsPanel objects={data.objects} />
              )
            )}
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

      <CompassRose exits={data.exits} inCombat={data.inCombat} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── MudHUDContainer — Self-contained scroll region ──────────────────────────
// Measures scroll parent to fill available viewport. Chat area scrolls
// independently; panels and status bar are fixed in place.
// ══════════════════════════════════════════════════════════════════════════════

export function MudHUDContainer({ session, children }: {
  session: MudSession;
  children: React.ReactNode;
}) {
  const data = getMudPanelData(session);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number>(0);
  const [panelMode, setPanelMode] = useState<PanelMode>('default');

  // Measure scroll parent to fill viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollParent = el.closest('.shell-output') as HTMLElement;
    if (!scrollParent) return;

    const measure = () => setAvailableHeight(scrollParent.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scrollParent);
    return () => ro.disconnect();
  }, []);

  // Listen for panel mode changes from mudCommands
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (event: any) => {
      const mode = event?.payload?.mode as PanelMode | undefined;
      if (mode) setPanelMode(mode);
    };
    eventBus.on('mud:panel-mode', handler);
    return () => eventBus.off('mud:panel-mode', handler);
  }, []);

  // Reset panel mode on combat start
  useEffect(() => {
    if (session.phase === 'combat') {
      setPanelMode('default');
    }
  }, [session.phase]);

  // Auto-scroll chat area to bottom
  const scrollChatToBottom = useCallback(() => {
    const el = chatRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, []);

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

  if (!data) return <>{children}</>;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: availableHeight || '100dvh',
        overflow: 'hidden',
        background: data.inCombat ? BG_COMBAT : BG_PANEL,
      }}
    >
      <TopPanels data={data} panelMode={panelMode} />

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
        }}
      >
        {children}
      </div>

      {/* Bottom bar — PlayerCard in combat, StatusBar in explore */}
      {data.inCombat ? (
        <div style={{
          flexShrink: 0,
          borderTop: `1px solid ${BORDER_COMBAT}`,
          background: BG_COMBAT,
          padding: '0.2rem 0.4rem',
        }}>
          <PlayerCard data={data} />
        </div>
      ) : (
        <StatusBar data={data} />
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
