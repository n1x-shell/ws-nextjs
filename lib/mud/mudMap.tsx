// lib/mud/mudMap.tsx
// TUNNELCORE MUD — Dungeon Map Panel
// Layout engine + renderer. Zelda-style room grid, CRT phosphor aesthetic.
// Renders in the left 2/3 panel slot via PanelMode='map'.

import React, { useMemo } from 'react';
import type { Direction } from './types';
import { getRoom, getZone, getAllRoomsInZone } from './worldMap';
import { loadWorld } from './persistence';
import { eventBus } from '@/lib/eventBus';

// ── Types ──────────────────────────────────────────────────────────────────

interface MapCell {
  roomId: string; name: string; gridX: number; gridY: number;
  visited: boolean; current: boolean; isSafeZone: boolean;
  hasEnemies: boolean; hasNPCs: boolean; isHidden: boolean;
  exits: Array<{ direction: Direction; targetRoomId: string; locked: boolean; zoneTransition: boolean }>;
}
interface MapConnection {
  fromX: number; fromY: number; toX: number; toY: number;
  locked: boolean; zoneTransition: boolean;
}
interface MapData {
  zoneName: string; zoneId: string; cells: MapCell[];
  gridWidth: number; gridHeight: number; connections: MapConnection[];
}

// ── Direction helpers ──────────────────────────────────────────────────────

const DIR_OFF: Partial<Record<Direction, { dx: number; dy: number }>> = {
  north: { dx: 0, dy: -1 }, south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 }, west: { dx: -1, dy: 0 },
  northeast: { dx: 1, dy: -1 }, northwest: { dx: -1, dy: -1 },
  southeast: { dx: 1, dy: 1 }, southwest: { dx: -1, dy: 1 },
};
const OPP: Record<string, Direction> = {
  north: 'south', south: 'north', east: 'west', west: 'east',
  northeast: 'southwest', southwest: 'northeast',
  northwest: 'southeast', southeast: 'northwest',
  up: 'down', down: 'up', in: 'out', out: 'in',
};

function taken(pos: Map<string, { x: number; y: number }>, x: number, y: number): boolean {
  for (const p of pos.values()) if (p.x === x && p.y === y) return true;
  return false;
}

function resolve(pos: Map<string, { x: number; y: number }>, bx: number, by: number, dx: number, dy: number) {
  let x = bx + dx, y = by + dy;
  if (!taken(pos, x, y)) return { x, y };
  // Cross-axis spread: when moving horizontally (dy===0), spread on y; when vertical, spread on x
  const cx = dx === 0 ? 1 : 0;
  const cy = dy === 0 ? 1 : 0;
  for (let s = 1; s <= 6; s++) {
    if (!taken(pos, x + cx * s, y + cy * s)) return { x: x + cx * s, y: y + cy * s };
    if (!taken(pos, x - cx * s, y - cy * s)) return { x: x - cx * s, y: y - cy * s };
  }
  for (let r = 2; r <= 8; r++)
    for (let oy = -r; oy <= r; oy++)
      for (let ox = -r; ox <= r; ox++)
        if (!taken(pos, bx + ox, by + oy)) return { x: bx + ox, y: by + oy };
  return { x: bx + 10, y: by };
}

// ── Explicit grid hints per zone ────────────────────────────────────────────
// Hand-crafted positions for zones with hub-and-spoke topology.
// Key: roomId -> { x, y } in grid coordinates.

const ZONE_GRID_HINTS: Record<string, Record<string, { x: number; y: number }>> = {
  z08: {
    //            col:  0     1     2     3     4
    // row 0:                       r05
    // row 1:                       r04
    // row 2:     r06         r09   r03   r10         r11
    // row 3:     r07                                  r12
    // row 4:     r08         r02         r13          r14
    // row 5:                 r01

    z08_r05: { x: 2, y: 0 },  // Deep Gate (north end)
    z08_r04: { x: 2, y: 1 },  // North Channel
    z08_r06: { x: 0, y: 2 },  // Pump Room (west branch)
    z08_r09: { x: 1, y: 2 },  // West Overflow
    z08_r03: { x: 2, y: 2 },  // THE JUNCTION (hub)
    z08_r10: { x: 3, y: 2 },  // Storage Chambers
    z08_r11: { x: 4, y: 2 },  // Elder's Chamber (east branch)
    z08_r07: { x: 0, y: 3 },  // Memorial Alcove (west branch)
    z08_r12: { x: 4, y: 3 },  // East Passage (east branch)
    z08_r08: { x: 0, y: 4 },  // The Clinic (west branch)
    z08_r02: { x: 2, y: 4 },  // The Narrows
    z08_r13: { x: 3, y: 4 },  // The Seep
    z08_r14: { x: 4, y: 4 },  // Signal Hollow (hidden, east branch)
    z08_r01: { x: 2, y: 5 },  // South Entry (south end)
  },
};

