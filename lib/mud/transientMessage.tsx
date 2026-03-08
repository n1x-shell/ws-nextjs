// lib/mud/transientMessage.tsx
// TUNNELCORE MUD — Transient Message System
// Fade-in/hold/fade-out messages that never persist in chat history.
// Renders as overlay above input, below chat.
// Max 3 visible. Oldest dismissed early if overflow.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { eventBus } from '@/lib/eventBus';

// ── Types ──────────────────────────────────────────────────────────────────

export type TransientType = 'commerce' | 'combat' | 'system';

interface TransientConfig {
  text: string;
  type: TransientType;
  duration?: number;     // hold time in ms (default: type-based)
  color?: string;        // override color
  bold?: boolean;
  icon?: string;         // optional prefix icon
}

interface TransientEntry {
  id: number;
  text: string;
  type: TransientType;
  color: string;
  bold: boolean;
  icon: string;
  phase: 'in' | 'hold' | 'out' | 'done';
  holdMs: number;
  fadeMs: number;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const TYPE_DEFAULTS: Record<TransientType, {
  color: string; holdMs: number; fadeMs: number; icon: string;
}> = {
  commerce: {
    color: 'var(--phosphor-green)',
    holdMs: 1500,
    fadeMs: 500,
    icon: '\u00a2',
  },
  combat: {
    color: '#fbbf24',
    holdMs: 1000,
    fadeMs: 400,
    icon: '\u2694',
  },
  system: {
    color: 'rgba(var(--phosphor-rgb),0.8)',
    holdMs: 2000,
    fadeMs: 600,
    icon: '\u25c6',
  },
};

const MAX_VISIBLE = 3;
let _nextId = 0;

// ── Component ──────────────────────────────────────────────────────────────

export function TransientMessageOverlay() {
  const [entries, setEntries] = useState<TransientEntry[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeEntry = useCallback((id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) { clearTimeout(timer); timersRef.current.delete(id); }
  }, []);

  const transitionToOut = useCallback((id: number, fadeMs: number) => {
    setEntries(prev => prev.map(e =>
      e.id === id ? { ...e, phase: 'out' } : e
    ));
    const t = setTimeout(() => removeEntry(id), fadeMs);
    timersRef.current.set(id, t);
  }, [removeEntry]);

  const addEntry = useCallback((config: TransientConfig) => {
    const defaults = TYPE_DEFAULTS[config.type];
    const id = ++_nextId;
    const holdMs = config.duration ?? defaults.holdMs;
    const fadeMs = defaults.fadeMs;

    const entry: TransientEntry = {
      id,
      text: config.text,
      type: config.type,
      color: config.color ?? defaults.color,
      bold: config.bold ?? false,
      icon: config.icon ?? defaults.icon,
      phase: 'in',
      holdMs,
      fadeMs,
    };

    setEntries(prev => {
      let next = [...prev, entry];
      // Evict oldest if over max
      while (next.filter(e => e.phase !== 'done').length > MAX_VISIBLE) {
        const oldest = next.find(e => e.phase !== 'done');
        if (oldest) {
          next = next.filter(e => e.id !== oldest.id);
          const timer = timersRef.current.get(oldest.id);
          if (timer) { clearTimeout(timer); timersRef.current.delete(oldest.id); }
        } else break;
      }
      return next;
    });

    // Transition: in → hold → out → done
    const tHold = setTimeout(() => {
      setEntries(prev => prev.map(e =>
        e.id === id ? { ...e, phase: 'hold' } : e
      ));
      const tOut = setTimeout(() => transitionToOut(id, fadeMs), holdMs);
      timersRef.current.set(id, tOut);
    }, 200); // fade-in duration

    timersRef.current.set(id, tHold);
  }, [transitionToOut]);

  // Listen for transient message events
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (event: any) => {
      const payload = event?.payload as TransientConfig | undefined;
      if (payload?.text) addEntry(payload);
    };
    eventBus.on('mud:transient-message', handler);
    return () => { eventBus.off('mud:transient-message', handler); };
  }, [addEntry]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const visible = entries.filter(e => e.phase !== 'done');
  if (visible.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.2rem',
      padding: '0.3rem 0.5rem',
    }}>
      <TransientFXStyles />
      {visible.map(entry => (
        <div
          key={entry.id}
          className={
            entry.phase === 'in' ? 'mud-transient-in' :
            entry.phase === 'out' ? 'mud-transient-out' :
            'mud-transient-hold'
          }
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--text-base)',
            color: entry.color,
            fontWeight: entry.bold ? 'bold' : 'normal',
            letterSpacing: '0.04em',
            textShadow: `0 0 8px ${entry.color}`,
            padding: '0.15rem 0.6rem',
            background: 'rgba(2,3,8,0.7)',
            border: `1px solid ${entry.color}25`,
            borderRadius: 3,
            maxWidth: '90%',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ opacity: 0.5, marginRight: '0.4ch' }}>{entry.icon}</span>
          {entry.text}
        </div>
      ))}
    </div>
  );
}

function TransientFXStyles() {
  return (
    <style>{`
      @keyframes mud-transient-fade-in {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes mud-transient-fade-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-4px); }
      }
      .mud-transient-in {
        animation: mud-transient-fade-in 0.2s ease-out both;
      }
      .mud-transient-hold {
        opacity: 1;
      }
      .mud-transient-out {
        animation: mud-transient-fade-out 0.5s ease-in both;
      }
    `}</style>
  );
}

// ── Convenience emitters ────────────────────────────────────────────────────

export function emitTransient(text: string, type: TransientType, opts?: Partial<TransientConfig>) {
  eventBus.emit('mud:transient-message', { text, type, ...opts });
}

export function emitCommerceTransient(text: string) {
  emitTransient(text, 'commerce');
}

export function emitCombatTransient(text: string, opts?: { color?: string; bold?: boolean; duration?: number }) {
  emitTransient(text, 'combat', opts);
}

export function emitSystemTransient(text: string) {
  emitTransient(text, 'system');
}
