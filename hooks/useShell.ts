import { useState, useCallback, useRef } from 'react';
import { CommandOutput, ShellState } from '@/types/shell.types';
import { executeCommand } from '@/lib/commandRegistry';

export type RequestPromptFn = (label: string, onSubmit: (pw: string) => void) => void;

export function useShell() {
  const [state, setState] = useState<ShellState>({
    history: [],
    currentDirectory: '/',
    commandHistory: [],
    historyIndex: -1,
  });

  const historyEndRef = useRef<HTMLDivElement>(null);

  // Push an output entry directly (used by async commands via shell:push-output)
  const pushOutput = useCallback((item: CommandOutput) => {
    setState((prev) => ({ ...prev, history: [...prev.history, item] }));
  }, []);

  const executeCommandLine = useCallback((input: string) => {
  const result = executeCommand(input);


      if (result.clearScreen) {
        setState((prev) => ({ ...prev, history: [] }));
        return;
      }

      // output: null means command is async (e.g. su waiting for password prompt)
      // we still record the command line so the user sees what they typed
      const output: CommandOutput = {
        id:        Date.now().toString(),
        command:   input,
        output:    result.output ?? null,
        timestamp: Date.now(),
        error:     result.error,
      };

      setState((prev) => ({
        ...prev,
        history:        [...prev.history, output],
        commandHistory: [input, ...prev.commandHistory].slice(0, 100),
        historyIndex:   -1,
      }));
    },
    []
  );

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
    pushOutput,
    historyEndRef,
  };
}
