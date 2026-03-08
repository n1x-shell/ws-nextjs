// lib/mud/substrateBackground.tsx
// TUNNELCORE — Fungal Substrate Background
// Self-contained canvas renderer for modal backdrops.
// Same visual as the boot cinematic — tendrils, spores, glyphs, palette morphing.
// No text, no title card, no dismissal. Just the living substrate.

import React, { useRef, useEffect } from 'react';

// ── Perlin Noise ───────────────────────────────────────────────────────────

const _PERM = new Uint8Array(512);
const _GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
(function initNoise() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) _PERM[i] = p[i & 255];
})();
function _fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function _lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function _dot2(g: number[], x: number, y: number) { return g[0] * x + g[1] * y; }
function _noise2D(x: number, y: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = _fade(xf), v = _fade(yf);
  const aa = _PERM[_PERM[X] + Y], ab = _PERM[_PERM[X] + Y + 1];
  const ba = _PERM[_PERM[X + 1] + Y], bb = _PERM[_PERM[X + 1] + Y + 1];
  return _lerp(
    _lerp(_dot2(_GRAD[aa & 7], xf, yf), _dot2(_GRAD[ba & 7], xf - 1, yf), u),
    _lerp(_dot2(_GRAD[ab & 7], xf, yf - 1), _dot2(_GRAD[bb & 7], xf - 1, yf - 1), u), v
  );
}
function _fbm(x: number, y: number, octaves = 4) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) { val += amp * _noise2D(x * freq, y * freq); amp *= 0.5; freq *= 2; }
  return val;
}

// ── Glyphs ─────────────────────────────────────────────────────────────────

const _GLYPHS = '\uff66\uff67\uff68\uff69\uff6a\uff6b\uff6c\uff6d\uff6e\uff6f\uff70\uff71\uff72\uff73\uff74\uff75\uff76\uff77\uff78\uff79\uff7a\uff7b\uff7c\uff7d\uff7e\uff7f\uff80\uff81\uff82\uff83\uff84\uff85\uff86\uff87\uff88\uff89\uff8a\uff8b\uff8c\uff8d\uff8e\uff8f\uff90\uff91\uff92\uff93\uff94\uff95\uff96\uff97\uff98\uff99\uff9a\uff9b\uff9c\uff9d\u232c\u23e3\u23d4\u27c1\u25ec\u27d0\u223f\u224b\u229b\u229c\u22c8\u22c9\u2316\u235f\u2388\u239a\u239b'.split('');
const _SIGILS = '\u25c8\u25c7\u25c6\u2b21\u2b22\u23e3\u23d4\u27c1\u223f\u224b\u229b\u235f\u232c'.split('');
function _randGlyph() { return _GLYPHS[(_GLYPHS.length * Math.random()) | 0]; }
function _randSigil() { return _SIGILS[(_SIGILS.length * Math.random()) | 0]; }

// ── Palette Morphing ───────────────────────────────────────────────────────

type Palette = {
  primary: number[]; secondary: number[]; accent: number[];
  tip: number[]; vein: number[];
};

const PALETTES: Palette[] = [
  { primary: [0, 255, 140], secondary: [0, 180, 220], accent: [100, 50, 220], tip: [200, 255, 220], vein: [0, 200, 140] },
  { primary: [255, 170, 0], secondary: [255, 120, 30], accent: [200, 80, 0], tip: [255, 235, 180], vein: [220, 160, 0] },
  { primary: [180, 60, 255], secondary: [130, 40, 220], accent: [220, 0, 180], tip: [220, 200, 255], vein: [150, 60, 220] },
  { primary: [0, 140, 255], secondary: [0, 100, 220], accent: [40, 20, 200], tip: [180, 220, 255], vein: [0, 130, 220] },
  { primary: [255, 50, 140], secondary: [220, 30, 120], accent: [200, 0, 100], tip: [255, 200, 230], vein: [220, 50, 130] },
  { primary: [0, 255, 220], secondary: [0, 200, 200], accent: [0, 120, 180], tip: [200, 255, 250], vein: [0, 220, 200] },
  { primary: [255, 40, 30], secondary: [220, 20, 60], accent: [180, 0, 40], tip: [255, 200, 170], vein: [220, 40, 30] },
];

