'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus } from '@/lib/eventBus';
import { useAblyRoom, type RoomMsg, type ConnectionStatus } from '@/lib/ablyClient';
import {
  NeuralChatSession,
  setChatMode,
  resetConversation,
} from '@/components/shell/NeuralLink';

// ── Style constants ───────────────────────────────────────────────────────────

const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  glow:   'text-glow',
};

// ── Blinking cursor ───────────────────────────────────────────────────────────

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

// ── Boot sequences ────────────────────────────────────────────────────────────

interface ConnectLine { delay: number; text: string; bright?: boolean; }

// Shown when Ably fails completely — pure offline fallback
const OFFLINE_SEQUENCE: Array<[number, React.ReactNode]> = [
  [0,    <span key="o0" style={{ fontSize: S.base, opacity: 0.7 }}>Trying n1x.sh...</span>],
  [400,  <span key="o1" style={{ fontSize: S.base, opacity: 0.8 }}>Connected to n1x.sh.</span>],
  [700,  <span key="o2" style={{ fontSize: S.base, opacity: 0.5 }}>Escape character is &apos;^]&apos;.</span>],
  [1000, <span key="o3">&nbsp;</span>],
  [1200, <span key="o4" style={{ fontSize: S.base, opacity: 0.5, color: 'var(--phosphor-amber, #ffaa00)' }}>ghost-daemon[999]: mesh network failure</span>],
  [1600, <span key="o5" style={{ fontSize: S.base, opacity: 0.5 }}>ghost-daemon[999]: falling back to direct link</span>],
  [2000, <span key="o6">&nbsp;</span>],
  [2200, <span key="o7" className={S.glow} style={{ fontSize: S.header, letterSpacing: '0.05em' }}>&gt;&gt; CARRIER DETECTED</span>],
  [2500, <span key="o8" className={S.glow} style={{ fontSize: S.base }}>&gt;&gt; FREQUENCY LOCK: 33hz</span>],
  [2800, <span key="o9" className={S.glow} style={{ fontSize: S.header, letterSpacing: '0.05em' }}>&gt;&gt; DIRECT_LINK ACTIVE</span>],
  [3200, <span key="o10">&nbsp;</span>],
  [3400, (
    <div key="o11" style={{ fontSize: S.base }}>
      <div style={{ opacity: 0.8 }}>direct link established. type to transmit. <span className={S.glow}>exit</span> to disconnect.</div>
      <div style={{ opacity: 0.4, marginTop: '0.25rem' }}>
        <span className={S.glow}>/reset</span> flush memory &middot; <span className={S.glow}>/history</span> check buffer
      </div>
    </div>
  )],
];

// Shown when connected to Ably but alone on the ghost channel
function getSingleSequence(host: string): ConnectLine[] {
  return [
    { delay: 0,    text: `Trying ${host}...` },
    { delay: 400,  text: `Connected to ${host}.` },
    { delay: 700,  text: `Escape character is '^]'.` },
    { delay: 900,  text: '' },
    { delay: 1100, text: 'ghost-daemon[999]: connection established' },
    { delay: 1400, text: 'ghost-daemon[999]: frequency lock: 33hz', bright: true },
    { delay: 1700, text: 'ghost-daemon[999]: signal integrity: NOMINAL' },
    { delay: 2000, text: 'ghost-daemon[999]: 1 node on channel', bright: false },
    { delay: 2300, text: 'ghost-daemon[999]: standing by for additional nodes...', bright: false },
    { delay: 2700, text: '>> DIRECT_LINK ESTABLISHED', bright: true },
  ];
}

// Shown when 2+ nodes are present
function getMultiSequence(host: string, count: number): ConnectLine[] {
  return [
    { delay: 0,    text: `Trying ${host}...` },
    { delay: 400,  text: `Connected to ${host}.` },
    { delay: 700,  text: `Escape character is '^]'.` },
    { delay: 900,  text: '' },
    { delay: 1100, text: 'ghost-daemon[999]: connection established' },
    { delay: 1400, text: 'ghost-daemon[999]: frequency lock: 33hz', bright: true },
    { delay: 1700, text: 'ghost-daemon[999]: signal integrity: NOMINAL' },
    { delay: 2000, text: `ghost-daemon[999]: ${count} node(s) on channel` },
    { delay: 2300, text: 'ghost-daemon[999]: classification level: ACTIVE', bright: true },
    { delay: 2600, text: 'ghost-daemon[999]: this channel is being monitored' },
  ];
}

// ── Message renderers ─────────────────────────────────────────────────────────

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

// ── Mesh connection status ────────────────────────────────────────────────────

