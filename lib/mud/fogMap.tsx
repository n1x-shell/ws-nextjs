// lib/mud/fogMap.tsx
// TUNNELCORE MUD — Fog-of-War Map Modal
// Shows only visited rooms + adjacent-but-unvisited as dim outlines.
// Click adjacent rooms to navigate. Pan/zoom with drag + pinch.

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { MudSession, Direction, Zone, Room } from './types';
import { getAllZones, getRoom } from './worldMap';
import { loadWorld } from './persistence';
import { eventBus } from '@/lib/eventBus';
import {
  getMapRevealedRooms, getMapHiddenRevealZones,
  getMapEnemyMarkedZones, revealsHiddenInCurrentZone,
} from './mapSystem';

// ── Constants ───────────────────────────────────────────────────────────────

const ROOM_W = 80;
const ROOM_H = 36;
const GAP_X = 24;
const GAP_Y = 20;
const ZONE_PAD = 30;

const DIR_OFF: Partial<Record<Direction, { dx: number; dy: number }>> = {
  north: { dx: 0, dy: -1 }, south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 }, west: { dx: -1, dy: 0 },
  northeast: { dx: 1, dy: -1 }, northwest: { dx: -1, dy: -1 },
  southeast: { dx: 1, dy: 1 }, southwest: { dx: -1, dy: 1 },
};

// ── Grid layout hints per zone ────────────────────────────────────────────

const ZONE_GRID_HINTS: Record<string, Record<string, { x: number; y: number }>> = {
  z08: {
    z08_r05: { x: 2, y: 0 },
    z08_r06: { x: 1, y: 1 },
    z08_r04: { x: 2, y: 1 },
    z08_r11: { x: 3, y: 1 },
    z08_r09: { x: 1, y: 2 },
    z08_r03: { x: 2, y: 2 },
    z08_r10: { x: 3, y: 2 },
    z08_r13: { x: 4, y: 2 },
    z08_r07: { x: 1, y: 3 },
    z08_r02: { x: 2, y: 3 },
    z08_r12: { x: 3, y: 3 },
    z08_r08: { x: 1, y: 4 },
    z08_r01: { x: 2, y: 4 },
    z08_r14: { x: 3, y: 4 },
  },
};

// ── Types ───────────────────────────────────────────────────────────────────

interface LayoutNode {
  roomId: string;
  name: string;
  gx: number;
  gy: number;
  isSafe: boolean;
  hasEnemies: boolean;
  hasNPCs: boolean;
  isHidden: boolean;
}

interface Connection {
  fromGx: number; fromGy: number;
  toGx: number; toGy: number;
  zoneTransition: boolean;
}

// ── Layout Engine ───────────────────────────────────────────────────────────

function taken(pos: Map<string, { x: number; y: number }>, x: number, y: number): boolean {
  for (const p of pos.values()) if (p.x === x && p.y === y) return true;
  return false;
}

