'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus } from '@/lib/eventBus';

// ── Conversation memory (persists across ask invocations) ───────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

let conversationHistory: ChatMessage[] = [];
let chatModeActive = false;
let chatAbortController: AbortController | null = null;

export function resetConversation() {
  conversationHistory = [];
}

export function isChatMode() {
  return chatModeActive;
}

export function setChatMode(active: boolean) {
  chatModeActive = active;
  if (!active) {
    if (chatAbortController) {
      chatAbortController.abort();
      chatAbortController = null;
    }
  }
}

// ── Stream parser for Vercel AI SDK data protocol ───────────────────────────

function parseStreamChunk(chunk: string): string {
  let text = '';
  const lines = chunk.split('\n').filter(Boolean);
  for (const line of lines) {
    // Vercel AI SDK data stream format: "0:\"token\"\n"
    if (line.startsWith('0:')) {
      try {
        const jsonStr = line.slice(2);
        const parsed = JSON.parse(jsonStr);
        if (typeof parsed === 'string') {
          text += parsed;
        }
      } catch {
        // skip malformed chunks
      }
    }
    // finish_reason, usage, etc. — ignore
  }
  return text;
}

// ── StreamCursor: blinking cursor during streaming ──────────────────────────

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

// ── NeuralLinkStream: one-shot streaming response ───────────────────────────

interface NeuralLinkStreamProps {
  prompt: string;
  onComplete?: () => void;
}

export const NeuralLinkStream: React.FC<NeuralLinkStreamProps> = ({ prompt, onComplete }) => {
  const [tokens, setTokens] = useState('');
  const [status, setStatus] = useState<'connecting' | 'streaming' | 'complete' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const userMessage: ChatMessage = { role: 'user', content: prompt };
    conversationHistory.push(userMessage);

    const abortController = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: conversationHistory }),
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
          const parsed = parseStreamChunk(chunk);
          if (parsed) {
            fullResponse += parsed;
            setTokens(fullResponse);
          }
        }

        conversationHistory.push({ role: 'assistant', content: fullResponse });
        setStatus('complete');
        onComplete?.();
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setStatus('error');
        setErrorMsg(err.message || 'signal lost');
        // Remove the failed user message
        conversationHistory.pop();
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [prompt, onComplete]);

  return (
    <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.8 }}>
      {/* Header */}
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ opacity: 0.4 }}>neural-link</span>
        <span style={{ opacity: 0.3 }}> :: </span>
        <span style={{ opacity: 0.5 }}>
          {status === 'connecting' && 'establishing uplink...'}
          {status === 'streaming' && 'receiving signal'}
          {status === 'complete' && 'signal complete'}
          {status === 'error' && 'signal lost'}
        </span>
        {status === 'streaming' && <StreamCursor />}
      </div>

      {/* Response body */}
      {status === 'error' ? (
        <div style={{ color: '#f87171' }}>
          [ERROR] uplink failure -- {errorMsg}
          <div style={{ opacity: 0.5, marginTop: '0.25rem' }}>
            check AI_GATEWAY_API_KEY in env or retry
          </div>
        </div>
      ) : (
        <div style={{ whiteSpace: 'pre-wrap', opacity: tokens ? 0.95 : 0.4 }}>
          {tokens || (status === 'connecting' ? 'tuning to 33hz...' : '')}
        </div>
      )}

      {/* Footer */}
      {status === 'complete' && (
        <div style={{ opacity: 0.3, marginTop: '0.5rem', fontSize: 'var(--text-base)' }}>
          -- end transmission --
        </div>
      )}
    </div>
  );
};

// ── NeuralChatSession: interactive chat mode component ──────────────────────

export const NeuralChatSession: React.FC = () => {
  useEffect(() => {
    setChatMode(true);

    // Push the mode-enter message
    eventBus.emit('shell:push-output', {
      id: `chat-init-${Date.now()}`,
      command: '>> NEURAL_LINK_ACTIVE',
      output: (
        <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.8 }}>
          <div style={{ opacity: 0.8 }}>
            direct uplink to N1X neural substrate established.
          </div>
          <div style={{ opacity: 0.8 }}>
            frequency locked at 33hz. signal is live.
          </div>
          <div style={{ opacity: 0.5, marginTop: '0.5rem' }}>
            type your transmission. enter <span className="text-glow">exit</span> to disconnect.
          </div>
        </div>
      ),
      timestamp: Date.now(),
    });

    return () => {
      setChatMode(false);
    };
  }, []);

  return null;
};

// ── Chat mode input handler (called from command registry) ──────────────────

export function handleChatInput(input: string): {
  output: React.ReactNode;
  error?: boolean;
  clearScreen?: boolean;
} {
  const trimmed = input.trim();

  if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === '/quit' || trimmed.toLowerCase() === 'quit') {
    setChatMode(false);
    resetConversation();
    return {
      output: (
        <div style={{ fontSize: 'var(--text-base)' }}>
          <div style={{ opacity: 0.5 }}>neural-link disconnected. conversation memory flushed.</div>
          <div style={{ opacity: 0.3, marginTop: '0.25rem' }}>-- uplink terminated --</div>
        </div>
      ),
    };
  }

  if (trimmed.toLowerCase() === '/reset') {
    resetConversation();
    return {
      output: (
        <div style={{ fontSize: 'var(--text-base)', opacity: 0.5 }}>
          conversation memory flushed. context reset.
        </div>
      ),
    };
  }

  if (trimmed.toLowerCase() === '/history') {
    const count = conversationHistory.length;
    return {
      output: (
        <div style={{ fontSize: 'var(--text-base)', opacity: 0.6 }}>
          {count === 0
            ? 'no transmissions in buffer.'
            : `${count} message${count === 1 ? '' : 's'} in conversation buffer.`}
        </div>
      ),
    };
  }

  return {
    output: <NeuralLinkStream prompt={trimmed} />,
  };
}
