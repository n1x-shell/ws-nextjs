‘use client’;

import { useState, useRef, useEffect, useCallback } from ‘react’;
import { useShell } from ‘@/hooks/useShell’;
import { getCommandSuggestions } from ‘@/lib/commandRegistry’;
import { useEventBus } from ‘@/hooks/useEventBus’;
import { useNeuralState } from ‘@/contexts/NeuralContext’;

export default function ShellInterface() {
const [input, setInput] = useState(’’);
const [suggestions, setSuggestions] = useState<string[]>([]);
const inputRef = useRef<HTMLInputElement>(null);
const outputRef = useRef<HTMLDivElement>(null);
const { history, executeCommand, navigateHistory, historyEndRef } = useShell();
const { triggerGlitch, unlockGhost } = useNeuralState();

// Auto-focus
useEffect(() => {
inputRef.current?.focus();
}, []);

// Scroll ONLY the output div
useEffect(() => {
const el = outputRef.current;
if (!el) return;
requestAnimationFrame(() => {
requestAnimationFrame(() => {
el.scrollTop = el.scrollHeight;
});
});
}, [history]);

// Hard-stop scroll events from reaching the page
useEffect(() => {
const el = outputRef.current;
if (!el) return;
const stopProp = (e: Event) => e.stopPropagation();
el.addEventListener(‘wheel’,      stopProp, { passive: true });
el.addEventListener(‘touchstart’, stopProp, { passive: true });
el.addEventListener(‘touchmove’,  stopProp, { passive: true });
el.addEventListener(‘touchend’,   stopProp, { passive: true });
return () => {
el.removeEventListener(‘wheel’,      stopProp);
el.removeEventListener(‘touchstart’, stopProp);
el.removeEventListener(‘touchmove’,  stopProp);
el.removeEventListener(‘touchend’,   stopProp);
};
}, []);

// Tab button commands
useEventBus(‘shell:execute-command’, (event) => {
if (event.payload?.command) {
executeCommand(event.payload.command);
setInput(’’);
setSuggestions([]);
}
});

// Listen directly to neural:konami
// Fires staggered output after 4s flat matching the GSAP sequence duration
useEventBus(‘neural:konami’, () => {
const SEQUENCE_DURATION = 4000;

```
setTimeout(() => {
  unlockGhost();
}, SEQUENCE_DURATION);

const lines = [
  { delay: SEQUENCE_DURATION + 100,  cmd: '>> DEEP_ACCESS_GRANTED'     },
  { delay: SEQUENCE_DURATION + 600,  cmd: '>> GHOST_CHANNEL_DECRYPTED' },
  { delay: SEQUENCE_DURATION + 1200, cmd: '>> /ghost mounted'          },
  { delay: SEQUENCE_DURATION + 1800, cmd: 'cd /ghost'                  },
  { delay: SEQUENCE_DURATION + 2200, cmd: 'ls'                         },
];

lines.forEach(({ delay, cmd }) => {
  setTimeout(() => {
    executeCommand(cmd);
  }, delay);
});
```

});

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
if (!input.trim()) return;
executeCommand(input);
setInput(’’);
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
if (e.key === ‘ArrowUp’) {
e.preventDefault();
const cmd = navigateHistory(‘up’);
if (cmd) setInput(cmd);
} else if (e.key === ‘ArrowDown’) {
e.preventDefault();
setInput(navigateHistory(‘down’) ?? ‘’);
} else if (e.key === ‘Tab’) {
e.preventDefault();
if (suggestions.length === 1) {
setInput(suggestions[0] + ’ ’);
setSuggestions([]);
} else if (suggestions.length > 0) {
setInput(suggestions[0]);
}
}
};

const handleShellClick = useCallback(() => {
inputRef.current?.focus();
}, []);