// ── Layout Engine ──────────────────────────────────────────────────────────

type Edge = { target: string; direction: Direction; locked: boolean; zt: boolean };

export function generateMapData(currentRoomId: string, visitedRooms: Set<string>, zoneId: string): MapData | null {
  const zone = getZone(zoneId);
  if (!zone) return null;
  const allRooms = getAllRoomsInZone(zoneId);
  if (!allRooms.length) return null;

  const gridHints = ZONE_GRID_HINTS[zoneId];

  // Build forward/reverse edge maps (same-zone exits only)
  const fwd = new Map<string, Edge[]>(), rev = new Map<string, Edge[]>();
  for (const room of allRooms) {
    if (!fwd.has(room.id)) fwd.set(room.id, []);
    for (const ex of room.exits) {
      if (ex.targetRoom.split('_')[0] !== zoneId) continue;
      const dir = ex.direction;
      fwd.get(room.id)!.push({ target: ex.targetRoom, direction: dir, locked: ex.locked ?? false, zt: false });
      if (!rev.has(ex.targetRoom)) rev.set(ex.targetRoom, []);
      rev.get(ex.targetRoom)!.push({ target: room.id, direction: OPP[dir] as Direction, locked: ex.locked ?? false, zt: false });
    }
  }

  // ── Place rooms ──────────────────────────────────────────────────────────

  const pos = new Map<string, { x: number; y: number }>();

  if (gridHints) {
    // ── Hint-based placement: use explicit positions for all hinted rooms ──
    for (const room of allRooms) {
      const hint = gridHints[room.id];
      if (hint) pos.set(room.id, { x: hint.x, y: hint.y });
    }
    // Fallback: any room without a hint gets BFS-placed relative to a hinted neighbor
    for (const room of allRooms.filter(r => !pos.has(r.id))) {
      for (const ex of room.exits) {
        if (!pos.has(ex.targetRoom) || !DIR_OFF[ex.direction]) continue;
        const tp = pos.get(ex.targetRoom)!;
        const ro = DIR_OFF[OPP[ex.direction] as Direction];
        if (!ro) continue;
        let nx = tp.x + ro.dx, ny = tp.y + ro.dy;
        if (taken(pos, nx, ny)) ({ x: nx, y: ny } = resolve(pos, tp.x + ro.dx, tp.y + ro.dy, ro.dx, ro.dy));
        pos.set(room.id, { x: nx, y: ny });
        break;
      }
    }
  } else {
    // ── BFS-based placement (original algorithm, fixed resolve) ──────────
    const start = allRooms.find(r => r.id === currentRoomId) ? currentRoomId : allRooms[0].id;
    pos.set(start, { x: 0, y: 0 });
    const q = [start];
    while (q.length) {
      const rid = q.shift()!;
      const p = pos.get(rid)!;
      for (const e of (fwd.get(rid) ?? [])) {
        if (pos.has(e.target) || !DIR_OFF[e.direction]) continue;
        const off = DIR_OFF[e.direction]!;
        let nx = p.x + off.dx, ny = p.y + off.dy;
        if (taken(pos, nx, ny)) ({ x: nx, y: ny } = resolve(pos, p.x + off.dx, p.y + off.dy, off.dx, off.dy));
        pos.set(e.target, { x: nx, y: ny });
        q.push(e.target);
      }
    }

    // Pass 2: rooms whose own exits point to already-placed rooms
    for (const room of allRooms.filter(r => !pos.has(r.id))) {
      for (const e of (fwd.get(room.id) ?? [])) {
        if (!pos.has(e.target) || !DIR_OFF[e.direction]) continue;
        const tp = pos.get(e.target)!;
        const ro = DIR_OFF[OPP[e.direction] as Direction];
        if (!ro) continue;
        let nx = tp.x + ro.dx, ny = tp.y + ro.dy;
        if (taken(pos, nx, ny)) ({ x: nx, y: ny } = resolve(pos, tp.x + ro.dx, tp.y + ro.dy, ro.dx, ro.dy));
        pos.set(room.id, { x: nx, y: ny });
        break;
      }
    }

    // Pass 3: rooms with only non-cardinal exits (in/out/up/down)
    for (const room of allRooms.filter(r => !pos.has(r.id))) {
      for (const ex of room.exits) {
        if (ex.targetRoom.split('_')[0] !== zoneId || !pos.has(ex.targetRoom)) continue;
        const tp = pos.get(ex.targetRoom)!;
        for (let r = 1; r <= 4; r++) {
          let placed = false;
          for (let oy = -r; oy <= r; oy++) {
            for (let ox = -r; ox <= r; ox++) {
              if (Math.abs(ox) !== r && Math.abs(oy) !== r) continue;
              if (!taken(pos, tp.x + ox, tp.y + oy)) {
                pos.set(room.id, { x: tp.x + ox, y: tp.y + oy });
                placed = true; break;
              }
            }
            if (placed) break;
          }
          if (placed) break;
        }
        if (pos.has(room.id)) break;
      }
    }
  }

  // Normalize grid coordinates
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pos.values()) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); }
  const norm = new Map<string, { x: number; y: number }>();
  for (const [id, p] of pos) {
    const nx = p.x - minX, ny = p.y - minY;
    norm.set(id, { x: nx, y: ny });
    maxX = Math.max(maxX, nx); maxY = Math.max(maxY, ny);
  }

  // Ghost cells: rooms adjacent to visited but not visited themselves
  const ghosts = new Set<string>();
  for (const rid of visitedRooms) {
    const room = getRoom(rid);
    if (!room) continue;
    for (const ex of room.exits)
      if (ex.targetRoom.split('_')[0] === zoneId && !visitedRooms.has(ex.targetRoom)) ghosts.add(ex.targetRoom);
    for (const re of (rev.get(rid) ?? []))
      if (!visitedRooms.has(re.target)) ghosts.add(re.target);
  }

  // Build visible cells
  const cells: MapCell[] = [];
  for (const [roomId, gp] of norm) {
    const room = getRoom(roomId);
    if (!room) continue;
    const isV = visitedRooms.has(roomId), isG = ghosts.has(roomId);
    if (room.isHidden && !isV) continue;
    if (!isV && !isG) continue;
    cells.push({
      roomId, name: room.name, gridX: gp.x, gridY: gp.y,
      visited: isV, current: roomId === currentRoomId,
      isSafeZone: room.isSafeZone, hasEnemies: room.enemies.length > 0 && !room.isSafeZone,
      hasNPCs: room.npcs.length > 0, isHidden: room.isHidden,
      exits: room.exits.map(e => ({ direction: e.direction, targetRoomId: e.targetRoom, locked: e.locked ?? false, zoneTransition: e.zoneTransition ?? false })),
    });
  }

  // Build connections — threshold of 3 to handle hub-and-spoke topologies
  const MANHATTAN_MAX = 3;
  const cellIds = new Set(cells.map(c => c.roomId)), seen = new Set<string>();
  const connections: MapConnection[] = [];
  for (const cell of cells) {
    const room = getRoom(cell.roomId);
    if (!room) continue;
    for (const ex of room.exits) {
      if (!cellIds.has(ex.targetRoom)) continue;
      const tp = norm.get(ex.targetRoom);
      if (!tp) continue;
      const manhattan = Math.abs(cell.gridX - tp.x) + Math.abs(cell.gridY - tp.y);
      if (manhattan > MANHATTAN_MAX) continue;
      const key = [cell.roomId, ex.targetRoom].sort().join(':');
      if (seen.has(key)) continue;
      seen.add(key);
      connections.push({ fromX: cell.gridX, fromY: cell.gridY, toX: tp.x, toY: tp.y, locked: ex.locked ?? false, zoneTransition: ex.zoneTransition ?? false });
    }
    for (const re of (rev.get(cell.roomId) ?? [])) {
      if (!cellIds.has(re.target)) continue;
      const sp = norm.get(re.target);
      if (!sp) continue;
      const manhattan = Math.abs(cell.gridX - sp.x) + Math.abs(cell.gridY - sp.y);
      if (manhattan > MANHATTAN_MAX) continue;
      const key = [cell.roomId, re.target].sort().join(':');
      if (seen.has(key)) continue;
      seen.add(key);
      connections.push({ fromX: sp.x, fromY: sp.y, toX: cell.gridX, toY: cell.gridY, locked: re.locked, zoneTransition: re.zt });
    }
  }

  return { zoneName: zone.name, zoneId, cells, gridWidth: maxX + 1, gridHeight: maxY + 1, connections };
}

