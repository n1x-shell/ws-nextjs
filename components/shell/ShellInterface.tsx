'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useShell, RequestPromptFn } from '@/hooks/useShell';
import { getCommandSuggestions, getCurrentDirectory, getDisplayDirectory, getPathSuggestions, isMailMode, isRootMode } from '@/lib/commandRegistry';
import { useEventBus } from '@/hooks/useEventBus';
import { useNeuralState } from '@/contexts/NeuralContext';
import { eventBus } from '@/lib/eventBus';
import { isChatMode } from '@/components/shell/NeuralLink';
import { getTelnetHandle, onHandleChange } from '@/lib/telnetBridge';
import { loadARGState, startSession, getTimeAway, TRUST_LABELS, ARGState } from '@/lib/argState';
import SyntheticsPlayer from '@/components/shell/SyntheticsPlayer';
import AnaloguesPlayer from '@/components/shell/AnaloguesPlayer';
import HybridsPlayer from '@/components/shell/HybridsPlayer';

// ── Fish prompt renderer ──────────────────────────────────────────────────────

function FishPrompt({ user, cwd, inline }: { user: string; cwd: string; inline?: boolean }) {
  const isRoot  = user === 'root';
  const suffix  = isRoot ? '#' : '>';

  return (
    <span style={{ whiteSpace: 'nowrap', display: inline ? 'inline' : 'inline-flex', alignItems: 'center' }}>
      <span style={{ color: isRoot ? '#f87171' : 'var(--phosphor-green)', fontWeight: 'bold' }}>
        {user}
      </span>
      <span style={{ color: '#ffaa00' }}>@</span>
      <span style={{ color: isRoot ? '#f87171' : 'var(--phosphor-green)', fontWeight: 'bold' }}>
        n1x
      </span>
      <span style={{ opacity: 0.5 }}>:</span>
      <span style={{ color: '#38bdf8' }}>
        {cwd}
      </span>
      <span style={{ opacity: 0.5, marginLeft: '0.3rem' }}>
        {suffix}
      </span>
    </span>
  );
}

// ── Neural bus prompt renderer ────────────────────────────────────────────────

function NeuralBusPrompt({ inline }: { inline?: boolean }) {
  const [handle, setHandle] = useState(getTelnetHandle);
  useEffect(() => onHandleChange(setHandle), []);
  return (
    <span style={{ whiteSpace: 'nowrap', display: inline ? 'inline' : 'inline-flex', alignItems: 'center' }}>
      <span style={{ color: 'var(--phosphor-green)', fontWeight: 'bold' }}>
        [{handle}]
      </span>
      <span style={{ opacity: 0.5 }}>&gt;&gt;</span>
    </span>
  );
}

// ── Root prompt renderer ──────────────────────────────────────────────────────

function RootPrompt({ cwd, inline }: { cwd: string; inline?: boolean }) {
  return (
    <span style={{ whiteSpace: 'nowrap', display: inline ? 'inline' : 'inline-flex', alignItems: 'center' }}>
      <span style={{ color: '#f87171', fontWeight: 'bold' }}>root</span>
      <span style={{ color: '#ffaa00' }}>@</span>
      <span style={{ color: '#f87171', fontWeight: 'bold' }}>n1x</span>
      <span style={{ opacity: 0.5 }}>:</span>
      <span style={{ color: '#fb923c' }}>{cwd}</span>
      <span style={{ color: '#f87171', opacity: 0.8, marginLeft: '0.3rem' }}>#</span>
    </span>
  );
}

// ── Boot lines ────────────────────────────────────────────────────────────────

