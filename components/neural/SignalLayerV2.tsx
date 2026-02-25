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
  default: { barrelStrength: 0.22, vignetteStrength: 0.55, noiseStrength: 0.035, scanlineHard: 1, scanlineSoft: 1, phosphorOn: 1, glitchTierFloor: 0 },
  raw:     { barrelStrength: 0.0,  vignetteStrength: 0.0,  noiseStrength: 0.0,   scanlineHard: 0, scanlineSoft: 0, phosphorOn: 0, glitchTierFloor: 0 },
  overdrive: { barrelStrength: 0.35, vignetteStrength: 0.7, noiseStrength: 0.07, scanlineHard: 1, scanlineSoft: 1, phosphorOn: 1, glitchTierFloor: 2 },
  ghost:   { barrelStrength: 0.45, vignetteStrength: 0.8,  noiseStrength: 0.1,   scanlineHard: 1, scanlineSoft: 1, phosphorOn: 1, glitchTierFloor: 3 },
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
// Renders as a transparent overlay — alpha 0 = DOM shows through.
// All CRT effects are semi-transparent composites on top of the terminal.

const FRAG = /* glsl */`
precision highp float;

uniform float uTime;
uniform float uGlitchIntensity;
uniform float uGlitchTier;
uniform vec2  uResolution;
uniform float uBarrelStrength;
uniform float uVignetteStrength;
uniform float uNoiseStrength;
uniform float uScanlineHard;
uniform float uScanlineSoft;
uniform float uPhosphorOn;
uniform float uAmplitude;
uniform vec3  uPhosphorTint;

varying vec2 vUv;

// ── Noise / hash ───────────────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────────────────
vec4 blendOver(vec4 dst, vec4 src) {
  float a = src.a + dst.a * (1.0 - src.a);
  if (a < 0.0001) return vec4(0.0);
  return vec4((src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / a, a);
}

void main() {
  vec2 uv  = vUv;
  float px = uv.x * uResolution.x;
  float py = (1.0 - uv.y) * uResolution.y; // flip y for scanlines

  vec4 result = vec4(0.0);

  // ── Hard scanlines ──────────────────────────────────────────────────────────
  // 3-pixel cycle: 1.2px dark, 1.8px light. Dark band alpha varies by position.
  if (uScanlineHard > 0.5) {
    float scanPhase = mod(py, 3.0);
    // dark band: scanPhase in [0, 1.2)
    float hardDark = step(scanPhase, 1.2) * 0.60;
    result = blendOver(result, vec4(0.0, 0.0, 0.0, hardDark * uScanlineHard));
  }

  // ── Soft scanlines (slow-rolling luminance modulation) ──────────────────────
  if (uScanlineSoft > 0.5) {
    float soft = sin(py * 0.9 - uTime * 1.5) * 0.5 + 0.5;
    soft = pow(soft, 6.0) * 0.12;
    result = blendOver(result, vec4(0.0, 0.0, 0.0, soft * uScanlineSoft));
  }

  // ── Vignette ────────────────────────────────────────────────────────────────
  {
    vec2 vigUv = uv * (1.0 - uv);
    float vig  = vigUv.x * vigUv.y * 12.0;
    vig        = pow(clamp(vig, 0.0, 1.0), 0.3);
    float dark = (1.0 - vig) * uVignetteStrength;
    result = blendOver(result, vec4(0.0, 0.0, 0.0, clamp(dark, 0.0, 0.88)));
  }

  // ── Corner bleed (CRT edge glow) ────────────────────────────────────────────
  {
    float ex  = smoothstep(0.0, 0.06, uv.x) * smoothstep(0.0, 0.06, 1.0 - uv.x);
    float ey  = smoothstep(0.0, 0.06, uv.y) * smoothstep(0.0, 0.06, 1.0 - uv.y);
    float edgeMask = 1.0 - (ex * ey);
    edgeMask       = pow(clamp(edgeMask, 0.0, 1.0), 2.0) * 0.18;
    result = blendOver(result, vec4(uPhosphorTint * 0.6, edgeMask));
  }

  // ── Phosphor subpixel mask ───────────────────────────────────────────────────
  if (uPhosphorOn > 0.5) {
    float col = mod(px, 3.0);
    vec3 mask = col < 1.0 ? vec3(0.18, 0.0, 0.0)
              : col < 2.0 ? vec3(0.0, 0.08, 0.0)
              :              vec3(0.0, 0.0,  0.14);
    result = blendOver(result, vec4(mask * uPhosphorTint, 0.018));
  }

  // ── Interference bands (slow rolling) ───────────────────────────────────────
  {
    float bandY = uv.y + uTime * 0.007;
    float band  = sin(bandY * 6.2832 * 4.0) * 0.5 + 0.5;
    band        = pow(band, 10.0) * 0.07;
    result = blendOver(result, vec4(uPhosphorTint, band * 0.5));
  }

  // ── Film grain ──────────────────────────────────────────────────────────────
  {
    vec2  grainUv   = uv * uResolution / 2.0;
    float timeSeed  = floor(uTime * 24.0);  // 24fps grain update
    float g         = noise21(grainUv + timeSeed * 17.0) * 2.0 - 1.0;
    float grainSign = step(0.0, g);
    float grainMag  = abs(g);
    // Bright grain: green tinted. Dark grain: black.
    vec3  grainCol  = mix(vec3(0.0), vec3(uPhosphorTint.r * 0.3, uPhosphorTint.g, uPhosphorTint.b * 0.3), grainSign);
    result = blendOver(result, vec4(grainCol, grainMag * uNoiseStrength));
  }

  // ── Chromatic edge fringe (even without scene texture) ──────────────────────
  // Slight red/cyan fringe toward screen edges — physically accurate CRT lens
  {
    float edgeDist = length(uv - 0.5) * 2.0;
    float fringe   = pow(max(edgeDist - 0.5, 0.0), 2.0) * 0.25;
    result = blendOver(result, vec4(1.0, 0.0, 0.0, fringe * 0.06));  // red outer
    result = blendOver(result, vec4(0.0, 1.0, 1.0, fringe * 0.04));  // cyan inner
  }

  // ── Glitch intensity — ambient aberration boost ──────────────────────────────
  if (uGlitchIntensity > 0.05) {
    float edgeDist = length(uv - 0.5) * 2.0;
    float fringeBoost = pow(max(edgeDist - 0.3, 0.0), 1.5) * uGlitchIntensity;
    result = blendOver(result, vec4(1.0, 0.0, 0.3, fringeBoost * 0.18));
    result = blendOver(result, vec4(0.0, 0.8, 1.0, fringeBoost * 0.12));
  }

  // ── Tier 1: micro corruption ─────────────────────────────────────────────────
  if (uGlitchTier >= 1.0) {
    // Single-line flicker — rare random scan lines flash color
    float lineIdx  = floor(py / uResolution.y * 300.0);
    float lineRand = hash21(vec2(lineIdx, floor(uTime * 12.0)));
    if (lineRand > 0.96) {
      float hue  = hash11(lineIdx * 3.7 + floor(uTime * 30.0));
      vec3  col  = hue > 0.5 ? vec3(1.0, 0.0, 0.3) : vec3(0.0, 0.8, 1.0);
      result = blendOver(result, vec4(col, 0.18 * uGlitchTier));
    }

    // Micro horizontal displacement stripe (color bleed)
    float driftLine = floor(py / uResolution.y * 80.0);
    float drift     = hash21(vec2(driftLine, floor(uTime * 8.0)));
    if (drift > 0.94) {
      float t = fract(uTime * 20.0);
      result = blendOver(result, vec4(uPhosphorTint * 0.8, 0.06 + t * 0.04));
    }
  }

  // ── Tier 2: block displacement + interlace ───────────────────────────────────
  if (uGlitchTier >= 2.0) {
    // Block noise regions
    float blockY    = floor(py / uResolution.y * 16.0);
    float blockRand = hash21(vec2(blockY, floor(uTime * 6.0)));
    if (blockRand > 0.65) {
      float intensity = (blockRand - 0.65) / 0.35;

      // Horizontal stripe — varies by block
      float stripeStart = hash11(blockY * 2.1 + floor(uTime * 6.0));
      float stripeEnd   = stripeStart + 0.2 + hash11(blockY * 3.7) * 0.35;
      if (uv.x >= stripeStart && uv.x <= stripeEnd) {
        result = blendOver(result, vec4(1.0, 0.0, 0.0, 0.10 * intensity));
      }

      // Interlace: every other scan line gets darkened in glitch blocks
      if (mod(py, 2.0) < 1.0) {
        result = blendOver(result, vec4(0.0, 0.0, 0.0, 0.35 * intensity));
      }
    }

    // Cyan ghost bands — slow upward drift
    float ghostBand = sin(uTime * 2.5 + py * 0.04) * 0.5 + 0.5;
    ghostBand = pow(ghostBand, 14.0) * 0.28;
    result = blendOver(result, vec4(0.0, 1.0, 0.95, ghostBand * 0.45));

    // VHS tracking artifact — thin bright horizontal band
    float trackPos  = fract(uTime * 0.35);
    float trackDist = abs(uv.y - trackPos);
    if (trackDist < 0.004) {
      float trackAlpha = (1.0 - trackDist / 0.004) * 0.5;
      result = blendOver(result, vec4(1.0, 1.0, 1.0, trackAlpha));
    }
  }

  // ── Tier 3: full corruption ──────────────────────────────────────────────────
  if (uGlitchTier >= 3.0) {
    // Vertical sync loss — image "rolls"
    float rollSpeed = 0.8;
    float rollY     = fract(uv.y + uTime * rollSpeed);
    float rollBand  = abs(rollY - 0.5);
    if (rollBand < 0.003) {
      result = blendOver(result, vec4(1.0, 1.0, 1.0, (1.0 - rollBand / 0.003) * 0.7));
    }

    // Screen tear — multiple slice boundaries
    for (int i = 0; i < 3; i++) {
      float tearY    = hash11(float(i) * 7.3 + floor(uTime * 15.0));
      float tearDist = abs(uv.y - tearY);
      if (tearDist < 0.002) {
        float ta = (1.0 - tearDist / 0.002) * 0.6;
        result = blendOver(result, vec4(1.0, 0.9, 1.0, ta));
      }
    }

    // Color channel separation — R left, B right
    float sepAmt = sin(uTime * 9.0) * 0.5 + 0.5;
    if (sepAmt > 0.6) {
      float sep = (sepAmt - 0.6) / 0.4;
      if (uv.x < 0.5) {
        result = blendOver(result, vec4(1.0, 0.0, 0.0, sep * 0.07));
      } else {
        result = blendOver(result, vec4(0.0, 0.0, 1.0, sep * 0.07));
      }
    }

    // Phosphor burn afterimage (soft green ghost)
    float burnPhase = fract(uTime * 0.25);
    float burn      = (1.0 - burnPhase) * 0.12;
    result = blendOver(result, vec4(uPhosphorTint, burn * 0.4));

    // Screen-wide flicker on/off
    float flicker = sin(uTime * 180.0) * 0.5 + 0.5;
    if (flicker > 0.88) {
      result = blendOver(result, vec4(uPhosphorTint * 0.2, 0.12));
    }

    // Noise flood
    float flood = noise21(uv * 40.0 + uTime * 3.0);
    result = blendOver(result, vec4(uPhosphorTint, flood * 0.08));
  }

  // ── Final clamp ──────────────────────────────────────────────────────────────
  result.rgb = clamp(result.rgb, 0.0, 1.0);
  result.a   = clamp(result.a,   0.0, 0.94);

  gl_FragColor = result;
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
  const uBarrelStrength  = useRef(0.22);
  const uVignetteStrength= useRef(0.55);
  const uNoiseStrength   = useRef(0.035);
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
    uBarrelStrength.current   = p.barrelStrength;
    uVignetteStrength.current = p.vignetteStrength;
    uNoiseStrength.current    = p.noiseStrength;
    uScanlineHard.current     = p.scanlineHard;
    uScanlineSoft.current     = p.scanlineSoft;
    uPhosphorOn.current       = p.phosphorOn;
    tierFloor.current         = p.glitchTierFloor;
    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      u.uBarrelStrength.value   = p.barrelStrength;
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
      premultipliedAlpha: false,
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
      uBarrelStrength:   { value: uBarrelStrength.current },
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
