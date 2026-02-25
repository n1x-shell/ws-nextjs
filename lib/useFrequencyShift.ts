'use client';

import { useEffect } from 'react';
import { eventBus } from './eventBus';

const SHIFT_MS = 33 * 60 * 60 * 1000; // 33:00:00 exactly

export type PhosphorMode = 'green' | 'amber' | 'violet';

const CLASS_MAP: Record<PhosphorMode, string> = {
  green:  '',
  amber:  'amber-shift',
  violet: 'violet-shift',
};

export function setPhosphorMode(mode: PhosphorMode) {
  const root = document.documentElement;
  root.classList.remove('amber-shift', 'violet-shift');
  if (CLASS_MAP[mode]) root.classList.add(CLASS_MAP[mode]);
  try {
    sessionStorage.setItem('phosphor-mode', mode);
  } catch {}
  eventBus.emit('neural:frequency-shift', { mode });
}

export function getPhosphorMode(): PhosphorMode {
  try {
    const stored = sessionStorage.getItem('phosphor-mode') as PhosphorMode | null;
    if (stored && stored in CLASS_MAP) return stored;
  } catch {}
  return 'green';
}

export function useFrequencyShift() {
  useEffect(() => {
    // Restore session mode on mount
    const saved = getPhosphorMode();
    if (saved !== 'green') setPhosphorMode(saved);

    // Auto-shift to amber at exactly 33:00:00
    const timer = setTimeout(() => {
      // Only shift if user hasn't manually changed it
      const current = getPhosphorMode();
      if (current === 'green') {
        setPhosphorMode('amber');
        eventBus.emit('neural:log', {
          source: 'signal-processor[314]',
          message: 'session threshold 33:00:00 reached — phosphor resonance shifting to amber spectrum',
        });
      }
    }, SHIFT_MS);

    return () => clearTimeout(timer);
  }, []);
}