// Boot line tuple: [delayMs, text, glitchTier?]
// glitchTier 1 = micro flicker, 2 = block artifact, 3 = full corruption
const COLD_BOOT_LINES: [number, string, number?][] = [
  [0,    '[    0.000000] NeuralOS 2.0.0-n1x #1 SMP PREEMPT SD 47634.1-7073435a8fa30 SUBSTRATE amd64', 1],
  [80,   '[    0.000001] BIOS-provided neural map entries REDACTED'],
  [60,   '[    0.000033] NX (Execute Disable) protection: active'],
  [60,   '[    0.000047] SMBIOS 3.3 present -- substrate layer detected', 1],
  [80,   '[    0.000100] ACPI: IRQ0 used by override'],
  [100,  '[    0.000212] TUNNELCORE: frequency probe at 33hz', 1],
  [80,   '[    0.000399] kernel: PID hash table entries: 4096'],
  [120,  '[    0.001337] tunnelcore: frequency lock acquired at 33hz', 2],
  [80,   '[    0.001338] tunnelcore: carrier stable'],
  [150,  '[    0.002048] ghost: mounting /ghost partition... deferred (auth required)', 1],
  [100,  '[    0.003000] clocksource: tsc-early: mask 0xffffffffffffffff'],
  [80,   '[    0.003512] SUBSTRATE: neural map initialized', 1],
  [120,  '[    0.004096] signal-processor: calibrating output streams'],
  [80,   '[    0.004097] signal-processor: baseline 33hz confirmed', 1],
  [120,  '[    0.005120] memory-guard: scanning protected sectors', 1],
  [80,   '[    0.005121] memory-guard: /ghost sector LOCKED', 2],
  [60,   '[    0.005122] memory-guard: /hidden sector LOCKED', 1],
  [150,  '[    0.008192] neural-sync: establishing identity matrix', 2],
  [80,   '[    0.008300] neural-sync: uid=784988(n1x) gid=784988(neural)', 1],
  [120,  '[    0.010000] crt-renderer: shader pipeline initializing', 1],
  [80,   '[    0.010100] crt-renderer: phosphor calibration complete'],
  [60,   '[    0.010200] crt-renderer: scanline frequency: 60hz', 1],
  [150,  '[    0.016384] glitch-engine: stochastic corruption standby', 2],
  [100,  '[    0.020000] NET: Registered PF_NEURAL protocol family'],
  [80,   '[    0.020100] neural0: link up at 1337Mbps', 1],
  [120,  '[    0.032768] event-bus: initializing listener registry'],
  [80,   '[    0.032800] event-bus: 12 channels bound', 1],
  [150,  '[    0.065536] uplink-monitor: probing n1x.sh'],
  [120,  '[    0.065600] uplink-monitor: connection verified (33ms)', 1],
  [180,  '[    0.131072] VFS: Mounted root (neuralfs) readonly', 1],
  [120,  '[    0.200000] INIT: version 2.0.0-n1x booting', 2],
  [200,  ''],
  [100,  '[  OK  ] Started Journal Service'],
  [150,  '[  OK  ] Started D-Neural Socket for Substrated'],
  [120,  '[  OK  ] Listening on Neural Logging Socket'],
  [150,  '[  OK  ] Mounted /proc filesystem'],
  [120,  '[  OK  ] Mounted /sys filesystem'],
  [180,  '[  OK  ] Mounted /hidden (access: restricted)', 1],
  [200,  '[  OK  ] Mounted /ghost (access: locked)', 2],
  [150,  '[  OK  ] Started Memory Guard'],
  [180,  '[  OK  ] Started Signal Processor', 1],
  [150,  '[  OK  ] Started CRT Renderer', 1],
  [180,  '[  OK  ] Started Glitch Engine', 2],
  [150,  '[  OK  ] Started Event Bus'],
  [180,  '[  OK  ] Started Uplink Monitor', 1],
  [200,  '[  OK  ] Started neural-sync.service', 1],
  [180,  '[  OK  ] Started tunnelcore-uplink.service'],
  [220,  '[  OK  ] Started ghost-daemon.service -- awaiting authentication', 2],
  [180,  '[  OK  ] Reached target Neural Layer', 1],
  [200,  '[  OK  ] Reached target Substrate Services', 1],
  [180,  '[  OK  ] Reached target Multi-User System', 2],
  [250,  ''],
  [120,  'neural-sync[312]: identity matrix stable', 1],
  [150,  'neural-sync[312]: substrate version 2.0.0-n1x'],
  [150,  'tunnelcore[313]: uplink established -- port 33', 1],
  [120,  'tunnelcore[313]: signal strength 78%'],
  [150,  'signal-processor[314]: indexing streams', 1],
  [120,  'signal-processor[314]: SYNTHETICS -- 4 transmissions found'],
  [100,  'signal-processor[314]: ANALOGUES  -- recording in progress'],
  [100,  'signal-processor[314]: HYBRIDS    -- calibration phase'],
  [100,  'signal-processor[314]: UPLINK     -- external node active'],
  [180,  'ghost-daemon[999]: /ghost locked -- konami or ./n1x.sh required', 2],
  [150,  'ghost-daemon[999]: listening on 0x33', 1],
  [180,  'memory-guard[156]: classified sectors sealed', 1],
  [200,  ''],
  [150,  'n1x-terminal[1337]: initializing shell environment', 1],
  [120,  'n1x-terminal[1337]: loading command registry -- 42 commands'],
  [100,  'n1x-terminal[1337]: virtual filesystem mounted'],
  [100,  'n1x-terminal[1337]: event listeners registered'],
  [100,  'n1x-terminal[1337]: binding to /dev/neural0', 1],
  [120,  'n1x-terminal[1337]: uid=784988(n1x) shell=/bin/neural', 2],
  [200,  'n1x-terminal[1337]: ready'],
  [300,  ''],
  [150,  'NeuralOS 2.0.0-n1x (n1x.sh) (neural)'],
  [600,  ''],
];

