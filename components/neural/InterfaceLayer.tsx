'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useNeuralState } from '@/contexts/NeuralContext';
import { useEventBus } from '@/hooks/useEventBus';
import ShellInterface from '../shell/ShellInterface';
import { eventBus } from '@/lib/eventBus';
import { deactivateTelnet } from '@/lib/telnetBridge';
import { isChatMode, setChatMode, resetConversation } from '@/components/shell/NeuralLink';

// Parse processorLoad from context (may be "42", "42%", or a number) into 0–100
function seedLoad(raw: number | string): number {
  const parsed = typeof raw === 'string' ? parseFloat(raw) : raw;
  const n = isNaN(parsed) ? 42 : parsed;
  return Math.max(10, Math.min(90, n));
}

// Self-animating proc bar — 600ms tick, narrow 12-char bar
function ProcBar({ seed }: { seed: number | string }) {
  const BAR_WIDTH = 12;
  const [load, setLoad] = useState<number>(() => seedLoad(seed));

  useEffect(() => {
    const tick = () => {
      setLoad(prev => {
        const base  = seedLoad(seed);
        const drift = (Math.random() - 0.5) * 12;   // ±6
        const pull  = (base - prev) * 0.2;           // mean-reversion
        const next  = prev + drift + pull;
        return Math.round(Math.max(10, Math.min(90, next)));
      });
    };
    const id = setInterval(tick, 600);
    return () => clearInterval(id);
  }, [seed]);

  const filled = Math.round((load / 100) * BAR_WIDTH);
  const empty  = BAR_WIDTH - filled;
  const bar    = '█'.repeat(filled) + '░'.repeat(empty);
  const pct    = load.toString().padStart(3, '\u00A0') + '%';

  return (
    <span style={{ fontFamily: 'inherit', letterSpacing: 0 }}>
      PROC: [{bar}]{'\u00A0'}{pct}
    </span>
  );
}