function resolve(pos: Map<string, { x: number; y: number }>, bx: number, by: number, dx: number, dy: number) {
  let x = bx + dx, y = by + dy;
  if (!taken(pos, x, y)) return { x, y };
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

function layoutZone(zone: Zone): { nodes: LayoutNode[]; gridW: number; gridH: number; connections: Connection[] } {
  const rooms = Object.values(zone.rooms);
  if (rooms.length === 0) return { nodes: [], gridW: 0, gridH: 0, connections: [] };

  const pos = new Map<string, { x: number; y: number }>();
  const hints = ZONE_GRID_HINTS[zone.id];

  if (hints) {
    for (const [rid, p] of Object.entries(hints)) {
      if (zone.rooms[rid]) pos.set(rid, { ...p });
    }
  }

  const queue: string[] = [];
  const visited = new Set<string>();
  const startId = rooms[0].id;
  if (!pos.has(startId)) pos.set(startId, { x: 0, y: 0 });
  queue.push(startId);
  visited.add(startId);

  if (hints) {
    for (const rid of Object.keys(hints)) {
      if (!visited.has(rid) && zone.rooms[rid]) {
        visited.add(rid);
        queue.push(rid);
      }
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const room = zone.rooms[current];
    if (!room) continue;
    const base = pos.get(current)!;
    for (const exit of room.exits) {
      if (exit.zoneTransition) continue;
      if (visited.has(exit.targetRoom)) continue;
      if (!zone.rooms[exit.targetRoom]) continue;
      visited.add(exit.targetRoom);
      const off = DIR_OFF[exit.direction];
      if (off && !pos.has(exit.targetRoom)) {
        pos.set(exit.targetRoom, resolve(pos, base.x, base.y, off.dx, off.dy));
      } else if (!pos.has(exit.targetRoom)) {
        pos.set(exit.targetRoom, resolve(pos, base.x, base.y, 1, 0));
      }
      queue.push(exit.targetRoom);
    }
  }

  for (const room of rooms) {
    if (!pos.has(room.id)) {
      pos.set(room.id, resolve(pos, 0, 0, 0, visited.size));
    }
  }

  let minX = Infinity, minY = Infinity;
  for (const p of pos.values()) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); }
  for (const [, p] of pos) { p.x -= minX; p.y -= minY; }

  let maxX = 0, maxY = 0;
  for (const p of pos.values()) { maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }

  const nodes: LayoutNode[] = rooms.map(room => {
    const p = pos.get(room.id)!;
    return {
      roomId: room.id, name: room.name,
      gx: p.x, gy: p.y,
      isSafe: room.isSafeZone,
      hasEnemies: room.enemies.length > 0,
      hasNPCs: room.npcs.length > 0,
      isHidden: room.isHidden,
    };
  });

  const connections: Connection[] = [];
  const connSet = new Set<string>();
  for (const room of rooms) {
    const from = pos.get(room.id);
    if (!from) continue;
    for (const exit of room.exits) {
      if (exit.zoneTransition) continue;
      const to = pos.get(exit.targetRoom);
      if (!to) continue;
      const key = [room.id, exit.targetRoom].sort().join('-');
      if (connSet.has(key)) continue;
      connSet.add(key);
      connections.push({ fromGx: from.x, fromGy: from.y, toGx: to.x, toGy: to.y, zoneTransition: false });
    }
  }

  return { nodes, gridW: maxX + 1, gridH: maxY + 1, connections };
}

// ── Component ───────────────────────────────────────────────────────────────

