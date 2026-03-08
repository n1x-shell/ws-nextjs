// lib/mud/restModal.tsx
// TUNNELCORE MUD — Rest Modal
// Modal overlay triggered by rest at a safe haven.
// Shows: location name, flavor text, HP bar animation, save confirmation,
// pending level-ups. Dismiss on any tap/keypress.

import React, { useState, useEffect, useCallback } from 'react';
import SubstrateBackground from './substrateBackground';

// ── Types ──────────────────────────────────────────────────────────────────

export interface RestModalData {
  location: string;
  flavorText: string;
  hpBefore: number;
  hpAfter: number;
  maxHp: number;
  ramBefore: number;
  ramAfter: number;
  maxRam: number;
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
  const [hpDisplay, setHpDisplay] = useState(data.hpBefore);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Phase transitions
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('restore'), 1800);
    return () => clearTimeout(t1);
  }, []);

  // HP bar animation
  useEffect(() => {
    if (phase !== 'restore') return;
    const diff = data.hpAfter - data.hpBefore;
    if (diff <= 0) {
      setHpDisplay(data.hpAfter);
      const t = setTimeout(() => {
        setPhase('done');
        if (data.pendingLevelUps > 0) {
          setTimeout(() => setShowLevelUp(true), 400);
        }
      }, 600);
      return () => clearTimeout(t);
    }

    const steps = Math.min(diff, 30);
    const stepMs = 600 / steps;
    let current = data.hpBefore;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.round(data.hpBefore + (diff * step / steps));
      setHpDisplay(Math.min(current, data.hpAfter));
      if (step >= steps) {
        clearInterval(interval);
        setHpDisplay(data.hpAfter);
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
    if (phase === 'done' || (phase === 'restore' && hpDisplay === data.hpAfter)) {
      onClose();
    }
    // Allow early dismiss after narrative
    if (phase !== 'narrative') {
      e.preventDefault();
    }
  }, [phase, hpDisplay, data.hpAfter, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const hpPct = data.maxHp > 0 ? (hpDisplay / data.maxHp) * 100 : 0;
  const hpColor = hpPct > 60 ? 'var(--phosphor-green)' : hpPct > 25 ? '#fbbf24' : '#ff4444';
  const hpRestored = data.hpAfter - data.hpBefore;
  const ramRestored = data.ramAfter - data.ramBefore;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(2,3,8,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'mud-fade-in 0.3s ease-out',
      }}
      onClick={() => {
        if (phase !== 'narrative') onClose();
      }}
    >
      <SubstrateBackground opacity={0.35} />
      <RestFXStyles />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(10,10,10,0.75)',
          border: '1px solid rgba(var(--phosphor-rgb),0.25)',
          borderRadius: 4,
          overflow: 'hidden',
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
            color: C.dim, lineHeight: 1.8,
            fontStyle: 'italic',
            animation: 'mud-fade-in 0.5s ease-out',
          }}>
            {data.flavorText.split('\n').map((line, i) => (
              <div key={i}>{line.trim()}</div>
            ))}
          </div>
        </div>

        {/* Restore phase — HP bar animation */}
        {phase !== 'narrative' && (
          <div style={{
            padding: '0.6rem 0.8rem',
            animation: 'mud-fade-in 0.4s ease-out',
          }}>
            {/* HP bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6ch',
              marginBottom: '0.4rem',
            }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: C.dim, width: '3ch', flexShrink: 0,
              }}>HP</span>
              <div style={{
                flex: 1, height: 8,
                background: 'rgba(var(--phosphor-rgb),0.06)',
                borderRadius: 1, overflow: 'hidden',
                border: '1px solid rgba(var(--phosphor-rgb),0.06)',
              }}>
                <div className="mud-rest-hp-fill" style={{
                  width: `${hpPct}%`, height: '100%',
                  background: hpColor,
                  boxShadow: `0 0 8px ${hpColor}, 0 0 3px ${hpColor}`,
                  transition: 'width 0.15s ease-out',
                }} />
              </div>
              <span style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: hpColor, flexShrink: 0, minWidth: '7ch', textAlign: 'right',
              }}>
                {hpDisplay}/{data.maxHp}
              </span>
            </div>

            {/* Restore summary */}
            {phase === 'done' && (
              <div style={{ animation: 'mud-fade-in 0.3s ease-out' }}>
                {hpRestored > 0 && (
                  <div style={{
                    fontFamily: 'monospace', fontSize: 'var(--text-base)',
                    color: C.heal, padding: '0.1rem 0',
                  }}>
                    +{hpRestored} HP restored
                  </div>
                )}
                {ramRestored > 0 && (
                  <div style={{
                    fontFamily: 'monospace', fontSize: 'var(--text-base)',
                    color: '#d8b4fe', padding: '0.1rem 0',
                  }}>
                    +{ramRestored} RAM restored
                  </div>
                )}
                <div style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  color: C.faint, padding: '0.1rem 0',
                }}>
                  state saved.
                </div>
              </div>
            )}

            {/* Pending level-ups */}
            {showLevelUp && data.pendingLevelUps > 0 && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                borderTop: '1px solid rgba(251,191,36,0.15)',
                animation: 'mud-fade-in 0.4s ease-out',
              }}>
                <div style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  color: C.n1x, lineHeight: 1.8, opacity: 0.9,
                }}>
                  &gt; something inside you is reorganizing.
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  color: C.amber, fontWeight: 'bold',
                  marginTop: '0.3rem',
                  textShadow: '0 0 6px rgba(251,191,36,0.3)',
                }}>
                  LEVEL UP AVAILABLE: {data.level} {'\u2192'} {data.level + data.pendingLevelUps}
                </div>
                <div style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  color: C.dim, marginTop: '0.1rem',
                }}>
                  tap UPGRADE in the action bar
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dismiss prompt */}
        {phase === 'done' && (
          <div style={{
            padding: '0.5rem 0.8rem',
            borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
            display: 'flex', justifyContent: 'center',
          }}>
            <button
              className="mud-btn"
              onClick={onClose}
              style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
                color: C.dim, background: 'transparent',
                border: '1px solid rgba(var(--phosphor-rgb),0.2)',
                padding: '0.3rem 1.5rem',
                cursor: 'pointer', borderRadius: 2,
                touchAction: 'manipulation',
              }}
            >
              CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RestFXStyles() {
  return (
    <style>{`
      .mud-rest-hp-fill {
        animation: mud-rest-glow 1.5s ease-in-out infinite;
      }
      @keyframes mud-rest-glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.3); }
      }
    `}</style>
  );
}