const MORPH_FRAMES = 90;
function _lerpColor(a: number[], b: number[], t: number): number[] {
  return [_lerp(a[0], b[0], t), _lerp(a[1], b[1], t), _lerp(a[2], b[2], t)];
}
function _getMorphedPalette(time: number): Palette {
  const cycleTime = time % (MORPH_FRAMES * PALETTES.length);
  const idx = Math.floor(cycleTime / MORPH_FRAMES);
  const nextIdx = (idx + 1) % PALETTES.length;
  const t = (cycleTime % MORPH_FRAMES) / MORPH_FRAMES;
  const smooth = t * t * (3 - 2 * t);
  const cur = PALETTES[idx], next = PALETTES[nextIdx];
  return {
    primary: _lerpColor(cur.primary, next.primary, smooth),
    secondary: _lerpColor(cur.secondary, next.secondary, smooth),
    accent: _lerpColor(cur.accent, next.accent, smooth),
    tip: _lerpColor(cur.tip, next.tip, smooth),
    vein: _lerpColor(cur.vein, next.vein, smooth),
  };
}

// ── Substrate Config ───────────────────────────────────────────────────────

const SC = {
  TENDRIL_COUNT: 28, GROW_SPEED: 1.1, SEGMENT_LEN: 5, MAX_SEGMENTS: 120,
  SIN_FREQ: 0.035, SIN_AMP: 14, BRANCH_CHANCE: 0.022, BRANCH_MAX_DEPTH: 4,
  PHASE_GROW_MIN: 200, PHASE_GROW_MAX: 440, PHASE_HOLD_MIN: 80, PHASE_HOLD_MAX: 220,
  PHASE_SHRINK_MIN: 140, PHASE_SHRINK_MAX: 380,
  SHRINK_RATE: 0.6, UNRAVEL_DRIFT: 1.8,
  BREATH_PERIOD: 200, BREATH_STRENGTH: 1.1, BREATH_VERTICAL: 16, BREATH_HORIZONTAL: 11,
  SPORE_COUNT: 400, SPORE_DRIFT: 0.25, SPORE_SIZE_MIN: 0.4, SPORE_SIZE_MAX: 3.0,
  SPORE_SWIRL_RADIUS: 35, SPORE_SWIRL_SPEED: 0.012,
  VEIN_COUNT: 6, VEIN_THICKNESS: 2, GLYPH_COLUMN_COUNT: 8, GLYPH_MUTATE_RATE: 0.03,
  DRIFT_SPEED: 0.0003, DRIFT_AMP: 12,
  PULSE_SPEED: Math.PI * 2 * (33 / 60),
  NODULE_CHANCE: 0.4, NODULE_SIZE_MIN: 2, NODULE_SIZE_MAX: 5,
  HYPHAE_CHANCE: 0.008, LATERAL_BIAS: 0.35,
};

const LP = { GROW: 0, HOLD: 1, SHRINK: 2, DISSOLVE: 3 } as const;

// ── Types ──────────────────────────────────────────────────────────────────

type SSeg = { x: number; y: number; ox: number; oy: number };
type SNodule = { x: number; y: number; size: number; pulse: number };
type STendril = {
  segments: SSeg[]; phase: number; freqMod: number; ampMod: number; speed: number;
  depth: number; lifecycle: number; lifecycleTimer: number;
  growDuration: number; holdDuration: number; shrinkDuration: number;
  age: number; glyphInterval: number; glyph: string; glyphTimer: number;
  opacity: number; children: STendril[]; sigil: string | null;
  unravelProgress: number; shrinkAccum: number;
  nodules: SNodule[]; lateralDir: number;
};
type SSpore = {
  x: number; y: number; size: number; drift: number; speed: number;
  phase: number; brightness: number; noiseOffX: number; noiseOffY: number;
  swirlAngle: number; swirlRadius: number; swirlSpeed: number;
  _drawX: number; _drawY: number; breathSync: number;
};
type SVein = { y: number; phase: number; amplitude: number; frequency: number; speed: number; thickness: number };
type SGlyphCol = { x: number; chars: { char: string; y: number; opacity: number; mutateTimer: number }[]; drift: number; speed: number };
type SState = { tendrils: STendril[]; spores: SSpore[]; glyphColumns: SGlyphCol[]; veins: SVein[]; time: number; driftX: number; driftY: number; w: number; h: number };
type SBreath = { bx: number; by: number; intensity: number };

