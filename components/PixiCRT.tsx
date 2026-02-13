'use client';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface PixiCRTProps {
  glitchIntensity: number;
}

export default function PixiCRT({ glitchIntensity }: PixiCRTProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const filterRef = useRef<PIXI.Filter | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize PixiJS
    const app = new PIXI.Application();
    appRef.current = app;

    (async () => {
      await app.init({
        canvas: canvasRef.current!,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      // CRT Shader with all effects
      const crtFragmentShader = `
        precision mediump float;
        
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float uTime;
        uniform float uGlitchIntensity;
        uniform vec2 uResolution;
        
        // CRT curvature
        vec2 curveRemapUV(vec2 uv) {
          uv = uv * 2.0 - 1.0;
          vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
          uv = uv + uv * offset * offset;
          uv = uv * 0.5 + 0.5;
          return uv;
        }
        
        // Scanline effect
        float scanline(vec2 uv) {
          return sin(uv.y * uResolution.y * 0.7 - uTime * 10.0) * 0.04 + 0.96;
        }
        
        // Vignette
        float vignette(vec2 uv) {
          uv *= 1.0 - uv.yx;
          float vig = uv.x * uv.y * 15.0;
          return pow(vig, 0.4);
        }
        
        // Chromatic aberration
        vec3 chromaticAberration(vec2 uv, float amount) {
          vec2 direction = uv - 0.5;
          vec3 color;
          color.r = texture2D(uSampler, uv + direction * amount * 0.01).r;
          color.g = texture2D(uSampler, uv).g;
          color.b = texture2D(uSampler, uv - direction * amount * 0.01).b;
          return color;
        }
        
        // Noise
        float noise(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec2 uv = vTextureCoord;
          
          // Apply CRT curvature
          uv = curveRemapUV(uv);
          
          // Bounds check
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }
          
          // Chromatic aberration (intensified by glitch)
          float aberrationAmount = 0.5 + uGlitchIntensity * 2.0;
          vec3 color = chromaticAberration(uv, aberrationAmount);
          
          // Scanlines
          color *= scanline(uv);
          
          // Vignette
          color *= vignette(uv);
          
          // Phosphor glow (green tint)
          color += vec3(0.1, 0.3, 0.1) * 0.05;
          
          // Random noise/static
          float noiseAmount = noise(uv * uTime) * 0.015;
          color += vec3(noiseAmount);
          
          // Flicker effect during glitch
          if (uGlitchIntensity > 0.5) {
            float flicker = sin(uTime * 100.0) * 0.03 * uGlitchIntensity;
            color += vec3(flicker);
          }
          
          // RGB split during intense glitch
          if (uGlitchIntensity > 0.8) {
            float splitOffset = 0.003 * uGlitchIntensity;
            color.r = texture2D(uSampler, uv + vec2(splitOffset, 0.0)).r;
            color.b = texture2D(uSampler, uv - vec2(splitOffset, 0.0)).b;
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `;

      // Create filter
      const filter = new PIXI.Filter({
        glProgram: new PIXI.GlProgram({
          fragment: crtFragmentShader,
          vertex: `
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
          `,
        }),
        resources: {
          crtUniforms: {
            uTime: { value: 0.0, type: 'f32' },
            uGlitchIntensity: { value: 0.0, type: 'f32' },
            uResolution: { value: [window.innerWidth, window.innerHeight], type: 'vec2<f32>' },
          },
        },
      });

      filterRef.current = filter;

      // Apply filter to stage
      app.stage.filters = [filter];

      // Animation loop
      let time = 0;
      app.ticker.add(() => {
        time += 0.016; // ~60fps
        if (filter.resources.crtUniforms) {
          filter.resources.crtUniforms.uniforms.uTime = time;
        }
      });

      // Handle resize
      const handleResize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        if (filter.resources.crtUniforms) {
          filter.resources.crtUniforms.uniforms.uResolution = [window.innerWidth, window.innerHeight];
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        app.destroy(true, { children: true, texture: true });
      };
    })();
  }, []);

  // Update glitch intensity
  useEffect(() => {
    if (filterRef.current?.resources.crtUniforms) {
      filterRef.current.resources.crtUniforms.uniforms.uGlitchIntensity = glitchIntensity;
    }
  }, [glitchIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}
