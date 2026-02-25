'use client';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useNeuralState } from '@/contexts/NeuralContext';
import { useEventBus } from '@/hooks/useEventBus';

// Phosphor tint RGB values per mode (multiplied by 0.05 in shader)
const PHOSPHOR_TINTS: Record<string, [number, number, number]> = {
  green:  [0.1, 0.3, 0.1],
  amber:  [0.3, 0.18, 0.0],
  violet: [0.2, 0.05, 0.4],
};

export default function SignalLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const filterRef = useRef<PIXI.Filter | null>(null);
  const { glitchIntensity } = useNeuralState();

  useEffect(() => {
    if (!canvasRef.current) return;

    let mounted = true;

    const initPixi = async () => {
      if (!canvasRef.current || !mounted) return;

      try {
        const app = new PIXI.Application();
        appRef.current = app;

        await app.init({
          canvas: canvasRef.current,
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x000000,
          backgroundAlpha: 0,
          antialias: false,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
          autoDensity: true,
          preference: 'webgl',
          powerPreference: 'low-power',
        });

        const crtFragmentShader = `
          precision highp float;
          
          varying vec2 vTextureCoord;
          uniform sampler2D uSampler;
          uniform float uTime;
          uniform float uGlitchIntensity;
          uniform vec2 uResolution;
          uniform vec3 uPhosphorTint;
          
          vec2 curveRemapUV(vec2 uv) {
            uv = uv * 2.0 - 1.0;
            vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
            uv = uv + uv * offset * offset;
            uv = uv * 0.5 + 0.5;
            return uv;
          }
          
          float scanline(vec2 uv) {
            return sin(uv.y * uResolution.y * 0.7 - uTime * 10.0) * 0.04 + 0.96;
          }
          
          float vignette(vec2 uv) {
            uv *= 1.0 - uv.yx;
            float vig = uv.x * uv.y * 15.0;
            return pow(vig, 0.4);
          }
          
          vec3 chromaticAberration(vec2 uv, float amount) {
            vec2 direction = uv - 0.5;
            vec3 color;
            color.r = texture2D(uSampler, uv + direction * amount * 0.01).r;
            color.g = texture2D(uSampler, uv).g;
            color.b = texture2D(uSampler, uv - direction * amount * 0.01).b;
            return color;
          }
          
          float noise(vec2 co) {
            return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
          }
          
          void main() {
            vec2 uv = vTextureCoord;
            uv = curveRemapUV(uv);
            
            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
              return;
            }
            
            float aberrationAmount = 0.5 + uGlitchIntensity * 2.0;
            vec3 color = chromaticAberration(uv, aberrationAmount);
            color *= scanline(uv);
            color *= vignette(uv);
            color += uPhosphorTint * 0.05;
            
            float noiseAmount = noise(uv * uTime) * 0.015;
            color += vec3(noiseAmount);
            
            if (uGlitchIntensity > 0.5) {
              float flicker = sin(uTime * 100.0) * 0.03 * uGlitchIntensity;
              color += vec3(flicker);
            }
            
            if (uGlitchIntensity > 0.8) {
              float splitOffset = 0.003 * uGlitchIntensity;
              color.r = texture2D(uSampler, uv + vec2(splitOffset, 0.0)).r;
              color.b = texture2D(uSampler, uv - vec2(splitOffset, 0.0)).b;
            }
            
            gl_FragColor = vec4(color, 1.0);
          }
        `;

        const vertexShader = `
          attribute vec2 aPosition;
          varying vec2 vTextureCoord;
          
          uniform mat3 projectionMatrix;
          uniform vec4 inputSize;
          uniform vec4 outputFrame;
          
          void main() {
            vec2 position = aPosition * max(outputFrame.zw, vec2(0.0)) + outputFrame.xy;
            gl_Position = vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
            vTextureCoord = aPosition;
          }
        `;

        const filter = new PIXI.Filter({
          glProgram: new PIXI.GlProgram({
            fragment: crtFragmentShader,
            vertex: vertexShader,
          }),
          resources: {
            crtUniforms: {
              uTime:           { value: 0.0,                           type: 'f32' },
              uGlitchIntensity:{ value: 0.0,                           type: 'f32' },
              uResolution:     { value: [window.innerWidth, window.innerHeight], type: 'vec2<f32>' },
              uPhosphorTint:   { value: PHOSPHOR_TINTS.green,          type: 'vec3<f32>' },
            },
          },
        });

        filterRef.current = filter;
        app.stage.filters = [filter];

        let time = 0;
        app.ticker.add(() => {
          time += 0.016;
          if (filter.resources.crtUniforms) {
            filter.resources.crtUniforms.uniforms.uTime = time;
          }
        });

        const handleResize = () => {
          if (!app || !mounted) return;
          app.renderer.resize(window.innerWidth, window.innerHeight);
          if (filter.resources.crtUniforms) {
            filter.resources.crtUniforms.uniforms.uResolution = [window.innerWidth, window.innerHeight];
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          if (app) {
            app.destroy(true, { children: true, texture: true });
          }
        };
      } catch (error) {
        console.error('PixiJS initialization failed:', error);
        if (canvasRef.current) {
          canvasRef.current.style.display = 'none';
        }
      }
    };

    initPixi();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
      }
    };
  }, []);

  useEffect(() => {
    if (filterRef.current?.resources.crtUniforms) {
      filterRef.current.resources.crtUniforms.uniforms.uGlitchIntensity = glitchIntensity;
    }
  }, [glitchIntensity]);

  // Update shader tint when phosphor mode changes
  useEventBus('neural:frequency-shift', (event) => {
    if (!filterRef.current?.resources.crtUniforms) return;
    const mode = (event?.payload?.mode ?? 'green') as string;
    const tint = PHOSPHOR_TINTS[mode] ?? PHOSPHOR_TINTS.green;
    filterRef.current.resources.crtUniforms.uniforms.uPhosphorTint = tint;
  });

  // Listen to neural events
  useEventBus('neural:glitch-trigger', () => {
    // Additional shader reactions can go here
  });

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 5,
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    />
  );
}