// ── Render constants & styles ──────────────────────────────────────────────

const CW = 38, CH = 22, GX = 14, GY = 10, SX = CW + GX, SY = CH + GY;

function MapFXStyles() {
  return <style>{`
    @keyframes mud-map-pulse {
      0%,100% { box-shadow: 0 0 6px rgba(var(--phosphor-rgb),0.25), inset 0 0 6px rgba(var(--phosphor-rgb),0.06); border-color: rgba(var(--phosphor-rgb),0.6); }
      50% { box-shadow: 0 0 12px rgba(var(--phosphor-rgb),0.45), inset 0 0 10px rgba(var(--phosphor-rgb),0.1); border-color: var(--phosphor-accent); }
    }
    @keyframes mud-map-dot-pulse {
      0%,100% { opacity: 0.8; transform: translate(-50%,-50%) scale(1); }
      50% { opacity: 1; transform: translate(-50%,-50%) scale(1.4); }
    }
    @keyframes mud-map-ghost { 0%,100% { opacity: 0.12; } 50% { opacity: 0.06; } }
    .mud-map-cell { transition: background 0.15s ease, border-color 0.15s ease; }
    .mud-map-click:hover { filter: brightness(1.35); cursor: pointer; }
    .mud-map-click:active { transform: scale(0.9); }
  `}</style>;
}

