import React from 'react';
import { setPhosphorMode, getPhosphorMode, PhosphorMode } from './useFrequencyShift';

// ─── Inline style constants (match your existing S pattern) ──────────────────

const dim    = { color: 'var(--text-dim)' };
const header = { color: 'var(--text-header)' };
const base   = { color: 'var(--text-base)' };
const muted  = { color: 'var(--text-muted)' };

// ─── Flag resolution ─────────────────────────────────────────────────────────

type FlagResult =
  | { mode: PhosphorMode }
  | { error: string }
  | { status: true };

function resolveFlag(flag: string): FlagResult {
  switch (flag.toLowerCase()) {
    case '-g':
    case '--green':
      return { mode: 'green' };

    case '-a':
    case '-o':
    case '--amber':
    case '--orange':
      return { mode: 'amber' };

    case '-p':
    case '-v':
    case '--purple':
    case '--violet':
      return { mode: 'violet' };

    case '':
    case '--status':
      return { status: true };

    default:
      return { error: flag };
  }
}

// ─── Mode display metadata ────────────────────────────────────────────────────

const MODE_META: Record<PhosphorMode, { label: string; hex: string; glyph: string }> = {
  green:  { label: 'GREEN',  hex: '#33FF66', glyph: '█' },
  amber:  { label: 'AMBER',  hex: '#FFB000', glyph: '█' },
  violet: { label: 'VIOLET', hex: '#B44FFF', glyph: '█' },
};

// ─── Command handler ──────────────────────────────────────────────────────────

export function handlePhosphor(args: string[]): { output: React.ReactNode; error?: boolean } {
  const flag = (args[0] ?? '').trim();
  const result = resolveFlag(flag);

  // ── Status / no args ──────────────────────────────────────────────────────
  if ('status' in result) {
    const current = getPhosphorMode();
    const meta    = MODE_META[current];

    return {
      output: (
        <div style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
          <div style={header}>PHOSPHOR SUBSYSTEM</div>
          <div style={dim}>──────────────────────</div>
          <div style={base}>
            current mode{'  '}
            <span style={{ color: meta.hex }}>{meta.glyph} {meta.label}</span>
          </div>
          <div style={dim}>&nbsp;</div>
          <div style={muted}>usage: phosphor [flag]</div>
          <div style={muted}>&nbsp;</div>
          <div style={muted}>
            {'  '}-g  --green          <span style={{ color: '#33FF66' }}>█ phosphor green (default)</span>
          </div>
          <div style={muted}>
            {'  '}-a  -o  --amber  --orange   <span style={{ color: '#FFB000' }}>█ phosphor amber</span>
          </div>
          <div style={muted}>
            {'  '}-p  -v  --purple --violet   <span style={{ color: '#B44FFF' }}>█ phosphor violet</span>
          </div>
        </div>
      ),
    };
  }

  // ── Unknown flag ──────────────────────────────────────────────────────────
  if ('error' in result) {
    return {
      output: (
        <div style={dim}>
          phosphor: unknown flag <span style={{ color: 'var(--text-base)' }}>{result.error}</span>
          {'  '}— run <span style={{ color: 'var(--text-base)' }}>phosphor</span> for usage
        </div>
      ),
      error: true,
    };
  }

  // ── Set mode ──────────────────────────────────────────────────────────────
  const { mode } = result;
  const meta     = MODE_META[mode];
  const prev     = getPhosphorMode();

  if (prev === mode) {
    return {
      output: (
        <div style={dim}>
          phosphor: already in{' '}
          <span style={{ color: meta.hex }}>{meta.label}</span> mode
        </div>
      ),
    };
  }

  setPhosphorMode(mode, { auto: false });

  return {
    output: (
      <div style={{ fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
        <div style={dim}>──────────────────────────────</div>
        <div style={base}>
          phosphor resonance shifting —{' '}
          <span style={{ color: meta.hex }}>{meta.glyph} {meta.label}</span>
        </div>
        <div style={dim}>spectrum locked at {meta.hex.toLowerCase()}</div>
        <div style={dim}>──────────────────────────────</div>
      </div>
    ),
  };
}

// ─── Registry entry (paste into your commandRegistry) ────────────────────────
//
//   {
//     name: 'phosphor',
//     description: 'Adjust phosphor display spectrum',
//     hidden: true,
//     handler: (args) => handlePhosphor(args),
//   },
//
// ─────────────────────────────────────────────────────────────────────────────
