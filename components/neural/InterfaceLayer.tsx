'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNeuralState } from '@/contexts/NeuralContext';
import { useEventBus } from '@/hooks/useEventBus';
import ShellInterface from '../shell/ShellInterface';
import { eventBus } from '@/lib/eventBus';

export default function InterfaceLayer() {
  const { uptime, processorLoad, triggerGlitch } = useNeuralState();
  const screenContentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const schedule = () => {
      const delay = Math.random() * 6000 + 2000;
      setTimeout(() => {
        triggerGlitch();
        schedule();
      }, delay);
    };
    schedule();
  }, [triggerGlitch]);

  useEffect(() => {
    setTimeout(() => triggerGlitch(), 500);
    setTimeout(() => triggerGlitch(), 1200);
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
              className="border border-[var(--phosphor-green)]"
              style={{
                background: 'rgba(51,255,51,0.03)',
                flexShrink: 0,
                padding: '0.5rem 0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div
                    className="text-glow-strong"
                    style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2px' }}
                  >
                    N1X.sh
                  </div>
                  <div style={{ fontSize: 'var(--text-base)', opacity: 0.8 }}>
                    NEURAL_INTERFACE // TUNNELCORE_ACCESS_POINT
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 'var(--text-base)', opacity: 0.7 }}>
                  <div>&gt; INTERFACE_ACTIVE</div>
                  <div>&gt; RUNTIME: {formatUptime(uptime)}</div>
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
                      fontSize: 'var(--text-header)',  /* ← matches section headers */
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
                        eventBus.emit('shell:execute-command', { command: tab.cmd });
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
                fontSize: 'var(--text-base)',
                flexShrink: 0,
                padding: '0.3rem 0.75rem',
              }}
            >
              <div>
                <span className="status-dot" />
                <span>INTERFACE_STABLE</span>
              </div>
              <div>N1X.sh v2.0</div>
              <div>PROC: {processorLoad}</div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
