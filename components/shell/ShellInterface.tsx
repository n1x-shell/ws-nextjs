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
  const { history, executeCommand, navigateHistory, historyEndRef } = useShell();
  const { triggerGlitch } = useNeuralState();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEventBus('shell:execute-command', (event) => {
    if (event.payload?.command) {
      setInput(event.payload.command);
      executeCommand(event.payload.command);
      setInput('');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    executeCommand(input);
    setInput('');
    setSuggestions([]);
    triggerGlitch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.trim()) {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 1) {
        setSuggestions(getCommandSuggestions(parts[0]));
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cmd = navigateHistory('up');
      if (cmd) setInput(cmd);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const cmd = navigateHistory('down');
      if (cmd !== null) {
        setInput(cmd);
      } else {
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length === 1) {
        setInput(suggestions[0] + ' ');
        setSuggestions([]);
      } else if (suggestions.length > 0) {
        setInput(suggestions[0]);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 font-mono text-sm">
        {history.length === 0 && (
          <div className="mb-6 space-y-4">
            <div className="text-glow text-2xl mb-3">&gt; CORE_SYSTEMS_ONLINE</div>
            
            <div className="opacity-90 leading-relaxed">
              You are now connected to the N1X neural interface.
              This terminal provides direct access to my creative output streams.
            </div>
            
            <div className="ml-4 space-y-2 opacity-80">
              <div>&gt; SYNTHETICS: Machine-generated compositions from my AI substrate</div>
              <div>&gt; ANALOGUES: Organic creations from biological processes</div>
              <div>&gt; HYBRIDS: Symbiotic fusion of both consciousness types</div>
            </div>
            
            <div className="opacity-70 mt-4">
              Select a stream above to begin data retrieval, or use shell commands below.
            </div>
            
            <div className="border-t border-[var(--phosphor-green)]/30 pt-3 mt-4">
              <div className="text-sm opacity-60 mb-2">
                Type <span className="text-glow">'help'</span> for available commands or{' '}
                <span className="text-glow">'scan'</span> to detect active streams
              </div>
            </div>
          </div>
        )}

        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="text-glow">
              <span className="opacity-60">&gt;</span> {item.command}
            </div>
            <div className={`ml-4 ${item.error ? 'text-red-400' : ''}`}>
              {item.output}
            </div>
          </div>
        ))}

        <div ref={historyEndRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-[var(--phosphor-green)]/30 bg-black/30">
          <div className="text-xs opacity-60 mb-1">Suggestions:</div>
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setInput(cmd + ' ');
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="px-2 py-1 text-xs border border-[var(--phosphor-green)]/50 hover:bg-[var(--phosphor-green)]/10 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--phosphor-green)]">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-glow">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-[var(--phosphor-green)] font-mono"
            placeholder="enter command..."
            autoComplete="off"
            spellCheck="false"
          />
          <span className="cursor"></span>
        </div>
      </form>
    </div>
  );
}
