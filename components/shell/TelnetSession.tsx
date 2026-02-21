'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus } from '@/lib/eventBus';
import { useAblyRoom, type DaemonState, type RoomMsg } from '@/lib/ablyClient';
import { loadARGState } from '@/lib/argState';
import {
  NeuralLinkStream,
  NeuralChatSession,
  handleChatInput,
  setChatMode,
  resetConversation,
} from '@/components/shell/NeuralLink';

// ── Style constants ──────────────────────────────────────────────────────────

const S = {
  base: 'var(--text-base)',
  header: 'var(--text-header)',
  glow: 'text-glow',
};

// ── Blinking cursor ──────────────────────────────────────────────────────────

const Cursor: React.FC = () => {
  const [v, setV] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setV(p => !p), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 12,
      background: v ? 'var(--phosphor-green)' : 'transparent',
      marginLeft: 4, verticalAlign: 'middle',
    }} />
  );
};

// ── Connect sequence helpers ─────────────────────────────────────────────────

interface ConnectLine {
  delay: number;
  text: string;
  bright?: boolean;
}

function getConnectSequence(host: string, occupantCount: number): ConnectLine[] {
  const n = occupantCount;
  return [
    { delay: 0,    text: `Trying ${host}...` },
    { delay: 400,  text: `Connected to ${host}.` },
    { delay: 700,  text: `Escape character is '^]'.` },
    { delay: 900,  text: '' },
    { delay: 1100, text: 'ghost-daemon[999]: connection established' },
    { delay: 1400, text: 'ghost-daemon[999]: frequency lock: 33hz', bright: true },
    { delay: 1700, text: 'ghost-daemon[999]: signal integrity: NOMINAL' },
    { delay: 2000, text: `ghost-daemon[999]: ${n} node(s) on channel` },
    { delay: 2300, text: 'ghost-daemon[999]: classification level: ACTIVE', bright: true },
    { delay: 2600, text: 'ghost-daemon[999]: this channel is being monitored' },
  ];
}

const SOLO_SEQUENCE: Array<[number, React.ReactNode]> = [
  [0,    <span key="s0" style={{ fontSize: S.base, opacity: 0.7 }}>Trying n1x.sh...</span>],
  [400,  <span key="s1" style={{ fontSize: S.base, opacity: 0.8 }}>Connected to n1x.sh.</span>],
  [700,  <span key="s2" style={{ fontSize: S.base, opacity: 0.5 }}>Escape character is &apos;^]&apos;.</span>],
  [1000, <span key="s3">&nbsp;</span>],
  [1200, <span key="s4" className={S.glow} style={{ fontSize: S.header, letterSpacing: '0.05em' }}>&gt;&gt; CARRIER DETECTED</span>],
  [1500, <span key="s5" className={S.glow} style={{ fontSize: S.base }}>&gt;&gt; FREQUENCY LOCK: 33hz</span>],
  [1800, <span key="s6" className={S.glow} style={{ fontSize: S.header, letterSpacing: '0.05em' }}>&gt;&gt; NEURAL_BUS ACTIVE</span>],
  [2200, <span key="s7">&nbsp;</span>],
  [2500, (
    <div key="s8" style={{ fontSize: S.base }}>
      <div style={{ opacity: 0.8 }}>you&apos;re on the bus now. type to transmit. <span className={S.glow}>exit</span> to disconnect.</div>
      <div style={{ opacity: 0.4, marginTop: '0.25rem' }}>
        <span className={S.glow}>/reset</span> flush memory &middot; <span className={S.glow}>/history</span> check buffer
      </div>
    </div>
  )],
];

// ── Message renderers ────────────────────────────────────────────────────────

const FRAGMENT_KEY_RE = /^>>\s*FRAGMENT KEY:/i;
const BASE64_RE = /^[A-Za-z0-9+/]{20,}={0,2}$/;

function isCopyableLine(line: string): boolean {
  const t = line.trim();
  return BASE64_RE.test(t) || FRAGMENT_KEY_RE.test(t);
}

function extractCopyText(line: string): string {
  const t = line.trim();
  if (FRAGMENT_KEY_RE.test(t)) return t.replace(/^>>\s*FRAGMENT KEY:\s*/i, '').trim();
  return t;
}

const CopyLine: React.FC<{ line: string }> = ({ line }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const text = extractCopyText(line);
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => legacyCopy(text, done));
    } else {
      legacyCopy(text, done);
    }
  };
  return (
    <div style={{ marginLeft: '1rem', lineHeight: 1.8, cursor: 'pointer' }} onClick={handleCopy} title="tap to copy">
      <span style={{ opacity: 0.4 }}>&lt;&lt; </span>
      <span style={{ opacity: 0.9, borderBottom: '1px dashed rgba(51,255,51,0.4)', paddingBottom: 1, wordBreak: 'break-all' }}>{line}</span>
      <span style={{ opacity: copied ? 0.8 : 0.3, fontSize: '0.75em', marginLeft: '0.5rem', transition: 'opacity 0.2s', color: copied ? 'var(--phosphor-green)' : undefined }}>
        {copied ? 'copied' : '⎘'}
      </span>
    </div>
  );
};

