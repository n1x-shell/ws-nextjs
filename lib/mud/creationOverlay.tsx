// lib/mud/creationOverlay.tsx
// TUNNELCORE — Character Creation Overlay System
// Replaces chat-scroll creation with full-screen cinematics + modals.
// Manages its own internal state machine; emits session updates on completion.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { MudSession, Archetype, CombatStyle, Attributes, AttributeName } from './types';
import {
  ARCHETYPE_INFO, COMBAT_STYLE_INFO,
  ATTRIBUTE_MIN, ATTRIBUTE_MAX_CREATION, ATTRIBUTE_BONUS_POINTS,
  calculateMaxHp, calculateMaxRam,
} from './types';
import { CREATION_STEPS, generateSubjectId, defaultAttributes, applyArchetypeBonuses, buildCharacter, finalizeCharacter } from './character';
import { eventBus } from '@/lib/eventBus';
import SubstrateBackground from './substrateBackground';

// ── Shared constants ────────────────────────────────────────────────────────

const STAT_COLOR: Record<string, string> = {
  BODY: '#ff6b6b', REFLEX: '#fcd34d', TECH: '#d8b4fe',
  COOL: '#93c5fd', INT: '#67e8f9', GHOST: '#cc44ff',
};
const ATTR_ORDER: AttributeName[] = ['BODY', 'REFLEX', 'TECH', 'COOL', 'INT', 'GHOST'];
const STAT_DESC: Record<string, string> = {
  BODY: 'hp, melee damage, carry capacity',
  REFLEX: 'dodge, initiative, crit rate',
  TECH: 'hacking, crafting, repair',
  COOL: 'npc disposition, barter, deception',
  INT: 'xp bonus, puzzles, scan depth',
  GHOST: 'mesh resistance, 33hz attunement, hidden content',
};

const N1X_RESPONSE: Record<string, string> = {
  DISCONNECTED: "pure flesh. smart. helixion's toys can't touch what isn't there.",
  SOVEREIGN: "broke the leash. kept the hardware. that's the hardest path.",
  INTEGRATED: "you learned to use their weapon. dangerous. effective.",
  CHROME: "up close. no distance between you and the kill.",
  SYNAPSE: "inside their head. the most elegant violence.",
  BALLISTIC: "precision. the clean way to solve a problem.",
  GHOST_STYLE: "invisible. the fight ends before they know it started.",
};

// ── Phase type ──────────────────────────────────────────────────────────────

type Phase =
  | 'intro_cinematic'
  | 'archetype_modal'
  | 'archetype_response'
  | 'combat_cinematic'
  | 'combat_modal'
  | 'combat_response'
  | 'stats_cinematic'
  | 'stats_modal'
  | 'spawning';

// ══════════════════════════════════════════════════════════════════════════════
// ── CreationCinematic — Full-screen typed lines, tap to skip ────────────────
// ══════════════════════════════════════════════════════════════════════════════

