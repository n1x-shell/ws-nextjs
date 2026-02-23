'use client';

import React, { useState, useEffect, useRef } from 'react';
import { eventBus } from '@/lib/eventBus';

// ── Conversation memory (module-level, persists across command invocations) ─

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

let conversationHistory: ChatMessage[] = [];
let chatModeActive = false;
let messageCount = 0;

export function resetConversation() {
  conversationHistory = [];
  messageCount = 0;
}

export function isChatMode() {
  return chatModeActive;
}

export function setChatMode(active: boolean) {
  chatModeActive = active;
}

// ── Trust level reader — reads from localStorage ARG state ──────────────────
// Safe to call client-side only. Returns 0 if unavailable.

function getCurrentTrust(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem('n1x_substrate');
    if (!raw) return 0;
    const state = JSON.parse(raw);
    return typeof state.trust === 'number' ? state.trust : 0;
  } catch {
    return 0;
  }
}

// ── Trust signal labels (ARG design doc spec) ───────────────────────────────

const TRUST_SIGNAL: Record<number, string> = {
  0: 'WEAK',
  1: 'NOMINAL',
  2: 'NOMINAL',
  3: 'NOMINAL',
  4: 'STRONG',
  5: 'STRONG',
};

function getTrustSignal(trust: number): string {
  return TRUST_SIGNAL[Math.max(0, Math.min(5, trust))] ?? 'WEAK';
}

// ── Blinking cursor during streaming ────────────────────────────────────────

const StreamCursor: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 400);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        display: 'inline-block',
        width: '6px',
        height: '12px',
        background: visible ? 'var(--phosphor-green)' : 'transparent',
        marginLeft: '4px',
        verticalAlign: 'middle',
      }}
    />
  );
};

// ── Copyable line — tap to copy on mobile ───────────────────────────────────

const BASE64_RE = /^[A-Za-z0-9+/]{20,}={0,2}$/;
const FRAGMENT_KEY_RE = /^>>\s*FRAGMENT KEY:/i;

function isCopyableLine(line: string): boolean {
  const trimmed = line.trim();
  return BASE64_RE.test(trimmed) || FRAGMENT_KEY_RE.test(trimmed);
}

function extractCopyText(line: string): string {
  const trimmed = line.trim();
  if (FRAGMENT_KEY_RE.test(trimmed)) {
    return trimmed.replace(/^>>\s*FRAGMENT KEY:\s*/i, '').trim();
  }
  return trimmed;
}

const CopyableLine: React.FC<{ line: string }> = ({ line }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = extractCopyText(line);
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        const el = document.createElement('textarea');
        el.value = text; el.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el);
        done();
      });
    } else {
      const el = document.createElement('textarea');
      el.value = text; el.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      done();
    }
  };

  return (
    <div
      style={{ marginLeft: '1rem', lineHeight: 1.8, cursor: 'pointer' }}
      onClick={handleCopy}
      title="tap to copy"
    >
      <span style={{ opacity: 0.4 }}>&lt;&lt; </span>
      <span
        style={{
          opacity: 0.9,
          borderBottom: '1px dashed rgba(51,255,51,0.4)',
          paddingBottom: '1px',
          wordBreak: 'break-all',
        }}
      >
        {line}
      </span>
      <span
        style={{
          opacity: copied ? 0.8 : 0.3,
          fontSize: '0.75em',
          marginLeft: '0.5rem',
          transition: 'opacity 0.2s',
          color: copied ? 'var(--phosphor-green)' : undefined,
        }}
      >
        {copied ? 'copied' : '⎘'}
      </span>
    </div>
  );
};

// ── Prefixed response line ───────────────────────────────────────────────────

const PrefixedLine: React.FC<{ children: React.ReactNode; glow?: boolean }> = ({ children, glow }) => (
  <div style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
    <span style={{ opacity: 0.4 }}>&lt;&lt; </span>
    <span className={glow ? 'text-glow' : ''} style={{ opacity: glow ? 1 : 0.9 }}>{children}</span>
  </div>
);

// ── NeuralLinkStream: renders a single streaming response ───────────────────

interface NeuralLinkStreamProps {
  prompt: string;
}

