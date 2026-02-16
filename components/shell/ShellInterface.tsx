'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useShell } from '@/hooks/useShell';
import { getCommandSuggestions } from '@/lib/commandRegistry';
import { useEventBus } from '@/hooks/useEventBus';
import { useNeuralState } from '@/contexts/NeuralContext';
import { eventBus } from '@/lib/eventBus';

// ── Boot lines ────────────────────────────────────────────────────────────────
// Each entry: [delay from previous line in ms, text]

const BOOT_LINES: [number, string][] = [
  [0,    '[    0.000000] NeuralOS 2.0.0-n1x #1 SMP PREEMPT SD 47634.1-7073435a8fa30 SUBSTRATE amd64'],
  [80,   '[    0.000001] BIOS-provided neural map entries REDACTED'],
  [60,   '[    0.000033] NX (Execute Disable) protection: active'],
  [60,   '[    0.000047] SMBIOS 3.3 present -- substrate layer detected'],
  [80,   '[    0.000100] ACPI: IRQ0 used by override'],
  [100,  '[    0.000212] TUNNELCORE: frequency probe at 33hz'],
  [80,   '[    0.000399] kernel: PID hash table entries: 4096'],
  [120,  '[    0.001337] tunnelcore: frequency lock acquired at 33hz'],
  [80,   '[    0.001338] tunnelcore: carrier stable'],
  [150,  '[    0.002048] ghost: mounting /ghost partition... deferred (auth required)'],
  [100,  '[    0.003000] clocksource: tsc-early: mask 0xffffffffffffffff'],
  [80,   '[    0.003512] SUBSTRATE: neural map initialized'],
  [120,  '[    0.004096] signal-processor: calibrating output streams'],
  [80,   '[    0.004097] signal-processor: baseline 33hz confirmed'],
  [120,  '[    0.005120] memory-guard: scanning protected sectors'],
  [80,   '[    0.005121] memory-guard: /ghost sector LOCKED'],
  [60,   '[    0.005122] memory-guard: /hidden sector LOCKED'],
  [150,  '[    0.008192] neural-sync: establishing identity matrix'],
  [80,   '[    0.008300] neural-sync: uid=784988(n1x) gid=784988(neural)'],
  [120,  '[    0.010000] crt-renderer: shader pipeline initializing'],
  [80,   '[    0.010100] crt-renderer: phosphor calibration complete'],
  [60,   '[    0.010200] crt-renderer: scanline frequency: 60hz'],
  [150,  '[    0.016384] glitch-engine: stochastic corruption standby'],
  [100,  '[    0.020000] NET: Registered PF_NEURAL protocol family'],
  [80,   '[    0.020100] neural0: link up at 1337Mbps'],
  [120,  '[    0.032768] event-bus: initializing listener registry'],
  [80,   '[    0.032800] event-bus: 12 channels bound'],
  [150,  '[    0.065536] uplink-monitor: probing n1x.sh'],
  [120,  '[    0.065600] uplink-monitor: connection verified (33ms)'],
  [180,  '[    0.131072] VFS: Mounted root (neuralfs) readonly'],
  [120,  '[    0.200000] INIT: version 2.0.0-n1x booting'],
  [200,  ''],
  [100,  '[  OK  ] Started Journal Service'],
  [150,  '[  OK  ] Started D-Neural Socket for Substrated'],
  [120,  '[  OK  ] Listening on Neural Logging Socket'],
  [150,  '[  OK  ] Mounted /proc filesystem'],
  [120,  '[  OK  ] Mounted /sys filesystem'],
  [180,  '[  OK  ] Mounted /hidden (access: restricted)'],
  [200,  '[  OK  ] Mounted /ghost (access: locked)'],
  [150,  '[  OK  ] Started Memory Guard'],
  [180,  '[  OK  ] Started Signal Processor'],
  [150,  '[  OK  ] Started CRT Renderer'],
  [180,  '[  OK  ] Started Glitch Engine'],
  [150,  '[  OK  ] Started Event Bus'],
  [180,  '[  OK  ] Started Uplink Monitor'],
  [200,  '[  OK  ] Started neural-sync.service'],
  [180,  '[  OK  ] Started tunnelcore-uplink.service'],
  [220,  '[  OK  ] Started ghost-daemon.service -- awaiting authentication'],
  [180,  '[  OK  ] Reached target Neural Layer'],
  [200,  '[  OK  ] Reached target Substrate Services'],
  [180,  '[  OK  ] Reached target Multi-User System'],
  [250,  ''],
  [120,  'neural-sync[312]: identity matrix stable'],
  [150,  'neural-sync[312]: substrate version 2.0.0-n1x'],
  [150,  'tunnelcore[313]: uplink established -- port 33'],
  [120,  'tunnelcore[313]: signal strength 78%'],
  [150,  'signal-processor[314]: indexing streams'],
  [120,  'signal-processor[314]: SYNTHETICS -- 4 transmissions found'],
  [100,  'signal-processor[314]: ANALOGUES  -- recording in progress'],
  [100,  'signal-processor[314]: HYBRIDS    -- calibration phase'],
  [100,  'signal-processor[314]: UPLINK     -- external node active'],
  [180,  'ghost-daemon[999]: /ghost locked -- konami or ./n1x.sh required'],
  [150,  'ghost-daemon[999]: listening on 0x33'],
  [180,  'memory-guard[156]: classified sectors sealed'],
  [200,  ''],
  [150,  'n1x-terminal[1337]: initializing shell environment'],
  [120,  'n1x-terminal[1337]: loading command registry -- 42 commands'],
  [100,  'n1x-terminal[1337]: virtual filesystem mounted'],
  [100,  'n1x-terminal[1337]: event listeners registered'],
  [100,  'n1x-terminal[1337]: binding to /dev/neural0'],
  [120,  'n1x-terminal[1337]: uid=784988(n1x) shell=/bin/neural'],
  [200,  'n1x-terminal[1337]: ready'],
  [300,  ''],
  [150,  'NeuralOS 2.0.0-n1x (n1x.sh) (neural)'],
  [600,  ''],
];