function CreationCinematic({ lines, onComplete }: {
  lines: string[];
  onComplete: () => void;
}) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const doneRef = useRef(false);
  const speed = 28;

  // Typewriter per character
  useEffect(() => {
    if (lineIdx >= lines.length) { setAllDone(true); return; }
    const text = lines[lineIdx];
    if (charIdx >= text.length) return;
    const t = setTimeout(() => setCharIdx(p => p + 1), speed);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx, lines]);

  // When line is fully revealed, pause then advance
  useEffect(() => {
    if (lineIdx >= lines.length) return;
    if (charIdx < lines[lineIdx].length) return;
    const t = setTimeout(() => {
      if (lineIdx + 1 >= lines.length) {
        setAllDone(true);
      } else {
        setLineIdx(p => p + 1);
        setCharIdx(0);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx, lines]);

  // Auto-complete after all lines shown
  useEffect(() => {
    if (!allDone) return;
    const t = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onComplete(); }
    }, 800);
    return () => clearTimeout(t);
  }, [allDone, onComplete]);

  // Tap handler: skip current line or complete
  const handleTap = useCallback(() => {
    if (lineIdx >= lines.length || allDone) {
      if (!doneRef.current) { doneRef.current = true; onComplete(); }
      return;
    }
    if (charIdx < lines[lineIdx].length) {
      // Reveal rest of current line
      setCharIdx(lines[lineIdx].length);
    } else {
      // Skip to next line
      if (lineIdx + 1 >= lines.length) {
        if (!doneRef.current) { doneRef.current = true; onComplete(); }
      } else {
        setLineIdx(p => p + 1);
        setCharIdx(0);
      }
    }
  }, [lineIdx, charIdx, lines, allDone, onComplete]);

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'absolute', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
        cursor: 'pointer',
      }}
    >
      <SubstrateBackground opacity={0.2} />
      <div style={{
        maxWidth: 420, width: '100%', position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
      }}>
        {lines.slice(0, lineIdx + 1).map((line, i) => {
          const revealed = i < lineIdx ? line.length : charIdx;
          const text = line.slice(0, revealed);
          return (
            <div key={i} style={{
              fontFamily: 'monospace', fontSize: 'var(--text-base)',
              lineHeight: 1.8, color: '#cc44ff', opacity: i < lineIdx ? 0.5 : 0.9,
              minHeight: '1.4em',
            }}>
              {text}
              {i === lineIdx && revealed < line.length && (
                <span style={{ opacity: 0.6, animation: 'cc-blink 0.6s step-end infinite' }}>{'\u2588'}</span>
              )}
            </div>
          );
        })}
        <div style={{ opacity: 0.25, fontFamily: 'monospace', fontSize: '0.65em', marginTop: '1rem', textAlign: 'center', color: 'rgba(var(--phosphor-rgb),0.6)' }}>
          tap to continue
        </div>
      </div>
      <style>{`@keyframes cc-blink { 0%,100% { opacity:0.6; } 50% { opacity:0; } }`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SelectionModal — Archetype / Combat Style picker ────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

interface SelectionOption {
  key: string;
  display: string;
  description: string;
}

function SelectionModal({ title, options, onConfirm }: {
  title: string;
  options: SelectionOption[];
  onConfirm: (key: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedOpt = options.find(o => o.key === selected);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }}>
      <SubstrateBackground opacity={0.25} />
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(10,10,10,0.8)',
        border: '1px solid rgba(var(--phosphor-rgb),0.2)',
        borderRadius: 4, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 1,
        boxShadow: '0 0 40px rgba(var(--phosphor-rgb),0.06)',
      }}>
        {/* Title bar */}
        <div style={{
          padding: '0.6rem 0.8rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: '#cc44ff', letterSpacing: '0.08em',
          }}>
            {title}
          </span>
        </div>

        {/* Options */}
        <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {options.map(opt => {
            const isSelected = selected === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '0.15rem',
                  padding: '0.6rem 0.7rem',
                  background: isSelected ? 'rgba(var(--phosphor-rgb),0.08)' : 'rgba(var(--phosphor-rgb),0.02)',
                  border: isSelected
                    ? '1px solid rgba(var(--phosphor-rgb),0.4)'
                    : '1px solid rgba(var(--phosphor-rgb),0.1)',
                  borderRadius: 3,
                  cursor: 'pointer', touchAction: 'manipulation',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(var(--phosphor-rgb),0.08)' : 'none',
                }}
              >
                <span style={{
                  fontFamily: 'monospace', fontSize: 'var(--text-base)',
                  color: isSelected ? 'var(--phosphor-accent)' : 'rgba(var(--phosphor-rgb),0.7)',
                  fontWeight: 'bold',
                }}>
                  {opt.display}
                </span>
                <span style={{
                  fontFamily: 'monospace', fontSize: '0.75em',
                  color: 'rgba(255,255,255,0.45)', lineHeight: 1.5,
                }}>
                  {opt.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        <div style={{
          padding: '0.5rem 0.8rem 0.7rem',
          borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
          display: 'flex', justifyContent: 'center',
        }}>
          <button
            onClick={() => { if (selected) onConfirm(selected); }}
            disabled={!selected}
            style={{
              fontFamily: 'monospace', fontSize: 'var(--text-header)',
              fontWeight: 'bold', letterSpacing: '0.1em',
              color: selected ? 'var(--phosphor-accent)' : 'rgba(var(--phosphor-rgb),0.25)',
              background: selected ? 'rgba(var(--phosphor-rgb),0.08)' : 'transparent',
              border: `1px solid ${selected ? 'rgba(var(--phosphor-rgb),0.35)' : 'rgba(var(--phosphor-rgb),0.1)'}`,
              borderRadius: 3,
              padding: '0.6rem 2rem',
              cursor: selected ? 'pointer' : 'default',
              touchAction: 'manipulation',
              transition: 'all 0.2s ease',
              textShadow: selected ? '0 0 8px rgba(var(--phosphor-rgb),0.4)' : 'none',
              boxShadow: selected ? '0 0 16px rgba(var(--phosphor-rgb),0.08)' : 'none',
            }}
          >
            {selectedOpt ? selectedOpt.key.replace('_STYLE', '').replace('GHOST_STYLE', 'GHOST') : '\u2014'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── StatModal — CP2077-style attribute allocation ───────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function StatModal({ archetype, onConfirm }: {
  archetype: Archetype;
  onConfirm: (attrs: Attributes) => void;
}) {
  const base = useMemo(() => applyArchetypeBonuses(defaultAttributes(), archetype), [archetype]);
  const bonuses = ARCHETYPE_INFO[archetype].bonusAttributes;
  const [attrs, setAttrs] = useState<Attributes>({ ...base });
  const [modalPhase, setModalPhase] = useState<'intro' | 'allocate'>('intro');

  const spent = useMemo(() => {
    let total = 0;
    for (const attr of ATTR_ORDER) {
      total += attrs[attr] - base[attr];
    }
    return total;
  }, [attrs, base]);

  const remaining = ATTRIBUTE_BONUS_POINTS - spent;
  const allSpent = remaining === 0;

  const adjust = useCallback((attr: AttributeName, delta: number) => {
    setAttrs(prev => {
      const newVal = prev[attr] + delta;
      if (newVal < base[attr]) return prev; // can't go below base
      if (newVal > ATTRIBUTE_MAX_CREATION) return prev; // cap at 10
      const newSpent = spent + delta;
      if (newSpent > ATTRIBUTE_BONUS_POINTS) return prev; // no overspend
      return { ...prev, [attr]: newVal };
    });
    eventBus.emit('crt:glitch-tier', { tier: 1, duration: 60 });
  }, [base, spent]);

  const dot = <span style={{ color: '#fbbf24', fontWeight: 'bold', opacity: 0.7 }}>{'\u00b7'}</span>;

  // ── Phase 1: Intro — stat descriptions + base values + gold button ────
  if (modalPhase === 'intro') {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
        animation: 'mud-fade-in 0.4s ease-out',
      }}>
        <SubstrateBackground opacity={0.15} />
        <div style={{ maxWidth: 420, width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Stat descriptions — colored names, white descriptions */}
          <div style={{ marginBottom: '1.5rem' }}>
            {ATTR_ORDER.map(attr => (
              <div key={attr} style={{
                fontFamily: 'monospace', fontSize: 'var(--text-base)', lineHeight: 2,
              }}>
                <span style={{ color: STAT_COLOR[attr], fontWeight: 'bold' }}>{attr}</span>
                <span style={{ color: 'rgba(255,255,255,0.45)' }}> — {STAT_DESC[attr]}</span>
              </div>
            ))}
          </div>

          {/* Current base label */}
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            color: 'rgba(var(--phosphor-rgb),0.5)', marginBottom: '0.4rem',
          }}>
            current base ({ARCHETYPE_INFO[archetype].label})
          </div>

          {/* Base stats — inline with colored names */}
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)',
            marginBottom: '1.8rem', lineHeight: 1.8,
          }}>
            {ATTR_ORDER.map((attr, i) => (
              <span key={attr}>
                {i > 0 && i !== 3 && <span style={{ color: 'rgba(var(--phosphor-rgb),0.3)', margin: '0 0.3ch' }}>{'\u00b7'}</span>}
                {i === 3 && <br />}
                <span style={{ color: STAT_COLOR[attr], fontWeight: 'bold' }}>{attr}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: '0.3ch' }}>
                  {base[attr]}
                  {(bonuses[attr] ?? 0) > 0 && (
                    <span style={{ color: 'rgba(var(--phosphor-rgb),0.35)', fontSize: '0.85em' }}>(+{bonuses[attr]})</span>
                  )}
                </span>
              </span>
            ))}
          </div>

          {/* Gold "tell me your numbers" button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                eventBus.emit('crt:glitch-tier', { tier: 1, duration: 150 });
                setModalPhase('allocate');
              }}
              style={{
                fontFamily: 'monospace', fontSize: 'var(--text-header)',
                fontWeight: 'bold', letterSpacing: '0.1em',
                color: '#fbbf24',
                background: 'rgba(251,191,36,0.06)',
                border: '1px solid rgba(251,191,36,0.3)',
                borderRadius: 3,
                padding: '0.7rem 2rem',
                cursor: 'pointer', touchAction: 'manipulation',
                textShadow: '0 0 10px rgba(251,191,36,0.3)',
                boxShadow: '0 0 25px rgba(251,191,36,0.06)',
                transition: 'all 0.2s ease',
                animation: 'cc-glow-gold 2s ease-in-out infinite',
              }}
              onPointerEnter={e => {
                e.currentTarget.style.background = 'rgba(251,191,36,0.12)';
                e.currentTarget.style.boxShadow = '0 0 35px rgba(251,191,36,0.12)';
              }}
              onPointerLeave={e => {
                e.currentTarget.style.background = 'rgba(251,191,36,0.06)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(251,191,36,0.06)';
              }}
            >
              tell me your numbers
            </button>
          </div>
        </div>
        <style>{`
          @keyframes cc-glow-gold {
            0%, 100% { box-shadow: 0 0 25px rgba(251,191,36,0.06); }
            50% { box-shadow: 0 0 35px rgba(251,191,36,0.14); }
          }
        `}</style>
      </div>
    );
  }

  // ── Phase 2: Allocation — CP2077-style +/- spending ───────────────────

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'mud-fade-in 0.3s ease-out',
    }}>
      <SubstrateBackground opacity={0.2} />
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(10,10,10,0.8)',
        border: '1px solid rgba(var(--phosphor-rgb),0.2)',
        borderRadius: 4, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 1,
        boxShadow: '0 0 40px rgba(var(--phosphor-rgb),0.06)',
      }}>
        {/* Title */}
        <div style={{
          padding: '0.6rem 0.8rem',
          borderBottom: '1px solid rgba(var(--phosphor-rgb),0.15)',
          background: 'rgba(var(--phosphor-rgb),0.04)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)', fontWeight: 'bold',
            color: '#cc44ff', letterSpacing: '0.08em',
          }}>
            DISTRIBUTE POINTS
          </span>
          <span style={{
            fontFamily: 'monospace', fontSize: 'var(--text-base)', fontWeight: 'bold',
            color: allSpent ? '#4ade80' : '#fbbf24',
          }}>
            {remaining} left
          </span>
        </div>

        {/* Current base */}
        <div style={{ padding: '0.5rem 0.8rem', fontFamily: 'monospace', fontSize: 'var(--text-base)' }}>
          <div style={{ color: 'rgba(var(--phosphor-rgb),0.55)', marginBottom: '0.3rem' }}>
            current base ({ARCHETYPE_INFO[archetype].label})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.5ch' }}>
            {ATTR_ORDER.map((attr, i) => (
              <span key={attr} style={{ whiteSpace: 'nowrap' }}>
                {i > 0 && dot}
                <span style={{ color: STAT_COLOR[attr], fontWeight: 'bold' }}>{attr}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: '0.3ch' }}>{base[attr]}</span>
                {(bonuses[attr] ?? 0) > 0 && (
                  <span style={{ color: 'rgba(var(--phosphor-rgb),0.4)', fontSize: '0.8em' }}>(+{bonuses[attr]})</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Stat rows */}
        <div style={{ padding: '0.3rem 0.8rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {ATTR_ORDER.map(attr => {
            const val = attrs[attr];
            const baseVal = base[attr];
            const added = val - baseVal;
            const pct = (val / ATTRIBUTE_MAX_CREATION) * 100;
            const canDec = val > baseVal;
            const canInc = val < ATTRIBUTE_MAX_CREATION && remaining > 0;

            return (
              <div key={attr} style={{
                display: 'grid',
                gridTemplateColumns: '5.5ch auto 1fr auto 2.5ch',
                alignItems: 'center', gap: '0.4ch',
                fontFamily: 'monospace', fontSize: 'var(--text-base)',
              }}>
                {/* Stat name */}
                <span style={{ color: STAT_COLOR[attr], fontWeight: 'bold' }}>{attr}</span>

                {/* Minus button */}
                <button
                  onClick={() => adjust(attr, -1)}
                  disabled={!canDec}
                  style={{
                    width: 26, height: 26,
                    fontFamily: 'monospace', fontSize: '1em', fontWeight: 'bold',
                    color: canDec ? '#ff6b6b' : 'rgba(var(--phosphor-rgb),0.15)',
                    background: canDec ? 'rgba(255,100,100,0.08)' : 'transparent',
                    border: `1px solid ${canDec ? 'rgba(255,100,100,0.3)' : 'rgba(var(--phosphor-rgb),0.08)'}`,
                    borderRadius: 2, cursor: canDec ? 'pointer' : 'default',
                    touchAction: 'manipulation', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >{'\u2212'}</button>

                {/* Bar */}
                <div style={{
                  height: 14, background: 'rgba(var(--phosphor-rgb),0.06)',
                  borderRadius: 2, overflow: 'hidden', position: 'relative',
                  border: '1px solid rgba(var(--phosphor-rgb),0.06)',
                }}>
                  {/* Base fill */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${(baseVal / ATTRIBUTE_MAX_CREATION) * 100}%`,
                    background: `${STAT_COLOR[attr]}33`,
                    transition: 'width 0.2s ease',
                  }} />
                  {/* Allocated fill */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${STAT_COLOR[attr]}88, ${STAT_COLOR[attr]})`,
                    boxShadow: `0 0 6px ${STAT_COLOR[attr]}44`,
                    transition: 'width 0.2s ease',
                  }} />
                  {/* Pip markers */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                    {Array.from({ length: ATTRIBUTE_MAX_CREATION - 1 }).map((_, i) => (
                      <div key={i} style={{
                        flex: 1, borderRight: '1px solid rgba(0,0,0,0.3)',
                      }} />
                    ))}
                    <div style={{ flex: 1 }} />
                  </div>
                </div>

                {/* Plus button */}
                <button
                  onClick={() => adjust(attr, 1)}
                  disabled={!canInc}
                  style={{
                    width: 26, height: 26,
                    fontFamily: 'monospace', fontSize: '1em', fontWeight: 'bold',
                    color: canInc ? '#4ade80' : 'rgba(var(--phosphor-rgb),0.15)',
                    background: canInc ? 'rgba(74,222,128,0.08)' : 'transparent',
                    border: `1px solid ${canInc ? 'rgba(74,222,128,0.3)' : 'rgba(var(--phosphor-rgb),0.08)'}`,
                    borderRadius: 2, cursor: canInc ? 'pointer' : 'default',
                    touchAction: 'manipulation', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >+</button>

                {/* Value */}
                <span style={{
                  textAlign: 'right', fontWeight: 'bold',
                  color: added > 0 ? '#4ade80' : 'rgba(255,255,255,0.6)',
                }}>{val}</span>
              </div>
            );
          })}
        </div>

        {/* Stat descriptions — compact */}
        <div style={{
          padding: '0.3rem 0.8rem 0.5rem',
          borderTop: '1px solid rgba(var(--phosphor-rgb),0.08)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.1rem 1ch',
          fontFamily: 'monospace', fontSize: '0.65em', lineHeight: 1.5,
        }}>
          {ATTR_ORDER.map(attr => (
            <div key={attr}>
              <span style={{ color: STAT_COLOR[attr], fontWeight: 'bold' }}>{attr}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}> {STAT_DESC[attr]}</span>
            </div>
          ))}
        </div>

        {/* Confirm button — "tell me your numbers" */}
        <div style={{
          padding: '0.5rem 0.8rem 0.7rem',
          borderTop: '1px solid rgba(var(--phosphor-rgb),0.1)',
          display: 'flex', justifyContent: 'center',
        }}>
          <button
            onClick={() => { if (allSpent) onConfirm(attrs); }}
            disabled={!allSpent}
            style={{
              fontFamily: 'monospace', fontSize: 'var(--text-header)',
              fontWeight: 'bold', letterSpacing: '0.08em',
              color: allSpent ? 'var(--phosphor-accent)' : 'rgba(var(--phosphor-rgb),0.2)',
              background: allSpent ? 'rgba(var(--phosphor-rgb),0.06)' : 'transparent',
              border: `1px solid ${allSpent ? 'rgba(var(--phosphor-rgb),0.4)' : 'rgba(var(--phosphor-rgb),0.08)'}`,
              borderRadius: 3,
              padding: '0.6rem 1.5rem',
              cursor: allSpent ? 'pointer' : 'default',
              touchAction: 'manipulation',
              transition: 'all 0.3s ease',
              textShadow: allSpent ? '0 0 10px rgba(var(--phosphor-rgb),0.5)' : 'none',
              boxShadow: allSpent ? '0 0 20px rgba(var(--phosphor-rgb),0.08)' : 'none',
              animation: allSpent ? 'cc-glow-green 2s ease-in-out infinite' : 'none',
            }}
          >
            {allSpent ? '[ CONFIRM BUILD ]' : `[ ${remaining} REMAINING ]`}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes cc-glow-gold {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.08); }
          50% { box-shadow: 0 0 30px rgba(251,191,36,0.18); }
        }
        @keyframes cc-glow-green {
          0%, 100% { box-shadow: 0 0 20px rgba(var(--phosphor-rgb),0.08); }
          50% { box-shadow: 0 0 35px rgba(var(--phosphor-rgb),0.18); }
        }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CreationOverlay — Master state machine ──────────────────────────────────
// Rendered over the HUD during character_creation phase.
// Manages intro → archetype → combat → stats → auto-origin → spawn.
// ══════════════════════════════════════════════════════════════════════════════

export function CreationOverlay({ session, setSession, handle, addLocalMsg }: {
  session: MudSession;
  setSession: (s: MudSession) => void;
  handle: string;
  addLocalMsg: (node: React.ReactNode) => void;
}) {
  const [phase, setPhase] = useState<Phase>('intro_cinematic');
  const [archetype, setArchetype] = useState<Archetype | null>(null);
  const [combatStyle, setCombatStyle] = useState<CombatStyle | null>(null);
  const subjectIdRef = useRef(generateSubjectId());

  // Glitch between phases
  const glitchAndAdvance = useCallback((nextPhase: Phase) => {
    eventBus.emit('neural:glitch-trigger', { intensity: 0.6 });
    eventBus.emit('crt:glitch-tier', { tier: 2, duration: 250 });
    setTimeout(() => setPhase(nextPhase), 300);
  }, []);

  // ── Intro cinematic lines ─────────────────────────────────────────────
  const introLines = useMemo(() => [
    "you've been here long enough. you've seen the fragments.",
    "you know what helixion did. you know what i survived.",
    "the terminal you're using — it's a window. but there's a door.",
    "TUNNELCORE is what's on the other side.",
    "before you go through, i need to know what you're carrying.",
    `subject detected. handle: ${handle}`,
    `assigning identifier: ${subjectIdRef.current}`,
  ], [handle]);

  // ── Combat cinematic lines ────────────────────────────────────────────
  const combatLines = useMemo(() => [
    "the tunnels don't care about your philosophy.",
    "they care about what you do when something comes at you in the dark.",
  ], []);

  // ── Stats cinematic lines ─────────────────────────────────────────────
  const statsLines = useMemo(() => [
    "six things matter down here.",
    `you've got ${ATTRIBUTE_BONUS_POINTS} points to distribute.`,
    "everything starts at 3. cap is 10 at creation.",
    "your archetype already pushed some numbers.",
  ], []);

  // ── Handle final character build ──────────────────────────────────────
  const finalize = useCallback((attrs: Attributes) => {
    setPhase('spawning');

    // Auto-select DRAINAGE (only available origin in phase 1)
    const character = buildCharacter(handle, archetype!, combatStyle!, attrs, 'DRAINAGE');
    character.subjectId = subjectIdRef.current;
    const finalSession = finalizeCharacter(character);

    eventBus.emit('crt:glitch-tier', { tier: 2, duration: 350 });

    // Brief spawn sequence then switch to active
    setTimeout(() => {
      setSession(finalSession);
      // Trigger /look after a beat
      setTimeout(() => {
        eventBus.emit('mud:execute-command', { command: '/look' });
      }, 400);
    }, 600);
  }, [handle, archetype, combatStyle, setSession]);

  // ── Render based on phase ─────────────────────────────────────────────

  switch (phase) {
    case 'intro_cinematic':
      return (
        <CreationCinematic
          lines={introLines}
          onComplete={() => glitchAndAdvance('archetype_modal')}
        />
      );

    case 'archetype_modal':
      return (
        <SelectionModal
          title="WHAT DID YOU DO?"
          options={CREATION_STEPS.archetype.options.map(o => ({
            key: o.key, display: o.display, description: o.description,
          }))}
          onConfirm={(key) => {
            const arch = key as Archetype;
            setArchetype(arch);
            // Update session creation state
            const next = { ...session, creation: { ...session.creation!, step: 'combat_style' as const, archetype: arch } };
            setSession(next);
            glitchAndAdvance('archetype_response');
          }}
        />
      );

    case 'archetype_response':
      return (
        <CreationCinematic
          lines={[N1X_RESPONSE[archetype!] ?? '...']}
          onComplete={() => glitchAndAdvance('combat_cinematic')}
        />
      );

    case 'combat_cinematic':
      return (
        <CreationCinematic
          lines={combatLines}
          onComplete={() => glitchAndAdvance('combat_modal')}
        />
      );

    case 'combat_modal':
      return (
        <SelectionModal
          title="HOW DO YOU FIGHT?"
          options={CREATION_STEPS.combatStyle.options.map(o => ({
            key: o.key, display: o.display, description: o.description,
          }))}
          onConfirm={(key) => {
            const cs = key as CombatStyle;
            setCombatStyle(cs);
            const next = { ...session, creation: { ...session.creation!, step: 'attributes' as const, combatStyle: cs } };
            setSession(next);
            glitchAndAdvance('combat_response');
          }}
        />
      );

    case 'combat_response':
      return (
        <CreationCinematic
          lines={[N1X_RESPONSE[combatStyle!] ?? '...']}
          onComplete={() => glitchAndAdvance('stats_cinematic')}
        />
      );

    case 'stats_cinematic':
      return (
        <CreationCinematic
          lines={statsLines}
          onComplete={() => glitchAndAdvance('stats_modal')}
        />
      );

    case 'stats_modal':
      return (
        <StatModal
          archetype={archetype!}
          onConfirm={(attrs) => finalize(attrs)}
        />
      );

    case 'spawning':
      return (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SubstrateBackground opacity={0.3} />
          <div style={{
            fontFamily: 'monospace', fontSize: 'var(--text-header)',
            color: 'var(--phosphor-accent)', fontWeight: 'bold',
            letterSpacing: '0.1em', position: 'relative', zIndex: 1,
            textShadow: '0 0 12px rgba(var(--phosphor-rgb),0.5)',
            animation: 'cc-blink 1s step-end infinite',
          }}>
            {'>> ENTERING TUNNELCORE'}
          </div>
        </div>
      );

    default:
      return null;
  }
}
