'use client';

import { NeuralProvider } from '@/contexts/NeuralContext';
import SignalLayer from './SignalLayer';
import InterfaceLayer from './InterfaceLayer';
import { useShellPresence } from '@/lib/useShellPresence';
import { useFrequencyShift } from '@/lib/useFrequencyShift';

function ShellPresenceMount() {
  useShellPresence();
  useFrequencyShift();
  return null;
}

export default function NeuralCore() {
  return (
    <NeuralProvider>
      <ShellPresenceMount />
      <SignalLayer />
      <InterfaceLayer />
    </NeuralProvider>
  );
}