export default function InterfaceLayer() {
  const { uptime, processorLoad, triggerGlitch } = useNeuralState();
  const screenContentRef = useRef<HTMLDivElement>(null);

  // SESSION: visit count from localStorage (incremented by TelnetSession on mount)
  const [sessionCount, setSessionCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const raw = localStorage.getItem('n1x_substrate');
      if (!raw) return 0;
      return JSON.parse(raw)?.sessionCount ?? 0;
    } catch { return 0; }
  });
  // Keep in sync if another tab or TelnetSession increments it
  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem('n1x_substrate');
        if (!raw) return;
        const val = JSON.parse(raw)?.sessionCount ?? 0;
        setSessionCount(val);
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    // Also poll once a second to catch same-tab updates from TelnetSession
    const id = setInterval(onStorage, 1000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(id); };
  }, []);

  // NODES: poll /api/nodes every 5s for presence count.
  // Also listens to mesh:node-count for instant updates when this client is in chat.
  const [nodeCount, setNodeCount] = useState(4);
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/nodes');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.count === 'number') setNodeCount(data.count);
      } catch { /* ignore */ }
    };
    poll(); // immediate on mount
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);
  // Instant update when this client is connected to the room
  useEventBus('mesh:node-count', (event) => {
    const count = (event as any)?.payload?.count ?? (event as any)?.count;
    if (typeof count === 'number') setNodeCount(count);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95 && screenContentRef.current) {
        gsap.to(screenContentRef.current, {
          duration: 0.1,
          x: () => Math.random() * 4 - 2,
          y: () => Math.random() * 4 - 2,
          repeat: 3,
          yoyo: true,
          ease: 'none',
          force3D: true,
          onComplete: () => {
            gsap.set(screenContentRef.current, { x: 0, y: 0 });
          },
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Stochastic glitch scheduler — single chain, properly cleaned up
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const schedule = () => {
      const delay = Math.random() * 6000 + 2000;
      timerId = setTimeout(() => {
        if (cancelled) return;
        triggerGlitch();
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [triggerGlitch]);

  // Initial glitch burst on mount
  useEffect(() => {
    const t1 = setTimeout(() => triggerGlitch(), 500);
    const t2 = setTimeout(() => triggerGlitch(), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [triggerGlitch]);

  useEventBus('neural:glitch-trigger', () => {
    const els = document.querySelectorAll('.text-glow, .text-glow-strong');
    if (els.length > 0) {
      const el = els[Math.floor(Math.random() * els.length)];
      el.classList.add('glitch-text');
      setTimeout(() => el.classList.remove('glitch-text'), 300);
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('tab-btn')) triggerGlitch();
  };

  const handleHover = () => {
    if (Math.random() > 0.7) triggerGlitch();
  };

  const formatUptime = (s: number) => {
    const h   = Math.floor(s / 3600).toString().padStart(2, '0');
    const m   = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        padding: '3vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)',
      }}
      onClick={handleClick}
    >
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .status-dot-blink {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--phosphor-green);
          margin-right: 6px;
          animation: blink 1.2s step-start infinite;
          vertical-align: middle;
          position: relative;
          top: -1px;
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'var(--terminal-bg)',
          borderRadius: '12px',
          boxShadow: `
            inset 0 0 100px rgba(0,0,0,0.9),
            inset 0 0 20px rgba(51,255,51,0.1),
            0 0 40px rgba(51,255,51,0.2)
          `,
          transform: 'perspective(1000px)',
        }}
      >
        <div
          className="scanlines"
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 998,
            pointerEvents: 'none',
            background: `radial-gradient(
              ellipse at center,
              transparent 0%,
              transparent 60%,
              rgba(51,255,51,0.05) 80%,
              rgba(51,255,51,0.1) 100%
            )`,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 997,
            pointerEvents: 'none',
            background: `radial-gradient(
              ellipse at center,
              transparent 30%,
              rgba(0,0,0,0.7) 100%
            )`,
          }}
        />

        <div
          ref={screenContentRef}
          className="screen-content"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            filter: 'contrast(1.1) brightness(1.05)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto',
              gap: '0.75rem',
              padding: '1rem',
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <header
              className="border border-[var(--phosphor-green)] n1x-header"
              style={{
                background: 'rgba(51,255,51,0.03)',
                flexShrink: 0,
                padding: '0.5rem 0.75rem',
              }}
            >
              <style>{`
                .n1x-header-inner {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 0.5rem;
                  min-width: 0;
                }
                .n1x-header-left {
                  display: flex;
                  align-items: baseline;
                  gap: 0.6rem;
                  min-width: 0;
                  flex: 1;
                  overflow: hidden;
                }
                .n1x-header-title {
                  font-size: 20px;
                  font-weight: bold;
                  flex-shrink: 0;
                }
                .n1x-header-sub {
                  font-size: var(--text-base);
                  opacity: 0.7;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  min-width: 0;
                }
                .n1x-header-right {
                  text-align: right;
                  font-size: var(--text-base);
                  opacity: 0.7;
                  flex-shrink: 0;
                  white-space: nowrap;
                }
                @media (max-width: 480px) {
                  .n1x-header-sub   { display: none; }
                  .n1x-header-title { font-size: 17px; }
                }
              `}</style>
              <div className="n1x-header-inner">
                <div className="n1x-header-left">
                  <div className="text-glow-strong n1x-header-title">N1X.sh</div>
                  <div className="n1x-header-sub">
                    NEURAL_INTERFACE // TUNNELCORE_ACCESS_POINT
                  </div>
                </div>
                <div className="n1x-header-right">
                  <div>&gt; RUNTIME: {formatUptime(uptime)}&nbsp;|&nbsp;SESSION: {sessionCount}&nbsp;|&nbsp;NODES: {nodeCount}</div>
                </div>
              </div>
            </header>

            {/* ── Main ── */}
            <main
              className="border border-[var(--phosphor-green)]"
              style={{
                background: 'rgba(51,255,51,0.01)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Tab nav */}
              <nav
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  padding: '0.6rem 0.75rem 0',
                  flexShrink: 0,
                  borderBottom: '1px solid rgba(51,255,51,0.3)',
                }}
              >
                {[
                  { label: 'CORE',       cmd: 'clear' },
                  { label: 'SYNTHETICS', cmd: 'load synthetics' },
                  { label: 'ANALOGUES',  cmd: 'load analogues' },
                  { label: 'HYBRIDS',    cmd: 'load hybrids' },
                  { label: 'UPLINK',     cmd: 'load uplink' },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    className="tab-btn"
                    style={{
                      padding: '0.2rem 0.6rem',
                      fontSize: 'var(--text-header)',
                      fontFamily: 'inherit',
                      background: 'transparent',
                      color: 'var(--phosphor-green)',
                      border: '1px solid var(--phosphor-green)',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'rgba(51,255,51,0.1)';
                      handleHover();
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'transparent';
                    }}
                    onTouchStart={handleHover}
                    onClick={() => {
                      if (tab.cmd) {
                        deactivateTelnet();
                        setChatMode(false);
                        resetConversation();
                        eventBus.emit('shell:clear');
                        setTimeout(() => {
                          eventBus.emit('shell:execute-command', { command: tab.cmd });
                        }, 50);
                      }
                      triggerGlitch();
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Shell */}
              <div
                style={{
                  flex: '1 1 0%',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <ShellInterface />
              </div>
            </main>

            {/* ── Footer ── */}
            <footer
              className="border border-[var(--phosphor-green)]"
              style={{
                background: 'rgba(51,255,51,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'var(--text-base)',
                flexShrink: 0,
                padding: '0.3rem 0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="status-dot-blink" />
                <span>N1X.sh v2.0</span>
              </div>
              <div>
                <ProcBar seed={processorLoad} />
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
