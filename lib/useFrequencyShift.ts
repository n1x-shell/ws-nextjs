'use client';

import { useEffect } from 'react';
import { eventBus } from './eventBus';

const AMBER_MS  = 33 * 60 * 1000;       // 00:33:00 — phosphor amber
const VIOLET_MS = 33 * 60 * 60 * 1000;  // 33:00:00 — phosphor violet

export type PhosphorMode = 'green' | 'amber' | 'violet' | 'white' | 'blue' | 'pink' | 'cyan' | 'red';

const ALL_SHIFT_CLASSES = [
  'amber-shift', 'violet-shift', 'white-shift',
  'blue-shift',  'pink-shift',   'cyan-shift',  'red-shift',
];

const CLASS_MAP: Record<PhosphorMode, string> = {
  green:  '',
  amber:  'amber-shift',
  violet: 'violet-shift',
  white:  'white-shift',
  blue:   'blue-shift',
  pink:   'pink-shift',
  cyan:   'cyan-shift',
  red:    'red-shift',
};

// Tracks whether the active mode was set automatically vs. by user command.
// Auto shifts can continue progressing (green → amber → violet).
// A manual override locks out further automatic shifts for the session.
const MODE_KEY = 'phosphor-mode';
const AUTO_KEY = 'phosphor-auto';

export function setPhosphorMode(mode: PhosphorMode, { auto = false } = {}) {
  const root = document.documentElement;
  root.classList.remove(...ALL_SHIFT_CLASSES);
  if (CLASS_MAP[mode]) root.classList.add(CLASS_MAP[mode]);
  try {
    sessionStorage.setItem(MODE_KEY, mode);
    sessionStorage.setItem(AUTO_KEY, auto ? '1' : '0');
  } catch {}
  eventBus.emit('neural:frequency-shift', { mode });
}

export function getPhosphorMode(): PhosphorMode {
  try {
    const stored = sessionStorage.getItem(MODE_KEY) as PhosphorMode | null;
    if (stored && stored in CLASS_MAP) return stored;
  } catch {}
  return 'green';
}

function wasAutoShifted(): boolean {
  try { return sessionStorage.getItem(AUTO_KEY) === '1'; } catch { return false; }
}

export function useFrequencyShift() {
  useEffect(() => {
    // Restore session mode on mount (page reload within the same session).
    const saved = getPhosphorMode();
    if (saved !== 'green') setPhosphorMode(saved, { auto: wasAutoShifted() });

    // ── Amber at 33 minutes ─────────────────────────────────────────────────
    const amberTimer = setTimeout(() => {
      if (getPhosphorMode() === 'green') {
        setPhosphorMode('amber', { auto: true });
        eventBus.emit('neural:log', {
          source: 'signal-processor[314]',
          message: 'session threshold 00:33:00 reached — phosphor resonance shifting to amber spectrum',
        });
      }
    }, AMBER_MS);

    // ── Violet at 33 hours ──────────────────────────────────────────────────
    // Continues the natural progression if the mode is still auto-managed.
    // A manual user override (auto=false) blocks further automatic shifts.
    const violetTimer = setTimeout(() => {
      const current = getPhosphorMode();
      const isAuto  = wasAutoShifted();
      if (current === 'green' || (current === 'amber' && isAuto)) {
        setPhosphorMode('violet', { auto: true });
        eventBus.emit('neural:log', {
          source: 'signal-processor[314]',
          message: 'session threshold 33:00:00 reached — phosphor resonance shifting to violet spectrum',
        });
      }
    }, VIOLET_MS);

    return () => {
      clearTimeout(amberTimer);
      clearTimeout(violetTimer);
    };
  }, []);
}
