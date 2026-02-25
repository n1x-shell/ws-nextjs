'use client';

import { NeuralProvider } from '@/contexts/NeuralContext';
import SignalLayerV2 from './SignalLayerV2';
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
      <InterfaceLayer />
      <SignalLayerV2 />
    </NeuralProvider>
  );
}
