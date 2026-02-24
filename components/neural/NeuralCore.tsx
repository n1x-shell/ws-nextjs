'use client';

import { NeuralProvider } from '@/contexts/NeuralContext';
import SignalLayer from './SignalLayer';
import InterfaceLayer from './InterfaceLayer';
import { useShellPresence } from '@/lib/useShellPresence';

function ShellPresenceMount() {
  useShellPresence();
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
