'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useNeuralState } from '@/contexts/NeuralContext';
import { useEventBus } from '@/hooks/useEventBus';

// ─── Phosphor tints per mode ──────────────────────────────────────────────────

const PHOSPHOR_TINTS: Record<string, [number, number, number]> = {
  green:  [0.2,  1.0,  0.2 ],
  amber:  [1.0,  0.69, 0.0 ],
  violet: [0.71, 0.31, 1.0 ],
  white:  [0.91, 0.96, 0.97],
  blue:   [0.27, 0.53, 1.0 ],
  pink:   [1.0,  0.18, 0.61],
  cyan:   [0.0,  0.96, 0.83],
  red:    [1.0,  0.2,  0.2 ],
};

// ─── CRT presets ─────────────────────────────────────────────────────────────

interface CRTPreset {
  barrelStrength:   number;
  vignetteStrength: number;
  noiseStrength:    number;
  scanlineHard:     number;
  scanlineSoft:     number;
  phosphorOn:       number;
  glitchTierFloor:  number;
}

const CRT_PRESETS: Record<string, CRTPreset> = {
  default:   { barrelStrength: 0.0,  vignetteStrength: 0.30, noiseStrength: 0.018, scanlineHard: 1, scanlineSoft: 1, phosphorOn: 1, glitchTierFloor: 0 },
  raw:       { barrelStrength: 0.0,  vignetteStrength: 0.0,  noiseStrength: 0.0,   scanlineHard: 0, scanlineSoft: 0, phosphorOn: 0, glitchTierFloor: 0 },
  overdrive: { barrelStrength: 0.0,  vignetteStrength: 0.45, noiseStrength: 0.04,  scanlineHard: 1, scanlineSoft: 1, phosphorOn: 1, glitchTierFloor: 2 },
  ghost:     { barrelStrength: 0.0,  vignetteStrength: 0.55, noiseStrength: 0.06,  scanlineHard: 1, scanlineSoft: 1, phosphorOn: 1, glitchTierFloor: 3 },
};

// ─── Tier decay durations (ms) ────────────────────────────────────────────────

const TIER_DECAY: Record<number, number> = { 1: 500, 2: 1000, 3: 2200 };

// ─── Vertex shader ────────────────────────────────────────────────────────────

const VERT = /* glsl */`
varying vec2 vUv;
void main() {
  vUv        = uv;
  gl_Position = vec4(position, 1.0);
}
`;

// ─── Fragment shader ─────────────────────────────────────────────────────────
// Transparent overlay — everything is additive or subtractive at low alpha.
// At idle: nearly invisible. Glitch tiers escalate noticeably when triggered.