return (
<div
onClick={handleShellClick}
style={{
display: ‘flex’,
flexDirection: ‘column’,
width: ‘100%’,
height: ‘100%’,
minHeight: 0,
overflow: ‘hidden’,
fontSize: ‘var(–text-base)’,
touchAction: ‘none’,
}}
>
{/* Output pane - ONLY this scrolls */}
<div
ref={outputRef}
className=“shell-output”
style={{
flex: ‘1 1 0%’,
minHeight: 0,
overflowY: ‘auto’,
overflowX: ‘hidden’,
padding: ‘0.75rem’,
overscrollBehavior: ‘contain’,
WebkitOverflowScrolling: ‘touch’,
touchAction: ‘pan-y’,
fontSize: ‘var(–text-base)’,
}}
>
{/* MOTD */}
{history.length === 0 && (
<div style={{ marginBottom: ‘1.5rem’ }}>
<div
className=“text-glow”
style={{ fontSize: ‘var(–text-header)’, marginBottom: ‘0.75rem’ }}
>
> CORE_SYSTEMS_ONLINE
</div>

```
        <div style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: '0.75rem' }}>
          You are now connected to the N1X neural interface.
          This terminal provides direct access to my creative output streams.
        </div>

        <div style={{ marginLeft: '1rem', opacity: 0.8, lineHeight: 1.8 }}>
          <div>&gt; SYNTHETICS: Machine-generated compositions from my AI substrate</div>
          <div>&gt; ANALOGUES: Organic creations from biological processes</div>
          <div>&gt; HYBRIDS: Symbiotic fusion of both consciousness types</div>
        </div>

        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(51,255,51,0.3)',
            opacity: 0.6,
          }}
        >
          Type <span className="text-glow">&apos;help&apos;</span> for commands &middot;{' '}
          <span className="text-glow">&apos;scan&apos;</span> to detect streams &middot;{' '}
          <span className="text-glow">&apos;tracks&apos;</span> to list music
        </div>
      </div>
    )}

    {/* Command history */}
    {history.map((item) => (
      <div key={item.id} style={{ marginBottom: '0.75rem' }}>
        {item.command.startsWith('>>') ? (
          <div
            className="text-glow"
            style={{
              marginBottom: '0.25rem',
              fontSize: 'var(--text-header)',
              letterSpacing: '0.05em',
            }}
          >
            {item.command}
          </div>
        ) : (
          <div className="text-glow" style={{ marginBottom: '0.25rem' }}>
            <span style={{ opacity: 0.4 }}>n1x@core:~$</span>{' '}
            {item.command}
          </div>
        )}

        {item.output != null && (
          <div
            style={{
              marginLeft: item.command.startsWith('>>') ? 0 : '1rem',
              color: item.error ? '#f87171' : 'var(--phosphor-green)',
            }}
          >
            {item.output}
          </div>
        )}
      </div>
    ))}

    <div ref={historyEndRef} />
  </div>

  {/* Autocomplete */}
  {suggestions.length > 0 && (
    <div
      style={{
        flexShrink: 0,
        padding: '0.4rem 0.75rem',
        borderTop: '1px solid rgba(51,255,51,0.2)',
        background: 'rgba(0,0,0,0.7)',
        fontSize: 'var(--text-base)',
        touchAction: 'none',
      }}
    >
      <span style={{ opacity: 0.4, marginRight: '0.5rem' }}>tab:</span>
      <span style={{ display: 'inline-flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {suggestions.map((cmd) => (
          <button
            key={cmd}
            onClick={(e) => {
              e.stopPropagation();
              setInput(cmd + ' ');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            style={{
              padding: '0 0.4rem',
              fontSize: 'var(--text-base)',
              fontFamily: 'inherit',
              background: 'transparent',
              color: 'var(--phosphor-green)',
              border: '1px solid rgba(51,255,51,0.4)',
              cursor: 'pointer',
            }}
          >
            {cmd}
          </button>
        ))}
      </span>
    </div>
  )}

  {/* Input line */}
  <form
    onSubmit={handleSubmit}
    style={{
      flexShrink: 0,
      padding: '0.5rem 0.75rem',
      borderTop: '1px solid var(--phosphor-green)',
      background: 'rgba(0,0,0,0.3)',
      fontSize: 'var(--text-base)',
      touchAction: 'none',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'inherit' }}>
      <span className="text-glow" style={{ opacity: 0.6, whiteSpace: 'nowrap' }}>
        n1x@core:~$
      </span>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--phosphor-green)',
          fontFamily: 'inherit',
          fontSize: 'var(--text-base)',
          caretColor: 'var(--phosphor-green)',
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <span className="cursor" />
    </div>
  </form>
</div>
```

);
}