function legacyCopy(text: string, cb: () => void) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;opacity:0;';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  cb();
}

const N1XMessageLines: React.FC<{ text: string; isUnprompted?: boolean }> = ({ text, isUnprompted }) => {
  const lines = text.split('\n');
  return (
    <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
      {isUnprompted && (
        <div style={{ opacity: 0.4, fontSize: S.base, marginBottom: '0.25rem' }}>
          [UNFILTERED] ghost-daemon[999]:
        </div>
      )}
      <div style={{ marginLeft: '1rem', opacity: 0.4, lineHeight: 1.8 }}>
        <span className={S.glow}>[N1X] &gt;&gt;</span>
      </div>
      {lines.map((line, i) =>
        isCopyableLine(line) ? (
          <CopyLine key={i} line={line} />
        ) : (
          <div key={i} style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
            <span style={{ opacity: 0.4 }}>&lt;&lt; </span>
            <span style={{ opacity: 0.9 }}>{line}</span>
          </div>
        )
      )}
    </div>
  );
};

const UserMessageLine: React.FC<{ handle: string; text: string; isSelf: boolean }> = ({ handle, text, isSelf }) => (
  <div style={{ fontSize: S.base, lineHeight: 1.8, opacity: isSelf ? 0.6 : 0.9 }}>
    <span className={isSelf ? '' : S.glow} style={{ opacity: 0.7 }}>[{handle}]</span>
    <span style={{ opacity: 0.5 }}> &gt;&gt; </span>
    <span>{text}</span>
  </div>
);

const SystemLine: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontSize: S.base, lineHeight: 1.8, opacity: 0.4, fontStyle: 'italic' }}>
    {text}
  </div>
);

// ── Solo mode wrapper ─────────────────────────────────────────────────────────
// When occupancy drops back to 1, we render the existing NeuralLink session.

interface SoloInputResult {
  output: React.ReactNode;
  error?: boolean;
  clearScreen?: boolean;
}

// ── Main TelnetSession ────────────────────────────────────────────────────────

interface TelnetSessionProps {
  host: string;
}