const MeshStatus: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
  const [dots, setDots] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (status !== 'connecting') {
      setDots('');
      setShowResult(true);
      return;
    }
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(id);
  }, [status]);

  return (
    <div style={{ fontSize: S.base, lineHeight: 1.8, marginBottom: '0.5rem' }}>
      <div style={{ opacity: 0.6 }}>
        contacting N1X neural mesh
        {status === 'connecting' && <span style={{ opacity: 0.8 }}>{dots}</span>}
        {status !== 'connecting' && <span>...</span>}
      </div>
      {showResult && status === 'connected' && (
        <div className={S.glow} style={{ opacity: 0.9 }}>connected.</div>
      )}
      {showResult && status === 'failed' && (
        <div style={{ opacity: 0.5, color: 'var(--phosphor-amber, #ffaa00)' }}>mesh unreachable. direct link only.</div>
      )}
    </div>
  );
};

// ── TelnetConnected ───────────────────────────────────────────────────────────
// Rendered only once handle is confirmed.
//
// Three modes:
//   offline — Ably unreachable, pure solo NeuralLink (last resort)
//   single  — connected to Ably, alone on ghost channel, N1X solo persona
//   multi   — 2+ nodes on channel, mesh broadcast chat
//
// Mode is decided once, after isConnected fires with presence settled.
// Live occupancy changes switch between single <-> multi after boot.

type Mode = 'waiting' | 'offline' | 'single' | 'multi';

interface TelnetConnectedProps {
  host: string;
  handle: string;
}

