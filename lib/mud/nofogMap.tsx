// lib/mud/nofogMap.tsx
// TUNNELCORE MUD — Debug World Map Overlay (/nofog)
// Full-screen overlay showing every zone & room across all depth layers.
// Click any room to teleport. Hidden debug tool for testing.

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { MudSession, Direction, ZoneDepth, Zone, Room } from './types';
import { getAllZones, getAllRoomsInZone, getRoom } from './worldMap';
import { saveCharacter, loadWorld, saveWorld } from './persistence';
import { eventBus } from '@/lib/eventBus';

// ── Constants ───────────────────────────────────────────────────────────────

const ROOM_W = 80;
const ROOM_H = 36;
const GAP_X = 24;
const GAP_Y = 20;
const ZONE_PAD = 30;
const ZONE_GAP = 50;

const DEPTH_ORDER: ZoneDepth[] = ['surface', 'shallow', 'deep', 'substrate'];
const DEPTH_LABELS: Record<string, string> = {
  surface: 'SURFACE',
  shallow: 'SHALLOW',
  deep: 'DEEP',
  substrate: 'SUBSTRATE',
  all_layers: 'ALL',
  instanced: 'INSTANCED',
};

// ── Direction offsets for BFS layout ────────────────────────────────────────

const DIR_OFF: Partial<Record<Direction, { dx: number; dy: number }>> = {
  north: { dx: 0, dy: -1 }, south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 }, west: { dx: -1, dy: 0 },
  northeast: { dx: 1, dy: -1 }, northwest: { dx: -1, dy: -1 },
  southeast: { dx: 1, dy: 1 }, southwest: { dx: -1, dy: 1 },
};

// ── Grid layout hints per zone (mirrors mudMap.tsx) ─────────────────────────

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

// ── BFS room layout (same approach as mudMap.tsx) ───────────────────────────

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

interface ZoneLayout {
  zone: Zone;
  nodes: LayoutNode[];
  gridW: number;
  gridH: number;
  connections: Array<{
    from: { gx: number; gy: number };
    to: { gx: number; gy: number };
    zoneTransition: boolean;
  }>;
}

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

function layoutZone(zone: Zone): ZoneLayout {
  const rooms = Object.values(zone.rooms);
  if (rooms.length === 0) return { zone, nodes: [], gridW: 0, gridH: 0, connections: [] };

  const pos = new Map<string, { x: number; y: number }>();
  const hints = ZONE_GRID_HINTS[zone.id];

  // Apply hints first
  if (hints) {
    for (const [rid, p] of Object.entries(hints)) {
      if (zone.rooms[rid]) pos.set(rid, { ...p });
    }
  }

  // BFS for remaining rooms
  const queue: string[] = [];
  const visited = new Set<string>();

  // Start from first room or first hint
  const startId = rooms[0].id;
  if (!pos.has(startId)) pos.set(startId, { x: 0, y: 0 });
  queue.push(startId);
  visited.add(startId);

  // Also queue any hinted rooms
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

  // Catch any rooms not connected via exits
  for (const room of rooms) {
    if (!pos.has(room.id)) {
      pos.set(room.id, resolve(pos, 0, 0, 0, visited.size));
      visited.add(room.id);
    }
  }

  // Normalize to 0,0 origin
  let minX = Infinity, minY = Infinity;
  for (const p of pos.values()) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); }
  for (const [k, p] of pos) pos.set(k, { x: p.x - minX, y: p.y - minY });

  let maxX = 0, maxY = 0;
  for (const p of pos.values()) { maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }

  const nodes: LayoutNode[] = [];
  for (const room of rooms) {
    const p = pos.get(room.id);
    if (!p) continue;
    nodes.push({
      roomId: room.id,
      name: room.name,
      gx: p.x,
      gy: p.y,
      isSafe: room.isSafeZone,
      hasEnemies: room.enemies.length > 0,
      hasNPCs: room.npcs.length > 0,
      isHidden: room.isHidden,
    });
  }

  // Build intra-zone connections
  const connections: ZoneLayout['connections'] = [];
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
      connections.push({
        from: { gx: from.x, gy: from.y },
        to: { gx: to.x, gy: to.y },
        zoneTransition: false,
      });
    }
  }

  return { zone, nodes, gridW: maxX + 1, gridH: maxY + 1, connections };
}

