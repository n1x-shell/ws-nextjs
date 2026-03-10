// lib/mud/restModal.tsx
// TUNNELCORE MUD — Rest Modal (Clock-Based)
// Modal overlay triggered by rest at a safe haven.
// Shows: location name, flavor text, clock drain animation, save confirmation.

import React, { useState, useEffect, useCallback } from 'react';
import SubstrateBackground from './substrateBackground';

// ── Types ──────────────────────────────────────────────────────────────────

export interface RestModalData {
  location: string;
  flavorText: string;
  // Clock data
  harmBefore: number;
  harmSegments: number;
  armorBefore: number;
  armorSegments: number;
  ramBefore: number;
  ramSegments: number;
  // Legacy compat (ignored if clock data present)
  hpBefore?: number;
  hpAfter?: number;
  maxHp?: number;
  ramBefore_legacy?: number;
  ramAfter?: number;
  maxRam?: number;
  pendingLevelUps: number;
  level: number;
}

// ── Style constants ────────────────────────────────────────────────────────

const C = {
  accent:  'var(--phosphor-accent)',
  dim:     'rgba(var(--phosphor-rgb),0.55)',
  faint:   'rgba(var(--phosphor-rgb),0.35)',
  heal:    '#4ade80',
  amber:   '#fbbf24',
  n1x:     '#cc44ff',
};

// ── Component ──────────────────────────────────────────────────────────────