// ── Connection line ─────────────────────────────────────────────────────────

function ConnLine({ c }: { c: MapConnection }) {
  const x1 = c.fromX * SX + CW / 2, y1 = c.fromY * SY + CH / 2;
  const dx = c.toX * SX + CW / 2 - x1, dy = c.toY * SY + CH / 2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const color = c.locked ? 'rgba(255,80,80,0.3)' : c.zoneTransition ? 'rgba(var(--phosphor-rgb),0.5)' : 'rgba(var(--phosphor-rgb),0.15)';
  return <div style={{
    position: 'absolute', left: x1, top: y1, width: dist,
    height: c.zoneTransition ? 2 : 1, pointerEvents: 'none',
    transformOrigin: '0 50%', transform: `rotate(${angle}deg)`,
    ...(c.locked
      ? { backgroundImage: `repeating-linear-gradient(90deg, ${color} 0px, ${color} 3px, transparent 3px, transparent 7px)` }
      : { background: color }),
  }} />;
}

// ── Room cell ──────────────────────────────────────────────────────────────

function RoomCell({ cell, currentRoomId }: { cell: MapCell; currentRoomId: string }) {
  const curRoom = getRoom(currentRoomId);
  const isAdj = cell.visited && !cell.current && (
    cell.exits.some(e => e.targetRoomId === currentRoomId) || curRoom?.exits.some(e => e.targetRoom === cell.roomId)
  );
  const clickable = isAdj || cell.current;
  const handleClick = () => {
    if (!clickable) return;
    eventBus.emit('crt:glitch-tier', { tier: 1, duration: cell.current ? 80 : 120 });
    if (cell.current) { eventBus.emit('mud:execute-command', { command: '/look' }); return; }
    if (curRoom) {
      const exit = curRoom.exits.find(e => e.targetRoom === cell.roomId);
      eventBus.emit('mud:execute-command', { command: exit ? `/go ${exit.direction}` : `/go ${cell.name.toLowerCase()}` });
    }
  };

  // Border color: safe=cyan tint, current=bright, visited=mid, ghost=faint
  const bdr = cell.current
    ? (cell.isSafeZone ? 'rgba(165,243,252,0.45)' : 'rgba(var(--phosphor-rgb),0.6)')
    : cell.visited
      ? (cell.isSafeZone ? 'rgba(165,243,252,0.15)' : 'rgba(var(--phosphor-rgb),0.2)')
      : 'rgba(var(--phosphor-rgb),0.07)';
  const bg = cell.current ? 'rgba(var(--phosphor-rgb),0.08)' : cell.visited ? 'rgba(var(--phosphor-rgb),0.02)' : 'transparent';
  const hasUp = cell.exits.some(e => e.direction === 'up' || e.direction === 'out');
  const hasDn = cell.exits.some(e => e.direction === 'down' || e.direction === 'in');

  // Center dot color: current=bright accent, enemies=red, npcs=yellow, default=dim phosphor
  let dotColor = 'rgba(var(--phosphor-rgb),0.25)';
  let dotSize = 4;
  if (cell.current) { dotColor = 'var(--phosphor-accent)'; dotSize = 6; }
  else if (cell.hasEnemies) { dotColor = 'rgba(255,100,100,0.7)'; dotSize = 5; }
  else if (cell.hasNPCs) { dotColor = 'rgba(252,211,77,0.6)'; dotSize = 5; }
  else if (cell.isSafeZone) { dotColor = 'rgba(165,243,252,0.35)'; }

  return (
    <div className={`mud-map-cell${clickable ? ' mud-map-click' : ''}`}
      title={cell.visited ? cell.name : undefined}
      onClick={clickable ? handleClick : undefined} role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter') handleClick(); } : undefined}
      style={{
        position: 'absolute', left: cell.gridX * SX, top: cell.gridY * SY, width: CW, height: CH,
        border: `1px solid ${bdr}`, background: bg, borderRadius: 2,
        touchAction: 'manipulation',
        animation: cell.current ? 'mud-map-pulse 2.5s ease-in-out infinite' : !cell.visited ? 'mud-map-ghost 4s ease-in-out infinite' : 'none',
      }}>
      {/* Center dot -- the primary visual identifier */}
      {cell.visited && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: dotSize, height: dotSize, borderRadius: '50%',
          background: dotColor,
          boxShadow: cell.current ? `0 0 8px ${dotColor}, 0 0 3px ${dotColor}` : `0 0 4px ${dotColor}`,
          transform: 'translate(-50%,-50%)',
          animation: cell.current ? 'mud-map-dot-pulse 2.5s ease-in-out infinite' : 'none',
        }} />
      )}
      {/* Vertical exit markers */}
      {hasUp && cell.visited && <span style={{ position: 'absolute', top: 1, left: '50%', transform: 'translateX(-50%)', fontSize: '6px', lineHeight: 1, color: 'rgba(var(--phosphor-rgb),0.3)' }}>{'\u25B2'}</span>}
      {hasDn && cell.visited && <span style={{ position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)', fontSize: '6px', lineHeight: 1, color: 'rgba(var(--phosphor-rgb),0.3)' }}>{'\u25BC'}</span>}
    </div>
  );
}

