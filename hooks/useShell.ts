import { useState, useCallback, useRef } from 'react';
import { CommandOutput, ShellState } from '@/types/shell.types';
import { executeCommand, getCurrentDirectory } from '@/lib/commandRegistry';
import { eventBus } from '@/lib/eventBus';

export type RequestPromptFn = (label: string, onSubmit: (value: string) => void) => void;

export function useShell() {
  const [state, setState] = useState<ShellState>({
    history: [],
    currentDirectory: '/',
    commandHistory: [],
    historyIndex: -1,
  });

  const historyEndRef = useRef<HTMLDivElement>(null);

  // Mutable ref so the current requestPrompt is always available
  const requestPromptRef = useRef<RequestPromptFn>(() => {});

  const setRequestPrompt = useCallback((fn: RequestPromptFn) => {
    requestPromptRef.current = fn;
  }, []);

  // ── User tracking via shell:set-user event (authoritative source) ────────
  const currentUserRef = useRef<string>('ghost');
  const [currentUser, setCurrentUser] = useState<string>('ghost');

  const userListenerAttached = useRef(false);
  if (!userListenerAttached.current) {
    eventBus.on('shell:set-user', (event) => {
      const user = event.payload?.user;
      if (user === 'root') {
        currentUserRef.current = 'root';
        setCurrentUser('root');
      } else {
        currentUserRef.current = 'ghost';
        setCurrentUser('ghost');
      }
    });
    userListenerAttached.current = true;
  }

  // Listen for shell:push-output from async command sequences (john, strace, nc, su, sudo)
  const pushOutputListenerAttached = useRef(false);
  if (!pushOutputListenerAttached.current) {
    eventBus.on('shell:push-output', (event) => {
      const payload = event.payload || event;
      setState((prev) => ({
        ...prev,
        history: [
          ...prev.history,
          {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            command: payload.command ?? '',
            output: payload.output,
            timestamp: Date.now(),
            error: payload.error,
            cwd: getCurrentDirectory(),
            user: currentUserRef.current,
          },
        ],
      }));
    });
    pushOutputListenerAttached.current = true;
  }

  const executeCommandLine = useCallback((input: string) => {
    // Snapshot prompt context BEFORE execution (cd changes dir during handler)
    const cwdBefore  = getCurrentDirectory();
    const userBefore = currentUserRef.current;

    const result = executeCommand(input, requestPromptRef.current);

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
      cwd: cwdBefore,
      user: userBefore,
    };

    setState((prev) => ({
      ...prev,
      history: [...prev.history, output],
      commandHistory: [input, ...prev.commandHistory].slice(0, 100),
      historyIndex: -1,
    }));
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
    setRequestPrompt,
    currentUser,
  };
}