// ── Cross-zone connections ──────────────────────────────────────────────────

interface CrossZoneLink {
  fromRoom: string;
  toRoom: string;
  fromZone: string;
  toZone: string;
}

function findCrossZoneLinks(zones: Zone[]): CrossZoneLink[] {
  const links: CrossZoneLink[] = [];
  const seen = new Set<string>();
  for (const zone of zones) {
    for (const room of Object.values(zone.rooms)) {
      for (const exit of room.exits) {
        if (!exit.zoneTransition || !exit.targetZone) continue;
        const key = [room.id, exit.targetRoom].sort().join('-');
        if (seen.has(key)) continue;
        seen.add(key);
        links.push({
          fromRoom: room.id,
          toRoom: exit.targetRoom,
          fromZone: zone.id,
          toZone: exit.targetZone,
        });
      }
    }
  }
  return links;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── NofogMap Component ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export function NofogMap({ session, onClose }: {
  session: MudSession;
  onClose: () => void;
}) {
  const char = session.character;
  const world = session.world;
  if (!char || !world) return null;

  const visitedSet = useMemo(() => new Set(world.visitedRooms), [world.visitedRooms]);
  const allZones = useMemo(() => getAllZones(), []);

  // Group zones by depth
  const depthGroups = useMemo(() => {
    const groups: Record<string, Zone[]> = {};
    for (const z of allZones) {
      const d = z.depth;
      if (!groups[d]) groups[d] = [];
      groups[d].push(z);
    }
    return groups;
  }, [allZones]);

  // Available depth tabs (only tabs that have zones)
  const availableTabs = useMemo(() => {
    const tabs: ZoneDepth[] = [];
    for (const d of DEPTH_ORDER) {
      if (depthGroups[d]?.length) tabs.push(d);
    }
    // Also add any non-standard depths
    for (const d of Object.keys(depthGroups)) {
      if (!DEPTH_ORDER.includes(d as ZoneDepth)) tabs.push(d as ZoneDepth);
    }
    return tabs;
  }, [depthGroups]);

  // Auto-select the tab that contains the player's current zone
  const currentZoneId = char.currentRoom.split('_')[0];
  const currentZone = allZones.find(z => z.id === currentZoneId);
  const initialTab = currentZone?.depth ?? availableTabs[0] ?? 'surface';
  const [activeTab, setActiveTab] = useState<ZoneDepth>(initialTab);

  // Layout all zones in active tab
  const layouts = useMemo(() => {
    const zones = depthGroups[activeTab] ?? [];
    return zones.map(z => layoutZone(z));
  }, [depthGroups, activeTab]);

  // Cross-zone links (all zones, for display on any tab)
  const crossLinks = useMemo(() => findCrossZoneLinks(allZones), [allZones]);

  // Room position lookup across all layouts (for cross-zone lines)
  const roomPixelPositions = useMemo(() => {
    const map = new Map<string, { px: number; py: number; zoneId: string }>();
    let xOffset = ZONE_PAD;
    for (const layout of layouts) {
      for (const node of layout.nodes) {
        map.set(node.roomId, {
          px: xOffset + node.gx * (ROOM_W + GAP_X) + ROOM_W / 2,
          py: ZONE_PAD + 30 + node.gy * (ROOM_H + GAP_Y) + ROOM_H / 2,
          zoneId: layout.zone.id,
        });
      }
      const zonePixelW = layout.gridW * (ROOM_W + GAP_X) - GAP_X + ZONE_PAD * 2;
      xOffset += zonePixelW + ZONE_GAP;
    }
    return map;
  }, [layouts]);

  // Pan/zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Center on player's zone on mount / tab change
  useEffect(() => {
    const pos = roomPixelPositions.get(char.currentRoom);
    if (pos && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - pos.px * zoom,
        y: rect.height / 2 - pos.py * zoom,
      });
    } else {
      setPan({ x: 40, y: 40 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, roomPixelPositions]);

  // Mouse drag for pan
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-room-node]')) return;
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

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // Scroll zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.3, Math.min(2.5, z + delta)));
  }, []);

  // Click to teleport
  const handleTeleport = useCallback((roomId: string) => {
    char.currentRoom = roomId;
    if (!world.visitedRooms.includes(roomId)) {
      world.visitedRooms.push(roomId);
    }
    saveCharacter(char.handle, char);
    saveWorld(char.handle, world);
    onClose();
    // Refresh map and look
    setTimeout(() => {
      eventBus.emit('mud:panel-mode', { mode: 'map' });
      eventBus.emit('mud:execute-command', { command: '/look' });
    }, 50);
  }, [char, world, onClose]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Compute total canvas bounds
  const canvasBounds = useMemo(() => {
    let totalW = ZONE_PAD;
    let totalH = 0;
    for (const layout of layouts) {
      const zw = layout.gridW * (ROOM_W + GAP_X) - GAP_X + ZONE_PAD * 2;
      const zh = layout.gridH * (ROOM_H + GAP_Y) - GAP_Y + ZONE_PAD * 2 + 30;
      totalW += zw + ZONE_GAP;
      totalH = Math.max(totalH, zh);
    }
    return { w: totalW, h: totalH + 20 };
  }, [layouts]);

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

      {/* Header: title + tabs + close */}
      <div style={{
        flexShrink: 0, padding: '0.5rem 0.75rem 0',
        borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
        position: 'relative', zIndex: 2,
        background: 'rgba(5,5,10,0.9)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1ch' }}>
            <span style={{
              color: '#ffcc00', fontWeight: 'bold', fontSize: 'var(--text-header)',
              letterSpacing: '0.12em',
              textShadow: '0 0 12px rgba(255,204,0,0.4)',
            }}>
              {'>>'}  WORLD MAP — NO FOG
            </span>
            <span style={{ color: 'rgba(var(--phosphor-rgb),0.4)', fontSize: 'var(--text-base)' }}>
              {allZones.length} zones · {allZones.reduce((n, z) => n + Object.keys(z.rooms).length, 0)} rooms
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(var(--phosphor-rgb),0.3)',
              color: 'rgba(var(--phosphor-rgb),0.7)', fontFamily: 'monospace',
              fontSize: 'var(--text-base)', padding: '0.15rem 0.5rem',
              cursor: 'pointer', borderRadius: 2,
            }}
          >
            [X] ESC
          </button>
        </div>

        {/* Depth tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '-1px' }}>
          {availableTabs.map(tab => {
            const isActive = tab === activeTab;
            const count = (depthGroups[tab] ?? []).reduce((n, z) => n + Object.keys(z.rooms).length, 0);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: isActive ? 'rgba(var(--phosphor-rgb),0.06)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--phosphor-green)' : '2px solid transparent',
                  color: isActive ? 'var(--phosphor-accent)' : 'rgba(var(--phosphor-rgb),0.45)',
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  fontWeight: isActive ? 'bold' : 'normal',
                  padding: '0.3rem 0.6rem',
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                  transition: 'color 0.15s, border-color 0.15s',
                  textShadow: isActive ? '0 0 8px rgba(var(--phosphor-rgb),0.4)' : 'none',
                }}
              >
                {DEPTH_LABELS[tab] ?? tab.toUpperCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Map viewport */}
      <div
        ref={containerRef}
        style={{
          flex: 1, overflow: 'hidden', cursor: dragRef.current ? 'grabbing' : 'grab',
          position: 'relative', zIndex: 2,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Zoom indicator */}
        <div style={{
          position: 'absolute', bottom: 8, right: 12, zIndex: 10,
          fontFamily: 'monospace', fontSize: '10px',
          color: 'rgba(var(--phosphor-rgb),0.35)',
        }}>
          {Math.round(zoom * 100)}% · scroll to zoom · drag to pan
        </div>

        {/* Canvas */}
        <div style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: canvasBounds.w,
          height: canvasBounds.h,
          position: 'relative',
        }}>
          {/* Render zone clusters */}
          {(() => {
            let xOffset = ZONE_PAD;
            const elements: React.ReactNode[] = [];

            for (const layout of layouts) {
              const zonePixelW = layout.gridW * (ROOM_W + GAP_X) - GAP_X + ZONE_PAD * 2;
              const zonePixelH = layout.gridH * (ROOM_H + GAP_Y) - GAP_Y + ZONE_PAD * 2 + 30;
              const isCurrentZone = layout.zone.id === currentZoneId;

              elements.push(
                <div
                  key={layout.zone.id}
                  style={{
                    position: 'absolute',
                    left: xOffset,
                    top: 0,
                    width: zonePixelW,
                    height: zonePixelH,
                  }}
                >
                  {/* Zone border */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    border: `1px solid ${isCurrentZone ? 'rgba(var(--phosphor-rgb),0.35)' : 'rgba(var(--phosphor-rgb),0.1)'}`,
                    borderRadius: 4,
                    background: isCurrentZone ? 'rgba(var(--phosphor-rgb),0.02)' : 'transparent',
                  }} />

                  {/* Zone label */}
                  <div style={{
                    position: 'absolute', top: 6, left: 10,
                    fontSize: '10px', fontWeight: 'bold',
                    color: isCurrentZone ? 'var(--phosphor-accent)' : 'rgba(var(--phosphor-rgb),0.5)',
                    letterSpacing: '0.1em',
                    textShadow: isCurrentZone ? '0 0 8px rgba(var(--phosphor-rgb),0.3)' : 'none',
                  }}>
                    {layout.zone.name} ({layout.zone.id}) · Lv.{layout.zone.levelRange[0]}-{layout.zone.levelRange[1]}
                  </div>

                  {/* SVG connections */}
                  <svg
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                    width={zonePixelW}
                    height={zonePixelH}
                  >
                    {layout.connections.map((conn, i) => {
                      const x1 = ZONE_PAD + conn.from.gx * (ROOM_W + GAP_X) + ROOM_W / 2;
                      const y1 = 30 + ZONE_PAD + conn.from.gy * (ROOM_H + GAP_Y) + ROOM_H / 2;
                      const x2 = ZONE_PAD + conn.to.gx * (ROOM_W + GAP_X) + ROOM_W / 2;
                      const y2 = 30 + ZONE_PAD + conn.to.gy * (ROOM_H + GAP_Y) + ROOM_H / 2;
                      return (
                        <line
                          key={i}
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="rgba(var(--phosphor-rgb),0.2)"
                          strokeWidth={1}
                        />
                      );
                    })}
                  </svg>

                  {/* Room nodes */}
                  {layout.nodes.map(node => {
                    const isCurrent = node.roomId === char.currentRoom;
                    const isVisited = visitedSet.has(node.roomId);
                    const px = ZONE_PAD + node.gx * (ROOM_W + GAP_X);
                    const py = 30 + ZONE_PAD + node.gy * (ROOM_H + GAP_Y);

                    let bg = 'rgba(var(--phosphor-rgb),0.04)';
                    let borderColor = 'rgba(var(--phosphor-rgb),0.15)';
                    let textColor = 'rgba(var(--phosphor-rgb),0.35)';
                    let glow = 'none';
                    let borderStyle: string = 'solid';

                    if (isCurrent) {
                      bg = 'rgba(var(--phosphor-rgb),0.15)';
                      borderColor = 'var(--phosphor-green)';
                      textColor = 'var(--phosphor-accent)';
                      glow = '0 0 12px rgba(var(--phosphor-rgb),0.5), inset 0 0 8px rgba(var(--phosphor-rgb),0.1)';
                    } else if (isVisited) {
                      bg = 'rgba(var(--phosphor-rgb),0.06)';
                      borderColor = 'rgba(var(--phosphor-rgb),0.3)';
                      textColor = 'rgba(var(--phosphor-rgb),0.65)';
                    }

                    if (node.hasEnemies && !isCurrent) {
                      bg = isVisited
                        ? 'rgba(255,68,68,0.06)'
                        : 'rgba(255,68,68,0.03)';
                    }

                    if (node.isHidden) {
                      borderStyle = 'dashed';
                    }

                    return (
                      <div
                        key={node.roomId}
                        data-room-node
                        onClick={(e) => { e.stopPropagation(); handleTeleport(node.roomId); }}
                        title={`${node.name} (${node.roomId}) — click to teleport`}
                        style={{
                          position: 'absolute',
                          left: px,
                          top: py,
                          width: ROOM_W,
                          height: ROOM_H,
                          background: bg,
                          border: `1px ${borderStyle} ${borderColor}`,
                          borderRadius: 2,
                          boxShadow: glow,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 3px',
                          transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--phosphor-green)';
                          (e.currentTarget as HTMLElement).style.background = 'rgba(var(--phosphor-rgb),0.1)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 8px rgba(var(--phosphor-rgb),0.3)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = borderColor;
                          (e.currentTarget as HTMLElement).style.background = bg;
                          (e.currentTarget as HTMLElement).style.boxShadow = glow;
                        }}
                      >
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
                          {node.name}
                        </span>

                        {/* Corner indicators */}
                        {node.isSafe && (
                          <div style={{
                            position: 'absolute', top: 2, right: 2,
                            width: 4, height: 4, borderRadius: '50%',
                            background: '#a5f3fc',
                            boxShadow: '0 0 3px rgba(165,243,252,0.5)',
                          }} />
                        )}
                        {node.hasNPCs && !node.hasEnemies && (
                          <div style={{
                            position: 'absolute', bottom: 2, right: 2,
                            width: 4, height: 4, borderRadius: '50%',
                            background: '#fcd34d',
                            boxShadow: '0 0 3px rgba(252,211,77,0.5)',
                          }} />
                        )}
                        {node.hasEnemies && (
                          <div style={{
                            position: 'absolute', bottom: 2, left: 2,
                            width: 4, height: 4, borderRadius: '50%',
                            background: '#ff6b6b',
                            boxShadow: '0 0 3px rgba(255,107,107,0.5)',
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              );

              xOffset += zonePixelW + ZONE_GAP;
            }

            // Cross-zone connection lines (SVG overlay spanning full canvas)
            const crossLinesForTab = crossLinks.filter(link => {
              const fromPos = roomPixelPositions.get(link.fromRoom);
              const toPos = roomPixelPositions.get(link.toRoom);
              return fromPos && toPos;
            });

            if (crossLinesForTab.length > 0) {
              elements.push(
                <svg
                  key="cross-zone-lines"
                  style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                  width={canvasBounds.w}
                  height={canvasBounds.h}
                >
                  {crossLinesForTab.map((link, i) => {
                    const from = roomPixelPositions.get(link.fromRoom)!;
                    const to = roomPixelPositions.get(link.toRoom)!;
                    return (
                      <line
                        key={i}
                        x1={from.px} y1={from.py}
                        x2={to.px} y2={to.py}
                        stroke="rgba(255,204,0,0.2)"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                      />
                    );
                  })}
                </svg>
              );
            }

            return elements;
          })()}
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
          <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px solid var(--phosphor-green)', background: 'rgba(var(--phosphor-rgb),0.15)', borderRadius: 1 }} />
          current
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px solid rgba(var(--phosphor-rgb),0.3)', background: 'rgba(var(--phosphor-rgb),0.06)', borderRadius: 1 }} />
          visited
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px solid rgba(var(--phosphor-rgb),0.15)', background: 'rgba(var(--phosphor-rgb),0.04)', borderRadius: 1 }} />
          unvisited
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, border: '1px dashed rgba(var(--phosphor-rgb),0.15)', borderRadius: 1 }} />
          hidden
        </span>
        <span style={{ color: 'rgba(var(--phosphor-rgb),0.25)' }}>·</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#a5f3fc' }} />
          safe
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#fcd34d' }} />
          NPCs
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3ch' }}>
          <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#ff6b6b' }} />
          enemies
        </span>
        <span style={{ color: 'rgba(var(--phosphor-rgb),0.25)' }}>·</span>
        <span style={{ color: '#ffcc00', letterSpacing: '0.05em' }}>
          click any room to teleport
        </span>
        <span style={{ color: 'rgba(var(--phosphor-rgb),0.25)' }}>·</span>
        <span>/fogon to close</span>
      </div>
    </div>
  );
}
