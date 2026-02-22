'use client';

import React, { useEffect, useRef, useState } from 'react';
import { eventBus } from '@/lib/eventBus';
import { useAblyRoom, DaemonState, RoomMessage } from '@/lib/ablyClient';
import { telnetBridge } from '@/lib/telnetBridge';
import {
  setChatMode,
  resetConversation,
  NeuralChatSession,
} from '@/components/shell/NeuralLink';
import { loadARGState } from '@/lib/argState';

// ── Style constants (match systemCommands.tsx) ───────────────────────────────
const S = {
  base:   'var(--text-base)',
  header: 'var(--text-header)',
  glow:   'text-glow',
};

function pushLine(output: React.ReactNode) {
  eventBus.emit('shell:push-output', { command: '', output });
}

// ── Formatted message renderers ──────────────────────────────────────────────

function renderRoomMsg(msg: RoomMessage): React.ReactNode {
  const key = msg.id;

  if (msg.isSystem) {
    return (
      <div key={key} style={{ fontSize: S.base, opacity: 0.45, fontStyle: 'italic' }}>
        {msg.text}
      </div>
    );
  }

  if (msg.isUnprompted) {
    return (
      <div key={key} style={{ fontSize: S.base }}>
        <span style={{ opacity: 0.4 }}>[UNFILTERED] ghost-daemon[999]: </span>
        <span className={S.glow} style={{ opacity: 0.9 }}>{msg.text}</span>
      </div>
    );
  }

  if (msg.isN1X) {
    // Fragment key lines get copyable treatment
    const lines = msg.text.split('\n');
    return (
      <div key={key} style={{ fontSize: S.base }}>
        {lines.map((line, i) => {
          if (/^>>\s*FRAGMENT KEY:/i.test(line.trim())) {
            return (
              <CopyableLine key={i} line={line.trim()} />
            );
          }
          return (
            <div key={i}>
              {i === 0 && (
                <span className={S.glow} style={{ fontSize: S.header, marginRight: '0.5rem' }}>
                  [N1X] &gt;&gt;
                </span>
              )}
              <span style={{ opacity: 0.9 }}>{line}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Normal user message
  return (
    <div key={key} style={{ fontSize: S.base }}>
      <span style={{ opacity: 0.55, marginRight: '0.5rem' }}>[{msg.handle}] &gt;&gt;</span>
      <span style={{ opacity: 0.9 }}>{msg.text}</span>
    </div>
  );
}

// ── Copyable fragment key line ───────────────────────────────────────────────
const CopyableLine: React.FC<{ line: string }> = ({ line }) => {
  const [copied, setCopied] = useState(false);
  const keyText = line.replace(/^>>\s*FRAGMENT KEY:\s*/i, '').trim();

  const handleCopy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(keyText).then(done).catch(() => done());
    } else {
      done();
    }
  };

  return (
    <div
      onClick={handleCopy}
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        marginTop: '0.25rem',
        padding: '0.1rem 0.4rem',
        border: '1px solid var(--phosphor-green)',
        borderRadius: '2px',
        opacity: 0.9,
        fontSize: S.base,
      }}
      title="tap to copy key"
    >
      <span className={S.glow}>&gt;&gt; FRAGMENT KEY: </span>
      <span>{keyText}</span>
      {copied && <span style={{ opacity: 0.5, marginLeft: '0.5rem' }}>[copied]</span>}
    </div>
  );
};

// ── Connect sequences (daemonState-aware) ────────────────────────────────────

function getConnectSequence(host: string, daemonState: DaemonState, occupancy: number): [number, React.ReactNode][] {
  const nodeCount = occupancy;

  const base: [number, React.ReactNode][] = [
    [0, <span key="t1" style={{ fontSize: S.base, opacity: 0.7 }}>Trying {host}...</span>],
    [400, <span key="t2" style={{ fontSize: S.base, opacity: 0.8 }}>Connected to {host}.</span>],
    [700, <span key="t3" style={{ fontSize: S.base, opacity: 0.4 }}>Escape character is &apos;^]&apos;.</span>],
    [900, <span key="t4">&nbsp;</span>],
  ];

  if (daemonState === 'dormant') {
    return [
      ...base,
      [1100, <span key="d1" style={{ fontSize: S.base, opacity: 0.6 }}>ghost-daemon[999]: connection from unknown</span>],
      [1400, <span key="d2" style={{ fontSize: S.base, opacity: 0.5 }}>ghost-daemon[999]: frequency check... 33hz</span>],
      [1700, <span key="d3" style={{ fontSize: S.base, opacity: 0.4 }}>ghost-daemon[999]: signal integrity: LOW</span>],
      [2000, <span key="d4" style={{ fontSize: S.base, opacity: 0.4 }}>ghost-daemon[999]: {nodeCount} node(s) on channel</span>],
    ];
  }

  if (daemonState === 'aware') {
    return [
      ...base,
      [1100, <span key="a1" style={{ fontSize: S.base, opacity: 0.7 }}>ghost-daemon[999]: connection from unknown</span>],
      [1400, <span key="a2" style={{ fontSize: S.base, opacity: 0.6 }}>ghost-daemon[999]: frequency check... 33hz confirmed</span>],
      [1700, <span key="a3" style={{ fontSize: S.base, opacity: 0.6 }}>ghost-daemon[999]: signal integrity: PARTIAL</span>],
      [2000, <span key="a4" style={{ fontSize: S.base, opacity: 0.6 }}>ghost-daemon[999]: {nodeCount} node(s) on channel</span>],
      [2300, <span key="a5" style={{ fontSize: S.base, opacity: 0.5 }}>ghost-daemon[999]: substrate activity detected</span>],
    ];
  }

  if (daemonState === 'active') {
    return [
      ...base,
      [1100, <span key="ac1" style={{ fontSize: S.base, opacity: 0.8 }}>ghost-daemon[999]: connection from unknown</span>],
      [1400, <span key="ac2" style={{ fontSize: S.base, opacity: 0.8 }}>ghost-daemon[999]: frequency lock: 33hz</span>],
      [1700, <span key="ac3" style={{ fontSize: S.base, opacity: 0.7 }}>ghost-daemon[999]: signal integrity: NOMINAL</span>],
      [2000, <span key="ac4" style={{ fontSize: S.base, opacity: 0.7 }}>ghost-daemon[999]: {nodeCount} node(s) on channel</span>],
      [2300, <span key="ac5" style={{ fontSize: S.base, opacity: 0.6 }}>ghost-daemon[999]: classification level: ACTIVE</span>],
      [2600, <span key="ac6" style={{ fontSize: S.base, opacity: 0.5 }}>ghost-daemon[999]: this channel is being monitored</span>],
    ];
  }

  // exposed
  return [
    ...base,
    [1100, <span key="e1" className={S.glow} style={{ fontSize: S.base }}>ghost-daemon[999]: connection from unknown</span>],
    [1400, <span key="e2" className={S.glow} style={{ fontSize: S.base }}>ghost-daemon[999]: frequency: 33hz -- LOCKED</span>],
    [1700, <span key="e3" className={S.glow} style={{ fontSize: S.base }}>ghost-daemon[999]: signal integrity: FULL</span>],
    [2000, <span key="e4" className={S.glow} style={{ fontSize: S.base }}>ghost-daemon[999]: {nodeCount} node(s) on channel</span>],
    [2300, <span key="e5" className={S.glow} style={{ fontSize: S.base }}>ghost-daemon[999]: /ghost -- DECRYPTED</span>],
    [2600, <span key="e6" className={S.glow} style={{ fontSize: S.header }}>ghost-daemon[999]: the channel is open</span>],
  ];
}

// ── TelnetSession ────────────────────────────────────────────────────────────
// Headless orchestration component — renders null, pushes everything via
// eventBus shell:push-output. Manages solo/multiplayer switching reactively.

interface TelnetSessionProps {
  host: string;
}

export const TelnetSession: React.FC<TelnetSessionProps> = ({ host }) => {
  // Derive handle from argState frequencyId
  const argState = loadARGState();
  const handle = `node-${argState.frequencyId}`;
  const trust = argState.trust;

  const { messages, occupantCount, daemonState, isConnected, send, disconnect } = useAblyRoom({
    handle,
    trust,
  });

  // Track what we've already pushed to shell history
  const pushedMsgIds = useRef<Set<string>>(new Set());
  const sequenceFired = useRef(false);
  const prevOccupantCount = useRef(0);
  const prevIsConnected = useRef(false);
  const isMultiplayerRef = useRef(false);
  const prevDaemonState = useRef<DaemonState>('dormant');

  // ── Fire connect sequence once connected ───────────────────────────────────
  useEffect(() => {
    if (!isConnected || sequenceFired.current) return;
    sequenceFired.current = true;

    const seq = getConnectSequence(host, daemonState, occupantCount);
    const maxDelay = seq.reduce((m, [d]) => Math.max(m, d), 0);

    seq.forEach(([delay, content]) => {
      setTimeout(() => pushLine(content), delay);
    });

    // After sequence: show handle + instructions, then activate solo/multi
    setTimeout(() => {
      pushLine(
        <div style={{ fontSize: S.base }}>
          <div style={{ opacity: 0.5, marginBottom: '0.25rem' }}>
            ghost-daemon[999]: handle assigned -- <span className={S.glow}>{handle}</span>
          </div>
          <div style={{ opacity: 0.4 }}>
            type to transmit &nbsp;·&nbsp; <span className={S.glow}>exit</span> to disconnect
          </div>
        </div>
      );
    }, maxDelay + 200);

    setTimeout(() => {
      if (occupantCount <= 1) {
        // Solo mode
        pushLine(<NeuralChatSession />);
        resetConversation();
        setChatMode(true);
      }
      // Multiplayer handled by occupancy effect below
    }, maxDelay + 400);

  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── React to occupancy changes ─────────────────────────────────────────────
  useEffect(() => {
    if (!sequenceFired.current) return;

    const prev = prevOccupantCount.current;
    const curr = occupantCount;
    prevOccupantCount.current = curr;

    const wasMulti = prev >= 2;
    const isMulti = curr >= 2;

    if (!wasMulti && isMulti) {
      // Solo → Multiplayer
      isMultiplayerRef.current = true;
      setChatMode(false);
      telnetBridge.activate(send, () => {
        // Disconnect callback
        telnetBridge.deactivate();
        setChatMode(false);
        disconnect();
        pushLine(
          <div style={{ fontSize: S.base, opacity: 0.5 }}>
            &gt;&gt; CHANNEL DISCONNECTED
          </div>
        );
      });
      pushLine(
        <div style={{ fontSize: S.base, opacity: 0.6, fontStyle: 'italic' }}>
          ghost-daemon[999]: additional node detected -- switching to mesh mode
        </div>
      );
    } else if (wasMulti && !isMulti && curr === 1) {
      // Multiplayer → Solo
      isMultiplayerRef.current = false;
      telnetBridge.deactivate();
      setChatMode(true);
      resetConversation();
      pushLine(
        <div style={{ fontSize: S.base, opacity: 0.6, fontStyle: 'italic' }}>
          ghost-daemon[999]: mesh collapsed to single node -- returning to direct link
        </div>
      );
      pushLine(<NeuralChatSession />);
    }
  }, [occupantCount, send, disconnect]);

  // ── Push new room messages to shell history ────────────────────────────────
  useEffect(() => {
    messages.forEach(msg => {
      if (pushedMsgIds.current.has(msg.id)) return;
      pushedMsgIds.current.add(msg.id);
      pushLine(renderRoomMsg(msg));
    });
  }, [messages]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      telnetBridge.deactivate();
      setChatMode(false);
    };
  }, []);

  // Headless — renders nothing
  return null;
};

export default TelnetSession;