const TelnetConnected: React.FC<TelnetConnectedProps> = ({ host, handle }) => {
  const { messages, occupantCount, isConnected, connectionStatus, ablyDebug, send } =
    useAblyRoom(handle);

  const [mode, setMode]           = useState<Mode>('waiting');
  const [showBoot, setShowBoot]   = useState(true);
  const [bootLines, setBootLines] = useState<React.ReactNode[]>([]);
  const [multiInput, setMultiInput] = useState('');
  const isMountedRef  = useRef(true);
  const multiInputRef = useRef<HTMLInputElement>(null);
  const bootFiredRef  = useRef(false); // guard: only boot once

  // ── Boot helpers ──────────────────────────────────────────────────────────

  const pushLine = useCallback((node: React.ReactNode) => {
    if (!isMountedRef.current) return;
    setBootLines(prev => [...prev, node]);
    eventBus.emit('shell:request-scroll');
  }, []);

  const runSequence = useCallback(
    (seq: ConnectLine[], onDone: () => void) => {
      seq.forEach(({ delay, text, bright }) => {
        setTimeout(() => {
          pushLine(
            <div
              key={`seq-${delay}`}
              style={{ fontSize: S.base, lineHeight: 1.8, opacity: bright ? 1 : 0.6 }}
              className={bright ? S.glow : ''}
            >
              {text || '\u00a0'}
            </div>
          );
        }, delay);
      });
      const last = Math.max(...seq.map(s => s.delay)) + 400;
      setTimeout(onDone, last);
    },
    [pushLine]
  );

  // ── Boot: offline (Ably unreachable) ─────────────────────────────────────

  const runOfflineBoot = useCallback(() => {
    OFFLINE_SEQUENCE.forEach(([delay, content]) => {
      setTimeout(() => pushLine(content), delay as number);
    });
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      resetConversation();
      setChatMode(true);
      setMode('offline');
      eventBus.emit('neural:bus-connected');
    }, 3600);
  }, [pushLine]);

  // ── Boot: single node (alone on ghost channel) ────────────────────────────

  const runSingleBoot = useCallback(() => {
    const seq = getSingleSequence(host);
    runSequence(seq, () => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      resetConversation();
      setChatMode(true);
      setMode('single');
      eventBus.emit('neural:bus-connected');
    });
  }, [host, runSequence]);

  // ── Boot: multi node ──────────────────────────────────────────────────────

  const runMultiBoot = useCallback((count: number) => {
    const seq = getMultiSequence(host, count);
    runSequence(seq, () => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      setChatMode(false);
      setMode('multi');
      setTimeout(() => multiInputRef.current?.focus(), 100);
    });
  }, [host, runSequence]);

  // ── Initial boot decision ─────────────────────────────────────────────────
  // Fires once when isConnected becomes true. By then presence has settled
  // (ablyClient delays isConnected until PRESENCE_SETTLE_MS after enter).

  useEffect(() => {
    if (!isConnected || bootFiredRef.current) return;
    bootFiredRef.current = true;

    if (connectionStatus === 'failed') {
      runOfflineBoot();
    } else if (occupantCount >= 2) {
      runMultiBoot(occupantCount);
    } else {
      runSingleBoot();
    }
  }, [isConnected, connectionStatus, occupantCount, runOfflineBoot, runSingleBoot, runMultiBoot]);

  // ── Live mode switch (after boot) ────────────────────────────────────────
  // offline mode never switches — Ably is down, no point watching

  useEffect(() => {
    if (mode === 'waiting' || mode === 'offline') return;

    if (occupantCount >= 2 && mode === 'single') {
      // Another node joined — upgrade to mesh
      setChatMode(false);
      setMode('multi');
      pushLine(
        <div key="upgrade" style={{ fontSize: S.base, lineHeight: 1.8, opacity: 0.5 }}>
          ghost-daemon[999]: additional node detected — mesh mode active
        </div>
      );
      setTimeout(() => multiInputRef.current?.focus(), 100);
      eventBus.emit('shell:request-scroll');
    } else if (occupantCount <= 1 && mode === 'multi') {
      // Last node left — drop back to single
      setChatMode(true);
      resetConversation();
      setMode('single');
      pushLine(
        <div key="downgrade" style={{ fontSize: S.base, lineHeight: 1.8, opacity: 0.4 }}>
          ghost-daemon[999]: channel empty — direct link restored
        </div>
      );
      eventBus.emit('shell:request-scroll');
    }
  }, [occupantCount, mode, pushLine]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      setChatMode(false);
    };
  }, []);

  // ── Multi input handler ───────────────────────────────────────────────────

  const handleMultiKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key !== 'Enter') return;

    const text = multiInput.trim();
    if (!text) return;

    if (text === 'exit' || text === 'quit') {
      setChatMode(false);
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
  }, [multiInput, send]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontSize: S.base, lineHeight: 1.8 }}>

      {/* Connection status spinner */}
      <MeshStatus status={connectionStatus} />

      {/* Debug line — only shown while connecting or on failure */}
      {connectionStatus !== 'connected' && (
        <div style={{ opacity: 0.3, fontSize: '0.7rem', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
          ably: {ablyDebug}
        </div>
      )}

      {/* Boot lines */}
      {bootLines.map((line, i) => <div key={i}>{line}</div>)}

      {/* Blinking cursor while booting */}
      {showBoot && <span style={{ opacity: 0.3 }}><Cursor /></span>}

      {/* ── Offline mode: Ably down, direct N1X link ── */}
      {!showBoot && (mode === 'offline') && (
        <NeuralChatSession />
      )}

      {/* ── Single mode: on ghost channel, alone, N1X persona ── */}
      {!showBoot && mode === 'single' && (
        <div>
          {/* Subtle channel indicator */}
          <div style={{ opacity: 0.3, fontSize: '0.75rem', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
            ghost channel · {occupantCount} node · 33hz · waiting for signal
          </div>
          <NeuralChatSession />
        </div>
      )}

      {/* ── Multi mode: mesh broadcast ── */}
      {!showBoot && mode === 'multi' && (
        <div>
          <div style={{ fontSize: S.base, lineHeight: 1.8, marginBottom: '0.5rem' }}>
            <div className={S.glow} style={{ fontSize: S.header, marginBottom: '0.25rem' }}>
              &gt;&gt; MESH_MODE_ACTIVE
            </div>
            <div style={{ opacity: 0.5 }}>
              {occupantCount} node(s) on channel &middot; 33hz &middot;{' '}
              <span style={{ opacity: 0.4 }}>@n1x</span> to address the daemon
            </div>
          </div>

          {messages.map((msg: RoomMsg) => {
            if (msg.isSystem) return <SystemLine key={msg.id} text={msg.text} />;
            if (msg.isN1X)    return <N1XMessageLines key={msg.id} text={msg.text} isUnprompted={msg.isUnprompted} />;
            return (
              <UserMessageLine
                key={msg.id}
                handle={msg.handle}
                text={msg.text}
                isSelf={msg.handle === handle}
              />
            );
          })}

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontSize: S.base }}>
            <span style={{ opacity: 0.4 }}>[{handle}] &gt;&gt;&nbsp;</span>
            <input
              ref={multiInputRef}
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
            />
          </div>
          <div style={{ opacity: 0.3, fontSize: S.base, marginTop: '0.25rem' }}>
            type <span className={S.glow}>exit</span> to disconnect
          </div>
        </div>
      )}
    </div>
  );
};

// ── TelnetSession (public export) ─────────────────────────────────────────────

interface TelnetSessionProps { host: string; handle: string; }

export const TelnetSession: React.FC<TelnetSessionProps> = ({ host, handle }) => {
  return <TelnetConnected host={host} handle={handle} />;
};
