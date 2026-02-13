import { useState, useCallback, useRef } from 'react';
import { CommandOutput, ShellState } from '@/types/shell.types';
import { executeCommand } from '@/lib/commandRegistry';

export function useShell() {
  const [state, setState] = useState<ShellState>({
    history: [],
    currentDirectory: '/',
    commandHistory: [],
    historyIndex: -1,
  });

  const historyEndRef = useRef<HTMLDivElement>(null);

  const addOutput = useCallback((output: CommandOutput) => {
    setState((prev) => ({
      ...prev,
      history: [...prev.history, output],
    }));

    setTimeout(() => {
      historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  }, []);

  const executeCommandLine = useCallback((input: string) => {
    const result = executeCommand(input);

    if (result.clearScreen) {
      setState((prev) => ({
        ...prev,
        history: [],
      }));
      return;
    }

    const output: CommandOutput = {
      id: Date.now().toString(),
      command: input,
      output: result.output,
      timestamp: Date.now(),
      error: result.error,
    };

    setState((prev) => ({
      ...prev,
      history: result.clearScreen ? [] : [...prev.history, output],
      commandHistory: [input, ...prev.commandHistory].slice(0, 100),
      historyIndex: -1,
    }));

    setTimeout(() => {
      historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 10);
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down'): string | null => {
    setState((prev) => {
      if (prev.commandHistory.length === 0) return prev;

      let newIndex = prev.historyIndex;

      if (direction === 'up') {
        newIndex = Math.min(prev.historyIndex + 1, prev.commandHistory.length - 1);
      } else {
        newIndex = Math.max(prev.historyIndex - 1, -1);
      }

      return { ...prev, historyIndex: newIndex };
    });

    if (state.historyIndex >= 0 && state.historyIndex < state.commandHistory.length) {
      return state.commandHistory[state.historyIndex];
    }

    return null;
  }, [state.historyIndex, state.commandHistory]);

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, history: [] }));
  }, []);

  return {
    history: state.history,
    executeCommand: executeCommandLine,
    navigateHistory,
    clearHistory,
    historyEndRef,
  };
}