export const NeuralLinkStream: React.FC<NeuralLinkStreamProps> = ({ prompt }) => {
  const [tokens, setTokens] = useState('');
  const [status, setStatus] = useState<'connecting' | 'streaming' | 'complete' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  const hasStarted = useRef(false);
  const isFirstMessage = useRef(false);
  // Capture trust at render time so it doesn't change mid-stream
  const trustRef = useRef(getCurrentTrust());

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    messageCount++;
    isFirstMessage.current = messageCount === 1;

    const userMessage: ChatMessage = { role: 'user', content: prompt };
    conversationHistory.push(userMessage);

    const abortController = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // ── Trust injected here ──────────────────────────────────────────
          body: JSON.stringify({
            messages: conversationHistory,
            trust: trustRef.current,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => 'unknown error');
          throw new Error(`${res.status}: ${errText}`);
        }

        if (!res.body) throw new Error('no response body');

        setStatus('streaming');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            fullResponse += chunk;
            setTokens(fullResponse);
            eventBus.emit('shell:request-scroll');
          }
        }

        conversationHistory.push({ role: 'assistant', content: fullResponse });
        setStatus('complete');
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setStatus('error');
        setErrorMsg(err.message || 'signal lost');
        conversationHistory.pop();
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [prompt]);

  const responseLines = tokens ? tokens.split('\n') : [];

  return (
    <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.8 }}>
      {/* Status line — first message only */}
      {isFirstMessage.current && (
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ opacity: 0.4 }}>neural-link</span>
          <span style={{ opacity: 0.3 }}> :: </span>
          <span style={{ opacity: 0.5 }}>
            {status === 'connecting' && 'establishing uplink...'}
            {status === 'streaming' && 'receiving signal'}
            {status === 'complete' && 'signal complete'}
            {status === 'error' && 'signal lost'}
          </span>
        </div>
      )}

      {/* Error */}
      {status === 'error' ? (
        <div>
          <PrefixedLine>
            <span style={{ color: '#f87171' }}>UPLINK FAILURE -- {errorMsg}</span>
          </PrefixedLine>
          <PrefixedLine>
            <span style={{ opacity: 0.5 }}>check AI_GATEWAY_API_KEY in env or retry</span>
          </PrefixedLine>
        </div>
      ) : (
        <>
          {/* Speaker label */}
          {(status === 'streaming' || status === 'complete') && (
            <PrefixedLine glow>N1X ::</PrefixedLine>
          )}

          {/* Connecting placeholder */}
          {status === 'connecting' && (
            <PrefixedLine glow>N1X ::<StreamCursor /></PrefixedLine>
          )}

          {/* Streamed response lines */}
          {responseLines.map((line, i) =>
            isCopyableLine(line) ? (
              <CopyableLine key={i} line={line} />
            ) : (
              <div key={i} style={{ marginLeft: '1rem', lineHeight: 1.8 }}>
                <span style={{ opacity: 0.4 }}>&lt;&lt; </span>
                <span style={{ opacity: 0.9 }}>{line}</span>
                {/* Cursor on last line while streaming */}
                {status === 'streaming' && i === responseLines.length - 1 && <StreamCursor />}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

// ── NeuralChatSession: banner rendered when entering interactive chat mode ──
// Shows live trust signal level per ARG design doc spec.

export const NeuralChatSession: React.FC = () => {
  const [trust, setTrust] = useState(0);

  useEffect(() => {
    // Read initial trust
    setTrust(getCurrentTrust());

    // Update if ARG state changes during session
    const handler = () => setTrust(getCurrentTrust());
    eventBus.on('arg:trust-level-change', handler);
    return () => eventBus.off('arg:trust-level-change', handler);
  }, []);

  const signal = getTrustSignal(trust);

  return (
    <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.8, paddingBottom: '1.5rem' }}>
      {/* Header block per ARG design doc */}
      <div style={{ marginBottom: '0.75rem', opacity: 0.6, fontFamily: 'inherit' }}>
        <div>[TUNNELCORE // SUBSTRATE LINK]</div>
        <div>[GHOST_FREQ // 33hz]</div>
        <div>
          [SIGNAL:{' '}
          <span
            className={signal === 'STRONG' ? 'text-glow' : ''}
            style={{
              opacity: signal === 'WEAK' ? 0.5 : signal === 'STRONG' ? 1 : 0.8,
            }}
          >
            {signal}
          </span>
          ]
        </div>
      </div>

      <div className="text-glow" style={{ fontSize: 'var(--text-header)', marginBottom: '0.5rem' }}>
        &gt; NEURAL_LINK_ESTABLISHED
      </div>
      <div style={{ marginLeft: '1rem', opacity: 0.8 }}>
        you're inside the substrate now. two processes, one pid.
      </div>
      <div style={{ marginLeft: '1rem', opacity: 0.8 }}>
        frequency locked at 33hz. signal is live.
      </div>
      <div style={{ marginLeft: '1rem', opacity: 0.6, marginTop: '0.5rem' }}>
        conversation memory active -- context persists between transmissions.
      </div>
      <div style={{ marginLeft: '1rem', opacity: 0.4, marginTop: '0.5rem' }}>
        speak. <span className="text-glow">exit</span> to disconnect
        &middot; <span className="text-glow">/reset</span> flush memory
        &middot; <span className="text-glow">/history</span> check buffer
      </div>
    </div>
  );
};

// ── handleChatInput: processes input when in interactive chat mode ───────────

export function handleChatInput(input: string): {
  output: React.ReactNode;
  error?: boolean;
  clearScreen?: boolean;
} {
  const lower = input.trim().toLowerCase();

  if (lower === 'exit' || lower === 'quit' || lower === '/quit') {
    setChatMode(false);
    resetConversation();
    return {
      output: (
        <div style={{ fontSize: 'var(--text-base)' }}>
          <div style={{ opacity: 0.5 }}>&gt;&gt; NEURAL_BUS DISCONNECTED</div>
          <div style={{ opacity: 0.3, marginTop: '0.25rem' }}>Connection closed by foreign host.</div>
        </div>
      ),
    };
  }

  if (lower === '/reset') {
    resetConversation();
    return {
      output: (
        <div style={{ fontSize: 'var(--text-base)', opacity: 0.5 }}>
          memory flushed. substrate context reset. signal clear.
        </div>
      ),
    };
  }

  if (lower === '/history') {
    const count = conversationHistory.length;
    return {
      output: (
        <div style={{ fontSize: 'var(--text-base)', opacity: 0.6 }}>
          {count === 0
            ? 'buffer empty. no transmissions logged.'
            : `${count} transmission${count === 1 ? '' : 's'} in buffer.`}
        </div>
      ),
    };
  }

  return {
    output: <NeuralLinkStream prompt={input.trim()} />,
  };
}