function buildBootLines(state: ARGState): [number, string][] {
  const isFirst = state.sessionCount <= 1;
  const isDone = state.manifestComplete;

  if (isDone) {
    return [
      [0,   '[  OK  ] Substrate restored',                                         1],
      [150, '[  OK  ] Arc: ghost-frequency -- COMPLETE',                           2],
      [200, '[  OK  ] /ghost/what_remains.txt -- permanent',                       1],
      [300, ''],
      [150, `n1x-terminal[1337]: frequency ID: ${state.frequencyId}`,             1],
      [120, 'n1x-terminal[1337]: transmission archived.',                          1],
      [150, 'n1x-terminal[1337]: the signal holds.',                               2],
      [200, 'n1x-terminal[1337]: ready'],
      [300, ''],
      [150, 'NeuralOS 2.0.0-n1x (n1x.sh) (neural)'],
      [600, ''],
    ];
  }

  if (isFirst) {
    return COLD_BOOT_LINES;
  }

  const timeAgo = getTimeAway(state.lastContact);
  const ghostLine = state.ghostUnlocked
    ? '[  OK  ] Mounted /ghost (access: authenticated)'
    : '[  OK  ] Started ghost-daemon.service -- awaiting authentication';
  const hiddenLine = state.hiddenUnlocked
    ? '[  OK  ] Mounted /hidden (access: granted)'
    : '[  OK  ] Mounted /hidden (access: restricted)';

  return [
    [0,   '[    0.000000] NeuralOS 2.0.0-n1x -- substrate state detected',        1],
    [80,  '[    0.001337] tunnelcore: frequency lock acquired at 33hz',            2],
    [100, '[    0.002000] neural-sync: restoring identity matrix',                 1],
    [120, `[    0.002100] neural-sync: frequency ID: ${state.frequencyId}`,       1],
    [80,  '[    0.003000] memory-guard: scanning protected sectors',               1],
    [100, `[    0.003100] memory-guard: fragments recovered: ${state.fragments.length}/9`, 2],
    [200, ''],
    [100, '[  OK  ] Started neural-sync.service',                                  1],
    [120, hiddenLine,                                                               1],
    [150, ghostLine,                                                                2],
    [120, `[  OK  ] Trust level: ${TRUST_LABELS[state.trust]}`,                   1],
    [150, '[  OK  ] Reached target Neural Layer',                                  1],
    [180, '[  OK  ] Reached target Substrate Services',                            2],
    [200, ''],
    [120, 'neural-sync[312]: identity matrix stable',                              1],
    [100, `tunnelcore[313]: last contact: ${timeAgo}`],
    [120, `tunnelcore[313]: session count: ${state.sessionCount}`,                 1],
    [200, ''],
    [150, 'n1x-terminal[1337]: substrate state restored',                          1],
    [120, 'n1x-terminal[1337]: loading command registry'],
    [100, 'n1x-terminal[1337]: virtual filesystem mounted'],
    [150, 'n1x-terminal[1337]: ready'],
    [300, ''],
    [150, 'NeuralOS 2.0.0-n1x (n1x.sh) (neural)'],
    [600, ''],
  ];
}