// ── MapPanel component ─────────────────────────────────────────────────────

export function MapPanel({ currentRoom, handle }: { currentRoom: string; handle: string }) {
  const mapData = useMemo(() => {
    const world = loadWorld(handle);
    const room = getRoom(currentRoom);
    if (!room) return null;
    return generateMapData(currentRoom, new Set(world.visitedRooms), room.zone);
  }, [currentRoom, handle]);

  if (!mapData || !mapData.cells.length) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.25rem 0.5rem', background: 'rgba(var(--phosphor-rgb),0.04)', borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold', color: 'rgba(var(--phosphor-rgb),0.6)', letterSpacing: '0.1em' }}>MAP</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: 'rgba(var(--phosphor-rgb),0.4)', fontStyle: 'italic', padding: '0.5rem' }}>no map data</div>
      </div>
    );
  }

  const current = mapData.cells.find(c => c.current);
  const visitedCount = mapData.cells.filter(c => c.visited).length;
  const cW = mapData.gridWidth * SX - GX, cH = mapData.gridHeight * SY - GY;

  return (
    <div>
      <MapFXStyles />
      {/* Title bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0.5rem', background: 'rgba(var(--phosphor-rgb),0.04)', borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold', color: 'rgba(var(--phosphor-rgb),0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {'\u25A0'} {mapData.zoneName}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: 'rgba(var(--phosphor-rgb),0.3)' }}>
          {visitedCount}/{mapData.cells.length}
        </span>
      </div>
      {/* Map viewport */}
      <div style={{ overflowY: 'auto', overflowX: 'auto', maxHeight: 220, padding: '0.6rem 0.6rem 0.3rem', position: 'relative' }}>
        {/* Scanline overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, opacity: 0.025, background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(var(--phosphor-rgb),1) 1px, rgba(var(--phosphor-rgb),1) 2px)' }} />
        {/* Grid container */}
        <div style={{ position: 'relative', width: cW, height: cH, margin: '0 auto' }}>
          {mapData.connections.map((c, i) => <ConnLine key={i} c={c} />)}
          {mapData.cells.map(cell => <RoomCell key={cell.roomId} cell={cell} currentRoomId={currentRoom} />)}
        </div>
        {/* Current room label */}
        {current && (
          <div style={{ textAlign: 'center', marginTop: '0.4rem', fontFamily: 'monospace', fontSize: 'var(--text-base)', color: 'var(--phosphor-accent)', letterSpacing: '0.06em', textShadow: '0 0 8px rgba(var(--phosphor-rgb),0.3)' }}>
            {'\u25C6'} {current.name}
          </div>
        )}
      </div>
    </div>
  );
}