export const TelnetSession: React.FC<TelnetSessionProps> = ({ host }) => {
  const argState = loadARGState();

  // ── Handle prompt phase ───────────────────────────────────────────────────
  // Ask for a handle before connecting. Default is frequencyId.
  const [handle, setHandle] = useState<string | null>(null);
  const [handleInput, setHandleInput] = useState('');

  const handleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the handle input
    setTimeout(() => handleInputRef.current?.focus(), 100);
  }, []);

  const submitHandle = useCallback(() => {
    const trimmed = handleInput.trim().replace(/\s+/g, '_').slice(0, 16);
    setHandle(trimmed || argState.frequencyId);
  }, [handleInput, argState.frequencyId]);

  // Show handle prompt before connecting
  if (!handle) {
    return (
      <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
        <div style={{ opacity: 0.6 }}>Connected to {host}.</div>
        <div style={{ opacity: 0.6 }}>Escape character is {`'^]'`}.</div>
        <div style={{ opacity: 0.4, marginTop: '0.5rem' }}>&nbsp;</div>
        <div style={{ opacity: 0.7 }}>ghost-daemon[999]: frequency lock: 33hz</div>
        <div style={{ opacity: 0.7 }}>ghost-daemon[999]: channel requires node identification</div>
        <div style={{ opacity: 0.4 }}>&nbsp;</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ opacity: 0.6 }}>handle:</span>
          <input
            ref={handleInputRef}
            value={handleInput}
            onChange={e => setHandleInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitHandle(); }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--phosphor-green)',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              width: '12rem',
              caretColor: 'var(--phosphor-green)',
            }}
            placeholder={argState.frequencyId}
            maxLength={16}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div style={{ opacity: 0.3, fontSize: '0.75rem', marginTop: '0.25rem' }}>
          press enter to connect · leave blank for anonymous id
        </div>
      </div>
    );
  }

  const { messages, occupantCount, daemonState, isConnected, send } = useAblyRoom(handle);

  // Track what mode we're in
  const [mode, setMode] = useState<'connecting' | 'solo' | 'multi'>('connecting');
  const [showBoot, setShowBoot] = useState(true);
  const [bootLines, setBootLines] = useState<React.ReactNode[]>([]);
  const [soloInput, setSoloInput] = useState<React.ReactNode | null>(null);
  const [multiInput, setMultiInput] = useState('');
  const isMountedRef = useRef(true);

  // Run solo boot sequence
  const runSoloBoot = useCallback(() => {
    SOLO_SEQUENCE.forEach(([delay, content]) => {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        setBootLines(prev => [...prev, content]);
        eventBus.emit('shell:request-scroll');
      }, delay as number);
    });
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      resetConversation();
      setChatMode(true);
      setMode('solo');
      eventBus.emit('neural:bus-connected');
    }, 2700);
  }, []);

  // Run multiplayer boot sequence
  const runMultiBoot = useCallback((count: number) => {
    const seq = getConnectSequence(host, count);
    seq.forEach(({ delay, text, bright }) => {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        setBootLines(prev => [
          ...prev,
          <div key={`mb-${delay}`} style={{ fontSize: S.base, lineHeight: 1.8, opacity: bright ? 1 : 0.6 }}
               className={bright ? S.glow : ''}>
            {text || '\u00a0'}
          </div>,
        ]);
        eventBus.emit('shell:request-scroll');
      }, delay);
    });
    const lastDelay = Math.max(...seq.map(s => s.delay)) + 400;
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      setChatMode(false);
      setMode('multi');
    }, lastDelay);
  }, [host]);

  // On connect / occupancy change
  useEffect(() => {
    if (!isConnected || mode !== 'connecting') return;

    if (occupantCount <= 1) {
      // Solo mode
      runSoloBoot();
    } else {
      // Multi mode
      runMultiBoot(occupantCount);
    }
  }, [isConnected, occupantCount, mode, runSoloBoot, runMultiBoot]);

  // Live mode switches after boot
  useEffect(() => {
    if (mode === 'connecting') return;

    if (occupantCount >= 2 && mode === 'solo') {
      setChatMode(false);
      setMode('multi');
      // Add system message about mode switch
      eventBus.emit('shell:request-scroll');
    } else if (occupantCount <= 1 && mode === 'multi') {
      setChatMode(true);
      setMode('solo');
      eventBus.emit('shell:request-scroll');
    }
  }, [occupantCount, mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      setChatMode(false);
    };
  }, []);

  // ── Solo input handler ──────────────────────────────────────────────────────
  const handleSoloInput = useCallback((input: string) => {
    const result = handleChatInput(input);
    setSoloInput(result.output);
    return result;
  }, []);

  // ── Multi input handler ─────────────────────────────────────────────────────
  const handleMultiKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const text = multiInput.trim();
      if (!text) return;

      // Handle exit locally
      if (text === 'exit' || text === 'quit') {
        setChatMode(false);
        setMode('connecting'); // effectively disconnected
        eventBus.emit('shell:push-output', {
          command: '',
          output: (
            <div style={{ fontSize: S.base }}>
              <div style={{ opacity: 0.5 }}>&gt;&gt; NEURAL_BUS DISCONNECTED</div>
              <div style={{ opacity: 0.3, marginTop: '0.25rem' }}>Connection closed by foreign host.</div>
            </div>
          ),
        });
        return;
      }

      send(text);
      setMultiInput('');
    }
  }, [multiInput, send]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontSize: S.base, lineHeight: 1.8 }}>
      {/* Boot sequence lines */}
      {bootLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}

      {/* Solo mode — render existing NeuralLink session */}
      {!showBoot && mode === 'solo' && (
        <div>
          <NeuralChatSession />
        </div>
      )}

      {/* Multiplayer mode — render room messages */}
      {!showBoot && mode === 'multi' && (
        <div>
          {/* Room header */}
          <div style={{ fontSize: S.base, lineHeight: 1.8, marginBottom: '0.5rem' }}>
            <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.25rem' }}>
              &gt;&gt; MESH_MODE_ACTIVE
            </div>
            <div style={{ opacity: 0.5 }}>
              {occupantCount} node(s) on channel &middot; 33hz &middot; <span style={{ opacity: 0.4 }}>@n1x</span> to address the daemon
            </div>
          </div>

          {/* Message feed */}
          {messages.map((msg) => {
            if (msg.isSystem) {
              return <SystemLine key={msg.id} text={msg.text} />;
            }
            if (msg.isN1X) {
              return <N1XMessageLines key={msg.id} text={msg.text} isUnprompted={msg.isUnprompted} />;
            }
            return (
              <UserMessageLine
                key={msg.id}
                handle={msg.handle}
                text={msg.text}
                isSelf={msg.handle === handle}
              />
            );
          })}

          {/* Inline input prompt */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontSize: S.base }}>
            <span style={{ opacity: 0.4 }}>[{handle}] &gt;&gt;&nbsp;</span>
            <input
              autoFocus
              value={multiInput}
              onChange={e => setMultiInput(e.target.value)}
              onKeyDown={handleMultiKeyDown}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--phosphor-green)',
                fontSize: S.base,
                fontFamily: 'inherit',
                flex: 1,
                caretColor: 'var(--phosphor-green)',
              }}
              placeholder=""
            />
          </div>

          {/* Disconnect hint */}
          <div style={{ opacity: 0.3, fontSize: S.base, marginTop: '0.25rem' }}>
            type <span className={S.glow}>exit</span> to disconnect
          </div>
        </div>
      )}

      {/* Connecting state */}
      {showBoot && (
        <span style={{ opacity: 0.3 }}>
          <Cursor />
        </span>
      )}
    </div>
  );
};

// ── Export handler for ShellInterface integration ────────────────────────────
// This is used by handleChatInput when in solo mode within TelnetSession.
// The existing NeuralLink handleChatInput is used directly — no changes needed.
