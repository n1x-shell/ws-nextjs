'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import PixiCRT from './PixiCRT';
import TabContent from './ui/TabContent';
import useKonami from '@/hooks/useKonami';

type Tab = 'home' | 'synthetics' | 'analogues' | 'hybrids' | 'uplink';

export default function Terminal() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [uptime, setUptime] = useState(0);
  const [processorLoad, setProcessorLoad] = useState('█████░░░░░');
  const [shouldGlitch, setShouldGlitch] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const screenContentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const konamiActivated = useKonami();

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loads = [
      '██████████',
      '█████████░',
      '████████░░',
      '███████░░░',
      '████████░░',
      '█████████░',
    ];
    
    const interval = setInterval(() => {
      setProcessorLoad(loads[Math.floor(Math.random() * loads.length)]);
    }, 800);
    
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
  }, []);

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
        setGlitchIntensity(1.0);
        setTimeout(() => setGlitchIntensity(0), 400);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeout(() => triggerGlitch(), 500);
    setTimeout(() => triggerGlitch(), 1200);
  }, []);

  const triggerGlitch = () => {
    setShouldGlitch(true);
    setGlitchIntensity(0.5);
    
    const glitchables = document.querySelectorAll('.text-glow, .text-glow-strong, .section-heading');
    if (glitchables.length > 0) {
      const randomEl = glitchables[Math.floor(Math.random() * glitchables.length)];
      randomEl.classList.add('glitch-text');
      setTimeout(() => randomEl.classList.remove('glitch-text'), 300);
    }
    
    setTimeout(() => {
      setShouldGlitch(false);
      setGlitchIntensity(0);
    }, 200);
  };

  const handleTabChange = (tab: Tab) => {
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.15,
        force3D: true,
        onComplete: () => {
          setActiveTab(tab);
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.3, force3D: true }
          );
        },
      });
    } else {
      setActiveTab(tab);
    }
    triggerGlitch();
  };

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
    <>
      <PixiCRT glitchIntensity={glitchIntensity} />
      
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
            className={`screen-content ${shouldGlitch ? 'glitch' : ''} w-full h-full relative`}
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
                className="terminal-content border border-[var(--phosphor-green)] p-4 overflow-y-auto overflow-x-hidden"
                style={{ 
                  background: 'rgba(51, 255, 51, 0.01)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--phosphor-green) var(--terminal-bg)',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <nav className="flex gap-2 mb-4 flex-wrap">
                  {[
                    { id: 'home' as Tab, label: 'CORE' },
                    { id: 'synthetics' as Tab, label: 'SYNTHETICS' },
                    { id: 'analogues' as Tab, label: 'ANALOGUES' },
                    { id: 'hybrids' as Tab, label: 'HYBRIDS' },
                    { id: 'uplink' as Tab, label: 'UPLINK' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`tab-btn px-3.5 py-1.5 border border-[var(--phosphor-green)] cursor-pointer transition-all uppercase tracking-wide ${
                        activeTab === tab.id
                          ? 'bg-[var(--phosphor-green)] text-[var(--terminal-bg)]'
                          : 'bg-transparent text-[var(--phosphor-green)]'
                      }`}
                      style={{
                        fontSize: '18px',
                        fontFamily: 'inherit',
                        boxShadow: activeTab === tab.id ? '0 0 8px rgba(51, 255, 51, 0.5)' : 'none',
                      }}
                      onClick={() => handleTabChange(tab.id)}
                      onMouseEnter={handleHover}
                      onTouchStart={handleHover}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>

                <TabContent activeTab={activeTab} konamiActivated={konamiActivated} />
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
    </>
  );
}