export function FogMap({ session, onClose }: {
  session: MudSession;
  onClose: () => void;
}) {
  const char = session.character;
  if (!char) return null;

  // Load world state directly from persistence — session.world can be stale
  const worldData = useMemo(() => loadWorld(char.handle), [char.handle]);
  const visitedSet = useMemo(() => new Set(worldData.visitedRooms), [worldData]);

  // Get current room's adjacent room IDs (rooms player can navigate to)
  const adjacentRooms = useMemo(() => {
    const room = getRoom(char.currentRoom);
    if (!room) return new Set<string>();
    return new Set(room.exits.filter(e => !e.locked).map(e => e.targetRoom));
  }, [char.currentRoom]);

  // ── Map-system computed sets (passive — derived from inventory) ──────────
  const mapRevealed = useMemo(() => getMapRevealedRooms(char), [char]);
  const mapHiddenZones = useMemo(() => getMapHiddenRevealZones(char), [char]);
  const mapEnemyZones = useMemo(() => getMapEnemyMarkedZones(char), [char]);
  const mapRevealsCurrentHidden = useMemo(() => revealsHiddenInCurrentZone(char), [char]);

  // Get current zone from the room's zone field
  const currentRoomData = useMemo(() => getRoom(char.currentRoom), [char.currentRoom]);
  const currentZoneId = currentRoomData?.zone ?? char.currentRoom.replace(/_r\d+$/, '');
  const allZones = useMemo(() => getAllZones(), []);
  const currentZone = allZones.find(z => z.id === currentZoneId);

  // "Known" rooms = visited + adjacent-to-visited + map-revealed + hidden-revealed
  const knownRooms = useMemo(() => {
    const known = new Set(visitedSet);
    for (const rid of visitedSet) {
      const r = getRoom(rid);
      if (r) {
        for (const exit of r.exits) {
          known.add(exit.targetRoom);
        }
      }
    }
    // Map-revealed rooms
    for (const rid of mapRevealed) known.add(rid);
    // Hidden rooms in zones where maps reveal them
    if (currentZone) {
      const shouldRevealHidden = mapHiddenZones.has(currentZone.id) || mapRevealsCurrentHidden;
      if (shouldRevealHidden) {
        for (const room of Object.values(currentZone.rooms)) {
          if (room.isHidden) known.add(room.id);
        }
      }
    }
    return known;
  }, [visitedSet, mapRevealed, mapHiddenZones, mapRevealsCurrentHidden, currentZone]);

  const layout = useMemo(() => {
    if (!currentZone) return null;
    return layoutZone(currentZone);
  }, [currentZone]);

  // Pan/zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.2);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

  // Center on player's room on mount
  useEffect(() => {
    if (!layout || !containerRef.current) return;
    const node = layout.nodes.find(n => n.roomId === char.currentRoom);
    if (!node) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = ZONE_PAD + node.gx * (ROOM_W + GAP_X) + ROOM_W / 2;
    const py = ZONE_PAD + node.gy * (ROOM_H + GAP_Y) + ROOM_H / 2;
    setPan({
      x: rect.width / 2 - px * zoom,
      y: rect.height / 2 - py * zoom,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-room-node]')) return;
    if ((e.target as HTMLElement).closest('[data-zoom-btn]')) return;
    if (pinchRef.current) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.panY + (e.clientY - dragRef.current.startY),
    });
  }, []);

  const handlePointerUp = useCallback(() => { dragRef.current = null; }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    setZoom(z => clampZoom(z + (e.deltaY > 0 ? -0.1 : 0.1)));
  }, []);

  // Pinch zoom
  const getTouchDist = (t: React.TouchEvent) => {
    if (t.touches.length < 2) return 0;
    const dx = t.touches[0].clientX - t.touches[1].clientX;
    const dy = t.touches[0].clientY - t.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      dragRef.current = null;
      pinchRef.current = { dist: getTouchDist(e), zoom };
    }
  }, [zoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const newDist = getTouchDist(e);
      setZoom(clampZoom(pinchRef.current.zoom * (newDist / pinchRef.current.dist)));
    }
  }, []);

  const handleTouchEnd = useCallback(() => { pinchRef.current = null; }, []);

  const zoomIn = useCallback(() => setZoom(z => clampZoom(z + 0.15)), []);
  const zoomOut = useCallback(() => setZoom(z => clampZoom(z - 0.15)), []);

  // Navigate to room — find the exit direction from current room
  const handleNavigate = useCallback((targetRoomId: string) => {
    if (!adjacentRooms.has(targetRoomId)) return;
    const room = getRoom(char.currentRoom);
    if (!room) return;
    const exit = room.exits.find(e => e.targetRoom === targetRoomId && !e.locked);
    if (!exit) return;
    onClose();
    setTimeout(() => {
      eventBus.emit('mud:execute-command', { command: `/go ${exit.direction}` });
    }, 50);
  }, [adjacentRooms, char.currentRoom, onClose]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!layout || !currentZone) return null;

  const canvasW = layout.gridW * (ROOM_W + GAP_X) - GAP_X + ZONE_PAD * 2;
  const canvasH = layout.gridH * (ROOM_H + GAP_Y) - GAP_Y + ZONE_PAD * 2;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.96)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'monospace',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03, zIndex: 1,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(var(--phosphor-rgb),1) 1px, rgba(var(--phosphor-rgb),1) 2px)',
      }} />

      {/* Header */}
      <div style={{
        flexShrink: 0, padding: '0.5rem 0.75rem',
        borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
        background: 'rgba(5,5,10,0.9)',
        position: 'relative', zIndex: 2,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1ch' }}>
          <span style={{
            color: 'var(--phosphor-accent)', fontWeight: 'bold', fontSize: 'var(--text-header)',
            letterSpacing: '0.1em',
            textShadow: '0 0 8px rgba(var(--phosphor-rgb),0.4)',
          }}>
            {'\u2550'} {currentZone.name.replace(/_/g, ' ')}
          </span>
          <span style={{ color: 'rgba(var(--phosphor-rgb),0.4)', fontSize: 'var(--text-base)' }}>
            {visitedSet.size} visited · {currentZone.depth}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button data-zoom-btn onClick={zoomOut} style={{
            background: 'transparent', border: '1px solid rgba(var(--phosphor-rgb),0.25)',
            color: 'rgba(var(--phosphor-rgb),0.6)', fontFamily: 'monospace', fontSize: '14px',
            width: 28, height: 28, cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>-</button>
          <span style={{ color: 'rgba(var(--phosphor-rgb),0.4)', fontSize: '10px', width: '4ch', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button data-zoom-btn onClick={zoomIn} style={{
            background: 'transparent', border: '1px solid rgba(var(--phosphor-rgb),0.25)',
            color: 'rgba(var(--phosphor-rgb),0.6)', fontFamily: 'monospace', fontSize: '14px',
            width: 28, height: 28, cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(var(--phosphor-rgb),0.3)',
            color: 'rgba(var(--phosphor-rgb),0.7)', fontFamily: 'monospace', fontSize: 'var(--text-base)',
            padding: '0.15rem 0.5rem', cursor: 'pointer', borderRadius: 2,
          }}>[X]</button>
        </div>
      </div>

      {/* Map viewport */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative', cursor: 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{
          position: 'absolute',
          width: canvasW, height: canvasH,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}>
          {/* Connection lines */}
          <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width={canvasW} height={canvasH}>
            {layout.connections.map((conn, i) => {
              const x1 = ZONE_PAD + conn.fromGx * (ROOM_W + GAP_X) + ROOM_W / 2;
              const y1 = ZONE_PAD + conn.fromGy * (ROOM_H + GAP_Y) + ROOM_H / 2;
              const x2 = ZONE_PAD + conn.toGx * (ROOM_W + GAP_X) + ROOM_W / 2;
              const y2 = ZONE_PAD + conn.toGy * (ROOM_H + GAP_Y) + ROOM_H / 2;

              // Find which rooms these grid positions map to
              const fromNode = layout.nodes.find(n => n.gx === conn.fromGx && n.gy === conn.fromGy);
              const toNode = layout.nodes.find(n => n.gx === conn.toGx && n.gy === conn.toGy);
              const bothKnown = fromNode && toNode && knownRooms.has(fromNode.roomId) && knownRooms.has(toNode.roomId);

              if (!bothKnown) return null;

              const bothVisited = fromNode && toNode && visitedSet.has(fromNode.roomId) && visitedSet.has(toNode.roomId);
              const eitherMapped = fromNode && toNode && (mapRevealed.has(fromNode.roomId) || mapRevealed.has(toNode.roomId));
              const bothMapped = fromNode && toNode && !bothVisited && eitherMapped;

              let stroke: string;
              let dash: string;
              if (bothVisited) {
                stroke = 'rgba(var(--phosphor-rgb),0.25)';
                dash = 'none';
              } else if (bothMapped) {
                stroke = 'rgba(251,191,36,0.15)';
                dash = 'none';
              } else {
                stroke = 'rgba(var(--phosphor-rgb),0.08)';
                dash = '3 3';
              }

              return (
                <line key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={stroke}
                  strokeWidth={1}
                  strokeDasharray={dash}
                />
              );
            })}
          </svg>

          {/* Room nodes */}
          {layout.nodes.map(node => {
            const isVisited = visitedSet.has(node.roomId);
            const isKnown = knownRooms.has(node.roomId);
            const isCurrent = node.roomId === char.currentRoom;
            const isAdjacent = adjacentRooms.has(node.roomId);
            const canClick = isAdjacent && !isCurrent;
            const isMapped = !isVisited && mapRevealed.has(node.roomId);
            const showMappedEnemies = !isVisited && node.hasEnemies && mapEnemyZones.has(currentZoneId);

            // Fog: hide rooms that aren't known at all
            if (!isKnown) return null;

            const px = ZONE_PAD + node.gx * (ROOM_W + GAP_X);
            const py = ZONE_PAD + node.gy * (ROOM_H + GAP_Y);

            // Visual styling based on state
            let bg: string;
            let borderColor: string;
            let textColor: string;
            let glow = 'none';
            let borderStyle = 'solid';

            if (isCurrent) {
              bg = 'rgba(var(--phosphor-rgb),0.18)';
              borderColor = 'var(--phosphor-green)';
              textColor = 'var(--phosphor-accent)';
              glow = '0 0 12px rgba(var(--phosphor-rgb),0.5), inset 0 0 6px rgba(var(--phosphor-rgb),0.1)';
            } else if (isVisited) {
              bg = 'rgba(var(--phosphor-rgb),0.06)';
              borderColor = 'rgba(var(--phosphor-rgb),0.3)';
              textColor = 'rgba(var(--phosphor-rgb),0.65)';
              if (isAdjacent) {
                borderColor = 'rgba(var(--phosphor-rgb),0.5)';
                glow = '0 0 6px rgba(var(--phosphor-rgb),0.2)';
              }
            } else if (isMapped) {
              // Map-revealed but not yet visited — amber hand-drawn look
              bg = 'rgba(251,191,36,0.04)';
              borderColor = 'rgba(251,191,36,0.22)';
              textColor = 'rgba(251,191,36,0.50)';
              if (isAdjacent) {
                borderColor = 'rgba(251,191,36,0.45)';
                bg = 'rgba(251,191,36,0.07)';
                glow = '0 0 5px rgba(251,191,36,0.15)';
              }
            } else {
              // Known but unvisited — dim outline, no name
              bg = 'rgba(var(--phosphor-rgb),0.02)';
              borderColor = 'rgba(var(--phosphor-rgb),0.1)';
              textColor = 'rgba(var(--phosphor-rgb),0.2)';
              borderStyle = 'dashed';
              if (isAdjacent) {
                borderColor = 'rgba(var(--phosphor-rgb),0.3)';
                bg = 'rgba(var(--phosphor-rgb),0.04)';
                glow = '0 0 4px rgba(var(--phosphor-rgb),0.1)';
              }
            }

            // Enemy rooms get red tint (visited or map-marked)
            if (node.hasEnemies && (isVisited || showMappedEnemies) && !isCurrent) {
              bg = isVisited ? 'rgba(255,68,68,0.05)' : 'rgba(255,68,68,0.03)';
            }

            return (
              <div
                key={node.roomId}
                data-room-node
                onClick={(e) => {
                  e.stopPropagation();
                  if (canClick) handleNavigate(node.roomId);
                }}
                title={(isVisited || isMapped) ? `${node.name}${canClick ? ' — click to move' : ''}` : '???'}
                style={{
                  position: 'absolute',
                  left: px, top: py,
                  width: ROOM_W, height: ROOM_H,
                  background: bg,
                  border: `1px ${borderStyle} ${borderColor}`,
                  borderRadius: 2,
                  boxShadow: glow,
                  cursor: canClick ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                  transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!canClick) return;
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--phosphor-green)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(var(--phosphor-rgb),0.12)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 10px rgba(var(--phosphor-rgb),0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = borderColor;
                  (e.currentTarget as HTMLElement).style.background = bg;
                  (e.currentTarget as HTMLElement).style.boxShadow = glow;
                }}
              >
                {/* Room name — visible if visited OR mapped */}
                <span style={{
                  fontSize: '7px',
                  color: textColor,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  letterSpacing: '0.02em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  textShadow: isCurrent ? '0 0 6px rgba(var(--phosphor-rgb),0.5)' : 'none',
                }}>
                  {(isVisited || isMapped) ? node.name : '???'}
                </span>

                {/* Corner indicators — visited rooms OR map-revealed intel */}
                {(isVisited || isMapped) && node.isSafe && (
                  <div style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#a5f3fc', boxShadow: '0 0 3px rgba(165,243,252,0.5)',
                    opacity: isVisited ? 1 : 0.5,
                  }} />
                )}
                {(isVisited || isMapped) && node.hasNPCs && !node.hasEnemies && (
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#fcd34d', boxShadow: '0 0 3px rgba(252,211,77,0.5)',
                    opacity: isVisited ? 1 : 0.5,
                  }} />
                )}
                {(isVisited || showMappedEnemies) && node.hasEnemies && (
                  <div style={{
                    position: 'absolute', bottom: 2, left: 2,
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#ff6b6b', boxShadow: '0 0 3px rgba(255,107,107,0.5)',
                    opacity: isVisited ? 1 : 0.5,
                  }} />
                )}
                {/* Clickable indicator on adjacent rooms */}
                {canClick && (
                  <div style={{
                    position: 'absolute', top: 2, left: 2,
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--phosphor-green)',
                    boxShadow: '0 0 4px rgba(var(--phosphor-rgb),0.6)',
                    animation: 'mud-pulse-phosphor-btn 2s ease-in-out infinite',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        flexShrink: 0,
        borderTop: '1px solid rgba(var(--phosphor-rgb),0.15)',
        padding: '0.3rem 0.75rem',
        display: 'flex', gap: '1.5ch', alignItems: 'center',
        fontSize: '9px',
        color: 'rgba(var(--phosphor-rgb),0.45)',
        background: 'rgba(5,5,10,0.9)',
        position: 'relative', zIndex: 2,
        flexWrap: 'wrap',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px solid var(--phosphor-green)', background: 'rgba(var(--phosphor-rgb),0.18)', borderRadius: 1 }} />
          you
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px solid rgba(var(--phosphor-rgb),0.3)', background: 'rgba(var(--phosphor-rgb),0.06)', borderRadius: 1 }} />
          visited
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px dashed rgba(var(--phosphor-rgb),0.1)', borderRadius: 1 }} />
          unknown
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px solid rgba(251,191,36,0.22)', background: 'rgba(251,191,36,0.04)', borderRadius: 1 }} />
          mapped
        </span>
        <span style={{ color: 'rgba(var(--phosphor-rgb),0.25)' }}>{'\u00b7'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--phosphor-green)' }} />
          movable
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#a5f3fc' }} />
          safe
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#ff6b6b' }} />
          hostile
        </span>
        <span style={{ color: 'rgba(var(--phosphor-rgb),0.25)' }}>{'\u00b7'}</span>
        <span>tap adjacent rooms to move</span>
      </div>
    </div>
  );
}
