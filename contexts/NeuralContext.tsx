'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { NeuralState, NeuralMode, Tab, SignalIntensity } from '@/types/neural.types';
import { eventBus } from '@/lib/eventBus';

interface NeuralContextType extends NeuralState {
  setMode: (mode: NeuralMode) => void;
  setActiveTab: (tab: Tab) => void;
  setGlitchIntensity: (intensity: SignalIntensity) => void;
  triggerGlitch: () => void;
  ghostUnlocked: boolean;
  unlockGhost: () => void;
}

const NeuralContext = createContext<NeuralContextType | undefined>(undefined);

export function NeuralProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NeuralState>({
    mode: 'active',
    activeTab: 'home',
    glitchIntensity: 0,
    uptime: 0,
    processorLoad: 'xxxxx.....',
    isBooting: true,
  });

  const [ghostUnlocked, setGhostUnlocked] = useState(false);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => ({ ...prev, uptime: prev.uptime + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Processor load randomizer
  useEffect(() => {
    const loads = [
      'xxxxxxxxxx',
      'xxxxxxxxx.',
      'xxxxxxxx..',
      'xxxxxxx...',
      'xxxxxxxx..',
      'xxxxxxxxx.',
    ];
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        processorLoad: loads[Math.floor(Math.random() * loads.length)],
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence
  useEffect(() => {
    setTimeout(() => {
      setState((prev) => ({ ...prev, isBooting: false }));
      eventBus.emit('neural:boot-complete');
    }, 1500);
  }, []);

  const setMode = (mode: NeuralMode) => {
    setState((prev) => ({ ...prev, mode }));
    eventBus.emit('neural:mode-change', { mode });
  };

  const setActiveTab = (tab: Tab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
    eventBus.emit('neural:tab-change', { tab });
  };

  const setGlitchIntensity = (intensity: SignalIntensity) => {
    setState((prev) => ({ ...prev, glitchIntensity: intensity }));
    eventBus.emit('neural:glitch-intensity', { intensity });
  };

  const triggerGlitch = () => {
    setGlitchIntensity(0.5);
    setTimeout(() => setGlitchIntensity(0), 200);
    eventBus.emit('neural:glitch-trigger');
  };

  const unlockGhost = () => {
    setGhostUnlocked(true);
    eventBus.emit('neural:ghost-unlocked');
  };

  return (
    <NeuralContext.Provider
      value={{
        ...state,
        setMode,
        setActiveTab,
        setGlitchIntensity,
        triggerGlitch,
        ghostUnlocked,
        unlockGhost,
      }}
    >
      {children}
    </NeuralContext.Provider>
  );
}

export function useNeuralState() {
  const context = useContext(NeuralContext);
  if (!context) {
    throw new Error('useNeuralState must be used within NeuralProvider');
  }
  return context;
}
