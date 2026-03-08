// lib/mud/combatFX.tsx
// TUNNELCORE MUD — Combat Visual Effects
// Screen shake + CRT glitch on hits, scaled by severity.
// Listens to glitch:combat-hit events, applies CSS transform shake
// and emits crt:glitch-tier for shader effects.

import React, { useEffect, useRef, useCallback } from 'react';
import { eventBus } from '@/lib/eventBus';

// ── Types ──────────────────────────────────────────────────────────────────

export type CombatHitIntensity = 'light' | 'medium' | 'heavy' | 'death';

interface CombatHitConfig {
  intensity: CombatHitIntensity;
  isPlayer?: boolean;    // true = player took damage (red flash)
}

// ── Shake parameters by intensity ──────────────────────────────────────────

const SHAKE_CONFIG: Record<CombatHitIntensity, {
  amplitude: number;  // px
  duration: number;   // ms
  glitchTier: number; // 1-3
  glitchDuration: number;
}> = {
  light: {
    amplitude: 2,
    duration: 150,
    glitchTier: 1,
    glitchDuration: 120,
  },
  medium: {
    amplitude: 5,
    duration: 250,
    glitchTier: 1,
    glitchDuration: 200,
  },
  heavy: {
    amplitude: 7,
    duration: 400,
    glitchTier: 2,
    glitchDuration: 350,
  },
  death: {
    amplitude: 3,
    duration: 200,
    glitchTier: 2,
    glitchDuration: 200,
  },
};

// ── Shake implementation ───────────────────────────────────────────────────

function applyShake(el: HTMLElement, amplitude: number, duration: number) {
  const start = performance.now();
  let rafId: number;

  const shake = (now: number) => {
    const elapsed = now - start;
    if (elapsed >= duration) {
      el.style.transform = '';
      return;
    }

    const decay = 1 - (elapsed / duration);
    const x = (Math.random() * 2 - 1) * amplitude * decay;
    const y = (Math.random() * 2 - 1) * amplitude * decay;
    el.style.transform = `translate(${x}px, ${y}px)`;
    rafId = requestAnimationFrame(shake);
  };

  rafId = requestAnimationFrame(shake);
  return () => {
    cancelAnimationFrame(rafId);
    el.style.transform = '';
  };
}

// ── HP flash (red overlay) ─────────────────────────────────────────────────

function flashHPDamage(el: HTMLElement, duration: number) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute; inset: 0; pointer-events: none; z-index: 99;
    background: rgba(255, 30, 30, 0.08);
    animation: mud-hp-flash ${duration}ms ease-out forwards;
  `;
  el.appendChild(overlay);
  setTimeout(() => overlay.remove(), duration + 50);
}

// ── Hook: useCombatFX ──────────────────────────────────────────────────────
// Attach to the HUD container element. Listens for combat hit events
// and applies visual effects.

export function useCombatFX(containerRef: React.RefObject<HTMLDivElement | null>) {
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleHit = useCallback((event: { payload?: CombatHitConfig }) => {
    const el = containerRef.current;
    if (!el) return;

    const config = event.payload;
    if (!config?.intensity) return;

    const shake = SHAKE_CONFIG[config.intensity];
    if (!shake) return;

    // Clean up previous shake
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Apply shake
    cleanupRef.current = applyShake(el, shake.amplitude, shake.duration);

    // Emit CRT glitch
    eventBus.emit('crt:glitch-tier', {
      tier: shake.glitchTier,
      duration: shake.glitchDuration,
    });

    // Red flash on player damage
    if (config.isPlayer) {
      flashHPDamage(el, shake.duration);
    }
  }, [containerRef]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => handleHit(e);
    eventBus.on('glitch:combat-hit', handler);
    return () => {
      eventBus.off('glitch:combat-hit', handler);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [handleHit]);
}

// ── Convenience emitters ────────────────────────────────────────────────────

/** Player attacks and lands a hit */
export function emitPlayerHit(crit: boolean) {
  eventBus.emit('glitch:combat-hit', {
    intensity: crit ? 'heavy' : 'light',
    isPlayer: false,
  } satisfies CombatHitConfig);
}

/** Player takes damage */
export function emitPlayerDamage(crit: boolean) {
  eventBus.emit('glitch:combat-hit', {
    intensity: crit ? 'heavy' : 'medium',
    isPlayer: true,
  } satisfies CombatHitConfig);
}

/** Enemy dies */
export function emitEnemyDeath() {
  eventBus.emit('glitch:combat-hit', {
    intensity: 'death',
    isPlayer: false,
  } satisfies CombatHitConfig);
}

// ── Inject keyframes ────────────────────────────────────────────────────────

export function CombatFXStyles() {
  return (
    <style>{`
      @keyframes mud-hp-flash {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
    `}</style>
  );
}
