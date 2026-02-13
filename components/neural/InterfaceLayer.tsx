'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useNeuralState } from '@/contexts/NeuralContext';
import { useEventBus } from '@/hooks/useEventBus';
import ShellInterface from '../shell/ShellInterface';
import { eventBus } from '@/lib/eventBus';

export default function InterfaceLayer() {
  const {
    uptime,
    processorLoad,
    triggerGlitch,
  } = useNeuralState();

  const screenContentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
          }
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scheduleRandomGlitch = () => {
      const delay = Math.random() * 6000 + 2000;
      setTimeout(() => {
        triggerGlitch();
        scheduleRandomGlitch();
      }, delay);
    };
    
    scheduleRandomGlitch();
  }, [triggerGlitch]);

  useEffect(() => {
    setTimeout(() => triggerGlitch(), 500);
    setTimeout(() => triggerGlitch(), 1200);
  }, [triggerGlitch]);

  useEventBus('neural:glitch-trigger', () => {
    const glitchables = document.querySelectorAll('.text-glow, .text-glow-strong, .section-heading');
    if (glitchables.length > 0) {
      const randomEl = glitchables[Math.floor(Math.random() * glitchables.length)];
      randomEl.classList.add('glitch-text');
      setTimeout(() => randomEl.classList.remove('glitch-text'), 300);
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('tab-btn')) {
      triggerGlitch();
    }
  };

  const handleHover = () => {
    if (Math.random() > 0.7) {
      triggerGlitch();
    }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div 
      className="fixed inset-0"
      style={{
        background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        padding: '3vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)',
      }}
    >
      <div
        className="w-full h-full relative overflow-hidden"
        style={{
          background: 'var(--terminal-bg)',
          borderRadius: '12px',
          boxShadow: `
            inset 0 0 100px rgba(0, 0, 0, 0.9),
            inset 0 0 20px rgba(51, 255, 51, 0.1),
            0 0 40px rgba(51, 255, 51, 0.2)
          `,
          transform: 'perspective(1000px)',
        }}
        onClick={handleClick}
      >
        <div 
          className="scanlines"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 998,
            background: `radial-gradient(
              ellipse at center,
              transparent 0%,
              transparent 60%,
              rgba(51, 255, 51, 0.05) 80%,
              rgba(51, 255, 51, 0.1) 100%
            )`,
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 997,
            background: `radial-gradient(
              ellipse at center,
              transparent 30%,
              rgba(0, 0, 0, 0.7) 100%
            )`,
          }}
        />

        <div
          ref={screenContentRef}
          className="screen-content w-full h-full relative"
          style={{
            zIndex: 10,
            filter: 'contrast(1.1) brightness(1.05)',
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
        >
          <div className="terminal-container w-full h-full p-5 grid grid-rows-[auto_1fr_auto] gap-4">
            <header 
              className="terminal-header border border-[var(--phosphor-green)] p-3"
              style={{ background: 'rgba(51, 255, 51, 0.03)' }}
            >
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-glow-strong mb-1">N1X.sh</div>
                  <div className="text-sm md:text-base opacity-80">
                    NEURAL_INTERFACE // TUNNELCORE_ACCESS_POINT
                  </div>
                </div>
                <div className="text-right text-sm opacity-70">
                  <div>&gt; INTERFACE_ACTIVE</div>
                  <div>&gt; RUNTIME: {formatUptime(uptime)}</div>
                </div>
              </div>
            </header>

            <main 
              ref={contentRef}
              className="terminal-content border border-[var(--phosphor-green)] overflow-hidden flex flex-col"
              style={{ 
                background: 'rgba(51, 255, 51, 0.01)',
              }}
            >
              <nav className="flex gap-2 p-4 pb-0 flex-wrap border-b border-[var(--phosphor-green)]/30">
                {[
                  { label: 'CORE', cmd: null },
                  { label: 'SYNTHETICS', cmd: 'load synthetics' },
                  { label: 'ANALOGUES', cmd: 'load analogues' },
                  { label: 'HYBRIDS', cmd: 'load hybrids' },
                  { label: 'UPLINK', cmd: 'load uplink' },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    className="tab-btn px-3.5 py-1.5 border border-[var(--phosphor-green)] cursor-pointer transition-all uppercase tracking-wide bg-transparent text-[var(--phosphor-green)] hover:bg-[var(--phosphor-green)]/10"
                    style={{
                      fontSize: '18px',
                      fontFamily: 'inherit',
                    }}
                    onClick={() => {
                      if (tab.cmd) {
                        eventBus.emit('shell:execute-command', { command: tab.cmd });
                      }
                      triggerGlitch();
                    }}
                    onMouseEnter={handleHover}
                    onTouchStart={handleHover}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="flex-1 overflow-hidden">
                <ShellInterface />
              </div>
            </main>

            <footer 
              className="terminal-footer border border-[var(--phosphor-green)] px-4 py-2 flex justify-between text-sm"
              style={{ background: 'rgba(51, 255, 51, 0.03)' }}
            >
              <div>
                <span className="status-dot"></span>
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
