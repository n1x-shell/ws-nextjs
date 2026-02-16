import { useState, useCallback, useRef, useEffect } from 'react';
import { CommandOutput, ShellState } from '@/types/shell.types';
import { executeCommand } from '@/lib/commandRegistry';
import { eventBus } from '@/lib/eventBus';

export type RequestPromptFn = (label: string, onSubmit: (pw: string) => void) => void;

export function useShell(requestPrompt?: RequestPromptFn) {
  const [state, setState] = useState<ShellState>({
    history: [],
    currentDirectory: '/',
    commandHistory: [],
    historyIndex: -1,
  });

  const historyEndRef = useRef<HTMLDivElement>(null);

  // Stable ref so the eventBus listener always sees the latest requestPrompt
  const requestPromptRef = useRef<RequestPromptFn | undefined>(requestPrompt);
  useEffect(() => { requestPromptRef.current = requestPrompt; }, [requestPrompt]);

  // ── Listen for shell:push-output (async output from su, sudo, john, nc, strace) ──
  useEffect(() => {
    const unsub = eventBus.on('shell:push-output', (event) => {
      const { command, output, error } = event.payload || {};
      const entry: CommandOutput = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        command: command ?? '',
        output: output ?? null,
        timestamp: Date.now(),
        error: !!error,
      };
      setState((prev) => ({
        ...prev,
        history: [...prev.history, entry],
      }));
    });
    return unsub;
  }, []);

  // ── Listen for shell:execute-command (re-dispatch from sudo) ──
  useEffect(() => {
    const unsub = eventBus.on('shell:execute-command', (event) => {
      const cmd = event.payload?.command;
      if (!cmd) return;
      const noopPrompt: RequestPromptFn = () => {};
      const result = executeCommand(cmd, requestPromptRef.current ?? noopPrompt);

      if (result.clearScreen) {
        setState((prev) => ({ ...prev, history: [] }));
        return;
      }

      const entry: CommandOutput = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        command: cmd,
        output: result.output,
        timestamp: Date.now(),
        error: result.error,
      };
      setState((prev) => ({
        ...prev,
        history: [...prev.history, entry],
      }));
    });
    return unsub;
  }, []);

  const executeCommandLine = useCallback((input: string) => {
    const noopPrompt: RequestPromptFn = () => {};
    const result = executeCommand(input, requestPrompt ?? noopPrompt);

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
  }, [requestPrompt]);

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
