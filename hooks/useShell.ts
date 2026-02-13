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

  // Still exported so ShellInterface can use it as a scroll anchor ref
  // but we never call scrollIntoView on it — ShellInterface owns scrolling
  const historyEndRef = useRef<HTMLDivElement>(null);

  const executeCommandLine = useCallback((input: string) => {
    const result = executeCommand(input);

    if (result.clearScreen) {
      setState((prev) => ({ ...prev, history: [] }));
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
      history: [...prev.history, output],
      commandHistory: [input, ...prev.commandHistory].slice(0, 100),
      historyIndex: -1,
    }));

    // NO scrollIntoView here — ShellInterface handles scrolling
    // via outputRef.scrollTop = outputRef.scrollHeight
  }, []);

  const navigateHistory = useCallback(
    (direction: 'up' | 'down'): string | null => {
      let result: string | null = null;

      setState((prev) => {
        if (prev.commandHistory.length === 0) return prev;

        let newIndex = prev.historyIndex;

        if (direction === 'up') {
          newIndex = Math.min(prev.historyIndex + 1, prev.commandHistory.length - 1);
        } else {
          newIndex = Math.max(prev.historyIndex - 1, -1);
        }

        result = newIndex >= 0 ? prev.commandHistory[newIndex] : null;
        return { ...prev, historyIndex: newIndex };
      });

      return result;
    },
    []
  );

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
