'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus } from '@/lib/eventBus';
import { useAblyRoom, type RoomMsg, type ConnectionStatus } from '@/lib/ablyClient';
import {
  setChatMode,
} from '@/components/shell/NeuralLink';
import {
  activateTelnet,
  deactivateTelnet,
  clearHandle,
} from '@/lib/telnetBridge';

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

// Ably unreachable — offline fallback
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

// ghost channel boot sequence
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
    { delay: 3000, text: '>> MESH_MODE_ACTIVE', bright: true },
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
    <div
      style={{ cursor: 'pointer', lineHeight: 1.8, paddingLeft: '2ch' }}
      onClick={handleCopy}
      title="tap to copy"
    >
      <span style={{ opacity: 0.35 }}>&lt;&lt; </span>
      <span style={{
        opacity: 0.95,
        borderBottom: '1px dashed rgba(51,255,51,0.35)',
        paddingBottom: 1,
        wordBreak: 'break-all',
      }}>
        {line}
      </span>
      <span style={{
        opacity: copied ? 0.9 : 0.3,
        fontSize: '0.7em',
        marginLeft: '0.6rem',
        transition: 'opacity 0.2s',
        color: copied ? 'var(--phosphor-green)' : undefined,
      }}>
        {copied ? 'copied' : '⎘'}
      </span>
    </div>
  );
};

// ── Colors ────────────────────────────────────────────────────────────────────

const C = {
  bracket:     'var(--phosphor-green)',       // [ ] always green
  selfUser:    'var(--phosphor-green)',       // my own handle
  otherUser:   '#b0b0b0',                    // other users — light grey
  n1xName:     '#ff4444',                    // N1X name — red
  selfMsg:     '#ffffff',                    // my messages — white
  otherMsg:    '#b0b0b0',                    // others — light grey
  n1xMsg:      'var(--phosphor-green)',      // N1X responses — green
  timestamp:   'rgba(51,255,51,0.3)',        // faded green
  system:      '#ff8c00',                    // system — orange
  thinking:    'rgba(51,255,51,0.45)',
};

function formatTs(ts: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

const ThinkingDots: React.FC = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(id);
  }, []);
  return <span>{dots}</span>;
};

// Layout per message:
//   HH:MM:SS
//   [handle] > text text text

interface MsgRowProps {
  ts:         number;
  bracket:    string;  // color of [ ]
  nameColor:  string;
  name:       string;
  arrow?:     React.ReactNode;
  msgColor:   string;
  children:   React.ReactNode;
}

const MsgRow: React.FC<MsgRowProps> = ({ ts, bracket, nameColor, name, msgColor, children }) => (
  <div style={{ marginBottom: '0.5rem', fontFamily: 'monospace' }}>
    {/* Timestamp line */}
    <div style={{ color: C.timestamp, fontSize: '0.72em', lineHeight: 1.4, marginBottom: '0.05rem' }}>
      {formatTs(ts)}
    </div>
    {/* Handle + message line */}
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5ch', lineHeight: 1.7 }}>
      <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
        <span style={{ color: bracket }}>[</span>
        <span style={{ color: nameColor }}>{name}</span>
        <span style={{ color: bracket }}>]</span>
      </span>
      <span style={{ color: bracket, opacity: 0.6, flexShrink: 0 }}>&gt;</span>
      <span style={{ color: msgColor, wordBreak: 'break-word' }}>{children}</span>
    </div>
  </div>
);