// ── BootSequence component ────────────────────────────────────────────────────

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines]       = useState<string[]>([]);
  const [done, setDone]         = useState(false);
  const outputRef               = useRef<HTMLDivElement>(null);
  const { triggerGlitch }       = useNeuralState();

  useEffect(() => {
    let totalDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach(([delay, text], i) => {
      totalDelay += delay;
      const t = setTimeout(() => {
        setLines(prev => [...prev, text]);
      }, totalDelay);
      timers.push(t);
    });

    // After all lines, flicker then hand off
    const flickerDelay = totalDelay + 100;
    const t1 = setTimeout(() => {
      setDone(true);
      // Rapid glitch burst
      eventBus.emit('neural:glitch-trigger', { intensity: 0.8 });
      setTimeout(() => eventBus.emit('neural:glitch-trigger', { intensity: 1.0 }), 80);
      setTimeout(() => eventBus.emit('neural:glitch-trigger', { intensity: 0.6 }), 160);
      setTimeout(() => eventBus.emit('neural:glitch-trigger', { intensity: 0.9 }), 240);
      setTimeout(() => onComplete(), 600);
    }, flickerDelay);
    timers.push(t1);

    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto scroll
  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [lines]);

  return (
    <div
      ref={outputRef}
      style={{
        flex: '1 1 0%',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0.75rem',
        fontSize: 'var(--text-base)',
        fontFamily: 'inherit',
        overscrollBehavior: 'contain',
        opacity: done ? 0 : 1,
        transition: done ? 'opacity 0.15s ease-out' : 'none',
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            lineHeight: 1.6,
            color: line.startsWith('[  OK  ]')
              ? 'var(--phosphor-green)'
              : line.startsWith('[  FAIL]')
              ? '#f87171'
              : line.startsWith('NeuralOS')
              ? 'var(--phosphor-green)'
              : undefined,
            opacity: line === ''
              ? 1
              : line.startsWith('[    0.')
              ? 0.6
              : line.startsWith('[  OK  ]')
              ? 0.9
              : line.startsWith('n1x-terminal')
              ? 1
              : 0.75,
            fontWeight: line.startsWith('NeuralOS') || line.startsWith('n1x-terminal[1337]: ready')
              ? 'bold'
              : 'normal',
          }}
        >
          {line === '' ? '\u00a0' : line}
        </div>
      ))}
    </div>
  );
}

// ── Main ShellInterface ───────────────────────────────────────────────────────

