'use client';

import { useEffect, useState } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export default function useKonami(): boolean {
  const [activated, setActivated] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setSequence((prev) => {
        const newSequence = [...prev, e.key].slice(-KONAMI_CODE.length);
        
        if (newSequence.join('') === KONAMI_CODE.join('')) {
          setActivated(true);
          console.log('🎮 KONAMI CODE ACTIVATED! ↑↑↓↓←→←→BA');
        }
        
        return newSequence;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return activated;
}
