'use client';

import { useState, useRef, useEffect } from 'react';
import { useShell } from '@/hooks/useShell';
import { getCommandSuggestions } from '@/lib/commandRegistry';
import { useEventBus } from '@/hooks/useEventBus';
import { useNeuralState } from '@/contexts/NeuralContext';

export default function ShellInterface() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const { history, executeCommand, navigateHistory, historyEndRef } = useShell();
  const { triggerGlitch } = useNeuralState();

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll only the output pane — never the page
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Listen for programmatic command execution (tab button​​​​​​​​​​​​​​​​
