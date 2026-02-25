'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ── GlitchLine ────────────────────────────────────────────────────────────────
// Renders a single line of text with a random glitch flicker effect.

function GlitchLine({
  text,
  delay = 0,
  dim = false,
}: {
  text: string;
  delay?: number;
  dim?: boolean;
}) {
  const [glitching, setGlitching] = useState(false);
  const [glitchText, setGlitchText] = useState(text);

  const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#$%@~|';

  useEffect(() => {
    const schedule = () => {
      // Fire every 2.5–7s with the given stagger delay
      const timeout = setTimeout(() => {
        setGlitching(true);

        let frame = 0;
        const totalFrames = 8;
        const interval = setInterval(() => {
          if (frame < totalFrames - 2) {
            // Corrupt random chars
            setGlitchText(
              text
                .split('')
                .map((ch) =>
                  ch !== ' ' && Math.random() < 0.35
                    ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
                    : ch
                )
                .join('')
            );
          } else {
            // Restore
            setGlitchText(text);
            setGlitching(false);
            clearInterval(interval);
            schedule(); // reschedule
          }
          frame++;
        }, 50);
      }, delay + Math.random() * 4500 + 2500);

      return timeout;
    };

    const t = schedule();
    return () => clearTimeout(t);
  }, [text, delay]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span
      style={{
        display: 'block',
        fontFamily: 'inherit',
        fontSize: '0.8rem',
        letterSpacing: '0.1em',
        color: 'var(--phosphor-green)',
        opacity: dim ? 0.55 : glitching ? 1 : 0.9,
        textShadow: glitching
          ? '0 0 8px rgba(0,255,65,0.9), 2px 0 rgba(255,0,0,0.4), -2px 0 rgba(0,0,255,0.4)'
          : '0 0 6px rgba(0,255,65,0.4)',
        transition: glitching ? 'none' : 'opacity 0.3s ease, text-shadow 0.3s ease',
        transform: glitching ? `translateX(${(Math.random() - 0.5) * 3}px)` : 'none',
      }}
    >
      {glitchText}
    </span>
  );
}

// ── PlayOverlay ───────────────────────────────────────────────────────────────

export interface PlayOverlayProps {
  onPlay: () => void;
  line1: string;
  line2: string;
  line3: string;
}

export function PlayOverlay({ onPlay, line1, line2, line3 }: PlayOverlayProps) {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const [scanPos, setScanPos] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Animate scan line across banner
  useEffect(() => {
    let start: number | null = null;
    const duration = 2200;

    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) % duration;
      setScanPos(elapsed / duration);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handle = useCallback(() => {
    if (fading || gone) return;
    setFading(true);
    onPlay();
    setTimeout(() => setGone(true), 400);
  }, [fading, gone, onPlay]);

  if (gone) return null;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); handle(); }}
      onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handle(); }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.52)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        cursor: 'pointer',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.4s ease',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* ── Text banner ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          border: '1px solid rgba(0,255,65,0.5)',
          padding: '0.85rem 1.1rem',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          boxShadow: '0 0 18px rgba(0,255,65,0.12), inset 0 0 12px rgba(0,255,65,0.04)',
          overflow: 'hidden',
          maxWidth: '80%',
        }}
      >
        {/* Corner marks */}
        {[
          { top: '-1px', left: '-1px', borderRight: 'none', borderBottom: 'none' },
          { top: '-1px', right: '-1px', borderLeft: 'none', borderBottom: 'none' },
          { bottom: '-1px', left: '-1px', borderRight: 'none', borderTop: 'none' },
          { bottom: '-1px', right: '-1px', borderLeft: 'none', borderTop: 'none' },
        ].map((s, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              border: '1.5px solid var(--phosphor-green)',
              ...s,
            }}
          />
        ))}

        {/* Scan line */}
        <div
          style={{
            position: 'absolute',
            top: `${scanPos * 100}%`,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.6) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <GlitchLine text={line1} delay={0} />
          <GlitchLine text={line2} delay={800} dim />
          <GlitchLine text={line3} delay={1600} dim />
        </div>
      </div>

      {/* ── Play button ──────────────────────────────────────────────────── */}
      <div
        style={{
          width: '5rem',
          height: '5rem',
          borderRadius: '50%',
          border: '2px solid var(--phosphor-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px rgba(0,255,65,0.3)',
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: '1rem solid transparent',
            borderBottom: '1rem solid transparent',
            borderLeft: '1.6rem solid var(--phosphor-green)',
            marginLeft: '0.3rem',
          }}
        />
      </div>
    </div>
  );
}