export function RestModal({ data, onClose }: {
  data: RestModalData;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<'narrative' | 'restore' | 'done'>('narrative');
  const [harmDisplay, setHarmDisplay] = useState(data.harmBefore);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('restore'), 1800);
    return () => clearTimeout(t1);
  }, []);

  // Clock drain animation — harm drains to 0
  useEffect(() => {
    if (phase !== 'restore') return;
    const target = 0;
    const diff = data.harmBefore - target;
    if (diff <= 0) {
      setHarmDisplay(0);
      const t = setTimeout(() => {
        setPhase('done');
        if (data.pendingLevelUps > 0) {
          setTimeout(() => setShowLevelUp(true), 400);
        }
      }, 600);
      return () => clearTimeout(t);
    }

    const steps = Math.min(diff, 20);
    const stepMs = 600 / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const current = Math.round(data.harmBefore - (diff * step / steps));
      setHarmDisplay(Math.max(0, current));
      if (step >= steps) {
        clearInterval(interval);
        setHarmDisplay(0);
        setTimeout(() => {
          setPhase('done');
          if (data.pendingLevelUps > 0) {
            setTimeout(() => setShowLevelUp(true), 400);
          }
        }, 400);
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [phase, data]);

  // Dismiss on any key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (phase === 'done' || (phase === 'restore' && harmDisplay === 0)) {
      onClose();
    }
    if (phase !== 'narrative') {
      e.preventDefault();
    }
  }, [phase, harmDisplay, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const harmDrained = data.harmBefore;
  const armorRestored = data.armorSegments - data.armorBefore;
  const ramRestored = data.ramSegments - data.ramBefore;

  // Segment rendering helper
  const renderSegments = (filled: number, total: number, color: string) => {
    const segSize = 8;
    return (
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: segSize, height: segSize,
            borderRadius: 1,
            background: i < filled ? color : 'rgba(var(--phosphor-rgb),0.1)',
            boxShadow: i < filled ? `0 0 4px ${color}` : 'none',
            border: i < filled ? `1px solid ${color}` : '1px solid rgba(var(--phosphor-rgb),0.06)',
            transition: 'all 0.15s ease',
          }} />
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(2,3,8,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'mud-fade-in 0.3s ease-out',
      }}
      onClick={() => { if (phase !== 'narrative') onClose(); }}
    >
      <SubstrateBackground opacity={0.35} />
      <RestFXStyles />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(10,10,10,0.75)',
          border: '1px solid rgba(var(--phosphor-rgb),0.25)',
          borderRadius: 4, overflow: 'hidden',
          boxShadow: '0 0 30px rgba(var(--phosphor-rgb),0.08), 0 0 60px rgba(0,0,0,0.5)',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '0.6rem 0.8rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: C.accent, letterSpacing: '0.08em',
            textShadow: '0 0 8px rgba(var(--phosphor-rgb),0.4)',
          }}>
            {data.location}
          </div>
        </div>

        {/* Flavor text */}
        <div style={{
          padding: '0.8rem 0.8rem',
          borderBottom: phase !== 'narrative' ? '1px solid rgba(var(--phosphor-rgb),0.1)' : 'none',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: C.dim, lineHeight: 1.8, fontStyle: 'italic',
            animation: 'mud-fade-in 0.5s ease-out',
          }}>
            {data.flavorText.split('\n').map((line, i) => (
              <div key={i}>{line.trim()}</div>
            ))}
          </div>
        </div>

        {/* Restore phase — clock drain animation */}
        {phase !== 'narrative' && (
          <div style={{ padding: '0.6rem 0.8rem', animation: 'mud-fade-in 0.4s ease-out' }}>
            {/* HARM clock draining */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6ch',
              marginBottom: '0.4rem', fontFamily: 'monospace', fontSize: 'var(--text-base)',
            }}>
              <span style={{ color: C.dim, flexShrink: 0, whiteSpace: 'nowrap' }}>HARM</span>
              {renderSegments(harmDisplay, data.harmSegments, harmDisplay > 0 ? '#fbbf24' : '#4ade80')}
              <span style={{ color: harmDisplay > 0 ? '#fbbf24' : '#4ade80', flexShrink: 0 }}>
                {harmDisplay}/{data.harmSegments}
              </span>
            </div>

            {/* ARMOR restored */}
            {data.armorSegments > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6ch',
                marginBottom: '0.4rem', fontFamily: 'monospace', fontSize: 'var(--text-base)',
              }}>
                <span style={{ color: C.dim, flexShrink: 0, whiteSpace: 'nowrap' }}>ARMOR</span>
                {renderSegments(data.armorSegments, data.armorSegments, '#60a5fa')}
                <span style={{ color: '#60a5fa', flexShrink: 0 }}>
                  {data.armorSegments}/{data.armorSegments}
                </span>
              </div>
            )}

            {/* RAM restored */}
            {data.ramSegments > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6ch',
                marginBottom: '0.4rem', fontFamily: 'monospace', fontSize: 'var(--text-base)',
              }}>
                <span style={{ color: C.dim, flexShrink: 0, whiteSpace: 'nowrap' }}>RAM</span>
                {renderSegments(data.ramSegments, data.ramSegments, '#c084fc')}
                <span style={{ color: '#c084fc', flexShrink: 0 }}>
                  {data.ramSegments}/{data.ramSegments}
                </span>
              </div>
            )}

            {/* Restore summary */}
            {phase === 'done' && (
              <div style={{ animation: 'mud-fade-in 0.3s ease-out' }}>
                {harmDrained > 0 && (
                  <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.heal, padding: '0.1rem 0' }}>
                    harm cleared. all clocks restored.
                  </div>
                )}
                <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.faint, padding: '0.1rem 0' }}>
                  state saved.
                </div>
              </div>
            )}

            {/* Pending level-ups */}
            {showLevelUp && data.pendingLevelUps > 0 && (
              <div style={{
                marginTop: '0.5rem', padding: '0.5rem',
                borderTop: '1px solid rgba(251,191,36,0.15)',
                animation: 'mud-fade-in 0.4s ease-out',
              }}>
                <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.n1x, lineHeight: 1.8, opacity: 0.9 }}>
                  &gt; something inside you is reorganizing.
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  color: C.amber, fontWeight: 'bold', marginTop: '0.3rem',
                  textShadow: '0 0 6px rgba(251,191,36,0.3)',
                }}>
                  LEVEL UP AVAILABLE: {data.level} {'\u2192'} {data.level + data.pendingLevelUps}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim, marginTop: '0.1rem' }}>
                  tap UPGRADE in the action bar
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dismiss */}
        {phase === 'done' && (
          <div style={{
            padding: '0.4rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
            display: 'flex', justifyContent: 'center',
          }}>
            <button className="mud-btn" onClick={onClose} style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)', color: C.dim,
              background: 'transparent', border: '1px solid rgba(var(--phosphor-rgb),0.2)',
              padding: '0.3rem 1.5rem', cursor: 'pointer', borderRadius: 2,
              touchAction: 'manipulation',
            }}>CONTINUE</button>
          </div>
        )}
      </div>
    </div>
  );
}

function RestFXStyles() {
  return (
    <style>{`
      @keyframes mud-rest-glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
      }
    `}</style>
  );
}