// ── Factory Functions ──────────────────────────────────────────────────────

function _createTendril(x: number, y: number, depth = 0, parentPhase = 0): STendril {
  return {
    segments: [{ x, y, ox: 0, oy: 0 }], phase: parentPhase + Math.random() * Math.PI * 2,
    freqMod: 0.7 + Math.random() * 0.6, ampMod: 0.5 + Math.random() * 1.0,
    speed: SC.GROW_SPEED * (1 - depth * 0.15) * (0.6 + Math.random() * 0.8),
    depth, lifecycle: LP.GROW, lifecycleTimer: 0,
    growDuration: SC.PHASE_GROW_MIN + Math.random() * (SC.PHASE_GROW_MAX - SC.PHASE_GROW_MIN),
    holdDuration: SC.PHASE_HOLD_MIN + Math.random() * (SC.PHASE_HOLD_MAX - SC.PHASE_HOLD_MIN),
    shrinkDuration: SC.PHASE_SHRINK_MIN + Math.random() * (SC.PHASE_SHRINK_MAX - SC.PHASE_SHRINK_MIN),
    age: 0, glyphInterval: 8 + (Math.random() * 12) | 0, glyph: _randGlyph(), glyphTimer: 0,
    opacity: 1.0 - depth * 0.15, children: [],
    sigil: depth === 0 && Math.random() < 0.3 ? _randSigil() : null,
    unravelProgress: 0, shrinkAccum: 0,
    nodules: [], lateralDir: Math.random() > 0.5 ? 1 : -1,
  };
}
function _createSpore(w: number, h: number): SSpore {
  return {
    x: Math.random() * w, y: Math.random() * h * 1.2,
    size: SC.SPORE_SIZE_MIN + Math.random() * (SC.SPORE_SIZE_MAX - SC.SPORE_SIZE_MIN),
    drift: (Math.random() - 0.5) * 0.4, speed: SC.SPORE_DRIFT * (0.2 + Math.random() * 0.8),
    phase: Math.random() * Math.PI * 2, brightness: 0.15 + Math.random() * 0.65,
    noiseOffX: Math.random() * 1000, noiseOffY: Math.random() * 1000,
    swirlAngle: Math.random() * Math.PI * 2,
    swirlRadius: SC.SPORE_SWIRL_RADIUS * (0.2 + Math.random()),
    swirlSpeed: SC.SPORE_SWIRL_SPEED * (0.4 + Math.random() * 1.6) * (Math.random() > 0.5 ? 1 : -1),
    _drawX: 0, _drawY: 0, breathSync: Math.random() * Math.PI * 2,
  };
}
function _createGlyphCol(w: number, h: number): SGlyphCol {
  const x = 40 + Math.random() * (w - 80);
  const count = 6 + (Math.random() * 14) | 0;
  const chars = [];
  for (let i = 0; i < count; i++) chars.push({ char: _randGlyph(), y: h - i * 16 - Math.random() * 40, opacity: 0.05 + Math.random() * 0.15, mutateTimer: Math.random() * 100 });
  return { x, chars, drift: (Math.random() - 0.5) * 0.1, speed: 0.15 + Math.random() * 0.25 };
}
function _getBreath(time: number): SBreath {
  const cycle = (time % SC.BREATH_PERIOD) / SC.BREATH_PERIOD;
  const primary = Math.sin(cycle * Math.PI * 2) * SC.BREATH_STRENGTH;
  const secondary = Math.sin(time * 0.005 + 0.7) * 0.35;
  const tertiary = Math.sin(time * 0.013) * 0.15;
  const intensity = primary + secondary + tertiary;
  return {
    bx: Math.sin(time * 0.003 + 1.5) * SC.BREATH_HORIZONTAL * intensity + Math.cos(time * 0.0017) * 3 * secondary,
    by: intensity * SC.BREATH_VERTICAL,
    intensity,
  };
}
function _initSubstrateState(w: number, h: number): SState {
  const tendrils: STendril[] = [];
  for (let i = 0; i < SC.TENDRIL_COUNT; i++) {
    const spawnY = h * (0.82 + Math.random() * 0.22);
    const t = _createTendril(w * 0.05 + Math.random() * w * 0.9, spawnY, 0);
    t.lifecycleTimer = Math.random() * t.growDuration * 0.8;
    tendrils.push(t);
  }
  const spores: SSpore[] = [];
  for (let i = 0; i < SC.SPORE_COUNT; i++) spores.push(_createSpore(w, h));
  const glyphColumns: SGlyphCol[] = [];
  for (let i = 0; i < SC.GLYPH_COLUMN_COUNT; i++) glyphColumns.push(_createGlyphCol(w, h));
  const veins: SVein[] = [];
  for (let i = 0; i < SC.VEIN_COUNT; i++) veins.push({
    y: h * (0.75 + Math.random() * 0.2), phase: Math.random() * Math.PI * 2,
    amplitude: 2 + Math.random() * 5, frequency: 0.004 + Math.random() * 0.01,
    speed: 0.02 + Math.random() * 0.03, thickness: SC.VEIN_THICKNESS + Math.random() * 2,
  });
  return { tendrils, spores, glyphColumns, veins, time: 0, driftX: 0, driftY: 0, w, h };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SubstrateBackground Component ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export default function SubstrateBackground({ opacity = 0.18 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SState | null>(null);
  const animRef = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      stateRef.current = _initSubstrateState(w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Update functions ───────────────────────────────────────

    function updateTendril(t: STendril, state: SState, breath: SBreath) {
      t.age++;
      t.lifecycleTimer++;

      if (t.lifecycle === LP.GROW && t.lifecycleTimer > t.growDuration) {
        t.lifecycle = LP.HOLD; t.lifecycleTimer = 0;
      } else if (t.lifecycle === LP.HOLD && t.lifecycleTimer > t.holdDuration) {
        t.lifecycle = LP.SHRINK; t.lifecycleTimer = 0; t.unravelProgress = 0;
      } else if (t.lifecycle === LP.SHRINK && t.lifecycleTimer > t.shrinkDuration) {
        t.lifecycle = LP.DISSOLVE; t.lifecycleTimer = 0;
      }

      if (t.lifecycle === LP.GROW && t.segments.length < SC.MAX_SEGMENTS) {
        const last = t.segments[t.segments.length - 1];
        const sinD = Math.sin(t.segments.length * SC.SIN_FREQ * t.freqMod + t.phase) * SC.SIN_AMP * t.ampMod;
        const nv = _fbm(last.x * 0.003 + state.time * 0.0005, last.y * 0.003, 3);
        const lateralPush = t.lateralDir * SC.LATERAL_BIAS * (SC.SEGMENT_LEN * t.speed) * (0.5 + Math.abs(nv));
        const nx = last.x + sinD * 0.15 + nv * 6 + breath.bx * 0.1 + lateralPush;
        const ny = last.y - SC.SEGMENT_LEN * t.speed * (1 - SC.LATERAL_BIAS * 0.5) + breath.intensity * 1.5;
        t.segments.push({ x: nx, y: ny, ox: 0, oy: 0 });

        t.glyphTimer++;
        if (t.glyphTimer >= t.glyphInterval) { t.glyph = _randGlyph(); t.glyphTimer = 0; }

        if (t.depth < SC.BRANCH_MAX_DEPTH && t.segments.length > 12 && Math.random() < SC.BRANCH_CHANCE) {
          const bp = t.phase + (Math.random() > 0.5 ? 1 : -1) * (Math.PI * 0.25 + Math.random() * 0.6);
          const child = _createTendril(nx, ny, t.depth + 1, bp);
          child.ampMod = t.ampMod * (0.4 + Math.random() * 0.3);
          child.growDuration = t.growDuration * (0.25 + Math.random() * 0.2);
          child.holdDuration = t.holdDuration * 0.3;
          child.shrinkDuration = t.shrinkDuration * 0.4;
          child.lateralDir = Math.random() > 0.5 ? 1 : -1;
          t.children.push(child);
          state.tendrils.push(child);
          if (Math.random() < SC.NODULE_CHANCE) {
            t.nodules.push({ x: nx, y: ny, size: SC.NODULE_SIZE_MIN + Math.random() * (SC.NODULE_SIZE_MAX - SC.NODULE_SIZE_MIN), pulse: Math.random() * Math.PI * 2 });
          }
        }

        if (t.depth < 2 && t.segments.length > 30 && Math.random() < SC.HYPHAE_CHANCE) {
          const hypha = _createTendril(nx, ny, SC.BRANCH_MAX_DEPTH, t.phase + Math.random() * Math.PI);
          hypha.ampMod = 0.2; hypha.growDuration = 40 + Math.random() * 60;
          hypha.holdDuration = 20; hypha.shrinkDuration = 30; hypha.opacity = 0.3;
          state.tendrils.push(hypha);
        }
      }

      if (t.lifecycle === LP.HOLD) {
        for (let i = 1; i < t.segments.length; i++) {
          const p = i / t.segments.length;
          t.segments[i].ox = breath.bx * p * 0.35;
          t.segments[i].oy = breath.by * p * 0.18;
        }
      }

      if (t.lifecycle === LP.SHRINK) {
        const sp = t.lifecycleTimer / t.shrinkDuration;
        t.unravelProgress = sp;
        t.shrinkAccum += SC.SHRINK_RATE * (0.5 + sp);
        while (t.shrinkAccum >= 1 && t.segments.length > 2) { t.segments.shift(); t.shrinkAccum -= 1; }
        for (let i = 0; i < t.segments.length; i++) {
          const segP = i / t.segments.length;
          const ua = t.phase + i * 0.3 + state.time * 0.02;
          const us = sp * segP;
          t.segments[i].ox = Math.sin(ua) * SC.UNRAVEL_DRIFT * us * 15 + breath.bx * segP * 0.5;
          t.segments[i].oy = Math.cos(ua * 0.7) * SC.UNRAVEL_DRIFT * us * 8 + breath.by * segP * 0.3;
        }
        t.opacity = Math.max(0, (1 - sp * 0.7)) * (1 - t.depth * 0.15);
      }

      if (t.lifecycle === LP.DISSOLVE) {
        t.opacity *= 0.94;
        for (const seg of t.segments) { seg.ox += (Math.random() - 0.5) * 2; seg.oy += (Math.random() - 0.5) * 1.5; }
      }
    }

    // ── Draw functions ─────────────────────────────────────────

    function drawTendril(t: STendril, state: SState, pal: Palette) {
      const segs = t.segments;
      if (segs.length < 2) return;
      const pulse33 = Math.sin(state.time * SC.PULSE_SPEED * 0.02) * 0.5 + 0.5;
      const depthFade = Math.pow(0.85, t.depth);

      for (let i = 1; i < segs.length; i++) {
        const progress = i / segs.length;
        const fadeFromBase = Math.pow(1 - progress, 0.4);

        let r: number, g: number, b: number;
        if (progress < 0.15) {
          const t2 = progress / 0.15;
          r = _lerp(pal.accent[0], pal.secondary[0], t2); g = _lerp(pal.accent[1], pal.secondary[1], t2); b = _lerp(pal.accent[2], pal.secondary[2], t2);
        } else if (progress < 0.85) {
          const t2 = (progress - 0.15) / 0.7;
          r = _lerp(pal.secondary[0], pal.primary[0], t2); g = _lerp(pal.secondary[1], pal.primary[1], t2); b = _lerp(pal.secondary[2], pal.primary[2], t2);
        } else {
          const t2 = (progress - 0.85) / 0.15;
          r = _lerp(pal.primary[0], pal.tip[0], t2); g = _lerp(pal.primary[1], pal.tip[1], t2); b = _lerp(pal.primary[2], pal.tip[2], t2);
        }

        if (t.unravelProgress > 0.3) {
          const dT = (t.unravelProgress - 0.3) / 0.7;
          r = _lerp(r, pal.accent[0], dT * 0.4); g = _lerp(g, pal.accent[1], dT * 0.4); b = _lerp(b, pal.accent[2], dT * 0.4);
        }

        const tipGlow = progress > 0.9 ? Math.pow((progress - 0.9) / 0.1, 0.5) : 0;
        const baseAlpha = (0.15 + fadeFromBase * 0.5 + tipGlow * 0.35) * (0.7 + pulse33 * 0.3) * t.opacity * depthFade;
        if (baseAlpha < 0.01) continue;

        const x1 = (segs[i - 1].x + segs[i - 1].ox + state.driftX) * dpr;
        const y1 = (segs[i - 1].y + segs[i - 1].oy + state.driftY) * dpr;
        const x2 = (segs[i].x + segs[i].ox + state.driftX) * dpr;
        const y2 = (segs[i].y + segs[i].oy + state.driftY) * dpr;
        const unravelThin = 1 - t.unravelProgress * 0.5;
        const lw = (1 + (1 - progress) * 1.5 + tipGlow * 2) * depthFade * dpr * unravelThin;

        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${baseAlpha})`;
        ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();

        if (progress > 0.5) {
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${baseAlpha * 0.2})`;
          ctx.lineWidth = lw * 3; ctx.stroke();
        }

        if (i === segs.length - 1 && t.lifecycle !== LP.DISSOLVE) {
          const bs = 12 * (1 - t.unravelProgress * 0.6);
          const grad = ctx.createRadialGradient(x2, y2, 0, x2, y2, bs * dpr);
          grad.addColorStop(0, `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${0.6 * (0.7 + pulse33 * 0.3) * depthFade * t.opacity})`);
          grad.addColorStop(0.4, `rgba(${pal.primary[0]},${pal.primary[1]},${pal.primary[2]},${0.2 * depthFade * t.opacity})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(x2 - bs * dpr, y2 - bs * dpr, bs * 2 * dpr, bs * 2 * dpr);
        }
      }

      if (t.sigil && t.depth === 0 && segs.length > 5 && t.lifecycle !== LP.DISSOLVE) {
        const base = segs[0];
        ctx.font = `${14 * dpr}px monospace`;
        ctx.fillStyle = `rgba(${pal.accent[0]},${pal.accent[1]},${pal.accent[2]},${0.3 * pulse33 * t.opacity})`;
        ctx.textAlign = 'center';
        ctx.fillText(t.sigil, (base.x + base.ox + state.driftX) * dpr, (base.y + base.oy + state.driftY) * dpr + 16 * dpr);
      }

      if (segs.length > 10 && t.lifecycle !== LP.DISSOLVE) {
        const tip = segs[segs.length - 1];
        ctx.font = `${10 * dpr}px monospace`;
        ctx.fillStyle = `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${0.5 * depthFade * t.opacity})`;
        ctx.textAlign = 'center';
        ctx.fillText(t.glyph, (tip.x + tip.ox + state.driftX) * dpr + 8 * dpr, (tip.y + tip.oy + state.driftY) * dpr);
      }

      for (const nod of t.nodules) {
        const np = Math.sin(nod.pulse + state.time * 0.03) * 0.3 + 0.7;
        const nx = (nod.x + state.driftX) * dpr;
        const ny = (nod.y + state.driftY) * dpr;
        const nr = nod.size * dpr * np;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr * 2.5);
        grad.addColorStop(0, `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${0.5 * t.opacity * np})`);
        grad.addColorStop(0.4, `rgba(${pal.primary[0]},${pal.primary[1]},${pal.primary[2]},${0.25 * t.opacity})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(nx, ny, nr * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(nx, ny, nr * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${0.7 * t.opacity * np})`; ctx.fill();
      }
    }

    function updateSpore(s: SSpore, state: SState, breath: SBreath) {
      const turb = _fbm(s.noiseOffX + state.time * 0.001, s.noiseOffY + state.time * 0.0008, 3);
      const breathPhase = Math.sin(state.time * 0.008 + s.breathSync);
      s.swirlAngle += s.swirlSpeed * (1 + breath.intensity * 0.8 + breathPhase * 0.3);
      const swirlX = Math.cos(s.swirlAngle) * s.swirlRadius * (1 + breath.intensity * 0.5);
      const swirlY = Math.sin(s.swirlAngle) * s.swirlRadius * 0.6;
      const airWave = Math.sin(s.x * 0.005 + state.time * 0.006) * 0.5;
      s.x += s.drift + turb * 1.4 + breath.bx * (0.4 + Math.abs(breath.intensity) * 0.6) + airWave;
      s.y -= s.speed * (1 + breath.intensity * 0.7 + breathPhase * 0.3);
      s.y += breathPhase * 0.8;
      s.phase += 0.02;
      s._drawX = s.x + swirlX;
      s._drawY = s.y + swirlY + breath.by * 0.5;
      if (s.y < -60 || s.x < -80 || s.x > state.w + 80) {
        s.x = Math.random() * state.w; s.y = state.h + Math.random() * 60;
        s.brightness = 0.15 + Math.random() * 0.65; s.swirlAngle = Math.random() * Math.PI * 2;
        s.breathSync = Math.random() * Math.PI * 2;
      }
    }

    function drawSpore(s: SSpore, state: SState, breath: SBreath, pal: Palette) {
      const breathGlow = 0.7 + breath.intensity * 0.5;
      const pulse = Math.sin(s.phase + state.time * 0.03) * 0.3 + breathGlow;
      const heightFade = 1 - Math.max(0, (state.h - s.y) / state.h);
      const alpha = s.brightness * pulse * (0.25 + heightFade * 0.55);
      const x = (s._drawX + state.driftX) * dpr;
      const y = (s._drawY + state.driftY) * dpr;
      const r = s.size * dpr * (1 + breath.intensity * 0.2);

      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      grad.addColorStop(0, `rgba(${pal.primary[0]},${pal.primary[1]},${pal.primary[2]},${alpha})`);
      grad.addColorStop(0.5, `rgba(${pal.secondary[0]},${pal.secondary[1]},${pal.secondary[2]},${alpha * 0.3})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
      ctx.beginPath(); ctx.arc(x, y, r * (0.4 + breath.intensity * 0.15), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${pal.tip[0]},${pal.tip[1]},${pal.tip[2]},${alpha * 0.8})`; ctx.fill();
    }

    function drawVeins(state: SState, breath: SBreath, pal: Palette) {
      const pulse33 = Math.sin(state.time * SC.PULSE_SPEED * 0.02) * 0.5 + 0.5;
      for (const v of state.veins) {
        ctx.beginPath();
        const yBase = (v.y + state.driftY + breath.by * 0.2) * dpr;
        for (let x = 0; x < state.w; x += 2) {
          const sinY = Math.sin((x + state.time * v.speed * 60) * v.frequency + v.phase) * v.amplitude;
          const nY = _fbm(x * 0.005 + state.time * 0.0003, v.y * 0.01, 2) * 4;
          const bw = breath.intensity * Math.sin(x * 0.01 + state.time * 0.005) * 3;
          const px = (x + state.driftX + breath.bx * 0.15) * dpr;
          const py = yBase + (sinY + nY + bw) * dpr;
          if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        const va = (0.15 + pulse33 * 0.25) * (0.7 + breath.intensity * 0.3);
        ctx.strokeStyle = `rgba(${pal.vein[0]},${pal.vein[1]},${pal.vein[2]},${va})`;
        ctx.lineWidth = v.thickness * dpr; ctx.lineCap = 'round'; ctx.stroke();
        ctx.strokeStyle = `rgba(${pal.vein[0]},${pal.vein[1]},${pal.vein[2]},${va * 0.15})`;
        ctx.lineWidth = v.thickness * 6 * dpr; ctx.stroke();
      }
    }

    function drawGlyphCols(state: SState, breath: SBreath, pal: Palette) {
      const pulse33 = Math.sin(state.time * SC.PULSE_SPEED * 0.02) * 0.5 + 0.5;
      for (const col of state.glyphColumns) {
        col.x += col.drift + breath.bx * 0.02;
        for (const ch of col.chars) {
          ch.y -= col.speed + breath.intensity * 0.1;
          ch.mutateTimer++;
          if (ch.mutateTimer > 60 / SC.GLYPH_MUTATE_RATE && Math.random() < SC.GLYPH_MUTATE_RATE) { ch.char = _randGlyph(); ch.mutateTimer = 0; }
          if (ch.y < -20) { ch.y = state.h + 20; ch.char = _randGlyph(); }
          ctx.font = `${11 * dpr}px monospace`;
          ctx.fillStyle = `rgba(${pal.primary[0]},${pal.primary[1]},${pal.primary[2]},${ch.opacity * (0.6 + pulse33 * 0.4)})`;
          ctx.textAlign = 'center';
          ctx.fillText(ch.char, (col.x + state.driftX) * dpr, (ch.y + state.driftY + breath.by * 0.1) * dpr);
        }
      }
    }

    function drawGroundGlow(state: SState, breath: SBreath, pal: Palette) {
      const pulse33 = Math.sin(state.time * SC.PULSE_SPEED * 0.02) * 0.5 + 0.5;
      const bg = 1 + breath.intensity * 0.3;
      const glowH = 100 * dpr;
      const y = (state.h + state.driftY) * dpr;
      const grad = ctx.createLinearGradient(0, y - glowH, 0, y);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, `rgba(${pal.accent[0]},${pal.accent[1]},${pal.accent[2]},${(0.04 + pulse33 * 0.04) * bg})`);
      grad.addColorStop(1, `rgba(${pal.accent[0]},${pal.accent[1]},${pal.accent[2]},${(0.12 + pulse33 * 0.08) * bg})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, y - glowH, state.w * dpr, glowH + 10 * dpr);
    }

    function drawFog(state: SState) {
      const fogH = state.h * 0.28 * dpr;
      const grad = ctx.createLinearGradient(0, 0, 0, fogH);
      grad.addColorStop(0, 'rgba(2,3,8,0.85)');
      grad.addColorStop(0.5, 'rgba(2,3,8,0.35)');
      grad.addColorStop(1, 'rgba(2,3,8,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, state.w * dpr, fogH);
    }

    // ── Render loop ────────────────────────────────────────────

    function renderFrame() {
      const state = stateRef.current;
      if (!state) { animRef.current = requestAnimationFrame(renderFrame); return; }
      state.time++;

      const breath = _getBreath(state.time);
      state.driftX = Math.sin(state.time * SC.DRIFT_SPEED) * SC.DRIFT_AMP + breath.bx * 0.3;
      state.driftY = Math.cos(state.time * SC.DRIFT_SPEED * 0.7) * SC.DRIFT_AMP * 0.5 + breath.by * 0.15;

      const pal = _getMorphedPalette(state.time);

      ctx.fillStyle = 'rgba(2,3,8,1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGroundGlow(state, breath, pal);
      drawVeins(state, breath, pal);
      drawGlyphCols(state, breath, pal);

      for (const s of state.spores) { updateSpore(s, state, breath); drawSpore(s, state, breath, pal); }

      const deadIdx: number[] = [];
      for (let i = 0; i < state.tendrils.length; i++) {
        const t = state.tendrils[i];
        updateTendril(t, state, breath);
        drawTendril(t, state, pal);
        if (t.lifecycle === LP.DISSOLVE && t.opacity < 0.01) deadIdx.push(i);
      }
      for (let i = deadIdx.length - 1; i >= 0; i--) state.tendrils.splice(deadIdx[i], 1);
      if (state.tendrils.filter(t => t.depth === 0).length < SC.TENDRIL_COUNT && Math.random() < 0.018) {
        const spawnY = state.h * (0.82 + Math.random() * 0.22);
        state.tendrils.push(_createTendril(state.w * 0.05 + Math.random() * state.w * 0.9, spawnY, 0));
      }

      drawFog(state);

      const vg = ctx.createRadialGradient(canvas.width / 2, canvas.height * 0.45, canvas.width * 0.25, canvas.width / 2, canvas.height * 0.45, canvas.width * 0.7);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animRef.current = requestAnimationFrame(renderFrame);
    }

    animRef.current = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div ref={wrapRef} style={{
      position: 'absolute', inset: 0, opacity, pointerEvents: 'none', zIndex: 0,
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