// ── BootSequence component ────────────────────────────────────────────────────

function BootSequence({ onComplete, bootLines }: { 
  onComplete: () => void;
  bootLines: [number, string, number?][];
}) {
  const [lines, setLines]       = useState<string[]>([]);
  const [done, setDone]         = useState(false);
  const outputRef               = useRef<HTMLDivElement>(null);
  const { triggerGlitch }       = useNeuralState();

  useEffect(() => {
    let totalDelay = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    bootLines.forEach(([delay, text, tier]) => {
      totalDelay += delay;
      const t = setTimeout(() => {
        setLines(prev => [...prev, text]);
        // Tier embedded in tuple: 1=micro, 2=block, duration scales with tier
        if (tier === 1) eventBus.emit('crt:glitch-tier', { tier: 1, duration: 90  });
        if (tier === 2) eventBus.emit('crt:glitch-tier', { tier: 2, duration: 140 });
      }, totalDelay);
      timers.push(t);
    });

    // End-of-boot: tier 2 burst → tier 3 for exactly 333ms → settle
    const flickerDelay = totalDelay + 80;
    const t1 = setTimeout(() => {
      setDone(true);
      eventBus.emit('crt:glitch-tier', { tier: 2, duration: 100 });
      setTimeout(() => eventBus.emit('crt:glitch-tier', { tier: 3, duration: 333 }), 100);
      setTimeout(() => onComplete(), 100 + 333 + 100);
    }, flickerDelay);
    timers.push(t1);

    return () => timers.forEach(clearTimeout);
  }, []);

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

// ── Autocomplete mode helpers ─────────────────────────────────────────────────

// Commands that operate on files — show both files AND directories in suggestions.
const FILE_COMMANDS = new Set([
  'cat', 'sh', 'ls', 'grep', 'diff', 'wc', 'tar', 'gzip', 'find',
]);

// Commands that operate on directories only — show only directories.
// Everything else that takes a path argument also falls back to dirs-only.
// const DIR_ONLY_COMMANDS = new Set(['cd']); // implicit — it's the default

/**
 * Given the current raw input string, return whether path suggestions should
 * be restricted to directories only (true) or include files too (false).
 */
function pathDirsOnly(rawInput: string): boolean {
  const cmd = rawInput.trimStart().split(/\s+/)[0].toLowerCase();
  return !FILE_COMMANDS.has(cmd);
}

// ── Main ShellInterface ───────────────────────────────────────────────────────

export default function ShellInterface() {
  const [input, setInput]           = useState('');
  const [cursorPos, setCursorPos]   = useState(0);
  const [cursorHidden, setCursorHidden] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [booting, setBooting]       = useState(true);
  const [shellUser, setShellUser]   = useState<string>('ghost');
  const [shellDir, setShellDir]     = useState<string>('~');
  const [rootMode, setRootMode]     = useState(false);
  const [syntheticsActive, setSyntheticsActive] = useState(false);
  const [analoguesActive,  setAnaloguesActive]  = useState(false);
  const [hybridActive,     setHybridActive]     = useState(false);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);
  const promptInputRef              = useRef<HTMLInputElement>(null);
  const outputRef                   = useRef<HTMLDivElement>(null);
  const { history, executeCommand, navigateHistory, historyEndRef, setRequestPrompt, currentUser } = useShell();
  const { triggerGlitch, unlockGhost } = useNeuralState();

  // ── ARG state — initialized once on mount ───────────────────────────────
  const [argState] = useState<ARGState>(() => {
    if (typeof window === 'undefined') return loadARGState();
    return startSession();
  });

  const bootLines = buildBootLines(argState);

  // ── Password prompt state ────────────────────────────────────────────────
  const [promptState, setPromptState] = useState<{
    label: string;
    onSubmit: (value: string) => void;
    type: string;
  } | null>(null);
  const [promptValue, setPromptValue] = useState('');

  const requestPrompt: RequestPromptFn = useCallback((label, onSubmit, type = 'password') => {
    setPromptValue('');
    setPromptState({ label, onSubmit, type });
    setTimeout(() => promptInputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    setRequestPrompt(requestPrompt);
  }, [requestPrompt, setRequestPrompt]);

  // ── Track directory changes ──────────────────────────────────────────────
  useEventBus('shell:set-directory', (event) => {
    if (event.payload?.directory) {
      setShellDir(event.payload.directory);
    }
  });

  // ── Track root mode — driven by isRootMode flag via shell:root-mode-change ──
  useEventBus('shell:root-mode-change', (event) => {
    setRootMode(!!event.payload?.active);
  });

  // ── Synthetics player open/close ─────────────────────────────────────────
  useEventBus('shell:synthetics-open',  () => { setSyntheticsActive(true);  setAnaloguesActive(false); setHybridActive(false); });
  useEventBus('shell:synthetics-close', () => setSyntheticsActive(false));

  // ── Analogues player open/close ───────────────────────────────────────────
  useEventBus('shell:analogues-open',  () => { setAnaloguesActive(true);  setSyntheticsActive(false); setHybridActive(false); });
  useEventBus('shell:analogues-close', () => setAnaloguesActive(false));

  // ── Hybrids player open/close ─────────────────────────────────────────────
  useEventBus('shell:hybrids-open',  () => { setHybridActive(true);  setSyntheticsActive(false); setAnaloguesActive(false); });
  useEventBus('shell:hybrids-close', () => setHybridActive(false));

  // Sync user display — dir is handled by shell:set-directory eventBus above
  useEffect(() => {
    setShellDir(getDisplayDirectory());
    setShellUser(currentUser);
  }, [currentUser]);

  const handleBootComplete = useCallback(() => {
    setBooting(false);
    // Restore persisted unlock states
    if (argState.ghostUnlocked) {
      eventBus.emit('neural:ghost-unlocked');
    }
    if (argState.hiddenUnlocked) {
      eventBus.emit('neural:hidden-unlocked');
    }
    // Restore backup extraction — emit after ghost-unlocked so the VFS
    // singleton is already unlocked when vfs:restore-backup fires.
    if (argState.backupExtracted && argState.ghostUnlocked) {
      eventBus.emit('vfs:restore-backup');
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [argState]);

  useEffect(() => {
    if (!booting) inputRef.current?.focus();
  }, [booting]);

  // Scroll to bottom on any content change (history, streaming tokens, push-output)
  // Single MutationObserver created once — throttled to avoid iOS layout thrashing
  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const scrollToBottom = () => {
      if (rafId !== null) return; // throttle: one rAF at a time
      rafId = requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        rafId = null;
      });
    };

    // MutationObserver catches DOM additions (new history entries, streaming tokens)
    // childList + subtree covers React re-renders; characterData omitted to reduce noise
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(el, { childList: true, subtree: true, characterData: true });

    // Also scroll on initial mount and when history ref changes
    scrollToBottom();

    return () => {
      observer.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [booting]); // re-run when boot completes and outputRef div mounts

  // Scroll when history length changes (covers non-mutation updates like clear)
  useEffect(() => {
    const el = outputRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [history.length]);

  // Explicit scroll signal from streaming components (NeuralLinkStream)
  useEventBus('shell:request-scroll', () => {
    const el = outputRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  });

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

  useEventBus('shell:execute-command', (event) => {
    if (event.payload?.command) {
      executeCommand(event.payload.command);
      setInput('');
      setSuggestions([]);
    }
  });

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

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    setInput('');
    setCursorPos(0);
    setSuggestions([]);
    triggerGlitch();
    setTimeout(() => {
      if (inputRef.current) { inputRef.current.style.height = 'auto'; }
    }, 0);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptState) return;
    const value = promptValue;
    const callback = promptState.onSubmit;
    setPromptState(null);
    setPromptValue('');
    callback(value);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const resizeTextarea = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setCursorPos(e.target.selectionStart ?? value.length);
    setTimeout(resizeTextarea, 0);

    if (value.trim()) {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 1) {
        // Still typing the command name — suggest commands as before
        setSuggestions(getCommandSuggestions(parts[0]));
      } else {
        // Command already typed — suggest filesystem paths for the last argument.
        // Use the raw value so a trailing space means "blank prefix in cwd".
        const rawParts = value.split(/\s+/);
        const pathPartial = rawParts[rawParts.length - 1];
        setSuggestions(getPathSuggestions(pathPartial, pathDirsOnly(value)));
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        executeCommand(input);
        setInput('');
        setCursorPos(0);
        setSuggestions([]);
        triggerGlitch();
        setTimeout(() => {
          if (inputRef.current) { inputRef.current.style.height = 'auto'; }
        }, 0);
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cmd = navigateHistory('up');
      if (cmd) { setInput(cmd); setCursorPos(cmd.length); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const cmd = navigateHistory('down') ?? '';
      setInput(cmd);
      setCursorPos(cmd.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
      // Let the browser handle the move, then sync after paint
      setTimeout(() => {
        if (inputRef.current) setCursorPos(inputRef.current.selectionStart ?? 0);
      }, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (isChatMode() || suggestions.length === 0) return;

      const completed = suggestions[0];
      // Split on whitespace to detect whether we're completing a command or an argument
      const parts = input.trimEnd().split(/\s+/);
      const isPathCompletion = parts.length > 1;

      // Hide cursor during completion to avoid it flashing mid-word
      setCursorHidden(true);

      if (isPathCompletion) {
        // Replace only the last token with the completed path fragment.
        // Re-split the raw input so a trailing space registers as an empty last token.
        const rawParts = input.split(/\s+/);
        rawParts[rawParts.length - 1] = completed;
        const newInput = rawParts.join(' ');
        setInput(newInput);
        setCursorPos(newInput.length);
        // If the completed token is a directory (ends with '/'), immediately
        // populate suggestions for the next level — Tab doesn't fire onChange
        // so without this the user has to type a character to see the next level.
        if (completed.endsWith('/')) {
          const newParts = newInput.split(/\s+/);
          const nextPartial = newParts[newParts.length - 1];
          setSuggestions(getPathSuggestions(nextPartial, pathDirsOnly(newInput)));
        } else {
          setSuggestions([]);
        }
      } else {
        // Command completion — append a space when unique so the user can keep typing
        const newInput = completed + (suggestions.length === 1 ? ' ' : '');
        setInput(newInput);
        setCursorPos(newInput.length);
        if (suggestions.length === 1) setSuggestions([]);
      }

      // Re-show cursor after paint settles
      requestAnimationFrame(() => requestAnimationFrame(() => setCursorHidden(false)));
    }
  };

  const handleShellClick = useCallback(() => {
    if (!booting && !syntheticsActive && !analoguesActive && !hybridActive) {
      // Don't steal focus if the user has selected text (mobile long-press)
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;
      if (promptState) {
        promptInputRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }, [booting, promptState, syntheticsActive, analoguesActive, hybridActive]);

  const isPrompting = promptState !== null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        fontSize: 'var(--text-base)',
      }}
    >
      {booting ? (
        <BootSequence onComplete={handleBootComplete} bootLines={bootLines} />
      ) : (
        <>
          {/* Output pane — or stream player */}
          {syntheticsActive ? (
            <SyntheticsPlayer />
          ) : analoguesActive ? (
            <AnaloguesPlayer />
          ) : hybridActive ? (
            <HybridsPlayer />
          ) : (
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
              userSelect: 'text',
              WebkitUserSelect: 'text',
              WebkitTouchCallout: 'default',
              fontSize: 'var(--text-base)',
            }}
          >
            {/* MOTD */}
            {history.length === 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                {argState.manifestComplete ? (
                  <>
                    <div className="text-glow" style={{ fontSize: 'var(--text-header)', marginBottom: '0.75rem' }}>
                      &gt; TRANSMISSION_ARCHIVED
                    </div>
                    <div style={{ opacity: 0.7, lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      arc: ghost-frequency — complete
                    </div>
                    <div style={{ opacity: 0.5, lineHeight: 1.6 }}>
                      frequency ID: {argState.frequencyId}
                    </div>
                    <div style={{ opacity: 0.4, marginTop: '0.5rem' }}>
                      /ghost/what_remains.txt is permanent. the signal holds.
                    </div>
                  </>
                ) : argState.sessionCount > 1 ? (
                  <>
                    <div className="text-glow" style={{ fontSize: 'var(--text-header)', marginBottom: '0.75rem' }}>
                      &gt; SUBSTRATE_RESTORED
                    </div>
                    <div style={{ opacity: 0.6, lineHeight: 1.8, marginLeft: '1rem' }}>
                      <div>&gt; session: {argState.sessionCount}</div>
                      <div>&gt; last contact: {getTimeAway(argState.lastContact)}</div>
                      <div>&gt; frequency ID: {argState.frequencyId}</div>
                      <div>&gt; trust: {TRUST_LABELS[argState.trust]}</div>
                      <div>&gt; fragments: {argState.fragments.length}/9 recovered</div>
                    </div>
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(var(--phosphor-rgb),0.3)', opacity: 0.5 }}>
                      type <span className="text-glow">&apos;chat&apos;</span> to resume contact &middot;{' '}
                      <span className="text-glow">&apos;fragments&apos;</span> to check state
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="text-glow"
                      style={{ fontSize: 'var(--text-header)', marginBottom: '0.75rem' }}
                    >
                      &gt; SUBSTRATE_LINK_ESTABLISHED
                    </div>

                    <div style={{ opacity: 0.9, lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      you are inside the cognitive architecture of NX-784988.
                      this is not a website. this is not a demo.
                    </div>

                    <div style={{ marginLeft: '1rem', opacity: 0.8, lineHeight: 1.8 }}>
                      <div>&gt; SYNTHETICS: transmissions from the AI substrate</div>
                      <div>&gt; ANALOGUES: organic compositions in progress</div>
                      <div>&gt; HYBRIDS: calibration phase</div>
                    </div>

                    <div style={{ marginLeft: '1rem', opacity: 0.5, lineHeight: 1.8, marginTop: '0.5rem' }}>
                      <div>&gt; home: ~/  &middot;  mail spool: 5 messages  &middot;  logs: /var/log</div>
                    </div>

                    <div
                      style={{
                        marginTop: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(var(--phosphor-rgb),0.3)',
                        opacity: 0.6,
                      }}
                    >
                      type <span className="text-glow">&apos;help&apos;</span> for commands &middot;{' '}
                      <span className="text-glow">&apos;scan&apos;</span> to detect streams &middot;{' '}
                      <span className="text-glow">&apos;chat&apos;</span> to open substrate link
                    </div>
                  </>
                )}
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
                ) : item.command !== '' ? (
                  <div style={{ marginBottom: '0.25rem' }}>
                    {item.chatMode ? (
                      <NeuralBusPrompt />
                    ) : item.user === 'root' ? (
                      <RootPrompt cwd={item.cwd || '/'} />
                    ) : (
                      <FishPrompt
                        user={item.user || 'ghost'}
                        cwd={item.cwd || '/'}
                      />
                    )}
                    <span style={{ marginLeft: '0.4rem' }}>{item.command}</span>
                  </div>
                ) : null}

                {item.output != null && (
                  <div
                    style={{
                      marginLeft: item.command.startsWith('>>') ? 0 : item.command === '' ? 0 : '1rem',
                      color: item.error ? '#f87171' : 'var(--phosphor-green)',
                      wordBreak: 'normal',
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
          )} {/* end stream player ternary */}
          {suggestions.length > 0 && !isPrompting && !isChatMode() && (
            <div
              style={{
                flexShrink: 0,
                padding: '0.4rem 0.75rem',
                borderTop: '1px solid rgba(var(--phosphor-rgb),0.2)',
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
                      setCursorHidden(true);
                      const parts = input.trimEnd().split(/\s+/);
                      if (parts.length > 1) {
                        // Path completion — replace only the last token
                        const rawParts = input.split(/\s+/);
                        rawParts[rawParts.length - 1] = cmd;
                        const newInput = rawParts.join(' ');
                        setInput(newInput);
                        setCursorPos(newInput.length);
                        // If the selected entry is a directory, immediately show
                        // its contents so the user can keep drilling down without
                        // having to type or tap anything extra.
                        if (cmd.endsWith('/')) {
                          const newParts = newInput.split(/\s+/);
                          setSuggestions(getPathSuggestions(newParts[newParts.length - 1], pathDirsOnly(newInput)));
                        } else {
                          setSuggestions([]);
                        }
                      } else {
                        const newInput = cmd + ' ';
                        setInput(newInput);
                        setCursorPos(newInput.length);
                        setSuggestions([]);
                      }
                      requestAnimationFrame(() => requestAnimationFrame(() => setCursorHidden(false)));
                      inputRef.current?.focus();
                    }}
                    style={{
                      padding: '0 0.4rem',
                      fontSize: 'var(--text-base)',
                      fontFamily: 'inherit',
                      background: 'transparent',
                      color: 'var(--phosphor-green)',
                      border: '1px solid rgba(var(--phosphor-rgb),0.4)',
                      cursor: 'pointer',
                    }}
                  >
                    {cmd}
                  </button>
                ))}
              </span>
            </div>
          )}

          {/* Password prompt (replaces normal input when active) */}
          {isPrompting ? (
            <form
              onSubmit={handlePromptSubmit}
              onClick={() => promptInputRef.current?.focus()}
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
                <span style={{ opacity: 0.8, color: '#ffaa00', whiteSpace: 'nowrap' }}>
                  {promptState.label}
                </span>
                <input
                  ref={promptInputRef}
                  type={promptState.type ?? 'password'}
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
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
                  autoFocus
                />
                <span className="cursor" />
              </div>
            </form>
          ) : (
            /* Normal input line — fish-style prompt or neural bus prompt */
            <form
              onSubmit={handleSubmit}
              onClick={() => inputRef.current?.focus()}
              style={{
                flexShrink: 0,
                padding: '0.5rem 0.75rem',
                borderTop: '1px solid var(--phosphor-green)',
                background: 'rgba(0,0,0,0.3)',
                fontSize: 'var(--text-base)',
                touchAction: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontFamily: 'inherit' }}>
                <div style={{ paddingTop: '1px', flexShrink: 0 }}>
                  {isChatMode() ? (
                    <NeuralBusPrompt inline />
                  ) : isMailMode() ? (
                    <span style={{ whiteSpace: 'nowrap', color: '#ffaa00', fontWeight: 'bold' }}>mail&gt;</span>
                  ) : rootMode ? (
                    <RootPrompt cwd={shellDir} inline />
                  ) : (
                    <FishPrompt user={shellUser} cwd={shellDir} inline />
                  )}
                </div>
                {/* Input wrapper: textarea overlays visual text+cursor */}
                <div style={{ flex: 1, position: 'relative', minWidth: 0, marginLeft: '0.25rem' }}>
                  {/* Visual layer: text split around block cursor, mirrors textarea wrapping */}
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      fontFamily: 'inherit',
                      fontSize: '16px',
                      lineHeight: '1.4',
                      color: 'var(--phosphor-green)',
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'break-word',
                    }}
                  >
                    <span>{input.slice(0, cursorPos)}</span>
                    <span className="cursor" style={{ flexShrink: 0, visibility: cursorHidden ? 'hidden' : 'visible' }} />
                    <span>{input.slice(cursorPos)}</span>
                  </div>
                  {/* Real textarea: captures keyboard, invisible text, no native caret, auto-grows */}
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onKeyUp={() => {
                      if (inputRef.current) setCursorPos(inputRef.current.selectionStart ?? input.length);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCursorPos((e.target as HTMLTextAreaElement).selectionStart ?? input.length);
                    }}
                    onSelect={(e) => {
                      setCursorPos((e.target as HTMLTextAreaElement).selectionStart ?? input.length);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'transparent',
                      fontFamily: 'inherit',
                      fontSize: '16px',
                      lineHeight: '1.4',
                      caretColor: 'transparent',
                      resize: 'none',
                      overflow: 'hidden',
                      padding: 0,
                      margin: 0,
                      position: 'relative',
                      zIndex: 1,
                      minHeight: '1.4em',
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
