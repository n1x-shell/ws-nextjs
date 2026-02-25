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

    case '-w':
    case '--white':
    case '--p4':
      return { mode: 'white' };

    case '-b':
    case '--blue':
    case '--p7':
      return { mode: 'blue' };

    case '--pink':
    case '--magenta':
    case '-m':
      return { mode: 'pink' };

    case '-c':
    case '--cyan':
      return { mode: 'cyan' };

    case '-r':
    case '--red':
      return { mode: 'red' };

    case '':
    case '--status':
      return { status: true };

    default:
      return { error: flag };
  }
}

// ─── Mode display metadata ────────────────────────────────────────────────────

const MODE_META: Record<PhosphorMode, { label: string; hex: string; glyph: string }> = {
  green:  { label: 'GREEN',   hex: '#33FF66', glyph: '█' },
  amber:  { label: 'AMBER',   hex: '#FFB000', glyph: '█' },
  violet: { label: 'VIOLET',  hex: '#B44FFF', glyph: '█' },
  white:  { label: 'WHITE',   hex: '#E8F4F8', glyph: '█' },
  blue:   { label: 'BLUE',    hex: '#4488FF', glyph: '█' },
  pink:   { label: 'PINK',    hex: '#FF2D9B', glyph: '█' },
  cyan:   { label: 'CYAN',    hex: '#00F5D4', glyph: '█' },
  red:    { label: 'RED',     hex: '#FF3333', glyph: '█' },
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
            {'  '}-g  --green                   <span style={{ color: '#33FF66' }}>█ phosphor green (default)</span>
          </div>
          <div style={muted}>
            {'  '}-a  -o  --amber  --orange      <span style={{ color: '#FFB000' }}>█ phosphor amber</span>
          </div>
          <div style={muted}>
            {'  '}-p  -v  --purple --violet      <span style={{ color: '#B44FFF' }}>█ phosphor violet</span>
          </div>
          <div style={muted}>
            {'  '}-w  --white  --p4              <span style={{ color: '#E8F4F8' }}>█ P4 white</span>
          </div>
          <div style={muted}>
            {'  '}-b  --blue   --p7              <span style={{ color: '#4488FF' }}>█ P7 blue</span>
          </div>
          <div style={muted}>
            {'  '}-m  --pink   --magenta         <span style={{ color: '#FF2D9B' }}>█ hot pink</span>
          </div>
          <div style={muted}>
            {'  '}-c  --cyan                     <span style={{ color: '#00F5D4' }}>█ cyan</span>
          </div>
          <div style={muted}>
            {'  '}-r  --red                      <span style={{ color: '#FF3333' }}>█ red</span>
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
