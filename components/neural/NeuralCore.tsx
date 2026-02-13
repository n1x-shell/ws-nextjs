'use client';

import { NeuralProvider } from '@/contexts/NeuralContext';
import SignalLayer from './SignalLayer';
import InterfaceLayer from './InterfaceLayer';

export default function NeuralCore() {
  return (
    <NeuralProvider>
      <SignalLayer />
      <InterfaceLayer />
    </NeuralProvider>
  );
}