const N1XMessage: React.FC<{ msg: RoomMsg }> = ({ msg }) => {
  if (msg.isThinking) {
    return (
      <MsgRow
        ts={msg.ts}
        bracket={C.bracket}
        nameColor={C.n1xName}
        name="N1X"
        msgColor={C.thinking}
      >
        <span style={{ fontStyle: 'italic' }}>signal processing<ThinkingDots /></span>
      </MsgRow>
    );
  }

  const lines = msg.text.split('\n').filter(l => l.trim() !== '');

  return (
    <div style={{ marginBottom: '0.5rem', fontFamily: 'monospace' }}>
      <div style={{ color: C.timestamp, fontSize: '0.72em', lineHeight: 1.4, marginBottom: '0.05rem' }}>
        {formatTs(msg.ts)}
        {msg.isUnprompted && (
          <span style={{ marginLeft: '0.75ch', opacity: 0.6 }}>[UNFILTERED]</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5ch', lineHeight: 1.7 }}>
        <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          <span style={{ color: C.bracket }}>[</span>
          <span style={{ color: C.n1xName }}>N1X</span>
          <span style={{ color: C.bracket }}>]</span>
        </span>
        <span style={{ color: C.bracket, opacity: 0.6, flexShrink: 0 }}>&gt;</span>
        <span style={{ color: C.n1xMsg, wordBreak: 'break-word' }}>
          {lines.map((line, i) =>
            isCopyableLine(line)
              ? <CopyLine key={i} line={line} />
              : <span key={i} style={{ display: i > 0 ? 'block' : 'inline' }}>{line}</span>
          )}
        </span>
      </div>
    </div>
  );
};

const UserMessage: React.FC<{ msg: RoomMsg; isSelf: boolean }> = ({ msg, isSelf }) => (
  <MsgRow
    ts={msg.ts}
    bracket={C.bracket}
    nameColor={isSelf ? C.selfUser : C.otherUser}
    name={msg.handle}
    msgColor={isSelf ? C.selfMsg : C.otherMsg}
  >
    {msg.text}
  </MsgRow>
);

const SystemMsg: React.FC<{ msg: RoomMsg }> = ({ msg }) => (
  <div style={{
    color:       C.system,
    fontStyle:   'italic',
    fontSize:    '0.8em',
    lineHeight:  1.7,
    marginBottom: '0.35rem',
    fontFamily:  'monospace',
    opacity:     0.9,
  }}>
    <span style={{ color: C.timestamp, marginRight: '0.6ch' }}>{formatTs(msg.ts)}</span>
    {msg.text}
  </div>
);

// ── Channel stats bar ─────────────────────────────────────────────────────────

const ChannelStats: React.FC<{ occupantCount: number; handle: string }> = ({ occupantCount, handle }) => (
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0 1.5rem',
    fontSize: '0.7rem',
    fontFamily: 'monospace',
    opacity: 0.45,
    borderBottom: '1px solid rgba(51,255,51,0.1)',
    paddingBottom: '0.5rem',
    marginBottom: '0.75rem',
    lineHeight: 1.6,
  }}>
    <span>ghost channel</span>
    <span><span className={S.glow} style={{ opacity: 1 }}>{occupantCount}</span> node{occupantCount !== 1 ? 's' : ''} connected</span>
    <span>33hz</span>
    <span>you: <span style={{ opacity: 0.8 }}>{handle}</span></span>
    <span style={{ opacity: 0.6 }}>@n1x to address daemon</span>
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
//
// Three modes:
//   offline — Ably unreachable. Pure NeuralLink solo. Last resort.
// Two modes:
//   offline — Ably completely unreachable
//   multi   — connected to Ably ghost channel, mesh broadcast
//             Bottom bar: [handle]>> → NeuralLink (solo AI)
//             When someone joins → upgrades to multi live.
//   multi   — 2+ nodes. Mesh broadcast. Bottom bar: [handle]>> → Ably.
//             telnetBridge active so commandRegistry routes input to Ably.
//
// There is ONE input: the bottom shell bar (NeuralBusPrompt).
// No duplicate inline input in this component.

type Mode = 'waiting' | 'offline' | 'multi';

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
  const isMountedRef  = useRef(true);
  const bootFiredRef  = useRef(false);

  // ── Disconnect handler (called by commandRegistry via telnetBridge) ───────

  const handleDisconnect = useCallback(() => {
    deactivateTelnet();
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
  }, []);

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

  // ── Boot: offline ─────────────────────────────────────────────────────────

  const runOfflineBoot = useCallback(() => {
    OFFLINE_SEQUENCE.forEach(([delay, content]) => {
      setTimeout(() => pushLine(content), delay as number);
    });
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      setMode('offline');
    }, 3600);
  }, [pushLine]);

  // ── Boot: multi (mesh mode) — always used when Ably is reachable ─────────

  const runMultiBoot = useCallback((count: number) => {
    runSequence(getMultiSequence(host, count), () => {
      if (!isMountedRef.current) return;
      setShowBoot(false);
      activateTelnet(handle, send, handleDisconnect);
      setChatMode(true);
      setMode('multi');
      // Scroll to bottom so chat loads clean — history is above viewport, not gone
      setTimeout(() => eventBus.emit('shell:request-scroll'), 50);
    });
  }, [host, handle, send, handleDisconnect, runSequence]);

  // ── Initial boot decision ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isConnected || bootFiredRef.current) return;
    bootFiredRef.current = true;

    if (connectionStatus === 'failed') {
      runOfflineBoot();
    } else {
      runMultiBoot(occupantCount);
    }
  }, [isConnected, connectionStatus, occupantCount, runOfflineBoot, runMultiBoot]);

  // ── Live occupancy updates (multi only) ──────────────────────────────────
  // No mode switching needed — multi is the only connected state.
  // Occupant count updates automatically via ChannelStats re-render.

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      deactivateTelnet();
      clearHandle();
      setChatMode(false);
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontSize: S.base, lineHeight: 1.8 }}>

      {/* Ably connection spinner */}
      <MeshStatus status={connectionStatus} />

      {/* Debug — only while connecting or on failure */}
      {connectionStatus !== 'connected' && (
        <div style={{ opacity: 0.25, fontSize: '0.65rem', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
          ably: {ablyDebug}
        </div>
      )}

      {/* Boot sequence lines */}
      {bootLines.map((line, i) => <div key={i}>{line}</div>)}

      {/* Cursor while booting */}
      {showBoot && <span style={{ opacity: 0.3 }}><Cursor /></span>}

      {/* ── Offline: Ably down ── */}
      {!showBoot && mode === 'offline' && (
        <div style={{ opacity: 0.5, fontSize: S.base, fontStyle: 'italic' }}>
          mesh unreachable. signal lost.
        </div>
      )}

      {/* ── Multi: mesh broadcast ── */}
      {!showBoot && mode === 'multi' && (
        <div>
          <ChannelStats occupantCount={occupantCount} handle={handle} />

          {messages.length === 0 && (
            <div style={{ opacity: 0.3, fontSize: S.base, fontStyle: 'italic', marginBottom: '0.5rem' }}>
              channel open. transmit to begin.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {messages.map((msg: RoomMsg) => {
              if (msg.isSystem) return <SystemMsg key={msg.id} msg={msg} />;
              if (msg.isN1X)    return <N1XMessage key={msg.id} msg={msg} />;
              return <UserMessage key={msg.id} msg={msg} isSelf={msg.handle === handle} />;
            })}
          </div>

          {/* No inline input — bottom shell bar handles input via telnetBridge */}
          <div style={{ opacity: 0.2, fontSize: '0.65rem', marginTop: '0.75rem', fontFamily: 'monospace' }}>
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