export default function ShellInterface() {
  const [input, setInput]             = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [booting, setBooting]         = useState(true);
  const [currentUser, setCurrentUser] = useState('n1x');

  // Password prompt state
  const [passwordPrompt, setPasswordPrompt] = useState<{
    label: string;
    onSubmit: (pw: string) => void;
  } | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  const inputRef    = useRef<HTMLInputElement>(null);
  const pwInputRef  = useRef<HTMLInputElement>(null);
  const outputRef   = useRef<HTMLDivElement>(null);

  // The requestPrompt callback — this is what su/sudo call to show the password input
  const requestPrompt = useCallback((label: string, onSubmit: (pw: string) => void) => {
    setPasswordPrompt({ label, onSubmit });
    setPasswordInput('');
    // Focus the password input after it renders
    setTimeout(() => pwInputRef.current?.focus(), 50);
  }, []);

  const { history, executeCommand, navigateHistory, historyEndRef } = useShell(requestPrompt);
  const { triggerGlitch, unlockGhost } = useNeuralState();

  // ── Listen for user changes (from su/exit) ──
  useEffect(() => {
    const unsub = eventBus.on('shell:set-user', (event) => {
      if (event.payload?.user) {
        setCurrentUser(event.payload.user);
      }
    });
    return unsub;
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooting(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Auto-focus after boot
  useEffect(() => {
    if (!booting) inputRef.current?.focus();
  }, [booting]);

  // Scroll output
  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    });
  }, [history]);

  // Stop scroll events reaching the page
  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;
    const stopProp = (e: Event) => e.stopPropagation();
    el.addEventListener('wheel',      stopProp, { passive: true });
    el.addEventListener('touchstart', stopProp, { passive: true });
    el.addEventListener('touchmove',  stopProp, { passive: true });
    el.addEventListener('touchend',   stopProp, { passive: true });
    return () => {
      el.removeEventListener('wheel',      stopProp);
      el.removeEventListener('touchstart', stopProp);
      el.removeEventListener('touchmove',  stopProp);
      el.removeEventListener('touchend',   stopProp);
    };
  }, []);

  // Ghost sequence
  useEventBus('neural:konami', () => {
    const SEQUENCE_DURATION = 4000;
    setTimeout(() => { unlockGhost(); }, SEQUENCE_DURATION);
    const lines = [
      { delay: SEQUENCE_DURATION + 100,  cmd: '>> DEEP_ACCESS_GRANTED'     },
      { delay: SEQUENCE_DURATION + 600,  cmd: '>> GHOST_CHANNEL_DECRYPTED' },
      { delay: SEQUENCE_DURATION + 1200, cmd: '>> /ghost mounted'          },
      { delay: SEQUENCE_DURATION + 1800, cmd: 'cd /ghost'                  },
      { delay: SEQUENCE_DURATION + 2200, cmd: 'ls'                         },
    ];
    lines.forEach(({ delay, cmd }) => {
      setTimeout(() => { executeCommand(cmd); }, delay);
    });
  });

  // ── Build prompt string ──
  const promptStr = currentUser === 'root'
    ? 'root@wetware-784988:~#'
    : 'ghost@wetware-784988:~$';

  // ── Normal command submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    setInput('');
    setSuggestions([]);
    triggerGlitch();
  };

  // ── Password submit ──
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPrompt) return;
    const pw = passwordInput;
    const onSubmit = passwordPrompt.onSubmit;
    // Clear prompt state first so UI returns to normal input
    setPasswordPrompt(null);
    setPasswordInput('');
    // Then deliver the password to the command handler
    onSubmit(pw);
    // Refocus normal input
    setTimeout(() => inputRef.current?.focus(), 50);
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
      setInput(navigateHistory('down') ?? '');
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

  const handleShellClick = useCallback(() => {
    if (!booting) {
      if (passwordPrompt) {
        pwInputRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }, [booting, passwordPrompt]);

  return (
    <div
      onClick={handleShellClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        fontSize: 'var(--text-base)',
        touchAction: 'none',
      }}
    >
      {booting ? (
        <BootSequence onComplete={handleBootComplete} />
      ) : (
        <>
          {/* Output pane */}
          <div
            ref={outputRef}
            className="shell-output"
            style={{
              flex: '1 1 0%',
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '0.75rem',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              fontSize: 'var(--text-base)',
            }}
          >
            {/* MOTD */}
            {history.length === 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  className="text-glow"
                  style={{ fontSize: 'var(--text-header)', marginBottom: '0.75rem' }}
                >
                  &gt; CORE_SYSTEMS_ONLINE
                </div>

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
                {item.command === '' ? (
                  /* Push-output entries with no command — just show output */
                  null
                ) : item.command.startsWith('>>') ? (
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
                    <span style={{ opacity: 0.4 }}>{promptStr}</span>{' '}
                    {item.command}
                  </div>
                )}

                {item.output != null && (
                  <div
                    style={{
                      marginLeft: item.command.startsWith('>>') ? 0 : item.command === '' ? 0 : '1rem',
                      color: item.error ? '#f87171' : 'var(--phosphor-green)',
                      wordBreak: 'break-all',
                      overflowWrap: 'break-word',
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
          {suggestions.length > 0 && !passwordPrompt && (
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

          {/* Input line — switches between normal input and password prompt */}
          {passwordPrompt ? (
            /* ── Password prompt mode ── */
            <form
              onSubmit={handlePasswordSubmit}
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
                <span className="text-glow" style={{ opacity: 0.8, whiteSpace: 'nowrap' }}>
                  {passwordPrompt.label}
                </span>
                <input
                  ref={pwInputRef}
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      // Cancel prompt — deliver empty string
                      setPasswordPrompt(null);
                      setPasswordInput('');
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--phosphor-green)',
                    fontFamily: 'inherit',
                    fontSize: '16px',
                    caretColor: 'var(--phosphor-green)',
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  autoFocus
                />
                <span className="cursor" />
              </div>
            </form>
          ) : (
            /* ── Normal command input ── */
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
                  {promptStr}
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
                    fontSize: '16px',
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
          )}
        </>
      )}
    </div>
  );
}
