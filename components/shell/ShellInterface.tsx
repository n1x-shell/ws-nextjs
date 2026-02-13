'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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

  // Auto-focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll ONLY the output div — never the page
  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;
    // requestAnimationFrame ensures the DOM has painted new content first
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [history]);

  // Prevent wheel/touch events from reaching the page
  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;

    const stopPropagation = (e: WheelEvent | TouchEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel',      stopPropagation, { passive: true });
    el.addEventListener('touchmove',  stopPropagation, { passive: true });

    return () => {
      el.removeEventListener('wheel',     stopPropagation);
      el.removeEventListener('touchmove', stopPropagation);
    };
  }, []);

  // Programmatic command execution (tab button clicks)
  useEventBus('shell:execute-command', (event) => {
    if (event.payload?.command) {
      executeCommand(event.payload.command);
      setInput('');
      setSuggestions([]);
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
      setSuggestions(parts.length === 1 ? getCommandSuggestions(parts[0]) : []);
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
      setInput(cmd ?? '');
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

  // Refocus input if user clicks anywhere in the shell
  const handleShellClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    /*
      Outer wrapper: fills parent, never overflows.
      display:flex + flex-direction:column + minHeight:0
      is the key chain that keeps everything inside.
    */
    <div
      onClick={handleShellClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── Output pane — the ONLY thing that scrolls ── */}
      <div
        ref={outputRef}
        className="shell-output"
        style={{
          flex: '1 1 0%',   /* grow to fill, shrink as needed */
          minHeight: 0,     /* without this flex ignores parent height */
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1rem',
          /* contain scroll entirely within this element */
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* MOTD — shown only before first command */}
        {history.length === 0 && (
          <div className="mb-6 space-y-4 font-mono text-sm">
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
              <span className="text-sm opacity-60">
                Type <span className="text-glow">'help'</span> for commands ·{' '}
                <span className="text-glow">'scan'</span> to detect streams ·{' '}
                <span className="text-glow">'tracks'</span> to list music
              </span>
            </div>
          </div>
        )}

        {/* Command output history */}
        {history.map((item) => (
          <div key={item.id} className="mb-4 font-mono text-sm">
            {/* Echoed command */}
            <div className="text-glow mb-1">
              <span className="opacity-40">n1x@core:~$</span>{' '}
              {item.command}
            </div>
            {/* Output */}
            {item.output && (
              <div
                className={
                  item.error
                    ? 'ml-4 text-red-400'
                    : 'ml-4 text-[var(--phosphor-green)]'
                }
              >
                {item.output}
              </div>
            )}
          </div>
        ))}

        {/* Invisible anchor — scroll target */}
        <div ref={historyEndRef} />
      </div>

      {/* ── Autocomplete — sits above input, never pushes page ── */}
      {suggestions.length > 0 && (
        <div
          style={{
            flexShrink: 0,
            padding: '0.5rem 1rem',
            borderTop: '1px solid rgba(51,255,51,0.2)',
            background: 'rgba(0,0,0,0.7)',
          }}
        >
          <span className="text-xs opacity-40 mr-2 font-mono">tab:</span>
          <div className="inline-flex gap-2 flex-wrap">
            {suggestions.map((cmd) => (
              <button
                key={cmd}
                onClick={(e) => {
                  e.stopPropagation();
                  setInput(cmd + ' ');
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="px-2 py-0.5 text-xs border border-[var(--phosphor-green)]/40 hover:bg-[var(--phosphor-green)]/10 font-mono transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input line — always pinned to bottom ── */}
      <form
        onSubmit={handleSubmit}
        style={{
          flexShrink: 0,
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--phosphor-green)',
          background: 'rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-glow opacity-60 whitespace-nowrap">n1x@core:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent border-none outline-none text-[var(--phosphor-green)] font-mono caret-[var(--phosphor-green)]"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <span className="cursor" />
        </div>
      </form>
    </div>
  );
}