const FRAG = /* glsl */`
precision highp float;

uniform float uTime;
uniform float uGlitchIntensity;
uniform float uGlitchTier;
uniform vec2  uResolution;
uniform float uVignetteStrength;
uniform float uNoiseStrength;
uniform float uScanlineHard;
uniform float uScanlineSoft;
uniform float uPhosphorOn;
uniform float uAmplitude;
uniform vec3  uPhosphorTint;

varying vec2 vUv;

// ── Hash / noise ──────────────────────────────────────────────────────────────
float hash11(float n) { return fract(sin(n) * 43758.5453); }
float hash21(vec2 p)  { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise21(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1,0)), f.x),
    mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x),
    f.y
  );
}

void main() {
  vec2  uv = vUv;
  float px = uv.x * uResolution.x;
  float py = (1.0 - uv.y) * uResolution.y;

  // Accumulate: rgb = additive tint colour, a = darkness (black multiply)
  // Final output: transparent where nothing happens, dark where vignette/scanlines hit.
  vec3  tint  = vec3(0.0);
  float dark  = 0.0;    // how much to darken (black overlay)
  float tintA = 0.0;    // tint alpha

  // ── Hard scanlines ──────────────────────────────────────────────────────────
  // Subtle dark bands every 3px — barely there at idle
  if (uScanlineHard > 0.5) {
    float phase = mod(py, 3.0);
    dark += step(phase, 1.0) * 0.18 * uScanlineHard;
  }

  // ── Soft scanlines (very slow roll) ─────────────────────────────────────────
  // One gentle luminance wave drifting downward
  if (uScanlineSoft > 0.5) {
    float wave = sin(py * 0.5 - uTime * 0.4) * 0.5 + 0.5;
    wave = pow(wave, 8.0) * 0.06;
    dark += wave * uScanlineSoft;
  }

  // ── Vignette ────────────────────────────────────────────────────────────────
  // Soft corner darkening only
  {
    vec2  v   = uv * (1.0 - uv);
    float vig = pow(clamp(v.x * v.y * 16.0, 0.0, 1.0), 0.35);
    dark += (1.0 - vig) * uVignetteStrength;
  }

  // ── Phosphor subpixel shimmer ────────────────────────────────────────────────
  // RGB triad tint — extremely faint, just adds texture to the glow
  if (uPhosphorOn > 0.5) {
    float col  = mod(px, 3.0);
    float r    = col < 1.0 ? 0.06 : 0.0;
    float g    = col < 2.0 && col >= 1.0 ? 0.04 : 0.0;
    float b    = col >= 2.0 ? 0.05 : 0.0;
    tint  += vec3(r, g, b) * uPhosphorTint;
    tintA  = 0.012;
  }

  // ── Film grain ──────────────────────────────────────────────────────────────
  // Very fine, updates at 15fps to feel analog not digital
  {
    float seed = floor(uTime * 15.0);
    float g    = noise21(uv * uResolution * 0.5 + seed * 13.7) * 2.0 - 1.0;
    // Positive grain brightens slightly green-tinted, negative darkens
    if (g > 0.0) {
      tint  += uPhosphorTint * g * uNoiseStrength * 0.6;
      tintA  = max(tintA, g * uNoiseStrength * 0.8);
    } else {
      dark  += abs(g) * uNoiseStrength * 0.4;
    }
  }

  // ── Glitch intensity — brief chromatic edge fringe on trigger ────────────────
  if (uGlitchIntensity > 0.1) {
    float edgeDist   = length(uv - 0.5) * 2.0;
    float fringeZone = pow(max(edgeDist - 0.6, 0.0), 2.0) * uGlitchIntensity;
    tint  += vec3(0.8, 0.0, 0.2) * fringeZone * 0.12;
    tint  += vec3(0.0, 0.6, 1.0) * fringeZone * 0.08;
    tintA  = max(tintA, fringeZone * 0.15);
  }

  // ── Tier 1: occasional single-line flicker ───────────────────────────────────
  // One or two lines per frame flash briefly — reads as CRT noise
  if (uGlitchTier >= 1.0) {
    float lineIdx  = floor(py / uResolution.y * 400.0);
    float lineRand = hash21(vec2(lineIdx, floor(uTime * 10.0)));
    if (lineRand > 0.982) {
      float hue = hash11(lineIdx * 5.1 + floor(uTime * 25.0));
      vec3  col = hue > 0.5 ? vec3(0.9, 0.1, 0.3) : vec3(0.1, 0.7, 1.0);
      tint  += col * 0.35;
      tintA  = max(tintA, 0.10);
    }

    // Micro colour drift on random rows
    float rowIdx  = floor(py / uResolution.y * 60.0);
    float rowRand = hash21(vec2(rowIdx, floor(uTime * 6.0)));
    if (rowRand > 0.96) {
      tint  += uPhosphorTint * 0.12;
      tintA  = max(tintA, 0.04);
    }
  }

  // ── Tier 2: block artifacts + VHS tracking ───────────────────────────────────
  if (uGlitchTier >= 2.0) {
    // Horizontal block noise — sparse, contained
    float blockY  = floor(py / uResolution.y * 20.0);
    float bRand   = hash21(vec2(blockY, floor(uTime * 5.0)));
    if (bRand > 0.75) {
      float bInt  = (bRand - 0.75) / 0.25;
      float bStart= hash11(blockY * 2.3 + floor(uTime * 5.0));
      float bEnd  = bStart + 0.15 + hash11(blockY * 4.1) * 0.2;
      if (uv.x >= bStart && uv.x <= bEnd) {
        dark  += 0.22 * bInt;
        tint  += vec3(0.8, 0.1, 0.1) * bInt * 0.15;
        tintA  = max(tintA, 0.10 * bInt);
      }

      // Interlace inside the block
      if (mod(py, 2.0) < 1.0) dark += 0.18 * bInt;
    }

    // VHS tracking line — thin, fast, white
    float trackPos  = fract(uTime * 0.28);
    float trackDist = abs(uv.y - trackPos);
    if (trackDist < 0.0025) {
      float ta = (1.0 - trackDist / 0.0025) * 0.35;
      tint  += vec3(1.0) * ta;
      tintA  = max(tintA, ta * 0.6);
    }
  }

  // ── Tier 3: sync loss + screen tear ─────────────────────────────────────────
  if (uGlitchTier >= 3.0) {
    // Rolling sync band
    float rollY  = fract(uv.y + uTime * 0.7);
    float rollD  = abs(rollY - 0.5);
    if (rollD < 0.004) {
      float rA = (1.0 - rollD / 0.004) * 0.5;
      tint  += vec3(1.0) * rA;
      tintA  = max(tintA, rA * 0.7);
    }

    // Screen tears — 2 random horizontal seams
    for (int i = 0; i < 2; i++) {
      float tearY = hash11(float(i) * 9.1 + floor(uTime * 12.0));
      float tearD = abs(uv.y - tearY);
      if (tearD < 0.0015) {
        float ta = (1.0 - tearD / 0.0015) * 0.55;
        tint  += vec3(0.9, 0.8, 1.0) * ta;
        tintA  = max(tintA, ta * 0.7);
      }
    }

    // Channel separation — R/B split at edges only
    float sep = sin(uTime * 7.0) * 0.5 + 0.5;
    if (sep > 0.65) {
      float s = (sep - 0.65) / 0.35;
      float e = pow(max(length(uv - 0.5) * 2.0 - 0.4, 0.0), 1.5);
      tint  += vec3(s * e * 0.25, 0.0, s * e * 0.2);
      tintA  = max(tintA, s * e * 0.08);
    }

    // Wide phosphor flicker
    float flick = sin(uTime * 140.0) * 0.5 + 0.5;
    if (flick > 0.90) {
      tint  += uPhosphorTint * 0.08;
      tintA  = max(tintA, 0.06);
    }
  }

  // ── Composite ────────────────────────────────────────────────────────────────
  // dark  → black overlay (darkens underlying DOM)
  // tint  → coloured additive overlay
  // We output a single rgba — the browser blends this over the terminal DOM.
  dark = clamp(dark, 0.0, 0.82);

  // Merge: tinted areas use tint colour; dark areas use black
  float totalA = clamp(dark + tintA, 0.0, 0.88);
  vec3  col    = totalA > 0.001
    ? (vec3(0.0) * dark + tint * tintA) / totalA
    : vec3(0.0);

  gl_FragColor = vec4(col * totalA, totalA); // premultiplied
}
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignalLayerV2() {
  const mountRef     = useRef<HTMLDivElement>(null);
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef  = useRef<THREE.ShaderMaterial | null>(null);
  const rafRef       = useRef<number>(0);
  const clockRef     = useRef(new THREE.Clock());
  const tierFloor    = useRef<number>(0);
  const tierTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { glitchIntensity } = useNeuralState();

  // Uniform refs — mutated directly each frame, no React state
  const uTime            = useRef(0.0);
  const uGlitchIntensity = useRef(0.0);
  const uGlitchTier      = useRef(0.0);
  const uVignetteStrength= useRef(0.30);
  const uNoiseStrength   = useRef(0.018);
  const uScanlineHard    = useRef(1.0);
  const uScanlineSoft    = useRef(1.0);
  const uPhosphorOn      = useRef(1.0);
  const uAmplitude       = useRef(0.0);
  const uPhosphorTint    = useRef<[number,number,number]>([0.2, 1.0, 0.2]);
  const uResolution      = useRef(new THREE.Vector2(1, 1));

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const setGlitchTier = useCallback((tier: number, duration?: number) => {
    const effective = Math.max(tier, tierFloor.current);
    uGlitchTier.current = effective;
    if (materialRef.current) {
      materialRef.current.uniforms.uGlitchTier.value = effective;
    }
    if (tierTimer.current) clearTimeout(tierTimer.current);
    const decay = duration ?? TIER_DECAY[tier] ?? 600;
    if (decay > 0 && effective > tierFloor.current) {
      tierTimer.current = setTimeout(() => {
        uGlitchTier.current = tierFloor.current;
        if (materialRef.current) {
          materialRef.current.uniforms.uGlitchTier.value = tierFloor.current;
        }
      }, decay);
    }
  }, []);

  const applyPreset = useCallback((name: string) => {
    const p = CRT_PRESETS[name];
    if (!p) return;
    uVignetteStrength.current = p.vignetteStrength;
    uNoiseStrength.current    = p.noiseStrength;
    uScanlineHard.current     = p.scanlineHard;
    uScanlineSoft.current     = p.scanlineSoft;
    uPhosphorOn.current       = p.phosphorOn;
    tierFloor.current         = p.glitchTierFloor;
    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      u.uVignetteStrength.value = p.vignetteStrength;
      u.uNoiseStrength.value    = p.noiseStrength;
      u.uScanlineHard.value     = p.scanlineHard;
      u.uScanlineSoft.value     = p.scanlineSoft;
      u.uPhosphorOn.value       = p.phosphorOn;
    }
    setGlitchTier(p.glitchTierFloor, 0);
  }, [setGlitchTier]);

  const setTint = useCallback((tint: [number, number, number]) => {
    uPhosphorTint.current = tint;
    if (materialRef.current) {
      materialRef.current.uniforms.uPhosphorTint.value = tint;
    }
  }, []);

  // ─── Three.js init ─────────────────────────────────────────────────────────

  const initThree = useCallback((container: HTMLDivElement) => {
    const w = container.clientWidth;
    const h = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias:          false,
      alpha:              true,
      premultipliedAlpha: true, // match browser compositor default — fixes Chrome stacking
      powerPreference:    'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    uResolution.current.set(w, h);

    const uniforms = {
      uTime:             { value: 0.0 },
      uGlitchIntensity:  { value: 0.0 },
      uGlitchTier:       { value: 0.0 },
      uResolution:       { value: uResolution.current },
      uVignetteStrength: { value: uVignetteStrength.current },
      uNoiseStrength:    { value: uNoiseStrength.current },
      uScanlineHard:     { value: uScanlineHard.current },
      uScanlineSoft:     { value: uScanlineSoft.current },
      uPhosphorOn:       { value: uPhosphorOn.current },
      uAmplitude:        { value: 0.0 },
      uPhosphorTint:     { value: uPhosphorTint.current },
    };

    const mat = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthTest:   false,
      depthWrite:  false,
      blending:    THREE.NormalBlending,
    });
    materialRef.current = mat;

    const scene = new THREE.Scene();
    const cam   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    // rAF loop
    clockRef.current.start();
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const t = clockRef.current.getElapsedTime();
      mat.uniforms.uTime.value = t;
      renderer.render(scene, cam);
    };
    rafRef.current = requestAnimationFrame(tick);

    // ResizeObserver
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      renderer.setSize(nw, nh);
      uResolution.current.set(nw, nh);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      mat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ─── Mount ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const cleanup = initThree(container);
    applyPreset('default');
    return () => {
      cleanup?.();
      if (tierTimer.current) clearTimeout(tierTimer.current);
    };
  }, [initThree, applyPreset]);

  // ─── Sync glitchIntensity ───────────────────────────────────────────────────

  useEffect(() => {
    uGlitchIntensity.current = glitchIntensity;
    if (materialRef.current) {
      materialRef.current.uniforms.uGlitchIntensity.value = glitchIntensity;
    }
    if (glitchIntensity >= 1.0)      setGlitchTier(3);
    else if (glitchIntensity >= 0.6) setGlitchTier(2);
    else if (glitchIntensity >= 0.2) setGlitchTier(1);
  }, [glitchIntensity, setGlitchTier]);

  // ─── EventBus ──────────────────────────────────────────────────────────────

  useEventBus('neural:frequency-shift', (event) => {
    const mode = (event as any)?.payload?.mode ?? 'green';
    const tint = PHOSPHOR_TINTS[mode] ?? PHOSPHOR_TINTS.green;
    setTint(tint);
  });

  useEventBus('neural:glitch-trigger', (event) => {
    const payload = event as any;
    const tier    = payload?.tier ?? (payload?.intensity > 0.7 ? 2 : 1);
    setGlitchTier(tier, payload?.duration);
  });

  useEventBus('neural:ghost-unlocked', () => {
    applyPreset('ghost');
  });

  useEventBus('neural:konami', () => {
    setGlitchTier(3, 2500);
    setTimeout(() => applyPreset('overdrive'), 2600);
  });

  useEventBus('audio:amplitude', (event) => {
    const level = (event as any)?.payload?.level ?? (event as any)?.level ?? 0;
    if (materialRef.current) materialRef.current.uniforms.uAmplitude.value = level;
  });

  useEventBus('crt:preset', (event) => {
    const name = (event as any)?.payload?.name ?? (event as any)?.name;
    if (name) applyPreset(name);
  });

  useEventBus('crt:param', (event) => {
    const { key, value } = (event as any)?.payload ?? event ?? {};
    if (key && materialRef.current && materialRef.current.uniforms[key] !== undefined) {
      materialRef.current.uniforms[key].value = value;
    }
  });

  useEventBus('crt:glitch-tier', (event) => {
    const { tier, duration } = (event as any)?.payload ?? event ?? {};
    if (typeof tier === 'number') setGlitchTier(tier, duration);
  });

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    />
  );
}
